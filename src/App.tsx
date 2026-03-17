import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardWidgets } from './pages/dashboardWidgets/DashboardWidgets';
import { IntegratedStudyRoadmap } from './pages/integratedStudyRoadmap/IntegratedStudyRoadmap';
import { GradeManagement } from './pages/gradeManagement/GradeManagement';
import { TuitionManagement } from './pages/tuitionManagement/TuitionManagement';
import { VisualSchedule } from './pages/visualSchedule/VisualSchedule';
import { useState, useEffect } from 'react';
import { Setting } from './pages/setting/Setting';
import { SettingUserProfile } from './pages/setting/SettingUserProfile';
import { NotificationProvider } from './context/NotificationContext';
import { useAppNotification } from './context/NotificationContext';
import { DepartmentProvider, useDepartmentData } from './context/DepartmentContext';
import { processRawData } from './logic/dataProcessor';
import { STORAGE_KEYS } from './config/storageKeys';
import { APP_CONFIG } from './config';
import { ExamScheduleVi } from './pages/ExamSchedule/examSchedule';


function AppContent() {
  const { semesterNumber, academicYear, isConfigured } = useDepartmentData();
  const selectedSemester = `Học kỳ ${semesterNumber}, ${academicYear}`;
  const { addNotification } = useAppNotification();

  const [currentPage, setCurrentPage] = useState<string>(() => {
    if (typeof window === 'undefined') return 'dashboard';
    const savedPage = sessionStorage.getItem(STORAGE_KEYS.PAGE);
    return savedPage ? savedPage : 'dashboard';
  });

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEYS.PAGE, currentPage);
  }, [currentPage]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Listen for data from the Bookmarklet
      if (event.data && event.data.type === 'IMPORT_FULL_DATA') {
        const payload = event.data.payload;

        // Kiểm tra version bookmarklet
        const incomingVersion = payload.version || payload.meta?.version;
        if (incomingVersion && incomingVersion !== APP_CONFIG.BOOKMARKLET_VERSION) {
          alert(`⚠️ BOOKMARKLET CŨ!\n\nPhiên bản bookmarklet của bạn (${incomingVersion}) đã cũ hơn so với hệ thống (${APP_CONFIG.BOOKMARKLET_VERSION}).\n\nVui lòng XÓA bookmark cũ và KÉO LẠI nút mới từ trang chủ để đảm bảo lấy dữ liệu chính xác nhé!`);

          addNotification({
            title: 'Cần cập nhật Bookmarklet',
            message: `Vui lòng kéo lại nút Bookmarklet mới để tương thích với phiên bản hệ thống hiện tại.`,
            type: 'warning'
          });
        }

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

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isSmallScreen = window.innerWidth <= 700;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] max-w-sm w-full text-center border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">Trải nghiệm trên PC</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Hệ thống quản lý học tập và xếp lịch hiện tại chỉ hỗ trợ hiển thị và thao tác trên máy tính (PC/Laptop) để đảm bảo trải nghiệm tốt nhất.
          </p>
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 inline-block">
            <p className="text-xs font-medium text-gray-600">Vui lòng truy cập lại bằng máy tính nhé! </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="flex-1 flex flex-col overflow-visible">
        <Header selectedSemester={selectedSemester} />
        {/* Giao diện chính/các trang*/}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-[1600px] mx-auto w-full">
            {!isConfigured ? (
              <div className="h-full flex items-center justify-center" style={{ marginTop: '40px' }}>
                <div className="max-w-2xl w-full mx-auto">
                  <div className="w-1 flex flex-row w-full items-center justify-center">
                    <SettingUserProfile />
                  </div>
                </div>
              </div>
            ) : (
              <>
                {currentPage === 'dashboard' && <DashboardWidgets />}
                {currentPage === 'courses' && <IntegratedStudyRoadmap />}
                {currentPage === 'grades' && <GradeManagement />}
                {currentPage === 'tuition' && <TuitionManagement selectedSemester={selectedSemester} />}
                {currentPage === 'schedule' && <VisualSchedule selectedSemester={selectedSemester} />}
                {currentPage === 'examSchedule' && <ExamScheduleVi />}
                {currentPage === 'settings' && <Setting />}
              </>
            )}
          </div>
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