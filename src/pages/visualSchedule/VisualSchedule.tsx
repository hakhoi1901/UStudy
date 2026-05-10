/* VisualSchedule.tsx
** Trang Thời khóa biểu
*/

import React, { useState } from 'react';
import { Calendar, Clock, BookOpen, GraduationCap, ChevronLeft, ChevronRight, Download, TrendingUp, TrendingDown } from 'lucide-react';
import { TooltipProvider } from '../../components/ui/tooltip';
import { type ScheduleSession, type WeeklySchedule, type ScheduleOverrides, type Holiday, DAYS } from '../../types/Schedule';
import { useSchedule } from '../../hooks/useSchedule';
import { useCourseData } from '../../hooks/useCourseData';
import { NoDataCard } from '../../components/nodataCard';
import { PrivacyFooter } from '../../components/PrivacyFooter';
import { ScheduleLogic } from '../../logic/ScheduleLogic';
import { ColorLegend } from './ColorLegend';
import { HolidayManagerDialog } from './HolidayManagerDialog';
import { CourseDetailCard } from './CourseDetailCard';
import { PeriodRow } from './PeriodRow';
import { QuickStatsCard } from './QuickStatsCard';
import { exportCalendar } from '../../logic/visualCheduler/scheduleExport';
import { getCurrentDayAndTime } from '../../logic/visualCheduler/scheduleHelpers';
import {
  Dialog,
  DialogTrigger
} from '../../components/ui/dialog';
import { timePeriods } from '../../constants';

interface VisualScheduleProps {
  selectedSemester?: string;
}

