export const categories = {
  "GENERAL_EDUCATION": {
    "name": "Kiến thức giáo dục đại cương",
    "total_credits_required": 52,
    "note": "Tích lũy 52 TC, không kể Giáo dục thể chất, Giáo dục quốc phòng - An ninh, Tin học cơ sở và Ngoại ngữ (PDF trang 6-7).",
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
        "note": "Chọn 1 môn trong nhóm TC1, tích lũy 2 TC.",
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
            "credits": 34,
            "mandatory": true,
            "courses": [
              "MTH00003",
              "MTH00002",
              "MTH00040",
              "CHE00001",
              "CHE00002",
              "CHE00081",
              "PHY00001",
              "PHY00002",
              "PHY00004",
              "PHY00081",
              "MSC00001",
              "MST00002"
            ]
          },
          "ELECTIVE_TC2": {
            "name": "Nhóm tự chọn TC2",
            "credits_required": 2,
            "mandatory": false,
            "note": "Chọn 1 môn trong nhóm TC2, tích lũy 2 TC.",
            "courses": [
              "GEO00002",
              "ENV00001",
              "MST00001"
            ]
          }
        }
      },
      "GENERAL_IT": {
        "name": "Tin học",
        "credits": 3,
        "mandatory": true,
        "note": "Không tính vào điểm trung bình; tính vào số tín chỉ tích lũy. Không nằm trong 52 TC giáo dục đại cương dùng để tính tổng 130 TC.",
        "courses": [
          "CSC00003"
        ]
      },
      "GENERAL_ENGLISH": {
        "name": "Ngoại ngữ",
        "credits": 12,
        "mandatory": false,
        "note": "Không tính vào điểm trung bình và tín chỉ tích lũy. Sinh viên đạt chuẩn ngoại ngữ đầu ra theo quy định hiện hành thì không đăng ký học các học phần Anh văn. course_type được đặt TC theo quy tắc tương thích UStudy bắt buộc của Project. Không nằm trong 52 TC giáo dục đại cương dùng để tính tổng 130 TC.",
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
        "note": "Không tính vào điểm trung bình; tính vào số tín chỉ tích lũy. Không nằm trong 52 TC giáo dục đại cương dùng để tính tổng 130 TC.",
        "courses": [
          "BAA00021",
          "BAA00022"
        ]
      },
      "GENERAL_DEFENSE": {
        "name": "Giáo dục quốc phòng - An ninh",
        "credits": 4,
        "mandatory": true,
        "note": "Không tính vào điểm trung bình; tính vào số tín chỉ tích lũy. Không nằm trong 52 TC giáo dục đại cương dùng để tính tổng 130 TC.",
        "courses": [
          "BAA00030"
        ]
      }
    }
  },
  "FOUNDATION": {
    "name": "Kiến thức cơ sở ngành",
    "total_credits_required": 42,
    "breakdown": {
      "MANDATORY": {
        "name": "Học phần bắt buộc",
        "credits": 40,
        "mandatory": true,
        "courses": [
          "MSC10006",
          "MSC10007",
          "MST10001",
          "MST10002",
          "MST10003",
          "MST10005",
          "MST10008",
          "MST10009",
          "MST10011",
          "MST10015",
          "MST10016",
          "MST10017",
          "MST10018",
          "MST10019",
          "MST10020",
          "MST10021",
          "MST10022",
          "MST10023"
        ]
      },
      "ELECTIVE": {
        "name": "Nhóm tự chọn cơ sở ngành",
        "credits_required": 2,
        "mandatory": false,
        "note": "Chọn 1 môn trong nhóm TC, tích lũy 2 TC.",
        "courses": [
          "MST10024",
          "MST10025",
          "MST10026"
        ]
      }
    }
  },
  "MAJOR": {
    "name": "Kiến thức chuyên ngành",
    "total_credits_required": 26,
    "note": "Chọn một trong 4 chuyên ngành; mỗi chuyên ngành tích lũy 26 TC.",
    "options": [
      {
        "type": "POLYMER_COMPOSITE",
        "name": "Công nghệ Vật liệu Polymer &Composite",
        "credits": 26,
        "courses": [
          "MSC10012",
          "MST10112",
          "MST10129",
          "MST10136",
          "MST10137",
          "MSC10201",
          "MSC10202",
          "MSC10219",
          "MST10101",
          "MST10138",
          "MST10139",
          "MST10140"
        ]
      },
      {
        "type": "BIOMEDICAL_MATERIALS",
        "name": "Công nghệ Vật liệu Y Sinh",
        "credits": 26,
        "courses": [
          "MSC10012",
          "MST10112",
          "MST10129",
          "MST10136",
          "MST10137",
          "MSC10315",
          "MST10201",
          "MST10202",
          "MST10203",
          "MST10204",
          "MST10205",
          "MST10206"
        ]
      },
      {
        "type": "SEMICONDUCTOR_MATERIALS",
        "name": "Công nghệ Vật liệu bán dẫn",
        "credits": 26,
        "courses": [
          "MSC10012",
          "MST10112",
          "MST10129",
          "MST10136",
          "MST10137",
          "MST10301",
          "MST10302",
          "MST10303",
          "MST10304",
          "MST10305",
          "MST10306",
          "MST10307"
        ]
      },
      {
        "type": "RENEWABLE_ENERGY_MATERIALS",
        "name": "Công nghệ Vật liệu năng lượng tái tạo",
        "credits": 26,
        "courses": [
          "MSC10012",
          "MST10112",
          "MST10129",
          "MST10136",
          "MST10137",
          "MST10401",
          "MST10402",
          "MST10403",
          "MST10404",
          "MST10405",
          "MST10406",
          "MST10407"
        ]
      }
    ]
  },
  "GRADUATION": {
    "name": "Kiến thức tốt nghiệp",
    "total_credits_required": 10,
    "note": "Sinh viên chọn 1 trong 2 phương án để tích lũy 10 TC.",
    "options": [
      {
        "type": "THESIS",
        "name": "Phương án 1 - Khóa luận tốt nghiệp",
        "credits": 10,
        "courses": [
          "MST10195"
        ]
      },
      {
        "type": "SEMINAR_AND_ELECTIVES",
        "name": "Phương án 2 - Seminar tốt nghiệp và học phần tự chọn",
        "credits": 10,
        "note": "Học Seminar tốt nghiệp 6 TC và chọn 02 môn trong nhóm TC, mỗi môn 2 TC, để tích lũy thêm 4 TC.",
        "courses": [
          "MST10190",
          "MST10121",
          "MST10171",
          "MST10172",
          "MST10173",
          "MST10174",
          "MST10175",
          "MST10176",
          "MST10177",
          "MST10178"
        ]
      }
    ]
  }
};
