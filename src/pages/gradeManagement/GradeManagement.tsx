import { useState, useEffect, useRef } from 'react';
import { useStudentGradeData } from '../../hooks/useStudentGradeData';
import { useDepartmentData } from '../../context/DepartmentContext';
import { useAppNotification } from '../../context/NotificationContext';
import { NoDataCard } from '../../components/nodataCard';
import { ACADEMIC_RULES } from '../../config';
import type { Course } from '../../types';
import { PrivacyFooter } from '../../components/PrivacyFooter';
import { GPAInformation } from './GPAInformation';
import { GPASimulation } from './GPASimulation';
import { RetakeCourses } from './RetakeCourses';
import { GradeHistory } from './GradeHistory';
import { GPACalculator } from '../../logic/GPACalculator';

export function GradeManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const { academicYear, semesterNumber } = useDepartmentData();

  const selectedSemester = `HK${semesterNumber} ${academicYear}`;
  const [expandedSection, setExpandedSection] = useState<'history' | 'simulator'>('simulator');
  const hasAlertedRef = useRef(false);

  const { gradesHistory, currentGPA, isReady, hasData } = useStudentGradeData();
  const { addNotification } = useAppNotification();

  // Lấy danh sách học kỳ
  // Lấy danh sách học kỳ (Currently disabled filter, kept for reference)
  // const uniqueSemesters = Array.from(new Set(gradesHistory.map(g => g.semester))).sort((a, b) => b.localeCompare(a));

  // Tính GPA dự kiến bằng Domain Service
  const projectedGPA = GPACalculator.calculateProjectedGPA(
    gradesHistory,
    courses.map(c => ({ credits: c.credits, projectedGrade: c.projectedGrade ?? 0 }))
  );

  // Xếp loại học lực bằng Domain Service
  const getClassification = GPACalculator.getClassification;

  useEffect(() => {
    if (hasData && projectedGPA < ACADEMIC_RULES.GPA_WARNING_THRESHOLD && projectedGPA > 0 && !hasAlertedRef.current) {
      addNotification({
        title: 'Cảnh báo học vụ',
        message: `Chú ý: GPA dự kiến của bạn đang nằm ở mức ${getClassification(projectedGPA)}.`,
        type: 'warning'
      });
      hasAlertedRef.current = true;
    } else if (projectedGPA >= ACADEMIC_RULES.GPA_WARNING_THRESHOLD) {
      hasAlertedRef.current = false;
    }
  }, [projectedGPA, hasData, addNotification]);

  // Xử lý thay đổi điểm dự kiến
  const handleGradeChange = (id: string, value: string) => {
    const numValue = parseFloat(value);
    if (numValue >= 0 && numValue <= 10) {
      setCourses(courses.map(course =>
        course.id === id ? { ...course, projectedGrade: numValue } : course
      ));
    }
  };

  // Lọc danh sách điểm theo học kỳ
  const yearShort = academicYear.length >= 9 ? academicYear.substring(2, 4) + "-" + academicYear.substring(7, 9) : academicYear;
  const yearStart = academicYear.substring(0, 4);

  const filteredHistory = selectedSemester === 'all'
    ? gradesHistory
    : gradesHistory.filter(c => {
      const checkSemester = c.semester || '';
      const semStr = semesterNumber.toString();
      const hasSem = new RegExp(`(?:^|\\D)${semStr}(?:\\D|$)`, 'i').test(checkSemester) || checkSemester.includes('HK' + semStr);
      const hasYear = checkSemester.includes(academicYear) || checkSemester.includes(yearShort) || checkSemester.includes(yearStart);
      return hasSem && hasYear;
    });

  // Lấy danh sách các môn học cần học lại
  const retakeCourses = gradesHistory.filter(c => c.needsRetake && c.status === 'retake');

  // Hiển thị loading khi chưa có dữ liệu
  if (!isReady) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004A98]"></div>
      </div>
    );
  }

  // Hiển thị thông báo nếu không có dữ liệu
  if (!hasData) {
    return <div>
      <h1 className="text-gray-900 mb-2">Quản lý điểm</h1>
      <p className="text-gray-600 mb-8">Xem điểm số, mô phỏng GPA và theo dõi các môn học cần học lại.</p>
      <NoDataCard />
    </div>
  }

  // Render giao diện quản lý điểm
  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">Quản lý điểm</h1>
        <p className="text-gray-600">Xem điểm số, mô phỏng GPA và theo dõi các môn học cần học lại.</p>
      </div>

      {/* Thông tin GPA */}
      <GPAInformation currentGPA={currentGPA} projectedGPA={projectedGPA} getClassification={getClassification} />

      {/* Mô phỏng GPA - Học kỳ tiếp theo */}
      <GPASimulation courses={courses} expandedSection={expandedSection} setExpandedSection={setExpandedSection} projectedGPA={projectedGPA} getClassification={getClassification} handleGradeChange={handleGradeChange} />

      {/* Danh sách môn học cần học lại (Nếu có) */}
      {retakeCourses.length > 0 && (
        <RetakeCourses retakeCourses={retakeCourses} />
      )}

      {/* Lịch sử điểm */}
      <GradeHistory filteredHistory={filteredHistory} selectedSemester={selectedSemester} />

      {/* Footer */}
      <PrivacyFooter />
    </div>
  );
}