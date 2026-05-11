/**
 * types.ts
 * Định nghĩa các kiểu dữ liệu cho module Quản lý điểm.
 */

export interface StudentCourseGrade {
    code: string;
    nameVi: string;
    credits: number;
    grade: number;
    semester: string;
    status: 'passed' | 'ongoing' | 'retake';
    type?: string;
    needsRetake?: boolean;
    isExcluded?: boolean;
}

export interface GPASummary {
    gradesHistory: StudentCourseGrade[];
    currentGPA: number;
    accumulatedCredits: number;
    gpaPerSemester: { semester: string; gpa: number; credits: number }[];
    foundationGPA: number;
    majorGPA: number;
    majorSpecializedGPA: number;
}

export interface SimulatorCourseGrade {
    id: string;
    code: string;
    name: string;
    credits: number | null;
    currentGrade: number | null;
    projectedGrade: number | null;
    source: 'ongoing' | 'registration' | 'future';
}

export interface GPAPullCourse {
    id: string;
    code: string;
    name: string;
    credits: number;
    projectedGrade: number | null;
    isLocked: boolean;
    lockedGrade?: number | null;
    suggestedGrade?: number;
    source?: 'future' | 'retake' | 'ongoing' | 'registration';
}

export interface GPAPullSemester {
    id: string;
    label: string;
    courses: GPAPullCourse[];
    requiredGPA: number;
    totalCredits: number;
    pointsNeeded: number;
}

export interface RemainingCourseItem {
    code: string;
    name: string;
    credits: number;
}

export interface RetakeSuggestionItem {
    code: string;
    nameVi: string;
    credits: number;
    currentGrade: number;
    potentialImprove: number;
    impactPoints: number;
}

export interface RetakeSuggestionConfig {
    gradeThreshold: number; // only suggest when currentGrade <= threshold
    minDelta: number; // only suggest when (10 - currentGrade) >= minDelta
    maxItems: number;
}

export interface GPAPullResult {
    success: boolean;
    remainingCredits?: number;
    requiredAverage?: number;
    currentPoints?: number;
    currentCredits?: number;
    alreadyAchieved?: boolean;
    impossible?: boolean;
    message: string;
}

export interface GPAInformationProps {
    currentGPA: number;
    projectedGPA: number;
    majorGPA: number;
    majorSpecializedGPA: number;
}

export interface SemesterGPA {
    semester: string;
    gpa: number;
    credits: number;
    earnedCredits: number;
}

export interface GPAPerSemesterTableProps {
    getClassification: (gpa: number) => string;
    gpaPerSemester?: SemesterGPA[];
}

export interface GradeHistoryTableProps {
    filteredHistory: StudentCourseGrade[];
    selectedSemester: string;
    uniqueSemesters: string[];
    setSelectedSemester: (semester: string) => void;
}


export interface UseGPAPullProps {
    gradesHistory: StudentCourseGrade[];
    simulatorCourses: SimulatorCourseGrade[];
    currentGPA: number;
    accumulatedCredits: number;
    totalCredits: number;
}

export interface ManualRetakeCandidate {
    code: string;
    nameVi: string;
    credits: number;
    currentGrade: number;
}

export interface GPAPullHeaderProps {
    expanded: boolean;
    setExpanded: (val: boolean) => void;
}
export interface GPAPullInputSectionProps {
    targetGPAInput: string;
    setTargetGPAInput: (val: string) => void;
    targetGpaError: string | null;
    minTargetGpa: number;
}

export interface GPAPullManualRetakeProps {
    manualRetakeItems: Array<ManualRetakeCandidate & { targetGrade: number; impactPoints: number; improveDelta: number }>;
    removeManualRetake: (code: string) => void;
    handleManualRetakeTargetInputChange: (code: string, val: string) => void;
    commitManualRetakeTargetInput: (code: string, current: number) => void;
    draftManualRetakeTargets: Record<string, string>;
    draftManualRetakeTargetErrors: Record<string, string>;
    manualRetakeImpact: { totalImpactPoints: number; avgGpaLift: number };
    selectableRetakeCourses: ManualRetakeCandidate[];
    filteredSelectableRetakeCourses: ManualRetakeCandidate[];
    retakeSearchTerm: string;
    setRetakeSearchTerm: (val: string) => void;
    isRetakePickerOpen: boolean;
    setIsRetakePickerOpen: (val: boolean) => void;
    retakePickerRef: React.RefObject<HTMLDivElement | null>;
    pendingRetakeCodeSet: Set<string>;
    togglePendingRetakeCode: (code: string) => void;
    addPendingRetakes: () => void;
    selectAllFilteredRetakes: () => void;
    clearPendingFilteredRetakes: () => void;
    clearAllManualRetakes: () => void;
    decimals: number;
    scopeName: string;
}

export interface GPAPullResultSummaryProps {
    targetGPA: number | null;
    displayCurrentGPA: number;
    displayAccumulatedCredits: number;
    scopeName: string;
    baseResult: GPAPullResult | null;
    decimals: number;
}

export interface GPAPullRetakeSuggestionsProps {
    retakeSuggestions: RetakeSuggestionItem[];
    addManualRetake: (code: string) => void;
    decimals: number;
    scopeName: string;
}

export interface GPAPullSemesterTableProps {
    nextSemester: GPAPullSemester;
    semesterStats: {
        semesterGpa: number;
        usedCredits: number;
        newRequiredAvgAfter: number | null;
        trend: 'ahead' | 'behind' | 'onTrack' | null;
    } | null;
    baseResult: { requiredAverage?: number } | null;
    decimals: number;
}