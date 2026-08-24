import { describe, expect, it } from 'vitest';
import { STORAGE_KEYS } from '../../../src/config';
import { IMPORT_HISTORY_STORAGE_KEY, savePlain } from '../../../src/helpers/localStorage/save';
import { checkGuidePrerequisite, getGuideAvailability } from '../../../src/features/user-guide/services/guide-availability';
import { USER_GUIDE_BY_ID } from '../../../src/features/user-guide/guide-registry';

describe('guide prerequisites', () => {
  it('requires program configuration for feature tours', () => {
    expect(checkGuidePrerequisite('configured').available).toBe(false);
    savePlain(STORAGE_KEYS.DEPARTMENT_CONFIGURED, true);
    expect(checkGuidePrerequisite('configured').available).toBe(true);
  });

  it('recognizes student data and selected courses', () => {
    expect(checkGuidePrerequisite('student-data').available).toBe(false);
    savePlain(STORAGE_KEYS.STUDENT_DB, { grades: [{ id: 'CSC10001' }] });
    expect(checkGuidePrerequisite('student-data').available).toBe(true);

    expect(checkGuidePrerequisite('selected-courses').available).toBe(false);
    savePlain(STORAGE_KEYS.SELECTED_BASKET, ['CSC10001']);
    expect(checkGuidePrerequisite('selected-courses').available).toBe(true);
  });

  it('recognizes group members and generated results independently', () => {
    expect(checkGuidePrerequisite('group-members').available).toBe(false);
    expect(checkGuidePrerequisite('group-result').available).toBe(false);

    savePlain(STORAGE_KEYS.GROUP_SCHEDULER_MEMBERS, [{ nickname: 'Khôi' }]);
    savePlain(STORAGE_KEYS.GROUP_SCHEDULE_LAST_RESULT, { result: { solutions: [{ id: 'pa-1' }] } });

    expect(checkGuidePrerequisite('group-members').available).toBe(true);
    expect(checkGuidePrerequisite('group-result').available).toBe(true);
  });

  it('recognizes import history and recommends data sync while it is empty', () => {
    expect(checkGuidePrerequisite('import-history')).toMatchObject({
      available: false,
      recommendedGuideId: 'data-sync',
    });

    localStorage.setItem(IMPORT_HISTORY_STORAGE_KEY, JSON.stringify([{
      id: 'history-1',
      createdAt: new Date().toISOString(),
      source: 'JSON',
      summary: { added: 1, updated: 0, removed: 0, unchanged: 0 },
      details: [],
    }]));

    expect(checkGuidePrerequisite('import-history').available).toBe(true);
  });

  it('allows a step without prerequisites and checks a guide-level prerequisite', () => {
    expect(checkGuidePrerequisite()).toEqual({ available: true });
    const guide = USER_GUIDE_BY_ID.get('data-sync');
    expect(guide).toBeDefined();
    expect(getGuideAvailability(guide!).available).toBe(false);
  });
});
