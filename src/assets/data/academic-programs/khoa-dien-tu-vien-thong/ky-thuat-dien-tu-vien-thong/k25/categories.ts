export const categories = {
    "GENERAL_EDUCATION": {
        "name": "Giáo dục đại cương",
        "total_credits_required": 52,
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
                "credits": 2,
                "note": "Chọn 1 trong 3 học phần.",
                "courses": [
                    "BAA00005",
                    "BAA00006",
                    "BAA00007"
                ]
            },
            "GENERAL_MATH_SCIENCE": {
                "name": "Toán - Khoa học tự nhiên - Công nghệ - Môi trường",
                "credits_required": 36,
                "note": "Nhóm lập trình chọn 1 trong CSC00005/ETC00005; Vật lý chọn 2 trong 3; Trái đất/Môi trường chọn 1 trong 2.",
                "courses": [
                    "MTH00003",
                    "MTH00004",
                    "MTH00030",
                    "MTH00040",
                    "ETC00001",
                    "ETC00002",
                    "ETC00003",
                    "ETC00004",
                    "ETC00081",
                    "ETC00082",
                    "CSC00005",
                    "ETC00005",
                    "PHY00001",
                    "PHY00002",
                    "PHY00004",
                    "GEO00002",
                    "ENV00001"
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
                "courses": [
                    "BAA00021",
                    "BAA00022"
                ]
            },
            "GENERAL_DEFENSE": {
                "name": "Giáo dục quốc phòng - An ninh",
                "credits": 4,
                "courses": [
                    "BAA00030"
                ]
            }
        }
    },
    "FOUNDATION": {
        "name": "Kiến thức cơ sở ngành",
        "total_credits_required": 35,
        "mandatory": true,
        "courses": [
            "ETC10001",
            "ETC10002",
            "ETC10003",
            "ETC10004",
            "ETC10005",
            "ETC10006",
            "ETC10007",
            "ETC10008",
            "ETC10009",
            "ETC10010",
            "ETC10020",
            "ETC10021",
            "ETC10013",
            "ETC10014",
            "ETC10015",
            "ETC10016",
            "ETC10017",
            "ETC10018",
            "ETC10019"
        ]
    },
    "MAJOR_ELECTRONICS_TELECOMMUNICATIONS": {
        "name": "Kiến thức chuyên ngành",
        "specializations": {
            "ELECTRONICS": {
                "name": "Kỹ thuật điện tử",
                "total_credits_required": 34,
                "breakdown": {
                    "MANDATORY": {
                        "credits": 26,
                        "courses": [
                            "ETC10101",
                            "ETC10102",
                            "ETC10103",
                            "ETC10104",
                            "ETC10105",
                            "ETC10106",
                            "ETC10107",
                            "ETC10108",
                            "ETC10109",
                            "ETC10110",
                            "ETC10111"
                        ]
                    },
                    "ELECTIVE": {
                        "credits": 8,
                        "note": "Theo các nhóm tự chọn trong CTĐT.",
                        "courses": [
                            "ETC10112",
                            "ETC10113",
                            "ETC10114",
                            "ETC10115",
                            "ETC10236",
                            "ETC10116",
                            "ETC10117",
                            "ETC10137",
                            "ETC10118",
                            "ETC10119",
                            "ETC10138"
                        ]
                    }
                }
            },
            "COMPUTER_EMBEDDED": {
                "name": "Kỹ thuật máy tính và hệ thống nhúng",
                "total_credits_required": 34,
                "breakdown": {
                    "MANDATORY": {
                        "credits": 26,
                        "courses": [
                            "ETC10201",
                            "ETC10202",
                            "ETC10203",
                            "ETC10204",
                            "ETC10205",
                            "ETC10206",
                            "ETC10207",
                            "ETC10208",
                            "ETC10209",
                            "ETC10210",
                            "ETC10211",
                            "ETC10212",
                            "ETC10213",
                            "ETC10214",
                            "ETC10215"
                        ]
                    },
                    "ELECTIVE": {
                        "credits": 8,
                        "note": "TC1 2TC; TC2 3TC theo cặp; TC3 3TC theo cặp.",
                        "courses": [
                            "ETC10216",
                            "ETC10217",
                            "ETC10218",
                            "ETC10307",
                            "ETC10236",
                            "ETC10219",
                            "ETC10220",
                            "ETC10221",
                            "ETC10222",
                            "ETC10223",
                            "ETC10224",
                            "ETC10225",
                            "ETC10226",
                            "ETC10227",
                            "ETC10228",
                            "ETC10229",
                            "ETC10230"
                        ]
                    }
                }
            },
            "TELECOMMUNICATIONS_NETWORK": {
                "name": "Viễn thông và mạng",
                "total_credits_required": 34,
                "breakdown": {
                    "MANDATORY": {
                        "credits": 22,
                        "courses": [
                            "ETC10301",
                            "ETC10302",
                            "ETC10303",
                            "ETC10304",
                            "ETC10305",
                            "ETC10306",
                            "ETC10307",
                            "ETC10308",
                            "ETC10309",
                            "ETC10310",
                            "ETC10311",
                            "ETC10312",
                            "ETC10313"
                        ]
                    },
                    "ELECTIVE": {
                        "credits": 12,
                        "note": "Tích lũy 12TC theo các nhóm tự chọn của CTĐT.",
                        "courses": [
                            "ETC10314",
                            "ETC10315",
                            "ETC10316",
                            "ETC10320",
                            "ETC10317",
                            "ETC10318",
                            "ETC10319",
                            "ETC10321",
                            "ETC10322",
                            "ETC10323",
                            "ETC10227",
                            "ETC10228",
                            "ETC10324",
                            "ETC10325",
                            "ETC10326",
                            "ETC10327",
                            "ETC10328",
                            "ETC10330",
                            "ETC10236",
                            "ETC10331",
                            "ETC10332"
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
                "specialization": "ELECTRONICS",
                "type": "THESIS",
                "credits": 10,
                "courses": [
                    "ETC10195"
                ]
            },
            {
                "specialization": "ELECTRONICS",
                "type": "PROJECT_AND_ELECTIVE",
                "credits": 10,
                "courses": [
                    "ETC10190",
                    "ETC10120",
                    "ETC10121",
                    "ETC10139"
                ]
            },
            {
                "specialization": "COMPUTER_EMBEDDED",
                "type": "THESIS",
                "credits": 10,
                "courses": [
                    "ETC10295"
                ]
            },
            {
                "specialization": "COMPUTER_EMBEDDED",
                "type": "PROJECT_AND_ELECTIVE",
                "credits": 10,
                "courses": [
                    "ETC10290",
                    "ETC10231",
                    "ETC10232",
                    "ETC10233"
                ]
            },
            {
                "specialization": "TELECOMMUNICATIONS_NETWORK",
                "type": "THESIS",
                "credits": 10,
                "courses": [
                    "ETC10395"
                ]
            },
            {
                "specialization": "TELECOMMUNICATIONS_NETWORK",
                "type": "PROJECT_AND_ELECTIVE",
                "credits": 10,
                "note": "Đồ án 4TC + 6TC tự chọn trong nhóm tốt nghiệp/TC2 chưa tích lũy.",
                "courses": [
                    "ETC10390"
                ]
            }
        ]
    }
}
