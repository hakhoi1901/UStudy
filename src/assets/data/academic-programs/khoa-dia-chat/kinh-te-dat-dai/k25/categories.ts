export const categories = {
    "GENERAL_EDUCATION": {
        "name": "Giáo dục đại cương",
        "total_credits_required": 32,
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
                    "LEC00002"
                ]
            },
            "GENERAL_SOCIAL": {
                "name": "Khoa học xã hội - Kinh tế - Kỹ năng",
                "credits": 11,
                "mandatory": false,
                "note": "LEC00003 bắt buộc; chọn 1 môn TC1 và 3 môn TC2",
                "courses": [
                    "LEC00003",
                    "BAA00006",
                    "BAA00007",
                    "GEO00012",
                    "GEO00004",
                    "GEO00005",
                    "GEO00013",
                    "GEO00007"
                ]
            },
            "GENERAL_MATH_SCIENCE": {
                "name": "Toán - Khoa học tự nhiên - Công nghệ - Môi trường",
                "credits": 7,
                "mandatory": true,
                "courses": [
                    "ENV00001",
                    "LEC00001",
                    "GEO00009"
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
        "total_credits_required": 65,
        "breakdown": {
            "MANDATORY": {
                "credits": 59,
                "courses": [
                    "LEC10001",
                    "LEC10002",
                    "LEC10003",
                    "LEC10004",
                    "LEC10005",
                    "LEC10006",
                    "LEC10007",
                    "LEC10008",
                    "LEC10009",
                    "LEC10010",
                    "LEC10017",
                    "LEC10018",
                    "LEC10019",
                    "LEC10023",
                    "LEC10024",
                    "LEC10025",
                    "LEC10026",
                    "LEC10027",
                    "LEC10028",
                    "LEC10029",
                    "LEC10030",
                    "LEC10031"
                ]
            },
            "ELECTIVE_TC3": {
                "credits_required": 2,
                "note": "Chọn 1 trong 3 học phần TC3",
                "courses": [
                    "LEC10020",
                    "LEC10021",
                    "LEC10022"
                ]
            },
            "ELECTIVE_TC4": {
                "credits_required": 4,
                "note": "Chọn 2 học phần TC4",
                "courses": [
                    "LEC10011",
                    "LEC10012",
                    "LEC10013",
                    "LEC10014",
                    "LEC10015",
                    "LEC10016"
                ]
            }
        }
    },
    "MAJOR_LAND_ECONOMY": {
        "name": "Kiến thức chuyên ngành Kinh tế đất đai",
        "total_credits_required": 23,
        "breakdown": {
            "MANDATORY": {
                "credits": 2,
                "courses": [
                    "LEC10117"
                ]
            },
            "ELECTIVE": {
                "credits_required": 21,
                "note": "Chọn 7 môn",
                "courses": [
                    "LEC10101",
                    "LEC10102",
                    "GEO10117",
                    "LEC10103",
                    "LEC10104",
                    "LEC10105",
                    "LEC10106",
                    "LEC10107",
                    "LEC10108",
                    "LEC10109",
                    "LEC10110",
                    "LEC10111",
                    "LEC10112",
                    "LEC10113",
                    "LEC10114",
                    "LEC10115",
                    "LEC10116"
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
                    "LEC10195"
                ]
            }
        ]
    }
}
