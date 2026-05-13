import pako from 'pako';

import CourseDatabase from './CourseDatabase';
import { FitnessEvaluator } from './FitnessValuator';
import { Bitset } from './Bitset';
import type {
  CourseWeight,
  GroupFitnessConfig,
  GroupMemberToken,
  GroupScheduleItem,
  GroupScheduleOption,
  GroupScheduleRunResult,
  GroupSolution,
  StateMatrix,
} from './GroupTypes';

const GROUP_URL_PREFIX = 'v1_';
const MASK_PARTS = 10;
const memberAssignmentKey = (courseId: string, memberIndex: number) => `${courseId}__member_${memberIndex}`;

type ClassLike = {
  id: string;
  mask?: number[];
  scheduleMask?: Bitset;
  schedule?: string | string[];
};

type CourseLike = {
  id: string;
  name?: string;
  classes: ClassLike[];
};

export class GroupURLDecodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GroupURLDecodeError';
  }
}

function normalizeCourseId(courseId: string): string {
  return courseId.trim().toUpperCase();
}

function uniqueCourseIds(courseIds: string[]): string[] {
  return Array.from(new Set(courseIds.map(normalizeCourseId).filter(Boolean)));
}

function normalizeMask(mask?: number[], partCount = MASK_PARTS): number[] {
  const normalized = new Array(partCount).fill(0);
  if (!Array.isArray(mask)) return normalized;
  for (let i = 0; i < Math.min(partCount, mask.length); i++) {
    normalized[i] = mask[i] | 0;
  }
  return normalized;
}

function getClassMask(cls: ClassLike): number[] {
  if (Array.isArray(cls.mask)) return normalizeMask(cls.mask);
  if (cls.scheduleMask?.parts) return normalizeMask(cls.scheduleMask.parts);
  return normalizeMask();
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function getCourse(db: CourseDatabase, courseId: string): CourseLike | null {
  return db.getCourse(courseId) as CourseLike | null;
}

function getClasses(db: CourseDatabase, courseId: string): ClassLike[] {
  return getCourse(db, courseId)?.classes ?? [];
}

function memberCourseSet(member: GroupMemberToken): Set<string> {
  return new Set([...uniqueCourseIds(member.sharedCourses), ...uniqueCourseIds(member.personalCourses)]);
}

function getPreferenceHits(courseId: string, classId: string, subscribers: number[], members: GroupMemberToken[]): number {
  return subscribers.reduce((hits, memberIndex) => {
    const preferred = members[memberIndex]?.preferredClasses?.[courseId];
    return preferred?.includes(classId) ? hits + 1 : hits;
  }, 0);
}

function buildMemberSubjects(solution: GroupSolution, db: CourseDatabase, courses: CourseWeight[], memberIndex: number, scope: 'all' | 'shared' | 'personal' = 'all') {
  return courses
    .filter((course) => {
      if (!course.subscribers.includes(memberIndex)) return false;
      if (scope === 'shared') return course.isShared;
      if (scope === 'personal') return !course.isShared;
      return true;
    })
    .map((course) => {
      const selectedClassId = solution.assignments.get(course.courseId) ?? solution.assignments.get(memberAssignmentKey(course.courseId, memberIndex));
      const courseData = getCourse(db, course.courseId);
      const classObj = courseData?.classes.find((cls) => cls.id === selectedClassId);
      if (!courseData || !classObj) return null;
      return {
        id: course.courseId,
        classes: [classObj],
      };
    })
    .filter((subject): subject is { id: string; classes: ClassLike[] } => Boolean(subject));
}

function scoreMemberSchedule(
  solution: GroupSolution,
  db: CourseDatabase,
  courses: CourseWeight[],
  memberIndex: number,
  config: GroupFitnessConfig,
  scope: 'all' | 'shared' | 'personal' = 'all',
): number {
  const subjects = buildMemberSubjects(solution, db, courses, memberIndex, scope);
  if (subjects.length === 0) return 0;

  const evaluator = new FitnessEvaluator({
    session: config.session || '0',
    strategy: config.strategy || 'compress',
    noGaps: config.noGaps ?? false,
    daysOff: config.daysOff || [],
  });
  const chromosome = { genes: subjects.map(() => 0) };
  return evaluator.getFitness(chromosome, subjects);
}

export function sanitizeGroupMember(member: GroupMemberToken): GroupMemberToken {
  const sharedCourses = uniqueCourseIds(member.sharedCourses);
  const personalCourses = uniqueCourseIds(member.personalCourses).filter((courseId) => !sharedCourses.includes(courseId));
  const preferredClasses = Object.fromEntries(
    Object.entries(member.preferredClasses ?? {})
      .map(([courseId, classIds]) => [normalizeCourseId(courseId), Array.from(new Set(classIds.map((classId) => String(classId).trim()).filter(Boolean)))])
      .filter(([, classIds]) => classIds.length > 0),
  );

  return {
    nickname: member.nickname?.trim() || undefined,
    sharedCourses,
    personalCourses,
    busyMask: normalizeMask(member.busyMask),
    preferredClasses,
    personalConfig: member.personalConfig,
  };
}

export function encodeGroupURL(members: GroupMemberToken[]): string {
  const sanitized = members.map(sanitizeGroupMember);
  const json = JSON.stringify(sanitized);
  const compressed = pako.deflate(json);
  const b64 = toBase64Url(compressed);
  return `${window.location.origin}/group#${GROUP_URL_PREFIX}${b64}`;
}

export function decodeGroupURL(hash: string): GroupMemberToken[] {
  const fragment = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!fragment) return [];
  if (!fragment.startsWith(GROUP_URL_PREFIX)) {
    throw new GroupURLDecodeError('Link nhóm không đúng định dạng hoặc khác phiên bản.');
  }

  try {
    const bytes = fromBase64Url(fragment.slice(GROUP_URL_PREFIX.length));
    const json = pako.inflate(bytes, { to: 'string' });
    const parsed = JSON.parse(json) as GroupMemberToken[];
    if (!Array.isArray(parsed)) throw new Error('Payload is not an array');
    return parsed.map(sanitizeGroupMember);
  } catch (error) {
    throw new GroupURLDecodeError(error instanceof Error ? `Link nhóm bị lỗi hoặc bị cắt ngắn: ${error.message}` : 'Link nhóm bị lỗi hoặc bị cắt ngắn.');
  }
}

