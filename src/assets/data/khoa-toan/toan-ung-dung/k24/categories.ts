export const categories = {
    "GENERAL_EDUCATION": {
        "name": "Giáo dục đại cương",
        "total_credits_required": 60,
        "note": "Không kể Giáo dục quốc phòng - An ninh, Ngoại ngữ, Tin học cơ sở và Giáo dục thể chất",
        "breakdown": {
            "GENERAL_POLITICS": {
                "name": "Lý luận chính trị – Pháp luật",
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
                "name": "Khoa học xã hội – Kinh tế - Kỹ năng",
                "credits": 2,
                "mandatory": false,
                "note": "Chọn 1 trong 3",
                "courses": [
                    "BAA00005",
                    "BAA00006",
                    "BAA00008"
                ]
            },
            "GENERAL_MATH_SCIENCE": {
                "name": "Toán - Khoa học tự nhiên - Công nghệ - Môi trường",
                "credits": 44,
                "mandatory": true,
                "note": "Bao gồm cả các môn bắt buộc và các môn tự chọn nhóm TC2, TC3",
                "breakdown": {
                    "MATH_MANDATORY": {
                        "name": "Toán bắt buộc",
                        "credits_required": 34,
                        "courses": [
                            "MTH00010",
                            "MTH00011",
                            "MTH00019",
                            "MTH00013",
                            "MTH00014",
                            "MTH00017",
                            "MTH00031",
                            "MTH00034",
                            "MTH00042",
                            "MTH00043",
                            "MTH00055",
                            "MTH00084",
                            "MTH00087",
                            "MTH00088"
                        ]
                    },
                    "SCIENCE": {
                        "name": "Khoa học tự nhiên",
                        "credits_required": 2,
                        "note": "Chọn 02 tín chỉ",
                        "courses": [
                            "CHE00001",
                            "CHE00002",
                            "CHE00081",
                            "CHE00082",
                            "BIO00001",
                            "BIO00002",
                            "BIO00081",
                            "BIO00082",
                            "PHY00001",
                            "PHY00002",
                            "PHY00081"
                        ]
                    },
                    "ENVIRONMENT": {
                        "name": "Môi trường",
                        "credits_required": 2,
                        "note": "Chọn 01 học phần (02 tín chỉ)",
                        "courses": [
                            "GEO00002",
                            "ENV00001",
                            "ENV00003"
                        ]
                    }
                }
            },
            "GENERAL_IT": {
                "name": "Tin học cơ sở",
                "credits": 3,
                "mandatory": true,
                "note": "Không tính vào điểm TB, tính vào số tín chỉ tích lũy",
                "courses": [
                    "CSC00003"
                ]
            },
            "GENERAL_LANGUAGE": {
                "name": "Ngoại ngữ",
                "credits": 12,
                "mandatory": false,
                "note": "Không tính vào điểm TB và tín chỉ tích lũy",
                "courses": [
                    "ADD00031",
                    "ADD00032",
                    "ADD00033",
                    "ADD00034"
                ]
            },
            "GENERAL_PHYSICAL": {
                "name": "Giáo dục thể chất",
                "credits": 4,
                "mandatory": true,
                "note": "Không tính vào điểm TB, tính vào số tín chỉ tích lũy",
                "courses": [
                    "BAA00021",
                    "BAA00022"
                ]
            },
            "GENERAL_DEFENSE": {
                "name": "Giáo dục quốc phòng - An ninh",
                "credits": 4,
                "mandatory": true,
                "note": "Không tính vào điểm TB, tính vào số tín chỉ tích lũy",
                "courses": [
                    "BAA00030"
                ]
            }
        }
    },
    "FOUNDATION": {
        "name": "Kiến thức cơ sở ngành",
        "total_credits_required": 34,
        "breakdown": {
            "MANDATORY": {
                "credits": 26,
                "mandatory": true,
                "courses": [
                    "MTH10109",
                    "MTH10131",
                    "MTH10201",
                    "MTH10403",
                    "MTH10441",
                    "MTH10449",
                    "MTH10003",
                    "MTH10004"
                ]
            },
            "ELECTIVE": {
                "credits": 8,
                "mandatory": false,
                "courses": [
                    "MTH10312",
                    "MTH10353",
                    "MTH10405",
                    "MTH10413",
                    "MTH10414",
                    "MTH10421",
                    "MTH10426",
                    "MTH10605",
                    "MTH10619"
                ]
            }
        }
    },
    "MAJOR_MECHANICS": {
        "name": "Chuyên ngành Cơ học",
        "total_credits_required": 27,
        "breakdown": {
            "MANDATORY": {
                "credits": 16,
                "courses": [
                    "MTH10433",
                    "MTH10427",
                    "MTH10428",
                    "MTH10429",
                    "MTH10434",
                    "MTH10435"
                ]
            },
            "ELECTIVE": {
                "credits": 11,
                "courses": [
                    "MTH10407", "MTH10318", "MTH10353", "MTH10605", "MTH10358", "MTH10325", "MTH10608", "MTH10322", "MTH10323", "MTH10332",
                    "MTH10336", "MTH10344", "MTH10354", "MTH10519", "MTH10607", "MTH10623", "MTH10359", "MTH10317", "MTH10314", "MTH10315",
                    "MTH10324", "MTH10319", "MTH10321", "MTH10347", "MTH10348", "MTH10355", "MTH10308", "MTH10360", "MTH10311", "MTH10313",
                    "MTH10310", "MTH10309", "MTH10327", "MTH10331", "MTH10333", "MTH10335", "MTH10337", "MTH10341", "MTH10342", "MTH10345",
                    "MTH10334", "MTH10312", "MTH10405", "MTH10413", "MTH10414", "MTH10421", "MTH10426", "MTH10619", "MTH10412", "MTH10419",
                    "MTH10420", "MTH10422", "MTH10418", "MTH10492", "MTH10596", "MTH10497", "MTH10498", "MTH10503", "MTH10505", "MTH10507",
                    "MTH10601", "MTH10525", "MTH10603", "MTH10443", "MTH10436", "MTH10417", "MTH10461", "MTH10409", "MTH10480", "MTH10478",
                    "MTH10439", "MTH10473", "MTH10604", "MTH10444", "MTH10438", "MTH10555", "MTH10556", "MTH10423", "MTH10424", "MTH10485",
                    "MTH10509", "MTH10510", "MTH10511", "MTH10512", "MTH10513", "MTH10514", "MTH10515", "MTH10517", "MTH10518", "MTH10609",
                    "MTH10621", "MTH10557", "MTH10554", "MTH10558", "MTH10559", "MTH10433", "MTH10427", "MTH10428", "MTH10429", "MTH10434",
                    "MTH10435", "MTH10520", "MTH10560", "MTH10561", "MTH10562", "MTH10563", "MTH10104", "MTH10132", "MTH10133", "MTH10001",
                    "MTH10134", "MTH10102", "MTH10002", "MTH10135", "MTH10123", "MTH10136", "MTH10137", "MTH10138", "MTH10126", "MTH10139",
                    "MTH10140", "MTH10112", "MTH10214", "MTH10202", "MTH10203", "MTH10209", "MTH10204", "MTH10215", "MTH10216", "MTH10217",
                    "MTH10219", "MTH10220", "MTH10221", "MTH10446", "MTH10447", "MTH10615", "MTH10450", "MTH10543", "MTH10616", "MTH10553",
                    "MTH10538", "MTH10539", "MTH10540", "MTH10541", "MTH10544", "MTH10545", "MTH10614", "MTH10549", "MTH10627"
                ]
            }
        }
    },
    "MAJOR_MATH_EDUCATION": {
        "name": "Chuyên ngành Giáo dục toán học",
        "total_credits_required": 27,
        "breakdown": {
            "MANDATORY": {
                "credits": 15,
                "courses": [
                    "MTH10104",
                    "MTH10132",
                    "MTH10133",
                    "MTH10001",
                    "MTH10134"
                ]
            },
            "ELECTIVE": {
                "credits": 12,
                "courses": [
                    "MTH10407", "MTH10318", "MTH10353", "MTH10605", "MTH10358", "MTH10325", "MTH10608", "MTH10322", "MTH10323", "MTH10332",
                    "MTH10336", "MTH10344", "MTH10354", "MTH10519", "MTH10607", "MTH10623", "MTH10359", "MTH10317", "MTH10314", "MTH10315",
                    "MTH10324", "MTH10319", "MTH10321", "MTH10347", "MTH10348", "MTH10355", "MTH10308", "MTH10360", "MTH10311", "MTH10313",
                    "MTH10310", "MTH10309", "MTH10327", "MTH10331", "MTH10333", "MTH10335", "MTH10337", "MTH10341", "MTH10342", "MTH10345",
                    "MTH10334", "MTH10312", "MTH10405", "MTH10413", "MTH10414", "MTH10421", "MTH10426", "MTH10619", "MTH10412", "MTH10419",
                    "MTH10420", "MTH10422", "MTH10418", "MTH10492", "MTH10596", "MTH10497", "MTH10498", "MTH10503", "MTH10505", "MTH10507",
                    "MTH10601", "MTH10525", "MTH10603", "MTH10443", "MTH10436", "MTH10417", "MTH10461", "MTH10409", "MTH10480", "MTH10478",
                    "MTH10439", "MTH10473", "MTH10604", "MTH10444", "MTH10438", "MTH10555", "MTH10556", "MTH10423", "MTH10424", "MTH10485",
                    "MTH10509", "MTH10510", "MTH10511", "MTH10512", "MTH10513", "MTH10514", "MTH10515", "MTH10517", "MTH10518", "MTH10609",
                    "MTH10621", "MTH10557", "MTH10554", "MTH10558", "MTH10559", "MTH10433", "MTH10427", "MTH10428", "MTH10429", "MTH10434",
                    "MTH10435", "MTH10520", "MTH10560", "MTH10561", "MTH10562", "MTH10563", "MTH10104", "MTH10132", "MTH10133", "MTH10001",
                    "MTH10134", "MTH10102", "MTH10002", "MTH10135", "MTH10123", "MTH10136", "MTH10137", "MTH10138", "MTH10126", "MTH10139",
                    "MTH10140", "MTH10112", "MTH10214", "MTH10202", "MTH10203", "MTH10209", "MTH10204", "MTH10215", "MTH10216", "MTH10217",
                    "MTH10219", "MTH10220", "MTH10221", "MTH10446", "MTH10447", "MTH10615", "MTH10450", "MTH10543", "MTH10616", "MTH10553",
                    "MTH10538", "MTH10539", "MTH10540", "MTH10541", "MTH10544", "MTH10545", "MTH10614", "MTH10549", "MTH10627"
                ]
            }
        }
    },
    "MAJOR_QUANTITATIVE_FINANCE": {
        "name": "Chuyên ngành Tài chính định lượng",
        "total_credits_required": 27,
        "breakdown": {
            "MANDATORY": {
                "credits": 16,
                "courses": [
                    "MTH10214",
                    "MTH10202",
                    "MTH10203",
                    "MTH10209"
                ]
            },
            "ELECTIVE": {
                "credits": 11,
                "courses": [
                    "MTH10407", "MTH10318", "MTH10353", "MTH10605", "MTH10358", "MTH10325", "MTH10608", "MTH10322", "MTH10323", "MTH10332",
                    "MTH10336", "MTH10344", "MTH10354", "MTH10519", "MTH10607", "MTH10623", "MTH10359", "MTH10317", "MTH10314", "MTH10315",
                    "MTH10324", "MTH10319", "MTH10321", "MTH10347", "MTH10348", "MTH10355", "MTH10308", "MTH10360", "MTH10311", "MTH10313",
                    "MTH10310", "MTH10309", "MTH10327", "MTH10331", "MTH10333", "MTH10335", "MTH10337", "MTH10341", "MTH10342", "MTH10345",
                    "MTH10334", "MTH10312", "MTH10405", "MTH10413", "MTH10414", "MTH10421", "MTH10426", "MTH10619", "MTH10412", "MTH10419",
                    "MTH10420", "MTH10422", "MTH10418", "MTH10492", "MTH10596", "MTH10497", "MTH10498", "MTH10503", "MTH10505", "MTH10507",
                    "MTH10601", "MTH10525", "MTH10603", "MTH10443", "MTH10436", "MTH10417", "MTH10461", "MTH10409", "MTH10480", "MTH10478",
                    "MTH10439", "MTH10473", "MTH10604", "MTH10444", "MTH10438", "MTH10555", "MTH10556", "MTH10423", "MTH10424", "MTH10485",
                    "MTH10509", "MTH10510", "MTH10511", "MTH10512", "MTH10513", "MTH10514", "MTH10515", "MTH10517", "MTH10518", "MTH10609",
                    "MTH10621", "MTH10557", "MTH10554", "MTH10558", "MTH10559", "MTH10433", "MTH10427", "MTH10428", "MTH10429", "MTH10434",
                    "MTH10435", "MTH10520", "MTH10560", "MTH10561", "MTH10562", "MTH10563", "MTH10104", "MTH10132", "MTH10133", "MTH10001",
                    "MTH10134", "MTH10102", "MTH10002", "MTH10135", "MTH10123", "MTH10136", "MTH10137", "MTH10138", "MTH10126", "MTH10139",
                    "MTH10140", "MTH10112", "MTH10214", "MTH10202", "MTH10203", "MTH10209", "MTH10204", "MTH10215", "MTH10216", "MTH10217",
                    "MTH10219", "MTH10220", "MTH10221", "MTH10446", "MTH10447", "MTH10615", "MTH10450", "MTH10543", "MTH10616", "MTH10553",
                    "MTH10538", "MTH10539", "MTH10540", "MTH10541", "MTH10544", "MTH10545", "MTH10614", "MTH10549", "MTH10627"
                ]
            }
        }
    },
    "MAJOR_OPTIMIZATION": {
        "name": "Chuyên ngành Tối ưu",
        "total_credits_required": 27,
        "breakdown": {
            "MANDATORY": {
                "credits": 15,
                "courses": [
                    "MTH10446",
                    "MTH10447",
                    "MTH10615",
                    "MTH10450",
                    "MTH10543"
                ]
            },
            "ELECTIVE": {
                "credits": 12,
                "courses": [
                    "MTH10407", "MTH10318", "MTH10353", "MTH10605", "MTH10358", "MTH10325", "MTH10608", "MTH10322", "MTH10323", "MTH10332",
                    "MTH10336", "MTH10344", "MTH10354", "MTH10519", "MTH10607", "MTH10623", "MTH10359", "MTH10317", "MTH10314", "MTH10315",
                    "MTH10324", "MTH10319", "MTH10321", "MTH10347", "MTH10348", "MTH10355", "MTH10308", "MTH10360", "MTH10311", "MTH10313",
                    "MTH10310", "MTH10309", "MTH10327", "MTH10331", "MTH10333", "MTH10335", "MTH10337", "MTH10341", "MTH10342", "MTH10345",
                    "MTH10334", "MTH10312", "MTH10405", "MTH10413", "MTH10414", "MTH10421", "MTH10426", "MTH10619", "MTH10412", "MTH10419",
                    "MTH10420", "MTH10422", "MTH10418", "MTH10492", "MTH10596", "MTH10497", "MTH10498", "MTH10503", "MTH10505", "MTH10507",
                    "MTH10601", "MTH10525", "MTH10603", "MTH10443", "MTH10436", "MTH10417", "MTH10461", "MTH10409", "MTH10480", "MTH10478",
                    "MTH10439", "MTH10473", "MTH10604", "MTH10444", "MTH10438", "MTH10555", "MTH10556", "MTH10423", "MTH10424", "MTH10485",
                    "MTH10509", "MTH10510", "MTH10511", "MTH10512", "MTH10513", "MTH10514", "MTH10515", "MTH10517", "MTH10518", "MTH10609",
                    "MTH10621", "MTH10557", "MTH10554", "MTH10558", "MTH10559", "MTH10433", "MTH10427", "MTH10428", "MTH10429", "MTH10434",
                    "MTH10435", "MTH10520", "MTH10560", "MTH10561", "MTH10562", "MTH10563", "MTH10104", "MTH10132", "MTH10133", "MTH10001",
                    "MTH10134", "MTH10102", "MTH10002", "MTH10135", "MTH10123", "MTH10136", "MTH10137", "MTH10138", "MTH10126", "MTH10139",
                    "MTH10140", "MTH10112", "MTH10214", "MTH10202", "MTH10203", "MTH10209", "MTH10204", "MTH10215", "MTH10216", "MTH10217",
                    "MTH10219", "MTH10220", "MTH10221", "MTH10446", "MTH10447", "MTH10615", "MTH10450", "MTH10543", "MTH10616", "MTH10553",
                    "MTH10538", "MTH10539", "MTH10540", "MTH10541", "MTH10544", "MTH10545", "MTH10614", "MTH10549", "MTH10627"
                ]
            }
        }
    },
    "GRADUATION": {
        "name": "Tốt nghiệp",
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
                "type": "PROJECT",
                "total_credits_required": 10,
                "note": "Học thêm 4 tín chỉ tự chọn trong phụ lục 1 để đủ 10 tín chỉ",
                "breakdown": {
                    "MANDATORY": {
                        "credits": 6,
                        "courses": [
                            "MTH10597"
                        ]
                    },
                    "ELECTIVE": {
                        "credits": 4,
                        "courses": [
                            "MTH10407", "MTH10318", "MTH10353", "MTH10605", "MTH10358", "MTH10325", "MTH10608", "MTH10322", "MTH10323", "MTH10332",
                            "MTH10336", "MTH10344", "MTH10354", "MTH10519", "MTH10607", "MTH10623", "MTH10359", "MTH10317", "MTH10314", "MTH10315",
                            "MTH10324", "MTH10319", "MTH10321", "MTH10347", "MTH10348", "MTH10355", "MTH10308", "MTH10360", "MTH10311", "MTH10313",
                            "MTH10310", "MTH10309", "MTH10327", "MTH10331", "MTH10333", "MTH10335", "MTH10337", "MTH10341", "MTH10342", "MTH10345",
                            "MTH10334", "MTH10312", "MTH10405", "MTH10413", "MTH10414", "MTH10421", "MTH10426", "MTH10619", "MTH10412", "MTH10419",
                            "MTH10420", "MTH10422", "MTH10418", "MTH10492", "MTH10596", "MTH10497", "MTH10498", "MTH10503", "MTH10505", "MTH10507",
                            "MTH10601", "MTH10525", "MTH10603", "MTH10443", "MTH10436", "MTH10417", "MTH10461", "MTH10409", "MTH10480", "MTH10478",
                            "MTH10439", "MTH10473", "MTH10604", "MTH10444", "MTH10438", "MTH10555", "MTH10556", "MTH10423", "MTH10424", "MTH10485",
                            "MTH10509", "MTH10510", "MTH10511", "MTH10512", "MTH10513", "MTH10514", "MTH10515", "MTH10517", "MTH10518", "MTH10609",
                            "MTH10621", "MTH10557", "MTH10554", "MTH10558", "MTH10559", "MTH10433", "MTH10427", "MTH10428", "MTH10429", "MTH10434",
                            "MTH10435", "MTH10520", "MTH10560", "MTH10561", "MTH10562", "MTH10563", "MTH10104", "MTH10132", "MTH10133", "MTH10001",
                            "MTH10134", "MTH10102", "MTH10002", "MTH10135", "MTH10123", "MTH10136", "MTH10137", "MTH10138", "MTH10126", "MTH10139",
                            "MTH10140", "MTH10112", "MTH10214", "MTH10202", "MTH10203", "MTH10209", "MTH10204", "MTH10215", "MTH10216", "MTH10217",
                            "MTH10219", "MTH10220", "MTH10221", "MTH10446", "MTH10447", "MTH10615", "MTH10450", "MTH10543", "MTH10616", "MTH10553",
                            "MTH10538", "MTH10539", "MTH10540", "MTH10541", "MTH10544", "MTH10545", "MTH10614", "MTH10549", "MTH10627"
                        ]
                    },
                }
            },
            {
                "type": "INTERNSHIP",
                "total_credits_required": 10,
                "note": "Chỉ dành cho chuyên ngành Giáo dục toán học, đăng ký thực tập và học thêm 6 tín chỉ tự chọn",
                "breakdown": {
                    "MANDATORY": {
                        "credits": 6,
                        "courses": [
                            "MTH10112"
                        ]
                    },
                    "ELECTIVE": {
                        "credits": 4,
                        "courses": [
                            "MTH10407", "MTH10318", "MTH10353", "MTH10605", "MTH10358", "MTH10325", "MTH10608", "MTH10322", "MTH10323", "MTH10332",
                            "MTH10336", "MTH10344", "MTH10354", "MTH10519", "MTH10607", "MTH10623", "MTH10359", "MTH10317", "MTH10314", "MTH10315",
                            "MTH10324", "MTH10319", "MTH10321", "MTH10347", "MTH10348", "MTH10355", "MTH10308", "MTH10360", "MTH10311", "MTH10313",
                            "MTH10310", "MTH10309", "MTH10327", "MTH10331", "MTH10333", "MTH10335", "MTH10337", "MTH10341", "MTH10342", "MTH10345",
                            "MTH10334", "MTH10312", "MTH10405", "MTH10413", "MTH10414", "MTH10421", "MTH10426", "MTH10619", "MTH10412", "MTH10419",
                            "MTH10420", "MTH10422", "MTH10418", "MTH10492", "MTH10596", "MTH10497", "MTH10498", "MTH10503", "MTH10505", "MTH10507",
                            "MTH10601", "MTH10525", "MTH10603", "MTH10443", "MTH10436", "MTH10417", "MTH10461", "MTH10409", "MTH10480", "MTH10478",
                            "MTH10439", "MTH10473", "MTH10604", "MTH10444", "MTH10438", "MTH10555", "MTH10556", "MTH10423", "MTH10424", "MTH10485",
                            "MTH10509", "MTH10510", "MTH10511", "MTH10512", "MTH10513", "MTH10514", "MTH10515", "MTH10517", "MTH10518", "MTH10609",
                            "MTH10621", "MTH10557", "MTH10554", "MTH10558", "MTH10559", "MTH10433", "MTH10427", "MTH10428", "MTH10429", "MTH10434",
                            "MTH10435", "MTH10520", "MTH10560", "MTH10561", "MTH10562", "MTH10563", "MTH10104", "MTH10132", "MTH10133", "MTH10001",
                            "MTH10134", "MTH10102", "MTH10002", "MTH10135", "MTH10123", "MTH10136", "MTH10137", "MTH10138", "MTH10126", "MTH10139",
                            "MTH10140", "MTH10112", "MTH10214", "MTH10202", "MTH10203", "MTH10209", "MTH10204", "MTH10215", "MTH10216", "MTH10217",
                            "MTH10219", "MTH10220", "MTH10221", "MTH10446", "MTH10447", "MTH10615", "MTH10450", "MTH10543", "MTH10616", "MTH10553",
                            "MTH10538", "MTH10539", "MTH10540", "MTH10541", "MTH10544", "MTH10545", "MTH10614", "MTH10549", "MTH10627"
                        ]
                    },
                }
            }
        ]
    }
};