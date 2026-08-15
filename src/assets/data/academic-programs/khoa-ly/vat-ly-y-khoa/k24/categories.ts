export const categories = {
  "GENERAL_EDUCATION": {
    "name": "Giáo dục đại cương",
    "total_credits_required": 51,
    "note": "Không kể môn GDQP-AN, GDTC, Tin học cơ sở và Ngoại ngữ",
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
        "name": "Toán - Khoa học tự nhiên - Công nghệ - Môi trường",
        "credits": 35,
        "mandatory": true,
        "note": "Bắt buộc 33 TC + Tự chọn 2 TC (chọn 1 trong 2)",
        "breakdown": {
          "MATH_SCIENCE_MANDATORY": {
            "name": "Toán và Khoa học tự nhiên bắt buộc",
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
              "MPH00001",
              "PHY00081"
            ]
          },
          "ENVIRONMENT_ELECTIVE": {
            "name": "Môi trường tự chọn",
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
        "note": "Không tính vào điểm trung bình và tín chỉ tích lũy. SV đạt chuẩn ngoại ngữ đầu ra theo quy định hiện hành thì không đăng ký",
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
      },
    }
  },
  "FOUNDATION": {
    "name": "Cơ Sở Ngành",
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
      "MPH10001"
    ]
  },
  "MAJOR_MEDICAL_PHYSICS": {
    "name": "Chuyên ngành Vật lý y khoa",
    "total_credits_required": 40,
    "breakdown": {
      "MANDATORY": {
        "credits": 34,
        "courses": [
          "MPH10101",
          "MPH10102",
          "MPH10103",
          "MPH10104",
          "MPH10105",
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
        "note": "Chọn 6 tín chỉ",
        "courses": [
          "MPH10113",
          "MPH10114",
          "MPH10115",
          "MPH10116",
          "MPH10117",
          "MPH10118",
          "MPH10119",
          "MPH10120"
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
        "note": "Sinh viên làm Khóa luận tốt nghiệp",
        "courses": [
          "MPH10995"
        ]
      },
      {
        "type": "PROJECT",
        "credits": 10,
        "note": "Sinh viên không đủ điều kiện làm Khóa luận tốt nghiệp học Đồ án tốt nghiệp và Seminar",
        "courses": [
          "MPH10991",
          "MPH10992"
        ]
      }
    ]
  }
};