export function buildDensityMap(members: GroupMemberToken[]): CourseWeight[] {
  const courseSubscribers = new Map<string, Set<number>>();

  members.map(sanitizeGroupMember).forEach((member, memberIndex) => {
    memberCourseSet(member).forEach((courseId) => {
      if (!courseSubscribers.has(courseId)) courseSubscribers.set(courseId, new Set());
      courseSubscribers.get(courseId)?.add(memberIndex);
    });
  });

  return Array.from(courseSubscribers.entries())
    .map(([courseId, subscribers]) => {
      const subscriberList = Array.from(subscribers).sort((a, b) => a - b);
      return {
        courseId,
        subscribers: subscriberList,
        isShared: subscriberList.length >= 2,
      };
    })
    .sort((a, b) => {
      if (b.subscribers.length !== a.subscribers.length) return b.subscribers.length - a.subscribers.length;
      if (Number(b.isShared) !== Number(a.isShared)) return Number(b.isShared) - Number(a.isShared);
      return a.courseId.localeCompare(b.courseId);
    });
}

export function isClassValid(classMask: number[], subscribers: number[], state: StateMatrix): boolean {
  return subscribers.every((memberIndex) =>
    normalizeMask(classMask).every((mask, partIndex) => ((state[memberIndex]?.[partIndex] ?? 0) & mask) === 0),
  );
}

export function solveGroup(
  courses: CourseWeight[],
  courseDatabase: CourseDatabase,
  members: GroupMemberToken[],
  maxSolutions = 50,
  mode: 'shared-first' | 'split' = 'shared-first',
): GroupSolution[] {
  const solutions: GroupSolution[] = [];
  const initialState: StateMatrix = members.map((member) => normalizeMask(member.busyMask));

  function dfs(courseIndex: number, state: StateMatrix, assignments: Map<string, string>) {
    if (solutions.length >= maxSolutions) return;
    if (courseIndex === courses.length) {
      solutions.push({
        assignments: new Map(assignments),
        stateMatrix: state.map((memberMask) => [...memberMask]),
      });
      return;
    }

    const course = courses[courseIndex];
    const availableClasses = getClasses(courseDatabase, course.courseId)
      .sort((a, b) => getPreferenceHits(course.courseId, b.id, course.subscribers, members) - getPreferenceHits(course.courseId, a.id, course.subscribers, members));
    if (availableClasses.length === 0) return;

    if (mode === 'split' && course.subscribers.length > 1) {
      function assignSubscriber(subscriberOffset: number, workingState: StateMatrix) {
        if (solutions.length >= maxSolutions) return;
        if (subscriberOffset === course.subscribers.length) {
          dfs(courseIndex + 1, workingState, assignments);
          return;
        }

        const memberIndex = course.subscribers[subscriberOffset];
        const sortedForMember = [...availableClasses].sort((a, b) =>
          getPreferenceHits(course.courseId, b.id, [memberIndex], members) - getPreferenceHits(course.courseId, a.id, [memberIndex], members),
        );

        for (const cls of sortedForMember) {
          const classMask = getClassMask(cls);
          if (!isClassValid(classMask, [memberIndex], workingState)) continue;

          const nextState = workingState.map((memberMask, idx) => {
            if (idx !== memberIndex) return [...memberMask];
            return memberMask.map((mask, partIndex) => mask | classMask[partIndex]);
          });

          assignments.set(memberAssignmentKey(course.courseId, memberIndex), cls.id);
          assignSubscriber(subscriberOffset + 1, nextState);
          assignments.delete(memberAssignmentKey(course.courseId, memberIndex));
        }
      }

      assignSubscriber(0, state);
      return;
    }

    for (const cls of availableClasses) {
      const classMask = getClassMask(cls);
      if (!isClassValid(classMask, course.subscribers, state)) continue;

      const nextState = state.map((memberMask, memberIndex) => {
        if (!course.subscribers.includes(memberIndex)) return [...memberMask];
        return memberMask.map((mask, partIndex) => mask | classMask[partIndex]);
      });

      assignments.set(course.courseId, cls.id);
      dfs(courseIndex + 1, nextState, assignments);
      assignments.delete(course.courseId);
    }
  }

  dfs(0, initialState, new Map());
  return solutions;
}

