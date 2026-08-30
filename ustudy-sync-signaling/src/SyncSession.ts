import { DurableObject } from 'cloudflare:workers';
import type { Env } from './env';
import {
  parseSignalingMessage,
  SIGNALING_TIMEOUT_MS,
  SYNC_PROTOCOL,
  WAITING_TIMEOUT_MS,
  type PeerRole,
} from './protocol';

interface PeerAttachment {
  role: PeerRole;
  joinedAt: number;
  helloReceived: boolean;
}

function responseJson(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json' } });
}

export class SyncSession extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }

  private peers(): WebSocket[] {
    return this.ctx.getWebSockets().filter((socket) => socket.readyState === WebSocket.OPEN);
  }

  private attachment(socket: WebSocket): PeerAttachment | null {
    return socket.deserializeAttachment() as PeerAttachment | null;
  }

  private isExpired(peers = this.peers()): boolean {
    const firstJoinedAt = Math.min(...peers.map((socket) => this.attachment(socket)?.joinedAt ?? Date.now()));
    const timeout = peers.length > 1 ? SIGNALING_TIMEOUT_MS : WAITING_TIMEOUT_MS;
    return Number.isFinite(firstJoinedAt) && Date.now() - firstJoinedAt > timeout;
  }

  private closeSession(code: number, reason: string): void {
    this.peers().forEach((socket) => socket.close(code, reason));
    console.log(JSON.stringify({ event: 'session_closed', code, reason }));
  }

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get('Upgrade')?.toLowerCase() !== 'websocket') {
      return responseJson({ error: 'websocket_required' }, 426);
    }
    const role = new URL(request.url).searchParams.get('role');
    if (role !== 'sender' && role !== 'receiver') return responseJson({ error: 'invalid_role' }, 400);

    const peers = this.peers();
    if (this.isExpired(peers)) {
      this.closeSession(1008, 'session_expired');
      return responseJson({ error: 'session_expired' }, 410);
    }
    if (peers.length >= 2 || peers.some((socket) => this.attachment(socket)?.role === role)) {
      return responseJson({ error: 'session_full' }, 409);
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server, [role]);
    server.serializeAttachment({ role, joinedAt: Date.now(), helloReceived: false } satisfies PeerAttachment);

    const peerCount = this.peers().length;
    console.log(JSON.stringify({ event: 'peer_joined', role, peerCount }));
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(sender: WebSocket, message: string | ArrayBuffer): Promise<void> {
    let parsed;
    try {
      parsed = parseSignalingMessage(message);
    } catch (error) {
      const code = error instanceof Error ? error.message : 'invalid_signal';
      console.warn(JSON.stringify({ event: 'signal_rejected', code }));
      sender.close(1008, code);
      return;
    }
    const senderRole = this.attachment(sender)?.role;
    if (parsed.type === 'hello' && parsed.role && parsed.role !== senderRole) {
      sender.close(1008, 'role_mismatch');
      return;
    }
    if (parsed.type === 'hello') {
      if (!senderRole || parsed.role !== senderRole) {
        sender.close(1008, 'role_mismatch');
        return;
      }
      const attachment = this.attachment(sender);
      if (!attachment) {
        sender.close(1011, 'missing_peer_attachment');
        return;
      }
      sender.serializeAttachment({ ...attachment, helloReceived: true } satisfies PeerAttachment);
      const readyPeers = this.peers().filter((peer) => this.attachment(peer)?.helloReceived);
      const readyMessage = JSON.stringify({ protocol: SYNC_PROTOCOL, type: 'ready', payload: { peerCount: readyPeers.length } });
      readyPeers.forEach((peer) => peer.send(readyMessage));
      console.log(JSON.stringify({ event: 'peer_ready', role: senderRole, peerCount: readyPeers.length }));
      return;
    }
    if (parsed.type === 'close') {
      this.closeSession(1000, 'peer_closed');
      return;
    }
    for (const peer of this.peers()) {
      if (peer !== sender) peer.send(message);
    }
    console.log(JSON.stringify({ event: 'signal_relayed', type: parsed.type, peerCount: this.peers().length }));
  }

  async webSocketClose(socket: WebSocket, code: number, _reason: string): Promise<void> {
    const role = this.attachment(socket)?.role ?? 'unknown';
    for (const peer of this.peers()) {
      if (peer !== socket) peer.send(JSON.stringify({ protocol: SYNC_PROTOCOL, type: 'close', payload: { reason: 'peer_disconnected' } }));
    }
    this.closeSession(1001, 'peer_disconnected');
    console.log(JSON.stringify({ event: 'peer_disconnected', role, code }));
  }

  async webSocketError(socket: WebSocket): Promise<void> {
    socket.close(1011, 'websocket_error');
    this.closeSession(1011, 'websocket_error');
    console.warn(JSON.stringify({ event: 'websocket_error' }));
  }
}
