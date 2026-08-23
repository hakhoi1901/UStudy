import pako from 'pako';

import CourseDatabase from '../../../logic/scheduler/CourseDatabase';
import { FitnessEvaluator } from '../../../logic/scheduler/FitnessValuator';
import { Bitset } from '../../../logic/scheduler/Bitset';
import { GROUP_SCHEDULER_CONFIG, GROUP_SCHEDULER_WEIGHTS } from '../../../logic/scheduler/Constants';
import type {
  ClassPreferenceMap,
  ClassPreferenceSelection,
  CourseSharingMap,
  CourseSharingMode,
  CourseSharingRule,
  CourseWeight,
  GroupConfigurationIssue,
  GroupFitnessConfig,
  GroupMemberToken,
  GroupShareConfig,
  GroupSharePayload,
  GroupScheduleItem,
  GroupScheduleOption,
  GroupScheduleRunResult,
  GroupScheduleTradeoff,
  GroupSolveStage,
  GroupSolveTrace,
  GroupSolution,
  SchedulePreferenceConfig,
  StateMatrix,
} from '../types';
import { formatDaysOff, type DayOffPreference } from '../../../utils/dayOffPreferences';

const GROUP_URL_PREFIX = 'v2_';
const LEGACY_GROUP_URL_PREFIX = 'v1_';
const MASK_PARTS = 10;
const MAX_GROUP_URL_COMPRESSED_BYTES = 12 * 1024;
const MAX_GROUP_URL_JSON_LENGTH = 64 * 1024;
const MAX_GROUP_MEMBERS = 20;
const MAX_GROUP_COURSES_PER_MEMBER = 60;
const MAX_GROUP_NICKNAME_LENGTH = 80;
const MAX_GROUP_COURSE_ID_LENGTH = 32;
const GROUP_DAY_OFF_PENALTY = 40_000;
const memberAssignmentKey = (courseId: string, memberIndex: number) => `${courseId}__member_${memberIndex}`;
const sharingGroupAssignmentKey = (courseId: string, subscribers: number[]) => `${courseId}__group_${subscribers.join('_')}`;
type PreferenceConstraintMode = 'strict' | 'relaxed';
type SolveMode = 'shared-first' | 'split';

interface HardClassConstraints {
  groupExcluded?: Record<string, string[]>;
  memberExcluded?: Record<string, Record<number, string[]>>;
}

interface SolveGroupAttempt {
  solutions: GroupSolution[];
  visitedNodes: number;
  reachedSearchBudget: boolean;
  reachedSolutionLimit: boolean;
}

interface SolveStagesResult {
  solutions: GroupSolution[];
  trace: GroupSolveTrace[];
}

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

function inflateGroupPayload(bytes: Uint8Array): string {
  let output = '';
  const inflater = new pako.Inflate({ to: 'string' });
  inflater.onData = (chunk) => {
    const textChunk = typeof chunk === 'string' ? chunk : new TextDecoder().decode(chunk);
    if (output.length + textChunk.length > MAX_GROUP_URL_JSON_LENGTH) {
      throw new Error('Payload giải nén vượt quá giới hạn cho phép.');
    }
    output += textChunk;
  };
  inflater.push(bytes, true);
  if (inflater.err) throw new Error(inflater.msg || 'Không thể giải nén payload.');
  return output;
}

function readCourseIds(value: unknown, fieldName: string): string[] {
  if (!Array.isArray(value) || value.length > MAX_GROUP_COURSES_PER_MEMBER) {
    throw new Error(`${fieldName} không hợp lệ hoặc vượt quá giới hạn.`);
  }
  return value.map((courseId) => {
    if (typeof courseId !== 'string' || courseId.length > MAX_GROUP_COURSE_ID_LENGTH) {
      throw new Error(`${fieldName} chứa mã môn không hợp lệ.`);
    }
    return courseId;
  });
}

function parseGroupMembers(value: unknown): GroupMemberToken[] {
  if (!Array.isArray(value) || value.length > MAX_GROUP_MEMBERS) {
    throw new Error('Danh sách thành viên nhóm không hợp lệ hoặc quá lớn.');
  }
  return value.map((candidate) => {
    if (!candidate || typeof candidate !== 'object') throw new Error('Thành viên nhóm không hợp lệ.');
    const member = candidate as Record<string, unknown>;
    const nickname = member.nickname;
    if (nickname !== undefined && (typeof nickname !== 'string' || nickname.length > MAX_GROUP_NICKNAME_LENGTH)) {
      throw new Error('Tên thành viên vượt quá giới hạn.');
    }
    return sanitizeGroupMember({
      nickname: typeof nickname === 'string' ? nickname : undefined,
      sharedCourses: readCourseIds(member.sharedCourses, 'Danh sách môn chung'),
      personalCourses: readCourseIds(member.personalCourses, 'Danh sách môn riêng'),
      busyMask: Array.isArray(member.busyMask) ? member.busyMask : [],
      preferredClasses: member.preferredClasses as ClassPreferenceMap | undefined,
      personalConfig: member.personalConfig as SchedulePreferenceConfig | undefined,
    });
  });
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
      .map(([courseId, selection]): [string, Required<ClassPreferenceSelection>] => [
        normalizeCourseId(courseId),
        normalizePreferenceSelection(selection),
      ])
      .filter(([, selection]) => selection.excluded.length > 0 || selection.preferred.length > 0 || selection.required.length > 0),
  );
}

function sanitizeCourseSharingMap(value?: CourseSharingMap): CourseSharingMap {
  if (!value || typeof value !== 'object') return {};
  return Object.fromEntries(Object.entries(value).slice(0, MAX_GROUP_COURSES_PER_MEMBER).map(([rawCourseId, rawRule]) => {
    const courseId = normalizeCourseId(rawCourseId);
    const mode: CourseSharingMode = rawRule?.mode === 'preferred' || rawRule?.mode === 'independent' ? rawRule.mode : 'required';
    const groups = Array.isArray(rawRule?.groups)
      ? rawRule.groups.slice(0, MAX_GROUP_MEMBERS).map((group) => Array.from(new Set(
          (Array.isArray(group) ? group : []).filter((index) => Number.isInteger(index) && index >= 0 && index < MAX_GROUP_MEMBERS),
        )))
      : undefined;
    const groupClassPreferences = Object.fromEntries(Object.entries(rawRule?.groupClassPreferences ?? {})
      .slice(0, MAX_GROUP_MEMBERS + 1)
      .map(([groupId, selection]) => [groupId.slice(0, 40), normalizePreferenceSelection(selection)]));
    return [courseId, {
      mode,
      ...(groups ? { groups } : {}),
      ...(Object.keys(groupClassPreferences).length ? { groupClassPreferences } : {}),
    } satisfies CourseSharingRule];
  }).filter(([courseId]) => Boolean(courseId)));
}

