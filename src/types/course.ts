export interface Course {
    id: string;
    code: string;
    name: string;
    nameVi: string;
    credits: number;
    prerequisites: string[];
    isAvailable: boolean;
    needsRetake?: boolean;
    description: string;
    descriptionVi: string;
    instructor?: string;
    price?: number;
    category?: string;
    projectedGrade?: number;
    theory_hours?: number;
    lab_hours?: number;
    exercise_hours?: number;
}
