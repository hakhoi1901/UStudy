export const categories = {
    "GENERAL_EDUCATION": {
        "name": "Giáo dục đại cương",
        "total_credits_required": 53,
        "note": "Không kể môn GDQP, GDTC, Tin học cơ sở và Ngoại ngữ",
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
                "credits": 37,
                "mandatory": true,
                "breakdown": {
                    "MANDATORY": {
                        "name": "Học phần bắt buộc",
                        "credits_required": 34,
                        "courses": [
                            "ENV00010",
                            "MTH00001",
                            "BIO00001",
                            "PHY00001",
                            "CHE00001",
                            "ENV00002",
                            "MTH00002",
                            "PHY00002",
                            "GEO00002",
                            "CHE00003",
                            "CHE00082",
                            "CHE00007",
                            "CHE00083"
                        ]
                    },
                    "ELECTIVE": {
                        "name": "Học phần tự chọn",
                        "credits_required": 3,
                        "note": "Chọn 1 trong 2 học phần",
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
        "total_credits_required": 51,
        "breakdown": {
            "MANDATORY": {
                "name": "Học phần bắt buộc",
                "credits": 47,
                "courses": [
                    "ENV10001", "ENV10002", "ENV10003", "ENV10004", "ENV10005", "ENV10006", "ENV10007",
                    "ENV10008", "ENV10030", "ENV10010", "ENV10011", "ENV10012", "ENV10013", "ENV10014",
                    "ENV10015", "ENV10016", "ENV10017", "ENV10018", "ENV10019", "ENV10020", "ENV10021"
                ]
            },
            "ELECTIVE": {
                "name": "Học phần tự chọn",
                "credits": 4,
                "note": "Sinh viên chọn học để tích lũy ít nhất 4 tín chỉ",
                "courses": [
                    "ENV10022", "ENV10023", "ENV10024", "ENV10025", "ENV10027", "ENV10026"
                ]
            }
        }
    },
    "MAJOR": {
        "name": "Kiến thức chuyên ngành",
        "total_credits_required": 19,
        "breakdown": {
            "MAJOR_ENV_SCIENCE": {
                "name": "Chuyên ngành Khoa học môi trường",
                "total_credits_required": 19,
                "breakdown": {
                    "MANDATORY": {
                        "credits": 12,
                        "courses": [
                            "ENV10101", "ENV10102", "ENV10103", "ENV10104", "ENV10105"
                        ]
                    },
                    "ELECTIVE": {
                        "credits": 7,
                        "note": "Sinh viên chọn học để tích lũy ít nhất 7 tín chỉ",
                        "courses": [
                            "ENV10106", "ENV10116", "ENV10117", "ENV10118", "ENV10114", "ENV10122", "ENV10124",
                            "ENV10125", "ENV10126", "ENV10128", "ENV10147", "ENV10161", "ENV10160", "ENV10162",
                            "ENV10157", "ENV10172", "ENV10158", "ENV10159", "ENV10174", "ENV10175", "ENV10176"
                        ]
                    }
                }
            },
            "MAJOR_ENV_MANAGEMENT": {
                "name": "Chuyên ngành Quản lý Môi trường",
                "total_credits_required": 20,
                "breakdown": {
                    "MANDATORY": {
                        "credits": 13,
                        "courses": [
                            "ENV10128", "ENV10129", "ENV10154", "ENV10131", "ENV10106"
                        ]
                    },
                    "ELECTIVE": {
                        "credits": 7,
                        "note": "Sinh viên chọn học để tích lũy được 7TC",
                        "courses": [
                            "ENV10138", "ENV10139", "ENV10140", "ENV10141", "ENV10143", "ENV10144", "ENV10145",
                            "ENV10146", "ENV10122", "ENV10147", "ENV10114", "ENV10117", "ENV10132", "ENV10172",
                            "ENV10158", "ENV10159", "ENV10170", "ENV10171", "ENV10177", "ENV10178"
                        ]
                    }
                }
            },
            "MAJOR_NATURAL_RESOURCES": {
                "name": "Chuyên ngành Tài nguyên thiên nhiên và môi trường",
                "total_credits_required": 19,
                "breakdown": {
                    "MANDATORY": {
                        "credits": 12,
                        "courses": [
                            "ENV10106", "ENV10107", "ENV10103", "ENV10109", "ENV10110"
                        ]
                    },
                    "ELECTIVE": {
                        "credits": 7,
                        "note": "Sinh viên chọn học để tích lũy ít nhất 7TC",
                        "courses": [
                            "ENV10116", "ENV10117", "ENV10118", "ENV10147", "ENV10114", "ENV10122", "ENV10160",
                            "ENV10124", "ENV10125", "ENV10126", "ENV10128", "ENV10161", "ENV10162", "ENV10157",
                            "ENV10172", "ENV10158", "ENV10159", "ENV10174", "ENV10175", "ENV10176"
                        ]
                    }
                }
            },
            "MAJOR_MARINE_ENV": {
                "name": "Chuyên ngành Môi trường & Tài nguyên biển",
                "total_credits_required": 18,
                "breakdown": {
                    "MANDATORY": {
                        "credits": 11,
                        "courses": [
                            "ENV10111", "ENV10112", "ENV10113", "ENV10117", "ENV10115"
                        ]
                    },
                    "ELECTIVE": {
                        "credits": 7,
                        "note": "Sinh viên chọn học để tích lũy ít nhất 7 TC",
                        "courses": [
                            "ENV10106", "ENV10116", "ENV10114", "ENV10118", "ENV10147", "ENV10122", "ENV10160",
                            "ENV10124", "ENV10125", "ENV10126", "ENV10128", "ENV10161", "ENV10162", "ENV10157",
                            "ENV10172", "ENV10158", "ENV10159", "ENV10174", "ENV10175", "ENV10176"
                        ]
                    }
                }
            },
            "MAJOR_ENV_INFORMATICS": {
                "name": "Chuyên ngành Tin học môi trường",
                "total_credits_required": 21,
                "breakdown": {
                    "MANDATORY": {
                        "credits": 13,
                        "courses": [
                            "ENV10148", "ENV10173", "ENV10114", "ENV10150", "ENV10151"
                        ]
                    },
                    "ELECTIVE": {
                        "credits": 8,
                        "note": "Sinh viên chọn học để tích lũy ít nhất 8 TC",
                        "courses": [
                            "ENV10116", "ENV10152", "ENV10103", "ENV10153", "ENV10156", "ENV10122", "ENV10132",
                            "ENV10147", "ENV10143", "ENV10172", "ENV10158", "ENV10159", "ENV10170", "ENV10171",
                            "ENV10177", "ENV10178"
                        ]
                    }
                }
            },
            "MAJOR_RS_GIS": {
                "name": "Chuyên ngành Viễn thám và GIS ứng dụng trong quản lý tài nguyên thiên nhiên và môi trường",
                "total_credits_required": 19,
                "breakdown": {
                    "MANDATORY": {
                        "credits": 12,
                        "courses": [
                            "ENV10132", "ENV10133", "ENV10134", "ENV10135", "ENV10136", "ENV10137"
                        ]
                    },
                    "ELECTIVE": {
                        "credits": 7,
                        "note": "Sinh viên chọn học để tích lũy ít nhất 7 TC",
                        "courses": [
                            "ENV10138", "ENV10139", "ENV10140", "ENV10141", "ENV10143", "ENV10144", "ENV10145",
                            "ENV10146", "ENV10118", "ENV10122", "ENV10147", "ENV10114", "ENV10117", "ENV10156",
                            "ENV10172", "ENV10158", "ENV10159", "ENV10170", "ENV10171", "ENV10177", "ENV10178"
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
                "name": "Khóa luận tốt nghiệp",
                "credits": 10,
                "courses": [
                    "ENV10195"
                ]
            },
            {
                "type": "SEMINAR",
                "name": "Seminar tốt nghiệp",
                "credits": 10,
                "note": "Seminar tốt nghiệp (06 tín chỉ) và học phần tự chọn (04 tín chỉ) thuộc khối kiến thức chuyên ngành",
                "courses": [
                    "ENV10190"
                ]
            },
            {
                "type": "ELECTIVES",
                "name": "Học phần tự chọn tự do",
                "credits": 10,
                "note": "Sinh viên tích lũy 10TC các học phần thuộc khối kiến thức chuyên ngành",
                "courses": []
            }
        ]
    }
};