import { afterEach, describe, expect, it } from 'vitest';
import {
  beginTransientStorageSession,
  endTransientStorageSession,
  isTransientStorageSessionActive,
  readFromStorage,
  readPlain,
  savePlain,
  saveSecure,
} from '../../src/helpers/localStorage/save';

describe('transient storage session', () => {
  afterEach(() => {
    endTransientStorageSession();
    localStorage.clear();
  });

  it('overlays managed keys without writing localStorage', () => {
    savePlain('student_db_full', { name: 'Dữ liệu thật' });
    beginTransientStorageSession({ student_db_full: { name: 'Dữ liệu mẫu' } });

    expect(readFromStorage('student_db_full', null)).toEqual({ name: 'Dữ liệu mẫu' });
    savePlain('student_db_full', { name: 'Mẫu đã chỉnh' });

    expect(readPlain('student_db_full', null)).toEqual({ name: 'Mẫu đã chỉnh' });
    expect(JSON.parse(localStorage.getItem('student_db_full') || 'null')).toEqual({ name: 'Dữ liệu thật' });
  });

  it('does not intercept keys outside the demo scope', () => {
    beginTransientStorageSession({ student_db_full: { name: 'Dữ liệu mẫu' } });
    savePlain('ustudy_user_guide_progress_v1', { guides: {} });

    expect(readPlain('ustudy_user_guide_progress_v1', null)).toEqual({ guides: {} });
    expect(isTransientStorageSessionActive()).toBe(true);
  });

  it('keeps secure writes in memory while a managed demo session is active', async () => {
    beginTransientStorageSession({ raw_student_db: { name: 'Mẫu' } });
    await saveSecure('raw_student_db', { name: 'Mẫu mới' }, {} as CryptoKey);

    expect(readFromStorage('raw_student_db', null)).toEqual({ name: 'Mẫu mới' });
    expect(localStorage.getItem('raw_student_db')).toBeNull();
  });

  it('returns to the actual storage after the session ends', () => {
    savePlain('selected_courses_basket', ['CSC10009']);
    beginTransientStorageSession({ selected_courses_basket: ['CSC10012'] });
    endTransientStorageSession();

    expect(readPlain('selected_courses_basket', [])).toEqual(['CSC10009']);
    expect(isTransientStorageSessionActive()).toBe(false);
  });
});
