import { Calendar, AlertTriangle, Cpu, ChevronLeft, ChevronRight } from 'lucide-react';
import { type ClassSection } from '../../types';
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
    solve: (courses: Course[], allowedClassesMap: Record<string, string[]>) => void;
    solving: boolean;
    solverError: string | null;
    setActiveOption: (option: number) => void;
    getConflicts: (section: ClassSection) => ClassSection[];
    allowedClassesMap: Record<string, string[]>;
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
}: CalendarViewProps) {
    if (selectedCourses.size === 0) {
        return (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-12 text-center">
                <Calendar className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-gray-900 mb-2">Chưa chọn môn học nào</h3>
                <p className="text-gray-600 mb-4">
                    Vui lòng chuyển sang tab "Chọn môn & Học phí" để chọn các môn học bạn muốn đăng ký.
                </p>
                <button
                    onClick={() => setActiveTab('selection')}
                    className="px-6 py-2 bg-[#004A98] text-white rounded-lg hover:bg-[#003A78] transition-colors"
                >
                    Đi đến Chọn môn
                </button>
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
                    onClick={() => {
                        const coursesToSchedule = Array.from(selectedCourses)
                            .map(id => allCurrentCourses.find(c => c.id === id))
                            .filter((c): c is NonNullable<typeof c> => !!c);
                        solve(coursesToSchedule, allowedClassesMap);
                    }}
                    disabled={solving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#004A98] text-white rounded-lg hover:bg-[#003A78] transition-colors disabled:opacity-60 disabled:cursor-not-allowed shrink-0 font-medium text-sm"
                >
                    <Cpu className="w-4 h-4" />
                    {solving ? 'Đang xếp lịch...' : 'Xếp lịch tự động'}
                </button>
            </div>

            {/* Hiển thị lỗi */}
            {solverError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    <AlertTriangle className="w-4 h-4" />{solverError}
                </div>
            )}

            {/* Điều hướng phương án */}
            {options.length > 1 && (
                <div className="mb-4 flex items-center gap-2">
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
                    </div>
                </div>
            )}

            {/* Lịch học */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-auto shadow-sm">
                <div className="min-w-[860px]">
                    {/* Hàng tiêu đề */}
                    <div
                        className="grid sticky top-0 z-10"
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
        </div>
    );
}
