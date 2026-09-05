import { describe, expect, it } from 'vitest';

import {
  changePin,
  importBackupWithCurrentKey,
  readSecure,
  saveSecure,
  setupPin,
  verifyBackupPin,
  verifyPin,
} from '../../../src/helpers/localStorage/save';

function snapshotStorage(): Record<string, string> {
  return Object.fromEntries(
    Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index))
      .filter((key): key is string => Boolean(key))
      .map((key) => [key, localStorage.getItem(key) ?? '']),
  );
}

describe('secure storage', () => {
  it('encrypts sensitive JSON and decrypts it with the same PIN', async () => {
    const key = await setupPin('246810');
    const data = { name: 'Student Test', grades: [{ id: 'CSC10001', score: '8.5' }] };

    await saveSecure('raw_student_db', data, key);

    const payload = localStorage.getItem('raw_student_db');
    expect(payload).toBeTruthy();
    expect(payload).not.toContain('Student Test');
    expect(payload?.split(':')).toHaveLength(3);
    await expect(readSecure('raw_student_db', key, null)).resolves.toEqual(data);
  });

  it('rejects a wrong PIN without changing encrypted data', async () => {
    await setupPin('correct-pin');
    const before = localStorage.getItem('__pin_verify__');

    await expect(verifyPin('wrong-pin')).resolves.toBeNull();
    expect(localStorage.getItem('__pin_verify__')).toBe(before);
  });

  it('re-encrypts all secure values when the PIN changes', async () => {
    const oldKey = await setupPin('old-pin');
    await saveSecure('raw_student_db', { id: 'student-1' }, oldKey);
    const oldPayload = localStorage.getItem('raw_student_db');

    const newKey = await changePin(oldKey, 'new-pin');

    expect(localStorage.getItem('raw_student_db')).not.toBe(oldPayload);
    await expect(verifyPin('old-pin')).resolves.toBeNull();
    await expect(verifyPin('new-pin')).resolves.not.toBeNull();
    await expect(readSecure('raw_student_db', newKey, null)).resolves.toEqual({ id: 'student-1' });
  });

  it('imports selected backup keys and re-encrypts them with the current key', async () => {
    const backupKey = await setupPin('backup-pin');
    await saveSecure('raw_student_db', { grades: [1, 2, 3] }, backupKey);
    await saveSecure('saved_schedules', [{ id: 'schedule-1' }], backupKey);
    localStorage.setItem('selected_academic_year', JSON.stringify('2026-2027'));
    const backup = snapshotStorage();

    expect(await verifyBackupPin('backup-pin', backup.__pbkdf2_salt__, backup.__pin_verify__)).toBe(true);

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
});
