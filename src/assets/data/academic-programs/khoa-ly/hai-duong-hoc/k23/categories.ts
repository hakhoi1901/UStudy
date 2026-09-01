export const categories = {
  "GENERAL_EDUCATION": {
    "name": "Giáo dục đại cương",
    "total_credits_required": 51,
    "note": "51 tín chỉ không kể GDQP-AN, GDTC, Tin học cơ sở và Ngoại ngữ theo bảng cấu trúc chương trình trang 5.",
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
        "total_credits_required": 35,
        "breakdown": {
          "MANDATORY": {
            "name": "Học phần bắt buộc",
            "credits": 31,
            "mandatory": true,
            "courses": [
              "MTH00003",
              "MTH00004",
              "MTH00030",
              "MTH00040",
              "PHY00001",
              "PHY00002",
              "PHY00081",
              "CHE00001",
              "CHE00002",
              "ENV00001",
              "OMH00001"
            ]
          },
          "CALCULUS_PRACTICE": {
            "name": "Thực hành Vi tích phân",
            "credits_required": 1,
            "mandatory": false,
            "note": "Chọn 1 trong 2 học phần.",
            "courses": [
              "MTH00081",
              "MTH00082"
            ]
          },
          "BIOLOGY": {
            "name": "Sinh đại cương",
            "credits_required": 3,
            "mandatory": false,
            "note": "Chọn 1 trong 2 học phần.",
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
        "note": "Không tính vào điểm trung bình; tính vào số tín chỉ tích lũy. Không nằm trong 51 tín chỉ của bảng cấu trúc chương trình.",
        "courses": [
          "CSC00003"
        ]
      },
      "GENERAL_ENGLISH": {
        "name": "Ngoại ngữ",
        "mandatory": false,
        "note": "Không tính vào điểm trung bình và tín chỉ tích lũy. Sinh viên đạt chuẩn ngoại ngữ đầu ra theo quy định hiện hành thì không đăng ký học các học phần Anh văn. course_type được đặt TC theo quy tắc tương thích UStudy của Project.",
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
        "note": "Không tính vào điểm trung bình; tính vào số tín chỉ tích lũy. Không nằm trong 51 tín chỉ của bảng cấu trúc chương trình.",
        "courses": [
          "BAA00021",
          "BAA00022"
        ]
      },
      "GENERAL_DEFENSE": {
        "name": "Giáo dục quốc phòng - An ninh",
        "credits": 4,
        "mandatory": true,
        "note": "Không tính vào điểm trung bình; tính vào số tín chỉ tích lũy. Không nằm trong 51 tín chỉ của bảng cấu trúc chương trình.",
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
        "credits": 38,
        "mandatory": true,
        "courses": [
          "PHY10001",
          "OMH10001",
          "OMH10002",
          "OMH10003",
          "OMH10004",
          "OMH10005",
          "OMH10006",
          "OMH10007",
          "OMH10008",
          "OMH10009",
          "OMH10010",
          "OMH10011",
          "OMH10012",
          "OMH10014",
          "OMH10015",
          "OMH10016"
        ]
      },
      "ELECTIVE": {
        "name": "Học phần tự chọn",
        "credits_required": 2,
        "mandatory": false,
        "note": "Chọn 1 trong 2 học phần.",
        "courses": [
          "OMH10013",
          "OMH10017"
        ]
      }
    }
  },
  "MAJOR": {
    "name": "Kiến thức chuyên ngành",
    "note": "Sinh viên theo một trong bốn chuyên ngành/phương án chuyên ngành của CTĐT.",
    "options": [
      {
        "type": "OCEANOLOGY",
        "name": "Chuyên ngành Hải Dương Học",
        "credits": 27,
        "courses": [
          "OMH10104",
          "OMH10105",
          "OMH10106",
          "OMH10108",
          "OMH10101",
          "OMH10102",
          "OMH10103",
          "OMH10107",
          "OMH10109",
          "OMH10110",
          "OMH10111",
          "OMH10112",
          "OMH10113",
          "OMH10114",
          "OMH10414",
          "OMH10115",
          "OMH10116",
          "OMH10118",
          "OMH10120",
          "OMH10212",
          "OMH10216",
          "OMH10302",
          "OMH10310",
          "OMH10311",
          "OMH10314",
          "OMH10410",
          "OMH10117",
          "OMH10411",
          "OMH10119",
          "OMH10412",
          "OMH10210",
          "OMH10413"
        ],
        "note": "Học phần bắt buộc — 10 tín chỉ — bắt buộc; Học phần tự chọn — yêu cầu 17 tín chỉ — tự chọn — Tích lũy 17 tín chỉ từ danh sách. Các cặp được PDF ghi “Chọn 1 trong 2 học phần”: OMH10114/OMH10414; OMH10117/OMH10411; OMH10119/OMH10412; OMH10210/OMH10413."
      },
      {
        "type": "METEOROLOGY",
        "name": "Chuyên ngành Khí Tượng Học",
        "credits": 28,
        "courses": [
          "OMH10201",
          "OMH10202",
          "OMH10203",
          "OMH10206",
          "OMH10101",
          "OMH10113",
          "OMH10114",
          "OMH10414",
          "OMH10118",
          "OMH10120",
          "OMH10204",
          "OMH10205",
          "OMH10207",
          "OMH10208",
          "OMH10209",
          "OMH10211",
          "OMH10212",
          "OMH10213",
          "OMH10214",
          "OMH10215",
          "OMH10216",
          "OMH10217",
          "OMH10309",
          "OMH10311",
          "OMH10410",
          "OMH10117",
          "OMH10411",
          "OMH10119",
          "OMH10412",
          "OMH10210",
          "OMH10413"
        ],
        "note": "Học phần bắt buộc — 10 tín chỉ — bắt buộc; Học phần tự chọn — yêu cầu 18 tín chỉ — tự chọn — Tích lũy 18 tín chỉ từ danh sách. Các cặp được PDF ghi “Chọn 1 trong 2 học phần”: OMH10114/OMH10414; OMH10117/OMH10411; OMH10119/OMH10412; OMH10210/OMH10413."
      },
      {
        "type": "HYDROLOGY",
        "name": "Chuyên ngành Thủy Văn Học",
        "credits": 28,
        "courses": [
          "OMH10301",
          "OMH10303",
          "OMH10305",
          "OMH10307",
          "OMH10302",
          "OMH10304",
          "OMH10306",
          "OMH10308",
          "OMH10309",
          "OMH10310",
          "OMH10311",
          "OMH10312",
          "OMH10313",
          "OMH10314",
          "OMH10315",
          "OMH10316",
          "OMH10110",
          "OMH10113",
          "OMH10114",
          "OMH10414",
          "OMH10118",
          "OMH10120",
          "OMH10214",
          "OMH10216",
          "OMH10101",
          "OMH10410",
          "OMH10117",
          "OMH10411",
          "OMH10119",
          "OMH10412",
          "OMH10210",
          "OMH10413"
        ],
        "note": "Học phần bắt buộc — 9 tín chỉ — bắt buộc; Học phần tự chọn — yêu cầu 19 tín chỉ — tự chọn — Tích lũy 19 tín chỉ từ danh sách. Các cặp được PDF ghi “Chọn 1 trong 2 học phần”: OMH10114/OMH10414; OMH10117/OMH10411; OMH10119/OMH10412; OMH10210/OMH10413."
      },
      {
        "type": "INTEGRATED",
        "name": "Chuyên ngành Hải Dương - Khí tượng - Thủy văn",
        "credits": 27,
        "courses": [
          "OMH10401",
          "OMH10403",
          "OMH10406",
          "OMH10101",
          "OMH10102",
          "OMH10110",
          "OMH10113",
          "OMH10114",
          "OMH10414",
          "OMH10115",
          "OMH10116",
          "OMH10118",
          "OMH10120",
          "OMH10208",
          "OMH10211",
          "OMH10212",
          "OMH10216",
          "OMH10309",
          "OMH10310",
          "OMH10311",
          "OMH10314",
          "OMH10404",
          "OMH10415",
          "OMH10405",
          "OMH10416",
          "OMH10407",
          "OMH10417",
          "OMH10408",
          "OMH10418",
          "OMH10402",
          "OMH10410",
          "OMH10117",
          "OMH10411",
          "OMH10119",
          "OMH10412",
          "OMH10210",
          "OMH10413"
        ],
        "note": "Học phần bắt buộc — 8 tín chỉ — bắt buộc; Học phần tự chọn — yêu cầu 19 tín chỉ — tự chọn — Tích lũy 19 tín chỉ từ danh sách. Các cặp được PDF ghi “Chọn 1 trong 2 học phần”: OMH10114/OMH10414; OMH10404/OMH10415; OMH10405/OMH10416; OMH10407/OMH10417; OMH10408/OMH10418; OMH10402/OMH10410; OMH10117/OMH10411; OMH10119/OMH10412; OMH10210/OMH10413."
      }
    ]
  },
  "GRADUATION": {
    "name": "Kiến thức tốt nghiệp",
    "total_credits_required": 10,
    "note": "Chọn 1 trong 2 phương án để tích lũy 10 tín chỉ.",
    "options": [
      {
        "type": "THESIS",
        "name": "Phương án 1 - Khóa luận tốt nghiệp",
        "credits": 10,
        "courses": [
          "OMH10395"
        ]
      },
      {
        "type": "PROJECT_AND_ELECTIVES",
        "name": "Phương án 2 - Đồ án tốt nghiệp và học phần tự chọn",
        "credits": 10,
        "note": "Tích lũy 6TC đồ án tốt nghiệp và 4TC học phần tự chọn theo chuyên ngành. Chi tiết quy tắc đã gộp cho giao diện: Chuyên ngành Hải Dương Học — yêu cầu 4 tín chỉ — tự chọn — Chọn các học phần từ danh sách để tích lũy 4 tín chỉ. Danh sách có OMH10202 = 3 TC; PDF không nêu cách ghép nếu chọn học phần 3 TC.; Chuyên ngành Khí Tượng Học — yêu cầu 4 tín chỉ — tự chọn — Chọn các học phần từ danh sách để tích lũy 4 tín chỉ.; Chuyên ngành Thủy Văn Học — yêu cầu 4 tín chỉ — tự chọn — Chọn các học phần từ danh sách để tích lũy 4 tín chỉ. Danh sách có OMH10202 = 3 TC; PDF không nêu cách ghép nếu chọn học phần 3 TC.; Chuyên ngành Hải Dương - Khí tượng - Thủy văn — yêu cầu 4 tín chỉ — tự chọn — Chọn các học phần từ danh sách để tích lũy 4 tín chỉ.",
        "courses": [
          "OMH10396",
          "OMH10121",
          "OMH10202",
          "OMH10203",
          "OMH10204",
          "OMH10205",
          "OMH10218",
          "OMH10301",
          "OMH10304",
          "OMH10306",
          "OMH10307",
          "OMH10103",
          "OMH10104",
          "OMH10106",
          "OMH10107",
          "OMH10409"
        ]
      }
    ]
  }
};
