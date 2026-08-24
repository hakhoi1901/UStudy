import { useCallback, useEffect, useMemo, useState } from 'react';

import { STORAGE_KEYS } from '../../../config';
import { readFromStorage, saveToStorage } from '../../../helpers/localStorage/save';
import {
  decodeGroupPayload,
  decodeGroupURL,
  encodeGroupURL,
  GroupURLDecodeError,
  analyzeGroupScheduleTradeoff,
  isDuplicateMember,
  runGroupScheduleSolver,
  sanitizeGroupMember,
  validateGroupScheduleConfiguration,
} from '../services/group-scheduler';
import type { GroupConfigurationIssue, GroupFitnessConfig, GroupMemberToken, GroupScheduleOption, GroupScheduleRunResult, GroupScheduleTradeoff, GroupShareConfig, GroupSharePayload } from '../types';
import courseDbJson from '../../../logic/scheduler/Course_db.json';

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
  validationIssues: GroupConfigurationIssue[];
  importedShareConfig?: GroupShareConfig;
}

interface PersistedGroupScheduleResult {
  version: 1;
  updatedAt: string;
  memberSignature: string;
  result: GroupScheduleRunResult;
}

function getMemberSignature(members: GroupMemberToken[]): string {
  return JSON.stringify(members);
}

function loadLastGroupScheduleResult(members: GroupMemberToken[]): GroupScheduleRunResult | null {
  const stored = readFromStorage<PersistedGroupScheduleResult | null>(
    STORAGE_KEYS.GROUP_SCHEDULE_LAST_RESULT,
    null,
  );

  if (
    stored?.version !== 1
    || stored.memberSignature !== getMemberSignature(members)
    || !Array.isArray(stored.result?.solutions)
  ) return null;
  return stored.result;
}

function getBrowserHash(): string {
  if (typeof window === 'undefined') return '';
  return window.location.hash;
}

function getInitialPayload(): GroupSharePayload {
  try {
    return decodeGroupPayload(getBrowserHash());
  } catch {
    return { members: [] };
  }
}

function getCourseId(course: any): string {
  return String(course?.id || course?.course_id || course?.code || '').trim().toUpperCase();
}

function getCourseName(course: any): string {
  return String(course?.name || course?.nameVi || course?.course_name || getCourseId(course));
}

