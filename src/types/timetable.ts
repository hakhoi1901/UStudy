export interface ClassSection {
    id: string; // mã lớp học
    courseCode: string; // mã môn học
    courseName: string; // tên môn học
    courseNameVi: string; // tên môn học tiếng việt
    sectionNumber: string; // mã lớp học
    lecturer: string; // giảng viên
    room: string; // phòng học
    day: number; // 2-8 (Mon-Sun)
    startPeriod: number; // 1-12
    endPeriod: number; // 1-12
    color: string; // màu sắc
    isConfirmed: boolean; // đã xác nhận
    credits: number; // số tín chỉ
}

export interface TimetableRegisteredCourse {
    courseCode: string; // mã môn học
    courseNameVi: string; // tên môn học tiếng việt
    credits: number; // số tín chỉ
    confirmedSection?: string; // mã lớp học đã xác nhận
    availableSections: ClassSection[]; // danh sách các lớp học
}
