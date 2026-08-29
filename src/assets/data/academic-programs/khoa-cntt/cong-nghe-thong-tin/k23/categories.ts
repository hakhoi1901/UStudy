export const categories = {
  "GENERAL_EDUCATION": {
    "name": "Giáo dục đại cương",
    "total_credits_required": 56,
    "note": "56 tín chỉ không kể Ngoại ngữ, Giáo dục thể chất và Giáo dục quốc phòng - an ninh.",
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
        "note": "Chọn 01 học phần (02 tín chỉ).",
        "courses": [
          "BAA00005",
          "BAA00006",
          "BAA00007"
        ]
      },
      "GENERAL_MATH_SCIENCE": {
        "name": "Toán - Khoa học tự nhiên - Công nghệ - Môi trường",
        "credits_required": 36,
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
              "MTH00053"
            ]
          },
          "ENVIRONMENT_ELECTIVE": {
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
            "note": "Chọn 06 tín chỉ từ các học phần khoa học tự nhiên trong danh sách.",
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
        "credits": 12,
        "mandatory": false,
        "note": "Không tính vào điểm trung bình và tín chỉ tích lũy. Sinh viên đạt chuẩn ngoại ngữ đầu ra theo quy định hiện hành thì không đăng ký học các học phần Anh văn. Theo quy tắc tương thích UStudy bắt buộc của Project, khối này dùng course_type TC và mandatory false.",
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
        "note": "Không nằm trong 138 tín chỉ của khối lượng kiến thức toàn khóa.",
        "courses": [
          "BAA00021",
          "BAA00022"
        ]
      },
      "GENERAL_DEFENSE": {
        "name": "Giáo dục quốc phòng - an ninh",
        "credits": 4,
        "mandatory": true,
        "note": "Không nằm trong 138 tín chỉ của khối lượng kiến thức toàn khóa.",
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
    "name": "Kiến thức chuyên ngành",
    "total_credits_required": 34,
    "note": "Chọn 01 trong 02 chuyên ngành. Mỗi chuyên ngành tích lũy 34 tín chỉ: tối thiểu 16 tín chỉ ở nhóm kiến thức bắt buộc chuyên ngành, tối thiểu 08 tín chỉ ở nhóm tự chọn chuyên ngành và tiếp tục tự chọn tự do để đủ 34 tín chỉ.",
    "breakdown": {
      "NETWORK_TELECOMMUNICATIONS": {
        "name": "Mạng máy tính và Viễn thông",
        "total_credits_required": 34,
        "breakdown": {
          "SPECIALIZATION_CORE": {
            "name": "Kiến thức bắt buộc chuyên ngành",
            "credits_required": 16,
            "mandatory": false,
            "note": "Tích lũy ít nhất 04 học phần, sao cho tối thiểu 16 tín chỉ, trong danh sách.",
            "courses": [
              "CSC11002",
              "CSC11003",
              "CSC11004",
              "CSC11006",
              "CSC11007",
              "CSC15001"
            ]
          },
          "SPECIALIZATION_ELECTIVE": {
            "name": "Kiến thức tự chọn chuyên ngành",
            "credits_required": 8,
            "mandatory": false,
            "note": "Tích lũy ít nhất 02 học phần, sao cho tối thiểu 08 tín chỉ. Danh sách theo Phụ lục 1.1 cho mục 7.2.2.1.2.",
            "courses": [
              "CSC11002",
              "CSC11003",
              "CSC11004",
              "CSC11006",
              "CSC11007",
              "CSC15001",
              "CSC10107",
              "CSC11106",
              "CSC11115",
              "CSC11116",
              "CSC11117",
              "CSC11118",
              "CSC15003",
              "CSC15005",
              "CSC11111",
              "CSC11112",
              "CSC11119"
            ]
          },
          "FREE_ELECTIVE": {
            "name": "Kiến thức tự chọn tự do",
            "credits_required": 10,
            "mandatory": false,
            "note": "Nếu số tín chỉ đã chọn ở hai nhóm trên chưa đủ 34 tín chỉ, tiếp tục chọn từ danh sách Phụ lục 1.1 để đủ ít nhất 34 tín chỉ. Mốc 10 tín chỉ là phần tự chọn tự do trong bảng cấu trúc chương trình.",
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
              "CSC11118",
              "CSC11111",
              "CSC11112",
              "CSC11119",
              "CSC12001",
              "CSC12002",
              "CSC12003",
              "CSC12004",
              "CSC12005",
              "CSC10121",
              "CSC10102",
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
              "CSC17101",
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
              "CSC13117",
              "CSC18001",
              "CSC18101",
              "CSC18102",
              "CSC18103",
              "CSC18104",
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
              "CSC14118",
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
              "CSC15109",
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
              "CSC16114",
              "CSC14119",
              "CSC17001",
              "CSC17104",
              "CSC17102",
              "CSC17103",
              "CSC17106"
            ]
          }
        }
      },
      "INFORMATION_TECHNOLOGY": {
        "name": "Công nghệ thông tin",
        "total_credits_required": 34,
        "breakdown": {
          "SPECIALIZATION_CORE": {
            "name": "Kiến thức bắt buộc chuyên ngành",
            "credits_required": 16,
            "mandatory": false,
            "note": "Tích lũy ít nhất 04 học phần, sao cho tối thiểu 16 tín chỉ, trong danh sách.",
            "courses": [
              "CSC11004",
              "CSC15001",
              "CSC12002",
              "CSC12004",
              "CSC13003",
              "CSC13106",
              "CSC14004",
              "CSC14005",
              "CSC14119",
              "CSC15004",
              "CSC15007",
              "CSC15006",
              "CSC15011",
              "CSC15003",
              "CSC15005",
              "CSC16004",
              "CSC16005"
            ]
          },
          "SPECIALIZATION_ELECTIVE": {
            "name": "Kiến thức tự chọn chuyên ngành",
            "credits_required": 8,
            "mandatory": false,
            "note": "Tích lũy ít nhất 02 học phần, sao cho tối thiểu 08 tín chỉ, trong danh sách.",
            "courses": [
              "CSC11003",
              "CSC11106",
              "CSC11006",
              "CSC11117",
              "CSC10108",
              "CSC12105",
              "CSC12109",
              "CSC12110",
              "CSC13006",
              "CSC13008",
              "CSC13010",
              "CSC13112",
              "CSC14101",
              "CSC14111",
              "CSC14120",
              "CSC14117",
              "CSC14118",
              "CSC17001",
              "CSC17104",
              "CSC15107",
              "CSC15012",
              "CSC15002",
              "CSC15010",
              "CSC12001",
              "CSC16003",
              "CSC16106",
              "CSC16107",
              "CSC16109"
            ]
          },
          "FREE_ELECTIVE": {
            "name": "Kiến thức tự chọn tự do",
            "credits_required": 10,
            "mandatory": false,
            "note": "Nếu số tín chỉ đã chọn ở hai nhóm trên chưa đủ 34 tín chỉ, tiếp tục chọn từ danh sách Phụ lục 1.2 để đủ ít nhất 34 tín chỉ. Mốc 10 tín chỉ là phần tự chọn tự do trong bảng cấu trúc chương trình.",
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
              "CSC11118",
              "CSC11114",
              "CSC12112",
              "CSC12113",
              "CSC13119",
              "CSC13120",
              "CSC13121",
              "CSC13122",
              "CSC00008",
              "CSC11111",
              "CSC11112",
              "CSC11119",
              "CSC12001",
              "CSC12002",
              "CSC12003",
              "CSC12004",
              "CSC12005",
              "CSC10121",
              "CSC10102",
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
              "CSC17101",
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
              "CSC13117",
              "CSC18001",
              "CSC18101",
              "CSC18102",
              "CSC18103",
              "CSC18104",
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
              "CSC14118",
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
              "CSC15109",
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
              "CSC16114",
              "CSC14119",
              "CSC17001",
              "CSC17104",
              "CSC17102",
              "CSC17103",
              "CSC17106"
            ]
          }
        }
      }
    }
  },
  "GRADUATION": {
    "name": "Kiến thức tốt nghiệp",
    "total_credits_required": 10,
    "breakdown": {
      "NETWORK_TELECOMMUNICATIONS": {
        "name": "Mạng máy tính và Viễn thông",
        "total_credits_required": 10,
        "options": [
          {
            "type": "THESIS",
            "name": "Phương án 1 - Khóa luận tốt nghiệp",
            "credits": 10,
            "courses": [
              "CSC10251"
            ]
          },
          {
            "type": "GRADUATION_INTERNSHIP",
            "name": "Phương án 2 - Thực tập tốt nghiệp",
            "credits": 10,
            "courses": [
              "CSC10252"
            ]
          },
          {
            "type": "GRADUATION_PROJECT",
            "name": "Phương án 3 - Thực tập dự án tốt nghiệp và chuyên đề",
            "credits": 10,
            "note": "Học CSC10204 (06 tín chỉ) và chọn 01 học phần (04 tín chỉ) trong danh sách chuyên đề tốt nghiệp để đủ 10 tín chỉ.",
            "courses": [
              "CSC10204",
              "CSC11111",
              "CSC11112",
              "CSC11119"
            ]
          }
        ]
      },
      "INFORMATION_TECHNOLOGY": {
        "name": "Công nghệ thông tin",
        "total_credits_required": 10,
        "options": [
          {
            "type": "THESIS",
            "name": "Phương án 1 - Khóa luận tốt nghiệp",
            "credits": 10,
            "courses": [
              "CSC10251"
            ]
          },
          {
            "type": "GRADUATION_INTERNSHIP",
            "name": "Phương án 2 - Thực tập tốt nghiệp",
            "credits": 10,
            "courses": [
              "CSC10252"
            ]
          },
          {
            "type": "GRADUATION_PROJECT",
            "name": "Phương án 3 - Thực tập dự án tốt nghiệp và học phần tốt nghiệp",
            "credits": 10,
            "note": "Học CSC10204 (06 tín chỉ) và chọn 01 học phần tối thiểu 04 tín chỉ từ danh sách học phần tốt nghiệp; nếu tổng chưa đủ 10 tín chỉ thì chọn thêm học phần để đủ 10 tín chỉ.",
            "courses": [
              "CSC10204",
              "CSC10202",
              "CSC10203",
              "CSC13123",
              "CSC11111",
              "CSC11112",
              "CSC11119",
              "CSC12107",
              "CSC12108",
              "CSC12111",
              "CSC13114",
              "CSC13115",
              "CSC13116",
              "CSC13118",
              "CSC18105",
              "CSC15012",
              "CSC16107",
              "CSC14114",
              "CSC14116",
              "CSC15104",
              "CSC15105",
              "CSC15106",
              "CSC16110",
              "CSC16111",
              "CSC16112",
              "CSC17107",
              "CSC14115"
            ]
          }
        ]
      }
    }
  }
};