function loadCourseDb(): any[] {
  const stored = readFromStorage<any[]>(STORAGE_KEYS.COURSE_DB_OFFLINE, []);
  const mergedMap = new Map<string, any>();
  (courseDbJson as any[]).forEach(item => mergedMap.set(item.id, item));
  if (stored && Array.isArray(stored)) {
    stored.forEach(item => {
      const existing = mergedMap.get(item.id);
      if (existing && (!item.classes || item.classes.length === 0) && existing.classes && existing.classes.length > 0) {
        item.classes = existing.classes;
      }
      mergedMap.set(item.id, item);
    });
  }
  return Array.from(mergedMap.values());
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
  validateConfiguration: (config?: Partial<GroupFitnessConfig>) => GroupConfigurationIssue[];
  setShareConfig: (config: GroupShareConfig) => void;
  analyzeTradeoff: (option: GroupScheduleOption, tradeoff: GroupScheduleTradeoff, config?: Partial<GroupFitnessConfig>) => Promise<GroupScheduleTradeoff>;
  clearResult: () => void;
  setResult: (result: GroupScheduleRunResult | null) => void;
  getOptionRegistrations: (option: GroupScheduleOption, memberIndex?: number) => any[];
} {
  const initialPayload = useMemo(getInitialPayload, []);
  const [members, setMembers] = useState<GroupMemberToken[]>(() => {
    if (initialPayload.members.length > 0) return initialPayload.members;
    return readFromStorage<GroupMemberToken[]>(STORAGE_KEYS.GROUP_SCHEDULER_MEMBERS, []);
  });
  const [shareConfig, setShareConfigState] = useState<GroupShareConfig>(initialPayload.config ?? {});
  const [importedShareConfig, setImportedShareConfig] = useState<GroupShareConfig | undefined>(initialPayload.config);
  const [decodeError, setDecodeError] = useState<string | null>(() => {
    const hash = getBrowserHash();
    if (!hash || hash === '#') return null;
    try {
      decodeGroupURL(hash);
      return null;
    } catch (error) {
      return error instanceof GroupURLDecodeError ? error.message : 'Link nhóm không hợp lệ.';
    }
  });

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.GROUP_SCHEDULER_MEMBERS, members);
  }, [members]);
  const [solving, setSolving] = useState(false);
  const [result, setResult] = useState<GroupScheduleRunResult | null>(() => loadLastGroupScheduleResult(members));
  const [solveError, setSolveError] = useState<string | null>(null);
  const [validationIssues, setValidationIssues] = useState<GroupConfigurationIssue[]>([]);

  const dbData = useMemo(() => loadCourseDb(), []);
  const availableCourses = useMemo<CourseChoice[]>(() => {
    return dbData
      .map((course) => ({ id: getCourseId(course), name: getCourseName(course) }))
      .filter((course) => course.id)
      .sort((a, b) => a.id.localeCompare(b.id));
  }, [dbData]);

  const shareUrl = useMemo(() => (members.length > 0 ? encodeGroupURL(members, shareConfig) : ''), [members, shareConfig]);
  const urlWarning = shareUrl.length > 2000 ? 'Link nhóm đang dài hơn 2000 ký tự. Một số app chat có thể cắt link; hãy giảm số môn hoặc gửi link bằng cách copy trực tiếp.' : null;

  const updateBrowserUrl = useCallback((nextMembers: GroupMemberToken[], nextConfig: GroupShareConfig) => {
    if (typeof window === 'undefined' || nextMembers.length === 0) return;
    const nextUrl = encodeGroupURL(nextMembers, nextConfig);
    window.history.replaceState(null, '', nextUrl);
  }, []);

  const setShareConfig = useCallback((nextConfig: GroupShareConfig) => {
    setShareConfigState(nextConfig);
    updateBrowserUrl(members, nextConfig);
  }, [members, updateBrowserUrl]);

  const setMembersFromURL = useCallback((hash = getBrowserHash()) => {
    try {
      const decoded = decodeGroupPayload(hash);
      setMembers(decoded.members);
      setShareConfigState(decoded.config ?? {});
      setImportedShareConfig(decoded.config);
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
    updateBrowserUrl(sanitized, shareConfig);
  }, [shareConfig, updateBrowserUrl]);

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
    updateBrowserUrl(nextMembers, shareConfig);
    return true;
  }, [members, shareConfig, updateBrowserUrl]);

  const validateConfiguration = useCallback((config: Partial<GroupFitnessConfig> = {}) => {
    const issues = validateGroupScheduleConfiguration(dbData, members, config);
    setValidationIssues(issues);
    return issues;
  }, [dbData, members]);

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

        const issues = validateGroupScheduleConfiguration(dbData, members, config);
        setValidationIssues(issues);
        const blockingIssue = issues.find((issue) => issue.severity === 'error');
        if (blockingIssue) {
          setSolveError(blockingIssue.description);
          return;
        }

        const nextResult = runGroupScheduleSolver(dbData, members, config);
        if (nextResult.solutions.length === 0) {
          const hintedCourse = nextResult.density[0]?.courseId;
          setSolveError(`Không thể xếp lịch chung cho tất cả môn đã chọn.${hintedCourse ? ` Thử bỏ bớt môn ${hintedCourse} hoặc kiểm tra lại lớp của môn này.` : ' Thử giảm số môn chung hoặc kiểm tra lại dữ liệu lớp học.'}`);
        } else {
          saveToStorage<PersistedGroupScheduleResult>(STORAGE_KEYS.GROUP_SCHEDULE_LAST_RESULT, {
            version: 1,
            updatedAt: new Date().toISOString(),
            memberSignature: getMemberSignature(members),
            result: nextResult,
          });
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

  const analyzeTradeoff = useCallback((option: GroupScheduleOption, tradeoff: GroupScheduleTradeoff, config: Partial<GroupFitnessConfig> = {}) => {
    return new Promise<GroupScheduleTradeoff>((resolve) => {
      window.setTimeout(() => {
        const analyzed = analyzeGroupScheduleTradeoff(dbData, members, config, tradeoff);
        setResult((current) => {
          if (!current) return current;
          const solutions = current.solutions.map((candidate) => {
            if (candidate.option !== option.option) return candidate;
            return {
              ...candidate,
              tradeoffs: (candidate.tradeoffs ?? []).map((candidateTradeoff) => (
                candidateTradeoff.id === analyzed.id ? analyzed : candidateTradeoff
              )),
            };
          });
          return { ...current, solutions };
        });
        resolve(analyzed);
      }, 0);
    });
  }, [dbData, members]);

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
    validationIssues,
    importedShareConfig,
    setMembersFromURL,
    addMember,
    replaceMembers,
    solve,
    validateConfiguration,
    setShareConfig,
    analyzeTradeoff,
    clearResult,
    setResult,
    getOptionRegistrations,
  };
}
