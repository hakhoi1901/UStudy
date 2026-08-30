import { STORAGE_KEYS } from '../../../config/storageKeys';
import { readSecure, SECURE_DATA_KEYS } from '../../../helpers/localStorage/save';
import type { SyncPackageV1 } from './sync-protocol';

const EPHEMERAL_UI_KEYS = new Set<string>([
  STORAGE_KEYS.PAGE,
  STORAGE_KEYS.GRADE_MAIN_TAB,
  STORAGE_KEYS.STUDY_ROADMAP_ACTIVE_TAB,
  STORAGE_KEYS.SCHEDULE_MODE,
  STORAGE_KEYS.GROUP_SCHEDULE_UI_STATE,
  STORAGE_KEYS.SECURITY_LAB_VAULT,
]);

export const DEVICE_SYNC_STORAGE_KEYS = Array.from(new Set([
  ...Object.values(STORAGE_KEYS),
  ...SECURE_DATA_KEYS,
])).filter((key) => !EPHEMERAL_UI_KEYS.has(key));

export async function buildDeviceSyncPackage(cryptoKey: CryptoKey): Promise<SyncPackageV1> {
  const secureKeys = new Set<string>(SECURE_DATA_KEYS);
  const data: Record<string, string> = {};
  for (const key of DEVICE_SYNC_STORAGE_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw === null) continue;
    if (!secureKeys.has(key)) {
      data[key] = raw;
      continue;
    }
    data[key] = JSON.stringify(await readSecure<unknown>(key, cryptoKey, null));
  }
  return {
    protocolVersion: 1,
    cryptoVersion: 2,
    createdAt: Date.now(),
    data,
  };
}

export function serializeDeviceSyncPackage(value: SyncPackageV1): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(value));
}
