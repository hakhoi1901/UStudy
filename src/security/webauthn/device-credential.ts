import { base64UrlToBytes, bytesToBase64Url } from '../crypto/encoding';
import { randomBytes } from '../crypto/web-crypto';
import { parseAuthenticatorFlags, type AuthenticatorFlags } from './parse-authenticator-data';

interface PrfExtensionResult {
    enabled?: boolean;
    results?: {
        first?: ArrayBuffer;
    };
}

interface ClientExtensionResults {
    prf?: PrfExtensionResult;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
    return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

export interface DeviceRegistrationResult {
    credentialId: string;
    prfSalt: Uint8Array;
    prfOutput: Uint8Array;
    flags: AuthenticatorFlags;
    diagnostic: DeviceCredentialDiagnostic;
}

export interface DeviceAssertionResult {
    prfOutput: Uint8Array;
    flags: AuthenticatorFlags;
}

export interface DeviceCredentialDiagnostic {
    requestedAttachment: 'platform';
    authenticatorAttachment: string | null;
    transports: string[];
    prfEnabled: boolean;
    prfOutputAvailable: boolean;
    flags: AuthenticatorFlags;
}

export class DeviceBoundCredentialError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DeviceBoundCredentialError';
    }
}

export class DeviceBoundCredentialRejectedError extends DeviceBoundCredentialError {
    diagnostic: DeviceCredentialDiagnostic;

    constructor(message: string, diagnostic: DeviceCredentialDiagnostic) {
        super(message);
        this.name = 'DeviceBoundCredentialRejectedError';
        this.diagnostic = diagnostic;
    }
}

function getExtensionResults(credential: PublicKeyCredential): ClientExtensionResults {
    return credential.getClientExtensionResults() as ClientExtensionResults;
}

function getPrfOutput(results: ClientExtensionResults): Uint8Array | null {
    const output = results.prf?.results?.first;
    return output ? new Uint8Array(output) : null;
}

function getCreationAuthenticatorData(credential: PublicKeyCredential): ArrayBuffer {
    const response = credential.response as AuthenticatorAttestationResponse;
    if (typeof response.getAuthenticatorData !== 'function') {
        throw new DeviceBoundCredentialError('Trình duyệt không cung cấp authenticator data sau khi đăng ký.');
    }
    return response.getAuthenticatorData();
}

function getWebAuthnPrfExtension(prfSalt: Uint8Array): AuthenticationExtensionsClientInputs {
    return {
        prf: {
            eval: {
                first: prfSalt,
            },
        },
    } as unknown as AuthenticationExtensionsClientInputs;
}

function getRegistrationDiagnostic(
    credential: PublicKeyCredential,
    flags: AuthenticatorFlags,
    extensionResults: ClientExtensionResults,
): DeviceCredentialDiagnostic {
    const response = credential.response as AuthenticatorAttestationResponse;
    const attachment = (credential as PublicKeyCredential & { authenticatorAttachment?: string | null }).authenticatorAttachment;

    return {
        requestedAttachment: 'platform',
        authenticatorAttachment: attachment ?? null,
        transports: typeof response.getTransports === 'function' ? response.getTransports() : [],
        prfEnabled: extensionResults.prf?.enabled === true,
        prfOutputAvailable: Boolean(extensionResults.prf?.results?.first),
        flags,
    };
}

export async function registerDeviceBoundCredential(): Promise<DeviceRegistrationResult> {
    if (!window.isSecureContext || !window.PublicKeyCredential) {
        throw new DeviceBoundCredentialError('WebAuthn chỉ khả dụng trong ngữ cảnh HTTPS an toàn.');
    }

    const prfSalt = randomBytes(32);
    const credential = await navigator.credentials.create({
        publicKey: {
            challenge: toArrayBuffer(randomBytes(32)),
            rp: { name: 'UStudy Security Lab' },
            user: {
                id: toArrayBuffer(randomBytes(16)),
                name: 'ustudy-security-lab',
                displayName: 'UStudy Security Lab',
            },
            pubKeyCredParams: [
                { type: 'public-key', alg: -7 },
                { type: 'public-key', alg: -257 },
            ],
            timeout: 60_000,
            attestation: 'none',
            authenticatorSelection: {
                authenticatorAttachment: 'platform',
                residentKey: 'discouraged',
                userVerification: 'required',
            },
            extensions: getWebAuthnPrfExtension(prfSalt),
        },
    });

    if (!(credential instanceof PublicKeyCredential)) {
        throw new DeviceBoundCredentialError('Không tạo được PublicKeyCredential.');
    }

    const flags = parseAuthenticatorFlags(getCreationAuthenticatorData(credential));
    const extensionResults = getExtensionResults(credential);
    const diagnostic = getRegistrationDiagnostic(credential, flags, extensionResults);
    const prfOutput = getPrfOutput(extensionResults);

    if (diagnostic.flags.backupEligible) {
        prfOutput?.fill(0);
        throw new DeviceBoundCredentialRejectedError(
            'Credential này có thể sao lưu hoặc đồng bộ (BE=1), nên không thể dùng cho vault gắn với một thiết bị. Vault chưa được tạo.',
            diagnostic,
        );
    }

    if (!diagnostic.prfEnabled || !prfOutput) {
        throw new DeviceBoundCredentialRejectedError(
            'Credential này không tạo được PRF output cần thiết. Vault chưa được tạo.',
            diagnostic,
        );
    }

    return {
        credentialId: bytesToBase64Url(new Uint8Array(credential.rawId)),
        prfSalt,
        prfOutput,
        flags,
        diagnostic,
    };
}

export async function evaluateDeviceBoundPrf(
    credentialId: string,
    prfSalt: Uint8Array,
): Promise<DeviceAssertionResult> {
    if (!window.isSecureContext || !window.PublicKeyCredential) {
        throw new DeviceBoundCredentialError('WebAuthn chỉ khả dụng trong ngữ cảnh HTTPS an toàn.');
    }

    const credential = await navigator.credentials.get({
        publicKey: {
            challenge: toArrayBuffer(randomBytes(32)),
            allowCredentials: [{
                id: toArrayBuffer(base64UrlToBytes(credentialId)),
                type: 'public-key',
                transports: ['internal'],
            }],
            timeout: 60_000,
            userVerification: 'required',
            extensions: getWebAuthnPrfExtension(prfSalt),
        },
    });

    if (!(credential instanceof PublicKeyCredential)) {
        throw new DeviceBoundCredentialError('Không lấy được PublicKeyCredential để mở vault.');
    }

    const response = credential.response as AuthenticatorAssertionResponse;
    const flags = parseAuthenticatorFlags(response.authenticatorData);
    if (flags.backupEligible) {
        throw new DeviceBoundCredentialError('Credential đã chọn không còn đạt điều kiện single-device (BE=1).');
    }

    const prfOutput = getPrfOutput(getExtensionResults(credential));
    if (!prfOutput) {
        throw new DeviceBoundCredentialError('Không nhận được PRF output từ credential này.');
    }

    return {
        flags,
        prfOutput,
    };
}
