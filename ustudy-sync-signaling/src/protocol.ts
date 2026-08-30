export const SYNC_PROTOCOL = 'ustudy-sync-v1';
export const SESSION_ID_PATTERN = /^[A-HJ-NP-Z2-9]{6}$/;
export const MAX_SIGNAL_BYTES = 64 * 1024;
export const WAITING_TIMEOUT_MS = 5 * 60 * 1000;
export const SIGNALING_TIMEOUT_MS = 2 * 60 * 1000;

export type PeerRole = 'sender' | 'receiver';
export type SignalingType = 'hello' | 'public-key' | 'offer' | 'answer' | 'ice' | 'ready' | 'close';

export interface SignalingMessage {
  protocol: typeof SYNC_PROTOCOL;
  type: SignalingType;
  role?: PeerRole;
  payload?: unknown;
}

export function isValidSessionId(value: string | null): value is string {
  return Boolean(value && SESSION_ID_PATTERN.test(value));
}

export function parseAllowedOrigins(value: string | undefined): Set<string> {
  return new Set((value || '').split(',').map((origin) => origin.trim()).filter(Boolean));
}

export function isAllowedOrigin(origin: string | null, allowlist: Set<string>): boolean {
  return Boolean(origin && allowlist.has(origin));
}

export function parseSignalingMessage(value: string | ArrayBuffer): SignalingMessage {
  if (typeof value !== 'string' || value.length > MAX_SIGNAL_BYTES) throw new Error('INVALID_SIGNAL_MESSAGE');
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error('INVALID_SIGNAL_MESSAGE');
  }
  if (!parsed || typeof parsed !== 'object') throw new Error('INVALID_SIGNAL_MESSAGE');
  const message = parsed as Partial<SignalingMessage>;
  const allowedTypes: SignalingType[] = ['hello', 'public-key', 'offer', 'answer', 'ice', 'ready', 'close'];
  if (message.protocol !== SYNC_PROTOCOL || !message.type || !allowedTypes.includes(message.type)) throw new Error('UNSUPPORTED_SIGNAL_PROTOCOL');
  if (message.role !== undefined && message.role !== 'sender' && message.role !== 'receiver') throw new Error('INVALID_SIGNAL_ROLE');
  return message as SignalingMessage;
}
