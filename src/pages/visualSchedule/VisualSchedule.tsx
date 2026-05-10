/* VisualSchedule.tsx
** Trang Thời khóa biểu
*/

import React, { useState } from 'react';
import { Calendar, Clock, BookOpen, GraduationCap, ChevronLeft, ChevronRight, Download, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../../components/ui/tooltip';
import { type ScheduleSession, type WeeklySchedule, type ScheduleOverrides, type Holiday, DAYS } from '../../types/Schedule';
import { useSchedule } from '../../hooks/useSchedule';
import { useCourseData } from '../../hooks/useCourseData';
import { NoDataCard } from '../../components/nodataCard';
import { PrivacyFooter } from '../../components/PrivacyFooter';
import { ScheduleLogic } from '../../logic/ScheduleLogic';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Pencil, Trash2, Plus, Info, Calendar as CalendarIcon, MessageSquare, Palette, MapPin } from 'lucide-react';
const COLOR_LEGEND = [
  { color: 'green', label: 'Toán học', bgClass: 'bg-green-100', borderClass: 'border-green-600' },
  { color: 'yellow', label: 'Chính trị - Thể chất - Anh văn - ...', bgClass: 'bg-yellow-100', borderClass: 'border-yellow-600' },
  { color: 'blue', label: 'Cơ sở ngành / Chuyên ngành', bgClass: 'bg-blue-100', borderClass: 'border-blue-600' },
  { color: 'purple', label: 'Khác', bgClass: 'bg-purple-100', borderClass: 'border-purple-600' },
];
import { timePeriods } from '../../constants';

// ==================== HELPER FUNCTIONS ====================

// Trong ký hiệu VN: T2(1-5) nghĩa là tiết 1 đến 5 BAO GỒM tiết 5 (inclusive)
// => displayEnd = endPeriod + 1 khi endPeriod là số nguyên
function getDisplayEnd(session: ScheduleSession): number {
  return Number.isInteger(session.endPeriod) ? session.endPeriod + 1 : session.endPeriod;
}

function calculateRowSpan(session: ScheduleSession): number {
  const displayEnd = getDisplayEnd(session);
  return Math.max(1, Math.ceil(displayEnd) - Math.floor(session.startPeriod));
}

function getSessionsForCell(day: number, period: number, sessions: ScheduleSession[]): ScheduleSession | null {
  return sessions.find(s => {
    if (s.dayOfWeek !== day) return false;
    const start = Math.floor(s.startPeriod);
    const end = Math.ceil(getDisplayEnd(s));
    return period >= start && period < end;
  }) || null;
}

function getAllSessionsForCell(day: number, period: number, sessions: ScheduleSession[]): ScheduleSession[] {
  return sessions.filter(s => {
    if (s.dayOfWeek !== day) return false;
    const start = Math.floor(s.startPeriod);
    const end = Math.ceil(getDisplayEnd(s));
    return period >= start && period < end;
  });
}

function hasOverlappingSession(day: number, period: number, sessions: ScheduleSession[]): boolean {
  return getAllSessionsForCell(day, period, sessions).length > 1;
}

function shouldRenderCell(session: ScheduleSession, period: number): boolean {
  return Math.floor(session.startPeriod) === period;
}

// Get current day of week (2-7) and time
function getCurrentDayAndTime(): { dayOfWeek: number; currentPeriod: number | null; isToday: (day: number) => boolean } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sunday, 1=Monday, etc.q          
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

