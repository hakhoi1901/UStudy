export const categories = {
  "GENERAL_EDUCATION": {
    "name": "Giáo dục đại cương",
    "total_credits_required": 47,
    "note": "47 tín chỉ dùng trong tổng 127; không kể Giáo dục thể chất, Giáo dục quốc phòng - An ninh, Tin học cơ sở và Ngoại ngữ.",
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
        "total_credits_required": 31,
        "breakdown": {
          "MANDATORY": {
            "name": "Học phần bắt buộc",
            "credits": 28,
            "mandatory": true,
            "courses": [
              "MTH00001",
              "MTH00002",
              "MTH00040",
              "MTH00085",
              "PHY00001",
              "PHY00004",
              "CHE00002",
              "CHE00003",
              "CHE00081",
              "ENV00001",
              "GEO00010"
            ]
          },
          "ELECTIVE": {
            "name": "Học phần tự chọn Sinh đại cương",
            "credits_required": 3,
            "mandatory": false,
            "note": "Chọn 1 trong 2 học phần Sinh đại cương.",
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
        "note": "Không tính vào điểm trung bình; tính vào số tín chỉ tích lũy; không nằm trong 47 tín chỉ giáo dục đại cương dùng để tính tổng 127.",
        "courses": [
          "CSC00003"
        ]
      },
      "GENERAL_ENGLISH": {
        "name": "Ngoại ngữ",
        "credits": 12,
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
        "credits": 4,
        "mandatory": true,
        "note": "Không tính vào điểm trung bình; tính vào số tín chỉ tích lũy; không nằm trong 47 tín chỉ giáo dục đại cương dùng để tính tổng 127.",
        "courses": [
          "BAA00021",
          "BAA00022"
        ]
      },
      "GENERAL_DEFENSE": {
        "name": "Giáo dục quốc phòng - An ninh",
        "credits": 4,
        "mandatory": true,
        "note": "Không tính vào điểm trung bình; tính vào số tín chỉ tích lũy; không nằm trong 47 tín chỉ giáo dục đại cương dùng để tính tổng 127.",
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
        "name": "Học phần bắt buộc",
        "credits": 36,
        "mandatory": true,
        "courses": [
          "GEO10051",
          "GEO10002",
          "GEO10052",
          "GEO10053",
          "GEO10054",
          "GEO10009",
          "GEO10055",
          "GEO10056",
          "GEO10057",
          "GEO10013",
          "GEO10058",
          "GEO10059",
          "GEO10062",
          "GEO10063",
          "GEO10029",
          "GEO10025",
          "GEO20201"
        ]
      },
      "ELECTIVE": {
        "name": "Học phần tự chọn",
        "credits_required": 4,
        "mandatory": false,
        "note": "Tích lũy tổng cộng 4 tín chỉ từ danh sách học phần tự chọn.",
        "courses": [
          "GEO10064",
          "GEO10061",
          "GEO10066",
          "GEO10032",
          "GEO10067",
          "GEO10068",
          "GEO10069",
          "GEO10065",
          "GEO10060"
        ]
      }
    }
  },
  "MAJOR": {
    "name": "Kiến thức chuyên ngành",
    "total_credits_required": 30,
    "note": "Chương trình được thiết kế theo 02 chuyên ngành; mỗi lộ trình tích lũy 26 tín chỉ bắt buộc và 4 tín chỉ tự chọn.",
    "breakdown": {
      "MAJOR_MINERAL_EXPLORATION": {
        "name": "Tìm kiếm thăm dò Khoáng sản",
        "total_credits_required": 30,
        "breakdown": {
          "MANDATORY": {
            "name": "Học phần bắt buộc",
            "credits": 26,
            "mandatory": true,
            "courses": [
              "GEO20101",
              "GEO20102",
              "GEO10113",
              "GEO20117",
              "GEO20105",
              "GEO20108",
              "GEO20109",
              "GEO20110",
              "GEO20118",
              "GEO20119",
              "GEO20114",
              "GEO10114"
            ]
          },
          "ELECTIVE": {
            "name": "Học phần tự chọn",
            "credits_required": 4,
            "mandatory": false,
            "note": "Tích lũy tổng cộng 4 tín chỉ từ danh sách học phần tự chọn của chuyên ngành.",
            "courses": [
              "GEO20106",
              "GEO20120",
              "GEO10112",
              "GEO20121"
            ]
          }
        }
      },
      "MAJOR_ENGINEERING_GEOLOGY": {
        "name": "Địa kỹ thuật",
        "total_credits_required": 30,
        "breakdown": {
          "MANDATORY": {
            "name": "Học phần bắt buộc",
            "credits": 26,
            "mandatory": true,
            "note": "Mã GEO10413 của học phần “Các phương pháp xử lý nền” lấy theo bảng nội dung CTĐT trang 10. Kế hoạch giảng dạy trang 15 dùng mã GEO20208 cho “Phương pháp xử lý nền”; đây là xung đột nguồn và cần kiểm tra thủ công.",
            "courses": [
              "GEO20202",
              "GEO20204",
              "GEO20205",
              "GEO20206",
              "GEO20207",
              "GEO10413",
              "GEO20209",
              "GEO20210",
              "GEO20212",
              "GEO10114"
            ]
          },
          "ELECTIVE": {
            "name": "Học phần tự chọn",
            "credits_required": 4,
            "mandatory": false,
            "note": "Tích lũy tổng cộng 4 tín chỉ từ danh sách học phần tự chọn của chuyên ngành.",
            "courses": [
              "GEO20214",
              "GEO20217",
              "GEO20211",
              "GEO20218"
            ]
          }
        }
      }
    }
  },
  "GRADUATION": {
    "name": "Kiến thức tốt nghiệp",
    "total_credits_required": 10,
    "note": "Sinh viên chọn 1 trong 2 phương án để tích lũy đủ 10 tín chỉ; dùng học phần tốt nghiệp tương ứng với chuyên ngành.",
    "options": [
      {
        "type": "THESIS",
        "name": "Khóa luận tốt nghiệp - Tìm kiếm thăm dò Khoáng sản",
        "credits": 10,
        "courses": [
          "GEO20115"
        ]
      },
      {
        "type": "THESIS",
        "name": "Khóa luận tốt nghiệp - Địa kỹ thuật",
        "credits": 10,
        "courses": [
          "GEO20215"
        ]
      },
      {
        "type": "PROJECT",
        "name": "Đồ án tốt nghiệp - Tìm kiếm thăm dò Khoáng sản",
        "credits": 10,
        "note": "Đồ án tốt nghiệp 6 tín chỉ + chọn 4 tín chỉ học phần của chuyên ngành, không trùng với các môn đã học ở mục 7.2.2. PDF không liệt kê một danh sách bổ sung riêng ngoài các học phần chuyên ngành ở mục 7.2.2.",
        "courses": [
          "GEO20116"
        ]
      },
      {
        "type": "PROJECT",
        "name": "Đồ án tốt nghiệp - Địa kỹ thuật",
        "credits": 10,
        "note": "Đồ án tốt nghiệp 6 tín chỉ + chọn 4 tín chỉ học phần của chuyên ngành, không trùng với các môn đã học ở mục 7.2.2. PDF không liệt kê một danh sách bổ sung riêng ngoài các học phần chuyên ngành ở mục 7.2.2.",
        "courses": [
          "GEO20216"
        ]
      }
    ]
  }
};
