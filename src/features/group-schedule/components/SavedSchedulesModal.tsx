import { CalendarClock, Check, List, Trash2 } from 'lucide-react';
import { AppDialog } from '../../../components/ui/overlays/app-dialog';
import type { SavedSchedule } from '../../../types';

interface SavedSchedulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedSchedules: SavedSchedule[];
  onLoadSchedule: (saved: SavedSchedule) => void;
  onDeleteSchedule: (id: string) => void;
}

export function SavedSchedulesModal({
  isOpen,
  onClose,
  savedSchedules,
  onLoadSchedule,
  onDeleteSchedule,
}: SavedSchedulesModalProps) {
  return (
    <AppDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="Lịch đã lưu"
      description="Các phương án được lưu cục bộ trên trình duyệt này."
      icon={List}
      size="md"
      footer={(
        <p className="w-full text-left text-xs leading-5 text-slate-500">
          Mở một lịch sẽ thay thế phương án đang xem.
        </p>
      )}
      contentClassName="space-y-0 p-0"
    >
      {savedSchedules.length === 0 ? (
        <div className="flex min-h-56 flex-col items-center justify-center px-5 py-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
            <CalendarClock className="h-5 w-5" />
          </span>
          <p className="mt-4 text-sm font-semibold text-slate-800">Chưa có lịch nào được lưu</p>
          <p className="mt-1 max-w-sm text-sm leading-5 text-slate-500">
            Chọn một phương án phù hợp, rồi dùng nút Lưu lịch để xem lại sau.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {savedSchedules.map((saved) => (
            <div key={saved.id} className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-slate-50 sm:px-5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#004A98]">
                <CalendarClock className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <h4 className="truncate text-sm font-semibold text-slate-900">{saved.name}</h4>
                <p className="mt-1 text-xs text-slate-500">
                  {new Date(saved.createdAt).toLocaleDateString('vi-VN')} · {saved.selectedCourses.length} môn
                  {saved.groupSchedule ? ` · Nhóm ${saved.groupSchedule.members.length} người` : ''}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Mở lịch này sẽ thay thế phương án bạn đang xem. Bạn có chắc chắn?')) {
                      onLoadSchedule(saved);
                    }
                  }}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#004A98] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#003A78]"
                >
                  <Check className="h-3.5 w-3.5" />
                  Mở
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Bạn có chắc chắn muốn xóa lịch này?')) {
                      onDeleteSchedule(saved.id);
                    }
                  }}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  aria-label={`Xóa lịch ${saved.name}`}
                  title="Xóa lịch"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppDialog>
  );
}
