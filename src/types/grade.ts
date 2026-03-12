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
