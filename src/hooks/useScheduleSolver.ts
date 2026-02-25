/**
 * useScheduleSolver.ts
 * Hook chạy thuật toán di truyền xếp TKB và trả về danh sách ClassSection để render luới lịch
 */
import { useState, useCallback } from 'react';
import { readFromStorage } from '../helpers/localStorage/save';
import { runScheduleSolver } from '../logic/tkb/Scheduler';
import { Bitset } from '../logic/tkb/Bitset';
import type { ClassSection } from '../data/timetableData';
import type { Course } from '../data/courseData';

// Tải dữ liệu DB tĩnh (fallback khi chưa có course_db_offline)
import courseDbJson from '../logic/tkb/Course_db.json';

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

const PALETTE = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316', '#14B8A6'];

/**
 * Giải mã Bitset mask [u32, u32, u32, u32] thành danh sách ClassSection.
 * Encoding: bit = day*10 + (period-1), day: 0=T2...5=T7
 */
function maskToSections(
    maskArr: number[],
    courseCode: string,
    courseName: string,
    classId: string,
    color: string,
    credits: number
): ClassSection[] {
    const sections: ClassSection[] = [];
    const bs = new Bitset();
    bs.loadFromData(maskArr);

    for (let d = 0; d < 6; d++) { // T2..T7
        let runStart = -1;
        let runEnd = -1;

        for (let p = 0; p < 10; p++) {
            const bit = d * 10 + p;
            const active = bs.test(bit);

            if (active) {
                if (runStart === -1) runStart = p;
                runEnd = p;
            } else {
                // Kết thúc một đoạn liên tục
                if (runStart !== -1) {
                    sections.push({
                        id: `${courseCode}-${classId}-d${d}-p${runStart}`,
                        courseCode,
                        courseName,
                        courseNameVi: courseName,
                        sectionNumber: classId,
                        lecturer: 'Chưa cập nhật',
                        room: '---',
                        day: d + 2,         // d+2: 0→T2, 1→T3, ...5→T7
                        startPeriod: runStart + 1,  // 0-indexed → 1-indexed (P1..P10)
                        endPeriod: runEnd + 1,
                        color,
                        isConfirmed: true,
                        credits,
                    });
                    runStart = -1;
                    runEnd = -1;
                }
            }
        }

        // Flush nếu đoạn chạy tới hết ngày
        if (runStart !== -1) {
            sections.push({
                id: `${courseCode}-${classId}-d${d}-p${runStart}`,
                courseCode,
                courseName,
                courseNameVi: courseName,
                sectionNumber: classId,
                lecturer: 'Chưa cập nhật',
                room: '---',
                day: d + 2,
                startPeriod: runStart + 1,
                endPeriod: runEnd + 1,
                color,
                isConfirmed: true,
                credits,
            });
        }
    }

    return sections;
}

export function useScheduleSolver() {
    const [solving, setSolving] = useState(false);
    const [options, setOptions] = useState<ScheduleOption[]>([]);
    const [activeOption, setActiveOption] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const solve = useCallback((selectedCourses: Course[], prefs: SolverPreferences = {}) => {
        setSolving(true);
        setError(null);

        // Dùng setTimeout để cho React render trạng thái loading trước khi chạy thuật toán nặng
        setTimeout(() => {
            try {
                // Đọc dữ liệu từ localStorage (từ Bookmarklet), nếu không có thì dùng file tĩnh
                const courseDb = readFromStorage<any[]>('course_db_offline', [] as any[]);
                const dbData = courseDb && courseDb.length > 0 ? courseDb : (courseDbJson as any[]);

                const userWants = selectedCourses.map(c => c.code);

                const results = runScheduleSolver(dbData, userWants, {}, {
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
