export const categories = {
    "GENERAL_EDUCATION": {
        "name": "Giáo dục đại cương",
        "total_credits_required": 47,
        "note": "Không kể môn GDQP-AN, GDTC, tin học cơ sở và ngoại ngữ",
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
                "credits": 12,
                "mandatory": true,
                "breakdown": {
                    "SOCIAL_MANDATORY": {
                        "name": "Khoa học xã hội - Kinh tế - Kỹ năng (Bắt buộc)",
                        "credits_required": 4,
                        "courses": [
                            "BAA00005",
                            "GEO00003"
                        ]
                    },
                    "SOCIAL_ELECTIVE_1": {
                        "name": "Khoa học xã hội - Kinh tế - Kỹ năng (Tự chọn 1)",
                        "credits_required": 2,
                        "note": "Chọn 1 trong 2 học phần",
                        "courses": [
                            "BAA00006",
                            "BAA00007"
                        ]
                    },
                    "SOCIAL_ELECTIVE_2": {
                        "name": "Khoa học xã hội - Kinh tế - Kỹ năng (Tự chọn 2)",
                        "credits_required": 6,
                        "note": "Chọn 3 trong 4 học phần",
                        "courses": [
                            "GEO00004",
                            "GEO00005",
                            "GEO00007",
                            "GEO00008"
                        ]
                    }
                }
            },
            "GENERAL_MATH_SCIENCE": {
                "name": "Toán - Khoa học tự nhiên - Công nghệ - Môi trường",
                "credits": 21,
                "mandatory": true,
                "breakdown": {
                    "MATH_SCIENCE_MANDATORY": {
                        "name": "Toán - KHTN - Công nghệ - Môi trường (Bắt buộc)",
                        "credits_required": 18,
                        "courses": [
                            "MTH00002",
                            "MTH00040",
                            "PHY00001",
                            "CHE00001",
                            "ENV00001",
                            "GEO00009",
                            "GEO00010"
                        ]
                    },
                    "SCIENCE_ELECTIVE": {
                        "name": "Khoa học tự nhiên (Tự chọn)",
                        "credits_required": 3,
                        "note": "Chọn 1 trong 2 học phần",
                        "courses": [
                            "BIO00001",
                            "BIO00002"
                        ]
                    }
                }
            },
            "GENERAL_IT": {
                "name": "Tin học",
                "credits": 3,
                "mandatory": false,
                "note": "Không tính vào điểm trung bình, tính vào số tín chỉ tích lũy",
                "courses": [
                    "CSC00003"
                ]
            },
            "GENERAL_ENGLISH": {
                "name": "Ngoại ngữ",
                "credits": 12,
                "mandatory": false,
                "note": "Không tính vào điểm trung bình và tín chỉ tích lũy",
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
        "total_credits_required": 40,
        "breakdown": {
            "MANDATORY": {
                "name": "Học phần bắt buộc",
                "credits": 36,
                "courses": [
                    "GEO10051",
                    "GEO10002",
                    "GEO10052",
                    "GEO10053",
                    "GEO10054",
                    "GEO10009",
                    "GEO10055",
                    "GEO10056",
                    "GEO10057",
                    "GEO10013",
                    "GEO10058",
                    "GEO10059",
                    "GEO10062",
                    "GEO10063",
                    "GEO10029",
                    "GEO10025",
                    "GEO20201"
                ]
            },
            "ELECTIVE": {
                "name": "Học phần tự chọn",
                "credits": 4,
                "note": "Tích lũy tổng cộng 4 tín chỉ",
                "courses": [
                    "GEO10064",
                    "GEO10061",
                    "GEO10066",
                    "GEO10032",
                    "GEO10067",
                    "GEO10068",
                    "GEO10069",
                    "GEO10065",
                    "GEO10060"
                ]
            }
        }
    },
    "MAJOR": {
        "name": "Kiến thức chuyên ngành",
        "total_credits_required": 30,
        "breakdown": {
            "MAJOR_TIM_KIEM_THAM_DO_KHOANG_SAN": {
                "name": "Chuyên ngành Tìm kiếm thăm dò Khoáng sản",
                "total_credits_required": 30,
                "breakdown": {
                    "MANDATORY": {
                        "name": "Học phần bắt buộc",
                        "credits": 21,
                        "courses": [
                            "GEO20101",
                            "GEO20102",
                            "GEO10113",
                            "GEO20117",
                            "GEO20105",
                            "GEO20108",
                            "GEO20109",
                            "GEO20110",
                            "GEO20118",
                            "GEO10114"
                        ]
                    },
                    "ELECTIVE": {
                        "name": "Học phần tự chọn",
                        "credits": 9,
                        "courses": [
                            "GEO20106",
                            "GEO20120",
                            "GEO10112",
                            "GEO20121",
                            "GEO20119",
                            "GEO20114",
                            "GEO10117",
                            "GEO10118",
                            "GEO10119",
                            "GEO10120",
                            "GEO10121",
                            "GEO10122"
                        ]
                    }
                }
            },
            "MAJOR_DIA_KY_THUAT": {
                "name": "Chuyên ngành Địa kỹ thuật",
                "total_credits_required": 30,
                "breakdown": {
                    "MANDATORY": {
                        "name": "Học phần bắt buộc",
                        "credits": 21,
                        "courses": [
                            "GEO20202",
                            "GEO20204",
                            "GEO20205",
                            "GEO20206",
                            "GEO20207",
                            "GEO10413",
                            "GEO20209",
                            "GEO10114"
                        ]
                    },
                    "ELECTIVE": {
                        "name": "Học phần tự chọn",
                        "credits": 9,
                        "courses": [
                            "GEO20214",
                            "GEO20217",
                            "GEO20211",
                            "GEO20218",
                            "GEO20210",
                            "GEO20212",
                            "GEO10117",
                            "GEO10118",
                            "GEO10119",
                            "GEO10120",
                            "GEO10121",
                            "GEO10122"
                        ]
                    }
                }
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
                "note": "Phương án 1: Sinh viên làm Khóa luận tốt nghiệp",
                "courses": [
                    "GEO20115",
                    "GEO20215"
                ]
            },
            {
                "type": "PROJECT_AND_ELECTIVES",
                "credits": 10,
                "note": "Phương án 2: Sinh viên làm Đồ án tốt nghiệp (6 tín chỉ) và chọn học 04 tín chỉ học phần tự chọn của chuyên ngành",
                "courses": [
                    "GEO20116",
                    "GEO20216"
                ]
            }
        ]
    }
};