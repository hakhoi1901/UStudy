export const categories = {
    "GENERAL_EDUCATION": {
        "name": "Giáo dục đại cương",
        "total_credits_required": 51,
        "note": "Không kể môn GDQP-AN, GDTC, tin học cơ sở và ngoại ngữ",
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
                "note": "Chọn 1 học phần",
                "courses": [
                    "BAA00005",
                    "BAA00006",
                    "BAA00007"
                ]
            },
            "GENERAL_MATH_SCIENCE": {
                "name": "Toán - Khoa học tự nhiên - Công nghệ - Môi trường",
                "credits": 35,
                "mandatory": true,
                "breakdown": {
                    "MANDATORY": {
                        "name": "Bắt buộc",
                        "credits_required": 33,
                        "courses": [
                            "MTH00003",
                            "MTH00004",
                            "MTH00081",
                            "MTH00030",
                            "MTH00040",
                            "CHE00001",
                            "PHY00001",
                            "PHY00002",
                            "PHY00004",
                            "SEM00001",
                            "SEM00002",
                            "PHY00081"
                        ]
                    },
                    "ELECTIVE": {
                        "name": "Tự chọn",
                        "credits_required": 2,
                        "note": "Chọn 1 học phần",
                        "courses": [
                            "GEO00002",
                            "ENV00001"
                        ]
                    }
                }
            }
        }
    },
    "GENERAL_IT": {
        "name": "Tin học (không tính vào điểm trung bình, tính vào số tín chỉ tích lũy)",
        "credits": 3,
        "mandatory": true,
        "courses": [
            "CSC00003"
        ]
    },
    "GENERAL_ENGLISH": {
        "name": "Ngoại ngữ (không tính vào điểm trung bình và tín chỉ tích lũy)",
        "credits": 12,
        "mandatory": false,
        "note": "SV đạt chuẩn ngoại ngữ đầu ra theo quy định hiện hành thì không đăng ký học các học phần Anh văn",
        "courses": [
            "ADD00031",
            "ADD00032",
            "ADD00033",
            "ADD00034"
        ]
    },
    "GENERAL_PE": {
        "name": "Giáo dục thể chất (không tính vào điểm trung bình, tính vào số tín chỉ tích lũy)",
        "credits": 4,
        "mandatory": true,
        "courses": [
            "BAA00021",
            "BAA00022"
        ]
    },
    "GENERAL_DEFENSE": {
        "name": "Giáo dục quốc phòng - An ninh (không tính vào điểm trung bình, tính vào số tín chỉ tích lũy)",
        "credits": 4,
        "mandatory": true,
        "courses": [
            "BAA00030"
        ]
    },
    "FOUNDATION": {
        "name": "Kiến thức cơ sở ngành",
        "total_credits_required": 39,
        "mandatory": true,
        "courses": [
            "PHY10003",
            "PHY10005",
            "PHY10007",
            "SEM10001",
            "SEM10002",
            "SEM10003",
            "SEM10004",
            "SEM10005",
            "SEM10006",
            "SEM10007",
            "SEM10008",
            "SEM10009",
            "SEM10010"
        ]
    },
    "MAJOR": {
        "name": "Kiến thức chuyên ngành",
        "total_credits_required": 37,
        "breakdown": {
            "ELECTIVE": {
                "name": "Học phần tự chọn",
                "credits": 37,
                "courses": [
                    "SEM10101",
                    "SEM10102",
                    "SEM10103",
                    "SEM10104",
                    "SEM10105",
                    "SEM10106",
                    "SEM10107",
                    "SEM10108",
                    "SEM10109",
                    "SEM10110",
                    "SEM10111",
                    "SEM10112",
                    "SEM10113",
                    "SEM10114",
                    "SEM10115",
                    "SEM10116",
                    "SEM10117",
                    "SEM10118",
                    "SEM10119",
                    "SEM10120",
                    "SEM10121",
                    "SEM10122",
                    "SEM10123",
                    "SEM10124",
                    "SEM10125",
                    "SEM10126",
                    "SEM10127",
                    "SEM10128",
                    "SEM10129",
                    "SEM10130",
                    "SEM10131",
                    "SEM10132",
                    "SEM10133",
                    "SEM10134",
                    "SEM10135",
                    "SEM10136",
                    "SEM10137",
                    "SEM10138",
                    "SEM10139",
                    "SEM10140",
                    "PHY10620",
                    "PHY10618",
                    "PHY10614"
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
                    "SEM10995"
                ]
            },
            {
                "type": "PROJECT",
                "credits": 10,
                "note": "Đồ án tốt nghiệp (6 TC) và Chọn tối thiểu 4 TC trong mục Khối kiến thức chuyên ngành",
                "courses": [
                    "SEM10991"
                ]
            }
        ]
    }
}