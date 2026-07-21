import { useEffect, useState } from 'react';
import { Bell, BellOff, BookOpen, CalendarClock, Check, GraduationCap, Plus, Trash2 } from 'lucide-react';
import { AppDialog } from '../../../components/ui/overlays/app-dialog';
import { supportsCalendarNotifications } from '../../../mobile/calendar-notifications';
import type { DashboardCalendarSource } from '../services/dashboard-layout';

type ReminderUnit = 'minutes' | 'hours' | 'days';

interface ReminderDraft {
  id: string;
  value: string;
  unit: ReminderUnit;
}

export interface DashboardCalendarSettingsSaveResult {
  saved: boolean;
  message?: string;
}

interface DashboardCalendarSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sources: DashboardCalendarSource[];
  days: number;
  notificationsEnabled: boolean;
  reminderMinutes: number[];
  onSave: (settings: {
    sources: DashboardCalendarSource[];
    days: number;
    notificationsEnabled: boolean;
    reminderMinutes: number[];
  }) => Promise<DashboardCalendarSettingsSaveResult>;
}

const CALENDAR_SOURCES: Array<{
  id: DashboardCalendarSource;
  label: string;
  description: string;
  icon: typeof BookOpen;
}> = [
  { id: 'classes', label: 'Lịch học', description: 'Các buổi học theo thời khóa biểu.', icon: BookOpen },
  { id: 'exams', label: 'Lịch thi', description: 'Lịch thi giữa kỳ và cuối kỳ.', icon: GraduationCap },
];

let reminderId = 0;

function createReminderDraft(minutes: number): ReminderDraft {
  reminderId += 1;
  if (minutes % 1440 === 0) return { id: `reminder-${reminderId}`, value: String(minutes / 1440), unit: 'days' };
  if (minutes % 60 === 0) return { id: `reminder-${reminderId}`, value: String(minutes / 60), unit: 'hours' };
  return { id: `reminder-${reminderId}`, value: String(minutes), unit: 'minutes' };
}

function reminderToMinutes(reminder: ReminderDraft): number | null {
  const value = Number(reminder.value);
  if (!Number.isInteger(value) || value < 1) return null;
  const multiplier = reminder.unit === 'days' ? 1440 : reminder.unit === 'hours' ? 60 : 1;
  const minutes = value * multiplier;
  return minutes <= 30 * 24 * 60 ? minutes : null;
}

