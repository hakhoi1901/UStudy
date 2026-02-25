// Hàm lưu dữ liệu  
export const saveToStorage = <T,>(key: string, value: T): void => {
    try {
        const serializedValue = JSON.stringify(value);
        localStorage.setItem(key, serializedValue);
    } catch (error) {
        console.error(`Lỗi khi lưu key "${key}":`, error);
    }
};

// Hàm đọc dữ liệu 
export const readFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        if (item === null) return defaultValue;
        return JSON.parse(item) as T;
    } catch (error) {
        console.error(`Lỗi khi đọc key "${key}":`, error);
        return defaultValue;
    }
};