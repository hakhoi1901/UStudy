import { describe, expect, it } from 'vitest';

import {
  changePin,
  deriveKek,
  getCurrentCryptoMetadata,
  getCryptoVersion,
  importBackupWithCurrentKey,
  readImportRollbackValue,
  readSecure,
  prepareNewLocalMasterKey,
  replaceDeviceSyncData,
  saveToStorage,
  saveSecure,
  setActiveSecureStorageKey,
  setupPin,
  verifyPin,
} from '../../../src/helpers/localStorage/save';
import { vi } from 'vitest';

function toBase64(bytes: Uint8Array | ArrayBuffer): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  return btoa(String.fromCharCode(...view));
}

async function createLegacyPayload(value: unknown, key: CryptoKey, salt: Uint8Array): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify(value));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);
  return `${toBase64(salt)}:${toBase64(iv)}:${toBase64(ciphertext)}`;
}

async function createLegacyStorage(pin: string, data: Record<string, unknown>): Promise<CryptoKey> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKek(pin, salt);
  localStorage.setItem('__pbkdf2_salt__', toBase64(salt));
  localStorage.setItem('__pin_verify__', await createLegacyPayload({ ok: true }, key, salt));
  for (const [storageKey, value] of Object.entries(data)) {
    localStorage.setItem(storageKey, await createLegacyPayload(value, key, salt));
  }
  return key;
}

function snapshotStorage(): Record<string, string> {
  return Object.fromEntries(
    Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index))
      .filter((key): key is string => Boolean(key))
      .map((key) => [key, localStorage.getItem(key) ?? '']),
  );
}

function flipBase64Byte(value: string): string {
  const bytes = Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
  bytes[Math.floor(bytes.length / 2)] ^= 1;
  return toBase64(bytes);
}

function failOneMigrationCommitWrite(failAt: number, primaryKeys: string[]) {
  const originalSetItem = localStorage.setItem.bind(localStorage);
  let commitStarted = false;
  let commitWriteCount = 0;
  let hasFailed = false;

  return vi.spyOn(localStorage, 'setItem').mockImplementation((key: string, value: string) => {
    let isCommitWrite = false;
    if (key === '__crypto_v2_migration_stage__') {
      const phase = JSON.parse(value).phase;
      if (phase === 'committing') {
        commitStarted = true;
        isCommitWrite = true;
      } else if (commitStarted && phase === 'committed') {
        isCommitWrite = true;
      }
    } else if (commitStarted && [
      ...primaryKeys,
      '__master_key_iv__',
      '__encrypted_master_key__',
      '__secure_data_schema_version__',
      '__crypto_version__',
    ].includes(key)) {
      isCommitWrite = true;
    }

    if (isCommitWrite) {
      commitWriteCount += 1;
      if (!hasFailed && commitWriteCount === failAt) {
        hasFailed = true;
        throw new DOMException('Storage quota exceeded', 'QuotaExceededError');
      }
    }
    originalSetItem(key, value);
  });
}

