/**
 * Bảng dự báo đơn giá tín chỉ năm học 2026-2027.
 *
 * Đây không phải đơn giá chính thức của trường.
 * - Mức có dữ liệu ở cả hai năm: ngoại suy tuyến tính từ chênh lệch
 *   2024-2025 -> 2025-2026.
 * - Mức chỉ xuất hiện từ 2025-2026: tăng 14% (xấp xỉ trung vị của các
 *   mức tăng có đủ hai năm), sau đó làm tròn đến 1.000 đồng.
 *
 * Khi có bảng giá chính thức, thay toàn bộ giá trị dự báo trong file này.
 */

export const tuition_2026_2027 = {
    default_price: 480000,

    // Đơn giá chung toàn trường
    shared: {
        // LLCT - KT - XH - PL
        BAA: 480000,
        ADD: 480000,
        CSC00003: 480000,
        // GDQPAN - TC
        BAA0002: 480000,
        BAA0003: 480000,

        // Toán - Khoa học tự nhiên - Môi trường
        MTH: 722000,
        PHY: 722000,
        CHE: 722000,
        BIO: 722000,
        GEO: 722000,
        ENV: 722000,
        OMH: 722000,
        MTS: 722000,
        MSC: 722000,
        CSC0: 722000,
    },

    // Đơn giá riêng theo ngành
    majors: {
        'nhom-nganh': { CSC1: 941000 },
        'cong-nghe-thong-tin': { CSC1: 941000 },
        'he-thong-thong-tin': { CSC1: 941000 },
        'ky-thuat-phan-mem': { CSC1: 941000 },
        'khoa-hoc-may-tinh': { CSC1: 941000 },
        'tri-tue-nhan-tao': { CSC1: 1002000 },
        'cu-nhan-tai-nang': { CSC1: 941000 },
        'mang-may-tinh': { CSC1: 941000 },

        'sinh-hoc': { BIO1: 920000, BTE1: 920000 },
        'cong-nghe-sinh-hoc': { BIO1: 988000, BTE1: 988000 },

        'vat-ly-hoc': { PHY1: 722000 },
        'ky-thuat-dien-tu-vien-thong': { ETC1: 1083000 },
        'cong-nghe-vat-ly-dien-tu-va-tin-hoc': { PHY1: 864000, PET1: 864000 },
        'ky-thuat-hat-nhan': { MPH1: 754000, NTE1: 754000, PHY1: 754000 },
        'cong-nghe-ban-dan': { PHY1: 905000, SEM1: 905000 },
        'thiet-ke-vi-mach': { PHY1: 965000, ICD1: 965000, ETC1: 965000 },
        'vat-ly-y-khoa': { PHY1: 912000, MPH1: 912000 },

        'hoa-hoc': { CHE1: 815000 },

        'khoa-hoc-vat-lieu': { MSC1: 937000, MST1: 937000 },
        'cong-nghe-vat-lieu': { MST1: 975000, MSC1: 975000 },

        'cong-nghe-ky-thuat-moi-truong': { ENE1: 764000 },
        'quan-ly-tai-nguyen-va-moi-truong': { ENM1: 768000 },
        'khoa-hoc-moi-truong': { ENV1: 721000 },

        'dia-chat-hoc': { GEO1: 744900 },
        'ky-thuat-dia-chat': { GEO1: 725400 },
        'kinh-te-dat-dai': { GEO1: 1016000 },

        'hai-duong-hoc': { OMH1: 722000 },

        'cong-nghe-giao-duc': { EDT1: 776000, EDT2: 776000 },

        'toan-hoc': { MTH1: 1086000 },
        'toan-tin': { MTH1: 1010000 },
        'toan-ung-dung': { MTH1: 1015000 },
        'khoa-hoc-du-lieu': { MTH1: 957000 },
        'thong-ke': { MTH1: 1075000 },
    } as Record<string, Record<string, number>>,
};
