export const GUIDE_IDS = [
  'data-sync',
  'study-plan',
  'gpa',
  'personal-scheduling',
  'group-scheduling',
  'group-preferences',
  'import-rollback',
] as const;

export type UserGuideId = (typeof GUIDE_IDS)[number];
export type GuideCategory = 'getting-started' | 'study' | 'data';
export type GuideDevice = 'all' | 'desktop' | 'mobile';
export type GuideStatus = 'in-progress' | 'completed' | 'dismissed';
export type GuidePrerequisite = 'configured' | 'student-data' | 'selected-courses' | 'group-members' | 'group-result' | 'import-history';

export type GuideActionId =
  | 'show-gpa-plan'
  | 'show-personal-schedule'
  | 'show-group-schedule'
  | 'show-group-members'
  | 'show-group-preferences'
  | 'expand-group-class-preference'
  | 'expand-course-sharing'
  | 'enable-course-sharing-split'
  | 'show-group-results'
  | 'open-data-center';

export type GuideBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'notice'; tone: 'info' | 'warning' | 'success'; title: string; text: string };

export interface GuideSection {
  id: string;
  title: string;
  blocks: GuideBlock[];
}

export interface GuideStep {
  id: string;
  route: string;
  target: string;
  title: string;
  content: string;
  placement?: 'top' | 'top-start' | 'top-end' | 'right' | 'right-start' | 'right-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'auto' | 'center';
  device?: GuideDevice;
  beforeAction?: GuideActionId;
  prerequisite?: GuidePrerequisite;
}

export interface UserGuide {
  id: UserGuideId;
  version: number;
  title: string;
  shortTitle: string;
  description: string;
  category: GuideCategory;
  estimatedMinutes: number;
  route: string;
  prerequisite?: GuidePrerequisite;
  sections: GuideSection[];
  steps: GuideStep[];
}

export interface GuideProgressEntry {
  guideVersion: number;
  status: GuideStatus;
  lastStepId: string | null;
  startedAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface UserGuideProgress {
  schemaVersion: 1;
  guides: Partial<Record<UserGuideId, GuideProgressEntry>>;
}

export interface GuideAvailability {
  available: boolean;
  reason?: string;
  recommendedGuideId?: UserGuideId;
}
