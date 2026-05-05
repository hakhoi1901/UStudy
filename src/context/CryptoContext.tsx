import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
    hasSecureData,
    readSecure,
    populateSecureCache,
    clearSecureCache,
    SECURE_DATA_KEYS,
} from '../helpers/localStorage/save';

/**
 * CryptoContext — RAM-only key manager
 *
 * Giữ CryptoKey hoàn toàn trong RAM (không bao giờ ghi ra storage).
 * Sử dụng window-level variable để persist qua HMR (Vite hot reload),
 * nhưng vẫn mất khi đóng tab/reload trang — đảm bảo bảo mật.
 * Sau khi unlock, tự động decrypt toàn bộ secure data và populate module RAM cache
 * để các hook đồng bộ có thể đọc được qua readFromStorage shim.
 */

// ── HMR-safe persistence ──────────────────────────────────────────────────
// Window-level variable giữ CryptoKey sống sót qua Vite HMR.
// Vẫn bị xóa khi page reload hoặc đóng tab → an toàn.
const WIN_KEY = Symbol.for('__ustudy_crypto_key__');

function getPersistedKey(): CryptoKey | null {
    return (window as any)[WIN_KEY] || null;
}

function setPersistedKey(key: CryptoKey | null): void {
    if (key) {
        (window as any)[WIN_KEY] = key;
    } else {
        delete (window as any)[WIN_KEY];
    }
}

interface CryptoContextType {
    /** CryptoKey hiện tại — null nghĩa là chưa unlock */
    cryptoKey: CryptoKey | null;
    /** true khi SecurityGate đã kiểm tra xong (tránh flash UI) */
    isReady: boolean;
    /** true khi có dữ liệu nhạy cảm trong localStorage */
    hasData: boolean;
    /** Gọi sau khi verify PIN thành công — lưu key vào RAM và populate cache */
    unlock: (key: CryptoKey) => void;
    /** Xóa key khỏi RAM và clear cache — app quay về màn hình lock */
    lock: () => void;
    /** Cập nhật hasData (sau khi import xong) */
    refreshHasData: () => void;
}

const CryptoContext = createContext<CryptoContextType | null>(null);

/** Custom event type để báo hooks re-render sau khi cache được populate */
export const CACHE_POPULATED_EVENT = 'CACHE_POPULATED';

export function CryptoProvider({ children }: { children: React.ReactNode }) {
    const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(() => getPersistedKey());
    const [isReady, setIsReady] = useState(false);
    const [hasData, setHasData] = useState(false);

    // Sau khi cryptoKey thay đổi → populate/clear RAM cache
    useEffect(() => {
        if (!cryptoKey) {
            clearSecureCache();
            return;
        }

        // Decrypt toàn bộ secure data và đưa vào RAM cache
        (async () => {
            await Promise.all(
                SECURE_DATA_KEYS.map(async (key) => {
                    const val = await readSecure(key, cryptoKey, null);
                    if (val !== null) {
                        populateSecureCache(key, val);
                    }
                })
            );

            // Báo các hook cần re-render (stamp update)
            window.dispatchEvent(
                new MessageEvent('message', {
                    data: { type: CACHE_POPULATED_EVENT }
                })
            );
        })();
    }, [cryptoKey]);

    const unlock = useCallback((key: CryptoKey) => {
        setPersistedKey(key);
        setCryptoKey(key);
    }, []);

    const lock = useCallback(() => {
        setPersistedKey(null);
        setCryptoKey(null);
        clearSecureCache();
    }, []);

    const refreshHasData = useCallback(() => {
        setHasData(hasSecureData());
    }, []);

    return (
        <CryptoContext.Provider value={{ cryptoKey, isReady, hasData, unlock, lock, refreshHasData }}>
            <CryptoGateInit
                onReady={(dataAvailable) => {
                    setHasData(dataAvailable);
                    setIsReady(true);
                }}
            />
            {children}
        </CryptoContext.Provider>
    );
}

/** Component nội bộ — chạy logic kiểm tra ban đầu một lần duy nhất */
function CryptoGateInit({ onReady }: { onReady: (hasData: boolean) => void }) {
    const [ran, setRan] = React.useState(false);

    React.useEffect(() => {
        if (ran) return;
        setRan(true);
        onReady(hasSecureData());
    }, [ran, onReady]);

    return null;
}

export function useCrypto(): CryptoContextType {
    const ctx = useContext(CryptoContext);
    if (!ctx) throw new Error('useCrypto phải được dùng bên trong <CryptoProvider>');
    return ctx;
}

/**
 * Hook tiện ích: trả về cryptoKey hoặc throw nếu chưa unlock.
 */
export function useCryptoKey(): CryptoKey {
    const { cryptoKey } = useCrypto();
    if (!cryptoKey) throw new Error('Chưa unlock — CryptoKey chưa có trong RAM');
    return cryptoKey;
}
