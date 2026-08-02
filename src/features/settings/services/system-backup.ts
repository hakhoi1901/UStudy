import { STORAGE_KEYS } from '../../../config/storageKeys';

export const SYSTEM_BACKUP_SOURCE = 'hcmus-portal-tool';

const KNOWN_STORAGE_KEYS = new Set<string>(Object.values(STORAGE_KEYS));

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export interface UnwrappedSystemBackup {
  data: Record<string, unknown>;
  hasSystemEnvelope: boolean;
}

export function unwrapSystemBackup(value: unknown): UnwrappedSystemBackup | null {
  if (!isRecord(value)) return null;

  if (
    isRecord(value.metadata)
    && value.metadata.source === SYSTEM_BACKUP_SOURCE
    && isRecord(value.data)
  ) {
    return {
      data: value.data,
      hasSystemEnvelope: true,
    };
  }

  return {
    data: value,
    hasSystemEnvelope: false,
  };
}

export function isSystemBackupData(
  data: Record<string, unknown>,
  hasSystemEnvelope = false,
): boolean {
  const keys = Object.keys(data);
  if (keys.length === 0) return false;
  if (hasSystemEnvelope) return true;

  return keys.some((key) => (
    KNOWN_STORAGE_KEYS.has(key)
    || key.startsWith('db_')
    || key.startsWith('app_')
    || key.includes('semester')
    || key === 'raw_student_db'
  ));
}

export function normalizeStorageBackupData(
  data: Record<string, unknown>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(data).flatMap(([key, value]) => {
      if (typeof value === 'string') return [[key, value]];
      if (value === undefined) return [];
      return [[key, JSON.stringify(value)]];
    }),
  );
}

export function parseStorageBackupValue(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}
