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
    credits: number;
    currentGrade: number | null;
    projectedGrade: number;
}
