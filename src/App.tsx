import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardWidgets } from './page/DashboardWidgets';
import { IntegratedStudyRoadmap } from './page/IntegratedStudyRoadmap';
import { GradeManagement } from './page/GradeManagement';
import { TuitionManagement } from './page/TuitionManagement';
import { VisualSchedule } from './page/VisualSchedule';
import { useState, useEffect } from 'react';
import { Setting } from './page/Setting';
import { NotificationProvider } from './context/NotificationContext';
import { useAppNotification } from './context/NotificationContext';


function AppContent() {
  {/* Trang hiện tại */ }
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const { addNotification } = useAppNotification();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Listen for data from the Bookmarklet
      if (event.data && event.data.type === 'IMPORT_FULL_DATA') {
        const payload = event.data.payload;
        if (payload && payload.student && payload.courses) {
          localStorage.setItem('student_db_full', JSON.stringify(payload.student));
          localStorage.setItem('course_db_offline', JSON.stringify(payload.courses));

          addNotification({
            title: 'Khởi tạo thành công',
            message: `Dữ liệu hệ thống cho sinh viên ${payload.student.name} đã sẵn sàng.`,
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
        <Header />
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
              <TuitionManagement />
            </div>
          )}

          {currentPage === 'schedule' && (
            <div className="p-6">
              <VisualSchedule />
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
      <AppContent />
    </NotificationProvider>
  );
}