/* VisualSchedule.tsx
** Trang Thời khóa biểu
*/

import React, { useState } from 'react';
import { Calendar, Clock, BookOpen, GraduationCap, ChevronLeft, ChevronRight, Download, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../../components/ui/tooltip';
import { type ScheduleSession, type WeeklySchedule, DAYS } from '../../types/Schedule';
import { useSchedule } from '../../hooks/useSchedule';
import { useCourseData } from '../../hooks/useCourseData';
import { NoDataCard } from '../../components/nodataCard';

const COLOR_LEGEND = [
  { color: 'green', label: 'Toán học', bgClass: 'bg-green-100', borderClass: 'border-green-600' },
  { color: 'yellow', label: 'Chính trị - Thể chất - Anh văn - ...', bgClass: 'bg-yellow-100', borderClass: 'border-yellow-600' },
  { color: 'blue', label: 'Cơ sở ngành / Chuyên ngành', bgClass: 'bg-blue-100', borderClass: 'border-blue-600' },
  { color: 'purple', label: 'Khác', bgClass: 'bg-purple-100', borderClass: 'border-purple-600' },
];

// ==================== HELPER FUNCTIONS ====================

function getSessionsForCell(day: number, period: number, sessions: ScheduleSession[]): ScheduleSession | null {
  return sessions.find(s =>
    s.dayOfWeek === day &&
    Math.floor(s.startPeriod) <= period &&
    Math.ceil(s.endPeriod) >= period
  ) || null;
}

function shouldRenderCell(session: ScheduleSession, period: number): boolean {
  return Math.floor(session.startPeriod) === period;
}

function calculateRowSpan(session: ScheduleSession): number {
  return Math.ceil(session.duration);
}

// Get current day of week (2-7) and time
function getCurrentDayAndTime(): { dayOfWeek: number; currentPeriod: number | null; isToday: (day: number) => boolean } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sunday, 1=Monday, etc.
  const hours = now.getHours();
  const minutes = now.getMinutes();

  // Convert Sunday (0) to 8, and Monday-Saturday (1-6) to 2-7
  const viDay = dayOfWeek === 0 ? 8 : dayOfWeek + 1;

  // Determine current period based on time
  let currentPeriod: number | null = null;
  const timeInMinutes = hours * 60 + minutes;

  if (timeInMinutes >= 7 * 60 + 30 && timeInMinutes < 8 * 60 + 20) currentPeriod = 1;
  else if (timeInMinutes >= 8 * 60 + 20 && timeInMinutes < 9 * 60 + 10) currentPeriod = 2;
  else if (timeInMinutes >= 9 * 60 + 10 && timeInMinutes < 10 * 60 + 10) currentPeriod = 3;
  else if (timeInMinutes >= 10 * 60 + 10 && timeInMinutes < 11 * 60) currentPeriod = 4;
  else if (timeInMinutes >= 11 * 60 && timeInMinutes < 12 * 60 + 40) currentPeriod = 5;
  else if (timeInMinutes >= 12 * 60 + 40 && timeInMinutes < 13 * 60 + 30) currentPeriod = 6;
  else if (timeInMinutes >= 13 * 60 + 30 && timeInMinutes < 14 * 60 + 20) currentPeriod = 7;
  else if (timeInMinutes >= 14 * 60 + 20 && timeInMinutes < 15 * 60 + 20) currentPeriod = 8;
  else if (timeInMinutes >= 15 * 60 + 20 && timeInMinutes < 16 * 60 + 10) currentPeriod = 9;
  else if (timeInMinutes >= 16 * 60 + 10 && timeInMinutes < 17 * 60) currentPeriod = 10;

  return {
    dayOfWeek: viDay,
    currentPeriod,
    isToday: (day: number) => day === viDay && viDay >= 2 && viDay <= 7
  };
}

