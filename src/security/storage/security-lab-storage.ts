import type { DeviceBoundVaultRecord } from '../vault/vault-format';
import { STORAGE_KEYS } from '../../config/storageKeys';

const SECURITY_LAB_STORAGE_KEY = STORAGE_KEYS.SECURITY_LAB_VAULT;

function isVaultRecord(value: unknown): value is DeviceBoundVaultRecord {
    if (!value || typeof value !== 'object') return false;
    const record = value as Partial<DeviceBoundVaultRecord>;
    return record.vaultVersion === 1
        && typeof record.createdAt === 'string'
        && typeof record.device?.credentialId === 'string'
        && record.device?.backupEligible === false
        && typeof record.device?.prfSalt === 'string'
        && typeof record.testData?.ciphertext === 'string';
}

export function loadSecurityLabVault(): DeviceBoundVaultRecord | null {
    const raw = window.localStorage.getItem(SECURITY_LAB_STORAGE_KEY);
    if (!raw) return null;

    try {
        const parsed: unknown = JSON.parse(raw);
        return isVaultRecord(parsed) ? parsed : null;
    } catch {
        return null;
    }
}

export function saveSecurityLabVault(record: DeviceBoundVaultRecord): void {
    window.localStorage.setItem(SECURITY_LAB_STORAGE_KEY, JSON.stringify(record));
}

export function clearSecurityLabVault(): void {
    window.localStorage.removeItem(SECURITY_LAB_STORAGE_KEY);
}

export { SECURITY_LAB_STORAGE_KEY };
