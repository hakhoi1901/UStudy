export const categories = {
    "GENERAL_EDUCATION": {
        "name": "Giáo dục đại cương",
        "total_credits_required": 47,
        "note": "Không kể môn GDQP-AN, GDTC, Tin học cơ sở và ngoại ngữ",
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
                "name": "Khoa học xã hội – Kinh tế - Kỹ năng",
                "credits": 12,
                "breakdown": {
                    "MANDATORY": {
                        "name": "Bắt buộc",
                        "credits_required": 4,
                        "courses": [
                            "BAA00005",
                            "GEO00003"
                        ]
                    },
                    "ELECTIVE_1": {
                        "name": "Tự chọn 1",
                        "credits_required": 2,
                        "note": "Chọn 1 trong 2 học phần",
                        "courses": [
                            "BAA00006",
                            "BAA00007"
                        ]
                    },
                    "ELECTIVE_2": {
                        "name": "Tự chọn 2",
                        "credits_required": 6,
                        "note": "Chọn 3 trong 4 học phần",
                        "courses": [
                            "GEO00004",
                            "GEO00005",
                            "GEO00007",
                            "GEO00008"
                        ]
                    }
                }
            },
            "GENERAL_MATH_SCIENCE": {
                "name": "Toán - Khoa học tự nhiên - Công nghệ - Môi trường",
                "credits": 21,
                "breakdown": {
                    "MANDATORY": {
                        "name": "Bắt buộc",
                        "credits_required": 18,
                        "courses": [
                            "MTH00002",
                            "MTH00040",
                            "GEO00009",
                            "PHY00001",
                            "CHE00001",
                            "ENV00001",
                            "GEO00011"
                        ]
                    },
                    "ELECTIVE": {
                        "name": "Tự chọn",
                        "credits_required": 3,
                        "note": "Chọn 1 trong 2 học phần",
                        "courses": [
                            "BIO00001",
                            "BIO00002"
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
                "note": "Không tính vào điểm trung bình và tín chỉ tích lũy",
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
        "total_credits_required": 52,
        "breakdown": {
            "MANDATORY": {
                "name": "Học phần bắt buộc",
                "credits_required": 44,
                "courses": [
                    "GEO10001",
                    "GEO10002",
                    "GEO10052",
                    "GEO10004",
                    "GEO10005",
                    "GEO10015",
                    "GEO10028",
                    "GEO10009",
                    "GEO10055",
                    "GEO10056",
                    "GEO10057",
                    "GEO10013",
                    "GEO10059",
                    "GEO10060",
                    "GEO10062",
                    "GEO10063",
                    "GEO10029",
                    "GEO10024",
                    "GEO10025"
                ]
            },
            "ELECTIVE": {
                "name": "Học phần tự chọn",
                "credits_required": 8,
                "courses": [
                    "GEO10030",
                    "GEO10031",
                    "GEO10032",
                    "GEO20201",
                    "GEO10058",
                    "GEO10066",
                    "GEO10061",
                    "GEO10033",
                    "GEO10008",
                    "GEO10034",
                    "GEO10065",
                    "GEO10069"
                ]
            }
        }
    },
    "MAJOR": {
        "name": "Kiến thức chuyên ngành",
        "total_credits_required": 17,
        "breakdown": {
            "MAJOR_MINERAL_GEOLOGY": {
                "name": "Chuyên ngành Địa chất Khoáng sản",
                "total_credits_required": 17,
                "breakdown": {
                    "MANDATORY": {
                        "credits": 1,
                        "courses": [
                            "GEO10114"
                        ]
                    },
                    "ELECTIVE": {
                        "credits": 16,
                        "courses": [
                            "GEO10111",
                            "GEO10102",
                            "GEO10112",
                            "GEO10104",
                            "GEO10113",
                            "GEO10106",
                            "GEO10108",
                            "GEO10115",
                            "GEO10116",
                            "GEO10117",
                            "GEO10118",
                            "GEO10119",
                            "GEO10120",
                            "GEO10121",
                            "GEO10122"
                        ]
                    }
                }
            },
            "MAJOR_GEMOLOGY": {
                "name": "Chuyên ngành Ngọc học",
                "total_credits_required": 17,
                "breakdown": {
                    "MANDATORY": {
                        "credits": 1,
                        "courses": [
                            "GEO10114"
                        ]
                    },
                    "ELECTIVE": {
                        "credits": 16,
                        "courses": [
                            "GEO10201",
                            "GEO10210",
                            "GEO10203",
                            "GEO10211",
                            "GEO10212",
                            "GEO10213",
                            "GEO10110",
                            "GEO10206",
                            "GEO10215",
                            "GEO10205",
                            "GEO10117",
                            "GEO10118",
                            "GEO10119",
                            "GEO10120",
                            "GEO10121",
                            "GEO10122"
                        ]
                    }
                }
            },
            "MAJOR_PETROLEUM_GEOLOGY": {
                "name": "Chuyên ngành Địa chất dầu khí",
                "total_credits_required": 17,
                "breakdown": {
                    "MANDATORY": {
                        "credits": 1,
                        "courses": [
                            "GEO10114"
                        ]
                    },
                    "ELECTIVE": {
                        "credits": 16,
                        "courses": [
                            "GEO10301",
                            "GEO10311",
                            "GEO10303",
                            "GEO10304",
                            "GEO10305",
                            "GEO10308",
                            "GEO10307",
                            "GEO10309",
                            "GEO10312",
                            "GEO10313",
                            "GEO10314",
                            "GEO10117",
                            "GEO10118",
                            "GEO10119",
                            "GEO10120",
                            "GEO10121",
                            "GEO10122"
                        ]
                    }
                }
            },
            "MAJOR_HYDROGEOLOGY_ENGINEERING": {
                "name": "Chuyên ngành Địa chất thủy văn – Địa chất công trình",
                "total_credits_required": 17,
                "breakdown": {
                    "MANDATORY": {
                        "credits": 1,
                        "courses": [
                            "GEO10114"
                        ]
                    },
                    "ELECTIVE": {
                        "credits": 16,
                        "courses": [
                            "GEO10411",
                            "GEO10404",
                            "GEO10409",
                            "GEO10412",
                            "GEO10405",
                            "GEO10413",
                            "GEO10414",
                            "GEO10403",
                            "GEO10415",
                            "GEO10416",
                            "GEO10117",
                            "GEO10118",
                            "GEO10119",
                            "GEO10120",
                            "GEO10121",
                            "GEO10122"
                        ]
                    }
                }
            },
            "MAJOR_ENVIRONMENTAL_GEOLOGY": {
                "name": "Chuyên ngành Địa chất môi trường",
                "total_credits_required": 17,
                "breakdown": {
                    "MANDATORY": {
                        "credits": 1,
                        "courses": [
                            "GEO10114"
                        ]
                    },
                    "ELECTIVE": {
                        "credits": 16,
                        "courses": [
                            "GEO10503",
                            "GEO10504",
                            "GEO10509",
                            "GEO10414",
                            "GEO10510",
                            "GEO10501",
                            "GEO10505",
                            "GEO10409",
                            "GEO10502",
                            "GEO10511",
                            "GEO10117",
                            "GEO10118",
                            "GEO10119",
                            "GEO10120",
                            "GEO10121",
                            "GEO10122"
                        ]
                    }
                }
            },
            "MAJOR_MARINE_GEOLOGY": {
                "name": "Chuyên ngành Địa chất Biển",
                "total_credits_required": 17,
                "breakdown": {
                    "MANDATORY": {
                        "credits": 1,
                        "courses": [
                            "GEO10114"
                        ]
                    },
                    "ELECTIVE": {
                        "credits": 16,
                        "courses": [
                            "GEO10613",
                            "GEO10602",
                            "GEO10614",
                            "GEO10606",
                            "GEO10607",
                            "GEO10608",
                            "GEO10609",
                            "GEO10604",
                            "GEO10611",
                            "GEO10612",
                            "GEO10117",
                            "GEO10118",
                            "GEO10119",
                            "GEO10120",
                            "GEO10121",
                            "GEO10122"
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
            "GRADUATION_MINERAL_GEOLOGY": {
                "name": "Tốt nghiệp - Chuyên ngành Địa chất Khoáng sản",
                "options": [
                    {
                        "type": "THESIS",
                        "credits": 10,
                        "note": "Phương án 1: Sinh viên làm Khóa luận tốt nghiệp",
                        "courses": [
                            "GEO10195"
                        ]
                    },
                    {
                        "type": "PROJECT_AND_ELECTIVES",
                        "credits": 10,
                        "note": "Phương án 2: Sinh viên làm Đồ án tốt nghiệp (6 tín chỉ) và chọn học 04 tín chỉ học phần tự chọn",
                        "courses": [
                            "GEO10190"
                        ]
                    }
                ]
            },
            "GRADUATION_GEMOLOGY": {
                "name": "Tốt nghiệp - Chuyên ngành Ngọc học",
                "options": [
                    {
                        "type": "THESIS",
                        "credits": 10,
                        "courses": [
                            "GEO10295"
                        ]
                    },
                    {
                        "type": "PROJECT_AND_ELECTIVES",
                        "credits": 10,
                        "courses": [
                            "GEO10290"
                        ]
                    }
                ]
            },
            "GRADUATION_PETROLEUM_GEOLOGY": {
                "name": "Tốt nghiệp - Chuyên ngành Địa chất Dầu khí",
                "options": [
                    {
                        "type": "THESIS",
                        "credits": 10,
                        "courses": [
                            "GEO10395"
                        ]
                    },
                    {
                        "type": "PROJECT_AND_ELECTIVES",
                        "credits": 10,
                        "courses": [
                            "GEO10390"
                        ]
                    }
                ]
            },
            "GRADUATION_HYDROGEOLOGY_ENGINEERING": {
                "name": "Tốt nghiệp - Chuyên ngành Địa chất thủy văn – Địa chất công trình",
                "options": [
                    {
                        "type": "THESIS",
                        "credits": 10,
                        "courses": [
                            "GEO10495"
                        ]
                    },
                    {
                        "type": "PROJECT_AND_ELECTIVES",
                        "credits": 10,
                        "courses": [
                            "GEO10490"
                        ]
                    }
                ]
            },
            "GRADUATION_ENVIRONMENTAL_GEOLOGY": {
                "name": "Tốt nghiệp - Chuyên ngành Địa chất Môi trường",
                "options": [
                    {
                        "type": "THESIS",
                        "credits": 10,
                        "courses": [
                            "GEO10595"
                        ]
                    },
                    {
                        "type": "PROJECT_AND_ELECTIVES",
                        "credits": 10,
                        "courses": [
                            "GEO10590"
                        ]
                    }
                ]
            },
            "GRADUATION_MARINE_GEOLOGY": {
                "name": "Tốt nghiệp - Chuyên ngành Địa chất Biển",
                "options": [
                    {
                        "type": "THESIS",
                        "credits": 10,
                        "courses": [
                            "GEO10695"
                        ]
                    },
                    {
                        "type": "PROJECT_AND_ELECTIVES",
                        "credits": 10,
                        "courses": [
                            "GEO10690"
                        ]
                    }
                ]
            }
        }
    }
};