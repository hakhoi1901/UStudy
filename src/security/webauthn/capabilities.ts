export interface SecurityLabCapabilities {
    secureContext: boolean;
    webAuthn: boolean;
    platformAuthenticator: boolean | null;
    clientPrfCapability: boolean | null;
}

type PublicKeyCredentialWithCapabilities = typeof PublicKeyCredential & {
    getClientCapabilities?: () => Promise<Record<string, boolean>>;
};

export async function checkSecurityLabCapabilities(): Promise<SecurityLabCapabilities> {
    const webAuthn = typeof window !== 'undefined' && 'PublicKeyCredential' in window;
    let platformAuthenticator: boolean | null = null;
    let clientPrfCapability: boolean | null = null;

    if (webAuthn) {
        const credentialApi = window.PublicKeyCredential as PublicKeyCredentialWithCapabilities;
        platformAuthenticator = await credentialApi.isUserVerifyingPlatformAuthenticatorAvailable();

        if (typeof credentialApi.getClientCapabilities === 'function') {
            const capabilities = await credentialApi.getClientCapabilities();
            clientPrfCapability = capabilities.prf ?? null;
        }
    }

    return {
        secureContext: window.isSecureContext,
        webAuthn,
        platformAuthenticator,
        clientPrfCapability,
    };
}
