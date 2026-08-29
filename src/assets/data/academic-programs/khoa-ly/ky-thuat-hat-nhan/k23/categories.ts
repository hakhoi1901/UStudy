export const categories = {
  "GENERAL_EDUCATION": {
    "name": "Kiến thức giáo dục đại cương",
    "total_credits_required": 51,
    "note": "Tích lũy 51 tín chỉ, không kể Giáo dục thể chất, Giáo dục quốc phòng - An ninh, Tin học cơ sở và Ngoại ngữ.",
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
        "note": "Chọn 1 trong 3 học phần.",
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
              "PHY00012",
              "PHY00081"
            ]
          },
          "ELECTIVE": {
            "name": "Học phần tự chọn",
            "credits_required": 2,
            "mandatory": false,
            "note": "Chọn 1 trong 2 học phần.",
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
        "note": "Không tính vào điểm trung bình; tính vào số tín chỉ tích lũy; không nằm trong 51 tín chỉ giáo dục đại cương nêu tại mục 7.1.",
        "courses": [
          "CSC00003"
        ]
      },
      "GENERAL_ENGLISH": {
        "name": "Ngoại ngữ",
        "mandatory": false,
        "note": "Không tính vào điểm trung bình và tín chỉ tích lũy. Sinh viên đạt chuẩn ngoại ngữ đầu ra theo quy định hiện hành thì không đăng ký học các học phần Anh văn. Theo quy tắc tương thích UStudy, các học phần này dùng course_type TC.",
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
        "note": "Không tính vào điểm trung bình; tính vào số tín chỉ tích lũy; không nằm trong 51 tín chỉ giáo dục đại cương nêu tại mục 7.1.",
        "courses": [
          "BAA00021",
          "BAA00022"
        ]
      },
      "GENERAL_DEFENSE": {
        "name": "Giáo dục quốc phòng - An ninh",
        "credits": 4,
        "mandatory": true,
        "note": "Không tính vào điểm trung bình; tính vào số tín chỉ tích lũy; không nằm trong 51 tín chỉ giáo dục đại cương nêu tại mục 7.1.",
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
      "PHY10012"
    ]
  },
  "MAJOR": {
    "name": "Kiến thức chuyên ngành",
    "note": "Sinh viên học theo một trong ba chuyên ngành. Kỹ thuật hạt nhân và Năng lượng và điện hạt nhân: 41 tín chỉ; Vật lý y khoa: 40 tín chỉ.",
    "options": [
      {
        "type": "NUCLEAR_ENGINEERING",
        "name": "Chuyên ngành Kỹ thuật hạt nhân",
        "credits": 41,
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
          "NTE10117",
          "NTE10107",
          "NTE10109",
          "NTE10110",
          "NTE10118",
          "MPH10109",
          "PHY10801",
          "NTE10119",
          "NTE10120",
          "PHY10322",
          "PHY10426"
        ],
        "note": "Học phần bắt buộc — 35 tín chỉ — bắt buộc; Học phần tự chọn — yêu cầu 6 tín chỉ — tự chọn — Chọn học để tích lũy 6 tín chỉ."
      },
      {
        "type": "NUCLEAR_ENERGY_AND_POWER",
        "name": "Chuyên ngành Năng lượng và điện hạt nhân",
        "credits": 41,
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
          "NTE10204",
          "NTE10107",
          "NTE10205",
          "NTE10117",
          "NTE10109",
          "NTE10116",
          "PHY10801",
          "PHY10322"
        ],
        "note": "Học phần bắt buộc — 35 tín chỉ — bắt buộc; Học phần tự chọn — yêu cầu 6 tín chỉ — tự chọn — Chọn học để tích lũy 6 tín chỉ."
      },
      {
        "type": "MEDICAL_PHYSICS",
        "name": "Chuyên ngành Vật lý y khoa",
        "credits": 40,
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
          "MPH10112",
          "NTE10106",
          "NTE10107",
          "NTE10108",
          "NTE10109",
          "NTE10118",
          "MPH10120",
          "PHY10801",
          "NTE10119"
        ],
        "note": "Học phần bắt buộc — 34 tín chỉ — bắt buộc; Học phần tự chọn — yêu cầu 6 tín chỉ — tự chọn — Chọn học để tích lũy 6 tín chỉ."
      }
    ]
  },
  "GRADUATION": {
    "name": "Kiến thức tốt nghiệp",
    "total_credits_required": 10,
    "note": "Sinh viên chọn 1 trong 2 phương án để tích lũy đủ 10 tín chỉ.",
    "options": [
      {
        "type": "THESIS",
        "name": "Phương án 1: Khóa luận tốt nghiệp",
        "credits": 10,
        "courses": [
          "NTE10995"
        ]
      },
      {
        "type": "PROJECT_AND_SEMINAR",
        "name": "Phương án 2: Đồ án tốt nghiệp và Seminar chuyên ngành",
        "credits": 10,
        "note": "Dành cho sinh viên không đủ điều kiện làm Khóa luận tốt nghiệp.",
        "courses": [
          "NTE10991",
          "NTE10992"
        ]
      }
    ]
  }
};
