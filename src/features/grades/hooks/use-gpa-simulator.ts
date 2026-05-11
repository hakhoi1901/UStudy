import { useState, useMemo, useCallback, useEffect } from 'react';
import { readPlain, savePlain, readFromStorage } from '../../../helpers/localStorage/save';
import { STORAGE_KEYS } from '../../../config';
import { GPACalculator } from '../services/gpa-calculator';
import { AcademicRulesEngine } from '../services/academic-rules-engine';
import type { StudentCourseGrade, SimulatorCourseGrade } from '../types';

/**
 * Hook quản lý GPA Simulator - Học kỳ tiếp theo.
 * Tự động thu thập:
 *   1. Môn đang học (status = 'ongoing') từ gradesHistory
 *   2. Môn đã đăng ký học phần (ĐKHP, courseType = 'LT') từ studentDb
 */
export function useGPASimulator(
    gradesHistory: StudentCourseGrade[],
    allCoursesMeta: any[]   // từ DepartmentContext.data.courses
) {
    /**
     * Tạo map { courseCode: credits } từ 2 nguồn:
     * - Ưu tiên 1: gradesHistory (dữ liệu đã import)
     * - Ưu tiên 2: allCoursesMeta (CTĐT)
     */
    const creditsMap = useMemo(() => {
        const map = new Map<string, number>();
        // Nguồn 2 (thấp hơn) - CTĐT
        for (const c of allCoursesMeta) {
            if (c.course_id && c.credits) map.set(c.course_id, c.credits);
        }
        // Nguồn 1 (cao hơn) - grades, ghi đè CTĐT nếu trùng
        for (const g of gradesHistory) {
            if (g.code && g.credits) map.set(g.code, g.credits);
        }
        return map;
    }, [allCoursesMeta, gradesHistory]);

    /**
     * Stamp để trigger re-memo khi có dữ liệu mới
     */
    const [stamp, setStamp] = useState(0);

    /**
     * Lắng nghe message từ iframe: IMPORT_FULL_DATA / CACHE_POPULATED để update stamp
     */
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data && (
                event.data.type === 'IMPORT_FULL_DATA' ||
                event.data.type === 'CACHE_POPULATED'
            )) {
                setStamp(Date.now());
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    /**
     * Lời tiên đoán điểm (projected grades)
     */
    const [projectedGrades, setProjectedGrades] = useState<Record<string, number>>(
        () => readPlain<Record<string, number>>(STORAGE_KEYS.PROJECTED_GRADES, {})
    );

    /**
     * Danh sách môn học mô phỏng, gộp:
     * - Môn đang học (status = 'ongoing') từ gradesHistory
     * - Môn đã đăng ký (courseType = 'LT') từ studentDb
     */
    const simulatorCourses = useMemo((): SimulatorCourseGrade[] => {
        const ongoingCourses: SimulatorCourseGrade[] = gradesHistory
            .filter(g => g.code !== 'BAA00100')
            .filter(g => g.status === 'ongoing')
            .map(g => ({
                id: g.code,
                code: g.code,
                name: g.nameVi,
                credits: g.credits,
                currentGrade: null,
                projectedGrade: projectedGrades[g.code] ?? null,
                source: 'ongoing' as const,
            }));

        const studentDb = readFromStorage<any>(STORAGE_KEYS.STUDENT_DB, null);
        const registrations: any[] = studentDb?.registrations ?? [];
        void stamp; // trigger re-memo khi stamp thay đổi

        const ongoingIds = new Set(ongoingCourses.map(c => c.code));
        const seenReg = new Set<string>();
        const regCourses: SimulatorCourseGrade[] = [];

        for (const reg of registrations) {
            const id = String(reg.id ?? '').trim();
            if (!id) continue;
            if (reg.courseType !== 'LT') continue;
            if (ongoingIds.has(id)) continue;
            if (seenReg.has(id)) continue;
            seenReg.add(id);

            regCourses.push({
                id,
                code: id,
                name: AcademicRulesEngine.extractVietnameseCourseName(reg.name ?? id),
                credits: creditsMap.get(id) ?? null,
                currentGrade: null,
                projectedGrade: projectedGrades[id] ?? null,
                source: 'registration' as const,
            });
        }

        return [...ongoingCourses, ...regCourses];
    }, [gradesHistory, projectedGrades, creditsMap, stamp]);

    const handleGradeChange = useCallback((courseCode: string, grade: number | null) => {
        setProjectedGrades(prev => {
            const updated = { ...prev };
            if (grade === null) {
                delete updated[courseCode];
            } else {
                updated[courseCode] = grade;
            }
            savePlain(STORAGE_KEYS.PROJECTED_GRADES, updated);
            return updated;
        });
    }, []);

    const filledCourses = simulatorCourses.filter(
        c => c.projectedGrade !== null && c.credits !== null
    );

    const semesterGPA = useMemo(() => {
        const totalCredits = filledCourses.reduce((sum, c) => sum + c.credits!, 0);
        const totalPoints = filledCourses.reduce(
            (sum, c) => sum + (c.projectedGrade! * c.credits!), 0
        );
        return totalCredits > 0 ? totalPoints / totalCredits : 0;
    }, [filledCourses]);

    const cumulativeGPA = useMemo(
        () => GPACalculator.calculateProjectedGPA(
            gradesHistory,
            filledCourses.map(c => ({
                code: c.code,
                credits: c.credits!,
                projectedGrade: c.projectedGrade!
            }))
        ),
        [gradesHistory, filledCourses]
    );

    const totalSimCredits = simulatorCourses.reduce((sum, c) => sum + (c.credits ?? 0), 0);

    return { simulatorCourses, handleGradeChange, semesterGPA, cumulativeGPA, totalSimCredits };
}
