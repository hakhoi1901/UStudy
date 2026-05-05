import React, { useEffect } from 'react';
import { SecurityLock } from './SecurityLock';
import { useCrypto } from '../context/CryptoContext';

/**
 * SecurityGate.tsx
 * Quản lý 3 trạng thái của ứng dụng:
 * 1. SETUP_PIN (không có data): Mở app bình thường để import.
 * 2. LOCKED (có data, chưa unlock): Chặn toàn bộ app bằng SecurityLock.
 * 3. UNLOCKED (có data, cryptoKey trong RAM): Render children bình thường.
 *
 * CryptoKey được quản lý hoàn toàn bởi CryptoContext (RAM only).
 */
export const SecurityGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { cryptoKey, isReady, hasData, unlock } = useCrypto();

    // Lắng nghe storage event (tab khác thay đổi data)
    useEffect(() => {
        const handleStorage = () => {
            // Nếu data bị xóa từ tab khác, reload để reset state
            window.location.reload();
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    // Chờ khởi tạo
    if (!isReady) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
                <div className="animate-pulse text-indigo-600 font-semibold tracking-widest text-xs uppercase">
                    Initializing Security Layer...
                </div>
            </div>
        );
    }

    // Trạng thái 2: Có data nhưng chưa unlock → chặn app
    if (hasData && !cryptoKey) {
        return <SecurityLock onUnlock={unlock} />;
    }

    // Trạng thái 1 (không có data) hoặc 3 (đã unlock) → render app
    return <>{children}</>;
};
