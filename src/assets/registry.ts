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
        cohortId: 'k24',
        label: 'Khóa 2024 (K24)',
        faculties: [
            {
                id: 'khoa-cntt',
                name: 'Khoa Cong nghe Thong tin',
                majors: [
                    { id: 'nhom-nganh', name: 'Nhom nganh may tinh va cong nghe thong tin (Chua chon chuyen nganh)' },
                    { id: 'cong-nghe-thong-tin', name: 'Cong nghe Thong tin' },
                    { id: 'he-thong-thong-tin', name: 'He thong thong tin' },
                    { id: 'ky-thuat-phan-mem', name: 'Ky thuat phan mem' },
                    { id: 'khoa-hoc-may-tinh', name: 'Khoa hoc may tinh' },
                    { id: 'tri-tue-nhan-tao', name: 'Tri tue nhan tao' },
                    { id: 'cu-nhan-tai-nang', name: 'Cu nhan tai nang' },
                ],
            },
            {
                id: 'khoa-khoa-hoc-va-cong-nghe-vat-lieu',
                name: 'Khoa Khoa hoc va Cong nghe Vat lieu',
                majors: [
                    { id: 'khoa-hoc-vat-lieu', name: 'Khoa hoc vat lieu' },
                    { id: 'cong-nghe-vat-lieu', name: 'Cong nghe vat lieu' },
                ],
            },
            {
                id: 'khoa-toan',
                name: 'Khoa Toan - Tin hoc',
                majors: [
                    { id: 'toan-hoc', name: 'Toan hoc' },
                    { id: 'toan-tin', name: 'Toan - Tin' },
                    { id: 'toan-ung-dung', name: 'Toan ung dung' },
                    { id: 'khoa-hoc-du-lieu', name: 'Khoa hoc du lieu' },
                    { id: 'cu-nhan-tai-nang', name: 'Cu nhan tai nang' },
                ],
            },
            {
                id: 'khoa-dia-chat',
                name: 'Khoa Dia chat',
                majors: [
                    { id: 'dia-chat-hoc', name: 'Dia chat hoc' },
                    { id: 'ky-thuat-dia-chat', name: 'Ky thuat dia chat' },
                ],
            },
            {
                id: 'khoa-ly',
                name: 'Khoa Vat ly - Vat ly Ky thuat',
                majors: [
                    { id: 'vat-ly-hoc', name: 'Vat ly hoc' },
                    { id: 'vat-ly-y-khoa', name: 'Vat ly y khoa' },
                    { id: 'hai-duong-hoc', name: 'Hai duong hoc' },
                    { id: 'ky-thuat-hat-nhan', name: 'Ky thuat hat nhan' },
                    { id: 'cong-nghe-vat-ly-dien-tu-va-tin-hoc', name: 'CN Vat ly dien tu va tin hoc' },
                    { id: 'cong-nghe-ban-dan', name: 'CN Ban dan' },
                ],
            },
            {
                id: 'khoa-hoa',
                name: 'Khoa Hoa hoc',
                majors: [
                    { id: 'hoa-hoc', name: 'Hoa hoc' },
                    { id: 'hoa-hoc-cntn', name: 'Cu nhan tai nang nganh hoa hoc' },
                ],
            },
            {
                id: 'khoa-sinh',
                name: 'Khoa Sinh hoc - Cong nghe sinh hoc',
                majors: [
                    { id: 'sinh-hoc', name: 'Sinh hoc' },
                    { id: 'cong-nghe-sinh-hoc', name: 'Cong nghe sinh hoc' },
                ],
            },
            {
                id: 'khoa-moi-truong',
                name: 'Khoa Moi truong',
                majors: [
                    { id: 'cong-nghe-ky-thuat-moi-truong', name: 'Cong nghe ky thuat moi truong' },
                    { id: 'khoa-hoc-moi-truong', name: 'Khoa hoc moi truong' },
                    { id: 'quan-ly-tai-nguyen-va-moi-truong', name: 'Quan ly tai nguyen va moi truong' },
                ],
            },
            {
                id: 'khoa-dien-tu-vien-thong',
                name: 'Khoa Dien tu - Vien thong',
                majors: [
                    { id: 'ky-thuat-dien-dien-tu', name: 'Ky thuat Dien - Dien tu' },
                    { id: 'ky-thuat-dien-tu-vien-thong', name: 'Ky thuat Dien tu - Vien thong' },
                    { id: 'cong-nghe-ban-dan', name: 'Cong nghe Ban dan' },
                    { id: 'thiet-ke-vi-mach', name: 'Thiet ke vi mach' },
                ],
            },
        ],
    },
    {
        cohortId: 'k25',
        label: 'Khóa 2025 (Chưa cập nhật chương trình đào tạo, sử dụng dữ liệu K24)',
        defaultProgramDataSource: 'k24',
        faculties: [
            {
                id: 'khoa-cntt',
                name: 'Khoa Cong nghe Thong tin',
                majors: [
                    { id: 'nhom-nganh', name: 'Nhom nganh may tinh va cong nghe thong tin (Chua chon chuyen nganh)' },
                    { id: 'cong-nghe-thong-tin', name: 'Cong nghe Thong tin' },
                    { id: 'he-thong-thong-tin', name: 'He thong thong tin' },
                    { id: 'ky-thuat-phan-mem', name: 'Ky thuat phan mem' },
                    { id: 'khoa-hoc-may-tinh', name: 'Khoa hoc may tinh' },
                    { id: 'tri-tue-nhan-tao', name: 'Tri tue nhan tao' },
                    { id: 'cu-nhan-tai-nang', name: 'Cu nhan tai nang' },
                ],
            },
            {
                id: 'khoa-khoa-hoc-va-cong-nghe-vat-lieu',
                name: 'Khoa Khoa hoc va Cong nghe Vat lieu',
                majors: [
                    { id: 'khoa-hoc-vat-lieu', name: 'Khoa hoc vat lieu' },
                    { id: 'cong-nghe-vat-lieu', name: 'Cong nghe vat lieu' },
                ],
            },
            {
                id: 'khoa-toan',
                name: 'Khoa Toan - Tin hoc',
                majors: [
                    { id: 'toan-hoc', name: 'Toan hoc' },
                    { id: 'toan-tin', name: 'Toan - Tin' },
                    { id: 'toan-ung-dung', name: 'Toan ung dung' },
                    { id: 'khoa-hoc-du-lieu', name: 'Khoa hoc du lieu' },
                    { id: 'cu-nhan-tai-nang', name: 'Cu nhan tai nang' },
                    { id: 'thong-ke', name: 'Thong ke' },
                ],
            },
            {
                id: 'khoa-dia-chat',
                name: 'Khoa Dia chat',
                majors: [
                    { id: 'dia-chat-hoc', name: 'Dia chat hoc' },
                    { id: 'ky-thuat-dia-chat', name: 'Ky thuat dia chat' },
                    { id: 'kinh-te-dat-dai', name: 'Kinh te dat dai' },
                ],
            },
            {
                id: 'khoa-ly',
                name: 'Khoa Vat ly - Vat ly Ky thuat',
                majors: [
                    { id: 'vat-ly-hoc', name: 'Vat ly hoc' },
                    { id: 'vat-ly-y-khoa', name: 'Vat ly y khoa' },
                    { id: 'hai-duong-hoc', name: 'Hai duong hoc' },
                    { id: 'ky-thuat-hat-nhan', name: 'Ky thuat hat nhan' },
                    { id: 'cong-nghe-vat-ly-dien-tu-va-tin-hoc', name: 'CN Vat ly dien tu va tin hoc' },
                    { id: 'cong-nghe-ban-dan', name: 'CN Ban dan' },
                ],
            },
            {
                id: 'khoa-hoa',
                name: 'Khoa Hoa hoc',
                majors: [
                    { id: 'hoa-hoc', name: 'Hoa hoc' },
                    { id: 'hoa-hoc-cntn', name: 'Cu nhan tai nang nganh hoa hoc' },
                ],
            },
            {
                id: 'khoa-sinh',
                name: 'Khoa Sinh hoc - Cong nghe sinh hoc',
                majors: [
                    { id: 'sinh-hoc', name: 'Sinh hoc' },
                    { id: 'cong-nghe-sinh-hoc', name: 'Cong nghe sinh hoc' },
                ],
            },
            {
                id: 'khoa-moi-truong',
                name: 'Khoa Moi truong',
                majors: [
                    { id: 'cong-nghe-ky-thuat-moi-truong', name: 'Cong nghe ky thuat moi truong' },
                    { id: 'khoa-hoc-moi-truong', name: 'Khoa hoc moi truong' },
                    { id: 'quan-ly-tai-nguyen-va-moi-truong', name: 'Quan ly tai nguyen va moi truong' },
                ],
            },
            {
                id: 'khoa-dien-tu-vien-thong',
                name: 'Khoa Dien tu - Vien thong',
                majors: [
                    { id: 'ky-thuat-dien-dien-tu', name: 'Ky thuat Dien - Dien tu' },
                    { id: 'ky-thuat-dien-tu-vien-thong', name: 'Ky thuat Dien tu - Vien thong' },
                    { id: 'cong-nghe-ban-dan', name: 'Cong nghe Ban dan' },
                    { id: 'thiet-ke-vi-mach', name: 'Thiet ke vi mach' },
                ],
            },
            {
                id: 'khoa-lien-nganh',
                name: 'Khoa Lien nganh',
                majors: [{ id: 'cong-nghe-giao-duc', name: 'Cong nghe giao duc' }],
            },
        ],
    },
];