function sanitizeShareConfig(value: unknown): GroupShareConfig | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const candidate = value as GroupShareConfig;
  const config: GroupShareConfig = {
    groupPreferredClasses: normalizePreferenceMap(candidate.groupPreferredClasses),
    courseSharing: sanitizeCourseSharingMap(candidate.courseSharing),
    groupPreferences: sanitizePersonalConfig(candidate.groupPreferences),
  };
  return config;
}

function sanitizePersonalConfig(config?: SchedulePreferenceConfig): SchedulePreferenceConfig | undefined {
  if (!config) return undefined;

  const daysOff = Array.from(new Set(
    (config.daysOff ?? []).filter((value): value is DayOffPreference => {
      if (typeof value === 'number') return Number.isInteger(value) && value >= 0 && value <= 6;
      return /^([0-6]):(morning|afternoon)$/.test(value);
    }),
  ));

  const sanitized: SchedulePreferenceConfig = { daysOff };
  if (config.session === '0' || config.session === '1' || config.session === '2') sanitized.session = config.session;
  if (config.strategy === 'compress' || config.strategy === 'spread') sanitized.strategy = config.strategy;
  if (typeof config.noGaps === 'boolean') sanitized.noGaps = config.noGaps;
  return sanitized;
}

function classPreferenceLevel(selection: Required<ClassPreferenceSelection> | undefined, classId: string): 'excluded' | 'required' | 'preferred' | null {
  if (selection?.excluded.includes(classId)) return 'excluded';
  if (selection?.required.includes(classId)) return 'required';
  if (selection?.preferred.includes(classId)) return 'preferred';
  return null;
}

function getPreferenceHits(courseId: string, classId: string, subscribers: number[], members: GroupMemberToken[], config?: Pick<GroupFitnessConfig, 'groupPreferredClasses'>, sharingGroupSelection?: ClassPreferenceSelection): number {
  const groupSelection = normalizePreferenceSelection(config?.groupPreferredClasses?.[courseId]);
  const localSelection = normalizePreferenceSelection(sharingGroupSelection);
  const groupLevel = classPreferenceLevel(groupSelection, classId);
  const localLevel = classPreferenceLevel(localSelection, classId);
  const groupHits =
    groupLevel === 'excluded'
      ? -GROUP_SCHEDULER_WEIGHTS.CLASS_ORDER_GROUP_EXCLUDED * Math.max(subscribers.length, 1)
      : groupLevel === 'required'
      ? GROUP_SCHEDULER_WEIGHTS.CLASS_ORDER_GROUP_REQUIRED * Math.max(subscribers.length, 1)
      : groupLevel === 'preferred'
        ? GROUP_SCHEDULER_WEIGHTS.CLASS_ORDER_GROUP_PREFERRED * Math.max(subscribers.length, 1)
        : 0;

  const localHits = localLevel === 'excluded'
    ? -GROUP_SCHEDULER_WEIGHTS.CLASS_ORDER_GROUP_EXCLUDED * Math.max(subscribers.length, 1)
    : localLevel === 'required'
      ? GROUP_SCHEDULER_WEIGHTS.CLASS_ORDER_GROUP_REQUIRED * Math.max(subscribers.length, 1)
      : localLevel === 'preferred'
        ? GROUP_SCHEDULER_WEIGHTS.CLASS_ORDER_GROUP_PREFERRED * Math.max(subscribers.length, 1)
        : 0;

  return subscribers.reduce((hits, memberIndex) => {
    const memberSelection = normalizePreferenceSelection(members[memberIndex]?.preferredClasses?.[courseId]);
    const memberLevel = classPreferenceLevel(memberSelection, classId);
    if (memberLevel === 'excluded') return hits - GROUP_SCHEDULER_WEIGHTS.CLASS_ORDER_PERSONAL_EXCLUDED;
    if (memberLevel === 'required') return hits + GROUP_SCHEDULER_WEIGHTS.CLASS_ORDER_PERSONAL_REQUIRED;
    if (memberLevel === 'preferred') return hits + GROUP_SCHEDULER_WEIGHTS.CLASS_ORDER_PERSONAL_PREFERRED;
    return hits;
  }, groupHits + localHits);
}

function classMatchesPreferenceConstraints(
  courseId: string,
  classId: string,
  subscribers: number[],
  members: GroupMemberToken[],
  config: Pick<GroupFitnessConfig, 'groupPreferredClasses'>,
  preferenceMode: PreferenceConstraintMode,
  hardConstraints?: HardClassConstraints,
  sharingGroupSelection?: ClassPreferenceSelection,
): boolean {
  if (hardConstraints?.groupExcluded?.[courseId]?.includes(classId)) return false;
  if (subscribers.some((memberIndex) => hardConstraints?.memberExcluded?.[courseId]?.[memberIndex]?.includes(classId))) return false;

  if (preferenceMode === 'relaxed') return true;

  const groupSelection = normalizePreferenceSelection(config.groupPreferredClasses?.[courseId]);
  if (groupSelection.excluded.includes(classId)) return false;
  if (groupSelection.required.length > 0 && !groupSelection.required.includes(classId)) return false;
  const localSelection = normalizePreferenceSelection(sharingGroupSelection);
  if (localSelection.excluded.includes(classId)) return false;
  if (localSelection.required.length > 0 && !localSelection.required.includes(classId)) return false;

  for (const memberIndex of subscribers) {
    const memberSelection = normalizePreferenceSelection(members[memberIndex]?.preferredClasses?.[courseId]);
    if (memberSelection.excluded.includes(classId)) return false;
    if (memberSelection.required.length > 0 && !memberSelection.required.includes(classId)) return false;
  }

  return true;
}

function maskHasBit(mask: number[], index: number): boolean {
  return ((mask[Math.floor(index / 32)] ?? 0) & (1 << (index % 32))) !== 0;
}

