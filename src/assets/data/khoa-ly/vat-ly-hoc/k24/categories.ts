export const categories = {
  "GENERAL_EDUCATION": {
    "name": "Giáo dục đại cương",
    "total_credits_required": 51,
    "note": "Không kể môn GDQP-AN, GDTC, Tin học cơ sở và ngoại ngữ",
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
        "name": "Khoa học xã hội – Kinh tế – Kỹ năng",
        "credits": 2,
        "mandatory": false,
        "note": "Chọn 1 trong 3",
        "courses": [
          "BAA00005",
          "BAA00006",
          "BAA00007"
        ]
      },
      "GENERAL_MATH_SCIENCE": {
        "name": "Toán – Khoa học tự nhiên – Công nghệ – Môi trường",
        "credits": 35,
        "mandatory": true,
        "note": "Toán và KHTN: 33 TC (bắt buộc) + Khoa học trái đất/Môi trường: 2 TC (chọn 1 trong 2)",
        "breakdown": {
          "MATH_SCIENCE_MANDATORY": {
            "name": "Bắt buộc",
            "credits_required": 33,
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
          "ENVIRONMENT_ELECTIVE": {
            "name": "Tự chọn",
            "credits_required": 2,
            "note": "Chọn 1 trong 2",
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
        "note": "Không tính vào điểm trung bình, tính vào số tín chỉ tích lũy",
        "courses": [
          "CSC00003"
        ]
      },
      "GENERAL_ENGLISH": {
        "name": "Ngoại ngữ",
        "credits": 12,
        "mandatory": false,
        "note": "Không tính vào điểm trung bình và tín chỉ tích lũy",
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
    "name": "Kiến thức giáo dục chuyên nghiệp - Cơ sở ngành",
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
  "MAJOR_NUCLEAR": {
    "name": "Chuyên ngành Vật lý hạt nhân",
    "total_credits_required": 48,
    "breakdown": {
      "MANDATORY": {
        "credits": 28
      },
      "ELECTIVE": {
        "credits": 20
      }
    },
    "courses": [
      "PHY10625", "PHY10331", "PHY10517", "PHY10433", "PHY10529", "PHY10532", "PHY10302", "PHY10325", "PHY10326", "PHY10327", "PHY10328",
      "PHY10438", "PHY10530", "PHY10316", "PHY10322", "PHY10323", "PHY10324", "PHY10426", "PHY10432", "PHY10434", "PHY10524", "PHY10531", "PHY10609", "PHY10628", "PHY10536", "PHY10439", "PHY10307", "PHY10308", "PHY10310", "PHY10315", "PHY10329", "PHY10330"
    ]
  },
  "MAJOR_GEOPHYSICS": {
    "name": "Chuyên ngành Vật lý địa cầu",
    "total_credits_required": 48,
    "breakdown": {
      "MANDATORY": {
        "credits": 31
      },
      "ELECTIVE": {
        "credits": 17
      }
    },
    "courses": [
      "PHY10625", "PHY10331", "PHY10517", "PHY10433", "PHY10529", "PHY10532", "PHY10413", "PHY10423", "PHY10431", "PHY10435", "PHY10436",
      "PHY10438", "PHY10530", "PHY10316", "PHY10322", "PHY10323", "PHY10324", "PHY10426", "PHY10432", "PHY10434", "PHY10524", "PHY10531", "PHY10609", "PHY10628", "PHY10536", "PHY10439", "PHY10425", "PHY10437"
    ]
  },
  "MAJOR_THEORETICAL": {
    "name": "Chuyên ngành Vật lý lý thuyết",
    "total_credits_required": 48,
    "breakdown": {
      "MANDATORY": {
        "credits": 28
      },
      "ELECTIVE": {
        "credits": 20
      }
    },
    "courses": [
      "PHY10625", "PHY10331", "PHY10517", "PHY10433", "PHY10529", "PHY10532", "PHY10533", "PHY10534", "PHY10535",
      "PHY10438", "PHY10530", "PHY10316", "PHY10322", "PHY10323", "PHY10324", "PHY10426", "PHY10432", "PHY10434", "PHY10524", "PHY10531", "PHY10609", "PHY10628", "PHY10536", "PHY10439", "PHY10507", "PHY10512", "PHY10527", "PHY10528"
    ]
  },
  "MAJOR_ELECTRONICS": {
    "name": "Chuyên ngành Vật lý điện tử",
    "total_credits_required": 48,
    "breakdown": {
      "MANDATORY": {
        "credits": 31
      },
      "ELECTIVE": {
        "credits": 17
      }
    },
    "courses": [
      "PHY10609", "PHY10626", "PHY10628", "PHY10228", "PHY10627", "PHY10724", "PHY10102", "PHY10128", "PHY10134", "PHY10622",
      "PHY10625", "PHY10237", "PHY10530", "PHY10103", "PHY10124", "PHY10229", "PHY10611", "PHY10614", "PHY10618", "PHY10620", "PHY10630", "PHY10725", "PHY10726", "PHY10634", "PHY10635", "PHY10636", "PHY10105", "PHY10111", "PHY10115", "PHY10122", "PHY10126", "PHY10127", "PHY10130", "PHY10131"
    ]
  },
  "MAJOR_SOLID_STATE": {
    "name": "Chuyên ngành Vật lý chất rắn",
    "total_credits_required": 48,
    "breakdown": {
      "MANDATORY": {
        "credits": 29
      },
      "ELECTIVE": {
        "credits": 19
      }
    },
    "courses": [
      "PHY10609", "PHY10626", "PHY10628", "PHY10228", "PHY10627", "PHY10724", "PHY10230", "PHY10231", "PHY10232",
      "PHY10625", "PHY10237", "PHY10530", "PHY10124", "PHY10229", "PHY10611", "PHY10614", "PHY10618", "PHY10620", "PHY10630", "PHY10634", "PHY10635", "PHY10636", "PHY10725", "PHY10726", "PHY10205", "PHY10207", "PHY10227", "PHY10233", "PHY10234", "PHY10235", "PHY10236"
    ]
  },
  "MAJOR_COMPUTATIONAL": {
    "name": "Chuyên ngành Vật lý tin học",
    "total_credits_required": 48,
    "breakdown": {
      "MANDATORY": {
        "credits": 23
      },
      "ELECTIVE": {
        "credits": 25
      }
    },
    "courses": [
      "PHY10609", "PHY10626", "PHY10628", "PHY10228", "PHY10627", "PHY10724", "PHY10631",
      "PHY10625", "PHY10237", "PHY10530", "PHY10124", "PHY10229", "PHY10611", "PHY10614", "PHY10618", "PHY10620", "PHY10630", "PHY10634", "PHY10635", "PHY10636", "PHY10725", "PHY10726", "PHY10115", "PHY10610", "PHY10612", "PHY10613", "PHY10615", "PHY10616", "PHY10621", "PHY10623", "PHY10629", "PHY10632", "PHY10633"
    ]
  },
  "MAJOR_APPLIED": {
    "name": "Chuyên ngành Vật lý ứng dụng",
    "total_credits_required": 48,
    "breakdown": {
      "MANDATORY": {
        "credits": 36
      },
      "ELECTIVE": {
        "credits": 12
      }
    },
    "courses": [
      "PHY10609", "PHY10626", "PHY10628", "PHY10228", "PHY10627", "PHY10724", "PHY10703", "PHY10705", "PHY10715", "PHY10719", "PHY10720", "PHY10723", "PHY10727",
      "PHY10625", "PHY10237", "PHY10530", "PHY10124", "PHY10229", "PHY10611", "PHY10614", "PHY10618", "PHY10620", "PHY10630", "PHY10634", "PHY10635", "PHY10636", "PHY10725", "PHY10726"
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
          "PHY10995"
        ]
      },
      {
        "type": "PROJECT_SEMINAR",
        "credits": 10,
        "courses": [
          "PHY10991",
          "PHY10992"
        ]
      }
    ]
  }
};