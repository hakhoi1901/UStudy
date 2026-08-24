import { CircleHelp, RefreshCw } from 'lucide-react';
import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDepartmentData } from '../../../context/DepartmentContext';
import { beginTransientStorageSession, endTransientStorageSession } from '../../../helpers/localStorage/save';
import { AppDialog } from '../../../components/ui/overlays/app-dialog';
import { USER_GUIDE_BY_ID } from '../guide-registry';
import { checkGuidePrerequisite, getGuideAvailability as resolveGuideAvailability } from '../services/guide-availability';
import { trackGuideEvent } from '../services/guide-analytics';
import {
  markGuideCompleted,
  markGuideDismissed,
  markGuideStarted,
  markGuideStep,
  readGuideProgress,
  resetGuideProgress,
} from '../services/guide-storage';
import type { GuideActionId, GuideStep, UserGuide, UserGuideId } from '../types';
import { GuideTour } from '../components/GuideTour';
import { GuideContext, type GuideContextValue, type StartGuideOptions } from './guide-context';
import { GUIDE_DEMO_MANAGED_KEYS, createGuideDemoData } from '../services/guide-demo';
import { requestGroupGuideStep } from '../services/group-guide-runtime';

interface GuideProviderProps {
  children: ReactNode;
}

interface TourIssue {
  guide: UserGuide;
  index: number;
  stepId: string;
}

interface BlockedGuide {
  guide: UserGuide;
  reason: string;
  recommendedGuideId?: UserGuideId;
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

async function waitFor(predicate: () => boolean, timeout = 6000): Promise<boolean> {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeout) {
    if (predicate()) return true;
    await delay(50);
  }
  return predicate();
}

function getDevice(): 'mobile' | 'desktop' {
  return window.matchMedia('(max-width: 767px)').matches ? 'mobile' : 'desktop';
}