function countDayOffViolations(mask: number[], daysOff: DayOffPreference[] | undefined): number {
  if (!daysOff?.length) return 0;

  return daysOff.reduce<number>((count, value) => {
    const [rawDay, rawSession] = String(value).split(':');
    const day = Number(rawDay);
    if (!Number.isInteger(day) || day < 0 || day > 6) return count;

    const startPeriod = rawSession === 'morning' ? 0 : rawSession === 'afternoon' ? 10 : 0;
    const endPeriod = rawSession === 'morning' ? 9 : rawSession === 'afternoon' ? 19 : 19;
    for (let period = startPeriod; period <= endPeriod; period++) {
      const bit = day * 20 + period;
      if (maskHasBit(mask, bit) || maskHasBit(mask, bit + 140)) return count + 1;
    }
    return count;
  }, 0);
}

function getDayOffPriorityPenalty(
  cls: ClassLike,
  subscribers: number[],
  members: GroupMemberToken[],
  config: Pick<GroupFitnessConfig, 'daysOff'>,
): number {
  const classMask = getClassMask(cls);
  const groupViolations = countDayOffViolations(classMask, config.daysOff);
  const personalViolations = subscribers.reduce(
    (count, memberIndex) => count + countDayOffViolations(classMask, members[memberIndex]?.personalConfig?.daysOff),
    0,
  );

  // Ngày nhóm muốn nghỉ quan trọng hơn preference cá nhân khi thử nhánh DFS.
  return groupViolations * 100 + personalViolations;
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
      const selectedClassId = solution.assignments.get(course.assignmentKey) ?? solution.assignments.get(memberAssignmentKey(course.assignmentKey, memberIndex));
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
  members: GroupMemberToken[],
  config: GroupFitnessConfig,
  scope: 'all' | 'shared' | 'personal' = 'all',
): number {
  const subjects = buildMemberSubjects(solution, db, courses, memberIndex, scope);
  if (subjects.length === 0) return 0;

  const personalConfig = members[memberIndex]?.personalConfig;
  const daysOff: DayOffPreference[] = [
    ...(config.daysOff ?? []),
    ...(personalConfig?.daysOff ?? []),
  ];

  const evaluator = new FitnessEvaluator({
    session: personalConfig?.session ?? config.session ?? '0',
    strategy: personalConfig?.strategy ?? config.strategy ?? 'compress',
    noGaps: personalConfig?.noGaps ?? config.noGaps ?? false,
    daysOff,
    dayOffPenalty: GROUP_DAY_OFF_PENALTY,
  });
  const chromosome = { genes: subjects.map(() => 0) };
  return evaluator.getFitness(chromosome, subjects);
}

export function sanitizeGroupMember(member: GroupMemberToken): GroupMemberToken {
  const sharedCourses = uniqueCourseIds(member.sharedCourses);
  const personalCourses = uniqueCourseIds(member.personalCourses).filter((courseId) => !sharedCourses.includes(courseId));

  return {
    nickname: member.nickname?.trim() || undefined,
    sharedCourses,
    personalCourses,
    busyMask: normalizeMask(member.busyMask),
    preferredClasses: normalizePreferenceMap(member.preferredClasses),
    personalConfig: sanitizePersonalConfig(member.personalConfig),
  };
}

export function encodeGroupURL(members: GroupMemberToken[], config?: GroupShareConfig): string {
  const payload: GroupSharePayload = {
    members: members.map(sanitizeGroupMember),
    ...(config ? { config: sanitizeShareConfig(config) } : {}),
  };
  const json = JSON.stringify(payload);
  const compressed = pako.deflate(json);
  const b64 = toBase64Url(compressed);
  return `${window.location.origin}/group#${GROUP_URL_PREFIX}${b64}`;
}

export function decodeGroupPayload(hash: string): GroupSharePayload {
  const fragment = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!fragment) return { members: [] };
  const isLegacy = fragment.startsWith(LEGACY_GROUP_URL_PREFIX);
  if (!isLegacy && !fragment.startsWith(GROUP_URL_PREFIX)) {
    throw new GroupURLDecodeError('Link nhóm không đúng định dạng hoặc khác phiên bản.');
  }

  try {
    const encoded = fragment.slice((isLegacy ? LEGACY_GROUP_URL_PREFIX : GROUP_URL_PREFIX).length);
    if (!encoded || encoded.length > MAX_GROUP_URL_COMPRESSED_BYTES * 2 || !/^[A-Za-z0-9_-]+$/.test(encoded)) {
      throw new Error('Payload nén không hợp lệ hoặc vượt quá giới hạn.');
    }
    const bytes = fromBase64Url(encoded);
    if (bytes.length > MAX_GROUP_URL_COMPRESSED_BYTES) {
      throw new Error('Payload nén vượt quá giới hạn cho phép.');
    }
    const json = inflateGroupPayload(bytes);
    const parsed = JSON.parse(json);
    if (isLegacy || Array.isArray(parsed)) return { members: parseGroupMembers(parsed) };
    if (!parsed || typeof parsed !== 'object') throw new Error('Payload nhom khong hop le.');
    const payload = parsed as Record<string, unknown>;
    return {
      members: parseGroupMembers(payload.members),
      config: sanitizeShareConfig(payload.config),
    };
  } catch (error) {
    throw new GroupURLDecodeError(error instanceof Error ? `Link nhóm bị lỗi hoặc bị cắt ngắn: ${error.message}` : 'Link nhóm bị lỗi hoặc bị cắt ngắn.');
  }
}

export function decodeGroupURL(hash: string): GroupMemberToken[] {
  return decodeGroupPayload(hash).members;
}