export function DashboardCalendarSettingsDialog({
  open,
  onOpenChange,
  sources,
  days,
  notificationsEnabled,
  reminderMinutes,
  onSave,
}: DashboardCalendarSettingsDialogProps) {
  const isNativeApp = supportsCalendarNotifications();
  const [draftSources, setDraftSources] = useState<DashboardCalendarSource[]>(sources);
  const [draftDays, setDraftDays] = useState(String(days));
  const [draftNotificationsEnabled, setDraftNotificationsEnabled] = useState(notificationsEnabled);
  const [draftReminders, setDraftReminders] = useState<ReminderDraft[]>(() => reminderMinutes.map(createReminderDraft));
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDraftSources(sources);
    setDraftDays(String(days));
    setDraftNotificationsEnabled(notificationsEnabled);
    setDraftReminders(reminderMinutes.map(createReminderDraft));
    setSaveError('');
  }, [days, notificationsEnabled, open, reminderMinutes, sources]);

  const parsedDays = Number(draftDays);
  const isDaysValid = Number.isInteger(parsedDays) && parsedDays >= 1 && parsedDays <= 30;
  const parsedReminders = draftReminders.map(reminderToMinutes);
  const validReminderMinutes = parsedReminders.filter((minutes): minutes is number => minutes !== null);
  const areRemindersValid = validReminderMinutes.length === draftReminders.length
    && validReminderMinutes.length > 0
    && new Set(validReminderMinutes).size === validReminderMinutes.length;
  const canSave = isDaysValid && (!draftNotificationsEnabled || areRemindersValid) && !isSaving;

  const toggleSource = (source: DashboardCalendarSource) => {
    const isSelected = draftSources.includes(source);
    if (isSelected && draftSources.length === 1) return;
    setDraftSources((current) => (
      isSelected ? current.filter((item) => item !== source) : [...current, source]
    ));
  };

  const addReminder = () => {
    const used = new Set(validReminderMinutes);
    const nextMinutes = [15, 60, 1440, 30, 120].find((minutes) => !used.has(minutes)) || 5;
    setDraftReminders((current) => [...current, createReminderDraft(nextMinutes)]);
  };

  const updateReminder = (id: string, patch: Partial<ReminderDraft>) => {
    setDraftReminders((current) => current.map((reminder) => (
      reminder.id === id ? { ...reminder, ...patch } : reminder
    )));
  };

  const handleSave = async () => {
    if (!canSave) return;
    setIsSaving(true);
    setSaveError('');
    try {
      const result = await onSave({
        sources: draftSources,
        days: parsedDays,
        notificationsEnabled: isNativeApp && draftNotificationsEnabled,
        reminderMinutes: [...validReminderMinutes].sort((first, second) => second - first),
      });

      if (!result.saved) {
        setSaveError(result.message || 'Không thể lưu thiết lập thông báo.');
        return;
      }
      onOpenChange(false);
    } catch (error) {
      console.error('[calendar-settings] Không thể lưu thiết lập:', error);
      setSaveError('Không thể lưu thiết lập. Hãy đóng hẳn UStudy, mở lại rồi thử lần nữa.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Thiết lập lịch sự kiện"
      description="Chọn dữ liệu, khoảng thời gian và nhắc lịch trên điện thoại."
      icon={CalendarClock}
      size="sm"
      footer={(
        <div className="w-full">
          {saveError && (
            <p className="mb-2 border-l-2 border-red-500 bg-red-50 px-3 py-2 text-left text-xs leading-5 text-red-700">{saveError}</p>
          )}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-[#004A98] px-5 text-sm font-semibold text-white hover:bg-[#003A78] disabled:cursor-not-allowed disabled:bg-gray-300 sm:w-auto"
            >
              {isSaving ? 'Đang lưu...' : 'Lưu thiết lập'}
            </button>
          </div>
        </div>
      )}
    >
      <div>
        <p className="text-xs font-semibold uppercase text-gray-500">Nguồn sự kiện</p>
        <div className="mt-2 divide-y divide-gray-100 border-y border-gray-200">
          {CALENDAR_SOURCES.map((source) => {
            const Icon = source.icon;
            const isSelected = draftSources.includes(source.id);
            const cannotDisable = isSelected && draftSources.length === 1;
            return (
              <button
                key={source.id}
                type="button"
                onClick={() => toggleSource(source.id)}
                aria-pressed={isSelected}
                className={`flex w-full items-center gap-3 py-3 text-left ${cannotDisable ? 'cursor-default' : ''}`}
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isSelected ? 'bg-blue-50 text-[#004A98]' : 'bg-gray-100 text-gray-400'}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-gray-900">{source.label}</span>
                  <span className="mt-0.5 block text-xs text-gray-500">{source.description}</span>
                </span>
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${isSelected ? 'border-[#004A98] bg-[#004A98] text-white' : 'border-gray-300 bg-white'}`}>
                  {isSelected && <Check className="h-3.5 w-3.5" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="dashboard-calendar-days" className="text-xs font-semibold uppercase text-gray-500">
          Khoảng thời gian
        </label>
        <div className={`mt-2 flex h-11 items-center rounded-lg border bg-white focus-within:ring-2 focus-within:ring-[#004A98]/15 ${isDaysValid ? 'border-gray-300 focus-within:border-[#004A98]' : 'border-red-400'}`}>
          <input
            id="dashboard-calendar-days"
            type="number"
            min={1}
            max={30}
            step={1}
            value={draftDays}
            onChange={(event) => setDraftDays(event.target.value)}
            className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold tabular-nums text-gray-900 outline-none"
            aria-describedby="dashboard-calendar-days-help"
          />
          <span className="border-l border-gray-200 px-3 text-sm font-medium text-gray-500">ngày</span>
        </div>
        <p id="dashboard-calendar-days-help" className={`mt-1.5 text-xs ${isDaysValid ? 'text-gray-500' : 'text-red-600'}`}>
          {isDaysValid ? 'Hiển thị sự kiện từ hôm nay, tối đa 30 ngày.' : 'Nhập số ngày từ 1 đến 30.'}
        </p>
      </div>

      <div className="mt-5 border-t border-gray-200 pt-4">
        {isNativeApp && (
          <>
            <button
              type="button"
              role="switch"
              aria-checked={draftNotificationsEnabled}
              onClick={() => setDraftNotificationsEnabled((current) => !current)}
              className="flex w-full items-center gap-3 text-left"
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${draftNotificationsEnabled ? 'bg-blue-50 text-[#004A98]' : 'bg-gray-100 text-gray-400'}`}>
                {draftNotificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-gray-900">Thông báo trên điện thoại</span>
                <span className="mt-0.5 block text-xs text-gray-500">Nhắc cả khi UStudy đang đóng.</span>
              </span>
              <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${draftNotificationsEnabled ? 'bg-[#004A98]' : 'bg-gray-300'}`}>
                <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${draftNotificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </span>
            </button>

            {draftNotificationsEnabled && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase text-gray-500">Nhắc trước</p>
                  <span className="text-[11px] text-gray-400">Tối đa 5 mốc</span>
                </div>

                <div className="mt-2 space-y-2">
                  {draftReminders.map((reminder) => (
                    <div key={reminder.id} className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        value={reminder.value}
                        onChange={(event) => updateReminder(reminder.id, { value: event.target.value })}
                        aria-label="Thời gian nhắc trước"
                        className="h-10 min-w-0 flex-1 rounded-lg border border-gray-300 px-3 text-sm font-semibold tabular-nums outline-none focus:border-[#004A98] focus:ring-2 focus:ring-[#004A98]/15"
                      />
                      <select
                        value={reminder.unit}
                        onChange={(event) => updateReminder(reminder.id, { unit: event.target.value as ReminderUnit })}
                        aria-label="Đơn vị thời gian"
                        className="h-10 w-24 rounded-lg border border-gray-300 bg-white px-2 text-sm font-medium text-gray-700 outline-none focus:border-[#004A98]"
                      >
                        <option value="minutes">phút</option>
                        <option value="hours">giờ</option>
                        <option value="days">ngày</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => setDraftReminders((current) => current.filter((item) => item.id !== reminder.id))}
                        disabled={draftReminders.length === 1}
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                        title="Xóa mốc nhắc"
                        aria-label="Xóa mốc nhắc"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {!areRemindersValid && (
                  <p className="mt-2 text-xs text-red-600">Các mốc phải khác nhau và nằm trong khoảng 1 phút đến 30 ngày.</p>
                )}

                <button
                  type="button"
                  onClick={addReminder}
                  disabled={draftReminders.length >= 5}
                  className="mt-2 inline-flex h-9 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-[#004A98] hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-gray-300"
                >
                  <Plus className="h-4 w-4" />
                  Thêm mốc nhắc
                </button>
              </div>
            )}
          </>
        )}
      </div>

    </AppDialog>
  );
}
