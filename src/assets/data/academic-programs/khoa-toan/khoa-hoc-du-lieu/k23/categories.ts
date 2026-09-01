export const categories = {
  "GENERAL_EDUCATION": {
    "name": "Giáo dục đại cương",
    "total_credits_required": 52,
    "note": "Tích lũy 52 tín chỉ, không kể Giáo dục quốc phòng - An ninh, Giáo dục thể chất, Tin học cơ sở và Ngoại ngữ.",
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
          "BAA00008"
        ]
      },
      "GENERAL_MATH_SCIENCE": {
        "name": "Toán - Khoa học tự nhiên - Công nghệ - Môi trường",
        "total_credits_required": 36,
        "breakdown": {
          "MANDATORY": {
            "name": "Học phần bắt buộc",
            "credits": 30,
            "mandatory": true,
            "courses": [
              "MTH00003",
              "MTH00081",
              "MTH00004",
              "MTH00082",
              "MTH00030",
              "MTH00083",
              "MTH00042",
              "MTH00018",
              "MTH00041",
              "MTH00086",
              "MTH00050",
              "MTH00055"
            ]
          },
          "SCIENCE_ELECTIVE": {
            "name": "Nhóm tự chọn Khoa học tự nhiên",
            "credits_required": 4,
            "mandatory": false,
            "note": "Chọn 4 tín chỉ trong nhóm các học phần sau.",
            "courses": [
              "BIO00001",
              "BIO00002",
              "BIO00081",
              "BIO00082",
              "CHE00001",
              "CHE00002",
              "CHE00081",
              "CHE00082",
              "PHY00001",
              "PHY00002",
              "PHY00081"
            ]
          },
          "ENVIRONMENT_ELECTIVE": {
            "name": "Nhóm tự chọn Môi trường",
            "credits_required": 2,
            "mandatory": false,
            "note": "Chọn 1 học phần trong các học phần sau.",
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
        "mandatory": true,
        "note": "Không tính vào điểm trung bình; tín chỉ của học phần này không nằm trong tổng 52 tín chỉ giáo dục đại cương và không nằm trong tổng 129 tín chỉ toàn khóa.",
        "courses": [
          "CSC00003"
        ]
      },
      "GENERAL_ENGLISH": {
        "name": "Ngoại ngữ",
        "mandatory": false,
        "note": "Không tính vào điểm trung bình và tín chỉ tích lũy. Sinh viên chỉ đăng ký học nếu chưa có chứng chỉ đạt chuẩn ngoại ngữ đầu ra theo quy định hiện hành.",
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
        "note": "Không tính vào điểm trung bình; PDF ghi tính vào số tín chỉ tích lũy, nhưng khối này không nằm trong tổng 52 tín chỉ giáo dục đại cương và tổng 129 tín chỉ toàn khóa.",
        "courses": [
          "BAA00021",
          "BAA00022"
        ]
      },
      "GENERAL_DEFENSE": {
        "name": "Giáo dục quốc phòng - An ninh",
        "mandatory": true,
        "note": "Không tính vào điểm trung bình; PDF ghi tính số tín chỉ tích lũy, nhưng khối này không nằm trong tổng 52 tín chỉ giáo dục đại cương và tổng 129 tín chỉ toàn khóa.",
        "courses": [
          "BAA00030"
        ]
      }
    }
  },
  "PROFESSIONAL_EDUCATION": {
    "name": "Giáo dục chuyên nghiệp",
    "total_credits_required": 77,
    "breakdown": {
      "FOUNDATION": {
        "name": "Kiến thức cơ sở ngành",
        "total_credits_required": 32,
        "mandatory": true,
        "courses": [
          "MTH10107",
          "MTH10407",
          "MTH10405",
          "MTH10312",
          "MTH10311",
          "MTH10131",
          "MTH10109",
          "MTH10171",
          "MTH10433"
        ]
      },
      "MAJOR": {
        "name": "Kiến thức chuyên ngành",
        "total_credits_required": 35,
        "breakdown": {
          "MANDATORY": {
            "name": "Học phần bắt buộc",
            "credits": 16,
            "mandatory": true,
            "courses": [
              "MTH10318",
              "MTH10358",
              "MTH10353",
              "MTH10605"
            ]
          },
          "ELECTIVE": {
            "name": "Học phần tự chọn",
            "credits_required": 19,
            "mandatory": false,
            "note": "Tích lũy tổng cộng ít nhất 19 tín chỉ từ các học phần trong danh sách.",
            "courses": [
              "MTH10619",
              "MTH10513",
              "MTH10449",
              "MTH10450",
              "MTH10446",
              "MTH10624",
              "MTH10625",
              "MTH10203",
              "MTH10344",
              "MTH10606",
              "MTH10356",
              "MTH10352",
              "MTH10354",
              "MTH10608",
              "MTH10607",
              "MTH10622",
              "MTH10623",
              "MTH10620",
              "MTH10322",
              "MTH10359"
            ]
          }
        }
      },
      "GRADUATION": {
        "name": "Kiến thức tốt nghiệp",
        "total_credits_required": 10,
        "note": "Sinh viên chọn 1 trong 2 phương án để tích lũy 10 tín chỉ.",
        "options": [
          {
            "name": "Phương án 1 - Khóa luận tốt nghiệp",
            "credits": 10,
            "courses": [
              "MTH10595"
            ]
          },
          {
            "name": "Phương án 2 - Đồ án tốt nghiệp và học phần tự chọn",
            "credits": 10,
            "note": "Thực hiện Đồ án tốt nghiệp 6 tín chỉ và học các học phần tự chọn trong danh sách để tích lũy 10 tín chỉ cho phương án. PDF không quy định số môn phải chọn.",
            "courses": [
              "MTH10597",
              "MTH10549",
              "MTH10626",
              "MTH10627"
            ]
          }
        ]
      }
    }
  }
};