export const COHORTS: CohortInfo[] = ACADEMIC_YEAR_MAJOR_CATALOGS.map(({ cohortId, label }) => ({
    id: cohortId,
    name: label,
}));

const DISPLAY_NAMES: Record<string, string> = {
    'khoa-cntt': 'Khoa Công nghệ Thông tin',
    'khoa-khoa-hoc-va-cong-nghe-vat-lieu': 'Khoa Khoa học và Công nghệ Vật liệu',
    'khoa-toan': 'Khoa Toán - Tin học',
    'khoa-dia-chat': 'Khoa Địa chất',
    'khoa-ly': 'Khoa Vật lý - Vật lý Kỹ thuật',
    'khoa-hoa': 'Khoa Hóa học',
    'khoa-sinh': 'Khoa Sinh học - Công nghệ sinh học',
    'khoa-moi-truong': 'Khoa Môi trường',
    'khoa-dien-tu-vien-thong': 'Khoa Điện tử - Viễn thông',
    'khoa-lien-nganh': 'Khoa Liên ngành',
    'nhom-nganh': 'Nhóm ngành máy tính và công nghệ thông tin (Chưa chọn chuyên ngành)',
    'cong-nghe-thong-tin': 'Công nghệ Thông tin',
    'he-thong-thong-tin': 'Hệ thống thông tin',
    'ky-thuat-phan-mem': 'Kỹ thuật phần mềm',
    'khoa-hoc-may-tinh': 'Khoa học máy tính',
    'tri-tue-nhan-tao': 'Trí tuệ nhân tạo',
    'cu-nhan-tai-nang': 'Cử nhân tài năng',
    'khoa-hoc-vat-lieu': 'Khoa học vật liệu',
    'cong-nghe-vat-lieu': 'Công nghệ vật liệu',
    'toan-hoc': 'Toán học',
    'toan-tin': 'Toán - Tin',
    'toan-ung-dung': 'Toán ứng dụng',
    'khoa-hoc-du-lieu': 'Khoa học dữ liệu',
    'thong-ke': 'Thống kê',
    'dia-chat-hoc': 'Địa chất học',
    'ky-thuat-dia-chat': 'Kỹ thuật địa chất',
    'kinh-te-dat-dai': 'Kinh tế đất đai',
    'vat-ly-hoc': 'Vật lý học',
    'vat-ly-y-khoa': 'Vật lý y khoa',
    'hai-duong-hoc': 'Hải dương học',
    'ky-thuat-hat-nhan': 'Kỹ thuật hạt nhân',
    'cong-nghe-vat-ly-dien-tu-va-tin-hoc': 'CN Vật lý điện tử và tin học',
    'cong-nghe-ban-dan': 'Công nghệ Bán dẫn',
    'hoa-hoc': 'Hóa học',
    'hoa-hoc-cntn': 'Cử nhân tài năng ngành hóa học',
    'sinh-hoc': 'Sinh học',
    'cong-nghe-sinh-hoc': 'Công nghệ sinh học',
    'cong-nghe-ky-thuat-moi-truong': 'Công nghệ kỹ thuật môi trường',
    'khoa-hoc-moi-truong': 'Khoa học môi trường',
    'quan-ly-tai-nguyen-va-moi-truong': 'Quản lý tài nguyên và môi trường',
    'ky-thuat-dien-dien-tu': 'Kỹ thuật Điện - Điện tử',
    'ky-thuat-dien-tu-vien-thong': 'Kỹ thuật Điện tử - Viễn thông',
    'thiet-ke-vi-mach': 'Thiết kế vi mạch',
    'cong-nghe-giao-duc': 'Công nghệ giáo dục',
};

