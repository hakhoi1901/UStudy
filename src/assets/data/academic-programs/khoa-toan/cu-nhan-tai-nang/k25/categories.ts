export const categories = {
    "GENERAL_EDUCATION": {
        "name": "Giáo dục đại cương",
        "total_credits_required": 60,
        "note": "Không kể học phần GDQP-AN, GDTC, Tin học cơ sở và Ngoại ngữ",
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
                "note": "Chọn 1 trong 3 học phần. Mục 7.1.2 không xuất hiện trong bản PDF Toán tài năng; nhóm này được đối chiếu từ các CTĐT Toán học/Toán tin/Toán ứng dụng 2025 cùng bộ tài liệu.",
                "courses": [
                    "BAA00005",
                    "BAA00006",
                    "BAA00008"
                ]
            },
            "GENERAL_MATH_SCIENCE": {
                "name": "Toán - Khoa học tự nhiên - Công nghệ - Môi trường",
                "credits": 44,
                "mandatory": true,
                "breakdown": {
                    "MATH_MANDATORY": {
                        "name": "Toán và Cơ sở lập trình bắt buộc",
                        "credits_required": 40,
                        "courses": [
                            "MTH00010",
                            "MTH00011",
                            "MTH00019",
                            "MTH00013",
                            "MTH00014",
                            "MTH00017",
                            "MTH00031",
                            "MTH00034",
                            "MTH00042",
                            "MTH00043",
                            "MTH00055",
                            "MTH00084",
                            "MTH00087",
                            "MTH00088"
                        ]
                    },
                    "ENVIRONMENT": {
                        "name": "Môi trường và Trái đất",
                        "credits_required": 2,
                        "note": "Chọn tối thiểu 2 tín chỉ",
                        "courses": [
                            "GEO00002",
                            "ENV00001",
                            "ENV00003"
                        ]
                    },
                    "SCIENCE": {
                        "name": "Khoa học tự nhiên",
                        "credits_required": 2,
                        "note": "Chọn tối thiểu 2 tín chỉ",
                        "courses": [
                            "BIO00001",
                            "BIO00002",
                            "BIO00081",
                            "BIO00082",
                            "CHE00001",
                            "CHE00002",
                            "CHE00081",
                            "CHE00082",
                            "PHY00001",
                            "PHY00002",
                            "PHY00081"
                        ]
                    }
                }
            },
            "GENERAL_IT": {
                "name": "Tin học",
                "credits": 3,
                "mandatory": true,
                "note": "Không tính vào điểm trung bình, tính vào số tín chỉ tích lũy",
                "courses": [
                    "CSC00003"
                ]
            },
            "GENERAL_ENGLISH": {
                "name": "Ngoại ngữ",
                "credits": 12,
                "mandatory": false,
                "note": "Không tính vào điểm trung bình và tín chỉ tích lũy. SV chỉ đăng ký học nếu chưa có chứng chỉ đạt chuẩn ngoại ngữ đầu ra theo quy định hiện hành.",
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
                "note": "Không tính vào điểm trung bình, tính vào số tín chỉ tích lũy",
                "courses": [
                    "BAA00021",
                    "BAA00022"
                ]
            },
            "GENERAL_DEFENSE": {
                "name": "Giáo dục quốc phòng - An ninh",
                "credits": 4,
                "mandatory": true,
                "note": "Không tính vào điểm trung bình, tính vào số tín chỉ tích lũy",
                "courses": [
                    "BAA00030"
                ]
            }
        }
    },
    "FOUNDATION": {
        "name": "Kiến thức cơ sở ngành",
        "total_credits_required": 32,
        "breakdown": {
            "MANDATORY": {
                "credits_required": 24,
                "courses": [
                    "MTH10441",
                    "MTH10403",
                    "MTH10131",
                    "MTH10109",
                    "MTH10412",
                    "MTH10426",
                    "MTH10433"
                ]
            },
            "ELECTIVE": {
                "credits_required": 8,
                "courses": [
                    "MTH10003",
                    "MTH10004",
                    "MTH10201",
                    "MTH10312",
                    "MTH10405",
                    "MTH10428",
                    "MTH10442",
                    "MTH10449"
                ]
            }
        }
    },
    "MAJOR_MATHEMATICS_TALENT": {
        "name": "Kiến thức chuyên ngành Toán học - Chương trình tài năng",
        "total_credits_required": 29,
        "note": "Chọn 1 chuyên ngành; 20 tín chỉ bắt buộc riêng + tối thiểu 9 tín chỉ tự chọn Phụ lục 1.",
        "breakdown": {
            "ALGEBRA": {
                "name": "Chuyên ngành Đại số",
                "total_credits_required": 29,
                "mandatory_credits": 20,
                "elective_credits": 9,
                "mandatory_courses": [
                    "MTH10419",
                    "MTH10420",
                    "MTH10421",
                    "MTH10422",
                    "MTH10501"
                ],
                "elective_courses": [
                    "MTH10418",
                    "MTH10492",
                    "MTH10497",
                    "MTH10498",
                    "MTH10503",
                    "MTH10505",
                    "MTH10507",
                    "MTH10525",
                    "MTH10564",
                    "MTH10596",
                    "MTH10601",
                    "MTH10603"
                ],
                "note": "Tích lũy tối thiểu 09 tín chỉ tự chọn trong Phụ lục 1."
            },
            "ANALYSIS": {
                "name": "Chuyên ngành Giải tích",
                "total_credits_required": 29,
                "mandatory_credits": 20,
                "elective_credits": 9,
                "mandatory_courses": [
                    "MTH10413",
                    "MTH10417",
                    "MTH10436",
                    "MTH10443",
                    "MTH10451"
                ],
                "elective_courses": [
                    "MTH10478",
                    "MTH10480",
                    "MTH10492",
                    "MTH10564",
                    "MTH10409",
                    "MTH10414",
                    "MTH10438",
                    "MTH10439",
                    "MTH10444",
                    "MTH10461",
                    "MTH10473",
                    "MTH10555",
                    "MTH10556",
                    "MTH10604",
                    "MTH10607"
                ],
                "note": "Tích lũy tối thiểu 09 tín chỉ tự chọn trong Phụ lục 1."
            },
            "NUMERICAL_ANALYSIS": {
                "name": "Chuyên ngành Giải tích số",
                "total_credits_required": 29,
                "mandatory_credits": 20,
                "elective_credits": 9,
                "mandatory_courses": [
                    "MTH10438",
                    "MTH10555",
                    "MTH10556",
                    "MTH10604",
                    "MTH10532"
                ],
                "elective_courses": [
                    "MTH10417",
                    "MTH10478",
                    "MTH10480",
                    "MTH10492",
                    "MTH10564",
                    "MTH10409",
                    "MTH10413",
                    "MTH10414",
                    "MTH10436",
                    "MTH10439",
                    "MTH10443",
                    "MTH10444",
                    "MTH10461",
                    "MTH10473",
                    "MTH10607"
                ],
                "note": "Tích lũy tối thiểu 09 tín chỉ tự chọn trong Phụ lục 1."
            },
            "PROBABILITY_STATISTICS": {
                "name": "Chuyên ngành Xác suất - Thống kê",
                "total_credits_required": 29,
                "mandatory_credits": 20,
                "elective_credits": 9,
                "mandatory_courses": [
                    "MTH10423",
                    "MTH10424",
                    "MTH10485",
                    "MTH10619",
                    "MTH10508"
                ],
                "elective_courses": [
                    "MTH10564",
                    "MTH10510",
                    "MTH10511",
                    "MTH10512",
                    "MTH10515",
                    "MTH10518",
                    "MTH10519",
                    "MTH10554",
                    "MTH10557",
                    "MTH10558",
                    "MTH10565",
                    "MTH10566",
                    "MTH10708"
                ],
                "note": "Tích lũy tối thiểu 09 tín chỉ tự chọn trong Phụ lục 1."
            }
        },
        "talent_core_requirement": {
            "credits_required": 78,
            "note": "Theo điều kiện tốt nghiệp của chương trình tài năng: ít nhất 78 tín chỉ phải tích lũy từ các học phần tổ chức lớp riêng cho chương trình tài năng theo mục 7.2.4.1."
        }
    },
    "GRADUATION": {
        "name": "Kiến thức tốt nghiệp",
        "total_credits_required": 10,
        "options": [
            {
                "type": "THESIS",
                "credits": 10,
                "courses": [
                    "MTH10595"
                ]
            }
        ]
    }
}
