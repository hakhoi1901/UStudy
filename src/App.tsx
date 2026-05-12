import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatbotWidget } from './components/ChatbotWidget';
import { DashboardWidgets } from './pages/dashboardWidgets/DashboardWidgets';
import { IntegratedStudyRoadmap } from './pages/integratedStudyRoadmap/IntegratedStudyRoadmap';
import { GradeManagement } from './pages/gradeManagement/GradeManagement';
import { TuitionManagement } from './pages/tuitionManagement/TuitionManagement';
import { VisualSchedule } from './pages/visualSchedule/VisualSchedule';
import { useState, useEffect, useCallback } from 'react';
import { Setting } from './pages/setting/Setting';
import { SettingUserProfile } from './pages/setting/SettingUserProfile';
import { NotificationProvider } from './context/NotificationContext';
import { useAppNotification } from './context/NotificationContext';
import { DepartmentProvider, useDepartmentData } from './context/DepartmentContext';
import { CryptoProvider } from './context/CryptoContext';
import { useCrypto } from './context/CryptoContext';
import { processRawData } from './logic/dataProcessor';
import { STORAGE_KEYS } from './config/storageKeys';
import { APP_CONFIG } from './config';
import { ExamScheduleVi } from './pages/ExamSchedule/examSchedule';
import { SecurityLock } from './components/SecurityLock';
import { SecurityGate } from './components/SecurityGate';
import { saveSecure, populateSecureCache } from './helpers/localStorage/save';


function AppContent() {
  const { semesterNumber, academicYear, isConfigured } = useDepartmentData();
  const selectedSemester = `Học kỳ ${semesterNumber}, ${academicYear}`;
  const { addNotification } = useAppNotification();
  const { cryptoKey, unlock, refreshHasData } = useCrypto();
  const [pendingData, setPendingData] = useState<any>(null);

  const [currentPage, setCurrentPage] = useState<string>(() => {
    if (typeof window === 'undefined') return 'dashboard';
    const savedPage = sessionStorage.getItem(STORAGE_KEYS.PAGE);
    return savedPage ? savedPage : 'dashboard';
  });

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEYS.PAGE, currentPage);
  }, [currentPage]);

  // Lưu data an toàn sau khi đã có cryptoKey
  const saveImportedData = useCallback(async (raw: any, meta: any, key: CryptoKey) => {
    await saveSecure('raw_student_db', raw, key);
    const { student, courses } = processRawData(raw);
    await saveSecure('student_db_full', student, key);
    await saveSecure('course_db_offline', courses, key);
    if (meta) await saveSecure('import_meta', meta, key);

    // Cập nhật RAM cache để hooks có thể đọc ngay không cần reload
    populateSecureCache('raw_student_db', raw);
    populateSecureCache('student_db_full', student);
    populateSecureCache('course_db_offline', courses);
    if (meta) populateSecureCache('import_meta', meta);

    refreshHasData();
    return student;
  }, [refreshHasData]);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (!event.data || event.data.type !== 'IMPORT_FULL_DATA') return;
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

      if (!payload?.raw) return;

      if (!cryptoKey) {
        // Chưa có key → lưu tạm, chờ user setup PIN
        setPendingData(payload);
        return;
      }

      // Đã có key → lưu ngay
      const student = await saveImportedData(payload.raw, payload.meta, cryptoKey);
      addNotification({
        title: 'Khởi tạo thành công',
        message: `Dữ liệu hệ thống cho sinh viên ${student.name} đã sẵn sàng.`,
        type: 'success'
      });
    };

    window.addEventListener('message', handleMessage, true);
    return () => window.removeEventListener('message', handleMessage, true);
  }, [addNotification, cryptoKey, saveImportedData]);

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
      {/* Overlay SecurityLock khi có pendingData nhưng chưa có PIN */}
      {pendingData && !cryptoKey && (
        <SecurityLock
          setupMode={true}
          onUnlock={async (key) => {
            unlock(key);
            const student = await saveImportedData(pendingData.raw, pendingData.meta, key);
            addNotification({
              title: 'Khởi tạo thành công',
              message: `Dữ liệu hệ thống đã được mã hóa và sẵn sàng cho sinh viên ${student.name}.`,
              type: 'success'
            });
            setPendingData(null);
          }}
        />
      )}
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
      <ChatbotWidget />
    </div>
  );
}

export default function App() {
  return (
    <CryptoProvider>
      <SecurityGate>
        <NotificationProvider>
          <DepartmentProvider>
            <AppContent />
          </DepartmentProvider>
        </NotificationProvider>
        
      </SecurityGate>


    </CryptoProvider>
  );
}