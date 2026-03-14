import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { APP_CONFIG, STORAGE_KEYS } from '../config';
import {
    FACULTIES,
    DEFAULT_FACULTY_ID,
    DEFAULT_MAJOR_ID,
    DEFAULT_COHORT_ID,
    loadCohortData,
} from '../assets/registry';
import {
    ACADEMIC_YEARS,
    DEFAULT_ACADEMIC_YEAR,
    getTuitionRates,
} from '../assets/data/tuition';
import type { FacultyInfo, MajorInfo, CohortInfo } from '../assets/registry';

// Fallback: import trực tiếp data mặc định để tránh loading flash lần đầu
import { courses as defaultCourses } from '../assets/data/khoa-cntt/cong-nghe-thong-tin/k24/courses';
import { prerequisites as defaultPrerequisites } from '../assets/data/khoa-cntt/cong-nghe-thong-tin/k24/prerequisites';
import { categories as defaultCategories } from '../assets/data/khoa-cntt/cong-nghe-thong-tin/k24/categories';

/**
 * Interface cho DepartmentData
 */
interface DepartmentData {
    /** Danh sách môn học */
    courses: any[];
    /** Điều kiện tiên quyết */
    prerequisites: any[];
    /** Học phí */
    tuitionRates: any;
    /** Danh mục môn học */
    categories: any;
}

/**
 * Interface cho DepartmentContextType
 */
interface DepartmentContextType {
    /**
     * Data
     */
    data: DepartmentData;
    /**
     * Loading state
     */
    isLoading: boolean;

    /**
     * Selection
     */
    facultyId: string;
    majorId: string;
    cohortId: string;
    academicYear: string;
    semesterNumber: number;
    currentFaculty: FacultyInfo | undefined;
    currentMajor: MajorInfo | undefined;
    currentCohort: CohortInfo | undefined;
    faculties: FacultyInfo[];
    academicYears: typeof ACADEMIC_YEARS;
    isConfigured: boolean;

    // Actions
    /**
     * Set khoa
     */
    setFaculty: (facultyId: string) => void;
    /**
     * Set ngành
     */
    setMajor: (majorId: string) => void;
    /**
     * Set khóa tuyển
     */
    setCohort: (cohortId: string) => void;
    /**
     * Set năm học
     */
    setAcademicYear: (year: string) => void;
    /**
     * Set học kỳ
     */
    setSemesterNumber: (semesterNumber: number) => void;
    /**
     * Set cấu hình
     */
    setIsConfigured: (isConfigured: boolean) => void;
}

/**
 * Default tuition rates
 */
const defaultTuitionRates = getTuitionRates(DEFAULT_ACADEMIC_YEAR, DEFAULT_MAJOR_ID);

/**
 * Default data
 */
const defaultData: DepartmentData = {
    courses: defaultCourses,
    prerequisites: defaultPrerequisites,
    tuitionRates: defaultTuitionRates,
    categories: defaultCategories,
};

/**
 * DepartmentContext
 */
const DepartmentContext = createContext<DepartmentContextType>({
    /**
     * Data
     */
    data: defaultData,
    /**
     * Loading state
     */
    isLoading: false,
    /**
     * Khoa
     */
    facultyId: DEFAULT_FACULTY_ID,
    /**
     * Ngành
     */
    majorId: DEFAULT_MAJOR_ID,
    /**
     * Khóa tuyển
     */
    cohortId: DEFAULT_COHORT_ID,
    /**
     * Năm học
     */
    academicYear: APP_CONFIG.DEFAULT_ACADEMIC_YEAR,
    /**
     * Học kỳ
     */
    semesterNumber: APP_CONFIG.DEFAULT_SEMESTER,
    /**
     * Khoa hiện tại
     */
    currentFaculty: FACULTIES[0],
    /**
     * Ngành hiện tại
     */
    currentMajor: FACULTIES[0]?.majors[0],
    /**
     * Khóa tuyển hiện tại
     */
    currentCohort: FACULTIES[0]?.majors[0]?.cohorts[0],
    /**
     * Danh sách khoa
     */
    faculties: FACULTIES,
    /**
     * Danh sách năm học
     */
    academicYears: ACADEMIC_YEARS,
    /**
     * Cấu hình
     */
    isConfigured: false,
    /**
     * Set khoa
     */
    setFaculty: () => { },
    /**
     * Set ngành
     */
    setMajor: () => { },
    /**
     * Set khóa tuyển
     */
    setCohort: () => { },
    /**
     * Set năm học
     */
    setAcademicYear: () => { },
    /**
     * Set học kỳ
     */
    setSemesterNumber: () => { },
    /**
     * Set cấu hình
     */
    setIsConfigured: () => { },
});

/**
 * DepartmentProvider
 */
