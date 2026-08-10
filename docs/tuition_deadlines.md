# Tuition Deadlines

Han dong hoc phi khong lay tu Portal. Team tu set trong code tai:

```txt
src/config/tuitionDeadlines.ts
```

Sua object `TUITION_DEADLINES_BY_SEMESTER` theo format:

```ts
export const TUITION_DEADLINES_BY_SEMESTER: Record<string, string> = {
    '25-26/1': '2025-09-30',
    '25-26/2': '2026-02-28',
    '25-26/3': '2026-07-15',
};
```

Quy uoc:

- Key hoc ky: `yy-yy/s`, vi du `25-26/2`.
- Value ngay han: `YYYY-MM-DD`.
- Neu hoc ky chua duoc set, app fallback ve ngay 15 cua thang sau.

Noi dang dung config:

- Trang hoc phi: `useTuitionCalculator` gan `summary.dueDate`.
- Dashboard: card hoc phi hien han dong hoc phi theo hoc ky dang chon.
