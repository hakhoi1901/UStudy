import { Cpu, List, Save, Settings, Trash2 } from 'lucide-react';
import type { SavedSchedule } from '../../../types';

// ─── Props ──────────────────────────────────────────────────────────────────

interface BuilderToolbarProps {
  hasSelections: boolean;
  solving: boolean;
  savedSchedulesCount: number;
  onFullSolve: () => void;
  onOpenConfig: () => void;
  onOpenSavedList: () => void;
  onSave: () => void;
  onClear: () => void;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function BuilderToolbar({
  hasSelections,
  solving,
  savedSchedulesCount,
  onFullSolve,
  onOpenConfig,
  onOpenSavedList,
  onSave,
  onClear,
}: BuilderToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onOpenConfig}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 transition-colors hover:border-[#004A98]/40 hover:bg-blue-50 hover:text-[#004A98]"
        title="Cấu hình ưu tiên"
      >
        <Settings className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Cấu hình</span>
      </button>

      <button
        type="button"
        onClick={onOpenSavedList}
        className="relative inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 transition-colors hover:border-[#004A98]/40 hover:bg-blue-50 hover:text-[#004A98]"
      >
        <List className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Lịch đã lưu</span>
        {savedSchedulesCount > 0 && (
          <span className="ustudy-badge-count text-[9px] font-bold">
            {savedSchedulesCount > 99 ? '99+' : savedSchedulesCount}
          </span>
        )}
      </button>

      <div className="hidden h-5 w-px bg-gray-200 sm:block" />

      {hasSelections && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-red-600 transition-colors hover:border-red-200 hover:bg-red-50"
          title="Xóa tất cả"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Xóa</span>
        </button>
      )}

      <div className="flex-1" />

      {hasSelections && (
        <button
          type="button"
          onClick={onSave}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
        >
          <Save className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Lưu phương án</span>
          <span className="sm:hidden">Lưu</span>
        </button>
      )}
      
      <button
        type="button"
        onClick={onFullSolve}
        disabled={solving}
        className="ustudy-button-primary h-9 px-4 text-xs disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Cpu className="h-3.5 w-3.5" />
        {solving ? 'Đang xếp...' : 'Xếp tự động'}
      </button>
    </div>
  );
}