export function scoreGroupSolution(
  solution: GroupSolution,
  courseDatabase: CourseDatabase,
  courses: CourseWeight[],
  members: GroupMemberToken[],
  config: GroupFitnessConfig,
): number {
  const memberScores = members.map((member, memberIndex) => {
    const sharedScore = scoreMemberSchedule(solution, courseDatabase, courses, memberIndex, config, 'shared');
    const personalScore = scoreMemberSchedule(solution, courseDatabase, courses, memberIndex, {
      ...config,
      ...member.personalConfig,
    }, 'personal');
    return sharedScore + personalScore;
  });
  const total = memberScores.reduce((sum, score) => sum + score, 0);
  const avg = memberScores.length > 0 ? total / memberScores.length : 0;
  const variance = memberScores.reduce((sum, score) => sum + (score - avg) ** 2, 0) / Math.max(memberScores.length, 1);
  const fairnessPenalty = config.fairnessWeight * Math.sqrt(variance);
  const sharedBonus = courses.filter((course) => course.isShared && solution.assignments.has(course.courseId)).length * config.sharedSlotBonus;
  const personalPreferenceBonus = courses.reduce((bonus, course) => {
    if (course.isShared) return bonus;
    const classId = solution.assignments.get(course.courseId) ?? solution.assignments.get(memberAssignmentKey(course.courseId, course.subscribers[0] ?? -1));
    if (!classId) return bonus;
    const satisfiedMembers = course.subscribers.filter((memberIndex) => members[memberIndex]?.preferredClasses?.[course.courseId]?.includes(classId)).length;
    return bonus + satisfiedMembers * config.personalPreferenceWeight;
  }, 0);
  const groupPreferenceBonus = courses.reduce((bonus, course) => {
    const preferred = config.groupPreferredClasses?.[course.courseId];
    if (!preferred?.length) return bonus;
    const globalClassId = solution.assignments.get(course.courseId);
    if (globalClassId) return preferred.includes(globalClassId) ? bonus + config.groupPreferenceWeight * Math.max(course.subscribers.length, 1) : bonus;
    const satisfied = course.subscribers.filter((memberIndex) => {
      const memberClassId = solution.assignments.get(memberAssignmentKey(course.courseId, memberIndex));
      return memberClassId ? preferred.includes(memberClassId) : false;
    }).length;
    return bonus + satisfied * config.groupPreferenceWeight;
  }, 0);

  return total - fairnessPenalty + sharedBonus + personalPreferenceBonus + groupPreferenceBonus;
}

