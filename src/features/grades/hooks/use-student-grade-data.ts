import { useState, useEffect, useMemo } from 'react';
import { readFromStorage } from '../../../helpers/localStorage/save';
import { STORAGE_KEYS } from '../../../config';
import { ACADEMIC_RULES } from '../../../constants';
import { AcademicRulesEngine } from '../services/academic-rules-engine';
import { FinancialLogic } from '../../tuition';
import { useDepartmentData } from '../../../context/DepartmentContext';

export function useStudentGradeData() {
    const { data: { tuitionRates, courses: allCoursesMeta }, academicYear, semesterNumber } = useDepartmentData();
    const [stamp, setStamp] = useState(Date.now());
    const [isReady, setIsReady] = useState(false);
    const [hasData, setHasData] = useState(false);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data && (
                event.data.type === 'IMPORT_FULL_DATA' ||
                event.data.type === 'CACHE_POPULATED'
            )) {
                setStamp(Date.now());
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // Build selected semester key, e.g. "2024-2025" + sem 2 → "24-25/2"
    const selectedSemesterKey = useMemo(() => {
        const y = String(academicYear);
        if (y.length === 9) {
            return `${y.substring(2, 4)}-${y.substring(7, 9)}/${semesterNumber}`;
        }
        return `${y}/${semesterNumber}`;
    }, [academicYear, semesterNumber]);

    const gradeData = useMemo(() => {
        setIsReady(false);

        const studentDb = readFromStorage<any>(STORAGE_KEYS.STUDENT_DB, null);

        if (!studentDb || !studentDb.grades) {
            setHasData(false);
            setIsReady(true);
            return { gradesHistory: [], currentGPA: 0, accumulatedCredits: 0, totalCredits: ACADEMIC_RULES.TOTAL_CREDITS, estimatedTuition: 0, tuitionSource: 'none' as const };
        }

        setHasData(true);

        const hasBLMExemption = AcademicRulesEngine.checkBLMExemption(studentDb.grades);
        const effectiveGrades = AcademicRulesEngine.resolveEffectiveGrades(studentDb.grades);

        // ── GPA Summary: delegate to AcademicRulesEngine ──
        const {
            gradesHistory,
            currentGPA,
            accumulatedCredits,
            gpaPerSemester,
            majorGPA,
            foundationGPA,
            majorSpecializedGPA
        } = AcademicRulesEngine.calculateGPASummary(studentDb.grades, effectiveGrades, hasBLMExemption, allCoursesMeta);

        // ── BLM Exemption ghost courses ──
        const ghostCourses = AcademicRulesEngine.buildExemptedGhostCourses(effectiveGrades, hasBLMExemption);
        gradesHistory.push(...ghostCourses);

        const totalCredits = ACADEMIC_RULES.TOTAL_CREDITS;

        // ── Tuition estimation: delegate to FinancialLogic ──
        const importMeta = readFromStorage<any>(STORAGE_KEYS.IMPORT_META, null);
        const { estimatedTuition, tuitionSource } = FinancialLogic.estimateTuitionFromSources(
            studentDb, importMeta, allCoursesMeta, tuitionRates, selectedSemesterKey
        );

        setIsReady(true);
        return {
            gradesHistory,
            currentGPA,
            accumulatedCredits,
            totalCredits,
            estimatedTuition,
            tuitionSource,
            gpaPerSemester,
            majorGPA,
            foundationGPA,
            majorSpecializedGPA,
        };

    // selectedSemesterKey added so memo re-runs when user changes semester
    }, [stamp, tuitionRates, allCoursesMeta, selectedSemesterKey]);

    return { ...gradeData, isReady, hasData };
}
