import { useCallback, useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { AppRouter } from './app/AppRouter';
import { NotificationProvider, useAppNotification } from './context/NotificationContext';
import { DepartmentProvider } from './context/DepartmentContext';
import { CryptoProvider, CACHE_POPULATED_EVENT, useCrypto } from './context/CryptoContext';
import { SecurityGate } from './components/SecurityGate';
import { SecurityLock } from './components/SecurityLock';
import { ChatbotWidget } from './components/ChatbotWidget';
import { processRawData } from './logic/dataProcessor';
import { APP_CONFIG } from './config';
import { saveSecure, populateSecureCache } from './helpers/localStorage/save';

function AppContent() {
  const { addNotification } = useAppNotification();
  const { cryptoKey, unlock, refreshHasData, hasData } = useCrypto();
  const [pendingData, setPendingData] = useState<any>(null);

  const saveImportedData = useCallback(async (raw: any, meta: any, key: CryptoKey) => {
    await saveSecure('raw_student_db', raw, key);
    const { student, courses } = processRawData(raw);
    await saveSecure('student_db_full', student, key);
    await saveSecure('course_db_offline', courses, key);
    if (meta) await saveSecure('import_meta', meta, key);

    populateSecureCache('raw_student_db', raw);
    populateSecureCache('student_db_full', student);
    populateSecureCache('course_db_offline', courses);
    if (meta) populateSecureCache('import_meta', meta);

    window.dispatchEvent(new MessageEvent('message', { data: { type: CACHE_POPULATED_EVENT } }));

    refreshHasData();
    return student;
  }, [refreshHasData]);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (!event.data || event.data.type !== 'IMPORT_FULL_DATA') return;
      const payload = event.data.payload;

      const incomingVersion = payload.version || payload.meta?.version;
      if (incomingVersion && incomingVersion !== APP_CONFIG.BOOKMARKLET_VERSION) {
        alert(`⚠️ BOOKMARKLET CŨ!\n\nPhiên bản bookmarklet của bạn (${incomingVersion}) đã cũ hơn so với hệ thống (${APP_CONFIG.BOOKMARKLET_VERSION}).\n\nVui lòng XÓA bookmark cũ và KÉO LẠI nút mới từ trang chủ để đảm bảo lấy dữ liệu chính xác nhé!`);
        addNotification({
          title: 'Cần cập nhật Bookmarklet',
          message: 'Vui lòng kéo lại nút Bookmarklet mới để tương thích với phiên bản hệ thống hiện tại.',
          type: 'warning'
        });
      }

      if (!payload?.raw) return;

      if (!cryptoKey) {
        setPendingData(payload);
        return;
      }

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

  return (
    <>
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

      <AppRouter />
      <ChatbotWidget />
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
