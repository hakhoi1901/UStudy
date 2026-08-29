export const categories = {
  "GENERAL_EDUCATION": {
    "name": "Giáo dục đại cương",
    "total_credits_required": 47,
    "note": "47 tín chỉ tính vào khối lượng chương trình; không kể Giáo dục thể chất, Giáo dục quốc phòng - An ninh, Tin học cơ sở và Ngoại ngữ (PDF trang 4-5).",
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
        "total_credits_required": 31,
        "breakdown": {
          "MANDATORY": {
            "name": "Học phần bắt buộc",
            "credits": 28,
            "mandatory": true,
            "courses": [
              "MTH00001",
              "MTH00002",
              "MTH00040",
              "MTH00085",
              "PHY00001",
              "PHY00004",
              "CHE00002",
              "CHE00003",
              "CHE00081",
              "ENV00001",
              "GEO00011"
            ]
          },
          "BIOLOGY_ELECTIVE": {
            "name": "Tự chọn Sinh đại cương",
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
        "note": "Không tính vào điểm trung bình; tính vào số tín chỉ tích lũy; không tính trong 47/126 tín chỉ của chương trình.",
        "courses": [
          "CSC00003"
        ]
      },
      "GENERAL_ENGLISH": {
        "name": "Ngoại ngữ",
        "credits": 12,
        "mandatory": false,
        "note": "Không tính vào điểm trung bình và tín chỉ tích lũy. SV đạt chuẩn ngoại ngữ đầu ra theo quy định hiện hành thì không đăng ký học các học phần Anh văn. course_type=TC và mandatory=false theo quy tắc tương thích UStudy.",
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
        "note": "Không tính vào điểm trung bình; tính vào số tín chỉ tích lũy; không tính trong 47/126 tín chỉ của chương trình.",
        "courses": [
          "BAA00021",
          "BAA00022"
        ]
      },
      "GENERAL_DEFENSE": {
        "name": "Giáo dục quốc phòng - An ninh",
        "credits": 4,
        "mandatory": true,
        "note": "Không tính vào điểm trung bình; tính vào số tín chỉ tích lũy; không tính trong 47/126 tín chỉ của chương trình.",
        "courses": [
          "BAA00030"
        ]
      }
    }
  },
  "FOUNDATION": {
    "name": "Kiến thức cơ sở ngành",
    "total_credits_required": 52,
    "breakdown": {
      "MANDATORY": {
        "name": "Học phần bắt buộc",
        "credits": 44,
        "mandatory": true,
        "courses": [
          "GEO10001",
          "GEO10002",
          "GEO10052",
          "GEO10004",
          "GEO10005",
          "GEO10015",
          "GEO10028",
          "GEO10009",
          "GEO10055",
          "GEO10056",
          "GEO10057",
          "GEO10013",
          "GEO10059",
          "GEO10060",
          "GEO10062",
          "GEO10063",
          "GEO10029",
          "GEO10024",
          "GEO10025"
        ]
      },
      "ELECTIVE": {
        "name": "Học phần tự chọn",
        "credits_required": 8,
        "mandatory": false,
        "note": "Tích lũy tổng cộng 8 tín chỉ từ danh sách học phần tự chọn.",
        "courses": [
          "GEO10030",
          "GEO10031",
          "GEO10032",
          "GEO20201",
          "GEO10058",
          "GEO10066",
          "GEO10061",
          "GEO10033",
          "GEO10008",
          "GEO10034",
          "GEO10065"
        ]
      }
    }
  },
  "MAJOR": {
    "name": "Kiến thức chuyên ngành",
    "total_credits_required": 17,
    "note": "Chương trình có 6 chuyên ngành. Với chuyên ngành được chọn, sinh viên tích lũy tối thiểu 17 tín chỉ từ danh sách học phần tương ứng.",
    "options": [
      {
        "type": "MINERAL_RESOURCES",
        "name": "Địa chất Khoáng sản",
        "credits_required": 17,
        "mandatory": false,
        "note": "Tích lũy tối thiểu 17 tín chỉ từ danh sách này.",
        "courses": [
          "GEO10111",
          "GEO10102",
          "GEO10112",
          "GEO10104",
          "GEO10113",
          "GEO10114",
          "GEO10106",
          "GEO10108",
          "GEO10115",
          "GEO10116"
        ]
      },
      {
        "type": "GEMOLOGY",
        "name": "Ngọc học",
        "credits_required": 17,
        "mandatory": false,
        "note": "Tích lũy tối thiểu 17 tín chỉ từ danh sách này.",
        "courses": [
          "GEO10201",
          "GEO10210",
          "GEO10203",
          "GEO10211",
          "GEO10212",
          "GEO10213",
          "GEO10114",
          "GEO10214",
          "GEO10110",
          "GEO10206",
          "GEO10215",
          "GEO10205"
        ]
      },
      {
        "type": "PETROLEUM_GEOLOGY",
        "name": "Địa chất Dầu khí",
        "credits_required": 17,
        "mandatory": false,
        "note": "Tích lũy tối thiểu 17 tín chỉ từ danh sách này.",
        "courses": [
          "GEO10301",
          "GEO10311",
          "GEO10303",
          "GEO10304",
          "GEO10305",
          "GEO10308",
          "GEO10114",
          "GEO10307",
          "GEO10309",
          "GEO10312",
          "GEO10313",
          "GEO10314"
        ]
      },
      {
        "type": "HYDRO_ENGINEERING_GEOLOGY",
        "name": "Địa chất Thủy văn - Địa chất Công trình",
        "credits_required": 17,
        "mandatory": false,
        "note": "Tích lũy tối thiểu 17 tín chỉ từ danh sách này.",
        "courses": [
          "GEO10411",
          "GEO10404",
          "GEO10409",
          "GEO10412",
          "GEO10405",
          "GEO10413",
          "GEO10114",
          "GEO10414",
          "GEO10403",
          "GEO10415",
          "GEO10416"
        ]
      },
      {
        "type": "ENVIRONMENTAL_GEOLOGY",
        "name": "Địa chất Môi trường",
        "credits_required": 17,
        "mandatory": false,
        "note": "Tích lũy tối thiểu 17 tín chỉ từ danh sách này.",
        "courses": [
          "GEO10503",
          "GEO10504",
          "GEO10509",
          "GEO10414",
          "GEO10510",
          "GEO10501",
          "GEO10114",
          "GEO10505",
          "GEO10409",
          "GEO10502",
          "GEO10511"
        ]
      },
      {
        "type": "MARINE_GEOLOGY",
        "name": "Địa chất Biển",
        "credits_required": 17,
        "mandatory": false,
        "note": "Tích lũy tối thiểu 17 tín chỉ từ danh sách này.",
        "courses": [
          "GEO10613",
          "GEO10602",
          "GEO10614",
          "GEO10606",
          "GEO10607",
          "GEO10608",
          "GEO10114",
          "GEO10609",
          "GEO10604",
          "GEO10611",
          "GEO10612"
        ]
      }
    ]
  },
  "GRADUATION": {
    "name": "Kiến thức tốt nghiệp",
    "total_credits_required": 10,
    "note": "Sinh viên chọn 1 trong 2 phương án để tích lũy đủ 10 tín chỉ.",
    "options": [
      {
        "type": "THESIS",
        "name": "Phương án 1 - Khóa luận tốt nghiệp",
        "credits": 10,
        "note": "Chọn 1 học phần Khóa luận tốt nghiệp 10 tín chỉ tương ứng với chuyên ngành.",
        "courses": [
          "GEO10195",
          "GEO10295",
          "GEO10395",
          "GEO10495",
          "GEO10595",
          "GEO10695"
        ]
      },
      {
        "type": "PROJECT_PLUS_MAJOR_ELECTIVES",
        "name": "Phương án 2 - Đồ án tốt nghiệp và học phần tự chọn chuyên ngành",
        "credits": 10,
        "note": "Học 1 Đồ án tốt nghiệp 6 tín chỉ tương ứng chuyên ngành và chọn thêm 4 tín chỉ học phần tự chọn của chuyên ngành, không trùng với các học phần đã học ở mục 7.2.2. Danh sách môn được phép chọn thêm theo chuyên ngành: Địa chất Khoáng sản: GEO10111, GEO10102, GEO10112, GEO10104, GEO10113, GEO10114, GEO10106, GEO10108, GEO10115, GEO10116; Ngọc học: GEO10201, GEO10210, GEO10203, GEO10211, GEO10212, GEO10213, GEO10114, GEO10214, GEO10110, GEO10206, GEO10215, GEO10205; Địa chất Dầu khí: GEO10301, GEO10311, GEO10303, GEO10304, GEO10305, GEO10308, GEO10114, GEO10307, GEO10309, GEO10312, GEO10313, GEO10314; Địa chất Thủy văn - Địa chất Công trình: GEO10411, GEO10404, GEO10409, GEO10412, GEO10405, GEO10413, GEO10114, GEO10414, GEO10403, GEO10415, GEO10416; Địa chất Môi trường: GEO10503, GEO10504, GEO10509, GEO10414, GEO10510, GEO10501, GEO10114, GEO10505, GEO10409, GEO10502, GEO10511; Địa chất Biển: GEO10613, GEO10602, GEO10614, GEO10606, GEO10607, GEO10608, GEO10114, GEO10609, GEO10604, GEO10611, GEO10612",
        "courses": [
          "GEO10190",
          "GEO10290",
          "GEO10390",
          "GEO10490",
          "GEO10590",
          "GEO10690"
        ]
      }
    ]
  }
};
