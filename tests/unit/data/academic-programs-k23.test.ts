import { describe, expect, it } from 'vitest';

import {
  getFacultiesForCohort,
  loadCohortData,
  resolveDataCohort,
} from '../../../src/assets/data/academic-programs/registry';
import { getAllMajorDataCoverage } from '../../../src/features/workspace/services/data-coverage';

const PROGRAMS = [
  { facultyId: 'khoa-cntt', majorId: 'cong-nghe-thong-tin', courseCount: 189 },
  { facultyId: 'khoa-cntt', majorId: 'he-thong-thong-tin', courseCount: 160 },
  { facultyId: 'khoa-cntt', majorId: 'ky-thuat-phan-mem', courseCount: 161 },
  { facultyId: 'khoa-cntt', majorId: 'khoa-hoc-may-tinh', courseCount: 169 },
  { facultyId: 'khoa-cntt', majorId: 'tri-tue-nhan-tao', courseCount: 159 },
  { facultyId: 'khoa-cntt', majorId: 'cu-nhan-tai-nang', courseCount: 176 },
  { facultyId: 'khoa-khoa-hoc-va-cong-nghe-vat-lieu', majorId: 'khoa-hoc-vat-lieu', courseCount: 110 },
  { facultyId: 'khoa-khoa-hoc-va-cong-nghe-vat-lieu', majorId: 'cong-nghe-vat-lieu', courseCount: 97 },
  { facultyId: 'khoa-toan', majorId: 'toan-hoc', courseCount: 205 },
  { facultyId: 'khoa-toan', majorId: 'toan-tin', courseCount: 202 },
  { facultyId: 'khoa-toan', majorId: 'toan-ung-dung', courseCount: 205 },
  { facultyId: 'khoa-toan', majorId: 'khoa-hoc-du-lieu', courseCount: 81 },
  { facultyId: 'khoa-toan', majorId: 'cu-nhan-tai-nang', courseCount: 204 },
  { facultyId: 'khoa-dia-chat', majorId: 'dia-chat-hoc', courseCount: 132 },
  { facultyId: 'khoa-dia-chat', majorId: 'ky-thuat-dia-chat', courseCount: 89 },
  { facultyId: 'khoa-ly', majorId: 'vat-ly-hoc', courseCount: 142 },
  { facultyId: 'khoa-ly', majorId: 'vat-ly-y-khoa', courseCount: 65 },
  { facultyId: 'khoa-ly', majorId: 'hai-duong-hoc', courseCount: 125 },
  { facultyId: 'khoa-ly', majorId: 'ky-thuat-hat-nhan', courseCount: 81 },
  { facultyId: 'khoa-ly', majorId: 'cong-nghe-vat-ly-dien-tu-va-tin-hoc', courseCount: 79 },
  { facultyId: 'khoa-ly', majorId: 'cu-nhan-tai-nang-vat-ly-hoc', courseCount: 142 },
  { facultyId: 'khoa-hoa', majorId: 'hoa-hoc', courseCount: 167 },
  { facultyId: 'khoa-hoa', majorId: 'cu-nhan-tai-nang', courseCount: 145 },
  { facultyId: 'khoa-sinh', majorId: 'sinh-hoc', courseCount: 196 },
  { facultyId: 'khoa-sinh', majorId: 'cong-nghe-sinh-hoc', courseCount: 173 },
  { facultyId: 'khoa-moi-truong', majorId: 'cong-nghe-ky-thuat-moi-truong', courseCount: 95 },
  { facultyId: 'khoa-moi-truong', majorId: 'khoa-hoc-moi-truong', courseCount: 122 },
  { facultyId: 'khoa-moi-truong', majorId: 'quan-ly-tai-nguyen-va-moi-truong', courseCount: 92 },
  { facultyId: 'khoa-dien-tu-vien-thong', majorId: 'ky-thuat-dien-tu-vien-thong', courseCount: 148 },
] as const;

const ALLOWED_CATEGORY_KEYS = new Set([
  'name',
  'total_credits_required',
  'credits_required',
  'credits',
  'mandatory',
  'note',
  'courses',
  'breakdown',
  'options',
  'type',
]);

