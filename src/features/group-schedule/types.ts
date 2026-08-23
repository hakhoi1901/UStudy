import type { DayOffPreference } from '../../utils/dayOffPreferences';

export type ClassPreferenceLevel = 'excluded' | 'preferred' | 'required';

export interface ClassPreferenceSelection {
  excluded?: string[];
  preferred?: string[];
  required?: string[];
}

export type ClassPreferenceMap = Record<string, string[] | ClassPreferenceSelection>;

export type CourseSharingMode = 'required' | 'preferred' | 'independent';

export interface CourseSharingRule {
  mode: CourseSharingMode;
  groups?: number[][];
}

export type CourseSharingMap = Record<string, CourseSharingRule>;

export interface GroupMemberToken {
  nickname?: string;
  sharedCourses: string[];
  personalCourses: string[];
  busyMask: number[];
  preferredClasses?: ClassPreferenceMap;
  personalConfig?: SchedulePreferenceConfig;
}

export interface CourseWeight {
  courseId: string;
  assignmentKey: string;
  subscribers: number[];
  isShared: boolean;
  sharingMode: CourseSharingMode;
}

export type StateMatrix = number[][];

export interface GroupSolution {
  assignments: Map<string, string>;
  stateMatrix: StateMatrix;
  solveStage?: GroupSolveStage;
}

export interface SchedulePreferenceConfig {
  daysOff?: DayOffPreference[];
  session?: string;
  strategy?: string;
  noGaps?: boolean;
}

export interface GroupFitnessConfig extends SchedulePreferenceConfig {
  fairnessWeight: number;
  sharedSlotBonus: number;
  personalPreferenceWeight: number;
  groupPreferenceWeight: number;
  personalPreferenceMissPenalty: number;
  groupPreferenceMissPenalty: number;
  personalRequiredPreferenceWeight: number;
  groupRequiredPreferenceWeight: number;
  personalRequiredPreferenceMissPenalty: number;
  groupRequiredPreferenceMissPenalty: number;
  personalExcludedPreferenceMissPenalty: number;
  groupExcludedPreferenceMissPenalty: number;
  groupPreferredClasses?: ClassPreferenceMap;
  courseSharing?: CourseSharingMap;
}

export interface GroupScheduleItem {
  courseId: string;
  courseName: string;
  classId: string;
  memberIndexes: number[];
  isShared: boolean;
  mask: number[];
  schedule?: string | string[];
}

export interface GroupMemberSchedule {
  memberIndex: number;
  nickname: string;
  items: GroupScheduleItem[];
}

export interface GroupScheduleOption {
  option: number;
  fitness: number;
  assignments: Record<string, string>;
  schedules: GroupMemberSchedule[];
  solveStage?: GroupSolveStage;
  tradeoffs?: GroupScheduleTradeoff[];
}

export type GroupSolveStage = 'shared-strict' | 'split-strict' | 'shared-relaxed' | 'split-relaxed';

export type GroupTradeoffKind = 'group-day-off' | 'personal-day-off' | 'split-shared-course' | 'relaxed-class-preference';

export type GroupTradeoffConfidence = 'observed' | 'proven' | 'inconclusive';

export interface GroupScheduleTradeoff {
  id: string;
  kind: GroupTradeoffKind;
  confidence: GroupTradeoffConfidence;
  title: string;
  description: string;
  courseIds?: string[];
  memberIndexes?: number[];
  canAvoid?: boolean;
}

export interface GroupSolveTrace {
  stage: GroupSolveStage;
  solutionCount: number;
  visitedNodes: number;
  searchBudget: number;
  reachedSearchBudget: boolean;
  reachedSolutionLimit: boolean;
}

export interface GroupScheduleRunResult {
  density: CourseWeight[];
  solutions: GroupScheduleOption[];
  warnings: string[];
  trace?: GroupSolveTrace[];
}
