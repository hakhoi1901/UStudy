import { useState, useEffect, useMemo } from 'react';
import { STORAGE_KEYS } from '../../config';
import { readFromStorage, saveToStorage } from '../../helpers/localStorage/save';
import { Calendar, AlertTriangle, Cpu, ChevronLeft, ChevronRight, Settings, Sun, Moon, Zap, X, Save, List, Trash2, Clock, Check, BookOpen, Hash, BarChart2, Layers } from 'lucide-react';
import { type ClassSection, type SavedSchedule } from '../../types';
import { type SolverPreferences, type ScheduleOption } from '../../hooks/useScheduleSolver';
import { weekDays, timePeriods } from '../../constants';
import type { Course } from '../../types';
import { Note } from './note.tsx'
import { cycleDayOffSession, formatDayOffSession, getDayOffSession } from '../../utils/dayOffPreferences';

function getSolidTint(hexColor: string, tint = 0.9) {
    const normalized = hexColor.replace('#', '');
    if (!/^[0-9A-Fa-f]{6}$/.test(normalized)) return '#F8FAFC';

    const red = parseInt(normalized.slice(0, 2), 16);
    const green = parseInt(normalized.slice(2, 4), 16);
    const blue = parseInt(normalized.slice(4, 6), 16);
    const mix = (channel: number) => Math.round(channel + (255 - channel) * tint);

    return `rgb(${mix(red)}, ${mix(green)}, ${mix(blue)})`;
}

interface CalendarViewProps {
    selectedCourses: Set<string>;
    setActiveTab: (tab: 'trainingProgram' | 'selection' | 'calendar') => void;
    currentSections: ClassSection[];
    activeOption: number;
    options: any[];
    allCurrentCourses: Course[];
    solve: (courses: Course[], allowedClassesMap: Record<string, string[]>, prefs?: SolverPreferences) => void;
    solving: boolean;
    solverError: string | null;
    setActiveOption: (option: number) => void;
    getConflicts: (section: ClassSection) => ClassSection[];
    allowedClassesMap: Record<string, string[]>;
    setSelectedCourses: (courses: Set<string>) => void;
    setAllowedClassesMap: (map: Record<string, string[]>) => void;
    setOptions: (options: ScheduleOption[]) => void;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
    icon: Icon,
    label,
    value,
    sub,
    accent,
}: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    sub?: string;
    accent?: string; // tailwind bg class
}) {
    return (
        <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm flex-1 min-w-0">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${accent ?? 'bg-blue-50'}`}>
                <Icon className={`h-4 w-4 ${accent ? 'text-white' : 'text-[#004A98]'}`} />
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide truncate">{label}</p>
                <p className="text-lg font-bold text-gray-900 leading-none mt-0.5">{value}</p>
                {sub && <p className="text-[10px] text-gray-400 mt-0.5 truncate">{sub}</p>}
            </div>
        </div>
    );
}

// ─── Per-day load bar ─────────────────────────────────────────────────────────
function DayLoadBar({ day, count, max }: { day: string; count: number; max: number }) {
    const pct = max > 0 ? (count / max) * 100 : 0;
    const color =
        pct === 100
            ? 'bg-red-400'
            : pct >= 60
            ? 'bg-amber-400'
            : 'bg-emerald-400';
    return (
        <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-bold text-gray-700">{count}</span>
            <div className="h-10 w-5 bg-gray-100 rounded-full overflow-hidden flex flex-col justify-end">
                <div
                    className={`w-full rounded-full transition-all ${color}`}
                    style={{ height: `${pct}%` }}
                />
            </div>
            <span className="text-[9px] text-gray-400">{day}</span>
        </div>
    );
}

