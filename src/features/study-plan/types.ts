import type { DragEvent } from 'react';

export type CourseStatus = 'passed' | 'studying' | 'failed' | 'none';
export type MobilePlannerTab = 'courses' | 'semesters';
export type MobileSheetStep = 'details' | 'semesters';

export interface CourseMeta {
    course_id: string;
    course_name_vi: string;
    credits: number;
    theory_hours: number;
    lab_hours: number;
    exercise_hours: number;
    course_type: string;
    category: string;
    description: string;
    status?: CourseStatus;
}

export interface StudyPlanSemester {
    id: string;
    label: string;
    isHistorical?: boolean;
}

export interface StudyPlanStorage {
    semesters: StudyPlanSemester[];
    plan: Record<string, string[]>;
}

export interface PrerequisiteRule {
    course_id: string;
    prereq_id: string;
    type: string;
}

export interface GradeRecord {
    id: string;
    semester?: string;
    score?: string | number | null;
    type?: string;
}

export interface ParsedSemester {
    yearStart: number;
    semester: number;
}

export type CourseDragStartHandler = (courseId: string, event: DragEvent<HTMLDivElement>) => void;
export type MobilePlannerOpenHandler = (course: CourseMeta, rootCompleted?: boolean) => boolean;
