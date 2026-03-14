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
    /**
     * Mapping: cohortId → cohortId nguồn dữ liệu thực tế.
     * Nếu không khai báo → dùng chính cohortId đó.
     * Ví dụ: { 'k25': 'k24' } nghĩa là K25 dùng chung data với K24.
     */
    dataSource?: Record<string, string>;
}

export interface FacultyInfo {
    id: string;
    name: string;
    majors: MajorInfo[];
}

const COHORT: CohortInfo[] = [
    { id: 'k24', name: 'Khóa 2024 (K24)' },
    { id: 'k25', name: 'Khóa 2025 (Chưa cập nhật chương trình đào tạo, sử dụng dữ liệu k24)' }
];

/**
 * Danh sách Khoa / Ngành / Nguồn dữ liệu theo khóa.
 *
 * dataSource: khai báo cohort nào dùng data từ cohort nào.
 *   - Không khai → cohort tự load folder riêng.
 *   - { 'k25': 'k24' } → K25 dùng chung folder data của K24.
 */

const RAW_FACULTIES = [
    {
        id: 'khoa-cntt',
        name: 'Khoa Công nghệ Thông tin',
        majors: [
            { id: 'nhom-nganh', name: 'Nhóm ngành máy tính và công nghệ thông tin (Chưa chọn chuyên ngành)', dataSource: { 'k25': 'k24' } },
            { id: 'cong-nghe-thong-tin', name: 'Công nghệ Thông tin', dataSource: { 'k25': 'k24' } },
            { id: 'he-thong-thong-tin', name: 'Hệ thống thông tin', dataSource: { 'k25': 'k24' } },
            { id: 'ky-thuat-phan-mem', name: 'Kỹ thuật phần mềm', dataSource: { 'k25': 'k24' } },
            { id: 'khoa-hoc-may-tinh', name: 'Khoa học máy tính', dataSource: { 'k25': 'k24' } },
            { id: 'tri-tue-nhan-tao', name: 'Trí tuệ nhân tạo', dataSource: { 'k25': 'k24' } },
            { id: 'cu-nhan-tai-nang', name: 'Cử nhân tài năng', dataSource: { 'k25': 'k24' } },
        ],
    },
    {
        id: 'khoa-khoa-hoc-va-cong-nghe-vat-lieu',
        name: 'Khoa Khoa học và Công nghệ Vật liệu',
        majors: [
            { id: 'khoa-hoc-vat-lieu', name: 'Khoa học vật liệu', dataSource: { 'k25': 'k24' } },
            { id: 'cong-nghe-vat-lieu', name: 'Công nghệ vật liệu', dataSource: { 'k25': 'k24' } },
        ],
    },

    {
        id: 'khoa-toan',
        name: 'Khoa Toán - Tin học',
        majors: [
            { id: 'toan-hoc', name: 'Toán học', dataSource: { 'k25': 'k24' } },
            { id: 'toan-tin', name: 'Toán - Tin', dataSource: { 'k25': 'k24' } },
            { id: 'toan-ung-dung', name: 'Toán ứng dụng', dataSource: { 'k25': 'k24' } },
            { id: 'khoa-hoc-du-lieu', name: 'Khoa học dữ liệu', dataSource: { 'k25': 'k24' } },
            { id: 'cu-nhan-tai-nang', name: 'Cử nhân tài năng', dataSource: { 'k25': 'k24' } },
            // { id: 'thong-ke', name: 'Thống kê', dataSource: { 'k25': 'k24' } },
        ],
    },

    {
        id: 'khoa-dia-chat',
        name: 'Khoa Địa chất',
        majors: [
            { id: 'dia-chat-hoc', name: 'Địa chất học', dataSource: { 'k25': 'k24' } },
            { id: 'ky-thuat-dia-chat', name: 'Kỹ thuật địa chất', dataSource: { 'k25': 'k24' } },
        ],
    },
    {
        id: 'khoa-ly',
        name: 'Khoa Vật lý - Vật lý Kỹ thuật',
        majors: [
            { id: 'vat-ly-hoc', name: 'Vật lý học', dataSource: { 'k25': 'k24' } },
            { id: 'vat-ly-y-khoa', name: 'Vật lý y khoa', dataSource: { 'k25': 'k24' } },
            { id: 'hai-duong-hoc', name: 'Hải dương học', dataSource: { 'k25': 'k24' } },
            { id: 'ky-thuat-hat-nhan', name: 'Kỹ thuật hạt nhân', dataSource: { 'k25': 'k24' } },
            { id: 'cong-nghe-vat-ly-dien-tu-va-tin-hoc', name: 'CN Vật lý điện tử và tin học', dataSource: { 'k25': 'k24' } },
            { id: 'cong-nghe-ban-dan', name: 'CN Bán dẫn', dataSource: { 'k25': 'k24' } },
        ],
    },
    {
        id: 'khoa-hoa',
        name: 'Khoa Hóa học',
        majors: [
            { id: 'hoa-hoc', name: 'Hóa học', dataSource: { 'k25': 'k24' } },
            { id: 'hoa-hoc-cntn', name: 'Cử nhân tài năng ngành hóa học', dataSource: { 'k25': 'k24' } },
        ],
    },
    {
        id: 'khoa-sinh',
        name: 'Khoa Sinh học',
        majors: [
            { id: 'sinh-hoc', name: 'Sinh học', dataSource: { 'k25': 'k24' } },
            { id: 'cong-nghe-sinh-hoc', name: 'Công nghệ sinh học', dataSource: { 'k25': 'k24' } },
        ],
    },

    {
        id: 'khoa-moi-truong',
        name: 'Khoa Môi trường',
        majors: [
            { id: 'cong-nghe-ky-thuat-moi-truong', name: 'Công nghệ kỹ thuật môi trường', dataSource: { 'k25': 'k24' } },
            { id: 'khoa-hoc-moi-truong', name: 'Khoa học môi trường', dataSource: { 'k25': 'k24' } },
            { id: 'quan-ly-tai-nguyen-va-moi-truong', name: 'Quản lý tài nguyên và môi trường', dataSource: { 'k25': 'k24' } },
        ],
    },

    {
        id: 'khoa-dien-tu-vien-thong',
        name: 'Khoa Điện tử - Viễn thông',
        majors: [
            { id: 'ky-thuat-dien-dien-tu', name: 'Kỹ thuật Điện - Điện tử', dataSource: { 'k25': 'k24' } },
            { id: 'ky-thuat-dien-tu-vien-thong', name: 'Kỹ thuật Điện tử - Viễn thông', dataSource: { 'k25': 'k24' } },
            { id: 'cong-nghe-ban-dan', name: 'Công nghệ Bán dẫn', dataSource: { 'k25': 'k24' } },
            { id: 'thiet-ke-vi-mach', name: 'Thiết kế vi mạch', dataSource: { 'k25': 'k24' } },
        ],
    },

];

