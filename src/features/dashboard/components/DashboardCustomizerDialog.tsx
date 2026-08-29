import { BookOpen, CalendarDays, DollarSign, Eye, EyeOff, RotateCcw, SlidersHorizontal, TrendingUp } from 'lucide-react';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { AppDialog } from '../../../components/ui/overlays/app-dialog';
import type { DashboardLayoutPreferences, DashboardWidgetId } from '../services/dashboard-layout';
import { DASHBOARD_WIDGET_IDS, DEFAULT_DASHBOARD_LAYOUT } from '../services/dashboard-layout';
import { DashboardCustomizerItem } from './DashboardCustomizerItem';

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
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const hiddenSet = new Set(layout.hidden);
  const visibleCount = layout.order.length - layout.hidden.length;

  const toggleWidget = (id: DashboardWidgetId) => {
    const hidden = hiddenSet.has(id)
      ? layout.hidden.filter((widgetId) => widgetId !== id)
      : [...layout.hidden, id];
    onChange({ ...layout, hidden });
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const oldIndex = layout.order.indexOf(active.id as DashboardWidgetId);
    const newIndex = layout.order.indexOf(over.id as DashboardWidgetId);
    if (oldIndex < 0 || newIndex < 0) return;
    onChange({ ...layout, order: arrayMove(layout.order, oldIndex, newIndex) });
  };

  const restoreDefaults = () => {
    onChange({
      ...layout,
      order: [...DEFAULT_DASHBOARD_LAYOUT.order],
      hidden: [...DEFAULT_DASHBOARD_LAYOUT.hidden],
    });
  };

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Tùy chỉnh trang tổng quan"
      description="Chọn thẻ muốn theo dõi và kéo để sắp xếp lại vị trí."
      icon={SlidersHorizontal}
      size="md"
      footer={(
        <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={restoreDefaults}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004A98]/30"
          >
            <RotateCcw className="h-4 w-4" />
            Khôi phục mặc định
          </button>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#004A98] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#003A78] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004A98]/30 focus-visible:ring-offset-2"
          >
            Hoàn tất
          </button>
        </div>
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">Thẻ tổng quan</p>
          <p className="mt-0.5 text-xs text-gray-500">{visibleCount}/{layout.order.length} thẻ đang hiển thị</p>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => onChange({ ...layout, hidden: [] })}
            disabled={layout.hidden.length === 0}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[#004A98] transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Eye className="h-3.5 w-3.5" />
            Hiện tất cả
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...layout, hidden: [...DASHBOARD_WIDGET_IDS] })}
            disabled={visibleCount === 0}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <EyeOff className="h-3.5 w-3.5" />
            Ẩn tất cả
          </button>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={layout.order} strategy={verticalListSortingStrategy}>
          <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
            {layout.order.map((id) => {
              const meta = WIDGET_META[id];
              return (
                <DashboardCustomizerItem
                  key={id}
                  id={id}
                  label={meta.label}
                  description={meta.description}
                  icon={meta.icon}
                  enabled={!hiddenSet.has(id)}
                  onToggle={() => toggleWidget(id)}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </AppDialog>
  );
}
