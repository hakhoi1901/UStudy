export const categories = {
  "GENERAL_EDUCATION": {
    "name": "Giáo dục đại cương",
    "total_credits_required": 56,
    "note": "Tích lũy 56 tín chỉ, không kể Ngoại ngữ, Giáo dục thể chất và Giáo dục quốc phòng - an ninh (PDF trang 8).",
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
        "total_credits_required": 36,
        "breakdown": {
          "MATH_CORE": {
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
              "MTH00056"
            ]
          },
          "NATURAL_SCIENCE_ELECTIVE": {
            "name": "Khoa học tự nhiên tự chọn",
            "credits_required": 6,
            "mandatory": false,
            "note": "Chọn đủ 06 tín chỉ từ danh sách học phần khoa học tự nhiên.",
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
          },
          "ENVIRONMENT_ELECTIVE": {
            "name": "Môi trường tự chọn",
            "credits_required": 2,
            "mandatory": false,
            "note": "Chọn 01 học phần (02 tín chỉ).",
            "courses": [
              "GEO00002",
              "ENV00001",
              "ENV00003"
            ]
          }
        }
      },
      "GENERAL_IT": {
        "name": "Tin học",
        "credits": 4,
        "mandatory": true,
        "courses": [
          "CSC00009"
        ]
      }
    }
  },
  "GENERAL_ENGLISH": {
    "name": "Ngoại ngữ",
    "mandatory": false,
    "note": "Không tính vào điểm trung bình và không nằm trong 138 tín chỉ của bảng cấu trúc. Sinh viên đạt chuẩn ngoại ngữ đầu ra theo quy định hiện hành thì không đăng ký học các học phần Anh văn. Theo quy tắc tương thích UStudy của Project, các học phần này dùng course_type TC.",
    "courses": [
      "ADD00031",
      "ADD00032",
      "ADD00033",
      "ADD00034"
    ]
  },
  "GENERAL_PE": {
    "name": "Giáo dục thể chất",
    "total_credits_required": 4,
    "mandatory": true,
    "note": "Không tính vào điểm trung bình; tính vào số tín chỉ tích lũy; không nằm trong 138 tín chỉ của bảng cấu trúc.",
    "courses": [
      "BAA00021",
      "BAA00022"
    ]
  },
  "GENERAL_DEFENSE": {
    "name": "Giáo dục quốc phòng - an ninh",
    "total_credits_required": 4,
    "mandatory": true,
    "note": "Không tính vào điểm trung bình; tính vào số tín chỉ tích lũy; không nằm trong 138 tín chỉ của bảng cấu trúc. Bảng không ghi số tiết nên các trường giờ được ghi 0 theo đặc tả.",
    "courses": [
      "BAA00030"
    ]
  },
  "FOUNDATION": {
    "name": "Kiến thức cơ sở ngành",
    "total_credits_required": 38,
    "mandatory": true,
    "courses": [
      "CSC10001",
      "CSC10010",
      "CSC10003",
      "CSC10004",
      "CSC10006",
      "CSC10007",
      "CSC10008",
      "CSC10009",
      "CSC10011",
      "CSC14003"
    ]
  },
  "MAJOR": {
    "name": "Kiến thức ngành/chuyên ngành",
    "total_credits_required": 34,
    "note": "Bảng cấu trúc: 16 tín chỉ bắt buộc theo khối lựa chọn, 8 tín chỉ tự chọn ngành/chuyên ngành và 10 tín chỉ tự chọn tự do. Quy tắc chi tiết tại mục 7.2.2.",
    "breakdown": {
      "MAJOR_REQUIRED_SELECTION": {
        "name": "Kiến thức bắt buộc ngành/chuyên ngành",
        "credits_required": 16,
        "mandatory": false,
        "note": "Tích lũy ít nhất 04 học phần (N ≥ 04), sao cho tối thiểu 16 tín chỉ, trong danh sách. Các học phần trong bảng được PDF ghi loại TC.",
        "courses": [
          "CSC14004",
          "CSC14005",
          "CSC15006",
          "CSC15009",
          "CSC16004",
          "CSC18001"
        ]
      },
      "MAJOR_ELECTIVE_SELECTION": {
        "name": "Kiến thức tự chọn ngành/chuyên ngành",
        "credits_required": 8,
        "mandatory": false,
        "note": "Tích lũy ít nhất 02 học phần (M ≥ 02), sao cho tối thiểu 08 tín chỉ, trong danh sách.",
        "courses": [
          "CSC10102",
          "CSC10103",
          "CSC10104",
          "CSC12106",
          "CSC14112",
          "CSC14120",
          "CSC15010",
          "CSC16109",
          "CSC17001",
          "CSC18101",
          "CSC18102",
          "CSC18103",
          "CSC18104"
        ]
      },
      "MAJOR_FREE_ELECTIVE": {
        "name": "Kiến thức tự chọn tự do",
        "credits_required": 10,
        "mandatory": false,
        "note": "Nếu số tín chỉ của (N+M) chưa đủ 34 tín chỉ thì tiếp tục tích lũy cho đến ít nhất 34 tín chỉ. Có thể chọn từ mục 7.2.2.1, 7.2.2.2, 7.2.3 và các học phần liên ngành được liệt kê chi tiết tại Phụ lục 1; danh sách courses chứa toàn bộ 100 học phần Phụ lục 1 cộng các học phần 7.2.3 không xuất hiện trong phụ lục.",
        "courses": [
          "CSC18001",
          "CSC18101",
          "CSC18102",
          "CSC18103",
          "CSC18104",
          "CSC18105",
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
          "CSC17106",
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
          "CSC10251",
          "CSC10252",
          "CSC10204"
        ]
      }
    }
  },
  "GRADUATION": {
    "name": "Kiến thức tốt nghiệp",
    "total_credits_required": 10,
    "note": "Tích lũy tối thiểu 10 tín chỉ, chọn 01 trong 03 phương án.",
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
        "name": "Phương án 3 - Thực tập dự án tốt nghiệp",
        "credits": 10,
        "note": "Học CSC10204 (06 tín chỉ) và chọn 01 học phần (04 tín chỉ) trong CSC18105, CSC15012, CSC16107.",
        "courses": [
          "CSC10204",
          "CSC18105",
          "CSC15012",
          "CSC16107"
        ]
      }
    ]
  }
};
