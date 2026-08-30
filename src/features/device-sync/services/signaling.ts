import { DEVICE_SYNC_PROTOCOL } from './sync-protocol';

export type DeviceSyncRole = 'sender' | 'receiver';
export type SignalType = 'hello' | 'public-key' | 'offer' | 'answer' | 'ice' | 'ready' | 'close';

export interface SignalMessage {
  protocol: typeof DEVICE_SYNC_PROTOCOL;
  type: SignalType;
  role?: DeviceSyncRole;
  payload?: unknown;
}

export type OutgoingSignalMessage = Omit<SignalMessage, 'protocol'>;

const SESSION_ID_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const SESSION_ID_LENGTH = 6;

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, '');
}

function websocketBaseUrl(value: string): string {
  const url = new URL(normalizeBaseUrl(value));
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return url.toString().replace(/\/$/, '');
}

function isSignalMessage(value: unknown): value is SignalMessage {
  if (!value || typeof value !== 'object') return false;
  const message = value as Partial<SignalMessage>;
  return message.protocol === DEVICE_SYNC_PROTOCOL
    && typeof message.type === 'string'
    && ['hello', 'public-key', 'offer', 'answer', 'ice', 'ready', 'close'].includes(message.type)
    && (message.role === undefined || message.role === 'sender' || message.role === 'receiver');
}

export function getDeviceSyncSignalingUrl(): string | null {
  const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
  const value = env?.VITE_DEVICE_SYNC_SIGNALING_URL?.trim();
  return value ? normalizeBaseUrl(value) : null;
}

/** Generates the deterministic Durable Object locator locally; it is not a secret. */
export function createDeviceSyncSessionId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(SESSION_ID_LENGTH));
  return Array.from(bytes, (byte) => SESSION_ID_ALPHABET[byte & 31]).join('');
}

export function buildDeviceSyncWebSocketUrl(baseUrl: string, sessionId: string, role: DeviceSyncRole): string {
  if (!/^[A-HJ-NP-Z2-9]{6}$/.test(sessionId)) throw new Error('INVALID_SESSION_ID');
  return `${websocketBaseUrl(baseUrl)}/session/${encodeURIComponent(sessionId)}?role=${role}`;
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
        const message: unknown = JSON.parse(String(event.data));
        if (!isSignalMessage(message)) throw new Error('INVALID_SIGNALING_MESSAGE');
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
    const socket = new WebSocket(buildDeviceSyncWebSocketUrl(baseUrl, sessionId, role));
    // Attach the message listener before `open`: the existing peer can respond
    // immediately when this socket joins, before the open promise resumes.
    const client = new DeviceSyncSignalingClient(socket);
    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        socket.close();
        reject(new Error('SIGNALING_CONNECT_TIMEOUT'));
      }, 15_000);
      socket.addEventListener('open', () => { window.clearTimeout(timeout); resolve(); }, { once: true });
      socket.addEventListener('error', () => { window.clearTimeout(timeout); reject(new Error('SIGNALING_CONNECT_FAILED')); }, { once: true });
    });
    client.send({ type: 'hello', role });
    return client;
  }

  send(message: OutgoingSignalMessage): void {
    if (this.closed || this.socket.readyState !== WebSocket.OPEN) throw new Error('SIGNALING_NOT_CONNECTED');
    this.socket.send(JSON.stringify({ ...message, protocol: DEVICE_SYNC_PROTOCOL } satisfies SignalMessage));
  }

  close(reason = 'closed'): void {
    if (this.closed) return;
    if (this.socket.readyState === WebSocket.OPEN) this.send({ type: 'close', payload: { reason } });
    this.closed = true;
    this.socket.close(1000, reason);
  }
}
