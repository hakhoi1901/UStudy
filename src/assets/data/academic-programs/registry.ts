/**
 * Nguon du lieu chuong trinh dao tao.
 * Cau truc goc: Khoa tuyen -> Khoa -> Nganh.
 *
 * Khi them khoa moi, them mot entry vao ACADEMIC_YEAR_MAJOR_CATALOGS. Neu
 * chuong trinh cua khoa do dung lai khoa cu, khai bao defaultProgramDataSource.
 */

export interface CohortInfo {
    id: string;
    name: string;
}

export interface CohortMajorInfo {
    id: string;
    name: string;
    /** Nguồn chương trình riêng, dùng để ghi đè nguồn mặc định của khóa. */
    dataSourceCohort?: string;
}

export interface CohortFacultyInfo {
    id: string;
    name: string;
    majors: CohortMajorInfo[];
}

export interface AcademicYearMajorCatalog {
    cohortId: string;
    label: string;
    defaultProgramDataSource?: string;
    faculties: CohortFacultyInfo[];
}

export interface MajorInfo {
    id: string;
    name: string;
    cohorts: CohortInfo[];
    dataSource?: Record<string, string>;
}

export interface FacultyInfo {
    id: string;
    name: string;
    majors: MajorInfo[];
}

export const ACADEMIC_YEAR_MAJOR_CATALOGS: AcademicYearMajorCatalog[] = [
    {
        cohortId: 'k23',
        label: 'Khóa 2023 (K23)',
        faculties: [
            {
                id: 'khoa-cntt',
                name: 'Khoa Công nghệ Thông tin',
                majors: [
                    { id: 'cong-nghe-thong-tin', name: 'Công nghệ Thông tin' },
                    { id: 'he-thong-thong-tin', name: 'Hệ thống thông tin' },
                    { id: 'ky-thuat-phan-mem', name: 'Kỹ thuật phần mềm' },
                    { id: 'khoa-hoc-may-tinh', name: 'Khoa học máy tính' },
                    { id: 'tri-tue-nhan-tao', name: 'Trí tuệ nhân tạo' },
                    { id: 'cu-nhan-tai-nang', name: 'Cử nhân tài năng' },
                ],
            },
            {
                id: 'khoa-khoa-hoc-va-cong-nghe-vat-lieu',
                name: 'Khoa Khoa học và Công nghệ Vật liệu',
                majors: [
                    { id: 'khoa-hoc-vat-lieu', name: 'Khoa học vật liệu' },
                    { id: 'cong-nghe-vat-lieu', name: 'Công nghệ vật liệu' },
                ],
            },
            {
                id: 'khoa-toan',
                name: 'Khoa Toán - Tin học',
                majors: [
                    { id: 'toan-hoc', name: 'Toán học' },
                    { id: 'toan-tin', name: 'Toán - Tin' },
                    { id: 'toan-ung-dung', name: 'Toán ứng dụng' },
                    { id: 'khoa-hoc-du-lieu', name: 'Khoa học dữ liệu' },
                    { id: 'cu-nhan-tai-nang', name: 'Cử nhân tài năng ngành Toán học' },
                ],
            },
            {
                id: 'khoa-dia-chat',
                name: 'Khoa Địa chất',
                majors: [
                    { id: 'dia-chat-hoc', name: 'Địa chất học' },
                    { id: 'ky-thuat-dia-chat', name: 'Kỹ thuật địa chất' },
                ],
            },
            {
                id: 'khoa-ly',
                name: 'Khoa Vật lý - Vật lý Kỹ thuật',
                majors: [
                    { id: 'vat-ly-hoc', name: 'Vật lý học' },
                    { id: 'vat-ly-y-khoa', name: 'Vật lý y khoa' },
                    { id: 'hai-duong-hoc', name: 'Hải dương học' },
                    { id: 'ky-thuat-hat-nhan', name: 'Kỹ thuật hạt nhân' },
                    {
                        id: 'cong-nghe-vat-ly-dien-tu-va-tin-hoc',
                        name: 'CN Vật lý điện tử và tin học',
                    },
                    { id: 'cu-nhan-tai-nang-vat-ly-hoc', name: 'Cử nhân tài năng ngành Vật lý học' },
                ],
            },
            {
                id: 'khoa-hoa',
                name: 'Khoa Hóa học',
                majors: [
                    { id: 'hoa-hoc', name: 'Hóa học' },
                    { id: 'cu-nhan-tai-nang', name: 'Cử nhân tài năng ngành hóa học' },
                ],
            },
            {
                id: 'khoa-sinh',
                name: 'Khoa Sinh học - Công nghệ sinh học',
                majors: [
                    { id: 'sinh-hoc', name: 'Sinh học' },
                    { id: 'cong-nghe-sinh-hoc', name: 'Công nghệ sinh học' },
                ],
            },
            {
                id: 'khoa-moi-truong',
                name: 'Khoa Môi trường',
                majors: [
                    { id: 'cong-nghe-ky-thuat-moi-truong', name: 'Công nghệ kỹ thuật môi trường' },
                    { id: 'khoa-hoc-moi-truong', name: 'Khoa học môi trường' },
                    { id: 'quan-ly-tai-nguyen-va-moi-truong', name: 'Quản lý tài nguyên và môi trường' },
                ],
            },
            {
                id: 'khoa-dien-tu-vien-thong',
                name: 'Khoa Điện tử - Viễn thông',
                majors: [
                    { id: 'ky-thuat-dien-tu-vien-thong', name: 'Kỹ thuật Điện tử - Viễn thông' },
                ],
            },
        ],
    },
    {
        cohortId: 'k24',
        label: 'Khóa 2024 (K24)',
        faculties: [
            {
                id: 'khoa-cntt',
                name: 'Khoa Công nghệ Thông tin',
                majors: [
                    { id: 'nhom-nganh', name: 'Nhóm ngành máy tính và công nghệ thông tin' },
                    { id: 'cong-nghe-thong-tin', name: 'Công nghệ Thông tin' },
                    { id: 'he-thong-thong-tin', name: 'Hệ thống thông tin' },
                    { id: 'ky-thuat-phan-mem', name: 'Kỹ thuật phần mềm' },
                    { id: 'khoa-hoc-may-tinh', name: 'Khoa học máy tính' },
                    { id: 'tri-tue-nhan-tao', name: 'Trí tuệ nhân tạo' },
                    { id: 'cu-nhan-tai-nang', name: 'Cử nhân tài năng' },
                ],
            },
            {
                id: 'khoa-khoa-hoc-va-cong-nghe-vat-lieu',
                name: 'Khoa Khoa học và Công nghệ Vật liệu',
                majors: [
                    { id: 'khoa-hoc-vat-lieu', name: 'Khoa học vật liệu' },
                    { id: 'cong-nghe-vat-lieu', name: 'Công nghệ vật liệu' },
                ],
            },
            {
                id: 'khoa-toan',
                name: 'Khoa Toán - Tin học',
                majors: [
                    { id: 'toan-hoc', name: 'Toán học' },
                    { id: 'toan-tin', name: 'Toán - Tin' },
                    { id: 'toan-ung-dung', name: 'Toán ứng dụng' },
                    { id: 'khoa-hoc-du-lieu', name: 'Khoa học dữ liệu' },
                    { id: 'cu-nhan-tai-nang', name: 'Cử nhân tài năng' },
                ],
            },
            {
                id: 'khoa-dia-chat',
                name: 'Khoa Địa chất',
                majors: [
                    { id: 'dia-chat-hoc', name: 'Địa chất học' },
                    { id: 'ky-thuat-dia-chat', name: 'Kỹ thuật địa chất' },
                ],
            },
            {
                id: 'khoa-ly',
                name: 'Khoa Vật lý - Vật lý Kỹ thuật',
                majors: [
                    { id: 'vat-ly-hoc', name: 'Vật lý học' },
                    { id: 'vat-ly-y-khoa', name: 'Vật lý y khoa' },
                    { id: 'hai-duong-hoc', name: 'Hải dương học' },
                    { id: 'ky-thuat-hat-nhan', name: 'Kỹ thuật hạt nhân' },
                    { id: 'cong-nghe-vat-ly-dien-tu-va-tin-hoc', name: 'CN Vật lý điện tử và tin học' },
                    { id: 'cong-nghe-ban-dan', name: 'CN Bán dẫn' },
                ],
            },
            {
                id: 'khoa-hoa',
                name: 'Khoa Hóa học',
                majors: [
                    { id: 'hoa-hoc', name: 'Hóa học' },
                    { id: 'cu-nhan-tai-nang', name: 'Cử nhân tài năng ngành hóa học' },
                ],
            },
            {
                id: 'khoa-sinh',
                name: 'Khoa Sinh học - Công nghệ sinh học',
                majors: [
                    { id: 'sinh-hoc', name: 'Sinh học' },
                    { id: 'cong-nghe-sinh-hoc', name: 'Công nghệ sinh học' },
                ],
            },
            {
                id: 'khoa-moi-truong',
                name: 'Khoa Môi trường',
                majors: [
                    { id: 'cong-nghe-ky-thuat-moi-truong', name: 'Công nghệ kỹ thuật môi trường' },
                    { id: 'khoa-hoc-moi-truong', name: 'Khoa học môi trường' },
                    { id: 'quan-ly-tai-nguyen-va-moi-truong', name: 'Quản lý tài nguyên và môi trường' },
                ],
            },
            {
                id: 'khoa-dien-tu-vien-thong',
                name: 'Khoa Điện tử - Viễn thông',
                majors: [
                    { id: 'ky-thuat-dien-tu-vien-thong', name: 'Kỹ thuật Điện tử - Viễn thông' },
                    { id: 'thiet-ke-vi-mach', name: 'Thiết kế vi mạch' },
                ],
            },
        ],
    }, {
        cohortId: 'k25',
        label: 'Khóa 2025',
        defaultProgramDataSource: 'k25',
        faculties: [
            {
                id: 'khoa-cntt',
                name: 'Khoa Công nghệ Thông tin',
                majors: [
                    { id: 'cong-nghe-thong-tin', name: 'Công nghệ Thông tin' },
                    { id: 'he-thong-thong-tin', name: 'Hệ thống thông tin' },
                    { id: 'ky-thuat-phan-mem', name: 'Kỹ thuật phần mềm' },
                    { id: 'khoa-hoc-may-tinh', name: 'Khoa học máy tính' },
                    { id: 'tri-tue-nhan-tao', name: 'Trí tuệ nhân tạo' },
                    { id: 'cu-nhan-tai-nang', name: 'Cử nhân tài năng' },
                ],
            },
            {
                id: 'khoa-khoa-hoc-va-cong-nghe-vat-lieu',
                name: 'Khoa Khoa học và Công nghệ Vật liệu',
                majors: [
                    { id: 'khoa-hoc-vat-lieu', name: 'Khoa học vật liệu', dataSourceCohort: 'k24'  },
                    { id: 'cong-nghe-vat-lieu', name: 'Công nghệ vật liệu', dataSourceCohort: 'k24'  },
                ],
            },
            {
                id: 'khoa-toan',
                name: 'Khoa Toán - Tin học',
                majors: [
                    { id: 'toan-hoc', name: 'Toán học' },
                    { id: 'toan-tin', name: 'Toán - Tin' },
                    { id: 'toan-ung-dung', name: 'Toán ứng dụng' },
                    { id: 'khoa-hoc-du-lieu', name: 'Khoa học dữ liệu' },
                    { id: 'cu-nhan-tai-nang', name: 'Cử nhân tài năng' },
                    { id: 'thong-ke', name: 'Thống kê' },
                ],
            },
            {
                id: 'khoa-dia-chat',
                name: 'Khoa Địa chất',
                majors: [
                    { id: 'dia-chat-hoc', name: 'Địa chất học' },
                    { id: 'ky-thuat-dia-chat', name: 'Kỹ thuật địa chất' },
                    { id: 'kinh-te-dat-dai', name: 'Kinh tế đất đai' },
                ],
            },
            {
                id: 'khoa-ly',
                name: 'Khoa Vật lý - Vật lý Kỹ thuật',
                majors: [
                    { id: 'vat-ly-hoc', name: 'Vật lý học' },
                    { id: 'cu-nhan-tai-nang-vat-ly-hoc', name: 'cử nhân tài năng vật lý học'},
                    { id: 'vat-ly-y-khoa', name: 'Vật lý y khoa' },
                    { id: 'hai-duong-hoc', name: 'Hải dương học' },
                    { id: 'ky-thuat-hat-nhan', name: 'Kỹ thuật hạt nhân' },
                    { id: 'cong-nghe-vat-ly-dien-tu-va-tin-hoc', name: 'CN Vật lý điện tử và tin học' },
                    { id: 'cong-nghe-ban-dan', name: 'CN Bán dẫn' },
                ],
            },
            {
                id: 'khoa-hoa',
                name: 'Khoa Hóa học',
                majors: [
                    { id: 'hoa-hoc', name: 'Hóa học', dataSourceCohort: 'k24'  },
                    { id: 'cu-nhan-tai-nang', name: 'Cử nhân tài năng ngành hóa học' },
                ],
            },
            {
                id: 'khoa-sinh',
                name: 'Khoa Sinh học - Công nghệ sinh học',
                majors: [
                    { id: 'sinh-hoc', name: 'Sinh học' },
                    { id: 'cong-nghe-sinh-hoc', name: 'Công nghệ sinh học' },
                ],
            },
            {
                id: 'khoa-moi-truong',
                name: 'Khoa Môi trường',
                majors: [
                    { id: 'cong-nghe-ky-thuat-moi-truong', name: 'Công nghệ kỹ thuật môi trường' },
                    { id: 'khoa-hoc-moi-truong', name: 'Khoa học môi trường' },
                    { id: 'quan-ly-tai-nguyen-va-moi-truong', name: 'Quản lý tài nguyên và môi trường' },
                ],
            },
            {
                id: 'khoa-dien-tu-vien-thong',
                name: 'Khoa Điện tử - Viễn thông',
                majors: [
                    { id: 'ky-thuat-dien-tu-vien-thong', name: 'Kỹ thuật Điện tử - Viễn thông' },
                    { id: 'thiet-ke-vi-mach', name: 'Thiết kế vi mạch' },
                ],
            },
            {
                id: 'khoa-lien-nganh',
                name: 'Khoa Liên ngành',
                majors: [{ id: 'cong-nghe-giao-duc', name: 'Công nghệ giáo dục' }],
            },
        ],
    }, {
        cohortId: 'k26',
        label: 'Khóa 2026',
        defaultProgramDataSource: 'k25',
        faculties: [
            {
                id: 'khoa-cntt',
                name: 'Khoa Công nghệ Thông tin',
                majors: [
                    { id: 'cong-nghe-thong-tin', name: 'Công nghệ Thông tin' },
                    { id: 'he-thong-thong-tin', name: 'Hệ thống thông tin' },
                    { id: 'ky-thuat-phan-mem', name: 'Kỹ thuật phần mềm' },
                    { id: 'khoa-hoc-may-tinh', name: 'Khoa học máy tính' },
                    { id: 'tri-tue-nhan-tao', name: 'Trí tuệ nhân tạo' },
                    { id: 'cu-nhan-tai-nang', name: 'Cử nhân tài năng' },
                ],
            },
            {
                id: 'khoa-khoa-hoc-va-cong-nghe-vat-lieu',
                name: 'Khoa Khoa học và Công nghệ Vật liệu',
                majors: [
                    { id: 'khoa-hoc-vat-lieu', name: 'Khoa học vật liệu', dataSourceCohort: 'k24' },
                    { id: 'cong-nghe-vat-lieu', name: 'Công nghệ vật liệu', dataSourceCohort: 'k24' },
                ],
            },
            {
                id: 'khoa-toan',
                name: 'Khoa Toán - Tin học',
                majors: [
                    { id: 'toan-hoc', name: 'Toán học', }, // dataSourceCohort: 'k26' },
                    { id: 'toan-tin', name: 'Toán - Tin', }, // dataSourceCohort: 'k26' },
                    { id: 'toan-ung-dung', name: 'Toán ứng dụng', }, // dataSourceCohort: 'k26' },
                    { id: 'khoa-hoc-du-lieu', name: 'Khoa học dữ liệu', }, // dataSourceCohort: 'k26' },
                    { id: 'cu-nhan-tai-nang', name: 'Cử nhân tài năng' },
                    { id: 'thong-ke', name: 'Thống kê', }, // dataSourceCohort: 'k26' },
                ],
            },
            {
                id: 'khoa-dia-chat',
                name: 'Khoa Địa chất',
                majors: [
                    { id: 'dia-chat-hoc', name: 'Địa chất học' },
                    { id: 'ky-thuat-dia-chat', name: 'Kỹ thuật địa chất' },
                    { id: 'kinh-te-dat-dai', name: 'Kinh tế đất đai' },
                ],
            },
            {
                id: 'khoa-ly',
                name: 'Khoa Vật lý - Vật lý Kỹ thuật',
                majors: [
                    { id: 'vat-ly-hoc', name: 'Vật lý học' },
                    { id: 'vat-ly-y-khoa', name: 'Vật lý y khoa' },
                    { id: 'hai-duong-hoc', name: 'Hải dương học' },
                    { id: 'ky-thuat-hat-nhan', name: 'Kỹ thuật hạt nhân' },
                    { id: 'cong-nghe-vat-ly-dien-tu-va-tin-hoc', name: 'CN Vật lý điện tử và tin học' },
                    { id: 'cong-nghe-ban-dan', name: 'CN Bán dẫn' },
                ],
            },
            {
                id: 'khoa-hoa',
                name: 'Khoa Hóa học',
                majors: [
                    { id: 'hoa-hoc', name: 'Hóa học', dataSourceCohort: 'k24' },
                    { id: 'cu-nhan-tai-nang', name: 'Cử nhân tài năng ngành hóa học' },
                ],
            },
            {
                id: 'khoa-sinh',
                name: 'Khoa Sinh học - Công nghệ sinh học',
                majors: [
                    { id: 'sinh-hoc', name: 'Sinh học' },
                    { id: 'cong-nghe-sinh-hoc', name: 'Công nghệ sinh học' },
                ],
            },
            {
                id: 'khoa-moi-truong',
                name: 'Khoa Môi trường',
                majors: [
                    { id: 'cong-nghe-ky-thuat-moi-truong', name: 'Công nghệ kỹ thuật môi trường' },
                    { id: 'khoa-hoc-moi-truong', name: 'Khoa học môi trường' },
                    { id: 'quan-ly-tai-nguyen-va-moi-truong', name: 'Quản lý tài nguyên và môi trường' },
                ],
            },
            {
                id: 'khoa-dien-tu-vien-thong',
                name: 'Khoa Điện tử - Viễn thông',
                majors: [
                    { id: 'ky-thuat-dien-tu-vien-thong', name: 'Kỹ thuật Điện tử - Viễn thông' },
                    { id: 'thiet-ke-vi-mach', name: 'Thiết kế vi mạch' },
                ],
            },
            {
                id: 'khoa-lien-nganh',
                name: 'Khoa Liên ngành',
                majors: [{ id: 'cong-nghe-giao-duc', name: 'Công nghệ giáo dục' }],
            },
        ],
    },
];

