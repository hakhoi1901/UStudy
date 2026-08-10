export interface AuthenticatorFlags {
    userPresent: boolean;
    userVerified: boolean;
    backupEligible: boolean;
    backupState: boolean;
}

export function parseAuthenticatorFlags(authenticatorData: ArrayBuffer): AuthenticatorFlags {
    const bytes = new Uint8Array(authenticatorData);
    if (bytes.length < 37) {
        throw new Error('Authenticator data is shorter than the WebAuthn minimum length.');
    }

    const flags = bytes[32];
    return {
        userPresent: (flags & 0x01) !== 0,
        userVerified: (flags & 0x04) !== 0,
        backupEligible: (flags & 0x08) !== 0,
        backupState: (flags & 0x10) !== 0,
    };
}

