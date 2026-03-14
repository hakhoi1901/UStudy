/**
 * Bảng đơn giá tín chỉ năm học 2024-2025.
 *
 * - `shared`: Đơn giá CHUNG toàn trường (áp dụng cho tất cả ngành).
 * - `majors`: Đơn giá RIÊNG theo ngành (ghi đè hoặc bổ sung lên shared).
 *
 * Khi đọc: merge shared + majors[majorId] → bảng giá cuối cùng.
 */

export const tuition_2024_2025 = {
    default_price: 370000,

    // Đơn giá chung toàn trường
    shared: {
        // LLCT - KT - XH - PL
        BAA: 370000,
        ADD: 370000,
        CSC00003 : 370000,
        // GDQPAN - TC
        BAA0002: 370000,
        BAA0003: 370000,

        // Toán - Khoa học tự nhiên - Môi trường
        MTH: 556000,
        PHY: 556000,
        CHE: 556000,
        BIO: 556000,
        GEO: 556000,
        ENV: 556000,
        CSC0: 556000,
        BAA00100: 0,
    },

    // Đơn giá riêng theo ngành
    majors: {
        'nhom-nganh': { CSC1: 773000 },
        'cong-nghe-thong-tin': { CSC1: 773000 },
        'he-thong-thong-tin': { CSC1: 773000 },
        'ky-thuat-phan-mem': { CSC1: 773000 },
        'khoa-hoc-may-tinh': { CSC1: 773000 },
        'tri-tue-nhan-tao': { CSC1: 780000 },
        'cu-nhan-tai-nang-cntt': { CSC1: 773000 },
        'mang-may-tinh': { CSC1: 773000 },

        'sinh-hoc': { BIO1: 788000, BTE1: 788000 },
        'cong-nghe-sinh-hoc': { BIO1: 818000, BTE1: 818000 },

        'vat-ly-hoc': { PHY1: 556000 },
        'ky-thuat-dien-tu-vien-thong': { ETC1: 841000 },
        'cong-nghe-vat-ly-dien-tu-va-tin-hoc': { PHY1: 700000, PET1: 700000 }, // đã chốt
        'ky-thuat-hat-nhan': { MPH1: 586000, NTE1: 586000, PHY1: 586000 },
        'cong-nghe-ban-dan': { PHY1: 735000, SEM1: 735000 },
        'thiet-ke-vi-mach': { PHY1: 773000, ICD1: 773000, ETC1: 773000 },
        'vat-ly-y-khoa': { PHY1: 706000, MPH1: 706000 },

        'hoa-hoc': { CHE1: 677000 },

        'khoa-hoc-vat-lieu': { MSC1: 831000, MST1: 831000 },
        'cong-nghe-vat-lieu': { MST1: 785000, MSC1: 785000 },

        'cong-nghe-ky-thuat-moi-truong': { ENE1: 598000 },
        'quan-ly-tai-nguyen-va-moi-truong': { ENM1: 592000 },
        'khoa-hoc-moi-truong': { ENV1: 587000 },

        'dia-chat-hoc': { GEO1: 573000 },
        'ky-thuat-dia-chat': { GEO1: 558000 },

        'hai-duong-hoc': { OMH1: 556000 },

        'toan-hoc': { MTH1: 844000 },
        'toan-tin': { MTH1: 786000 },
        'toan-ung-dung': { MTH1: 789000 },
        'khoa-hoc-du-lieu': { MTH1: 841000 },
    } as Record<string, Record<string, number>>,
};  
