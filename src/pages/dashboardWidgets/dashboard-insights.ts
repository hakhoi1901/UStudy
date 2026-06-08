import { ACADEMIC_RULES } from '../../constants';
import { STORAGE_KEYS } from '../../config';
import { readFromStorage } from '../../helpers/localStorage/save';
import { AcademicRulesEngine } from '../../features/grades/services/academic-rules-engine';
import type { ScheduleSession } from '../../features/visual-schedule/types';

export interface CreditDistributionItem {
  key: string;
  name: string;
  credits: number;
  requiredCredits: number;
  color: string;
}

type CategoryNode = {
  name?: string;
  courses?: string[];
  breakdown?: Record<string, CategoryNode>;
  options?: CategoryNode[];
  total_credits_required?: number;
  credits?: number;
  credits_required?: number;
};

const CHART_COLORS = ['#004A98', '#16A34A', '#F59E0B', '#7C3AED', '#DC2626', '#0891B2'];

function normalizeCourseId(value: unknown): string {
  return String(value || '').trim().toUpperCase();
}

function collectCourses(node: CategoryNode, topKey: string, topName: string, map: Map<string, { key: string; name: string }>) {
  if (Array.isArray(node.courses)) {
    node.courses.forEach((courseId) => {
      const normalized = normalizeCourseId(courseId);
      if (normalized && !map.has(normalized)) {
        map.set(normalized, { key: topKey, name: topName });
      }
    });
  }

  Object.values(node.breakdown || {}).forEach((child) => collectCourses(child, topKey, topName, map));
  (node.options || []).forEach((child) => collectCourses(child, topKey, topName, map));
}

function buildCourseCategoryMap(categories: Record<string, CategoryNode>) {
  const map = new Map<string, { key: string; name: string }>();

  Object.entries(categories || {}).forEach(([key, node]) => {
    if (key === 'MASTER_TRANSITION') return;
    collectCourses(node, key, node.name || key, map);
  });

  return map;
}

function getCategoryRequiredCredits(node?: CategoryNode): number {
  return Number(node?.total_credits_required || node?.credits || node?.credits_required || 0);
}

export function buildCreditDistribution(categories: Record<string, CategoryNode>, allCoursesMeta: any[]): CreditDistributionItem[] {
  const studentDb = readFromStorage<any>(STORAGE_KEYS.STUDENT_DB, null);
  const rawGrades = Array.isArray(studentDb?.grades) ? studentDb.grades : [];
  if (rawGrades.length === 0) return [];

  const categoryMap = buildCourseCategoryMap(categories);
  const topLevelCategories = categories || {};
  const hasBLMExemption = AcademicRulesEngine.checkBLMExemption(rawGrades);
  const effectiveGrades = AcademicRulesEngine.resolveEffectiveGrades(rawGrades);
  const creditsByCategory = new Map<string, CreditDistributionItem>(
    Object.entries(topLevelCategories)
      .filter(([key]) => key !== 'MASTER_TRANSITION')
      .map(([key, node], index) => [
        key,
        {
          key,
          name: node.name || key,
          credits: 0,
          requiredCredits: getCategoryRequiredCredits(node),
          color: CHART_COLORS[index % CHART_COLORS.length],
        },
      ]),
  );

  effectiveGrades.forEach((grade: any) => {
    const courseId = normalizeCourseId(grade.id);
    if (!courseId || AcademicRulesEngine.isCourseExcludedFromAccumulation(courseId)) return;

    const status = AcademicRulesEngine.getCourseStatus(courseId, rawGrades, hasBLMExemption);
    if (status !== 'passed') return;

    const meta = allCoursesMeta.find((course: any) => normalizeCourseId(course.course_id) === courseId);
    const credits = Number.parseInt(String(grade.credits || meta?.credits || 0), 10) || 0;
    if (credits <= 0) return;

    const category = categoryMap.get(courseId);
    const categoryKey = category?.key || meta?.category || 'OTHER';
    const categoryNode = topLevelCategories[categoryKey];
    const categoryName = category?.name || categoryNode?.name || 'Khác';

    const existing = creditsByCategory.get(categoryKey) || {
      key: categoryKey,
      name: categoryName,
      credits: 0,
      requiredCredits: getCategoryRequiredCredits(categoryNode),
      color: CHART_COLORS[creditsByCategory.size % CHART_COLORS.length],
    };

    existing.credits += credits;
    creditsByCategory.set(categoryKey, existing);
  });

  return Array.from(creditsByCategory.values());
}

export function getTodayScheduleSessions(sessions: ScheduleSession[], now = new Date()) {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const jsDay = today.getDay();
  const portalDay = (jsDay === 0 ? 8 : jsDay + 1) as ScheduleSession['dayOfWeek'];

  return sessions
    .filter((session) => session.dayOfWeek === portalDay)
    .filter((session) => {
      if (!session.startDateParsed || !session.endDateParsed) return true;

      const start = new Date(session.startDateParsed);
      const end = new Date(session.endDateParsed);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return today >= start && today <= end;
    })
    .sort((a, b) => a.startPeriod - b.startPeriod);
}

export function summarizeTodaySessions(sessions: ScheduleSession[]) {
  return {
    totalSessions: sessions.length,
    totalPeriods: sessions.reduce((sum, session) => sum + session.duration, 0),
    nextSession: sessions.find((session) => {
      const [hour, minute] = session.startTime.split(':').map(Number);
      const start = new Date();
      start.setHours(hour || 0, minute || 0, 0, 0);
      return start.getTime() >= Date.now();
    }) || null,
  };
}

export function getDistributionTotal(items: CreditDistributionItem[]) {
  return items.reduce((sum, item) => sum + item.credits, 0);
}

export function getDistributionCompletionPercent(items: CreditDistributionItem[]) {
  const total = getDistributionTotal(items);
  return Math.min(100, Math.round((total / ACADEMIC_RULES.TOTAL_CREDITS) * 100));
}
