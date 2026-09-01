export const categories = {
  "GENERAL_EDUCATION": {
    "name": "Kiến thức giáo dục đại cương",
    "total_credits_required": 50,
    "note": "Tích lũy 50 TC, không kể Giáo dục thể chất, Giáo dục quốc phòng - An ninh, ngoại ngữ và tin học (PDF trang 5).",
    "breakdown": {
      "GENERAL_POLITICAL_LAW": {
        "name": "Lý luận chính trị - Pháp luật",
        "credits": 14,
        "mandatory": true,
        "courses": [
          "BAA00003",
          "BAA00004",
          "BAA00101",
          "BAA00102",
          "BAA00103",
          "BAA00104"
        ]
      },
      "GENERAL_SOCIAL_ECONOMICS": {
        "name": "Khoa học xã hội - Kinh tế - Kỹ năng",
        "credits_required": 2,
        "mandatory": false,
        "note": "Chọn 1 trong 3 học phần, tích lũy 2 TC (PDF trang 5).",
        "courses": [
          "BAA00005",
          "BAA00006",
          "BAA00007"
        ]
      },
      "GENERAL_MATH_SCIENCE": {
        "name": "Toán - Khoa học tự nhiên - Công nghệ - Môi trường",
        "credits_required": 34,
        "mandatory": false,
        "note": "Tổng yêu cầu 34 TC: 32 TC từ 12 học phần bắt buộc và chọn 2 TC trong 5 học phần tự chọn (PDF trang 6).",
        "breakdown": {
          "MANDATORY": {
            "name": "Học phần bắt buộc",
            "credits": 32,
            "mandatory": true,
            "courses": [
              "BIO00001",
              "CHE00001",
              "CHE00002",
              "CHE00010",
              "CHE00081",
              "ENV00001",
              "MTH00001",
              "MTH00002",
              "MTH00040",
              "PHY00001",
              "PHY00002",
              "PHY00081"
            ]
          },
          "ELECTIVE": {
            "name": "Học phần tự chọn",
            "credits_required": 2,
            "mandatory": false,
            "note": "Chọn 2 TC trong các học phần này (PDF trang 6).",
            "courses": [
              "BIO00081",
              "BIO00002",
              "BIO00082",
              "CHE00011",
              "CHE00012"
            ]
          }
        }
      },
      "GENERAL_IT": {
        "name": "Tin học",
        "mandatory": true,
        "note": "Không tính vào điểm trung bình; tính vào số tín chỉ tích lũy. Không tính trong 50 TC giáo dục đại cương và 138 TC toàn khóa (PDF trang 4-6).",
        "courses": [
          "CSC00003"
        ]
      },
      "GENERAL_ENGLISH": {
        "name": "Ngoại ngữ",
        "mandatory": false,
        "note": "Không tính vào điểm trung bình và tín chỉ tích lũy. Sinh viên đạt chuẩn ngoại ngữ đầu ra theo quy định hiện hành thì không đăng ký học các học phần Anh văn (PDF trang 7).",
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
        "note": "Không tính vào điểm trung bình; tính vào số tín chỉ tích lũy. Hai dòng học phần đều ghi 2 TC, nhưng dòng TỔNG CỘNG trên PDF trang 7 ghi 8 TC; không đặt giá trị credits ở node này để tránh tự sửa xung đột nguồn.",
        "courses": [
          "BAA00021",
          "BAA00022"
        ]
      },
      "GENERAL_DEFENSE": {
        "name": "Giáo dục quốc phòng - An ninh",
        "credits": 4,
        "mandatory": true,
        "note": "Không tính vào điểm trung bình; tính vào số tín chỉ tích lũy. Không tính trong 50 TC giáo dục đại cương và 138 TC toàn khóa (PDF trang 4-7).",
        "courses": [
          "BAA00030"
        ]
      }
    }
  },
  "FOUNDATION": {
    "name": "Kiến thức cơ sở ngành",
    "total_credits_required": 55,
    "mandatory": true,
    "courses": [
      "CHE10002",
      "CHE10003",
      "CHE10004",
      "CHE10006",
      "CHE10007",
      "CHE10008",
      "CHE10009",
      "CHE10010",
      "CHE10011",
      "CHE10012",
      "CHE10013",
      "CHE10014",
      "CHE10015",
      "CHE10016",
      "CHE10017",
      "CHE10018",
      "CHE10024",
      "CHE10025",
      "CHE10026",
      "CHE10027",
      "CHE10029",
      "CHE10030"
    ]
  },
  "MAJOR": {
    "name": "Kiến thức chuyên ngành",
    "total_credits_required": 23,
    "note": "Gồm 13 TC thuộc phần học phần bắt buộc của khối chuyên ngành và 10 TC học phần tự chọn (PDF trang 5, 8-11).",
    "breakdown": {
      "MAJOR_REQUIRED": {
        "name": "Học phần bắt buộc",
        "total_credits_required": 13,
        "note": "13 TC ở cấp khối gồm 8 TC phải chọn trong 12 học phần mà cột Loại học phần ghi TC, cộng 5 TC từ hai học phần cố định ghi BB; giữ nguyên course_type theo từng dòng PDF.",
        "breakdown": {
          "REQUIRED_THEORY_SELECTION": {
            "name": "Nhóm lý thuyết bắt buộc theo lựa chọn",
            "credits_required": 8,
            "mandatory": false,
            "note": "Tích lũy 08 TC trong số 12 học phần; kế hoạch học kỳ 6-7 diễn giải là chọn 4 trong 12 môn lý thuyết (PDF trang 8, 15).",
            "courses": [
              "CHE10105",
              "CHE10106",
              "CHE10202",
              "CHE10203",
              "CHE10301",
              "CHE10303",
              "CHE10403",
              "CHE10408",
              "CHE10501",
              "CHE10502",
              "CHE10601",
              "CHE10608"
            ]
          },
          "FIXED_REQUIRED": {
            "name": "Hai học phần bắt buộc cố định",
            "credits": 5,
            "mandatory": true,
            "courses": [
              "CHE10785",
              "CHE10023"
            ]
          }
        }
      },
      "MAJOR_ELECTIVE": {
        "name": "Học phần tự chọn",
        "credits_required": 10,
        "mandatory": false,
        "note": "Tích lũy 10 TC, trong đó phải có tối thiểu 1 môn Thực hành chuyên ngành (THCN). Các môn được đánh dấu THCN ở bảng chính: CHE10104, CHE10204, CHE10205, CHE10305, CHE10306, CHE10404, CHE10504, CHE10506, CHE10606 (PDF trang 9-11).",
        "courses": [
          "CHE10019",
          "CHE10022",
          "CHE10028",
          "CHE10101",
          "CHE10102",
          "CHE10103",
          "CHE10104",
          "CHE10121",
          "CHE10122",
          "CHE10123",
          "CHE10124",
          "CHE10126",
          "CHE10131",
          "CHE10132",
          "CHE10133",
          "CHE10134",
          "CHE10201",
          "CHE10204",
          "CHE10205",
          "CHE10206",
          "CHE10220",
          "CHE10222",
          "CHE10223",
          "CHE10226",
          "CHE10227",
          "CHE10228",
          "CHE10302",
          "CHE10304",
          "CHE10305",
          "CHE10306",
          "CHE10320",
          "CHE10321",
          "CHE10322",
          "CHE10323",
          "CHE10324",
          "CHE10325",
          "CHE10326",
          "CHE10327",
          "CHE10328",
          "CHE10330",
          "CHE10401",
          "CHE10402",
          "CHE10404",
          "CHE10405",
          "CHE10420",
          "CHE10421",
          "CHE10422",
          "CHE10423",
          "CHE10425",
          "CHE10426",
          "CHE10427",
          "CHE10428",
          "CHE10503",
          "CHE10504",
          "CHE10505",
          "CHE10506",
          "CHE10520",
          "CHE10521",
          "CHE10522",
          "CHE10523",
          "CHE10524",
          "CHE10525",
          "CHE10526",
          "CHE10527",
          "CHE10528",
          "CHE10602",
          "CHE10603",
          "CHE10606",
          "CHE10621",
          "CHE10622",
          "CHE10624",
          "CHE10625",
          "CHE10627",
          "CHE10630"
        ]
      }
    }
  },
  "GRADUATION": {
    "name": "Học phần tốt nghiệp",
    "total_credits_required": 10,
    "mandatory": true,
    "note": "Khóa luận tốt nghiệp, 10 TC; Thực hiện đề tài: 300 tiết (PDF trang 11).",
    "courses": [
      "CHE10700"
    ]
  }
};
