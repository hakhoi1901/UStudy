import { BookOpen, CalendarDays, Clock, GraduationCap, MapPin, Settings2 } from 'lucide-react';
import type { DashboardCalendarEvent } from '../services/dashboard-calendar-events';
import type { DashboardCalendarSource } from '../services/dashboard-layout';
import { useMemo } from "react";

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
    <section className="ustudy-card ustudy-card-padding flex max-h-[420px] min-h-[280px] min-h-0 flex-col overflow-hidden">
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
                <div className="space-y-2">
                  {group.events.map((event) => {
                    const isClass = event.source === "classes";
                    const SourceIcon = isClass ? BookOpen : GraduationCap;

                    return (
                      <article
                        key={event.id}
                        className={`group flex items-start gap-3 rounded-lg border border-l-[3px] px-3 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-all ${isClass
                          ? "border-blue-100 border-l-[#0065B3] bg-[#F7FAFF] hover:border-blue-200 hover:border-l-[#004A98] hover:bg-[#F1F7FF]"
                          : "border-violet-100 border-l-violet-500 bg-violet-50/40 hover:border-violet-200 hover:border-l-violet-600 hover:bg-violet-50/70"
                          }`}
                      >
                        <div
                          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${isClass
                            ? "bg-blue-100 text-[#004A98]"
                            : "bg-violet-100 text-violet-700"
                            }`}
                        >
                          <SourceIcon className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="line-clamp-2 text-sm font-semibold leading-5 text-gray-900">
                                {event.title}
                              </p>

                              {event.subtitle && (
                                <p className="mt-0.5 truncate text-[11px] text-gray-500">
                                  {event.subtitle}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-500">
                            <span className={`inline-flex items-center gap-1.5 font-semibold tabular-nums ${isClass ? "text-[#004A98]" : "text-violet-700"}`}>
                              <Clock className="h-3.5 w-3.5" />
                              {event.startTime || "Chưa có giờ"}
                              {event.endTime
                                ? ` – ${event.endTime}`
                                : ""}
                            </span>

                            {event.room && (
                              <span className="inline-flex min-w-0 items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                                <span className="truncate">
                                  {event.room}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                      </article>
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
  );
}
