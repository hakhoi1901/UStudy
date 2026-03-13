export const categories = {
    "GENERAL_EDUCATION": {
        "name": "Giáo dục đại cương",
        "total_credits_required": 60,
        "note": "Không kể Giáo dục quốc phòng - An ninh, Anh văn, Tin học cơ sở và Giáo dục thể chất",
        "breakdown": {
            "GENERAL_POLITICS": {
                "name": "Lý luận chính trị – Pháp luật",
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
                "name": "Khoa học xã hội – Kinh tế - Kỹ năng",
                "credits": 2,
                "mandatory": false,
                "note": "Chọn 1 trong 3",
                "courses": [
                    "BAA00005",
                    "BAA00006",
                    "BAA00008"
                ]
            },
            "GENERAL_MATH_SCIENCE": {
                "name": "Toán - Khoa học tự nhiên - Công nghệ - Môi trường",
                "mandatory": true,
                "courses": [
                    "MTH00010",
                    "MTH00011",
                    "MTH00019",
                    "MTH00013",
                    "MTH00014",
                    "MTH00017",
                    "MTH00031",
                    "MTH00034",
                    "MTH00042",
                    "MTH00043",
                    "MTH00055",
                    "MTH00084",
                    "MTH00087",
                    "MTH00088",
                    "ENV00001",
                    "ENV00003",
                    "GEO00002",
                    "CHE00001",
                    "CHE00002",
                    "CHE00081",
                    "CHE00082",
                    "BIO00001",
                    "BIO00002",
                    "BIO00081",
                    "BIO00082",
                    "PHY00001",
                    "PHY00002",
                    "PHY00081"
                ]
            },
            "GENERAL_IT": {
                "name": "Tin học cơ sở",
                "credits": 3,
                "mandatory": true,
                "note": "Không tính vào điểm TB, tính vào TC tích lũy",
                "courses": [
                    "CSC00003"
                ]
            },
            "GENERAL_LANGUAGE": {
                "name": "Ngoại ngữ",
                "credits": 12,
                "mandatory": true,
                "note": "Không tính vào điểm TB và tín chỉ tích lũy",
                "courses": [
                    "ADD00031",
                    "ADD00032",
                    "ADD00033",
                    "ADD00034"
                ]
            },
            "GENERAL_PHYSICAL": {
                "name": "Giáo dục thể chất",
                "credits": 4,
                "mandatory": true,
                "note": "Không tính vào điểm TB, tính vào TC tích lũy",
                "courses": [
                    "BAA00021",
                    "BAA00022"
                ]
            },
            "GENERAL_DEFENSE": {
                "name": "Giáo dục quốc phòng - An ninh",
                "credits": 4,
                "mandatory": true,
                "note": "Không tính vào điểm TB, tính vào số tín chỉ tích lũy",
                "courses": [
                    "BAA00030"
                ]
            }
        }
    },
    "FOUNDATION": {
        "name": "Kiến thức cơ sở ngành",
        "total_credits_required": 32,
        "breakdown": {
            "MANDATORY": {
                "credits": 24,
                "mandatory": true,
                "courses": [
                    "MTH10441",
                    "MTH10403",
                    "MTH10131",
                    "MTH10109",
                    "MTH10412",
                    "MTH10426",
                    "MTH10433"
                ]
            },
            "ELECTIVE": {
                "credits": 8,
                "mandatory": false,
                "courses": [
                    "MTH10312",
                    "MTH10353",
                    "MTH10442",
                    "MTH10201",
                    "MTH10001",
                    "MTH10428",
                    "MTH10449",
                    "MTH10002",
                    "MTH10003",
                    "MTH10004",
                    "MTH10405",
                    "MTH10407"
                ]
            }
        }
    },
    "MAJOR": {
        "name": "Chuyên ngành",
        "total_credits_required": 29,
        "breakdown": {
            "MAJOR_ALGEBRA": {
                "name": "Chuyên ngành Đại số",
                "total_credits_required": 29,
                "breakdown": {
                    "MANDATORY": {
                        "credits": 16,
                        "courses": [
                            "MTH10419",
                            "MTH10420",
                            "MTH10421",
                            "MTH10422"
                        ]
                    },
                    "ELECTIVE": {
                        "credits": 13,
                        "courses": [
                            "MTH10418",
                            "MTH10492",
                            "MTH10596",
                            "MTH10497",
                            "MTH10498",
                            "MTH10501",
                            "MTH10503",
                            "MTH10505",
                            "MTH10507",
                            "MTH10601",
                            "MTH10525",
                            "MTH10603"
                        ]
                    }
                }
            },
            "MAJOR_ANALYSIS": {
                "name": "Chuyên ngành Giải tích",
                "total_credits_required": 29,
                "breakdown": {
                    "MANDATORY": {
                        "credits": 16,
                        "courses": [
                            "MTH10443",
                            "MTH10436",
                            "MTH10413",
                            "MTH10417"
                        ]
                    },
                    "ELECTIVE": {
                        "credits": 13,
                        "courses": [
                            "MTH10414",
                            "MTH10461",
                            "MTH10409",
                            "MTH10480",
                            "MTH10478",
                            "MTH10492",
                            "MTH10451",
                            "MTH10439",
                            "MTH10473",
                            "MTH10607",
                            "MTH10604",
                            "MTH10444"
                        ]
                    }
                }
            },
            "MAJOR_NUMERICAL_ANALYSIS": {
                "name": "Chuyên ngành Giải tích số",
                "total_credits_required": 29,
                "breakdown": {
                    "MANDATORY": {
                        "credits": 16,
                        "courses": [
                            "MTH10438",
                            "MTH10555",
                            "MTH10413",
                            "MTH10556"
                        ]
                    },
                    "ELECTIVE": {
                        "credits": 13,
                        "courses": [
                            "MTH10436",
                            "MTH10439",
                            "MTH10473",
                            "MTH10607",
                            "MTH10443",
                            "MTH10604",
                            "MTH10444",
                            "MTH10532",
                            "MTH10414",
                            "MTH10461",
                            "MTH10409",
                            "MTH10480",
                            "MTH10417",
                            "MTH10478",
                            "MTH10492"
                        ]
                    }
                }
            },
            "MAJOR_PROBABILITY_STATISTICS": {
                "name": "Chuyên ngành Xác suất – Thống kê",
                "total_credits_required": 29,
                "breakdown": {
                    "MANDATORY": {
                        "credits": 16,
                        "courses": [
                            "MTH10423",
                            "MTH10424",
                            "MTH10619",
                            "MTH10485"
                        ]
                    },
                    "ELECTIVE": {
                        "credits": 13,
                        "courses": [
                            "MTH10508",
                            "MTH10509",
                            "MTH10510",
                            "MTH10511",
                            "MTH10512",
                            "MTH10513",
                            "MTH10514",
                            "MTH10515",
                            "MTH10519",
                            "MTH10517",
                            "MTH10518",
                            "MTH10609",
                            "MTH10621",
                            "MTH10557",
                            "MTH10554",
                            "MTH10558",
                            "MTH10559"
                        ]
                    }
                }
            },
            "MAJOR_MECHANICS": {
                "name": "Chuyên ngành Cơ học",
                "breakdown": {
                    "ELECTIVE": {
                        "courses": [
                            "MTH10433",
                            "MTH10427",
                            "MTH10428",
                            "MTH10429",
                            "MTH10434",
                            "MTH10435",
                            "MTH10560",
                            "MTH10561",
                            "MTH10562",
                            "MTH10563"
                        ]
                    }
                }
            },
            "MAJOR_MATH_EDUCATION": {
                "name": "Chuyên ngành Giáo dục toán học",
                "breakdown": {
                    "ELECTIVE": {
                        "courses": [
                            "MTH10104",
                            "MTH10132",
                            "MTH10133",
                            "MTH10001",
                            "MTH10134",
                            "MTH10102",
                            "MTH10002",
                            "MTH10135",
                            "MTH10123",
                            "MTH10136",
                            "MTH10137",
                            "MTH10138",
                            "MTH10139",
                            "MTH10140"
                        ]
                    }
                }
            },
            "MAJOR_QUANTITATIVE_FINANCE": {
                "name": "Chuyên ngành Tài chính định lượng",
                "breakdown": {
                    "ELECTIVE": {
                        "courses": [
                            "MTH10214",
                            "MTH10202",
                            "MTH10203",
                            "MTH10209",
                            "MTH10204",
                            "MTH10215",
                            "MTH10216",
                            "MTH10217",
                            "MTH10219",
                            "MTH10220",
                            "MTH10221",
                            "MTH10558",
                            "MTH10519"
                        ]
                    }
                }
            },
            "MAJOR_OPTIMIZATION": {
                "name": "Chuyên ngành Tối ưu",
                "breakdown": {
                    "ELECTIVE": {
                        "courses": [
                            "MTH10446",
                            "MTH10447",
                            "MTH10615",
                            "MTH10450",
                            "MTH10543",
                            "MTH10553",
                            "MTH10538",
                            "MTH10539",
                            "MTH10540",
                            "MTH10541",
                            "MTH10544",
                            "MTH10545",
                            "MTH10614"
                        ]
                    }
                }
            },
            "MAJOR_DATA_SCIENCE": {
                "name": "Chuyên ngành Khoa học dữ liệu",
                "breakdown": {
                    "ELECTIVE": {
                        "courses": [
                            "MTH10318",
                            "MTH10353",
                            "MTH10605",
                            "MTH10358",
                            "MTH10325",
                            "MTH10608",
                            "MTH10322",
                            "MTH10323",
                            "MTH10332",
                            "MTH10336",
                            "MTH10344",
                            "MTH10354",
                            "MTH10519",
                            "MTH10607",
                            "MTH10623",
                            "MTH10359",
                            "MTH10317",
                            "MTH10314",
                            "MTH10315"
                        ]
                    }
                }
            },
            "MAJOR_MATH_METHODS_CS": {
                "name": "Chuyên ngành Phương pháp toán trong tin học",
                "breakdown": {
                    "ELECTIVE": {
                        "courses": [
                            "MTH10318",
                            "MTH10353",
                            "MTH10325",
                            "MTH10324",
                            "MTH10605",
                            "MTH10322",
                            "MTH10317",
                            "MTH10319",
                            "MTH10358",
                            "MTH10321",
                            "MTH10332",
                            "MTH10336",
                            "MTH10347",
                            "MTH10348",
                            "MTH10623",
                            "MTH10354",
                            "MTH10355",
                            "MTH10323",
                            "MTH10607",
                            "MTH10359",
                            "MTH10314",
                            "MTH10315",
                            "MTH10608"
                        ]
                    }
                }
            },
            "MAJOR_APPLIED_MATH_CS": {
                "name": "Chuyên ngành Toán tin ứng dụng",
                "breakdown": {
                    "ELECTIVE": {
                        "courses": [
                            "MTH10308",
                            "MTH10360",
                            "MTH10311",
                            "MTH10314",
                            "MTH10315",
                            "MTH10313",
                            "MTH10322",
                            "MTH10310",
                            "MTH10309",
                            "MTH10327",
                            "MTH10331",
                            "MTH10333",
                            "MTH10335",
                            "MTH10337",
                            "MTH10341",
                            "MTH10342",
                            "MTH10344",
                            "MTH10345",
                            "MTH10334",
                            "MTH10332",
                            "MTH10336",
                            "MTH10623",
                            "MTH10359",
                            "MTH10318",
                            "MTH10353",
                            "MTH10608"
                        ]
                    }
                }
            },
            "FREE_ELECTIVE": {
                "name": "Học phần không thuộc chuyên ngành",
                "courses": [
                    "MTH10627"
                ]
            },
        }
    },
    "GRADUATION": {
        "name": "Tốt nghiệp",
        "total_credits_required": 10,
        "options": [
            {
                "type": "THESIS",
                "credits": 10,
                "courses": [
                    "MTH10595"
                ]
            },
            {
                "type": "PROJECT",
                "credits": 6,
                "courses": [
                    "MTH10597"
                ]
            },
            {
                "type": "INTERNSHIP",
                "credits": 4,
                "courses": [
                    "MTH10549"
                ]
            }
        ]
    }
}