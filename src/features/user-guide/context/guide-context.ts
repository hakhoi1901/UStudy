import { createContext, useContext } from 'react';
import type { GuideActionId, GuideAvailability, GuideProgressEntry, GuideStep, UserGuide, UserGuideId, UserGuideProgress } from '../types';

export interface StartGuideOptions {
  resume?: boolean;
  source?: string;
  startStepId?: string;
}

export interface GuideContextValue {
  activeGuide: UserGuide | null;
  activeSteps: GuideStep[];
  progress: UserGuideProgress;
  isRunning: boolean;
  isDemoActive: boolean;
  startGuide: (guideId: UserGuideId, options?: StartGuideOptions) => void;
  startDemoGuide: (guideId: UserGuideId, options?: StartGuideOptions) => Promise<void>;
  stopGuide: () => void;
  resetGuide: (guideId: UserGuideId) => void;
  getProgress: (guideId: UserGuideId) => GuideProgressEntry | null;
  getAvailability: (guideId: UserGuideId) => GuideAvailability;
  registerAction: (actionId: GuideActionId, handler: () => void | Promise<void>) => () => void;
}

export const GuideContext = createContext<GuideContextValue | null>(null);

export function useUserGuide(): GuideContextValue {
  const value = useContext(GuideContext);
  if (!value) throw new Error('useUserGuide must be used inside GuideProvider');
  return value;
}
