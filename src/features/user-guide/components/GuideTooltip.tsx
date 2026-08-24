import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { TooltipRenderProps } from 'react-joyride';

export function GuideTooltip({
  backProps,
  closeProps,
  index,
  isLastStep,
  primaryProps,
  size,
  skipProps,
  step,
  tooltipProps,
}: TooltipRenderProps) {
  return (
    <div
      {...tooltipProps}
      className="ustudy-guide-tooltip overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl"
    >
      <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-4 py-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase text-[#004A98]">Hướng dẫn UStudy</p>
          <h2 className="mt-0.5 text-[15px] font-semibold text-gray-900">{step.title}</h2>
        </div>
        <button
          {...closeProps}
          type="button"
          className="ustudy-action-icon h-8 w-8 shrink-0"
          aria-label="Thoát hướng dẫn"
          title="Thoát hướng dẫn"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="max-h-[min(42vh,260px)] overflow-y-auto px-4 py-4 scrollbar-hide">
        <div className="text-sm leading-6 text-gray-600">{step.content}</div>
      </div>

      <div className="border-t border-gray-100 bg-gray-50/80 px-4 py-3">
        <div className="mb-3 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
            <div className="h-full rounded-full bg-[#004A98] transition-[width]" style={{ width: `${((index + 1) / size) * 100}%` }} />
          </div>
          <span className="shrink-0 text-xs font-semibold tabular-nums text-gray-500">{index + 1}/{size}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <button {...skipProps} type="button" className="text-xs font-semibold text-gray-500 transition-colors hover:text-gray-800">
            Bỏ qua
          </button>
          <div className="flex items-center gap-2">
            {index > 0 && (
              <button {...backProps} type="button" className="ustudy-button-outline h-9 px-3 text-xs">
                <ChevronLeft className="h-4 w-4" />Quay lại
              </button>
            )}
            <button {...primaryProps} type="button" className="ustudy-button-primary h-9 px-4 text-xs">
              {isLastStep ? 'Hoàn thành' : 'Tiếp theo'}
              {!isLastStep && <ChevronRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
