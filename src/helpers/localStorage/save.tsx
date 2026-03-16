// Hàm lưu dữ liệu  
export const saveToStorage = <T,>(key: string, value: T): void => {
    try {
        const serializedValue = JSON.stringify(value);
        localStorage.setItem(key, serializedValue);
    } catch (error) {
        console.error(`Lỗi khi lưu key "${key}":`, error);
    }
};

// Hàm đọc dữ liệu F
export const readFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = window.localStorage.getItem(key);
        if (item === null) return defaultValue;

        try {
            return JSON.parse(item);
        } catch (parseError) {
            return item as unknown as T;
        }
    } catch (error) {
        console.warn(`Lỗi khi đọc key "${key}":`, error);
        return defaultValue;
    }
};