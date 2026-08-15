export const categories = {
  "GENERAL_EDUCATION": {
    "name": "Giáo dục đại cương",
    "total_credits_required": 51,
    "note": "Không kể Giáo dục thể chất, Giáo dục quốc phòng, Tin học cơ sở và Ngoại ngữ",
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
        "credits": 35,
        "mandatory": true,
        "breakdown": {
          "MANDATORY": {
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
              "PHY00012",
              "PHY00081"
            ]
          },
          "ELECTIVE": {
            "name": "Tự chọn Khoa học trái đất/ Môi trường",
            "credits_required": 2,
            "note": "Chọn 1 trong 2 học phần",
            "courses": [
              "GEO00002",
              "ENV00001"
            ]
          }
        }
      },
      "GENERAL_IT": {
        "name": "Tin học (Tin học cơ sở)",
        "credits": 3,
        "mandatory": true,
        "note": "Không tính vào điểm trung bình, tính vào số tín chỉ tích lũy",
        "courses": [
          "CSC00003"
        ]
      },
      "GENERAL_ENGLISH": {
        "name": "Ngoại ngữ (Anh văn)",
        "credits": 12,
        "mandatory": false,
        "note": "Không tính vào điểm trung bình và tín chỉ tích lũy. SV đạt chuẩn ngoại ngữ đầu ra theo quy định hiện hành thì không đăng ký học",
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
    "total_credits_required": 30,
    "mandatory": true,
    "courses": [
      "PHY10001",
      "PHY10002",
      "PHY10003",
      "PHY10004",
      "PHY10005",
      "PHY10007",
      "PHY10008",
      "PHY10009",
      "PHY10010",
      "PHY10011",
      "NTE10001"
    ]
  },
  "MAJOR": {
    "name": "Chuyên ngành",
    "total_credits_required": 41,
    "breakdown": {
      "MAJOR_NUCLEAR_ENGINEERING": {
        "name": "Chuyên ngành Kỹ thuật hạt nhân",
        "total_credits_required": 41,
        "breakdown": {
          "MANDATORY": {
            "credits": 35,
            "courses": [
              "NTE10101",
              "NTE10102",
              "NTE10103",
              "NTE10104",
              "NTE10105",
              "NTE10106",
              "NTE10108",
              "NTE10111",
              "NTE10112",
              "NTE10113",
              "NTE10114",
              "NTE10115",
              "NTE10116",
              "NTE10117"
            ]
          },
          "ELECTIVE": {
            "credits": 6,
            "courses": [
              "NTE10107",
              "NTE10109",
              "NTE10110",
              "NTE10118",
              "MPH10109",
              "PHY10801",
              "NTE10119",
              "NTE10120",
              "NTE10121",
              "NTE10122",
              "NTE10123",
              "NTE10124",
              "PHY10322",
              "PHY10426"
            ]
          }
        }
      },
      "MAJOR_NUCLEAR_POWER": {
        "name": "Chuyên ngành Năng lượng và điện hạt nhân",
        "total_credits_required": 41,
        "breakdown": {
          "MANDATORY": {
            "credits": 35,
            "courses": [
              "NTE10101",
              "NTE10102",
              "NTE10103",
              "NTE10104",
              "NTE10105",
              "NTE10106",
              "NTE10108",
              "NTE10110",
              "NTE10111",
              "NTE10112",
              "NTE10201",
              "NTE10202",
              "NTE10203",
              "NTE10204"
            ]
          },
          "ELECTIVE": {
            "credits": 6,
            "courses": [
              "NTE10107",
              "NTE10205",
              "NTE10117",
              "NTE10109",
              "NTE10116",
              "PHY10801",
              "PHY10322",
              "NTE10121",
              "NTE10122",
              "NTE10123",
              "NTE10124"
            ]
          }
        }
      },
      "MAJOR_MEDICAL_PHYSICS": {
        "name": "Chuyên ngành Vật lý y khoa",
        "total_credits_required": 40,
        "breakdown": {
          "MANDATORY": {
            "credits": 34,
            "courses": [
              "NTE10101",
              "NTE10102",
              "NTE10103",
              "NTE10104",
              "NTE10105",
              "MPH10106",
              "MPH10107",
              "MPH10108",
              "MPH10109",
              "MPH10110",
              "MPH10111",
              "MPH10112"
            ]
          },
          "ELECTIVE": {
            "credits": 6,
            "courses": [
              "NTE10106",
              "NTE10107",
              "NTE10108",
              "NTE10109",
              "NTE10118",
              "MPH10120",
              "PHY10801",
              "NTE10119",
              "NTE10121",
              "NTE10123",
              "NTE10124"
            ]
          }
        }
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
          "NTE10995"
        ]
      },
      {
        "type": "PROJECT_SEMINAR",
        "credits": 10,
        "courses": [
          "NTE10991",
          "NTE10992"
        ]
      }
    ]
  }
}