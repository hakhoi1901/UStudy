import { useMemo } from 'react';
import { CalendarDays, Clock, MapPin } from 'lucide-react';

import { useSchedule } from '../../features/visual-schedule/hooks/use-schedule';
import { getTodayScheduleSessions, summarizeTodaySessions } from './dashboard-insights';

function formatTodayLabel(date: Date) {
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
  }).format(date);
}

export function TodayScheduleWidget() {
  const schedule = useSchedule();
  const today = useMemo(() => new Date(), []);
  const todaySessions = useMemo(
    () => getTodayScheduleSessions(schedule.sessions, today),
    [schedule.sessions, today],
  );
  const summary = useMemo(() => summarizeTodaySessions(todaySessions), [todaySessions]);

  return (
    <section className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-gray-900 md:text-base">Lịch hôm nay</h3>
            <p className="text-xs capitalize text-gray-500">{formatTodayLabel(today)}</p>
          </div>
        </div>

        <div className="rounded-lg bg-emerald-50 px-3 py-2 text-right">
          <p className="text-base font-bold text-emerald-700">{summary.totalPeriods}</p>
          <p className="text-[10px] font-medium uppercase text-emerald-600">tiết</p>
        </div>
      </div>

      {todaySessions.length > 0 ? (
        <div className="space-y-3">
          {summary.nextSession && (
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
              Sắp tới: <span className="font-semibold">{summary.nextSession.courseName}</span> lúc {summary.nextSession.startTime}
            </div>
          )}

          <div className="space-y-2">
            {todaySessions.slice(0, 4).map((session) => (
              <div key={session.id} className="rounded-lg border border-gray-100 px-3 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">{session.courseName}</p>
                    <p className="mt-0.5 text-xs font-medium text-gray-500">
                      {session.courseCode} · {session.type} · Nhóm {session.classCode || '-'}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-md bg-gray-100 px-2 py-1 text-xs font-bold text-gray-700">
                    {session.duration} tiết
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-600">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {session.startTime} - {session.endTime}
                  </span>
                  <span className="inline-flex min-w-0 items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{session.room || 'Chưa có phòng'}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>

          {todaySessions.length > 4 && (
            <p className="text-center text-xs font-medium text-gray-500">
              +{todaySessions.length - 4} buổi khác trong hôm nay
            </p>
          )}
        </div>
      ) : (
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 text-center">
          <CalendarDays className="mb-3 h-8 w-8 text-gray-300" />
          <p className="text-sm font-semibold text-gray-700">Hôm nay không có lịch học</p>
          <p className="mt-1 max-w-xs text-xs text-gray-500">
            Dữ liệu được lấy từ lịch đăng ký học phần hiện tại.
          </p>
        </div>
      )}
    </section>
  );
}
