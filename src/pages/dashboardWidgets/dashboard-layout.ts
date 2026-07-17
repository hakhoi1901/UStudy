import { STORAGE_KEYS } from '../../config';
import { readPlain, savePlain } from '../../helpers/localStorage/save';

export const DASHBOARD_WIDGET_IDS = [
  'gpa',
  'credits',
  'tuition',
  'calendar',
  'creditDistribution',
] as const;

export type DashboardWidgetId = typeof DASHBOARD_WIDGET_IDS[number];
export type DashboardCalendarSource = 'classes' | 'exams';

export interface DashboardLayoutPreferences {
  version: 3;
  order: DashboardWidgetId[];
  hidden: DashboardWidgetId[];
  calendarSources: DashboardCalendarSource[];
  calendarDays: number;
  calendarNotificationsEnabled: boolean;
  calendarReminderMinutes: number[];
}

export const DEFAULT_DASHBOARD_LAYOUT: DashboardLayoutPreferences = {
  version: 3,
  order: ['gpa', 'credits', 'tuition', 'calendar', 'creditDistribution'],
  hidden: ['calendar', 'creditDistribution'],
  calendarSources: ['classes', 'exams'],
  calendarDays: 7,
  calendarNotificationsEnabled: false,
  calendarReminderMinutes: [15],
};

const WIDGET_ID_SET = new Set<string>(DASHBOARD_WIDGET_IDS);
const CALENDAR_SOURCE_SET = new Set<string>(['classes', 'exams']);

export function normalizeDashboardLayout(value: Partial<DashboardLayoutPreferences> | null | undefined): DashboardLayoutPreferences {
  const storedOrder = Array.isArray(value?.order)
    ? value.order.filter((id): id is DashboardWidgetId => WIDGET_ID_SET.has(id))
    : [];
  const order = Array.from(new Set([...storedOrder, ...DASHBOARD_WIDGET_IDS]));
  const hidden = Array.isArray(value?.hidden)
    ? Array.from(new Set(value.hidden.filter((id): id is DashboardWidgetId => WIDGET_ID_SET.has(id))))
    : [...DEFAULT_DASHBOARD_LAYOUT.hidden];
  const calendarSources = Array.isArray(value?.calendarSources)
    ? Array.from(new Set(value.calendarSources.filter((source): source is DashboardCalendarSource => CALENDAR_SOURCE_SET.has(source))))
    : [...DEFAULT_DASHBOARD_LAYOUT.calendarSources];
  const parsedCalendarDays = Number(value?.calendarDays);
  const calendarDays = Number.isFinite(parsedCalendarDays)
    ? Math.min(30, Math.max(1, Math.round(parsedCalendarDays)))
    : DEFAULT_DASHBOARD_LAYOUT.calendarDays;
  const calendarReminderMinutes = Array.isArray(value?.calendarReminderMinutes)
    ? Array.from(new Set(
      value.calendarReminderMinutes
        .map(Number)
        .filter((minutes) => Number.isInteger(minutes) && minutes >= 1 && minutes <= 30 * 24 * 60),
    )).slice(0, 5).sort((first, second) => second - first)
    : [...DEFAULT_DASHBOARD_LAYOUT.calendarReminderMinutes];

  return {
    version: 3,
    order,
    hidden,
    calendarSources: calendarSources.length > 0 ? calendarSources : [...DEFAULT_DASHBOARD_LAYOUT.calendarSources],
    calendarDays,
    calendarNotificationsEnabled: value?.calendarNotificationsEnabled === true,
    calendarReminderMinutes: calendarReminderMinutes.length > 0
      ? calendarReminderMinutes
      : [...DEFAULT_DASHBOARD_LAYOUT.calendarReminderMinutes],
  };
}

export function readDashboardLayout(): DashboardLayoutPreferences {
  return normalizeDashboardLayout(
    readPlain<Partial<DashboardLayoutPreferences>>(STORAGE_KEYS.DASHBOARD_LAYOUT, DEFAULT_DASHBOARD_LAYOUT),
  );
}

export function saveDashboardLayout(layout: DashboardLayoutPreferences): void {
  savePlain(STORAGE_KEYS.DASHBOARD_LAYOUT, normalizeDashboardLayout(layout));
}
