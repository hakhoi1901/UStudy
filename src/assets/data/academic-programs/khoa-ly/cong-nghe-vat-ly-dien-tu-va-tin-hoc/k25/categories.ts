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
                "mandatory": true,
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
                    "PHY00081",
                    "GEO00002",
                    "ENV00001",
                    "BAA00015"
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
                "note": "Không tính vào điểm trung bình và tín chỉ tích lũy. Sinh viên đạt chuẩn ngoại ngữ đầu ra theo quy định hiện hành thì không đăng ký các học phần Anh văn.",
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
        "mandatory": true,
        "courses": [
            "PET10001",
            "PET10002",
            "PET10008",
            "PET10009",
            "PHY10005",
            "PHY10007",
            "PHY10010",
            "PET10010",
            "PET10011",
            "PET10012"
        ]
    },
    "MAJOR_PHYSICS_TECH_MATERIALS": {
        "name": "Chuyên ngành Kỹ thuật vật lý linh kiện",
        "total_credits_required": 44,
        "breakdown": {
            "MANDATORY": {
                "credits": 21,
                "courses": [
                    "PET10104",
                    "PET10105",
                    "PET10109",
                    "PET10122",
                    "PET10123",
                    "PET10124",
                    "PHY10614"
                ]
            },
            "ELECTIVE": {
                "credits": 23,
                "courses": [
                    "PHY10801",
                    "PET10107",
                    "PHY10205",
                    "PHY10207",
                    "PHY10211",
                    "PET10112",
                    "PET10113",
                    "PET10125",
                    "PET10115",
                    "PET10108",
                    "PET10110",
                    "PET10111",
                    "PET10117",
                    "PET10119",
                    "PET10126",
                    "PET10127",
                    "PET10204"
                ]
            }
        }
    },
    "MAJOR_ELECTRONICS_ROBOTICS": {
        "name": "Chuyên ngành Kỹ thuật điện tử, máy tính và robot thông minh",
        "total_credits_required": 44,
        "breakdown": {
            "MANDATORY": {
                "credits": 21,
                "courses": [
                    "PET10106",
                    "PHY10613",
                    "PHY10124",
                    "PET10007",
                    "PET10004",
                    "PET10005",
                    "PHY10614"
                ]
            },
            "ELECTIVE": {
                "credits": 23,
                "courses": [
                    "PHY10801",
                    "PET10107",
                    "PHY10625",
                    "PHY10623",
                    "PHY10616",
                    "PHY10610",
                    "PET10120",
                    "PET10121",
                    "PET10101",
                    "PET10117",
                    "PET10119",
                    "PET10112",
                    "PHY10621",
                    "PET10118",
                    "PET10116",
                    "SEM10136",
                    "PET10201",
                    "PET10202",
                    "PET10203",
                    "PET10204",
                    "PET10205",
                    "PET10206",
                    "PET10207",
                    "PET10208",
                    "PET10209",
                    "PET10210",
                    "PET10211",
                    "PET10212"
                ]
            }
        }
    },
    "GRADUATION": {
        "name": "Kiến thức tốt nghiệp",
        "total_credits_required": 10,
        "courses": [
            "PET10995"
        ]
    }
}
