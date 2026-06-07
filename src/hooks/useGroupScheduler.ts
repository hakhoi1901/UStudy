import { useCallback, useMemo, useState } from 'react';

import { STORAGE_KEYS } from '../config';
import { readFromStorage } from '../helpers/localStorage/save';
import {
  decodeGroupURL,
  encodeGroupURL,
  GroupURLDecodeError,
  isDuplicateMember,
  runGroupScheduleSolver,
  sanitizeGroupMember,
} from '../logic/scheduler/GroupScheduler';
import type { GroupFitnessConfig, GroupMemberToken, GroupScheduleOption, GroupScheduleRunResult } from '../logic/scheduler/GroupTypes';
import courseDbJson from '../logic/scheduler/Course_db.json';

export interface CourseChoice {
  id: string;
  name: string;
}

export interface GroupSolverState {
  members: GroupMemberToken[];
  shareUrl: string;
  urlWarning: string | null;
  decodeError: string | null;
  solving: boolean;
  result: GroupScheduleRunResult | null;
  solveError: string | null;
  availableCourses: CourseChoice[];
}

function getBrowserHash(): string {
  if (typeof window === 'undefined') return '';
  return window.location.hash;
}

function getCourseId(course: any): string {
  return String(course?.id || course?.course_id || course?.code || '').trim().toUpperCase();
}

function getCourseName(course: any): string {
  return String(course?.name || course?.nameVi || course?.course_name || getCourseId(course));
}

function loadCourseDb(): any[] {
  const stored = readFromStorage<any[]>(STORAGE_KEYS.COURSE_DB_OFFLINE, []);
  return stored && stored.length > 0 ? stored : (courseDbJson as any[]);
}

export function parseCourseInput(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(/[\s,;]+/)
        .map((item) => item.trim().toUpperCase())
        .filter(Boolean),
    ),
  );
}

export function useGroupScheduler(): GroupSolverState & {
  setMembersFromURL: (hash?: string) => void;
  addMember: (member: GroupMemberToken) => boolean;
  replaceMembers: (members: GroupMemberToken[]) => void;
  solve: (config?: Partial<GroupFitnessConfig>) => void;
  clearResult: () => void;
  getOptionRegistrations: (option: GroupScheduleOption, memberIndex?: number) => any[];
} {
  const [members, setMembers] = useState<GroupMemberToken[]>(() => {
    try {
      return decodeGroupURL(getBrowserHash());
    } catch {
      return [];
    }
  });
  const [decodeError, setDecodeError] = useState<string | null>(() => {
    try {
      decodeGroupURL(getBrowserHash());
      return null;
    } catch (error) {
      return error instanceof GroupURLDecodeError ? error.message : 'Link nhóm không hợp lệ.';
    }
  });
  const [solving, setSolving] = useState(false);
  const [result, setResult] = useState<GroupScheduleRunResult | null>(null);
  const [solveError, setSolveError] = useState<string | null>(null);

  const dbData = useMemo(() => loadCourseDb(), []);
  const availableCourses = useMemo<CourseChoice[]>(() => {
    return dbData
      .map((course) => ({ id: getCourseId(course), name: getCourseName(course) }))
      .filter((course) => course.id)
      .sort((a, b) => a.id.localeCompare(b.id));
  }, [dbData]);

  const shareUrl = useMemo(() => (members.length > 0 ? encodeGroupURL(members) : ''), [members]);
  const urlWarning = shareUrl.length > 2000 ? 'Link nhóm đang dài hơn 2000 ký tự. Một số app chat có thể cắt link; hãy giảm số môn hoặc gửi link bằng cách copy trực tiếp.' : null;

  const updateBrowserUrl = useCallback((nextMembers: GroupMemberToken[]) => {
    if (typeof window === 'undefined' || nextMembers.length === 0) return;
    const nextUrl = encodeGroupURL(nextMembers);
    window.history.replaceState(null, '', nextUrl);
  }, []);

  const setMembersFromURL = useCallback((hash = getBrowserHash()) => {
    try {
      const decoded = decodeGroupURL(hash);
      setMembers(decoded);
      setDecodeError(null);
      setResult(null);
    } catch (error) {
      setDecodeError(error instanceof GroupURLDecodeError ? error.message : 'Link nhóm không hợp lệ.');
      setMembers([]);
    }
  }, []);

  const replaceMembers = useCallback((nextMembers: GroupMemberToken[]) => {
    const sanitized = nextMembers.map(sanitizeGroupMember).filter((member) => member.sharedCourses.length + member.personalCourses.length > 0);
    setMembers(sanitized);
    setResult(null);
    updateBrowserUrl(sanitized);
  }, [updateBrowserUrl]);

  const addMember = useCallback((member: GroupMemberToken) => {
    const sanitized = sanitizeGroupMember(member);
    if (sanitized.sharedCourses.length + sanitized.personalCourses.length === 0) {
      setSolveError('Bạn cần nhập ít nhất một môn chung hoặc môn cá nhân.');
      return false;
    }
    if (isDuplicateMember(sanitized, members)) {
      setSolveError('Có vẻ bạn đã tham gia nhóm này rồi. Kiểm tra lại danh sách môn trước khi thêm tiếp.');
      return false;
    }

    const nextMembers = [...members, sanitized];
    setMembers(nextMembers);
    setResult(null);
    setSolveError(null);
    updateBrowserUrl(nextMembers);
    return true;
  }, [members, updateBrowserUrl]);

  const solve = useCallback((config: Partial<GroupFitnessConfig> = {}) => {
    setSolving(true);
    setSolveError(null);
    setResult(null);

    window.setTimeout(() => {
      try {
        if (members.length < 2) {
          setSolveError('Cần ít nhất 2 thành viên để xếp lịch nhóm.');
          return;
        }
        if (dbData.length === 0) {
          setSolveError('Chưa có dữ liệu lớp học offline. Hãy import dữ liệu Portal trước khi xếp lịch nhóm.');
          return;
        }

        const nextResult = runGroupScheduleSolver(dbData, members, config);
        if (nextResult.solutions.length === 0) {
          const hintedCourse = nextResult.density[0]?.courseId;
          setSolveError(`Không thể xếp lịch chung cho tất cả môn đã chọn.${hintedCourse ? ` Thử bỏ bớt môn ${hintedCourse} hoặc kiểm tra lại lớp của môn này.` : ' Thử giảm số môn chung hoặc kiểm tra lại dữ liệu lớp học.'}`);
        }
        setResult(nextResult);
      } catch (error) {
        setSolveError(error instanceof Error ? error.message : 'Có lỗi khi xếp lịch nhóm.');
      } finally {
        setSolving(false);
      }
    }, 50);
  }, [dbData, members]);

  const clearResult = useCallback(() => {
    setResult(null);
    setSolveError(null);
  }, []);

  const getOptionRegistrations = useCallback((option: GroupScheduleOption, memberIndex = 0) => {
    const memberSchedule = option.schedules.find((schedule) => schedule.memberIndex === memberIndex);
    return (memberSchedule?.items ?? []).map((item) => ({
      id: item.courseId,
      name: item.courseName,
      classGroup: item.classId,
      courseType: 'LT',
      schedule: Array.isArray(item.schedule) ? item.schedule.join(', ') : item.schedule || '',
      instructor: '',
      startWeek: '',
    }));
  }, []);

  return {
    members,
    shareUrl,
    urlWarning,
    decodeError,
    solving,
    result,
    solveError,
    availableCourses,
    setMembersFromURL,
    addMember,
    replaceMembers,
    solve,
    clearResult,
    getOptionRegistrations,
  };
}
