import { useState } from 'react';
import { Calendar, Clock, BookOpen, GraduationCap, ChevronLeft, ChevronRight, Download } from 'lucide-react';

import { DAYS } from '../types';
import { useVisualSchedule } from '../hooks/use-visual-schedule';
import { NoDataCard } from '../../../components/feedback';
import { PageHeader } from '../../../components/layout/page-header';
import { PageShell } from '../../../components/layout/page-shell';
import { ColorLegend } from './ColorLegend';
import { HolidayManagerDialog } from './HolidayManagerDialog';
import { CourseDetailCard } from './CourseDetailCard';
import { PeriodRow } from './PeriodRow';
import { QuickStatsCard } from './QuickStatsCard';
import { timePeriods } from '../../../constants';

interface VisualScheduleMainProps {
  selectedSemester?: string;
}

export function VisualScheduleMain({ selectedSemester }: VisualScheduleMainProps) {
  const [isHolidayManagerOpen, setIsHolidayManagerOpen] = useState(false);
  const {
    isReady,
    hasData,
    schedule,
    currentWeek,
    weekRangeStr,
    currentWeekHolidays,
    displaySessions,
    stats,
    trends,
    uniqueCourses,
    isToday,
    currentPeriod,
    handlePreviousWeek,
    handleNextWeek,
    handleExport
  } = useVisualSchedule({ selectedSemester });

  if (!isReady) {
    return (
      <div className="flex-1 flex items-center justify-center h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004A98]"></div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <PageShell
        header={<PageHeader
          title="Thời khóa biểu"
          description="Vui lòng nhập dữ liệu để xem thời khóa biểu."
        />}
      >
        <NoDataCard />
      </PageShell>
    );
  }

  return (
    <PageShell
      className="ustudy-schedule-page"
      header={
        <PageHeader
          title="Thời khóa biểu"
          description={<>Xem lịch học theo tuần - {schedule.semesterName}</>}
          actions={<>
            <div className="flex items-center gap-1.5 md:gap-3">
              {/* Manage Holidays Button */}
              <button
                type="button"
                onClick={() => setIsHolidayManagerOpen(true)}
                className="flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 text-gray-700 transition-colors hover:border-[#004A98]/40 hover:bg-blue-50 hover:text-[#004A98] md:gap-2 md:px-4"
              >
                <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="hidden text-xs font-semibold sm:inline md:text-sm">Quản lý nghỉ lễ</span>
                {schedule.overrides.holidays.length > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#004A98] px-1.5 text-[10px] font-bold text-white">
                    {schedule.overrides.holidays.length}
                  </span>
                )}
              </button>

              <HolidayManagerDialog
                open={isHolidayManagerOpen}
                onOpenChange={setIsHolidayManagerOpen}
                overrides={schedule.overrides}
                systemHolidays={schedule.systemHolidays}
                semesterStartDate={schedule.semesterStartDate}
                courses={Array.from(new Map(schedule.sessions.map((session) => [session.courseCode, {
                  code: session.courseCode,
                  name: session.courseName,
                }])).values())}
                onSave={schedule.updateOverrides}
              />

              {/* Export Button */}
              <button
                onClick={handleExport}
                className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-[#004A98] text-white rounded-lg hover:bg-[#003d7a] transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                <Download className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="text-xs md:text-sm font-medium">Xuất lịch</span>
              </button>
            </div>
          </>}
        />
      }
    >

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-6">
        <QuickStatsCard
          icon={BookOpen}
          title="Tổng môn"
          value={`${stats.totalCourses}/${schedule.totalCourses}`}
          subtitle={`${stats.totalCredits} TC`}
          bgColor="bg-[#004A98]"
          trend={trends.coursesTrend}
        />
        <QuickStatsCard
          icon={Clock}
          title="Tiết/tuần"
          value={`${stats.totalPeriods}`}
          subtitle={stats.formattedHours}
          bgColor="bg-green-600"
          trend={trends.periodsTrend}
        />
        <QuickStatsCard
          icon={Calendar}
          title="Tuần"
          value={`${currentWeek}/17`}
          subtitle={weekRangeStr}
          bgColor="bg-orange-600"
        />
      </div>

      {/* Color Legend */}
      <ColorLegend />

      {/* Week Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 px-3 py-2.5 md:p-4 mb-3 md:mb-4 flex items-center justify-between">
        <button
          onClick={handlePreviousWeek}
          disabled={currentWeek === 1}
          className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-xs md:text-sm font-medium hidden sm:inline">Tuần trước</span>
        </button>

        <div className="text-center">
          <div className="text-sm md:text-lg font-semibold text-[#004A98]">
            Tuần {currentWeek}
          </div>
          <div className="text-[10px] md:text-xs text-gray-500">{weekRangeStr}</div>
        </div>

        <button
          onClick={handleNextWeek}
          disabled={currentWeek === 25}
          className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-xs md:text-sm font-medium hidden sm:inline">Tuần sau</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {currentWeekHolidays.length > 0 && (
        <div className="mb-3 flex items-start gap-3 border-y border-amber-200 bg-amber-50 px-3 py-3 md:mb-4 md:px-4">
          <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-amber-900">Tuần này có {currentWeekHolidays.length} kỳ nghỉ ảnh hưởng lịch học</p>
            <p className="mt-0.5 truncate text-xs text-amber-700">{currentWeekHolidays.map((holiday) => holiday.reason).join(' · ')}</p>
          </div>
          <button type="button" onClick={() => setIsHolidayManagerOpen(true)} className="shrink-0 text-xs font-semibold text-amber-800 hover:text-amber-950">Xem chi tiết</button>
        </div>
      )}

      {/* Weekly Calendar Grid */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto mb-4 md:mb-6">
        <table className="w-full border-collapse table-fixed min-w-[560px] md:min-w-[1000px]">
          <thead>
            <tr className="bg-[#004A98]">
              <th className="sticky left-0 bg-[#004A98] z-20 border border-gray-300 p-0.5 md:p-1 text-white text-[10px] md:text-xs font-semibold w-10 md:w-16 min-w-[40px] md:min-w-[64px]">
                Tiết
              </th>
              {DAYS.map((day) => (
                <th key={day.value} className={`border border-gray-300 p-0.5 md:p-1 text-white text-[10px] md:text-[13px] font-semibold min-w-[80px] md:min-w-[165px] ${isToday(day.value) ? 'bg-green-600' : ''
                  }`}>
                  {day.label}
                  {isToday(day.value) && (
                    <div className="text-[9px] md:text-[11px] font-normal mt-0.5">Hôm nay</div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* BUỔI SÁNG */}
            <tr className="bg-green-50">
              <td colSpan={7} className="text-center font-semibold py-1.5 text-xs text-gray-700 border border-gray-200">
                SÁNG
              </td>
            </tr>

            {timePeriods.slice(0, 5).map((period) => (
              <PeriodRow
                key={period.period}
                period={period.period}
                time={period.start}
                schedule={{ ...schedule, sessions: displaySessions }}
                isToday={isToday}
                currentPeriod={currentPeriod}
                overrides={schedule.overrides}
                onSave={schedule.updateOverrides}
              />
            ))}

            {/* BUỔI CHIỀU */}
            <tr className="bg-orange-50">
              <td colSpan={7} className="text-center font-semibold py-1.5 text-xs text-gray-700 border border-gray-200">
                <span>CHIỀU</span>
              </td>
            </tr>

            {timePeriods.slice(5, 10).map((period) => (
              <PeriodRow
                key={period.period}
                period={period.period}
                time={period.start}
                schedule={{ ...schedule, sessions: displaySessions }}
                isToday={isToday}
                currentPeriod={currentPeriod}
                overrides={schedule.overrides}
                onSave={schedule.updateOverrides}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Course Details Section */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-[#004A98]" />
          Chi tiết môn học đã đăng ký
        </h3>
        <div className="space-y-0">
          {uniqueCourses.map((session) => (
            <CourseDetailCard key={session.id} session={session} />
          ))}
        </div>
      </div>

    </PageShell>
  );
}
