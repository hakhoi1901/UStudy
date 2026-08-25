// Phân cấp dựa trên CTĐT K24; chỉ giữ mã có trong CTĐT K25.
export const categories = {
  "GENERAL_EDUCATION": {
    "name": "Giáo dục đại cương",
    "total_credits_required": 56,
    "note": "Không kể Ngoại ngữ, GDTC và GDQPAN",
    "breakdown": {
      "GENERAL_POLITICS": {
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
      "GENERAL_SOCIAL": {
        "name": "Khoa học xã hội - Kinh tế - Kỹ năng",
        "credits": 2,
        "mandatory": false,
        "note": "Chọn 01 học phần (02 tín chỉ)",
        "courses": [
          "BAA00005",
          "BAA00006",
          "BAA00007"
        ]
      },
      "GENERAL_MATH_SCIENCE": {
        "name": "Toán - Khoa học tự nhiên - Công nghệ - Môi trường",
        "credits": 36,
        "mandatory": true,
        "note": "Toán: 24 TC (bắt buộc) + 4 TC (chọn 1) + KHTN: 6 TC + Môi trường: 2 TC",
        "breakdown": {
          "MATH_MANDATORY": {
            "name": "Toán bắt buộc",
            "credits_required": 24,
            "courses": [
              "MTH00021",
              "MTH00022",
              "MTH00035",
              "MTH00044",
              "MTH00045",
              "MTH00050"
            ]
          },
          "MATH_ELECTIVE": {
            "name": "Toán tự chọn",
            "credits_required": 4,
            "note": "Chọn 01 học phần (04 tín chỉ)",
            "courses": [
              "MTH00051",
              "MTH00052",
              "MTH00053"
            ]
          },
          "SCIENCE": {
            "name": "Khoa học tự nhiên",
            "credits_required": 6,
            "note": "Chọn 06 tín chỉ",
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
          "ENVIRONMENT": {
            "name": "Môi trường",
            "credits_required": 2,
            "note": "Chọn 01 học phần (02 tín chỉ)",
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
          "CSC00004"
        ]
      },
      "GENERAL_ENGLISH": {
        "name": "Ngoại ngữ",
        "credits": 12,
        "mandatory": false,
        "note": "Không tính vào điểm TB và TC tích lũy",
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
        "note": "Không tính vào điểm TB, tính vào TC tích lũy",
        "courses": [
          "BAA00021",
          "BAA00022"
        ]
      },
      "GENERAL_DEFENSE": {
        "name": "Giáo dục quốc phòng - An ninh",
        "credits": 4,
        "mandatory": true,
        "note": "Không tính vào điểm TB, tính vào TC tích lũy",
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
      "CSC10012",
      "CSC10003",
      "CSC10004",
      "CSC10014",
      "CSC10006",
      "CSC10007",
      "CSC10008",
      "CSC10009",
      "CSC13002",
      "CSC14003"
    ]
  },
  "MAJOR_IS": {
    "name": "Ngành Hệ thống thông tin",
    "total_credits_required": 34,
    "breakdown": {
      "MANDATORY": {
        "credits": 16,
        "note": "Sinh viên tích lũy ít nhất 04 học phần (>= 16TC)",
        "courses": [
          "CSC12002",
          "CSC12003",
          "CSC12004",
          "CSC12005"
        ]
      },
      "ELECTIVE": {
        "credits": 8,
        "note": "Sinh viên tích lũy ít nhất 02 học phần (>= 08TC)",
        "courses": [
          "CSC10121",
          "CSC10102",
          "CSC10103",
          "CSC10104",
          "CSC10105",
          "CSC10106",
          "CSC10107",
          "CSC10108",
          "CSC12001",
          "CSC12105",
          "CSC12106",
          "CSC17101",
          "CSC17106"
        ]
      },
      "FREE_ELECTIVES": {
        "name": "Các học phần tự chọn tự do (Danh sách đầy đủ Phụ lục 1)",
        "credits": 10,
        "note": "Dùng để tích lũy đủ số tín chỉ chuyên ngành còn thiếu",
        "courses": [
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
          "CSC12001",
          "CSC12105",
          "CSC12106",
          "CSC17101",
          "CSC12107",
          "CSC12108",
          "CSC12111",
          "CSC17106"
        ]
      }
    }
  },
  "GRADUATION": {
    "name": "Kiến thức Tốt nghiệp",
    "total_credits_required": 10,
    "options": [
      {
        "type": "THESIS",
        "credits": 10,
        "courses": [
          "CSC10251"
        ]
      },
      {
        "type": "INTERNSHIP",
        "credits": 10,
        "courses": [
          "CSC10252"
        ]
      },
      {
        "type": "PROJECT_AND_ELECTIVES",
        "credits": 10,
        "note": "Thực tập dự án tốt nghiệp (6TC) kết hợp 01 học phần (4TC) tương ứng",
        "courses": [
          "CSC10204",
          "CSC12107",
          "CSC12108",
          "CSC12111"
        ]
      }
    ]
  },
  "MASTER_TRANSITION": {
    "name": "Danh sách học phần Chương trình liên thông Đại học - Thạc sỹ (Phụ lục 2)",
    "courses": [
      "CSC10006",
      "CSC14003",
      "CSC10108",
      "CSC12004",
      "CSC12107"
    ]
  }
};
