// Danh sách các tab
export const tabs = {
    trainingProgram: 'trainingProgram',
    studyPlan: 'studyPlan',
    selection: 'selection',
    selection_k24: 'selection_k24',
    calendar: 'calendar',
} as const;

export type Tab = keyof typeof tabs;
