// Danh sách các tab
export const tabs = {
    trainingProgram: 'trainingProgram',
    studyPlan: 'studyPlan',
    selection: 'selection',
    calendar: 'calendar',
} as const;

export type Tab = keyof typeof tabs;
