// Danh sách các tab
export const tabs = {
    trainingProgram: 'trainingProgram',
    draft: 'draft',
    selection: 'selection',
    groupSchedule: 'groupSchedule',
    calendar: 'calendar',
} as const;

export type Tab = keyof typeof tabs;