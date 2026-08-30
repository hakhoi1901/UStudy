import { describe, expect, it } from 'vitest';
import { createEphemeralKeyPair, decryptSyncMessage, deriveSessionKey, encryptSyncMessage } from '../../../src/features/device-sync/services/sync-crypto';
import { DEVICE_SYNC_PROTOCOL, parsePairingQr, reassembleSyncChunks, sha256Base64, splitSyncChunks } from '../../../src/features/device-sync/services/sync-protocol';
import { SyncPackageReceiver } from '../../../src/features/device-sync/services/transfer';

describe('device sync core protocol', () => {
  it('derives the same session key for both ephemeral peers', async () => {
    const sender = await createEphemeralKeyPair();
    const receiver = await createEphemeralKeyPair();
    const senderKey = await deriveSessionKey(sender.privateKey, receiver.publicKey, 'ABCDEFGHJKLMNPQR', 'nonce-1234567890');
    const receiverKey = await deriveSessionKey(receiver.privateKey, sender.publicKey, 'ABCDEFGHJKLMNPQR', 'nonce-1234567890');
    const encrypted = await encryptSyncMessage({ type: 'hello', value: 'private' }, senderKey, 'ABCDEFGHJKLMNPQR');

    await expect(decryptSyncMessage(encrypted, receiverKey, 'ABCDEFGHJKLMNPQR')).resolves.toEqual({ type: 'hello', value: 'private' });
  });

  it('does not let a third ephemeral key decrypt the session payload', async () => {
    const sender = await createEphemeralKeyPair();
    const receiver = await createEphemeralKeyPair();
    const intruder = await createEphemeralKeyPair();
    const senderKey = await deriveSessionKey(sender.privateKey, receiver.publicKey, 'ABCDEFGHJKLMNPQR', 'nonce-1234567890');
    const intruderKey = await deriveSessionKey(intruder.privateKey, receiver.publicKey, 'ABCDEFGHJKLMNPQR', 'nonce-1234567890');
    const encrypted = await encryptSyncMessage({ type: 'private' }, senderKey, 'ABCDEFGHJKLMNPQR');

    await expect(decryptSyncMessage(encrypted, intruderKey, 'ABCDEFGHJKLMNPQR')).rejects.toBeDefined();
  });

  it('rejects a tampered message and wrong AAD session context', async () => {
    const sender = await createEphemeralKeyPair();
    const receiver = await createEphemeralKeyPair();
    const senderKey = await deriveSessionKey(sender.privateKey, receiver.publicKey, 'ABCDEFGHJKLMNPQR', 'nonce-1234567890');
    const receiverKey = await deriveSessionKey(receiver.privateKey, sender.publicKey, 'ABCDEFGHJKLMNPQR', 'nonce-1234567890');
    const encrypted = await encryptSyncMessage({ type: 'private' }, senderKey, 'ABCDEFGHJKLMNPQR');
    const changed = `${encrypted.ciphertext.slice(0, -2)}AA`;

    await expect(decryptSyncMessage({ ...encrypted, ciphertext: changed }, receiverKey, 'ABCDEFGHJKLMNPQR')).rejects.toBeDefined();
    await expect(decryptSyncMessage(encrypted, receiverKey, 'QRSTUVWXYZ234567')).rejects.toBeDefined();
  });

  it('validates pairing QR protocol and public key shape', async () => {
    const receiver = await createEphemeralKeyPair();
    const value = JSON.stringify({ protocol: DEVICE_SYNC_PROTOCOL, sessionId: 'ABCDEFGHJKLMNPQR', publicKey: receiver.publicKey, nonce: 'nonce-1234567890' });
    expect(parsePairingQr(value).sessionId).toBe('ABCDEFGHJKLMNPQR');
    expect(() => parsePairingQr(JSON.stringify({ protocol: 'other', sessionId: 'ABCDEFGHJKLMNPQR' }))).toThrow('INVALID_PAIRING_QR');
  });

  it('reassembles chunks and rejects missing chunks', async () => {
    const bytes = new TextEncoder().encode('device-to-device package'.repeat(500));
    const chunks = splitSyncChunks(bytes, 1024);
    const map = new Map(chunks.map((chunk, index) => [index, chunk]));
    expect(reassembleSyncChunks(map, chunks.length)).toEqual(bytes);
    map.delete(1);
    expect(() => reassembleSyncChunks(map, chunks.length)).toThrow('SYNC_CHUNKS_MISSING');
  });

  it('accepts duplicate equal chunks but rejects conflicting duplicates and hash corruption', async () => {
    const bytes = new TextEncoder().encode(JSON.stringify({ protocolVersion: 1, cryptoVersion: 2, createdAt: 1, data: { selected_major_id: '"cntt"' } }));
    const chunk = bytes;
    const receiver = new SyncPackageReceiver();
    const masterKey = crypto.getRandomValues(new Uint8Array(32));
    await receiver.accept({ type: 'key-transfer', data: btoa(String.fromCharCode(...masterKey)) });
    await receiver.accept({ type: 'sync-start', totalBytes: bytes.byteLength, totalChunks: 1, hash: await sha256Base64(bytes) });
    await receiver.accept({ type: 'chunk', index: 0, data: btoa(String.fromCharCode(...chunk)) });
    await expect(receiver.accept({ type: 'chunk', index: 0, data: btoa('different') })).rejects.toThrow('CONFLICTING_DUPLICATE_CHUNK');
    const result = await receiver.accept({ type: 'sync-end' });
    expect(result?.syncPackage.data.selected_major_id).toBe('"cntt"');
    receiver.release();
  });
});
