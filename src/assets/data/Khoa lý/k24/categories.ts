export const categories = {
  "GENERAL_EDUCATION": {
    "name": "Giáo dục đại cương",
    "total_credits_required": 51,
    "note": "Không kể môn GDQP-AN, GDTC, Tin học cơ sở và Ngoại ngữ",
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
          "MATH_SCIENCE_MANDATORY": {
            "name": "Toán - Khoa học tự nhiên - Môi trường bắt buộc",
            "credits_required": 31,
            "courses": [
              "MTH00003",
              "MTH00004",
              "MTH00030",
              "MTH00040",
              "PHY00001",
              "PHY00002",
              "PHY00081",
              "CHE00001",
              "CHE00002",
              "ENV00001",
              "OMH00001"
            ]
          },
          "MATH_ELECTIVE": {
            "name": "Thực hành Vi tích phân tự chọn",
            "credits_required": 1,
            "note": "Chọn 1 trong 2 học phần",
            "courses": [
              "MTH00081",
              "MTH00082"
            ]
          },
          "BIO_ELECTIVE": {
            "name": "Sinh đại cương tự chọn",
            "credits_required": 3,
            "note": "Chọn 1 trong 2 học phần",
            "courses": [
              "BIO00001",
              "BIO00002"
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
        "name": "Ngoại ngữ (Anh văn)",
        "credits": 12,
        "mandatory": false,
        "note": "Không tính vào điểm trung bình và tín chỉ tích lũy. SV đạt chuẩn ngoại ngữ đầu ra theo quy định hiện hành thì không đăng ký học các học phần Anh văn",
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
        "credits": 38,
        "courses": [
          "PHY10001",
          "OMH10001",
          "OMH10002",
          "OMH10003",
          "OMH10004",
          "OMH10005",
          "OMH10006",
          "OMH10007",
          "OMH10008",
          "OMH10009",
          "OMH10010",
          "OMH10011",
          "OMH10012",
          "OMH10014",
          "OMH10015",
          "OMH10016"
        ]
      },
      "ELECTIVE": {
        "credits": 2,
        "note": "Chọn 1 trong 2 học phần",
        "courses": [
          "OMH10013",
          "OMH10017"
        ]
      }
    }
  },
  "MAJOR_OCEANOLOGY": {
    "name": "Chuyên ngành Hải Dương Học",
    "total_credits_required": 27,
    "breakdown": {
      "MANDATORY": {
        "credits": 10,
        "courses": [
          "OMH10104",
          "OMH10105",
          "OMH10106",
          "OMH10108"
        ]
      },
      "ELECTIVE": {
        "credits": 17,
        "courses": [
          "OMH10101",
          "OMH10102",
          "OMH10103",
          "OMH10107",
          "OMH10109",
          "OMH10110",
          "OMH10111",
          "OMH10112",
          "OMH10113",
          "OMH10114",
          "OMH10115",
          "OMH10116",
          "OMH10117",
          "OMH10118",
          "OMH10119",
          "OMH10120",
          "OMH10404",
          "OMH10411",
          "OMH10412",
          "OMH10414",
          "OMH10415",
          "OMH10420",
          "OMH10422",
          "OMH10423"
        ]
      }
    }
  },
  "MAJOR_METEOROLOGY": {
    "name": "Chuyên ngành Khí Tượng Học",
    "total_credits_required": 28,
    "breakdown": {
      "MANDATORY": {
        "credits": 10,
        "courses": [
          "OMH10201",
          "OMH10202",
          "OMH10203",
          "OMH10206"
        ]
      },
      "ELECTIVE": {
        "credits": 18,
        "courses": [
          "OMH10101",
          "OMH10117",
          "OMH10119",
          "OMH10120",
          "OMH10204",
          "OMH10205",
          "OMH10207",
          "OMH10208",
          "OMH10209",
          "OMH10210",
          "OMH10211",
          "OMH10212",
          "OMH10213",
          "OMH10214",
          "OMH10215",
          "OMH10216",
          "OMH10217",
          "OMH10411",
          "OMH10412",
          "OMH10413",
          "OMH10418",
          "OMH10421",
          "OMH10422",
          "OMH10423"
        ]
      }
    }
  },
  "MAJOR_HYDROLOGY": {
    "name": "Chuyên ngành Thủy Văn Học",
    "total_credits_required": 28,
    "breakdown": {
      "MANDATORY": {
        "credits": 9,
        "courses": [
          "OMH10301",
          "OMH10303",
          "OMH10305",
          "OMH10307"
        ]
      },
      "ELECTIVE": {
        "credits": 19,
        "courses": [
          "OMH10101",
          "OMH10117",
          "OMH10119",
          "OMH10120",
          "OMH10302",
          "OMH10304",
          "OMH10306",
          "OMH10308",
          "OMH10309",
          "OMH10310",
          "OMH10311",
          "OMH10312",
          "OMH10313",
          "OMH10314",
          "OMH10315",
          "OMH10316",
          "OMH10410",
          "OMH10411",
          "OMH10412",
          "OMH10414",
          "OMH10419",
          "OMH10420",
          "OMH10422",
          "OMH10423"
        ]
      }
    }
  },
  "MAJOR_OMH": {
    "name": "Chuyên ngành Hải dương - Khí tượng - Thủy văn",
    "total_credits_required": 27,
    "breakdown": {
      "MANDATORY": {
        "credits": 8,
        "courses": [
          "OMH10401",
          "OMH10403",
          "OMH10406"
        ]
      },
      "ELECTIVE": {
        "credits": 19,
        "courses": [
          "OMH10101",
          "OMH10114",
          "OMH10117",
          "OMH10119",
          "OMH10120",
          "OMH10210",
          "OMH10211",
          "OMH10402",
          "OMH10404",
          "OMH10405",
          "OMH10407",
          "OMH10408",
          "OMH10410",
          "OMH10411",
          "OMH10412",
          "OMH10413",
          "OMH10414",
          "OMH10415",
          "OMH10416",
          "OMH10417",
          "OMH10418",
          "OMH10419",
          "OMH10420",
          "OMH10421",
          "OMH10422",
          "OMH10423"
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
        "name": "Phương án 1: Tích lũy 10TC khóa luận tốt nghiệp",
        "credits": 10,
        "courses": [
          "OMH10395"
        ]
      },
      {
        "type": "PROJECT",
        "name": "Phương án 2: Tích lũy 6TC đồ án tốt nghiệp và 4TC các học phần tự chọn",
        "credits": 10,
        "courses": [
          "OMH10396",
          "OMH10121",
          "OMH10202",
          "OMH10203",
          "OMH10204",
          "OMH10218",
          "OMH10301",
          "OMH10306",
          "OMH10307",
          "OMH10409",
          "OMH10410",
          "OMH10103",
          "OMH10104",
          "OMH10106",
          "OMH10107",
          "OMH10205",
          "OMH10304"
        ]
      }
    ]
  }
}