export function DepartmentProvider({ children }: { children: React.ReactNode }) {
    const [facultyId, setFacultyIdState] = useState<string>(() => {
        return localStorage.getItem(STORAGE_KEYS.FACULTY_ID) || DEFAULT_FACULTY_ID;
    });
    const [majorId, setMajorIdState] = useState<string>(() => {
        return localStorage.getItem(STORAGE_KEYS.MAJOR_ID) || DEFAULT_MAJOR_ID;
    });
    const [cohortId, setCohortIdState] = useState<string>(() => {
        return localStorage.getItem(STORAGE_KEYS.COHORT_ID) || DEFAULT_COHORT_ID;
    });
    const [academicYear, setAcademicYearState] = useState<string>(() => {
        return localStorage.getItem(STORAGE_KEYS.ACADEMIC_YEAR) || APP_CONFIG.DEFAULT_ACADEMIC_YEAR;
    });
    const [semesterNumber, setSemesterNumberState] = useState<number>(() => {
        return parseInt(localStorage.getItem(STORAGE_KEYS.ACADEMIC_SEMESTER) || APP_CONFIG.DEFAULT_SEMESTER.toString());
    });
    const [data, setData] = useState<DepartmentData>(defaultData);
    const [isLoading, setIsLoading] = useState(false);

    const [isConfigured, setIsConfiguredState] = useState<boolean>(() => {
        return localStorage.getItem(STORAGE_KEYS.DEPARTMENT_CONFIGURED) === 'true';
    });

    const setIsConfigured = (value: boolean) => {
        localStorage.setItem(STORAGE_KEYS.DEPARTMENT_CONFIGURED, value ? 'true' : 'false');
        setIsConfiguredState(value);
    };

    const currentFaculty = FACULTIES.find(f => f.id === facultyId);
    const currentMajor = currentFaculty?.majors.find(m => m.id === majorId);
    const currentCohort = currentMajor?.cohorts.find(c => c.id === cohortId);

    // Load data khi faculty/major/cohort/academicYear thay đổi
    const loadData = useCallback(async (fId: string, mId: string, cId: string, year: string) => {
        // Tuition luôn sync (đã import sẵn)
        const tuitionRates = getTuitionRates(year, mId);

        // Nếu đang ở default → dùng data đã import sẵn
        if (fId === DEFAULT_FACULTY_ID && mId === DEFAULT_MAJOR_ID && cId === DEFAULT_COHORT_ID) {
            setData({ ...defaultData, tuitionRates });
            return;
        }

        setIsLoading(true);
        try {
            const cohortData = await loadCohortData(fId, mId, cId);
            setData({ ...cohortData, tuitionRates });
        } catch (err) {
            console.error('[DepartmentContext] Failed to load data:', err);
            // Nếu không load được (chưa có data cho khoa/ngành này), trả về rỗng để hiển thị Empty State
            setData({
                courses: [],
                prerequisites: [],
                categories: {},
                tuitionRates
            });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData(facultyId, majorId, cohortId, academicYear);
    }, [facultyId, majorId, cohortId, academicYear, loadData]);

    const setFaculty = (newFacultyId: string) => {
        localStorage.setItem(STORAGE_KEYS.FACULTY_ID, newFacultyId);
        setFacultyIdState(newFacultyId);

        const newFaculty = FACULTIES.find(f => f.id === newFacultyId);
        const firstMajor = newFaculty?.majors[0];
        const firstMajorId = firstMajor?.id || '';
        localStorage.setItem(STORAGE_KEYS.MAJOR_ID, firstMajorId);
        setMajorIdState(firstMajorId);

        const firstCohortId = firstMajor?.cohorts[0]?.id || '';
        localStorage.setItem(STORAGE_KEYS.COHORT_ID, firstCohortId);
        setCohortIdState(firstCohortId);
    };

    const setMajor = (newMajorId: string) => {
        localStorage.setItem(STORAGE_KEYS.MAJOR_ID, newMajorId);
        setMajorIdState(newMajorId);

        const newMajor = currentFaculty?.majors.find(m => m.id === newMajorId);
        const firstCohortId = newMajor?.cohorts[0]?.id || '';
        localStorage.setItem(STORAGE_KEYS.COHORT_ID, firstCohortId);
        setCohortIdState(firstCohortId);
    };

    const setCohort = (newCohortId: string) => {
        localStorage.setItem(STORAGE_KEYS.COHORT_ID, newCohortId);
        setCohortIdState(newCohortId);
    };

    const setAcademicYear = (year: string) => {
        localStorage.setItem(STORAGE_KEYS.ACADEMIC_YEAR, year);
        setAcademicYearState(year);
    };

    const setSemesterNumber = (num: number) => {
        localStorage.setItem(STORAGE_KEYS.ACADEMIC_SEMESTER, num.toString());
        setSemesterNumberState(num);
    };

    return (
        <DepartmentContext.Provider value={{
            data,
            isLoading,
            facultyId,
            majorId,
            cohortId,
            academicYear,
            semesterNumber,
            currentFaculty,
            currentMajor,
            currentCohort,
            faculties: FACULTIES,
            academicYears: ACADEMIC_YEARS,
            isConfigured,
            setFaculty,
            setMajor,
            setCohort,
            setAcademicYear,
            setSemesterNumber,
            setIsConfigured,
        }}>
            {children}
        </DepartmentContext.Provider>
    );
}

/**
 * Hook để lấy data Khoa/Ngành/Khóa/Năm học hiện tại.
 */
export function useDepartmentData() {
    return useContext(DepartmentContext);
}
