export const categories = {
    "GENERAL_EDUCATION": {
        "name": "Giáo dục đại cương",
        "total_credits_required": 53,
        "note": "Không kể môn GDQP, GDTC, Tin học cơ sở và Ngoại ngữ",
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
                "credits": 4,
                "mandatory": true,
                "breakdown": {
                    "MANDATORY": {
                        "name": "Học phần bắt buộc",
                        "credits_required": 2,
                        "courses": [
                            "BAA00110"
                        ]
                    },
                    "ELECTIVE": {
                        "name": "Học phần tự chọn",
                        "credits_required": 2,
                        "note": "Chọn 1 trong 3 học phần",
                        "courses": [
                            "BAA00005",
                            "BAA00006",
                            "BAA00007"
                        ]
                    }
                }
            },
            "GENERAL_MATH_SCIENCE": {
                "name": "Toán - Khoa học tự nhiên - Công nghệ - Môi trường",
                "credits": 35,
                "mandatory": true,
                "breakdown": {
                    "MANDATORY": {
                        "name": "Học phần bắt buộc",
                        "credits_required": 26,
                        "courses": [
                            "ENM00001",
                            "MTH00001",
                            "PHY00001",
                            "CHE00001",
                            "ENV00002",
                            "PHY00002",
                            "GEO00002",
                            "CHE00003",
                            "CHE00007",
                            "CHE00083"
                        ]
                    },
                    "ELECTIVE_1": {
                        "name": "Học phần tự chọn 1",
                        "credits_required": 3,
                        "note": "Chọn 1 trong 2 học phần",
                        "courses": [
                            "BIO00001",
                            "ENM00002"
                        ]
                    },
                    "ELECTIVE_2": {
                        "name": "Học phần tự chọn 2",
                        "credits_required": 3,
                        "note": "Chọn 1 trong 2 học phần",
                        "courses": [
                            "MTH00002",
                            "ENM00003"
                        ]
                    },
                    "ELECTIVE_3": {
                        "name": "Học phần tự chọn 3",
                        "credits_required": 3,
                        "note": "Chọn 1 trong 2 học phần",
                        "courses": [
                            "MTH00040",
                            "ENV00004"
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
        "total_credits_required": 52,
        "breakdown": {
            "MANDATORY": {
                "name": "Học phần bắt buộc",
                "credits": 46,
                "courses": [
                    "ENM00005",
                    "ENM00006",
                    "ENM00007",
                    "ENM00008",
                    "ENM00009",
                    "ENM00011",
                    "ENM00012",
                    "ENM10001",
                    "ENM10002",
                    "ENM10003",
                    "ENM10004",
                    "ENM10005",
                    "ENM10006",
                    "ENM10007",
                    "ENM10008",
                    "ENM10009",
                    "ENM10010",
                    "ENM10011",
                    "ENM10012",
                    "ENM10013"
                ]
            },
            "ELECTIVE": {
                "name": "Học phần tự chọn",
                "credits": 6,
                "breakdown": {
                    "GROUP_1": {
                        "name": "Tự chọn 2 trong 5",
                        "credits_required": 4,
                        "courses": [
                            "ENM10014",
                            "ENM10015",
                            "ENM10016",
                            "ENM10017",
                            "ENM10018"
                        ]
                    },
                    "GROUP_2": {
                        "name": "Tự chọn 1 trong 2",
                        "credits_required": 2,
                        "courses": [
                            "ENM10019",
                            "ENM10020"
                        ]
                    }
                }
            }
        }
    },
    "MAJOR": {
        "name": "Chuyên ngành",
        "total_credits_required": 20,
        "breakdown": {
            "MAJOR_INTEGRATED_MANAGEMENT": {
                "name": "Chuyên ngành Quản lý tổng hợp tài nguyên và môi trường",
                "total_credits_required": 20,
                "breakdown": {
                    "MANDATORY": {
                        "name": "Học phần bắt buộc",
                        "credits": 12,
                        "courses": [
                            "ENM10101",
                            "ENM10102",
                            "ENM10103",
                            "ENM10104",
                            "ENM10105"
                        ]
                    },
                    "ELECTIVE": {
                        "name": "Học phần tự chọn",
                        "credits": 8,
                        "note": "Sinh viên tích lũy tối thiểu 8 TC",
                        "courses": [
                            "ENM10106",
                            "ENM10107",
                            "ENM10108",
                            "ENM10109",
                            "ENM10110",
                            "ENM10202",
                            "ENM10203",
                            "ENM10111",
                            "ENM10112",
                            "ENM10113"
                        ]
                    }
                }
            },
            "MAJOR_URBAN_INDUSTRIAL_MANAGEMENT": {
                "name": "Chuyên ngành Quản lý môi trường đô thị và công nghiệp",
                "total_credits_required": 20,
                "breakdown": {
                    "MANDATORY": {
                        "name": "Học phần bắt buộc",
                        "credits": 11,
                        "courses": [
                            "ENM10201",
                            "ENM10202",
                            "ENM10203",
                            "ENM10204",
                            "ENM10205"
                        ]
                    },
                    "ELECTIVE": {
                        "name": "Học phần tự chọn",
                        "credits": 9,
                        "note": "Sinh viên tích lũy tối thiểu 9 TC",
                        "courses": [
                            "ENM10206",
                            "ENM10111",
                            "ENM10207",
                            "ENM10208",
                            "ENM10209",
                            "ENM10103",
                            "ENM10104",
                            "ENM10108",
                            "ENM10112",
                            "ENM10113"
                        ]
                    }
                }
            },
            "MAJOR_DATA_SCIENCE_APPLIED_IT": {
                "name": "Chuyên ngành Khoa học dữ liệu và tin học ứng dụng trong môi trường",
                "total_credits_required": 20,
                "breakdown": {
                    "MANDATORY": {
                        "name": "Học phần bắt buộc",
                        "credits": 14,
                        "courses": [
                            "ENM10301",
                            "ENM10302",
                            "ENM10303",
                            "ENM10304",
                            "ENM10305"
                        ]
                    },
                    "ELECTIVE": {
                        "name": "Học phần tự chọn",
                        "credits": 6,
                        "note": "Sinh viên tích lũy tối thiểu 6 TC",
                        "courses": [
                            "ENM10306",
                            "ENM10307",
                            "ENM10102",
                            "ENM10103",
                            "ENM10110",
                            "ENM10112",
                            "ENM10113",
                            "ENM10203",
                            "ENM10208"
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
                "name": "Khóa luận tốt nghiệp",
                "credits": 10,
                "courses": [
                    "ENM10195"
                ]
            },
            {
                "type": "SEMINAR_AND_ELECTIVES",
                "name": "Seminar tốt nghiệp",
                "credits": 10,
                "note": "Seminar tốt nghiệp (06 tín chỉ) và học phần tự chọn (04 tín chỉ thuộc khối kiến thức chuyên ngành)",
                "courses": [
                    "ENM10190"
                ]
            }
        ]
    }
};