export const categories = {
    "GENERAL_EDUCATION": {
        "name": "Giáo dục đại cương",
        "total_credits_required": 47,
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
                "note": "BAA00005 và GEO00003 bắt buộc; chọn 1 trong BAA00006/BAA00007 và chọn 3 trong 6 học phần kỹ năng",
                "courses": [
                    "BAA00005",
                    "BAA00006",
                    "BAA00007",
                    "GEO00003",
                    "GEO00004",
                    "GEO00005",
                    "GEO00007",
                    "GEO00012",
                    "GEO00013",
                    "GEO00008"
                ]
            },
            "GENERAL_MATH_SCIENCE": {
                "name": "Toán - Khoa học tự nhiên - Công nghệ - Môi trường",
                "credits": 21,
                "mandatory": false,
                "note": "Chọn 1 trong BIO00001/BIO00002; các học phần còn lại bắt buộc",
                "courses": [
                    "MTH00002",
                    "MTH00040",
                    "PHY00001",
                    "CHE00001",
                    "ENV00001",
                    "GEO00009",
                    "GEO00010",
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
        "total_credits_required": 40,
        "breakdown": {
            "MANDATORY": {
                "credits": 36,
                "courses": [
                    "GEO10051",
                    "GEO10002",
                    "GEO10052",
                    "GEO10053",
                    "GEO10054",
                    "GEO10009",
                    "GEO10055",
                    "GEO10056",
                    "GEO10057",
                    "GEO10013",
                    "GEO10058",
                    "GEO10059",
                    "GEO10062",
                    "GEO10063",
                    "GEO10029",
                    "GEO10025",
                    "GEO20201"
                ]
            },
            "ELECTIVE": {
                "credits_required": 4,
                "courses": [
                    "GEO10064",
                    "GEO10061",
                    "GEO10066",
                    "GEO10032",
                    "GEO10067",
                    "GEO10068",
                    "GEO10065",
                    "GEO10060"
                ]
            }
        }
    },
    "MAJOR_GEOLOGICAL_ENGINEERING": {
        "name": "Kiến thức chuyên ngành Kỹ thuật Địa chất",
        "total_credits_required": 30,
        "specializations": {
            "MINERAL_EXPLORATION": {
                "name": "Tìm kiếm thăm dò khoáng sản",
                "mandatory_credits": 21,
                "mandatory_courses": [
                    "GEO20101",
                    "GEO20102",
                    "GEO10113",
                    "GEO20117",
                    "GEO20105",
                    "GEO20108",
                    "GEO20109",
                    "GEO20110",
                    "GEO20118",
                    "GEO10114"
                ],
                "elective_credits_required": 9,
                "elective_courses": [
                    "GEO20106",
                    "GEO20120",
                    "GEO10112",
                    "GEO20121",
                    "GEO20119",
                    "GEO20114",
                    "GEO10117",
                    "GEO10118",
                    "GEO10119",
                    "GEO10120",
                    "GEO10121",
                    "GEO10122"
                ]
            },
            "GEOTECHNICAL": {
                "name": "Địa kỹ thuật",
                "mandatory_credits": 21,
                "mandatory_courses": [
                    "GEO20202",
                    "GEO20204",
                    "GEO20205",
                    "GEO20206",
                    "GEO20207",
                    "GEO10413",
                    "GEO20209",
                    "GEO10114"
                ],
                "elective_credits_required": 9,
                "elective_courses": [
                    "GEO20214",
                    "GEO20217",
                    "GEO20211",
                    "GEO20218",
                    "GEO20210",
                    "GEO20212",
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
                    "GEO20115",
                    "GEO20215"
                ]
            },
            {
                "type": "PROJECT_AND_ELECTIVE",
                "credits": 10,
                "note": "Đồ án tốt nghiệp 6 tín chỉ + 4 tín chỉ tự chọn chuyên ngành",
                "courses": [
                    "GEO20116",
                    "GEO20216"
                ]
            }
        ]
    }
}
