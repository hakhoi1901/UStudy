import React, { useState, useEffect } from 'react';
import { SecurityLock } from './SecurityLock';
import { getSessionPin, decryptData } from '../helpers/localStorage/save';

/**
 * SecurityGate.tsx
 * Quản lý 3 trạng thái của ứng dụng: 
 * 1. SETUP_PIN (No data): Mở app bình thường.
 * 2. LOCKED (Has data, No/Invalid session PIN): Chặn toàn bộ app bằng SecurityLock.
 * 3. UNLOCKED (Has data, Valid session PIN): Ẩn SecurityLock, mở app.
 */
export const SecurityGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLocked, setIsLocked] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const checkSecurity = () => {
      // 1. Kiểm tra xem có dữ liệu trong localStorage không
      const hasData = !!(localStorage.getItem('raw_student_db') || localStorage.getItem('student_db_full'));
      
      // 2. Kiểm tra PIN trong sessionStorage
      const pin = getSessionPin();

      if (!hasData) {
        // TRẠNG THÁI 1: SETUP_PIN - Cho phép vào App để Import
        setIsLocked(false);
      } else if (pin) {
        // TRẠNG THÁI 3: UNLOCKED? - Thử giải mã để xác nhận PIN hợp lệ
        const encryptedData = localStorage.getItem('raw_student_db') || localStorage.getItem('student_db_full');
        const decrypted = decryptData(encryptedData);
        
        if (decrypted) {
          setIsLocked(false);
        } else {
          // PIN sai (có thể do nhập sai hoặc data bị lỗi)
          // Xóa PIN sai để quay về trạng thái LOCKED
          sessionStorage.removeItem('USER_PIN');
          setIsLocked(true);
        }
      } else {
        // TRẠNG THÁI 2: LOCKED - Có data nhưng chưa có PIN
        setIsLocked(true);
      }
      setInitialized(true);
    };

    checkSecurity();
    
    // Đăng ký lắng nghe sự kiện storage (nếu tab khác thay đổi data)
    window.addEventListener('storage', checkSecurity);
    return () => window.removeEventListener('storage', checkSecurity);
  }, []);

  if (!initialized) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-indigo-600 font-semibold tracking-widest text-xs uppercase">
          Initializing Security Layer...
        </div>
      </div>
    );
  }

  // Nếu bị khóa -> Tuyệt đối KHÔNG render children (<AppContent />)
  if (isLocked) {
    return <SecurityLock onUnlock={() => setIsLocked(false)} />;
  }

  // Đã mở khóa hoặc chưa có data -> Render app bình thường
  return <>{children}</>;
};
