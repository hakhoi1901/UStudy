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

export interface RegisteredCourse {
  courseCode: string; // mã môn học
  courseNameVi: string; // tên môn học tiếng việt
  credits: number; // số tín chỉ
  confirmedSection?: string; // mã lớp học đã xác nhận
  availableSections: ClassSection[]; // danh sách các lớp học
}

// Time periods (Tiết 1-10) - HCMUS Standard
export const timePeriods = [
  { period: 1, time: '07:30 - 08:20', label: 'Sáng' },
  { period: 2, time: '08:20 - 09:10', label: 'Sáng' },
  { period: 3, time: '09:10 - 10:00', label: 'Sáng' },
  { period: 4, time: '10:10 - 11:00', label: 'Sáng' },
  { period: 5, time: '11:00 - 11:50', label: 'Sáng' },
  { period: 6, time: '12:40 - 13:30', label: 'Chiều' },
  { period: 7, time: '13:30 - 14:20', label: 'Chiều' },
  { period: 8, time: '14:20 - 15:10', label: 'Chiều' },
  { period: 9, time: '15:20 - 16:10', label: 'Chiều' },
  { period: 10, time: '16:10 - 17:00', label: 'Chiều' },
];

export const weekDays = [
  { day: 2, nameVi: 'Thứ Hai', short: 'T2' },
  { day: 3, nameVi: 'Thứ Ba', short: 'T3' },
  { day: 4, nameVi: 'Thứ Tư', short: 'T4' },
  { day: 5, nameVi: 'Thứ Năm', short: 'T5' },
  { day: 6, nameVi: 'Thứ Sáu', short: 'T6' },
  { day: 7, nameVi: 'Thứ Bảy', short: 'T7' },
];