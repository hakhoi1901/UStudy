export const categories = {
    "GENERAL_EDUCATION": {
        "name": "Giáo dục đại cương",
        "total_credits_required": 48,
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
                "name": "Khoa học xã hội - Kinh tế - Kỹ năng",
                "credits": 2,
                "mandatory": false,
                "note": "Chọn 1 trong 3",
                "courses": [
                    "BAA00005",
                    "BAA00006",
                    "BAA00007"
                ]
            },
            "GENERAL_MATH_SCIENCE": {
                "name": "Toán - Khoa học tự nhiên - Công nghệ - Môi trường",
                "credits": 32,
                "mandatory": true,
                "breakdown": {
                    "MANDATORY": {
                        "name": "Bắt buộc",
                        "credits_required": 30,
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
                            "PET00001",
                            "PHY00081"
                        ]
                    },
                    "ELECTIVE": {
                        "name": "Tự chọn",
                        "credits_required": 2,
                        "note": "Chọn 1 trong 2",
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
        "name": "Giáo dục quốc phòng- An ninh (không tính vào điểm trung bình, tính vào số tín chỉ tích lũy)",
        "credits": 4,
        "mandatory": true,
        "courses": [
            "BAA00030"
        ]
    },
    "FOUNDATION": {
        "name": "Kiến thức cơ sở ngành",
        "total_credits_required": 38,
        "mandatory": true,
        "courses": [
            "PET10001",
            "PET10002",
            "PET10003",
            "PET10004",
            "PET10005",
            "PET10006",
            "PET10007",
            "PET10008",
            "PET10009",
            "PHY10003",
            "PHY10005",
            "PHY10007",
            "PHY10010"
        ]
    },
    "MAJOR": {
        "name": "Kiến thức chuyên ngành",
        "total_credits_required": 36,
        "breakdown": {
            "MANDATORY": {
                "name": "Học phần bắt buộc",
                "credits": 18,
                "courses": [
                    "PET10101",
                    "PET10102",
                    "PET10103",
                    "PET10104",
                    "PET10105",
                    "PET10106"
                ]
            },
            "ELECTIVE": {
                "name": "Học phần tự chọn",
                "credits": 18,
                "courses": [
                    "PHY10205",
                    "PHY10207",
                    "PHY10211",
                    "PHY10610",
                    "PHY10612",
                    "PHY10613",
                    "PHY10614",
                    "PHY10616",
                    "PHY10620",
                    "PHY10621",
                    "PHY10623",
                    "PHY10801",
                    "PET10107",
                    "PET10108",
                    "PET10109",
                    "PET10110",
                    "PET10111",
                    "PET10112",
                    "PET10113",
                    "PET10114",
                    "PET10115",
                    "PET10116",
                    "PET10117",
                    "PET10118",
                    "PET10119",
                    "PET10120",
                    "PET10121"
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
                    "PET10995"
                ]
            },
            {
                "type": "PROJECT",
                "credits": 10,
                "courses": [
                    "PET10990",
                    "PET10991"
                ]
            }
        ]
    }
}