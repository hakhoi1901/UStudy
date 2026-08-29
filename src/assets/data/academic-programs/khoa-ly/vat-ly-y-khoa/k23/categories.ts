export const categories = {
  "GENERAL_EDUCATION": {
    "name": "Giáo dục đại cương",
    "total_credits_required": 51,
    "note": "Tích lũy 51 TC, không kể Giáo dục quốc phòng - An ninh, Giáo dục thể chất, Tin học cơ sở và Ngoại ngữ theo mục 3 và mục 7.1 của PDF. Các nhóm bị loại khỏi tổng 131 TC vẫn được liệt kê bên dưới để mọi course_id đều truy cập được.",
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
            "credits": 33,
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
              "PHY00003",
              "PHY00004",
              "MPH00001",
              "PHY00081"
            ]
          },
          "ELECTIVE_ENVIRONMENT": {
            "name": "Học phần tự chọn Khoa học trái đất / Môi trường",
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
        "credits": 3,
        "mandatory": true,
        "note": "Không tính vào điểm trung bình, tính vào số tín chỉ tích lũy theo mục 7.1.4; đồng thời mục 3 loại Tin học cơ sở khỏi khối lượng 131 TC.",
        "courses": [
          "CSC00003"
        ]
      },
      "GENERAL_ENGLISH": {
        "name": "Ngoại ngữ",
        "mandatory": false,
        "note": "Không tính vào điểm trung bình và tín chỉ tích lũy. Sinh viên đạt chuẩn ngoại ngữ đầu ra theo quy định hiện hành thì không đăng ký học các học phần Anh văn. course_type của các học phần này được đặt TC theo quy tắc tương thích UStudy của Project.",
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
        "note": "Không tính vào điểm trung bình, tính vào số tín chỉ tích lũy theo mục 7.1.6; mục 3 loại GDTC khỏi khối lượng 131 TC.",
        "courses": [
          "BAA00021",
          "BAA00022"
        ]
      },
      "GENERAL_DEFENSE": {
        "name": "Giáo dục quốc phòng - An ninh",
        "credits": 4,
        "mandatory": true,
        "note": "Không tính vào điểm trung bình, tính vào số tín chỉ tích lũy theo mục 7.1.7; mục 3 loại GDQP-AN khỏi khối lượng 131 TC.",
        "courses": [
          "BAA00030"
        ]
      }
    }
  },
  "FOUNDATION": {
    "name": "Kiến thức cơ sở ngành",
    "total_credits_required": 30,
    "mandatory": true,
    "courses": [
      "PHY10001",
      "PHY10002",
      "PHY10003",
      "PHY10004",
      "PHY10005",
      "PHY10007",
      "PHY10008",
      "PHY10009",
      "PHY10010",
      "PHY10011",
      "PHY10012"
    ]
  },
  "MAJOR": {
    "name": "Kiến thức chuyên ngành",
    "total_credits_required": 40,
    "breakdown": {
      "MANDATORY": {
        "name": "Học phần bắt buộc",
        "credits": 34,
        "mandatory": true,
        "courses": [
          "MPH10101",
          "MPH10102",
          "MPH10103",
          "MPH10104",
          "MPH10105",
          "MPH10106",
          "MPH10107",
          "MPH10108",
          "MPH10109",
          "MPH10110",
          "MPH10111",
          "MPH10112"
        ]
      },
      "ELECTIVE": {
        "name": "Học phần tự chọn",
        "credits_required": 6,
        "mandatory": false,
        "note": "Tích lũy tổng cộng 06 tín chỉ từ các học phần trong danh sách.",
        "courses": [
          "MPH10113",
          "MPH10114",
          "MPH10115",
          "MPH10116",
          "MPH10117",
          "MPH10118",
          "MPH10119",
          "MPH10120"
        ]
      }
    }
  },
  "GRADUATION": {
    "name": "Kiến thức tốt nghiệp",
    "total_credits_required": 10,
    "note": "Sinh viên chọn 1 trong 2 phương án để tích lũy đủ 10 TC.",
    "options": [
      {
        "type": "THESIS",
        "name": "Phương án 1 - Khóa luận tốt nghiệp",
        "credits": 10,
        "courses": [
          "MPH10995"
        ]
      },
      {
        "type": "NON_THESIS",
        "name": "Phương án 2 - Không đủ điều kiện làm Khóa luận tốt nghiệp",
        "credits": 10,
        "note": "Tích lũy 10 tín chỉ từ Đồ án tốt nghiệp và Seminar chuyên ngành.",
        "courses": [
          "MPH10991",
          "MPH10992"
        ]
      }
    ]
  }
};
