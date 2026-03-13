
export const categories = {
  "GENERAL_EDUCATION": {
    "name": "Giáo dục đại cương",
    "total_credits_required": 50,
    "note": "Không kể môn GDQP, GDTC, tin học cơ sở và ngoại ngữ tổng quát",
    "breakdown": {
      "GENERAL_POLITICS": {
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
      "GENERAL_SOCIAL": {
        "name": "Khoa học xã hội - Kinh tế - Kỹ năng",
        "credits": 2,
        "mandatory": false,
        "note": "Chọn 01 học phần (02 tín chỉ) trong 5 học phần",
        "courses": [
          "BAA00005",
          "BAA00006",
          "BAA00007",
          "BAA00015",
          "BAA00016"
        ]
      },
      "GENERAL_MATH_SCIENCE": {
        "name": "Toán - Khoa học tự nhiên - Công nghệ - Môi trường",
        "credits": 34,
        "mandatory": true,
        "breakdown": {
          "MANDATORY": {
            "name": "Bắt buộc",
            "credits_required": 32,
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
            "name": "Tự chọn",
            "credits_required": 2,
            "note": "Chọn 02 tín chỉ trong các môn học này",
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
        "credits": 3,
        "mandatory": true,
        "note": "Không tính vào điểm trung bình, tính vào số tín chỉ tích lũy",
        "courses": [
          "CSC00003"
        ]
      },
      "GENERAL_ENGLISH": {
        "name": "Ngoại ngữ",
        "credits": 12,
        "mandatory": false,
        "note": "Không tính vào điểm trung bình và số tín chỉ tích lũy",
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
        "note": "Không tính vào điểm trung bình, tính vào số tín chỉ tích lũy",
        "courses": [
          "BAA00021",
          "BAA00022"
        ]
      },
      "GENERAL_DEFENSE": {
        "name": "Giáo dục quốc phòng - An ninh",
        "credits": 4,
        "mandatory": true,
        "note": "Không tính vào điểm trung bình, tính vào số tín chỉ tích lũy",
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
      "CHE10002", "CHE10003", "CHE10004", "CHE10006", "CHE10007", "CHE10008",
      "CHE10009", "CHE10010", "CHE10011", "CHE10012", "CHE10013", "CHE10014",
      "CHE10015", "CHE10016", "CHE10017", "CHE10018", "CHE10024", "CHE10025",
      "CHE10026", "CHE10027", "CHE10029", "CHE10030"
    ]
  },
  "MAJOR": {
    "name": "Kiến thức chuyên ngành",
    "total_credits_required": 23,
    "breakdown": {
      "MANDATORY": {
        "name": "Học phần bắt buộc",
        "credits": 13,
        "note": "Sinh viên tích lũy 08 TC trong số 12 học phần tự chọn và 05 TC của hai học phần bắt buộc",
        "courses": [
          "CHE10105", "CHE10106", "CHE10202", "CHE10203", "CHE10301", "CHE10303",
          "CHE10403", "CHE10408", "CHE10501", "CHE10502", "CHE10601", "CHE10608",
          "CHE10785", "CHE10023"
        ]
      },
      "ELECTIVE": {
        "name": "Học phần tự chọn",
        "credits": 10,
        "note": "Tích lũy 10 tín chỉ, trong đó phải có tối thiểu 01 môn Thực hành chuyên ngành (THCN)",
        "courses": [
          "CHE10019", "CHE10022", "CHE10028", "CHE10101", "CHE10102", "CHE10103",
          "CHE10104", "CHE10121", "CHE10122", "CHE10123", "CHE10124", "CHE10126",
          "CHE10131", "CHE10132", "CHE10133", "CHE10134", "CHE10201", "CHE10204",
          "CHE10205", "CHE10206", "CHE10220", "CHE10222", "CHE10223", "CHE10226",
          "CHE10227", "CHE10228", "CHE10229", "CHE10230", "CHE10231", "CHE10232",
          "CHE10302", "CHE10304", "CHE10305", "CHE10306", "CHE10320", "CHE10321",
          "CHE10322", "CHE10323", "CHE10324", "CHE10325", "CHE10326", "CHE10327",
          "CHE10328", "CHE10330", "CHE10401", "CHE10402", "CHE10404", "CHE10405",
          "CHE10420", "CHE10421", "CHE10422", "CHE10423", "CHE10425", "CHE10426",
          "CHE10427", "CHE10428", "CHE10503", "CHE10504", "CHE10505", "CHE10506",
          "CHE10520", "CHE10521", "CHE10522", "CHE10523", "CHE10524", "CHE10525",
          "CHE10526", "CHE10527", "CHE10528", "CHE10602", "CHE10603", "CHE10606",
          "CHE10621", "CHE10622", "CHE10624", "CHE10625", "CHE10627", "CHE10630"
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
          "CHE10700"
        ]
      }
    ]
  },
  "MASTER_TRANSITION": {
    "name": "Danh mục các học phần được đăng ký học trước của chương trình đào tạo thạc sĩ",
    "courses": [
      "CHE10105", "CHE10106", "CHE10501", "CHE10601", "CHE10608", "CHE10408",
      "CHE10402", "CHE10203", "CHE10202", "CHE10303", "CHE10301", "CHE10101",
      "CHE10102", "CHE10630", "CHE10201", "CHE10227", "CHE10320", "CHE10321",
      "CHE10302", "CHE10403", "CHE10228", "CHE10505", "CHE10521", "CHE10520",
      "CHE10522"
    ]
  }
};