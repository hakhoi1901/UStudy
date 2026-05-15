// EditSessionDialog.tsx
import { useState, useRef, useEffect } from 'react';
import { Pencil, MapPin, MessageSquare, Palette, X, Clock, Users } from 'lucide-react';
import { Calendar as CalendarIcon, Trash2 } from 'lucide-react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogFooter, DialogDescription, DialogTrigger,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { type ScheduleSession, type ScheduleOverrides, DAYS } from '../types';
import { calculateRowSpan, getDisplayEnd } from '../services/schedule-helpers';

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
        <DialogContent className="sm:max-w-md p-6 overflow-hidden border-none shadow-xl bg-white rounded-lg max-h-[90vh] overflow-y-auto">
            <div className="space-y-6">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <Pencil className="w-5 h-5 text-[#004A98]" />
                        Tùy chỉnh môn học
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-500 mt-1">
                        {session.courseCode} - {session.courseName}
                    </DialogDescription>
                </DialogHeader>

                {/* Mode selector */}
                <div className="flex p-1 bg-gray-100 rounded-lg">
                    <button
                        onClick={() => setMode('global')}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${mode === 'global' ? 'bg-white shadow-sm text-[#004A98]' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Toàn bộ học kỳ
                    </button>
                    <button
                        onClick={() => setMode('single')}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${mode === 'single' ? 'bg-white shadow-sm text-[#004A98]' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Chỉ Tuần {weekNumber}
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Day and Room */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="day" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                <CalendarIcon className="w-4 h-4 text-gray-500" /> Thứ
                            </Label>
                            <select
                                id="day"
                                value={dayOfWeek}
                                onChange={(e) => setDayOfWeek(e.target.value)}
                                className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#004A98] focus:border-transparent"
                            >
                                {DAYS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                                <option value="8">Chủ Nhật</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="room" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-gray-500" /> Phòng
                            </Label>
                            <Input id="room" value={room} onChange={(e) => setRoom(e.target.value)} className="h-10 rounded-md border-gray-300" />
                        </div>
                    </div>

                    {/* Periods */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="start" className="text-sm font-medium text-gray-700">Tiết bắt đầu</Label>
                            <Input id="start" type="number" step="0.5" value={startPeriod} onChange={(e) => setStartPeriod(e.target.value)} className="h-10 rounded-md border-gray-300" />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="end" className="text-sm font-medium text-gray-700">Tiết kết thúc</Label>
                            <Input id="end" type="number" step="0.5" value={endPeriod} onChange={(e) => setEndPeriod(e.target.value)} className="h-10 rounded-md border-gray-300" />
                        </div>
                    </div>

                    {/* Week range - only in global mode */}
                    {mode === 'global' && (
                        <div className="grid grid-cols-2 gap-4 p-4 bg-[#004A98]/5 rounded-lg border border-[#004A98]/20">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-[#004A98]">Bắt đầu từ tuần</Label>
                                <Input type="number" placeholder="Mặc định" value={startWeek} onChange={(e) => setStartWeek(e.target.value)} className="h-10 rounded-md border-gray-300 bg-white" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-[#004A98]">Kết thúc ở tuần</Label>
                                <Input type="number" placeholder="Mặc định" value={endWeek} onChange={(e) => setEndWeek(e.target.value)} className="h-10 rounded-md border-gray-300 bg-white" />
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    <div className="space-y-1.5">
                        <Label htmlFor="note" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                            <MessageSquare className="w-4 h-4 text-gray-500" /> Ghi chú
                        </Label>
                        <Input
                            id="note"
                            placeholder="Nhập lời nhắc (Kiểm tra, mang sách...)"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="h-10 rounded-md border-gray-300"
                        />
                    </div>

                    {/* Color */}
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                            <Palette className="w-4 h-4 text-gray-500" /> Màu sắc
                        </Label>
                        <div className="flex items-center gap-4">
                            <Input
                                type="color"
                                value={color.startsWith('#') ? color : '#3b82f6'}
                                onChange={(e) => setColor(e.target.value)}
                                className="w-10 h-10 p-1 rounded-md cursor-pointer border-gray-300"
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
                <div className="p-4 bg-white rounded-lg border border-red-200 space-y-3">
                    <p className="text-sm font-semibold text-red-600 flex items-center gap-2">
                        <Trash2 className="w-4 h-4" />
                        Xóa / Ẩn buổi học
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            onClick={handleSkipWeek}
                            className="py-2 px-2 text-xs font-medium rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Bỏ Tuần {weekNumber}
                        </button>
                        <button
                            onClick={handleEndFromWeek}
                            className="py-2 px-2 text-xs font-medium rounded-md bg-white border border-orange-300 text-orange-700 hover:bg-orange-50 transition-colors"
                        >
                            Kết thúc từ Tuần {weekNumber}
                        </button>
                        <button
                            onClick={handleDeleteSession}
                            className="py-2 px-2 text-xs font-medium rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
                        >
                            Xóa toàn bộ
                        </button>
                    </div>
                </div>

                <DialogFooter className="flex gap-3 pt-2 border-t border-gray-100">
                    <Button variant="outline" className="flex-1 h-10 rounded-md text-gray-700 font-medium border-gray-300 hover:bg-gray-50">
                        Đóng
                    </Button>
                    <Button onClick={handleSave} className="flex-[2] h-10 rounded-md bg-[#004A98] hover:bg-[#003d7a] font-medium text-white transition-colors">
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
    const [showInfo, setShowInfo] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const colorClasses = {
        blue: 'bg-blue-50 border-blue-500',
        green: 'bg-green-50 border-green-500',
        yellow: 'bg-yellow-50 border-yellow-500',
        purple: 'bg-purple-50 border-purple-500',
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
        ? 'bg-red-50 border-red-500'
        : isCustomColor
            ? ''
            : colorClasses[primarySession.color as keyof typeof colorClasses];

    const customStyle = !hasConflict && isCustomColor ? {
        backgroundColor: `${primarySession.color}15`,
        borderColor: primarySession.color,
    } : {};

    // Đóng popup khi bấm ra ngoài
    useEffect(() => {
        if (!showInfo) return;
        const handleClickOutside = (e: MouseEvent | TouchEvent) => {
            if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
                setShowInfo(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [showInfo]);

    // Tính toán hướng hiển thị popup để không bị che khuất
    const isRightSide = primarySession.dayOfWeek >= 6; // Thứ 6, 7, CN
    const isBottomSide = primarySession.startPeriod >= 8; // Tiết 8, 9, 10

    return (
        <Dialog>
            <div
                ref={cardRef}
                className="relative w-full h-full"
                style={{ minHeight: `calc(var(--schedule-row-height, 36px) * ${rowSpan})` }}
            >
                {/* Card chính - click để toggle info */}
                <div
                    className={`absolute w-full p-1.5 rounded border-l-2 flex flex-col justify-center transition-all duration-200 cursor-pointer overflow-hidden
                        ${displayColorClasses}
                        ${primarySession.isOverridden ? 'border-dashed border-2' : ''}
                        ${showInfo ? 'ring-2 ring-blue-400 ring-inset' : ''}
                    `}
                    style={{
                        top: `${topOffsetPercent}%`,
                        height: `calc(${heightPercent}% - 6px)`,
                        ...customStyle
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowInfo(prev => !prev);
                    }}
                >
                    {/* Note Indicator */}
                    {primarySession.note && (
                        <div className="absolute bottom-1 right-1 opacity-60">
                            <MessageSquare className="w-2.5 h-2.5" />
                        </div>
                    )}

                    {/* Badge trùng lịch */}
                    {hasConflict && (
                        <div className="mb-1 flex items-center gap-1">
                            <span className="inline-block text-[13px] font-bold text-red-700">⚠️</span>
                            <span className="text-[11px] font-bold text-red-700">Trùng {sessionArray.length} môn</span>
                        </div>
                    )}

                    {/* Hiển thị các môn học */}
                    {sessionArray.map((sess, idx) => (
                        <div key={sess.id} className={idx > 0 ? 'border-t border-red-200 pt-0.5 mt-0.5' : ''}>
                            <div className={`text-[9px] md:text-[11px] font-bold leading-tight mb-0.5 line-clamp-1 ${hasConflict ? 'text-red-700' : 'text-gray-700'}`}>
                                {sess.courseName}
                            </div>
                            <div className={`font-mono text-[8px] md:text-[10px] font-medium mb-0.5 leading-tight truncate ${hasConflict ? 'text-red-700' : 'text-gray-900'}`}>
                                {sess.courseCode}
                            </div>
                            <div className={`text-[8px] md:text-[10px] leading-tight truncate ${hasConflict ? 'text-red-600' : 'text-gray-600'}`}>
                                {sess.type} | {sess.room}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Popup thông tin chi tiết - hiện khi click */}
                {showInfo && (
                    <div
                        className={`absolute z-[200] w-72 bg-white border border-blue-200 rounded-xl shadow-2xl p-3 text-xs animate-in fade-in zoom-in-95 duration-150
                            ${isRightSide ? 'right-full mr-1' : 'left-full ml-1'}
                            ${isBottomSide ? 'bottom-0' : 'top-0'}
                        `}
                        style={{ minWidth: '260px' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header popup */}
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0 pr-2">
                                {sessionArray.map((sess, idx) => (
                                    <div key={sess.id} className={idx > 0 ? 'border-t border-gray-100 pt-2 mt-2' : ''}>
                                        <div className="font-bold text-sm text-blue-800 leading-tight mb-0.5">
                                            {sess.courseCode}
                                        </div>
                                        <div className="text-xs text-gray-600 leading-tight">
                                            {sess.courseName}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                className="flex-shrink-0 p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                                onClick={() => setShowInfo(false)}
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Thông tin chi tiết */}
                        {sessionArray.map((sess, idx) => (
                            <div key={sess.id} className={idx > 0 ? 'border-t border-gray-100 pt-2 mt-2' : ''}>
                                <div className="space-y-1.5">
                                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                                        <div className="text-gray-500">Loại:</div>
                                        <div className="font-medium text-gray-800 text-right">{typeFullLabels[sess.type]}</div>

                                        <div className="text-gray-500">Phòng:</div>
                                        <div className="font-medium text-gray-800 text-right">{sess.room}</div>

                                        <div className="text-gray-500">Tiết:</div>
                                        <div className="font-medium text-gray-800 text-right">{sess.startPeriod}–{Math.floor(sess.endPeriod)}</div>

                                        <div className="text-gray-500">Giờ:</div>
                                        <div className="font-medium text-gray-800 text-right">{sess.startTime}–{sess.endTime}</div>

                                        {sess.totalWeeks > 0 && (
                                            <>
                                                <div className="text-gray-500">Ngày:</div>
                                                <div className="font-medium text-gray-800 text-right">{sess.startDate}–{sess.endDate}</div>
                                                <div className="text-gray-500">Số tuần:</div>
                                                <div className="font-medium text-gray-800 text-right">{sess.totalWeeks} tuần</div>
                                            </>
                                        )}
                                    </div>

                                    <div className="pt-1 border-t border-gray-100 space-y-0.5">
                                        <div className="text-gray-500">GV: <span className="font-medium text-gray-800">{sess.instructor}</span></div>
                                        <div className="text-gray-500">Lớp: <span className="font-medium text-gray-800">{sess.classCode}</span> • <span className="font-medium text-gray-800">{sess.credits} TC</span></div>
                                    </div>

                                    {sess.note && (
                                        <div className="mt-1 p-2 bg-orange-50 border border-orange-200 rounded-md flex gap-1.5 items-start">
                                            <MessageSquare className="w-3 h-3 text-orange-600 mt-0.5 flex-shrink-0" />
                                            <div className="text-[11px] text-orange-800 italic">{sess.note}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Nút chỉnh sửa */}
                        <div className="mt-3 pt-2 border-t border-gray-100">
                            <DialogTrigger asChild>
                                <button
                                    className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#004A98] hover:bg-[#003d7a] text-white text-xs font-medium rounded-lg transition-colors"
                                    onClick={() => setShowInfo(false)}
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                    Chỉnh sửa môn học
                                </button>
                            </DialogTrigger>
                        </div>
                    </div>
                )}
            </div>

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