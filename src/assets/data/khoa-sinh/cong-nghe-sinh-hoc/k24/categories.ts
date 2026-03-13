export const categories = {
    "GENERAL_EDUCATION": {
        "name": "Giáo dục đại cương",
        "total_credits_required": 54,
        "note": "Không kể môn GDQP-AN, GDTC, Tin học cơ sở và Ngoại ngữ",
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
                "note": "Chọn 01 học phần trong nhóm (02 tín chỉ)",
                "courses": [
                    "BAA00005",
                    "BAA00007",
                    "BAA00006"
                ]
            },
            "GENERAL_MATH_SCIENCE": {
                "name": "Toán - Khoa học tự nhiên - Công nghệ - Môi trường",
                "credits": 38,
                "mandatory": true,
                "courses": [
                    "CHE00001",
                    "CHE00002",
                    "CHE00003",
                    "CHE00082",
                    "BIO00001",
                    "BIO00002",
                    "BIO00011",
                    "ENV00003",
                    "BIO00081",
                    "BIO00082",
                    "MTH00001",
                    "MTH00002",
                    "MTH00040",
                    "PHY00001",
                    "PHY00002"
                ]
            },
            "GENERAL_IT": {
                "name": "Tin học",
                "credits": 3,
                "mandatory": false,
                "note": "Không tính vào điểm trung bình, tính vào số tín chỉ tích lũy",
                "courses": [
                    "CSC00003"
                ]
            },
            "GENERAL_ENGLISH": {
                "name": "Ngoại ngữ",
                "credits": 12,
                "mandatory": false,
                "note": "Không tính vào điểm trung bình và tín chỉ tích lũy. SV đạt chuẩn ngoại ngữ đầu ra thì không đăng ký học các học phần Anh văn",
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
                "mandatory": false,
                "note": "Không tính vào điểm trung bình, tính vào số tín chỉ tích lũy",
                "courses": [
                    "BAA00021",
                    "BAA00022"
                ]
            },
            "GENERAL_DEFENSE": {
                "name": "Giáo dục quốc phòng - An ninh",
                "credits": 4,
                "mandatory": false,
                "note": "Không tính vào điểm trung bình, tính vào số tín chỉ tích lũy",
                "courses": [
                    "BAA00030"
                ]
            },
        }
    },
    "FOUNDATION": {
        "name": "Kiến thức cơ sở ngành",
        "total_credits_required": 42,
        "breakdown": {
            "MANDATORY": {
                "name": "Học phần bắt buộc",
                "credits": 37,
                "courses": [
                    "BIO10002",
                    "BTE10002",
                    "BTE10004",
                    "BTE10005",
                    "BTE10006",
                    "BTE10007",
                    "BTE10009",
                    "BTE10010",
                    "BTE10011",
                    "BTE10012",
                    "BTE10013",
                    "BTE10008",
                    "BIO10012",
                    "BIO10022",
                    "BIO10010",
                    "BTE10017",
                    "BTE10014",
                    "BTE10019",
                    "BIO10302"
                ]
            },
            "ELECTIVE": {
                "name": "Học phần tự chọn",
                "credits": 5,
                "courses": [
                    "BTE10020",
                    "BTE10021",
                    "BTE10022",
                    "BTE10023",
                    "BTE10024",
                    "BTE10025",
                    "BTE10026",
                    "BTE10027",
                    "BTE10028",
                    "BTE10029",
                    "BTE10046",
                    "BIO10013"
                ]
            }
        }
    },
    "SUPPLEMENTARY": {
        "name": "Kiến thức bổ trợ",
        "credits": 2,
        "mandatory": false,
        "note": "Không tính vào điểm trung bình tích lũy",
        "courses": [
            "BIO10003"
        ]
    },
    "MAJOR": {
        "name": "Kiến thức chuyên ngành",
        "total_credits_required": 25,
        "breakdown": {
            "MANDATORY_INTERNSHIP": {
                "name": "Thực tập chuyên ngành (a)",
                "credits": 4,
                "note": "Sinh viên phải tích lũy ít nhất một học phần (04 tín chỉ) trong danh sách",
                "courses": [
                    "BTE10101",
                    "BTE10201",
                    "BTE10301",
                    "BTE10421"
                ]
            },
            "ELECTIVE_B": {
                "name": "Học phần chuyên ngành (b)",
                "credits": 8,
                "note": "Sinh viên phải tích lũy được 08 tín chỉ trong danh sách các học phần dưới đây",
                "courses": [
                    "BTE10102",
                    "BTE10103",
                    "BTE10104",
                    "BTE10105",
                    "BTE10106",
                    "BTE10107",
                    "BTE10108",
                    "BTE10109",
                    "BTE10203",
                    "BTE10204",
                    "BTE10205",
                    "BTE10206",
                    "BTE10207",
                    "BTE10208",
                    "BTE10209",
                    "BTE10210",
                    "BTE10302",
                    "BTE10303",
                    "BTE10304",
                    "BTE10305",
                    "BTE10306",
                    "BIO10203",
                    "BTE10308",
                    "BTE10401",
                    "BTE10402",
                    "BTE10404",
                    "BTE10405",
                    "BTE10407",
                    "BTE10408",
                    "BTE10422",
                    "BTE10423",
                    "BTE10424"
                ]
            },
            "ELECTIVE_C": {
                "name": "Học phần tự chọn tự do (c - Phụ lục 1)",
                "credits": 13,
                "note": "Sinh viên chọn học để tích lũy ít nhất 13 tín chỉ trong danh sách PHỤ LỤC 1 (không được tính các học phần đã tích lũy ở điểm a và b)",
                "courses": [
                    "BIO10203",
                    "BTE10102",
                    "BTE10103",
                    "BTE10104",
                    "BTE10105",
                    "BTE10106",
                    "BTE10107",
                    "BTE10108",
                    "BTE10109",
                    "BTE10110",
                    "BTE10202",
                    "BTE10203",
                    "BTE10204",
                    "BTE10205",
                    "BTE10206",
                    "BTE10207",
                    "BTE10208",
                    "BTE10209",
                    "BTE10210",
                    "BTE10211",
                    "BTE10302",
                    "BTE10303",
                    "BTE10304",
                    "BTE10305",
                    "BTE10306",
                    "BTE10308",
                    "BTE10309",
                    "BTE10310",
                    "BTE10404",
                    "BTE10405",
                    "BTE10406",
                    "BTE10407",
                    "BTE10408",
                    "BTE10409",
                    "BTE10410",
                    "BTE10411",
                    "BTE10412",
                    "BTE10413",
                    "BTE10414",
                    "BTE10415",
                    "BIO10102",
                    "BIO10103",
                    "BIO10104",
                    "BIO10105",
                    "BIO10106",
                    "BIO10107",
                    "BIO10108",
                    "BIO10109",
                    "BIO10110",
                    "BIO10111",
                    "BIO10202",
                    "BIO10204",
                    "BIO10205",
                    "BIO10207",
                    "BIO10208",
                    "BIO10210",
                    "BIO10211",
                    "BIO10212",
                    "BIO10214",
                    "BIO10215",
                    "BIO10216",
                    "BIO10304",
                    "BIO10310",
                    "BIO10311",
                    "BIO10314",
                    "BIO10318",
                    "BIO10319",
                    "BIO10320",
                    "BIO10325",
                    "BIO10328",
                    "BIO10332",
                    "BIO10335",
                    "BIO10414",
                    "BIO10502",
                    "BIO10503",
                    "BIO10504",
                    "BIO10506",
                    "BIO10507",
                    "BIO10508",
                    "BIO10511",
                    "BIO10602",
                    "BIO10603",
                    "BIO10604",
                    "BIO10606",
                    "BIO10607",
                    "BIO10608",
                    "BIO10609",
                    "BTE10020",
                    "BTE10021",
                    "BTE10022",
                    "BTE10023",
                    "BTE10024",
                    "BTE10025",
                    "BTE10026",
                    "BTE10027",
                    "BTE10028",
                    "BTE10029",
                    "BIO10013",
                    "BTE10212",
                    "BTE10422",
                    "BTE10423",
                    "BTE10424",
                    "BTE10425",
                    "BTE10426",
                    "BTE10401",
                    "BTE10402",
                    "BTE10112",
                    "BTE10113",
                    "BTE10101",
                    "BTE10201",
                    "BTE10301",
                    "BTE10421"
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
                "note": "Khóa luận chuyên ngành (Phương án 1)",
                "courses": [
                    "BTE10195",
                    "BTE10295",
                    "BTE10395",
                    "BTE10496"
                ]
            },
            {
                "type": "INTERNSHIP_AND_ELECTIVES",
                "credits": 10,
                "note": "Thực tập tốt nghiệp 4 TC + học phần tự chọn tự do 6 TC (Phương án 2)",
                "courses": [
                    "BTE10190",
                    "BTE10290",
                    "BTE10390",
                    "BTE10491"
                ]
            },
            {
                "type": "FREE_ELECTIVES",
                "credits": 10,
                "note": "Học phần tự chọn tự do (Phương án 3): Ít nhất 10 tín chỉ các học phần chuyên ngành có mở trong PHỤ LỤC 1",
                "courses": []
            }
        ]
    }
}