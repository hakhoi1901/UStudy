export const categories = {
    "GENERAL_EDUCATION": {
        "name": "Giáo dục đại cương",
        "total_credits_required": 53,
        "note": "Không kể Giáo dục thể chất, Giáo dục quốc phòng - An ninh, Tin học cơ sở và Ngoại ngữ",
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
                "note": "Chọn 1 trong 3 môn học phần tự chọn (TC1)",
                "courses": [
                    "BAA00005",
                    "BAA00007",
                    "BAA00006"
                ]
            },
            "GENERAL_MATH_SCIENCE_TECH_ENV": {
                "name": "Toán - Khoa học tự nhiên - Công nghệ - Môi trường",
                "credits": 37,
                "mandatory": true,
                "breakdown": {
                    "MANDATORY": {
                        "name": "Học phần bắt buộc",
                        "credits_required": 34,
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
                            "ENV00011",
                            "MTH00001",
                            "BIO00001",
                            "PHY00001"
                        ]
                    },
                    "ELECTIVE": {
                        "name": "Học phần tự chọn",
                        "credits_required": 3,
                        "note": "Chọn 1 trong 2 học phần trong nhóm TC2",
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
                "note": "Không tính vào điểm trung bình và tính vào tín chỉ tích lũy",
                "courses": [
                    "CSC00003"
                ]
            },
            "GENERAL_ENGLISH": {
                "name": "Ngoại ngữ",
                "credits": 12,
                "mandatory": false,
                "note": "Không tính vào điểm trung bình và số tín chỉ tích lũy",
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
                "note": "Không tính vào điểm trung bình và tính vào tín chỉ tích lũy",
                "courses": [
                    "BAA00021",
                    "BAA00022"
                ]
            },
            "GENERAL_DEFENSE": {
                "name": "Giáo dục quốc phòng - An ninh",
                "credits": 4,
                "mandatory": true,
                "note": "Không tính vào điểm trung bình và tính vào tín chỉ tích lũy",
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
                "name": "Học phần bắt buộc",
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
                "name": "Học phần tự chọn",
                "credits": 8,
                "note": "Sinh viên chọn học để tích lũy được 8 TC trong danh sách",
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
    "MAJOR": {
        "name": "Kiến thức chuyên ngành",
        "total_credits_required": 19,
        "breakdown": {
            "MAJOR_WATER_AND_SOIL": {
                "name": "Chuyên ngành Công nghệ môi trường Nước và Đất",
                "total_credits_required": 19,
                "breakdown": {
                    "MANDATORY": {
                        "name": "Học phần bắt buộc",
                        "credits": 13,
                        "courses": [
                            "ENE10166",
                            "ENE10102",
                            "ENE10103",
                            "ENE10104",
                            "ENE10105",
                            "ENE10106"
                        ]
                    },
                    "ELECTIVE": {
                        "name": "Học phần tự chọn",
                        "credits": 6,
                        "note": "Sinh viên chọn học để tích lũy được 6 TC trong danh sách",
                        "courses": [
                            "ENE10156",
                            "ENE10157",
                            "ENE10158",
                            "ENE10159",
                            "ENE10160",
                            "ENE10163",
                            "ENE10150",
                            "ENE10151",
                            "ENE10153",
                            "ENE10155",
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
                            "ENE10178"
                        ]
                    }
                }
            },
            "MAJOR_AIR_AND_SOLID_WASTE": {
                "name": "Chuyên ngành Công nghệ Môi trường Không khí và Chất thải rắn",
                "total_credits_required": 19,
                "breakdown": {
                    "MANDATORY": {
                        "name": "Học phần bắt buộc",
                        "credits": 13,
                        "courses": [
                            "ENE10150",
                            "ENE10151",
                            "ENE10152",
                            "ENE10153",
                            "ENE10154",
                            "ENE10177"
                        ]
                    },
                    "ELECTIVE": {
                        "name": "Học phần tự chọn",
                        "credits": 6,
                        "note": "Sinh viên chọn học để tích lũy được 6 TC trong danh sách",
                        "courses": [
                            "ENE10156",
                            "ENE10157",
                            "ENE10158",
                            "ENE10159",
                            "ENE10160",
                            "ENE10163",
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
                            "ENE10178"
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
                "note": "Phương án 1: Khóa luận tốt nghiệp (10 tín chỉ)",
                "courses": [
                    "ENE10195"
                ]
            },
            {
                "type": "SEMINAR_AND_ELECTIVES",
                "credits": 10,
                "note": "Phương án 2: Seminar tốt nghiệp (06 tín chỉ) và học phần tự chọn (04 tín chỉ thuộc khối kiến thức chuyên ngành)",
                "courses": [
                    "ENE10190"
                ]
            }
        ]
    }
};