// Export weekly schedule to iCalendar (.ics) format
function exportCalendar(schedule: WeeklySchedule) {
  const pad = (n: number) => String(n).padStart(2, '0');
  const toIcsDateTime = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  const escapeIcsText = (text: string) => text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');

  // Anchor all events to week 1 (semester start Monday), then repeat by number of teaching weeks.
  const semesterStart = schedule.semesterStartDate ? new Date(schedule.semesterStartDate) : null;

  const nowStamp = toIcsDateTime(new Date());
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//HCMUS Portal Tool//Visual Schedule//VI',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(`Thoi khoa bieu - ${schedule.semesterName}`)}`,
    'X-WR-TIMEZONE:Asia/Ho_Chi_Minh',
  ];

  schedule.sessions.forEach((session, idx) => {
    const [startHour, startMinute] = session.startTime.split(':').map(Number);
    const [endHour, endMinute] = session.endTime.split(':').map(Number);

    let eventDate: Date | null = null;

    if (semesterStart) {
      // dayOfWeek: 2..7 => offset 0..5 from week-1 Monday
      const dayOffset = session.dayOfWeek - 2;
      eventDate = new Date(
        semesterStart.getFullYear(),
        semesterStart.getMonth(),
        semesterStart.getDate() + dayOffset
      );
    } else if (session.startDateParsed) {
      eventDate = new Date(session.startDateParsed);
    }

    if (!eventDate || Number.isNaN(startHour) || Number.isNaN(startMinute) || Number.isNaN(endHour) || Number.isNaN(endMinute)) {
      return;
    }

    const dtStart = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), startHour, startMinute, 0);
    const dtEnd = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), endHour, endMinute, 0);

    const typeLabel = session.type === 'LT' ? 'Ly thuyet' : session.type === 'TH' ? 'Thuc hanh' : 'Bai tap';
    const recurrenceWeeks = Math.max(1, session.totalWeeks || 1);
    const endDate = new Date(dtStart);
    endDate.setDate(endDate.getDate() + recurrenceWeeks * 7);
    const description = [
      `Mon: ${session.courseName} (${session.courseCode})`,
      `Lop: ${session.classCode}`,
      `Loai: ${typeLabel}`,
      `Giang vien: ${session.instructor || 'Dang cap nhat'}`,
      `Tin chi: ${session.credits}`,
      `Bat dau: ${session.startTime} - Tuan 1`,
      `Ket thuc du kien: +${recurrenceWeeks} tuan`,
    ].join('\\n');

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${session.id}-${schedule.weekNumber}-${idx}@hcmus-portal-tool`);
    lines.push(`DTSTAMP:${nowStamp}`);
    lines.push(`DTSTART;TZID=Asia/Ho_Chi_Minh:${toIcsDateTime(dtStart)}`);
    lines.push(`DTEND;TZID=Asia/Ho_Chi_Minh:${toIcsDateTime(dtEnd)}`);
    lines.push(`RRULE:FREQ=WEEKLY;COUNT=${recurrenceWeeks}`);
    lines.push(`X-HCMUS-END-ESTIMATE:${toIcsDateTime(endDate)}`);
    lines.push(`SUMMARY:${escapeIcsText(`${session.courseCode} - ${session.courseName}`)}`);
    lines.push(`LOCATION:${escapeIcsText(session.room || 'Chua co phong')}`);
    lines.push(`DESCRIPTION:${escapeIcsText(description)}`);
    lines.push('STATUS:CONFIRMED');
    lines.push('TRANSP:OPAQUE');
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');

  const content = `${lines.join('\r\n')}\r\n`;
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `TKB_${schedule.semester.replace(/\//g, '-')}_FullSemester.ics`;
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
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <div className="flex items-center gap-6 flex-wrap">
        <span className="text-sm font-medium text-gray-700">Màu môn học:</span>
        {COLOR_LEGEND.map((item) => (
          <div key={item.color} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded border-2 ${item.bgClass} ${item.borderClass}`} />
            <span className="text-xs text-gray-600">{item.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 ml-auto">
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[11px] text-blue-600 font-medium">Bấm vào môn để tùy chỉnh nhanh</span>
        </div>
      </div>
    </div>
  );
}

function EditSessionDialog({
  session,
  weekNumber,
  overrides,
  onSave
}: {
  session: ScheduleSession;
  weekNumber: number;
  overrides: ScheduleOverrides;
  onSave: (newOverrides: ScheduleOverrides) => void;
}) {
  const existingGlobal = overrides.sessionOverrides[session.id] || {};

  const [room, setRoom] = useState(session.room);
  const [startPeriod, setStartPeriod] = useState(session.startPeriod.toString());
  const [endPeriod, setEndPeriod] = useState(session.endPeriod.toString());
  const [dayOfWeek, setDayOfWeek] = useState(session.dayOfWeek.toString());
  const [note, setNote] = useState(session.note || '');
  const [color, setColor] = useState(session.color);
  const [startWeek, setStartWeek] = useState((existingGlobal.startWeek ?? '').toString());
  const [endWeek, setEndWeek] = useState((existingGlobal.endWeek ?? '').toString());
  const [mode, setMode] = useState<'global' | 'single'>('global');

  const colorBgs = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-600',
  };

  const getOrCreateGlobalOverride = (newOverrides: ScheduleOverrides) => {
    return { ...newOverrides.sessionOverrides[session.id] };
  };

  const handleSave = () => {
    const newOverrides = { ...overrides };
    const update: any = {
      room,
      startPeriod: parseFloat(startPeriod),
      endPeriod: parseFloat(endPeriod),
      dayOfWeek: parseInt(dayOfWeek) as any,
      note: note.trim() || undefined,
      color,
      startWeek: startWeek ? parseInt(startWeek) : undefined,
      endWeek: endWeek ? parseInt(endWeek) : undefined,
    };

    if (mode === 'global') {
      newOverrides.sessionOverrides = {
        ...newOverrides.sessionOverrides,
        [session.id]: { ...getOrCreateGlobalOverride(newOverrides), ...update }
      };
    } else {
      newOverrides.weekOverrides = {
        ...newOverrides.weekOverrides,
        [`${weekNumber}_${session.id}`]: update
      };
    }
    onSave(newOverrides);
  };

  const handleSkipWeek = () => {
    const newOverrides = { ...overrides };
    const existing = getOrCreateGlobalOverride(newOverrides);
    const hiddenWeeks = [...(existing.hiddenWeeks || [])];
    if (!hiddenWeeks.includes(weekNumber)) hiddenWeeks.push(weekNumber);
    newOverrides.sessionOverrides = {
      ...newOverrides.sessionOverrides,
      [session.id]: { ...existing, hiddenWeeks }
    };
    onSave(newOverrides);
  };

  const handleEndFromWeek = () => {
    const newOverrides = { ...overrides };
    const existing = getOrCreateGlobalOverride(newOverrides);
    newOverrides.sessionOverrides = {
      ...newOverrides.sessionOverrides,
      [session.id]: { ...existing, endWeek: weekNumber - 1 }
    };
    onSave(newOverrides);
  };

  const handleDeleteSession = () => {
    const newOverrides = { ...overrides };
    const existing = getOrCreateGlobalOverride(newOverrides);
    // endWeek = 0 effectively hides the session entirely
    newOverrides.sessionOverrides = {
      ...newOverrides.sessionOverrides,
      [session.id]: { ...existing, endWeek: 0 }
    };
    onSave(newOverrides);
  };

  return (
    <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl bg-white max-h-[90vh] overflow-y-auto">
      <div className="p-6 space-y-5">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <Pencil className="w-5 h-5 text-[#004A98]" />
            Tùy chỉnh môn học
          </DialogTitle>
          <DialogDescription className="text-gray-500 font-medium">
            {session.courseCode} — {session.courseName}
          </DialogDescription>
        </DialogHeader>

        {/* Mode selector */}
        <div className="flex p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => setMode('global')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${mode === 'global' ? 'bg-white shadow-md text-blue-600 scale-[1.02]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Toàn bộ học kỳ
          </button>
          <button
            onClick={() => setMode('single')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${mode === 'single' ? 'bg-white shadow-md text-blue-600 scale-[1.02]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Chỉ Tuần {weekNumber}
          </button>
        </div>

        <div className="grid gap-4">
          {/* Day and Room */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="day" className="text-[11px] uppercase font-bold text-gray-400 ml-1 flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" /> Thứ
              </Label>
              <select
                id="day"
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm font-medium outline-none"
              >
                {DAYS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                <option value="8">Chủ Nhật</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="room" className="text-[11px] uppercase font-bold text-gray-400 ml-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Phòng
              </Label>
              <Input id="room" value={room} onChange={(e) => setRoom(e.target.value)} className="h-10 rounded-xl border-gray-200" />
            </div>
          </div>

          {/* Periods */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="start" className="text-[11px] uppercase font-bold text-gray-400 ml-1">Tiết bắt đầu</Label>
              <Input id="start" type="number" step="0.5" value={startPeriod} onChange={(e) => setStartPeriod(e.target.value)} className="h-10 rounded-xl border-gray-200" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end" className="text-[11px] uppercase font-bold text-gray-400 ml-1">Tiết kết thúc</Label>
              <Input id="end" type="number" step="0.5" value={endPeriod} onChange={(e) => setEndPeriod(e.target.value)} className="h-10 rounded-xl border-gray-200" />
            </div>
          </div>

          {/* Week range — only in global mode */}
          {mode === 'global' && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-blue-50/60 rounded-xl border border-blue-100">
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase font-bold text-blue-500 ml-1">Bắt đầu từ tuần</Label>
                <Input type="number" placeholder="Mặc định" value={startWeek} onChange={(e) => setStartWeek(e.target.value)} className="h-10 rounded-xl border-blue-200 bg-white" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase font-bold text-blue-500 ml-1">Kết thúc ở tuần</Label>
                <Input type="number" placeholder="Mặc định" value={endWeek} onChange={(e) => setEndWeek(e.target.value)} className="h-10 rounded-xl border-blue-200 bg-white" />
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="note" className="text-[11px] uppercase font-bold text-gray-400 ml-1 flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> Ghi chú
            </Label>
            <Input
              id="note"
              placeholder="Nhập lời nhắc (Kiểm tra, mang sách...)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="h-10 rounded-xl border-gray-200"
            />
          </div>

          {/* Color */}
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase font-bold text-gray-400 ml-1 flex items-center gap-1">
              <Palette className="w-3 h-3" /> Màu sắc
            </Label>
            <div className="flex items-center gap-3">
              <Input
                type="color"
                value={color.startsWith('#') ? color : '#3b82f6'}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 p-1 rounded-xl cursor-pointer border-gray-200"
              />
              <div className="flex gap-2">
                {Object.keys(colorBgs).map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full border-2 ${color === c ? 'border-gray-500' : 'border-transparent'} ${colorBgs[c as keyof typeof colorBgs]}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div className="p-3 bg-red-50 rounded-xl border border-red-100 space-y-2">
          <p className="text-[11px] uppercase font-bold text-red-400 mb-2">Xóa / Ẩn buổi học</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleSkipWeek}
              className="py-2 px-2 text-[11px] font-bold rounded-lg bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors border border-orange-200 leading-tight"
            >
              Bỏ Tuần {weekNumber}
            </button>
            <button
              onClick={handleEndFromWeek}
              className="py-2 px-2 text-[11px] font-bold rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors border border-red-200 leading-tight"
            >
              Kết thúc từ Tuần {weekNumber}
            </button>
            <button
              onClick={handleDeleteSession}
              className="py-2 px-2 text-[11px] font-bold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors leading-tight"
            >
              Xóa toàn bộ
            </button>
          </div>
        </div>

        <DialogFooter className="flex gap-3">
          <Button variant="ghost" className="flex-1 h-10 rounded-xl text-gray-500 font-bold hover:bg-gray-100">
            Đóng
          </Button>
          <Button onClick={handleSave} className="flex-[2] h-10 rounded-xl bg-[#0055CC] hover:bg-[#004A98] font-bold text-white transition-all active:scale-95">
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </div>
    </DialogContent>
  );
}

function HolidayManagerDialog({
  overrides,
  courses,
  onSave
}: {
  overrides: ScheduleOverrides;
  courses: string[];
  onSave: (newOverrides: ScheduleOverrides) => void;
}) {
  const [startWeek, setStartWeek] = useState('10');
  const [duration, setDuration] = useState('1');
  const [affected, setAffected] = useState<'all' | string>('all');
  const [reason, setReason] = useState('Nghỉ thi');

  const addHoliday = () => {
    const newHoliday: Holiday = {
      id: Math.random().toString(36).substr(2, 9),
      startWeek: parseInt(startWeek),
      duration: parseInt(duration),
      affectedCourseCodes: affected === 'all' ? 'all' : [affected],
      reason
    };

    onSave({
      ...overrides,
      holidays: [...overrides.holidays, newHoliday]
    });
  };

  const removeHoliday = (id: string) => {
    onSave({
      ...overrides,
      holidays: overrides.holidays.filter(h => h.id !== id)
    });
  };

  return (
    <DialogContent className="sm:max-w-md p-6 overflow-hidden border-none shadow-2xl bg-white">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-orange-600" />
          Quản lý kỳ nghỉ & Dời lịch
        </DialogTitle>
        <DialogDescription>
          Thêm kỳ nghỉ để tự động dời lịch học của các môn bị ảnh hưởng.
        </DialogDescription>
      </DialogHeader>

      <div className="py-4 space-y-4">
        {/* Form thêm mới */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase font-bold text-gray-500">Từ tuần nào</Label>
              <Input type="number" value={startWeek} onChange={(e) => setStartWeek(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase font-bold text-gray-500">Số tuần nghỉ</Label>
              <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase font-bold text-gray-500">Áp dụng cho môn</Label>
            <select
              value={affected}
              onChange={(e) => setAffected(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white text-sm"
            >
              <option value="all">Tất cả các môn</option>
              {courses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase font-bold text-gray-500">Lý do</Label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="VD: Nghỉ Tết, Nghỉ thi..." />
          </div>

          <Button onClick={addHoliday} className="w-full bg-[#004A98] hover:bg-[#004A98] gap-2">
            <Plus className="w-4 h-4" /> Thêm kỳ nghỉ
          </Button>
        </div>

        {/* Danh sách hiện tại */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Kỳ nghỉ đã thiết lập:</Label>
          {overrides.holidays.length === 0 ? (
            <p className="text-xs text-gray-400 italic text-center py-4">Chưa có kỳ nghỉ nào được thiết lập.</p>
          ) : (
            <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
              {overrides.holidays.map(h => (
                <div key={h.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <div className="text-xs">
                    <p className="font-bold text-gray-900">{h.reason}</p>
                    <p className="text-gray-500">Tuần {h.startWeek} • {h.duration} tuần • {h.affectedCourseCodes === 'all' ? 'Tất cả môn' : h.affectedCourseCodes.join(', ')}</p>
                  </div>
                  <button onClick={() => removeHoliday(h.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DialogContent>
  );
}

function CourseCard({
  sessions,
  hasConflict = false,
  weekNumber,
  overrides,
  onSave
}: {
  sessions: ScheduleSession | ScheduleSession[];
  hasConflict?: boolean;
  weekNumber: number;
  overrides: ScheduleOverrides;
  onSave: (newOverrides: ScheduleOverrides) => void;
}) {
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

  // Đảm bảo sessions luôn là array
  const sessionArray = Array.isArray(sessions) ? sessions : [sessions];
  const primarySession = sessionArray[0];

  // Tính toán vị trí và chiều cao dựa trên tiết thực tế (inclusive endPeriod)
  const rowSpan = calculateRowSpan(primarySession);
  const start = primarySession.startPeriod;
  const displayEnd = getDisplayEnd(primarySession);
  const rowStart = Math.floor(start);

  // top: phần lẻ của tiết bắt đầu so với ô đầu, tính theo % của toàn bộ rowSpan
  const topOffsetPercent = ((start - rowStart) / rowSpan) * 100;
  // height: khoảng từ start đến displayEnd, tính theo % của toàn bộ rowSpan
  const heightPercent = ((displayEnd - start) / rowSpan) * 100;

  // Chọn màu theo trạng thái trùng lịch
  const isCustomColor = primarySession.color.startsWith('#');
  const displayColorClasses = hasConflict
    ? 'bg-red-50 border-red-500 hover:bg-red-100'
    : isCustomColor
      ? ''
      : colorClasses[primarySession.color as keyof typeof colorClasses];

  const customStyle = !hasConflict && isCustomColor ? {
    backgroundColor: `${primarySession.color}15`, // 15 is hex for ~8% opacity
    borderColor: primarySession.color,
  } : {};

  return (
    <Dialog>
      <Tooltip delayDuration={150}>
        <TooltipTrigger asChild>
          <div
            className="relative w-full h-full group"
            style={{
              minHeight: `${rowSpan * 56}px`,
            }}
          >
            <div
              className={`absolute w-full p-1.5 rounded border-l-2 flex flex-col justify-center transition-all duration-200 cursor-pointer overflow-hidden ${displayColorClasses} ${primarySession.isOverridden ? 'border-dashed border-2' : ''}`}
              style={{
                top: `${topOffsetPercent}%`,
                height: `calc(${heightPercent}% - 6px)`, // Trừ hao padding của table cell (p-1)
                ...customStyle
              }}
            >
              {/* Note Indicator */}
              {primarySession.note && (
                <div className="absolute bottom-1 right-1 opacity-60">
                  <MessageSquare className="w-2.5 h-2.5" />
                </div>
              )}
              {/* Overlay Edit Button - Only this triggers Dialog */}
              <DialogTrigger asChild>
                <div
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-1.5 bg-white shadow-md rounded-md border border-gray-200 hover:bg-gray-50 transition-colors">
                    <Pencil className="w-3 h-3 text-blue-600" />
                  </div>
                </div>
              </DialogTrigger>

              {/* Badge trùng lịch + số lượng môn */}
              {hasConflict && (
                <div className="mb-1 flex items-center gap-1">
                  <span className="inline-block text-[13px] font-bold text-red-700">⚠️</span>
                  <span className="text-[11px] font-bold text-red-700">Trùng {sessionArray.length} môn</span>
                </div>
              )}

              {/* Hiển thị các môn học */}
              {sessionArray.map((sess, idx) => (
                <div key={sess.id} className={idx > 0 ? 'border-t border-red-200 pt-1 mt-1' : ''}>
                  {/* Course Name - Max 2 lines with ellipsis */}
                  <div className={`text-[11px] font-bold leading-tight mb-0.5 line-clamp-1 ${hasConflict ? 'text-red-700' : 'text-gray-700'}`}>
                    {sess.courseName}
                  </div>

                  {/* Course Code */}
                  <div className={`font-mono text-[10px] font-medium mb-0.5 leading-tight truncate ${hasConflict ? 'text-red-700' : 'text-gray-900'}`}>
                    {sess.courseCode}
                  </div>

                  {/* Type & Room - Truncate if too long */}
                  <div className={`text-[10px] leading-tight truncate ${hasConflict ? 'text-red-600' : 'text-gray-600'}`}>
                    {typeLabels[sess.type]} | {sess.room}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" align="start" className="z-[100] w-80 bg-[#e8f0fd] border-blue-500 text-gray-900 rounded-lg shadow-xl p-3 text-xs pointer-events-none animate-in fade-in zoom-in-95 duration-200 border border-gray-200">
          <div className="relative">
            {sessionArray.map((sess, idx) => (
              <div key={sess.id} className={idx > 0 ? 'border-t border-gray-200 pt-2 mt-2' : ''}>
                <div className="font-bold text-sm mb-2 text-blue-800">
                  {sess.courseCode} - {sess.courseName}
                </div>
                <div className="space-y-1 text-gray-600">
                  <div className="flex justify-between">
                    <span>Loại:</span>
                    <span className="font-medium text-gray-900">{typeFullLabels[sess.type]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phòng:</span>
                    <span className="font-medium text-gray-900">{sess.room}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tiết:</span>
                    <span className="font-medium text-gray-900">{sess.startPeriod} - {Math.floor(sess.endPeriod)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Thời gian: </span>
                    <span className="font-medium text-gray-900">{sess.startTime} - {sess.endTime}</span>
                  </div>
                  {sess.totalWeeks > 0 && (
                    <div className="flex justify-between">
                      <span>Ngày: </span>
                      <span className="font-medium text-gray-900">{sess.startDate} - {sess.endDate} </span>
                    </div>
                  )}
                  {sess.totalWeeks > 0 && (
                    <div className="flex justify-between">
                      <span>Thời lượng:</span>
                      <span className="font-medium text-gray-900">{sess.totalWeeks} tuần</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-1 mt-1">
                    <div className="text-[11px] text-gray-500">
                      GV: {sess.instructor}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      Lớp: {sess.classCode} • {sess.credits} TC
                    </div>
                  </div>

                  {sess.note && (
                    <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded-md flex gap-2 items-start">
                      <MessageSquare className="w-3 h-3 text-orange-600 mt-0.5" />
                      <div className="text-[11px] text-orange-800 italic">
                        {sess.note}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
      <EditSessionDialog
        session={primarySession}
        weekNumber={weekNumber}
        overrides={overrides}
        onSave={onSave}
      />
    </Dialog>
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
  currentPeriod,
  overrides,
  onSave
}: {
  period: number;
  time: string;
  schedule: WeeklySchedule;
  isToday: (day: number) => boolean;
  currentPeriod: number | null;
  overrides: ScheduleOverrides;
  onSave: (newOverrides: ScheduleOverrides) => void;
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
        const hasOverlap = hasOverlappingSession(day.value, period, schedule.sessions);

        if (session && shouldRenderCell(session, period)) {
          // Nếu có trùng lịch, lấy tất cả sessions; không thì lấy single session
          const sessionsToDisplay = hasOverlap
            ? getAllSessionsForCell(day.value, period, schedule.sessions)
            : session;

          return (
            <td key={day.value} rowSpan={calculateRowSpan(session)} className={`p-1 border border-gray-200 align-middle ${isTodayCell ? 'bg-green-50/50' : ''
              } ${isCurrentPeriod ? 'ring-2 ring-green-500 ring-inset' : ''}`}>
              <CourseCard
                sessions={sessionsToDisplay}
                hasConflict={hasOverlap}
                weekNumber={schedule.weekNumber}
                overrides={overrides}
                onSave={onSave}
              />
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
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-gray-900 mb-2">Thời khóa biểu</h1>
            <p className="text-gray-600">
              Xem lịch học theo tuần - {schedule.semesterName}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Manage Holidays Button */}
            <Dialog>
              <DialogTrigger asChild>
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors duration-200 border border-orange-200"
                >
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Quản lý nghỉ lễ</span>
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
              className="flex items-center gap-2 px-4 py-2 bg-[#004A98] text-white rounded-lg hover:bg-[#003d7a] transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Xuất lịch</span>
            </button>
          </div>
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
            subtitle={formattedHours}
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
            disabled={currentWeek === 25} // Increased limit for holidays
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-sm font-medium">Tuần sau</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Weekly Calendar Grid */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto mb-6">
          <table className="w-full border-collapse table-fixed min-w-[1000px]">
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