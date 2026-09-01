export const categories = {
  "GENERAL_EDUCATION": {
    "name": "Giáo dục đại cương",
    "total_credits_required": 56,
    "note": "Tổng 56 tín chỉ không kể Ngoại ngữ, Giáo dục thể chất và Giáo dục quốc phòng - an ninh.",
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
        "note": "Chọn 01 học phần, tích lũy 02 tín chỉ.",
        "courses": [
          "BAA00005",
          "BAA00006",
          "BAA00007"
        ]
      },
      "GENERAL_MATH_SCIENCE": {
        "name": "Toán - Khoa học tự nhiên - Công nghệ - Môi trường",
        "total_credits_required": 36,
        "breakdown": {
          "MATH_MANDATORY": {
            "name": "Toán bắt buộc",
            "credits": 24,
            "mandatory": true,
            "courses": [
              "MTH00003",
              "MTH00081",
              "MTH00004",
              "MTH00082",
              "MTH00030",
              "MTH00083",
              "MTH00040",
              "MTH00085",
              "MTH00041",
              "MTH00086",
              "MTH00050"
            ]
          },
          "MATH_ELECTIVE": {
            "name": "Toán tự chọn",
            "credits_required": 4,
            "mandatory": false,
            "note": "Chọn 01 học phần (04 tín chỉ).",
            "courses": [
              "MTH00051",
              "MTH00052",
              "MTH00053",
              "MTH00054"
            ]
          },
          "EARTH_ENVIRONMENT_ELECTIVE": {
            "name": "Khoa học Trái đất/Môi trường tự chọn",
            "credits_required": 2,
            "mandatory": false,
            "note": "Chọn 01 học phần (02 tín chỉ).",
            "courses": [
              "GEO00002",
              "ENV00001",
              "ENV00003"
            ]
          },
          "NATURAL_SCIENCE_ELECTIVE": {
            "name": "Khoa học tự nhiên tự chọn",
            "credits_required": 6,
            "mandatory": false,
            "note": "Chọn đủ 06 tín chỉ từ danh sách.",
            "courses": [
              "CHE00001",
              "CHE00002",
              "CHE00081",
              "CHE00082",
              "BIO00001",
              "BIO00002",
              "BIO00081",
              "BIO00082",
              "PHY00001",
              "PHY00002",
              "PHY00081"
            ]
          }
        }
      },
      "GENERAL_IT": {
        "name": "Tin học",
        "credits": 4,
        "mandatory": true,
        "courses": [
          "CSC00004"
        ]
      },
      "GENERAL_ENGLISH": {
        "name": "Ngoại ngữ",
        "mandatory": false,
        "note": "Không tính vào điểm trung bình và tín chỉ tích lũy của khối 56 tín chỉ. Sinh viên đạt chuẩn ngoại ngữ đầu ra theo quy định hiện hành thì không đăng ký học các học phần Anh văn. Theo quy tắc tương thích UStudy của Project, các học phần này dùng course_type TC.",
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
        "note": "Không tính vào điểm trung bình; PDF ghi tính vào số tín chỉ tích lũy nhưng khối lượng toàn khóa 138 tín chỉ không kể GDTC.",
        "courses": [
          "BAA00021",
          "BAA00022"
        ]
      },
      "GENERAL_DEFENSE": {
        "name": "Giáo dục quốc phòng - an ninh",
        "mandatory": true,
        "note": "Không tính vào điểm trung bình; PDF ghi tính vào số tín chỉ tích lũy nhưng khối lượng toàn khóa 138 tín chỉ không kể GDQPAN.",
        "courses": [
          "BAA00030"
        ]
      }
    }
  },
  "FOUNDATION": {
    "name": "Kiến thức cơ sở ngành",
    "total_credits_required": 38,
    "mandatory": true,
    "courses": [
      "CSC10001",
      "CSC10002",
      "CSC10003",
      "CSC10004",
      "CSC10006",
      "CSC10007",
      "CSC10008",
      "CSC10009",
      "CSC13002",
      "CSC14003"
    ]
  },
  "MAJOR": {
    "name": "Kiến thức ngành/chuyên ngành",
    "total_credits_required": 34,
    "breakdown": {
      "MAJOR_MANDATORY": {
        "name": "Kiến thức bắt buộc ngành/chuyên ngành",
        "credits": 8,
        "mandatory": true,
        "note": "Tích lũy 02 học phần (08 tín chỉ).",
        "courses": [
          "CSC14007",
          "CSC14008"
        ]
      },
      "MAJOR_ELECTIVE": {
        "name": "Kiến thức tự chọn ngành/chuyên ngành",
        "credits_required": 26,
        "mandatory": false,
        "note": "Tích lũy ít nhất 26 tín chỉ từ danh sách Phụ lục 1. Kế hoạch giảng dạy dự kiến ghi một số học phần tự chọn đặc thù cho chương trình Cử nhân Tài năng, gồm CSC10121, CSC10105, CSC10106 và CSC10107; đây không phải một yêu cầu chọn riêng.",
        "breakdown": {
          "NETWORKING_7221": {
            "name": "CNTT - Mạng máy tính, nhóm thuộc mục 7.2.2.1",
            "mandatory": false,
            "courses": [
              "CSC11002",
              "CSC11003",
              "CSC11004",
              "CSC11006",
              "CSC11007",
              "CSC11106",
              "CSC11115",
              "CSC11116",
              "CSC11117",
              "CSC11118"
            ]
          },
          "NETWORKING_7231": {
            "name": "CNTT - Mạng máy tính, nhóm thuộc mục 7.2.3.1",
            "mandatory": false,
            "courses": [
              "CSC11111",
              "CSC11112",
              "CSC11119"
            ]
          },
          "INFORMATION_SYSTEMS_722": {
            "name": "Hệ thống thông tin, nhóm thuộc mục 7.2.2",
            "mandatory": false,
            "courses": [
              "CSC12001",
              "CSC12002",
              "CSC12003",
              "CSC12004",
              "CSC12005",
              "CSC10121",
              "CSC10103",
              "CSC10104",
              "CSC10105",
              "CSC10106",
              "CSC10107",
              "CSC10108",
              "CSC12102",
              "CSC12103",
              "CSC12105",
              "CSC12106",
              "CSC12109",
              "CSC12110",
              "CSC17101"
            ]
          },
          "INFORMATION_SYSTEMS_723": {
            "name": "Hệ thống thông tin, nhóm thuộc mục 7.2.3",
            "mandatory": false,
            "courses": [
              "CSC12107",
              "CSC12108",
              "CSC12111"
            ]
          },
          "SOFTWARE_ENGINEERING_722": {
            "name": "Kỹ thuật phần mềm, nhóm thuộc mục 7.2.2",
            "mandatory": false,
            "courses": [
              "CSC13003",
              "CSC13005",
              "CSC13006",
              "CSC13007",
              "CSC13008",
              "CSC13009",
              "CSC13010",
              "CSC13106",
              "CSC13112",
              "CSC13001",
              "CSC13101",
              "CSC13102",
              "CSC13103",
              "CSC13107",
              "CSC13117"
            ]
          },
          "SOFTWARE_ENGINEERING_723": {
            "name": "Kỹ thuật phần mềm, nhóm thuộc mục 7.2.3",
            "mandatory": false,
            "courses": [
              "CSC13114",
              "CSC13115",
              "CSC13116",
              "CSC13118"
            ]
          },
          "ARTIFICIAL_INTELLIGENCE_722": {
            "name": "Trí tuệ nhân tạo, nhóm thuộc mục 7.2.2",
            "mandatory": false,
            "courses": [
              "CSC18001",
              "CSC18101",
              "CSC18102",
              "CSC18103",
              "CSC18104"
            ]
          },
          "ARTIFICIAL_INTELLIGENCE_723": {
            "name": "Trí tuệ nhân tạo, nhóm thuộc mục 7.2.3",
            "mandatory": false,
            "courses": [
              "CSC18105"
            ]
          },
          "COMPUTER_SCIENCE_722": {
            "name": "Khoa học máy tính (KHMT), nhóm thuộc mục 7.2.2",
            "mandatory": false,
            "courses": [
              "CSC14001",
              "CSC14002",
              "CSC14004",
              "CSC14005",
              "CSC14006",
              "CSC14101",
              "CSC14111",
              "CSC14120",
              "CSC14008",
              "CSC14105",
              "CSC14112",
              "CSC14113",
              "CSC14117",
              "CSC14118"
            ]
          },
          "KNOWLEDGE_TECH_722": {
            "name": "Khoa học máy tính (CNTThức), nhóm thuộc mục 7.2.2",
            "mandatory": false,
            "courses": [
              "CSC14007",
              "CSC15001",
              "CSC15002",
              "CSC15003",
              "CSC15004",
              "CSC15005",
              "CSC15006",
              "CSC15007",
              "CSC15009",
              "CSC15011",
              "CSC15012",
              "CSC15010",
              "CSC15102",
              "CSC15107",
              "CSC15108",
              "CSC15109"
            ]
          },
          "COMPUTER_VISION_GRAPHICS_722": {
            "name": "Khoa học máy tính (TGMT), nhóm thuộc mục 7.2.2",
            "mandatory": false,
            "courses": [
              "CSC16001",
              "CSC16002",
              "CSC16003",
              "CSC16004",
              "CSC16005",
              "CSC16101",
              "CSC16102",
              "CSC16105",
              "CSC16106",
              "CSC16107",
              "CSC16109",
              "CSC16113",
              "CSC16114"
            ]
          },
          "DATA_SCIENCE_722": {
            "name": "Khoa học máy tính (KHDL), nhóm thuộc mục 7.2.2",
            "mandatory": false,
            "courses": [
              "CSC14119",
              "CSC17001",
              "CSC17104",
              "CSC17102",
              "CSC17103",
              "CSC17106"
            ]
          },
          "COMPUTER_SCIENCE_723": {
            "name": "Khoa học máy tính (KHMT), nhóm thuộc mục 7.2.3",
            "mandatory": false,
            "courses": [
              "CSC14114",
              "CSC14115",
              "CSC14116"
            ]
          },
          "KNOWLEDGE_TECH_723": {
            "name": "Khoa học máy tính (CNTThức), nhóm thuộc mục 7.2.3",
            "mandatory": false,
            "courses": [
              "CSC15104",
              "CSC15105",
              "CSC15106"
            ]
          },
          "COMPUTER_VISION_GRAPHICS_723": {
            "name": "Khoa học máy tính (TGMT), nhóm thuộc mục 7.2.3",
            "mandatory": false,
            "courses": [
              "CSC16110",
              "CSC16111",
              "CSC16112"
            ]
          },
          "DATA_SCIENCE_723": {
            "name": "Khoa học máy tính (KHDL), nhóm thuộc mục 7.2.3",
            "mandatory": false,
            "courses": [
              "CSC17107"
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
        "name": "Khóa luận tốt nghiệp",
        "credits": 10,
        "courses": [
          "CSC10251"
        ]
      }
    ]
  }
};
