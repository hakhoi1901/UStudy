import { BookOpen, CalendarDays, Check, DollarSign, RotateCcw, SlidersHorizontal, TrendingUp } from 'lucide-react';
import { AppDialog } from '../../../components/ui/overlays/app-dialog';
import type { DashboardLayoutPreferences, DashboardWidgetId } from '../services/dashboard-layout';
import { DASHBOARD_WIDGET_IDS, DEFAULT_DASHBOARD_LAYOUT } from '../services/dashboard-layout';

interface DashboardCustomizerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  layout: DashboardLayoutPreferences;
  onChange: (layout: DashboardLayoutPreferences) => void;
}

const WIDGET_META: Record<DashboardWidgetId, {
  label: string;
  description: string;
  icon: typeof TrendingUp;
}> = {
  gpa: { label: 'GPA hiện tại', description: 'Điểm trung bình và xếp loại.', icon: TrendingUp },
  credits: { label: 'Tín chỉ tích lũy', description: 'Tiến độ hoàn thành chương trình.', icon: BookOpen },
  tuition: { label: 'Học phí học kỳ', description: 'Số tiền dự kiến và hạn đóng.', icon: DollarSign },
  calendar: { label: 'Lịch sự kiện', description: 'Các sự kiện học tập sắp diễn ra.', icon: CalendarDays },
  creditDistribution: { label: 'Phân bổ tín chỉ', description: 'Tín chỉ theo từng khối kiến thức.', icon: SlidersHorizontal },
};

export function DashboardCustomizerDialog({
  open,
  onOpenChange,
  layout,
  onChange,
}: DashboardCustomizerDialogProps) {
  const hiddenSet = new Set(layout.hidden);

  const toggleWidget = (id: DashboardWidgetId) => {
    const hidden = hiddenSet.has(id)
      ? layout.hidden.filter((widgetId) => widgetId !== id)
      : [...layout.hidden, id];
    onChange({ ...layout, hidden });
  };

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Tùy chỉnh trang tổng quan"
      description="Chọn những thông tin bạn muốn theo dõi trên dashboard."
      icon={SlidersHorizontal}
      size="md"
      footer={(
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-[#004A98] px-5 text-sm font-semibold text-white hover:bg-[#003A78] sm:w-auto"
        >
          Hoàn tất
        </button>
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-3">
        <p className="text-xs font-semibold uppercase text-gray-500">Thẻ hiển thị</p>
        <div className="flex items-center gap-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => onChange({ ...layout, hidden: [] })}
            className="rounded-lg px-2.5 py-1.5 text-[#004A98] hover:bg-blue-50"
          >
            Chọn tất cả
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...layout, hidden: [...DASHBOARD_WIDGET_IDS] })}
            className="rounded-lg px-2.5 py-1.5 text-gray-500 hover:bg-gray-100"
          >
            Bỏ tất cả
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {layout.order.map((id) => {
          const meta = WIDGET_META[id];
          const Icon = meta.icon;
          const isEnabled = !hiddenSet.has(id);
          return (
            <button
              key={id}
              type="button"
              role="switch"
              aria-checked={isEnabled}
              onClick={() => toggleWidget(id)}
              className="flex w-full items-center gap-3 py-3 text-left"
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isEnabled ? 'bg-blue-50 text-[#004A98]' : 'bg-gray-100 text-gray-400'}`}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-gray-900">{meta.label}</span>
                <span className="mt-0.5 block text-xs leading-5 text-gray-500">{meta.description}</span>
              </span>
              <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${isEnabled ? 'bg-[#004A98]' : 'bg-gray-300'}`}>
                <span className={`absolute top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-sm transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`}>
                  {isEnabled && <Check className="h-2.5 w-2.5 text-[#004A98]" />}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => onChange({
          ...layout,
          order: [...DEFAULT_DASHBOARD_LAYOUT.order],
          hidden: [...DEFAULT_DASHBOARD_LAYOUT.hidden],
        })}
        className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      >
        <RotateCcw className="h-4 w-4" />
        Khôi phục mặc định
      </button>
    </AppDialog>
  );
}
