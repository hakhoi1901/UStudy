export const categories = {
  "GENERAL_EDUCATION": {
    "name": "Giáo dục đại cương",
    "total_credits_required": 50,
    "note": "50 tín chỉ không kể Giáo dục thể chất, Giáo dục quốc phòng - An ninh, Ngoại ngữ và Tin học cơ sở.",
    "breakdown": {
      "GENERAL_POLITICAL_LAW": {
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
      "GENERAL_SOCIAL_ECONOMICS": {
        "name": "Khoa học xã hội - Kinh tế - Kỹ năng",
        "credits_required": 2,
        "mandatory": false,
        "note": "Chọn 1 trong 3 học phần, tích lũy 2 tín chỉ.",
        "courses": [
          "BAA00005",
          "BAA00006",
          "BAA00007"
        ]
      },
      "GENERAL_MATH_SCIENCE": {
        "name": "Toán - Khoa học tự nhiên - Công nghệ - Môi trường",
        "credits": 34,
        "breakdown": {
          "MANDATORY": {
            "name": "Học phần bắt buộc",
            "credits": 32,
            "mandatory": true,
            "courses": [
              "MTH00001",
              "MTH00002",
              "MTH00040",
              "CHE00001",
              "CHE00002",
              "CHE00081",
              "PHY00001",
              "PHY00002",
              "PHY00081",
              "CHE00010",
              "BIO00001",
              "ENV00001"
            ]
          },
          "ELECTIVE": {
            "name": "Học phần tự chọn",
            "credits_required": 2,
            "mandatory": false,
            "note": "Chọn 2 tín chỉ trong các học phần này.",
            "courses": [
              "BIO00081",
              "BIO00002",
              "BIO00082",
              "CHE00012",
              "CHE00011"
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
    "note": "Không tính vào điểm trung bình; tính vào số tín chỉ tích lũy; không tính trong 134 tín chỉ của khối lượng toàn khóa.",
    "courses": [
      "CSC00003"
    ]
  },
  "GENERAL_ENGLISH": {
    "name": "Ngoại ngữ",
    "mandatory": false,
    "note": "Không tính vào điểm trung bình và tín chỉ tích lũy. Sinh viên đạt chuẩn ngoại ngữ đầu ra theo quy định hiện hành thì không đăng ký học các học phần Anh văn. course_type được đặt TC theo quy tắc tương thích UStudy của Project cho khối ngoại ngữ được miễn.",
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
    "note": "Không tính vào điểm trung bình; tính vào số tín chỉ tích lũy; không tính trong 134 tín chỉ của khối lượng toàn khóa.",
    "courses": [
      "BAA00021",
      "BAA00022"
    ]
  },
  "GENERAL_DEFENSE": {
    "name": "Giáo dục quốc phòng - An ninh",
    "credits": 4,
    "mandatory": true,
    "note": "Không tính vào điểm trung bình; tính vào số tín chỉ tích lũy; không tính trong 134 tín chỉ của khối lượng toàn khóa.",
    "courses": [
      "BAA00030"
    ]
  },
  "FOUNDATION": {
    "name": "Kiến thức cơ sở ngành",
    "total_credits_required": 51,
    "mandatory": true,
    "courses": [
      "CHE10004",
      "CHE10009",
      "CHE10010",
      "CHE10017",
      "CHE10018",
      "CHE10002",
      "CHE10003",
      "CHE10011",
      "CHE10012",
      "CHE10007",
      "CHE10008",
      "CHE10015",
      "CHE10016",
      "CHE10029",
      "CHE10030",
      "CHE10006",
      "CHE10013",
      "CHE10014",
      "CHE10026",
      "CHE10027"
    ]
  },
  "MAJOR": {
    "name": "Kiến thức chuyên ngành",
    "total_credits_required": 23,
    "breakdown": {
      "MAJOR_ORGANIC_CHEMISTRY": {
        "name": "Chuyên ngành Hóa hữu cơ",
        "total_credits_required": 23,
        "breakdown": {
          "MANDATORY": {
            "name": "Học phần bắt buộc theo định hướng",
            "credits": 14,
            "options": [
              {
                "type": "RESEARCH_ORIENTATION",
                "name": "Định hướng nghiên cứu",
                "credits": 14,
                "mandatory": true,
                "courses": [
                  "CHE10101",
                  "CHE10102",
                  "CHE10103",
                  "CHE10105",
                  "CHE10106",
                  "CHE10104",
                  "CHE10107"
                ]
              },
              {
                "type": "APPLICATION_ORIENTATION",
                "name": "Định hướng ứng dụng",
                "credits": 14,
                "note": "12 tín chỉ cố định: CHE10102, CHE10105, CHE10106, CHE10104, CHE10107, CHE10022. Chọn 1 trong 3 học phần (2 tín chỉ): CHE10019, CHE10020, CHE10021.",
                "courses": [
                  "CHE10102",
                  "CHE10105",
                  "CHE10106",
                  "CHE10104",
                  "CHE10107",
                  "CHE10022",
                  "CHE10019",
                  "CHE10020",
                  "CHE10021"
                ]
              }
            ]
          },
          "ELECTIVE": {
            "name": "Học phần tự chọn chuyên ngành",
            "credits_required": 9,
            "mandatory": false,
            "note": "Tích lũy đủ 9 tín chỉ từ danh sách học phần tự chọn Phụ lục 1 hoặc các học phần bắt buộc khác của giai đoạn chuyên ngành.",
            "courses": [
              "CHE10023",
              "CHE10121",
              "CHE10122",
              "CHE10123",
              "CHE10124",
              "CHE10126",
              "CHE10131",
              "CHE10132",
              "CHE10133",
              "CHE10220",
              "CHE10222",
              "CHE10223",
              "CHE10226",
              "CHE10227",
              "CHE10228",
              "CHE10320",
              "CHE10321",
              "CHE10322",
              "CHE10323",
              "CHE10324",
              "CHE10325",
              "CHE10326",
              "CHE10327",
              "CHE10328",
              "CHE10330",
              "CHE10420",
              "CHE10421",
              "CHE10422",
              "CHE10423",
              "CHE10425",
              "CHE10426",
              "CHE10427",
              "CHE10428",
              "CHE10520",
              "CHE10521",
              "CHE10522",
              "CHE10523",
              "CHE10524",
              "CHE10525",
              "CHE10526",
              "CHE10527",
              "CHE10620",
              "CHE10621",
              "CHE10622",
              "CHE10624",
              "CHE10625",
              "CHE10627",
              "CHE10630",
              "CHE10022",
              "CHE10101",
              "CHE10102",
              "CHE10103",
              "CHE10105",
              "CHE10106",
              "CHE10104",
              "CHE10107",
              "CHE10201",
              "CHE10202",
              "CHE10203",
              "CHE10204",
              "CHE10205",
              "CHE10206",
              "CHE10207",
              "CHE10301",
              "CHE10302",
              "CHE10303",
              "CHE10304",
              "CHE10305",
              "CHE10306",
              "CHE10307",
              "CHE10401",
              "CHE10402",
              "CHE10405",
              "CHE10403",
              "CHE10408",
              "CHE10404",
              "CHE10407",
              "CHE10501",
              "CHE10502",
              "CHE10505",
              "CHE10503",
              "CHE10504",
              "CHE10506",
              "CHE10507",
              "CHE10601",
              "CHE10602",
              "CHE10603",
              "CHE10608",
              "CHE10606",
              "CHE10607"
            ]
          }
        }
      },
      "MAJOR_PHYSICAL_CHEMISTRY": {
        "name": "Chuyên ngành Hóa lý",
        "total_credits_required": 23,
        "breakdown": {
          "MANDATORY": {
            "name": "Học phần bắt buộc theo định hướng",
            "credits": 14,
            "options": [
              {
                "type": "RESEARCH_ORIENTATION",
                "name": "Định hướng nghiên cứu",
                "credits": 14,
                "mandatory": true,
                "courses": [
                  "CHE10201",
                  "CHE10202",
                  "CHE10203",
                  "CHE10204",
                  "CHE10205",
                  "CHE10206",
                  "CHE10207"
                ]
              },
              {
                "type": "APPLICATION_ORIENTATION",
                "name": "Định hướng ứng dụng",
                "credits": 14,
                "note": "12 tín chỉ cố định: CHE10201, CHE10202, CHE10203, CHE10206, CHE10207, CHE10022. Chọn 1 trong 3 học phần (2 tín chỉ): CHE10019, CHE10020, CHE10021.",
                "courses": [
                  "CHE10201",
                  "CHE10202",
                  "CHE10203",
                  "CHE10206",
                  "CHE10207",
                  "CHE10022",
                  "CHE10019",
                  "CHE10020",
                  "CHE10021"
                ]
              }
            ]
          },
          "ELECTIVE": {
            "name": "Học phần tự chọn chuyên ngành",
            "credits_required": 9,
            "mandatory": false,
            "note": "Tích lũy đủ 9 tín chỉ từ danh sách học phần tự chọn Phụ lục 1 hoặc các học phần bắt buộc khác của giai đoạn chuyên ngành.",
            "courses": [
              "CHE10023",
              "CHE10121",
              "CHE10122",
              "CHE10123",
              "CHE10124",
              "CHE10126",
              "CHE10131",
              "CHE10132",
              "CHE10133",
              "CHE10220",
              "CHE10222",
              "CHE10223",
              "CHE10226",
              "CHE10227",
              "CHE10228",
              "CHE10320",
              "CHE10321",
              "CHE10322",
              "CHE10323",
              "CHE10324",
              "CHE10325",
              "CHE10326",
              "CHE10327",
              "CHE10328",
              "CHE10330",
              "CHE10420",
              "CHE10421",
              "CHE10422",
              "CHE10423",
              "CHE10425",
              "CHE10426",
              "CHE10427",
              "CHE10428",
              "CHE10520",
              "CHE10521",
              "CHE10522",
              "CHE10523",
              "CHE10524",
              "CHE10525",
              "CHE10526",
              "CHE10527",
              "CHE10620",
              "CHE10621",
              "CHE10622",
              "CHE10624",
              "CHE10625",
              "CHE10627",
              "CHE10630",
              "CHE10022",
              "CHE10101",
              "CHE10102",
              "CHE10103",
              "CHE10105",
              "CHE10106",
              "CHE10104",
              "CHE10107",
              "CHE10201",
              "CHE10202",
              "CHE10203",
              "CHE10204",
              "CHE10205",
              "CHE10206",
              "CHE10207",
              "CHE10301",
              "CHE10302",
              "CHE10303",
              "CHE10304",
              "CHE10305",
              "CHE10306",
              "CHE10307",
              "CHE10401",
              "CHE10402",
              "CHE10405",
              "CHE10403",
              "CHE10408",
              "CHE10404",
              "CHE10407",
              "CHE10501",
              "CHE10502",
              "CHE10505",
              "CHE10503",
              "CHE10504",
              "CHE10506",
              "CHE10507",
              "CHE10601",
              "CHE10602",
              "CHE10603",
              "CHE10608",
              "CHE10606",
              "CHE10607"
            ]
          }
        }
      },
      "MAJOR_ANALYTICAL_CHEMISTRY": {
        "name": "Chuyên ngành Hóa phân tích",
        "total_credits_required": 23,
        "breakdown": {
          "MANDATORY": {
            "name": "Học phần bắt buộc theo định hướng",
            "credits": 14,
            "options": [
              {
                "type": "RESEARCH_ORIENTATION",
                "name": "Định hướng nghiên cứu",
                "credits": 14,
                "mandatory": true,
                "courses": [
                  "CHE10301",
                  "CHE10302",
                  "CHE10303",
                  "CHE10304",
                  "CHE10305",
                  "CHE10306",
                  "CHE10307"
                ]
              },
              {
                "type": "APPLICATION_ORIENTATION",
                "name": "Định hướng ứng dụng",
                "credits": 14,
                "note": "12 tín chỉ cố định: CHE10301, CHE10302, CHE10303, CHE10304, CHE10307, CHE10022. Chọn 1 trong 3 học phần (2 tín chỉ): CHE10019, CHE10020, CHE10021.",
                "courses": [
                  "CHE10301",
                  "CHE10302",
                  "CHE10303",
                  "CHE10304",
                  "CHE10307",
                  "CHE10022",
                  "CHE10019",
                  "CHE10020",
                  "CHE10021"
                ]
              }
            ]
          },
          "ELECTIVE": {
            "name": "Học phần tự chọn chuyên ngành",
            "credits_required": 9,
            "mandatory": false,
            "note": "Tích lũy đủ 9 tín chỉ từ danh sách học phần tự chọn Phụ lục 1 hoặc các học phần bắt buộc khác của giai đoạn chuyên ngành.",
            "courses": [
              "CHE10023",
              "CHE10121",
              "CHE10122",
              "CHE10123",
              "CHE10124",
              "CHE10126",
              "CHE10131",
              "CHE10132",
              "CHE10133",
              "CHE10220",
              "CHE10222",
              "CHE10223",
              "CHE10226",
              "CHE10227",
              "CHE10228",
              "CHE10320",
              "CHE10321",
              "CHE10322",
              "CHE10323",
              "CHE10324",
              "CHE10325",
              "CHE10326",
              "CHE10327",
              "CHE10328",
              "CHE10330",
              "CHE10420",
              "CHE10421",
              "CHE10422",
              "CHE10423",
              "CHE10425",
              "CHE10426",
              "CHE10427",
              "CHE10428",
              "CHE10520",
              "CHE10521",
              "CHE10522",
              "CHE10523",
              "CHE10524",
              "CHE10525",
              "CHE10526",
              "CHE10527",
              "CHE10620",
              "CHE10621",
              "CHE10622",
              "CHE10624",
              "CHE10625",
              "CHE10627",
              "CHE10630",
              "CHE10022",
              "CHE10101",
              "CHE10102",
              "CHE10103",
              "CHE10105",
              "CHE10106",
              "CHE10104",
              "CHE10107",
              "CHE10201",
              "CHE10202",
              "CHE10203",
              "CHE10204",
              "CHE10205",
              "CHE10206",
              "CHE10207",
              "CHE10301",
              "CHE10302",
              "CHE10303",
              "CHE10304",
              "CHE10305",
              "CHE10306",
              "CHE10307",
              "CHE10401",
              "CHE10402",
              "CHE10405",
              "CHE10403",
              "CHE10408",
              "CHE10404",
              "CHE10407",
              "CHE10501",
              "CHE10502",
              "CHE10505",
              "CHE10503",
              "CHE10504",
              "CHE10506",
              "CHE10507",
              "CHE10601",
              "CHE10602",
              "CHE10603",
              "CHE10608",
              "CHE10606",
              "CHE10607"
            ]
          }
        }
      },
      "MAJOR_INORGANIC_CHEMISTRY": {
        "name": "Chuyên ngành Hóa vô cơ và ứng dụng",
        "total_credits_required": 23,
        "breakdown": {
          "MANDATORY": {
            "name": "Học phần bắt buộc theo định hướng",
            "credits": 14,
            "options": [
              {
                "type": "RESEARCH_ORIENTATION",
                "name": "Định hướng nghiên cứu",
                "credits": 14,
                "mandatory": true,
                "courses": [
                  "CHE10401",
                  "CHE10402",
                  "CHE10405",
                  "CHE10403",
                  "CHE10408",
                  "CHE10404",
                  "CHE10407"
                ]
              },
              {
                "type": "APPLICATION_ORIENTATION",
                "name": "Định hướng ứng dụng",
                "credits": 14,
                "note": "12 tín chỉ cố định: CHE10405, CHE10403, CHE10408, CHE10404, CHE10407, CHE10022. Chọn 1 trong 3 học phần (2 tín chỉ): CHE10019, CHE10020, CHE10021.",
                "courses": [
                  "CHE10405",
                  "CHE10403",
                  "CHE10408",
                  "CHE10404",
                  "CHE10407",
                  "CHE10022",
                  "CHE10019",
                  "CHE10020",
                  "CHE10021"
                ]
              }
            ]
          },
          "ELECTIVE": {
            "name": "Học phần tự chọn chuyên ngành",
            "credits_required": 9,
            "mandatory": false,
            "note": "Tích lũy đủ 9 tín chỉ từ danh sách học phần tự chọn Phụ lục 1 hoặc các học phần bắt buộc khác của giai đoạn chuyên ngành.",
            "courses": [
              "CHE10023",
              "CHE10121",
              "CHE10122",
              "CHE10123",
              "CHE10124",
              "CHE10126",
              "CHE10131",
              "CHE10132",
              "CHE10133",
              "CHE10220",
              "CHE10222",
              "CHE10223",
              "CHE10226",
              "CHE10227",
              "CHE10228",
              "CHE10320",
              "CHE10321",
              "CHE10322",
              "CHE10323",
              "CHE10324",
              "CHE10325",
              "CHE10326",
              "CHE10327",
              "CHE10328",
              "CHE10330",
              "CHE10420",
              "CHE10421",
              "CHE10422",
              "CHE10423",
              "CHE10425",
              "CHE10426",
              "CHE10427",
              "CHE10428",
              "CHE10520",
              "CHE10521",
              "CHE10522",
              "CHE10523",
              "CHE10524",
              "CHE10525",
              "CHE10526",
              "CHE10527",
              "CHE10620",
              "CHE10621",
              "CHE10622",
              "CHE10624",
              "CHE10625",
              "CHE10627",
              "CHE10630",
              "CHE10022",
              "CHE10101",
              "CHE10102",
              "CHE10103",
              "CHE10105",
              "CHE10106",
              "CHE10104",
              "CHE10107",
              "CHE10201",
              "CHE10202",
              "CHE10203",
              "CHE10204",
              "CHE10205",
              "CHE10206",
              "CHE10207",
              "CHE10301",
              "CHE10302",
              "CHE10303",
              "CHE10304",
              "CHE10305",
              "CHE10306",
              "CHE10307",
              "CHE10401",
              "CHE10402",
              "CHE10405",
              "CHE10403",
              "CHE10408",
              "CHE10404",
              "CHE10407",
              "CHE10501",
              "CHE10502",
              "CHE10505",
              "CHE10503",
              "CHE10504",
              "CHE10506",
              "CHE10507",
              "CHE10601",
              "CHE10602",
              "CHE10603",
              "CHE10608",
              "CHE10606",
              "CHE10607"
            ]
          }
        }
      },
      "MAJOR_POLYMER_CHEMISTRY": {
        "name": "Chuyên ngành Hóa polyme",
        "total_credits_required": 23,
        "breakdown": {
          "MANDATORY": {
            "name": "Học phần bắt buộc theo định hướng",
            "credits": 14,
            "options": [
              {
                "type": "RESEARCH_ORIENTATION",
                "name": "Định hướng nghiên cứu",
                "credits": 14,
                "mandatory": true,
                "courses": [
                  "CHE10501",
                  "CHE10502",
                  "CHE10505",
                  "CHE10503",
                  "CHE10504",
                  "CHE10506",
                  "CHE10507"
                ]
              },
              {
                "type": "APPLICATION_ORIENTATION",
                "name": "Định hướng ứng dụng",
                "credits": 14,
                "note": "12 tín chỉ cố định: CHE10501, CHE10502, CHE10505, CHE10504, CHE10507, CHE10022. Chọn 1 trong 3 học phần (2 tín chỉ): CHE10019, CHE10020, CHE10021.",
                "courses": [
                  "CHE10501",
                  "CHE10502",
                  "CHE10505",
                  "CHE10504",
                  "CHE10507",
                  "CHE10022",
                  "CHE10019",
                  "CHE10020",
                  "CHE10021"
                ]
              }
            ]
          },
          "ELECTIVE": {
            "name": "Học phần tự chọn chuyên ngành",
            "credits_required": 9,
            "mandatory": false,
            "note": "Tích lũy đủ 9 tín chỉ từ danh sách học phần tự chọn Phụ lục 1 hoặc các học phần bắt buộc khác của giai đoạn chuyên ngành.",
            "courses": [
              "CHE10023",
              "CHE10121",
              "CHE10122",
              "CHE10123",
              "CHE10124",
              "CHE10126",
              "CHE10131",
              "CHE10132",
              "CHE10133",
              "CHE10220",
              "CHE10222",
              "CHE10223",
              "CHE10226",
              "CHE10227",
              "CHE10228",
              "CHE10320",
              "CHE10321",
              "CHE10322",
              "CHE10323",
              "CHE10324",
              "CHE10325",
              "CHE10326",
              "CHE10327",
              "CHE10328",
              "CHE10330",
              "CHE10420",
              "CHE10421",
              "CHE10422",
              "CHE10423",
              "CHE10425",
              "CHE10426",
              "CHE10427",
              "CHE10428",
              "CHE10520",
              "CHE10521",
              "CHE10522",
              "CHE10523",
              "CHE10524",
              "CHE10525",
              "CHE10526",
              "CHE10527",
              "CHE10620",
              "CHE10621",
              "CHE10622",
              "CHE10624",
              "CHE10625",
              "CHE10627",
              "CHE10630",
              "CHE10022",
              "CHE10101",
              "CHE10102",
              "CHE10103",
              "CHE10105",
              "CHE10106",
              "CHE10104",
              "CHE10107",
              "CHE10201",
              "CHE10202",
              "CHE10203",
              "CHE10204",
              "CHE10205",
              "CHE10206",
              "CHE10207",
              "CHE10301",
              "CHE10302",
              "CHE10303",
              "CHE10304",
              "CHE10305",
              "CHE10306",
              "CHE10307",
              "CHE10401",
              "CHE10402",
              "CHE10405",
              "CHE10403",
              "CHE10408",
              "CHE10404",
              "CHE10407",
              "CHE10501",
              "CHE10502",
              "CHE10505",
              "CHE10503",
              "CHE10504",
              "CHE10506",
              "CHE10507",
              "CHE10601",
              "CHE10602",
              "CHE10603",
              "CHE10608",
              "CHE10606",
              "CHE10607"
            ]
          }
        }
      },
      "MAJOR_PHARMACEUTICAL_CHEMISTRY": {
        "name": "Chuyên ngành Hóa dược",
        "total_credits_required": 23,
        "breakdown": {
          "MANDATORY": {
            "name": "Học phần bắt buộc theo định hướng",
            "credits": 14,
            "options": [
              {
                "type": "RESEARCH_ORIENTATION",
                "name": "Định hướng nghiên cứu",
                "credits": 14,
                "mandatory": true,
                "courses": [
                  "CHE10601",
                  "CHE10602",
                  "CHE10603",
                  "CHE10106",
                  "CHE10608",
                  "CHE10606",
                  "CHE10607"
                ]
              },
              {
                "type": "APPLICATION_ORIENTATION",
                "name": "Định hướng ứng dụng",
                "credits": 14,
                "note": "12 tín chỉ cố định: CHE10601, CHE10603, CHE10608, CHE10606, CHE10607, CHE10022. Chọn 1 trong 3 học phần (2 tín chỉ): CHE10019, CHE10020, CHE10021.",
                "courses": [
                  "CHE10601",
                  "CHE10603",
                  "CHE10608",
                  "CHE10606",
                  "CHE10607",
                  "CHE10022",
                  "CHE10019",
                  "CHE10020",
                  "CHE10021"
                ]
              }
            ]
          },
          "ELECTIVE": {
            "name": "Học phần tự chọn chuyên ngành",
            "credits_required": 9,
            "mandatory": false,
            "note": "Tích lũy đủ 9 tín chỉ từ danh sách học phần tự chọn Phụ lục 1 hoặc các học phần bắt buộc khác của giai đoạn chuyên ngành.",
            "courses": [
              "CHE10023",
              "CHE10121",
              "CHE10122",
              "CHE10123",
              "CHE10124",
              "CHE10126",
              "CHE10131",
              "CHE10132",
              "CHE10133",
              "CHE10220",
              "CHE10222",
              "CHE10223",
              "CHE10226",
              "CHE10227",
              "CHE10228",
              "CHE10320",
              "CHE10321",
              "CHE10322",
              "CHE10323",
              "CHE10324",
              "CHE10325",
              "CHE10326",
              "CHE10327",
              "CHE10328",
              "CHE10330",
              "CHE10420",
              "CHE10421",
              "CHE10422",
              "CHE10423",
              "CHE10425",
              "CHE10426",
              "CHE10427",
              "CHE10428",
              "CHE10520",
              "CHE10521",
              "CHE10522",
              "CHE10523",
              "CHE10524",
              "CHE10525",
              "CHE10526",
              "CHE10527",
              "CHE10620",
              "CHE10621",
              "CHE10622",
              "CHE10624",
              "CHE10625",
              "CHE10627",
              "CHE10630",
              "CHE10022",
              "CHE10101",
              "CHE10102",
              "CHE10103",
              "CHE10105",
              "CHE10106",
              "CHE10104",
              "CHE10107",
              "CHE10201",
              "CHE10202",
              "CHE10203",
              "CHE10204",
              "CHE10205",
              "CHE10206",
              "CHE10207",
              "CHE10301",
              "CHE10302",
              "CHE10303",
              "CHE10304",
              "CHE10305",
              "CHE10306",
              "CHE10307",
              "CHE10401",
              "CHE10402",
              "CHE10405",
              "CHE10403",
              "CHE10408",
              "CHE10404",
              "CHE10407",
              "CHE10501",
              "CHE10502",
              "CHE10505",
              "CHE10503",
              "CHE10504",
              "CHE10506",
              "CHE10507",
              "CHE10601",
              "CHE10602",
              "CHE10603",
              "CHE10608",
              "CHE10606",
              "CHE10607"
            ]
          }
        }
      },
      "MAJOR_EXPERIMENTAL_CHEMISTRY": {
        "name": "Chuyên ngành Hóa học thực nghiệm",
        "total_credits_required": 23,
        "breakdown": {
          "GROUP_A": {
            "name": "Nhóm học phần chuyên môn",
            "credits_required": 8,
            "mandatory": false,
            "note": "Tích lũy ít nhất 04 học phần (08 tín chỉ).",
            "courses": [
              "CHE10105",
              "CHE10106",
              "CHE10202",
              "CHE10203",
              "CHE10301",
              "CHE10303",
              "CHE10403",
              "CHE10408",
              "CHE10501",
              "CHE10502",
              "CHE10601",
              "CHE10608"
            ]
          },
          "GROUP_B": {
            "name": "Nhóm phương pháp nghiên cứu / seminar",
            "credits_required": 2,
            "mandatory": false,
            "note": "Tích lũy ít nhất 01 học phần (02 tín chỉ); CHE10785 có 3 tín chỉ.",
            "courses": [
              "CHE10785",
              "CHE10107",
              "CHE10207",
              "CHE10307",
              "CHE10407",
              "CHE10507",
              "CHE10607"
            ]
          },
          "GROUP_C": {
            "name": "Nhóm thực hành chuyên ngành",
            "credits_required": 2,
            "mandatory": false,
            "note": "Tích lũy ít nhất 01 học phần (02 tín chỉ).",
            "courses": [
              "CHE10104",
              "CHE10204",
              "CHE10205",
              "CHE10305",
              "CHE10306",
              "CHE10404",
              "CHE10504",
              "CHE10506",
              "CHE10606",
              "CHE10022"
            ]
          },
          "ELECTIVE": {
            "name": "Học phần tự chọn bổ sung",
            "credits_required": 11,
            "mandatory": false,
            "note": "Tích lũy ít nhất 11 tín chỉ trong danh sách học phần tự chọn Phụ lục 1 hoặc các học phần bắt buộc khác của giai đoạn chuyên ngành.",
            "courses": [
              "CHE10023",
              "CHE10121",
              "CHE10122",
              "CHE10123",
              "CHE10124",
              "CHE10126",
              "CHE10131",
              "CHE10132",
              "CHE10133",
              "CHE10220",
              "CHE10222",
              "CHE10223",
              "CHE10226",
              "CHE10227",
              "CHE10228",
              "CHE10320",
              "CHE10321",
              "CHE10322",
              "CHE10323",
              "CHE10324",
              "CHE10325",
              "CHE10326",
              "CHE10327",
              "CHE10328",
              "CHE10330",
              "CHE10420",
              "CHE10421",
              "CHE10422",
              "CHE10423",
              "CHE10425",
              "CHE10426",
              "CHE10427",
              "CHE10428",
              "CHE10520",
              "CHE10521",
              "CHE10522",
              "CHE10523",
              "CHE10524",
              "CHE10525",
              "CHE10526",
              "CHE10527",
              "CHE10620",
              "CHE10621",
              "CHE10622",
              "CHE10624",
              "CHE10625",
              "CHE10627",
              "CHE10630",
              "CHE10022",
              "CHE10101",
              "CHE10102",
              "CHE10103",
              "CHE10105",
              "CHE10106",
              "CHE10104",
              "CHE10107",
              "CHE10201",
              "CHE10202",
              "CHE10203",
              "CHE10204",
              "CHE10205",
              "CHE10206",
              "CHE10207",
              "CHE10301",
              "CHE10302",
              "CHE10303",
              "CHE10304",
              "CHE10305",
              "CHE10306",
              "CHE10307",
              "CHE10401",
              "CHE10402",
              "CHE10405",
              "CHE10403",
              "CHE10408",
              "CHE10404",
              "CHE10407",
              "CHE10501",
              "CHE10502",
              "CHE10505",
              "CHE10503",
              "CHE10504",
              "CHE10506",
              "CHE10507",
              "CHE10601",
              "CHE10602",
              "CHE10603",
              "CHE10608",
              "CHE10606",
              "CHE10607"
            ]
          }
        }
      }
    }
  },
  "ELECTIVE": {
    "name": "Danh mục học phần tự chọn - Phụ lục 1",
    "mandatory": false,
    "note": "Danh sách học phần tự chọn dùng chung cho các chuyên ngành; yêu cầu tín chỉ cụ thể được ghi tại từng nhánh chuyên ngành và phương án tốt nghiệp.",
    "courses": [
      "CHE10023",
      "CHE10121",
      "CHE10122",
      "CHE10123",
      "CHE10124",
      "CHE10126",
      "CHE10131",
      "CHE10132",
      "CHE10133",
      "CHE10220",
      "CHE10222",
      "CHE10223",
      "CHE10226",
      "CHE10227",
      "CHE10228",
      "CHE10320",
      "CHE10321",
      "CHE10322",
      "CHE10323",
      "CHE10324",
      "CHE10325",
      "CHE10326",
      "CHE10327",
      "CHE10328",
      "CHE10330",
      "CHE10420",
      "CHE10421",
      "CHE10422",
      "CHE10423",
      "CHE10425",
      "CHE10426",
      "CHE10427",
      "CHE10428",
      "CHE10520",
      "CHE10521",
      "CHE10522",
      "CHE10523",
      "CHE10524",
      "CHE10525",
      "CHE10526",
      "CHE10527",
      "CHE10620",
      "CHE10621",
      "CHE10622",
      "CHE10624",
      "CHE10625",
      "CHE10627",
      "CHE10630"
    ]
  },
  "GRADUATION": {
    "name": "Kiến thức tốt nghiệp",
    "total_credits_required": 10,
    "breakdown": {
      "MAJOR_ORGANIC_CHEMISTRY": {
        "name": "Chuyên ngành Hóa hữu cơ",
        "total_credits_required": 10,
        "options": [
          {
            "type": "THESIS",
            "name": "Phương án 1 - Khóa luận tốt nghiệp",
            "credits": 10,
            "courses": [
              "CHE10195"
            ]
          },
          {
            "type": "EXPERIMENTAL_PROJECT",
            "name": "Phương án 2 - Tiểu luận tốt nghiệp thực nghiệm",
            "credits": 10,
            "note": "Học phần tiểu luận 6 tín chỉ và tích lũy thêm 4 tín chỉ từ các học phần được phép chọn: CHE10023, CHE10121, CHE10122, CHE10123, CHE10124, CHE10126, CHE10131, CHE10132, CHE10133, CHE10220, CHE10222, CHE10223, CHE10226, CHE10227, CHE10228, CHE10320, CHE10321, CHE10322, CHE10323, CHE10324, CHE10325, CHE10326, CHE10327, CHE10328, CHE10330, CHE10420, CHE10421, CHE10422, CHE10423, CHE10425, CHE10426, CHE10427, CHE10428, CHE10520, CHE10521, CHE10522, CHE10523, CHE10524, CHE10525, CHE10526, CHE10527, CHE10620, CHE10621, CHE10622, CHE10624, CHE10625, CHE10627, CHE10630, CHE10022, CHE10101, CHE10102, CHE10103, CHE10105, CHE10106, CHE10104, CHE10107, CHE10201, CHE10202, CHE10203, CHE10204, CHE10205, CHE10206, CHE10207, CHE10301, CHE10302, CHE10303, CHE10304, CHE10305, CHE10306, CHE10307, CHE10401, CHE10402, CHE10405, CHE10403, CHE10408, CHE10404, CHE10407, CHE10501, CHE10502, CHE10505, CHE10503, CHE10504, CHE10506, CHE10507, CHE10601, CHE10602, CHE10603, CHE10608, CHE10606, CHE10607. Học phần đã dùng để đáp ứng phần bắt buộc của lộ trình không được tính lặp.",
            "courses": [
              "CHE10191"
            ]
          },
          {
            "type": "THEORETICAL_PROJECT",
            "name": "Phương án 3 - Tiểu luận tốt nghiệp lý thuyết",
            "credits": 10,
            "note": "Học phần tiểu luận 4 tín chỉ và tích lũy thêm 6 tín chỉ từ các học phần được phép chọn: CHE10023, CHE10121, CHE10122, CHE10123, CHE10124, CHE10126, CHE10131, CHE10132, CHE10133, CHE10220, CHE10222, CHE10223, CHE10226, CHE10227, CHE10228, CHE10320, CHE10321, CHE10322, CHE10323, CHE10324, CHE10325, CHE10326, CHE10327, CHE10328, CHE10330, CHE10420, CHE10421, CHE10422, CHE10423, CHE10425, CHE10426, CHE10427, CHE10428, CHE10520, CHE10521, CHE10522, CHE10523, CHE10524, CHE10525, CHE10526, CHE10527, CHE10620, CHE10621, CHE10622, CHE10624, CHE10625, CHE10627, CHE10630, CHE10022, CHE10101, CHE10102, CHE10103, CHE10105, CHE10106, CHE10104, CHE10107, CHE10201, CHE10202, CHE10203, CHE10204, CHE10205, CHE10206, CHE10207, CHE10301, CHE10302, CHE10303, CHE10304, CHE10305, CHE10306, CHE10307, CHE10401, CHE10402, CHE10405, CHE10403, CHE10408, CHE10404, CHE10407, CHE10501, CHE10502, CHE10505, CHE10503, CHE10504, CHE10506, CHE10507, CHE10601, CHE10602, CHE10603, CHE10608, CHE10606, CHE10607. Học phần đã dùng để đáp ứng phần bắt buộc của lộ trình không được tính lặp.",
            "courses": [
              "CHE10190"
            ]
          }
        ]
      },
      "MAJOR_PHYSICAL_CHEMISTRY": {
        "name": "Chuyên ngành Hóa lý",
        "total_credits_required": 10,
        "options": [
          {
            "type": "THESIS",
            "name": "Phương án 1 - Khóa luận tốt nghiệp",
            "credits": 10,
            "courses": [
              "CHE10295"
            ]
          },
          {
            "type": "EXPERIMENTAL_PROJECT",
            "name": "Phương án 2 - Tiểu luận tốt nghiệp thực nghiệm",
            "credits": 10,
            "note": "Học phần tiểu luận 6 tín chỉ và tích lũy thêm 4 tín chỉ từ các học phần được phép chọn: CHE10023, CHE10121, CHE10122, CHE10123, CHE10124, CHE10126, CHE10131, CHE10132, CHE10133, CHE10220, CHE10222, CHE10223, CHE10226, CHE10227, CHE10228, CHE10320, CHE10321, CHE10322, CHE10323, CHE10324, CHE10325, CHE10326, CHE10327, CHE10328, CHE10330, CHE10420, CHE10421, CHE10422, CHE10423, CHE10425, CHE10426, CHE10427, CHE10428, CHE10520, CHE10521, CHE10522, CHE10523, CHE10524, CHE10525, CHE10526, CHE10527, CHE10620, CHE10621, CHE10622, CHE10624, CHE10625, CHE10627, CHE10630, CHE10022, CHE10101, CHE10102, CHE10103, CHE10105, CHE10106, CHE10104, CHE10107, CHE10201, CHE10202, CHE10203, CHE10204, CHE10205, CHE10206, CHE10207, CHE10301, CHE10302, CHE10303, CHE10304, CHE10305, CHE10306, CHE10307, CHE10401, CHE10402, CHE10405, CHE10403, CHE10408, CHE10404, CHE10407, CHE10501, CHE10502, CHE10505, CHE10503, CHE10504, CHE10506, CHE10507, CHE10601, CHE10602, CHE10603, CHE10608, CHE10606, CHE10607. Học phần đã dùng để đáp ứng phần bắt buộc của lộ trình không được tính lặp.",
            "courses": [
              "CHE10291"
            ]
          },
          {
            "type": "THEORETICAL_PROJECT",
            "name": "Phương án 3 - Tiểu luận tốt nghiệp lý thuyết",
            "credits": 10,
            "note": "Học phần tiểu luận 4 tín chỉ và tích lũy thêm 6 tín chỉ từ các học phần được phép chọn: CHE10023, CHE10121, CHE10122, CHE10123, CHE10124, CHE10126, CHE10131, CHE10132, CHE10133, CHE10220, CHE10222, CHE10223, CHE10226, CHE10227, CHE10228, CHE10320, CHE10321, CHE10322, CHE10323, CHE10324, CHE10325, CHE10326, CHE10327, CHE10328, CHE10330, CHE10420, CHE10421, CHE10422, CHE10423, CHE10425, CHE10426, CHE10427, CHE10428, CHE10520, CHE10521, CHE10522, CHE10523, CHE10524, CHE10525, CHE10526, CHE10527, CHE10620, CHE10621, CHE10622, CHE10624, CHE10625, CHE10627, CHE10630, CHE10022, CHE10101, CHE10102, CHE10103, CHE10105, CHE10106, CHE10104, CHE10107, CHE10201, CHE10202, CHE10203, CHE10204, CHE10205, CHE10206, CHE10207, CHE10301, CHE10302, CHE10303, CHE10304, CHE10305, CHE10306, CHE10307, CHE10401, CHE10402, CHE10405, CHE10403, CHE10408, CHE10404, CHE10407, CHE10501, CHE10502, CHE10505, CHE10503, CHE10504, CHE10506, CHE10507, CHE10601, CHE10602, CHE10603, CHE10608, CHE10606, CHE10607. Học phần đã dùng để đáp ứng phần bắt buộc của lộ trình không được tính lặp.",
            "courses": [
              "CHE10290"
            ]
          }
        ]
      },
      "MAJOR_ANALYTICAL_CHEMISTRY": {
        "name": "Chuyên ngành Hóa phân tích",
        "total_credits_required": 10,
        "options": [
          {
            "type": "THESIS",
            "name": "Phương án 1 - Khóa luận tốt nghiệp",
            "credits": 10,
            "courses": [
              "CHE10395"
            ]
          },
          {
            "type": "EXPERIMENTAL_PROJECT",
            "name": "Phương án 2 - Tiểu luận tốt nghiệp thực nghiệm",
            "credits": 10,
            "note": "Học phần tiểu luận 6 tín chỉ và tích lũy thêm 4 tín chỉ từ các học phần được phép chọn: CHE10023, CHE10121, CHE10122, CHE10123, CHE10124, CHE10126, CHE10131, CHE10132, CHE10133, CHE10220, CHE10222, CHE10223, CHE10226, CHE10227, CHE10228, CHE10320, CHE10321, CHE10322, CHE10323, CHE10324, CHE10325, CHE10326, CHE10327, CHE10328, CHE10330, CHE10420, CHE10421, CHE10422, CHE10423, CHE10425, CHE10426, CHE10427, CHE10428, CHE10520, CHE10521, CHE10522, CHE10523, CHE10524, CHE10525, CHE10526, CHE10527, CHE10620, CHE10621, CHE10622, CHE10624, CHE10625, CHE10627, CHE10630, CHE10022, CHE10101, CHE10102, CHE10103, CHE10105, CHE10106, CHE10104, CHE10107, CHE10201, CHE10202, CHE10203, CHE10204, CHE10205, CHE10206, CHE10207, CHE10301, CHE10302, CHE10303, CHE10304, CHE10305, CHE10306, CHE10307, CHE10401, CHE10402, CHE10405, CHE10403, CHE10408, CHE10404, CHE10407, CHE10501, CHE10502, CHE10505, CHE10503, CHE10504, CHE10506, CHE10507, CHE10601, CHE10602, CHE10603, CHE10608, CHE10606, CHE10607. Học phần đã dùng để đáp ứng phần bắt buộc của lộ trình không được tính lặp.",
            "courses": [
              "CHE10391"
            ]
          },
          {
            "type": "THEORETICAL_PROJECT",
            "name": "Phương án 3 - Tiểu luận tốt nghiệp lý thuyết",
            "credits": 10,
            "note": "Học phần tiểu luận 4 tín chỉ và tích lũy thêm 6 tín chỉ từ các học phần được phép chọn: CHE10023, CHE10121, CHE10122, CHE10123, CHE10124, CHE10126, CHE10131, CHE10132, CHE10133, CHE10220, CHE10222, CHE10223, CHE10226, CHE10227, CHE10228, CHE10320, CHE10321, CHE10322, CHE10323, CHE10324, CHE10325, CHE10326, CHE10327, CHE10328, CHE10330, CHE10420, CHE10421, CHE10422, CHE10423, CHE10425, CHE10426, CHE10427, CHE10428, CHE10520, CHE10521, CHE10522, CHE10523, CHE10524, CHE10525, CHE10526, CHE10527, CHE10620, CHE10621, CHE10622, CHE10624, CHE10625, CHE10627, CHE10630, CHE10022, CHE10101, CHE10102, CHE10103, CHE10105, CHE10106, CHE10104, CHE10107, CHE10201, CHE10202, CHE10203, CHE10204, CHE10205, CHE10206, CHE10207, CHE10301, CHE10302, CHE10303, CHE10304, CHE10305, CHE10306, CHE10307, CHE10401, CHE10402, CHE10405, CHE10403, CHE10408, CHE10404, CHE10407, CHE10501, CHE10502, CHE10505, CHE10503, CHE10504, CHE10506, CHE10507, CHE10601, CHE10602, CHE10603, CHE10608, CHE10606, CHE10607. Học phần đã dùng để đáp ứng phần bắt buộc của lộ trình không được tính lặp.",
            "courses": [
              "CHE10390"
            ]
          }
        ]
      },
      "MAJOR_INORGANIC_CHEMISTRY": {
        "name": "Chuyên ngành Hóa vô cơ và ứng dụng",
        "total_credits_required": 10,
        "options": [
          {
            "type": "THESIS",
            "name": "Phương án 1 - Khóa luận tốt nghiệp",
            "credits": 10,
            "courses": [
              "CHE10495"
            ]
          },
          {
            "type": "EXPERIMENTAL_PROJECT",
            "name": "Phương án 2 - Tiểu luận tốt nghiệp thực nghiệm",
            "credits": 10,
            "note": "Học phần tiểu luận 6 tín chỉ và tích lũy thêm 4 tín chỉ từ các học phần được phép chọn: CHE10023, CHE10121, CHE10122, CHE10123, CHE10124, CHE10126, CHE10131, CHE10132, CHE10133, CHE10220, CHE10222, CHE10223, CHE10226, CHE10227, CHE10228, CHE10320, CHE10321, CHE10322, CHE10323, CHE10324, CHE10325, CHE10326, CHE10327, CHE10328, CHE10330, CHE10420, CHE10421, CHE10422, CHE10423, CHE10425, CHE10426, CHE10427, CHE10428, CHE10520, CHE10521, CHE10522, CHE10523, CHE10524, CHE10525, CHE10526, CHE10527, CHE10620, CHE10621, CHE10622, CHE10624, CHE10625, CHE10627, CHE10630, CHE10022, CHE10101, CHE10102, CHE10103, CHE10105, CHE10106, CHE10104, CHE10107, CHE10201, CHE10202, CHE10203, CHE10204, CHE10205, CHE10206, CHE10207, CHE10301, CHE10302, CHE10303, CHE10304, CHE10305, CHE10306, CHE10307, CHE10401, CHE10402, CHE10405, CHE10403, CHE10408, CHE10404, CHE10407, CHE10501, CHE10502, CHE10505, CHE10503, CHE10504, CHE10506, CHE10507, CHE10601, CHE10602, CHE10603, CHE10608, CHE10606, CHE10607. Học phần đã dùng để đáp ứng phần bắt buộc của lộ trình không được tính lặp.",
            "courses": [
              "CHE10491"
            ]
          },
          {
            "type": "THEORETICAL_PROJECT",
            "name": "Phương án 3 - Tiểu luận tốt nghiệp lý thuyết",
            "credits": 10,
            "note": "Học phần tiểu luận 4 tín chỉ và tích lũy thêm 6 tín chỉ từ các học phần được phép chọn: CHE10023, CHE10121, CHE10122, CHE10123, CHE10124, CHE10126, CHE10131, CHE10132, CHE10133, CHE10220, CHE10222, CHE10223, CHE10226, CHE10227, CHE10228, CHE10320, CHE10321, CHE10322, CHE10323, CHE10324, CHE10325, CHE10326, CHE10327, CHE10328, CHE10330, CHE10420, CHE10421, CHE10422, CHE10423, CHE10425, CHE10426, CHE10427, CHE10428, CHE10520, CHE10521, CHE10522, CHE10523, CHE10524, CHE10525, CHE10526, CHE10527, CHE10620, CHE10621, CHE10622, CHE10624, CHE10625, CHE10627, CHE10630, CHE10022, CHE10101, CHE10102, CHE10103, CHE10105, CHE10106, CHE10104, CHE10107, CHE10201, CHE10202, CHE10203, CHE10204, CHE10205, CHE10206, CHE10207, CHE10301, CHE10302, CHE10303, CHE10304, CHE10305, CHE10306, CHE10307, CHE10401, CHE10402, CHE10405, CHE10403, CHE10408, CHE10404, CHE10407, CHE10501, CHE10502, CHE10505, CHE10503, CHE10504, CHE10506, CHE10507, CHE10601, CHE10602, CHE10603, CHE10608, CHE10606, CHE10607. Học phần đã dùng để đáp ứng phần bắt buộc của lộ trình không được tính lặp.",
            "courses": [
              "CHE10490"
            ]
          }
        ]
      },
      "MAJOR_POLYMER_CHEMISTRY": {
        "name": "Chuyên ngành Hóa polyme",
        "total_credits_required": 10,
        "options": [
          {
            "type": "THESIS",
            "name": "Phương án 1 - Khóa luận tốt nghiệp",
            "credits": 10,
            "courses": [
              "CHE10595"
            ]
          },
          {
            "type": "EXPERIMENTAL_PROJECT",
            "name": "Phương án 2 - Tiểu luận tốt nghiệp thực nghiệm",
            "credits": 10,
            "note": "Học phần tiểu luận 6 tín chỉ và tích lũy thêm 4 tín chỉ từ các học phần được phép chọn: CHE10023, CHE10121, CHE10122, CHE10123, CHE10124, CHE10126, CHE10131, CHE10132, CHE10133, CHE10220, CHE10222, CHE10223, CHE10226, CHE10227, CHE10228, CHE10320, CHE10321, CHE10322, CHE10323, CHE10324, CHE10325, CHE10326, CHE10327, CHE10328, CHE10330, CHE10420, CHE10421, CHE10422, CHE10423, CHE10425, CHE10426, CHE10427, CHE10428, CHE10520, CHE10521, CHE10522, CHE10523, CHE10524, CHE10525, CHE10526, CHE10527, CHE10620, CHE10621, CHE10622, CHE10624, CHE10625, CHE10627, CHE10630, CHE10022, CHE10101, CHE10102, CHE10103, CHE10105, CHE10106, CHE10104, CHE10107, CHE10201, CHE10202, CHE10203, CHE10204, CHE10205, CHE10206, CHE10207, CHE10301, CHE10302, CHE10303, CHE10304, CHE10305, CHE10306, CHE10307, CHE10401, CHE10402, CHE10405, CHE10403, CHE10408, CHE10404, CHE10407, CHE10501, CHE10502, CHE10505, CHE10503, CHE10504, CHE10506, CHE10507, CHE10601, CHE10602, CHE10603, CHE10608, CHE10606, CHE10607. Học phần đã dùng để đáp ứng phần bắt buộc của lộ trình không được tính lặp.",
            "courses": [
              "CHE10591"
            ]
          },
          {
            "type": "THEORETICAL_PROJECT",
            "name": "Phương án 3 - Tiểu luận tốt nghiệp lý thuyết",
            "credits": 10,
            "note": "Học phần tiểu luận 4 tín chỉ và tích lũy thêm 6 tín chỉ từ các học phần được phép chọn: CHE10023, CHE10121, CHE10122, CHE10123, CHE10124, CHE10126, CHE10131, CHE10132, CHE10133, CHE10220, CHE10222, CHE10223, CHE10226, CHE10227, CHE10228, CHE10320, CHE10321, CHE10322, CHE10323, CHE10324, CHE10325, CHE10326, CHE10327, CHE10328, CHE10330, CHE10420, CHE10421, CHE10422, CHE10423, CHE10425, CHE10426, CHE10427, CHE10428, CHE10520, CHE10521, CHE10522, CHE10523, CHE10524, CHE10525, CHE10526, CHE10527, CHE10620, CHE10621, CHE10622, CHE10624, CHE10625, CHE10627, CHE10630, CHE10022, CHE10101, CHE10102, CHE10103, CHE10105, CHE10106, CHE10104, CHE10107, CHE10201, CHE10202, CHE10203, CHE10204, CHE10205, CHE10206, CHE10207, CHE10301, CHE10302, CHE10303, CHE10304, CHE10305, CHE10306, CHE10307, CHE10401, CHE10402, CHE10405, CHE10403, CHE10408, CHE10404, CHE10407, CHE10501, CHE10502, CHE10505, CHE10503, CHE10504, CHE10506, CHE10507, CHE10601, CHE10602, CHE10603, CHE10608, CHE10606, CHE10607. Học phần đã dùng để đáp ứng phần bắt buộc của lộ trình không được tính lặp.",
            "courses": [
              "CHE10590"
            ]
          }
        ]
      },
      "MAJOR_PHARMACEUTICAL_CHEMISTRY": {
        "name": "Chuyên ngành Hóa dược",
        "total_credits_required": 10,
        "options": [
          {
            "type": "THESIS",
            "name": "Phương án 1 - Khóa luận tốt nghiệp",
            "credits": 10,
            "courses": [
              "CHE10695"
            ]
          },
          {
            "type": "EXPERIMENTAL_PROJECT",
            "name": "Phương án 2 - Tiểu luận tốt nghiệp thực nghiệm",
            "credits": 10,
            "note": "Học phần tiểu luận 6 tín chỉ và tích lũy thêm 4 tín chỉ từ các học phần được phép chọn: CHE10023, CHE10121, CHE10122, CHE10123, CHE10124, CHE10126, CHE10131, CHE10132, CHE10133, CHE10220, CHE10222, CHE10223, CHE10226, CHE10227, CHE10228, CHE10320, CHE10321, CHE10322, CHE10323, CHE10324, CHE10325, CHE10326, CHE10327, CHE10328, CHE10330, CHE10420, CHE10421, CHE10422, CHE10423, CHE10425, CHE10426, CHE10427, CHE10428, CHE10520, CHE10521, CHE10522, CHE10523, CHE10524, CHE10525, CHE10526, CHE10527, CHE10620, CHE10621, CHE10622, CHE10624, CHE10625, CHE10627, CHE10630, CHE10022, CHE10101, CHE10102, CHE10103, CHE10105, CHE10106, CHE10104, CHE10107, CHE10201, CHE10202, CHE10203, CHE10204, CHE10205, CHE10206, CHE10207, CHE10301, CHE10302, CHE10303, CHE10304, CHE10305, CHE10306, CHE10307, CHE10401, CHE10402, CHE10405, CHE10403, CHE10408, CHE10404, CHE10407, CHE10501, CHE10502, CHE10505, CHE10503, CHE10504, CHE10506, CHE10507, CHE10601, CHE10602, CHE10603, CHE10608, CHE10606, CHE10607. Học phần đã dùng để đáp ứng phần bắt buộc của lộ trình không được tính lặp.",
            "courses": [
              "CHE10691"
            ]
          },
          {
            "type": "THEORETICAL_PROJECT",
            "name": "Phương án 3 - Tiểu luận tốt nghiệp lý thuyết",
            "credits": 10,
            "note": "Học phần tiểu luận 4 tín chỉ và tích lũy thêm 6 tín chỉ từ các học phần được phép chọn: CHE10023, CHE10121, CHE10122, CHE10123, CHE10124, CHE10126, CHE10131, CHE10132, CHE10133, CHE10220, CHE10222, CHE10223, CHE10226, CHE10227, CHE10228, CHE10320, CHE10321, CHE10322, CHE10323, CHE10324, CHE10325, CHE10326, CHE10327, CHE10328, CHE10330, CHE10420, CHE10421, CHE10422, CHE10423, CHE10425, CHE10426, CHE10427, CHE10428, CHE10520, CHE10521, CHE10522, CHE10523, CHE10524, CHE10525, CHE10526, CHE10527, CHE10620, CHE10621, CHE10622, CHE10624, CHE10625, CHE10627, CHE10630, CHE10022, CHE10101, CHE10102, CHE10103, CHE10105, CHE10106, CHE10104, CHE10107, CHE10201, CHE10202, CHE10203, CHE10204, CHE10205, CHE10206, CHE10207, CHE10301, CHE10302, CHE10303, CHE10304, CHE10305, CHE10306, CHE10307, CHE10401, CHE10402, CHE10405, CHE10403, CHE10408, CHE10404, CHE10407, CHE10501, CHE10502, CHE10505, CHE10503, CHE10504, CHE10506, CHE10507, CHE10601, CHE10602, CHE10603, CHE10608, CHE10606, CHE10607. Học phần đã dùng để đáp ứng phần bắt buộc của lộ trình không được tính lặp.",
            "courses": [
              "CHE10690"
            ]
          }
        ]
      },
      "MAJOR_EXPERIMENTAL_CHEMISTRY": {
        "name": "Chuyên ngành Hóa học thực nghiệm",
        "total_credits_required": 10,
        "options": [
          {
            "type": "THESIS",
            "name": "Phương án 1 - Khóa luận tốt nghiệp",
            "credits": 10,
            "mandatory": false,
            "note": "Chọn 01 trong 07 học phần để thực hiện khóa luận tốt nghiệp 10 tín chỉ.",
            "courses": [
              "CHE10195",
              "CHE10295",
              "CHE10395",
              "CHE10495",
              "CHE10595",
              "CHE10695",
              "CHE10700"
            ]
          },
          {
            "type": "EXPERIMENTAL_PROJECT",
            "name": "Phương án 2 - Tiểu luận tốt nghiệp thực nghiệm",
            "credits": 10,
            "mandatory": false,
            "note": "Chọn 01 học phần tiểu luận tốt nghiệp thực nghiệm 6 tín chỉ và tích lũy thêm 4 tín chỉ từ các học phần được phép chọn: CHE10023, CHE10121, CHE10122, CHE10123, CHE10124, CHE10126, CHE10131, CHE10132, CHE10133, CHE10220, CHE10222, CHE10223, CHE10226, CHE10227, CHE10228, CHE10320, CHE10321, CHE10322, CHE10323, CHE10324, CHE10325, CHE10326, CHE10327, CHE10328, CHE10330, CHE10420, CHE10421, CHE10422, CHE10423, CHE10425, CHE10426, CHE10427, CHE10428, CHE10520, CHE10521, CHE10522, CHE10523, CHE10524, CHE10525, CHE10526, CHE10527, CHE10620, CHE10621, CHE10622, CHE10624, CHE10625, CHE10627, CHE10630, CHE10022, CHE10101, CHE10102, CHE10103, CHE10105, CHE10106, CHE10104, CHE10107, CHE10201, CHE10202, CHE10203, CHE10204, CHE10205, CHE10206, CHE10207, CHE10301, CHE10302, CHE10303, CHE10304, CHE10305, CHE10306, CHE10307, CHE10401, CHE10402, CHE10405, CHE10403, CHE10408, CHE10404, CHE10407, CHE10501, CHE10502, CHE10505, CHE10503, CHE10504, CHE10506, CHE10507, CHE10601, CHE10602, CHE10603, CHE10608, CHE10606, CHE10607. Học phần đã dùng để đáp ứng phần bắt buộc của lộ trình không được tính lặp.",
            "courses": [
              "CHE10191",
              "CHE10291",
              "CHE10391",
              "CHE10491",
              "CHE10591",
              "CHE10691"
            ]
          },
          {
            "type": "THEORETICAL_PROJECT",
            "name": "Phương án 3 - Tiểu luận tốt nghiệp lý thuyết",
            "credits": 10,
            "mandatory": false,
            "note": "Chọn 01 học phần tiểu luận tốt nghiệp lý thuyết 4 tín chỉ và tích lũy thêm 6 tín chỉ từ các học phần được phép chọn: CHE10023, CHE10121, CHE10122, CHE10123, CHE10124, CHE10126, CHE10131, CHE10132, CHE10133, CHE10220, CHE10222, CHE10223, CHE10226, CHE10227, CHE10228, CHE10320, CHE10321, CHE10322, CHE10323, CHE10324, CHE10325, CHE10326, CHE10327, CHE10328, CHE10330, CHE10420, CHE10421, CHE10422, CHE10423, CHE10425, CHE10426, CHE10427, CHE10428, CHE10520, CHE10521, CHE10522, CHE10523, CHE10524, CHE10525, CHE10526, CHE10527, CHE10620, CHE10621, CHE10622, CHE10624, CHE10625, CHE10627, CHE10630, CHE10022, CHE10101, CHE10102, CHE10103, CHE10105, CHE10106, CHE10104, CHE10107, CHE10201, CHE10202, CHE10203, CHE10204, CHE10205, CHE10206, CHE10207, CHE10301, CHE10302, CHE10303, CHE10304, CHE10305, CHE10306, CHE10307, CHE10401, CHE10402, CHE10405, CHE10403, CHE10408, CHE10404, CHE10407, CHE10501, CHE10502, CHE10505, CHE10503, CHE10504, CHE10506, CHE10507, CHE10601, CHE10602, CHE10603, CHE10608, CHE10606, CHE10607. Học phần đã dùng để đáp ứng phần bắt buộc của lộ trình không được tính lặp.",
            "courses": [
              "CHE10190",
              "CHE10290",
              "CHE10390",
              "CHE10490",
              "CHE10590",
              "CHE10690"
            ]
          }
        ]
      }
    }
  }
};
