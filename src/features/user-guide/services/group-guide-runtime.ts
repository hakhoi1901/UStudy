export type PendingGroupGuideStep = 1 | 2 | 3;

let pendingGroupGuideStep: PendingGroupGuideStep | null = null;

/**
 * Chuyển bước tour qua ranh giới mount giữa CalendarView va GroupScheduleFeature.
 * Gia tri nay chi ton tai trong phien render hien tai, khong luu vao du lieu nguoi dung.
 */
export function requestGroupGuideStep(step: PendingGroupGuideStep): void {
  pendingGroupGuideStep = step;
}

export function hasPendingGroupGuideStep(): boolean {
  return pendingGroupGuideStep !== null;
}

export function consumeGroupGuideStep(): PendingGroupGuideStep | null {
  const step = pendingGroupGuideStep;
  pendingGroupGuideStep = null;
  return step;
}
