/**
 * Danh sách ngành tuyển sinh theo từng khóa.
 *
 * Đây là nguồn dùng cho Workspace > Dữ liệu > Độ phủ dữ liệu.
 * Khi có khóa mới, thêm một entry mới và liệt kê đúng các ngành của khóa đó.
 * `defaultProgramDataSource` cho biết mặc định ngành của khóa đó dùng lại dữ liệu
 * chương trình từ khóa nào. Có thể bỏ nó khi mỗi ngành đã có file riêng.
 */
export interface AcademicYearMajorCatalog {
    cohortId: string;
    label: string;
    defaultProgramDataSource?: string;
    facultyMajors: Record<string, string[]>;
}

const K24_FACULTY_MAJORS: Record<string, string[]> = {
    'khoa-cntt': ['nhom-nganh', 'cong-nghe-thong-tin', 'he-thong-thong-tin', 'ky-thuat-phan-mem', 'khoa-hoc-may-tinh', 'tri-tue-nhan-tao', 'cu-nhan-tai-nang'],
    'khoa-khoa-hoc-va-cong-nghe-vat-lieu': ['khoa-hoc-vat-lieu', 'cong-nghe-vat-lieu'],
    'khoa-toan': ['toan-hoc', 'toan-tin', 'toan-ung-dung', 'khoa-hoc-du-lieu', 'cu-nhan-tai-nang'],
    'khoa-dia-chat': ['dia-chat-hoc', 'ky-thuat-dia-chat'],
    'khoa-ly': ['vat-ly-hoc', 'vat-ly-y-khoa', 'hai-duong-hoc', 'ky-thuat-hat-nhan', 'cong-nghe-vat-ly-dien-tu-va-tin-hoc', 'cong-nghe-ban-dan'],
    'khoa-hoa': ['hoa-hoc', 'hoa-hoc-cntn'],
    'khoa-sinh': ['sinh-hoc', 'cong-nghe-sinh-hoc'],
    'khoa-moi-truong': ['cong-nghe-ky-thuat-moi-truong', 'khoa-hoc-moi-truong', 'quan-ly-tai-nguyen-va-moi-truong'],
    'khoa-dien-tu-vien-thong': ['ky-thuat-dien-dien-tu', 'ky-thuat-dien-tu-vien-thong', 'cong-nghe-ban-dan', 'thiet-ke-vi-mach'],
};

export const ACADEMIC_YEAR_MAJOR_CATALOGS: AcademicYearMajorCatalog[] = [
    {
        cohortId: 'k24',
        label: 'Khóa 2024 (K24)',
        facultyMajors: K24_FACULTY_MAJORS,
    },
    {
        cohortId: 'k25',
        label: 'Khóa 2025 (K25)',
        // Khi K25 có ngành khác K24, sửa từng mảng phía dưới theo danh sách tuyển sinh thực tế.
        defaultProgramDataSource: 'k24',
        facultyMajors: {
            'khoa-cntt': [...K24_FACULTY_MAJORS['khoa-cntt']],
            'khoa-khoa-hoc-va-cong-nghe-vat-lieu': [...K24_FACULTY_MAJORS['khoa-khoa-hoc-va-cong-nghe-vat-lieu']],
            'khoa-toan': [...K24_FACULTY_MAJORS['khoa-toan']],
            'khoa-dia-chat': [...K24_FACULTY_MAJORS['khoa-dia-chat']],
            'khoa-ly': [...K24_FACULTY_MAJORS['khoa-ly']],
            'khoa-hoa': [...K24_FACULTY_MAJORS['khoa-hoa']],
            'khoa-sinh': [...K24_FACULTY_MAJORS['khoa-sinh']],
            'khoa-moi-truong': [...K24_FACULTY_MAJORS['khoa-moi-truong']],
            'khoa-dien-tu-vien-thong': [...K24_FACULTY_MAJORS['khoa-dien-tu-vien-thong']],
        },
    },
];

export function getAcademicYearMajorCatalog(cohortId: string) {
    return ACADEMIC_YEAR_MAJOR_CATALOGS.find((catalog) => catalog.cohortId === cohortId);
}

export function getProgramDataSourceCohort(cohortId: string) {
    return getAcademicYearMajorCatalog(cohortId)?.defaultProgramDataSource;
}
