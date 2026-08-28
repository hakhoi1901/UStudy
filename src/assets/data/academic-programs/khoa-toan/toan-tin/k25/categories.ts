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
                "note": "Chọn 1 trong 3 học phần",
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
                    "MTH10131",
                    "MTH10109",
                    "MTH10405",
                    "MTH10407",
                    "MTH10312",
                    "MTH10442"
                ]
            },
            "ELECTIVE": {
                "credits_required": 8,
                "courses": [
                    "MTH10449",
                    "MTH10450",
                    "MTH10566",
                    "MTH10619",
                    "MTH10708",
                    "MTH10412",
                    "MTH10439",
                    "MTH10433",
                    "MTH10003"
                ]
            }
        }
    },
    "MAJOR_MATHEMATICS_AND_CS": {
        "name": "Kiến thức chuyên ngành Toán tin",
        "total_credits_required": 29,
        "note": "Chọn 1 chuyên ngành để xét tốt nghiệp.",
        "breakdown": {
            "DATA_SCIENCE": {
                "name": "Chuyên ngành Khoa học dữ liệu",
                "total_credits_required": 29,
                "mandatory_credits": 16,
                "elective_credits": 13,
                "mandatory_courses": [
                    "MTH10318",
                    "MTH10353",
                    "MTH10605",
                    "MTH10358"
                ],
                "elective_courses": [
                    "MTH10519",
                    "MTH10315",
                    "MTH10325",
                    "MTH10332",
                    "MTH10317",
                    "MTH10322",
                    "MTH10323",
                    "MTH10344",
                    "MTH10354",
                    "MTH10359",
                    "MTH10607",
                    "MTH10623",
                    "MTH10628",
                    "MTH10620"
                ],
                "note": "Nhóm tự chọn gồm seminar ở mục 7.2.2 và các học phần gắn nhãn tương ứng trong Phụ lục 1."
            },
            "MATHEMATICAL_METHODS_CS": {
                "name": "Chuyên ngành Phương pháp toán trong tin học",
                "total_credits_required": 29,
                "mandatory_credits": 16,
                "elective_credits": 13,
                "mandatory_courses": [
                    "MTH10318",
                    "MTH10353",
                    "MTH10325",
                    "MTH10324"
                ],
                "elective_courses": [
                    "MTH10315",
                    "MTH10319",
                    "MTH10321",
                    "MTH10332",
                    "MTH10347",
                    "MTH10355",
                    "MTH10317",
                    "MTH10322",
                    "MTH10323",
                    "MTH10354",
                    "MTH10358",
                    "MTH10359",
                    "MTH10605",
                    "MTH10607",
                    "MTH10623",
                    "MTH10628",
                    "MTH10346"
                ],
                "note": "Nhóm tự chọn gồm seminar ở mục 7.2.2 và các học phần gắn nhãn tương ứng trong Phụ lục 1."
            },
            "APPLIED_MATH_CS": {
                "name": "Chuyên ngành Toán tin ứng dụng",
                "total_credits_required": 29,
                "mandatory_credits": 16,
                "elective_credits": 13,
                "mandatory_courses": [
                    "MTH10360",
                    "MTH10311",
                    "MTH10315",
                    "MTH10313"
                ],
                "elective_courses": [
                    "MTH10308",
                    "MTH10309",
                    "MTH10310",
                    "MTH10314",
                    "MTH10332",
                    "MTH10333",
                    "MTH10334",
                    "MTH10335",
                    "MTH10337",
                    "MTH10341",
                    "MTH10345",
                    "MTH10318",
                    "MTH10322",
                    "MTH10331",
                    "MTH10344",
                    "MTH10353",
                    "MTH10359",
                    "MTH10623",
                    "MTH10628",
                    "MTH10326"
                ],
                "note": "Nhóm tự chọn gồm seminar ở mục 7.2.2 và các học phần gắn nhãn tương ứng trong Phụ lục 1."
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
                "note": "4 tín chỉ tự chọn lấy từ danh sách Phụ lục 1 theo quy định."
            }
        ]
    }
}
