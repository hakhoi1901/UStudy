export const categories = {
    "GENERAL_EDUCATION": {
        "name": "Giáo dục đại cương",
        "total_credits_required": 46,
        "note": "Không kể GDQP-AN, GDTC và Ngoại ngữ.",
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
                "note": "Chọn 1 trong 4 học phần.",
                "courses": [
                    "BAA00005",
                    "BAA00006",
                    "BAA00016",
                    "EDT00002"
                ]
            },
            "GENERAL_MATH_SCIENCE": {
                "name": "Toán - Khoa học tự nhiên - Công nghệ - Môi trường",
                "credits_required": 30,
                "breakdown": {
                    "ENVIRONMENT": {
                        "credits_required": 2,
                        "note": "Chọn 1 trong 4 học phần.",
                        "courses": [
                            "ENV00001",
                            "GEO00002",
                            "BAA00015",
                            "ENV00003"
                        ]
                    },
                    "MANDATORY": {
                        "credits_required": 22,
                        "courses": [
                            "MTH00021",
                            "MTH00022",
                            "MTH00035",
                            "MTH00044",
                            "MTH00045",
                            "EDT00001"
                        ]
                    },
                    "SCIENCE_ELECTIVE": {
                        "credits_required": 6,
                        "note": "Chọn 6 tín chỉ.",
                        "courses": [
                            "PHY00001",
                            "PHY00002",
                            "PHY00004",
                            "CHE00001",
                            "CHE00002",
                            "BIO00001",
                            "BIO00002"
                        ]
                    }
                }
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
        "total_credits_required": 62,
        "breakdown": {
            "MANDATORY": {
                "credits": 37,
                "courses": [
                    "EDT10001",
                    "EDT10002",
                    "EDT10003",
                    "EDT10004",
                    "EDT10005",
                    "EDT10006",
                    "EDT10007",
                    "EDT10008",
                    "EDT10009",
                    "EDT10010",
                    "EDT10011",
                    "EDT10012"
                ]
            },
            "ELECTIVE": {
                "credits": 25,
                "courses": [
                    "EDT10013",
                    "EDT10014",
                    "EDT10015",
                    "EDT10016",
                    "EDT10017",
                    "EDT10018",
                    "EDT10019",
                    "EDT10020",
                    "EDT10021",
                    "EDT10022",
                    "EDT10023",
                    "EDT10024",
                    "EDT10025",
                    "EDT10026",
                    "EDT10027",
                    "EDT10028",
                    "EDT10029",
                    "EDT10030",
                    "EDT10031"
                ]
            }
        }
    },
    "MAJOR_EDUCATIONAL_TECHNOLOGY": {
        "name": "Kiến thức chuyên ngành",
        "specializations": {
            "EDUCATION_TRAINING": {
                "name": "Giáo dục và Đào tạo",
                "total_credits_required": 18,
                "breakdown": {
                    "MANDATORY": {
                        "credits": 11,
                        "courses": [
                            "EDT10101",
                            "EDT10102",
                            "EDT10103",
                            "EDT10104"
                        ]
                    },
                    "ELECTIVE": {
                        "credits": 7,
                        "courses": [
                            "EDT10105",
                            "EDT10106",
                            "EDT10107",
                            "EDT10108",
                            "EDT10109",
                            "EDT10110",
                            "EDT10111",
                            "EDT10112"
                        ]
                    }
                }
            },
            "RESEARCH_DEVELOPMENT": {
                "name": "Nghiên cứu và phát triển",
                "total_credits_required": 18,
                "breakdown": {
                    "MANDATORY": {
                        "credits": 6,
                        "courses": [
                            "EDT10101",
                            "EDT10102"
                        ]
                    },
                    "ELECTIVE": {
                        "credits": 12,
                        "courses": [
                            "EDT10201",
                            "EDT10202",
                            "EDT10203",
                            "EDT10204",
                            "EDT10205",
                            "EDT10206",
                            "EDT10207",
                            "EDT10208",
                            "EDT10209",
                            "EDT10210"
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
                    "EDT10595"
                ]
            },
            {
                "type": "PROJECT_AND_ELECTIVE",
                "credits": 10,
                "note": "Dự án tốt nghiệp 6TC + 4TC tự chọn theo chuyên ngành",
                "courses": [
                    "EDT10590"
                ]
            },
            {
                "type": "INTERNSHIP_AND_ELECTIVE",
                "credits": 10,
                "note": "Thực tập tốt nghiệp 4TC + 6TC tự chọn theo chuyên ngành",
                "courses": [
                    "EDT10591"
                ]
            }
        ]
    }
}
