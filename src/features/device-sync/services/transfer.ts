import { decryptSyncMessage, encryptSyncMessage, syncBase64, type EncryptedSyncMessage } from './sync-crypto';
import { parseSyncPackage, reassembleSyncChunks, sha256Base64, splitSyncChunks, type SyncMessage, type SyncPackageV1 } from './sync-protocol';

const MAX_SYNC_PACKAGE_BYTES = 16 * 1024 * 1024;

export async function sendEncryptedSyncMessage(
  channel: RTCDataChannel,
  sessionKey: CryptoKey,
  sessionId: string,
  message: SyncMessage,
): Promise<void> {
  if (channel.readyState !== 'open') throw new Error('DATA_CHANNEL_NOT_OPEN');
  channel.send(JSON.stringify(await encryptSyncMessage(message, sessionKey, sessionId)));
}

export async function readEncryptedSyncMessage(
  raw: unknown,
  sessionKey: CryptoKey,
  sessionId: string,
): Promise<SyncMessage> {
  if (typeof raw !== 'string') throw new Error('INVALID_SYNC_MESSAGE');
  let envelope: EncryptedSyncMessage;
  try {
    envelope = JSON.parse(raw) as EncryptedSyncMessage;
  } catch {
    throw new Error('INVALID_SYNC_MESSAGE');
  }
  if (!envelope?.iv || !envelope?.ciphertext) throw new Error('INVALID_SYNC_MESSAGE');
  return await decryptSyncMessage<SyncMessage>(envelope, sessionKey, sessionId);
}

export async function sendSyncPackage(
  channel: RTCDataChannel,
  sessionKey: CryptoKey,
  sessionId: string,
  bytes: Uint8Array,
  onProgress?: (progress: number) => void,
): Promise<void> {
  if (bytes.byteLength > MAX_SYNC_PACKAGE_BYTES) throw new Error('INVALID_SYNC_TRANSFER');
  const chunks = splitSyncChunks(bytes);
  await sendEncryptedSyncMessage(channel, sessionKey, sessionId, {
    type: 'sync-start', totalBytes: bytes.byteLength, totalChunks: chunks.length, hash: await sha256Base64(bytes),
  });
  for (let index = 0; index < chunks.length; index += 1) {
    while (channel.bufferedAmount > 256 * 1024) await new Promise((resolve) => window.setTimeout(resolve, 25));
    await sendEncryptedSyncMessage(channel, sessionKey, sessionId, { type: 'chunk', index, data: syncBase64.toBase64(chunks[index]) });
    onProgress?.((index + 1) / chunks.length);
  }
  await sendEncryptedSyncMessage(channel, sessionKey, sessionId, { type: 'sync-end' });
}

export class SyncPackageReceiver {
  private totalBytes = 0;
  private totalChunks = 0;
  private hash = '';
  private chunks = new Map<number, Uint8Array>();

  get progress(): number {
    return this.totalChunks ? this.chunks.size / this.totalChunks : 0;
  }

  release(): void {
    this.chunks.clear();
  }

  async accept(message: SyncMessage): Promise<SyncPackageV1 | null> {
    if (message.type === 'sync-start') {
      if (this.totalChunks || message.totalBytes < 0 || message.totalBytes > MAX_SYNC_PACKAGE_BYTES || message.totalChunks < 1) throw new Error('INVALID_SYNC_START');
      this.totalBytes = message.totalBytes;
      this.totalChunks = message.totalChunks;
      this.hash = message.hash;
      return null;
    }
    if (message.type === 'chunk') {
      if (!this.totalChunks || message.index < 0 || message.index >= this.totalChunks) throw new Error('INVALID_SYNC_CHUNK');
      const value = syncBase64.fromBase64(message.data);
      const existing = this.chunks.get(message.index);
      if (existing && syncBase64.toBase64(existing) !== message.data) throw new Error('CONFLICTING_DUPLICATE_CHUNK');
      this.chunks.set(message.index, value);
      return null;
    }
    if (message.type !== 'sync-end') return null;
    const bytes = reassembleSyncChunks(this.chunks, this.totalChunks);
    if (bytes.byteLength !== this.totalBytes || await sha256Base64(bytes) !== this.hash) throw new Error('SYNC_PACKAGE_INTEGRITY_FAILED');
    return parseSyncPackage(bytes);
  }
}