/** Lop tuong thich cho cac tab cu dang can tra nguoc theo khoa/nganh. */
export const FACULTIES: FacultyInfo[] = (() => {
    const facultyMap = new Map<string, FacultyInfo>();

    ACADEMIC_YEAR_MAJOR_CATALOGS.forEach((catalog) => {
        catalog.faculties.forEach((catalogFaculty) => {
            let faculty = facultyMap.get(catalogFaculty.id);
            if (!faculty) {
                faculty = { id: catalogFaculty.id, name: DISPLAY_NAMES[catalogFaculty.id] ?? catalogFaculty.name, majors: [] };
                facultyMap.set(catalogFaculty.id, faculty);
            }

            catalogFaculty.majors.forEach((catalogMajor) => {
                let major = faculty.majors.find((item) => item.id === catalogMajor.id);
                if (!major) {
                    major = { id: catalogMajor.id, name: DISPLAY_NAMES[catalogMajor.id] ?? catalogMajor.name, cohorts: [] };
                    faculty.majors.push(major);
                }

                major.cohorts.push({ id: catalog.cohortId, name: catalog.label });
                if (catalog.defaultProgramDataSource) {
                    major.dataSource = { ...major.dataSource, [catalog.cohortId]: catalog.defaultProgramDataSource };
                }
            });
        });
    });

    return [...facultyMap.values()];
})();

export function getAcademicYearMajorCatalog(cohortId: string) {
    return ACADEMIC_YEAR_MAJOR_CATALOGS.find((catalog) => catalog.cohortId === cohortId);
}

export function getProgramDataSourceCohort(cohortId: string) {
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
    const sourceCohort = getProgramDataSourceCohort(cohortId) ?? resolveDataCohort(facultyId, majorId, cohortId);

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
