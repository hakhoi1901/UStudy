import { categories as k24Categories } from '../k24/categories';

// K25 giữ schema category đã ổn định của K24. CTĐT 2025 chỉ thay đổi vị trí
// BAA00015: đây là một lựa chọn của khối Toán - KHTN - Công nghệ - Môi trường.
const generalEducation = k24Categories.GENERAL_EDUCATION;
const mathScience = generalEducation.breakdown.GENERAL_MATH_SCIENCE;

export const categories = {
  ...k24Categories,
  GENERAL_EDUCATION: {
    ...generalEducation,
    breakdown: {
      ...generalEducation.breakdown,
      GENERAL_SOCIAL: {
        ...generalEducation.breakdown.GENERAL_SOCIAL,
        note: 'Chọn 01 học phần (02 tín chỉ) trong 4 học phần',
        courses: ['BAA00005', 'BAA00006', 'BAA00007', 'BAA00016'],
      },
      GENERAL_MATH_SCIENCE: {
        ...mathScience,
        breakdown: {
          ...mathScience.breakdown,
          ELECTIVE: {
            ...mathScience.breakdown.ELECTIVE,
            courses: ['BAA00015', 'BIO00081', 'BIO00002', 'BIO00082', 'CHE00011', 'CHE00012'],
          },
        },
      },
    },
  },
};
