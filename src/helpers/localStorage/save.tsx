import CryptoJS from 'crypto-js';

const SYSTEM_SECRET = import.meta.env.VITE_ENCRYPT_SECRET || 'fallback_secret';

// PIN management
export const getSessionPin = (): string | null => {
    return sessionStorage.getItem('USER_PIN');
};

export const setSessionPin = (pin: string): void => {
    sessionStorage.setItem('USER_PIN', pin);
};

export const clearAllStorage = (): void => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
};

const getEncryptionKey = (): string | null => {
    const pin = getSessionPin();
    if (!pin) return null;
    return SYSTEM_SECRET + pin;
};

// Hàm mã hóa
export const encryptData = <T,>(data: T): string | null => {
    const key = getEncryptionKey();
    if (!key) return null;
    try {
        const serializedData = JSON.stringify(data);
        return CryptoJS.AES.encrypt(serializedData, key).toString();
    } catch (error) {
        console.error("Encryption error:", error);
        return null;
    }
};

// Hàm giải mã
export const decryptData = (cipherText: string | null, defaultValue: any = null): any => {
    if (!cipherText) return defaultValue;
    const key = getEncryptionKey();
    if (!key) return defaultValue;

    try {
        const bytes = CryptoJS.AES.decrypt(cipherText, key);
        const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
        if (!decryptedData) throw new Error("INVALID_PIN");
        return JSON.parse(decryptedData);
    } catch (error) {
        // Trả về defaultValue nếu lỗi (VD: sai PIN hoặc data cũ chưa mã hóa)
        return defaultValue;
    }
};

// Hàm lưu dữ liệu (Wrapper cho encryptData)
export const saveToStorage = <T,>(key: string, value: T): void => {
    try {
        const encrypted = encryptData(value);
        if (encrypted) {
            localStorage.setItem(key, encrypted);
        }
    } catch (error) {
        console.error(`Lỗi khi lưu key "${key}":`, error);
    }
};

// Hàm đọc dữ liệu (Wrapper cho decryptData)
export const readFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        if (item === null) return defaultValue;
        return decryptData(item, defaultValue) as T;
    } catch (error) {
        console.error(`Lỗi khi đọc key "${key}":`, error);
        return defaultValue;
    }
};