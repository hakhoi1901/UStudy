import { CircleHelp, Play, RotateCcw } from 'lucide-react';
import { USER_GUIDE_BY_ID } from '../guide-registry';
import { useUserGuide } from '../context/guide-context';
import type { UserGuideId } from '../types';

interface GuideLauncherProps {
  guideId: UserGuideId;
  variant?: 'icon' | 'button' | 'text';
  label?: string;
  className?: string;
  source?: string;
}

export function GuideLauncher({ guideId, variant = 'button', label, className = '', source = 'feature' }: GuideLauncherProps) {
  const { getProgress, startGuide } = useUserGuide();
  const guide = USER_GUIDE_BY_ID.get(guideId);
  const progress = getProgress(guideId);
  const canResume = Boolean(guide && progress?.guideVersion === guide.version && progress.status !== 'completed');
  const text = label || (canResume ? 'Tiếp tục hướng dẫn' : 'Hướng dẫn');

  if (!guide) return null;

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={() => startGuide(guideId, { resume: canResume, source })}
        className={`ustudy-action-icon h-9 w-9 ${className}`.trim()}
        title={`${text}: ${guide.shortTitle}`}
        aria-label={`${text}: ${guide.shortTitle}`}
      >
        <CircleHelp className="h-4.5 w-4.5" />
      </button>
    );
  }

  if (variant === 'text') {
    return (
      <button
        type="button"
        onClick={() => startGuide(guideId, { resume: canResume, source })}
        className={`inline-flex items-center gap-1.5 text-sm font-semibold text-[#004A98] transition-colors hover:text-[#003A78] ${className}`.trim()}
      >
        <Play className="h-4 w-4" />{text}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => startGuide(guideId, { resume: canResume, source })}
      className={`ustudy-button-outline h-9 px-3 text-sm ${className}`.trim()}
    >
      {canResume ? <RotateCcw className="h-4 w-4" /> : <CircleHelp className="h-4 w-4" />}
      <span className="hidden sm:inline">{text}</span>
      <span className="sm:hidden">Trợ giúp</span>
    </button>
  );
}
