export const categories = {
  "GENERAL_EDUCATION": {
    "name": "Giáo dục đại cương",
    "total_credits_required": 56,
    "note": "Không kể Ngoại ngữ, GDTC và GDQPAN",
    "breakdown": {
      "GENERAL_POLITICS": {
        "name": "Lý luận chính trị – Pháp luật",
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
        "name": "Khoa học xã hội – Kinh tế – Kỹ năng",
        "credits": 2,
        "mandatory": false,
        "note": "Chọn 1 trong 3",
        "courses": [
          "BAA00005",
          "BAA00006",
          "BAA00007"
        ]
      },
      "GENERAL_MATH_SCIENCE": {
        "name": "Toán – Khoa học tự nhiên – Môi trường",
        "credits": 36,
        "mandatory": true,
        "note": "Toán: 24 TC (bắt buộc) + 4 TC (chọn 1/3) + Khoa học: 6 TC + Môi trường: 2 TC",
        "breakdown": {
          "GENERAL_MATH_SCIENCE": {
            "name": "Toán – Khoa học tự nhiên – Môi trường",
            "total_credits_required": 36,
            "breakdown": {
              "MATH_MANDATORY": {
                "name": "Toán bắt buộc",
                "credits_required": 24,
                "courses": ["MTH00021", "MTH00022", "MTH00035", "MTH00044", "MTH00045", "MTH00050"]
              },
              "MATH_ELECTIVE": {
                "name": "Toán tự chọn",
                "credits_required": 4,
                "note": "Chọn 1 trong 3",
                "courses": [
                  "MTH00051",
                  "MTH00052",
                  "MTH00053"
                ]
              },
              "SCIENCE": {
                "name": "Khoa học tự nhiên",
                "credits_required": 6,
                "note": "Chọn đủ 6 tín chỉ",
                "courses": [
                  "CHE00001",
                  "CHE00002",
                  "CHE00081",
                  "CHE00082",
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
                "note": "Chọn 1 trong 3 môn",
                "courses": [
                  "GEO00002",
                  "ENV00001",
                  "ENV00003"
                ]
              }
            }
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
        "name": "Ngoại ngữ (Anh văn)",
        "credits": 12,
        "mandatory": false,
        "note": "Không tính vào điểm TB và TC tích lũy. SV đạt chuẩn ngoại ngữ đầu ra không cần đăng ký",
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
    "name": "Cơ Sở Ngành",
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
  "GRADUATION": {
    "name": "Tốt nghiệp",
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
        "type": "PROJECT",
        "credits": 10,
        "courses": [

        ]
      }
    ]
  }
}