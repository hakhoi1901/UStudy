export const categories = {
  "GENERAL_EDUCATION": {
    "name": "Giáo dục đại cương",
    "total_credits_required": 53,
    "note": "53 tín chỉ không kể Giáo dục thể chất, Giáo dục quốc phòng - An ninh, Tin học cơ sở và Ngoại ngữ (PDF trang 6-7).",
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
        "total_credits_required": 37,
        "breakdown": {
          "MANDATORY": {
            "name": "Bắt buộc",
            "credits": 34,
            "mandatory": true,
            "courses": [
              "ENV00010",
              "MTH00001",
              "BIO00001",
              "PHY00001",
              "CHE00001",
              "ENV00002",
              "MTH00002",
              "PHY00002",
              "GEO00002",
              "CHE00003",
              "CHE00082",
              "CHE00007",
              "CHE00083"
            ]
          },
          "ELECTIVE_STATISTICS": {
            "name": "Nhóm tự chọn TC2",
            "credits_required": 3,
            "mandatory": false,
            "note": "Chọn 1 trong 2 học phần trong nhóm TC2.",
            "courses": [
              "MTH00040",
              "ENV00004"
            ]
          }
        }
      },
      "GENERAL_IT": {
        "name": "Tin học",
        "credits": 3,
        "mandatory": true,
        "note": "Không tính vào điểm trung bình; tính vào số tín chỉ tích lũy. Không tính trong 53 tín chỉ giáo dục đại cương và tổng 132-135 tín chỉ của chương trình.",
        "courses": [
          "CSC00003"
        ]
      },
      "GENERAL_ENGLISH": {
        "name": "Ngoại ngữ",
        "credits": 12,
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
        "note": "Không tính vào điểm trung bình; tính vào số tín chỉ tích lũy. Không tính trong 53 tín chỉ giáo dục đại cương và tổng 132-135 tín chỉ của chương trình.",
        "courses": [
          "BAA00021",
          "BAA00022"
        ]
      },
      "GENERAL_DEFENSE": {
        "name": "Giáo dục quốc phòng - An ninh",
        "credits": 4,
        "mandatory": true,
        "note": "Không tính vào điểm trung bình; tính vào số tín chỉ tích lũy. Không tính trong 53 tín chỉ giáo dục đại cương và tổng 132-135 tín chỉ của chương trình. PDF không ghi số tiết cho học phần này.",
        "courses": [
          "BAA00030"
        ]
      }
    }
  },
  "FOUNDATION": {
    "name": "Kiến thức cơ sở ngành",
    "total_credits_required": 51,
    "breakdown": {
      "MANDATORY": {
        "name": "Học phần bắt buộc",
        "credits": 47,
        "mandatory": true,
        "courses": [
          "ENV10001",
          "ENV10002",
          "ENV10003",
          "ENV10004",
          "ENV10005",
          "ENV10006",
          "ENV10007",
          "ENV10008",
          "ENV10030",
          "ENV10010",
          "ENV10011",
          "ENV10012",
          "ENV10013",
          "ENV10014",
          "ENV10015",
          "ENV10016",
          "ENV10017",
          "ENV10018",
          "ENV10019",
          "ENV10020",
          "ENV10021"
        ]
      },
      "ELECTIVE": {
        "name": "Học phần tự chọn",
        "credits_required": 4,
        "mandatory": false,
        "note": "Tích lũy ít nhất 4 tín chỉ từ danh sách.",
        "courses": [
          "ENV10022",
          "ENV10023",
          "ENV10024",
          "ENV10025",
          "ENV10027",
          "ENV10026"
        ]
      }
    }
  },
  "MAJOR": {
    "name": "Kiến thức chuyên ngành",
    "note": "Sinh viên học theo một trong 6 chuyên ngành; tổng số tín chỉ chuyên ngành khác nhau theo từng nhánh (PDF trang 6, 11-22).",
    "breakdown": {
      "MAJOR_ENVIRONMENTAL_SCIENCE": {
        "name": "Khoa học môi trường",
        "total_credits_required": 19,
        "breakdown": {
          "MANDATORY": {
            "name": "Bắt buộc",
            "credits": 12,
            "mandatory": true,
            "courses": [
              "ENV10101",
              "ENV10102",
              "ENV10103",
              "ENV10104",
              "ENV10105"
            ]
          },
          "ELECTIVE": {
            "name": "Tự chọn",
            "credits_required": 7,
            "mandatory": false,
            "note": "Tích lũy 7 tín chỉ từ danh sách.",
            "courses": [
              "ENV10106",
              "ENV10116",
              "ENV10117",
              "ENV10118",
              "ENV10114",
              "ENV10122",
              "ENV10124",
              "ENV10125",
              "ENV10126",
              "ENV10128",
              "ENV10147",
              "ENV10161",
              "ENV10160",
              "ENV10162",
              "ENV10157",
              "ENV10172",
              "ENV10158",
              "ENV10159",
              "ENV10174",
              "ENV10175",
              "ENV10176"
            ]
          }
        }
      },
      "MAJOR_ENVIRONMENTAL_MANAGEMENT": {
        "name": "Quản lý Môi trường",
        "total_credits_required": 20,
        "breakdown": {
          "MANDATORY": {
            "name": "Bắt buộc",
            "credits": 13,
            "mandatory": true,
            "courses": [
              "ENV10128",
              "ENV10129",
              "ENV10154",
              "ENV10131",
              "ENV10106"
            ]
          },
          "ELECTIVE": {
            "name": "Tự chọn",
            "credits_required": 7,
            "mandatory": false,
            "note": "Tích lũy 7 tín chỉ từ danh sách.",
            "courses": [
              "ENV10138",
              "ENV10139",
              "ENV10140",
              "ENV10141",
              "ENV10143",
              "ENV10144",
              "ENV10145",
              "ENV10146",
              "ENV10122",
              "ENV10147",
              "ENV10114",
              "ENV10117",
              "ENV10132",
              "ENV10172",
              "ENV10158",
              "ENV10159",
              "ENV10170",
              "ENV10171",
              "ENV10177",
              "ENV10178"
            ]
          }
        }
      },
      "MAJOR_NATURAL_RESOURCES_ENVIRONMENT": {
        "name": "Tài nguyên thiên nhiên và môi trường",
        "total_credits_required": 19,
        "breakdown": {
          "MANDATORY": {
            "name": "Bắt buộc",
            "credits": 12,
            "mandatory": true,
            "courses": [
              "ENV10106",
              "ENV10107",
              "ENV10103",
              "ENV10109",
              "ENV10110"
            ]
          },
          "ELECTIVE": {
            "name": "Tự chọn",
            "credits_required": 7,
            "mandatory": false,
            "note": "Tích lũy ít nhất 7 tín chỉ từ danh sách.",
            "courses": [
              "ENV10116",
              "ENV10117",
              "ENV10118",
              "ENV10147",
              "ENV10114",
              "ENV10122",
              "ENV10160",
              "ENV10124",
              "ENV10125",
              "ENV10126",
              "ENV10128",
              "ENV10161",
              "ENV10162",
              "ENV10157",
              "ENV10172",
              "ENV10158",
              "ENV10159",
              "ENV10174",
              "ENV10175",
              "ENV10176"
            ]
          }
        }
      },
      "MAJOR_MARINE_ENVIRONMENT_RESOURCES": {
        "name": "Môi trường và tài nguyên biển",
        "total_credits_required": 18,
        "breakdown": {
          "MANDATORY": {
            "name": "Bắt buộc",
            "credits": 11,
            "mandatory": true,
            "courses": [
              "ENV10111",
              "ENV10112",
              "ENV10113",
              "ENV10117",
              "ENV10115"
            ]
          },
          "ELECTIVE": {
            "name": "Tự chọn",
            "credits_required": 7,
            "mandatory": false,
            "note": "Tích lũy ít nhất 7 tín chỉ từ danh sách.",
            "courses": [
              "ENV10106",
              "ENV10116",
              "ENV10114",
              "ENV10118",
              "ENV10147",
              "ENV10122",
              "ENV10160",
              "ENV10124",
              "ENV10125",
              "ENV10126",
              "ENV10128",
              "ENV10161",
              "ENV10162",
              "ENV10157",
              "ENV10172",
              "ENV10158",
              "ENV10159",
              "ENV10174",
              "ENV10175",
              "ENV10176"
            ]
          }
        }
      },
      "MAJOR_ENVIRONMENTAL_INFORMATICS": {
        "name": "Tin học Môi trường",
        "total_credits_required": 21,
        "breakdown": {
          "MANDATORY": {
            "name": "Bắt buộc",
            "credits": 13,
            "mandatory": true,
            "courses": [
              "ENV10148",
              "ENV10173",
              "ENV10114",
              "ENV10150",
              "ENV10151"
            ]
          },
          "ELECTIVE": {
            "name": "Tự chọn",
            "credits_required": 8,
            "mandatory": false,
            "note": "Mục 7.2.2.5b yêu cầu tích lũy ít nhất 8 tín chỉ. Kế hoạch giảng dạy trang 43-45 có số liệu không nhất quán; xem validation-report.md.",
            "courses": [
              "ENV10116",
              "ENV10152",
              "ENV10103",
              "ENV10153",
              "ENV10156",
              "ENV10122",
              "ENV10132",
              "ENV10147",
              "ENV10143",
              "ENV10172",
              "ENV10158",
              "ENV10159",
              "ENV10170",
              "ENV10171",
              "ENV10177",
              "ENV10178"
            ]
          }
        }
      },
      "MAJOR_REMOTE_SENSING_GIS": {
        "name": "Viễn thám và GIS ứng dụng trong quản lý tài nguyên thiên nhiên và môi trường",
        "total_credits_required": 19,
        "breakdown": {
          "MANDATORY": {
            "name": "Bắt buộc",
            "credits": 12,
            "mandatory": true,
            "courses": [
              "ENV10132",
              "ENV10133",
              "ENV10134",
              "ENV10135",
              "ENV10136",
              "ENV10137"
            ]
          },
          "ELECTIVE": {
            "name": "Tự chọn",
            "credits_required": 7,
            "mandatory": false,
            "note": "Tích lũy ít nhất 7 tín chỉ từ danh sách. Kế hoạch giảng dạy trang 48 có tổng học kỳ không nhất quán; xem validation-report.md.",
            "courses": [
              "ENV10138",
              "ENV10139",
              "ENV10140",
              "ENV10141",
              "ENV10143",
              "ENV10144",
              "ENV10145",
              "ENV10146",
              "ENV10118",
              "ENV10122",
              "ENV10147",
              "ENV10114",
              "ENV10117",
              "ENV10156",
              "ENV10172",
              "ENV10158",
              "ENV10159",
              "ENV10170",
              "ENV10171",
              "ENV10177",
              "ENV10178"
            ]
          }
        }
      }
    }
  },
  "GRADUATION": {
    "name": "Kiến thức tốt nghiệp",
    "total_credits_required": 10,
    "note": "Sinh viên chọn 1 trong 3 phương án để tích lũy 10 tín chỉ.",
    "options": [
      {
        "type": "THESIS",
        "name": "Phương án 1: Khóa luận tốt nghiệp",
        "credits": 10,
        "courses": [
          "ENV10195"
        ]
      },
      {
        "type": "SEMINAR_AND_ELECTIVES",
        "name": "Phương án 2: Seminar tốt nghiệp và học phần tự chọn",
        "credits": 10,
        "note": "Học ENV10190 (6 tín chỉ) và tích lũy thêm 4 tín chỉ từ các học phần tự chọn chuyên ngành tại mục 7.2.2.1b, 7.2.2.2b, 7.2.2.3b, 7.2.2.4b, 7.2.2.5b, 7.2.2.6b.",
        "courses": [
          "ENV10190"
        ]
      },
      {
        "type": "FREE_ELECTIVES",
        "name": "Phương án 3: Học phần tự chọn tự do",
        "credits": 10,
        "note": "Tích lũy 10 tín chỉ từ các học phần thuộc khối kiến thức chuyên ngành tại mục 7.2.2.1b, 7.2.2.2b, 7.2.2.3b, 7.2.2.4b, 7.2.2.5b, 7.2.2.6b.",
        "courses": []
      }
    ]
  }
};