export function CalendarView({
    selectedCourses,
    setActiveTab,
    currentSections,
    activeOption,
    options,
    allCurrentCourses,
    solve,
    solving,
    solverError,
    setActiveOption,
    getConflicts,
    allowedClassesMap,
    setSelectedCourses,
    setAllowedClassesMap,
    setOptions,
}: CalendarViewProps) {
    const [prefs, setPrefs] = useState<SolverPreferences>(() => {
        return readFromStorage<SolverPreferences>(STORAGE_KEYS.SOLVER_PREFERENCES, {
            daysOff: [],
            session: '0',
            strategy: 'compress',
            noGaps: false
        });
    });

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.SOLVER_PREFERENCES, prefs);
    }, [prefs]);

    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [savedSchedules, setSavedSchedules] = useState<SavedSchedule[]>(() => {
        return readFromStorage<SavedSchedule[]>(STORAGE_KEYS.SAVED_SCHEDULES, []);
    });
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showListModal, setShowListModal] = useState(false);
    const [showStatsPanel, setShowStatsPanel] = useState(false);
    const [newScheduleName, setNewScheduleName] = useState('');
    const [loadedGroupSchedule, setLoadedGroupSchedule] = useState<SavedSchedule['groupSchedule'] | null>(null);
    const [activeLoadedGroupMemberIndex, setActiveLoadedGroupMemberIndex] = useState<number | null>(null);

    // ── Computed stats ─────────────────────────────────────────────────────────
    const stats = useMemo(() => {
        if (currentSections.length === 0) return null;

        const totalPeriods = currentSections.reduce(
            (sum, s) => sum + Math.round(s.endPeriod - s.startPeriod + 1),
            0
        );

        // Tiết mỗi ngày (day 2–8)
        const periodsPerDay: Record<number, number> = {};
        for (const s of currentSections) {
            periodsPerDay[s.day] = (periodsPerDay[s.day] ?? 0) + Math.round(s.endPeriod - s.startPeriod + 1);
        }

        const dayValues = Object.values(periodsPerDay);
        const maxPerDay = Math.max(...dayValues, 0);
        const scheduledDays = Object.keys(periodsPerDay).length;

        // Total credits: sum unique courses' credits
        const scheduledCourseIds = new Set(currentSections.map(s => s.courseCode));
        const totalCredits = allCurrentCourses
            .filter(c => scheduledCourseIds.has(c.id) || selectedCourses.has(c.id))
            .reduce((sum, c) => sum + (c.credits ?? 0), 0);

        // Conflict count
        const conflictCount = currentSections.filter(s => getConflicts(s).length > 0).length;

        return {
            totalPeriods,
            periodsPerDay,
            maxPerDay,
            scheduledDays,
            totalCredits,
            conflictCount,
            freeDays: 7 - scheduledDays, // Mon–Sat = 6 days
        };
    }, [currentSections, allCurrentCourses, selectedCourses, getConflicts]);

    // ── Save / load handlers ───────────────────────────────────────────────────
    const handleSaveSchedule = () => {
        if (!newScheduleName.trim()) return;
        const newSaved: SavedSchedule = {
            id: crypto.randomUUID(),
            name: newScheduleName.trim(),
            createdAt: new Date().toISOString(),
            sessions: currentSections,
            selectedCourses: Array.from(selectedCourses),
            allowedClassesMap,
        };
        const updated = [newSaved, ...savedSchedules];
        setSavedSchedules(updated);
        saveToStorage(STORAGE_KEYS.SAVED_SCHEDULES, updated);
        setShowSaveModal(false);
        setNewScheduleName('');
    };

    const handleLoadSchedule = (saved: SavedSchedule) => {
        const firstGroupMember = saved.groupSchedule?.members[0];
        const selectedMember = firstGroupMember ?? null;
        setLoadedGroupSchedule(saved.groupSchedule ?? null);
        setActiveLoadedGroupMemberIndex(selectedMember?.memberIndex ?? null);
        setSelectedCourses(new Set(selectedMember?.selectedCourses ?? saved.selectedCourses));
        setAllowedClassesMap(selectedMember?.allowedClassesMap ?? saved.allowedClassesMap);
        const restoredOption: ScheduleOption = { option: saved.groupSchedule?.option ?? 1, fitness: 1000, classSections: selectedMember?.sessions ?? saved.sessions };
        setOptions([restoredOption]);
        setActiveOption(0);
        setShowListModal(false);
    };

    const handleSelectLoadedGroupMember = (memberIndex: number) => {
        const member = loadedGroupSchedule?.members.find((item) => item.memberIndex === memberIndex);
        if (!member || !loadedGroupSchedule) return;

        setActiveLoadedGroupMemberIndex(member.memberIndex);
        setSelectedCourses(new Set(member.selectedCourses));
        setAllowedClassesMap(member.allowedClassesMap);
        setOptions([{ option: loadedGroupSchedule.option, fitness: 1000, classSections: member.sessions }]);
        setActiveOption(0);
    };

    const handleDeleteSchedule = (id: string) => {
        const updated = savedSchedules.filter(s => s.id !== id);
        setSavedSchedules(updated);
        saveToStorage(STORAGE_KEYS.SAVED_SCHEDULES, updated);
    };

    const coursesToSchedule = Array.from(selectedCourses)
        .map(id => allCurrentCourses.find(c => c.id === id))
        .filter((c): c is NonNullable<typeof c> => !!c);

    // ── Empty state ────────────────────────────────────────────────────────────
    if (selectedCourses.size === 0 && savedSchedules.length === 0) {
        return (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 md:p-12 text-center">
                <Calendar className="w-12 h-12 md:w-16 md:h-16 text-blue-400 mx-auto mb-3 md:mb-4" />
                <h3 className="text-base md:text-lg text-gray-900 mb-2">Chưa chọn môn học nào</h3>
                <p className="text-sm text-gray-600 mb-4">
                    Vui lòng chuyển sang tab "Chọn môn" để chọn các môn học bạn muốn đăng ký.
                </p>
                <div className="flex flex-col gap-3 items-center">
                    <button
                        onClick={() => setActiveTab('selection')}
                        className="px-6 py-2 bg-[#004A98] text-white rounded-lg hover:bg-[#003A78] transition-colors w-full sm:w-auto text-sm"
                    >
                        Đi đến Chọn môn
                    </button>
                    {savedSchedules.length > 0 && (
                        <button
                            onClick={() => setShowListModal(true)}
                            className="flex items-center justify-center gap-2 px-6 py-2 bg-white text-[#004A98] border border-[#004A98] rounded-lg hover:bg-blue-50 transition-colors w-full sm:w-auto text-sm"
                        >
                            <List className="w-4 h-4" />
                            Xem lịch đã lưu ({savedSchedules.length})
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // ── Main render ────────────────────────────────────────────────────────────
    return (
        <div className="space-y-4">

            {/* ═══ Toolbar ═══════════════════════════════════════════════════ */}
            <div className="p-3 md:p-4 bg-gradient-to-r from-[#004A98]/5 to-blue-50 border border-blue-100 rounded-xl">
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-sm text-blue-900 font-semibold truncate">
                            {currentSections.length > 0
                                ? `Phương án ${activeOption + 1}/${options.length} — ${selectedCourses.size} môn`
                                : `${selectedCourses.size} môn đã chọn`}
                        </p>
                        <p className="hidden md:block text-xs text-blue-600 mt-0.5">
                            Thuật toán di truyền tự động chọn lớp tốt nhất, tránh trùng lịch.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsConfigOpen(true)}
                        className="flex items-center gap-1.5 px-3 md:px-4 py-2 bg-white text-[#004A98] rounded-lg hover:bg-blue-50 transition-colors shrink-0 text-xs md:text-sm border border-[#004A98]/20 shadow-sm"
                        title="Cấu hình ưu tiên"
                    >
                        <Settings className="w-3.5 h-3.5" />
                        <span className="hidden md:inline font-medium">Cấu hình</span>
                    </button>

                    <button
                        onClick={() => setShowListModal(true)}
                        className="flex items-center gap-1.5 px-3 md:px-4 py-2 bg-white text-[#004A98] border border-[#004A98]/30 rounded-lg hover:bg-blue-50 transition-colors shrink-0 text-xs md:text-sm shadow-sm"
                    >
                        <List className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">Lịch đã lưu</span>
                        {savedSchedules.length > 0 && (
                            <span className="px-1.5 py-0.5 bg-[#004A98] text-white text-[10px] rounded-full font-bold">
                                {savedSchedules.length}
                            </span>
                        )}
                    </button>

                    {stats && (
                        <button
                            onClick={() => setShowStatsPanel(prev => !prev)}
                            className={`flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-lg border transition-all shrink-0 text-xs md:text-sm shadow-sm ${
                                showStatsPanel
                                    ? 'bg-[#004A98] text-white border-[#004A98]'
                                    : 'bg-white text-[#004A98] border-[#004A98]/30 hover:bg-blue-50'
                            }`}
                        >
                            <BarChart2 className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">{showStatsPanel ? 'Ẩn thống kê' : 'Thống kê'}</span>
                        </button>
                    )}

                    <button
                        onClick={() => solve(coursesToSchedule, allowedClassesMap, prefs)}
                        disabled={solving}
                        className="flex items-center gap-1.5 px-4 md:px-5 py-2 bg-[#004A98] text-white rounded-lg hover:bg-[#003A78] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed shrink-0 text-xs md:text-sm font-semibold shadow-md"
                    >
                        <Cpu className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{solving ? 'Đang xếp...' : 'Xếp lịch'}</span>
                        <span className="sm:hidden">{solving ? '...' : 'Xếp'}</span>
                    </button>
                </div>
            </div>

            {/* ═══ Solver error ══════════════════════════════════════════════ */}
            {solverError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs md:text-sm text-red-700">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{solverError}</span>
                </div>
            )}

            {/* ═══ Stats panel (chỉ hiện khi có lịch) ══════════════════════ */}
            {stats && showStatsPanel && (
                <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                        <BarChart2 className="w-3.5 h-3.5 text-[#004A98]" />
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Thống kê phương án</span>
                        {stats.conflictCount > 0 && (
                            <span className="ml-auto flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
                                <AlertTriangle className="w-3 h-3" />
                                {stats.conflictCount} lớp trùng lịch
                            </span>
                        )}
                        {stats.conflictCount === 0 && currentSections.length > 0 && (
                            <span className="ml-auto flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                                <Check className="w-3 h-3" />
                                Không trùng lịch
                            </span>
                        )}
                    </div>

                    {/* Stat cards */}
                    <div className="p-3 grid grid-cols-2 md:grid-cols-4 gap-2.5">
                        <StatCard
                            icon={BookOpen}
                            label="Số môn"
                            value={selectedCourses.size}
                            sub={`${currentSections.length} lớp học`}
                        />
                        <StatCard
                            icon={Hash}
                            label="Tổng tiết / tuần"
                            value={stats.totalPeriods}
                            sub={`≈ ${(stats.totalPeriods * 45 / 60).toFixed(1)} giờ`}
                        />
                        <StatCard
                            icon={Layers}
                            label="Số tín chỉ"
                            value={stats.totalCredits || '—'}
                            sub={stats.totalCredits ? 'tín chỉ đăng ký' : 'Chưa có dữ liệu'}
                        />
                        <StatCard
                            icon={Calendar}
                            label="Ngày học / tuần"
                            value={`${stats.scheduledDays} ngày`}
                            sub={stats.freeDays > 0 ? `Nghỉ ${stats.freeDays} ngày` : 'Học cả tuần'}
                            accent={stats.freeDays >= 2 ? 'bg-emerald-500' : stats.freeDays === 1 ? 'bg-amber-400' : 'bg-red-400'}
                        />
                    </div>

                    {/* Per-day load bars */}
                    <div className="px-4 pb-3">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Phân bổ tiết theo ngày</p>
                        <div className="flex items-end gap-3">
                            {weekDays.map(day => (
                                <DayLoadBar
                                    key={day.day}
                                    day={day.short}
                                    count={stats.periodsPerDay[day.day] ?? 0}
                                    max={stats.maxPerDay}
                                />
                            ))}
                            <div className="ml-auto flex flex-col gap-1.5 text-[10px] text-gray-400">
                                <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-400" />Nhẹ</span>
                                <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-amber-400" />Vừa</span>
                                <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-red-400" />Nặng</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Option navigator ══════════════════════════════════════════ */}
            {options.length > 1 && (
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-2 bg-white p-1.5 border border-slate-200 rounded-xl shadow-sm flex-1 min-w-0 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                        <span className="text-xs text-gray-500 font-medium px-1 shrink-0">Phương án:</span>
                        <button
                            onClick={() => setActiveOption(Math.max(0, activeOption - 1))}
                            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors shrink-0"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="flex gap-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                            {options.map((opt, idx) => (
                                <button
                                    key={opt.option}
                                    onClick={() => setActiveOption(idx)}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] md:text-xs font-bold transition-all shrink-0 ${activeOption === idx
                                        ? 'bg-[#004A98] text-white shadow-md'
                                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                                    }`}
                                >
                                    PA {opt.option}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setActiveOption(Math.min(options.length - 1, activeOption + 1))}
                            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors shrink-0"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <button
                        onClick={() => setShowSaveModal(true)}
                        disabled={currentSections.length === 0}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50 shrink-0 text-xs md:text-sm font-semibold shadow-sm"
                    >
                        <Save className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Lưu phương án</span>
                        <span className="sm:hidden">Lưu</span>
                    </button>
                </div>
            )}

            {loadedGroupSchedule && loadedGroupSchedule.members.length > 1 && (
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-2 bg-white p-1.5 border border-slate-200 rounded-xl shadow-sm flex-1 min-w-0 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                        <span className="text-xs text-gray-500 font-medium px-1 shrink-0">Thành viên:</span>
                        <div className="flex gap-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                            {loadedGroupSchedule.members.map((member) => (
                                <button
                                    key={member.memberIndex}
                                    onClick={() => handleSelectLoadedGroupMember(member.memberIndex)}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] md:text-xs font-bold transition-all shrink-0 ${activeLoadedGroupMemberIndex === member.memberIndex
                                        ? 'bg-emerald-600 text-white shadow-md'
                                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                                    }`}
                                >
                                    {member.nickname}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Timetable grid ════════════════════════════════════════════ */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                {/* Grid header */}
                <div className="flex flex-col gap-2 border-b border-gray-200 bg-slate-50 px-3 py-3 md:flex-row md:items-center md:justify-between md:px-4">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#004A98] text-white shadow-sm">
                            <Calendar className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-gray-900">Thời khóa biểu dự kiến</h3>
                            <p className="truncate text-xs text-gray-500">
                                {currentSections.length > 0
                                    ? `${currentSections.length} lớp · ${stats?.totalPeriods ?? 0} tiết · ${stats?.scheduledDays ?? 0} ngày học`
                                    : 'Bấm Xếp lịch để xem phương án phù hợp'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                        <span className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1">
                            <Clock className="h-3 w-3 text-[#004A98]" />
                            Sáng 1–5
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1">
                            <Clock className="h-3 w-3 text-orange-500" />
                            Chiều 6–10
                        </span>
                    </div>
                </div>

                <div className="overflow-auto">
                    <div className="min-w-[620px] md:min-w-[1000px]">
                        {/* Column headers */}
                        <div className="grid sticky top-0 z-20 bg-[#004A98]" style={{ gridTemplateColumns: '64px repeat(6, 1fr)' }}>
                            <div className="sticky left-0 z-30 bg-[#004A98] h-11 md:h-12 flex items-center justify-center border-r border-white/20">
                                <span className="text-[10px] md:text-xs text-white font-semibold">Tiết</span>
                            </div>
                            {weekDays.map((day) => (
                                <div
                                    key={day.day}
                                    className="bg-[#004A98] text-white flex flex-col items-center justify-center border-l border-white/15 h-11 md:h-12 px-1"
                                >
                                    <span className="hidden md:block text-[10px] text-white/70 font-normal leading-none">{day.nameVi}</span>
                                    <span className="text-[11px] md:text-[13px] font-semibold leading-tight">{day.short}</span>
                                    {/* Tiết-per-day badge */}
                                    {stats && (stats.periodsPerDay[day.day] ?? 0) > 0 && (
                                        <span className="hidden md:inline-flex mt-0.5 text-[9px] font-bold bg-white/20 rounded-full px-1.5 leading-4">
                                            {Math.round(stats.periodsPerDay[day.day])} tiết
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Grid body — layer 1: lưới, layer 2: thẻ môn */}
                        <div style={{ position: 'relative', isolation: 'isolate' }}>
                          {/* ── Layer 1: lưới nền (z=1) ── */}
                          <div style={{ position: 'relative', zIndex: 1 }}>
                            {timePeriods.map((period) => {
                                const isFirstAfternoon = period.period === 6;
                                return (
                                    <div key={period.period}>
                                        {isFirstAfternoon && (
                                            <div
                                                className="grid items-stretch border-y border-orange-200 bg-orange-50"
                                                style={{ gridTemplateColumns: '64px 1fr', height: '34px' }}
                                            >
                                                <div className="sticky left-0 flex items-center justify-center border-r border-orange-200 bg-orange-50" style={{ zIndex: 4 }}>
                                                    <span className="text-[9px] md:text-[11px] font-semibold uppercase tracking-wide text-orange-700">Trưa</span>
                                                </div>
                                                <div className="flex items-center justify-center bg-orange-50 px-3">
                                                    <span className="text-[10px] md:text-xs font-semibold text-orange-700">
                                                        Nghỉ trưa 11:50 - 12:40
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        <div
                                            className={`grid ${period.period <= 5 ? 'bg-sky-50/20' : ''}`}
                                            style={{ gridTemplateColumns: '64px repeat(6, 1fr)', height: '56px' }}
                                        >
                                        <div className="sticky left-0 flex flex-col items-center justify-center border-b border-r border-gray-200 bg-gray-50 px-1 text-center" style={{ zIndex: 4 }}>
                                                <div className="text-[11px] md:text-[13px] font-semibold text-gray-700">
                                                    {period.period}
                                                </div>
                                                <span className="text-[8px] md:text-[10px] text-gray-500 leading-tight">
                                                    {period.time.split(' - ')[0]}
                                                </span>
                                                <span className="text-[8px] md:text-[10px] text-gray-400 leading-none">–</span>
                                                <span className="text-[8px] md:text-[10px] text-gray-500 leading-tight">
                                                    {period.time.split(' - ')[1]}
                                                </span>
                                            </div>
                                            {weekDays.map((day) => (
                                                <div
                                                    key={`${day.day}-${period.period}`}
                                                    className="border-b border-l border-gray-200 bg-white transition-colors hover:bg-slate-50/80"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                          </div>{/* end layer 1 */}

                          {/* ── Layer 2: thẻ môn học, phủ lên lưới (z=2) ── */}
                          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2, pointerEvents: 'none' }}>
                            {currentSections.map((classSection: ClassSection) => {
                                const conflicts = getConflicts(classSection);
                                const hasConflict = conflicts.length > 0;

                                const rowH = 56;
                                const lunchBreakOffset = classSection.startPeriod >= 6 ? 34 : 0;
                                const topPx = (classSection.startPeriod - 1) * rowH + lunchBreakOffset;
                                const heightPeriods = classSection.endPeriod - classSection.startPeriod + 1;
                                const spansLunch = classSection.startPeriod < 6 && classSection.endPeriod >= 6;
                                const heightPx = heightPeriods * rowH + (spansLunch ? 34 : 0);
                                const dayColIndex = classSection.day - 2;

                                // Color tokens
                                const baseColor = hasConflict ? '#EF4444' : classSection.color;
                                const bgColor   = hasConflict ? '#FFF1F2' : getSolidTint(classSection.color);
                                const textColor    = hasConflict ? '#991B1B' : '#111827';
                                const subTextColor = hasConflict ? '#B91C1C' : '#6B7280';
                                const pillBg    = hasConflict ? '#FEE2E2' : getSolidTint(classSection.color, 0.82);
                                const pillText  = hasConflict ? '#991B1B' : '#374151';

                                const startTime = timePeriods.find(p => p.period === classSection.startPeriod)?.time.split(' - ')[0] ?? '';
                                const endTime   = timePeriods.find(p => p.period === classSection.endPeriod)?.time.split(' - ')[1] ?? '';

                                // Responsive thresholds
                                const isCompact  = heightPx < 80;   // 1 tiết
                                const isMedium   = heightPx >= 80 && heightPx < 150;  // 2 tiết
                                const isTall     = heightPx >= 150; // 3+ tiết

                                return (
                                    <div
                                        key={classSection.id}
                                        style={{
                                            position: 'absolute',
                                            top: topPx + 2,
                                            left: `calc(64px + ${dayColIndex} * ((100% - 64px) / 6) + 3px)`,
                                            width: `calc((100% - 64px) / 6 - 6px)`,
                                            height: heightPx - 4,
                                            backgroundColor: bgColor,
                                            borderRadius: '8px',
                                            borderLeft: `3.5px solid ${baseColor}`,
                                            border: `1px solid ${hasConflict ? '#FECACA' : getSolidTint(classSection.color, 0.65)}`,
                                            borderLeftWidth: '3.5px',
                                            borderLeftColor: baseColor,
                                            overflow: 'hidden',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            padding: isCompact ? '3px 6px' : '5px 7px',
                                            gap: 0,
                                            boxSizing: 'border-box',
                                            boxShadow: hasConflict
                                                ? '0 2px 8px rgba(239,68,68,0.15)'
                                                : '0 1px 4px rgba(15,23,42,0.08)',
                                            cursor: 'default',
                                            zIndex: 2,
                                            pointerEvents: 'auto',
                                        }}
                                    >
                                        {/* Conflict badge — only when tall enough */}
                                        {hasConflict && !isCompact && (
                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: 3,
                                                background: '#FEE2E2', borderRadius: 4,
                                                padding: '1px 5px', marginBottom: 3, width: 'fit-content',
                                            }}>
                                                <AlertTriangle style={{ width: 9, height: 9, color: '#DC2626', flexShrink: 0 }} />
                                                <span style={{ fontSize: 8, fontWeight: 700, color: '#B91C1C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Trùng lịch</span>
                                            </div>
                                        )}

                                        {/* Course code — always shown */}
                                        <p style={{
                                            fontFamily: 'ui-monospace, monospace',
                                            fontSize: isCompact ? 9 : 11,
                                            fontWeight: 700,
                                            color: textColor,
                                            lineHeight: 1.2,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            flexShrink: 0,
                                            marginBottom: isCompact ? 0 : 2,
                                        }}>
                                            {classSection.courseCode}
                                            {/* On compact, also show group inline */}
                                            {isCompact && (
                                                <span style={{ fontFamily: 'inherit', fontWeight: 500, color: subTextColor, fontSize: 8, marginLeft: 4 }}>
                                                    · Lớp {classSection.sectionNumber}
                                                </span>
                                            )}
                                        </p>

                                        {/* Course name — medium + tall */}
                                        {!isCompact && (
                                            <p style={{
                                                fontSize: 9,
                                                fontWeight: 600,
                                                color: subTextColor,
                                                lineHeight: 1.3,
                                                overflow: 'hidden',
                                                display: '-webkit-box',
                                                WebkitLineClamp: isMedium ? 2 : 3,
                                                WebkitBoxOrient: 'vertical',
                                                flexShrink: 1,
                                                minHeight: 0,
                                                marginBottom: 'auto',
                                            } as React.CSSProperties}>
                                                {classSection.courseNameVi}
                                            </p>
                                        )}

                                        {/* Spacer for tall cards */}
                                        {isTall && <div style={{ flex: 1 }} />}

                                        {/* Footer: group + room + time — medium + tall */}
                                        {!isCompact && (
                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 2,
                                                flexShrink: 0,
                                                marginTop: isMedium ? 'auto' : 4,
                                                paddingTop: 3,
                                                borderTop: `1px solid ${hasConflict ? '#FECACA' : getSolidTint(classSection.color, 0.72)}`,
                                            }}>
                                                {/* Group + Room row */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
                                                    <span style={{
                                                        flexShrink: 0,
                                                        background: pillBg,
                                                        color: pillText,
                                                        fontSize: 8,
                                                        fontWeight: 700,
                                                        borderRadius: 4,
                                                        padding: '1px 5px',
                                                        lineHeight: 1.5,
                                                        whiteSpace: 'nowrap',
                                                    }}>
                                                        Lớp {classSection.sectionNumber}
                                                    </span>
                                                    {classSection.room && classSection.room !== '---' && (
                                                        <span style={{
                                                            fontSize: 8,
                                                            fontWeight: 600,
                                                            color: subTextColor,
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                        }}>
                                                            {classSection.room}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Time row — only when tall enough or time is short */}
                                                {startTime && (isTall || isMedium) && (
                                                    <span style={{
                                                        fontSize: 8,
                                                        fontWeight: 500,
                                                        color: subTextColor,
                                                        lineHeight: 1.2,
                                                        whiteSpace: 'nowrap',
                                                    }}>
                                                        {startTime} – {endTime}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                          </div>{/* end layer 2 */}
                        </div>{/* end grid body */}
                    </div>
                </div>
            </div>

            {/* Chú thích */}
            <Note />

            {/* ═══ Modal: Lưu phương án ══════════════════════════════════════ */}
            {showSaveModal && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg overflow-hidden">
                        <div className="p-4 md:p-5 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-base">
                                <Save className="w-4 h-4 text-emerald-600" />
                                Lưu phương án lịch
                            </h3>
                            <button onClick={() => setShowSaveModal(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <div className="p-4 md:p-6">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Tên gợi nhớ cho lịch này</label>
                            <input
                                autoFocus
                                type="text"
                                value={newScheduleName}
                                onChange={(e) => setNewScheduleName(e.target.value)}
                                placeholder="VD: Lịch học kỳ 2 – Option 1"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm"
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveSchedule()}
                            />
                            <p className="mt-3 text-xs text-gray-400 italic">
                                * Hệ thống lưu danh sách môn học và các lớp học cụ thể đang hiển thị.
                            </p>
                        </div>
                        <div className="p-4 md:p-5 bg-gray-50 flex gap-3 justify-end">
                            <button onClick={() => setShowSaveModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">
                                Hủy
                            </button>
                            <button
                                onClick={handleSaveSchedule}
                                disabled={!newScheduleName.trim()}
                                className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow hover:bg-emerald-700 transition-all disabled:opacity-50"
                            >
                                Xác nhận lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Modal: Cấu hình ══════════════════════════════════════════ */}
            {isConfigOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-2xl overflow-hidden">
                        <div className="p-4 bg-[#004A98] flex items-center justify-between text-white">
                            <div className="flex items-center gap-2">
                                <Settings className="w-4 h-4 md:w-5 md:h-5" />
                                <h3 className="font-semibold text-sm md:text-base">Cấu hình thuật toán xếp lịch</h3>
                            </div>
                            <button onClick={() => setIsConfigOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 md:p-6 grid grid-cols-1 gap-5 md:gap-8 overflow-y-auto max-h-[70vh]">
                            {/* Buổi học */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 md:mb-3 block">Buổi ưu tiên</label>
                                <div className="flex bg-gray-100 p-1 rounded-xl">
                                    {[
                                        { id: '0', label: 'Tự do', icon: Zap },
                                        { id: '1', label: 'Sáng', icon: Sun },
                                        { id: '2', label: 'Chiều', icon: Moon },
                                    ].map(s => (
                                        <button
                                            key={s.id}
                                            onClick={() => setPrefs(prev => ({ ...prev, session: s.id }))}
                                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${prefs.session === s.id ? 'bg-white text-[#004A98] shadow-sm' : 'text-gray-500'}`}
                                        >
                                            <s.icon className="w-3.5 h-3.5" />
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[10px] text-gray-400 mt-2 italic">* Chọn "Tự do" nếu không quá cần thiết để thuật toán dễ tìm phương án hơn.</p>
                            </div>

                            {/* Chiến thuật */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 md:mb-3 block">Chiến thuật dồn lịch</label>
                                <div className="flex bg-gray-100 p-1 rounded-xl">
                                    {[
                                        { id: 'compress', label: 'Dồn lịch', title: 'Học nhiều trong 1 ngày để nghỉ ngày khác' },
                                        { id: 'spread', label: 'Trải đều', title: 'Học rải rác để giảm tải mỗi ngày' },
                                    ].map(s => (
                                        <button
                                            key={s.id}
                                            onClick={() => setPrefs(prev => ({ ...prev, strategy: s.id }))}
                                            className={`flex-1 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${prefs.strategy === s.id ? 'bg-white text-[#004A98] shadow-sm' : 'text-gray-500'}`}
                                            title={s.title}
                                        >
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[10px] text-gray-400 mt-2 italic">* "Dồn lịch" ưu tiên phương án có nhiều ngày nghỉ trống trong tuần.</p>
                            </div>

                            {/* Tiết trống */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 md:mb-3 block">Tiết trống (Gap)</label>
                                <button
                                    onClick={() => setPrefs(prev => ({ ...prev, noGaps: !prev.noGaps }))}
                                    className={`w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border text-xs md:text-sm font-medium transition-all ${prefs.noGaps ? 'bg-blue-50 border-blue-200 text-[#004A98]' : 'bg-white border-gray-200 text-gray-600'}`}
                                >
                                    {prefs.noGaps ? 'Hạn chế tối đa tiết trống' : 'Cho phép tiết trống'}
                                </button>
                                <p className="text-[10px] text-gray-400 mt-2 italic">* Hạn chế tiết trống giúp bạn không phải chờ đợi lâu giữa các tiết học.</p>
                            </div>

                            {/* Ngày nghỉ */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 md:mb-3 block">Ngày muốn nghỉ</label>
                                <div className="flex flex-wrap gap-2">
                                    {[0, 1, 2, 3, 4, 5, 6].map(day => {
                                        const offSession = getDayOffSession(prefs.daysOff, day);
                                        return (
                                            <button
                                                key={day}
                                                onClick={() => setPrefs(prev => {
                                                    return {
                                                        ...prev,
                                                        daysOff: cycleDayOffSession(prev.daysOff, day)
                                                    };
                                                })}
                                                className={`flex h-12 w-12 flex-col items-center justify-center rounded-xl border text-xs font-bold transition-all md:h-14 md:w-14 ${offSession === 'all' ? 'border-red-500 bg-red-500 text-white shadow-md' : offSession === 'morning' ? 'border-amber-400 bg-amber-50 text-amber-700 shadow-sm' : offSession === 'afternoon' ? 'border-orange-400 bg-orange-50 text-orange-700 shadow-sm' : 'border-gray-200 bg-white text-gray-400 hover:border-red-300'}`}
                                                title="Bấm lần lượt: nghỉ cả ngày, nghỉ sáng, nghỉ chiều, bỏ chọn"
                                            >
                                                <span>{day === 6 ? 'CN' : `T${day + 2}`}</span>
                                                {offSession && <span className="mt-0.5 text-[9px] font-medium leading-none">{formatDayOffSession(offSession)}</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                                <p className="text-[10px] text-gray-400 mt-2 italic">* Bấm 1 lần nghỉ cả ngày, 2 lần nghỉ sáng, 3 lần nghỉ chiều, bấm nữa để bỏ chọn.</p>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                            <button onClick={() => setIsConfigOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">
                                Đóng
                            </button>
                            <button
                                onClick={() => {
                                    setIsConfigOpen(false);
                                    solve(coursesToSchedule, allowedClassesMap, prefs);
                                }}
                                className="px-6 py-2.5 bg-[#004A98] text-white rounded-xl font-bold text-sm shadow hover:bg-blue-800 transition-all"
                            >
                                Lưu & Xếp lịch lại
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Modal: Danh sách lịch đã lưu ════════════════════════════ */}
            {showListModal && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl overflow-hidden">
                        <div className="p-4 md:p-5 border-b border-gray-100 flex items-center justify-between bg-blue-50/50">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-base">
                                <List className="w-4 h-4 text-blue-600" />
                                Lịch học đã lưu
                            </h3>
                            <button onClick={() => setShowListModal(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <div className="overflow-y-auto p-3 md:p-4" style={{ maxHeight: '60vh' }}>
                            {savedSchedules.length === 0 ? (
                                <div className="text-center py-10">
                                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Clock className="w-7 h-7 text-gray-300" />
                                    </div>
                                    <p className="text-sm text-gray-500">Chưa có phương án nào được lưu.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-2 md:gap-3">
                                    {savedSchedules.map((saved) => (
                                        <div key={saved.id} className="p-3 md:p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 hover:bg-blue-50/30 transition-all flex items-center justify-between shadow-sm">
                                            <div className="flex-1 min-w-0 pr-3">
                                                <h4 className="font-bold text-gray-900 truncate text-xs md:text-sm uppercase tracking-wide">{saved.name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded flex items-center gap-1">
                                                        <Clock className="w-2.5 h-2.5" />
                                                        {new Date(saved.createdAt).toLocaleDateString('vi-VN')}
                                                    </span>
                                                    <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-bold">
                                                        {saved.selectedCourses.length} môn
                                                    </span>
                                                    {saved.groupSchedule && (
                                                        <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                                                            Nhóm · {saved.groupSchedule.members.length} thành viên
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('Hành động này sẽ thay đổi danh sách môn học bạn đang chọn. Bạn có chắc chắn?')) {
                                                            handleLoadSchedule(saved);
                                                        }
                                                    }}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all"
                                                >
                                                    <Check className="w-3 h-3" />
                                                    Xem
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('Bạn có chắc chắn muốn xóa lịch này?')) {
                                                            handleDeleteSchedule(saved.id);
                                                        }
                                                    }}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center">
                            <p className="text-[10px] text-gray-400">* Lịch được lưu trữ cục bộ trên trình duyệt của bạn.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
