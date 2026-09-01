export const categories = {
  "GENERAL_EDUCATION": {
    "name": "Giáo dục đại cương",
    "total_credits_required": 53,
    "note": "53 tín chỉ không kể Giáo dục thể chất, Giáo dục quốc phòng - An ninh, Tin học cơ sở và Ngoại ngữ (PDF trang 7; bảng tổng hợp trang 6). Các khối bị loại khỏi 53TC vẫn được giữ bên dưới để mọi học phần đều truy cập được.",
    "breakdown": {
      "GENERAL_POLITICAL_LAW": {
        "name": "Lý luận chính trị - Pháp luật",
        "credits_required": 14,
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
        "total_credits_required": 4,
        "breakdown": {
          "MANDATORY": {
            "name": "Học phần bắt buộc",
            "credits_required": 2,
            "mandatory": true,
            "courses": [
              "BAA00110"
            ]
          },
          "ELECTIVE": {
            "name": "Học phần tự chọn",
            "credits_required": 2,
            "mandatory": false,
            "note": "Chọn 1 trong 3 học phần.",
            "courses": [
              "BAA00005",
              "BAA00006",
              "BAA00007"
            ]
          }
        }
      },
      "GENERAL_MATH_SCIENCE": {
        "name": "Toán - Khoa học tự nhiên - Công nghệ - Môi trường",
        "total_credits_required": 35,
        "breakdown": {
          "MANDATORY": {
            "name": "Học phần bắt buộc",
            "credits_required": 26,
            "mandatory": true,
            "courses": [
              "ENM00001",
              "MTH00001",
              "PHY00001",
              "CHE00001",
              "ENV00002",
              "PHY00002",
              "GEO00002",
              "CHE00003",
              "CHE00007",
              "CHE00083"
            ]
          },
          "ELECTIVE_BIOLOGY": {
            "name": "Nhóm tự chọn Sinh học/Sinh thái",
            "credits_required": 3,
            "mandatory": false,
            "note": "Chọn 1 trong 2 học phần.",
            "courses": [
              "BIO00001",
              "ENM00002"
            ]
          },
          "ELECTIVE_MATH": {
            "name": "Nhóm tự chọn Toán",
            "credits_required": 3,
            "mandatory": false,
            "note": "Chọn 1 trong 2 học phần.",
            "courses": [
              "MTH00002",
              "ENM00003"
            ]
          },
          "ELECTIVE_STATISTICS": {
            "name": "Nhóm tự chọn Thống kê",
            "credits_required": 3,
            "mandatory": false,
            "note": "Chọn 1 trong 2 học phần.",
            "courses": [
              "MTH00040",
              "ENV00004"
            ]
          }
        }
      },
      "GENERAL_IT": {
        "name": "Tin học",
        "mandatory": true,
        "note": "Không tính vào điểm trung bình; PDF mục 7.1.4 ghi tính vào số tín chỉ tích lũy, nhưng khối này không nằm trong 53TC giáo dục đại cương và không nằm trong 135TC toàn khóa theo trang 5-7.",
        "courses": [
          "CSC00003"
        ]
      },
      "GENERAL_ENGLISH": {
        "name": "Ngoại ngữ",
        "mandatory": false,
        "note": "Không tính vào điểm trung bình và tín chỉ tích lũy. Sinh viên đạt chuẩn ngoại ngữ đầu ra theo quy định hiện hành thì không đăng ký các học phần Anh văn. Theo quy tắc tương thích UStudy của Project, các học phần này dùng course_type TC.",
        "courses": [
          "ADD00031",
          "ADD00032",
          "ADD00033",
          "ADD00034"
        ]
      },
      "GENERAL_PE": {
        "name": "Giáo dục thể chất",
        "mandatory": true,
        "note": "Không tính vào điểm trung bình; tính vào số tín chỉ tích lũy theo mục 7.1.6; không nằm trong 53TC giáo dục đại cương và 135TC toàn khóa. BAA00022 được chuẩn hóa thành BB vì PDF trang 9 in thiếu một ký tự \"B\" so với BAA00021 trong cùng khối.",
        "courses": [
          "BAA00021",
          "BAA00022"
        ]
      },
      "GENERAL_DEFENSE": {
        "name": "Giáo dục quốc phòng - An ninh",
        "mandatory": true,
        "note": "Không tính vào điểm trung bình; tính vào số tín chỉ tích lũy theo mục 7.1.7; không nằm trong 53TC giáo dục đại cương và 135TC toàn khóa.",
        "courses": [
          "BAA00030"
        ]
      }
    }
  },
  "FOUNDATION": {
    "name": "Kiến thức cơ sở ngành",
    "total_credits_required": 52,
    "breakdown": {
      "MANDATORY": {
        "name": "Học phần bắt buộc",
        "credits_required": 46,
        "mandatory": true,
        "courses": [
          "ENM00005",
          "ENM00006",
          "ENM00007",
          "ENM00008",
          "ENM00009",
          "ENM00011",
          "ENM00012",
          "ENM10001",
          "ENM10002",
          "ENM10003",
          "ENM10004",
          "ENM10005",
          "ENM10006",
          "ENM10007",
          "ENM10008",
          "ENM10009",
          "ENM10010",
          "ENM10011",
          "ENM10012",
          "ENM10013"
        ]
      },
      "ELECTIVE": {
        "name": "Học phần tự chọn",
        "credits_required": 6,
        "mandatory": false,
        "breakdown": {
          "TC1": {
            "name": "Nhóm tự chọn 1",
            "credits_required": 4,
            "mandatory": false,
            "note": "Chọn 2 trong 5 học phần.",
            "courses": [
              "ENM10014",
              "ENM10015",
              "ENM10016",
              "ENM10017",
              "ENM10018"
            ]
          },
          "TC2": {
            "name": "Nhóm tự chọn 2",
            "credits_required": 2,
            "mandatory": false,
            "note": "Chọn 1 trong 2 học phần.",
            "courses": [
              "ENM10019",
              "ENM10020"
            ]
          }
        }
      }
    }
  },
  "MAJOR": {
    "name": "Kiến thức chuyên ngành",
    "total_credits_required": 20,
    "note": "Chọn một trong ba chuyên ngành; mỗi chuyên ngành yêu cầu 20 tín chỉ theo bảng cấu trúc chương trình trang 6.",
    "options": [
      {
        "type": "INTEGRATED_RESOURCE_ENVIRONMENT_MANAGEMENT",
        "name": "Quản lý tổng hợp tài nguyên và môi trường",
        "credits": 20,
        "note": "12 tín chỉ bắt buộc: ENM10101-ENM10105. Tích lũy 8 tín chỉ từ danh sách tự chọn còn lại của chuyên ngành.",
        "courses": [
          "ENM10101",
          "ENM10102",
          "ENM10103",
          "ENM10104",
          "ENM10105",
          "ENM10106",
          "ENM10107",
          "ENM10108",
          "ENM10109",
          "ENM10110",
          "ENM10202",
          "ENM10203",
          "ENM10111",
          "ENM10112",
          "ENM10113"
        ]
      },
      {
        "type": "URBAN_INDUSTRIAL_ENVIRONMENTAL_MANAGEMENT",
        "name": "Quản lý môi trường đô thị và công nghiệp",
        "credits": 20,
        "note": "11 tín chỉ bắt buộc: ENM10201-ENM10205. Tích lũy 9 tín chỉ từ danh sách tự chọn còn lại của chuyên ngành.",
        "courses": [
          "ENM10201",
          "ENM10202",
          "ENM10203",
          "ENM10204",
          "ENM10205",
          "ENM10206",
          "ENM10111",
          "ENM10207",
          "ENM10208",
          "ENM10209",
          "ENM10103",
          "ENM10104",
          "ENM10108",
          "ENM10112",
          "ENM10113"
        ]
      },
      {
        "type": "ENVIRONMENTAL_DATA_SCIENCE_IT",
        "name": "Khoa học dữ liệu và tin học ứng dụng trong môi trường",
        "credits": 20,
        "note": "14 tín chỉ bắt buộc: ENM10301-ENM10305. Tích lũy 6 tín chỉ từ danh sách tự chọn còn lại của chuyên ngành.",
        "courses": [
          "ENM10301",
          "ENM10302",
          "ENM10303",
          "ENM10304",
          "ENM10305",
          "ENM10306",
          "ENM10307",
          "ENM10102",
          "ENM10103",
          "ENM10110",
          "ENM10112",
          "ENM10113",
          "ENM10203",
          "ENM10208"
        ]
      }
    ]
  },
  "GRADUATION": {
    "name": "Kiến thức tốt nghiệp",
    "total_credits_required": 10,
    "note": "Sinh viên chọn 1 trong 2 phương án để tích lũy 10 tín chỉ.",
    "options": [
      {
        "type": "THESIS",
        "name": "Phương án 1: Khóa luận tốt nghiệp",
        "credits": 10,
        "courses": [
          "ENM10195"
        ]
      },
      {
        "type": "SEMINAR_PLUS_ELECTIVES",
        "name": "Phương án 2: Seminar tốt nghiệp và học phần tự chọn",
        "credits": 10,
        "courses": [
          "ENM10190"
        ],
        "note": "Seminar tốt nghiệp 6TC và tích lũy thêm 4TC từ các học phần tự chọn chuyên ngành tại mục 7.2.2.1b, 7.2.2.2b hoặc 7.2.2.3b. Danh sách được phép chọn: ENM10106, ENM10107, ENM10108, ENM10109, ENM10110, ENM10202, ENM10203, ENM10111, ENM10112, ENM10113, ENM10206, ENM10207, ENM10208, ENM10209, ENM10103, ENM10104, ENM10306, ENM10307, ENM10102."
      }
    ]
  }
};
