export type AcademicTerm = 'semester-1' | 'semester-2' | 'summer';

export type AcademicCalendarActivityType =
    | 'academic-week'
    | 'semester-start'
    | 'course-registration'
    | 'registration-adjustment'
    | 'midterm-exam'
    | 'final-exam'
    | 'reserve-week'
    | 'holiday'
    | 'orientation'
    | 'placement-test'
    | 'defense-education'
    | 'other';

export type AcademicCalendarEventType = 'graduation' | 'holiday' | 'notice' | 'other';

export interface AcademicCalendarActivity {
    type: AcademicCalendarActivityType;
    label: string;
    term?: AcademicTerm;
}

export interface AcademicCalendarCohortPlan {
    teachingWeek?: number;
    /** Một tuần có thể là tuần chuyển tiếp, ví dụ vừa thi HK2 vừa đăng ký HK Hè. */
    terms: AcademicTerm[];
    activities: AcademicCalendarActivity[];
}

export interface AcademicCalendarEvent {
    type: AcademicCalendarEventType;
    label: string;
}

export interface AcademicCalendarWeek {
    index: number;
    startDate: string;
    endDate: string;
    cohorts: Record<string, AcademicCalendarCohortPlan>;
    institutionEvents: AcademicCalendarEvent[];
}

export interface AcademicCalendar {
    id: string;
    academicYear: string;
    title: string;
    issuer: string;
    educationLevel: string;
    documentReference: string;
    issuedAt: string;
    sourceFile: string;
    cohorts: Array<{
        id: string;
        label: string;
        /** Khóa tuyển được UStudy lưu trong hồ sơ người dùng. */
        appCohortIds: string[];
    }>;
    weeks: AcademicCalendarWeek[];
    notes: string[];
}
