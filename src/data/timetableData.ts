export interface ClassSection {
  id: string;
  courseCode: string;
  courseName: string;
  courseNameVi: string;
  sectionNumber: string;
  lecturer: string;
  room: string;
  day: number; // 2-8 (Mon-Sun)
  startPeriod: number; // 1-12
  endPeriod: number; // 1-12
  color: string;
  isConfirmed: boolean;
  credits: number;
}

export interface RegisteredCourse {
  courseCode: string;
  courseNameVi: string;
  credits: number;
  confirmedSection?: string;
  availableSections: ClassSection[];
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

// Sample course data with multiple sections
export const registeredCourses: RegisteredCourse[] = [
  {
    courseCode: 'CSC10002',
    courseNameVi: 'Cấu trúc dữ liệu',
    credits: 4,
    confirmedSection: 'L01',
    availableSections: [
      {
        id: 'csc10002-l01',
        courseCode: 'CSC10002',
        courseName: 'Data Structures',
        courseNameVi: 'Cấu trúc dữ liệu',
        sectionNumber: 'L01',
        lecturer: 'TS. Trần Thị B',
        room: 'A201',
        day: 2,
        startPeriod: 1,
        endPeriod: 3,
        color: '#3B82F6',
        isConfirmed: true,
        credits: 4,
      },
      {
        id: 'csc10002-l02',
        courseCode: 'CSC10002',
        courseName: 'Data Structures',
        courseNameVi: 'Cấu trúc dữ liệu',
        sectionNumber: 'L02',
        lecturer: 'TS. Nguyễn Văn X',
        room: 'B105',
        day: 3,
        startPeriod: 4,
        endPeriod: 6,
        color: '#3B82F6',
        isConfirmed: false,
        credits: 4,
      },
      {
        id: 'csc10002-l03',
        courseCode: 'CSC10002',
        courseName: 'Data Structures',
        courseNameVi: 'Cấu trúc dữ liệu',
        sectionNumber: 'L03',
        lecturer: 'TS. Lê Thị Y',
        room: 'C302',
        day: 5,
        startPeriod: 7,
        endPeriod: 9,
        color: '#3B82F6',
        isConfirmed: false,
        credits: 4,
      },
    ],
  },
  {
    courseCode: 'CSC10003',
    courseNameVi: 'Phương pháp lập trình',
    credits: 4,
    confirmedSection: 'L01',
    availableSections: [
      {
        id: 'csc10003-l01',
        courseCode: 'CSC10003',
        courseName: 'Programming Methods',
        courseNameVi: 'Phương pháp lập trình',
        sectionNumber: 'L01',
        lecturer: 'TS. Lê Văn C',
        room: 'A305',
        day: 3,
        startPeriod: 1,
        endPeriod: 3,
        color: '#10B981',
        isConfirmed: true,
        credits: 4,
      },
      {
        id: 'csc10003-l02',
        courseCode: 'CSC10003',
        courseName: 'Programming Methods',
        courseNameVi: 'Phương pháp lập trình',
        sectionNumber: 'L02',
        lecturer: 'TS. Phạm Văn Z',
        room: 'B201',
        day: 4,
        startPeriod: 7,
        endPeriod: 9,
        color: '#10B981',
        isConfirmed: false,
        credits: 4,
      },
    ],
  },
  {
    courseCode: 'CSC10005',
    courseNameVi: 'Hệ điều hành',
    credits: 4,
    confirmedSection: 'L01',
    availableSections: [
      {
        id: 'csc10005-l01',
        courseCode: 'CSC10005',
        courseName: 'Operating Systems',
        courseNameVi: 'Hệ điều hành',
        sectionNumber: 'L01',
        lecturer: 'TS. Hoàng Văn E',
        room: 'C101',
        day: 4,
        startPeriod: 4,
        endPeriod: 6,
        color: '#F59E0B',
        isConfirmed: true,
        credits: 4,
      },
      {
        id: 'csc10005-l02',
        courseCode: 'CSC10005',
        courseName: 'Operating Systems',
        courseNameVi: 'Hệ điều hành',
        sectionNumber: 'L02',
        lecturer: 'TS. Võ Thị Q',
        room: 'A401',
        day: 2,
        startPeriod: 1,
        endPeriod: 3,
        color: '#F59E0B',
        isConfirmed: false,
        credits: 4,
      },
    ],
  },
  {
    courseCode: 'CSC14005',
    courseNameVi: 'Học máy',
    credits: 4,
    confirmedSection: 'L01',
    availableSections: [
      {
        id: 'csc14005-l01',
        courseCode: 'CSC14005',
        courseName: 'Machine Learning',
        courseNameVi: 'Học máy',
        sectionNumber: 'L01',
        lecturer: 'TS. Ngô Văn I',
        room: 'B303',
        day: 5,
        startPeriod: 1,
        endPeriod: 3,
        color: '#8B5CF6',
        isConfirmed: true,
        credits: 4,
      },
      {
        id: 'csc14005-l02',
        courseCode: 'CSC14005',
        courseName: 'Machine Learning',
        courseNameVi: 'Học máy',
        sectionNumber: 'L02',
        lecturer: 'TS. Đỗ Thị R',
        room: 'C205',
        day: 6,
        startPeriod: 4,
        endPeriod: 6,
        color: '#8B5CF6',
        isConfirmed: false,
        credits: 4,
      },
    ],
  },
  {
    courseCode: 'CSC14006',
    courseNameVi: 'Phát triển ứng dụng di động',
    credits: 3,
    availableSections: [
      {
        id: 'csc14006-l01',
        courseCode: 'CSC14006',
        courseName: 'Mobile App Development',
        courseNameVi: 'Phát triển ứng dụng di động',
        sectionNumber: 'L01',
        lecturer: 'TS. Trương Thị J',
        room: 'A102',
        day: 6,
        startPeriod: 7,
        endPeriod: 9,
        color: '#EC4899',
        isConfirmed: false,
        credits: 3,
      },
      {
        id: 'csc14006-l02',
        courseCode: 'CSC14006',
        courseName: 'Mobile App Development',
        courseNameVi: 'Phát triển ứng dụng di động',
        sectionNumber: 'L02',
        lecturer: 'TS. Lý Văn S',
        room: 'B404',
        day: 2,
        startPeriod: 7,
        endPeriod: 9,
        color: '#EC4899',
        isConfirmed: false,
        credits: 3,
      },
      {
        id: 'csc14006-l03',
        courseCode: 'CSC14006',
        courseName: 'Mobile App Development',
        courseNameVi: 'Phát triển ứng dụng di động',
        sectionNumber: 'L03',
        lecturer: 'TS. Cao Thị T',
        room: 'C103',
        day: 3,
        startPeriod: 1,
        endPeriod: 3,
        color: '#EC4899',
        isConfirmed: false,
        credits: 3,
      },
    ],
  },
  {
    courseCode: 'CSC15001',
    courseNameVi: 'Trí tuệ nhân tạo',
    credits: 3,
    availableSections: [
      {
        id: 'csc15001-l01',
        courseCode: 'CSC15001',
        courseName: 'Artificial Intelligence',
        courseNameVi: 'Trí tuệ nhân tạo',
        sectionNumber: 'L01',
        lecturer: 'TS. Cao Văn M',
        room: 'A203',
        day: 2,
        startPeriod: 4,
        endPeriod: 6,
        color: '#06B6D4',
        isConfirmed: false,
        credits: 3,
      },
      {
        id: 'csc15001-l02',
        courseCode: 'CSC15001',
        courseName: 'Artificial Intelligence',
        courseNameVi: 'Trí tuệ nhân tạo',
        sectionNumber: 'L02',
        lecturer: 'TS. Phan Thị U',
        room: 'B301',
        day: 4,
        startPeriod: 1,
        endPeriod: 3,
        color: '#06B6D4',
        isConfirmed: false,
        credits: 3,
      },
    ],
  },
];

// Get all confirmed classes
export const getConfirmedClasses = (): ClassSection[] => {
  return registeredCourses
    .flatMap(course => course.availableSections)
    .filter(section => section.isConfirmed);
};

// Check for time conflicts
export const hasConflict = (
  newClass: ClassSection,
  existingClasses: ClassSection[]
): boolean => {
  return existingClasses.some(existing => {
    if (existing.day !== newClass.day) return false;
    return !(
      newClass.endPeriod < existing.startPeriod ||
      newClass.startPeriod > existing.endPeriod
    );
  });
};

// Get conflicting classes
export const getConflictingClasses = (
  newClass: ClassSection,
  existingClasses: ClassSection[]
): ClassSection[] => {
  return existingClasses.filter(existing => {
    if (existing.day !== newClass.day) return false;
    return !(
      newClass.endPeriod < existing.startPeriod ||
      newClass.startPeriod > existing.endPeriod
    );
  });
};