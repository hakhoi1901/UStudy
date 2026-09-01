export const categories = {
  "GENERAL_EDUCATION": {
    "name": "Giáo dục đại cương",
    "total_credits_required": 53,
    "note": "53 TC không kể Giáo dục thể chất, Giáo dục quốc phòng - An ninh, Tin học cơ sở và Ngoại ngữ; các nhóm này vẫn được giữ bên dưới để không làm mất học phần trong PDF.",
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
        "note": "Nhóm TC1: chọn 1 trong 3 học phần, tích lũy 2 TC.",
        "courses": [
          "BAA00005",
          "BAA00007",
          "BAA00006"
        ]
      },
      "GENERAL_MATH_SCIENCE": {
        "name": "Toán - Khoa học tự nhiên - Công nghệ - Môi trường",
        "total_credits_required": 37,
        "breakdown": {
          "MANDATORY": {
            "credits": 34,
            "mandatory": true,
            "courses": [
              "CHE00001",
              "ENV00002",
              "MTH00002",
              "PHY00002",
              "GEO00002",
              "CHE00003",
              "CHE00082",
              "CHE00007",
              "CHE00083",
              "ENV00011",
              "MTH00001",
              "BIO00001",
              "PHY00001"
            ]
          },
          "ELECTIVE_TC2": {
            "credits_required": 3,
            "mandatory": false,
            "note": "Nhóm TC2: chọn 1 trong 2 học phần, tích lũy 3 TC.",
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
        "note": "Tin học cơ sở: 3 TC; không tính vào điểm trung bình, tính vào tín chỉ tích lũy; đồng thời được loại khỏi tổng 53 TC đại cương và tổng 131 TC theo bảng cấu trúc CTĐT.",
        "courses": [
          "CSC00003"
        ]
      },
      "GENERAL_ENGLISH": {
        "name": "Ngoại ngữ",
        "credits_required": 12,
        "mandatory": false,
        "note": "Anh văn 1-4, tổng 12 TC. Không tính vào điểm trung bình và số tín chỉ tích lũy. Sinh viên đạt chuẩn ngoại ngữ đầu ra theo quy định hiện hành thì không đăng ký học các học phần Anh văn. Theo quy tắc tương thích UStudy, các học phần này dùng course_type TC và nhóm mandatory=false. Ngoại ngữ được loại khỏi tổng 53 TC đại cương và tổng 131 TC theo bảng cấu trúc CTĐT.",
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
        "note": "Tổng 4 TC; không tính vào điểm trung bình, tính vào tín chỉ tích lũy; được loại khỏi tổng 53 TC đại cương và tổng 131 TC theo bảng cấu trúc CTĐT.",
        "courses": [
          "BAA00021",
          "BAA00022"
        ]
      },
      "GENERAL_DEFENSE": {
        "name": "Giáo dục quốc phòng - An ninh",
        "mandatory": true,
        "note": "4 TC; không tính vào điểm trung bình, tính vào tín chỉ tích lũy; được loại khỏi tổng 53 TC đại cương và tổng 131 TC theo bảng cấu trúc CTĐT.",
        "courses": [
          "BAA00030"
        ]
      }
    }
  },
  "FOUNDATION": {
    "name": "Kiến thức cơ sở ngành",
    "total_credits_required": 49,
    "breakdown": {
      "MANDATORY": {
        "credits": 41,
        "mandatory": true,
        "courses": [
          "ENE10001",
          "ENE10002",
          "ENE10003",
          "ENE10004",
          "ENE10005",
          "ENE10006",
          "ENE10007",
          "ENE10008",
          "ENE10009",
          "ENE10010",
          "ENE10011",
          "ENE10012",
          "ENE10013",
          "ENE10014",
          "ENE10015",
          "ENE10017",
          "ENE10031"
        ]
      },
      "ELECTIVE": {
        "credits_required": 8,
        "mandatory": false,
        "note": "Chọn học để tích lũy đủ 8 TC trong danh sách.",
        "courses": [
          "ENE10019",
          "ENE10016",
          "ENE10032",
          "ENE10020",
          "ENE10021",
          "ENE10022",
          "ENE10023",
          "ENE10024",
          "ENE10025",
          "ENE10026",
          "ENE10027",
          "ENE10030"
        ]
      }
    }
  },
  "MAJOR": {
    "name": "Kiến thức chuyên ngành",
    "total_credits_required": 19,
    "note": "Sinh viên theo một trong hai chuyên ngành; mỗi chuyên ngành tích lũy 13 TC bắt buộc và 6 TC tự chọn.",
    "breakdown": {
      "MAJOR_WATER_SOIL": {
        "name": "Công nghệ môi trường Nước và Đất",
        "total_credits_required": 19,
        "breakdown": {
          "MANDATORY": {
            "credits": 13,
            "mandatory": true,
            "courses": [
              "ENE10166",
              "ENE10102",
              "ENE10103",
              "ENE10104",
              "ENE10105",
              "ENE10106"
            ]
          },
          "ELECTIVE": {
            "credits_required": 6,
            "mandatory": false,
            "note": "Chọn học để tích lũy đủ 6 TC trong danh sách mục 7.2.2.1b.",
            "courses": [
              "ENE10156",
              "ENE10157",
              "ENE10158",
              "ENE10159",
              "ENE10160",
              "ENE10163",
              "ENE10150",
              "ENE10151",
              "ENE10153",
              "ENE10155",
              "ENE10164",
              "ENE10165",
              "ENE10167",
              "ENE10168",
              "ENE10169",
              "ENE10170",
              "ENE10171",
              "ENE10172",
              "ENE10173",
              "ENE10174",
              "ENE10175",
              "ENE10176",
              "ENE10177",
              "ENE10178"
            ]
          }
        }
      },
      "MAJOR_AIR_SOLID_WASTE": {
        "name": "Công nghệ Môi trường Không khí và Chất thải rắn",
        "total_credits_required": 19,
        "breakdown": {
          "MANDATORY": {
            "credits": 13,
            "mandatory": true,
            "courses": [
              "ENE10150",
              "ENE10151",
              "ENE10152",
              "ENE10153",
              "ENE10154",
              "ENE10177"
            ]
          },
          "ELECTIVE": {
            "credits_required": 6,
            "mandatory": false,
            "note": "Chọn học để tích lũy đủ 6 TC trong danh sách mục 7.2.2.2b.",
            "courses": [
              "ENE10156",
              "ENE10157",
              "ENE10158",
              "ENE10159",
              "ENE10160",
              "ENE10163",
              "ENE10103",
              "ENE10104",
              "ENE10105",
              "ENE10164",
              "ENE10165",
              "ENE10166",
              "ENE10167",
              "ENE10168",
              "ENE10169",
              "ENE10170",
              "ENE10171",
              "ENE10172",
              "ENE10173",
              "ENE10174",
              "ENE10175",
              "ENE10176",
              "ENE10178"
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
        "name": "Phương án 1 - Khóa luận tốt nghiệp",
        "credits": 10,
        "courses": [
          "ENE10195"
        ]
      },
      {
        "type": "SEMINAR_AND_ELECTIVES",
        "name": "Phương án 2 - Seminar tốt nghiệp và học phần tự chọn",
        "credits": 10,
        "courses": [
          "ENE10190"
        ],
        "note": "Phương án 2: Seminar tốt nghiệp 6 TC và tích lũy thêm 4 TC học phần tự chọn thuộc khối kiến thức chuyên ngành tại mục 7.2.2.1b hoặc 7.2.2.2b. Danh sách 7.2.2.1b (Công nghệ môi trường Nước và Đất): ENE10156, ENE10157, ENE10158, ENE10159, ENE10160, ENE10163, ENE10150, ENE10151, ENE10153, ENE10155, ENE10164, ENE10165, ENE10167, ENE10168, ENE10169, ENE10170, ENE10171, ENE10172, ENE10173, ENE10174, ENE10175, ENE10176, ENE10177, ENE10178. Danh sách 7.2.2.2b (Công nghệ Môi trường Không khí và Chất thải rắn): ENE10156, ENE10157, ENE10158, ENE10159, ENE10160, ENE10163, ENE10103, ENE10104, ENE10105, ENE10164, ENE10165, ENE10166, ENE10167, ENE10168, ENE10169, ENE10170, ENE10171, ENE10172, ENE10173, ENE10174, ENE10175, ENE10176, ENE10178. Không tạo học phần giả cho dòng 4 TC không có mã học phần trong PDF."
      }
    ]
  }
};
