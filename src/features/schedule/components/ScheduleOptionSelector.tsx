import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { AppSelect } from '../../../components/ui/form';

export interface ScheduleOptionItem {
  id: string | number;
  label: string;
}

interface ScheduleOptionSelectorProps {
  options: ScheduleOptionItem[];
  activeIndex: number;
  onChange: (index: number) => void;
  className?: string;
  selectThreshold?: number; // Kept for API compatibility, though unused now
}

export function ScheduleOptionSelector({
  options,
  activeIndex,
  onChange,
  className = '',
}: ScheduleOptionSelectorProps) {
  if (options.length < 2) return null;

  const safeActiveIndex = Math.min(Math.max(activeIndex, 0), options.length - 1);
  const PAGE_SIZE = 5;
  const currentPage = Math.floor(safeActiveIndex / PAGE_SIZE);
  const startIndex = currentPage * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, options.length);
  const visibleOptions = options.slice(startIndex, endIndex);

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="shrink-0 pr-1 text-xs font-medium text-gray-500">Phương án</span>

      <AppSelect
        value={String(safeActiveIndex)}
        onChange={(value) => onChange(Number(value))}
        options={options.map((option, index) => ({ id: String(index), name: option.label }))}
        ariaLabel="Chọn phương án"
        className="min-w-28 shrink-0"
        triggerClassName="h-8 px-2 py-0 text-xs font-semibold"
      />

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, safeActiveIndex - PAGE_SIZE))}
          disabled={safeActiveIndex < PAGE_SIZE}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Lùi 5 phương án"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => onChange(Math.max(0, safeActiveIndex - 1))}
          disabled={safeActiveIndex === 0}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Phương án trước"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1">
          {visibleOptions.map((option, index) => {
            const actualIndex = startIndex + index;
            // Trim "PA " from the label if it exists, otherwise use the whole label
            const labelText = option.label.replace(/^PA\s*/i, '');
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onChange(actualIndex)}
                className={`h-8 shrink-0 rounded-lg px-3 text-xs font-semibold transition-colors ${
                  safeActiveIndex === actualIndex
                    ? 'bg-[#004A98] text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {labelText}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onChange(Math.min(options.length - 1, safeActiveIndex + 1))}
          disabled={safeActiveIndex === options.length - 1}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Phương án tiếp theo"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => onChange(Math.min(options.length - 1, safeActiveIndex + PAGE_SIZE))}
          disabled={safeActiveIndex + PAGE_SIZE >= options.length && safeActiveIndex === options.length - 1}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Tiến 5 phương án"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
