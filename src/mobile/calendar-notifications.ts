import { Capacitor } from '@capacitor/core';
import type { LocalNotificationSchema } from '@capacitor/local-notifications';
import { getCalendarEventStart, type DashboardCalendarEvent } from '../pages/dashboardWidgets/dashboard-calendar-events';

const NOTIFICATION_OWNER = 'ustudy-calendar';
const MAX_SCHEDULED_NOTIFICATIONS = 400;

export interface CalendarNotificationPermissionResult {
  granted: boolean;
  exact: boolean;
  message?: string;
}

export function supportsCalendarNotifications(): boolean {
  return Capacitor.isNativePlatform();
}

async function getPlugin() {
  return (await import('@capacitor/local-notifications')).LocalNotifications;
}

export async function requestCalendarNotificationPermission(): Promise<CalendarNotificationPermissionResult> {
  if (!supportsCalendarNotifications()) {
    return { granted: false, exact: false, message: 'Thông báo lịch chỉ hoạt động trên ứng dụng điện thoại.' };
  }

  try {
    const LocalNotifications = await getPlugin();
    let permission = await LocalNotifications.checkPermissions();
    if (permission.display === 'prompt' || permission.display === 'prompt-with-rationale') {
      permission = await LocalNotifications.requestPermissions();
    }

    if (permission.display !== 'granted') {
      return {
        granted: false,
        exact: false,
        message: 'Quyền thông báo đang bị tắt. Mở Cài đặt điện thoại > Ứng dụng > UStudy > Thông báo để cho phép.',
      };
    }

    let exact = true;
    if (Capacitor.getPlatform() === 'android') {
      try {
        exact = (await LocalNotifications.checkExactNotificationSetting()).exact_alarm === 'granted';
      } catch {
        exact = false;
      }
    }

    return {
      granted: true,
      exact,
      message: exact ? undefined : 'Android có thể gửi thông báo trễ vài phút nếu quyền báo thức chính xác đang tắt.',
    };
  } catch (error) {
    console.error('[calendar-notifications] Không thể kiểm tra quyền thông báo:', error);
    return {
      granted: false,
      exact: false,
      message: 'Không thể mở quyền thông báo. Hãy đóng hẳn UStudy, mở lại rồi thử lần nữa.',
    };
  }
}

function hashNotificationId(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) & 0x7fffffff || 1;
}

function formatReminder(minutes: number): string {
  if (minutes % 1440 === 0) return `${minutes / 1440} ngày`;
  if (minutes % 60 === 0) return `${minutes / 60} giờ`;
  return `${minutes} phút`;
}

function formatEventTime(date: Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

async function cancelOwnedNotifications(): Promise<void> {
  if (!supportsCalendarNotifications()) return;
  const LocalNotifications = await getPlugin();
  const pending = await LocalNotifications.getPending();
  const owned = pending.notifications
    .filter((notification) => notification.extra?.owner === NOTIFICATION_OWNER)
    .map((notification) => ({ id: notification.id }));

  if (owned.length > 0) await LocalNotifications.cancel({ notifications: owned });
}

export async function syncCalendarNotifications(
  events: DashboardCalendarEvent[],
  enabled: boolean,
  reminderMinutes: number[],
): Promise<void> {
  if (!supportsCalendarNotifications()) return;

  await cancelOwnedNotifications();
  if (!enabled) return;

  const LocalNotifications = await getPlugin();
  const permission = await LocalNotifications.checkPermissions();
  if (permission.display !== 'granted') return;

  const now = Date.now();
  const usedIds = new Set<number>();
  const notifications: LocalNotificationSchema[] = [];

  for (const event of events) {
    const eventStart = getCalendarEventStart(event);
    if (!eventStart) continue;

    for (const minutes of reminderMinutes) {
      const notificationAt = new Date(eventStart.getTime() - minutes * 60 * 1000);
      if (notificationAt.getTime() <= now) continue;

      let id = hashNotificationId(`${event.id}-${minutes}`);
      while (usedIds.has(id)) id = id >= 0x7ffffffe ? 1 : id + 1;
      usedIds.add(id);

      notifications.push({
        id,
        title: `Sắp đến: ${event.title}`,
        body: [
          `Còn ${formatReminder(minutes)}`,
          formatEventTime(eventStart),
          event.room,
        ].filter(Boolean).join(' · '),
        schedule: { at: notificationAt, allowWhileIdle: true },
        group: NOTIFICATION_OWNER,
        autoCancel: true,
        extra: {
          owner: NOTIFICATION_OWNER,
          eventId: event.id,
          source: event.source,
        },
      });

      if (notifications.length >= MAX_SCHEDULED_NOTIFICATIONS) break;
    }
    if (notifications.length >= MAX_SCHEDULED_NOTIFICATIONS) break;
  }

  if (notifications.length > 0) {
    await LocalNotifications.schedule({ notifications });
  }
}
