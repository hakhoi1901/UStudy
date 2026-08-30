const SESSION_CODE = /^[A-Z2-7]{16}$/;
const WAITING_TIMEOUT_MS = 5 * 60 * 1000;
const CONNECTING_TIMEOUT_MS = 2 * 60 * 1000;
const MAX_SIGNAL_BYTES = 64 * 1024;

function json(value, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json' } });
}

function randomSessionId() {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => alphabet[byte & 31]).join('');
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'POST' && url.pathname === '/sessions') {
      const body = await request.json().catch(() => null);
      if (!body || typeof body.receiverPublicKey !== 'string' || typeof body.nonce !== 'string') return json({ error: 'invalid_request' }, 400);
      for (let attempt = 0; attempt < 4; attempt += 1) {
        const sessionId = randomSessionId();
        const id = env.DEVICE_SYNC_SESSION.idFromName(sessionId);
        const response = await env.DEVICE_SYNC_SESSION.get(id).fetch('https://session.internal/create', {
          method: 'POST',
          body: JSON.stringify({ receiverPublicKey: body.receiverPublicKey, nonce: body.nonce }),
        });
        if (response.status === 201) return json({ sessionId, expiresAt: Date.now() + WAITING_TIMEOUT_MS }, 201);
      }
      return json({ error: 'session_unavailable' }, 503);
    }
    const match = url.pathname.match(/^\/sessions\/([A-Z2-7]{16})(\/.*)?$/);
    if (!match) return json({ error: 'not_found' }, 404);
    const id = env.DEVICE_SYNC_SESSION.idFromName(match[1]);
    return env.DEVICE_SYNC_SESSION.get(id).fetch(new Request(`https://session.internal${match[2] || ''}${url.search}`, request));
  },
};

export class DeviceSyncSession {
  constructor() {
    this.receiverPublicKey = null;
    this.nonce = null;
    this.createdAt = 0;
    this.peers = new Map();
    this.used = false;
  }

  isExpired() {
    const limit = this.peers.size === 2 ? CONNECTING_TIMEOUT_MS : WAITING_TIMEOUT_MS;
    return !this.createdAt || Date.now() - this.createdAt > limit;
  }

  close(code, reason) {
    for (const socket of this.peers.values()) socket.close(code, reason);
    this.peers.clear();
    this.used = true;
  }

  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/create' && request.method === 'POST') {
      if (this.createdAt || this.used) return json({ error: 'session_exists' }, 409);
      const body = await request.json().catch(() => null);
      if (!body || typeof body.receiverPublicKey !== 'string' || typeof body.nonce !== 'string') return json({ error: 'invalid_request' }, 400);
      this.receiverPublicKey = body.receiverPublicKey;
      this.nonce = body.nonce;
      this.createdAt = Date.now();
      return json({ ok: true }, 201);
    }
    if (url.pathname === '/connect') return this.connect(request, url);
    if (url.pathname === '/close' && request.method === 'DELETE') {
      this.close(1000, 'closed');
      return json({ ok: true });
    }
    return json({ error: 'not_found' }, 404);
  }

  connect(request, url) {
    const role = url.searchParams.get('role');
    if (request.headers.get('Upgrade') !== 'websocket' || (role !== 'sender' && role !== 'receiver')) return json({ error: 'invalid_connection' }, 400);
    if (this.isExpired()) return json({ error: 'expired' }, 410);
    if (this.used || this.peers.has(role) || this.peers.size >= 2) return json({ error: 'session_locked' }, 409);
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    server.accept();
    this.peers.set(role, server);
    server.send(JSON.stringify({ type: 'session', sessionId: url.pathname, receiverPublicKey: this.receiverPublicKey, nonce: this.nonce }));
    const peerRole = role === 'sender' ? 'receiver' : 'sender';
    const peer = this.peers.get(peerRole);
    if (peer) {
      peer.send(JSON.stringify({ type: 'peer-joined' }));
      server.send(JSON.stringify({ type: 'peer-joined' }));
    }
    server.addEventListener('message', (event) => {
      if (typeof event.data !== 'string' || event.data.length > MAX_SIGNAL_BYTES) return this.close(1008, 'invalid_signal');
      let message;
      try { message = JSON.parse(event.data); } catch { return this.close(1008, 'invalid_signal'); }
      if (!['offer', 'answer', 'ice', 'public-key', 'close'].includes(message.type)) return this.close(1008, 'invalid_signal');
      if (message.type === 'public-key' && role === 'sender' && message.receiverPublicKey !== this.receiverPublicKey) return this.close(1008, 'receiver_key_mismatch');
      if (message.type === 'close') return this.close(1000, 'peer_closed');
      this.peers.get(peerRole)?.send(event.data);
    });
    server.addEventListener('close', () => {
      if (!this.used) this.close(1001, 'peer_disconnected');
    });
    return new Response(null, { status: 101, webSocket: client });
  }
}
