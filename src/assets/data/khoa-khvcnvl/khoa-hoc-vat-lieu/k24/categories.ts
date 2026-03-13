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
                            "CHE00001",
                            "CHE00002",
                            "CHE00081",
                            "MSC00001",
                            "MSC00010",
                            "BIO00001",
                            "MTH00003",
                            "MTH00002",
                            "MTH00040",
                            "PHY00001",
                            "PHY00002",
                            "PHY00004",
                            "PHY00081"
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
        "total_credits_required": 32,
        "mandatory": true,
        "courses": [
            "MSC10033",
            "MSC10001",
            "MSC10004",
            "MSC10009",
            "MSC10019",
            "MSC10002",
            "MSC10010",
            "MSC10011",
            "MSC10015",
            "MSC10016",
            "MSC10020",
            "MSC10017",
            "MSC10018",
            "MSC10005"
        ]
    },
    "MAJOR": {
        "name": "Chuyên ngành",
        "total_credits_required": 34,
        "breakdown": {
            "MAJOR_POLYMER_COMPOSITE": {
                "name": "Chuyên ngành Vật liệu Polymer và Composite",
                "total_credits_required": 34,
                "breakdown": {
                    "MANDATORY": {
                        "credits": 34,
                        "note": "Học phần bắt buộc: Tích lũy tổng cộng 34 tín chỉ",
                        "courses": [
                            "MSC10222",
                            "MSC10203",
                            "MSC10209",
                            "MSC10204",
                            "MSC10219",
                            "MSC10211",
                            "MSC10217",
                            "MSC10206",
                            "MSC10221",
                            "MSC10208",
                            "MSC10202",
                            "MSC10201",
                            "MSC10218",
                            "MSC10220",
                            "MSC10121"
                        ]
                    }
                }
            },
            "MAJOR_BIOMATERIALS": {
                "name": "Chuyên ngành Vật liệu y sinh",
                "total_credits_required": 34,
                "breakdown": {
                    "MANDATORY": {
                        "credits": 30,
                        "note": "Học phần bắt buộc: Tích lũy tổng cộng 30 tín chỉ",
                        "courses": [
                            "MSC10302",
                            "MSC10312",
                            "MSC10304",
                            "MSC10307",
                            "MSC10305",
                            "MSC10306",
                            "MSC10319",
                            "MSC10320",
                            "MSC10314",
                            "MSC10315",
                            "MSC10121"
                        ]
                    },
                    "ELECTIVE": {
                        "credits": 4,
                        "note": "Học phần tự chọn: Tích lũy tổng cộng 4 tín chỉ",
                        "courses": [
                            "MSC10321",
                            "MSC10316",
                            "MSC10317",
                            "MSC10318"
                        ]
                    }
                }
            },
            "MAJOR_THIN_FILM": {
                "name": "Chuyên ngành Vật liệu màng mỏng",
                "total_credits_required": 34,
                "breakdown": {
                    "MANDATORY": {
                        "credits": 26,
                        "note": "Học phần bắt buộc: Tích lũy tổng cộng 26 tín chỉ",
                        "courses": [
                            "MSC10107",
                            "MSC10105",
                            "MSC10101",
                            "MSC10108",
                            "MSC10109",
                            "MSC10110",
                            "MSC10113",
                            "MSC10111",
                            "MSC10103",
                            "MSC10104",
                            "MSC10121"
                        ]
                    },
                    "ELECTIVE": {
                        "credits": 8,
                        "note": "Học phần tự chọn: Tích lũy tổng cộng 8 tín chỉ",
                        "courses": [
                            "MSC10112",
                            "MSC10114",
                            "MSC10115",
                            "MSC10116",
                            "MSC10118",
                            "MSC10119",
                            "MSC10120"
                        ]
                    }
                }
            }
        }
    },
    "GRADUATION": {
        "name": "Kiến thức tốt nghiệp",
        "total_credits_required": 10,
        "breakdown": {
            "GRADUATION_POLYMER_COMPOSITE": {
                "name": "Kiến thức tốt nghiệp - Chuyên ngành Vật liệu Polymer và Composite",
                "options": [
                    {
                        "type": "THESIS",
                        "credits": 10,
                        "note": "Phương án 1: Sinh viên thực hiện Khóa luận tốt nghiệp 10TC",
                        "courses": [
                            "MSC10295"
                        ]
                    },
                    {
                        "type": "PROJECT_AND_ELECTIVES",
                        "credits": 10,
                        "note": "Phương án 2: Sinh viên thực hiện Seminar tốt nghiệp 06 tín chỉ và học tối thiểu 04 tín chỉ từ các môn tự chọn chuyên đề tốt nghiệp",
                        "courses": [
                            "MSC10290",
                            "MSC10214",
                            "MSC10215",
                            "MSC10216",
                            "MSC10213",
                            "MSC10012"
                        ]
                    }
                ]
            },
            "GRADUATION_BIOMATERIALS": {
                "name": "Kiến thức tốt nghiệp - Chuyên ngành Vật liệu y sinh",
                "options": [
                    {
                        "type": "THESIS",
                        "credits": 10,
                        "note": "Phương án 1: Sinh viên thực hiện Khóa luận tốt nghiệp 10TC",
                        "courses": [
                            "MSC10395"
                        ]
                    },
                    {
                        "type": "PROJECT_AND_ELECTIVES",
                        "credits": 10,
                        "note": "Phương án 2: Sinh viên thực hiện Seminar tốt nghiệp và học 06 tín chỉ của các học phần danh sách tương ứng",
                        "courses": [
                            "MSC10390",
                            "MSC10313",
                            "MSC10012"
                        ]
                    }
                ]
            },
            "GRADUATION_THIN_FILM": {
                "name": "Kiến thức tốt nghiệp - Chuyên ngành Vật liệu màng mỏng",
                "options": [
                    {
                        "type": "THESIS",
                        "credits": 10,
                        "note": "Phương án 1: Sinh viên thực hiện Khóa luận tốt nghiệp 10TC",
                        "courses": [
                            "MSC10195"
                        ]
                    },
                    {
                        "type": "PROJECT_AND_ELECTIVES",
                        "credits": 10,
                        "note": "Phương án 2: Sinh viên thực hiện Seminar tốt nghiệp và học 06 tín chỉ của các học phần danh sách tương ứng",
                        "courses": [
                            "MSC10190",
                            "MSC10117",
                            "MSC10012"
                        ]
                    }
                ]
            }
        }
    }
};