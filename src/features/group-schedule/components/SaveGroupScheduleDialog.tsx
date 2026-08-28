import { Save } from 'lucide-react';
import { Button } from '../../../components/ui/form/button';
import { AppDialog } from '../../../components/ui/overlays/app-dialog';

interface SaveGroupScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  onNameChange: (name: string) => void;
  onSave: () => void;
  optionNumber: number;
}

export function SaveGroupScheduleDialog({
  open,
  onOpenChange,
  name,
  onNameChange,
  onSave,
  optionNumber,
}: SaveGroupScheduleDialogProps) {
  const canSave = name.trim().length > 0;

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Lưu lịch nhóm"
      description="Lưu phương án hiện tại để mở lại trong Lịch đã lưu."
      icon={Save}
      size="sm"
      footer={(
        <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" size="lg" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button type="button" size="lg" onClick={onSave} disabled={!canSave}>
            Lưu lịch
          </Button>
        </div>
      )}
    >
      <div>
        <label htmlFor="group-schedule-name" className="block text-sm font-semibold text-slate-800">
          Tên gợi nhớ
        </label>
        <input
          id="group-schedule-name"
          autoFocus
          type="text"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder={`Ví dụ: Nhóm - PA ${optionNumber}`}
          className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[var(--ustudy-brand)] focus:ring-2 focus:ring-[var(--ustudy-ring)]"
          onKeyDown={(event) => {
            if (event.key === 'Enter' && canSave) onSave();
          }}
        />
      </div>
      <p className="border-l-2 border-[var(--ustudy-brand)] bg-blue-50 px-3 py-2 text-xs leading-5 text-slate-600">
        Lưu cả nhóm và các lớp của phương án đang xem. Khi mở lại, bạn vẫn có thể đổi thành viên để xem lịch riêng từng người.
      </p>
    </AppDialog>
  );
}
