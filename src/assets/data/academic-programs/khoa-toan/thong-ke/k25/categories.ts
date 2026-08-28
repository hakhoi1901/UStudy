export const categories = {
    "GENERAL_EDUCATION": {
        "name": "Giáo dục đại cương",
        "total_credits_required": 57,
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
                "note": "Chọn 1 trong 3 học phần",
                "courses": [
                    "BAA00005",
                    "BAA00006",
                    "BAA00008"
                ]
            },
            "GENERAL_MATH_SCIENCE": {
                "name": "Toán - Khoa học tự nhiên - Công nghệ - Môi trường",
                "credits": 41,
                "mandatory": true,
                "breakdown": {
                    "MATH_MANDATORY": {
                        "name": "Toán và Cơ sở lập trình bắt buộc",
                        "credits_required": 35,
                        "courses": [
                            "MTH00010",
                            "MTH00011",
                            "MTH00019",
                            "MTH00013",
                            "MTH00014",
                            "MTH00034",
                            "MTH00088",
                            "MTH00043",
                            "MTH00042",
                            "MTH00023",
                            "MTH00024",
                            "MTH00055"
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
                        "credits_required": 4,
                        "note": "Chọn tối thiểu 4 tín chỉ",
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
        "total_credits_required": 30,
        "mandatory": true,
        "courses": [
            "MTH10441",
            "MTH10405",
            "MTH10312",
            "MTH10449",
            "MTH10007",
            "MTH10008",
            "MTH10619",
            "MTH10628"
        ]
    },
    "MAJOR_STATISTICS": {
        "name": "Kiến thức chuyên ngành Thống kê",
        "total_credits_required": 33,
        "note": "Chọn 1 chuyên ngành để xét tốt nghiệp. Tổng số tín chỉ toàn khóa tối thiểu 130.",
        "breakdown": {
            "FINANCIAL_DATA_ANALYSIS": {
                "name": "Chuyên ngành Phân tích dữ liệu Tài chính",
                "total_credits_required": 33,
                "mandatory_credits": 20,
                "elective_credits": 13,
                "mandatory_courses": [
                    "MTH10511",
                    "MTH10701",
                    "MTH10708",
                    "MTH10558",
                    "MTH10201"
                ],
                "elective_courses": [
                    "MTH10519",
                    "MTH10702",
                    "MTH10703",
                    "MTH10704",
                    "MTH10705",
                    "MTH10706",
                    "MTH10707",
                    "MTH10209",
                    "MTH10220",
                    "MTH10508"
                ],
                "note": "Phải tích lũy tối thiểu 13 tín chỉ tự chọn theo đúng danh sách chỉ định của chuyên ngành."
            },
            "STAT_ML_AI": {
                "name": "Chuyên ngành Thống kê cho Máy học và AI",
                "total_credits_required": 33,
                "mandatory_credits": 20,
                "elective_credits": 13,
                "mandatory_courses": [
                    "MTH10558",
                    "MTH10318",
                    "MTH10701",
                    "MTH10708",
                    "MTH10565"
                ],
                "elective_courses": [
                    "MTH10702",
                    "MTH10703",
                    "MTH10801",
                    "MTH10606",
                    "MTH10515",
                    "MTH10605",
                    "MTH10358",
                    "MTH10511",
                    "MTH10508"
                ],
                "note": "Phải tích lũy tối thiểu 13 tín chỉ tự chọn theo đúng danh sách chỉ định của chuyên ngành."
            }
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
            },
            {
                "type": "PROJECT_AND_ELECTIVE",
                "credits": 10,
                "mandatory_courses": [
                    "MTH10597"
                ],
                "mandatory_credits": 6,
                "elective_credits": 4,
                "elective_courses": [
                    "MTH10549",
                    "MTH10802",
                    "MTH10803"
                ],
                "note": "Chọn tối thiểu 4 tín chỉ từ danh sách tự chọn chỉ định."
            }
        ]
    }
}
