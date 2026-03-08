import React, { useState } from 'react';
import { Calendar, Clock, BookOpen, GraduationCap, ChevronLeft, ChevronRight, Download, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from './ui/card';

// ==================== TYPE DEFINITIONS ====================

interface ScheduleSession {
  id: string;
  courseCode: string;
  courseName: string;
  classCode: string;
  credits: number;
  type: 'LT' | 'TH' | 'BT'; // Lý thuyết, Thực hành, Bài tập
  instructor: string;
  room: string;
  dayOfWeek: 2 | 3 | 4 | 5 | 6 | 7; // 2=T2, 7=T7
  startPeriod: number;
  endPeriod: number; // Có thể là số thập phân cho TH: 3.5, 5.5, 8.5, 10.5
  startTime: string;
  endTime: string;
  color: 'blue' | 'green' | 'yellow' | 'purple';
  session: 'morning' | 'afternoon';
  duration: number; // Số tiết: 2, 2.5, etc.
}

interface WeeklySchedule {
  semester: string;
  semesterName: string;
  weekNumber: number;
  weekRange: string;
  totalCourses: number;
  totalCredits: number;
  totalPeriodsPerWeek: number;
  totalHoursPerWeek: number;
  sessions: ScheduleSession[];
}

interface Day {
  value: 2 | 3 | 4 | 5 | 6 | 7;
  label: string;
  short: string;
}

// ==================== CONSTANTS ====================

const DAYS: Day[] = [
  { value: 2, label: 'Thứ 2', short: 'T2' },
  { value: 3, label: 'Thứ 3', short: 'T3' },
  { value: 4, label: 'Thứ 4', short: 'T4' },
  { value: 5, label: 'Thứ 5', short: 'T5' },
  { value: 6, label: 'Thứ 6', short: 'T6' },
  { value: 7, label: 'Thứ 7', short: 'T7' },
];

const COLOR_LEGEND = [
  { color: 'blue', label: 'CSC - Công nghệ Thông tin', bgClass: 'bg-blue-100', borderClass: 'border-blue-600' },
  { color: 'green', label: 'MTH - Toán học', bgClass: 'bg-green-100', borderClass: 'border-green-600' },
  { color: 'yellow', label: 'BAA - Thể dục / Ngoại ngữ', bgClass: 'bg-yellow-100', borderClass: 'border-yellow-600' },
  { color: 'purple', label: 'Khác', bgClass: 'bg-purple-100', borderClass: 'border-purple-600' },
];

// ==================== MOCK DATA ====================

const SEMESTER_3_SCHEDULE: WeeklySchedule = {
  semester: '24-25/3',
  semesterName: 'Học kỳ 3, Năm học 2024-2025',
  weekNumber: 2,
  weekRange: '11/01/2026 - 17/01/2026',
  totalCourses: 7,
  totalCredits: 27,
  totalPeriodsPerWeek: 32,
  totalHoursPerWeek: 27,
  sessions: [
    // ============ LÝ THUYẾT ============
    
    // BAA00101 - Triết học Mác-Lênin - T3 (Tiết 1-5 LT) - SÁNG - 5 TIẾT
    {
      id: 's1',
      courseCode: 'BAA00101',
      courseName: 'Triết học Mác - Lênin',
      classCode: '24SHH3',
      credits: 3.0,
      type: 'LT',
      instructor: 'PGS.TS. Nguyễn Văn Minh',
      room: 'F201',
      dayOfWeek: 3,
      startPeriod: 1,
      endPeriod: 5,
      startTime: '07:30',
      endTime: '11:50',
      color: 'yellow',
      session: 'morning',
      duration: 5,
    },
    
    // BAA00103 - Chủ nghĩa xã hội khoa học - T2 (Tiết 6-9 LT) - CHIỀU - 4 TIẾT
    {
      id: 's2',
      courseCode: 'BAA00103',
      courseName: 'Chủ nghĩa xã hội khoa học',
      classCode: '24CMT1',
      credits: 2.0,
      type: 'LT',
      instructor: 'TS. Trần Thị Hương',
      room: 'F103',
      dayOfWeek: 2,
      startPeriod: 6,
      endPeriod: 9,
      startTime: '12:40',
      endTime: '16:10',
      color: 'yellow',
      session: 'afternoon',
      duration: 4,
    },
    
    // CSC10003 - PPLT hướng đối tượng - T7 (Tiết 1-4 LT) - SÁNG - 4 TIẾT
    {
      id: 's3',
      courseCode: 'CSC10003',
      courseName: 'Phương pháp lập trình hướng đối tượng',
      classCode: '24CTT5',
      credits: 4.0,
      type: 'LT',
      instructor: 'TS. Lê Thành Sơn',
      room: 'E210',
      dayOfWeek: 7,
      startPeriod: 1,
      endPeriod: 4,
      startTime: '07:30',
      endTime: '11:00',
      color: 'blue',
      session: 'morning',
      duration: 4,
    },
    
    // CSC10008 - Mạng máy tính - T5 (Tiết 6-9 LT) - CHIỀU - 4 TIẾT
    {
      id: 's4',
      courseCode: 'CSC10008',
      courseName: 'Mạng máy tính',
      classCode: '24CTT5',
      credits: 4.0,
      type: 'LT',
      instructor: 'PGS.TS. Phạm Văn Tuấn',
      room: 'E307',
      dayOfWeek: 5,
      startPeriod: 6,
      endPeriod: 9,
      startTime: '12:40',
      endTime: '16:10',
      color: 'blue',
      session: 'afternoon',
      duration: 4,
    },
    
    // MTH00044 - Xác suất thống kê - T6 (Tiết 6-9 LT) - CHIỀU - 4 TIẾT
    {
      id: 's5',
      courseCode: 'MTH00044',
      courseName: 'Xác suất thống kê',
      classCode: '24CTT5',
      credits: 4.0,
      type: 'LT',
      instructor: 'TS. Đỗ Thị Mai',
      room: 'E205',
      dayOfWeek: 6,
      startPeriod: 6,
      endPeriod: 9,
      startTime: '12:40',
      endTime: '16:10',
      color: 'green',
      session: 'afternoon',
      duration: 4,
    },
    
    // MTH00050 - Toán học tổ hợp - T6 (Tiết 2-5 LT) - SÁNG - 4 TIẾT
    {
      id: 's6',
      courseCode: 'MTH00050',
      courseName: 'Toán học tổ hợp',
      classCode: '24CTT5',
      credits: 4.0,
      type: 'LT',
      instructor: 'PGS.TS. Nguyễn Hữu Đức',
      room: 'E210',
      dayOfWeek: 6,
      startPeriod: 2,
      endPeriod: 5,
      startTime: '08:20',
      endTime: '11:50',
      color: 'green',
      session: 'morning',
      duration: 4,
    },
    
    // ============ THỰC HÀNH (2.5 tiết) ============
    
    // CSC10003 - PPLT hướng đối tượng - T5 (Tiết 1-2.5 TH) - SÁNG CA 1
    {
      id: 's7',
      courseCode: 'CSC10003',
      courseName: 'Phương pháp lập trình hướng đối tượng',
      classCode: '24CTT5A',
      credits: 4.0,
      type: 'TH',
      instructor: 'ThS. Võ Thị Lan',
      room: 'PMT_D202',
      dayOfWeek: 5,
      startPeriod: 1,
      endPeriod: 3,
      startTime: '07:30',
      endTime: '09:35',
      color: 'blue',
      session: 'morning',
      duration: 2.5,
    },
    
    // MTH00050 - Toán học tổ hợp - T5 (Tiết 3.5-5 TH) - SÁNG CA 2
    {
      id: 's8',
      courseCode: 'MTH00050',
      courseName: 'Toán học tổ hợp',
      classCode: '24CTT5A',
      credits: 4.0,
      type: 'TH',
      instructor: 'ThS. Lê Minh Tuấn',
      room: 'PMT_D202',
      dayOfWeek: 5,
      startPeriod: 4,
      endPeriod: 5,
      startTime: '09:45',
      endTime: '11:50',
      color: 'green',
      session: 'morning',
      duration: 2.5,
    },
    
    // MTH00044 - Xác suất thống kê - T3 (Tiết 8.5-10 TH) - CHIỀU CA 2
    {
      id: 's9',
      courseCode: 'MTH00044',
      courseName: 'Xác suất thống kê',
      classCode: '24CTT5A',
      credits: 4.0,
      type: 'TH',
      instructor: 'ThS. Hoàng Văn Nam',
      room: 'PMT_NDH4.5',
      dayOfWeek: 3,
      startPeriod: 9,
      endPeriod: 10,
      startTime: '14:55',
      endTime: '17:00',
      color: 'green',
      session: 'afternoon',
      duration: 2.5,
    },
  ],
};

// ==================== HELPER FUNCTIONS ====================

function getSessionsForCell(day: number, period: number, sessions: ScheduleSession[]): ScheduleSession | null {
  return sessions.find(s => 
    s.dayOfWeek === day && 
    s.startPeriod <= period && 
    s.endPeriod >= period
  ) || null;
}

function shouldRenderCell(session: ScheduleSession, period: number): boolean {
  return session.startPeriod === period;
}

function calculateRowSpan(session: ScheduleSession): number {
  // Thực hành/Bài tập 2.5 tiết
  if (session.duration === 2.5) {
    // TH ca 2 chiều (tiết 9-10): chỉ span 2 rows
    if (session.startPeriod === 9) {
      return 2;
    }
    // TH ca 1 sáng (tiết 1-3): span 3 rows
    if (session.startPeriod === 1) {
      return 3;
    }
    // TH ca 2 sáng (tiết 4-5): span 2 rows
    if (session.startPeriod === 4) {
      return 2;
    }
  }
  
  // Lý thuyết: span theo duration
  if (session.type === 'LT') {
    return session.duration; // 2, 4, 5 tiết
  }
  
  return 2;
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
                <div className={`flex items-center gap-0.5 text-xs font-medium ${
                  trend.direction === 'up' ? 'text-green-600' : 'text-orange-600'
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
  const [showTooltip, setShowTooltip] = useState(false);
  
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
  
  return (
    <div 
      className="relative h-full w-full"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className={`p-1.5 rounded border-l-2 h-full w-full flex flex-col justify-center transition-all duration-200 cursor-pointer overflow-hidden ${colorClasses[session.color]}`}>
        {/* Course Code */}
        <div className="font-mono text-[9px] font-bold text-gray-900 mb-0.5 leading-tight truncate">
          {session.courseCode}
        </div>
        
        {/* Course Name - Max 2 lines with ellipsis */}
        <div className="text-[8px] font-medium text-gray-700 leading-tight mb-0.5 line-clamp-2">
          {session.courseName}
        </div>
        
        {/* Type & Room - Truncate if too long */}
        <div className="text-[7px] text-gray-600 leading-tight truncate">
          {typeLabels[session.type]} | {session.room}
        </div>
      </div>
      
      {/* Enhanced Tooltip */}
      {showTooltip && (
        <div className="absolute z-50 left-1/2 -translate-x-1/2 top-full mt-2 w-64 bg-gray-900 text-white rounded-lg shadow-2xl p-3 text-xs pointer-events-none animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Arrow */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
          
          <div className="relative">
            <div className="font-bold text-sm mb-2 text-blue-300">
              {session.courseCode} - {session.courseName}
            </div>
            <div className="space-y-1 text-gray-300">
              <div className="flex justify-between">
                <span>Loại:</span>
                <span className="font-medium">{typeFullLabels[session.type]}</span>
              </div>
              <div className="flex justify-between">
                <span>Thời gian:</span>
                <span className="font-medium">{session.startTime} - {session.endTime}</span>
              </div>
              <div className="flex justify-between">
                <span>Tiết:</span>
                <span className="font-medium">{session.startPeriod} - {Math.floor(session.endPeriod)}</span>
              </div>
              <div className="flex justify-between">
                <span>Phòng:</span>
                <span className="font-medium">{session.room}</span>
              </div>
              <div className="border-t border-gray-700 pt-1 mt-1">
                <div className="text-[11px] text-gray-400">
                  GV: {session.instructor}
                </div>
                <div className="text-[11px] text-gray-400">
                  Lớp: {session.classCode} • {session.credits} TC
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
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
            <div>• GV: {session.instructor} | Lớp: {session.classCode}</div>
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
        <div className="text-[11px] font-semibold text-gray-700">{period}</div>
        <div className="text-[9px] text-gray-500">{time}</div>
      </td>
      {DAYS.map((day) => {
        const session = getSessionsForCell(day.value, period, schedule.sessions);
        const isTodayCell = isToday(day.value);
        const isCurrentPeriod = isTodayCell && currentPeriod === period;
        
        if (session && shouldRenderCell(session, period)) {
          return (
            <td key={day.value} rowSpan={calculateRowSpan(session)} className={`p-1 border border-gray-200 align-middle ${
              isTodayCell ? 'bg-green-50/50' : ''
            } ${isCurrentPeriod ? 'ring-2 ring-green-500 ring-inset' : ''}`}>
              <CourseCard session={session} />
            </td>
          );
        } else if (!session) {
          return <td key={day.value} className={`p-1 border border-gray-200 bg-white h-14 ${
            isTodayCell ? 'bg-green-50/30' : ''
          }`} />;
        }
        return null;
      })}
    </tr>
  );
}

// ==================== MAIN COMPONENT ====================

export function VisualScheduleVi({ selectedSemester }: { selectedSemester?: string }) {
  const [currentWeek, setCurrentWeek] = useState(2);
  
  // Only mock data for HK3 2024-2025 exists. We will allow matching if the string has '3' and '2024' or '24-25'
  const isMatch = selectedSemester 
    ? (selectedSemester.includes('3') && (selectedSemester.includes('2024') || selectedSemester.includes('24-25'))) 
    : true;
  const schedule = {
    ...SEMESTER_3_SCHEDULE,
    semesterName: selectedSemester || SEMESTER_3_SCHEDULE.semesterName,
    totalCourses: isMatch ? SEMESTER_3_SCHEDULE.totalCourses : 0,
    totalCredits: isMatch ? SEMESTER_3_SCHEDULE.totalCredits : 0,
    totalPeriodsPerWeek: isMatch ? SEMESTER_3_SCHEDULE.totalPeriodsPerWeek : 0,
    totalHoursPerWeek: isMatch ? SEMESTER_3_SCHEDULE.totalHoursPerWeek : 0,
    sessions: isMatch ? SEMESTER_3_SCHEDULE.sessions : [],
  };
  
  // Update schedule data based on current week
  const displaySchedule = {
    ...schedule,
    weekNumber: currentWeek,
    weekRange: `${String(4 + (currentWeek - 1) * 7).padStart(2, '0')}/01/2026 - ${String(10 + (currentWeek - 1) * 7).padStart(2, '0')}/01/2026`,
  };
  
  // Get current day and time info
  const { isToday, currentPeriod } = getCurrentDayAndTime();
  
  // Get unique courses for details section
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
    if (currentWeek < 17) {
      setCurrentWeek(currentWeek + 1);
    }
  };
  
  const handleExport = () => {
    exportCalendar(displaySchedule);
  };

  return (
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
          value={`${schedule.totalCourses} môn`}
          subtitle={`${schedule.totalCredits} tín chỉ`}
          bgColor="bg-[#004A98]"
          trend={{ direction: 'up', value: '+2 môn' }}
        />
        <QuickStatsCard
          icon={Clock}
          title="Tiết học / tuần"
          value={`${schedule.totalPeriodsPerWeek} tiết`}
          subtitle={`${schedule.totalHoursPerWeek} giờ`}
          bgColor="bg-green-600"
          trend={{ direction: 'up', value: '+4 tiết' }}
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
              <th className="sticky left-0 bg-[#004A98] z-20 border border-gray-300 p-2 text-white text-xs font-semibold w-16 min-w-[64px]">
                Tiết
              </th>
              {DAYS.map((day) => (
                <th key={day.value} className={`border border-gray-300 p-2 text-white text-xs font-semibold min-w-[165px] ${
                  isToday(day.value) ? 'bg-green-600' : ''
                }`}>
                  {day.label}
                  {isToday(day.value) && (
                    <div className="text-[10px] font-normal mt-0.5">📍 Hôm nay</div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* BUỔI SÁNG */}
            <tr className="bg-green-50">
              <td colSpan={7} className="text-center font-semibold py-1.5 text-xs text-gray-700 border border-gray-200">
                🌅 SÁNG
              </td>
            </tr>
            
            <PeriodRow period={1} time="7:30" schedule={schedule} isToday={isToday} currentPeriod={currentPeriod} />
            <PeriodRow period={2} time="8:20" schedule={schedule} isToday={isToday} currentPeriod={currentPeriod} />
            <PeriodRow period={3} time="9:10" schedule={schedule} isToday={isToday} currentPeriod={currentPeriod} />
            <PeriodRow period={4} time="10:10" schedule={schedule} isToday={isToday} currentPeriod={currentPeriod} />
            <PeriodRow period={5} time="11:00" schedule={schedule} isToday={isToday} currentPeriod={currentPeriod} />
            
            {/* BUỔI CHIỀU */}
            <tr className="bg-orange-50">
              <td colSpan={7} className="text-center font-semibold py-1.5 text-xs text-gray-700 border border-gray-200">
                ☀️ CHIỀU
              </td>
            </tr>
            
            <PeriodRow period={6} time="12:40" schedule={schedule} isToday={isToday} currentPeriod={currentPeriod} />
            <PeriodRow period={7} time="13:30" schedule={schedule} isToday={isToday} currentPeriod={currentPeriod} />
            <PeriodRow period={8} time="14:20" schedule={schedule} isToday={isToday} currentPeriod={currentPeriod} />
            <PeriodRow period={9} time="15:20" schedule={schedule} isToday={isToday} currentPeriod={currentPeriod} />
            <PeriodRow period={10} time="16:10" schedule={schedule} isToday={isToday} currentPeriod={currentPeriod} />
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
  );
}