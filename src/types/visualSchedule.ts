export interface ScheduledClass {
    id: string;
    courseCode: string;
    courseName: string;
    day: string;
    startHour: number;
    duration: number;
    room: string;
    instructor: string;
    color: string;
    type: 'lecture' | 'lab';
}

export interface SuggestedClass {
    id: string;
    courseCode: string;
    courseName: string;
    day: string;
    startHour: number;
    duration: number;
    room: string;
    instructor: string;
    color: string;
    section: string;
}

export interface AvailableSubject {
    code: string;
    name: string;
    color: string;
    options: SuggestedClass[];
}