// Export calendar to text format
function exportCalendar(schedule: WeeklySchedule) {
  let content = `THỜI KHÓA BIỂU - ${schedule.semesterName}\n`;
  content += `Tuần ${schedule.weekNumber}/17 (${schedule.weekRange})\n`;
  content += `Tổng: ${schedule.totalCourses} môn | ${schedule.totalCredits} tín chỉ | ${schedule.totalPeriodsPerWeek} tiết/tuần\n`;
  content += `\n${'='.repeat(80)}\n\n`;

  DAYS.forEach(day => {
    const daySessions = schedule.sessions
      .filter(s => s.dayOfWeek === day.value)
      .sort((a, b) => a.startPeriod - b.startPeriod);

    if (daySessions.length > 0) {
      content += `${day.label.toUpperCase()}\n`;
      content += `${'-'.repeat(80)}\n`;

      daySessions.forEach(session => {
        const typeLabel = session.type === 'LT' ? 'Lý thuyết' : session.type === 'TH' ? 'Thực hành' : 'Bài tập';
        content += `• ${session.startTime}-${session.endTime} | Tiết ${session.startPeriod}-${Math.floor(session.endPeriod)}\n`;
        content += `  ${session.courseCode} - ${session.courseName}\n`;
        content += `  ${typeLabel} | Phòng: ${session.room} | GV: ${session.instructor}\n`;
        content += `  Lớp: ${session.classCode} | ${session.credits} TC\n\n`;
      });
    }
  });

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `TKB_${schedule.semester.replace(/\//g, '-')}_Tuan${schedule.weekNumber}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ==================== SUB-COMPONENTS ====================

function QuickStatsCard({ icon: Icon, title, value, subtitle, bgColor, trend }: {
  icon: React.ElementType;
  title: string;
  value: string;
  subtitle: string;
  bgColor: string;
  trend?: { direction: 'up' | 'down'; value: string };
}) {
  return (
    <Card className="border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden group">
      <CardContent className="p-6 relative">
        {/* Gradient overlay on hover */}
        <div className={`absolute inset-0 ${bgColor} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

        <div className="flex items-start gap-4 relative z-10">
          <div className={`p-3 rounded-lg ${bgColor} group-hover:scale-110 transition-transform duration-300 shadow-md`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-semibold text-gray-900 mb-1">{value}</p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500">{subtitle}</p>
              {trend && (
                <div className={`flex items-center gap-0.5 text-xs font-medium ${trend.direction === 'up' ? 'text-green-600' : 'text-orange-600'
                  }`}>
                  {trend.direction === 'up' ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>{trend.value}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ColorLegend() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex items-center gap-6 flex-wrap">
        <span className="text-sm font-medium text-gray-700">🎨 Màu sắc môn học:</span>
        {COLOR_LEGEND.map((item) => (
          <div key={item.color} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded border-2 ${item.bgClass} ${item.borderClass}`} />
            <span className="text-xs text-gray-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CourseCard({ session }: { session: ScheduleSession }) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-500 hover:bg-blue-100',
    green: 'bg-green-50 border-green-500 hover:bg-green-100',
    yellow: 'bg-yellow-50 border-yellow-500 hover:bg-yellow-100',
    purple: 'bg-purple-50 border-purple-500 hover:bg-purple-100',
  };

  const typeLabels = {
    LT: 'LT',
    TH: 'TH',
    BT: 'BT',
  };

  const typeFullLabels = {
    LT: 'Lý thuyết',
    TH: 'Thực hành',
    BT: 'Bài tập',
  };

  // Tính toán % height và offset top cho các block không nguyên (VD: 2.5 tiết)
  const rowSpan = Math.ceil(session.duration);
  const heightPercent = (session.duration / rowSpan) * 100;

  // Nếu session bắt đầu ở giữa tiết (vd: 3.5), offset top xuống (0.5 / rowSpan) * 100%
  const isFractionalStart = session.startPeriod % 1 !== 0;
  let topOffsetPercent = 0;
  if (isFractionalStart) {
    topOffsetPercent = (0.5 / rowSpan) * 100;
  }

  return (
    <Tooltip delayDuration={150}>
      <TooltipTrigger asChild>
        <div
          className="relative w-full h-full"
          style={{
            minHeight: `${rowSpan * 56}px`,
          }}
        >
          <div
            className={`absolute w-full p-1.5 rounded border-l-2 flex flex-col justify-center transition-all duration-200 cursor-pointer overflow-hidden ${colorClasses[session.color]}`}
            style={{
              top: `${topOffsetPercent}%`,
              height: `calc(${heightPercent}% - 6px)`, // Trừ hao padding của table cell (p-1)
            }}
          >
            {/* Course Name - Max 2 lines with ellipsis */}
            <div className="text-[13px] font-bold text-gray-700 leading-tight mb-0.5 line-clamp-2">
              {session.courseName}
            </div>

            {/* Course Code */}
            <div className="font-mono text-[13px] font-medium text-gray-900 mb-0.5 leading-tight truncate">
              {session.courseCode}
            </div>

            {/* Type & Room - Truncate if too long */}
            <div className="text-[12px] text-gray-600 leading-tight truncate">
              {typeLabels[session.type]} | {session.room}
            </div>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="right" align="start" className="z-[100] w-64 bg-[#e8f0fd] border-blue-500 text-gray-900 rounded-lg shadow-xl p-3 text-xs pointer-events-none animate-in fade-in zoom-in-95 duration-200 border border-gray-200">
        <div className="relative">
          <div className="font-bold text-sm mb-2 text-blue-800">
            {session.courseCode} - {session.courseName}
          </div>
          <div className="space-y-1 text-gray-600">
            <div className="flex justify-between">
              <span>Loại:</span>
              <span className="font-medium text-gray-900">{typeFullLabels[session.type]}</span>
            </div>
            <div className="flex justify-between">
              <span>Phòng:</span>
              <span className="font-medium text-gray-900">{session.room}</span>
            </div>
            <div className="flex justify-between">
              <span>Tiết:</span>
              <span className="font-medium text-gray-900">{session.startPeriod} - {Math.floor(session.endPeriod)}</span>
            </div>
            <div className="flex justify-between">
              <span>Thời gian: </span>
              <span className="font-medium text-gray-900">{session.startTime} - {session.endTime}</span>
            </div>
            {session.totalWeeks > 0 && (
              <div className="flex justify-between">
                <span>Thời gian: </span>
                <span className="font-medium text-gray-900">{session.startDate} - {session.endDate} </span>
              </div>
            )}
            {session.totalWeeks > 0 && (
              <div className="flex justify-between">
                <span>Thời lượng:</span>
                <span className="font-medium text-gray-900">{session.totalWeeks} tuần</span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-1 mt-1">
              <div className="text-[11px] text-gray-500">
                GV: {session.instructor}
              </div>
              <div className="text-[11px] text-gray-500">
                Lớp: {session.classCode} • {session.credits} TC
              </div>
            </div>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

function CourseDetailCard({ session }: { session: ScheduleSession }) {
  const colorClasses = {
    blue: 'border-l-blue-600',
    green: 'border-l-green-600',
    yellow: 'border-l-yellow-600',
    purple: 'border-l-purple-600',
  };

  const typeLabels = {
    LT: 'Lý thuyết',
    TH: 'Thực hành',
    BT: 'Bài tập',
  };

  return (
    <div className={`bg-white rounded-lg border-l-4 ${colorClasses[session.color]} border border-gray-200 p-4 mb-3`}>
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            {session.courseCode} - {session.courseName}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
            <div>• {session.credits} TC | {typeLabels[session.type]} | Phòng: {session.room}</div>
            {session.totalWeeks > 0 && (
              <div>• Học từ: {session.startDate} - {session.endDate} ({session.totalWeeks} tuần)</div>
            )}
            <div className="md:col-span-2">• GV: {session.instructor} | Lớp: {session.classCode}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper to render period row with today highlighting
function PeriodRow({
  period,
  time,
  schedule,
  isToday,
  currentPeriod
}: {
  period: number;
  time: string;
  schedule: WeeklySchedule;
  isToday: (day: number) => boolean;
  currentPeriod: number | null;
}) {
  return (
    <tr>
      <td className="sticky left-0 bg-gray-50 z-10 p-1.5 border border-gray-200 text-center h-14">
        <div className="text-[13px] font-semibold text-gray-700">{period}</div>
        <div className="text-[11px] text-gray-500">{time}</div>
      </td>
      {DAYS.map((day) => {
        const session = getSessionsForCell(day.value, period, schedule.sessions);
        const isTodayCell = isToday(day.value);
        const isCurrentPeriod = isTodayCell && currentPeriod === period;

        if (session && shouldRenderCell(session, period)) {
          return (
            <td key={day.value} rowSpan={calculateRowSpan(session)} className={`p-1 border border-gray-200 align-middle ${isTodayCell ? 'bg-green-50/50' : ''
              } ${isCurrentPeriod ? 'ring-2 ring-green-500 ring-inset' : ''}`}>
              <CourseCard session={session} />
            </td>
          );
        } else if (!session) {
          return <td key={day.value} className={`p-1 border border-gray-200 bg-white h-14 ${isTodayCell ? 'bg-green-50/30' : ''
            }`} />;
        }
        return null;
      })}
    </tr>
  );
}

// ==================== MAIN COMPONENT ====================

interface VisualScheduleProps {
  selectedSemester?: string;
}

export function VisualSchedule({ selectedSemester }: VisualScheduleProps) {
  const SEMESTER_3_SCHEDULE: WeeklySchedule = useSchedule();

  // Lấy data từ localStorage qua Recommender
  const { isReady, hasData } = useCourseData();

  const [currentWeek, setCurrentWeek] = useState(() => {
    if (!SEMESTER_3_SCHEDULE.semesterStartDate) return 1;
    const now = new Date();
    const msDiff = now.getTime() - SEMESTER_3_SCHEDULE.semesterStartDate.getTime();
    if (msDiff < 0) return 1;
    const week = Math.floor(msDiff / (7 * 24 * 60 * 60 * 1000)) + 1;
    return week;
  });

  const schedule = {
    ...SEMESTER_3_SCHEDULE,
    semesterName: selectedSemester || SEMESTER_3_SCHEDULE.semesterName
  };

  const { semesterStartDate } = schedule;
  let weekStartStr = `Tuần ${currentWeek}`;

  const displaySessions = schedule.sessions.filter(session => {
    if (!semesterStartDate || !session.startDateParsed || !session.endDateParsed) return true;

    const currentWeekStart = new Date(semesterStartDate);
    currentWeekStart.setDate(currentWeekStart.getDate() + (currentWeek - 1) * 7);

    // Cuối Chủ Nhật
    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekEnd.getDate() + 6);
    currentWeekEnd.setHours(23, 59, 59, 999);

    if (currentWeekStart > session.endDateParsed || currentWeekEnd < session.startDateParsed) {
      return false;
    }
    return true;
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

  // Update schedule data based on current week
  const displaySchedule = {
    ...schedule,
    weekNumber: currentWeek,
    weekRange: weekStartStr,
    sessions: displaySessions,
    totalCourses: totalFilteredCourses,
    totalCredits: totalFilteredCredits,
    totalPeriodsPerWeek: totalPeriods,
    totalHoursPerWeek: totalPeriods, // Using periods directly for hours per requirements
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
    exportCalendar(displaySchedule);
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
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-gray-900 mb-2">Thời khóa biểu</h1>
            <p className="text-gray-600">
              Xem lịch học theo tuần - {schedule.semesterName}
            </p>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-[#004A98] text-white rounded-lg hover:bg-[#003d7a] transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Xuất lịch</span>
          </button>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <QuickStatsCard
            icon={BookOpen}
            title="Tổng môn học"
            value={`${displaySchedule.totalCourses}/${schedule.totalCourses} môn `}
            subtitle={`${displaySchedule.totalCredits} tín chỉ`}
            bgColor="bg-[#004A98]"
            trend={coursesTrend}
          />
          <QuickStatsCard
            icon={Clock}
            title="Tiết học / tuần"
            value={`${displaySchedule.totalPeriodsPerWeek} tiết`}
            subtitle={`${displaySchedule.totalPeriodsPerWeek} giờ`}
            bgColor="bg-green-600"
            trend={periodsTrend}
          />
          <QuickStatsCard
            icon={Calendar}
            title="Tuần hiện tại"
            value={`Tuần ${displaySchedule.weekNumber}/17`}
            subtitle={displaySchedule.weekRange}
            bgColor="bg-orange-600"
          />
        </div>

        {/* Color Legend */}
        <ColorLegend />

        {/* Week Navigation */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 flex items-center justify-between">
          <button
            onClick={handlePreviousWeek}
            disabled={currentWeek === 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Tuần trước</span>
          </button>

          <div className="text-center">
            <div className="text-lg font-semibold text-[#004A98]">
              Tuần {displaySchedule.weekNumber}
            </div>
            <div className="text-xs text-gray-500">{displaySchedule.weekRange}</div>
          </div>

          <button
            onClick={handleNextWeek}
            disabled={currentWeek === 17}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-sm font-medium">Tuần sau</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Weekly Calendar Grid */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto mb-6">
          <table className="w-full border-collapse table-fixed min-w-[1200px]">
            <thead>
              <tr className="bg-[#004A98]">
                <th className="sticky left-0 bg-[#004A98] z-20 border border-gray-300 p-1 text-white text-xs font-semibold w-16 min-w-[64px]">
                  Tiết
                </th>
                {DAYS.map((day) => (
                  <th key={day.value} className={`border border-gray-300 p-1 text-white text-[13px] font-semibold min-w-[165px] ${isToday(day.value) ? 'bg-green-600' : ''
                    }`}>
                    {day.label}
                    {isToday(day.value) && (
                      <div className="text-[11px] font-normal mt-0.5">Hôm nay</div>
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

              <PeriodRow period={1} time="7:30" schedule={displaySchedule} isToday={isToday} currentPeriod={currentPeriod} />
              <PeriodRow period={2} time="8:20" schedule={displaySchedule} isToday={isToday} currentPeriod={currentPeriod} />
              <PeriodRow period={3} time="9:10" schedule={displaySchedule} isToday={isToday} currentPeriod={currentPeriod} />
              <PeriodRow period={4} time="10:10" schedule={displaySchedule} isToday={isToday} currentPeriod={currentPeriod} />
              <PeriodRow period={5} time="11:00" schedule={displaySchedule} isToday={isToday} currentPeriod={currentPeriod} />

              {/* BUỔI CHIỀU */}
              <tr className="bg-orange-50">
                <td colSpan={7} className="text-center font-semibold py-1.5 text-xs text-gray-700 border border-gray-200">
                  <span>CHIỀU</span>
                </td>
              </tr>

              <PeriodRow period={6} time="12:40" schedule={displaySchedule} isToday={isToday} currentPeriod={currentPeriod} />
              <PeriodRow period={7} time="13:30" schedule={displaySchedule} isToday={isToday} currentPeriod={currentPeriod} />
              <PeriodRow period={8} time="14:20" schedule={displaySchedule} isToday={isToday} currentPeriod={currentPeriod} />
              <PeriodRow period={9} time="15:20" schedule={displaySchedule} isToday={isToday} currentPeriod={currentPeriod} />
              <PeriodRow period={10} time="16:10" schedule={displaySchedule} isToday={isToday} currentPeriod={currentPeriod} />
            </tbody>
          </table>
        </div>

        {/* Course Details Section */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#004A98]" />
            📚 Chi tiết môn học đã đăng ký
          </h3>
          <div className="space-y-0">
            {uniqueCourses.map((session) => (
              <CourseDetailCard key={session.id} session={session} />
            ))}
          </div>
        </div>

        {/* Privacy Footer */}
        <div className="py-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-[10px] text-gray-500 text-center">
            Dữ liệu được lưu tại Local Storage và sẽ xóa khi Đăng xuất
          </p>
        </div>
      </div>
    </TooltipProvider >
  );
}