export const COHORTS: CohortInfo[] = ACADEMIC_YEAR_MAJOR_CATALOGS.map(({ cohortId, label }) => ({
    id: cohortId,
    name: label,
}));

/** Lop tuong thich cho cac tab cu dang can tra nguoc theo khoa/nganh. */
export const FACULTIES: FacultyInfo[] = (() => {
    const facultyMap = new Map<string, FacultyInfo>();

    ACADEMIC_YEAR_MAJOR_CATALOGS.forEach((catalog) => {
        catalog.faculties.forEach((catalogFaculty) => {
            let faculty = facultyMap.get(catalogFaculty.id);
            if (!faculty) {
                faculty = { id: catalogFaculty.id, name: catalogFaculty.name, majors: [] };
                facultyMap.set(catalogFaculty.id, faculty);
            }

            catalogFaculty.majors.forEach((catalogMajor) => {
                let major = faculty.majors.find((item) => item.id === catalogMajor.id);
                if (!major) {
                    major = { id: catalogMajor.id, name: catalogMajor.name, cohorts: [] };
                    faculty.majors.push(major);
                }

                major.cohorts.push({ id: catalog.cohortId, name: catalog.label });
                const sourceCohort = catalogMajor.dataSourceCohort ?? catalog.defaultProgramDataSource;
                if (sourceCohort && sourceCohort !== catalog.cohortId) {
                    major.dataSource = { ...major.dataSource, [catalog.cohortId]: sourceCohort };
                }
            });
        });
    });

    return [...facultyMap.values()];
})();

