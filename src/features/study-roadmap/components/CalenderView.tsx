import { useState, useEffect, useLayoutEffect, useMemo, cloneElement, useCallback, useRef, isValidElement, type ReactNode, type ReactElement } from 'react';
import { STORAGE_KEYS } from '../../../config';
import { SavedSchedulesModal } from '../../group-schedule';
import { readFromStorage, saveToStorage } from '../../../helpers/localStorage/save';
import { Calendar, AlertTriangle, Cpu, ChevronLeft, ChevronRight, Settings, Sun, Moon, Zap, X, Save, List, Trash2, Clock, Check, BookOpen, Hash, BarChart2, Layers, Users } from 'lucide-react';
import { type ClassSection, type SavedSchedule } from '../../../types';
import type { RegisteredCourse } from '../../../logic/scheduler/RegistrationResolver';
import { type SolverPreferences, type ScheduleOption } from '../hooks/use-schedule-solver';
import { weekDays, timePeriods } from '../../../constants';
import type { Course } from '../../../types';
import { Note } from './note.tsx'
import { cycleDayOffSession, formatDayOffSession, getDayOffSession } from '../../../utils/dayOffPreferences';
import type { Tab } from './../types.ts';
import { OpenClassDetailDialog, type OpenClassDetailTarget } from '../../../components/course';
import { ScheduleModeToggle, ScheduleOptionSelector, type ScheduleMode } from '../../schedule';
import { ScheduleBuilder } from './ScheduleBuilder';
import { BuilderToolbar } from './BuilderToolbar';
import { GuideLauncher, useGuideAction, useUserGuide } from '../../user-guide';
import { hasPendingGroupGuideStep, requestGroupGuideStep } from '../../user-guide/services/group-guide-runtime';

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
    setActiveTab: (tab: Tab) => void;
    currentSections: ClassSection[];
    registeredCourses?: RegisteredCourse[];
    registeredSections?: ClassSection[];
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
    groupScheduleContent?: ReactNode;
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
        <div className="ustudy-card flex min-w-0 flex-1 items-center gap-3 px-4 py-3">
            <div className={`ustudy-icon-badge h-9 w-9 md:h-9 md:w-9 ${accent ?? 'bg-blue-50'}`}>
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
    registeredCourses = [],
    registeredSections = [],
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
    groupScheduleContent,
}: CalendarViewProps) {
    const { activeGuide, isRunning: isGuideRunning } = useUserGuide();
    const [scheduleMode, setScheduleMode] = useState<ScheduleMode>(() => {
        if (window.location.hash.startsWith('#v1_') || hasPendingGroupGuideStep()) return 'group';
        return readFromStorage<ScheduleMode>(STORAGE_KEYS.SCHEDULE_MODE, 'personal');
    });

    useGuideAction('show-personal-schedule', () => setScheduleMode('personal'));
    useGuideAction('show-group-schedule', () => setScheduleMode('group'));
    useGuideAction('show-group-preferences', () => {
        requestGroupGuideStep(2);
        setScheduleMode('group');
    });

    useLayoutEffect(() => {
        if (!isGuideRunning) return;
        if (activeGuide?.id === 'group-scheduling' || activeGuide?.id === 'group-preferences') {
            setScheduleMode('group');
        }
    }, [activeGuide?.id, isGuideRunning]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.SCHEDULE_MODE, scheduleMode);
    }, [scheduleMode]);
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
    const [openClassDetails, setOpenClassDetails] = useState<OpenClassDetailTarget | null>(null);
    const [builderDraftSections, setBuilderDraftSections] = useState<ClassSection[]>([]);
    const [hasBuilderSelections, setHasBuilderSelections] = useState(false);
    const clearBuilderDraftRef = useRef<(() => void) | null>(null);

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
        // Use builder draft sections if available, otherwise fall back to solver sections
        const sectionsToSave = builderDraftSections.length > 0 ? builderDraftSections : currentSections;
        const newSaved: SavedSchedule = {
            id: crypto.randomUUID(),
            name: newScheduleName.trim(),
            createdAt: new Date().toISOString(),
            sessions: sectionsToSave,
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
    const renderModeSwitch = () => (
        <div data-guide="schedule-mode" className="flex items-center gap-2">
            <ScheduleModeToggle mode={scheduleMode} onChange={setScheduleMode} />
            <GuideLauncher
                guideId={scheduleMode === 'group' ? 'group-scheduling' : 'personal-scheduling'}
                variant="icon"
                source="schedule-mode-toolbar"
            />
        </div>
    );

    const hasPersonalScheduleActions = selectedCourses.size > 0 || registeredSections.length > 0 || savedSchedules.length > 0;

    const renderModeToolbar = () => (
        <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 md:flex-row md:items-center md:gap-4">
            {renderModeSwitch()}
            {scheduleMode === 'personal' && hasPersonalScheduleActions && (
                <>
                    <div className="hidden h-6 w-px bg-gray-200 md:block" />
                    <div data-guide="schedule-builder-toolbar" className="min-w-0 flex-1">
                        <BuilderToolbar
                            hasSelections={hasBuilderSelections}
                            solving={solving}
                            savedSchedulesCount={savedSchedules.length}
                            onFullSolve={() => solve(coursesToSchedule, allowedClassesMap, prefs)}
                            onOpenConfig={() => setIsConfigOpen(true)}
                            onOpenSavedList={() => setShowListModal(true)}
                            onSave={() => setShowSaveModal(true)}
                            onClear={() => clearBuilderDraftRef.current?.()}
                        />
                    </div>
                </>
            )}
        </div>
    );

    const handleClearSolver = useCallback(() => {
        setOptions([]);
        setActiveOption(0);
    }, [setOptions, setActiveOption]);

    if (scheduleMode === 'personal' && selectedCourses.size === 0 && savedSchedules.length === 0 && registeredSections.length === 0) {
        return (
            <div className="space-y-4">
                {renderModeToolbar()}
                <div className="space-y-3 md:hidden">
                    <div className="rounded-xl border border-gray-200 bg-white px-5 py-8 text-center shadow-sm">
                        <Calendar className="mx-auto mb-3 h-10 w-10 text-blue-400" />
                        <h3 className="text-base font-semibold text-gray-900">Chưa có môn để xếp lịch</h3>
                        <p className="mt-1.5 text-sm leading-5 text-gray-500">Chọn môn học trước, sau đó quay lại đây để tạo thời khóa biểu.</p>
                        <button
                            onClick={() => setActiveTab('selection')}
                            className="ustudy-button-primary mt-5 w-full"
                        >
                            Chọn môn học
                        </button>
                    </div>
                </div>

                <div className="ustudy-card hidden p-12 text-center md:block">
                    <Calendar className="mx-auto mb-4 h-16 w-16 text-blue-400" />
                    <h3 className="mb-2 text-lg text-gray-900">Chưa chọn môn học nào</h3>
                    <p className="mb-4 text-sm text-gray-600">
                        Vui lòng chuyển sang tab "Chọn môn" để chọn các môn học bạn muốn đăng ký.
                    </p>
                    <div className="flex flex-col items-center gap-3">
                        <button
                            onClick={() => setActiveTab('selection')}
                            className="ustudy-button-primary w-auto"
                        >
                            Đi đến Chọn môn
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Main render ────────────────────────────────────────────────────────────
    if (scheduleMode === 'group') {
        return (
            <div className="space-y-4">
                {groupScheduleContent && isValidElement(groupScheduleContent) && cloneElement(groupScheduleContent as ReactElement, {
                    modeSwitch: renderModeSwitch(),
                })}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {renderModeToolbar()}

            {/* ═══ Schedule Builder (unified manual + auto) ════════════════ */}
            <div data-guide="schedule-builder-workspace">
              <ScheduleBuilder
                selectedCourses={selectedCourses}
                allCurrentCourses={allCurrentCourses}
                registeredCourses={registeredCourses}
                registeredSections={registeredSections}
                solve={solve}
                solving={solving}
                solverError={solverError}
                options={options}
                activeOption={activeOption}
                setActiveOption={setActiveOption}
                currentSections={currentSections}
                allowedClassesMap={allowedClassesMap}
                setAllowedClassesMap={setAllowedClassesMap}
                prefs={prefs}
                savedSchedulesCount={savedSchedules.length}
                setActiveTab={setActiveTab}
                onOpenConfig={() => setIsConfigOpen(true)}
                onOpenSavedList={() => setShowListModal(true)}
                onOpenSaveModal={() => setShowSaveModal(true)}
                onClearSolver={handleClearSolver}
                onDraftSectionsChange={setBuilderDraftSections}
                showToolbar={false}
                onDraftStateChange={setHasBuilderSelections}
                clearDraftRef={clearBuilderDraftRef}
              />
            </div>
            <div className="hidden md:block">
                {/* Chú thích */}
                <Note />
            </div>

            <OpenClassDetailDialog target={openClassDetails} onOpenChange={(open) => { if (!open) setOpenClassDetails(null); }} />

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
                            <p className="mt-3 hidden text-xs text-gray-400 italic md:block">
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
                                <p className="mt-2 hidden text-[10px] italic text-gray-400 md:block">* Chọn "Tự do" nếu không quá cần thiết để thuật toán dễ tìm phương án hơn.</p>
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
                                <p className="mt-2 hidden text-[10px] italic text-gray-400 md:block">* "Dồn lịch" ưu tiên phương án có nhiều ngày nghỉ trống trong tuần.</p>
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
                                <p className="mt-2 hidden text-[10px] italic text-gray-400 md:block">* Hạn chế tiết trống giúp bạn không phải chờ đợi lâu giữa các tiết học.</p>
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
                                <p className="mt-2 hidden text-[10px] italic text-gray-400 md:block">* Bấm 1 lần nghỉ cả ngày, 2 lần nghỉ sáng, 3 lần nghỉ chiều, bấm nữa để bỏ chọn.</p>
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
            <SavedSchedulesModal
                isOpen={showListModal}
                onClose={() => setShowListModal(false)}
                savedSchedules={savedSchedules}
                onLoadSchedule={handleLoadSchedule}
                onDeleteSchedule={handleDeleteSchedule}
            />
        </div>
    );
}
