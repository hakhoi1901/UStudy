export const categories = {
  "GENERAL_EDUCATION": {
    "name": "Giáo dục đại cương",
    "total_credits_required": 52,
    "note": "Không kể GDQP-AN, Ngoại ngữ, Tin học cơ sở và Giáo dục thể chất; đối chiếu mục 6 và 7.1.",
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
        "note": "Chọn 1 trong 3 học phần.",
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
          "MANDATORY": {
            "name": "Học phần bắt buộc",
            "credits": 25,
            "mandatory": true,
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
          "PROGRAMMING_ELECTIVE": {
            "name": "Tự chọn lập trình",
            "credits_required": 3,
            "mandatory": false,
            "note": "Chọn 1 trong 2 học phần. CSC00005 có 3 TC, ETC00005 có 4 TC; số 3 TC là mức tối thiểu để đối chiếu tổng 36 TC của khối.",
            "courses": [
              "CSC00005",
              "ETC00005"
            ]
          },
          "PHYSICS_ELECTIVE": {
            "name": "Tự chọn Vật lý",
            "credits_required": 6,
            "mandatory": false,
            "note": "Chọn 2 trong 3 học phần.",
            "courses": [
              "PHY00001",
              "PHY00002",
              "PHY00004"
            ]
          },
          "EARTH_ENV_ELECTIVE": {
            "name": "Tự chọn Khoa học trái đất/Môi trường",
            "credits_required": 2,
            "mandatory": false,
            "note": "Chọn 1 trong 2 học phần.",
            "courses": [
              "GEO00002",
              "ENV00001"
            ]
          }
        }
      }
    }
  },
  "GENERAL_IT": {
    "name": "Tin học",
    "total_credits_required": 3,
    "mandatory": true,
    "note": "Không tính vào điểm trung bình; tính vào số tín chỉ tích lũy; không nằm trong 131 TC của mục 3.",
    "courses": [
      "CSC00003"
    ]
  },
  "GENERAL_ENGLISH": {
    "name": "Ngoại ngữ",
    "total_credits_required": 12,
    "mandatory": false,
    "note": "PDF ghi 4 học phần Anh văn, nhưng sinh viên đạt chuẩn ngoại ngữ đầu ra theo quy định hiện hành thì không đăng ký học các học phần này. Theo quy tắc tương thích UStudy của Project, nhóm này mandatory=false và course_type của các học phần được ánh xạ thành TC.",
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
    "note": "Không tính vào điểm trung bình; tính vào số tín chỉ tích lũy; không nằm trong 131 TC của mục 3.",
    "courses": [
      "BAA00021",
      "BAA00022"
    ]
  },
  "GENERAL_DEFENSE": {
    "name": "Giáo dục quốc phòng - An ninh",
    "total_credits_required": 4,
    "mandatory": true,
    "note": "Không tính vào điểm trung bình; tính vào số tín chỉ tích lũy; không nằm trong 131 TC của mục 3.",
    "courses": [
      "BAA00030"
    ]
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
    "name": "Kiến thức chuyên ngành",
    "total_credits_required": 34,
    "note": "Sinh viên theo một trong ba chuyên ngành; mỗi chuyên ngành yêu cầu ít nhất 34 TC.",
    "options": [
      {
        "type": "ELECTRONICS",
        "name": "Chuyên ngành Điện tử",
        "credits": 34,
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
          "ETC10111",
          "ETC10112",
          "ETC10113",
          "ETC10114",
          "ETC10115",
          "ETC10236",
          "ETC10116",
          "ETC10117",
          "ETC10137",
          "ETC10118",
          "ETC10119",
          "ETC10138"
        ],
        "note": "Học phần bắt buộc — 26 tín chỉ — bắt buộc; Học phần tự chọn — yêu cầu 8 tín chỉ — tự chọn; Tự chọn 1 — yêu cầu 3 tín chỉ — tự chọn — Chọn tối thiểu 3 TC.; Tự chọn 2 — yêu cầu 3 tín chỉ — tự chọn — Chọn tối thiểu 3 TC.; Tự chọn 3 — yêu cầu 2 tín chỉ — tự chọn — Chọn tối thiểu 2 TC."
      },
      {
        "type": "EMBEDDED_SYSTEMS",
        "name": "Chuyên ngành Máy Tính - Hệ Thống Nhúng",
        "credits": 34,
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
          "ETC10215",
          "ETC10216",
          "ETC10217",
          "ETC10218",
          "ETC10307",
          "ETC10236",
          "ETC10219",
          "ETC10220",
          "ETC10221",
          "ETC10222",
          "ETC10223",
          "ETC10224",
          "ETC10225",
          "ETC10226",
          "ETC10227",
          "ETC10228",
          "ETC10229",
          "ETC10230"
        ],
        "note": "Học phần bắt buộc — 26 tín chỉ — bắt buộc; Học phần tự chọn — yêu cầu 8 tín chỉ — tự chọn; Tự chọn 1 — yêu cầu 2 tín chỉ — tự chọn — Chọn tối thiểu 2 TC.; Tự chọn 2 — yêu cầu 3 tín chỉ — tự chọn — Chọn 1 nhóm học phần (3 TC).; Nhóm 1 - IoT — 3 tín chỉ; Nhóm 2 - Hệ điều hành — 3 tín chỉ; Tự chọn 3 — yêu cầu 3 tín chỉ — tự chọn — Chọn 1 nhóm học phần (3 TC).; Nhóm 1 - Xử lý ảnh và video — 3 tín chỉ; Nhóm 2 - Java — 3 tín chỉ; Nhóm 3 - An ninh mạng — 3 tín chỉ; Nhóm 4 - VLSI nâng cao — 3 tín chỉ"
      },
      {
        "type": "TELECOM_NETWORKS",
        "name": "Chuyên ngành Viễn Thông - Mạng",
        "credits": 34,
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
          "ETC10313",
          "ETC10314",
          "ETC10315",
          "ETC10316",
          "ETC10320",
          "ETC10317",
          "ETC10318",
          "ETC10319",
          "ETC10321",
          "ETC10322",
          "ETC10323",
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
        ],
        "note": "Học phần bắt buộc — 22 tín chỉ — bắt buộc; Học phần tự chọn — yêu cầu 12 tín chỉ — tự chọn; Tự chọn 1 — yêu cầu 9 tín chỉ — tự chọn — Chọn 1 nhóm môn, mỗi nhóm đủ 9 TC.; Nhóm 1 — 9 tín chỉ; Nhóm 2 — 9 tín chỉ; Tự chọn 2 — yêu cầu 3 tín chỉ — tự chọn — Chọn 03 TC trong danh sách."
      }
    ]
  },
  "GRADUATION": {
    "name": "Kiến thức tốt nghiệp",
    "total_credits_required": 10,
    "note": "Mỗi chuyên ngành chọn một trong hai phương án tốt nghiệp.",
    "options": [
      {
        "type": "THESIS",
        "name": "Tốt nghiệp - Chuyên ngành Điện tử · Phương án 1 - Khóa luận tốt nghiệp",
        "credits": 10,
        "courses": [
          "ETC10195"
        ],
        "note": "Chuyên ngành: Tốt nghiệp - Chuyên ngành Điện tử."
      },
      {
        "type": "PROJECT",
        "name": "Tốt nghiệp - Chuyên ngành Điện tử · Phương án 2 - Đồ án tốt nghiệp + học phần",
        "credits": 10,
        "note": "Chuyên ngành: Tốt nghiệp - Chuyên ngành Điện tử. Chi tiết quy tắc đã gộp cho giao diện: Thực hiện Đồ án tốt nghiệp 4 TC và chọn 06 TC trong ETC10120, ETC10121, ETC10139.",
        "courses": [
          "ETC10190",
          "ETC10120",
          "ETC10121",
          "ETC10139"
        ]
      },
      {
        "type": "THESIS",
        "name": "Tốt nghiệp - Chuyên ngành Máy Tính - Hệ Thống Nhúng · Phương án 1 - Khóa luận tốt nghiệp",
        "credits": 10,
        "courses": [
          "ETC10295"
        ],
        "note": "Chuyên ngành: Tốt nghiệp - Chuyên ngành Máy Tính - Hệ Thống Nhúng."
      },
      {
        "type": "PROJECT",
        "name": "Tốt nghiệp - Chuyên ngành Máy Tính - Hệ Thống Nhúng · Phương án 2 - Đồ án tốt nghiệp + học phần",
        "credits": 10,
        "note": "Chuyên ngành: Tốt nghiệp - Chuyên ngành Máy Tính - Hệ Thống Nhúng. Chi tiết quy tắc đã gộp cho giao diện: Thực hiện Đồ án tốt nghiệp 4 TC và học 06 TC của ETC10231, ETC10232, ETC10233.",
        "courses": [
          "ETC10290",
          "ETC10231",
          "ETC10232",
          "ETC10233"
        ]
      },
      {
        "type": "THESIS",
        "name": "Tốt nghiệp - Chuyên ngành Viễn Thông - Mạng · Phương án 1 - Khóa luận tốt nghiệp",
        "credits": 10,
        "courses": [
          "ETC10395"
        ],
        "note": "Chuyên ngành: Tốt nghiệp - Chuyên ngành Viễn Thông - Mạng."
      },
      {
        "type": "PROJECT",
        "name": "Tốt nghiệp - Chuyên ngành Viễn Thông - Mạng · Phương án 2 - Đồ án tốt nghiệp + học phần tự chọn",
        "credits": 10,
        "note": "Chuyên ngành: Tốt nghiệp - Chuyên ngành Viễn Thông - Mạng. Chi tiết quy tắc đã gộp cho giao diện: Thực hiện Đồ án tốt nghiệp 4 TC và chọn 06 TC trong danh sách. Không được tính 3 TC sinh viên đã tích lũy tại mục 7.2.2.3 b - Tự chọn 2.",
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
};
