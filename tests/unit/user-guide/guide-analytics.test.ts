import { beforeEach, describe, expect, it, vi } from 'vitest';

const { trackMock } = vi.hoisted(() => ({ trackMock: vi.fn() }));

vi.mock('@vercel/analytics', () => ({
  track: trackMock,
}));

import { trackGuideEvent } from '../../../src/features/user-guide/services/guide-analytics';

describe('guide analytics', () => {
  beforeEach(() => {
    trackMock.mockReset();
  });

  it('only sends guide metadata and the launcher source', () => {
    trackGuideEvent('Guide Started', { id: 'gpa', version: 2 }, {
      stepId: 'gpa-target',
      source: 'gpa-header',
    });

    expect(trackMock).toHaveBeenCalledWith('Guide Started', {
      guideId: 'gpa',
      guideVersion: 2,
      stepId: 'gpa-target',
      source: 'gpa-header',
    });
  });

  it('never interrupts the guide if analytics throws', () => {
    trackMock.mockImplementationOnce(() => {
      throw new Error('analytics unavailable');
    });

    expect(() => trackGuideEvent('Guide Dismissed', { id: 'study-plan', version: 1 })).not.toThrow();
  });
});
