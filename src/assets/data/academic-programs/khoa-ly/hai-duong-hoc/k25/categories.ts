export const categories = {
    "GENERAL_EDUCATION": {
        "name": "Giáo dục đại cương",
        "total_credits_required": 48,
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
                    "BAA00007"
                ]
            },
            "GENERAL_MATH_SCIENCE": {
                "name": "Toán - Khoa học tự nhiên - Công nghệ - Môi trường",
                "mandatory": true,
                "breakdown": {
                    "MATH_PHYSICS": {
                        "name": "Toán và Vật lý bắt buộc",
                        "credits_required": 24,
                        "courses": [
                            "MTH00003",
                            "MTH00004",
                            "MTH00030",
                            "MTH00040",
                            "MTH00081",
                            "PHY00001",
                            "PHY00002",
                            "PHY00081",
                            "OMH00001"
                        ]
                    },
                    "SCIENCE": {
                        "name": "Khoa học tự nhiên",
                        "credits_required": 6,
                        "note": "Chọn 1 trong 2 học phần Hóa và 1 trong 2 học phần Sinh",
                        "courses": [
                            "CHE00001",
                            "CHE00002",
                            "BIO00001",
                            "BIO00002"
                        ]
                    },
                    "ENVIRONMENT": {
                        "name": "Môi trường và Trái đất",
                        "credits_required": 2,
                        "note": "Chọn 1 trong 2 học phần",
                        "courses": [
                            "ENV00001",
                            "BAA00015"
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
                "note": "Không tính vào điểm trung bình và tín chỉ tích lũy. Sinh viên đạt chuẩn ngoại ngữ đầu ra theo quy định hiện hành thì không đăng ký các học phần Anh văn.",
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
                "credits": 38,
                "courses": [
                    "PHY10001",
                    "OMH10001",
                    "OMH10002",
                    "OMH10003",
                    "OMH10004",
                    "OMH10005",
                    "OMH10006",
                    "OMH10007",
                    "OMH10008",
                    "OMH10009",
                    "OMH10010",
                    "OMH10011",
                    "OMH10012",
                    "OMH10014",
                    "OMH10015",
                    "OMH10016"
                ]
            },
            "ELECTIVE": {
                "credits": 2,
                "note": "Chọn 2 tín chỉ",
                "courses": [
                    "OMH10013",
                    "OMH10017"
                ]
            }
        }
    },
    "MAJOR_OCEANOGRAPHY": {
        "name": "Chuyên ngành Hải dương học",
        "total_credits_required": 30,
        "breakdown": {
            "MANDATORY": {
                "credits": 10,
                "courses": [
                    "OMH10104",
                    "OMH10105",
                    "OMH10106",
                    "OMH10108"
                ]
            },
            "ELECTIVE": {
                "credits": 20,
                "courses": [
                    "OMH10101",
                    "OMH10102",
                    "OMH10103",
                    "OMH10107",
                    "OMH10109",
                    "OMH10110",
                    "OMH10111",
                    "OMH10112",
                    "OMH10113",
                    "OMH10114",
                    "OMH10115",
                    "OMH10116",
                    "OMH10117",
                    "OMH10118",
                    "OMH10119",
                    "OMH10120",
                    "OMH10404",
                    "OMH10411",
                    "OMH10412",
                    "OMH10414",
                    "OMH10415",
                    "OMH10420",
                    "OMH10422",
                    "OMH10423"
                ]
            }
        }
    },
    "MAJOR_METEOROLOGY": {
        "name": "Chuyên ngành Khí tượng học",
        "total_credits_required": 30,
        "breakdown": {
            "MANDATORY": {
                "credits": 10,
                "courses": [
                    "OMH10201",
                    "OMH10202",
                    "OMH10203",
                    "OMH10206"
                ]
            },
            "ELECTIVE": {
                "credits": 20,
                "courses": [
                    "OMH10101",
                    "OMH10117",
                    "OMH10119",
                    "OMH10120",
                    "OMH10204",
                    "OMH10205",
                    "OMH10207",
                    "OMH10208",
                    "OMH10209",
                    "OMH10210",
                    "OMH10211",
                    "OMH10212",
                    "OMH10213",
                    "OMH10214",
                    "OMH10215",
                    "OMH10216",
                    "OMH10217",
                    "OMH10411",
                    "OMH10412",
                    "OMH10413",
                    "OMH10418",
                    "OMH10421",
                    "OMH10422",
                    "OMH10423"
                ]
            }
        }
    },
    "MAJOR_HYDROLOGY": {
        "name": "Chuyên ngành Thủy văn học",
        "total_credits_required": 30,
        "breakdown": {
            "MANDATORY": {
                "credits": 10,
                "courses": [
                    "OMH10301",
                    "OMH10303",
                    "OMH10305",
                    "OMH10302"
                ]
            },
            "ELECTIVE": {
                "credits": 20,
                "courses": [
                    "OMH10101",
                    "OMH10117",
                    "OMH10119",
                    "OMH10120",
                    "OMH10304",
                    "OMH10306",
                    "OMH10307",
                    "OMH10308",
                    "OMH10309",
                    "OMH10310",
                    "OMH10311",
                    "OMH10312",
                    "OMH10313",
                    "OMH10314",
                    "OMH10315",
                    "OMH10316",
                    "OMH10410",
                    "OMH10411",
                    "OMH10412",
                    "OMH10414",
                    "OMH10419",
                    "OMH10420",
                    "OMH10422",
                    "OMH10423"
                ]
            }
        }
    },
    "MAJOR_INTEGRATED_OCEAN_MET_HYDRO": {
        "name": "Chuyên ngành Hải dương - Khí tượng - Thủy văn",
        "total_credits_required": 30,
        "breakdown": {
            "MANDATORY": {
                "credits": 8,
                "courses": [
                    "OMH10401",
                    "OMH10403",
                    "OMH10406"
                ]
            },
            "ELECTIVE": {
                "credits": 22,
                "courses": [
                    "OMH10101",
                    "OMH10114",
                    "OMH10117",
                    "OMH10119",
                    "OMH10120",
                    "OMH10210",
                    "OMH10211",
                    "OMH10402",
                    "OMH10404",
                    "OMH10405",
                    "OMH10407",
                    "OMH10408",
                    "OMH10410",
                    "OMH10411",
                    "OMH10412",
                    "OMH10413",
                    "OMH10414",
                    "OMH10415",
                    "OMH10416",
                    "OMH10417",
                    "OMH10418",
                    "OMH10419",
                    "OMH10420",
                    "OMH10421",
                    "OMH10422",
                    "OMH10423"
                ]
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
                    "OMH10395"
                ]
            },
            {
                "type": "PROJECT_AND_ELECTIVE",
                "credits": 10,
                "note": "Đồ án tốt nghiệp 6 tín chỉ và 4 tín chỉ học phần tự chọn theo chuyên ngành",
                "courses": [
                    "OMH10396"
                ]
            }
        ]
    }
}
