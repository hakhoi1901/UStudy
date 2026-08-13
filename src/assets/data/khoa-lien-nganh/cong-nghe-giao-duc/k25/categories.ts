export const categories = {
  GENERAL_EDUCATION: {
    name: 'Giáo dục đại cương',
    total_credits_required: 46,
    breakdown: {
      POLITICAL_THEORY_AND_LAW: {
        name: 'Lý luận chính trị - Pháp luật',
        credits_required: 14,
        courses: [
          'BAA00101',
          'BAA00102',
          'BAA00103',
          'BAA00104',
          'BAA00003',
          'BAA00004',
        ],
      },

      SOCIAL_SCIENCES_ECONOMICS_SKILLS: {
        name: 'Khoa học xã hội - Kinh tế - Kỹ năng',
        credits_required: 2,
        breakdown: {
          ELECTIVES: {
            name: 'Học phần tự chọn',
            credits_required: 2,
            selection_rule: 'Chọn 1 trong 4 học phần',
            courses: [
              'BAA00005',
              'BAA00006',
              'BAA00016',
              'EDT00002',
            ],
          },
        },
      },

      MATH_NATURAL_SCIENCES_TECHNOLOGY_ENVIRONMENT: {
        name: 'Toán - Khoa học tự nhiên - Công nghệ - Môi trường',
        credits_required: 30,
        breakdown: {
          ENVIRONMENT_ELECTIVES: {
            name: 'Nhóm Môi trường',
            credits_required: 2,
            selection_rule: 'Chọn 1 trong 4 học phần',
            courses: [
              'ENV00001',
              'GEO00002',
              'BAA00015',
              'ENV00003',
            ],
          },

          REQUIRED_FOUNDATIONAL_COURSES: {
            name: 'Toán và nhập môn ngành bắt buộc',
            credits_required: 22,
            courses: [
              'MTH00021',
              'MTH00022',
              'MTH00035',
              'MTH00044',
              'MTH00045',
              'EDT00001',
            ],
          },

          NATURAL_SCIENCE_ELECTIVES: {
            name: 'Nhóm Khoa học tự nhiên tự chọn',
            credits_required: 6,
            selection_rule: 'Chọn 6 tín chỉ',
            courses: [
              'PHY00001',
              'PHY00002',
              'PHY00004',
              'CHE00001',
              'CHE00002',
              'BIO00001',
              'BIO00002',
            ],
          },
        },
      },

      FOREIGN_LANGUAGE: {
        name: 'Ngoại ngữ',
        counted_in_program_credits: false,
        courses: [
          'ADD00031',
          'ADD00032',
          'ADD00033',
          'ADD00034',
        ],
      },

      PHYSICAL_EDUCATION: {
        name: 'Giáo dục thể chất',
        counted_in_program_credits: false,
        courses: [
          'BAA00021',
          'BAA00022',
        ],
      },

      NATIONAL_DEFENSE_AND_SECURITY_EDUCATION: {
        name: 'Giáo dục quốc phòng - An ninh',
        counted_in_program_credits: false,
        courses: [
          'BAA00030',
        ],
      },
    },
  },

  FOUNDATION: {
    name: 'Kiến thức cơ sở ngành',
    total_credits_required: 62,
    breakdown: {
      REQUIRED: {
        name: 'Học phần bắt buộc',
        credits_required: 37,
        courses: [
          'EDT10001',
          'EDT10002',
          'EDT10003',
          'EDT10004',
          'EDT10005',
          'EDT10006',
          'EDT10007',
          'EDT10008',
          'EDT10009',
          'EDT10010',
          'EDT10011',
          'EDT10012',
        ],
      },

      ELECTIVES: {
        name: 'Học phần tự chọn',
        credits_required: 25,
        courses: [
          'EDT10013',
          'EDT10014',
          'EDT10015',
          'EDT10016',
          'EDT10017',
          'EDT10018',
          'EDT10019',
          'EDT10020',
          'EDT10021',
          'EDT10022',
          'EDT10023',
          'EDT10024',
          'EDT10025',
          'EDT10026',
          'EDT10027',
          'EDT10028',
          'EDT10029',
          'EDT10030',
          'EDT10031',
        ],
      },
    },
  },

  MAJOR: {
    name: 'Kiến thức ngành',
    total_credits_required: 18,
    breakdown: {
      PROGRAM_COURSES: {
        name: 'Các học phần chuyên ngành',
        credits_required: 18,
        breakdown: {
          EDUCATION_AND_TRAINING: {
            name: 'Chuyên ngành Giáo dục và Đào tạo',
            credits_required: 18,
            breakdown: {
              REQUIRED: {
                name: 'Học phần bắt buộc',
                credits_required: 11,
                courses: [
                  'EDT10101',
                  'EDT10102',
                  'EDT10103',
                  'EDT10104',
                ],
              },

              ELECTIVES: {
                name: 'Học phần tự chọn',
                credits_required: 7,
                courses: [
                  'EDT10105',
                  'EDT10106',
                  'EDT10107',
                  'EDT10108',
                  'EDT10109',
                  'EDT10110',
                  'EDT10111',
                  'EDT10112',
                ],
              },
            },
          },

          RESEARCH_AND_DEVELOPMENT: {
            name: 'Chuyên ngành Nghiên cứu và phát triển',
            credits_required: 18,
            breakdown: {
              REQUIRED: {
                name: 'Học phần bắt buộc',
                credits_required: 6,
                courses: [
                  'EDT10101',
                  'EDT10102',
                ],
              },

              ELECTIVES: {
                name: 'Học phần tự chọn',
                credits_required: 12,
                courses: [
                  'EDT10201',
                  'EDT10202',
                  'EDT10203',
                  'EDT10204',
                  'EDT10205',
                  'EDT10206',
                  'EDT10207',
                  'EDT10208',
                  'EDT10209',
                  'EDT10210',
                ],
              },
            },
          },
        },
      },
    },
  },

  GRADUATION: {
    name: 'Kiến thức tốt nghiệp',
    total_credits_required: 10,
    breakdown: {
      THESIS_OPTION: {
        name: 'Phương án 1 - Khóa luận tốt nghiệp',
        credits_required: 10,
        courses: [
          'EDT10595',
        ],
      },

      GRADUATION_PROJECT_OPTION: {
        name: 'Phương án 2 - Dự án tốt nghiệp và học phần tự chọn',
        credits_required: 10,
        breakdown: {
          GRADUATION_PROJECT: {
            name: 'Dự án tốt nghiệp',
            credits_required: 6,
            courses: [
              'EDT10590',
            ],
          },

          ELECTIVES: {
            name: 'Học phần tự chọn',
            credits_required: 4,
            breakdown: {
              EDUCATION_AND_TRAINING: {
                name: 'Chuyên ngành Giáo dục và Đào tạo',
                credits_required: 4,
                courses: [
                  'EDT10105',
                  'EDT10106',
                  'EDT10107',
                  'EDT10108',
                  'EDT10109',
                  'EDT10110',
                  'EDT10111',
                  'EDT10112',
                ],
              },

              RESEARCH_AND_DEVELOPMENT: {
                name: 'Chuyên ngành Nghiên cứu và phát triển',
                credits_required: 4,
                courses: [
                  'EDT10201',
                  'EDT10202',
                  'EDT10203',
                  'EDT10204',
                  'EDT10205',
                  'EDT10206',
                  'EDT10207',
                  'EDT10208',
                  'EDT10209',
                  'EDT10210',
                ],
              },
            },
          },
        },
      },

      GRADUATION_INTERNSHIP_OPTION: {
        name: 'Phương án 3 - Thực tập tốt nghiệp và học phần tự chọn',
        credits_required: 10,
        breakdown: {
          GRADUATION_INTERNSHIP: {
            name: 'Thực tập tốt nghiệp',
            credits_required: 4,
            courses: [
              'EDT10591',
            ],
          },

          ELECTIVES: {
            name: 'Học phần tự chọn',
            credits_required: 6,
            breakdown: {
              EDUCATION_AND_TRAINING: {
                name: 'Chuyên ngành Giáo dục và Đào tạo',
                credits_required: 6,
                courses: [
                  'EDT10105',
                  'EDT10106',
                  'EDT10107',
                  'EDT10108',
                  'EDT10109',
                  'EDT10110',
                  'EDT10111',
                  'EDT10112',
                ],
              },

              RESEARCH_AND_DEVELOPMENT: {
                name: 'Chuyên ngành Nghiên cứu và phát triển',
                credits_required: 6,
                courses: [
                  'EDT10201',
                  'EDT10202',
                  'EDT10203',
                  'EDT10204',
                  'EDT10205',
                  'EDT10206',
                  'EDT10207',
                  'EDT10208',
                  'EDT10209',
                  'EDT10210',
                ],
              },
            },
          },
        },
      },
    },
  },
};
