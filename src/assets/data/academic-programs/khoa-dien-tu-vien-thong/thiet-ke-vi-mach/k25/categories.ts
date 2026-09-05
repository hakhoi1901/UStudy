export const categories = {
    "GENERAL_EDUCATION": {
        "name": "Giáo dục đại cương",
        "total_credits_required": 51,
        "note": "Chương trình Cử nhân tài năng Thiết kế vi mạch khóa tuyển 2025; không kể GDQP-AN, GDTC, Tin học cơ sở và Ngoại ngữ.",
        "breakdown": {
            "GENERAL_POLITICS": {
                "name": "Lý luận chính trị - Pháp luật",
                "credits": 14,
                "mandatory": true,
                "courses": [
                    "BAA00003",
                    "BAA00004",
                    "BAA00101",
                    "BAA00102",
                    "BAA00103",
                    "BAA00104"
                ]
            },
            "GENERAL_SOCIAL": {
                "name": "Khoa học xã hội - Kinh tế - Kỹ năng",
                "credits": 2,
                "mandatory": false,
                "note": "Chọn 1 trong 3 học phần.",
                "courses": [
                    "BAA00005",
                    "BAA00006",
                    "BAA00007"
                ]
            },
            "GENERAL_MATH_SCIENCE": {
                "name": "Toán - Khoa học tự nhiên - Công nghệ - Môi trường",
                "credits_required": 35,
                "note": "Chọn 1 trong 2 học phần Khoa học Trái đất/Môi trường và chọn 1 trong 3 học phần Vật lý.",
                "breakdown": {
                    "MANDATORY": {
                        "credits": 30,
                        "courses": [
                            "ETC00001",
                            "ETC00081",
                            "ICD00001",
                            "ICD00002",
                            "ICD00003",
                            "ICD00004",
                            "ICD00005",
                            "ICD00006",
                            "ICD00007",
                            "MTH00003",
                            "MTH00004",
                            "MTH00030",
                            "MTH00040"
                        ]
                    },
                    "EARTH_ENVIRONMENT": {
                        "credits": 2,
                        "note": "Chọn 1 trong 2 học phần.",
                        "courses": [
                            "GEO00002",
                            "ENV00001"
                        ]
                    },
                    "PHYSICS": {
                        "credits": 3,
                        "note": "Chọn 1 trong 3 học phần.",
                        "courses": [
                            "PHY00001",
                            "PHY00002",
                            "PHY00004"
                        ]
                    }
                }
            },
            "GENERAL_IT": {
                "name": "Tin học",
                "credits": 3,
                "mandatory": true,
                "note": "Không tính vào điểm trung bình, tính vào số tín chỉ tích lũy.",
                "courses": [
                    "CSC00003"
                ]
            },
            "GENERAL_ENGLISH": {
                "name": "Ngoại ngữ",
                "credits": 12,
                "mandatory": false,
                "note": "Không tính vào điểm trung bình và tín chỉ tích lũy; sinh viên đạt chuẩn ngoại ngữ đầu ra theo quy định hiện hành thì không đăng ký các học phần Anh văn.",
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
                "note": "Không tính vào điểm trung bình, tính vào số tín chỉ tích lũy.",
                "courses": [
                    "BAA00021",
                    "BAA00022"
                ]
            },
            "GENERAL_DEFENSE": {
                "name": "Giáo dục quốc phòng - An ninh",
                "credits": 4,
                "mandatory": true,
                "note": "Không tính vào điểm trung bình, tính vào số tín chỉ tích lũy.",
                "courses": [
                    "BAA00030"
                ]
            }
        }
    },
    "FOUNDATION": {
        "name": "Kiến thức cơ sở ngành",
        "total_credits_required": 37,
        "breakdown": {
            "MANDATORY": {
                "credits": 28,
                "courses": [
                    "ICD10001",
                    "ICD10002",
                    "ICD10003",
                    "ICD10004",
                    "ETC10005",
                    "ETC10006",
                    "ICD10005",
                    "ICD10006",
                    "ICD10007",
                    "ICD10008",
                    "ICD10009",
                    "ETC10013",
                    "ETC10014",
                    "ETC10015",
                    "ETC10016"
                ]
            },
            "ELECTIVE": {
                "credits": 9,
                "note": "Chọn 03 nhóm học phần, mỗi nhóm tích lũy 03 tín chỉ; với học phần có lý thuyết và thực hành phải chọn cặp tương ứng cùng tên đi kèm.",
                "groups": {
                    "GROUP_1": {
                        "credits": 3,
                        "courses": [
                            "ICD10010",
                            "ICD10011",
                            "ICD10012",
                            "ICD10013",
                            "ICD10014"
                        ]
                    },
                    "GROUP_2": {
                        "credits": 3,
                        "courses": [
                            "ETC10007",
                            "ETC10008",
                            "ICD10015",
                            "ICD10016"
                        ]
                    },
                    "GROUP_3": {
                        "credits": 3,
                        "courses": [
                            "ICD10017",
                            "ICD10018",
                            "ICD10019",
                            "ICD10020",
                            "ICD10021",
                            "ICD10022"
                        ]
                    }
                }
            }
        }
    },
    "MAJOR_INTEGRATED_CIRCUIT_DESIGN": {
        "name": "Kiến thức chuyên ngành",
        "total_credits_required": 39,
        "note": "Chọn một trong 3 chuyên ngành. Mỗi chuyên ngành tích lũy 36 tín chỉ tự chọn và 3 tín chỉ Tập sự.",
        "specializations": {
            "ANALOG_DIGITAL_IC": {
                "name": "Thiết kế vi mạch tương tự và số",
                "total_credits_required": 39,
                "breakdown": {
                    "ELECTIVE_1": {
                        "credits": 15,
                        "note": "Chọn tối thiểu 15 tín chỉ; học phần lý thuyết/thực hành phải chọn theo cặp tương ứng.",
                        "courses": [
                            "ICD10101",
                            "ICD10102",
                            "ICD10103",
                            "ICD10104",
                            "ICD10105",
                            "ICD10106",
                            "ICD10107",
                            "ICD10108",
                            "ETC10112",
                            "ETC10113",
                            "ETC10214",
                            "ETC10215"
                        ]
                    },
                    "ELECTIVE_2": {
                        "credits": 15,
                        "note": "Chọn tối thiểu 15 tín chỉ; học phần lý thuyết/thực hành phải chọn theo cặp tương ứng.",
                        "courses": [
                            "ETC10208",
                            "ETC10209",
                            "ICD10109",
                            "ICD10110",
                            "ICD10111",
                            "ICD10112",
                            "ICD10113",
                            "ICD10114",
                            "ICD10201",
                            "ICD10202",
                            "ICD10115",
                            "ICD10116"
                        ]
                    },
                    "ELECTIVE_3": {
                        "credits": 6,
                        "note": "Chọn 1 trong 3 học phần ICD10307/ICD10308/ICD10312 và 1 trong 2 học phần ICD10309/ICD10313.",
                        "courses": [
                            "ICD10307",
                            "ICD10308",
                            "ICD10312",
                            "ICD10309",
                            "ICD10313"
                        ]
                    },
                    "MANDATORY": {
                        "credits": 3,
                        "courses": [
                            "ICD10311"
                        ]
                    }
                }
            },
            "SEMICONDUCTOR_DEVICES": {
                "name": "Linh kiện vi mạch bán dẫn",
                "total_credits_required": 39,
                "breakdown": {
                    "ELECTIVE_1": {
                        "credits": 15,
                        "note": "Chọn tối thiểu 15 tín chỉ; học phần lý thuyết/thực hành phải chọn theo cặp tương ứng.",
                        "courses": [
                            "ETC10112",
                            "ETC10113",
                            "ETC10214",
                            "ETC10215",
                            "ICD10101",
                            "ICD10102",
                            "ICD10103",
                            "ICD10104",
                            "ICD10105",
                            "ICD10106",
                            "ICD10107",
                            "ICD10108"
                        ]
                    },
                    "ELECTIVE_2": {
                        "credits": 15,
                        "note": "Chọn tối thiểu 15 tín chỉ; học phần lý thuyết/thực hành phải chọn theo cặp tương ứng.",
                        "courses": [
                            "ETC10208",
                            "ETC10209",
                            "ICD10201",
                            "ICD10202",
                            "ICD10203",
                            "ICD10204",
                            "ICD10205",
                            "ICD10206",
                            "ICD10111",
                            "ICD10112",
                            "ICD10115",
                            "ICD10116"
                        ]
                    },
                    "ELECTIVE_3": {
                        "credits": 6,
                        "note": "Chọn 1 trong 3 học phần ICD10307/ICD10308/ICD10312 và 1 trong 2 học phần ICD10309/ICD10313.",
                        "courses": [
                            "ICD10307",
                            "ICD10308",
                            "ICD10312",
                            "ICD10309",
                            "ICD10313"
                        ]
                    },
                    "MANDATORY": {
                        "credits": 3,
                        "courses": [
                            "ICD10311"
                        ]
                    }
                }
            },
            "SOC_INTEGRATED_SYSTEMS": {
                "name": "Thiết kế hệ thống tích hợp trên chip và ứng dụng",
                "total_credits_required": 39,
                "breakdown": {
                    "ELECTIVE_1": {
                        "credits": 15,
                        "note": "Chọn tối thiểu 15 tín chỉ; học phần lý thuyết/thực hành phải chọn theo cặp tương ứng.",
                        "courses": [
                            "ETC10112",
                            "ETC10113",
                            "ETC10214",
                            "ETC10215",
                            "ICD10101",
                            "ICD10102",
                            "ICD10103",
                            "ICD10104",
                            "ICD10105",
                            "ICD10106",
                            "ICD10107",
                            "ICD10108"
                        ]
                    },
                    "ELECTIVE_2": {
                        "credits": 15,
                        "note": "Chọn tối thiểu 15 tín chỉ; học phần lý thuyết/thực hành phải chọn theo cặp tương ứng.",
                        "courses": [
                            "ETC10120",
                            "ETC10139",
                            "ETC10208",
                            "ETC10209",
                            "ICD10111",
                            "ICD10112",
                            "ICD10301",
                            "ICD10302",
                            "ICD10303",
                            "ICD10304",
                            "ICD10305",
                            "ICD10306",
                            "ICD10115",
                            "ICD10116"
                        ]
                    },
                    "ELECTIVE_3": {
                        "credits": 6,
                        "note": "Chọn 1 trong 3 học phần ICD10307/ICD10308/ICD10312 và 1 trong 2 học phần ICD10309/ICD10313.",
                        "courses": [
                            "ICD10307",
                            "ICD10308",
                            "ICD10312",
                            "ICD10309",
                            "ICD10313"
                        ]
                    },
                    "MANDATORY": {
                        "credits": 3,
                        "courses": [
                            "ICD10311"
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
                "courses": [
                    "ICD10395"
                ]
            },
            {
                "type": "PROJECT_AND_ELECTIVE",
                "credits": 10,
                "note": "Đồ án tốt nghiệp 4 tín chỉ + chọn 6 tín chỉ trong danh sách; không tính các học phần đã tích lũy ở trên.",
                "courses": [
                    "ICD10390",
                    "ICD10113",
                    "ICD10114",
                    "ICD10201",
                    "ICD10202",
                    "ICD10305",
                    "ICD10306",
                    "ETC10208",
                    "ETC10209",
                    "ETC10120"
                ]
            }
        ]
    }
}
