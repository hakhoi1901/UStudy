export const categories = {
    "GENERAL_EDUCATION": {
        "name": "Giáo dục đại cương",
        "total_credits_required": 52,
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
                    "BAA00008"
                ]
            },
            "GENERAL_MATH_SCIENCE": {
                "name": "Toán - Khoa học tự nhiên - Công nghệ - Môi trường",
                "credits": 36,
                "mandatory": true,
                "breakdown": {
                    "MATH_MANDATORY": {
                        "name": "Toán và Cơ sở lập trình bắt buộc",
                        "credits_required": 30,
                        "courses": [
                            "MTH00003",
                            "MTH00081",
                            "MTH00004",
                            "MTH00082",
                            "MTH00030",
                            "MTH00083",
                            "MTH00042",
                            "MTH00018",
                            "MTH00041",
                            "MTH00086",
                            "MTH00050",
                            "MTH00055"
                        ]
                    },
                    "SCIENCE": {
                        "name": "Khoa học tự nhiên",
                        "credits_required": 4,
                        "note": "Chọn 4 tín chỉ trong nhóm Sinh đại cương, Hóa đại cương, hoặc Vật lý đại cương",
                        "courses": [
                            "BIO00001",
                            "BIO00002",
                            "BIO00081",
                            "BIO00082",
                            "CHE00001",
                            "CHE00002",
                            "CHE00081",
                            "CHE00082",
                            "PHY00001",
                            "PHY00002",
                            "PHY00081"
                        ]
                    },
                    "ENVIRONMENT": {
                        "name": "Môi trường và Trái đất",
                        "credits_required": 2,
                        "note": "Chọn 1 học phần",
                        "courses": [
                            "GEO00002",
                            "ENV00001",
                            "ENV00003"
                        ]
                    }
                }
            }
        }
    },
    "GENERAL_IT": {
        "name": "Tin học",
        "credits": 3,
        "mandatory": true,
        "note": "Không tính vào điểm trung bình, tính số tín chỉ tích lũy",
        "courses": [
            "CSC00003"
        ]
    },
    "GENERAL_ENGLISH": {
        "name": "Ngoại ngữ",
        "credits": 12,
        "mandatory": false,
        "note": "Không tính vào điểm trung bình và tín chỉ tích lũy. SV chỉ đăng ký học nếu chưa có chứng chỉ đạt chuẩn ngoại ngữ đầu ra theo quy định hiện hành.",
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
        "note": "Không tính vào điểm trung bình, tính số tín chỉ tích lũy",
        "courses": [
            "BAA00030"
        ]
    },
    "FOUNDATION": {
        "name": "Kiến thức cơ sở ngành",
        "total_credits_required": 32,
        "mandatory": true,
        "courses": [
            "MTH10107",
            "MTH10407",
            "MTH10405",
            "MTH10312",
            "MTH10311",
            "MTH10131",
            "MTH10109",
            "MTH10171",
            "MTH10433"
        ]
    },
    "MAJOR_DATA_SCIENCE": {
        "name": "Kiến thức chuyên ngành Khoa học dữ liệu",
        "total_credits_required": 35,
        "breakdown": {
            "MANDATORY": {
                "credits": 16
            },
            "ELECTIVE": {
                "credits": 19
            }
        },
        "courses": [
            "MTH10318",
            "MTH10358",
            "MTH10353",
            "MTH10605",
            "MTH10619",
            "MTH10513",
            "MTH10449",
            "MTH10450",
            "MTH10446",
            "MTH10624",
            "MTH10625",
            "MTH10203",
            "MTH10344",
            "MTH10606",
            "MTH10356",
            "MTH10352",
            "MTH10354",
            "MTH10608",
            "MTH10607",
            "MTH10622",
            "MTH10623",
            "MTH10620",
            "MTH10322",
            "MTH10359"
        ]
    },
    "GRADUATION": {
        "name": "Kiến thức tốt nghiệp",
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
                "type": "PROJECT_AND_ELECTIVE",
                "credits": 10,
                "courses": [
                    "MTH10549",
                    "MTH10626",
                    "MTH10627",
                    "MTH10597"
                ]
            }
        ]
    }
}