export function VisualSchedule({ selectedSemester }: VisualScheduleProps) {
  const { overrides, updateOverrides, ...SEMESTER_3_SCHEDULE_BASE } = useSchedule();

  // Lấy data từ localStorage qua Recommender
  const { isReady, hasData } = useCourseData();

  const [currentWeek, setCurrentWeek] = useState(() => {
    if (!SEMESTER_3_SCHEDULE_BASE.semesterStartDate) return 1;
    const now = new Date();
    const msDiff = now.getTime() - SEMESTER_3_SCHEDULE_BASE.semesterStartDate.getTime();
    if (msDiff < 0) return 1;
    const week = Math.floor(msDiff / (7 * 24 * 60 * 60 * 1000)) + 1;
    return week;
  });

  const schedule = {
    ...SEMESTER_3_SCHEDULE_BASE,
    semesterName: selectedSemester || SEMESTER_3_SCHEDULE_BASE.semesterName,
    overrides,
    updateOverrides
  };

  const { semesterStartDate } = schedule;
  let weekStartStr = `Tuần ${currentWeek}`;

  const displaySessions = schedule.sessions.filter(session => {
    const allHolidays = [...schedule.systemHolidays, ...schedule.overrides.holidays];

    // Chỉ áp dụng holiday shift cho môn nào THỰC SỰ có lịch trong tuần nghỉ đó.
    // Môn bắt đầu sau kỳ nghỉ không bị ảnh hưởng.
    const relevantHolidays = allHolidays.filter(h => {
      const isAffectedCourse = h.affectedCourseCodes === 'all' || h.affectedCourseCodes.includes(session.courseCode);
      if (!isAffectedCourse) return false;
      if (!semesterStartDate || !session.startDateParsed || !session.endDateParsed) return true;

      // Tính ngày của tuần nghỉ
      const holidayStart = new Date(semesterStartDate);
      holidayStart.setDate(holidayStart.getDate() + (h.startWeek - 1) * 7);
      const holidayEnd = new Date(holidayStart);
      holidayEnd.setDate(holidayEnd.getDate() + h.duration * 7 - 1);
      holidayEnd.setHours(23, 59, 59, 999);

      // Chỉ tính kỳ nghỉ này nếu môn học có lịch trong khoảng nghỉ
      return holidayStart <= session.endDateParsed && holidayEnd >= session.startDateParsed;
    });

    // 1. Tính tuần nội dung thực tế sau khi dời lịch
    const actualWeek = ScheduleLogic.getActualWeekForCourse(currentWeek, session.courseCode, relevantHolidays);

    // Nếu tuần hiện tại là tuần nghỉ của môn này → ẩn đi
    if (actualWeek === null) return false;

    // --- Áp dụng Overrides mới (startWeek, endWeek, hiddenWeeks) ---
    const sessionOverride = schedule.overrides.sessionOverrides[session.id];
    if (sessionOverride) {
      // Ẩn nếu nằm ngoài khoảng tuần quy định
      if (sessionOverride.startWeek !== undefined && actualWeek < sessionOverride.startWeek) return false;
      if (sessionOverride.endWeek !== undefined && actualWeek > sessionOverride.endWeek) return false;
      // Ẩn nếu tuần này bị đánh dấu bỏ qua (hiddenWeeks dựa trên currentWeek vì là nghỉ đột xuất cụ thể)
      if (sessionOverride.hiddenWeeks?.includes(currentWeek)) return false;
    }

    if (!semesterStartDate || !session.startDateParsed || !session.endDateParsed) return true;

    // 2. Tính ngày của "actualWeek" (tuần nội dung thực tế)
    const contentWeekStart = new Date(semesterStartDate);
    contentWeekStart.setDate(contentWeekStart.getDate() + (actualWeek - 1) * 7);

    const contentWeekEnd = new Date(contentWeekStart);
    contentWeekEnd.setDate(contentWeekEnd.getDate() + 6);
    contentWeekEnd.setHours(23, 59, 59, 999);

    if (contentWeekStart > session.endDateParsed || contentWeekEnd < session.startDateParsed) {
      return false;
    }
    return true;
  }).map(session => {
    // 3. Áp dụng week overrides cho session nếu có
    const weekOverride = schedule.overrides.weekOverrides[`${currentWeek}_${session.id}`];
    if (weekOverride) {
      // Re-calculate times if periods changed
      let sP = weekOverride.startPeriod !== undefined ? weekOverride.startPeriod : session.startPeriod;
      let eP = weekOverride.endPeriod !== undefined ? weekOverride.endPeriod : session.endPeriod;
      const adjusted = ScheduleLogic.adjustPeriodsForPractical(session.type, sP, eP);

      return {
        ...session,
        ...weekOverride,
        startPeriod: adjusted.startPeriod,
        endPeriod: adjusted.endPeriod,
        startTime: ScheduleLogic.periodToTimeString(adjusted.startPeriod, true),
        endTime: ScheduleLogic.periodToTimeString(adjusted.endPeriod, false),
        duration: adjusted.duration,
        isOverridden: true
      };
    }
    return session;
  });

  if (semesterStartDate) {
    const wStart = new Date(semesterStartDate);
    wStart.setDate(wStart.getDate() + (currentWeek - 1) * 7);
    const wEnd = new Date(wStart);
    wEnd.setDate(wEnd.getDate() + 6);
    weekStartStr = `${String(wStart.getDate()).padStart(2, '0')}/${String(wStart.getMonth() + 1).padStart(2, '0')}/${wStart.getFullYear()} - ${String(wEnd.getDate()).padStart(2, '0')}/${String(wEnd.getMonth() + 1).padStart(2, '0')}/${wEnd.getFullYear()}`;
  }

  const totalFilteredCredits = Array.from(new Set(displaySessions.map(s => s.courseCode))).reduce((acc, code) => {
    const s = displaySessions.find(s => s.courseCode === code);
    return acc + (s?.credits || 0);
  }, 0);

  const totalFilteredCourses = new Set(displaySessions.map(s => s.courseCode)).size;
  const totalPeriods = displaySessions.reduce((acc, s) => acc + s.duration, 0);

  const totalMinutes = totalPeriods * 50;
  const formattedHours = totalMinutes % 60 === 0
    ? `${Math.floor(totalMinutes / 60)} giờ`
    : `${Math.floor(totalMinutes / 60)} giờ ${totalMinutes % 60} phút`;

  // Update schedule data based on current week
  const displaySchedule = {
    ...schedule,
    weekNumber: currentWeek,
    weekRange: weekStartStr,
    sessions: displaySessions,
    totalCourses: totalFilteredCourses,
    totalCredits: totalFilteredCredits,
    totalPeriodsPerWeek: totalPeriods,
    totalHoursPerWeek: totalPeriods * 50 / 60,
  };

  // Tính trend so với tuần trước
  let periodsTrend: { direction: 'up' | 'down'; value: string } | undefined = undefined;
  let coursesTrend: { direction: 'up' | 'down'; value: string } | undefined = undefined;

  if (currentWeek > 1 && semesterStartDate) {
    const prevWeekStart = new Date(semesterStartDate);
    prevWeekStart.setDate(prevWeekStart.getDate() + (currentWeek - 2) * 7);
    const prevWeekEnd = new Date(prevWeekStart);
    prevWeekEnd.setDate(prevWeekEnd.getDate() + 6);
    prevWeekEnd.setHours(23, 59, 59, 999);

    const prevSessions = schedule.sessions.filter(session => {
      if (!session.startDateParsed || !session.endDateParsed) return true;
      if (prevWeekStart > session.endDateParsed || prevWeekEnd < session.startDateParsed) return false;
      return true;
    });

    const prevTotalPeriods = prevSessions.reduce((acc, s) => acc + s.duration, 0);
    const prevTotalCourses = new Set(prevSessions.map(s => s.courseCode)).size;

    const diffPeriods = totalPeriods - prevTotalPeriods;
    if (diffPeriods > 0) periodsTrend = { direction: 'up', value: `+${diffPeriods} tiết` };
    else if (diffPeriods < 0) periodsTrend = { direction: 'down', value: `${diffPeriods} tiết` };

    const diffCourses = totalFilteredCourses - prevTotalCourses;
    if (diffCourses > 0) coursesTrend = { direction: 'up', value: `+${diffCourses} môn` };
    else if (diffCourses < 0) coursesTrend = { direction: 'down', value: `${diffCourses} môn` };
  }

  // Get current day and time info
  const { isToday, currentPeriod } = getCurrentDayAndTime();

  // Get unique courses for details section (hiển thị toàn bộ môn đã đăng ký)
  const uniqueCourses = schedule.sessions.reduce((acc, session) => {
    if (!acc.find(s => s.courseCode === session.courseCode)) {
      acc.push(session);
    }
    return acc;
  }, [] as ScheduleSession[]);

  // Handle week navigation
  const handlePreviousWeek = () => {
    if (currentWeek > 1) {
      setCurrentWeek(currentWeek - 1);
    }
  };

  const handleNextWeek = () => {
    // Arbitrary maximum of 25 weeks for navigation bounds
    if (currentWeek < 25) {
      setCurrentWeek(currentWeek + 1);
    }
  };

  const handleExport = () => {
    exportCalendar(schedule);
  };

  // Tải dữ liệu
  if (!isReady) {
    return (
      <div className="flex-1">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004A98]"></div>
      </div>
    );
  }

  // Không có dữ liệu
  if (!hasData) {
    return <div>
      <h1 className="text-gray-900 mb-2">Lộ trình học tập</h1>
      <p className="text-gray-600 mb-8">Đây là lộ trình học tập của bạn.</p>
      <NoDataCard />
    </div>;
  }

  return (
    <TooltipProvider>
      <div>
        {/* Header */}
        <div className="mb-4 md:mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-gray-900 mb-1 md:mb-2">Thời khóa biểu</h1>
            <p className="text-gray-600 text-sm md:text-base">
              Xem lịch học theo tuần - {schedule.semesterName}
            </p>
          </div>

          <div className="flex items-center gap-1.5 md:gap-3">
            {/* Manage Holidays Button */}
            <Dialog>
              <DialogTrigger asChild>
                <button
                  className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors duration-200 border border-orange-200"
                >
                  <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="text-xs md:text-sm font-medium hidden sm:inline">Quản lý nghỉ lễ</span>
                  <span className="text-xs font-medium sm:hidden">Nghỉ lễ</span>
                </button>
              </DialogTrigger>
              <HolidayManagerDialog
                overrides={schedule.overrides}
                courses={Array.from(new Set(schedule.sessions.map(s => s.courseCode)))}
                onSave={schedule.updateOverrides}
              />
            </Dialog>

            {/* Export Button */}
            <button
              onClick={handleExport}
              className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-[#004A98] text-white rounded-lg hover:bg-[#003d7a] transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              <Download className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="text-xs md:text-sm font-medium">Xuất lịch</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-6">
          <QuickStatsCard
            icon={BookOpen}
            title="Tổng môn"
            value={`${displaySchedule.totalCourses}/${schedule.totalCourses}`}
            subtitle={`${displaySchedule.totalCredits} TC`}
            bgColor="bg-[#004A98]"
            trend={coursesTrend}
          />
          <QuickStatsCard
            icon={Clock}
            title="Tiết/tuần"
            value={`${displaySchedule.totalPeriodsPerWeek}`}
            subtitle={formattedHours}
            bgColor="bg-green-600"
            trend={periodsTrend}
          />
          <QuickStatsCard
            icon={Calendar}
            title="Tuần"
            value={`${displaySchedule.weekNumber}/17`}
            subtitle={displaySchedule.weekRange}
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
              Tuần {displaySchedule.weekNumber}
            </div>
            <div className="text-[10px] md:text-xs text-gray-500">{displaySchedule.weekRange}</div>
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
                  schedule={displaySchedule}
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
                  schedule={displaySchedule}
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

        {/* Privacy Footer */}
        <PrivacyFooter />
      </div>
    </TooltipProvider >
  );
}