describe('secure storage v2', () => {
  it('creates a non-extractable Master Data Key and encrypts data with it', async () => {
    const masterKey = await setupPin('246810');
    const data = { name: 'Student Test', grades: [{ id: 'CSC10001', score: '8.5' }] };

    await saveSecure('raw_student_db', data, masterKey);

    const payload = localStorage.getItem('raw_student_db');
    expect(getCryptoVersion()).toBe(2);
    expect(localStorage.getItem('__encrypted_master_key__')).toBeTruthy();
    expect(localStorage.getItem('__master_key_iv__')).toBeTruthy();
    expect(localStorage.getItem('__pin_verify__')).toBeNull();
    expect(payload).not.toContain('Student Test');
    expect(payload?.split(':')).toHaveLength(3);
    await expect(readSecure('raw_student_db', masterKey, null)).resolves.toEqual(data);
  });

  it('rejects a wrong PIN without changing the v2 envelope', async () => {
    await setupPin('correct-pin');
    const before = snapshotStorage();

    await expect(verifyPin('wrong-pin')).resolves.toBeNull();
    expect(snapshotStorage()).toEqual(before);
  });

  it('upgrades plain JSON written by early v2 secure-key writers after unlock', async () => {
    await setupPin('correct-pin');
    localStorage.removeItem('__secure_data_schema_version__');
    localStorage.setItem('gpa_projected_grades', JSON.stringify({ version: 2, grades: { CSC10001: 8.5 } }));
    localStorage.setItem('allowed_classes_map', JSON.stringify({ CSC10001: ['24CTT1'] }));

    const reopenedKey = await verifyPin('correct-pin');

    expect(reopenedKey).not.toBeNull();
    expect(localStorage.getItem('__secure_data_schema_version__')).toBe('1');
    expect(localStorage.getItem('gpa_projected_grades')?.split(':')).toHaveLength(3);
    await expect(readSecure('gpa_projected_grades', reopenedKey!, null)).resolves.toEqual({
      version: 2,
      grades: { CSC10001: 8.5 },
    });
    await expect(readSecure('allowed_classes_map', reopenedKey!, null)).resolves.toEqual({ CSC10001: ['24CTT1'] });
  });

  it('keeps legacy saveToStorage callers encrypted for secure keys', async () => {
    const masterKey = await setupPin('correct-pin');
    setActiveSecureStorageKey(masterKey);

    saveToStorage('solver_preferences', { daysOff: [2], strategy: 'compress' });

    await vi.waitFor(() => expect(localStorage.getItem('solver_preferences')?.split(':')).toHaveLength(3));
    await expect(readSecure('solver_preferences', masterKey, null)).resolves.toEqual({
      daysOff: [2],
      strategy: 'compress',
    });
    setActiveSecureStorageKey(null);
  });

  it('migrates legacy data to v2 on the first successful unlock', async () => {
    const legacyKey = await createLegacyStorage('legacy-pin', {
      raw_student_db: { name: 'Legacy Student', grades: [{ id: 'CSC10001' }] },
      saved_schedules: [{ id: 'legacy-schedule' }],
    });
    const legacyPayload = localStorage.getItem('raw_student_db');

    const masterKey = await verifyPin('legacy-pin');

    expect(masterKey).not.toBeNull();
    expect(getCryptoVersion()).toBe(2);
    expect(localStorage.getItem('__pin_verify__')).toBeNull();
    expect(localStorage.getItem('raw_student_db')).not.toBe(legacyPayload);
    await expect(readSecure('raw_student_db', masterKey!, null)).resolves.toEqual({
      name: 'Legacy Student',
      grades: [{ id: 'CSC10001' }],
    });
    await expect(readSecure('raw_student_db', legacyKey, null)).rejects.toBeDefined();
  });

  it('migrates historical plain JSON stored under a secure key', async () => {
    await createLegacyStorage('legacy-pin', {
      raw_student_db: { name: 'Legacy Student' },
    });
    const historicalProjection = { version: 2, grades: { CSC10001: 8.5 } };
    localStorage.setItem('gpa_projected_grades', JSON.stringify(historicalProjection));

    const masterKey = await verifyPin('legacy-pin');

    expect(masterKey).not.toBeNull();
    expect(getCryptoVersion()).toBe(2);
    await expect(readSecure('gpa_projected_grades', masterKey!, null)).resolves.toEqual(historicalProjection);
  });

  it('keeps legacy data usable when migration cannot stage every secure entry', async () => {
    await createLegacyStorage('legacy-pin', { raw_student_db: { name: 'Legacy Student' } });
    localStorage.setItem('saved_schedules', 'not-an-encrypted-payload');
    const before = snapshotStorage();

    const key = await verifyPin('legacy-pin');

    expect(key).not.toBeNull();
    expect(getCryptoVersion()).toBe(1);
    expect(localStorage.getItem('raw_student_db')).toBe(before.raw_student_db);
    await expect(readSecure('raw_student_db', key!, null)).resolves.toEqual({ name: 'Legacy Student' });
  });

  it('recovers legacy data after an interrupted migration before retrying it', async () => {
    await createLegacyStorage('legacy-pin', { raw_student_db: { name: 'Recoverable Student' } });
    const legacyPayload = localStorage.getItem('raw_student_db')!;
    const legacySalt = localStorage.getItem('__pbkdf2_salt__')!;
    const legacyPinVerify = localStorage.getItem('__pin_verify__')!;
    localStorage.setItem('__crypto_v2_legacy__:raw_student_db', legacyPayload);
    localStorage.setItem('__crypto_v2_data__:raw_student_db', 'incomplete-v2-data');
    localStorage.setItem('raw_student_db', 'partially-committed-v2-data');
    localStorage.setItem('__crypto_v2_migration_stage__', JSON.stringify({
      kind: 'migration',
      phase: 'committing',
      keys: ['raw_student_db'],
      legacySalt,
      legacyPinVerify,
      masterKeyIv: 'unused',
      encryptedMasterKey: 'unused',
    }));

    const masterKey = await verifyPin('legacy-pin');

    expect(masterKey).not.toBeNull();
    expect(getCryptoVersion()).toBe(2);
    await expect(readSecure('raw_student_db', masterKey!, null)).resolves.toEqual({ name: 'Recoverable Student' });
    expect(localStorage.getItem('__crypto_v2_migration_stage__')).toBeNull();
  });

  it.each([1, 2, 3, 4, 5, 6, 7, 8])('keeps migration atomic when quota fails at commit write %i', async (failAt) => {
    await createLegacyStorage('legacy-pin', {
      raw_student_db: { name: 'Quota-safe Student' },
      saved_schedules: [{ id: 'quota-safe-schedule' }],
    });
    const setItemSpy = failOneMigrationCommitWrite(failAt, ['raw_student_db', 'saved_schedules']);
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const key = await verifyPin('legacy-pin');

    setItemSpy.mockRestore();
    warnSpy.mockRestore();
    expect(key).not.toBeNull();
    expect(localStorage.getItem('__crypto_v2_migration_stage__')).toBeNull();
    expect(localStorage.getItem('__crypto_v2_legacy__:raw_student_db')).toBeNull();
    expect(localStorage.getItem('__crypto_v2_data__:raw_student_db')).toBeNull();

    if (failAt < 8) {
      expect(getCryptoVersion()).toBe(1);
      expect(localStorage.getItem('__master_key_iv__')).toBeNull();
      expect(localStorage.getItem('__encrypted_master_key__')).toBeNull();
      await expect(readSecure('raw_student_db', key!, null)).resolves.toEqual({ name: 'Quota-safe Student' });
      return;
    }

    expect(getCryptoVersion()).toBe(2);
    expect(localStorage.getItem('__pin_verify__')).toBeNull();
    await expect(readSecure('raw_student_db', key!, null)).resolves.toEqual({ name: 'Quota-safe Student' });
  });

  it('fails cleanly when the wrapped Master Key ciphertext is modified', async () => {
    await setupPin('correct-pin');
    localStorage.setItem('__encrypted_master_key__', flipBase64Byte(localStorage.getItem('__encrypted_master_key__')!));

    await expect(verifyPin('correct-pin')).resolves.toBeNull();
  });

  it('fails cleanly when the Master Key IV is modified', async () => {
    await setupPin('correct-pin');
    localStorage.setItem('__master_key_iv__', flipBase64Byte(localStorage.getItem('__master_key_iv__')!));

    await expect(verifyPin('correct-pin')).resolves.toBeNull();
  });

  it('rejects a modified v2 data ciphertext instead of returning a fallback value', async () => {
    const masterKey = await setupPin('correct-pin');
    await saveSecure('raw_student_db', { name: 'Integrity-protected Student' }, masterKey);
    const [salt, iv, ciphertext] = localStorage.getItem('raw_student_db')!.split(':');
    localStorage.setItem('raw_student_db', `${salt}:${iv}:${flipBase64Byte(ciphertext)}`);

    await expect(readSecure('raw_student_db', masterKey, { name: 'fallback' })).rejects.toBeDefined();
  });

  it('changes the PIN by re-wrapping only the Master Data Key', async () => {
    const masterKey = await setupPin('old-pin');
    await saveSecure('raw_student_db', { id: 'student-1' }, masterKey);
    const encryptedDataBefore = localStorage.getItem('raw_student_db');
    const wrappedMasterBefore = localStorage.getItem('__encrypted_master_key__');

    const keyAfterPinChange = await changePin(masterKey, 'old-pin', 'new-pin');

    expect(localStorage.getItem('raw_student_db')).toBe(encryptedDataBefore);
    expect(localStorage.getItem('__encrypted_master_key__')).not.toBe(wrappedMasterBefore);
    await expect(verifyPin('old-pin')).resolves.toBeNull();
    await expect(verifyPin('new-pin')).resolves.not.toBeNull();
    await expect(readSecure('raw_student_db', keyAfterPinChange, null)).resolves.toEqual({ id: 'student-1' });
  });

  it('creates an independent receiver Master Key and encrypts transferred data locally', async () => {
    const sourceMasterKey = await setupPin('source-pin');
    await saveSecure('raw_student_db', { id: 'student-sync' }, sourceMasterKey);

    localStorage.clear();
    const receiverSetup = await prepareNewLocalMasterKey('receiver-pin');
    await replaceDeviceSyncData(
      { raw_student_db: JSON.stringify({ id: 'student-sync' }) },
      ['raw_student_db'],
      receiverSetup.cryptoMetadata,
      receiverSetup.masterKey,
    );

    const reopenedKey = await verifyPin('receiver-pin');
    expect(reopenedKey).not.toBeNull();
    await expect(readSecure('raw_student_db', reopenedKey!, null)).resolves.toEqual({ id: 'student-sync' });
  });

  it('reuses an unlocked receiver vault without changing its PIN or Master Key envelope', async () => {
    const receiverKey = await setupPin('receiver-pin');
    const envelopeBefore = localStorage.getItem('__encrypted_master_key__');

    await replaceDeviceSyncData(
      { raw_student_db: JSON.stringify({ id: 'updated-on-existing-device' }) },
      ['raw_student_db'],
      getCurrentCryptoMetadata(),
      receiverKey,
    );

    expect(localStorage.getItem('__encrypted_master_key__')).toBe(envelopeBefore);
    await expect(verifyPin('receiver-pin')).resolves.not.toBeNull();
    await expect(readSecure('raw_student_db', receiverKey, null)).resolves.toEqual({ id: 'updated-on-existing-device' });
  });

  it('rolls back a failed device-sync replacement without leaving partial data', async () => {
    const currentKey = await setupPin('current-pin');
    await saveSecure('raw_student_db', { id: 'before-sync' }, currentKey);
    const receiverSetup = await prepareNewLocalMasterKey('receiver-pin');
    const originalSetItem = localStorage.setItem.bind(localStorage);
    let committing = false;
    let failed = false;
    const setItemSpy = vi.spyOn(localStorage, 'setItem').mockImplementation((key: string, value: string) => {
      if (key === '__device_sync_import_stage__' && JSON.parse(value).phase === 'committing') committing = true;
      if (committing && !failed && key === 'raw_student_db') {
        failed = true;
        throw new DOMException('Storage quota exceeded', 'QuotaExceededError');
      }
      originalSetItem(key, value);
    });

    await expect(replaceDeviceSyncData(
      { raw_student_db: JSON.stringify({ id: 'after-sync' }) },
      ['raw_student_db'],
      receiverSetup.cryptoMetadata,
      receiverSetup.masterKey,
    )).rejects.toBeDefined();
    setItemSpy.mockRestore();

    expect(localStorage.getItem('__device_sync_import_stage__')).toBeNull();
    await expect(readSecure('raw_student_db', currentKey, null)).resolves.toEqual({ id: 'before-sync' });
  });

  it('releases a large staged value before committing its primary storage key', async () => {
    await setupPin('current-pin');
    const receiverSetup = await prepareNewLocalMasterKey('receiver-pin');
    const largeResult = JSON.stringify({ solutions: ['x'.repeat(128 * 1024)] });
    const originalSetItem = localStorage.setItem.bind(localStorage);
    const setItemSpy = vi.spyOn(localStorage, 'setItem').mockImplementation((key: string, value: string) => {
      if (key === 'group_schedule_last_result' && localStorage.getItem('__device_sync_next__:group_schedule_last_result') !== null) {
        throw new DOMException('Duplicate staged value exceeded quota', 'QuotaExceededError');
      }
      originalSetItem(key, value);
    });

    await replaceDeviceSyncData(
      { group_schedule_last_result: largeResult },
      ['group_schedule_last_result'],
      receiverSetup.cryptoMetadata,
      receiverSetup.masterKey,
    );
    setItemSpy.mockRestore();

    expect(localStorage.getItem('group_schedule_last_result')).toBe(largeResult);
    expect(localStorage.getItem('__device_sync_next__:group_schedule_last_result')).toBeNull();
  });

  it('imports a v2 encrypted backup and re-encrypts selected data with the current Master Key', async () => {
    const backupKey = await setupPin('backup-pin');
    await saveSecure('raw_student_db', { grades: [1, 2, 3] }, backupKey);
    await saveSecure('saved_schedules', [{ id: 'schedule-1' }], backupKey);
    localStorage.setItem('selected_academic_year', JSON.stringify('2026-2027'));
    const backup = snapshotStorage();

    localStorage.clear();
    const currentKey = await setupPin('current-pin');
    await importBackupWithCurrentKey(backup, 'backup-pin', currentKey, [
      'raw_student_db',
      'selected_academic_year',
    ]);

    await expect(readSecure('raw_student_db', currentKey, null)).resolves.toEqual({ grades: [1, 2, 3] });
    expect(localStorage.getItem('saved_schedules')).toBeNull();
    expect(localStorage.getItem('selected_academic_year')).toBe(JSON.stringify('2026-2027'));
  });

  it('imports a legacy encrypted backup into a v2 session', async () => {
    await createLegacyStorage('legacy-backup-pin', {
      raw_student_db: { grades: [7, 8, 9] },
    });
    const legacyBackup = snapshotStorage();

    localStorage.clear();
    const currentKey = await setupPin('current-pin');
    await importBackupWithCurrentKey(legacyBackup, 'legacy-backup-pin', currentKey, ['raw_student_db']);

    expect(getCryptoVersion()).toBe(2);
    await expect(readSecure('raw_student_db', currentKey, null)).resolves.toEqual({ grades: [7, 8, 9] });
  });

  it('does not partially restore a v1 snapshot into an unlocked v2 session', async () => {
    const masterKey = await setupPin('current-pin');
    localStorage.setItem('__ustudy_last_import_rollback__', JSON.stringify({
      createdAt: new Date().toISOString(),
      source: 'test',
      summary: { added: 0, updated: 0, unchanged: 0 },
      data: { raw_student_db: 'legacy-payload' },
    }));

    await expect(readImportRollbackValue('raw_student_db', masterKey, null)).rejects.toThrow('INCOMPATIBLE_CRYPTO_SNAPSHOT');
  });
});