export const FACULTIES: FacultyInfo[] = RAW_FACULTIES.map(faculty => ({
    ...faculty,
    majors: faculty.majors.map(major => ({
        ...major,
        cohorts: COHORT,
    }))
}));

/**
 * Giá trị mặc định khi người dùng chưa chọn.
 */
export const DEFAULT_FACULTY_ID = 'khoa-cntt';
export const DEFAULT_MAJOR_ID = 'cong-nghe-thong-tin';
export const DEFAULT_COHORT_ID = 'k24';

/**
 * Resolve: tìm cohort nguồn dữ liệu thực tế cho 1 ngành + khóa.
 */
export function resolveDataCohort(facultyId: string, majorId: string, cohortId: string): string {
    const faculty = FACULTIES.find(f => f.id === facultyId);
    const major = faculty?.majors.find(m => m.id === majorId);
    return major?.dataSource?.[cohortId] || cohortId;
}

/**
 * Loader: Load dữ liệu theo Faculty → Major → Cohort (đã resolve dataSource).
 * Tuition được load riêng theo năm học (xem data/tuition/).
 */
export async function loadCohortData(facultyId: string, majorId: string, cohortId: string) {
    const sourceCohort = resolveDataCohort(facultyId, majorId, cohortId);

    const [coursesModule, prerequisitesModule, categoriesModule] = await Promise.all([
        import(`./data/${facultyId}/${majorId}/${sourceCohort}/courses.ts`),
        import(`./data/${facultyId}/${majorId}/${sourceCohort}/prerequisites.ts`),
        import(`./data/${facultyId}/${majorId}/${sourceCohort}/categories.ts`),
    ]);

    return {
        courses: coursesModule.courses,
        prerequisites: prerequisitesModule.prerequisites,
        categories: categoriesModule.categories,
    };
}
