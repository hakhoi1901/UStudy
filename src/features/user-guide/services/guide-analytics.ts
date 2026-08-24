import { track } from '@vercel/analytics';
import type { UserGuide, UserGuideId } from '../types';

type GuideEventName = 'Guide Started' | 'Guide Continued' | 'Guide Completed' | 'Guide Dismissed' | 'Guide Step Missing';

export function trackGuideEvent(
  name: GuideEventName,
  guide: Pick<UserGuide, 'id' | 'version'> | { id: UserGuideId; version: number },
  properties: { stepId?: string; source?: string } = {},
): void {
  try {
    track(name, {
      guideId: guide.id,
      guideVersion: guide.version,
      stepId: properties.stepId,
      source: properties.source,
    });
  } catch {
    // Analytics must never interrupt the guide or user workflow.
  }
}
