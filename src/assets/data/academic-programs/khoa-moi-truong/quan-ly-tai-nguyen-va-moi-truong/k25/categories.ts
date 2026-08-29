export const categories = {
    "GENERAL_EDUCATION": {
        "name": "Giáo dục đại cương",
        "total_credits_required": 53,
        "note": "Không kể GDQP-AN, GDTC, Tin học cơ sở và Ngoại ngữ.",
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
                "note": "BAA00110 bắt buộc 2TC; chọn 1 trong BAA00005/BAA00006/BAA00007 để tích lũy thêm 2TC.",
                "courses": [
                    "BAA00110",
                    "BAA00005",
                    "BAA00006",
                    "BAA00007"
                ]
            },
            "GENERAL_MATH_SCIENCE": {
                "name": "Toán - Khoa học tự nhiên - Công nghệ - Môi trường",
                "credits_required": 35,
                "note": "Có các nhóm chọn 1: BIO00001/ENM00002; MTH00002/ENM00003; MTH00040/ENV00004.",
                "courses": [
                    "ENM00001",
                    "MTH00001",
                    "BIO00001",
                    "ENM00002",
                    "PHY00001",
                    "CHE00001",
                    "ENV00002",
                    "MTH00002",
                    "ENM00003",
                    "PHY00002",
                    "GEO00002",
                    "CHE00003",
                    "CHE00007",
                    "CHE00083",
                    "MTH00040",
                    "ENV00004"
                ]
            },
            "GENERAL_IT": {
                "name": "Tin học",
                "credits": 3,
                "mandatory": true,
                "courses": [
                    "CSC00003"
                ]
            },
            "GENERAL_ENGLISH": {
                "name": "Ngoại ngữ",
                "credits": 12,
                "mandatory": false,
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
                "courses": [
                    "BAA00021",
                    "BAA00022"
                ]
            },
            "GENERAL_DEFENSE": {
                "name": "Giáo dục quốc phòng - An ninh",
                "credits": 4,
                "mandatory": true,
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
                "credits": 6,
                "note": "TC1: chọn 2 trong 5 học phần (4TC); TC2: chọn 1 trong 2 học phần (2TC).",
                "courses": [
                    "ENM10014",
                    "ENM10015",
                    "ENM10016",
                    "ENM10017",
                    "ENM10018",
                    "ENM10019",
                    "ENM10020"
                ]
            }
        }
    },
    "MAJOR_RESOURCE_ENVIRONMENT_MANAGEMENT": {
        "name": "Kiến thức chuyên ngành",
        "specializations": {
            "INTEGRATED_RESOURCE_ENVIRONMENT": {
                "name": "Quản lý tổng hợp tài nguyên và môi trường",
                "total_credits_required": 21,
                "breakdown": {
                    "MANDATORY": {
                        "credits": 13,
                        "courses": [
                            "ENM10114",
                            "ENM10102",
                            "ENM10103",
                            "ENM10104",
                            "ENM10105"
                        ]
                    },
                    "ELECTIVE": {
                        "credits": 8,
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
            "URBAN_INDUSTRIAL_ENVIRONMENT": {
                "name": "Quản lý môi trường đô thị và công nghiệp",
                "total_credits_required": 21,
                "breakdown": {
                    "MANDATORY": {
                        "credits": 12,
                        "courses": [
                            "ENM10210",
                            "ENM10202",
                            "ENM10203",
                            "ENM10204",
                            "ENM10205"
                        ]
                    },
                    "ELECTIVE": {
                        "credits": 9,
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
            "ENVIRONMENTAL_DATA_SCIENCE": {
                "name": "Khoa học dữ liệu và tin học ứng dụng trong môi trường",
                "total_credits_required": 21,
                "breakdown": {
                    "MANDATORY": {
                        "credits": 15,
                        "courses": [
                            "ENM10308",
                            "ENM10302",
                            "ENM10303",
                            "ENM10304",
                            "ENM10305"
                        ]
                    },
                    "ELECTIVE": {
                        "credits": 6,
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
                "credits": 10,
                "courses": [
                    "ENM10195"
                ]
            },
            {
                "type": "SEMINAR_AND_ELECTIVE",
                "credits": 10,
                "note": "Seminar 6TC + 4TC tự chọn chuyên ngành",
                "courses": [
                    "ENM10190"
                ]
            }
        ]
    }
}
