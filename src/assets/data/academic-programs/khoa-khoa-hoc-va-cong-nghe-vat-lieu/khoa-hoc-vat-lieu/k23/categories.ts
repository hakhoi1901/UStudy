export const categories = {
  "GENERAL_EDUCATION": {
    "name": "Giáo dục đại cương",
    "total_credits_required": 54,
    "note": "Theo bảng cấu trúc trang 6: 54 tín chỉ, không kể GDQP-AN, GDTC, Tin học cơ sở và ngoại ngữ.",
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
        "total_credits_required": 38,
        "breakdown": {
          "MANDATORY": {
            "name": "Học phần bắt buộc",
            "credits": 34,
            "mandatory": true,
            "courses": [
              "CHE00001",
              "CHE00002",
              "MSC00001",
              "MSC00010",
              "BIO00001",
              "MTH00003",
              "MTH00002",
              "MTH00040",
              "PHY00001",
              "PHY00002",
              "PHY00004",
              "PHY00081"
            ]
          },
          "PRACTICAL_ELECTIVE": {
            "name": "Tự chọn thực hành Hóa đại cương",
            "credits_required": 2,
            "mandatory": false,
            "note": "Chọn 1 trong 2 học phần.",
            "courses": [
              "CHE00081",
              "MSC00002"
            ]
          },
          "SCIENCE_ENVIRONMENT_ELECTIVE": {
            "name": "Tự chọn khoa học - môi trường - an toàn",
            "credits_required": 2,
            "mandatory": false,
            "note": "Chọn 1 trong 3 học phần.",
            "courses": [
              "MST00001",
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
        "note": "Không tính vào điểm trung bình; tính vào số tín chỉ tích lũy. Không nằm trong 54 tín chỉ giáo dục đại cương theo bảng cấu trúc trang 6.",
        "courses": [
          "CSC00003"
        ]
      },
      "GENERAL_ENGLISH": {
        "name": "Ngoại ngữ",
        "mandatory": false,
        "note": "Không tính vào điểm trung bình và tín chỉ tích lũy. Sinh viên đạt chuẩn ngoại ngữ đầu ra theo quy định hiện hành thì không đăng ký học các học phần Anh văn.",
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
        "note": "Không tính vào điểm trung bình; tính vào số tín chỉ tích lũy. Không nằm trong 54 tín chỉ giáo dục đại cương theo bảng cấu trúc trang 6.",
        "courses": [
          "BAA00021",
          "BAA00022"
        ]
      },
      "GENERAL_DEFENSE": {
        "name": "Giáo dục quốc phòng - An ninh",
        "credits": 4,
        "mandatory": true,
        "note": "Không tính vào điểm trung bình; tính vào số tín chỉ tích lũy. Không nằm trong 54 tín chỉ giáo dục đại cương theo bảng cấu trúc trang 6.",
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
        "credits": 34,
        "mandatory": true,
        "courses": [
          "MSC10007",
          "MSC10001",
          "MSC10003",
          "MSC10004",
          "MSC10006",
          "MSC10002",
          "MSC10010",
          "MSC10011",
          "MSC10015",
          "MSC10016",
          "MSC10008",
          "MSC10017",
          "MSC10018",
          "MSC10005"
        ]
      },
      "ELECTIVE": {
        "name": "Học phần tự chọn",
        "credits_required": 3,
        "mandatory": false,
        "note": "Tích lũy tổng cộng 3 tín chỉ từ các học phần trong danh sách.",
        "courses": [
          "MSC10009",
          "MSC10030"
        ]
      }
    }
  },
  "MAJOR": {
    "name": "Kiến thức chuyên ngành",
    "total_credits_required": 30,
    "note": "Cấu trúc CTĐT trang 6 và các bảng 7.2.2 triển khai 3 chuyên ngành, mỗi chuyên ngành 30 tín chỉ.",
    "breakdown": {
      "MAJOR_POLYMER_COMPOSITE": {
        "name": "Chuyên ngành Vật liệu Polymer và Composite",
        "total_credits_required": 30,
        "breakdown": {
          "MANDATORY": {
            "name": "Học phần bắt buộc",
            "credits": 30,
            "mandatory": true,
            "courses": [
              "MSC10222",
              "MSC10203",
              "MSC10209",
              "MSC10204",
              "MSC10219",
              "MSC10211",
              "MSC10217",
              "MSC10206",
              "MSC10221",
              "MSC10208",
              "MSC10202",
              "MSC10201",
              "MSC10218",
              "MSC10220"
            ]
          }
        }
      },
      "MAJOR_BIOMEDICAL_MATERIALS": {
        "name": "Chuyên ngành Vật liệu y sinh",
        "total_credits_required": 30,
        "breakdown": {
          "MANDATORY": {
            "name": "Học phần bắt buộc",
            "credits": 26,
            "mandatory": true,
            "courses": [
              "MSC10302",
              "MSC10312",
              "MSC10304",
              "MSC10307",
              "MSC10305",
              "MSC10306",
              "MSC10319",
              "MSC10320",
              "MSC10314",
              "MSC10315"
            ]
          },
          "ELECTIVE": {
            "name": "Học phần tự chọn",
            "credits_required": 4,
            "mandatory": false,
            "note": "Tích lũy tổng cộng 4 tín chỉ từ các học phần trong danh sách.",
            "courses": [
              "MSC10321",
              "MSC10316",
              "MSC10317",
              "MSC10318"
            ]
          }
        }
      },
      "MAJOR_THIN_FILM": {
        "name": "Chuyên ngành Vật liệu màng mỏng",
        "total_credits_required": 30,
        "breakdown": {
          "MANDATORY": {
            "name": "Học phần bắt buộc",
            "credits": 16,
            "mandatory": true,
            "courses": [
              "MSC10105",
              "MSC10101",
              "MSC10108",
              "MSC10109",
              "MSC10111",
              "MSC10103",
              "MSC10110"
            ]
          },
          "ELECTIVE": {
            "name": "Học phần tự chọn",
            "credits_required": 14,
            "mandatory": false,
            "note": "Tích lũy tổng cộng 14 tín chỉ từ các học phần trong danh sách.",
            "courses": [
              "MSC10107",
              "MSC10112",
              "MSC10114",
              "MSC10115",
              "MSC10116",
              "MSC10118",
              "MSC10119",
              "MSC10120",
              "MSC10113",
              "MSC10104",
              "MST10101",
              "MSC10204",
              "MSC10205",
              "MSC10209",
              "MSC10219"
            ]
          }
        }
      }
    }
  },
  "GRADUATION": {
    "name": "Kiến thức tốt nghiệp",
    "total_credits_required": 10,
    "note": "Sinh viên chọn phương án tốt nghiệp của chuyên ngành để tích lũy đủ tối thiểu 10 tín chỉ.",
    "breakdown": {
      "MAJOR_THIN_FILM": {
        "name": "Chuyên ngành Vật liệu màng mỏng",
        "total_credits_required": 10,
        "options": [
          {
            "type": "THESIS",
            "name": "Phương án 1 - Khóa luận tốt nghiệp",
            "credits": 10,
            "courses": [
              "MSC10195"
            ]
          },
          {
            "type": "SEMINAR",
            "name": "Phương án 2 - Seminar tốt nghiệp và học phần kèm theo",
            "credits": 10,
            "note": "Thực hiện Seminar tốt nghiệp 4 TC và học 06 TC gồm Seminar chuyên đề 3 TC và Hệ thống quản lí chất lượng (QMS) 3 TC.",
            "courses": [
              "MSC10190",
              "MSC10117",
              "MSC10012"
            ]
          }
        ]
      },
      "MAJOR_POLYMER_COMPOSITE": {
        "name": "Chuyên ngành Vật liệu Polymer và Composite",
        "total_credits_required": 10,
        "options": [
          {
            "type": "THESIS",
            "name": "Phương án 1 - Khóa luận tốt nghiệp",
            "credits": 10,
            "courses": [
              "MSC10295"
            ]
          },
          {
            "type": "SEMINAR",
            "name": "Phương án 2 - Seminar tốt nghiệp và tự chọn chuyên đề",
            "credits_required": 10,
            "note": "Mục 7.2.3.2 trang 15: Seminar tốt nghiệp 6 TC và học tối thiểu 4 TC từ danh sách tự chọn. Kế hoạch trang 22 ghi 'chọn 2 trong 5 môn'; xem cảnh báo trong validation-report.md. Chi tiết quy tắc đã gộp cho giao diện: Seminar tốt nghiệp — 6 tín chỉ — bắt buộc; Tự chọn chuyên đề tốt nghiệp — yêu cầu 4 tín chỉ — tự chọn — Tích lũy tối thiểu 4 tín chỉ từ danh sách.",
            "courses": [
              "MSC10290",
              "MSC10214",
              "MSC10215",
              "MSC10216",
              "MSC10213",
              "MSC10012"
            ]
          },
          {
            "type": "COURSEWORK",
            "name": "Phương án 3 - Học phần chuyên đề tốt nghiệp",
            "credits_required": 10,
            "mandatory": false,
            "note": "Mục 7.2.3.2 trang 15: học tối thiểu 10 TC từ danh sách. Kế hoạch trang 22 ghi 'chọn 4 môn chuyên đề tốt nghiệp (tối thiểu 10 TC)'.",
            "courses": [
              "MSC10214",
              "MSC10215",
              "MSC10216",
              "MSC10213",
              "MSC10012"
            ]
          }
        ]
      },
      "MAJOR_BIOMEDICAL_MATERIALS": {
        "name": "Chuyên ngành Vật liệu y sinh",
        "total_credits_required": 10,
        "options": [
          {
            "type": "THESIS",
            "name": "Phương án 1 - Khóa luận tốt nghiệp",
            "credits": 10,
            "courses": [
              "MSC10395"
            ]
          },
          {
            "type": "SEMINAR",
            "name": "Phương án 2 - Seminar tốt nghiệp và học phần kèm theo",
            "credits": 10,
            "note": "Thực hiện Seminar tốt nghiệp 4 TC và học 06 TC gồm Thiết bị và Công nghệ Vật liệu Y Sinh 3 TC và Hệ thống quản lí chất lượng (QMS) 3 TC.",
            "courses": [
              "MSC10390",
              "MSC10313",
              "MSC10012"
            ]
          }
        ]
      }
    }
  }
};
