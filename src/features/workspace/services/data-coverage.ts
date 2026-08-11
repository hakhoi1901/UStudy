import {
    FACULTIES,
    resolveDataCohort,
    type CohortInfo,
    type FacultyInfo,
    type MajorInfo,
} from '../../../assets/registry';
import { ACADEMIC_YEARS, getTuitionRates } from '../../../assets/data/tuition';
import { getAcademicYearMajorCatalog, getProgramDataSourceCohort } from '../../../assets/data/academic-year-majors';

export type ProgramDataKind = 'courses' | 'prerequisites' | 'categories';

export interface ProgramDataAsset {
    id: ProgramDataKind;
    label: string;
    fileName: string;
    path: string;
    present: boolean;
}

export interface MajorDataCoverage {
    faculty: FacultyInfo;
    major: MajorInfo;
    cohort: CohortInfo;
    sourceCohort: string;
    assets: ProgramDataAsset[];
    availableCount: number;
    tuitionYears: number;
    majorTuitionYears: number;
}

const PROGRAM_FILES: Array<Pick<ProgramDataAsset, 'id' | 'label' | 'fileName'>> = [
    { id: 'courses', label: 'Chương trình đào tạo', fileName: 'courses.ts' },
    { id: 'prerequisites', label: 'Môn tiên quyết', fileName: 'prerequisites.ts' },
    { id: 'categories', label: 'Khung chương trình', fileName: 'categories.ts' },
];

// Chỉ dùng trong Workspace nội bộ. Danh sách file do Vite tạo từ đúng assets đang có.
const dataAssetPaths = Object.keys(import.meta.glob('../../../assets/data/**/*.ts'))
    .map((path) => path.replace(/\\/g, '/'));

function hasDataFile(relativePath: string) {
    return dataAssetPaths.some((path) => path.endsWith(`/assets/data/${relativePath}`));
}

function getCohortInfo(major: MajorInfo, cohortId: string) {
    return major.cohorts.find((cohort) => cohort.id === cohortId) ?? major.cohorts[0];
}

export function getProgramAssets(facultyId: string, majorId: string, cohortId: string): ProgramDataAsset[] {
    const sourceCohort = getProgramDataSourceCohort(cohortId) ?? resolveDataCohort(facultyId, majorId, cohortId);

    return PROGRAM_FILES.map((file) => {
        const path = `${facultyId}/${majorId}/${sourceCohort}/${file.fileName}`;
        return {
            ...file,
            path,
            present: hasDataFile(path),
        };
    });
}

export function getMajorDataCoverage(faculty: FacultyInfo, major: MajorInfo, cohortId = 'k24'): MajorDataCoverage {
    const cohort = getCohortInfo(major, cohortId);
    const assets = getProgramAssets(faculty.id, major.id, cohort.id);
    const tuition = ACADEMIC_YEARS.map((year) => getTuitionRates(year.id, major.id));

    return {
        faculty,
        major,
        cohort,
        sourceCohort: getProgramDataSourceCohort(cohort.id) ?? resolveDataCohort(faculty.id, major.id, cohort.id),
        assets,
        availableCount: assets.filter((asset) => asset.present).length,
        tuitionYears: tuition.length,
        majorTuitionYears: tuition.filter((entry) => Object.keys(entry.rates).length > 0).length,
    };
}

export function getAllMajorDataCoverage(cohortId: string) {
    const catalog = getAcademicYearMajorCatalog(cohortId);
    if (!catalog) return [];

    return FACULTIES.flatMap((faculty) => (catalog.facultyMajors[faculty.id] ?? []).flatMap((majorId) => {
        const major = faculty.majors.find((item) => item.id === majorId);
        return major ? [getMajorDataCoverage(faculty, major, cohortId)] : [];
    }));
}

export function getCollectionSize(value: unknown) {
    if (Array.isArray(value)) return value.length;
    if (value && typeof value === 'object') return Object.keys(value).length;
    return 0;
}
