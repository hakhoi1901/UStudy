export const categories = {
  "GENERAL_EDUCATION": {
    "name": "Giáo dục đại cương",
    "total_credits_required": 51,
    "note": "Tích lũy 51 tín chỉ; không kể Giáo dục thể chất, Giáo dục quốc phòng - An ninh, Tin học cơ sở và Ngoại ngữ.",
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
        "total_credits_required": 35,
        "breakdown": {
          "MANDATORY": {
            "name": "Học phần bắt buộc",
            "credits": 33,
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
              "PHY00081"
            ]
          },
          "EARTH_ENV_ELECTIVE": {
            "name": "Khoa học Trái đất / Môi trường đại cương",
            "credits_required": 2,
            "mandatory": false,
            "note": "Chọn 1 trong 2 học phần, tích lũy 2 tín chỉ.",
            "courses": [
              "GEO00002",
              "ENV00001"
            ]
          }
        }
      },
      "GENERAL_IT": {
        "name": "Tin học",
        "credits": 3,
        "mandatory": true,
        "note": "Không tính vào điểm trung bình; tính vào số tín chỉ tích lũy; không nằm trong 51 tín chỉ giáo dục đại cương dùng để tính tổng 138 tín chỉ.",
        "courses": [
          "CSC00003"
        ]
      },
      "GENERAL_ENGLISH": {
        "name": "Ngoại ngữ",
        "mandatory": false,
        "note": "Không tính vào điểm trung bình và tín chỉ tích lũy. Sinh viên đạt chuẩn ngoại ngữ đầu ra theo quy định hiện hành thì không đăng ký học các học phần Anh văn. course_type được đặt TC theo quy tắc tương thích UStudy của Project cho khối ngoại ngữ có cơ chế miễn.",
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
        "note": "Không tính vào điểm trung bình; tính vào số tín chỉ tích lũy; không nằm trong 51 tín chỉ giáo dục đại cương dùng để tính tổng 138 tín chỉ.",
        "courses": [
          "BAA00021",
          "BAA00022"
        ]
      },
      "GENERAL_DEFENSE": {
        "name": "Giáo dục quốc phòng - an ninh",
        "credits": 4,
        "mandatory": true,
        "note": "Không tính vào điểm trung bình; tính vào số tín chỉ tích lũy; không nằm trong 51 tín chỉ giáo dục đại cương dùng để tính tổng 138 tín chỉ.",
        "courses": [
          "BAA00030"
        ]
      }
    }
  },
  "FOUNDATION": {
    "name": "Kiến thức cơ sở ngành",
    "total_credits_required": 25,
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
  "MAJOR": {
    "name": "Kiến thức chuyên ngành",
    "total_credits_required": 48,
    "note": "Sinh viên học một chuyên ngành 48 tín chỉ. Kế hoạch giảng dạy chia thành Định hướng 1 (chọn 1 trong 3 chuyên ngành) và Định hướng 2 (chọn 1 trong 4 chuyên ngành).",
    "breakdown": {
      "DIRECTION_1": {
        "name": "Chuyên ngành theo định hướng 1",
        "note": "Chọn 1 trong 3 chuyên ngành sau.",
        "options": [
          {
            "type": "NUCLEAR_PHYSICS",
            "name": "Vật lý hạt nhân",
            "credits": 48,
            "courses": [
              "PHY10302",
              "PHY10325",
              "PHY10326",
              "PHY10327",
              "PHY10328",
              "PHY10331",
              "PHY10433",
              "PHY10517",
              "PHY10529",
              "PHY10532",
              "PHY10625",
              "PHY10316",
              "PHY10322",
              "PHY10323",
              "PHY10324",
              "PHY10426",
              "PHY10432",
              "PHY10434",
              "PHY10438",
              "PHY10524",
              "PHY10530",
              "PHY10531",
              "PHY10609",
              "PHY10628",
              "PHY10307",
              "PHY10308",
              "PHY10310",
              "PHY10315",
              "PHY10329",
              "PHY10330"
            ],
            "note": "Học phần bắt buộc — 28 tín chỉ — bắt buộc; Học phần tự chọn — 20 tín chỉ — tự chọn — Tích lũy 20 tín chỉ: chọn 14 tín chỉ ở nhóm 1 và 6 tín chỉ ở nhóm 2.; Nhóm tự chọn 14 tín chỉ — yêu cầu 14 tín chỉ — tự chọn — Chọn đủ 14 tín chỉ.; Nhóm tự chọn 6 tín chỉ — yêu cầu 6 tín chỉ — tự chọn — Chọn đủ 6 tín chỉ."
          },
          {
            "type": "GEOPHYSICS",
            "name": "Vật lý địa cầu",
            "credits": 48,
            "courses": [
              "PHY10331",
              "PHY10413",
              "PHY10423",
              "PHY10431",
              "PHY10433",
              "PHY10435",
              "PHY10436",
              "PHY10517",
              "PHY10529",
              "PHY10532",
              "PHY10625",
              "PHY10316",
              "PHY10322",
              "PHY10323",
              "PHY10324",
              "PHY10426",
              "PHY10432",
              "PHY10434",
              "PHY10438",
              "PHY10524",
              "PHY10530",
              "PHY10531",
              "PHY10609",
              "PHY10628",
              "PHY10425",
              "PHY10437"
            ],
            "note": "Học phần bắt buộc — 31 tín chỉ — bắt buộc; Học phần tự chọn — 17 tín chỉ — tự chọn — Tích lũy 17 tín chỉ: chọn 14 tín chỉ ở nhóm 1 và 3 tín chỉ ở nhóm 2.; Nhóm tự chọn 14 tín chỉ — yêu cầu 14 tín chỉ — tự chọn — Chọn đủ 14 tín chỉ.; Nhóm tự chọn 3 tín chỉ — yêu cầu 3 tín chỉ — tự chọn — Chọn đủ 3 tín chỉ."
          },
          {
            "type": "THEORETICAL_PHYSICS",
            "name": "Vật lý lý thuyết",
            "credits": 48,
            "courses": [
              "PHY10331",
              "PHY10433",
              "PHY10517",
              "PHY10529",
              "PHY10532",
              "PHY10533",
              "PHY10534",
              "PHY10535",
              "PHY10625",
              "PHY10438",
              "PHY10530",
              "PHY10316",
              "PHY10322",
              "PHY10323",
              "PHY10324",
              "PHY10426",
              "PHY10432",
              "PHY10434",
              "PHY10524",
              "PHY10531",
              "PHY10609",
              "PHY10628",
              "PHY10507",
              "PHY10512",
              "PHY10527",
              "PHY10528"
            ],
            "note": "Học phần bắt buộc — 28 tín chỉ — bắt buộc; Học phần tự chọn — 20 tín chỉ — tự chọn — Tích lũy 20 tín chỉ: chọn 14 tín chỉ ở nhóm 1 và 6 tín chỉ ở nhóm 2.; Nhóm tự chọn 14 tín chỉ — yêu cầu 14 tín chỉ — tự chọn — Chọn đủ 14 tín chỉ.; Nhóm tự chọn 6 tín chỉ — yêu cầu 6 tín chỉ — tự chọn — Chọn đủ 6 tín chỉ."
          }
        ]
      },
      "DIRECTION_2": {
        "name": "Chuyên ngành theo định hướng 2",
        "note": "Chọn 1 trong 4 chuyên ngành sau.",
        "options": [
          {
            "type": "ELECTRONICS_PHYSICS",
            "name": "Vật lý điện tử",
            "credits": 48,
            "courses": [
              "PHY10102",
              "PHY10128",
              "PHY10134",
              "PHY10228",
              "PHY10609",
              "PHY10622",
              "PHY10626",
              "PHY10627",
              "PHY10628",
              "PHY10724",
              "PHY10625",
              "PHY10237",
              "PHY10530",
              "PHY10103",
              "PHY10124",
              "PHY10229",
              "PHY10611",
              "PHY10614",
              "PHY10618",
              "PHY10620",
              "PHY10630",
              "PHY10725",
              "PHY10726",
              "PHY10105",
              "PHY10111",
              "PHY10115",
              "PHY10122",
              "PHY10126",
              "PHY10127",
              "PHY10130",
              "PHY10131"
            ],
            "note": "Học phần bắt buộc — 31 tín chỉ — bắt buộc; Học phần tự chọn — 17 tín chỉ — tự chọn — Tích lũy 17 tín chỉ: chọn 12 tín chỉ ở nhóm 1 và 5 tín chỉ ở nhóm 2.; Nhóm tự chọn 12 tín chỉ — yêu cầu 12 tín chỉ — tự chọn — Chọn đủ 12 tín chỉ.; Nhóm tự chọn 5 tín chỉ — yêu cầu 5 tín chỉ — tự chọn — Chọn đủ 5 tín chỉ."
          },
          {
            "type": "SOLID_STATE_PHYSICS",
            "name": "Vật lý chất rắn",
            "credits": 48,
            "courses": [
              "PHY10228",
              "PHY10230",
              "PHY10231",
              "PHY10232",
              "PHY10609",
              "PHY10626",
              "PHY10627",
              "PHY10628",
              "PHY10724",
              "PHY10625",
              "PHY10237",
              "PHY10530",
              "PHY10124",
              "PHY10229",
              "PHY10611",
              "PHY10614",
              "PHY10618",
              "PHY10620",
              "PHY10630",
              "PHY10725",
              "PHY10726",
              "PHY10205",
              "PHY10207",
              "PHY10227",
              "PHY10233",
              "PHY10234",
              "PHY10235",
              "PHY10236"
            ],
            "note": "Học phần bắt buộc — 29 tín chỉ — bắt buộc; Học phần tự chọn — 19 tín chỉ — tự chọn — Tích lũy 19 tín chỉ: chọn 12 tín chỉ ở nhóm 1 và 7 tín chỉ ở nhóm 2.; Nhóm tự chọn 12 tín chỉ — yêu cầu 12 tín chỉ — tự chọn — Chọn đủ 12 tín chỉ.; Nhóm tự chọn 7 tín chỉ — yêu cầu 7 tín chỉ — tự chọn — Chọn đủ 7 tín chỉ."
          },
          {
            "type": "COMPUTATIONAL_PHYSICS",
            "name": "Vật lý tin học",
            "credits": 48,
            "courses": [
              "PHY10228",
              "PHY10609",
              "PHY10626",
              "PHY10627",
              "PHY10628",
              "PHY10631",
              "PHY10724",
              "PHY10625",
              "PHY10237",
              "PHY10530",
              "PHY10124",
              "PHY10229",
              "PHY10611",
              "PHY10614",
              "PHY10618",
              "PHY10620",
              "PHY10630",
              "PHY10725",
              "PHY10726",
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
            ],
            "note": "Học phần bắt buộc — 23 tín chỉ — bắt buộc; Học phần tự chọn — 25 tín chỉ — tự chọn — Tích lũy 25 tín chỉ: chọn 12 tín chỉ ở nhóm 1 và 13 tín chỉ ở nhóm 2.; Nhóm tự chọn 12 tín chỉ — yêu cầu 12 tín chỉ — tự chọn — Chọn đủ 12 tín chỉ.; Nhóm tự chọn 13 tín chỉ — yêu cầu 13 tín chỉ — tự chọn — Chọn đủ 13 tín chỉ."
          },
          {
            "type": "APPLIED_PHYSICS",
            "name": "Vật lý ứng dụng",
            "credits": 48,
            "courses": [
              "PHY10228",
              "PHY10609",
              "PHY10626",
              "PHY10627",
              "PHY10628",
              "PHY10703",
              "PHY10705",
              "PHY10715",
              "PHY10719",
              "PHY10720",
              "PHY10723",
              "PHY10724",
              "PHY10727",
              "PHY10625",
              "PHY10237",
              "PHY10530",
              "PHY10124",
              "PHY10229",
              "PHY10611",
              "PHY10614",
              "PHY10618",
              "PHY10620",
              "PHY10630",
              "PHY10725",
              "PHY10726"
            ],
            "note": "Học phần bắt buộc — 36 tín chỉ — bắt buộc; Học phần tự chọn — yêu cầu 12 tín chỉ — tự chọn — Chọn đủ 12 tín chỉ từ danh sách."
          }
        ]
      }
    }
  },
  "HONORS_COMMON": {
    "name": "Môn tài năng chung cho tất cả chuyên ngành",
    "total_credits_required": 4,
    "mandatory": true,
    "courses": [
      "PHY10801",
      "PHY10802"
    ]
  },
  "GRADUATION": {
    "name": "Kiến thức tốt nghiệp",
    "total_credits_required": 10,
    "mandatory": true,
    "courses": [
      "PHY10995"
    ]
  }
};
