
export const categories = {
  "GENERAL_EDUCATION": {
    "name": "Giáo dục đại cương",
    "total_credits_required": 52,
    "note": "Không kể môn GDQP-AN, Ngoại ngữ, Tin học cơ sở và GDTC",
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
        "name": "Khoa học xã hội – Kinh tế - Kỹ năng",
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
        "credits": 36,
        "mandatory": true,
        "breakdown": {
          "MANDATORY": {
            "name": "Toán - Khoa học tự nhiên - Công nghệ bắt buộc",
            "credits_required": 25,
            "courses": [
              "MTH00003",
              "MTH00004",
              "MTH00030",
              "MTH00040",
              "ETC00001",
              "ETC00002",
              "ETC00003",
              "ETC00004",
              "ETC00081",
              "ETC00082"
            ]
          },
          "ELECTIVE_1": {
            "name": "Tự chọn 1",
            "credits_required": 3,
            "note": "Chọn 1 trong 2 học phần",
            "courses": [
              "CSC00005",
              "ETC00005"
            ]
          },
          "ELECTIVE_2": {
            "name": "Tự chọn 2",
            "credits_required": 6,
            "note": "Chọn 2 trong 3 học phần",
            "courses": [
              "PHY00001",
              "PHY00002",
              "PHY00004"
            ]
          },
          "ELECTIVE_3": {
            "name": "Tự chọn 3",
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
    "total_credits_required": 35,
    "mandatory": true,
    "courses": [
      "ETC10001",
      "ETC10002",
      "ETC10003",
      "ETC10004",
      "ETC10005",
      "ETC10006",
      "ETC10007",
      "ETC10008",
      "ETC10009",
      "ETC10010",
      "ETC10020",
      "ETC10021",
      "ETC10013",
      "ETC10014",
      "ETC10015",
      "ETC10016",
      "ETC10017",
      "ETC10018",
      "ETC10019"
    ]
  },
  "MAJOR": {
    "name": "Chuyên ngành",
    "total_credits_required": 34,
    "breakdown": {
      "MAJOR_ELECTRONICS": {
        "name": "Chuyên ngành Điện tử",
        "total_credits_required": 34,
        "breakdown": {
          "MANDATORY": {
            "credits": 26,
            "courses": [
              "ETC10101",
              "ETC10102",
              "ETC10103",
              "ETC10104",
              "ETC10105",
              "ETC10106",
              "ETC10107",
              "ETC10108",
              "ETC10109",
              "ETC10110",
              "ETC10111"
            ]
          },
          "ELECTIVE": {
            "credits": 8,
            "note": "Sinh viên chọn học để tích lũy được 08 TC trong các nhóm",
            "breakdown": {
              "ELECTIVE_1": {
                "credits": 3,
                "note": "SV chọn tối thiểu 3 TC",
                "courses": [
                  "ETC10112",
                  "ETC10113",
                  "ETC10114",
                  "ETC10115",
                  "ETC10236"
                ]
              },
              "ELECTIVE_2": {
                "credits": 3,
                "note": "SV chọn tối thiểu 3 TC",
                "courses": [
                  "ETC10116",
                  "ETC10117",
                  "ETC10137"
                ]
              },
              "ELECTIVE_3": {
                "credits": 2,
                "note": "SV chọn tối thiểu 2 TC",
                "courses": [
                  "ETC10118",
                  "ETC10119",
                  "ETC10138"
                ]
              }
            }
          }
        }
      },
      "MAJOR_COMPUTER_EMBEDDED": {
        "name": "Chuyên ngành Máy Tính – Hệ Thống Nhúng",
        "total_credits_required": 34,
        "breakdown": {
          "MANDATORY": {
            "credits": 26,
            "courses": [
              "ETC10201",
              "ETC10202",
              "ETC10203",
              "ETC10204",
              "ETC10205",
              "ETC10206",
              "ETC10207",
              "ETC10208",
              "ETC10209",
              "ETC10210",
              "ETC10211",
              "ETC10212",
              "ETC10213",
              "ETC10214",
              "ETC10215"
            ]
          },
          "ELECTIVE": {
            "credits": 8,
            "note": "Sinh viên chọn học để tích lũy được 08 TC trong các nhóm",
            "breakdown": {
              "ELECTIVE_1": {
                "credits": 2,
                "note": "SV chọn tối thiểu 2 TC",
                "courses": [
                  "ETC10216",
                  "ETC10217",
                  "ETC10218",
                  "ETC10307",
                  "ETC10236"
                ]
              },
              "ELECTIVE_2": {
                "credits": 3,
                "note": "SV chọn 3 TC (chọn 1 nhóm học phần)",
                "courses": [
                  "ETC10219",
                  "ETC10220",
                  "ETC10221",
                  "ETC10222"
                ]
              },
              "ELECTIVE_3": {
                "credits": 3,
                "note": "SV chọn tối thiểu 3 TC (chọn 1 nhóm học phần)",
                "courses": [
                  "ETC10223",
                  "ETC10224",
                  "ETC10225",
                  "ETC10226",
                  "ETC10227",
                  "ETC10228",
                  "ETC10229",
                  "ETC10230"
                ]
              }
            }
          }
        }
      },
      "MAJOR_TELECOM_NETWORK": {
        "name": "Chuyên ngành Viễn Thông – Mạng",
        "total_credits_required": 34,
        "breakdown": {
          "MANDATORY": {
            "credits": 22,
            "courses": [
              "ETC10301",
              "ETC10302",
              "ETC10303",
              "ETC10304",
              "ETC10305",
              "ETC10306",
              "ETC10307",
              "ETC10308",
              "ETC10309",
              "ETC10310",
              "ETC10311",
              "ETC10312",
              "ETC10313"
            ]
          },
          "ELECTIVE": {
            "credits": 12,
            "note": "Sinh viên chọn học để tích lũy được 12 TC trong các nhóm",
            "breakdown": {
              "ELECTIVE_1": {
                "credits": 9,
                "note": "SV chọn 9 TC (chọn 1 nhóm môn)",
                "courses": [
                  "ETC10314",
                  "ETC10315",
                  "ETC10316",
                  "ETC10320",
                  "ETC10317",
                  "ETC10318",
                  "ETC10319",
                  "ETC10321",
                  "ETC10322",
                  "ETC10323"
                ]
              },
              "ELECTIVE_2": {
                "credits": 3,
                "note": "SV chọn 03 TC",
                "courses": [
                  "ETC10227",
                  "ETC10228",
                  "ETC10324",
                  "ETC10325",
                  "ETC10326",
                  "ETC10327",
                  "ETC10328",
                  "ETC10330",
                  "ETC10236",
                  "ETC10331",
                  "ETC10332"
                ]
              }
            }
          }
        }
      }
    }
  },
  "GRADUATION": {
    "name": "Kiến thức tốt nghiệp",
    "total_credits_required": 10,
    "breakdown": {
      "GRADUATION_ELECTRONICS": {
        "name": "Tốt nghiệp Chuyên ngành Điện tử",
        "options": [
          {
            "type": "THESIS",
            "credits": 10,
            "courses": [
              "ETC10195"
            ]
          },
          {
            "type": "PROJECT_AND_ELECTIVES",
            "credits": 10,
            "note": "Thực hiện Đồ án tốt nghiệp 04 tín chỉ và học 06 tín chỉ tự chọn",
            "courses": [
              "ETC10190",
              "ETC10120",
              "ETC10121",
              "ETC10139"
            ]
          }
        ]
      },
      "GRADUATION_COMPUTER_EMBEDDED": {
        "name": "Tốt nghiệp Chuyên ngành Máy Tính – Hệ Thống Nhúng",
        "options": [
          {
            "type": "THESIS",
            "credits": 10,
            "courses": [
              "ETC10295"
            ]
          },
          {
            "type": "PROJECT_AND_ELECTIVES",
            "credits": 10,
            "note": "Thực hiện Đồ án tốt nghiệp 04 tín chỉ và học 06 tín chỉ tự chọn",
            "courses": [
              "ETC10290",
              "ETC10231",
              "ETC10232",
              "ETC10233"
            ]
          }
        ]
      },
      "GRADUATION_TELECOM_NETWORK": {
        "name": "Tốt nghiệp Chuyên ngành Viễn Thông – Mạng",
        "options": [
          {
            "type": "THESIS",
            "credits": 10,
            "courses": [
              "ETC10395"
            ]
          },
          {
            "type": "PROJECT_AND_ELECTIVES",
            "credits": 10,
            "note": "Thực hiện Đồ án tốt nghiệp 04 tín chỉ và học 06 tín chỉ tự chọn (không được tính 3TC sinh viên đã tích lũy tại mục tự chọn 2)",
            "courses": [
              "ETC10390",
              "ETC10227",
              "ETC10228",
              "ETC10324",
              "ETC10325",
              "ETC10326",
              "ETC10327",
              "ETC10328",
              "ETC10330",
              "ETC10236",
              "ETC10331",
              "ETC10332"
            ]
          }
        ]
      }
    }
  }
};
