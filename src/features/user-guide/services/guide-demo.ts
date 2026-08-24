import courseDb from '../../../logic/scheduler/Course_db.json';
import { STORAGE_KEYS } from '../../../config';
import type { GroupMemberToken } from '../../group-schedule/types';
import type { UserGuideId } from '../types';

export const GUIDE_DEMO_MANAGED_KEYS = [
  STORAGE_KEYS.DEPARTMENT_CONFIGURED,
  STORAGE_KEYS.STUDENT_DB,
  STORAGE_KEYS.RAW_STUDENT_DB,
  STORAGE_KEYS.COURSE_DB_OFFLINE,
  STORAGE_KEYS.IMPORT_META,
  STORAGE_KEYS.LAST_DATA_IMPORT,
  STORAGE_KEYS.SELECTED_BASKET,
  STORAGE_KEYS.ALLOWED_CLASSES_MAP,
  STORAGE_KEYS.SOLVER_PREFERENCES,
  STORAGE_KEYS.SCHEDULE_MODE,
  STORAGE_KEYS.SCHEDULE_BUILDER_DRAFT,
  STORAGE_KEYS.GROUP_SCHEDULER_MEMBERS,
  STORAGE_KEYS.GROUP_SCHEDULER_CLASS_PREFERENCES,
  STORAGE_KEYS.GROUP_SCHEDULER_COURSE_SHARING,
  STORAGE_KEYS.GROUP_SCHEDULE_UI_STATE,
  STORAGE_KEYS.GROUP_SCHEDULE_LAST_RESULT,
  STORAGE_KEYS.ACTIVE_GROUP_SCHEDULE,
  STORAGE_KEYS.SAVED_SCHEDULES,
] as const;

const DEMO_COURSE_CODES = ['CSC10007', 'CSC10009', 'CSC10012'];

function emptyMask(): number[] {
  return Array.from({ length: 10 }, () => 0);
}

function createDemoMembers(): GroupMemberToken[] {
  return [
    {
      nickname: 'Khôi',
      sharedCourses: ['CSC10009'],
      personalCourses: ['CSC10012'],
      busyMask: emptyMask(),
      preferredClasses: {},
      personalConfig: { daysOff: ['4:afternoon'] },
    },
    {
      nickname: 'An',
      sharedCourses: ['CSC10009'],
      personalCourses: ['CSC10007'],
      busyMask: emptyMask(),
      preferredClasses: {},
      personalConfig: { daysOff: ['1:morning'] },
    },
    {
      nickname: 'Minh',
      sharedCourses: ['CSC10009', 'CSC10012'],
      personalCourses: [],
      busyMask: emptyMask(),
      preferredClasses: {},
      personalConfig: {},
    },
  ];
}

/**
 * Bộ dữ liệu nhỏ để tour có thể minh họa GPA, giỏ môn và xếp lịch.
 * Chỉ được dùng trong transient storage session, không phải dữ liệu Portal.
 */
export function createGuideDemoData(_guideId: UserGuideId): Record<string, unknown> {
  const isGroupGuide = _guideId === 'group-scheduling' || _guideId === 'group-preferences';
  const initialGroupStep = _guideId === 'group-preferences' ? 2 : 1;
  const grades = [
    { semester: '25-26/1', id: 'CSC10012', name: 'CSC10012 - Cơ sở lập trình', credits: '4', class: '24CTT1', type: 'LT', score: 8.5, notes: '' },
    { semester: '25-26/2', id: 'CSC10007', name: 'CSC10007 - Hệ điều hành', credits: '4', class: '24CTT1', type: 'LT', score: 7.8, notes: '' },
    { semester: '26-27/1', id: 'CSC10009', name: 'CSC10009 - Cơ sở dữ liệu', credits: '4', class: '24CTT1', type: 'LT', score: '', notes: '' },
  ];
  const registrations = [
    {
      id: 'CSC10009',
      name: 'CSC10009 - Cơ sở dữ liệu',
      classGroup: '24CTT1',
      regType: 'LT',
      courseType: 'Bắt buộc',
      schedule: 'T3 (1-4) F202',
      startWeek: '1',
      semester: '26-27/1',
    },
  ];
  const student = {
    name: 'Sinh viên minh họa',
    grades,
    registrations,
    exams: { midterm: [], final: [] },
    tuition: {},
    program: [],
  };

  return {
    [STORAGE_KEYS.DEPARTMENT_CONFIGURED]: true,
    [STORAGE_KEYS.STUDENT_DB]: student,
    [STORAGE_KEYS.RAW_STUDENT_DB]: { ...student, courses: [] },
    [STORAGE_KEYS.COURSE_DB_OFFLINE]: (courseDb as Array<{ id: string }>).filter((course) => DEMO_COURSE_CODES.includes(course.id)),
    [STORAGE_KEYS.IMPORT_META]: { params: { registration: { year: '2026-2027', sem: 1 } } },
    [STORAGE_KEYS.LAST_DATA_IMPORT]: { at: new Date().toISOString(), source: 'json' },
    [STORAGE_KEYS.SELECTED_BASKET]: ['CSC10007', 'CSC10012'],
    [STORAGE_KEYS.ALLOWED_CLASSES_MAP]: {},
    [STORAGE_KEYS.SOLVER_PREFERENCES]: { session: '0', strategy: 'compress', daysOff: [], noGaps: false },
    [STORAGE_KEYS.SCHEDULE_MODE]: isGroupGuide ? 'group' : 'personal',
    [STORAGE_KEYS.SCHEDULE_BUILDER_DRAFT]: { selections: [], conflicts: [] },
    [STORAGE_KEYS.GROUP_SCHEDULER_MEMBERS]: createDemoMembers(),
    [STORAGE_KEYS.GROUP_SCHEDULER_CLASS_PREFERENCES]: {},
    [STORAGE_KEYS.GROUP_SCHEDULER_COURSE_SHARING]: {
      CSC10009: { mode: 'required' },
    },
    [STORAGE_KEYS.GROUP_SCHEDULE_UI_STATE]: {
      activeStep: initialGroupStep,
      resultViewMode: 'course',
      isAdvancedOpen: false,
      showMembersPanel: true,
      showGroupCalendarPreview: false,
    },
    [STORAGE_KEYS.GROUP_SCHEDULE_LAST_RESULT]: null,
    [STORAGE_KEYS.ACTIVE_GROUP_SCHEDULE]: null,
    [STORAGE_KEYS.SAVED_SCHEDULES]: [],
  };
}

export function canUseGuideDemo(guideId: UserGuideId): boolean {
  return guideId !== 'import-rollback';
}
