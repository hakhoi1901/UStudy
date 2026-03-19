import { useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../../config';
import { readFromStorage, saveToStorage } from '../../helpers/localStorage/save';
import { Calendar, AlertTriangle, Cpu, ChevronLeft, ChevronRight, Settings, Sun, Moon, Zap, X, Save, List, Trash2, Clock, Check } from 'lucide-react';
import { type ClassSection, type SavedSchedule } from '../../types';
import { type SolverPreferences, type ScheduleOption } from '../../hooks/useScheduleSolver';
import { weekDays, timePeriods } from '../../constants';
import type { Course } from '../../types';
import { Note } from './note.tsx'

interface CalendarViewProps {
    selectedCourses: Set<string>;
    setActiveTab: (tab: 'trainingProgram' | 'selection' | 'calendar') => void;
    currentSections: ClassSection[];
    activeOption: number;
    options: any[]; // Or define the Option type if it exists in useScheduleSolver
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

    // Lưu cấu hình xếp lịch vào localStorage
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.SOLVER_PREFERENCES, prefs);
    }, [prefs]);
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [savedSchedules, setSavedSchedules] = useState<SavedSchedule[]>(() => {
        return readFromStorage<SavedSchedule[]>(STORAGE_KEYS.SAVED_SCHEDULES, []);
    });
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showListModal, setShowListModal] = useState(false);
    const [newScheduleName, setNewScheduleName] = useState('');

    const handleSaveSchedule = () => {
        if (!newScheduleName.trim()) return;

        const newSaved: SavedSchedule = {
            id: crypto.randomUUID(),
            name: newScheduleName.trim(),
            createdAt: new Date().toISOString(),
            sessions: currentSections,
            selectedCourses: Array.from(selectedCourses),
            allowedClassesMap: allowedClassesMap
        };

        const updated = [newSaved, ...savedSchedules];
        setSavedSchedules(updated);
        saveToStorage(STORAGE_KEYS.SAVED_SCHEDULES, updated);
        setShowSaveModal(false);
        setNewScheduleName('');
    };

    const handleLoadSchedule = (saved: SavedSchedule) => {
        setSelectedCourses(new Set(saved.selectedCourses));
        setAllowedClassesMap(saved.allowedClassesMap);

        // Inject exactly the saved sessions into the solver state
        const restoredOption: ScheduleOption = {
            option: 1,
            fitness: 1000, // Arbitrary high fitness for restored schedule
            classSections: saved.sessions
        };

        setOptions([restoredOption]);
        setActiveOption(0);

        setShowListModal(false);
    };

    const handleDeleteSchedule = (id: string) => {
        const updated = savedSchedules.filter(s => s.id !== id);
        setSavedSchedules(updated);
        saveToStorage(STORAGE_KEYS.SAVED_SCHEDULES, updated);
    };

    if (selectedCourses.size === 0 && savedSchedules.length === 0) {
        return (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-12 text-center">
                <Calendar className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-gray-900 mb-2">Chưa chọn môn học nào</h3>
                <p className="text-gray-600 mb-4">
                    Vui lòng chuyển sang tab "Chọn môn & Học phí" để chọn các môn học bạn muốn đăng ký.
                </p>
                <div className="flex flex-col gap-3 items-center">
                    <button
                        onClick={() => setActiveTab('selection')}
                        className="px-6 py-2 bg-[#004A98] text-white rounded-lg hover:bg-[#003A78] transition-colors w-full sm:w-auto"
                    >
                        Đi đến Chọn môn
                    </button>
                    {savedSchedules.length > 0 && (
                        <button
                            onClick={() => setShowListModal(true)}
                            className="flex items-center justify-center gap-2 px-6 py-2 bg-white text-[#004A98] border border-[#004A98] rounded-lg hover:bg-blue-50 transition-colors w-full sm:w-auto"
                        >
                            <List className="w-4 h-4" />
                            Xem lịch đã lưu ({savedSchedules.length})
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Điều khiển */}
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between gap-3">
                <div className="flex-1">
                    <p className="text-sm text-blue-900 font-medium mb-1">
                        {currentSections.length > 0
                            ? `Đang xem phương án ${activeOption + 1}/${options.length} — ${selectedCourses.size} môn đã chọn`
                            : `${selectedCourses.size} môn đã chọn — Nhấn "Xếp lịch" để tìm phương án tối ưu`}
                    </p>
                    <p className="text-xs text-blue-700">
                        Thuật toán di truyền sẽ tự động chọn lớp tốt nhất, tránh trùng lịch.
                    </p>
                </div>
                <button
                    onClick={() => setIsConfigOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#004A98]/10 text-[#004A98] rounded-lg hover:bg-[#004A98]/20 transition-colors shrink-0 font-medium text-sm border border-[#004A98]/20"
                    title="Cấu hình ưu tiên"
                >
                    <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                    <span className="text-sm font-semibold pr-1">Cấu hình</span>
                </button>

                <div className="h-8 w-[1px] bg-blue-200 mx-1" />

                <button
                    onClick={() => setShowListModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#004A98] border border-[#004A98] rounded-lg hover:bg-blue-50 transition-colors shrink-0 font-medium text-sm shadow-sm"
                >
                    <List className="w-4 h-4" />
                    <span>Lịch đã lưu ({savedSchedules.length})</span>
                </button>

                <button
                    onClick={() => {
                        const coursesToSchedule = Array.from(selectedCourses)
                            .map(id => allCurrentCourses.find(c => c.id === id))
                            .filter((c): c is NonNullable<typeof c> => !!c);
                        solve(coursesToSchedule, allowedClassesMap, prefs);
                    }}
                    disabled={solving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#004A98] text-white rounded-lg hover:bg-[#003A78] transition-colors disabled:opacity-60 disabled:cursor-not-allowed shrink-0 font-medium text-sm shadow-md"
                >
                    <Cpu className="w-4 h-4" />
                    {solving ? 'Đang xếp lịch...' : 'Xếp lịch tự động'}
                </button>
            </div>

            {/* ScheduleConfigModal */}
            {isConfigOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div style={{ maxWidth: '700px' }} className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-4 bg-[#004A98] flex items-center justify-between text-white">
                            <div className="flex items-center gap-2">
                                <Settings className="w-5 h-5" />
                                <h3 className="font-semibold text-lg">Cấu hình thuật toán xếp lịch</h3>
                            </div>
                            <button
                                onClick={() => setIsConfigOpen(false)}
                                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 grid grid-cols-1 gap-8">
                            {/* Buổi học */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Buổi ưu tiên</label>
                                <div className="flex bg-gray-100 p-1 rounded-xl">
                                    {[
                                        { id: '0', label: 'Tự do', icon: Zap },
                                        { id: '1', label: 'Sáng', icon: Sun },
                                        { id: '2', label: 'Chiều', icon: Moon },
                                    ].map(s => (
                                        <button
                                            key={s.id}
                                            onClick={() => setPrefs(prev => ({ ...prev, session: s.id }))}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${prefs.session === s.id ? 'bg-white text-[#004A98] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            <s.icon className="w-4 h-4" />
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[10px] text-gray-400 mt-2 italic">* Sinh viên nên chọn "Tự do" nếu không quá cần thiết để thuật toán dễ tìm phương án hơn.</p>
                            </div>

                            {/* Chiến thuật */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Chiến thuật dồn lịch</label>
                                <div className="flex bg-gray-100 p-1 rounded-xl">
                                    {[
                                        { id: 'compress', label: 'Dồn lịch', title: 'Học nhiều trong 1 ngày để nghỉ ngày khác' },
                                        { id: 'spread', label: 'Trải đều', title: 'Học rải rác để giảm tải mỗi ngày' },
                                    ].map(s => (
                                        <button
                                            key={s.id}
                                            onClick={() => setPrefs(prev => ({ ...prev, strategy: s.id }))}
                                            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${prefs.strategy === s.id ? 'bg-white text-[#004A98] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                            title={s.title}
                                        >
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[10px] text-gray-400 mt-2 italic">* "Dồn lịch" sẽ ưu tiên các phương án có nhiều ngày nghỉ trống trong tuần.</p>
                            </div>

                            {/* Tiết trống */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Tiết trống (Gap)</label>
                                <button
                                    onClick={() => setPrefs(prev => ({ ...prev, noGaps: !prev.noGaps }))}
                                    className={`w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${prefs.noGaps
                                        ? 'bg-blue-50 border-blue-200 text-[#004A98]'
                                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                        }`}
                                >
                                    {prefs.noGaps ? 'Hạn chế tối đa tiết trống' : 'Cho phép tiết trống'}
                                </button>
                                <p className="text-[10px] text-gray-400 mt-2 italic">* Hạn chế tiết trống giúp bạn không phải chờ đợi lâu giữa các tiết học trong cùng 1 ngày.</p>
                            </div>

                            {/* Ngày nghỉ */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Ngày muốn nghỉ</label>
                                <div className="flex flex-wrap gap-2">
                                    {[0, 1, 2, 3, 4, 5, 6].map(day => {
                                        const isOff = prefs.daysOff?.includes(day);
                                        return (
                                            <button
                                                key={day}
                                                onClick={() => {
                                                    setPrefs(prev => {
                                                        const current = prev.daysOff || [];
                                                        if (current.includes(day)) {
                                                            return { ...prev, daysOff: current.filter(d => d !== day) };
                                                        } else {
                                                            return { ...prev, daysOff: [...current, day] };
                                                        }
                                                    });
                                                }}
                                                className={`w-10 h-10 flex items-center justify-center rounded-xl text-xs font-bold transition-all border ${isOff
                                                    ? 'bg-red-500 border-red-500 text-white shadow-md'
                                                    : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
                                                    }`}
                                            >
                                                {day === 6 ? 'CN' : `T${day + 2}`}
                                            </button>
                                        );
                                    })}
                                </div>
                                <p className="text-[10px] text-gray-400 mt-2 italic">* Thuật toán sẽ phạt điểm cực nặng các phương án bị dính vào ngày đỏ.</p>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => setIsConfigOpen(false)}
                                className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Đóng
                            </button>
                            <button
                                onClick={() => {
                                    setIsConfigOpen(false);
                                    const coursesToSchedule = Array.from(selectedCourses)
                                        .map(id => allCurrentCourses.find(c => c.id === id))
                                        .filter((c): c is NonNullable<typeof c> => !!c);
                                    solve(coursesToSchedule, allowedClassesMap, prefs);
                                }}
                                className="px-8 py-2.5 bg-[#004A98] text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5 transition-all"
                            >
                                Lưu & Xếp lịch lại
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hiển thị lỗi */}
            {solverError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    <AlertTriangle className="w-4 h-4" />{solverError}
                </div>
            )}

            {/* Điều hướng phương án */}
            {options.length > 1 && (
                <div className="mb-4 flex items-center gap-2 justify-between">
                    <div className="mb-4 flex items-center gap-3 bg-white p-2 border border-slate-200 rounded-xl w-fit shadow-sm">
                        <span className="text-sm text-gray-600 font-medium p-2">Phương án:</span>
                        <button
                            onClick={() => setActiveOption(Math.max(0, activeOption - 1))}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <div className="flex gap-1.5">
                            {options.map((opt, idx) => (
                                <button
                                    key={opt.option}
                                    onClick={() => setActiveOption(idx)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeOption === idx
                                        ? 'bg-[#004A98] text-white shadow-md'
                                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                                        }`}
                                >
                                    PA {opt.option} <p className='text-[9px] font-medium'>{(opt.fitness / 10).toFixed(0)}</p>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setActiveOption(Math.min(options.length - 1, activeOption + 1))}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>

                        <div className="w-[1px] h-6 bg-slate-200 mx-1" />
                    </div>

                    <button
                        onClick={() => setShowSaveModal(true)}
                        disabled={currentSections.length === 0}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 font-medium text-sm shadow-sm"
                    >
                        <Save className="w-4 h-4" />
                        <span>Lưu phương án</span>
                    </button>
                </div>
            )}



            {/* Lịch học */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-auto shadow-sm">
                <div className="min-w-[860px]">
                    {/* Hàng tiêu đề */}
                    <div
                        className="grid sticky top-0 z-5"
                        style={{ gridTemplateColumns: '76px repeat(6, 1fr)' }}
                    >
                        <div className="bg-[#004A98] rounded-tl-2xl h-12 flex items-end pb-1 justify-center">
                            <span className="text-[14px] text-white font-medium">Tiết</span>
                        </div>
                        {weekDays.map((day, idx) => (
                            <div
                                key={day.day}
                                className={`bg-[#004A98] text-white flex flex-col items-center justify-center border-l border-white/10 h-12 ${idx === weekDays.length - 1 ? 'rounded-tr-2xl' : ''
                                    }`}
                            >
                                <span className="text-[10px] text-white/60 font-normal">{day.nameVi}</span>
                                <span className="text-sm font-bold">{day.short}</span>
                            </div>
                        ))}
                    </div>

                    {/* Lưới nền + lớp học */}
                    <div className="relative">
                        {timePeriods.map((period) => {
                            const isFirstAfternoon = period.period === 6;
                            return (
                                <div key={period.period}>
                                    {/* Ngăn cách giờ trưa */}
                                    {isFirstAfternoon && (
                                        <div
                                            className="grid items-center"
                                            style={{ gridTemplateColumns: '76px 1fr', height: '30px' }}
                                        >
                                            <div className="bg-amber-50 border-b border-t border-amber-200 flex items-center justify-center">
                                                <span className="text-[8px] text-amber-600 font-semibold">Trưa</span>
                                            </div>
                                            <div className="bg-amber-50/60 border-b border-t border-amber-200 flex items-center px-3">
                                                <div className="flex-1 border-t border-dashed border-amber-300" />
                                                <span className="text-[9px] text-amber-500 px-2">Nghỉ trưa 11:50 – 12:40</span>
                                                <div className="flex-1 border-t border-dashed border-amber-300" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Hàng tiết học */}
                                    <div
                                        className="grid"
                                        style={{ gridTemplateColumns: '76px repeat(6, 1fr)', height: '60px' }}
                                    >
                                        {/* Nhãn tiết học */}
                                        <div
                                            className={`flex flex-col items-center justify-center border-b border-r px-1 shrink-0 ${period.label === 'Sáng' ? 'bg-sky-50 border-gray-200' : 'bg-sky-50 border-gray-200'
                                                }`}
                                        >
                                            <div
                                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full mb-0.5 ${period.label === 'Sáng' ? 'bg-sky-100 text-sky-700' : 'bg-sky-100 text-sky-700'
                                                    }`}
                                            >
                                                P{period.period}
                                            </div>
                                            <span className="text-[8px] text-gray-400 leading-none text-center">
                                                {period.time.split(' - ')[0]}
                                            </span>
                                            <span className="text-[8px] text-gray-300 leading-none">↓</span>
                                            <span className="text-[8px] text-gray-400 leading-none">
                                                {period.time.split(' - ')[1]}
                                            </span>
                                        </div>
                                        {weekDays.map((day) => (
                                            <div
                                                key={`${day.day}-${period.period}`}
                                                className="border-b border-l border-gray-100 hover:bg-gray-50/50 transition-colors"
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Lớp học */}
                        {currentSections.map((classSection: ClassSection) => {
                            const conflicts = getConflicts(classSection);
                            const hasConflict = conflicts.length > 0;

                            const lunchBreakOffset = classSection.startPeriod >= 6 ? 22 : 0;
                            const topPx = (classSection.startPeriod - 1) * 60 + lunchBreakOffset;
                            const heightPeriods = classSection.endPeriod - classSection.startPeriod + 1;

                            const spansLunch = classSection.startPeriod < 6 && classSection.endPeriod >= 6;
                            const heightPx = heightPeriods * 60 + (spansLunch ? 22 : 0);
                            const dayColIndex = classSection.day - 2; // T2→0 … T7→5

                            const bgColor = hasConflict ? '#ffffffff' : classSection.color;
                            const borderColor = hasConflict ? '#EF4444' : classSection.color;
                            const textColor = hasConflict ? '#991B1B' : '#ffffffff';
                            const subTextColor = hasConflict ? '#B91C1C' : 'rgba(255, 255, 255, 0.85)';

                            const startTime = timePeriods.find(p => p.period === classSection.startPeriod)?.time.split(' - ')[0] ?? '';
                            const endTime = timePeriods.find(p => p.period === classSection.endPeriod)?.time.split(' - ')[1] ?? '';

                            return (
                                <div
                                    key={classSection.id}
                                    style={{
                                        position: 'absolute',
                                        top: topPx + 2,
                                        left: `calc(76px + ${dayColIndex} * ((100% - 76px) / 6) + 3px)`,
                                        width: `calc((100% - 76px) / 6 - 6px)`,
                                        height: heightPx - 4,
                                        backgroundColor: bgColor,
                                        border: `1.5px solid ${hasConflict ? '#FCA5A5' : 'rgba(255,255,255,0.25)'}`,
                                        borderLeft: `3px solid ${borderColor}`,
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        boxShadow: hasConflict
                                            ? '0 2px 8px rgba(239,68,68,0.25)'
                                            : '0 2px 8px rgba(0,0,0,0.15)',
                                    }}
                                    className="flex flex-col px-2 py-1.5 cursor-default group"
                                >
                                    {/* Badge trùng lịch */}
                                    {hasConflict && (
                                        <div className="flex items-center gap-1 mb-1 px-1 py-0.5 bg-red-100 rounded-sm">
                                            <AlertTriangle className="w-2.5 h-2.5 text-red-600 shrink-0" />
                                            <span className="text-[8.5px] font-bold text-red-700 uppercase tracking-wide">
                                                Trùng lịch
                                            </span>
                                        </div>
                                    )}

                                    {/* Mã học phần */}
                                    <p className="text-[12px] p-0.5 font-bold text-black font-black leading-none truncate" style={{ color: textColor }}>
                                        {classSection.courseCode}
                                    </p>

                                    {/* Tên học phần */}
                                    {heightPx >= 80 && (
                                        <p className="text-[10px] font-semibold p-0.5 leading-tight mt-0.5 line-clamp-2" style={{ color: subTextColor }}>
                                            {classSection.courseNameVi}
                                        </p>
                                    )}

                                    {/* Khoảng trống */}
                                    <div className="flex-1" />

                                    {/* Thông tin */}
                                    <div className="flex flex-col gap-0.5 mt-1">
                                        {/* Nhóm + Phòng */}
                                        <div className="flex items-center gap-1">
                                            <span
                                                className="text-[9px] font-bold px-1 py-0.5 rounded"
                                                style={{
                                                    backgroundColor: hasConflict ? '#FEE2E2' : 'rgba(0,0,0,0.2)',
                                                    color: hasConflict ? '#991B1B' : 'rgba(255,255,255,0.95)',
                                                }}
                                            >
                                                {classSection.sectionNumber}
                                            </span>
                                            {classSection.room !== '---' && heightPx >= 70 && (
                                                <span className="text-[9px] font-semibold px-1 py-0.5 rounded truncate" style={{ color: subTextColor }}>
                                                    {classSection.room}
                                                </span>
                                            )}
                                        </div>

                                        {/* Khung giờ */}
                                        {heightPx >= 90 && startTime && (
                                            <p className="text-[10px] px-1 py-0.5 rounded font-semibold" style={{ color: subTextColor }}>
                                                {startTime} – {endTime}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Chú thích */}
            <Note />

            {/* Modal Lưu phương án */}
            {showSaveModal && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div style={{ maxWidth: '600px', minWidth: '500px', maxHeight: '600px' }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                                <Save className="w-5 h-5 text-green-600" />
                                Lưu phương án lịch
                            </h3>
                            <button onClick={() => setShowSaveModal(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <div className="p-6">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Tên gợi nhớ cho lịch này</label>
                            <input
                                autoFocus
                                type="text"
                                value={newScheduleName}
                                onChange={(e) => setNewScheduleName(e.target.value)}
                                placeholder="VD: Lịch học kỳ 2 - Option 1"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveSchedule()}
                            />
                            <p className="mt-4 text-xs text-gray-400 italic">
                                * Hệ thống sẽ lưu lại danh sách môn học và các lớp học cụ thể đang hiển thị.
                            </p>
                        </div>
                        <div className="p-5 bg-gray-50 flex gap-3 justify-end">
                            <button onClick={() => setShowSaveModal(false)} className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">
                                Hủy
                            </button>
                            <button
                                onClick={handleSaveSchedule}
                                disabled={!newScheduleName.trim()}
                                className="px-8 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-green-100 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
                            >
                                Xác nhận lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Danh sách lịch đã lưu */}
            {showListModal && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200" style={{ maxWidth: '600px', minWidth: '500px', maxHeight: '600px' }}>
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-blue-50/50">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                                <List className="w-5 h-5 text-blue-600" />
                                Danh sách lịch học đã lưu
                            </h3>
                            <button onClick={() => setShowListModal(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <div className="overflow-y-auto p-4 overflow-hidden custom-scrollbar" style={{ maxHeight: '400px' }}>
                            {savedSchedules.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Clock className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <p className="text-gray-500">Chưa có phương án nào được lưu.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-3">
                                    {savedSchedules.map((saved) => (
                                        <div key={saved.id} className="group p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 hover:bg-blue-50/30 transition-all flex items-center justify-between shadow-sm hover:shadow-md">
                                            <div className="flex-1 min-w-0 pr-4">
                                                <h4 className="font-bold text-gray-900 truncate group-hover:text-blue-700 transition-colors uppercase text-sm tracking-wide">{saved.name}</h4>
                                                <div className="flex items-center gap-3 mt-1.5 font-medium">
                                                    <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(saved.createdAt).toLocaleDateString('vi-VN')} {new Date(saved.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <span className="text-[10px] text-blue-500 bg-blue-50 px-2 py-0.5 rounded font-bold">
                                                        {saved.selectedCourses.length} môn học
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('Hành động này sẽ thay đổi danh sách môn học bạn đang chọn. Bạn có chắc chắn?')) {
                                                            handleLoadSchedule(saved);
                                                        }
                                                    }}
                                                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-sm transition-all active:scale-95"
                                                >
                                                    <Check className="w-3.5 h-3.5" />
                                                    Xem lịch
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('Bạn có chắc chắn muốn xóa lịch này?')) {
                                                            handleDeleteSchedule(saved.id);
                                                        }
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                    title="Xóa lịch"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-5 bg-gray-50 border-t border-gray-100 flex justify-center">
                            <p className="text-[10px] text-gray-400">* Lịch được lưu trữ cục bộ trên trình duyệt của bạn.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
