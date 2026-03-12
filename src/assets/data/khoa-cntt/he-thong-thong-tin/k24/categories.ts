export const categories = {
    "GENERAL_EDUCATION": {
        "name": "Giáo dục đại cương",
        "total_credits_required": 56,
        "note": "Không kể Ngoại ngữ, GDTC và GDQPAN",
        "breakdown": {
            "GENERAL_POLITICS": {
                "name": "Lý luận chính trị - Pháp luật",
                "credits": 14,
                "mandatory": true,
                "courses": [
                    "BAA00101",
                    "BAA00102",
                    "BAA00103",
                    "BAA00104",
                    "BAA00003",
                    "BAA00004"
                ]
            },
            "GENERAL_SOCIAL": {
                "name": "Khoa học xã hội - Kinh tế - Kỹ năng",
                "credits": 2,
                "mandatory": false,
                "note": "Chọn 01 học phần (02 tín chỉ)",
                "courses": [
                    "BAA00005",
                    "BAA00006",
                    "BAA00007"
                ]
            },
            "GENERAL_MATH_SCIENCE": {
                "name": "Toán - Khoa học tự nhiên - Công nghệ - Môi trường",
                "credits": 36,
                "mandatory": true,
                "note": "Toán: 24 TC (bắt buộc) + 4 TC (chọn 1) + KHTN: 6 TC + Môi trường: 2 TC",
                "breakdown": {
                    "MATH_MANDATORY": {
                        "name": "Toán bắt buộc",
                        "credits_required": 24,
                        "courses": [
                            "MTH00021",
                            "MTH00022",
                            "MTH00035",
                            "MTH00044",
                            "MTH00045",
                            "MTH00050"
                        ]
                    },
                    "MATH_ELECTIVE": {
                        "name": "Toán tự chọn",
                        "credits_required": 4,
                        "note": "Chọn 01 học phần (04 tín chỉ)",
                        "courses": [
                            "MTH00051",
                            "MTH00052",
                            "MTH00053"
                        ]
                    },
                    "SCIENCE": {
                        "name": "Khoa học tự nhiên",
                        "credits_required": 6,
                        "note": "Chọn 06 tín chỉ",
                        "courses": [
                            "CHE00001",
                            "CHE00002",
                            "CHE00081",
                            "CHE00082",
                            "BIO00001",
                            "BIO00002",
                            "BIO00081",
                            "BIO00082",
                            "PHY00001",
                            "PHY00002",
                            "PHY00081"
                        ]
                    },
                    "ENVIRONMENT": {
                        "name": "Môi trường",
                        "credits_required": 2,
                        "note": "Chọn 01 học phần (02 tín chỉ)",
                        "courses": [
                            "GEO00002",
                            "ENV00001",
                            "ENV00003"
                        ]
                    }
                }
            }
        }
    },
    "GENERAL_IT": {
        "name": "Tin học",
        "credits": 4,
        "mandatory": true,
        "courses": [
            "CSC00004"
        ]
    },
    "GENERAL_ENGLISH": {
        "name": "Ngoại ngữ",
        "credits": 12,
        "mandatory": false,
        "note": "Không tính vào điểm TB và TC tích lũy. SV đạt chuẩn ngoại ngữ đầu ra thì không đăng ký học",
        "courses": [
            "ADD00031",
            "ADD00032",
            "ADD00033",
            "ADD00034"
        ]
    },
    "GENERAL_PE": {
        "name": "Giáo dục thể chất",
        "credits": 4,
        "mandatory": true,
        "note": "Không tính vào điểm TB, tính vào TC tích lũy",
        "courses": [
            "BAA00021",
            "BAA00022"
        ]
    },
    "GENERAL_DEFENSE": {
        "name": "Giáo dục quốc phòng - An ninh",
        "credits": 4,
        "mandatory": true,
        "note": "Không tính vào điểm TB, tính vào TC tích lũy",
        "courses": [
            "BAA00030"
        ]
    },
    "FOUNDATION": {
        "name": "Kiến thức cơ sở ngành",
        "total_credits_required": 38,
        "mandatory": true,
        "courses": [
            "CSC10012",
            "CSC10003",
            "CSC10004",
            "CSC10014",
            "CSC10006",
            "CSC10007",
            "CSC10008",
            "CSC10009",
            "CSC13002",
            "CSC14003"
        ]
    },
    "MAJOR_INFORMATION_SYSTEMS": {
        "name": "Ngành/ Chuyên ngành Hệ thống thông tin",
        "total_credits_required": 34,
        "breakdown": {
            "MANDATORY": {
                "credits": 16
            },
            "ELECTIVE": {
                "credits": 8,
                "note": "Chọn tối thiểu 08 tín chỉ bằng cách chọn trong danh sách học phần 7.2.2.2"
            },
            "FREE_ELECTIVE": {
                "credits": 10,
                "note": "Sinh viên tiếp tục tích lũy đủ ít nhất 34 tín chỉ bằng các học phần từ Phụ lục 1"
            }
        },
        "courses": [
            "CSC12002",
            "CSC12003",
            "CSC12004",
            "CSC12005",
            "CSC10121",
            "CSC10102",
            "CSC10103",
            "CSC10104",
            "CSC10105",
            "CSC10106",
            "CSC10107",
            "CSC10108",
            "CSC12001",
            "CSC12105",
            "CSC12106",
            "CSC17101",
            "CSC12107",
            "CSC12108",
            "CSC12111",
            "CSC13003",
            "CSC13005",
            "CSC13006",
            "CSC13007",
            "CSC13008",
            "CSC13009",
            "CSC13010",
            "CSC13106",
            "CSC13112",
            "CSC13001",
            "CSC13101",
            "CSC13102",
            "CSC13103",
            "CSC13107",
            "CSC13117",
            "CSC18001",
            "CSC18101",
            "CSC18102",
            "CSC18103",
            "CSC18104",
            "CSC14001",
            "CSC14002",
            "CSC14004",
            "CSC14005",
            "CSC14006",
            "CSC14101",
            "CSC14111",
            "CSC14118",
            "CSC14120",
            "CSC14008",
            "CSC14105",
            "CSC14112",
            "CSC14113",
            "CSC14117",
            "CSC14007",
            "CSC15001",
            "CSC15002",
            "CSC15003",
            "CSC15004",
            "CSC15005",
            "CSC15006",
            "CSC15007",
            "CSC15009",
            "CSC15011",
            "CSC15012",
            "CSC15109",
            "CSC15010",
            "CSC15102",
            "CSC15107",
            "CSC15108",
            "CSC16001",
            "CSC16002",
            "CSC16003",
            "CSC16004",
            "CSC16005",
            "CSC16101",
            "CSC16102",
            "CSC16105",
            "CSC16106",
            "CSC16107",
            "CSC16109",
            "CSC16113",
            "CSC16114",
            "CSC14119",
            "CSC17001",
            "CSC17104",
            "CSC17102",
            "CSC17103",
            "CSC17106",
            "CSC11002",
            "CSC11003",
            "CSC11004",
            "CSC11006",
            "CSC11007",
            "CSC11106",
            "CSC11115",
            "CSC11116",
            "CSC11117",
            "CSC11118",
            "CSC11120"
        ]
    },
    "GRADUATION": {
        "name": "Kiến thức tốt nghiệp",
        "total_credits_required": 10,
        "options": [
            {
                "type": "THESIS",
                "credits": 10,
                "courses": [
                    "CSC10251"
                ]
            },
            {
                "type": "INTERNSHIP",
                "credits": 10,
                "courses": [
                    "CSC10252"
                ]
            },
            {
                "type": "PROJECT",
                "credits": 10,
                "note": "Thực tập dự án (6TC) và chọn 01 học phần (4TC)",
                "courses": [
                    "CSC10204",
                    "CSC12107",
                    "CSC12108",
                    "CSC12111"
                ]
            }
        ]
    }
}