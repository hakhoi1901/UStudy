const textEncoder = new TextEncoder();

function asArrayBuffer(bytes: Uint8Array): ArrayBuffer {
    return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

export function randomBytes(length: number): Uint8Array {
    const bytes = new Uint8Array(length);
    globalThis.crypto.getRandomValues(bytes);
    return bytes;
}

export async function deriveAesGcmKey(
    inputKeyMaterial: Uint8Array,
    salt: Uint8Array,
    info: string,
): Promise<CryptoKey> {
    const sourceKey = await globalThis.crypto.subtle.importKey(
        'raw',
        asArrayBuffer(inputKeyMaterial),
        'HKDF',
        false,
        ['deriveKey'],
    );

    return globalThis.crypto.subtle.deriveKey(
        {
            name: 'HKDF',
            hash: 'SHA-256',
            salt: asArrayBuffer(salt),
            info: textEncoder.encode(info),
        },
        sourceKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt'],
    );
}

export async function encryptAesGcm(
    key: CryptoKey,
    plaintext: Uint8Array,
    additionalData: string,
): Promise<{ nonce: Uint8Array; ciphertext: Uint8Array }> {
    const nonce = randomBytes(12);
    const ciphertext = await globalThis.crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: asArrayBuffer(nonce),
            additionalData: textEncoder.encode(additionalData),
        },
        key,
        asArrayBuffer(plaintext),
    );

    return { nonce, ciphertext: new Uint8Array(ciphertext) };
}

export async function decryptAesGcm(
    key: CryptoKey,
    nonce: Uint8Array,
    ciphertext: Uint8Array,
    additionalData: string,
): Promise<Uint8Array> {
    const plaintext = await globalThis.crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: asArrayBuffer(nonce),
            additionalData: textEncoder.encode(additionalData),
        },
        key,
        asArrayBuffer(ciphertext),
    );

    return new Uint8Array(plaintext);
}

export function encodeText(value: string): Uint8Array {
    return textEncoder.encode(value);
}

export function decodeText(value: Uint8Array): string {
    return new TextDecoder().decode(value);
}

