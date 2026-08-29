export const categories = {
  "GENERAL_EDUCATION": {
    "name": "Giáo dục đại cương",
    "total_credits_required": 48,
    "note": "Tích lũy 48 tín chỉ, không kể Giáo dục thể chất, Giáo dục quốc phòng - An ninh, Tin học cơ sở và Ngoại ngữ.",
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
        "total_credits_required": 32,
        "breakdown": {
          "MANDATORY": {
            "name": "Học phần bắt buộc",
            "credits": 30,
            "mandatory": true,
            "courses": [
              "MTH00003",
              "MTH00004",
              "MTH00081",
              "MTH00030",
              "MTH00040",
              "CHE00001",
              "PHY00001",
              "PHY00002",
              "PHY00004",
              "PET00001",
              "PHY00081"
            ]
          },
          "ELECTIVE": {
            "name": "Học phần tự chọn",
            "credits_required": 2,
            "mandatory": false,
            "note": "Chọn 1 trong 2 học phần, tích lũy 2 tín chỉ.",
            "courses": [
              "GEO00002",
              "ENV00001"
            ]
          }
        }
      },
      "GENERAL_IT": {
        "name": "Tin học",
        "mandatory": true,
        "note": "Không tính vào điểm trung bình; tính vào số tín chỉ tích lũy; không tính trong 48 tín chỉ giáo dục đại cương và 132 tín chỉ toàn khóa.",
        "courses": [
          "CSC00003"
        ]
      },
      "GENERAL_ENGLISH": {
        "name": "Ngoại ngữ",
        "mandatory": false,
        "note": "Không tính vào điểm trung bình và tín chỉ tích lũy. Sinh viên đạt chuẩn ngoại ngữ đầu ra theo quy định hiện hành thì không đăng ký học các học phần Anh văn. Theo quy tắc tương thích UStudy của Project, các học phần trong khối ngoại ngữ có cơ chế miễn được gán course_type TC.",
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
        "note": "Không tính vào điểm trung bình; tính vào số tín chỉ tích lũy; không tính trong 48 tín chỉ giáo dục đại cương và 132 tín chỉ toàn khóa.",
        "courses": [
          "BAA00021",
          "BAA00022"
        ]
      },
      "GENERAL_DEFENSE": {
        "name": "Giáo dục quốc phòng - An ninh",
        "mandatory": true,
        "note": "Không tính vào điểm trung bình; tính vào số tín chỉ tích lũy; không tính trong 48 tín chỉ giáo dục đại cương và 132 tín chỉ toàn khóa.",
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
      "PET10001",
      "PET10002",
      "PET10003",
      "PET10004",
      "PET10005",
      "PET10006",
      "PET10007",
      "PET10008",
      "PET10009",
      "PHY10003",
      "PHY10005",
      "PHY10007",
      "PHY10010"
    ]
  },
  "MAJOR": {
    "name": "Kiến thức chuyên ngành",
    "total_credits_required": 36,
    "breakdown": {
      "MANDATORY": {
        "name": "Học phần bắt buộc",
        "credits": 18,
        "mandatory": true,
        "courses": [
          "PET10101",
          "PET10102",
          "PET10103",
          "PET10104",
          "PET10105",
          "PET10106"
        ]
      },
      "ELECTIVE": {
        "name": "Học phần tự chọn",
        "credits_required": 18,
        "mandatory": false,
        "note": "Tích lũy tổng cộng 18 tín chỉ từ danh sách học phần tự chọn.",
        "courses": [
          "PHY10205",
          "PHY10207",
          "PHY10211",
          "PHY10610",
          "PHY10612",
          "PHY10613",
          "PHY10614",
          "PHY10616",
          "PHY10620",
          "PHY10621",
          "PHY10623",
          "PHY10801",
          "PET10107",
          "PET10108",
          "PET10109",
          "PET10110",
          "PET10111",
          "PET10112",
          "PET10113",
          "PET10114",
          "PET10115",
          "PET10116",
          "PET10117",
          "PET10118",
          "PET10119",
          "PET10120",
          "PET10121"
        ]
      }
    }
  },
  "GRADUATION": {
    "name": "Kiến thức tốt nghiệp",
    "total_credits_required": 10,
    "note": "Sinh viên chọn 1 trong 2 phương án để tích lũy đủ 10 tín chỉ.",
    "options": [
      {
        "type": "THESIS",
        "name": "Phương án 1: Khóa luận tốt nghiệp",
        "credits": 10,
        "courses": [
          "PET10995"
        ]
      },
      {
        "type": "PROJECT_AND_SEMINAR",
        "name": "Phương án 2: Đồ án tốt nghiệp và Seminar chuyên ngành",
        "credits": 10,
        "courses": [
          "PET10990",
          "PET10991"
        ]
      }
    ]
  }
};
