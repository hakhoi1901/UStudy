export const categories = {
    "GENERAL_EDUCATION": {
        "name": "Giáo dục đại cương",
        "total_credits_required": 48,
        "note": "Không kể học phần GDQP-AN, GDTC, Tin học cơ sở và Ngoại ngữ",
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
                "credits": 12,
                "mandatory": false,
                "note": "BAA00005 và GEO00003 bắt buộc; chọn 1/2 BAA00006-BAA00007; chọn 3 trong 6 học phần kỹ năng còn lại",
                "courses": [
                    "BAA00005",
                    "BAA00006",
                    "BAA00007",
                    "GEO00003",
                    "GEO00004",
                    "GEO00005",
                    "GEO00007",
                    "GEO00008",
                    "GEO00012",
                    "GEO00013"
                ]
            },
            "GENERAL_MATH_SCIENCE": {
                "name": "Toán - Khoa học tự nhiên - Công nghệ - Môi trường",
                "credits": 22,
                "mandatory": false,
                "note": "Các học phần bắt buộc theo bảng; chọn 1 trong BIO00001/BIO00002",
                "courses": [
                    "MTH00002",
                    "MTH00040",
                    "GEO00009",
                    "PHY00001",
                    "CHE00001",
                    "ENV00001",
                    "LEC00001",
                    "BIO00001",
                    "BIO00002"
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
                "note": "Không tính vào điểm trung bình và tín chỉ tích lũy. SV chỉ đăng ký học nếu chưa đạt chuẩn ngoại ngữ đầu ra.",
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
                "credits": 43,
                "courses": [
                    "GEO10001",
                    "GEO10002",
                    "GEO10052",
                    "GEO10004",
                    "GEO10005",
                    "GEO10070",
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
                    "GEO10029"
                ]
            },
            "ELECTIVE": {
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
                    "GEO10065"
                ]
            }
        }
    },
    "MAJOR_GEOLOGY": {
        "name": "Kiến thức chuyên ngành Địa chất học",
        "total_credits_required": 17,
        "note": "Chọn một trong 6 chuyên ngành; mỗi chuyên ngành gồm 1 tín chỉ thực tập doanh nghiệp bắt buộc và 16 tín chỉ tự chọn",
        "specializations": {
            "MINERAL": {
                "name": "Địa chất Khoáng sản",
                "mandatory_courses": [
                    "GEO10114"
                ],
                "elective_credits_required": 16,
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
            },
            "GEMOLOGY": {
                "name": "Ngọc học",
                "mandatory_courses": [
                    "GEO10114"
                ],
                "elective_credits_required": 16,
                "courses": [
                    "GEO10201",
                    "GEO10210",
                    "GEO10203",
                    "GEO10211",
                    "GEO10212",
                    "GEO10213",
                    "GEO10214",
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
            },
            "PETROLEUM": {
                "name": "Địa chất Dầu khí",
                "mandatory_courses": [
                    "GEO10114"
                ],
                "elective_credits_required": 16,
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
            },
            "HYDRO_ENGINEERING": {
                "name": "Địa chất Thủy văn - Địa chất công trình",
                "mandatory_courses": [
                    "GEO10114"
                ],
                "elective_credits_required": 16,
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
            },
            "ENV_GEOLOGY": {
                "name": "Địa chất Môi trường",
                "mandatory_courses": [
                    "GEO10114"
                ],
                "elective_credits_required": 16,
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
            },
            "MARINE": {
                "name": "Địa chất Biển",
                "mandatory_courses": [
                    "GEO10114"
                ],
                "elective_credits_required": 16,
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
    },
    "GRADUATION": {
        "name": "Kiến thức tốt nghiệp",
        "total_credits_required": 10,
        "options": [
            {
                "type": "THESIS",
                "credits": 10,
                "courses": [
                    "GEO10195",
                    "GEO10295",
                    "GEO10395",
                    "GEO10495",
                    "GEO10595",
                    "GEO10695"
                ]
            },
            {
                "type": "PROJECT_AND_ELECTIVE",
                "credits": 10,
                "note": "Đồ án tốt nghiệp 6 tín chỉ + 4 tín chỉ tự chọn của chuyên ngành tương ứng",
                "courses": [
                    "GEO10190",
                    "GEO10290",
                    "GEO10390",
                    "GEO10490",
                    "GEO10590",
                    "GEO10690"
                ]
            }
        ]
    }
}
