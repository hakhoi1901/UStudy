import { STORAGE_KEYS } from '../../../config';
import { readPlain, savePlain } from '../../../helpers/localStorage/save';
import type { GuideProgressEntry, UserGuide, UserGuideId, UserGuideProgress } from '../types';

export const EMPTY_GUIDE_PROGRESS: UserGuideProgress = {
  schemaVersion: 1,
  guides: {},
};

function isProgressEntry(value: unknown): value is GuideProgressEntry {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Partial<GuideProgressEntry>;
  return Number.isInteger(entry.guideVersion)
    && (entry.status === 'in-progress' || entry.status === 'completed' || entry.status === 'dismissed')
    && typeof entry.startedAt === 'string'
    && typeof entry.updatedAt === 'string'
    && (entry.lastStepId === null || typeof entry.lastStepId === 'string')
    && (entry.completedAt === null || typeof entry.completedAt === 'string');
}

export function normalizeGuideProgress(value: unknown): UserGuideProgress {
  if (!value || typeof value !== 'object') return EMPTY_GUIDE_PROGRESS;
  const candidate = value as Partial<UserGuideProgress>;
  if (candidate.schemaVersion !== 1 || !candidate.guides || typeof candidate.guides !== 'object') {
    return EMPTY_GUIDE_PROGRESS;
  }

  const guides = Object.fromEntries(
    Object.entries(candidate.guides).filter((entry): entry is [UserGuideId, GuideProgressEntry] => isProgressEntry(entry[1])),
  );

  return { schemaVersion: 1, guides };
}

export function readGuideProgress(): UserGuideProgress {
  return normalizeGuideProgress(readPlain<unknown>(STORAGE_KEYS.USER_GUIDE_PROGRESS, EMPTY_GUIDE_PROGRESS));
}

export function writeGuideProgress(progress: UserGuideProgress): UserGuideProgress {
  const normalized = normalizeGuideProgress(progress);
  savePlain(STORAGE_KEYS.USER_GUIDE_PROGRESS, normalized);
  return normalized;
}

function updateGuideEntry(
  guide: UserGuide,
  updater: (current: GuideProgressEntry | null, now: string) => GuideProgressEntry,
): UserGuideProgress {
  const progress = readGuideProgress();
  const current = progress.guides[guide.id] ?? null;
  const now = new Date().toISOString();
  return writeGuideProgress({
    ...progress,
    guides: {
      ...progress.guides,
      [guide.id]: updater(current, now),
    },
  });
}

export function markGuideStarted(guide: UserGuide, firstStepId: string | null, preserveCurrent = true): UserGuideProgress {
  return updateGuideEntry(guide, (current, now) => {
    const sameVersion = preserveCurrent && current?.guideVersion === guide.version;
    return {
      guideVersion: guide.version,
      status: 'in-progress',
      lastStepId: sameVersion ? current.lastStepId ?? firstStepId : firstStepId,
      startedAt: sameVersion ? current.startedAt : now,
      updatedAt: now,
      completedAt: null,
    };
  });
}

export function markGuideStep(guide: UserGuide, stepId: string): UserGuideProgress {
  return updateGuideEntry(guide, (current, now) => ({
    guideVersion: guide.version,
    status: 'in-progress',
    lastStepId: stepId,
    startedAt: current?.guideVersion === guide.version ? current.startedAt : now,
    updatedAt: now,
    completedAt: null,
  }));
}

export function markGuideCompleted(guide: UserGuide): UserGuideProgress {
  return updateGuideEntry(guide, (current, now) => ({
    guideVersion: guide.version,
    status: 'completed',
    lastStepId: guide.steps.at(-1)?.id ?? null,
    startedAt: current?.guideVersion === guide.version ? current.startedAt : now,
    updatedAt: now,
    completedAt: now,
  }));
}

export function markGuideDismissed(guide: UserGuide, stepId: string | null): UserGuideProgress {
  return updateGuideEntry(guide, (current, now) => ({
    guideVersion: guide.version,
    status: 'dismissed',
    lastStepId: stepId,
    startedAt: current?.guideVersion === guide.version ? current.startedAt : now,
    updatedAt: now,
    completedAt: null,
  }));
}

export function resetGuideProgress(guideId: UserGuideId): UserGuideProgress {
  const progress = readGuideProgress();
  const guides = { ...progress.guides };
  delete guides[guideId];
  return writeGuideProgress({ ...progress, guides });
}