function toScheduleOption(
  solution: GroupSolution,
  optionIndex: number,
  fitness: number,
  courseDatabase: CourseDatabase,
  courses: CourseWeight[],
  members: GroupMemberToken[],
): GroupScheduleOption {
  const itemsByMember = members.map<GroupScheduleItem[]>((() => []));
  const assignmentRecord: Record<string, string> = {};

  courses.forEach((course) => {
    const courseData = getCourse(courseDatabase, course.courseId);
    if (!courseData) return;

    const globalClassId = solution.assignments.get(course.courseId);
    if (globalClassId) {
      assignmentRecord[course.courseId] = globalClassId;
      const classObj = courseData.classes.find((cls) => cls.id === globalClassId);
      if (!classObj) return;

      const item: GroupScheduleItem = {
        courseId: course.courseId,
        courseName: courseData.name || course.courseId,
        classId: globalClassId,
        memberIndexes: [...course.subscribers],
        isShared: course.isShared,
        mask: getClassMask(classObj),
        schedule: classObj.schedule,
      };

      course.subscribers.forEach((memberIndex) => {
        itemsByMember[memberIndex].push(item);
      });
      return;
    }

    course.subscribers.forEach((memberIndex) => {
      const classId = solution.assignments.get(memberAssignmentKey(course.courseId, memberIndex));
      if (!classId) return;
      assignmentRecord[memberAssignmentKey(course.courseId, memberIndex)] = classId;
      const classObj = courseData.classes.find((cls) => cls.id === classId);
      if (!classObj) return;
      itemsByMember[memberIndex].push({
        courseId: course.courseId,
        courseName: courseData.name || course.courseId,
        classId,
        memberIndexes: [memberIndex],
        isShared: false,
        mask: getClassMask(classObj),
        schedule: classObj.schedule,
      });
    });
  });

  return {
    option: optionIndex + 1,
    fitness,
    assignments: assignmentRecord,
    schedules: members.map((member, memberIndex) => ({
      memberIndex,
      nickname: member.nickname || `Thành viên ${memberIndex + 1}`,
      items: itemsByMember[memberIndex],
    })),
  };
}

export function runGroupScheduleSolver(
  dbData: unknown,
  members: GroupMemberToken[],
  config: Partial<GroupFitnessConfig> = {},
  maxSolutions = 50,
): GroupScheduleRunResult {
  const sanitizedMembers = members.map(sanitizeGroupMember).filter((member) => member.sharedCourses.length + member.personalCourses.length > 0);
  const warnings: string[] = [];
  const courseDatabase = new CourseDatabase();
  courseDatabase.loadData(typeof dbData === 'string' ? JSON.parse(dbData) : dbData);

  const density = buildDensityMap(sanitizedMembers).filter((course) => {
    const exists = getClasses(courseDatabase, course.courseId).length > 0;
    if (!exists) warnings.push(`Không tìm thấy lớp học cho môn ${course.courseId}.`);
    return exists;
  });

  if (sanitizedMembers.length === 0 || density.length === 0) {
    return { density, solutions: [], warnings };
  }

  let solutions = solveGroup(density, courseDatabase, sanitizedMembers, maxSolutions, 'shared-first');
  if (solutions.length === 0) {
    warnings.push('Không có nghiệm khi bắt buộc các môn trùng nhau học cùng lớp. Đang dùng phương án dự phòng: cho phép tách lớp nếu cần.');
    solutions = solveGroup(density, courseDatabase, sanitizedMembers, maxSolutions, 'split');
  }
  const fitnessConfig: GroupFitnessConfig = {
    daysOff: config.daysOff ?? [],
    session: config.session ?? '0',
    strategy: config.strategy ?? 'compress',
    noGaps: config.noGaps ?? false,
    fairnessWeight: config.fairnessWeight ?? 0.35,
    sharedSlotBonus: config.sharedSlotBonus ?? 12,
    personalPreferenceWeight: config.personalPreferenceWeight ?? 8,
    groupPreferenceWeight: config.groupPreferenceWeight ?? 12,
    groupPreferredClasses: config.groupPreferredClasses ?? {},
  };

  const ranked = solutions
    .map((solution) => ({
      solution,
      fitness: scoreGroupSolution(solution, courseDatabase, density, sanitizedMembers, fitnessConfig),
    }))
    .sort((a, b) => b.fitness - a.fitness)
    .slice(0, 3)
    .map(({ solution, fitness }, optionIndex) => toScheduleOption(solution, optionIndex, fitness, courseDatabase, density, sanitizedMembers));

  return {
    density,
    solutions: ranked,
    warnings,
  };
}

export function isDuplicateMember(member: GroupMemberToken, members: GroupMemberToken[]): boolean {
  const current = sanitizeGroupMember(member);
    const currentKey = JSON.stringify({
    sharedCourses: [...current.sharedCourses].sort(),
    personalCourses: [...current.personalCourses].sort(),
    busyMask: current.busyMask,
    preferredClasses: current.preferredClasses ?? {},
  });

  return members.some((existing) => {
    const sanitized = sanitizeGroupMember(existing);
    return JSON.stringify({
      sharedCourses: [...sanitized.sharedCourses].sort(),
      personalCourses: [...sanitized.personalCourses].sort(),
      busyMask: sanitized.busyMask,
      preferredClasses: sanitized.preferredClasses ?? {},
    }) === currentKey;
  });
}
