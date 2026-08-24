import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DATA_SYNC_GUIDE } from '../../../src/features/user-guide/data/data-sync-guide';
import {
  EMPTY_GUIDE_PROGRESS,
  markGuideCompleted,
  markGuideDismissed,
  markGuideStarted,
  markGuideStep,
  normalizeGuideProgress,
  readGuideProgress,
  resetGuideProgress,
} from '../../../src/features/user-guide/services/guide-storage';

describe('guide progress storage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-24T10:00:00.000Z'));
  });

  it('falls back safely for malformed stored values', () => {
    expect(normalizeGuideProgress(null)).toEqual(EMPTY_GUIDE_PROGRESS);
    expect(normalizeGuideProgress({ schemaVersion: 2, guides: {} })).toEqual(EMPTY_GUIDE_PROGRESS);
    expect(normalizeGuideProgress({ schemaVersion: 1, guides: { broken: { status: 'done' } } })).toEqual(EMPTY_GUIDE_PROGRESS);
  });

  it('records start, current step and completion', () => {
    markGuideStarted(DATA_SYNC_GUIDE, 'sync-tools', false);
    expect(readGuideProgress().guides['data-sync']).toMatchObject({
      guideVersion: 1,
      status: 'in-progress',
      lastStepId: 'sync-tools',
    });

    vi.setSystemTime(new Date('2026-08-24T10:02:00.000Z'));
    markGuideStep(DATA_SYNC_GUIDE, 'file-import');
    expect(readGuideProgress().guides['data-sync']?.lastStepId).toBe('file-import');

    markGuideCompleted(DATA_SYNC_GUIDE);
    expect(readGuideProgress().guides['data-sync']).toMatchObject({
      status: 'completed',
      completedAt: '2026-08-24T10:02:00.000Z',
    });
  });

  it('can dismiss, replay and reset a guide', () => {
    markGuideStarted(DATA_SYNC_GUIDE, 'sync-tools', false);
    markGuideDismissed(DATA_SYNC_GUIDE, 'portal-tools');
    expect(readGuideProgress().guides['data-sync']?.status).toBe('dismissed');

    markGuideStarted(DATA_SYNC_GUIDE, 'sync-tools', false);
    expect(readGuideProgress().guides['data-sync']?.lastStepId).toBe('sync-tools');

    resetGuideProgress('data-sync');
    expect(readGuideProgress().guides['data-sync']).toBeUndefined();
  });
});
