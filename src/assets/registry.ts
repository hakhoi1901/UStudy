/**
 * Registry: Đăng ký tất cả Khoa → Ngành → Khóa tuyển.
 * Khi thêm Khoa/Ngành/Khóa mới, chỉ cần thêm entry vào đây và tạo thư mục data tương ứng.
 */

export interface CohortInfo {
    id: string;       // 'k24'
    name: string;     // 'Khóa 2024 (K24)'
}

export interface MajorInfo {
    id: string;
    name: string;
    cohorts: CohortInfo[];
}

export interface FacultyInfo {
    id: string;
    name: string;
    majors: MajorInfo[];
}

const COHORT = [
    { id: 'k24', name: 'Khóa 2024 (K24)' },
    { id: 'k25', name: 'Khóa 2025 (K25)' }
];

const RAW_FACULTIES = [
    {
        id: 'khoa-cntt',
        name: 'Khoa Công nghệ Thông tin',
        majors: [
            { id: 'cong-nghe-thong-tin', name: 'Công nghệ Thông tin' },
            { id: 'he-thong-thong-tin', name: 'Hệ thống thông tin' },
            { id: 'ky-thuat-phan-mem', name: 'Kỹ thuật phần mềm' },
            { id: 'khoa-hoc-may-tinh', name: 'Khoa học máy tính' },
            { id: 'tri-tue-nhan-tao', name: 'Trí tuệ nhân tạo' },
            { id: 'cu-nhan-tai-nang-cntt', name: 'Cử nhân tài năng' }
        ],
    },
    {
        id: 'khoa-toan-tin',
        name: 'Khoa Toán - Tin học',
        majors: [
            { id: 'toan-hoc', name: 'Toán học' },
            { id: 'toan-tin', name: 'Toán - Tin' },
            { id: 'toan-ung-dung', name: 'Toán ứng dụng' },
            { id: 'khoa-hoc-du-lieu', name: 'Khoa học dữ liệu' },
            { id: 'thong-ke', name: 'Thống kê' }
        ],
    },
    {
        id: 'khoa-sinh-hoc',
        name: 'Khoa Sinh học',
        majors: [
            { id: 'sinh-hoc', name: 'Sinh học' },
        ],
    },
];

export const FACULTIES: FacultyInfo[] = RAW_FACULTIES.map(faculty => ({
    ...faculty,
    majors: faculty.majors.map(major => ({
        ...major,
        cohorts: COHORT // Gán mặc định tại đây
    }))
}));


/**
 * Giá trị mặc định khi người dùng chưa chọn.
 */
export const DEFAULT_FACULTY_ID = 'khoa-cntt';
export const DEFAULT_MAJOR_ID = 'khoa-hoc-may-tinh';
export const DEFAULT_COHORT_ID = 'k24';

/**
 * Loader: Load dữ liệu theo Faculty → Major → Cohort.
 * Tuition được load riêng theo năm học (xem data/tuition/).
 */
export async function loadCohortData(facultyId: string, majorId: string, cohortId: string) {
    const basePath = `./data/${facultyId}/${majorId}/${cohortId}`;

    const [coursesModule, prerequisitesModule, categoriesModule] = await Promise.all([
        import(`${basePath}/courses.ts`),
        import(`${basePath}/prerequisites.ts`),
        import(`${basePath}/categories.ts`),
    ]);

    return {
        courses: coursesModule.courses,
        prerequisites: prerequisitesModule.prerequisites,
        categories: categoriesModule.categories,
    };
}

