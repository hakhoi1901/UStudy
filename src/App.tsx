import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardWidgets } from './pages/dashboardWidgets/DashboardWidgets';
import { IntegratedStudyRoadmap } from './pages/integratedStudyRoadmap/IntegratedStudyRoadmap';
import { GradeManagement } from './pages/gradeManagement/GradeManagement';
import { TuitionManagement } from './pages/tuitionManagement/TuitionManagement';
import { VisualSchedule } from './pages/visualSchedule/VisualSchedule';
import { useState, useEffect } from 'react';
import { APP_CONFIG } from './config';
import { Setting } from './pages/setting/Setting';
import { NotificationProvider } from './context/NotificationContext';
import { useAppNotification } from './context/NotificationContext';
import { DepartmentProvider, useDepartmentData } from './context/DepartmentContext';
import { processRawData } from './logic/dataProcessor';


function AppContent() {
  {/* Trang hiện tại */ }
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [selectedSemester, setSelectedSemester] = useState<string>(APP_CONFIG.AVAILABLE_SEMESTERS[1] || 'Học kỳ 1, 2025-2026');
  const { addNotification } = useAppNotification();
  const { semesterNumber, academicYear } = useDepartmentData();

  const selectedSemester = `Học kỳ ${semesterNumber}, ${academicYear}`;

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Listen for data from the Bookmarklet
      if (event.data && event.data.type === 'IMPORT_FULL_DATA') {
        const payload = event.data.payload;
        if (payload && payload.raw) {
          // 1. Lưu bản RAW nguyên vẹn
          localStorage.setItem('raw_student_db', JSON.stringify(payload.raw));

          // 2. Xử lý raw → processed (format cũ cho code hiện tại)
          const { student, courses } = processRawData(payload.raw);

          // 3. Lưu bản đã xử lý (backward compatible)
          localStorage.setItem('student_db_full', JSON.stringify(student));
          localStorage.setItem('course_db_offline', JSON.stringify(courses));

          if (payload.meta) {
            localStorage.setItem('import_meta', JSON.stringify(payload.meta));
          }

          addNotification({
            title: 'Khởi tạo thành công',
            message: `Dữ liệu hệ thống cho sinh viên ${student.name} đã sẵn sàng.`,
            type: 'success'
          });
        }
      }
    };

    // Use capture phase (true) so this saves to localStorage BEFORE child hooks re-render
    window.addEventListener('message', handleMessage, true);
    return () => window.removeEventListener('message', handleMessage, true);
  }, [addNotification]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header selectedSemester={selectedSemester} onSemesterChange={setSelectedSemester} />
        {/* Giao diện chính/các trang*/}
        <main className="flex-1 overflow-y-auto">
          {currentPage === 'dashboard' && (
            <div className="p-6">
              <div className="max-w-7xl mx-auto">
                <DashboardWidgets />
              </div>
            </div>
          )}

          {currentPage === 'courses' && (
            <div className="p-6">
              <div className="max-w-[1600px] mx-auto">
                <IntegratedStudyRoadmap />
              </div>
            </div>
          )}

          {currentPage === 'grades' && (
            <div className="p-6">
              <GradeManagement />
            </div>
          )}

          {currentPage === 'tuition' && (
            <div className="p-6">
              <TuitionManagement selectedSemester={selectedSemester} />
            </div>
          )}

          {currentPage === 'schedule' && (
            <div className="p-6">
              <VisualSchedule selectedSemester={selectedSemester} />
            </div>
          )}

          {currentPage === 'settings' && (
            <div className="p-6">
              <Setting />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <DepartmentProvider>
        <AppContent />
      </DepartmentProvider>
    </NotificationProvider>
  );
}