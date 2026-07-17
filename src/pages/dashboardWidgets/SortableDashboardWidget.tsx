import type { ReactNode } from 'react';
import { EyeOff, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { DashboardWidgetId } from './dashboard-layout';

interface SortableDashboardWidgetProps {
  id: DashboardWidgetId;
  label: string;
  isEditing: boolean;
  className?: string;
  onHide: (id: DashboardWidgetId) => void;
  children: ReactNode;
}

export function SortableDashboardWidget({
  id,
  label,
  isEditing,
  className = '',
  onHide,
  children,
}: SortableDashboardWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !isEditing });

  return (
    <div
      ref={setNodeRef}
      className={`relative min-w-0 ${className} ${isDragging ? 'z-30 opacity-80' : ''}`}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      {isEditing && (
        <div className="absolute right-2 top-2 z-20 flex items-center overflow-hidden rounded-lg border border-blue-200 bg-white shadow-md">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="inline-flex h-9 w-9 touch-none cursor-grab items-center justify-center text-[#004A98] hover:bg-blue-50 active:cursor-grabbing"
            title={`Kéo để đổi vị trí ${label}`}
            aria-label={`Kéo để đổi vị trí ${label}`}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <span className="h-5 w-px bg-gray-200" />
          <button
            type="button"
            onClick={() => onHide(id)}
            className="inline-flex h-9 w-9 items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            title={`Ẩn ${label}`}
            aria-label={`Ẩn ${label}`}
          >
            <EyeOff className="h-4 w-4" />
          </button>
        </div>
      )}
      {children}
    </div>
  );
}
