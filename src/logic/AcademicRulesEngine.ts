import { ACADEMIC_RULES } from '../config';
import { type StudentCourseGrade } from '../types';

// ─── Constants ───────────────────────────────────────────────────────

/** Mã môn Anh văn dùng cho kiểm tra miễn (BLM) */
const ENGLISH_COURSE_IDS = ['ADD00031', 'ADD00032', 'ADD00033', 'ADD00034'];

// ─── Types ───────────────────────────────────────────────────────────

/** Trạng thái chi tiết 4-state (dùng cho Training Program, UI hiển thị) */
export type CourseStatus4 = 'passed' | 'failed' | 'studying' | 'none';

/** Trạng thái 3-state (dùng cho GPA calculation nội bộ) */
export type CourseStatus3 = 'passed' | 'retake' | 'ongoing';

/**
 * Domain Logic Engine cho các quy tắc học vụ
 * Chịu trách nhiệm xử lý các logic nghiệp vụ lõi độc lập với React/UI.
 */
export const AcademicRulesEngine = {

    // ───────────── Tên & Trích xuất ─────────────

    /**
     * Làm sạch và trích xuất tên môn học tiếng Việt từ chuỗi đầu vào của hệ thống cũ
     */
    extractVietnameseCourseName: (rawName: string): string => {
        if (!rawName) return "Không rõ";

        const codeMatch = rawName.match(/\[(.*?)\]/);
        let nameVi = rawName;

        const prefixMatch = rawName.match(/^([a-zA-Z]{3,4}\d{3,5})\s*-\s*(.*)/);

        if (prefixMatch) {
            nameVi = prefixMatch[2].trim();
        } else if (rawName.includes(" - ") && rawName.match(/^[a-zA-Z0-9_\s]+ - /) && rawName.split(" - ")[0].length < 15 && /\d/.test(rawName.split(" - ")[0])) {
            const parts = rawName.split(" - ");
            nameVi = parts.slice(1).join(" - ").trim();
        } else if (codeMatch) {
            nameVi = rawName.replace(/\[.*?\]/g, '').trim();
        }

        return nameVi;
    },

    // ───────────── GPA Exclusion ─────────────

    /**
     * Xác định xem môn học có bị loại trừ khỏi GPA hay không (theo mã môn).
     */
    isCourseExcludedFromGPA: (courseCode: string): boolean => {
        return ACADEMIC_RULES.EXCLUDED_COURSE_PREFIXES.some(prefix =>
            courseCode.startsWith(prefix.id)
        );
    },

    /**
     * Xác định xem nhóm môn có bị loại trừ khỏi GPA hay không (theo tên nhóm).
     * Dùng cho CategoryNode khi check tên danh mục.
     */
    isCategoryExcludedFromGPA: (categoryName: string): boolean => {
        return ACADEMIC_RULES.EXCLUDED_COURSE_PREFIXES.some(prefix =>
            categoryName.startsWith(prefix.name)
        );
    },

    // ───────────── Điểm số ─────────────

    /**
     * Chuyển đổi điểm dạng chuỗi từ Portal thành số thập phân hợp lệ.
     * Trả về null nếu môn học chưa có điểm (đang học) hoặc là điểm chữ/kí hiệu đặc biệt.
     */
    parseRawScore: (rawScore: any): number | null => {
        if (rawScore === "" || rawScore === "(*)" || rawScore == null || rawScore === undefined) {
            return null;
        }

        const parsedScore = parseFloat(rawScore);
        if (isNaN(parsedScore)) {
            return null; // Letter grades or weird symbols
        }

        return parsedScore;
    },

    /**
     * Đánh giá trạng thái qua môn dựa trên điểm số (3-state, cho GPA calculation).
     */
    evaluateCourseStatus: (score: number | null): CourseStatus3 => {
        if (score === null) return 'ongoing';
        return score >= ACADEMIC_RULES.PASS_GRADE_DECIMAL ? 'passed' : 'retake';
    },

    // ───────────── BLM Exemption (Miễn Anh văn) ─────────────

    /** Danh sách mã môn Anh văn */
    ENGLISH_COURSE_IDS,

    /**
     * Kiểm tra sinh viên có được miễn Anh văn hay không.
     * Điều kiện miễn:
     *   1. BAA00100 với type = 'M'
     *   2. Bất kỳ môn ADD0003x nào có score = 'M'
     */
    checkBLMExemption: (grades: any[]): boolean => {
        if (!grades || grades.length === 0) return false;

        const hasExemptionByBAA00100 = grades.some(
            (g: any) => String(g.id).trim() === 'BAA00100' && String(g.type).trim() === 'M'
        );
        const hasExemptionByScore = grades.some(
            (g: any) => ENGLISH_COURSE_IDS.includes(String(g.id).trim()) && String(g.score).trim().toUpperCase() === 'M'
        );

        return hasExemptionByBAA00100 || hasExemptionByScore;
    },

    // ───────────── CT Grade Resolution (Điểm cải thiện) ─────────────

    /**
     * Từ mảng raw grades, trích xuất grade hiệu dụng cho mỗi môn.
     * Nếu có bản ghi CT (cải thiện) → dùng bản CT.
     * Nếu không → dùng bản ghi cuối cùng.
     */
    resolveEffectiveGrades: (rawGrades: any[]): any[] => {
        const gradesByCourse = new Map<string, any[]>();
        rawGrades.forEach((g: any) => {
            const code = String(g.id).trim();
            if (!gradesByCourse.has(code)) gradesByCourse.set(code, []);
            gradesByCourse.get(code)!.push(g);
        });

        const effectiveGrades: any[] = [];
        gradesByCourse.forEach((records) => {
            const ctRecord = records.find((r: any) => String(r.type).trim() === 'CT');
            effectiveGrades.push(ctRecord || records[records.length - 1]);
        });

        return effectiveGrades;
    },

    // ───────────── Course Status (Thống nhất) ─────────────

    /**
     * Xác định trạng thái 4-state của 1 môn, tổng hợp tất cả grade records.
     * Có xét BLM exemption + CT resolution.
     *
     * Trả về: 'passed' | 'failed' | 'studying' | 'none'
     */
    getCourseStatus: (
        courseId: string,
        grades: any[],
        hasBLMExemption: boolean
    ): CourseStatus4 => {
        // BLM exemption: English courses are auto-passed
        if (hasBLMExemption && ENGLISH_COURSE_IDS.includes(courseId)) {
            return 'passed';
        }

        if (!grades || grades.length === 0) return 'none';

        const gradeRecords = grades.filter((g: any) => String(g.id).trim() === courseId);
        if (gradeRecords.length === 0) return 'none';

        // CT (improvement) record takes priority
        const ctRecord = gradeRecords.find((g: any) => String(g.type).trim() === 'CT');
        const recordToCheck = ctRecord || gradeRecords[gradeRecords.length - 1];

        const score = AcademicRulesEngine.parseRawScore(recordToCheck.score);

        if (score !== null && score >= ACADEMIC_RULES.PASS_GRADE_DECIMAL) {
            return 'passed';
        }

        // Empty score → currently studying
        if (recordToCheck.score === '' || recordToCheck.score === null || recordToCheck.score === undefined) {
            return 'studying';
        }

        // Has a numeric score but didn't pass
        if (score !== null && score < ACADEMIC_RULES.PASS_GRADE_DECIMAL) {
            return 'failed';
        }

        return 'none';
    },

    // ───────────── GPA Accumulation ─────────────

    /**
     * Tính toán tổng điểm và số tín chỉ được tích lũy cho việc xét GPA
     */
    calculateAccumulationParams: (
        code: string,
        credits: number,
        score: number,
        status: CourseStatus3
    ): { pointsForGPA: number, creditsForGPA: number, earnedCredits: number } => {
        let pointsForGPA = 0;
        let creditsForGPA = 0;
        let earnedCredits = 0;

        const isExcluded = AcademicRulesEngine.isCourseExcludedFromGPA(code);

        if (status === 'passed') {
            if (!isExcluded) {
                earnedCredits = credits;
                pointsForGPA = score * credits;
                creditsForGPA = credits;
            }
        }
        // Môn rớt (retake, dưới 5 điểm) không tính vào GPA

        return { pointsForGPA, creditsForGPA, earnedCredits };
    },

    // ───────────── GPA Summary (từ useStudentGradeData.ts) ─────────────

    /**
     * Tính toán tổng hợp GPA từ effective grades.
     * Trả về: gradesHistory, currentGPA, accumulatedCredits, gpaPerSemester, majorGPA.
     * Trích xuất từ useStudentGradeData.ts L44-141.
     */
    calculateGPASummary: (
        rawGrades: any[],
        effectiveGrades: any[],
        hasBLMExemption: boolean,
        allCoursesMeta: any[] = []
    ): {
        gradesHistory: StudentCourseGrade[];
        currentGPA: number;
        accumulatedCredits: number;
        gpaPerSemester: { semester: string; gpa: number; credits: number; earnedCredits: number }[];
        foundationGPA: number;
        majorSpecializedGPA: number;
        majorGPA: number;
    } => {
        const gradesHistory: StudentCourseGrade[] = [];
        let accumulatedCredits = 0;
        let totalPoints = 0;
        let totalCreditsForGPA = 0;

        const semesterMap = new Map<string, { points: number; credits: number; earnedCredits: number }>();

        let majorSpecializedPoints = 0;
        let majorSpecializedCredits = 0;
        
        let foundationPoints = 0;
        let foundationCredits = 0;

        effectiveGrades.forEach((g: any, index: number) => {
            const code = String(g.id).trim();
            const nameVi = AcademicRulesEngine.extractVietnameseCourseName(g.name);
            const credits = parseInt(g.credits) || 0;

            const isExemptedEnglish = hasBLMExemption && ENGLISH_COURSE_IDS.includes(code);
            const score: number | null = isExemptedEnglish ? 10 : AcademicRulesEngine.parseRawScore(g.score);
            const status = isExemptedEnglish ? 'passed' as const : AcademicRulesEngine.evaluateCourseStatus(score);
            const needsRetake = status === 'retake';

            const hasValidScore = typeof score === 'number' && !isNaN(score);
            let pointsForGPA = 0, creditsForGPA = 0, earnedCredits = 0;

            if (hasValidScore) {
                const result = AcademicRulesEngine.calculateAccumulationParams(code, credits, score, status);
                pointsForGPA = result.pointsForGPA;
                creditsForGPA = result.creditsForGPA;
                earnedCredits = result.earnedCredits;
                accumulatedCredits += earnedCredits;
                totalPoints += pointsForGPA;
                totalCreditsForGPA += creditsForGPA;

                // Tích lũy điểm Cơ sở + Chuyên ngành: Ký tự thứ 4 (index 3) là số '1'
                const isMajorSpecialized = code.length >= 4 && code[3] === '1';
                if (isMajorSpecialized && creditsForGPA > 0) {
                    majorSpecializedPoints += pointsForGPA;
                    majorSpecializedCredits += creditsForGPA;
                }

                // Tích lũy điểm Cơ sở ngành: Theo category 'FOUNDATION'
                const courseMeta = allCoursesMeta.find(c => c.course_id === code);
                const isFoundation = courseMeta?.category === 'FOUNDATION';
                if (isFoundation && creditsForGPA > 0) {
                    foundationPoints += pointsForGPA;
                    foundationCredits += creditsForGPA;
                }
            }

            gradesHistory.push({
                id: index.toString(),
                code,
                nameVi,
                credits,
                grade: score ?? 0,
                semester: g.semester || 'Không rõ',
                needsRetake,
                status,
            });
        });

        // ── Tính GPA từng kỳ dựa trên dữ liệu gốc (không lấy điểm cải thiện) ──
        rawGrades.forEach((g: any) => {
            const type = String(g.type).trim();
            // Không tính môn học cải thiện (CT) trong GPA của kỳ hiện tại
            if (type === 'CT') return;

            const code = String(g.id).trim();
            const credits = parseInt(g.credits) || 0;
            const isExemptedEnglish = hasBLMExemption && ENGLISH_COURSE_IDS.includes(code);
            const score: number | null = isExemptedEnglish ? 10 : AcademicRulesEngine.parseRawScore(g.score);
            const status = isExemptedEnglish ? 'passed' as const : AcademicRulesEngine.evaluateCourseStatus(score);

            const hasValidScore = typeof score === 'number' && !isNaN(score);
            if (hasValidScore) {
                const result = AcademicRulesEngine.calculateAccumulationParams(code, credits, score, status);

                // Môn rớt sẽ có creditsForGPA = 0, nên cũng sẽ không được tính vào
                if (result.creditsForGPA > 0) {
                    const sem = g.semester || 'Không rõ';
                    if (!semesterMap.has(sem)) {
                        semesterMap.set(sem, { points: 0, credits: 0, earnedCredits: 0 });
                    }
                    const s = semesterMap.get(sem)!;
                    s.points += result.pointsForGPA;
                    s.credits += result.creditsForGPA;
                    s.earnedCredits += result.earnedCredits;
                }
            }
        });

        const gpaPerSemester = Array.from(semesterMap.entries())
            .map(([semester, data]) => ({
                semester,
                gpa: data.credits > 0 ? data.points / data.credits : 0,
                credits: data.credits,
                earnedCredits: data.earnedCredits,
            }))
            .sort((a, b) => a.semester.localeCompare(b.semester));

        const currentGPA = totalCreditsForGPA > 0 ? (totalPoints / totalCreditsForGPA) : 0;
        const majorSpecializedGPA = majorSpecializedCredits > 0 ? majorSpecializedPoints / majorSpecializedCredits : 0;
        const foundationGPA = foundationCredits > 0 ? foundationPoints / foundationCredits : 0;

        return { 
            gradesHistory, 
            currentGPA, 
            accumulatedCredits, 
            gpaPerSemester, 
            foundationGPA,
            majorSpecializedGPA,
            majorGPA: foundationGPA // We'll use foundation as the primary majorGPA now
        };
    },

    /**
     * Tạo danh sách "ghost courses" cho các môn Anh văn được miễn (BLM)
     * mà sinh viên chưa có trong bảng điểm.
     * Trích xuất từ useStudentGradeData.ts L144-160.
     */
    buildExemptedGhostCourses: (
        effectiveGrades: any[],
        hasBLMExemption: boolean
    ): StudentCourseGrade[] => {
        if (!hasBLMExemption) return [];

        const ghostCourses: StudentCourseGrade[] = [];
        ENGLISH_COURSE_IDS.forEach(engId => {
            if (!effectiveGrades.some((g: any) => String(g.id).trim() === engId)) {
                ghostCourses.push({
                    id: `exempted-${engId}`,
                    code: engId,
                    nameVi: `Anh văn (miễn)`,
                    credits: 0,
                    grade: 10,
                    semester: 'Miễn',
                    needsRetake: false,
                    status: 'passed',
                });
            }
        });
        return ghostCourses;
    }
};

