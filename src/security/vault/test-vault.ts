import { base64UrlToBytes, bytesToBase64Url } from '../crypto/encoding';
import {
    decodeText,
    decryptAesGcm,
    deriveAesGcmKey,
    encodeText,
    encryptAesGcm,
    randomBytes,
} from '../crypto/web-crypto';
import type { AuthenticatorFlags } from '../webauthn/parse-authenticator-data';
import type { DeviceBoundVaultRecord, SecurityLabTestPayload } from './vault-format';

const DEVICE_KEK_INFO = 'ustudy/security-lab/device-kek/v1';
const TEST_DATA_KEY_INFO = 'ustudy/security-lab/test-data/v1';
const MASTER_KEY_WRAP_AAD = 'ustudy/security-lab/master-key-wrap/v1';
const TEST_DATA_AAD = 'ustudy/security-lab/test-data/v1';
const TEST_DATA_SALT = encodeText('ustudy/security-lab/test-data-salt/v1');

export async function createSecurityLabVault(input: {
    credentialId: string;
    prfSalt: Uint8Array;
    prfOutput: Uint8Array;
    flags: AuthenticatorFlags;
}): Promise<DeviceBoundVaultRecord> {
    if (input.flags.backupEligible) {
        throw new Error('Không thể tạo vault với credential backup-eligible.');
    }

    const deviceKek = await deriveAesGcmKey(input.prfOutput, input.prfSalt, DEVICE_KEK_INFO);
    const masterKey = randomBytes(32);

    try {
        const wrappedMasterKey = await encryptAesGcm(deviceKek, masterKey, MASTER_KEY_WRAP_AAD);
        const testDataKey = await deriveAesGcmKey(masterKey, TEST_DATA_SALT, TEST_DATA_KEY_INFO);
        const testPayload: SecurityLabTestPayload = {
            message: 'UStudy secret test',
            grade: 9.25,
        };
        const encryptedTestData = await encryptAesGcm(
            testDataKey,
            encodeText(JSON.stringify(testPayload)),
            TEST_DATA_AAD,
        );

        return {
            vaultVersion: 1,
            createdAt: new Date().toISOString(),
            device: {
                credentialId: input.credentialId,
                backupEligible: false,
                backupState: input.flags.backupState,
                prfSalt: bytesToBase64Url(input.prfSalt),
                wrapNonce: bytesToBase64Url(wrappedMasterKey.nonce),
                wrappedMasterKey: bytesToBase64Url(wrappedMasterKey.ciphertext),
            },
            testData: {
                nonce: bytesToBase64Url(encryptedTestData.nonce),
                ciphertext: bytesToBase64Url(encryptedTestData.ciphertext),
            },
        };
    } finally {
        masterKey.fill(0);
        input.prfOutput.fill(0);
    }
}

export async function unlockSecurityLabVault(
    record: DeviceBoundVaultRecord,
    prfOutput: Uint8Array,
): Promise<SecurityLabTestPayload> {
    const prfSalt = base64UrlToBytes(record.device.prfSalt);
    const deviceKek = await deriveAesGcmKey(prfOutput, prfSalt, DEVICE_KEK_INFO);

    try {
        const masterKey = await decryptAesGcm(
            deviceKek,
            base64UrlToBytes(record.device.wrapNonce),
            base64UrlToBytes(record.device.wrappedMasterKey),
            MASTER_KEY_WRAP_AAD,
        );

        try {
            const testDataKey = await deriveAesGcmKey(masterKey, TEST_DATA_SALT, TEST_DATA_KEY_INFO);
            const plaintext = await decryptAesGcm(
                testDataKey,
                base64UrlToBytes(record.testData.nonce),
                base64UrlToBytes(record.testData.ciphertext),
                TEST_DATA_AAD,
            );
            const parsed: unknown = JSON.parse(decodeText(plaintext));
            if (!parsed || typeof parsed !== 'object') {
                throw new Error('Test vault contains invalid data.');
            }

            const payload = parsed as Partial<SecurityLabTestPayload>;
            if (typeof payload.message !== 'string' || typeof payload.grade !== 'number') {
                throw new Error('Test vault payload has an unexpected format.');
            }

            return { message: payload.message, grade: payload.grade };
        } finally {
            masterKey.fill(0);
        }
    } finally {
        prfOutput.fill(0);
    }
}
