import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const sourcePath = resolve('src/assets/data/Ke_hoach_GD_HT_2026-2027_dai_tra_SV.md');
const outputPath = resolve('src/assets/data/academic-calendar/2026-2027.ts');

const cohortColumns = [
  { id: 'k2026', label: 'Khóa 2026', appCohortIds: ['k26'] },
  { id: 'k2025', label: 'Khóa 2025', appCohortIds: ['k25'] },
  { id: 'k2023-k2024', label: 'Khóa 2023, K2024', appCohortIds: ['k23', 'k24'] },
];

function toIsoDate(value) {
  const [day, month, year] = value.trim().split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function getTerm(value) {
  if (/HK1/i.test(value)) return 'semester-1';
  if (/HK2/i.test(value)) return 'semester-2';
  if (/HK\s*(?:3|HÈ|HE)/i.test(value)) return 'summer';
  return undefined;
}

function getActivityType(value) {
  if (/^\d+$/.test(value)) return 'academic-week';
  if (/^Bắt đầu HK/i.test(value)) return 'semester-start';
  if (/^ĐKHP/i.test(value)) return 'course-registration';
  if (/^Điều chỉnh ĐKHP/i.test(value)) return 'registration-adjustment';
  if (/^THI GHK/i.test(value)) return 'midterm-exam';
  if (/^THI HK/i.test(value)) return 'final-exam';
  if (/^Tuần lễ dự trữ/i.test(value)) return 'reserve-week';
  if (/^NGHỈ|^Nghỉ/i.test(value)) return 'holiday';
  if (/Giáo dục Quốc phòng/i.test(value)) return 'defense-education';
  if (/Kiểm tra Anh văn/i.test(value)) return 'placement-test';
  if (/Sinh hoạt|Tập huấn/i.test(value)) return 'orientation';
  return 'other';
}

function splitActivities(value) {
  return value
    .replace(/,\s*(?=(?:ĐKHP|Điều chỉnh ĐKHP))/gi, '; ')
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean);
}

function getEventType(value) {
  if (/tốt nghiệp/i.test(value)) return 'graduation';
  if (/nghỉ|lễ|tết|giỗ tổ/i.test(value)) return 'holiday';
  if (/công bố|giải quyết|nhận hồ sơ/i.test(value)) return 'notice';
  return 'other';
}

function parseTable(markdown) {
  const rows = markdown
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('|'))
    .slice(2);

  const activeTermByCohort = new Map(cohortColumns.map((cohort) => [cohort.id, 'semester-1']));

  return rows.map((row) => {
    const cells = row.split('|').slice(1, -1).map((cell) => cell.trim());
    const [index, startDate, endDate, ...rest] = cells;
    const cohortValues = rest.slice(0, 3);
    const institutionValue = rest[3] || '';

    const cohorts = Object.fromEntries(cohortColumns.map((cohort, position) => {
      const value = cohortValues[position] || '';
      const teachingWeek = /^\d+$/.test(value) ? Number(value) : undefined;
      const activities = teachingWeek === undefined
        ? splitActivities(value).map((label) => ({ type: getActivityType(label), label, term: getTerm(label) }))
        : [];
      const activityTerms = activities.map((activity) => activity.term).filter(Boolean);
      const previousTerm = activeTermByCohort.get(cohort.id);
      const terms = [...new Set([previousTerm, ...activityTerms].filter(Boolean))];
      const nextTerm = activityTerms.at(-1);
      if (nextTerm) activeTermByCohort.set(cohort.id, nextTerm);

      return [cohort.id, { teachingWeek, terms, activities }];
    }));

    return {
      index: Number(index),
      startDate: toIsoDate(startDate),
      endDate: toIsoDate(endDate),
      cohorts,
      institutionEvents: splitActivities(institutionValue).map((label) => ({ type: getEventType(label), label })),
    };
  });
}

const markdown = await readFile(sourcePath, 'utf8');
const notes = [...markdown.matchAll(/^\d+\.\s+(.+)$/gm)].map((match) => match[1]);
const weeks = parseTable(markdown);

const calendar = {
  id: 'hcmus-2026-2027-undergraduate-regular',
  academicYear: '2026-2027',
  title: 'Kế hoạch giảng dạy và học tập năm học 2026 - 2027',
  issuer: 'Đại học Quốc gia TP.HCM - Trường Đại học Khoa học Tự nhiên',
  educationLevel: 'Đại học hệ chính quy',
  documentReference: 'Công văn số 821/KHTN-ĐT ngày 24 tháng 6 năm 2026',
  issuedAt: '2026-06-24',
  sourceFile: 'Ke_hoach_GD_HT_2026-2027_dai_tra_SV.md',
  cohorts: cohortColumns,
  weeks,
  notes,
};

const output = [
  "import type { AcademicCalendar } from './types';",
  '',
  'export const ACADEMIC_CALENDAR_2026_2027: AcademicCalendar = ' + JSON.stringify(calendar, null, 2) + ';',
  '',
].join('\n');

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, output, 'utf8');
console.log(`Normalized ${weeks.length} weeks to ${outputPath}`);
