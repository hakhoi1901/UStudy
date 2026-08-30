export type DeviceSyncRole = 'sender' | 'receiver';

export interface SignalMessage {
  type: 'session' | 'peer-joined' | 'public-key' | 'offer' | 'answer' | 'ice' | 'close';
  [key: string]: unknown;
}

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/$/, '');
}

function websocketBaseUrl(value: string): string {
  const url = new URL(normalizeBaseUrl(value));
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return url.toString().replace(/\/$/, '');
}

export function getDeviceSyncSignalingUrl(): string | null {
  const value = import.meta.env.VITE_DEVICE_SYNC_SIGNALING_URL?.trim();
  return value ? normalizeBaseUrl(value) : null;
}

export async function createDeviceSyncSession(baseUrl: string, receiverPublicKey: string, nonce: string): Promise<{ sessionId: string; expiresAt: number }> {
  const response = await fetch(`${normalizeBaseUrl(baseUrl)}/sessions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ receiverPublicKey, nonce }),
  });
  if (!response.ok) throw new Error(`SIGNALING_CREATE_FAILED:${response.status}`);
  const value = await response.json() as { sessionId?: string; expiresAt?: number };
  if (!value.sessionId || !value.expiresAt) throw new Error('SIGNALING_INVALID_RESPONSE');
  return { sessionId: value.sessionId, expiresAt: value.expiresAt };
}

export class DeviceSyncSignalingClient {
  private readonly socket: WebSocket;
  private closed = false;
  private messageHandler: ((message: SignalMessage) => void) | null = null;
  private pendingMessages: SignalMessage[] = [];
  onClose: ((reason: string) => void) | null = null;

  set onMessage(handler: ((message: SignalMessage) => void) | null) {
    this.messageHandler = handler;
    if (handler) {
      const pending = this.pendingMessages;
      this.pendingMessages = [];
      pending.forEach(handler);
    }
  }

  get onMessage(): ((message: SignalMessage) => void) | null {
    return this.messageHandler;
  }

  private constructor(socket: WebSocket) {
    this.socket = socket;
    socket.addEventListener('message', (event) => {
      try {
        const message = JSON.parse(String(event.data)) as SignalMessage;
        if (this.messageHandler) this.messageHandler(message);
        else this.pendingMessages.push(message);
      } catch {
        this.close('invalid_server_message');
      }
    });
    socket.addEventListener('close', (event) => {
      if (!this.closed) this.onClose?.(event.reason || 'signaling_disconnected');
      this.closed = true;
    });
  }

  static async connect(baseUrl: string, sessionId: string, role: DeviceSyncRole): Promise<DeviceSyncSignalingClient> {
    const socket = new WebSocket(`${websocketBaseUrl(baseUrl)}/sessions/${encodeURIComponent(sessionId)}/connect?role=${role}`);
    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error('SIGNALING_CONNECT_TIMEOUT')), 15_000);
      socket.addEventListener('open', () => { window.clearTimeout(timeout); resolve(); }, { once: true });
      socket.addEventListener('error', () => { window.clearTimeout(timeout); reject(new Error('SIGNALING_CONNECT_FAILED')); }, { once: true });
    });
    return new DeviceSyncSignalingClient(socket);
  }

  send(message: SignalMessage): void {
    if (this.closed || this.socket.readyState !== WebSocket.OPEN) throw new Error('SIGNALING_NOT_CONNECTED');
    this.socket.send(JSON.stringify(message));
  }

  close(reason = 'closed'): void {
    if (this.closed) return;
    this.closed = true;
    if (this.socket.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify({ type: 'close', reason }));
    this.socket.close(1000, reason);
  }
}