export function GuideProvider({ children }: GuideProviderProps) {
  const navigate = useNavigate();
  const { isConfigured, setIsConfigured } = useDepartmentData();
  const actionsRef = useRef(new Map<GuideActionId, () => void | Promise<void>>());
  const [progress, setProgress] = useState(readGuideProgress);
  const [activeGuide, setActiveGuide] = useState<UserGuide | null>(null);
  const [activeSteps, setActiveSteps] = useState<GuideStep[]>([]);
  const [initialStepIndex, setInitialStepIndex] = useState(0);
  const [runToken, setRunToken] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [issue, setIssue] = useState<TourIssue | null>(null);
  const [blockedGuide, setBlockedGuide] = useState<BlockedGuide | null>(null);
  const [isDemoActive, setIsDemoActive] = useState(false);
  const demoOriginalConfiguredRef = useRef<boolean | null>(null);

  const registerAction = useCallback((actionId: GuideActionId, handler: () => void | Promise<void>) => {
    actionsRef.current.set(actionId, handler);
    return () => {
      if (actionsRef.current.get(actionId) === handler) actionsRef.current.delete(actionId);
    };
  }, []);

  const prepareStep = useCallback(async (step: GuideStep) => {
    const targetUrl = new URL(step.route, window.location.origin);
    if (window.location.pathname !== targetUrl.pathname || window.location.search !== targetUrl.search) {
      navigate(`${targetUrl.pathname}${targetUrl.search}`);
      const routeReady = await waitFor(() => (
        window.location.pathname === targetUrl.pathname && window.location.search === targetUrl.search
      ));
      if (!routeReady) throw new Error(`Không thể mở ${step.route}`);
    }

    if (step.beforeAction) {
      const actionReady = await waitFor(() => actionsRef.current.has(step.beforeAction!), 6000);
      if (!actionReady) throw new Error(`Action ${step.beforeAction} chưa sẵn sàng`);
      await actionsRef.current.get(step.beforeAction!)?.();
    }

    await delay(120);
  }, [navigate]);

  const buildSteps = useCallback((guide: UserGuide): GuideStep[] => {
    const device = getDevice();
    return guide.steps.filter((step) => {
      if (step.device && step.device !== 'all' && step.device !== device) return false;
      return checkGuidePrerequisite(step.prerequisite).available;
    });
  }, []);

  const startGuide = useCallback((guideId: UserGuideId, options: StartGuideOptions = {}) => {
    const guide = USER_GUIDE_BY_ID.get(guideId);
    if (!guide) return;

    const availability = resolveGuideAvailability(guide);
    if (!availability.available) {
      setBlockedGuide({ guide, reason: availability.reason || 'Hướng dẫn này chưa sẵn sàng.', recommendedGuideId: availability.recommendedGuideId });
      return;
    }

    const steps = buildSteps(guide);
    if (steps.length === 0) {
      setBlockedGuide({ guide, reason: 'Không có bước hướng dẫn phù hợp với trạng thái hiện tại.' });
      return;
    }

    const current = progress.guides[guide.id];
    const canResume = options.resume === true && current?.guideVersion === guide.version;
    const requestedStepId = options.startStepId || (canResume ? current.lastStepId : null);
    const requestedIndex = requestedStepId ? steps.findIndex((step) => step.id === requestedStepId) : -1;
    const nextIndex = requestedIndex >= 0 ? requestedIndex : 0;

    // CalendarView va GroupScheduleFeature khong mount cung luc. Dat buoc nay
    // truoc khi dieu huong de Group panel render dung ngay tu lan dau tien.
    if (guide.id === 'group-preferences') requestGroupGuideStep(2);
    if (guide.id === 'group-scheduling') requestGroupGuideStep(1);

    setBlockedGuide(null);
    setIssue(null);
    setActiveGuide(guide);
    setActiveSteps(steps);
    setInitialStepIndex(nextIndex);
    setIsRunning(false);
    setProgress(markGuideStarted(guide, steps[nextIndex]?.id ?? null, canResume));
    trackGuideEvent(canResume ? 'Guide Continued' : 'Guide Started', guide, { source: options.source });

    // react-joyride does not provide a per-step async "before" hook. Prepare
    // the first target before starting the tour so route changes and panel
    // switches finish before Joyride tries to find the selector.
    void (async () => {
      try {
        await prepareStep(steps[nextIndex]);
        setRunToken((value) => value + 1);
        setIsRunning(true);
      } catch (error) {
        console.error('[GuideProvider] Không thể chuẩn bị hướng dẫn:', error);
        setBlockedGuide({ guide, reason: 'Không thể mở đúng khu vực hướng dẫn. Hãy thử lại sau.' });
      }
    })();
  }, [buildSteps, prepareStep, progress.guides]);

  const stopDemo = useCallback(() => {
    if (!isDemoActive) return;
    const originalConfigured = demoOriginalConfiguredRef.current;
    if (originalConfigured !== null) setIsConfigured(originalConfigured);
    endTransientStorageSession();
    demoOriginalConfiguredRef.current = null;
    setIsDemoActive(false);
    window.postMessage({ type: 'CACHE_POPULATED' }, '*');
  }, [isDemoActive, setIsConfigured]);

  const startDemoGuide = useCallback(async (guideId: UserGuideId, options: StartGuideOptions = {}) => {
    if (isDemoActive) stopDemo();

    demoOriginalConfiguredRef.current = isConfigured;
    beginTransientStorageSession(createGuideDemoData(guideId), GUIDE_DEMO_MANAGED_KEYS);
    setIsConfigured(true);
    setIsDemoActive(true);
    window.postMessage({ type: 'CACHE_POPULATED' }, '*');

    // Đợi route guard nhận isConfigured=true trước khi tour điều hướng sang tính năng.
    await delay(0);
    startGuide(guideId, { ...options, source: options.source ?? 'guide-demo' });
  }, [isConfigured, isDemoActive, setIsConfigured, startGuide, stopDemo]);

  const stopGuide = useCallback(() => {
    setIsRunning(false);
    setActiveGuide(null);
    setActiveSteps([]);
    setIssue(null);
    stopDemo();
  }, [stopDemo]);

  const resetGuide = useCallback((guideId: UserGuideId) => {
    setProgress(resetGuideProgress(guideId));
  }, []);

  const getProgress = useCallback((guideId: UserGuideId) => progress.guides[guideId] ?? null, [progress.guides]);

  const getAvailability = useCallback((guideId: UserGuideId) => {
    const guide = USER_GUIDE_BY_ID.get(guideId);
    return guide ? resolveGuideAvailability(guide) : { available: false, reason: 'Không tìm thấy hướng dẫn.' };
  }, []);

  const handleStepChange = useCallback((stepId: string) => {
    if (!activeGuide) return;
    setProgress(markGuideStep(activeGuide, stepId));
  }, [activeGuide]);

  const handleComplete = useCallback(() => {
    if (!activeGuide) return;
    setProgress(markGuideCompleted(activeGuide));
    trackGuideEvent('Guide Completed', activeGuide);
    stopGuide();
  }, [activeGuide, stopGuide]);

  const handleDismiss = useCallback((stepId: string | null) => {
    if (!activeGuide) return;
    setProgress(markGuideDismissed(activeGuide, stepId));
    trackGuideEvent('Guide Dismissed', activeGuide, { stepId: stepId ?? undefined });
    stopGuide();
  }, [activeGuide, stopGuide]);

  const handleTargetMissing = useCallback((index: number, stepId: string) => {
    if (!activeGuide) return;
    setIsRunning(false);
    setIssue({ guide: activeGuide, index, stepId });
    setProgress(markGuideStep(activeGuide, stepId));
    trackGuideEvent('Guide Step Missing', activeGuide, { stepId });
  }, [activeGuide]);

  const retryIssue = () => {
    if (!issue) return;
    setIssue(null);
    setInitialStepIndex(issue.index);
    setRunToken((value) => value + 1);
    setIsRunning(true);
  };

  const skipIssue = () => {
    if (!issue) return;
    const nextIndex = issue.index + 1;
    if (nextIndex >= activeSteps.length) {
      handleComplete();
      return;
    }
    setIssue(null);
    setInitialStepIndex(nextIndex);
    setProgress(markGuideStep(issue.guide, activeSteps[nextIndex].id));
    setRunToken((value) => value + 1);
    setIsRunning(true);
  };

  const contextValue = useMemo<GuideContextValue>(() => ({
    activeGuide,
    activeSteps,
    progress,
    isRunning,
    isDemoActive,
    startGuide,
    startDemoGuide,
    stopGuide,
    resetGuide,
    getProgress,
    getAvailability,
    registerAction,
  }), [activeGuide, activeSteps, getAvailability, getProgress, isDemoActive, isRunning, progress, registerAction, resetGuide, startDemoGuide, startGuide, stopGuide]);

  return (
    <GuideContext.Provider value={contextValue}>
      {children}
      <GuideTour
        guide={activeGuide}
        steps={activeSteps}
        run={isRunning}
        runToken={runToken}
        initialStepIndex={initialStepIndex}
        prepareStep={prepareStep}
        onStepChange={handleStepChange}
        onComplete={handleComplete}
        onDismiss={handleDismiss}
        onTargetMissing={handleTargetMissing}
      />

      <AppDialog
        open={Boolean(blockedGuide)}
        onOpenChange={(open) => { if (!open) setBlockedGuide(null); }}
        title="Chưa thể bắt đầu hướng dẫn"
        description={blockedGuide?.guide.title}
        icon={CircleHelp}
        size="sm"
        footer={(
          <>
            <button type="button" onClick={() => setBlockedGuide(null)} className="ustudy-button-outline h-9 px-4 text-sm">Đóng</button>
            {blockedGuide?.recommendedGuideId && (
              <button
                type="button"
                onClick={() => {
                  const recommended = blockedGuide.recommendedGuideId;
                  setBlockedGuide(null);
                  if (recommended) startGuide(recommended, { source: 'blocked-guide' });
                }}
                className="ustudy-button-primary h-9 px-4 text-sm"
              >
                Xem hướng dẫn đồng bộ
              </button>
            )}
          </>
        )}
      >
        <p className="text-sm leading-6 text-gray-600">{blockedGuide?.reason}</p>
      </AppDialog>

      <AppDialog
        open={Boolean(issue)}
        onOpenChange={(open) => { if (!open) handleDismiss(issue?.stepId ?? null); }}
        title="Không tìm thấy vị trí hướng dẫn"
        description={issue?.guide.title}
        icon={RefreshCw}
        size="sm"
        footer={(
          <>
            <button type="button" onClick={() => handleDismiss(issue?.stepId ?? null)} className="ustudy-button-outline h-9 px-4 text-sm">Kết thúc</button>
            <button type="button" onClick={skipIssue} className="ustudy-button-outline h-9 px-4 text-sm">Bỏ qua bước</button>
            <button type="button" onClick={retryIssue} className="ustudy-button-primary h-9 px-4 text-sm"><RefreshCw className="h-4 w-4" />Thử lại</button>
          </>
        )}
      >
        <p className="text-sm leading-6 text-gray-600">
          Thành phần của bước này chưa xuất hiện. Có thể trang vẫn đang tải hoặc trạng thái dữ liệu hiện tại không có thành phần đó.
        </p>
      </AppDialog>
    </GuideContext.Provider>
  );
}