const ENGLISH_COURSE_IDS = ['ADD00031', 'ADD00032', 'ADD00033', 'ADD00034'];

function inspectCategories(categories: Record<string, unknown>) {
  const references: string[] = [];
  const englishCategoryMandatoryValues: unknown[] = [];

  const inspectNode = (value: unknown, path: string) => {
    expect(value, `${path} must be an object`).toBeTypeOf('object');
    expect(Array.isArray(value), `${path} must not be an array`).toBe(false);
    expect(value, `${path} must not be null`).not.toBeNull();

    const node = value as Record<string, unknown>;
    const unsupportedKeys = Object.keys(node).filter((key) => !ALLOWED_CATEGORY_KEYS.has(key));
    expect(unsupportedKeys, `${path} contains unsupported category fields`).toEqual([]);

    if ('courses' in node) {
      expect(Array.isArray(node.courses), `${path}.courses must be an array`).toBe(true);
      const courseIds = node.courses as unknown[];
      expect(courseIds.every((courseId) => typeof courseId === 'string'), `${path}.courses must contain only IDs`).toBe(true);
      references.push(...courseIds as string[]);

      if (courseIds.some((courseId) => ENGLISH_COURSE_IDS.includes(String(courseId)))) {
        englishCategoryMandatoryValues.push(node.mandatory);
      }
    }

    if ('breakdown' in node) {
      expect(node.breakdown, `${path}.breakdown must be an object`).toBeTypeOf('object');
      expect(Array.isArray(node.breakdown), `${path}.breakdown must not be an array`).toBe(false);
      Object.entries(node.breakdown as Record<string, unknown>).forEach(([key, child]) => {
        inspectNode(child, `${path}.breakdown.${key}`);
      });
    }

    if ('options' in node) {
      expect(Array.isArray(node.options), `${path}.options must be an array`).toBe(true);
      (node.options as unknown[]).forEach((optionValue, index) => {
        const optionPath = `${path}.options[${index}]`;
        expect(optionValue, `${optionPath} must be an object`).toBeTypeOf('object');
        expect(optionValue, `${optionPath} must not be null`).not.toBeNull();

        const option = optionValue as Record<string, unknown>;
        const unsupportedKeys = Object.keys(option).filter((key) => !ALLOWED_CATEGORY_KEYS.has(key));
        expect(unsupportedKeys, `${optionPath} contains unsupported category fields`).toEqual([]);
        expect(option.breakdown, `${optionPath} cannot contain nested breakdown`).toBeUndefined();
        expect(option.options, `${optionPath} cannot contain nested options`).toBeUndefined();

        if ('courses' in option) {
          expect(Array.isArray(option.courses), `${optionPath}.courses must be an array`).toBe(true);
          const courseIds = option.courses as unknown[];
          expect(courseIds.every((courseId) => typeof courseId === 'string'), `${optionPath}.courses must contain only IDs`).toBe(true);
          references.push(...courseIds as string[]);

          if (courseIds.some((courseId) => ENGLISH_COURSE_IDS.includes(String(courseId)))) {
            englishCategoryMandatoryValues.push(option.mandatory);
          }
        }
      });
    }
  };

  Object.entries(categories).forEach(([key, category]) => inspectNode(category, key));
  return { references, englishCategoryMandatoryValues };
}

