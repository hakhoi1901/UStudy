import { syncBase64 } from './sync-crypto';

export const DEVICE_SYNC_PROTOCOL = 'ustudy-sync-v1';
export const DEVICE_SYNC_CHUNK_BYTES = 32 * 1024;

export interface PairingQrPayload {
  protocol: typeof DEVICE_SYNC_PROTOCOL;
  sessionId: string;
}

export interface SyncPackageV1 {
  protocolVersion: 1;
  cryptoVersion: 2;
  createdAt: number;
  data: Record<string, string>;
}

export type SyncMessage =
  | { type: 'hello'; protocol: typeof DEVICE_SYNC_PROTOCOL; sessionId: string; nonce: string; sas: string }
  | { type: 'transfer-authorized' }
  | { type: 'sync-start'; totalBytes: number; totalChunks: number; hash: string }
  | { type: 'chunk'; index: number; data: string }
  | { type: 'sync-end' }
  | { type: 'ack' }
  | { type: 'error'; code: string };

export function parsePairingQr(value: string): PairingQrPayload {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error('INVALID_PAIRING_QR');
  }
  if (!parsed || typeof parsed !== 'object') throw new Error('INVALID_PAIRING_QR');
  const payload = parsed as Partial<PairingQrPayload>;
  if (
    payload.protocol !== DEVICE_SYNC_PROTOCOL
    || typeof payload.sessionId !== 'string'
    || !/^[A-HJ-NP-Z2-9]{6}$/.test(payload.sessionId)
  ) throw new Error('INVALID_PAIRING_QR');
  return payload as PairingQrPayload;
}

export function formatPairingCode(sessionId: string): string {
  if (!/^[A-HJ-NP-Z2-9]{6}$/.test(sessionId)) throw new Error('INVALID_PAIRING_CODE');
  return sessionId;
}

export function parsePairingInput(value: string): PairingQrPayload {
  const trimmed = value.trim();
  if (trimmed.startsWith('{')) return parsePairingQr(trimmed);
  const sessionId = trimmed.toUpperCase().replace(/[\s-]/g, '');
  if (!/^[A-HJ-NP-Z2-9]{6}$/.test(sessionId)) throw new Error('INVALID_PAIRING_CODE');
  return { protocol: DEVICE_SYNC_PROTOCOL, sessionId };
}

export async function sha256Base64(bytes: Uint8Array): Promise<string> {
  return syncBase64.toBase64(await crypto.subtle.digest('SHA-256', Uint8Array.from(bytes).buffer));
}

export function splitSyncChunks(bytes: Uint8Array, size = DEVICE_SYNC_CHUNK_BYTES): Uint8Array[] {
  if (size < 1024 || size > 48 * 1024) throw new Error('INVALID_SYNC_CHUNK_SIZE');
  const chunks: Uint8Array[] = [];
  for (let start = 0; start < bytes.byteLength; start += size) chunks.push(bytes.slice(start, start + size));
  return chunks;
}

export function reassembleSyncChunks(chunks: Map<number, Uint8Array>, totalChunks: number): Uint8Array {
  if (totalChunks < 0 || chunks.size !== totalChunks) throw new Error('SYNC_CHUNKS_MISSING');
  const sorted = Array.from({ length: totalChunks }, (_, index) => {
    const chunk = chunks.get(index);
    if (!chunk) throw new Error('SYNC_CHUNKS_MISSING');
    return chunk;
  });
  const bytes = new Uint8Array(sorted.reduce((total, chunk) => total + chunk.byteLength, 0));
  let offset = 0;
  sorted.forEach((chunk) => { bytes.set(chunk, offset); offset += chunk.byteLength; });
  return bytes;
}

export function parseSyncPackage(bytes: Uint8Array): SyncPackageV1 {
  let parsed: unknown;
  try {
    parsed = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new Error('INVALID_SYNC_PACKAGE');
  }
  if (!parsed || typeof parsed !== 'object') throw new Error('INVALID_SYNC_PACKAGE');
  const value = parsed as Partial<SyncPackageV1>;
  if (value.protocolVersion !== 1 || value.cryptoVersion !== 2 || !Number.isFinite(value.createdAt) || !value.data || typeof value.data !== 'object' || Array.isArray(value.data)) {
    throw new Error('INVALID_SYNC_PACKAGE');
  }
  if (!Object.values(value.data).every((item) => typeof item === 'string')) throw new Error('INVALID_SYNC_PACKAGE');
  return value as SyncPackageV1;
}
