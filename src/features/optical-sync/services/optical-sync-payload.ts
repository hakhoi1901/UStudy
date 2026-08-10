import { STORAGE_KEYS } from '../../../config/storageKeys';
import { readFromStorage, SECURE_DATA_KEYS } from '../../../helpers/localStorage/save';
import { SYSTEM_BACKUP_SOURCE } from '../../settings/services/system-backup';

const OPTICAL_SYNC_KEYS = new Set<string>([
  STORAGE_KEYS.RAW_STUDENT_DB,
  STORAGE_KEYS.IMPORT_META,
  STORAGE_KEYS.FACULTY_ID,
  STORAGE_KEYS.MAJOR_ID,
  STORAGE_KEYS.COHORT_ID,
  STORAGE_KEYS.ACADEMIC_YEAR,
  STORAGE_KEYS.ACADEMIC_SEMESTER,
  STORAGE_KEYS.DEPARTMENT_CONFIGURED,
  STORAGE_KEYS.SELECTED_BASKET,
  STORAGE_KEYS.PROJECTED_GRADES,
  STORAGE_KEYS.GPA_ACTIVE_PROJECTION_SEMESTER,
  STORAGE_KEYS.GPA_PULL_FUTURE_GRADES,
  STORAGE_KEYS.GPA_COMPONENT_GRADES,
  STORAGE_KEYS.GPA_GOAL_GRADES,
  STORAGE_KEYS.DASHBOARD_LAYOUT,
  STORAGE_KEYS.SOLVER_PREFERENCES,
  STORAGE_KEYS.STUDY_PLAN,
  STORAGE_KEYS.STUDY_PLAN_CATEGORY_EXPANSION,
  STORAGE_KEYS.ALLOWED_CLASSES_MAP,
  STORAGE_KEYS.SAVED_SCHEDULES,
  STORAGE_KEYS.ACTIVE_GROUP_SCHEDULE,
  STORAGE_KEYS.SCHEDULE_OVERRIDES,
  STORAGE_KEYS.GROUP_SCHEDULER_MEMBERS,
  STORAGE_KEYS.GROUP_SCHEDULE_LAST_RESULT,
  STORAGE_KEYS.CHAT_HISTORY,
]);

export function isOpticalSyncKey(key: string): boolean {
  return OPTICAL_SYNC_KEYS.has(key);
}

export function buildOpticalSyncPayload(
  selectedKeys: readonly string[],
  storageData: Record<string, string>,
): string {
  const secureKeys = new Set<string>(SECURE_DATA_KEYS);
  const data: Record<string, string> = {};

  selectedKeys.forEach((key) => {
    const rawValue = storageData[key];
    if (rawValue === undefined) return;
    if (!secureKeys.has(key)) {
      data[key] = rawValue;
      return;
    }

    const decrypted = readFromStorage<unknown>(key, undefined);
    if (decrypted === undefined) {
      throw new Error(`Hãy mở khóa dữ liệu trước khi gửi mục "${key}".`);
    }
    data[key] = JSON.stringify(decrypted);
  });

  return JSON.stringify({
    metadata: {
      version: '2.1',
      exportedAt: new Date().toISOString(),
      source: SYSTEM_BACKUP_SOURCE,
      transport: 'optical',
    },
    data,
  });
}
