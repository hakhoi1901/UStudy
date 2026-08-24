import { ACTIONS, EVENTS, Joyride, STATUS, type EventData, type Step } from 'react-joyride';
import { useEffect, useRef } from 'react';
import type { GuideStep, UserGuide } from '../types';
import { GuideTooltip } from './GuideTooltip';

interface GuideTourProps {
  guide: UserGuide | null;
  steps: GuideStep[];
  run: boolean;
  runToken: number;
  initialStepIndex: number;
  prepareStep: (step: GuideStep) => Promise<void>;
  onStepChange: (stepId: string) => void;
  onComplete: () => void;
  onDismiss: (stepId: string | null) => void;
  onTargetMissing: (index: number, stepId: string) => void;
}

function isMobileViewport(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
}

const mobileSheetMiddleware = {
  name: 'ustudy-mobile-guide-sheet',
  fn: ({ rects }: { rects: { floating: { height: number } } }) => ({
    x: 12,
    y: Math.max(12, window.innerHeight - rects.floating.height - 76),
  }),
};

export function GuideTour({
  guide,
  steps,
  run,
  runToken,
  initialStepIndex,
  prepareStep,
  onStepChange,
  onComplete,
  onDismiss,
  onTargetMissing,
}: GuideTourProps) {
  const currentIndexRef = useRef(initialStepIndex);

  useEffect(() => {
    currentIndexRef.current = initialStepIndex;
  }, [guide?.id, initialStepIndex, runToken]);

  useEffect(() => {
    if (!run || !guide || steps.length === 0) return undefined;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopImmediatePropagation();
      onDismiss(steps[currentIndexRef.current]?.id ?? null);
    };

    document.addEventListener('keydown', handleEscape, true);
    return () => document.removeEventListener('keydown', handleEscape, true);
  }, [guide, onDismiss, run, steps]);

  if (!guide || steps.length === 0) return null;

  const mobile = isMobileViewport();
  const joyrideSteps: Step[] = steps.map((step) => ({
    id: step.id,
    target: step.target,
    title: step.title,
    content: step.content,
    placement: mobile ? 'bottom' : step.placement ?? 'auto',
    skipBeacon: true,
    targetWaitTimeout: 10000,
    beforeTimeout: 12000,
    blockTargetInteraction: false,
    spotlightPadding: mobile ? 6 : 10,
    spotlightRadius: 8,
    before: async () => prepareStep(step),
    data: { guideId: guide.id, stepId: step.id },
    ...(mobile ? {
      isFixed: true,
      floatingOptions: {
        strategy: 'fixed',
        hideArrow: true,
        flipOptions: false,
        middleware: [mobileSheetMiddleware],
      },
    } : {}),
  }));

  const handleEvent = (event: EventData) => {
    currentIndexRef.current = event.index;

    if (event.type === EVENTS.STEP_AFTER) {
      const nextIndex = event.action === ACTIONS.PREV ? event.index - 1 : event.index + 1;
      const nextStep = steps[nextIndex];
      if (nextStep) onStepChange(nextStep.id);
    }

    if (event.type === EVENTS.TARGET_NOT_FOUND) {
      onTargetMissing(event.index, steps[event.index]?.id ?? 'unknown');
    }

    if (event.type === EVENTS.TOUR_END) {
      if (event.status === STATUS.FINISHED) onComplete();
      if (event.status === STATUS.SKIPPED) onDismiss(steps[event.index]?.id ?? null);
    }
  };

  return (
    <Joyride
      key={`${guide.id}-${runToken}-${initialStepIndex}`}
      run={run}
      steps={joyrideSteps}
      initialStepIndex={initialStepIndex}
      continuous
      scrollToFirstStep
      tooltipComponent={GuideTooltip}
      onEvent={handleEvent}
      locale={{ back: 'Quay lại', close: 'Đóng', last: 'Hoàn thành', next: 'Tiếp theo', nextWithProgress: 'Tiếp theo ({current}/{total})', skip: 'Bỏ qua' }}
      options={{
        buttons: ['back', 'close', 'primary', 'skip'],
        closeButtonAction: 'skip',
        dismissKeyAction: false,
        overlayClickAction: false,
        overlayColor: 'rgba(15, 23, 42, 0.62)',
        primaryColor: '#004A98',
        backgroundColor: '#FFFFFF',
        textColor: '#111827',
        zIndex: 9800,
        showProgress: true,
        width: mobile ? 'calc(100vw - 24px)' : 360,
      }}
    />
  );
}
