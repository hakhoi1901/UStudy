/**
 * useScheduleSolver.ts
 * Hook chạy thuật toán di truyền xếp TKB và trả về danh sách ClassSection để render luới lịch
 */
import { useState, useCallback } from 'react';
import { readFromStorage } from '../helpers/localStorage/save';
import { runScheduleSolver } from '../logic/scheduler/Scheduler';
import { maskToSections } from '../logic/scheduler/ScheduleDecoder';
import type { ClassSection } from '../types';
import type { Course } from '../types';
import { STORAGE_KEYS, UI_COLORS } from '../config';

// Tải dữ liệu DB tĩnh (fallback khi chưa có course_db_offline)
import courseDbJson from '../logic/scheduler/Course_db.json';

export interface ScheduleOption {
    option: number;
    fitness: number;
    classSections: ClassSection[];
}

export interface SolverPreferences {
    daysOff?: number[];   // 0=T2, 1=T3, ... 5=T7
    session?: string;     // '1'=Sáng, '2'=Chiều, '0'=Không quan trọng
    strategy?: string;    // 'compress'=Dồn ngày, 'spread'=Trải đều
    noGaps?: boolean;
}

const PALETTE = UI_COLORS.SCHEDULE_PALETTE;

export function useScheduleSolver() {
    const [solving, setSolving] = useState(false);
    const [options, setOptions] = useState<ScheduleOption[]>([]);
    const [activeOption, setActiveOption] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const solve = useCallback((selectedCourses: Course[], selectedClassMap: Record<string, string[]> = {}, prefs: SolverPreferences = {}) => {
        setSolving(true);
        setError(null);

        // Dùng setTimeout để cho React render trạng thái loading trước khi chạy thuật toán nặng
        setTimeout(() => {
            try {
                // Đọc dữ liệu từ localStorage (từ Bookmarklet), nếu không có thì dùng file tĩnh
                const courseDb = readFromStorage<any[]>(STORAGE_KEYS.COURSE_DB_OFFLINE, [] as any[]);
                const dbData = courseDb && courseDb.length > 0 ? courseDb : (courseDbJson as any[]);

                const userWants = selectedCourses.map(c => c.code);

                const results = runScheduleSolver(dbData, userWants, selectedClassMap, {
                    daysOff: prefs.daysOff || [],
                    session: prefs.session || '0',
                    strategy: prefs.strategy || 'compress',
                    noGaps: prefs.noGaps ?? false,
                });

                if (!results || results.length === 0) {
                    setError('Không tìm được phương án xếp lịch phù hợp. Thử chọn ít môn hơn hoặc kiểm tra lại dữ liệu lớp học.');
                    setOptions([]);
                    setSolving(false);
                    return;
                }

                // Convert từ kết quả solver sang ClassSection[]
                const mapped: ScheduleOption[] = results.map((res: any) => {
                    const sections: ClassSection[] = [];

                    res.schedule.forEach((item: any, courseIdx: number) => {
                        const color = PALETTE[courseIdx % PALETTE.length];
                        const course = selectedCourses.find(c => c.code === item.subjectID);
                        const name = course?.nameVi || item.subjectID;

                        // Ưu tiên dùng mask (đã được solve() gắn vào từ CourseDatabase)
                        if (item.mask && Array.isArray(item.mask)) {
                            const newSections = maskToSections(
                                item.mask,
                                item.subjectID,
                                name,
                                item.classID,
                                color,
                                course?.credits || 0
                            );
                            sections.push(...newSections);
                        }
                    });

                    return {
                        option: res.option,
                        fitness: res.fitness,
                        classSections: sections,
                    };
                });

                setOptions(mapped);
                setActiveOption(0);
            } catch (e: any) {
                console.error('[useScheduleSolver] Error:', e);
                setError(`Lỗi xếp lịch: ${e?.message || String(e)}`);
                setOptions([]);
            } finally {
                setSolving(false);
            }
        }, 50);
    }, []);

    const currentSections = options[activeOption]?.classSections || [];

    return {
        solve,
        solving,
        options,
        activeOption,
        setActiveOption,
        currentSections,
        error,
    };
}
