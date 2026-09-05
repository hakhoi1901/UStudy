export const categories = {
    "GENERAL_EDUCATION": {
        "name": "Giáo dục đại cương",
        "total_credits_required": 53,
        "note": "Tổng 53 tín chỉ tính vào CTĐT; không kể GDQP-AN, GDTC, Tin học cơ sở và Ngoại ngữ.",
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
                    "BAA00007",
                    "BAA00006"
                ]
            },
            "GENERAL_MATH_SCIENCE": {
                "name": "Toán - Khoa học tự nhiên - Công nghệ - Môi trường",
                "mandatory": true,
                "note": "MTH00040 và ENV00004 là nhóm chọn 1 trong 2; các học phần còn lại theo bảng CTĐT K2025.",
                "courses": [
                    "CHE00001",
                    "ENV00002",
                    "MTH00002",
                    "PHY00002",
                    "GEO00002",
                    "CHE00003",
                    "CHE00082",
                    "CHE00007",
                    "CHE00083",
                    "MTH00040",
                    "ENV00004",
                    "ENV00011",
                    "MTH00001",
                    "BIO00001",
                    "PHY00001"
                ]
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
                "note": "Không tính vào điểm trung bình và tín chỉ tích lũy; chỉ học khi chưa đạt chuẩn ngoại ngữ đầu ra.",
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
        "total_credits_required": 49,
        "breakdown": {
            "MANDATORY": {
                "credits": 41,
                "courses": [
                    "ENE10001",
                    "ENE10002",
                    "ENE10003",
                    "ENE10004",
                    "ENE10005",
                    "ENE10006",
                    "ENE10007",
                    "ENE10008",
                    "ENE10009",
                    "ENE10010",
                    "ENE10011",
                    "ENE10012",
                    "ENE10013",
                    "ENE10014",
                    "ENE10015",
                    "ENE10017",
                    "ENE10031"
                ]
            },
            "ELECTIVE": {
                "credits": 8,
                "note": "Tích lũy tối thiểu 8 tín chỉ",
                "courses": [
                    "ENE10019",
                    "ENE10016",
                    "ENE10032",
                    "ENE10020",
                    "ENE10021",
                    "ENE10022",
                    "ENE10023",
                    "ENE10024",
                    "ENE10025",
                    "ENE10026",
                    "ENE10027",
                    "ENE10030"
                ]
            }
        }
    },
    "MAJOR_ENVIRONMENTAL_ENGINEERING": {
        "name": "Kiến thức chuyên ngành",
        "specializations": {
            "WATER_SOIL": {
                "name": "Công nghệ môi trường nước và đất",
                "total_credits_required": 20,
                "breakdown": {
                    "MANDATORY": {
                        "credits": 14,
                        "courses": [
                            "ENE10166",
                            "ENE10102",
                            "ENE10103",
                            "ENE10104",
                            "ENE10105",
                            "ENE10107"
                        ]
                    },
                    "ELECTIVE": {
                        "credits": 6,
                        "courses": [
                            "ENE10156",
                            "ENE10157",
                            "ENE10160",
                            "ENE10150",
                            "ENE10151",
                            "ENE10153",
                            "ENE10164",
                            "ENE10165",
                            "ENE10167",
                            "ENE10168",
                            "ENE10169",
                            "ENE10170",
                            "ENE10171",
                            "ENE10172",
                            "ENE10173",
                            "ENE10174",
                            "ENE10175",
                            "ENE10176",
                            "ENE10177",
                            "ENE10178",
                            "ENE10179",
                            "ENE10180",
                            "ENE10181"
                        ]
                    }
                }
            },
            "AIR_SOLID_WASTE": {
                "name": "Công nghệ môi trường không khí và chất thải rắn",
                "total_credits_required": 20,
                "breakdown": {
                    "MANDATORY": {
                        "credits": 14,
                        "courses": [
                            "ENE10150",
                            "ENE10151",
                            "ENE10152",
                            "ENE10153",
                            "ENE10108",
                            "ENE10177"
                        ]
                    },
                    "ELECTIVE": {
                        "credits": 6,
                        "courses": [
                            "ENE10156",
                            "ENE10157",
                            "ENE10160",
                            "ENE10103",
                            "ENE10104",
                            "ENE10105",
                            "ENE10164",
                            "ENE10165",
                            "ENE10166",
                            "ENE10167",
                            "ENE10168",
                            "ENE10169",
                            "ENE10170",
                            "ENE10171",
                            "ENE10172",
                            "ENE10173",
                            "ENE10174",
                            "ENE10175",
                            "ENE10176",
                            "ENE10178",
                            "ENE10179",
                            "ENE10180",
                            "ENE10181"
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
                    "ENE10195"
                ]
            },
            {
                "type": "SEMINAR_AND_ELECTIVE",
                "credits": 10,
                "note": "Seminar tốt nghiệp 6 tín chỉ + 4 tín chỉ tự chọn chuyên ngành",
                "courses": [
                    "ENE10190"
                ]
            }
        ]
    }
}