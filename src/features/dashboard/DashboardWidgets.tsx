import { useEffect, useMemo, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';

import { useStudentGradeData, GPACalculator } from '../../features/grades';
import { useStudentDb } from '../../hooks/useStudentDb';
import { useSchedule } from '../../features/visual-schedule';
import { NoDataCard } from '../../components/feedback';
import { PageHeader } from '../../components/layout/page-header';
import { PageShell } from '../../components/layout/page-shell';
import { FinancialLogic } from '../../logic/FinancialLogic';
import { useDepartmentData } from '../../context/DepartmentContext';
import { buildTuitionSemesterKey, formatTuitionDeadline, getTuitionDeadline } from '../../config/tuitionDeadlines';
import { CreditDistributionWidget } from './components/CreditDistributionWidget';
import { DashboardCalendarWidget } from './components/DashboardCalendarWidget';
import { DashboardCalendarSettingsDialog } from './components/DashboardCalendarSettingsDialog';
import { DashboardCustomizerDialog } from './components/DashboardCustomizerDialog';
import { CreditsWidget, GpaWidget, TuitionWidget } from './components/DashboardSummaryWidgets';
import { buildDashboardCalendarEvents } from './services/dashboard-calendar-events';
import {
  normalizeDashboardLayout,
  readDashboardLayout,
  saveDashboardLayout,
  type DashboardLayoutPreferences,
  type DashboardWidgetId,
} from './services/dashboard-layout';
import {
  prepareCalendarNotificationPermission,
  syncCalendarNotifications,
} from '../../mobile/calendar-notifications';

const WIDGET_SPANS: Record<DashboardWidgetId, string> = {
  gpa: 'md:col-span-2',
  credits: 'md:col-span-2',
  tuition: 'md:col-span-2',
  calendar: 'md:col-span-6 xl:col-span-2',
  creditDistribution: 'md:col-span-6 xl:col-span-4',
};

export function DashboardWidgets() {
  const [isMounted, setIsMounted] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isCalendarSettingsOpen, setIsCalendarSettingsOpen] = useState(false);
  const [layout, setLayout] = useState<DashboardLayoutPreferences>(readDashboardLayout);
  const { academicYear, semesterNumber } = useDepartmentData();
  const schedule = useSchedule();
  const { exams } = useStudentDb();
  const {
    currentGPA,
    accumulatedCredits,
    totalCredits,
    estimatedTuition,
    isReady,
    hasData,
  } = useStudentGradeData();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    saveDashboardLayout(layout);
  }, [isMounted, layout]);

  const tuitionSemesterKey = useMemo(
    () => buildTuitionSemesterKey(academicYear, semesterNumber),
    [academicYear, semesterNumber],
  );
  const tuitionDueDate = useMemo(
    () => formatTuitionDeadline(getTuitionDeadline(tuitionSemesterKey)),
    [tuitionSemesterKey],
  );
  const gpaStatus = useMemo(
    () => GPACalculator.getClassification(currentGPA),
    [currentGPA],
  );
  const visibleWidgetIds = useMemo(
    () => layout.order.filter((id) => !layout.hidden.includes(id)),
    [layout.hidden, layout.order],
  );
  const calendarEvents = useMemo(
    () => buildDashboardCalendarEvents(schedule, exams, layout.calendarSources, layout.calendarDays),
    [
      exams,
      layout.calendarDays,
      layout.calendarSources,
      schedule.overrides?.holidays,
      schedule.semesterStartDate,
      schedule.sessions,
      schedule.systemHolidays,
    ],
  );
  const calendarNotificationSyncKey = useMemo(() => JSON.stringify({
    enabled: layout.calendarNotificationsEnabled,
    reminders: layout.calendarReminderMinutes,
    events: layout.calendarNotificationsEnabled
      ? calendarEvents.map((event) => [event.id, event.date.getTime(), event.startTime, event.room])
      : [],
  }), [calendarEvents, layout.calendarNotificationsEnabled, layout.calendarReminderMinutes]);

  useEffect(() => {
    void syncCalendarNotifications(
      calendarEvents,
      layout.calendarNotificationsEnabled,
      layout.calendarReminderMinutes,
    ).catch((error) => console.error('[calendar-notifications] Không thể đồng bộ thông báo:', error));
  }, [calendarNotificationSyncKey]);

  const updateLayout = (nextLayout: DashboardLayoutPreferences) => {
    setLayout(normalizeDashboardLayout(nextLayout));
  };

  const renderWidget = (id: DashboardWidgetId) => {
    switch (id) {
      case 'gpa':
        return <GpaWidget currentGPA={currentGPA} classification={gpaStatus} />;
      case 'credits':
        return <CreditsWidget accumulatedCredits={accumulatedCredits} totalCredits={totalCredits} />;
      case 'tuition':
        return (
          <TuitionWidget
            amountLabel={FinancialLogic.formatCurrency(estimatedTuition || 0, 'currency')}
            dueDate={tuitionDueDate}
          />
        );
      case 'calendar':
        return (
          <DashboardCalendarWidget
            sources={layout.calendarSources}
            days={layout.calendarDays}
            events={calendarEvents}
            onOpenSettings={() => setIsCalendarSettingsOpen(true)}
            showSettings
          />
        );
      case 'creditDistribution':
        return <CreditDistributionWidget />;
    }
  };

  if (!isMounted) return null;

  if (!isReady) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#004A98]" />
      </div>
    );
  }

  if (!hasData) {
    return (
      <PageShell
        header={(
          <PageHeader
            title="Tổng quan"
            description="Chào mừng bạn trở lại! Đây là tổng quan học tập của bạn."
          />
        )}
      >
        <NoDataCard />
      </PageShell>
    );
  }

  return (
    <PageShell
      header={(
        <PageHeader
          title="Trang tổng quan"
          description="Chào mừng bạn trở lại! Đây là tổng quan học tập của bạn."
          actions={(
            <button
              type="button"
              onClick={() => setIsCustomizerOpen(true)}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 transition-colors hover:border-[#004A98]/40 hover:bg-blue-50 hover:text-[#004A98] md:h-10 md:w-auto md:gap-2 md:px-4 md:text-sm md:font-semibold"
              aria-label="Tùy chỉnh dashboard"
              title="Tùy chỉnh dashboard"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden md:inline">Tùy chỉnh</span>
            </button>
          )}
        />
      )}
    >
      {visibleWidgetIds.length > 0 ? (
        <div className="mb-4 grid grid-cols-1 gap-4 md:mb-6 md:grid-cols-6 md:gap-6">
          {visibleWidgetIds.map((id) => (
            <div key={id} className={`min-w-0 ${WIDGET_SPANS[id]}`}>
              {renderWidget(id)}
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-6 flex min-h-64 flex-col items-center justify-center border-y border-gray-200 py-12 text-center">
          <SlidersHorizontal className="h-8 w-8 text-gray-300" />
          <p className="mt-3 text-sm font-semibold text-gray-800">Chưa có thẻ nào được hiển thị</p>
          <button
            type="button"
            onClick={() => setIsCustomizerOpen(true)}
            className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-[#004A98] px-4 text-sm font-semibold text-white hover:bg-[#003A78]"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Chọn thẻ hiển thị
          </button>
        </div>
      )}

      <DashboardCustomizerDialog
        open={isCustomizerOpen}
        onOpenChange={setIsCustomizerOpen}
        layout={layout}
        onChange={updateLayout}
      />

      <DashboardCalendarSettingsDialog
        open={isCalendarSettingsOpen}
        onOpenChange={setIsCalendarSettingsOpen}
        sources={layout.calendarSources}
        days={layout.calendarDays}
        notificationsEnabled={layout.calendarNotificationsEnabled}
        reminderMinutes={layout.calendarReminderMinutes}
        onSave={async ({
          sources: calendarSources,
          days: calendarDays,
          notificationsEnabled: calendarNotificationsEnabled,
          reminderMinutes: calendarReminderMinutes,
        }) => {
          updateLayout({
            ...layout,
            calendarSources,
            calendarDays,
            calendarNotificationsEnabled,
            calendarReminderMinutes,
          });

          if (calendarNotificationsEnabled) {
            prepareCalendarNotificationPermission();
          }

          return { saved: true };
        }}
      />
    </PageShell>
  );
}
