
export const categories = {
  "GENERAL_EDUCATION": {
    "name": "Giáo dục đại cương",
    "total_credits_required": 51,
    "note": "Không kể môn GDQP-AN, GDTC, Tin học cơ sở và ngoại ngữ",
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
        "note": "Chọn 01 học phần (02 tín chỉ)",
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
        "note": "Toán, Khoa học tự nhiên, Công nghệ: 30 TC (bắt buộc) + Vật lý: 3 TC (chọn 1) + Môi trường: 2 TC (chọn 1)",
        "breakdown": {
          "MANDATORY": {
            "name": "Bắt buộc",
            "credits_required": 30,
            "courses": [
              "MTH00003",
              "MTH00004",
              "MTH00030",
              "MTH00040",
              "ETC00001",
              "ETC00081",
              "ICD00001",
              "ICD00002",
              "ICD00003",
              "ICD00004",
              "ICD00005",
              "ICD00006",
              "ICD00007"
            ]
          },
          "PHYSICS_ELECTIVE": {
            "name": "Vật lý tự chọn",
            "credits_required": 3,
            "note": "Chọn 1 trong 3 học phần",
            "courses": [
              "PHY00001",
              "PHY00002",
              "PHY00004"
            ]
          },
          "ENVIRONMENT_ELECTIVE": {
            "name": "Môi trường tự chọn",
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
    "name": "Kiến thức cơ sở ngành",
    "total_credits_required": 37,
    "breakdown": {
      "MANDATORY": {
        "name": "Học phần bắt buộc",
        "credits": 28,
        "courses": [
          "ICD10001",
          "ICD10002",
          "ICD10003",
          "ICD10004",
          "ICD10005",
          "ICD10006",
          "ICD10007",
          "ICD10008",
          "ICD10009",
          "ETC10005",
          "ETC10006",
          "ETC10013",
          "ETC10014",
          "ETC10015",
          "ETC10016"
        ]
      },
      "ELECTIVE": {
        "name": "Học phần tự chọn",
        "credits": 9,
        "note": "Tích lũy tổng cộng 9 tín chỉ",
        "courses": [
          "ICD10010",
          "ICD10011",
          "ICD10012",
          "ICD10013",
          "ICD10014",
          "ICD10015",
          "ICD10016",
          "ETC10007",
          "ETC10008",
          "ICD10017",
          "ICD10018",
          "ICD10019",
          "ICD10020",
          "ICD10021",
          "ICD10022"
        ]
      }
    }
  },
  "MAJOR": {
    "name": "Chuyên ngành",
    "total_credits_required": 39,
    "breakdown": {
      "MAJOR_ANALOG_DIGITAL_IC": {
        "name": "Chuyên ngành Thiết kế vi mạch tương tự và số",
        "total_credits_required": 39,
        "breakdown": {
          "MANDATORY": {
            "name": "Học phần bắt buộc",
            "credits": 3,
            "courses": [
              "ICD10311"
            ]
          },
          "ELECTIVE_1": {
            "name": "Tự chọn 1",
            "credits": 15,
            "note": "Chọn tối thiểu 15 tín chỉ theo nhóm môn",
            "courses": [
              "ICD10101",
              "ICD10102",
              "ICD10103",
              "ICD10104",
              "ICD10105",
              "ICD10106",
              "ICD10107",
              "ICD10108",
              "ETC10112",
              "ETC10113",
              "ETC10214",
              "ETC10215"
            ]
          },
          "ELECTIVE_2": {
            "name": "Tự chọn 2",
            "credits": 15,
            "note": "Chọn tối thiểu 15 tín chỉ theo nhóm môn",
            "courses": [
              "ICD10109",
              "ICD10110",
              "ICD10111",
              "ICD10112",
              "ICD10113",
              "ICD10114",
              "ICD10201",
              "ICD10202",
              "ICD10115",
              "ICD10116",
              "ETC10208",
              "ETC10209"
            ]
          },
          "ELECTIVE_3": {
            "name": "Tự chọn 3",
            "credits": 6,
            "note": "Chọn tối thiểu 06 tín chỉ theo nhóm môn",
            "courses": [
              "ICD10307",
              "ICD10308",
              "ICD10309",
              "ICD10310"
            ]
          }
        }
      },
      "MAJOR_SEMICONDUCTOR_DEVICES": {
        "name": "Chuyên ngành Linh kiện vi mạch bán dẫn",
        "total_credits_required": 39,
        "breakdown": {
          "MANDATORY": {
            "name": "Học phần bắt buộc",
            "credits": 3,
            "courses": [
              "ICD10311"
            ]
          },
          "ELECTIVE_1": {
            "name": "Tự chọn 1",
            "credits": 15,
            "note": "Chọn tối thiểu 15 tín chỉ theo nhóm môn",
            "courses": [
              "ICD10101",
              "ICD10102",
              "ICD10103",
              "ICD10104",
              "ICD10105",
              "ICD10106",
              "ICD10107",
              "ICD10108",
              "ETC10112",
              "ETC10113",
              "ETC10214",
              "ETC10215"
            ]
          },
          "ELECTIVE_2": {
            "name": "Tự chọn 2",
            "credits": 15,
            "note": "Chọn tối thiểu 15 tín chỉ theo nhóm môn",
            "courses": [
              "ICD10201",
              "ICD10202",
              "ICD10203",
              "ICD10204",
              "ICD10205",
              "ICD10206",
              "ICD10111",
              "ICD10112",
              "ICD10115",
              "ICD10116",
              "ETC10208",
              "ETC10209"
            ]
          },
          "ELECTIVE_3": {
            "name": "Tự chọn 3",
            "credits": 6,
            "note": "Chọn tối thiểu 06 tín chỉ theo nhóm môn",
            "courses": [
              "ICD10307",
              "ICD10308",
              "ICD10309",
              "ICD10310"
            ]
          }
        }
      },
      "MAJOR_SOC_DESIGN": {
        "name": "Chuyên ngành Thiết kế hệ thống tích hợp trên chip và ứng dụng",
        "total_credits_required": 39,
        "breakdown": {
          "MANDATORY": {
            "name": "Học phần bắt buộc",
            "credits": 3,
            "courses": [
              "ICD10311"
            ]
          },
          "ELECTIVE_1": {
            "name": "Tự chọn 1",
            "credits": 15,
            "note": "Chọn tối thiểu 15 tín chỉ theo nhóm môn",
            "courses": [
              "ICD10101",
              "ICD10102",
              "ICD10103",
              "ICD10104",
              "ICD10105",
              "ICD10106",
              "ICD10107",
              "ICD10108",
              "ETC10112",
              "ETC10113",
              "ETC10214",
              "ETC10215"
            ]
          },
          "ELECTIVE_2": {
            "name": "Tự chọn 2",
            "credits": 15,
            "note": "Chọn tối thiểu 15 tín chỉ theo nhóm môn",
            "courses": [
              "ICD10111",
              "ICD10112",
              "ICD10301",
              "ICD10302",
              "ICD10303",
              "ICD10304",
              "ICD10305",
              "ICD10306",
              "ICD10115",
              "ICD10116",
              "ETC10120",
              "ETC10139",
              "ETC10208",
              "ETC10209"
            ]
          },
          "ELECTIVE_3": {
            "name": "Tự chọn 3",
            "credits": 6,
            "note": "Chọn tối thiểu 06 tín chỉ theo nhóm môn",
            "courses": [
              "ICD10307",
              "ICD10308",
              "ICD10309",
              "ICD10310"
            ]
          }
        }
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
        "name": "Phương án 1",
        "note": "Thực hiện khóa luận tốt nghiệp 10 tín chỉ",
        "courses": [
          "ICD10395"
        ]
      },
      {
        "type": "PROJECT_AND_ELECTIVES",
        "credits": 10,
        "name": "Phương án 2",
        "note": "Thực hiện Đồ án tốt nghiệp 04 tín chỉ và học phần tự chọn 06 tín chỉ",
        "courses": [
          "ICD10390",
          "ICD10113",
          "ICD10114",
          "ICD10201",
          "ICD10202",
          "ICD10305",
          "ICD10306",
          "ETC10208",
          "ETC10209",
          "ETC10120"
        ]
      }
    ]
  }
};