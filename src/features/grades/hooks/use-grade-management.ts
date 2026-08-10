import { useState, useEffect, useRef, useMemo } from 'react';
import { useDepartmentData } from '../../../context/DepartmentContext';
import { useAppNotification } from '../../../context/NotificationContext';
import { ACADEMIC_RULES } from '../../../constants';
import { useStudentGradeData } from './use-student-grade-data';
import { useGPASimulator } from './use-gpa-simulator';
import { GPACalculator } from '../services/gpa-calculator';
import {
    applyGradeHistoryFilters,
    buildGradeHistoryCategoryIndex,
    createEmptyGradeHistoryFilters,
    UNCATEGORIZED_CATEGORY_ID,
} from '../services/grade-history-filter';
import type { GradeHistoryFilters } from '../types';

/**
 * Controller Hook cho trang Quản lý điểm.
 * Gom nhóm và xử lý logic phối hợp giữa các nguồn dữ liệu (Grades, Simulator, Department).
 */
export function useGradeManagement() {
    const [selectedSemester, setSelectedSemester] = useState('all');
    const [historyFilters, setHistoryFilters] = useState<GradeHistoryFilters>(createEmptyGradeHistoryFilters);
    const hasAlertedRef = useRef(false);

    const { data, currentFaculty, currentMajor, currentCohort } = useDepartmentData();
    const gradeData = useStudentGradeData();
    
    const {
        projectionSemesters,
        selectedProjectionSemester,
        selectedProjectionSemesterId,
        setSelectedProjectionSemesterId,
        simulatorCourses,
        handleGradeChange,
        semesterGPA,
        cumulativeGPA
    } = useGPASimulator(gradeData.gradesHistory, data.courses);

    const { addNotification } = useAppNotification();

    // Xếp loại học lực
    const getClassification = GPACalculator.getClassification;

    // Danh sách học kỳ duy nhất để lọc
    const uniqueSemesters = useMemo(() => 
        Array.from(new Set(gradeData.gradesHistory.map(g => g.semester)))
            .sort((a, b) => b.localeCompare(a)),
        [gradeData.gradesHistory]
    );

    // Xử lý thông báo cảnh báo GPA
    useEffect(() => {
        if (gradeData.hasData && cumulativeGPA < ACADEMIC_RULES.GPA_WARNING_THRESHOLD && cumulativeGPA > 0 && !hasAlertedRef.current) {
            addNotification({
                title: 'Cảnh báo học vụ',
                message: `Chú ý: GPA dự kiến của bạn đang nằm ở mức ${getClassification(cumulativeGPA)}.`,
                type: 'warning'
            });
            hasAlertedRef.current = true;
        } else if (cumulativeGPA >= ACADEMIC_RULES.GPA_WARNING_THRESHOLD) {
            hasAlertedRef.current = false;
        }
    }, [cumulativeGPA, gradeData.hasData, addNotification, getClassification]);

    const categoryIndex = useMemo(
        () => buildGradeHistoryCategoryIndex(data.categories),
        [data.categories]
    );

    useEffect(() => {
        setHistoryFilters((current) => {
            const categoryIds = current.categoryIds.filter((id) => (
                id === UNCATEGORIZED_CATEGORY_ID || categoryIndex.courseCodesByCategory.has(id)
            ));
            return categoryIds.length === current.categoryIds.length
                ? current
                : { ...current, categoryIds };
        });
    }, [categoryIndex]);

    // Học kỳ là phạm vi dữ liệu độc lập với các điều kiện trong bộ lọc.
    const semesterScopedHistory = useMemo(() =>
        selectedSemester === 'all'
            ? gradeData.gradesHistory
            : gradeData.gradesHistory.filter(c => c.semester === selectedSemester),
        [gradeData.gradesHistory, selectedSemester]
    );

    const filteredHistory = useMemo(
        () => applyGradeHistoryFilters(semesterScopedHistory, historyFilters, categoryIndex),
        [semesterScopedHistory, historyFilters, categoryIndex]
    );

    // Danh sách môn cần học lại
    const retakeCoursesList = useMemo(() => 
        gradeData.gradesHistory.filter(c => c.needsRetake && c.status === 'retake'),
        [gradeData.gradesHistory]
    );

    return {
        // Data
        ...gradeData,
        simulatorCourses,
        projectionSemesters,
        selectedProjectionSemester,
        selectedProjectionSemesterId,
        setSelectedProjectionSemesterId,
        semesterGPA,
        cumulativeGPA,
        uniqueSemesters,
        semesterScopedHistory,
        filteredHistory,
        historyFilters,
        setHistoryFilters,
        categoryIndex,
        retakeCoursesList,
        getClassification,
        
        // Context Info
        currentFaculty,
        currentMajor,
        currentCohort,

        // UI State & Actions
        selectedSemester,
        setSelectedSemester,
        handleGradeChange
    };
}
