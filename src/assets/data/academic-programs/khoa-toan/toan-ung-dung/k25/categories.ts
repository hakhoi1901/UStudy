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
        "total_credits_required": 34,
        "breakdown": {
            "MANDATORY": {
                "credits_required": 26,
                "courses": [
                    "MTH10109",
                    "MTH10131",
                    "MTH10201",
                    "MTH10403",
                    "MTH10441",
                    "MTH10449",
                    "MTH10003",
                    "MTH10004"
                ]
            },
            "ELECTIVE": {
                "credits_required": 8,
                "courses": [
                    "MTH10312",
                    "MTH10442",
                    "MTH10405",
                    "MTH10414",
                    "MTH10412",
                    "MTH10421",
                    "MTH10426",
                    "MTH10605",
                    "MTH10619"
                ]
            }
        }
    },
    "MAJOR_APPLIED_MATHEMATICS": {
        "name": "Kiến thức chuyên ngành Toán ứng dụng",
        "total_credits_required": 27,
        "note": "Chọn 1 chuyên ngành để xét tốt nghiệp.",
        "breakdown": {
            "MECHANICS": {
                "name": "Chuyên ngành Cơ học",
                "total_credits_required": 27,
                "mandatory_credits": 16,
                "elective_credits": 11,
                "mandatory_courses": [
                    "MTH10433",
                    "MTH10427",
                    "MTH10428",
                    "MTH10429"
                ],
                "elective_courses": [
                    "MTH10434",
                    "MTH10560",
                    "MTH10561",
                    "MTH10562",
                    "MTH10563",
                    "MTH10520"
                ],
                "note": "Nhóm tự chọn gồm seminar ở mục 7.2.2 và các học phần gắn nhãn tương ứng trong Phụ lục 1. MTH10435 được Phụ lục 1 đánh dấu ở cột bắt buộc chuyên ngành nhưng không nằm trong danh sách bắt buộc mục 7.2.2.1, nên file này không tự ý xếp MTH10435 vào nhóm bắt buộc hoặc tự chọn."
            },
            "MATH_EDUCATION": {
                "name": "Chuyên ngành Giáo dục toán học",
                "total_credits_required": 27,
                "mandatory_credits": 15,
                "elective_credits": 12,
                "mandatory_courses": [
                    "MTH10104",
                    "MTH10132",
                    "MTH10133",
                    "MTH10001",
                    "MTH10134"
                ],
                "elective_courses": [
                    "MTH10002",
                    "MTH10102",
                    "MTH10123",
                    "MTH10135",
                    "MTH10136",
                    "MTH10137",
                    "MTH10138",
                    "MTH10139",
                    "MTH10140",
                    "MTH10126"
                ],
                "note": "Nhóm tự chọn gồm seminar ở mục 7.2.2 và các học phần gắn nhãn tương ứng trong Phụ lục 1."
            },
            "QUANT_FINANCE": {
                "name": "Chuyên ngành Tài chính định lượng",
                "total_credits_required": 27,
                "mandatory_credits": 16,
                "elective_credits": 11,
                "mandatory_courses": [
                    "MTH10214",
                    "MTH10202",
                    "MTH10203",
                    "MTH10209"
                ],
                "elective_courses": [
                    "MTH10519",
                    "MTH10558",
                    "MTH10204",
                    "MTH10215",
                    "MTH10216",
                    "MTH10217",
                    "MTH10219",
                    "MTH10220",
                    "MTH10221",
                    "MTH10625",
                    "MTH10218"
                ],
                "note": "Nhóm tự chọn gồm seminar ở mục 7.2.2 và các học phần gắn nhãn tương ứng trong Phụ lục 1."
            },
            "OPTIMIZATION": {
                "name": "Chuyên ngành Tối ưu",
                "total_credits_required": 27,
                "mandatory_credits": 16,
                "elective_credits": 11,
                "mandatory_courses": [
                    "MTH10446",
                    "MTH10447",
                    "MTH10450",
                    "MTH10543"
                ],
                "elective_courses": [
                    "MTH10538",
                    "MTH10539",
                    "MTH10540",
                    "MTH10541",
                    "MTH10544",
                    "MTH10545",
                    "MTH10553",
                    "MTH10614",
                    "MTH10615",
                    "MTH10616"
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
                ],
                "applicable_to": [
                    "MECHANICS",
                    "QUANT_FINANCE",
                    "OPTIMIZATION"
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
                "applicable_to": [
                    "MECHANICS",
                    "QUANT_FINANCE",
                    "OPTIMIZATION"
                ],
                "note": "4 tín chỉ tự chọn lấy từ danh sách Phụ lục 1 theo quy định."
            },
            {
                "type": "TEACHING_PRACTICUM_AND_ELECTIVE",
                "credits": 10,
                "mandatory_courses": [
                    "MTH10112"
                ],
                "mandatory_credits": 4,
                "elective_credits": 6,
                "applicable_to": [
                    "MATH_EDUCATION"
                ],
                "note": "Phương án 3 chỉ dành cho chuyên ngành Giáo dục toán học; 6 tín chỉ tự chọn lấy từ Phụ lục 1."
            }
        ]
    }
}
