import type { LucideIcon } from 'lucide-react';
import { GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import type { DashboardWidgetId } from '../services/dashboard-layout';

interface DashboardCustomizerItemProps {
  id: DashboardWidgetId;
  label: string;
  description: string;
  icon: LucideIcon;
  enabled: boolean;
  onToggle: () => void;
}

export function DashboardCustomizerItem({
  id,
  label,
  description,
  icon: Icon,
  enabled,
  onToggle,
}: DashboardCustomizerItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`relative flex min-h-16 items-center gap-2.5 px-2 py-2.5 sm:gap-3 sm:px-3 ${isDragging
        ? 'z-20 rounded-lg bg-white shadow-lg ring-1 ring-[#004A98]/20'
        : enabled
          ? 'bg-white'
          : 'bg-gray-50/80'
        }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="inline-flex h-10 w-8 shrink-0 touch-none cursor-grab items-center justify-center rounded-lg text-gray-400 outline-none transition-colors hover:bg-gray-100 hover:text-[#004A98] focus-visible:ring-2 focus-visible:ring-[#004A98]/30 active:cursor-grabbing"
        aria-label={`Kéo để đổi vị trí ${label}`}
        title={`Kéo để đổi vị trí ${label}`}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${enabled ? 'bg-[#EAF3FF] text-[#004A98]' : 'bg-gray-100 text-gray-400'}`}>
        <Icon className="h-4 w-4" />
      </span>

      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-semibold ${enabled ? 'text-gray-900' : 'text-gray-500'}`}>
          {label}
        </p>
        <p className="mt-0.5 hidden truncate text-xs text-gray-500 sm:block">{description}</p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={onToggle}
        className={`relative h-6 w-11 shrink-0 rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#004A98]/30 focus-visible:ring-offset-2 ${enabled ? 'bg-[#004A98]' : 'bg-gray-300'}`}
        aria-label={`${enabled ? 'Ẩn' : 'Hiện'} ${label}`}
        title={`${enabled ? 'Ẩn' : 'Hiện'} ${label}`}
      >
        <span className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}
