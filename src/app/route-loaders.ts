import type { PageId } from './routes';

export const loadStudyRoadmapPage = () => import('../pages/study-roadmap/StudyRoadmapPage');
export const loadGradesPage = () => import('../pages/grades/GradesPage');
export const loadTuitionPage = () => import('../pages/tuition/TuitionPage');
export const loadSchedulePage = () => import('../pages/schedule/SchedulePage');
export const loadSettingsPage = () => import('../pages/settings/SettingsPage');
export const loadExamSchedulePage = () => import('../pages/exams/ExamSchedulePage');
export const loadChatbotPage = () => import('../pages/chatbot/ChatbotPage');
export const loadCampusInformationPage = () => import('../pages/campus-information/CampusInformationPage');

const routeLoaders: Partial<Record<PageId, () => Promise<unknown>>> = {
  courses: loadStudyRoadmapPage,
  grades: loadGradesPage,
  tuition: loadTuitionPage,
  schedule: loadSchedulePage,
  settings: loadSettingsPage,
  examSchedule: loadExamSchedulePage,
  chatbot: loadChatbotPage,
  campusInfo: loadCampusInformationPage,
};

export function prefetchPage(page: string): void {
  void routeLoaders[page as PageId]?.();
}
