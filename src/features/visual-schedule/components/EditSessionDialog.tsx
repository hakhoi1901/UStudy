// EditSessionDialog.tsx
import { useEffect, useState } from 'react';
import { CalendarDays, CalendarOff, MessageSquare, Palette, Pencil, RotateCcw } from 'lucide-react';
import { Input } from '../../../components/ui/form/input';
import { Label } from '../../../components/ui/form/label';
import { AppSelect } from '../../../components/ui/form';
import { AppDialog } from '../../../components/ui/overlays/app-dialog';
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

        if (scope === 'semester') {
            persist({ ...overrides, sessionOverrides: {
                ...overrides.sessionOverrides,
                [session.id]: { ...globalOverride, ...update, startWeek: parsedStartWeek, endWeek: parsedEndWeek },
            } });
            return;
        }
        persist({ ...overrides, weekOverrides: {
            ...overrides.weekOverrides,
            [weekOverrideKey]: { ...weekOverride, ...update },
        } });
    };

    const handleToggleWeekVisibility = () => {
        const hiddenWeeks = (globalOverride?.hiddenWeeks || []).includes(weekNumber)
            ? (globalOverride?.hiddenWeeks || []).filter((week) => week !== weekNumber)
            : Array.from(new Set([...(globalOverride?.hiddenWeeks || []), weekNumber])).sort((a, b) => a - b);
        persist({ ...overrides, sessionOverrides: {
            ...overrides.sessionOverrides,
            [session.id]: { ...globalOverride, hiddenWeeks: hiddenWeeks.length ? hiddenWeeks : undefined },
        } });
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

    const isWeekHidden = globalOverride?.hiddenWeeks?.includes(weekNumber) ?? false;
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
            size="md"
            contentClassName="space-y-4"
        >
            <div className="divide-y divide-gray-200">
                <div className="grid gap-3 py-1 sm:grid-cols-[112px_minmax(0,1fr)] sm:items-center">
                    <span className="text-sm font-semibold text-gray-700">Áp dụng</span>
                    <div className="grid grid-cols-2 rounded-lg bg-gray-100 p-1">
                        {(['semester', 'week'] as const).map((value) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => { setScope(value); resetForm(value); }}
                                className={`h-9 rounded-md text-sm font-semibold transition ${scope === value ? 'bg-white text-[#004A98] shadow-sm' : 'text-gray-600'}`}
                            >
                                {value === 'semester' ? 'Cả học kỳ' : `Tuần ${weekNumber}`}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid gap-3 py-4 sm:grid-cols-[112px_minmax(0,1fr)]">
                    <span className="pt-2 text-sm font-semibold text-gray-700">Lịch học</span>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <AppSelect value={dayOfWeek} onChange={setDayOfWeek} options={[...DAYS.map((day) => ({ id: day.value, name: day.label })), { id: '8', name: 'Chủ Nhật' }]} ariaLabel="Chọn thứ học" triggerClassName="h-10 px-3 py-0 text-sm" />
                        <Input aria-label="Phòng học" value={room} onChange={(event) => setRoom(event.target.value)} placeholder="Phòng học" className="h-10" />
                        <Input aria-label="Tiết bắt đầu" type="number" min="1" max="10.5" step="0.5" value={startPeriod} onChange={(event) => setStartPeriod(event.target.value)} placeholder="Từ tiết" className="h-10" />
                        <Input aria-label="Tiết kết thúc" type="number" min="1" max="10.5" step="0.5" value={endPeriod} onChange={(event) => setEndPeriod(event.target.value)} placeholder="Đến tiết" className="h-10" />
                    </div>
                </div>

                {scope === 'semester' && (
                    <div className="grid gap-3 py-4 sm:grid-cols-[112px_minmax(0,1fr)] sm:items-center">
                        <span className="text-sm font-semibold text-gray-700">Khoảng tuần</span>
                        <div className="grid grid-cols-2 gap-3">
                            <Input aria-label="Bắt đầu từ tuần" type="number" min="1" step="1" placeholder="Từ tuần" value={startWeek} onChange={(event) => setStartWeek(event.target.value)} className="h-10" />
                            <Input aria-label="Kết thúc ở tuần" type="number" min="1" step="1" placeholder="Đến tuần" value={endWeek} onChange={(event) => setEndWeek(event.target.value)} className="h-10" />
                        </div>
                    </div>
                )}

                <div className="grid gap-3 py-4 sm:grid-cols-[112px_minmax(0,1fr)]">
                    <span className="pt-2 text-sm font-semibold text-gray-700">Màu và ghi chú</span>
                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                            {basicColorOptions.map((option) => (
                                <button
                                    key={option.id}
                                    type="button"
                                    title={option.name}
                                    aria-label={`Chọn ${option.name}`}
                                    onClick={() => setColor(option.id)}
                                    className={`flex h-10 w-10 items-center justify-center rounded-lg border transition ${color === option.id ? 'border-[#004A98] bg-blue-50 ring-2 ring-[#004A98]/15' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                                >
                                    <span className="h-5 w-5 rounded-md" style={{ backgroundColor: option.hex }} />
                                </button>
                            ))}
                            <label title="Màu tùy chỉnh" className={`relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border transition ${color.startsWith('#') ? 'border-[#004A98] bg-blue-50 ring-2 ring-[#004A98]/15' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                <Palette className="h-4 w-4 text-gray-600" />
                                <input
                                    type="color"
                                    value={color.startsWith('#') ? color : '#004A98'}
                                    onChange={(event) => setColor(event.target.value)}
                                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                    aria-label="Chọn màu tùy chỉnh"
                                />
                            </label>
                        </div>
                        <div className="relative">
                            <MessageSquare className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input aria-label="Ghi chú" placeholder="Thêm ghi chú" value={note} onChange={(event) => setNote(event.target.value)} className="h-10 pl-9" />
                        </div>
                    </div>
                </div>

                <div className="grid gap-3 py-4 sm:grid-cols-[112px_minmax(0,1fr)] sm:items-center">
                    <span className="text-sm font-semibold text-gray-700">Tác vụ</span>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                        <button type="button" onClick={handleToggleWeekVisibility} className="inline-flex items-center gap-1.5 font-semibold text-gray-600 transition-colors hover:text-[#004A98]">
                            <CalendarOff className="h-4 w-4" />
                            {isWeekHidden ? `Hiện lại tuần ${weekNumber}` : `Bỏ tuần ${weekNumber}`}
                        </button>
                        {scope === 'semester' && <button type="button" onClick={handleEndFromWeek} className="font-semibold text-amber-700 transition-colors hover:text-amber-900">Ngừng từ tuần {weekNumber}</button>}
                        {hasChanges && <button type="button" onClick={handleRestore} className="inline-flex items-center gap-1.5 font-semibold text-gray-500 transition-colors hover:text-[#004A98]"><RotateCcw className="h-3.5 w-3.5" />Khôi phục</button>}
                    </div>
                </div>
            </div>

            {error && <p role="alert" className="border-l-2 border-red-500 bg-red-50 px-3 py-2.5 text-xs leading-5 text-red-700">{error}</p>}
            <div className="grid gap-2 border-t border-gray-200 pt-4 sm:grid-cols-2">
                <button type="button" onClick={() => onOpenChange(false)} className="ustudy-button-outline justify-center">Hủy</button>
                <button type="button" onClick={handleSave} className="ustudy-button-primary justify-center">Lưu thay đổi</button>
            </div>
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

            </div>

            <AppDialog
                open={showInfo}
                onOpenChange={setShowInfo}
                title="Chi tiết lịch học"
                description={sessionArray.length === 1 ? `${primarySession.courseCode} · ${primarySession.courseName}` : `${sessionArray.length} môn học trùng lịch`}
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
