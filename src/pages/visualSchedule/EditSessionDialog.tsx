// EditSessionDialog.tsx
import { useState } from 'react';
import { Pencil, MapPin, MessageSquare, Palette } from 'lucide-react';
import { Calendar as CalendarIcon, Trash2 } from 'lucide-react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogFooter, DialogDescription, DialogTrigger,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { type ScheduleSession, type ScheduleOverrides, DAYS } from '../../types/Schedule';
import { calculateRowSpan, getDisplayEnd } from '../../logic/visualCheduler/scheduleHelpers';
import { Tooltip, TooltipTrigger, TooltipContent } from '../../components/ui/tooltip';

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

export { EditSessionDialog, CourseCard };