export const categories = {
    "GENERAL_EDUCATION": {
        "name": "Giáo dục đại cương",
        "total_credits_required": 60,
        "note": "Không kể Giáo dục quốc phòng - An ninh, Giáo dục thể chất, Tin học cơ sở và Ngoại ngữ",
        "breakdown": {
            "GENERAL_POLITICS": {
                "name": "Lý luận chính trị – Pháp luật",
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
                "name": "Khoa học xã hội – Kinh tế – Kỹ năng",
                "mandatory": false,
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
                    "PHY00081",
                    "Vi tích phân 1B",
                    "Thực hành vi tích phân 1B",
                    "Nhập môn lập trình",
                    "Thực hành Đại số tuyến tính",
                    "Vi tích phân 2B",
                    "Thực hành vi tích phân 2B",
                    "Lập trình nâng cao",
                    "Đại số tuyến tính"
                ]
            },
            "GENERAL_IT": {
                "name": "Tin học",
                "mandatory": true,
                "note": "Không tính vào điểm TB, tính vào TC tích lũy",
                "courses": [
                    "CSC00003"
                ]
            },
            "GENERAL_LANGUAGE": {
                "name": "Ngoại ngữ",
                "mandatory": true,
                "note": "Không tính vào điểm TB và TC tích lũy",
                "courses": [
                    "ADD00031",
                    "ADD00032",
                    "ADD00033",
                    "ADD00034"
                ]
            },
            "GENERAL_PHYSICAL": {
                "name": "Giáo dục thể chất",
                "mandatory": true,
                "note": "Không tính vào điểm TB, tính vào TC tích lũy",
                "courses": [
                    "BAA00021",
                    "BAA00022"
                ]
            },
            "GENERAL_DEFENSE": {
                "name": "Giáo dục quốc phòng - An ninh",
                "mandatory": true,
                "note": "Không tính vào điểm TB, tính vào TC tích lũy",
                "courses": [
                    "BAA00030"
                ]
            }
        }
    },
    "FOUNDATION": {
        "name": "Cơ Sở Ngành",
        "mandatory": true,
        "courses": [
            "Khảo sát Toán, Tin học và Chuyên ngành",
            "MTH10441",
            "MTH10403",
            "MTH10131",
            "MTH10109",
            "MTH10412",
            "MTH10426",
            "MTH10433",
            "MTH10001",
            "MTH10002",
            "MTH10003",
            "MTH10201",
            "MTH10312",
            "MTH10353",
            "MTH10428",
            "MTH10442",
            "MTH10449",
            "MTH10405",
            "MTH10407",
            "MTH10004",
            "Xác suất thống kê",
            "Thực hành Toán rời rạc",
            "Nhập môn Cơ sở dữ liệu",
            "MTH10332",
            "Lý thuyết xác suất cơ sở",
            "MTH10311"
        ]
    },
    "MAJOR_ALGEBRA": {
        "name": "Chuyên ngành Đại số",
        "breakdown": {
            "MANDATORY_AND_ELECTIVE": {
                "courses": [
                    "MTH10419",
                    "MTH10420",
                    "MTH10421",
                    "MTH10422",
                    "MTH10501",
                    "MTH10418",
                    "MTH10492",
                    "MTH10596",
                    "MTH10497",
                    "MTH10498",
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
        "breakdown": {
            "MANDATORY_AND_ELECTIVE": {
                "courses": [
                    "MTH10443",
                    "MTH10436",
                    "MTH10413",
                    "MTH10417",
                    "MTH10451",
                    "MTH10414",
                    "MTH10461",
                    "MTH10409",
                    "MTH10480",
                    "MTH10478",
                    "MTH10439",
                    "MTH10473",
                    "MTH10444"
                ]
            }
        }
    },
    "MAJOR_NUMERICAL_ANALYSIS": {
        "name": "Chuyên ngành Giải tích số",
        "breakdown": {
            "MANDATORY_AND_ELECTIVE": {
                "courses": [
                    "MTH10438",
                    "MTH10555",
                    "MTH10556",
                    "MTH10532",
                    "MTH10607",
                    "MTH10604"
                ]
            }
        }
    },
    "MAJOR_PROBABILITY_STATISTICS": {
        "name": "Chuyên ngành Xác suất – Thống kê",
        "breakdown": {
            "MANDATORY_AND_ELECTIVE": {
                "courses": [
                    "MTH10423",
                    "MTH10424",
                    "MTH10619",
                    "MTH10485",
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
                    "MTH10558"
                ]
            }
        }
    },
    "MAJOR_MECHANICS": {
        "name": "Chuyên ngành Cơ học",
        "breakdown": {
            "MANDATORY_AND_ELECTIVE": {
                "courses": [
                    "Nhập môn Cơ học",
                    "MTH10427",
                    "MTH10434",
                    "MTH10435",
                    "MTH10560",
                    "MTH10561",
                    "MTH10562",
                    "MTH10563",
                    "MTH10429",
                    "Lập trình ký hiệu cho bài toán cơ học",
                    "Cơ học phá hủy",
                    "Phương pháp sai phân hữu hạn",
                    "Seminar Cơ học"
                ]
            }
        }
    },
    "MAJOR_DIDACTICS": {
        "name": "Chuyên ngành Giáo dục toán học (Lý luận và phương pháp giảng dạy môn Toán)",
        "breakdown": {
            "MANDATORY_AND_ELECTIVE": {
                "courses": [
                    "MTH10104",
                    "MTH10132",
                    "MTH10133",
                    "MTH10134",
                    "MTH10102",
                    "MTH10135",
                    "MTH10123",
                    "MTH10136",
                    "MTH10137",
                    "MTH10138",
                    "MTH10139",
                    "MTH10140",
                    "Đại số sơ cấp",
                    "Toán bằng Tiếng Anh 1",
                    "Toán bằng Tiếng Anh 2",
                    "Số học sơ cấp và logic toán",
                    "Hình học sơ cấp",
                    "Thực hành giảng dạy",
                    "Phương pháp giảng dạy môn Toán 1",
                    "Phương pháp giảng dạy môn Toán 2",
                    "Seminar Sư phạm"
                ]
            }
        }
    },
    "MAJOR_QUANTITATIVE_FINANCE": {
        "name": "Chuyên ngành Tài chính định lượng (Toán tài chính)",
        "breakdown": {
            "MANDATORY_AND_ELECTIVE": {
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
                    "Toán tài chính sơ cấp",
                    "Toán bảo hiểm",
                    "Seminar Toán tài chính"
                ]
            }
        }
    },
    "MAJOR_OPTIMIZATION": {
        "name": "Chuyên ngành Tối ưu",
        "breakdown": {
            "MANDATORY_AND_ELECTIVE": {
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
                    "MTH10614",
                    "Seminar Tối ưu",
                    "Tối ưu không trơn: Lý thuyết và phương pháp số"
                ]
            }
        }
    },
    "MAJOR_DATA_SCIENCE": {
        "name": "Chuyên ngành Khoa học dữ liệu",
        "breakdown": {
            "MANDATORY_AND_ELECTIVE": {
                "courses": [
                    "MTH10318",
                    "MTH10605",
                    "MTH10358",
                    "MTH10325",
                    "MTH10608",
                    "MTH10322",
                    "MTH10323",
                    "MTH10336",
                    "MTH10344",
                    "MTH10354",
                    "MTH10623",
                    "MTH10359",
                    "MTH10317",
                    "MTH10314",
                    "MTH10315",
                    "Lập trình song song",
                    "Các mô hình toán tài chính",
                    "Học sâu cho khoa học dữ liệu",
                    "Tài chính định lượng",
                    "Kỹ nghệ dữ liệu lớn",
                    "Phân tích mạng xã hội",
                    "Seminar Khoa học dữ liệu"
                ]
            }
        }
    },
    "MAJOR_MATH_METHODS_CS": {
        "name": "Chuyên ngành Phương pháp toán trong tin học",
        "breakdown": {
            "MANDATORY_AND_ELECTIVE": {
                "courses": [
                    "MTH10324",
                    "MTH10319",
                    "MTH10321",
                    "MTH10347",
                    "MTH10348",
                    "MTH10355",
                    "MTH10317",
                    "Xử lý tín hiệu số",
                    "Nhập môn Mật mã",
                    "Trí tuệ nhân tạo nâng cao",
                    "Seminar Phương pháp toán trong Tin học"
                ]
            }
        }
    },
    "MAJOR_APPLIED_MATH_CS": {
        "name": "Chuyên ngành Toán tin ứng dụng",
        "breakdown": {
            "MANDATORY_AND_ELECTIVE": {
                "courses": [
                    "MTH10308",
                    "MTH10360",
                    "MTH10313",
                    "MTH10310",
                    "MTH10309",
                    "MTH10327",
                    "MTH10331",
                    "MTH10333",
                    "MTH10335",
                    "MTH10337",
                    "MTH10341",
                    "MTH10342",
                    "MTH10345",
                    "MTH10334",
                    "Phân tích và nhận dạng mẫu",
                    "Seminar Toán tin ứng dụng",
                    "Quản lý dự án phần mềm"
                ]
            }
        }
    },
    "OTHER_ELECTIVES": {
        "name": "Học phần không thuộc chuyên ngành",
        "breakdown": {
            "ELECTIVES": {
                "courses": [
                    "MTH10627"
                ]
            }
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
                    "Đồ án tốt nghiệp"
                ]
            },
            {
                "type": "INTERNSHIP",
                "credits": 4,
                "courses": [
                    "Thực tập sư phạm",
                    "MTH10549"
                ]
            },
            {
                "type": "SEMINAR",
                "credits": 4,
                "courses": [
                    "Seminar chuyên ngành"
                ]
            },
            {
                "type": "ELECTIVE",
                "credits": 10,
                "courses": [
                    "Tích lũy các tín chỉ tự chọn"
                ]
            }
        ]
    }
}