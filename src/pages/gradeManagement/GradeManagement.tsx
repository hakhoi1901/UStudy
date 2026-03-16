import { useState, useEffect, useRef } from 'react';
import { useStudentGradeData } from '../../hooks/useStudentGradeData';
import { useGPASimulator } from '../../hooks/useGPASimulator';
import { useDepartmentData } from '../../context/DepartmentContext';
import { useAppNotification } from '../../context/NotificationContext';
import { NoDataCard } from '../../components/nodataCard';
import { ACADEMIC_RULES } from '../../config';
// [TN] Thay bằng SimulatorCourseGrade từ useGPASimulator hook.
// Course type không còn dùng trực tiếp trong file này nữa vì danh sách môn
// giờ được build bên trong hook, không phải state ở đây.
// import type { Course } from '../../types';
import { PrivacyFooter } from '../../components/PrivacyFooter';
import { GPAInformation } from './GPAInformation';
import { GPAPullTool } from './GPAPullTool';
import { GPASimulation } from './GPASimulation';
import { RetakeCourses } from './RetakeCourses';
import { GradeHistory } from './GradeHistory';
import { GPACalculator } from '../../logic/GPACalculator';
import { GPAsem } from './GPAsem';

export function GradeManagement() {
  // [TN] Thay bằng simulatorCourses từ useGPASimulator — hook tự build danh sách
  // từ gradesHistory (ongoing) + studentDb.registrations (ĐKHP).
  // const [courses, setCourses] = useState<Course[]>([]);
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [expandedSection, setExpandedSection] = useState<'history' | 'simulator'>('simulator');
  const hasAlertedRef = useRef(false);

  const { data } = useDepartmentData();
  const { gradesHistory, currentGPA, accumulatedCredits, totalCredits, isReady, hasData, gpaPerSemester, majorGPA } = useStudentGradeData();
  // [TN] Truyền data.courses để hook lookup tín chỉ.
  // semesterGPA: GPA của học kỳ hiện tại
  // cumulativeGPA: GPA tích lũy
  const { simulatorCourses, handleGradeChange, semesterGPA, cumulativeGPA } = useGPASimulator(gradesHistory, data.courses);
  const { addNotification } = useAppNotification();

  // Lấy danh sách học kỳ
  const uniqueSemesters = Array.from(new Set(gradesHistory.map(g => g.semester))).sort((a, b) => b.localeCompare(a));

  // [TN] Logic tính projectedGPA đã chuyển vào useGPASimulator hook.
  // Hook tự tính dựa trên simulatorCourses (có dữ liệu thật từ ongoing + ĐKHP),
  // const projectedGPA = GPACalculator.calculateProjectedGPA(
  //   gradesHistory,
  //   courses.map(c => ({ credits: c.credits, projectedGrade: c.projectedGrade ?? 0 }))
  // );

  // Xếp loại học lực bằng Domain Service
  const getClassification = GPACalculator.getClassification;

  useEffect(() => {
    if (hasData && cumulativeGPA < ACADEMIC_RULES.GPA_WARNING_THRESHOLD && cumulativeGPA > 0 && !hasAlertedRef.current) {
      addNotification({
        title: 'Cảnh báo học vụ',
        message: `Chú ý: GPA dự kiến của bạn đang nằm ở mức ${getClassification(cumulativeGPA)}.`,
        type: 'warning'
      });
      hasAlertedRef.current = true;
    } else if (cumulativeGPA >= ACADEMIC_RULES.GPA_WARNING_THRESHOLD) {
      hasAlertedRef.current = false;
    }
  }, [cumulativeGPA, hasData, addNotification]);

  // [TN-FIX] handleGradeChange đã chuyển vào useGPASimulator hook.
  // Hook mới: cập nhật state + lưu ngay vào localStorage (persist qua reload).
  // Code cũ chỉ cập nhật React state → mất khi reload trang
  // const handleGradeChange = (id: string, value: string) => {
  //   const numValue = parseFloat(value);
  //   if (numValue >= 0 && numValue <= 10) {
  //     setCourses(courses.map(course =>
  //       course.id === id ? { ...course, projectedGrade: numValue } : course
  //     ));
  //   }
  // };

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
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">Quản lý điểm</h1>
        <p className="text-gray-600">Xem điểm số, mô phỏng GPA và theo dõi các môn học cần học lại.</p>
      </div>

      {/* Thông tin GPA */}
      <GPAInformation currentGPA={currentGPA} projectedGPA={cumulativeGPA} majorGPA={majorGPA} />

      {/* GPA theo học kỳ */}
      <GPAsem currentGPA={currentGPA} projectedGPA={cumulativeGPA} getClassification={getClassification} gpaPerSemester={gpaPerSemester} majorGPA={majorGPA} />

      {/* Công cụ "Kéo" GPA: nhập GPA mục tiêu → điểm TB tối thiểu + bảng môn theo kỳ */}
      <GPAPullTool
        gradesHistory={gradesHistory}
        getClassification={getClassification}
        simulatorCourses={simulatorCourses}
        handleGradeChange={handleGradeChange}
        currentGPA={currentGPA}
        accumulatedCredits={accumulatedCredits}
        totalCredits={totalCredits}
      />

      {/* Mô phỏng GPA - Học kỳ tiếp theo */}
      <GPASimulation courses={simulatorCourses} expandedSection={expandedSection} setExpandedSection={setExpandedSection} semesterGPA={semesterGPA} cumulativeGPA={cumulativeGPA} getClassification={getClassification} handleGradeChange={handleGradeChange} />

      {/* Danh sách môn học cần học lại (Nếu có) */}
      {retakeCourses.length > 0 && (
        <RetakeCourses retakeCourses={retakeCourses} />
      )}

      {/* Lịch sử điểm */}
      <GradeHistory filteredHistory={filteredHistory} selectedSemester={selectedSemester} uniqueSemesters={uniqueSemesters} setSelectedSemester={setSelectedSemester} />

      {/* Footer */}
      <PrivacyFooter />
    </div>
  );
}