export interface StudentCourseGrade {
    id: string;
    code: string;
    nameVi: string;
    credits: number;
    grade: number;
    semester: string;
    needsRetake: boolean;
    status: 'passed' | 'retake' | 'ongoing';
}

export interface SimulatorCourseGrade {
    id: string;
    code: string;
    name: string;
    credits: number | null;
    currentGrade: number | null;
    projectedGrade: number | null;
    // [TN] source: 'ongoing' | 'registration' - để phân biệt môn đang học và môn đã đăng ký
    source: 'ongoing' | 'registration';
}

/** Môn trong kỳ (dùng trong Công cụ Kéo GPA) */
export interface GPAPullCourse {
    code: string;
    name: string;
    credits: number;
    /** Điểm thật đã có (từ grades/portal) → khóa, read-only */
    lockedGrade: number | null;
    /** Điểm user nhập (dự kiến); dùng trong redistribution khi !== null */
    projectedGrade: number | null;
    /** Điểm đề xuất bởi hệ thống (tính từ requiredAverage và redistribution) */
    suggestedGrade: number | null;
    /** Đã khóa (có lockedGrade từ DB) → không cho sửa */
    isLocked: boolean;
    source: 'ongoing' | 'registration' | 'future';
}

/** Một học kỳ trong Công cụ Kéo GPA */
export interface GPAPullSemester {
    id: string;
    label: string;
    courses: GPAPullCourse[];
    requiredGPA: number;
    totalCredits: number;
    /** Tổng điểm cần đạt kỳ này = requiredGPA * totalCredits */
    pointsNeeded: number;
}
