import { STORAGE_KEYS } from '../../../config';
import { getImportHistory, readFromStorage } from '../../../helpers/localStorage/save';
import type { GuideAvailability, GuidePrerequisite, UserGuide } from '../types';

function hasConfiguredProgram(): boolean {
  return readFromStorage<boolean>(STORAGE_KEYS.DEPARTMENT_CONFIGURED, false) === true;
}

function hasStudentData(): boolean {
  const studentDb = readFromStorage<any>(STORAGE_KEYS.STUDENT_DB, null);
  const raw = readFromStorage<any>(STORAGE_KEYS.RAW_STUDENT_DB, null);
  return Boolean(
    studentDb?.grades?.length
    || studentDb?.registrations?.length
    || raw?.grades?.length
    || raw?.registrations?.length,
  );
}

function hasSelectedCourses(): boolean {
  const selected = readFromStorage<unknown>(STORAGE_KEYS.SELECTED_BASKET, []);
  return Array.isArray(selected) && selected.length > 0;
}

function hasGroupMembers(): boolean {
  const members = readFromStorage<unknown>(STORAGE_KEYS.GROUP_SCHEDULER_MEMBERS, []);
  return Array.isArray(members) && members.length > 0;
}

function hasGroupResult(): boolean {
  const result = readFromStorage<any>(STORAGE_KEYS.GROUP_SCHEDULE_LAST_RESULT, null);
  return Boolean(result?.result?.solutions?.length || result?.solutions?.length);
}

export function checkGuidePrerequisite(prerequisite?: GuidePrerequisite): GuideAvailability {
  if (!prerequisite) return { available: true };

  if (prerequisite === 'configured' && !hasConfiguredProgram()) {
    return { available: false, reason: 'Hãy chọn Khóa tuyển, Khoa và Ngành trước khi mở hướng dẫn này.' };
  }
  if (prerequisite === 'student-data' && !hasStudentData()) {
    return { available: false, reason: 'Hướng dẫn này cần bảng điểm hoặc kết quả đăng ký học phần.', recommendedGuideId: 'data-sync' };
  }
  if (prerequisite === 'selected-courses' && !hasSelectedCourses()) {
    return { available: false, reason: 'Bước này chỉ xuất hiện sau khi bạn đã chọn ít nhất một môn.' };
  }
  if (prerequisite === 'group-members' && !hasGroupMembers()) {
    return { available: false, reason: 'Bước này chỉ xuất hiện sau khi nhóm đã có thành viên.' };
  }
  if (prerequisite === 'group-result' && !hasGroupResult()) {
    return { available: false, reason: 'Bước này chỉ xuất hiện sau khi đã tạo được phương án lịch.' };
  }
  if (prerequisite === 'import-history' && getImportHistory().length === 0) {
    return { available: false, reason: 'Chưa có lần nhập dữ liệu nào để minh họa thao tác hoàn tác.', recommendedGuideId: 'data-sync' };
  }

  return { available: true };
}

export function getGuideAvailability(guide: UserGuide): GuideAvailability {
  return checkGuidePrerequisite(guide.prerequisite);
}
