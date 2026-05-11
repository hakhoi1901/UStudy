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
        const restoredOption: ScheduleOption = {
            option: 1,
            fitness: 1000,
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

    const coursesToSchedule = Array.from(selectedCourses)
        .map(id => allCurrentCourses.find(c => c.id === id))
        .filter((c): c is NonNullable<typeof c> => !!c);

    return (
        <div>
            {/* ---- Toolbar ---- */}
            {/* Desktop: 1 hàng ngang. Mobile: 2 hàng */}
            <div className="mb-4 p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg">

                {/* Hàng 1: thông tin + nút xếp lịch */}
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-sm text-blue-900 font-medium truncate">
                            {currentSections.length > 0
                                ? `Phương án ${activeOption + 1}/${options.length} — ${selectedCourses.size} môn`
                                : `${selectedCourses.size} môn đã chọn`}
                        </p>
                        <p className="hidden md:block text-xs text-blue-700">
                            Thuật toán di truyền sẽ tự động chọn lớp tốt nhất, tránh trùng lịch.
                        </p>
                    </div>

                    {/* Nút Cấu hình - icon only trên mobile */}
                    <button
                        onClick={() => setIsConfigOpen(true)}
                        className="flex items-center gap-1.5 px-3 md:px-5 py-2 md:py-2.5 bg-[#004A98]/10 text-[#004A98] rounded-lg hover:bg-[#004A98]/20 transition-colors shrink-0 text-xs md:text-sm border border-[#004A98]/20"
                        title="Cấu hình ưu tiên"
                    >
                        <Settings className="w-4 h-4" />
                        <span className="hidden md:inline font-semibold">Cấu hình</span>
                    </button>

                    {/* Nút Lịch đã lưu - icon only trên mobile */}
                    <button
                        onClick={() => setShowListModal(true)}
                        className="flex items-center gap-1.5 px-3 md:px-5 py-2 md:py-2.5 bg-white text-[#004A98] border border-[#004A98] rounded-lg hover:bg-blue-50 transition-colors shrink-0 text-xs md:text-sm shadow-sm"
                    >
                        <List className="w-4 h-4" />
                        <span className="hidden md:inline">Lịch đã lưu ({savedSchedules.length})</span>
                        {savedSchedules.length > 0 && (
                            <span className="md:hidden px-1.5 py-0.5 bg-[#004A98] text-white text-[10px] rounded-full font-bold">
                                {savedSchedules.length}
                            </span>
                        )}
                    </button>

                    {/* Nút Xếp lịch */}
                    <button
                        onClick={() => solve(coursesToSchedule, allowedClassesMap, prefs)}
                        disabled={solving}
                        className="flex items-center gap-1.5 px-3 md:px-5 py-2 md:py-2.5 bg-[#004A98] text-white rounded-lg hover:bg-[#003A78] transition-colors disabled:opacity-60 disabled:cursor-not-allowed shrink-0 text-xs md:text-sm font-medium shadow-md"
                    >
                        <Cpu className="w-4 h-4" />
                        <span className="hidden sm:inline">{solving ? 'Đang xếp...' : 'Xếp lịch'}</span>
                        <span className="sm:hidden">{solving ? '...' : 'Xếp'}</span>
                    </button>
                </div>
            </div>

            {/* Lỗi solver */}
            {solverError && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs md:text-sm text-red-700">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{solverError}</span>
                </div>
            )}

            {/* Điều hướng phương án */}
            {options.length > 1 && (
                <div className="mb-3 md:mb-4 flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-2 bg-white p-1.5 border border-slate-200 rounded-xl shadow-sm flex-1 min-w-0 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                        <span className="text-xs text-gray-600 font-medium px-1 shrink-0">Phương án:</span>
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
                                    className={`px-2 py-1 rounded-lg text-[10px] md:text-xs font-bold transition-all shrink-0 ${activeOption === idx
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
                        className="flex items-center gap-1.5 px-3 md:px-5 py-2 md:py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 shrink-0 text-xs md:text-sm font-medium shadow-sm"
                    >
                        <Save className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Lưu phương án</span>
                        <span className="sm:hidden">Lưu</span>
                    </button>
                </div>
            )}

            {/* Lịch học - scroll ngang trên mobile */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-auto shadow-sm">
                <div className="min-w-[600px] md:min-w-[860px]">
                    {/* Hàng tiêu đề */}
                    <div className="grid sticky top-0 z-5" style={{ gridTemplateColumns: '52px repeat(6, 1fr)' }}>
                        <div className="bg-[#004A98] rounded-tl-2xl h-10 md:h-12 flex items-end pb-1 justify-center">
                            <span className="text-[11px] md:text-[14px] text-white font-medium">Tiết</span>
                        </div>
                        {weekDays.map((day, idx) => (
                            <div
                                key={day.day}
                                className={`bg-[#004A98] text-white flex flex-col items-center justify-center border-l border-white/10 h-10 md:h-12 ${idx === weekDays.length - 1 ? 'rounded-tr-2xl' : ''}`}
                            >
                                <span className="hidden md:block text-[10px] text-white/60 font-normal">{day.nameVi}</span>
                                <span className="text-[10px] md:text-sm font-bold">{day.short}</span>
                            </div>
                        ))}
                    </div>

                    {/* Lưới nền + lớp học */}
                    <div className="relative">
                        {timePeriods.map((period) => {
                            const isFirstAfternoon = period.period === 6;
                            return (
                                <div key={period.period}>
                                    {isFirstAfternoon && (
                                        <div className="grid items-center" style={{ gridTemplateColumns: '52px 1fr', height: '22px' }}>
                                            <div className="bg-amber-50 border-b border-t border-amber-200 flex items-center justify-center">
                                                <span className="text-[7px] md:text-[8px] text-amber-600 font-semibold">Trưa</span>
                                            </div>
                                            <div className="bg-amber-50/60 border-b border-t border-amber-200 flex items-center px-2 md:px-3">
                                                <div className="flex-1 border-t border-dashed border-amber-300" />
                                                <span className="hidden md:block text-[9px] text-amber-500 px-2">Nghỉ trưa 11:50 – 12:40</span>
                                                <div className="flex-1 border-t border-dashed border-amber-300" />
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid" style={{ gridTemplateColumns: '52px repeat(6, 1fr)', height: '52px' }}>
                                        <div className={`flex flex-col items-center justify-center border-b border-r px-0.5 shrink-0 bg-sky-50 border-gray-200`}>
                                            <div className="text-[8px] md:text-[10px] font-bold px-1 py-0.5 rounded-full mb-0.5 bg-sky-100 text-sky-700">
                                                P{period.period}
                                            </div>
                                            <span className="text-[7px] md:text-[8px] text-gray-400 leading-none text-center">
                                                {period.time.split(' - ')[0]}
                                            </span>
                                            <span className="text-[7px] md:text-[8px] text-gray-300 leading-none">↓</span>
                                            <span className="text-[7px] md:text-[8px] text-gray-400 leading-none">
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

                            // Mỗi row = 52px thay vì 60px trên mobile
                            const rowH = 52;
                            const lunchBreakOffset = classSection.startPeriod >= 6 ? 22 : 0;
                            const topPx = (classSection.startPeriod - 1) * rowH + lunchBreakOffset;
                            const heightPeriods = classSection.endPeriod - classSection.startPeriod + 1;
                            const spansLunch = classSection.startPeriod < 6 && classSection.endPeriod >= 6;
                            const heightPx = heightPeriods * rowH + (spansLunch ? 22 : 0);
                            const dayColIndex = classSection.day - 2;

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
                                        left: `calc(52px + ${dayColIndex} * ((100% - 52px) / 6) + 2px)`,
                                        width: `calc((100% - 52px) / 6 - 4px)`,
                                        height: heightPx - 4,
                                        backgroundColor: bgColor,
                                        border: `1.5px solid ${hasConflict ? '#FCA5A5' : 'rgba(255,255,255,0.25)'}`,
                                        borderLeft: `3px solid ${borderColor}`,
                                        borderRadius: '6px',
                                        overflow: 'hidden',
                                        boxShadow: hasConflict ? '0 2px 8px rgba(239,68,68,0.25)' : '0 2px 8px rgba(0,0,0,0.15)',
                                    }}
                                    className="flex flex-col px-1 md:px-2 py-1 cursor-default"
                                >
                                    {hasConflict && (
                                        <div className="flex items-center gap-0.5 mb-0.5 px-0.5 py-0.5 bg-red-100 rounded-sm">
                                            <AlertTriangle className="w-2 h-2 text-red-600 shrink-0" />
                                            <span className="text-[7px] md:text-[8.5px] font-bold text-red-700 uppercase">Trùng</span>
                                        </div>
                                    )}

                                    <p className="text-[9px] md:text-[12px] font-bold leading-none truncate" style={{ color: textColor }}>
                                        {classSection.courseCode}
                                    </p>

                                    {heightPx >= 70 && (
                                        <p className="text-[8px] md:text-[10px] font-semibold leading-tight mt-0.5 line-clamp-2" style={{ color: subTextColor }}>
                                            {classSection.courseNameVi}
                                        </p>
                                    )}

                                    <div className="flex-1" />

                                    <div className="flex flex-col gap-0.5 mt-0.5">
                                        <div className="flex items-center gap-0.5">
                                            <span
                                                className="text-[7px] md:text-[9px] font-bold px-0.5 md:px-1 py-0.5 rounded"
                                                style={{
                                                    backgroundColor: hasConflict ? '#FEE2E2' : 'rgba(0,0,0,0.2)',
                                                    color: hasConflict ? '#991B1B' : 'rgba(255,255,255,0.95)',
                                                }}
                                            >
                                                {classSection.sectionNumber}
                                            </span>
                                            {classSection.room !== '---' && heightPx >= 60 && (
                                                <span className="text-[7px] md:text-[9px] font-semibold px-0.5 rounded truncate" style={{ color: subTextColor }}>
                                                    {classSection.room}
                                                </span>
                                            )}
                                        </div>

                                        {heightPx >= 80 && startTime && (
                                            <p className="text-[7px] md:text-[10px] px-0.5 py-0.5 rounded font-semibold" style={{ color: subTextColor }}>
                                                {startTime}–{endTime}
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
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg overflow-hidden">
                        <div className="p-4 md:p-5 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-base md:text-lg">
                                <Save className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
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
                                placeholder="VD: Lịch học kỳ 2 - Option 1"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-sm"
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveSchedule()}
                            />
                            <p className="mt-3 text-xs text-gray-400 italic">
                                * Hệ thống sẽ lưu lại danh sách môn học và các lớp học cụ thể đang hiển thị.
                            </p>
                        </div>
                        <div className="p-4 md:p-5 bg-gray-50 flex gap-3 justify-end">
                            <button onClick={() => setShowSaveModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">
                                Hủy
                            </button>
                            <button
                                onClick={handleSaveSchedule}
                                disabled={!newScheduleName.trim()}
                                className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm shadow hover:bg-green-700 transition-all disabled:opacity-50"
                            >
                                Xác nhận lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Cấu hình */}
            {isConfigOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-2xl overflow-hidden">
                        <div className="p-4 bg-[#004A98] flex items-center justify-between text-white">
                            <div className="flex items-center gap-2">
                                <Settings className="w-4 h-4 md:w-5 md:h-5" />
                                <h3 className="font-semibold text-sm md:text-lg">Cấu hình thuật toán xếp lịch</h3>
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
                                <p className="text-[10px] text-gray-400 mt-2 italic">* "Dồn lịch" sẽ ưu tiên các phương án có nhiều ngày nghỉ trống trong tuần.</p>
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
                                        const isOff = prefs.daysOff?.includes(day);
                                        return (
                                            <button
                                                key={day}
                                                onClick={() => setPrefs(prev => {
                                                    const current = prev.daysOff || [];
                                                    return {
                                                        ...prev,
                                                        daysOff: current.includes(day) ? current.filter(d => d !== day) : [...current, day]
                                                    };
                                                })}
                                                className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-xl text-xs font-bold transition-all border ${isOff ? 'bg-red-500 border-red-500 text-white shadow-md' : 'bg-white border-gray-200 text-gray-400'}`}
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

            {/* Modal Danh sách lịch đã lưu */}
            {showListModal && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl overflow-hidden">
                        <div className="p-4 md:p-5 border-b border-gray-100 flex items-center justify-between bg-blue-50/50">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-base md:text-lg">
                                <List className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                                Lịch học đã lưu
                            </h3>
                            <button onClick={() => setShowListModal(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <div className="overflow-y-auto p-3 md:p-4 custom-scrollbar" style={{ maxHeight: '60vh' }}>
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
                                                    <span className="text-[10px] text-blue-500 bg-blue-50 px-2 py-0.5 rounded font-bold">
                                                        {saved.selectedCourses.length} môn
                                                    </span>
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