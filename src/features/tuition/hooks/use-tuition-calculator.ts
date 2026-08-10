import { useMemo } from 'react';
import { useStudentDb } from '../../../hooks/useStudentDb';
import { useDepartmentData } from '../../../context/DepartmentContext';
import { readFromStorage } from '../../../helpers/localStorage/save';
import { STORAGE_KEYS } from '../../../config';
import { getTuitionDeadline } from '../../../config/tuitionDeadlines';
import { FinancialLogic } from '../services/financial-logic';
import type { TuitionCourse, TuitionSummary } from '../types';

export function useTuitionCalculator(selectedSemesterName: string) {
    const { registrations } = useStudentDb();
    const { data: { tuitionRates, courses: allCoursesMeta } } = useDepartmentData();

    return useMemo(() => {
        const targetSemester = FinancialLogic.parseSemesterName(selectedSemesterName);
        const studentDb = readFromStorage<any>(STORAGE_KEYS.STUDENT_DB, null);
        const importMeta = readFromStorage<any>(STORAGE_KEYS.IMPORT_META, null);

        const result = FinancialLogic.calculateTuitionData(
            targetSemester,
            selectedSemesterName,
            studentDb,
            importMeta,
            tuitionRates,
            allCoursesMeta
        );

        // Omit the 'source' from the returned object to match previous hook signature (or keep it, it's fine)
        return {
            courses: result.courses,
            summary: result.summary,
            isDataAvailable: result.isDataAvailable,
            registrationSemesterName: result.registrationSemesterName,
            missingMetaCourses: result.missingMetaCourses
        };
    }, [selectedSemesterName, registrations, tuitionRates, allCoursesMeta]);
}
