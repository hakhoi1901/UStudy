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
  groupClassPreferences?: Record<string, ClassPreferenceSelection>;
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
  sharingGroupId: string;
  sharingGroupLabel: string;
  classPreferences?: ClassPreferenceSelection;
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
  sharingGroupId?: string;
  sharingGroupLabel?: string;
}

export interface GroupShareConfig {
  groupPreferredClasses?: ClassPreferenceMap;
  courseSharing?: CourseSharingMap;
  groupPreferences?: SchedulePreferenceConfig;
}

export interface GroupSharePayload {
  members: GroupMemberToken[];
  config?: GroupShareConfig;
}

export type GroupConfigurationIssueSeverity = 'error' | 'warning';

export interface GroupConfigurationIssue {
  id: string;
  severity: GroupConfigurationIssueSeverity;
  courseId: string;
  groupId: string;
  title: string;
  description: string;
  memberIndexes: number[];
  rejectedClasses?: Array<{ classId: string; reasons: string[] }>;
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
