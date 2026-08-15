import { CalendarRange } from 'lucide-react';
import { AppSelect } from '../../../components/ui/form';
import type { AcademicCalendarTermFilter } from '../academic-calendar-utils';
import { ACADEMIC_TERM_OPTIONS } from '../academic-calendar-utils';
import type { CohortInfo } from '../../../assets/data/academic-programs/registry';

interface AcademicCalendarToolbarProps {
    academicYear: string;
    academicYearOptions: Array<{ id: string; name: string }>;
    onAcademicYearChange: (value: string) => void;
    term: AcademicCalendarTermFilter;
    onTermChange: (value: AcademicCalendarTermFilter) => void;
    calendarCohort: {
        id: string;
        label: string;
        appCohortIds: string[];
    } | null;
    currentCohort: CohortInfo | undefined;
}

export function AcademicCalendarToolbar({
    academicYear,
    academicYearOptions,
    onAcademicYearChange,
    term,
    onTermChange,
    calendarCohort,
    currentCohort
}: AcademicCalendarToolbarProps) {
    return (
        <div className="flex flex-col gap-3 border-b border-gray-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-3  pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Áp dụng cho</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">{calendarCohort?.label ?? currentCohort?.name ?? 'Khóa của bạn'}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex">
                <AppSelect
                    label="Năm học"
                    value={academicYear}
                    options={academicYearOptions}
                    onChange={onAcademicYearChange}
                    className="min-w-0 sm:w-44"
                    triggerClassName="h-10"
                />
                <AppSelect
                    label="Học kỳ"
                    value={term}
                    options={ACADEMIC_TERM_OPTIONS}
                    onChange={(value) => onTermChange(value as AcademicCalendarTermFilter)}
                    className="min-w-0 sm:w-44"
                    triggerClassName="h-10"
                />
            </div>
        </div>
    );
}
