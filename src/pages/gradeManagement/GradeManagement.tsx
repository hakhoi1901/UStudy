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
import { FileDown, TrendingUp, BarChart2, X } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { TranscriptPDF } from '../../components/TranscriptPDF';
import { readFromStorage } from '../../helpers/localStorage/save';
import { STORAGE_KEYS } from '../../config';

export function GradeManagement() {
  // [TN] Thay bằng simulatorCourses từ useGPASimulator — hook tự build danh sách
  // từ gradesHistory (ongoing) + studentDb.registrations (ĐKHP).
  // const [courses, setCourses] = useState<Course[]>([]);
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [expandedSection, setExpandedSection] = useState<'history' | 'simulator'>('simulator');
  const [mobileActivePanel, setMobileActivePanel] = useState<'gpaPull' | 'gpaSimulation' | null>(null);
  const hasAlertedRef = useRef(false);

  const { data } = useDepartmentData();
  const { 
    gradesHistory, 
    currentGPA, 
    accumulatedCredits, 
    totalCredits, 
    isReady, 
    hasData, 
    gpaPerSemester, 
    foundationGPA,
    majorSpecializedGPA
  } = useStudentGradeData();
  // [TN] Truyền data.courses để hook lookup tín chỉ.
  // semesterGPA: GPA của học kỳ hiện tại
  // cumulativeGPA: GPA tích lũy
  const { simulatorCourses, handleGradeChange, semesterGPA, cumulativeGPA } = useGPASimulator(gradesHistory, data.courses);
  const { addNotification } = useAppNotification();
  const { currentFaculty, currentMajor, currentCohort } = useDepartmentData();
  const studentDb = readFromStorage<any>(STORAGE_KEYS.STUDENT_DB, null);

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
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-gray-900 mb-2">Quản lý điểm</h1>
          <p className="text-gray-600">Xem điểm số, mô phỏng GPA và theo dõi các môn học cần học lại.</p>
        </div>
        
        {hasData && (
          <PDFDownloadLink 
            document={
              <TranscriptPDF 
                data={{
                  studentInfo: {
                    fullName: studentDb?.name || "N/A",
                    dob: studentDb?.dob || "---",
                    studentId: studentDb?.id || "---",
                    course: currentCohort?.name || "---",
                    program: currentFaculty?.name || "---",
                    major: currentMajor?.name || "---",
                  },
                  courses: gradesHistory.map((g, idx) => ({
                    no: idx + 1,
                    id: g.code,
                    title: g.nameVi,
                    credits: g.credits,
                    score10: g.grade,
                    score4: (g.grade >= 9 ? 4.0 : g.grade >= 8 ? 3.5 : g.grade >= 7 ? 3.0 : g.grade >= 6.5 ? 2.5 : g.grade >= 5 ? 2.0 : 0.0).toFixed(1)
                  })),
                  summary: {
                    totalCredits: accumulatedCredits,
                    gpa10: currentGPA.toFixed(2),
                    gpa4: (currentGPA >= 9 ? 4.0 : currentGPA >= 8 ? 3.5 : currentGPA >= 7 ? 3.0 : currentGPA >= 6.5 ? 2.5 : currentGPA >= 5 ? 2.0 : 0.0).toFixed(2)
                  }
                }} 
              />
            } 
            fileName={`BangDiem_${studentDb?.name || 'SinhVien'}.pdf`}
          >
            {({ loading }) => (
              <button
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-[#004A98] text-white rounded-lg hover:bg-[#003B7A] transition-colors shadow-sm disabled:opacity-50"
              >
                <FileDown className="w-4 h-4" />
                {loading ? 'Đang chuẩn bị...' : 'Xuất bảng điểm'}
              </button>
            )}
          </PDFDownloadLink>
        )}
      </div>

      {/* Thông tin GPA */}
      <GPAInformation 
        currentGPA={currentGPA} 
        projectedGPA={cumulativeGPA} 
        majorGPA={foundationGPA} 
        majorSpecializedGPA={majorSpecializedGPA} 
      />

      {/* GPA theo học kỳ */}
      <GPAsem 
        currentGPA={currentGPA} 
        projectedGPA={cumulativeGPA} 
        getClassification={getClassification} 
        gpaPerSemester={gpaPerSemester} 
        majorGPA={foundationGPA} 
        majorSpecializedGPA={majorSpecializedGPA} 
      />

      {/* Mobile Feature Buttons (chỉ hiện trên mobile) */}
      <div className="md:hidden grid grid-cols-2 gap-3">
        <button
          onClick={() => setMobileActivePanel(mobileActivePanel === 'gpaPull' ? null : 'gpaPull')}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all shadow-sm ${
            mobileActivePanel === 'gpaPull'
              ? 'bg-[#004A98] text-white border-[#004A98]'
              : 'bg-white text-gray-700 border-gray-200 hover:border-[#004A98] hover:text-[#004A98]'
          }`}
        >
          <TrendingUp className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-medium">Kéo GPA</span>
        </button>
        <button
          onClick={() => setMobileActivePanel(mobileActivePanel === 'gpaSimulation' ? null : 'gpaSimulation')}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all shadow-sm ${
            mobileActivePanel === 'gpaSimulation'
              ? 'bg-[#004A98] text-white border-[#004A98]'
              : 'bg-white text-gray-700 border-gray-200 hover:border-[#004A98] hover:text-[#004A98]'
          }`}
        >
          <BarChart2 className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-medium">Mô phỏng GPA</span>
        </button>
      </div>

      {/* Mobile Panel: Kéo GPA */}
      {mobileActivePanel === 'gpaPull' && (
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-800">Công cụ Kéo GPA</span>
            <button onClick={() => setMobileActivePanel(null)} className="p-1.5 rounded-full hover:bg-gray-100">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <GPAPullTool
            gradesHistory={gradesHistory}
            getClassification={getClassification}
            simulatorCourses={simulatorCourses}
            handleGradeChange={handleGradeChange}
            currentGPA={currentGPA}
            accumulatedCredits={accumulatedCredits}
            totalCredits={totalCredits}
          />
        </div>
      )}

      {/* Mobile Panel: Mô phỏng GPA */}
      {mobileActivePanel === 'gpaSimulation' && (
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-800">Mô phỏng GPA</span>
            <button onClick={() => setMobileActivePanel(null)} className="p-1.5 rounded-full hover:bg-gray-100">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <GPASimulation courses={simulatorCourses} expandedSection={expandedSection} setExpandedSection={setExpandedSection} semesterGPA={semesterGPA} cumulativeGPA={cumulativeGPA} getClassification={getClassification} handleGradeChange={handleGradeChange} />
        </div>
      )}

      {/* Desktop: GPAPullTool + GPASimulation hiện bình thường */}
      <div className="hidden md:block">
        <GPAPullTool
          gradesHistory={gradesHistory}
          getClassification={getClassification}
          simulatorCourses={simulatorCourses}
          handleGradeChange={handleGradeChange}
          currentGPA={currentGPA}
          accumulatedCredits={accumulatedCredits}
          totalCredits={totalCredits}
        />
      </div>

      <div className="hidden md:block">
        <GPASimulation courses={simulatorCourses} expandedSection={expandedSection} setExpandedSection={setExpandedSection} semesterGPA={semesterGPA} cumulativeGPA={cumulativeGPA} getClassification={getClassification} handleGradeChange={handleGradeChange} />
      </div>

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