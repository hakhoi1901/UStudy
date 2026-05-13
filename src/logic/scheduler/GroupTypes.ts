export interface GroupMemberToken {
  nickname?: string;
  sharedCourses: string[];
  personalCourses: string[];
  busyMask: number[];
  preferredClasses?: Record<string, string[]>;
  personalConfig?: SchedulePreferenceConfig;
}

export interface CourseWeight {
  courseId: string;
  subscribers: number[];
  isShared: boolean;
}

export type StateMatrix = number[][];

export interface GroupSolution {
  assignments: Map<string, string>;
  stateMatrix: StateMatrix;
}

export interface SchedulePreferenceConfig {
  daysOff?: number[];
  session?: string;
  strategy?: string;
  noGaps?: boolean;
}

export interface GroupFitnessConfig extends SchedulePreferenceConfig {
  fairnessWeight: number;
  sharedSlotBonus: number;
  personalPreferenceWeight: number;
  groupPreferenceWeight: number;
  groupPreferredClasses?: Record<string, string[]>;
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
}

export interface GroupScheduleRunResult {
  density: CourseWeight[];
  solutions: GroupScheduleOption[];
  warnings: string[];
}
