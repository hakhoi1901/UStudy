export const categories = {
    "GENERAL_EDUCATION": {
        "name": "Giáo dục đại cương",
        "note": "Theo Module Handbook Khoa học vật liệu 2025; các mã học phần dùng đúng mã công bố trong handbook hoặc mã học phần chung HCMUS.",
        "courses": [
            "BAA00101",
            "BAA00102",
            "BAA00103",
            "BAA00104",
            "BAA00003",
            "BAA00004",
            "BAA00005",
            "BAA00006",
            "BAA00007",
            "GEO00002",
            "ENV00001",
            "CHE00001",
            "CHE00002",
            "CHE00081",
            "BIO00001",
            "MTH00003",
            "MTH00002",
            "MTH00040",
            "PHY00001",
            "PHY00002",
            "PHY00081",
            "PHY00004",
            "CSC00003",
            "ADD00031",
            "ADD00032",
            "ADD00033",
            "ADD00034",
            "BAA00021",
            "BAA00022",
            "BAA00030"
        ]
    },
    "FOUNDATION": {
        "name": "Kiến thức cơ sở ngành",
        "note": "Các học phần mới/không có mã trong handbook không được tự gán mã: Practice of Fundamental Materials Science (new course — handbook không ghi mã HP); Materials Chemistry (new course — handbook không ghi mã HP); Introduction to Biomaterials (handbook không ghi mã HP); Materials simulation & modelling (new course — handbook không ghi mã HP)",
        "courses": [
            "MSC00001",
            "MSC00010",
            "MSC10004",
            "MSC10018",
            "MSC10002",
            "MSC10010",
            "MSC10011",
            "MSC10016",
            "MSC10017",
            "MSC10005"
        ]
    },
    "MAJOR_MATERIALS_SCIENCE": {
        "name": "Kiến thức chuyên ngành Khoa học vật liệu",
        "specializations": {
            "POLYMER_COMPOSITE": {
                "name": "Vật liệu polymer và composite",
                "breakdown": {
                    "MANDATORY": {
                        "courses": [
                            "MSC10203",
                            "MSC10209",
                            "MSC10219",
                            "MSC10204",
                            "MSC10211",
                            "MSC10202",
                            "MSC10201",
                            "MSC10208"
                        ]
                    },
                    "ELECTIVE": {
                        "courses": [
                            "MSC10217",
                            "MSC10206",
                            "MSC10205",
                            "MSC10218",
                            "MSC10220"
                        ]
                    }
                }
            },
            "BIOMEDICAL": {
                "name": "Vật liệu y sinh",
                "breakdown": {
                    "MANDATORY": {
                        "courses": [
                            "MSC10302",
                            "MSC10304",
                            "MSC10305",
                            "MSC10306",
                            "MSC10320",
                            "MSC10314",
                            "MSC10315"
                        ]
                    },
                    "ELECTIVE": {
                        "courses": [
                            "MSC10307",
                            "MSC10317",
                            "MSC10318",
                            "MSC10316",
                            "MSC10321",
                            "MSC10319",
                            "MSC10312"
                        ]
                    }
                }
            },
            "THIN_FILM": {
                "name": "Vật liệu màng mỏng",
                "breakdown": {
                    "MANDATORY": {
                        "courses": [
                            "MSC10101",
                            "MST10109",
                            "MSC10103",
                            "MSC10107",
                            "MSC10105",
                            "MSC10108",
                            "MSC10111",
                            "MSC10113",
                            "MSC10104"
                        ]
                    },
                    "ELECTIVE": {
                        "courses": [
                            "MSC10110",
                            "MSC10112",
                            "MSC10114",
                            "MSC10115",
                            "MSC10116",
                            "MSC10118",
                            "MSC10119",
                            "MSC10120"
                        ]
                    }
                }
            }
        }
    },
    "GRADUATION": {
        "name": "Kiến thức tốt nghiệp",
        "note": "Module Handbook 2025 có mục Graduation thesis nhưng không ghi mã học phần; để tránh tự đoán, chưa đưa course_id vào danh sách.",
        "courses": []
    }
}