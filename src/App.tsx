import { MainLayout } from './layouts/MainLayout';
import { DashboardWidgets } from './pages/dashboardWidgets/DashboardWidgets';
import { IntegratedStudyRoadmap } from './pages/integratedStudyRoadmap/IntegratedStudyRoadmap';
import { GradeManagement } from './pages/gradeManagement/GradeManagement';
import { TuitionPage } from './pages/TuitionPage/TuitionPage';
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
import { App as CapacitorApp } from '@capacitor/app';
import { Analytics } from '@vercel/analytics/react';

function AppContent() {
  const { semesterNumber, academicYear, isConfigured } = useDepartmentData();
  const selectedSemester = `Học kỳ ${semesterNumber}, ${academicYear}`;
  const { addNotification } = useAppNotification();
  const { cryptoKey, unlock, refreshHasData, hasData } = useCrypto();
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

  useEffect(() => {
    const handleBackButton = () => {
      setCurrentPage((prevPage) => {
        if (prevPage !== 'dashboard') {
          return 'dashboard';
        } else {
          CapacitorApp.exitApp();
          return prevPage;
        }
      });
    };

    CapacitorApp.addListener('backButton', handleBackButton);

    return () => {
      CapacitorApp.removeAllListeners();
    };
  }, []);

  return (
    <>
      {/* Overlay SecurityLock khi có pendingData nhưng chưa có PIN */}
      {pendingData && !cryptoKey && (
        <SecurityLock
          setupMode={!hasData}
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

      {!isConfigured ? (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50 p-4">
          <div className="max-w-2xl w-full mx-auto">
            <div className="w-full flex flex-row items-center justify-center">
              <SettingUserProfile />
            </div>
          </div>
        </div>
      ) : (
        <MainLayout
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          selectedSemester={selectedSemester}
        >
          {currentPage === 'dashboard' && <DashboardWidgets />}
          {currentPage === 'courses' && <IntegratedStudyRoadmap />}
          {currentPage === 'grades' && <GradeManagement />}
          {currentPage === 'tuition' && <TuitionPage selectedSemester={selectedSemester} />}
          {currentPage === 'schedule' && <VisualSchedule selectedSemester={selectedSemester} />}
          {currentPage === 'examSchedule' && <ExamScheduleVi />}
          {currentPage === 'settings' && <Setting />}
        </MainLayout>
      )}
    </>
  );
}

export default function App() {
  return (
    <CryptoProvider>
      <Analytics />
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