// EditSessionDialog.tsx
import { useEffect, useState } from 'react';
import { AlertTriangle, CalendarDays, CalendarOff, Check, Clock3, MapPin, MessageSquare, Palette, Pencil, RotateCcw, StickyNote } from 'lucide-react';
import { AppSelect, Input, Label, Switch, Textarea } from '../../../components/ui/form';
import { AppDialog } from '../../../components/ui/overlays/app-dialog';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../../../components/ui/overlays/hover-card';
import { type ScheduleSession, type ScheduleOverrides, type SessionOverride, DAYS } from '../types';
import type { OpenClassDetailTarget } from '../../../components/course';
import { calculateRowSpan, getDisplayEnd } from '../services/schedule-helpers';

function EditSessionDialog({ open, onOpenChange, session, weekNumber, overrides, onSave }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    session: ScheduleSession;
    weekNumber: number;
    overrides: ScheduleOverrides;
    onSave: (newOverrides: ScheduleOverrides) => void;
}) {
    const globalOverride = overrides.sessionOverrides[session.id];
    const weekOverrideKey = `${weekNumber}_${session.id}`;
    const weekOverride = overrides.weekOverrides[weekOverrideKey];
    const baseValues = session.baseValues ?? {
        room: session.room, dayOfWeek: session.dayOfWeek, startPeriod: session.startPeriod,
        endPeriod: session.endPeriod, note: undefined, color: session.color,
    };
    const [scope, setScope] = useState<'semester' | 'week'>('semester');
    const [room, setRoom] = useState(session.room);
    const [startPeriod, setStartPeriod] = useState(String(session.startPeriod));
    const [endPeriod, setEndPeriod] = useState(String(session.endPeriod));
    const [dayOfWeek, setDayOfWeek] = useState(String(session.dayOfWeek));
    const [note, setNote] = useState(session.note || '');
    const [color, setColor] = useState(session.color);
    const [startWeek, setStartWeek] = useState('');
    const [endWeek, setEndWeek] = useState('');
    const [isCurrentWeekVisible, setIsCurrentWeekVisible] = useState(true);
    const [error, setError] = useState('');
    const basicColorOptions = [
        { id: 'blue', name: 'Xanh UStudy', hex: '#004A98' },
        { id: 'green', name: 'Xanh lá', hex: '#059669' },
        { id: 'yellow', name: 'Vàng', hex: '#D97706' },
        { id: 'purple', name: 'Tím', hex: '#7C3AED' },
    ];

    const resolveValues = (override?: SessionOverride) => ({
        room: override?.room ?? baseValues.room,
        dayOfWeek: override?.dayOfWeek ?? baseValues.dayOfWeek,
        startPeriod: override?.startPeriod ?? baseValues.startPeriod,
        endPeriod: override?.endPeriod ?? baseValues.endPeriod,
        note: override?.note ?? baseValues.note ?? '',
        color: override?.color ?? baseValues.color,
    });

    const resetForm = (nextScope: 'semester' | 'week') => {
        const values = nextScope === 'week'
            ? { ...resolveValues(globalOverride), ...weekOverride }
            : resolveValues(globalOverride);
        setRoom(values.room);
        setDayOfWeek(String(values.dayOfWeek));
        setStartPeriod(String(values.startPeriod));
        setEndPeriod(String(values.endPeriod));
        setNote(values.note || '');
        setColor(values.color);
        setStartWeek(nextScope === 'semester' && globalOverride?.startWeek !== undefined ? String(globalOverride.startWeek) : '');
        setEndWeek(nextScope === 'semester' && globalOverride?.endWeek !== undefined ? String(globalOverride.endWeek) : '');
        setIsCurrentWeekVisible(!(globalOverride?.hiddenWeeks || []).includes(weekNumber));
        setError('');
    };

    useEffect(() => {
        if (open) resetForm(scope);
    // The form must refresh whenever another schedule cell is opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, session.id, weekNumber]);

    const persist = (nextOverrides: ScheduleOverrides) => {
        onSave(nextOverrides);
        onOpenChange(false);
    };

    const handleSave = () => {
        const parsedStart = Number(startPeriod);
        const parsedEnd = Number(endPeriod);
        const parsedDay = Number(dayOfWeek);
        const parsedStartWeek = startWeek ? Number(startWeek) : undefined;
        const parsedEndWeek = endWeek ? Number(endWeek) : undefined;
        const duration = Number.isInteger(parsedEnd) ? parsedEnd - parsedStart + 1 : parsedEnd - parsedStart;

        if (!Number.isFinite(parsedStart) || !Number.isFinite(parsedEnd) || parsedStart < 1 || parsedEnd > 10.5 || duration <= 0) {
            setError('Tiết học chưa hợp lệ. Hãy nhập từ tiết 1 đến tiết 10.5 và đảm bảo tiết kết thúc sau tiết bắt đầu.');
            return;
        }
        if (![...DAYS.map((day) => day.value), 8].includes(parsedDay as 2 | 3 | 4 | 5 | 6 | 7 | 8)) {
            setError('Vui lòng chọn ngày học hợp lệ.');
            return;
        }
        if (scope === 'semester' && (
            (parsedStartWeek !== undefined && (!Number.isInteger(parsedStartWeek) || parsedStartWeek < 1))
            || (parsedEndWeek !== undefined && (!Number.isInteger(parsedEndWeek) || parsedEndWeek < 1))
            || (parsedStartWeek !== undefined && parsedEndWeek !== undefined && parsedEndWeek < parsedStartWeek)
        )) {
            setError('Khoảng tuần áp dụng chưa hợp lệ.');
            return;
        }

        const update: SessionOverride = {
            room: room.trim(), startPeriod: parsedStart, endPeriod: parsedEnd,
            dayOfWeek: parsedDay as ScheduleSession['dayOfWeek'], note: note.trim() || undefined, color,
        };
        const hiddenWeeks = isCurrentWeekVisible
            ? (globalOverride?.hiddenWeeks || []).filter((week) => week !== weekNumber)
            : Array.from(new Set([...(globalOverride?.hiddenWeeks || []), weekNumber])).sort((a, b) => a - b);
        const visibilityChanged = isCurrentWeekVisible !== !(globalOverride?.hiddenWeeks || []).includes(weekNumber);

        if (scope === 'semester') {
            persist({ ...overrides, sessionOverrides: {
                ...overrides.sessionOverrides,
                [session.id]: {
                    ...globalOverride,
                    ...update,
                    startWeek: parsedStartWeek,
                    endWeek: parsedEndWeek,
                    hiddenWeeks: hiddenWeeks.length ? hiddenWeeks : undefined,
                },
            } });
            return;
        }
        persist({
            ...overrides,
            sessionOverrides: visibilityChanged ? {
                ...overrides.sessionOverrides,
                [session.id]: { ...globalOverride, hiddenWeeks: hiddenWeeks.length ? hiddenWeeks : undefined },
            } : overrides.sessionOverrides,
            weekOverrides: {
                ...overrides.weekOverrides,
                [weekOverrideKey]: { ...weekOverride, ...update },
            },
        });
    };

    const handleEndFromWeek = () => persist({ ...overrides, sessionOverrides: {
        ...overrides.sessionOverrides,
        [session.id]: { ...globalOverride, endWeek: Math.max(0, weekNumber - 1) },
    } });

    const handleRestore = () => {
        if (scope === 'week') {
            const { [weekOverrideKey]: _, ...weekOverrides } = overrides.weekOverrides;
            persist({ ...overrides, weekOverrides });
            return;
        }
        const { [session.id]: _, ...sessionOverrides } = overrides.sessionOverrides;
        const weekOverrides = Object.fromEntries(Object.entries(overrides.weekOverrides).filter(([key]) => !key.endsWith(`_${session.id}`)));
        persist({ ...overrides, sessionOverrides, weekOverrides });
    };

    const hasChanges = scope === 'semester'
        ? Boolean(globalOverride || Object.keys(overrides.weekOverrides).some((key) => key.endsWith(`_${session.id}`)))
        : Boolean(weekOverride);

    return (
        <AppDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Tùy chỉnh môn học"
            description={`${session.courseCode} · ${session.courseName}`}
            icon={Pencil}
            size="lg"
            mobileFullScreen
            contentClassName="space-y-0 !p-0 sm:!p-0"
            footer={
                <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        {hasChanges && (
                            <button
                                type="button"
                                onClick={handleRestore}
                                className="ustudy-button-dialog ustudy-button-dialog-cancel w-full gap-2 sm:w-auto"
                            >
                                <RotateCcw className="h-4 w-4" />
                                Khôi phục mặc định
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:flex">
                        <button type="button" onClick={() => onOpenChange(false)} className="ustudy-button-dialog ustudy-button-dialog-cancel">
                            Hủy
                        </button>
                        <button type="button" onClick={handleSave} className="ustudy-button-dialog ustudy-button-dialog-confirm">
                            Lưu thay đổi
                        </button>
                    </div>
                </div>
            }
        >
            <div className="divide-y divide-slate-200">
                <section className="px-4 py-4 sm:px-6 sm:py-5">
                    <div className="mb-3">
                        <h3 className="text-sm font-semibold text-gray-900">Phạm vi thay đổi</h3>
                        <p className="mt-1 text-xs leading-5 text-slate-500">Chọn chỉnh toàn bộ học kỳ hoặc chỉ riêng tuần đang xem.</p>
                    </div>
                    <div className="grid grid-cols-2 rounded-lg bg-slate-100 p-1" role="group" aria-label="Phạm vi áp dụng">
                        {(['semester', 'week'] as const).map((value) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => { setScope(value); resetForm(value); }}
                                aria-pressed={scope === value}
                                className={`min-h-10 rounded-md px-3 text-sm font-semibold transition-colors ${scope === value ? 'bg-white text-[#004A98] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                {value === 'semester' ? 'Cả học kỳ' : `Tuần ${weekNumber}`}
                            </button>
                        ))}
                    </div>
                </section>

                <section className="px-4 py-5 sm:px-6">
                    <div className="mb-4 flex items-start gap-3">
                        <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-[#004A98]" />
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900">Lịch học</h3>
                            <p className="mt-0.5 text-xs leading-5 text-slate-500">Điều chỉnh ngày, phòng và tiết học của buổi này.</p>
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label className="mb-1.5 block text-sm font-medium text-slate-700">Ngày học</Label>
                            <AppSelect
                                value={dayOfWeek}
                                onChange={setDayOfWeek}
                                options={[...DAYS.map((day) => ({ id: day.value, name: day.label })), { id: '8', name: 'Chủ Nhật' }]}
                                ariaLabel="Chọn ngày học"
                                triggerClassName="h-10 px-3 py-0 text-sm"
                            />
                        </div>
                        <div>
                            <Label htmlFor="schedule-room" className="mb-1.5 block text-sm font-medium text-slate-700">Phòng học</Label>
                            <div className="relative">
                                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input id="schedule-room" value={room} onChange={(event) => setRoom(event.target.value)} placeholder="Ví dụ: F202" className="h-10 rounded-lg bg-white pl-9" />
                            </div>
                        </div>
                        <div className="sm:col-span-2">
                            <Label className="mb-1.5 block text-sm font-medium text-slate-700">Tiết học</Label>
                            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                                <div className="relative">
                                    <Clock3 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input aria-label="Tiết bắt đầu" type="number" min="1" max="10.5" step="0.5" value={startPeriod} onChange={(event) => setStartPeriod(event.target.value)} placeholder="Bắt đầu" className="h-10 rounded-lg bg-white pl-9" />
                                </div>
                                <span className="text-xs font-medium text-slate-400">đến</span>
                                <Input aria-label="Tiết kết thúc" type="number" min="1" max="10.5" step="0.5" value={endPeriod} onChange={(event) => setEndPeriod(event.target.value)} placeholder="Kết thúc" className="h-10 rounded-lg bg-white" />
                            </div>
                        </div>
                    </div>
                </section>

                {scope === 'semester' && (
                    <section className="px-4 py-5 sm:px-6">
                        <div className="mb-4">
                            <h3 className="text-sm font-semibold text-gray-900">Khoảng tuần áp dụng</h3>
                            <p className="mt-1 text-xs leading-5 text-slate-500">Để trống để giữ thời gian mặc định của môn học.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="schedule-start-week" className="mb-1.5 block text-sm font-medium text-slate-700">Từ tuần</Label>
                                <Input id="schedule-start-week" type="number" min="1" step="1" placeholder="Mặc định" value={startWeek} onChange={(event) => setStartWeek(event.target.value)} className="h-10 rounded-lg bg-white" />
                            </div>
                            <div>
                                <Label htmlFor="schedule-end-week" className="mb-1.5 block text-sm font-medium text-slate-700">Đến tuần</Label>
                                <Input id="schedule-end-week" type="number" min="1" step="1" placeholder="Mặc định" value={endWeek} onChange={(event) => setEndWeek(event.target.value)} className="h-10 rounded-lg bg-white" />
                            </div>
                        </div>
                    </section>
                )}

                <section className="px-4 py-5 sm:px-6">
                    <div className="mb-4 flex items-start gap-3">
                        <Palette className="mt-0.5 h-5 w-5 shrink-0 text-[#004A98]" />
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900">Màu và ghi chú</h3>
                            <p className="mt-0.5 text-xs leading-5 text-slate-500">Màu chỉ dùng để nhận biết môn trên thời khóa biểu.</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <Label className="mb-2 block text-sm font-medium text-slate-700">Màu hiển thị</Label>
                            <div className="flex flex-wrap items-center gap-2">
                            {basicColorOptions.map((option) => (
                                <button
                                    key={option.id}
                                    type="button"
                                    title={option.name}
                                    aria-label={`Chọn ${option.name}`}
                                    aria-pressed={color === option.id}
                                    onClick={() => setColor(option.id)}
                                    className={`relative flex h-10 w-10 items-center justify-center rounded-lg border bg-white transition-colors ${color === option.id ? 'border-[#004A98] ring-2 ring-[#004A98]/15' : 'border-slate-200 hover:border-slate-400'}`}
                                >
                                    <span className="h-6 w-6 rounded-full" style={{ backgroundColor: option.hex }} />
                                    {color === option.id && <Check className="absolute h-3.5 w-3.5 text-white" strokeWidth={3} />}
                                </button>
                            ))}
                            <label title="Màu tùy chỉnh" className={`relative flex h-10 min-w-10 cursor-pointer items-center justify-center gap-2 rounded-lg border bg-white px-2.5 transition-colors ${color.startsWith('#') ? 'border-[#004A98] text-[#004A98] ring-2 ring-[#004A98]/15' : 'border-slate-200 text-slate-600 hover:border-slate-400'}`}>
                                <span className="h-5 w-5 rounded-full border border-black/10" style={{ backgroundColor: color.startsWith('#') ? color : '#FFFFFF' }} />
                                <span className="hidden text-xs font-semibold sm:inline">Tùy chỉnh</span>
                                <input
                                    type="color"
                                    value={color.startsWith('#') ? color : '#004A98'}
                                    onChange={(event) => setColor(event.target.value)}
                                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                    aria-label="Chọn màu tùy chỉnh"
                                />
                            </label>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="schedule-note" className="mb-1.5 block text-sm font-medium text-slate-700">Ghi chú</Label>
                            <div className="relative">
                                <StickyNote className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Textarea id="schedule-note" rows={3} placeholder="Ví dụ: mang máy tính, kiểm tra giữa kỳ" value={note} onChange={(event) => setNote(event.target.value)} className="min-h-20 rounded-lg bg-white pl-9" />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="px-4 py-5 sm:px-6">
                    <div className="mb-3">
                        <h3 className="text-sm font-semibold text-gray-900">Ngoại lệ tuần {weekNumber}</h3>
                        <p className="mt-1 text-xs leading-5 text-slate-500">Các thiết lập dưới đây chỉ ảnh hưởng đến thời gian xuất hiện của môn.</p>
                    </div>
                    <div className="divide-y divide-slate-200 border-y border-slate-200">
                        <div className="flex min-h-14 items-center gap-3 py-2.5">
                            <CalendarDays className="h-4 w-4 shrink-0 text-[#004A98]" />
                            <label htmlFor="schedule-week-visible" className="min-w-0 flex-1 cursor-pointer">
                                <span className="block text-sm font-medium text-gray-900">Hiển thị buổi học</span>
                                <span className="block text-xs text-slate-500">Bật hoặc ẩn riêng buổi học trong tuần {weekNumber}.</span>
                            </label>
                            <Switch
                                id="schedule-week-visible"
                                checked={isCurrentWeekVisible}
                                onCheckedChange={setIsCurrentWeekVisible}
                                className="h-6 w-11 data-[state=checked]:bg-[#004A98] data-[state=unchecked]:bg-slate-300 [&_[data-slot=switch-thumb]]:size-5"
                            />
                        </div>
                        {scope === 'semester' && (
                            <button
                                type="button"
                                onClick={handleEndFromWeek}
                                className="flex min-h-14 w-full items-center gap-3 py-2.5 text-left transition-colors hover:text-amber-800"
                            >
                                <CalendarOff className="h-4 w-4 shrink-0 text-amber-600" />
                                <span className="min-w-0 flex-1">
                                    <span className="block text-sm font-medium text-gray-900">Ngừng môn từ tuần {weekNumber}</span>
                                    <span className="block text-xs text-slate-500">Ẩn toàn bộ các buổi từ tuần này trở đi.</span>
                                </span>
                                <span className="text-xs font-semibold text-amber-700">Áp dụng</span>
                            </button>
                        )}
                    </div>
                </section>
            </div>

            {error && <p role="alert" className="mx-4 mb-5 border-l-2 border-red-500 bg-red-50 px-3 py-2.5 text-xs leading-5 text-red-700 sm:mx-6">{error}</p>}
        </AppDialog>
    );
}

function CourseCard({
    sessions,
    hasConflict = false,
    weekNumber,
    overrides,
    onSave,
    onOpenClassDetails
}: {
    sessions: ScheduleSession | ScheduleSession[];
    hasConflict?: boolean;
    weekNumber: number;
    overrides: ScheduleOverrides;
    onSave: (newOverrides: ScheduleOverrides) => void;
    onOpenClassDetails?: (target: OpenClassDetailTarget) => void;
}) {
    const [showInfo, setShowInfo] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

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
    const sessionsForCard = hasConflict ? [primarySession] : sessionArray;
    const conflictingCourseCount = new Set(sessionArray.map((session) => session.courseCode)).size;
    const conflictLabel = conflictingCourseCount > 1
        ? `Trùng ${conflictingCourseCount} môn`
        : `Trùng ${sessionArray.length} buổi`;

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

    return (
        <>
            <HoverCard openDelay={180} closeDelay={100}>
                <HoverCardTrigger asChild>
            <div
                className="relative w-full h-full"
                style={{ minHeight: `calc(var(--schedule-row-height, 36px) * ${rowSpan})` }}
            >
                {/* Card chính - click để toggle info */}
                <div
                    className={`absolute w-full p-1.5 rounded border-l-2 flex flex-col justify-center transition-all duration-200 cursor-pointer overflow-hidden
                        ${displayColorClasses}
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
                            <AlertTriangle className="h-3 w-3 shrink-0 text-red-700" />
                            <span className="text-[11px] font-bold text-red-700">{conflictLabel}</span>
                        </div>
                    )}

                    {/* Hiển thị các môn học */}
                    {sessionsForCard.map((sess, idx) => (
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

            </div>
                </HoverCardTrigger>

                {hasConflict && sessionArray.length > 1 && (
                    <HoverCardContent
                        side="top"
                        align="start"
                        sideOffset={8}
                        className="z-[70] w-80 max-w-[calc(100vw-2rem)] rounded-lg border-red-200 bg-white p-0 text-gray-900 shadow-[0_14px_32px_rgba(127,29,29,0.16)]"
                    >
                        <div className="flex items-start gap-2 border-b border-red-100 bg-red-50 px-3 py-2.5">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-red-900">{conflictLabel}</p>
                                <p className="mt-0.5 text-xs text-red-700">Các buổi học cùng chiếm khung giờ này.</p>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-100 px-3">
                            {sessionArray.map((sess) => (
                                <div key={sess.id} className="py-2.5">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="min-w-0 truncate font-mono text-xs font-bold text-[#004A98]">{sess.courseCode}</span>
                                        <span className="shrink-0 text-xs font-medium text-slate-500">{sess.type} · {sess.classCode || '-'}</span>
                                    </div>
                                    <p className="mt-0.5 truncate text-sm font-medium text-gray-900">{sess.courseName}</p>
                                    <p className="mt-1 truncate text-xs text-slate-500">{sess.startTime} - {sess.endTime} · {sess.room || 'Chưa có phòng'}</p>
                                </div>
                            ))}
                        </div>
                    </HoverCardContent>
                )}
            </HoverCard>

            <AppDialog
                open={showInfo}
                onOpenChange={setShowInfo}
                title="Chi tiết lịch học"
                description={sessionArray.length === 1 ? `${primarySession.courseCode} · ${primarySession.courseName}` : conflictLabel}
                icon={CalendarDays}
                size="md"
                contentClassName="space-y-0"
            >
                {sessionArray.map((sess, idx) => (
                    <section key={sess.id} className={idx > 0 ? 'border-t border-gray-200 pt-5 mt-5' : ''}>
                        {sessionArray.length > 1 && (
                            <div className="mb-4">
                                <p className="font-mono text-sm font-bold text-[#004A98]">{sess.courseCode}</p>
                                <p className="mt-0.5 text-sm text-gray-700">{sess.courseName}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-x-5 gap-y-3 text-sm">
                            <span className="text-gray-500">Loại học phần</span>
                            <span className="text-right font-semibold text-gray-900">{typeFullLabels[sess.type]}</span>
                            <span className="text-gray-500">Phòng học</span>
                            <span className="text-right font-semibold text-gray-900">{sess.room || '-'}</span>
                            <span className="text-gray-500">Thời gian</span>
                            <span className="text-right font-semibold text-gray-900">{sess.startTime} - {sess.endTime}</span>
                            <span className="text-gray-500">Tiết học</span>
                            <span className="text-right font-semibold text-gray-900">{sess.startPeriod} - {Math.floor(sess.endPeriod)}</span>
                            {sess.totalWeeks > 0 && (
                                <>
                                    <span className="text-gray-500">Thời gian áp dụng</span>
                                    <span className="text-right font-semibold text-gray-900">{sess.startDate} - {sess.endDate}</span>
                                    <span className="text-gray-500">Số tuần học</span>
                                    <span className="text-right font-semibold text-gray-900">{sess.totalWeeks} tuần</span>
                                </>
                            )}
                        </div>

                        <div className="mt-4 border-t border-gray-200 pt-3 text-sm leading-6 text-gray-600">
                            <p>Giảng viên: <span className="font-medium text-gray-900">{sess.instructor || 'Chưa có dữ liệu'}</span></p>
                            <p>Lớp: <span className="font-medium text-gray-900">{sess.classCode || '-'}</span> · <span className="font-medium text-gray-900">{sess.credits} TC</span></p>
                        </div>

                        {sess.note && (
                            <div className="mt-4 flex gap-2 border-l-2 border-amber-400 bg-amber-50 px-3 py-2.5 text-sm leading-5 text-amber-900">
                                <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                                <p>{sess.note}</p>
                            </div>
                        )}
                    </section>
                ))}

                <div className="mt-5 grid gap-2 border-t border-gray-200 pt-4 sm:grid-cols-2">
                    {onOpenClassDetails && sessionArray.length === 1 && (
                        <button
                            type="button"
                            className="ustudy-button-secondary justify-center"
                            onClick={() => {
                                onOpenClassDetails({ courseCode: primarySession.courseCode, courseName: primarySession.courseName, classId: primarySession.classCode });
                                setShowInfo(false);
                            }}
                        >
                            Xem chi tiết lớp mở
                        </button>
                    )}
                    <button
                        type="button"
                        className="ustudy-button-primary justify-center"
                        onClick={() => {
                            setShowInfo(false);
                            setIsEditOpen(true);
                        }}
                    >
                        <Pencil className="h-4 w-4" />
                        Chỉnh sửa môn học
                    </button>
                </div>
            </AppDialog>

            <EditSessionDialog
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                session={primarySession}
                weekNumber={weekNumber}
                overrides={overrides}
                onSave={onSave}
            />
        </>
    );
}

export { EditSessionDialog, CourseCard };
