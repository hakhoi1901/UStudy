import { Calendar, LayoutList, UsersRound } from 'lucide-react';
import type { GroupScheduleResultViewMode } from './GroupScheduleResult';

type GroupScheduleDisplayMode = 'calendar' | GroupScheduleResultViewMode;

interface GroupScheduleResultViewTabsProps {
  value: GroupScheduleDisplayMode;
  onChange: (value: GroupScheduleDisplayMode) => void;
}

const views: Array<{
  id: GroupScheduleDisplayMode;
  label: string;
  icon: typeof Calendar;
}> = [
  { id: 'calendar', label: 'Tổng quát', icon: Calendar },
  { id: 'course', label: 'Theo môn', icon: LayoutList },
  { id: 'member', label: 'Theo thành viên', icon: UsersRound },
];

export function GroupScheduleResultViewTabs({ value, onChange }: GroupScheduleResultViewTabsProps) {
  return (
    <div className="mb-4 flex overflow-x-auto rounded-xl bg-gray-100 p-1" aria-label="Chế độ xem kết quả">
      {views.map((view) => {
        const Icon = view.icon;
        const isActive = value === view.id;

        return (
          <button
            key={view.id}
            type="button"
            onClick={() => onChange(view.id)}
            className={`flex min-w-max flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all sm:text-sm ${
              isActive ? 'bg-white text-[#004A98] shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="h-4 w-4" />
            {view.label}
          </button>
        );
      })}
    </div>
  );
}
