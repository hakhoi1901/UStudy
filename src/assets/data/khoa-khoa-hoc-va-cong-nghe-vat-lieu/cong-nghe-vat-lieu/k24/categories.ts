export const categories = {
    "GENERAL_EDUCATION": {
        "name": "Giáo dục đại cương",
        "total_credits_required": 54,
        "note": "Không kể môn GDQP-AN, GDTC, Tin học cơ sở và Ngoại ngữ",
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
                "note": "Chọn 01 học phần (02 tín chỉ)",
                "courses": [
                    "BAA00005",
                    "BAA00006",
                    "BAA00007",
                    "MST00005"
                ]
            },
            "GENERAL_MATH_SCIENCE": {
                "name": "Toán - Khoa học tự nhiên - Công nghệ - Môi trường",
                "credits": 38,
                "mandatory": true,
                "note": "36 TC bắt buộc + 02 TC tự chọn",
                "breakdown": {
                    "MANDATORY": {
                        "name": "Bắt buộc",
                        "credits_required": 36,
                        "courses": [
                            "MTH00003",
                            "MTH00002",
                            "MTH00040",
                            "CHE00001",
                            "CHE00002",
                            "CHE00081",
                            "PHY00001",
                            "PHY00002",
                            "PHY00004",
                            "PHY00081",
                            "MSC00001",
                            "MST00003",
                            "MST00004"
                        ]
                    },
                    "ELECTIVE": {
                        "name": "Tự chọn",
                        "credits_required": 2,
                        "note": "Chọn 01 học phần (02 tín chỉ)",
                        "courses": [
                            "GEO00002",
                            "ENV00001",
                            "MST00001"
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
                "note": "Không tính vào điểm trung bình và tín chỉ tích lũy. SV đạt chuẩn ngoại ngữ đầu ra theo quy định thì không đăng ký học",
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
        "total_credits_required": 39,
        "mandatory": true,
        "courses": [
            "MST10001",
            "MST10002",
            "MST10015",
            "MST10016",
            "MST10017",
            "MST10018",
            "MST10019",
            "MST10020",
            "MST10021",
            "MST10022",
            "MST10023",
            "MST10024",
            "MST10025",
            "MST10026",
            "MST10027",
            "MST10028",
            "MST10029",
            "MST10030",
            "MST10031",
            "MST10032"
        ]
    },
    "MAJOR": {
        "name": "Chuyên ngành",
        "total_credits_required": 29,
        "breakdown": {
            "MAJOR_POLYMER_COMPOSITE": {
                "name": "Chuyên ngành Công nghệ Vật liệu Polymer & Composite",
                "total_credits_required": 29,
                "breakdown": {
                    "MANDATORY": {
                        "credits": 21,
                        "note": "Học phần bắt buộc: Tích lũy tổng cộng 21 tín chỉ",
                        "courses": [
                            "MSC10201",
                            "MSC10202",
                            "MSC10219",
                            "MST10101",
                            "MST10112",
                            "MST10129",
                            "MST10136",
                            "MST10138",
                            "MST10139",
                            "MST10140"
                        ]
                    },
                    "ELECTIVE": {
                        "credits": 8,
                        "note": "Học phần tự chọn: Tích lũy tổng cộng 08 tín chỉ",
                        "courses": [
                            "MST10121",
                            "MST10137",
                            "MST10171",
                            "MST10172",
                            "MST10173",
                            "MST10174",
                            "MST10175",
                            "MST10176",
                            "MST10177",
                            "MST10178"
                        ]
                    }
                }
            },
            "MAJOR_BIOMATERIALS": {
                "name": "Chuyên ngành Công nghệ Vật liệu Y Sinh",
                "total_credits_required": 29,
                "breakdown": {
                    "MANDATORY": {
                        "credits": 21,
                        "note": "Học phần bắt buộc: Tích lũy tổng cộng 21 tín chỉ",
                        "courses": [
                            "MSC10315",
                            "MST10112",
                            "MST10129",
                            "MST10136",
                            "MST10201",
                            "MST10202",
                            "MST10203",
                            "MST10204",
                            "MST10205",
                            "MST10206"
                        ]
                    },
                    "ELECTIVE": {
                        "credits": 8,
                        "note": "Học phần tự chọn: Tích lũy tổng cộng 08 tín chỉ",
                        "courses": [
                            "MST10121",
                            "MST10137",
                            "MST10171",
                            "MST10172",
                            "MST10173",
                            "MST10174",
                            "MST10175",
                            "MST10176",
                            "MST10177",
                            "MST10178"
                        ]
                    }
                }
            },
            "MAJOR_SEMICONDUCTOR": {
                "name": "Chuyên ngành Công nghệ Vật liệu bán dẫn",
                "total_credits_required": 29,
                "breakdown": {
                    "MANDATORY": {
                        "credits": 21,
                        "note": "Học phần bắt buộc: Tích lũy tổng cộng 21 tín chỉ",
                        "courses": [
                            "MST10112",
                            "MST10129",
                            "MST10136",
                            "MST10301",
                            "MST10302",
                            "MST10303",
                            "MST10304",
                            "MST10305",
                            "MST10306",
                            "MST10307"
                        ]
                    },
                    "ELECTIVE": {
                        "credits": 8,
                        "note": "Học phần tự chọn: Tích lũy tổng cộng 08 tín chỉ",
                        "courses": [
                            "MST10121",
                            "MST10137",
                            "MST10171",
                            "MST10172",
                            "MST10173",
                            "MST10174",
                            "MST10175",
                            "MST10176",
                            "MST10177",
                            "MST10178"
                        ]
                    }
                }
            },
            "MAJOR_RENEWABLE_ENERGY": {
                "name": "Chuyên ngành Công nghệ Vật liệu năng lượng tái tạo",
                "total_credits_required": 29,
                "breakdown": {
                    "MANDATORY": {
                        "credits": 21,
                        "note": "Học phần bắt buộc: Tích lũy tổng cộng 21 tín chỉ",
                        "courses": [
                            "MST10112",
                            "MST10129",
                            "MST10136",
                            "MST10401",
                            "MST10402",
                            "MST10403",
                            "MST10404",
                            "MST10405",
                            "MST10406",
                            "MST10407"
                        ]
                    },
                    "ELECTIVE": {
                        "credits": 8,
                        "note": "Học phần tự chọn: Tích lũy tổng cộng 08 tín chỉ",
                        "courses": [
                            "MST10121",
                            "MST10137",
                            "MST10171",
                            "MST10172",
                            "MST10173",
                            "MST10174",
                            "MST10175",
                            "MST10176",
                            "MST10177",
                            "MST10178"
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
                "note": "Phương án 1: Sinh viên làm khóa luận tốt nghiệp",
                "courses": [
                    "MST10995"
                ]
            },
            {
                "type": "PROJECT_AND_ELECTIVES",
                "credits": 10,
                "note": "Phương án 2: Sinh viên làm Seminar tốt nghiệp 06 tín chỉ và học 04 tín chỉ học phần liên quan",
                "courses": [
                    "MST10990",
                    "MST10142",
                    "MST10141"
                ]
            }
        ]
    }
};
