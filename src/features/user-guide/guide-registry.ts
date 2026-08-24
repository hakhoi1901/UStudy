import { DATA_SYNC_GUIDE } from './data/data-sync-guide';
import { GPA_GUIDE } from './data/gpa-guide';
import { GROUP_PREFERENCES_GUIDE } from './data/group-preferences-guide';
import { GROUP_SCHEDULING_GUIDE } from './data/group-scheduling-guide';
import { IMPORT_ROLLBACK_GUIDE } from './data/import-rollback-guide';
import { PERSONAL_SCHEDULING_GUIDE } from './data/personal-scheduling-guide';
import { STUDY_PLAN_GUIDE } from './data/study-plan-guide';
import type { GuideCategory, UserGuide, UserGuideId } from './types';

export const USER_GUIDES: UserGuide[] = [
  DATA_SYNC_GUIDE,
  STUDY_PLAN_GUIDE,
  GPA_GUIDE,
  PERSONAL_SCHEDULING_GUIDE,
  GROUP_SCHEDULING_GUIDE,
  GROUP_PREFERENCES_GUIDE,
  IMPORT_ROLLBACK_GUIDE,
];

export const USER_GUIDE_BY_ID = new Map<UserGuideId, UserGuide>(
  USER_GUIDES.map((guide) => [guide.id, guide]),
);

export const GUIDE_CATEGORY_LABELS: Record<GuideCategory, string> = {
  'getting-started': 'Bắt đầu',
  study: 'Học tập',
  data: 'Dữ liệu',
};

export function getUserGuide(id: string | undefined): UserGuide | null {
  if (!id) return null;
  return USER_GUIDE_BY_ID.get(id as UserGuideId) ?? null;
}

export function validateGuideRegistry(guides: UserGuide[] = USER_GUIDES): string[] {
  const errors: string[] = [];
  const guideIds = new Set<string>();

  guides.forEach((guide) => {
    if (guideIds.has(guide.id)) errors.push(`Trùng guide id: ${guide.id}`);
    guideIds.add(guide.id);

    const stepIds = new Set<string>();
    guide.steps.forEach((step) => {
      if (stepIds.has(step.id)) errors.push(`Trùng step id ${guide.id}/${step.id}`);
      stepIds.add(step.id);
      if (!step.target.startsWith('[data-guide=')) errors.push(`Target không ổn định ${guide.id}/${step.id}: ${step.target}`);
    });
  });

  return errors;
}