export function getAcademicYearMajorCatalog(cohortId: string) {
    return ACADEMIC_YEAR_MAJOR_CATALOGS.find((catalog) => catalog.cohortId === cohortId);
}

export function getProgramDataSourceCohort(cohortId: string, facultyId?: string, majorId?: string) {
    if (facultyId && majorId) return resolveDataCohort(facultyId, majorId, cohortId);
    return getAcademicYearMajorCatalog(cohortId)?.defaultProgramDataSource;
}

export function getFacultiesForCohort(cohortId: string): CohortFacultyInfo[] {
    return getAcademicYearMajorCatalog(cohortId)?.faculties ?? [];
}

export function getMajorsForCohort(facultyId: string, cohortId: string): CohortMajorInfo[] {
    return getFacultiesForCohort(cohortId).find((faculty) => faculty.id === facultyId)?.majors ?? [];
}

export const DEFAULT_FACULTY_ID = 'khoa-cntt';
export const DEFAULT_MAJOR_ID = 'cong-nghe-thong-tin';
export const DEFAULT_COHORT_ID = 'k24';

export function resolveDataCohort(facultyId: string, majorId: string, cohortId: string): string {
    const faculty = FACULTIES.find((item) => item.id === facultyId);
    const major = faculty?.majors.find((item) => item.id === majorId);
    return major?.dataSource?.[cohortId] ?? cohortId;
}

/** Tuition duoc load rieng theo nam hoc trong assets/data/tuition. */
export async function loadCohortData(facultyId: string, majorId: string, cohortId: string) {
    const sourceCohort = resolveDataCohort(facultyId, majorId, cohortId);

    const [coursesModule, prerequisitesModule, categoriesModule] = await Promise.all([
        import(`./${facultyId}/${majorId}/${sourceCohort}/courses.ts`),
        import(`./${facultyId}/${majorId}/${sourceCohort}/prerequisites.ts`)
            .catch(() => ({ prerequisites: [] })),
        import(`./${facultyId}/${majorId}/${sourceCohort}/categories.ts`),
    ]);

    return {
        courses: coursesModule.courses,
        prerequisites: prerequisitesModule.prerequisites,
        categories: categoriesModule.categories,
    };
}
