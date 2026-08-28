import { BookOpen, CalendarDays, GraduationCap, Settings2 } from 'lucide-react';
import type { DashboardCalendarEvent } from '../services/dashboard-calendar-events';
import type { DashboardCalendarSource } from '../services/dashboard-layout';
import { useMemo, useState } from "react";
import { AppDialog } from '../../../components/ui/overlays/app-dialog';

interface DashboardCalendarWidgetProps {
  sources: DashboardCalendarSource[];
  days: number;
  events: DashboardCalendarEvent[];
  onOpenSettings: () => void;
  showSettings?: boolean;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function toDateKey(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function startOfDay(value: Date): Date {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatEventDate(date: Date, today: Date): string {
  const dayDiff = Math.round((startOfDay(date).getTime() - startOfDay(today).getTime()) / DAY_MS);
  if (dayDiff === 0) return 'Hôm nay';
  if (dayDiff === 1) return 'Ngày mai';
  return new Intl.DateTimeFormat('vi-VN', { weekday: 'short' }).format(date);
}

function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(date);
}

export function DashboardCalendarWidget({
  sources,
  days,
  events,
  onOpenSettings,
  showSettings = true,
}: DashboardCalendarWidgetProps) {
  const [selectedEvent, setSelectedEvent] = useState<DashboardCalendarEvent | null>(null);
  const sourceLabel = [
    sources.includes('classes') ? 'Lịch học' : null,
    sources.includes('exams') ? 'Lịch thi' : null,
  ].filter(Boolean).join(' và ');
  const today = new Date();

  const groupedEvents = useMemo(() => {
    return events.reduce<
      Array<{
        key: string;
        date: Date;
        events: DashboardCalendarEvent[];
      }>
    >((groups, event) => {
      const key = toDateKey(event.date);
      const currentGroup = groups.at(-1);

      if (currentGroup?.key === key) {
        currentGroup.events.push(event);
      } else {
        groups.push({
          key,
          date: event.date,
          events: [event],
        });
      }

      return groups;
    }, []);
  }, [events]);

  return (
    <>
    <section className="ustudy-card ustudy-card-padding flex min-h-[280px] max-h-[420px] flex-col overflow-hidden">
      {/* Header */}
      <header className="relative z-30 flex shrink-0 items-start justify-between gap-4 border-b border-gray-200 bg-white pb-3">        <div className="min-w-0">
        <div className="flex items-center gap-2">
          <div className="ustudy-icon-badge bg-[#004A98] text-white">
            <CalendarDays className="h-4 w-4 text-white md:h-5 md:w-5" />
          </div>

          <h3 className="truncate text-base font-bold text-gray-900">
            Lịch {days} ngày tới
          </h3>
        </div>

        <p className="mt-1 text-xs text-gray-500">
          {sourceLabel || "Chưa chọn nội dung"}
          {events.length > 0 && (
            <>
              <span className="mx-1.5 text-gray-300">·</span>
              {events.length} sự kiện
            </>
          )}
        </p>
      </div>

        {showSettings && (
          <button
            type="button"
            onClick={onOpenSettings}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gray-200 text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-[#004A98]"
            title="Tùy chỉnh nội dung lịch"
            aria-label="Tùy chỉnh nội dung lịch"
          >
            <Settings2 className="h-4 w-4" />
          </button>
        )}
      </header>

      {/* Content */}
      {events.length > 0 ? (
        <div className="relative min-h-0 flex-1 overflow-y-auto bg-white [scrollbar-width:thin]">
          <div>
            {groupedEvents.map((group) => (
              <section key={group.key} className="pb-2">
                {/* Date heading */}
                <div className="sticky -top-px z-20 mb-2 flex min-h-11 items-center justify-between border-b border-gray-100 bg-white py-2.5 shadow-[0_1px_0_rgba(15,23,42,0.04)]">                  <div className="flex items-baseline gap-2">
                  <h4 className="text-xs font-bold text-[14px] text-[#004A98]">
                    {formatEventDate(group.date, today)}
                  </h4>

                  <span className="text-[13px] tabular-nums text-gray-400">
                    {formatShortDate(group.date)}
                  </span>
                </div>
                  <span className="text-[10px] font-medium text-gray-400">
                    {group.events.length} sự kiện
                  </span>
                </div>

                {/* Events */}
                <div className="space-y-2.5">
                  {group.events.map((event) => {
                    const isClass = event.source === "classes";
                    const SourceIcon = isClass ? BookOpen : GraduationCap;

                    return (
                      <button
                        type="button"
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className="ustudy-focus-ring group flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition-colors hover:border-blue-300 hover:bg-blue-50/40"
                        aria-label={`Xem chi tiết ${event.title}`}
                      >
                        <SourceIcon className={`mt-0.5 h-4 w-4 shrink-0 ${isClass ? 'text-[#004A98]' : 'text-violet-600'}`} />

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium leading-5 text-slate-900">
                            {event.title}
                          </p>

                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                            {event.subtitle && <span>{event.subtitle}</span>}
                            <span className={`font-semibold tabular-nums ${isClass ? 'text-[#004A98]' : 'text-violet-700'}`}>
                              {event.startTime || "Chưa có giờ"}
                              {event.endTime ? `–${event.endTime}` : ""}
                            </span>
                            {event.room && <span className="truncate">{event.room}</span>}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex min-h-36 flex-1 flex-col items-center justify-center px-5 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
            <CalendarDays className="h-5 w-5 text-gray-400" />
          </div>

          <p className="mt-3 text-sm font-medium text-gray-700">
            Không có sự kiện sắp tới
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Không có lịch học hoặc lịch thi trong {days} ngày tiếp theo.
          </p>
        </div>
      )}
    </section>
    <AppDialog
      open={selectedEvent !== null}
      onOpenChange={(open) => { if (!open) setSelectedEvent(null); }}
      title={selectedEvent?.title || 'Chi tiết sự kiện'}
      description={selectedEvent?.source === 'classes' ? 'Lịch học sắp tới' : 'Lịch thi sắp tới'}
      icon={CalendarDays}
      size="sm"
    >
      {selectedEvent && (
        <dl className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white text-sm">
          <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 px-3 py-2.5">
            <dt className="text-gray-500">Ngày</dt>
            <dd className="font-medium text-gray-900">{selectedEvent.date.toLocaleDateString('vi-VN')}</dd>
          </div>
          <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 px-3 py-2.5">
            <dt className="text-gray-500">Thời gian</dt>
            <dd className="font-medium tabular-nums text-[var(--ustudy-brand)]">{selectedEvent.startTime || 'Chưa có giờ'}{selectedEvent.endTime ? `–${selectedEvent.endTime}` : ''}</dd>
          </div>
          {selectedEvent.subtitle && <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 px-3 py-2.5"><dt className="text-gray-500">Thông tin</dt><dd className="text-gray-800">{selectedEvent.subtitle}</dd></div>}
          {selectedEvent.room && <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 px-3 py-2.5"><dt className="text-gray-500">Phòng</dt><dd className="font-medium text-gray-900">{selectedEvent.room}</dd></div>}
        </dl>
      )}
    </AppDialog>
    </>
  );
}
