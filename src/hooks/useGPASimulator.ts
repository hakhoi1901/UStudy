import { useState, useMemo, useCallback } from 'react';
import { readFromStorage } from '../helpers/localStorage/save';
import { STORAGE_KEYS } from '../config';
import { GPACalculator } from '../logic/GPACalculator';
import { AcademicRulesEngine } from '../logic/AcademicRulesEngine';
import type { StudentCourseGrade, SimulatorCourseGrade } from '../types';

/**
 * [TN] Hook quản lý GPA Simulator — Học kỳ tiếp theo.
 * Tự động thu thập:
 *   1. Môn đang học (status = 'ongoing') từ gradesHistory
 *   2. Môn đã đăng ký học phần (ĐKHP, courseType = 'LT') từ studentDb
 * Deduplicate: nếu trùng mã → ưu tiên 'ongoing', bỏ bản ĐKHP.
 * Cho phép nhập điểm dự đoán, lưu ngay vào localStorage.
 */
export function useGPASimulator(
    gradesHistory: StudentCourseGrade[],
    allCoursesMeta: any[]   // từ DepartmentContext.data.courses
) {

    // [TN] Tìm tín chỉ: grades → CTĐT → null
    // Ưu tiên cao → thấp:
    //   1. grades (Bookmarklet)
    //   2. CTĐT (data.courses)
    //   3. null — không tìm thấy ở đâu cả → "—"
    const creditsMap = useMemo(() => {
        const map = new Map<string, number>();
        // Nguồn 2 (thấp hơn) — CTĐT
        for (const c of allCoursesMeta) {
            if (c.course_id && c.credits) map.set(c.course_id, c.credits);
        }
        // Nguồn 1 (cao hơn) — grades, ghi đè CTĐT nếu trùng
        for (const g of gradesHistory) {
            if (g.code && g.credits) map.set(g.code, g.credits);
        }
        return map;
    }, [allCoursesMeta, gradesHistory]);

    // [TN] Điểm dự đoán { [courseCode]: grade }
    // Khởi tạo bằng cách đọc từ localStorage → restore điểm đã nhập lần trước
    const [projectedGrades, setProjectedGrades] = useState<Record<string, number>>(
        () => readFromStorage<Record<string, number>>(STORAGE_KEYS.PROJECTED_GRADES, {})
    );

    // [TN] Danh sách môn trong simulator
    const simulatorCourses = useMemo((): SimulatorCourseGrade[] => {

        // [TN] NGUỒN 1: Môn đang học (chưa có điểm)
        // Điều kiện: status === 'ongoing'
        // Nguyên nhân ongoing: AcademicRulesEngine.parseRawScore trả về null
        //                      khi score = '(*)', '', hoặc undefined
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

        // [TN] NGUỒN 2: Kết quả đăng ký học phần (ĐKHP)
        const studentDb = readFromStorage<any>(STORAGE_KEYS.STUDENT_DB, null);
        const registrations: any[] = studentDb?.registrations ?? [];

        // Set mã môn đã có trong ongoing → dùng để lọc trùng
        const ongoingIds = new Set(ongoingCourses.map(c => c.code));

        const seenReg = new Set<string>(); // deduplicate trong ĐKHP
        const regCourses: SimulatorCourseGrade[] = [];

        for (const reg of registrations) {
            const id = String(reg.id ?? '').trim();

            if (!id) continue;                     // bỏ row không có mã
            if (reg.courseType !== 'LT') continue;   // chỉ lấy Lý Thuyết, bỏ TH/BT
            if (ongoingIds.has(id)) continue;        // bỏ nếu đã có trong ongoing (deduplicate)
            if (seenReg.has(id)) continue;           // deduplicate trong ĐKHP
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
    }, [gradesHistory, projectedGrades, creditsMap]);

    // [TN] Handler: user nhập điểm
    // Nhận number | null. null = user xóa trắng input → xóa khỏi storage.
    // const handleGradeChange = useCallback((courseCode: string, grade: number) => {
    const handleGradeChange = useCallback((courseCode: string, grade: number | null) => {
        setProjectedGrades(prev => {
            const updated = { ...prev };
            if (grade === null) {
                delete updated[courseCode]; // xóa khỏi storage
            } else {
                updated[courseCode] = grade;
            }
            // Lưu ngay vào localStorage để persist qua reload trang
            localStorage.setItem(
                STORAGE_KEYS.PROJECTED_GRADES,
                JSON.stringify(updated)
            );
            return updated;
        });
    }, []);

    // [TN] Tách GPA thành kỳ + tổng. 
    // Chỉ lấy môn đã nhập điểm VÀ có TC (loại null)
    const filledCourses = simulatorCourses.filter(
        c => c.projectedGrade !== null && c.credits !== null
    );

    // GPA kỳ mô phỏng 
    const semesterGPA = useMemo(() => {
        const totalCredits = filledCourses.reduce((sum, c) => sum + c.credits!, 0);
        const totalPoints = filledCourses.reduce(
            (sum, c) => sum + (c.projectedGrade! * c.credits!), 0
        );
        return totalCredits > 0 ? totalPoints / totalCredits : 0;
    }, [filledCourses]);

    // GPA tổng = lịch sử + kỳ mô phỏng
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