export function buildDensityMap(members: GroupMemberToken[], courseSharing: CourseSharingMap = {}): CourseWeight[] {
  const courseSubscribers = new Map<string, Set<number>>();

  members.map(sanitizeGroupMember).forEach((member, memberIndex) => {
    memberCourseSet(member).forEach((courseId) => {
      if (!courseSubscribers.has(courseId)) courseSubscribers.set(courseId, new Set());
      courseSubscribers.get(courseId)?.add(memberIndex);
    });
  });

  return Array.from(courseSubscribers.entries())
    .flatMap<CourseWeight>(([courseId, subscribers]) => {
      const subscriberList = Array.from(subscribers).sort((a, b) => a - b);
      const rawRule = courseSharing[courseId];
      const mode: CourseSharingMode = subscriberList.length < 2 ? 'independent' : rawRule?.mode ?? 'required';

      if (mode === 'independent') {
        return subscriberList.map((memberIndex) => ({
          courseId,
          assignmentKey: memberAssignmentKey(courseId, memberIndex),
          subscribers: [memberIndex],
          isShared: false,
          sharingMode: mode,
          sharingGroupId: `member-${memberIndex}`,
          sharingGroupLabel: `Thành viên ${memberIndex + 1}`,
          classPreferences: rawRule?.groupClassPreferences?.[`member-${memberIndex}`],
        }));
      }

      const availableMembers = new Set(subscriberList);
      const assignedMembers = new Set<number>();
      const configuredGroups = (rawRule?.groups ?? []).reduce<Array<{ id: string; members: number[] }>>((groups, rawGroup, groupIndex) => {
        const group = Array.from(new Set(
          rawGroup.filter((memberIndex) => availableMembers.has(memberIndex) && !assignedMembers.has(memberIndex)),
        )).sort((a, b) => a - b);
        if (group.length === 0) return groups;
        group.forEach((memberIndex) => assignedMembers.add(memberIndex));
        groups.push({ id: `group-${groupIndex}`, members: group });
        return groups;
      }, []);
      const groups = configuredGroups.length > 0
        ? [...configuredGroups, ...subscriberList.filter((memberIndex) => !assignedMembers.has(memberIndex)).map((memberIndex) => ({ id: `member-${memberIndex}`, members: [memberIndex] }))]
        : [{ id: 'all', members: subscriberList }];

      return groups.map((group, groupIndex) => ({
        courseId,
        assignmentKey: group.members.length === subscriberList.length ? courseId : sharingGroupAssignmentKey(courseId, group.members),
        subscribers: group.members,
        isShared: group.members.length >= 2,
        sharingMode: mode,
        sharingGroupId: group.id,
        sharingGroupLabel: group.id === 'all' ? 'Tất cả' : group.id.startsWith('group-') ? `Nhóm ${groupIndex + 1}` : 'Học riêng',
        classPreferences: rawRule?.groupClassPreferences?.[group.id],
      }));
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

function solveGroupWithTrace(
  courses: CourseWeight[],
  courseDatabase: CourseDatabase,
  members: GroupMemberToken[],
  maxSolutions = GROUP_SCHEDULER_CONFIG.DEFAULT_MAX_SOLUTIONS,
  mode: SolveMode = 'shared-first',
  config: Pick<GroupFitnessConfig, 'groupPreferredClasses' | 'daysOff'> = {},
  preferenceMode: PreferenceConstraintMode = 'relaxed',
  searchBudget = GROUP_SCHEDULER_CONFIG.SEARCH_NODE_BUDGET,
  hardConstraints?: HardClassConstraints,
  limitRelaxedCandidates = true,
): SolveGroupAttempt {
  const solutions: GroupSolution[] = [];
  const orderedCourses = [...courses].sort((left, right) => {
    if (right.subscribers.length !== left.subscribers.length) return right.subscribers.length - left.subscribers.length;
    const leftMember = left.subscribers[0] ?? Number.MAX_SAFE_INTEGER;
    const rightMember = right.subscribers[0] ?? Number.MAX_SAFE_INTEGER;
    if (left.subscribers.length === 1 && right.subscribers.length === 1 && leftMember !== rightMember) return leftMember - rightMember;
    const classDifference = getClasses(courseDatabase, left.courseId).length - getClasses(courseDatabase, right.courseId).length;
    if (classDifference !== 0) return classDifference;
    return left.courseId.localeCompare(right.courseId);
  });
  const initialState: StateMatrix = members.map((member) => normalizeMask(member.busyMask));
  let visitedNodes = 0;
  let reachedSearchBudget = false;
  let reachedSolutionLimit = false;

  function dfs(courseIndex: number, state: StateMatrix, assignments: Map<string, string>) {
    if (solutions.length >= maxSolutions) {
      reachedSolutionLimit = true;
      return;
    }
    if (visitedNodes++ >= searchBudget) {
      reachedSearchBudget = true;
      return;
    }
    if (courseIndex === orderedCourses.length) {
      solutions.push({
        assignments: new Map(assignments),
        stateMatrix: state.map((memberMask) => [...memberMask]),
      });
      return;
    }

    const course = orderedCourses[courseIndex];
    const availableClasses = getClasses(courseDatabase, course.courseId)
      .sort((a, b) => {
        const dayOffDifference = getDayOffPriorityPenalty(a, course.subscribers, members, config) - getDayOffPriorityPenalty(b, course.subscribers, members, config);
        if (dayOffDifference !== 0) return dayOffDifference;
        return getPreferenceHits(course.courseId, b.id, course.subscribers, members, config, course.classPreferences) - getPreferenceHits(course.courseId, a.id, course.subscribers, members, config, course.classPreferences);
      })
      .slice(0, preferenceMode === 'relaxed' && limitRelaxedCandidates ? GROUP_SCHEDULER_CONFIG.RELAXED_CLASS_CANDIDATE_LIMIT : undefined);
    if (availableClasses.length === 0) return;

    if (mode === 'split' && course.subscribers.length > 1 && course.sharingMode !== 'required') {
      function assignSubscriber(subscriberOffset: number, workingState: StateMatrix) {
        if (solutions.length >= maxSolutions) {
          reachedSolutionLimit = true;
          return;
        }
        if (visitedNodes++ >= searchBudget) {
          reachedSearchBudget = true;
          return;
        }
        if (subscriberOffset === course.subscribers.length) {
          dfs(courseIndex + 1, workingState, assignments);
          return;
        }

        const memberIndex = course.subscribers[subscriberOffset];
        const sortedForMember = [...availableClasses].sort((a, b) => {
          const dayOffDifference = getDayOffPriorityPenalty(a, [memberIndex], members, config) - getDayOffPriorityPenalty(b, [memberIndex], members, config);
          if (dayOffDifference !== 0) return dayOffDifference;
          return getPreferenceHits(course.courseId, b.id, [memberIndex], members, config, course.classPreferences) - getPreferenceHits(course.courseId, a.id, [memberIndex], members, config, course.classPreferences);
        }).slice(0, preferenceMode === 'relaxed' && limitRelaxedCandidates ? GROUP_SCHEDULER_CONFIG.RELAXED_CLASS_CANDIDATE_LIMIT : undefined);

        for (const cls of sortedForMember) {
          const classMask = getClassMask(cls);
          if (!classMatchesPreferenceConstraints(course.courseId, cls.id, [memberIndex], members, config, preferenceMode, hardConstraints, course.classPreferences)) continue;
          if (!isClassValid(classMask, [memberIndex], workingState)) continue;

          const nextState = workingState.map((memberMask, idx) => {
            if (idx !== memberIndex) return [...memberMask];
            return memberMask.map((mask, partIndex) => mask | classMask[partIndex]);
          });

          assignments.set(memberAssignmentKey(course.assignmentKey, memberIndex), cls.id);
          assignSubscriber(subscriberOffset + 1, nextState);
          assignments.delete(memberAssignmentKey(course.assignmentKey, memberIndex));
        }
      }

      assignSubscriber(0, state);
      return;
    }

    for (const cls of availableClasses) {
      const classMask = getClassMask(cls);
      if (!classMatchesPreferenceConstraints(course.courseId, cls.id, course.subscribers, members, config, preferenceMode, hardConstraints, course.classPreferences)) continue;
      if (!isClassValid(classMask, course.subscribers, state)) continue;

      const nextState = state.map((memberMask, memberIndex) => {
        if (!course.subscribers.includes(memberIndex)) return [...memberMask];
        return memberMask.map((mask, partIndex) => mask | classMask[partIndex]);
      });

      assignments.set(course.assignmentKey, cls.id);
      dfs(courseIndex + 1, nextState, assignments);
      assignments.delete(course.assignmentKey);
    }
  }

  dfs(0, initialState, new Map());
  return { solutions, visitedNodes, reachedSearchBudget, reachedSolutionLimit };
}

function masksOverlap(left: number[], right: number[]): boolean {
  const a = normalizeMask(left);
  const b = normalizeMask(right);
  return a.some((part, index) => (part & b[index]) !== 0);
}

export function validateGroupScheduleConfiguration(
  dbData: unknown,
  members: GroupMemberToken[],
  config: Partial<GroupFitnessConfig> = {},
): GroupConfigurationIssue[] {
  const sanitizedMembers = members.map(sanitizeGroupMember);
  const courseDatabase = new CourseDatabase();
  courseDatabase.loadData(typeof dbData === 'string' ? JSON.parse(dbData) : dbData);
  const courses = buildDensityMap(sanitizedMembers, config.courseSharing);

  return courses.flatMap((course) => {
    const classes = getClasses(courseDatabase, course.courseId);
    if (classes.length === 0) return [];
    const globalSelection = normalizePreferenceSelection(config.groupPreferredClasses?.[course.courseId]);
    const localSelection = normalizePreferenceSelection(course.classPreferences);
    const rejectedClasses = classes.map((cls) => {
      const reasons: string[] = [];
      if (globalSelection.excluded.includes(cls.id)) reasons.push('bị loại ở ưu tiên chung của môn');
      if (globalSelection.required.length && !globalSelection.required.includes(cls.id)) reasons.push(`không nằm trong lớp bắt buộc chung (${globalSelection.required.join(', ')})`);
      if (localSelection.excluded.includes(cls.id)) reasons.push(`bị ${course.sharingGroupLabel.toLowerCase()} loại`);
      if (localSelection.required.length && !localSelection.required.includes(cls.id)) reasons.push(`không nằm trong lớp bắt buộc của ${course.sharingGroupLabel.toLowerCase()} (${localSelection.required.join(', ')})`);
      course.subscribers.forEach((memberIndex) => {
        const member = sanitizedMembers[memberIndex];
        const memberName = member?.nickname || `Thành viên ${memberIndex + 1}`;
        const memberSelection = normalizePreferenceSelection(member?.preferredClasses?.[course.courseId]);
        if (memberSelection.excluded.includes(cls.id)) reasons.push(`${memberName} đã loại lớp này`);
        if (memberSelection.required.length && !memberSelection.required.includes(cls.id)) reasons.push(`${memberName} bắt buộc lớp ${memberSelection.required.join(', ')}`);
        if (masksOverlap(getClassMask(cls), member?.busyMask ?? [])) reasons.push(`trùng lịch bận của ${memberName}`);
      });
      return { classId: cls.id, reasons: Array.from(new Set(reasons)) };
    });
    if (rejectedClasses.some((entry) => entry.reasons.length === 0)) return [];

    const names = course.subscribers.map((memberIndex) => sanitizedMembers[memberIndex]?.nickname || `Thành viên ${memberIndex + 1}`);
    const severity = course.sharingMode === 'preferred' && course.subscribers.length > 1 ? 'warning' : 'error';
    return [{
      id: `${course.courseId}:${course.sharingGroupId}`,
      severity,
      courseId: course.courseId,
      groupId: course.sharingGroupId,
      title: `${course.courseId} - ${course.sharingGroupLabel} không còn lớp hợp lệ`,
      description: severity === 'warning'
        ? `${names.join(', ')} không thể học chung với các ràng buộc hiện tại; solver chỉ có thể thử tách lớp.`
        : `${names.join(', ')} không có lớp nào vừa khớp bộ lọc vừa tránh lịch bận.`,
      memberIndexes: course.subscribers,
      rejectedClasses,
    } satisfies GroupConfigurationIssue];
  });
}

export function solveGroup(
  courses: CourseWeight[],
  courseDatabase: CourseDatabase,
  members: GroupMemberToken[],
  maxSolutions = GROUP_SCHEDULER_CONFIG.DEFAULT_MAX_SOLUTIONS,
  mode: SolveMode = 'shared-first',
  config: Pick<GroupFitnessConfig, 'groupPreferredClasses' | 'daysOff'> = {},
  preferenceMode: PreferenceConstraintMode = 'relaxed',
  searchBudget = GROUP_SCHEDULER_CONFIG.SEARCH_NODE_BUDGET,
): GroupSolution[] {
  return solveGroupWithTrace(courses, courseDatabase, members, maxSolutions, mode, config, preferenceMode, searchBudget).solutions;
}

export function scoreGroupSolution(
  solution: GroupSolution,
  courseDatabase: CourseDatabase,
  courses: CourseWeight[],
  members: GroupMemberToken[],
  config: GroupFitnessConfig,
): number {
  const memberScores = members.map((member, memberIndex) => {
    const sharedScore = scoreMemberSchedule(solution, courseDatabase, courses, memberIndex, members, config, 'shared');
    const personalScore = scoreMemberSchedule(solution, courseDatabase, courses, memberIndex, members, config, 'personal');
    return sharedScore + personalScore;
  });
  const total = memberScores.reduce((sum, score) => sum + score, 0);
  const avg = memberScores.length > 0 ? total / memberScores.length : 0;
  const variance = memberScores.reduce((sum, score) => sum + (score - avg) ** 2, 0) / Math.max(memberScores.length, 1);
  const fairnessPenalty = config.fairnessWeight * Math.sqrt(variance);
  const sharedBonus = courses.filter((course) => course.isShared && solution.assignments.has(course.assignmentKey)).length * config.sharedSlotBonus;
  const preferenceScore = courses.reduce((score, course) => {
    const groupSelection = normalizePreferenceSelection(config.groupPreferredClasses?.[course.courseId]);
    const sharingGroupSelection = normalizePreferenceSelection(course.classPreferences);
    const globalClassId = solution.assignments.get(course.assignmentKey);

    const scoreClass = (classId: string, memberIndex: number) => {
      let nextScore = 0;
      const groupLevel = classPreferenceLevel(groupSelection, classId);
      const sharingGroupLevel = classPreferenceLevel(sharingGroupSelection, classId);
      const personalSelection = normalizePreferenceSelection(members[memberIndex]?.preferredClasses?.[course.courseId]);
      const personalLevel = classPreferenceLevel(personalSelection, classId);
      if (groupLevel === 'excluded') nextScore -= config.groupExcludedPreferenceMissPenalty;
      if (groupLevel === 'required') nextScore += config.groupRequiredPreferenceWeight;
      if (groupLevel === 'preferred') nextScore += config.groupPreferenceWeight;
      if (groupSelection.required.length > 0 && !groupSelection.required.includes(classId)) nextScore -= config.groupRequiredPreferenceMissPenalty;
      if (groupSelection.preferred.length > 0 && !groupSelection.preferred.includes(classId)) nextScore -= config.groupPreferenceMissPenalty;
      if (sharingGroupLevel === 'excluded') nextScore -= config.groupExcludedPreferenceMissPenalty;
      if (sharingGroupLevel === 'required') nextScore += config.groupRequiredPreferenceWeight;
      if (sharingGroupLevel === 'preferred') nextScore += config.groupPreferenceWeight;
      if (sharingGroupSelection.required.length > 0 && !sharingGroupSelection.required.includes(classId)) nextScore -= config.groupRequiredPreferenceMissPenalty;
      if (sharingGroupSelection.preferred.length > 0 && !sharingGroupSelection.preferred.includes(classId)) nextScore -= config.groupPreferenceMissPenalty;
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
      const memberClassId = solution.assignments.get(memberAssignmentKey(course.assignmentKey, memberIndex));
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
  solveStage?: GroupSolveStage,
): GroupScheduleOption {
  const itemsByMember = members.map<GroupScheduleItem[]>((() => []));
  const assignmentRecord: Record<string, string> = {};

  courses.forEach((course) => {
    const courseData = getCourse(courseDatabase, course.courseId);
    if (!courseData) return;

    const globalClassId = solution.assignments.get(course.assignmentKey);
    if (globalClassId) {
      assignmentRecord[course.assignmentKey] = globalClassId;
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
        sharingGroupId: course.sharingGroupId,
        sharingGroupLabel: course.sharingGroupLabel,
      };

      course.subscribers.forEach((memberIndex) => {
        itemsByMember[memberIndex].push(item);
      });
      return;
    }

    course.subscribers.forEach((memberIndex) => {
      const classId = solution.assignments.get(memberAssignmentKey(course.assignmentKey, memberIndex));
      if (!classId) return;
      assignmentRecord[memberAssignmentKey(course.assignmentKey, memberIndex)] = classId;
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
        sharingGroupId: course.sharingGroupId,
        sharingGroupLabel: course.sharingGroupLabel,
      });
    });
  });

  return {
    option: optionIndex + 1,
    fitness,
    assignments: assignmentRecord,
    solveStage,
    schedules: members.map((member, memberIndex) => ({
      memberIndex,
      nickname: member.nickname || `Thành viên ${memberIndex + 1}`,
      items: itemsByMember[memberIndex],
    })),
  };
}

function buildFitnessConfig(config: Partial<GroupFitnessConfig>): GroupFitnessConfig {
  return {
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
    courseSharing: sanitizeCourseSharingMap(config.courseSharing),
  };
}

function runSolveStages(
  density: CourseWeight[],
  courseDatabase: CourseDatabase,
  members: GroupMemberToken[],
  fitnessConfig: GroupFitnessConfig,
  maxSolutions: number,
  hardConstraints?: HardClassConstraints,
  searchBudget = GROUP_SCHEDULER_CONFIG.SEARCH_NODE_BUDGET,
  limitRelaxedCandidates = true,
): SolveStagesResult {
  const trace: GroupSolveTrace[] = [];
  const preferenceModes: PreferenceConstraintMode[] = ['strict', 'relaxed'];

  for (const preferenceMode of preferenceModes) {
    const solutionsByAssignment = new Map<string, GroupSolution>();
    const attempts: Array<{ stage: GroupSolveStage; mode: SolveMode }> = preferenceMode === 'strict'
      ? [
          { stage: 'shared-strict', mode: 'shared-first' },
          { stage: 'split-strict', mode: 'split' },
        ]
      : [
          { stage: 'shared-relaxed', mode: 'shared-first' },
          { stage: 'split-relaxed', mode: 'split' },
        ];

    for (const attempt of attempts) {
      const result = solveGroupWithTrace(
        density,
        courseDatabase,
        members,
        maxSolutions,
        attempt.mode,
        fitnessConfig,
        preferenceMode,
        searchBudget,
        hardConstraints,
        limitRelaxedCandidates,
      );
      trace.push({
        stage: attempt.stage,
        solutionCount: result.solutions.length,
        visitedNodes: result.visitedNodes,
        searchBudget,
        reachedSearchBudget: result.reachedSearchBudget,
        reachedSolutionLimit: result.reachedSolutionLimit,
      });
      result.solutions.forEach((solution) => {
        const signature = JSON.stringify(Array.from(solution.assignments.entries()).sort(([left], [right]) => left.localeCompare(right)));
        if (!solutionsByAssignment.has(signature)) solutionsByAssignment.set(signature, { ...solution, solveStage: attempt.stage });
      });
    }

    if (solutionsByAssignment.size > 0) {
      const solutions = Array.from(solutionsByAssignment.values());
      return { solutions, trace };
    }
  }

  return { solutions: [], trace };
}

function getAssignmentClassId(option: GroupScheduleOption, course: CourseWeight, memberIndex: number): string | undefined {
  return option.assignments[course.assignmentKey] ?? option.assignments[memberAssignmentKey(course.assignmentKey, memberIndex)];
}

function selectedClassViolatesPreference(
  selection: Required<ClassPreferenceSelection>,
  classId: string | undefined,
): boolean {
  if (!classId) return false;
  return selection.excluded.includes(classId) || (selection.required.length > 0 && !selection.required.includes(classId));
}

function buildObservedTradeoffs(
  option: GroupScheduleOption,
  courses: CourseWeight[],
  members: GroupMemberToken[],
  config: GroupFitnessConfig,
  trace: GroupSolveTrace[],
): GroupScheduleTradeoff[] {
  const tradeoffs: GroupScheduleTradeoff[] = [];
  const allItems = option.schedules.flatMap((member) => member.items);
  const groupDayCourseIds = Array.from(new Set(
    allItems.filter((item) => countDayOffViolations(item.mask, config.daysOff) > 0).map((item) => item.courseId),
  ));
  if (groupDayCourseIds.length > 0) {
    tradeoffs.push({
      id: 'group-day-off',
      kind: 'group-day-off',
      confidence: 'observed',
      title: `Nhóm vẫn học ${formatDaysOff(config.daysOff)}`,
      description: `Các môn ${groupDayCourseIds.join(', ')} rơi vào ngày hoặc buổi cả nhóm muốn tránh. Đây là ưu tiên mềm.`,
      courseIds: groupDayCourseIds,
    });
  }

  members.forEach((member, memberIndex) => {
    const courseIds = Array.from(new Set(
      (option.schedules.find((schedule) => schedule.memberIndex === memberIndex)?.items ?? [])
        .filter((item) => countDayOffViolations(item.mask, member.personalConfig?.daysOff) > 0)
        .map((item) => item.courseId),
    ));
    if (courseIds.length === 0) return;
    const nickname = member.nickname || `Thành viên ${memberIndex + 1}`;
    tradeoffs.push({
      id: `personal-day-off:${memberIndex}`,
      kind: 'personal-day-off',
      confidence: 'observed',
      title: `${nickname} vẫn học ${formatDaysOff(member.personalConfig?.daysOff)}`,
      description: `Các môn ${courseIds.join(', ')} của ${nickname} rơi vào thời gian bạn ấy muốn tránh.`,
      courseIds,
      memberIndexes: [memberIndex],
    });
  });

  courses.filter((course) => course.isShared && course.sharingMode === 'preferred' && !option.assignments[course.assignmentKey]).forEach((course) => {
    const memberNames = course.subscribers.map((memberIndex) => members[memberIndex]?.nickname || `Thành viên ${memberIndex + 1}`);
    tradeoffs.push({
      id: `split-shared-course:${course.assignmentKey}`,
      kind: 'split-shared-course',
      confidence: 'observed',
      title: `Môn chung ${course.courseId} được tách lớp`,
      description: `${memberNames.join(', ')} được xếp khác lớp dù đã chọn ưu tiên học cùng.`,
      courseIds: [course.courseId],
      memberIndexes: course.subscribers,
    });
  });

  if (option.solveStage?.endsWith('relaxed')) {
    const conflictedCourses = Array.from(new Set(courses.filter((course) => course.subscribers.some((memberIndex) => {
      const classId = getAssignmentClassId(option, course, memberIndex);
      const groupSelection = normalizePreferenceSelection(config.groupPreferredClasses?.[course.courseId]);
      const personalSelection = normalizePreferenceSelection(members[memberIndex]?.preferredClasses?.[course.courseId]);
      return selectedClassViolatesPreference(groupSelection, classId) || selectedClassViolatesPreference(personalSelection, classId);
    })).map((course) => course.courseId)));
    const strictAttempts = trace.filter((entry) => entry.stage.endsWith('strict'));
    const strictWasExhaustive = strictAttempts.length === 2 && strictAttempts.every((entry) => entry.solutionCount === 0 && !entry.reachedSearchBudget);
    if (conflictedCourses.length > 0) {
      tradeoffs.push({
        id: 'relaxed-class-preference',
        kind: 'relaxed-class-preference',
        confidence: strictWasExhaustive ? 'proven' : 'inconclusive',
        title: 'Đã nới điều kiện lọc hoặc khóa lớp',
        description: strictWasExhaustive
          ? `Không có lịch hợp lệ khi giữ nguyên điều kiện lớp cho ${conflictedCourses.join(', ')}.`
          : `Solver đã nới điều kiện lớp cho ${conflictedCourses.join(', ')} sau khi không tìm được lịch trong giới hạn tìm kiếm.`,
        courseIds: conflictedCourses,
      });
    }
  }

  return tradeoffs;
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

  const missingCourseIds = new Set<string>();
  const density = buildDensityMap(sanitizedMembers, config.courseSharing).filter((course) => {
    const exists = getClasses(courseDatabase, course.courseId).length > 0;
    if (!exists && !missingCourseIds.has(course.courseId)) {
      missingCourseIds.add(course.courseId);
      warnings.push(`Không tìm thấy lớp học cho môn ${course.courseId}.`);
    }
    return exists;
  });

  if (sanitizedMembers.length === 0 || density.length === 0) {
    return { density, solutions: [], warnings };
  }

  const fitnessConfig = buildFitnessConfig(config);
  const staged = runSolveStages(density, courseDatabase, sanitizedMembers, fitnessConfig, maxSolutions);
  const sharedStrictTrace = staged.trace.find((entry) => entry.stage === 'shared-strict');
  const splitStrictTrace = staged.trace.find((entry) => entry.stage === 'split-strict');
  if (sharedStrictTrace?.solutionCount === 0 && (splitStrictTrace?.solutionCount ?? 0) > 0) {
    warnings.push('Không có phương án giữ toàn bộ nhóm ưu tiên học cùng lớp; kết quả cần tách ít nhất một nhóm.');
  }
  if (staged.trace.some((entry) => entry.stage === 'shared-relaxed')) {
    warnings.push('Không có phương án khi giữ toàn bộ điều kiện lớp. Solver đã nới điều kiện ưu tiên hoặc bắt buộc và trừ điểm rất mạnh.');
  }
  const sharedRelaxedTrace = staged.trace.find((entry) => entry.stage === 'shared-relaxed');
  const splitRelaxedTrace = staged.trace.find((entry) => entry.stage === 'split-relaxed');
  if (sharedRelaxedTrace?.solutionCount === 0 && (splitRelaxedTrace?.solutionCount ?? 0) > 0) {
    warnings.push('Phương án dự phòng cần tách ít nhất một nhóm đã chọn ưu tiên học cùng lớp.');
  }

  const ranked = staged.solutions
    .map((solution) => ({
      solution,
      fitness: scoreGroupSolution(solution, courseDatabase, density, sanitizedMembers, fitnessConfig),
    }))
    .sort((a, b) => b.fitness - a.fitness)
    .slice(0, maxSolutions)
    .map(({ solution, fitness }, optionIndex) => {
      const option = toScheduleOption(solution, optionIndex, fitness, courseDatabase, density, sanitizedMembers, solution.solveStage);
      option.tradeoffs = buildObservedTradeoffs(option, density, sanitizedMembers, fitnessConfig, staged.trace);
      return option;
    });

  return {
    density,
    solutions: ranked,
    warnings,
    trace: staged.trace,
  };
}

function addHardDayOffExclusions(
  constraints: HardClassConstraints,
  density: CourseWeight[],
  courseDatabase: CourseDatabase,
  daysOff: DayOffPreference[] | undefined,
  memberIndex?: number,
): void {
  density.forEach((course) => {
    if (memberIndex !== undefined && !course.subscribers.includes(memberIndex)) return;
    const excludedClassIds = getClasses(courseDatabase, course.courseId)
      .filter((cls) => countDayOffViolations(getClassMask(cls), daysOff) > 0)
      .map((cls) => cls.id);
    if (excludedClassIds.length === 0) return;

    if (memberIndex === undefined) {
      constraints.groupExcluded ??= {};
      constraints.groupExcluded[course.courseId] = excludedClassIds;
      return;
    }

    constraints.memberExcluded ??= {};
    constraints.memberExcluded[course.courseId] ??= {};
    constraints.memberExcluded[course.courseId][memberIndex] = excludedClassIds;
  });
}

export function analyzeGroupScheduleTradeoff(
  dbData: unknown,
  members: GroupMemberToken[],
  config: Partial<GroupFitnessConfig>,
  tradeoff: GroupScheduleTradeoff,
): GroupScheduleTradeoff {
  if (tradeoff.kind !== 'group-day-off' && tradeoff.kind !== 'personal-day-off') return tradeoff;

  const sanitizedMembers = members.map(sanitizeGroupMember).filter((member) => member.sharedCourses.length + member.personalCourses.length > 0);
  const courseDatabase = new CourseDatabase();
  courseDatabase.loadData(typeof dbData === 'string' ? JSON.parse(dbData) : dbData);
  const density = buildDensityMap(sanitizedMembers, config.courseSharing).filter((course) => getClasses(courseDatabase, course.courseId).length > 0);
  const hardConstraints: HardClassConstraints = {};
  const fitnessConfig = buildFitnessConfig(config);
  const memberIndex = tradeoff.memberIndexes?.[0];
  const daysOff = tradeoff.kind === 'group-day-off'
    ? fitnessConfig.daysOff
    : sanitizedMembers[memberIndex ?? -1]?.personalConfig?.daysOff;
  const subject = tradeoff.kind === 'group-day-off'
    ? `ngày hoặc buổi nhóm muốn tránh (${formatDaysOff(daysOff)})`
    : `ngày hoặc buổi ${sanitizedMembers[memberIndex ?? -1]?.nickname || `thành viên ${(memberIndex ?? 0) + 1}`} muốn tránh (${formatDaysOff(daysOff)})`;

  addHardDayOffExclusions(hardConstraints, density, courseDatabase, daysOff, tradeoff.kind === 'personal-day-off' ? memberIndex : undefined);
  const counterfactual = runSolveStages(
    density,
    courseDatabase,
    sanitizedMembers,
    fitnessConfig,
    1,
    hardConstraints,
    GROUP_SCHEDULER_CONFIG.SEARCH_NODE_BUDGET,
    false,
  );

  if (counterfactual.solutions.length > 0) {
    return {
      ...tradeoff,
      confidence: 'proven',
      canAvoid: true,
      description: `Đã tìm được ít nhất một lịch hợp lệ tránh ${subject}. Phương án hiện tại đang đổi ưu tiên này lấy điểm tổng thể khác.`,
    };
  }

  const wasExhaustive = counterfactual.trace.length === 4
    && counterfactual.trace.every((entry) => entry.solutionCount === 0 && !entry.reachedSearchBudget && !entry.reachedSolutionLimit);
  if (wasExhaustive) {
    const coursesWithoutAlternative = (tradeoff.courseIds ?? []).filter((courseId) => {
      const classes = getClasses(courseDatabase, courseId);
      return classes.length > 0 && classes.every((cls) => countDayOffViolations(getClassMask(cls), daysOff) > 0);
    });
    if (coursesWithoutAlternative.length > 0) {
      return {
        ...tradeoff,
        confidence: 'proven',
        canAvoid: false,
        description: `${coursesWithoutAlternative.join(', ')} không có lớp nào ngoài ${subject}, nên không thể tạo lịch tránh thời gian này.`,
      };
    }

    const reliefCourses: string[] = [];
    const candidates = density
      .filter((course) => !(tradeoff.courseIds ?? []).includes(course.courseId))
      .sort((a, b) => Number(b.isShared) - Number(a.isShared) || b.subscribers.length - a.subscribers.length)
      .slice(0, 6);
    for (const candidate of candidates) {
      const withoutCourse = runSolveStages(
        density.filter((course) => course.courseId !== candidate.courseId),
        courseDatabase,
        sanitizedMembers,
        fitnessConfig,
        1,
        hardConstraints,
        GROUP_SCHEDULER_CONFIG.SEARCH_NODE_BUDGET,
        false,
      );
      if (withoutCourse.solutions.length > 0) reliefCourses.push(candidate.courseId);
      if (reliefCourses.length >= 2) break;
    }
    return {
      ...tradeoff,
      confidence: 'proven',
      canAvoid: false,
      description: reliefCourses.length > 0
        ? `Không có lịch hợp lệ nào tránh ${subject}. Nếu bỏ ${reliefCourses.join(' hoặc ')}, solver tìm được lịch tránh thời gian này.`
        : `Không có lịch hợp lệ nào tránh ${subject} với toàn bộ lớp hiện có và các ràng buộc còn lại.`,
    };
  }

  return {
    ...tradeoff,
    confidence: 'inconclusive',
    description: `Chưa thể kết luận có tránh được ${subject} không vì lượt kiểm tra đã chạm giới hạn tìm kiếm.`,
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
