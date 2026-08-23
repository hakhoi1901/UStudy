export type ScheduleMode = 'personal' | 'group';

interface ScheduleModeToggleProps {
  mode: ScheduleMode;
  onChange: (mode: ScheduleMode) => void;
}

export function ScheduleModeToggle({ mode, onChange }: ScheduleModeToggleProps) {
  return (
    <div className="flex w-full shrink-0 items-center rounded-lg border border-gray-200 bg-slate-50 p-1 md:inline-flex md:w-auto">
      <button
        type="button"
        onClick={() => onChange('personal')}
        className={`flex-1 rounded-md px-4 py-1.5 text-sm font-medium transition-colors md:flex-none ${
          mode === 'personal'
            ? 'bg-white text-[#004A98] shadow-sm'
            : 'text-gray-500 hover:text-gray-900'
        }`}
      >
        Cá nhân
      </button>
      <button
        type="button"
        onClick={() => onChange('group')}
        className={`flex-1 rounded-md px-4 py-1.5 text-sm font-medium transition-colors md:flex-none ${
          mode === 'group'
            ? 'bg-white text-[#004A98] shadow-sm'
            : 'text-gray-500 hover:text-gray-900'
        }`}
      >
        Nhóm
      </button>
    </div>
  );
}
