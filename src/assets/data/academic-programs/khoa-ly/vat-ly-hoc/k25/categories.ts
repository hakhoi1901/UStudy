export const categories = {
    "GENERAL_EDUCATION": {
        "name": "Giáo dục đại cương",
        "total_credits_required": 51,
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
                "note": "Chọn 1 trong 4 học phần",
                "courses": [
                    "BAA00005",
                    "BAA00006",
                    "BAA00007",
                    "BAA00016"
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
                    "PHY00003",
                    "PHY00004",
                    "PHY00010",
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
            "PHY10001",
            "PHY10002",
            "PHY10004",
            "PHY10005",
            "PHY10006",
            "PHY10007",
            "PHY10009",
            "PHY10011",
            "PHY10016"
        ]
    },
    "MAJOR_NUCLEAR_PHYSICS": {
        "name": "Chuyên ngành Vật lý hạt nhân",
        "total_credits_required": 48,
        "breakdown": {
            "MANDATORY": {
                "credits": 18,
                "courses": [
                    "PHY10625",
                    "PHY10331",
                    "PHY10433",
                    "PHY10324",
                    "PHY10628",
                    "PHY10440"
                ]
            },
            "ELECTIVE": {
                "credits": 30,
                "courses": [
                    "PHY10438",
                    "PHY10531",
                    "PHY10316",
                    "PHY10322",
                    "PHY10432",
                    "PHY10441",
                    "PHY10439",
                    "PHY10529",
                    "PHY10614",
                    "PHY10302",
                    "PHY10325",
                    "PHY10326",
                    "PHY10327",
                    "PHY10328",
                    "PHY10307",
                    "PHY10308",
                    "PHY10310",
                    "PHY10315",
                    "PHY10329",
                    "PHY10330"
                ]
            }
        }
    },
    "MAJOR_GEOPHYSICS": {
        "name": "Chuyên ngành Vật lý địa cầu",
        "total_credits_required": 48,
        "breakdown": {
            "MANDATORY": {
                "credits": 18,
                "courses": [
                    "PHY10625",
                    "PHY10331",
                    "PHY10433",
                    "PHY10324",
                    "PHY10628",
                    "PHY10440"
                ]
            },
            "ELECTIVE": {
                "credits": 30,
                "courses": [
                    "PHY10438",
                    "PHY10531",
                    "PHY10316",
                    "PHY10322",
                    "PHY10432",
                    "PHY10441",
                    "PHY10439",
                    "PHY10529",
                    "PHY10614",
                    "PHY10413",
                    "PHY10423",
                    "PHY10431",
                    "PHY10435",
                    "PHY10436",
                    "PHY10425",
                    "PHY10437"
                ]
            }
        }
    },
    "MAJOR_ELECTRONIC_PHYSICS": {
        "name": "Chuyên ngành Vật lý điện tử",
        "total_credits_required": 48,
        "breakdown": {
            "MANDATORY": {
                "credits": 19,
                "courses": [
                    "PHY10609",
                    "PHY10626",
                    "PHY10237",
                    "PHY10228",
                    "PHY10627",
                    "PHY10727"
                ]
            },
            "ELECTIVE": {
                "credits": 29,
                "courses": [
                    "PHY10625",
                    "PHY10628",
                    "PHY10103",
                    "PHY10124",
                    "PHY10229",
                    "PHY10611",
                    "PHY10614",
                    "PHY10618",
                    "PHY10132",
                    "PHY10630",
                    "PHY10724",
                    "PHY10726",
                    "PHY10634",
                    "PHY10635",
                    "PHY10128",
                    "PHY10136",
                    "PHY10636",
                    "PHY10230",
                    "PHY10231",
                    "PHY10238",
                    "PHY10232",
                    "PHY10105",
                    "PHY10205",
                    "PHY10207",
                    "PHY10227",
                    "PHY10233",
                    "PHY10234",
                    "PHY10235",
                    "PHY10236"
                ]
            }
        }
    },
    "MAJOR_SOLID_STATE_PHYSICS": {
        "name": "Chuyên ngành Vật lý chất rắn",
        "total_credits_required": 48,
        "breakdown": {
            "MANDATORY": {
                "credits": 19,
                "courses": [
                    "PHY10609",
                    "PHY10626",
                    "PHY10237",
                    "PHY10228",
                    "PHY10627",
                    "PHY10727"
                ]
            },
            "ELECTIVE": {
                "credits": 29,
                "courses": [
                    "PHY10625",
                    "PHY10628",
                    "PHY10103",
                    "PHY10124",
                    "PHY10229",
                    "PHY10611",
                    "PHY10614",
                    "PHY10618",
                    "PHY10132",
                    "PHY10630",
                    "PHY10724",
                    "PHY10726",
                    "PHY10634",
                    "PHY10635",
                    "PHY10128",
                    "PHY10136",
                    "PHY10636",
                    "PHY10230",
                    "PHY10231",
                    "PHY10238",
                    "PHY10232",
                    "PHY10105",
                    "PHY10205",
                    "PHY10207",
                    "PHY10227",
                    "PHY10233",
                    "PHY10234",
                    "PHY10235",
                    "PHY10236"
                ]
            }
        }
    },
    "MAJOR_COMPUTATIONAL_PHYSICS": {
        "name": "Chuyên ngành Vật lý tin học",
        "total_credits_required": 48,
        "breakdown": {
            "MANDATORY": {
                "credits": 19,
                "courses": [
                    "PHY10609",
                    "PHY10626",
                    "PHY10237",
                    "PHY10228",
                    "PHY10627",
                    "PHY10727"
                ]
            },
            "ELECTIVE": {
                "credits": 29,
                "courses": [
                    "PHY10625",
                    "PHY10628",
                    "PHY10103",
                    "PHY10124",
                    "PHY10229",
                    "PHY10611",
                    "PHY10614",
                    "PHY10618",
                    "PHY10132",
                    "PHY10630",
                    "PHY10724",
                    "PHY10726",
                    "PHY10634",
                    "PHY10635",
                    "PHY10128",
                    "PHY10136",
                    "PHY10636",
                    "PHY10631",
                    "PHY10115",
                    "PHY10610",
                    "PHY10612",
                    "PHY10613",
                    "PHY10615",
                    "PHY10616",
                    "PHY10621",
                    "PHY10623",
                    "PHY10629",
                    "PHY10632",
                    "PHY10633"
                ]
            }
        }
    },
    "MAJOR_APPLIED_PHYSICS": {
        "name": "Chuyên ngành Vật lý ứng dụng",
        "total_credits_required": 48,
        "breakdown": {
            "MANDATORY": {
                "credits": 19,
                "courses": [
                    "PHY10609",
                    "PHY10626",
                    "PHY10237",
                    "PHY10228",
                    "PHY10627",
                    "PHY10727"
                ]
            },
            "ELECTIVE": {
                "credits": 29,
                "courses": [
                    "PHY10625",
                    "PHY10628",
                    "PHY10103",
                    "PHY10124",
                    "PHY10128",
                    "PHY10132",
                    "PHY10136",
                    "PHY10229",
                    "PHY10611",
                    "PHY10614",
                    "PHY10618",
                    "PHY10630",
                    "PHY10634",
                    "PHY10635",
                    "PHY10724",
                    "PHY10726",
                    "PHY10703",
                    "PHY10705",
                    "PHY10715",
                    "PHY10719",
                    "PHY10720",
                    "PHY10723",
                    "PHY10725",
                    "PHY10728",
                    "PHY10729",
                    "PHY10730",
                    "PHY10731",
                    "PHY10732"
                ]
            }
        }
    },
    "MAJOR_THEORETICAL_PHYSICS": {
        "name": "Chuyên ngành Vật lý lý thuyết",
        "total_credits_required": 48,
        "breakdown": {
            "MANDATORY": {
                "credits": 18,
                "courses": [
                    "PHY10532",
                    "PHY10517",
                    "PHY10529",
                    "PHY10528",
                    "PHY10507",
                    "PHY10537"
                ]
            },
            "ELECTIVE": {
                "credits": 30,
                "courses": [
                    "PHY10509",
                    "PHY10531",
                    "PHY10535",
                    "PHY10538",
                    "PHY10539",
                    "PHY10540",
                    "PHY10541",
                    "PHY10542",
                    "PHY10543",
                    "PHY10512",
                    "PHY10533",
                    "PHY10524",
                    "PHY10527",
                    "PHY10544",
                    "PHY10547"
                ]
            }
        }
    },
    "MAJOR_QUANTUM_COMPUTING": {
        "name": "Chuyên ngành Tính toán lượng tử",
        "total_credits_required": 48,
        "breakdown": {
            "MANDATORY": {
                "credits": 18,
                "courses": [
                    "PHY10532",
                    "PHY10517",
                    "PHY10529",
                    "PHY10528",
                    "PHY10507",
                    "PHY10537"
                ]
            },
            "ELECTIVE": {
                "credits": 30,
                "courses": [
                    "PHY10509",
                    "PHY10531",
                    "PHY10535",
                    "PHY10538",
                    "PHY10539",
                    "PHY10540",
                    "PHY10541",
                    "PHY10542",
                    "PHY10543",
                    "PHY10545",
                    "PHY10546",
                    "PHY10547",
                    "PHY10548",
                    "PHY10549",
                    "PHY10550",
                    "PHY10551"
                ]
            }
        }
    },
    "GRADUATION": {
        "name": "Kiến thức tốt nghiệp",
        "total_credits_required": 10,
        "courses": [
            "PHY10995"
        ]
    }
}
