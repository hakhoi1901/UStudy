import { useEffect, useMemo, useState } from 'react';
import { Check, Eye, RotateCcw, SlidersHorizontal } from 'lucide-react';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';

import { useStudentGradeData } from '../../features/grades/hooks/use-student-grade-data';
import { GPACalculator } from '../../features/grades/services/gpa-calculator';
import { useStudentDb } from '../../hooks/useStudentDb';
import { useSchedule } from '../../features/visual-schedule/hooks/use-schedule';
import { NoDataCard } from '../../components/feedback';
import { PageLoadingState } from '../../components/ui/display';
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
import { SortableDashboardWidget } from './components/SortableDashboardWidget';
import { buildDashboardCalendarEvents } from './services/dashboard-calendar-events';
import {
  DEFAULT_DASHBOARD_LAYOUT,
  normalizeDashboardLayout,
  readDashboardLayout,
  saveDashboardLayout,
  type DashboardLayoutPreferences,
  type DashboardWidgetId,
} from './services/dashboard-layout';
import {
  requestCalendarNotificationPermission,
  syncCalendarNotifications,
} from '../../mobile/calendar-notifications';

const WIDGET_LABELS: Record<DashboardWidgetId, string> = {
  gpa: 'GPA hiện tại',
  credits: 'Tín chỉ tích lũy',
  tuition: 'Học phí học kỳ',
  calendar: 'Lịch',
  creditDistribution: 'Phân bổ tín chỉ',
};

const WIDGET_SPANS: Record<DashboardWidgetId, string> = {
  gpa: 'md:col-span-2',
  credits: 'md:col-span-2',
  tuition: 'md:col-span-2',
  calendar: 'md:col-span-6 xl:col-span-2',
  creditDistribution: 'md:col-span-6 xl:col-span-4',
};

export function DashboardWidgets() {
  const [isMounted, setIsMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isCalendarSettingsOpen, setIsCalendarSettingsOpen] = useState(false);
  const [layout, setLayout] = useState<DashboardLayoutPreferences>(readDashboardLayout);
  const { academicYear, semesterNumber } = useDepartmentData();
  const schedule = useSchedule();
  const { exams } = useStudentDb();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

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

  const hideWidget = (id: DashboardWidgetId) => {
    setLayout((current) => normalizeDashboardLayout({
      ...current,
      hidden: [...current.hidden, id],
    }));
  };

  const resetLayout = () => {
    setLayout({
      ...DEFAULT_DASHBOARD_LAYOUT,
      order: [...DEFAULT_DASHBOARD_LAYOUT.order],
      hidden: [...DEFAULT_DASHBOARD_LAYOUT.hidden],
      calendarSources: [...layout.calendarSources],
      calendarDays: layout.calendarDays,
      calendarNotificationsEnabled: layout.calendarNotificationsEnabled,
      calendarReminderMinutes: [...layout.calendarReminderMinutes],
    });
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const activeId = active.id as DashboardWidgetId;
    const overId = over.id as DashboardWidgetId;

    setLayout((current) => {
      const oldIndex = current.order.indexOf(activeId);
      const newIndex = current.order.indexOf(overId);
      if (oldIndex < 0 || newIndex < 0) return current;
      return { ...current, order: arrayMove(current.order, oldIndex, newIndex) };
    });
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
            showSettings={!isEditing}
          />
        );
      case 'creditDistribution':
        return <CreditDistributionWidget />;
    }
  };

  if (!isMounted || !isReady) {
    return (
      <PageShell
        header={<PageHeader title="Trang tổng quan" description="Tổng hợp nhanh tiến độ học tập của bạn." />}
      >
        <PageLoadingState label="Đang tải trang tổng quan" />
      </PageShell>
    );
  }

  if (!hasData) {
    return (
      <PageShell
        header={
          <PageHeader
            title="Trang tổng quan"
            description="Chào mừng bạn trở lại! Đây là tổng quan học tập của bạn."
          />
        }
      >
        <NoDataCard />
      </PageShell>
    );
  }

  return (
    <PageShell
      header={
        <PageHeader
          title="Trang tổng quan"
          description="Chào mừng bạn trở lại! Đây là tổng quan học tập của bạn."
          actions={
            <button
              type="button"
              onClick={() => setIsEditing((current) => !current)}
              className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors md:h-10 md:w-auto md:gap-2 md:px-4 md:text-sm md:font-semibold ${isEditing
                ? 'border-[#004A98] bg-[#004A98] text-white hover:bg-[#003A78]'
                : 'border-gray-200 bg-white text-gray-700 hover:border-[#004A98]/40 hover:bg-blue-50 hover:text-[#004A98]'
                }`}
              aria-label={isEditing ? 'Hoàn tất chỉnh sửa dashboard' : 'Tùy chỉnh dashboard'}
              title={isEditing ? 'Hoàn tất' : 'Tùy chỉnh'}
            >
              {isEditing ? <Check className="h-4 w-4" /> : <SlidersHorizontal className="h-4 w-4" />}
              <span className="hidden md:inline">{isEditing ? 'Hoàn tất' : 'Tùy chỉnh'}</span>
            </button>
          }
        />
      }
    >

      {isEditing && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-y border-blue-100 bg-[#F4F8FF] px-3 py-2.5 md:mb-6 md:px-4">
          <p className="text-sm font-semibold text-[#004A98]">Đang chỉnh sửa bố cục</p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsCustomizerOpen(true)}
              className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold text-[#004A98] hover:bg-white"
            >
              <Eye className="h-4 w-4" />
              Quản lý thẻ
            </button>
            <button
              type="button"
              onClick={resetLayout}
              className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold text-gray-600 hover:bg-white hover:text-gray-900"
            >
              <RotateCcw className="h-4 w-4" />
              Mặc định
            </button>
          </div>
        </div>
      )}

      {visibleWidgetIds.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={visibleWidgetIds} strategy={rectSortingStrategy}>
            <div className="mb-4 grid grid-cols-1 gap-4 md:mb-6 md:grid-cols-6 md:gap-6">
              {visibleWidgetIds.map((id) => (
                <SortableDashboardWidget
                  key={id}
                  id={id}
                  label={WIDGET_LABELS[id]}
                  isEditing={isEditing}
                  onHide={hideWidget}
                  className={WIDGET_SPANS[id]}
                >
                  {renderWidget(id)}
                </SortableDashboardWidget>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="mb-6 flex min-h-64 flex-col items-center justify-center border-y border-gray-200 py-12 text-center">
          <SlidersHorizontal className="h-8 w-8 text-gray-300" />
          <p className="mt-3 text-sm font-semibold text-gray-800">Chưa có thẻ nào được hiển thị</p>
          <button
            type="button"
            onClick={() => setIsCustomizerOpen(true)}
            className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-[#004A98] px-4 text-sm font-semibold text-white hover:bg-[#003A78]"
          >
            <Eye className="h-4 w-4" />
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
          try {
            if (calendarNotificationsEnabled) {
              const permission = await requestCalendarNotificationPermission();
              if (!permission.granted) return { saved: false, message: permission.message };
            }

            updateLayout({
              ...layout,
              calendarSources,
              calendarDays,
              calendarNotificationsEnabled,
              calendarReminderMinutes,
            });
            return { saved: true };
          } catch (error) {
            console.error('[calendar-settings] Không thể xin quyền thông báo:', error);
            return {
              saved: false,
              message: 'Android không phản hồi yêu cầu cấp quyền. Hãy đóng hẳn UStudy, mở lại rồi thử lần nữa.',
            };
          }
        }}
      />

    </PageShell>
  );
}
