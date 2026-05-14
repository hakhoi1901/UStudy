import pako from 'pako';

import CourseDatabase from './CourseDatabase';
import { FitnessEvaluator } from './FitnessValuator';
import { Bitset } from './Bitset';
import { GROUP_SCHEDULER_CONFIG, GROUP_SCHEDULER_WEIGHTS } from './Constants';
import type {
  ClassPreferenceMap,
  ClassPreferenceSelection,
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
type PreferenceConstraintMode = 'strict' | 'relaxed';

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

function normalizePreferenceSelection(value: string[] | ClassPreferenceSelection | undefined): Required<ClassPreferenceSelection> {
  if (Array.isArray(value)) {
    return {
      excluded: [],
      preferred: Array.from(new Set(value.map((classId) => String(classId).trim()).filter(Boolean))),
      required: [],
    };
  }

  return {
    excluded: Array.from(new Set((value?.excluded ?? []).map((classId) => String(classId).trim()).filter(Boolean))),
    preferred: Array.from(new Set((value?.preferred ?? []).map((classId) => String(classId).trim()).filter(Boolean))),
    required: Array.from(new Set((value?.required ?? []).map((classId) => String(classId).trim()).filter(Boolean))),
  };
}

function normalizePreferenceMap(map?: ClassPreferenceMap): Record<string, Required<ClassPreferenceSelection>> {
  return Object.fromEntries(
    Object.entries(map ?? {})
      .map(([courseId, selection]) => [normalizeCourseId(courseId), normalizePreferenceSelection(selection)])
      .filter(([, selection]) => selection.excluded.length > 0 || selection.preferred.length > 0 || selection.required.length > 0),
  );
}

function classPreferenceLevel(selection: Required<ClassPreferenceSelection> | undefined, classId: string): 'excluded' | 'required' | 'preferred' | null {
  if (selection?.excluded.includes(classId)) return 'excluded';
  if (selection?.required.includes(classId)) return 'required';
  if (selection?.preferred.includes(classId)) return 'preferred';
  return null;
}

function getPreferenceHits(courseId: string, classId: string, subscribers: number[], members: GroupMemberToken[], config?: Pick<GroupFitnessConfig, 'groupPreferredClasses'>): number {
  const groupSelection = normalizePreferenceSelection(config?.groupPreferredClasses?.[courseId]);
  const groupLevel = classPreferenceLevel(groupSelection, classId);
  const groupHits =
    groupLevel === 'excluded'
      ? -GROUP_SCHEDULER_WEIGHTS.CLASS_ORDER_GROUP_EXCLUDED * Math.max(subscribers.length, 1)
      : groupLevel === 'required'
      ? GROUP_SCHEDULER_WEIGHTS.CLASS_ORDER_GROUP_REQUIRED * Math.max(subscribers.length, 1)
      : groupLevel === 'preferred'
        ? GROUP_SCHEDULER_WEIGHTS.CLASS_ORDER_GROUP_PREFERRED * Math.max(subscribers.length, 1)
        : 0;

  return subscribers.reduce((hits, memberIndex) => {
    const memberSelection = normalizePreferenceSelection(members[memberIndex]?.preferredClasses?.[courseId]);
    const memberLevel = classPreferenceLevel(memberSelection, classId);
    if (memberLevel === 'excluded') return hits - GROUP_SCHEDULER_WEIGHTS.CLASS_ORDER_PERSONAL_EXCLUDED;
    if (memberLevel === 'required') return hits + GROUP_SCHEDULER_WEIGHTS.CLASS_ORDER_PERSONAL_REQUIRED;
    if (memberLevel === 'preferred') return hits + GROUP_SCHEDULER_WEIGHTS.CLASS_ORDER_PERSONAL_PREFERRED;
    return hits;
  }, groupHits);
}

function classMatchesPreferenceConstraints(
  courseId: string,
  classId: string,
  subscribers: number[],
  members: GroupMemberToken[],
  config: Pick<GroupFitnessConfig, 'groupPreferredClasses'>,
  preferenceMode: PreferenceConstraintMode,
): boolean {
  if (preferenceMode === 'relaxed') return true;

  const groupSelection = normalizePreferenceSelection(config.groupPreferredClasses?.[courseId]);
  if (groupSelection.excluded.includes(classId)) return false;
  if (groupSelection.required.length > 0 && !groupSelection.required.includes(classId)) return false;

  return subscribers.every((memberIndex) => {
    const personalSelection = normalizePreferenceSelection(members[memberIndex]?.preferredClasses?.[courseId]);
    if (personalSelection.excluded.includes(classId)) return false;
    return personalSelection.required.length === 0 || personalSelection.required.includes(classId);
  });
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
  const preferredClasses = normalizePreferenceMap(member.preferredClasses);

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
  maxSolutions = GROUP_SCHEDULER_CONFIG.DEFAULT_MAX_SOLUTIONS,
  mode: 'shared-first' | 'split' = 'shared-first',
  config: Pick<GroupFitnessConfig, 'groupPreferredClasses'> = {},
  preferenceMode: PreferenceConstraintMode = 'relaxed',
  searchBudget = GROUP_SCHEDULER_CONFIG.SEARCH_NODE_BUDGET,
): GroupSolution[] {
  const solutions: GroupSolution[] = [];
  const initialState: StateMatrix = members.map((member) => normalizeMask(member.busyMask));
  let visitedNodes = 0;

  function dfs(courseIndex: number, state: StateMatrix, assignments: Map<string, string>) {
    if (solutions.length >= maxSolutions) return;
    if (visitedNodes++ >= searchBudget) return;
    if (courseIndex === courses.length) {
      solutions.push({
        assignments: new Map(assignments),
        stateMatrix: state.map((memberMask) => [...memberMask]),
      });
      return;
    }

    const course = courses[courseIndex];
    const availableClasses = getClasses(courseDatabase, course.courseId)
      .sort((a, b) => getPreferenceHits(course.courseId, b.id, course.subscribers, members, config) - getPreferenceHits(course.courseId, a.id, course.subscribers, members, config))
      .slice(0, preferenceMode === 'relaxed' ? GROUP_SCHEDULER_CONFIG.RELAXED_CLASS_CANDIDATE_LIMIT : undefined);
    if (availableClasses.length === 0) return;

    if (mode === 'split' && course.subscribers.length > 1) {
      function assignSubscriber(subscriberOffset: number, workingState: StateMatrix) {
        if (solutions.length >= maxSolutions) return;
        if (visitedNodes++ >= searchBudget) return;
        if (subscriberOffset === course.subscribers.length) {
          dfs(courseIndex + 1, workingState, assignments);
          return;
        }

        const memberIndex = course.subscribers[subscriberOffset];
        const sortedForMember = [...availableClasses].sort((a, b) =>
          getPreferenceHits(course.courseId, b.id, [memberIndex], members, config) - getPreferenceHits(course.courseId, a.id, [memberIndex], members, config),
        ).slice(0, preferenceMode === 'relaxed' ? GROUP_SCHEDULER_CONFIG.RELAXED_CLASS_CANDIDATE_LIMIT : undefined);

        for (const cls of sortedForMember) {
          const classMask = getClassMask(cls);
          if (!classMatchesPreferenceConstraints(course.courseId, cls.id, [memberIndex], members, config, preferenceMode)) continue;
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
      if (!classMatchesPreferenceConstraints(course.courseId, cls.id, course.subscribers, members, config, preferenceMode)) continue;
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
  const preferenceScore = courses.reduce((score, course) => {
    const groupSelection = normalizePreferenceSelection(config.groupPreferredClasses?.[course.courseId]);
    const globalClassId = solution.assignments.get(course.courseId);

    const scoreClass = (classId: string, memberIndex: number) => {
      let nextScore = 0;
      const groupLevel = classPreferenceLevel(groupSelection, classId);
      if (groupLevel === 'excluded') nextScore -= config.groupExcludedPreferenceMissPenalty;
      if (groupLevel === 'required') nextScore += config.groupRequiredPreferenceWeight;
      if (groupLevel === 'preferred') nextScore += config.groupPreferenceWeight;
      if (groupSelection.required.length > 0 && !groupSelection.required.includes(classId)) nextScore -= config.groupRequiredPreferenceMissPenalty;
      if (groupSelection.preferred.length > 0 && !groupSelection.preferred.includes(classId)) nextScore -= config.groupPreferenceMissPenalty;

      const personalSelection = normalizePreferenceSelection(members[memberIndex]?.preferredClasses?.[course.courseId]);
      const personalLevel = classPreferenceLevel(personalSelection, classId);
      if (personalLevel === 'excluded') nextScore -= config.personalExcludedPreferenceMissPenalty;
      if (personalLevel === 'required') nextScore += config.personalRequiredPreferenceWeight;
      if (personalLevel === 'preferred') nextScore += config.personalPreferenceWeight;
      if (personalSelection.required.length > 0 && !personalSelection.required.includes(classId)) nextScore -= config.personalRequiredPreferenceMissPenalty;
      if (personalSelection.preferred.length > 0 && !personalSelection.preferred.includes(classId)) nextScore -= config.personalPreferenceMissPenalty;

      return nextScore;
    };

    if (globalClassId) {
      return score + course.subscribers.reduce((sum, memberIndex) => sum + scoreClass(globalClassId, memberIndex), 0);
    }

    return score + course.subscribers.reduce((sum, memberIndex) => {
      const memberClassId = solution.assignments.get(memberAssignmentKey(course.courseId, memberIndex));
      return memberClassId ? sum + scoreClass(memberClassId, memberIndex) : sum;
    }, 0);
  }, 0);

  return total - fairnessPenalty + sharedBonus + preferenceScore;
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
  maxSolutions = GROUP_SCHEDULER_CONFIG.DEFAULT_MAX_SOLUTIONS,
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

  let solutions: GroupSolution[] = [];
  const fitnessConfig: GroupFitnessConfig = {
    daysOff: config.daysOff ?? [],
    session: config.session ?? '0',
    strategy: config.strategy ?? 'compress',
    noGaps: config.noGaps ?? false,
    fairnessWeight: config.fairnessWeight ?? GROUP_SCHEDULER_WEIGHTS.FAIRNESS,
    sharedSlotBonus: config.sharedSlotBonus ?? GROUP_SCHEDULER_WEIGHTS.SHARED_SLOT_BONUS,
    personalPreferenceWeight: config.personalPreferenceWeight ?? GROUP_SCHEDULER_WEIGHTS.PERSONAL_PREFERRED_BONUS,
    groupPreferenceWeight: config.groupPreferenceWeight ?? GROUP_SCHEDULER_WEIGHTS.GROUP_PREFERRED_BONUS,
    personalPreferenceMissPenalty: config.personalPreferenceMissPenalty ?? GROUP_SCHEDULER_WEIGHTS.PERSONAL_PREFERRED_MISS_PENALTY,
    groupPreferenceMissPenalty: config.groupPreferenceMissPenalty ?? GROUP_SCHEDULER_WEIGHTS.GROUP_PREFERRED_MISS_PENALTY,
    personalRequiredPreferenceWeight: config.personalRequiredPreferenceWeight ?? GROUP_SCHEDULER_WEIGHTS.PERSONAL_REQUIRED_BONUS,
    groupRequiredPreferenceWeight: config.groupRequiredPreferenceWeight ?? GROUP_SCHEDULER_WEIGHTS.GROUP_REQUIRED_BONUS,
    personalRequiredPreferenceMissPenalty: config.personalRequiredPreferenceMissPenalty ?? GROUP_SCHEDULER_WEIGHTS.PERSONAL_REQUIRED_MISS_PENALTY,
    groupRequiredPreferenceMissPenalty: config.groupRequiredPreferenceMissPenalty ?? GROUP_SCHEDULER_WEIGHTS.GROUP_REQUIRED_MISS_PENALTY,
    personalExcludedPreferenceMissPenalty: config.personalExcludedPreferenceMissPenalty ?? GROUP_SCHEDULER_WEIGHTS.PERSONAL_EXCLUDED_MISS_PENALTY,
    groupExcludedPreferenceMissPenalty: config.groupExcludedPreferenceMissPenalty ?? GROUP_SCHEDULER_WEIGHTS.GROUP_EXCLUDED_MISS_PENALTY,
    groupPreferredClasses: normalizePreferenceMap(config.groupPreferredClasses),
  };

  solutions = solveGroup(density, courseDatabase, sanitizedMembers, maxSolutions, 'shared-first', fitnessConfig, 'strict');
  if (solutions.length === 0) {
    warnings.push('Khong co nghiem khi vua giu lop uu tien vua bat buoc mon trung hoc cung lop. Dang thu tach lop nhung van giu lop uu tien.');
    solutions = solveGroup(density, courseDatabase, sanitizedMembers, maxSolutions, 'split', fitnessConfig, 'strict');
  }
  if (solutions.length === 0) {
    warnings.push('Khong co nghiem neu giu cung toan bo lop uu tien. Dang dung phuong an bat kha khang: cho phep lech lop uu tien va tru diem rat manh.');
    solutions = solveGroup(density, courseDatabase, sanitizedMembers, maxSolutions, 'shared-first', fitnessConfig, 'relaxed');
    if (solutions.length === 0) {
      warnings.push('Khong co nghiem khi bat buoc cac mon trung nhau hoc cung lop. Dang dung phuong an du phong: cho phep tach lop neu can.');
      solutions = solveGroup(density, courseDatabase, sanitizedMembers, maxSolutions, 'split', fitnessConfig, 'relaxed');
    }
  }

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
