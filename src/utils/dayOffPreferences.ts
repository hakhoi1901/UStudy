export type DayOffSession = 'all' | 'morning' | 'afternoon';
export type DayOffPreference = number | `${number}:${DayOffSession}`;

export function getDayOffSession(daysOff: DayOffPreference[] | undefined, day: number): DayOffSession | null {
  if (!Array.isArray(daysOff)) return null;
  if (daysOff.some((item) => Number(item) === day && !String(item).includes(':'))) return 'all';
  if (daysOff.includes(`${day}:morning`)) return 'morning';
  if (daysOff.includes(`${day}:afternoon`)) return 'afternoon';
  return null;
}

export function cycleDayOffSession(daysOff: DayOffPreference[] | undefined, day: number): DayOffPreference[] {
  const current = getDayOffSession(daysOff, day);
  const withoutDay = (daysOff ?? []).filter((item) => {
    const [rawDay] = String(item).split(':');
    return Number(rawDay) !== day;
  });

  if (current === null) return [...withoutDay, day];
  if (current === 'all') return [...withoutDay, `${day}:morning`];
  if (current === 'morning') return [...withoutDay, `${day}:afternoon`];
  return withoutDay;
}

export function formatDayOffSession(session: DayOffSession | null): string {
  if (session === 'all') return 'Cả ngày';
  if (session === 'morning') return 'Sáng';
  if (session === 'afternoon') return 'Chiều';
  return '';
}

export function formatDaysOff(daysOff?: DayOffPreference[]): string {
  if (!daysOff?.length) return 'Không chọn';

  return [0, 1, 2, 3, 4, 5, 6]
    .map((day) => {
      const session = getDayOffSession(daysOff, day);
      if (!session) return null;
      const label = day === 6 ? 'CN' : `T${day + 2}`;
      return `${label} ${formatDayOffSession(session).toLowerCase()}`;
    })
    .filter(Boolean)
    .join(', ');
}
