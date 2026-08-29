export const categories = {
    "GENERAL_EDUCATION": {
        "name": "Giáo dục đại cương",
        "total_credits_required": 53,
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
                "mandatory": false,
                "note": "Chọn 1 trong MTH00040 và ENV00004; các học phần còn lại theo bảng",
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
                    "CHE00083",
                    "MTH00040",
                    "ENV00004"
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
                "credits": 47,
                "courses": [
                    "ENV10001",
                    "ENV10002",
                    "ENV10003",
                    "ENV10004",
                    "ENV10005",
                    "ENV10006",
                    "ENV10007",
                    "ENV10008",
                    "ENV10030",
                    "ENV10010",
                    "ENV10011",
                    "ENV10012",
                    "ENV10013",
                    "ENV10014",
                    "ENV10015",
                    "ENV10016",
                    "ENV10017",
                    "ENV10018",
                    "ENV10019",
                    "ENV10020",
                    "ENV10021"
                ]
            },
            "ELECTIVE": {
                "credits_required": 4,
                "courses": [
                    "ENV10022",
                    "ENV10023",
                    "ENV10024",
                    "ENV10025",
                    "ENV10027",
                    "ENV10026"
                ]
            }
        }
    },
    "MAJOR_ENVIRONMENTAL_SCIENCE": {
        "name": "Kiến thức chuyên ngành Khoa học môi trường",
        "specializations": {
            "ENVIRONMENTAL_SCIENCE": {
                "name": "Khoa học môi trường",
                "mandatory_credits": 13,
                "mandatory_courses": [
                    "ENV10101",
                    "ENV10102",
                    "ENV10103",
                    "ENV10104",
                    "ENV10179"
                ],
                "elective_credits_required": 7,
                "elective_courses": [
                    "ENV10106",
                    "ENV10116",
                    "ENV10117",
                    "ENV10118",
                    "ENV10114",
                    "ENV10122",
                    "ENV10124",
                    "ENV10125",
                    "ENV10126",
                    "ENV10128",
                    "ENV10147",
                    "ENV10161",
                    "ENV10160",
                    "ENV10162",
                    "ENV10157",
                    "ENV10172",
                    "ENV10158",
                    "ENV10159",
                    "ENV10174",
                    "ENV10175",
                    "ENV10176",
                    "ENV10185"
                ]
            },
            "ENVIRONMENTAL_MANAGEMENT": {
                "name": "Quản lý môi trường",
                "mandatory_credits": 14,
                "mandatory_courses": [
                    "ENV10128",
                    "ENV10129",
                    "ENV10154",
                    "ENV10182",
                    "ENV10106"
                ],
                "elective_credits_required": 7,
                "elective_courses": [
                    "ENV10138",
                    "ENV10139",
                    "ENV10140",
                    "ENV10141",
                    "ENV10143",
                    "ENV10144",
                    "ENV10145",
                    "ENV10146",
                    "ENV10122",
                    "ENV10147",
                    "ENV10114",
                    "ENV10117",
                    "ENV10132",
                    "ENV10172",
                    "ENV10158",
                    "ENV10159",
                    "ENV10170",
                    "ENV10171",
                    "ENV10177",
                    "ENV10178",
                    "ENV10185"
                ]
            },
            "NATURAL_RESOURCES": {
                "name": "Tài nguyên thiên nhiên và môi trường",
                "mandatory_credits": 13,
                "mandatory_courses": [
                    "ENV10106",
                    "ENV10107",
                    "ENV10103",
                    "ENV10109",
                    "ENV10180"
                ],
                "elective_credits_required": 7,
                "elective_courses": [
                    "ENV10116",
                    "ENV10117",
                    "ENV10118",
                    "ENV10147",
                    "ENV10114",
                    "ENV10122",
                    "ENV10160",
                    "ENV10124",
                    "ENV10125",
                    "ENV10126",
                    "ENV10128",
                    "ENV10161",
                    "ENV10162",
                    "ENV10157",
                    "ENV10172",
                    "ENV10158",
                    "ENV10159",
                    "ENV10174",
                    "ENV10175",
                    "ENV10176",
                    "ENV10185"
                ]
            },
            "MARINE_ENVIRONMENT": {
                "name": "Môi trường & Tài nguyên biển",
                "mandatory_credits": 12,
                "mandatory_courses": [
                    "ENV10111",
                    "ENV10112",
                    "ENV10113",
                    "ENV10117",
                    "ENV10181"
                ],
                "elective_credits_required": 7,
                "elective_courses": [
                    "ENV10106",
                    "ENV10116",
                    "ENV10114",
                    "ENV10118",
                    "ENV10147",
                    "ENV10122",
                    "ENV10160",
                    "ENV10124",
                    "ENV10125",
                    "ENV10126",
                    "ENV10128",
                    "ENV10161",
                    "ENV10162",
                    "ENV10157",
                    "ENV10172",
                    "ENV10158",
                    "ENV10159",
                    "ENV10174",
                    "ENV10175",
                    "ENV10176",
                    "ENV10185"
                ]
            },
            "ENVIRONMENTAL_INFORMATICS": {
                "name": "Tin học môi trường",
                "mandatory_credits": 14,
                "mandatory_courses": [
                    "ENV10148",
                    "ENV10173",
                    "ENV10114",
                    "ENV10150",
                    "ENV10183"
                ],
                "elective_credits_required": 8,
                "elective_courses": [
                    "ENV10116",
                    "ENV10152",
                    "ENV10103",
                    "ENV10153",
                    "ENV10156",
                    "ENV10122",
                    "ENV10132",
                    "ENV10147",
                    "ENV10143",
                    "ENV10172",
                    "ENV10158",
                    "ENV10159",
                    "ENV10170",
                    "ENV10171",
                    "ENV10177",
                    "ENV10178",
                    "ENV10185"
                ]
            },
            "REMOTE_SENSING_GIS": {
                "name": "Viễn thám và GIS ứng dụng trong quản lý tài nguyên thiên nhiên và môi trường",
                "mandatory_credits": 13,
                "mandatory_courses": [
                    "ENV10132",
                    "ENV10133",
                    "ENV10134",
                    "ENV10135",
                    "ENV10136",
                    "ENV10184"
                ],
                "elective_credits_required": 7,
                "elective_courses": [
                    "ENV10138",
                    "ENV10139",
                    "ENV10140",
                    "ENV10141",
                    "ENV10143",
                    "ENV10144",
                    "ENV10145",
                    "ENV10146",
                    "ENV10118",
                    "ENV10122",
                    "ENV10147",
                    "ENV10114",
                    "ENV10117",
                    "ENV10156",
                    "ENV10172",
                    "ENV10158",
                    "ENV10159",
                    "ENV10170",
                    "ENV10171",
                    "ENV10177",
                    "ENV10178",
                    "ENV10185"
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
                    "ENV10195"
                ]
            },
            {
                "type": "SEMINAR_AND_ELECTIVE",
                "credits": 10,
                "note": "Seminar tốt nghiệp 6 tín chỉ + 4 tín chỉ tự chọn chuyên ngành",
                "courses": [
                    "ENV10190"
                ]
            },
            {
                "type": "FREE_ELECTIVE",
                "credits": 10,
                "note": "Tích lũy 10 tín chỉ từ các học phần tự chọn chuyên ngành",
                "courses": [
                    "ENV10103",
                    "ENV10106",
                    "ENV10114",
                    "ENV10116",
                    "ENV10117",
                    "ENV10118",
                    "ENV10122",
                    "ENV10124",
                    "ENV10125",
                    "ENV10126",
                    "ENV10128",
                    "ENV10132",
                    "ENV10138",
                    "ENV10139",
                    "ENV10140",
                    "ENV10141",
                    "ENV10143",
                    "ENV10144",
                    "ENV10145",
                    "ENV10146",
                    "ENV10147",
                    "ENV10152",
                    "ENV10153",
                    "ENV10156",
                    "ENV10157",
                    "ENV10158",
                    "ENV10159",
                    "ENV10160",
                    "ENV10161",
                    "ENV10162",
                    "ENV10170",
                    "ENV10171",
                    "ENV10172",
                    "ENV10174",
                    "ENV10175",
                    "ENV10176",
                    "ENV10177",
                    "ENV10178",
                    "ENV10185"
                ]
            }
        ]
    }
}
