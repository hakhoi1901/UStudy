import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { GradeHistoryTable } from '../../../src/features/grades/components/grade-history-table';
import { createEmptyGradeHistoryFilters } from '../../../src/features/grades/services/grade-history-filter';
import type { StudentCourseGrade } from '../../../src/features/grades/types';

const course: StudentCourseGrade = {
  code: 'CSC10001',
  nameVi: 'Nhập môn Công nghệ Thông tin',
  credits: 4,
  grade: 8.5,
  semester: '24-25/1',
  status: 'passed',
};

describe('GradeHistoryTable responsive views', () => {
  it('hides the desktop table on app-sized screens while keeping the mobile cards', () => {
    const html = renderToStaticMarkup(createElement(GradeHistoryTable, {
      filteredHistory: [course],
      semesterScopedHistory: [course],
      selectedSemester: 'all',
      uniqueSemesters: ['24-25/1'],
      setSelectedSemester: () => undefined,
      historyFilters: createEmptyGradeHistoryFilters(),
      setHistoryFilters: () => undefined,
      categoryIndex: {
        tree: [],
        courseCodesByCategory: new Map<string, Set<string>>(),
        categorizedCourseCodes: new Set<string>(),
      },
    }));

    expect(html).toContain('divide-y divide-gray-100 md:hidden');
    expect(html).toContain('hidden overflow-x-auto md:block');
  });
});
