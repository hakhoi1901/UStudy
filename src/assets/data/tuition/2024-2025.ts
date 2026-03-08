/**
 * Bảng đơn giá tín chỉ năm học 2025-2026.
 *
 * - `shared`: Đơn giá CHUNG toàn trường (áp dụng cho tất cả ngành).
 * - `majors`: Đơn giá RIÊNG theo ngành (ghi đè hoặc bổ sung lên shared).
 *
 * Khi đọc: merge shared + majors[majorId] → bảng giá cuối cùng.
 */

export const tuition_2024_2025 = {
    default_price: 425000,

    // Đơn giá chung toàn trường
    shared: {
        // LLCT - KT - XH - PL
        BAA: 425000,
        ADD: 425000,

        // GDQPAN - TC
        BAA0002: 424000,
        BAA0003: 424000,

        // Toán - Khoa học tự nhiên - Môi trường
        MTH: 639000,
        PHY: 639000,
        CHE: 639000,
        BIO: 639000,
        GEO: 639000,
        ENV: 639000,
        CSC0: 639000,
    },

    // Đơn giá riêng theo ngành
    majors: {
        'cong-nghe-thong-tin': { CSC1: 857000 },
        'he-thong-thong-tin': { CSC1: 857000 },
        'ky-thuat-phan-mem': { CSC1: 857000 },
        'khoa-hoc-may-tinh': { CSC1: 857000 },
        'tri-tue-nhan-tao': { CSC1: 891000 },
        'cu-nhan-tai-nang-cntt': { CSC1: 857000 },

        'mang-may-tinh': { CSC1: 857000 },
        'sinh-hoc': { BIO1: 854000 },
        'toan-hoc': { MTH1: 965000 },
        'toan-tin': { MTH1: 898000 },
        'toan-ung-dung': { MTH1: 902000 },
        'khoa-hoc-du-lieu': { MTH1: 899000 },
        'thong-ke': { MTH1: 843000 },
    } as Record<string, Record<string, number>>,
};  
