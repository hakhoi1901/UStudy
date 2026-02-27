import { ACADEMIC_RULES } from '../config';

/**
 * Domain Logic Engine cho các quy tắc học vụ
 * Chịu trách nhiệm xử lý các logic nghiệp vụ lõi độc lập với React/UI.
 */
export const AcademicRulesEngine = {
    /**
     * Làm sạch và trích xuất tên môn học tiếng Việt từ chuỗi đầu vào của hệ thống cũ
     */
    extractVietnameseCourseName: (rawName: string): string => {
        if (!rawName) return "Không rõ";

        const codeMatch = rawName.match(/\[(.*?)\]/);
        let nameVi = rawName;

        if (rawName.includes(" - ")) {
            const parts = rawName.split(" - ");
            nameVi = parts.slice(1).join(" - ").trim();
        } else if (codeMatch) {
            nameVi = rawName.replace(/\[.*?\]/g, '').trim();
        }

        return nameVi;
    },

    /**
     * Xác định xem môn học có bị loại trừ khỏi điểm trung bình (GPA) hay không
     */
    isCourseExcludedFromGPA: (courseCode: string): boolean => {
        return ACADEMIC_RULES.EXCLUDED_COURSE_PREFIXES.some(prefix =>
            courseCode.startsWith(prefix.id)
        );
    },

    /**
     * Chuyển đổi điểm dạng chuỗi từ Portal thành số thập phân hợp lệ
     * Trả về null nếu môn học chưa có điểm (đang học) hoặc là điểm chữ/kí hiệu đặc biệt
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
     * Đánh giá trạng thái qua môn dựa trên điểm số
     */
    evaluateCourseStatus: (score: number | null): 'passed' | 'retake' | 'ongoing' => {
        if (score === null) return 'ongoing';
        return score >= ACADEMIC_RULES.PASS_GRADE_DECIMAL ? 'passed' : 'retake';
    },

    /**
     * Tính toán tổng điểm và số tín chỉ được tích lũy cho việc xét GPA
     */
    calculateAccumulationParams: (
        code: string,
        credits: number,
        score: number,
        status: 'passed' | 'retake' | 'ongoing'
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
        } else if (status === 'retake') {
            if (!isExcluded) {
                pointsForGPA = score * credits;
                creditsForGPA = credits;
            }
        }

        return { pointsForGPA, creditsForGPA, earnedCredits };
    }
};