describe('K23 academic programs', () => {
  it('registers exactly 9 faculties and 29 canonical programs without cohort fallback', () => {
    const faculties = getFacultiesForCohort('k23');

    expect(faculties.map(({ id, majors }) => ({
      id,
      majors: majors.map((major) => major.id),
    }))).toEqual([
      {
        id: 'khoa-cntt',
        majors: [
          'cong-nghe-thong-tin',
          'he-thong-thong-tin',
          'ky-thuat-phan-mem',
          'khoa-hoc-may-tinh',
          'tri-tue-nhan-tao',
          'cu-nhan-tai-nang',
        ],
      },
      {
        id: 'khoa-khoa-hoc-va-cong-nghe-vat-lieu',
        majors: ['khoa-hoc-vat-lieu', 'cong-nghe-vat-lieu'],
      },
      {
        id: 'khoa-toan',
        majors: ['toan-hoc', 'toan-tin', 'toan-ung-dung', 'khoa-hoc-du-lieu', 'cu-nhan-tai-nang'],
      },
      { id: 'khoa-dia-chat', majors: ['dia-chat-hoc', 'ky-thuat-dia-chat'] },
      {
        id: 'khoa-ly',
        majors: [
          'vat-ly-hoc',
          'vat-ly-y-khoa',
          'hai-duong-hoc',
          'ky-thuat-hat-nhan',
          'cong-nghe-vat-ly-dien-tu-va-tin-hoc',
          'cu-nhan-tai-nang-vat-ly-hoc',
        ],
      },
      { id: 'khoa-hoa', majors: ['hoa-hoc', 'cu-nhan-tai-nang'] },
      { id: 'khoa-sinh', majors: ['sinh-hoc', 'cong-nghe-sinh-hoc'] },
      {
        id: 'khoa-moi-truong',
        majors: [
          'cong-nghe-ky-thuat-moi-truong',
          'khoa-hoc-moi-truong',
          'quan-ly-tai-nguyen-va-moi-truong',
        ],
      },
      { id: 'khoa-dien-tu-vien-thong', majors: ['ky-thuat-dien-tu-vien-thong'] },
    ]);
    expect(faculties.flatMap((faculty) => faculty.majors)).toHaveLength(29);
    PROGRAMS.forEach(({ facultyId, majorId }) => {
      expect(resolveDataCohort(facultyId, majorId, 'k23')).toBe('k23');
    });
  });

  it('contains 4,111 program-specific course records', () => {
    expect(PROGRAMS.reduce((sum, program) => sum + program.courseCount, 0)).toBe(4111);
  });

  it('reports all 29 programs as complete under the canonical academic-programs path', () => {
    const coverage = getAllMajorDataCoverage('k23');

    expect(coverage).toHaveLength(29);
    coverage.forEach((program) => {
      expect(program.availableCount, `${program.faculty.id}/${program.major.id}`).toBe(3);
      expect(program.assets.every((asset) => asset.present)).toBe(true);
      program.assets.forEach((asset) => {
        expect(asset.path).toBe(`academic-programs/${program.faculty.id}/${program.major.id}/k23/${asset.fileName}`);
      });
    });
  });

  it.each(PROGRAMS)('$facultyId/$majorId exposes valid app-reachable data', async ({
    facultyId,
    majorId,
    courseCount,
  }) => {
    const { courses, categories, prerequisites } = await loadCohortData(facultyId, majorId, 'k23');

    expect(courses).toHaveLength(courseCount);
    const courseIds = courses.map((course: Record<string, unknown>) => course.course_id);
    expect(new Set(courseIds).size).toBe(courseCount);

    courses.forEach((course: Record<string, unknown>) => {
      expect(course.course_id).toBeTypeOf('string');
      expect(course.course_name_vi).toBeTypeOf('string');
      expect(course.category).toBeTypeOf('string');
      expect(course.description).toBeTypeOf('string');
      expect(['BB', 'TC']).toContain(course.course_type);
      ['credits', 'theory_hours', 'lab_hours', 'exercise_hours'].forEach((field) => {
        expect(course[field], `${course.course_id}.${field} must be a number`).toBeTypeOf('number');
        expect(course[field], `${course.course_id}.${field} must be non-negative`).toBeGreaterThanOrEqual(0);
      });
    });

    ENGLISH_COURSE_IDS.forEach((courseId) => {
      expect(courses.find((course: Record<string, unknown>) => course.course_id === courseId)?.course_type).toBe('TC');
    });

    const { references, englishCategoryMandatoryValues } = inspectCategories(categories);
    const uniqueReferences = new Set(references);
    expect([...uniqueReferences].filter((courseId) => !courseIds.includes(courseId))).toEqual([]);
    expect(courseIds.filter((courseId: string) => !uniqueReferences.has(courseId))).toEqual([]);
    expect(englishCategoryMandatoryValues.length).toBeGreaterThan(0);
    expect(englishCategoryMandatoryValues.every((mandatory) => mandatory === false)).toBe(true);

    expect(prerequisites).toEqual([]);
  });

  it('locks the reviewed PDF conflict resolutions and omissions', async () => {
    const naturalResources = await loadCohortData(
      'khoa-moi-truong',
      'quan-ly-tai-nguyen-va-moi-truong',
      'k23',
    );
    const naturalResourceCourses = new Map(
      naturalResources.courses.map((course: Record<string, unknown>) => [course.course_id, course]),
    );

    expect(naturalResourceCourses.get('BAA00022')).toMatchObject({ course_type: 'BB' });
    expect(naturalResourceCourses.get('BIO00001')).toMatchObject({ course_name_vi: 'Sinh đại cương 1' });
    expect(naturalResourceCourses.get('ENM10102')).toMatchObject({ credits: 3 });
    expect(naturalResourceCourses.get('ENM10113')).toMatchObject({ credits: 2 });
    expect(naturalResourceCourses.get('ENM10208')).toMatchObject({ credits: 3 });

    const mathematics = await loadCohortData('khoa-toan', 'toan-hoc', 'k23');
    const talentedMathematics = await loadCohortData('khoa-toan', 'cu-nhan-tai-nang', 'k23');
    [mathematics, talentedMathematics].forEach(({ courses, categories }) => {
      expect(courses.some((course: Record<string, unknown>) => course.course_id === 'MTH10556')).toBe(true);
      expect(courses.some((course: Record<string, unknown>) => course.course_id === 'MTH5556')).toBe(false);
      expect(inspectCategories(categories).references).not.toContain('MTH5556');
    });

    const engineeringGeology = await loadCohortData('khoa-dia-chat', 'ky-thuat-dia-chat', 'k23');
    expect(engineeringGeology.courses.some((course: Record<string, unknown>) => course.course_id === 'GEO10413')).toBe(true);
    expect(engineeringGeology.courses.some((course: Record<string, unknown>) => course.course_id === 'GEO20208')).toBe(false);

    const geology = await loadCohortData('khoa-dia-chat', 'dia-chat-hoc', 'k23');
    const geologyIds = geology.courses.map((course: Record<string, unknown>) => course.course_id);
    expect(geologyIds).toEqual(expect.arrayContaining(['GEO10613', 'GEO10614']));
    expect(geologyIds).not.toEqual(expect.arrayContaining(['GEO10601', 'GEO10603']));

    const environmentalEngineering = await loadCohortData(
      'khoa-moi-truong',
      'cong-nghe-ky-thuat-moi-truong',
      'k23',
    );
    expect(environmentalEngineering.courses.find(
      (course: Record<string, unknown>) => course.course_id === 'ENE10172',
    )).toMatchObject({ credits: 2 });

    const chemistry = await loadCohortData('khoa-hoa', 'hoa-hoc', 'k23');
    expect(chemistry.courses.find(
      (course: Record<string, unknown>) => course.course_id === 'CHE10132',
    )).toMatchObject({ credits: 3 });
    expect(chemistry.courses.filter(
      (course: Record<string, unknown>) => /^CHE1030[1-7]$/.test(String(course.course_id)),
    )).toHaveLength(7);

    const medicalPhysics = await loadCohortData('khoa-ly', 'vat-ly-y-khoa', 'k23');
    expect(medicalPhysics.courses.some((course: Record<string, unknown>) => course.course_id === 'MPH10995')).toBe(true);
    expect(medicalPhysics.courses.some((course: Record<string, unknown>) => course.course_id === 'NTE10995')).toBe(false);

    expect(talentedMathematics.courses.some(
      (course: Record<string, unknown>) => course.course_id === 'MTH10425',
    )).toBe(false);
    const oceanography = await loadCohortData('khoa-ly', 'hai-duong-hoc', 'k23');
    expect(oceanography.courses.some(
      (course: Record<string, unknown>) => course.course_id === 'OMH10390',
    )).toBe(false);
  });
});
