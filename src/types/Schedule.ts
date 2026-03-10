export interface ScheduleSession {
    id: string;
    courseCode: string;
    courseName: string;
    classCode: string;
    credits: number;
    type: 'LT' | 'TH' | 'BT'; // Lý thuyết, Thực hành, Bài tập
    instructor: string;
    room: string;
    dayOfWeek: 2 | 3 | 4 | 5 | 6 | 7; // 2=T2, 7=T7
    startPeriod: number;
    endPeriod: number; // Có thể là số thập phân cho TH: 3.5, 5.5, 8.5, 10.5
    startTime: string;
    endTime: string;
    color: 'blue' | 'green' | 'yellow' | 'purple';
    session: 'morning' | 'afternoon';
    duration: number; // Số tiết: 2, 2.5, etc.
    totalWeeks: number;
    startDate: string;
    endDate: string;
    startDateParsed?: Date;
    endDateParsed?: Date;
}

export interface WeeklySchedule {
    semester: string;
    semesterName: string;
    weekNumber: number;
    weekRange: string;
    totalCourses: number;
    totalCredits: number;
    totalPeriodsPerWeek: number;
    totalHoursPerWeek: number;
    sessions: ScheduleSession[];
    semesterStartDate?: Date;
}


export interface Day {
    value: 2 | 3 | 4 | 5 | 6 | 7;
    label: string;
    short: string;
}

// ==================== CONSTANTS ====================

export const DAYS: Day[] = [
    { value: 2, label: 'Thứ 2', short: 'T2' },
    { value: 3, label: 'Thứ 3', short: 'T3' },
    { value: 4, label: 'Thứ 4', short: 'T4' },
    { value: 5, label: 'Thứ 5', short: 'T5' },
    { value: 6, label: 'Thứ 6', short: 'T6' },
    { value: 7, label: 'Thứ 7', short: 'T7' },
];