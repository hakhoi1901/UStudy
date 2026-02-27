import { useState, useEffect, useRef } from 'react';
import { useStudentGradeData } from '../../hooks/useStudentGradeData';
import { useAppNotification } from '../../context/NotificationContext';
import { NoDataCard } from '../../components/ui/nodataCard';
import { GPA_CONFIG, ACADEMIC_RULES } from '../../config';
import type { Course } from '../../types';
import { PrivacyFooter } from '../../components/PrivacyFooter';
import { GPAInformation } from './GPAInformation';
import { GPASimulation } from './GPASimulation';
import { RetakeCourses } from './RetakeCourses';
import { GradeHistory } from './GradeHistory';

// interface Course {
//   id: string;
//   code: string;
//   nameVi: string;
//   credits: number;
//   projectedGrade: number;
// }

export function GradeManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [expandedSection, setExpandedSection] = useState<'history' | 'simulator'>('simulator');
  const hasAlertedRef = useRef(false);

  const { gradesHistory, currentGPA, isReady, hasData } = useStudentGradeData();
  const { addNotification } = useAppNotification();

  // Lấy danh sách học kỳ
  const uniqueSemesters = Array.from(new Set(gradesHistory.map(g => g.semester))).sort((a, b) => b.localeCompare(a));

  // tính GPA dự kiến
  const calculateProjectedGPA = () => {
    // Tính tổng điểm hiện tại (điểm * tín chỉ)
    const currentTotalPoints = gradesHistory
      .filter(c => c.status === 'passed')
      .reduce((sum, c) => sum + (c.grade * c.credits), 0);
    // Tính tổng tín chỉ hiện tại
    const currentCredits = gradesHistory
      .filter(c => c.status === 'passed')
      .reduce((sum, c) => sum + c.credits, 0);

    // Tính tổng điểm dự kiến (điểm * tín chỉ)
    const projectedPoints = courses.reduce((sum, c) => sum + ((c.projectedGrade ?? 0) * c.credits), 0);
    // Tính tổng tín chỉ dự kiến
    const projectedCredits = courses.reduce((sum, c) => sum + c.credits, 0);

    // Tính tổng điểm và tổng tín chỉ
    const totalPoints = currentTotalPoints + projectedPoints;
    const totalCredits = currentCredits + projectedCredits;

    // Tính GPA dự kiến
    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  };

  const projectedGPA = calculateProjectedGPA();

  useEffect(() => {
    // Nếu có dữ liệu điểm, và mô phỏng GPA < ACADEMIC_RULES.GPA_WARNING_THRESHOLD
    // thì quăng 1 notification cảnh báo học vụ
    if (hasData && projectedGPA < ACADEMIC_RULES.GPA_WARNING_THRESHOLD && projectedGPA > 0 && !hasAlertedRef.current) {
      addNotification({
        title: 'Cảnh báo học vụ',
        message: `Chú ý: GPA dự kiến của bạn đang nằm ở mức ${getClassification(projectedGPA)}.`,
        type: 'warning'
      });
      hasAlertedRef.current = true; // Chỉ báo 1 lần tránh spam
    } else if (projectedGPA >= ACADEMIC_RULES.GPA_WARNING_THRESHOLD) {
      hasAlertedRef.current = false; // Reset nếu điểm tăng lại
    }
  }, [projectedGPA, hasData, addNotification]);

  // Lấy xếp loại dựa trên GPA
  const getClassification = (gpa: number) => {
    for (const config of GPA_CONFIG) {
      if (gpa >= config.value) return config.lable;
    }
    return GPA_CONFIG[GPA_CONFIG.length - 1].lable;
  };

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
  const filteredHistory = selectedSemester === 'all'
    ? gradesHistory
    : gradesHistory.filter(c => c.semester === selectedSemester);

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
      <GradeHistory filteredHistory={filteredHistory} selectedSemester={selectedSemester} setSelectedSemester={setSelectedSemester} uniqueSemesters={uniqueSemesters} />

      {/* Footer */}
      <PrivacyFooter />
    </div>
  );
}