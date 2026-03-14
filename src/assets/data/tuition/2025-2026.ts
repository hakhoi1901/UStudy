/**
 * Bảng đơn giá tín chỉ năm học 2025-2026.
 *
 * - `shared`: Đơn giá CHUNG toàn trường (áp dụng cho tất cả ngành).
 * - `majors`: Đơn giá RIÊNG theo ngành (ghi đè hoặc bổ sung lên shared).
 *
 * Khi đọc: merge shared + majors[majorId] → bảng giá cuối cùng.
 */

export const tuition_2025_2026 = {
    default_price: 425000,

    // Đơn giá chung toàn trường
    shared: {
        // LLCT - KT - XH - PL
        BAA: 425000,
        ADD: 425000,

        // GDQPAN - TC
        BAA0002: 425000,
        BAA0003: 425000,

        // Toán - Khoa học tự nhiên - Môi trường
        MTH: 639000,
        PHY: 639000,
        CHE: 639000,
        BIO: 639000,
        GEO: 639000,
        ENV: 639000,
        OMH: 639000,
        MTS: 639000,
        MSC: 639000,
        CSC0: 639000,

        // Tin học cơ sở
        CSC00003: 425000,
    },

    // Đơn giá riêng theo ngành
    majors: {
        'nhom-nganh': { CSC1: 857000 },
        'cong-nghe-thong-tin': { CSC1: 857000 },
        'he-thong-thong-tin': { CSC1: 857000 },
        'ky-thuat-phan-mem': { CSC1: 857000 },
        'khoa-hoc-may-tinh': { CSC1: 857000 },
        'tri-tue-nhan-tao': { CSC1: 891000 },
        'cu-nhan-tai-nang-cntt': { CSC1: 857000 },

        'cong nghe ban dan': { PHY1: 825000, SEM1: 820000 },
        'mang-may-tinh': { CSC1: 857000 },

        'sinh-hoc': { BIO1: 854000, BTE1: 854000 },
        'cong-nghe-sinh-hoc': { BIO1: 903000, BTE1: 903000 },

        'vat-ly-hoc': { PHY1: 639000 },
        'ky-thuat-dien-tu-vien-thong': { ETC1: 962000 },
        'cong-nghe-vat-ly-dien-tu-va-tin-hoc': { PHY1: 782000, PET1: 782000 }, // đã chốt
        'ky-thuat-hat-nhan': { MPH1: 670000, NTE1: 670000, PHY1: 670000 },
        'cong-nghe-ban-dan': { PHY1: 820000, SEM1: 820000 },
        'thiet-ke-vi-mach': { PHY1: 869000, ICD1: 869000, ETC1: 869000 },
        'vat-ly-y-khoa': { PHY1: 809000, MPH1: 809000 },

        'hoa-hoc': { CHE1: 746000 },

        'khoa-hoc-vat-lieu': { MSC1: 884000, MST1: 884000 },
        'cong-nghe-vat-lieu': { MST1: 880000, MSC1: 880000 },

        'cong-nghe-ky-thuat-moi-truong': { ENE1: 681000 },
        'quan-ly-tai-nguyen-va-moi-truong': { ENM1: 680000 },
        'khoa-hoc-moi-truong': { ENV1: 654000 },

        'dia-chat-hoc': { GEO1: 658950 },
        'ky-thuat-dia-chat': { GEO1: 641700 },
        'kinh-te-dat-dai': { GEO1: 891000 },

        'hai-duong-hoc': { OMH1: 639000 },

        'cong-nghe-giao-duc': { EDT1: 681000, EDT2: 681000 },

        'toan-hoc': { MTH1: 965000 },
        'toan-tin': { MTH1: 898000 },
        'toan-ung-dung': { MTH1: 902000 },
        'khoa-hoc-du-lieu': { MTH1: 899000 },
        'thong-ke': { MTH1: 943000 }
    } as Record<string, Record<string, number>>,
};  
