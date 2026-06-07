export type PageId =
    | 'dashboard'
    | 'courses'
    | 'grades'
    | 'tuition'
    | 'schedule'
    | 'examSchedule'
    | 'settings'
    | 'privacy'
    | 'setup';

export type StudyRoadmapTabId = 'trainingProgram' | 'draft' | 'selection' | 'groupSchedule' | 'calendar';

export const APP_ROUTES = {
    root: '/',
    dashboard: '/dashboard',
    studyRoadmap: '/study-roadmap',
    studyRoadmapProgram: '/study-roadmap/program',
    studyRoadmapDraft: '/study-roadmap/draft',
    studyRoadmapSelection: '/study-roadmap/selection',
    studyRoadmapGroup: '/study-roadmap/group',
    legacyGroupSchedule: '/group',
    studyRoadmapCalendar: '/study-roadmap/calendar',
    grades: '/grades',
    tuition: '/tuition',
    schedule: '/schedule',
    examSchedule: '/exam-schedule',
    settings: '/settings',
    privacy: '/privacy',
    setup: '/setup',
} as const;

export const PAGE_TO_PATH: Record<PageId, string> = {
    dashboard: APP_ROUTES.dashboard,
    courses: APP_ROUTES.studyRoadmapSelection,
    grades: APP_ROUTES.grades,
    tuition: APP_ROUTES.tuition,
    schedule: APP_ROUTES.schedule,
    examSchedule: APP_ROUTES.examSchedule,
    settings: APP_ROUTES.settings,
    privacy: APP_ROUTES.privacy,
    setup: APP_ROUTES.setup,
};

export const STUDY_ROADMAP_TAB_TO_PATH: Record<StudyRoadmapTabId, string> = {
    trainingProgram: APP_ROUTES.studyRoadmapProgram,
    draft: APP_ROUTES.studyRoadmapDraft,
    selection: APP_ROUTES.studyRoadmapSelection,
    groupSchedule: APP_ROUTES.studyRoadmapGroup,
    calendar: APP_ROUTES.studyRoadmapCalendar,
};

const PATH_TO_PAGE: Array<[RegExp, PageId]> = [
    [/^\/dashboard\/?$/, 'dashboard'],
    [/^\/study-roadmap(?:\/.*)?$/, 'courses'],
    [/^\/group\/?$/, 'courses'],
    [/^\/grades\/?$/, 'grades'],
    [/^\/tuition\/?$/, 'tuition'],
    [/^\/schedule\/?$/, 'schedule'],
    [/^\/exam-schedule\/?$/, 'examSchedule'],
    [/^\/settings\/?$/, 'settings'],
    [/^\/privacy\/?$/, 'privacy'],
    [/^\/setup\/?$/, 'setup'],
];

export function getPageIdFromPath(pathname: string): PageId {
    return PATH_TO_PAGE.find(([pattern]) => pattern.test(pathname))?.[1] || 'dashboard';
}

export function getPathForPage(page: string): string {
    return PAGE_TO_PATH[page as PageId] || APP_ROUTES.dashboard;
}

export function getStudyRoadmapTabFromPath(pathname: string): StudyRoadmapTabId | null {
    if (/^\/study-roadmap\/program\/?$/.test(pathname)) return 'trainingProgram';
    if (/^\/study-roadmap\/draft\/?$/.test(pathname)) return 'draft';
    if (/^\/study-roadmap\/selection\/?$/.test(pathname)) return 'selection';
    if (/^\/study-roadmap\/group\/?$/.test(pathname) || /^\/group\/?$/.test(pathname)) return 'groupSchedule';
    if (/^\/study-roadmap\/calendar\/?$/.test(pathname)) return 'calendar';
    return null;
}
