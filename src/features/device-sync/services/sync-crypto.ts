const textEncoder = new TextEncoder();

function asArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return Uint8Array.from(bytes).buffer;
}

export interface EphemeralKeyPair {
  privateKey: CryptoKey;
  publicKey: string;
}

export interface EncryptedSyncMessage {
  iv: string;
  ciphertext: string;
}

function toBase64(bytes: Uint8Array | ArrayBuffer): string {
  const value = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = '';
  value.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function hashText(value: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', asArrayBuffer(textEncoder.encode(value))));
}

async function deriveHkdfBits(
  privateKey: CryptoKey,
  peerPublicKey: string,
  sessionId: string,
  nonce: string,
  info: string,
  length: number,
): Promise<Uint8Array> {
  const peer = await crypto.subtle.importKey(
    'raw',
    asArrayBuffer(fromBase64(peerPublicKey)),
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    [],
  );
  const sharedSecret = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: peer }, privateKey, 256));
  try {
    const material = await crypto.subtle.importKey('raw', asArrayBuffer(sharedSecret), 'HKDF', false, ['deriveBits']);
    return new Uint8Array(await crypto.subtle.deriveBits({
      name: 'HKDF',
      hash: 'SHA-256',
      salt: asArrayBuffer(await hashText(`ustudy:sync:v1:${sessionId}:${nonce}`)),
      info: asArrayBuffer(textEncoder.encode(info)),
    }, material, length));
  } finally {
    sharedSecret.fill(0);
  }
}

export async function createEphemeralKeyPair(): Promise<EphemeralKeyPair> {
  const pair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits'],
  ) as CryptoKeyPair;
  return {
    privateKey: pair.privateKey,
    publicKey: toBase64(await crypto.subtle.exportKey('raw', pair.publicKey)),
  };
}

export async function deriveSessionKey(
  privateKey: CryptoKey,
  peerPublicKey: string,
  sessionId: string,
  nonce: string,
): Promise<CryptoKey> {
  const bits = await deriveHkdfBits(
    privateKey,
    peerPublicKey,
    sessionId,
    nonce,
    'ustudy:sync:v1:session-key',
    256,
  );
  try {
    return await crypto.subtle.importKey('raw', asArrayBuffer(bits), { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
  } finally {
    bits.fill(0);
  }
}

export async function deriveShortAuthenticationString(
  privateKey: CryptoKey,
  peerPublicKey: string,
  sessionId: string,
  nonce: string,
): Promise<string> {
  const bits = await deriveHkdfBits(
    privateKey,
    peerPublicKey,
    sessionId,
    nonce,
    'ustudy:sync:v1:sas',
    32,
  );
  try {
    const number = ((bits[0] << 16) | (bits[1] << 8) | bits[2]) % 1_000_000;
    return number.toString().padStart(6, '0').replace(/(\d{3})(\d{3})/, '$1 $2');
  } finally {
    bits.fill(0);
  }
}

export async function encryptSyncMessage(
  value: unknown,
  sessionKey: CryptoKey,
  sessionId: string,
): Promise<EncryptedSyncMessage> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = textEncoder.encode(JSON.stringify(value));
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: asArrayBuffer(iv), additionalData: asArrayBuffer(textEncoder.encode(`ustudy:sync:v1:${sessionId}`)) },
    sessionKey,
    asArrayBuffer(plaintext),
  );
  return { iv: toBase64(iv), ciphertext: toBase64(ciphertext) };
}

export async function decryptSyncMessage<T>(
  message: EncryptedSyncMessage,
  sessionKey: CryptoKey,
  sessionId: string,
): Promise<T> {
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: asArrayBuffer(fromBase64(message.iv)), additionalData: asArrayBuffer(textEncoder.encode(`ustudy:sync:v1:${sessionId}`)) },
    sessionKey,
    asArrayBuffer(fromBase64(message.ciphertext)),
  );
  return JSON.parse(new TextDecoder().decode(plaintext)) as T;
}

export const syncBase64 = { toBase64, fromBase64 };
