export const categories = {
    "GENERAL_EDUCATION": {
        "name": "Giáo dục đại cương",
        "total_credits_required": 54,
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
                    "BIO00010",
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
        "total_credits_required": 42,
        "mandatory": true,
        "courses": [
            "BIO10002",
            "BTE10014",
            "BIO10004",
            "BIO10005",
            "BIO10006",
            "BIO10007",
            "BIO10008",
            "BIO10009",
            "BIO10010",
            "BIO10011",
            "BIO10012",
            "BIO10013",
            "BIO10014",
            "BIO10015",
            "BIO10016",
            "BIO10017",
            "BIO10018",
            "BIO10019",
            "BIO10020",
            "BIO10021",
            "BIO10022"
        ],
        "note": "Có học phần bổ trợ BIO10003 không tính vào điểm trung bình tích lũy",
        "support_courses": [
            "BIO10003"
        ],
        "breakdown": {
            "SUPPORT": {
                "credits_required": 0,
                "courses": [
                    "BIO10003"
                ]
            }
        }
    },
    "MAJOR_BIOLOGY": {
        "name": "Kiến thức chuyên ngành Sinh học",
        "total_credits_required": 25,
        "breakdown": {
            "SPECIALIZED_PRACTICUM": {
                "credits_required": 4,
                "note": "Tích lũy ít nhất 1 học phần; tín chỉ dư có thể tính vào tự chọn tự do",
                "courses": [
                    "BIO10101",
                    "BIO10201",
                    "BIO10301",
                    "BIO10401",
                    "BIO10501",
                    "BIO10601"
                ]
            },
            "SPECIALIZED_KNOWLEDGE": {
                "credits_required": 6,
                "courses": [
                    "BIO10104",
                    "BIO10105",
                    "BIO10102",
                    "BIO10106",
                    "BIO10107",
                    "BIO10110",
                    "BIO10202",
                    "BIO10203",
                    "BIO10204",
                    "BIO10205",
                    "BIO10206",
                    "BIO10207",
                    "BTE10303",
                    "BTE10408",
                    "BIO10303",
                    "BIO10304",
                    "BIO10305",
                    "BIO10306",
                    "BIO10307",
                    "BIO10308",
                    "BIO10309",
                    "BIO10320",
                    "BIO10402",
                    "BIO10403",
                    "BIO10404",
                    "BIO10407",
                    "BIO10408",
                    "BIO10409",
                    "BIO10413",
                    "BIO10414",
                    "BIO10502",
                    "BIO10503",
                    "BIO10504",
                    "BIO10505",
                    "BTE10006",
                    "BIO10516",
                    "BIO10602",
                    "BIO10603",
                    "BIO10604",
                    "BTE10308"
                ]
            },
            "FREE_ELECTIVE": {
                "credits_required": 15,
                "note": "Không tính lại học phần đã dùng ở các nhóm trên",
                "courses": [
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
                    "BIO10203",
                    "BIO10204",
                    "BIO10205",
                    "BIO10206",
                    "BIO10207",
                    "BIO10208",
                    "BTE10303",
                    "BIO10210",
                    "BIO10211",
                    "BIO10212",
                    "BTE10408",
                    "BTE10021",
                    "BIO10214",
                    "BIO10215",
                    "BIO10216",
                    "BIO10302",
                    "BIO10303",
                    "BIO10304",
                    "BIO10305",
                    "BIO10306",
                    "BIO10307",
                    "BIO10308",
                    "BIO10309",
                    "BIO10310",
                    "BIO10311",
                    "BIO10313",
                    "BIO10314",
                    "BIO10315",
                    "BIO10316",
                    "BIO10317",
                    "BIO10318",
                    "BIO10319",
                    "BIO10320",
                    "BIO10321",
                    "BIO10323",
                    "BIO10324",
                    "BIO10325",
                    "BIO10326",
                    "BIO10327",
                    "BIO10328",
                    "BIO10329",
                    "BIO10330",
                    "BIO10331",
                    "BIO10332",
                    "BIO10333",
                    "BIO10334",
                    "BIO10335",
                    "BIO10402",
                    "BIO10403",
                    "BIO10404",
                    "BIO10405",
                    "BIO10406",
                    "BIO10407",
                    "BIO10408",
                    "BIO10409",
                    "BIO10410",
                    "BIO10411",
                    "BIO10412",
                    "BIO10413",
                    "BIO10414",
                    "BIO10415",
                    "BIO10416",
                    "BIO10417",
                    "BIO10502",
                    "BIO10503",
                    "BIO10504",
                    "BIO10505",
                    "BIO10506",
                    "BIO10507",
                    "BIO10508",
                    "BIO10509",
                    "BIO10510",
                    "BIO10511",
                    "BTE10006",
                    "BIO10513",
                    "BTE10019",
                    "BIO10515",
                    "BIO10602",
                    "BIO10603",
                    "BIO10604",
                    "BTE10308",
                    "BIO10606",
                    "BIO10607",
                    "BIO10608",
                    "BIO10609",
                    "BIO10610",
                    "BTE10109",
                    "BTE10202",
                    "BTE10203",
                    "BTE10204",
                    "BTE10205",
                    "BTE10206",
                    "BTE10207",
                    "BTE10209",
                    "BTE10210",
                    "BTE10302",
                    "BTE10304",
                    "BTE10305",
                    "BTE10306",
                    "BTE10309",
                    "BTE10310",
                    "BIO10112",
                    "BIO10512",
                    "BIO10514",
                    "BTE10405",
                    "BTE10406",
                    "BIO10516",
                    "BIO10517",
                    "BIO10101",
                    "BIO10201",
                    "BIO10301",
                    "BIO10401",
                    "BIO10501",
                    "BIO10601",
                    "BIO10418",
                    "BIO10113",
                    "BIO10336",
                    "BIO10337",
                    "BIO10338"
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
                    "BIO10195",
                    "BIO10295",
                    "BIO10395",
                    "BIO10495",
                    "BIO10595",
                    "BIO10695"
                ]
            },
            {
                "type": "INTERNSHIP_AND_ELECTIVE",
                "credits": 10,
                "note": "Thực tập tốt nghiệp 6 tín chỉ + 4 tín chỉ tự chọn tự do",
                "courses": [
                    "BIO10191",
                    "BIO10291",
                    "BIO10391",
                    "BIO10491",
                    "BIO10591",
                    "BIO10691"
                ]
            }
        ]
    }
}
