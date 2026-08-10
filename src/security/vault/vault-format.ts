export interface DeviceBoundVaultRecord {
    vaultVersion: 1;
    createdAt: string;
    device: {
        credentialId: string;
        backupEligible: false;
        backupState: boolean;
        prfSalt: string;
        wrapNonce: string;
        wrappedMasterKey: string;
    };
    testData: {
        nonce: string;
        ciphertext: string;
    };
}

export interface SecurityLabTestPayload {
    message: string;
    grade: number;
}

