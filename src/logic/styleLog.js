
// --- LOGGER CONFIG ---

// 1. SUCCESS: Dùng khi một tác vụ lớn hoàn thành (Load xong data, Xếp lịch xong)
export const logSuccess = console.log.bind(console, 
    "%c SUCCESS ", 
    "background: #10B981; color: white; border-radius: 3px; font-weight: bold; padding: 4px 8px;"
);

// 2. ERROR: Dùng trong catch(e), lỗi mạng, lỗi parse JSON
export const logError = console.log.bind(console, 
    "%c ERROR ", 
    "background: #EF4444; color: white; border-radius: 3px; font-weight: bold; padding: 4px 8px;"
);

// 3. WARNING: Dữ liệu thiếu, phải dùng Fallback, hoặc cache cũ
export const logWarning = console.log.bind(console, 
    "%c WARNING ", 
    "background: #F59E0B; color: black; border-radius: 3px; font-weight: bold; padding: 4px 8px;"
);

// 4. DATA: Dùng riêng để soi dữ liệu (In ra mảng môn học, thông tin SV)
// Màu tím để phân biệt với logic thông thường
export const logData = console.log.bind(console, 
    "%c DATA ", 
    "background: #8B5CF6; color: white; border-radius: 3px; font-weight: bold; padding: 4px 8px;"
);

// 5. ALGO (Quan trọng cho project này): Dùng cho Recommender/Scheduler
// Để biết thuật toán đang chạy bước nào (Bước 1: Lọc môn rớt -> Bước 2:...)
export const logAlgo = console.log.bind(console, 
    "%c ALGORITHM ", 
    "background: #3B82F6; color: white; border-radius: 3px; font-weight: bold; padding: 4px 8px;"
);

export const logStatus = console.log.bind(console, 
    "%c STATUS ", 
    "background: violet; color: black; border-radius: 3px; font-weight: bold; padding: 4px 8px;"
);