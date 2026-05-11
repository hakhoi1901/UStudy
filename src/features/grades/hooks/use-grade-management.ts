import { useState, useEffect, useRef, useMemo } from 'react';
import { useDepartmentData } from '../../../context/DepartmentContext';
import { useAppNotification } from '../../../context/NotificationContext';
import { ACADEMIC_RULES } from '../../../constants';
import { useStudentGradeData } from './use-student-grade-data';
import { useGPASimulator } from './use-gpa-simulator';
import { GPACalculator } from '../services/gpa-calculator';

/**
 * Controller Hook cho trang Quản lý điểm.
 * Gom nhóm và xử lý logic phối hợp giữa các nguồn dữ liệu (Grades, Simulator, Department).
 */
export function useGradeManagement() {
    const [selectedSemester, setSelectedSemester] = useState('all');
    const [expandedSection, setExpandedSection] = useState<'history' | 'simulator'>('simulator');
    const [mobileActivePanel, setMobileActivePanel] = useState<'gpaPull' | 'gpaSimulation' | null>(null);
    const hasAlertedRef = useRef(false);

    const { data, currentFaculty, currentMajor, currentCohort } = useDepartmentData();
    const gradeData = useStudentGradeData();
    
    const {
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

    // Lọc lịch sử điểm theo kỳ được chọn
    const filteredHistory = useMemo(() => 
        selectedSemester === 'all'
            ? gradeData.gradesHistory
            : gradeData.gradesHistory.filter(c => c.semester === selectedSemester),
        [gradeData.gradesHistory, selectedSemester]
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
        semesterGPA,
        cumulativeGPA,
        uniqueSemesters,
        filteredHistory,
        retakeCoursesList,
        getClassification,
        
        // Context Info
        currentFaculty,
        currentMajor,
        currentCohort,

        // UI State & Actions
        selectedSemester,
        setSelectedSemester,
        expandedSection,
        setExpandedSection,
        mobileActivePanel,
        setMobileActivePanel,
        handleGradeChange
    };
}
