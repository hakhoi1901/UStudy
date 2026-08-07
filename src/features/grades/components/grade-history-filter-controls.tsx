import { useMemo, useState } from 'react';
import { Filter, RotateCcw, X } from 'lucide-react';
import { MobileBottomSheet } from '../../../components/ui/overlays/mobile-bottom-sheet';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/overlays/popover';
import {
    applyGradeHistoryFilters,
    countActiveGradeHistoryFilterGroups,
    createEmptyGradeHistoryFilters,
    UNCATEGORIZED_CATEGORY_ID,
} from '../services/grade-history-filter';
import type {
    GradeHistoryCategoryIndex,
    GradeHistoryFilters,
    StudentCourseGrade,
} from '../types';
import { GRADE_STATUS_OPTIONS, GradeHistoryFilterPanel } from './grade-history-filter-panel';

interface GradeHistoryFilterControlsProps {
    selectedSemester: string;
    uniqueSemesters: string[];
    setSelectedSemester: (semester: string) => void;
    filters: GradeHistoryFilters;
    setFilters: (filters: GradeHistoryFilters) => void;
    categoryIndex: GradeHistoryCategoryIndex;
    semesterScopedHistory: StudentCourseGrade[];
}

interface ActiveFilterChip {
    id: string;
    label: string;
    remove: (filters: GradeHistoryFilters) => GradeHistoryFilters;
}

function cloneFilters(filters: GradeHistoryFilters): GradeHistoryFilters {
    return {
        ...filters,
        statuses: [...filters.statuses],
        gradeRange: { ...filters.gradeRange },
        creditRange: { ...filters.creditRange },
        categoryIds: [...filters.categoryIds],
    };
}

function findCategoryName(categoryIndex: GradeHistoryCategoryIndex, id: string): string {
    if (id === UNCATEGORIZED_CATEGORY_ID) return 'Chưa phân loại';

    const stack = [...categoryIndex.tree];
    while (stack.length > 0) {
        const node = stack.shift();
        if (!node) continue;
        if (node.id === id) return node.name;
        stack.push(...node.children);
    }
    return 'Nhóm môn';
}

function getOptionLabel<T extends string>(options: Array<{ value: T; label: string }>, value: T): string {
    return options.find((option) => option.value === value)?.label ?? value;
}

export function GradeHistoryFilterControls({
    selectedSemester,
    uniqueSemesters,
    setSelectedSemester,
    filters,
    setFilters,
    categoryIndex,
    semesterScopedHistory,
}: GradeHistoryFilterControlsProps) {
    const [desktopOpen, setDesktopOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [draftFilters, setDraftFilters] = useState<GradeHistoryFilters>(() => cloneFilters(filters));
    const activeFilterCount = countActiveGradeHistoryFilterGroups(filters);

    const previewCount = useMemo(
        () => applyGradeHistoryFilters(semesterScopedHistory, draftFilters, categoryIndex).length,
        [semesterScopedHistory, draftFilters, categoryIndex],
    );

    const openFilter = (target: 'desktop' | 'mobile') => {
        setDraftFilters(cloneFilters(filters));
        if (target === 'desktop') setDesktopOpen(true);
        else setMobileOpen(true);
    };

    const closeFilter = () => {
        setDesktopOpen(false);
        setMobileOpen(false);
    };

    const applyFilters = () => {
        setFilters(cloneFilters(draftFilters));
        closeFilter();
    };

    const chips = useMemo<ActiveFilterChip[]>(() => {
        const result: ActiveFilterChip[] = [];
        if (filters.query.trim()) {
            result.push({
                id: 'query',
                label: `Tìm: ${filters.query.trim()}`,
                remove: (current) => ({ ...current, query: '' }),
            });
        }

        filters.categoryIds.forEach((categoryId) => result.push({
            id: `category-${categoryId}`,
            label: findCategoryName(categoryIndex, categoryId),
            remove: (current) => ({
                ...current,
                categoryIds: current.categoryIds.filter((id) => id !== categoryId),
            }),
        }));

        filters.statuses.forEach((status) => result.push({
            id: `status-${status}`,
            label: getOptionLabel(GRADE_STATUS_OPTIONS, status),
            remove: (current) => ({ ...current, statuses: current.statuses.filter((item) => item !== status) }),
        }));

        if (filters.gradeRange.min > 0 || filters.gradeRange.max < 10) {
            result.push({
                id: 'grade-range',
                label: `Điểm ${filters.gradeRange.min.toFixed(1)}–${filters.gradeRange.max.toFixed(1)}`,
                remove: (current) => ({ ...current, gradeRange: { min: 0, max: 10 } }),
            });
        }

        if (filters.creditRange.min > 1 || filters.creditRange.max < 10) {
            result.push({
                id: 'credit-range',
                label: `${filters.creditRange.min}–${filters.creditRange.max} TC`,
                remove: (current) => ({ ...current, creditRange: { min: 1, max: 10 } }),
            });
        }

        return result;
    }, [filters, categoryIndex]);

    const actions = (
        <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={() => setDraftFilters(createEmptyGradeHistoryFilters())}
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
                <RotateCcw className="h-4 w-4" />
                Đặt lại
            </button>
            <button
                type="button"
                onClick={applyFilters}
                className="h-10 flex-[1.4] rounded-lg bg-[#004A98] px-4 text-sm font-semibold text-white hover:bg-[#003A78]"
            >
                Áp dụng ({previewCount} môn)
            </button>
        </div>
    );

    return (
        <div className="w-full">
            <div className="flex w-full items-center gap-2 md:w-auto">
                <select
                    value={selectedSemester}
                    onChange={(event) => setSelectedSemester(event.target.value)}
                    aria-label="Phạm vi học kỳ"
                    className="h-9 min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-700 outline-none focus:border-[#004A98] focus:ring-2 focus:ring-blue-100 md:w-44 md:flex-none md:text-sm"
                >
                    <option value="all">Tất cả học kỳ</option>
                    {uniqueSemesters.map((semester) => (
                        <option key={semester} value={semester}>{semester}</option>
                    ))}
                </select>

                <div className="hidden md:block">
                    <Popover
                        open={desktopOpen}
                        onOpenChange={(open) => {
                            if (open) openFilter('desktop');
                            else setDesktopOpen(false);
                        }}
                    >
                        <PopoverTrigger asChild>
                            <button
                                type="button"
                                className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors ${activeFilterCount > 0
                                    ? 'border-[#004A98] bg-blue-50 text-[#004A98]'
                                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <Filter className="h-4 w-4" />
                                Bộ lọc
                                {activeFilterCount > 0 && (
                                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#004A98] px-1 text-[11px] font-semibold text-white">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </button>
                        </PopoverTrigger>
                        <PopoverContent align="end" sideOffset={8} className="flex max-h-[min(720px,calc(100vh-2rem))] w-[440px] flex-col overflow-hidden rounded-xl border border-gray-200 !bg-white !text-gray-900 p-0 shadow-[0_18px_45px_rgba(15,23,42,0.16)]">
                            <div className="shrink-0 border-b border-gray-100 bg-white px-5 py-4">
                                <h3 className="text-base font-semibold text-gray-900">Bộ lọc lịch sử điểm</h3>
                                <p className="mt-1 text-xs leading-5 text-gray-500">Lọc trong phạm vi học kỳ đang chọn, rồi áp dụng khi đã xem xong.</p>
                            </div>
                            <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto overscroll-contain bg-gray-50/70">
                                <GradeHistoryFilterPanel
                                    value={draftFilters}
                                    onChange={setDraftFilters}
                                    categoryTree={categoryIndex.tree}
                                />
                            </div>
                            <div className="shrink-0 border-t border-gray-100 bg-white p-4">{actions}</div>
                        </PopoverContent>
                    </Popover>
                </div>

                <button
                    type="button"
                    onClick={() => openFilter('mobile')}
                    className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border px-3 text-xs font-medium md:hidden ${activeFilterCount > 0
                        ? 'border-[#004A98] bg-blue-50 text-[#004A98]'
                        : 'border-gray-200 bg-white text-gray-700'
                    }`}
                >
                    <Filter className="h-4 w-4" />
                    Lọc
                    {activeFilterCount > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#004A98] px-1 text-[10px] text-white">
                            {activeFilterCount}
                        </span>
                    )}
                </button>
            </div>

            {chips.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {chips.map((chip) => (
                        <button
                            key={chip.id}
                            type="button"
                            onClick={() => setFilters(chip.remove(filters))}
                            className="inline-flex max-w-full items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-[11px] font-medium text-[#004A98] hover:bg-blue-100"
                            title={`Bỏ lọc ${chip.label}`}
                        >
                            <span className="truncate">{chip.label}</span>
                            <X className="h-3 w-3 shrink-0" />
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => setFilters(createEmptyGradeHistoryFilters())}
                        className="px-1.5 py-1 text-[11px] font-medium text-gray-500 hover:text-red-600"
                    >
                        Xóa tất cả
                    </button>
                </div>
            )}

            {mobileOpen && (
                <MobileBottomSheet
                    title="Bộ lọc lịch sử điểm"
                    eyebrow={selectedSemester === 'all' ? 'Tất cả học kỳ' : selectedSemester}
                    onClose={closeFilter}
                    className="md:hidden"
                    contentClassName="bg-white"
                    footer={actions}
                    sheetId="grade-history-filter"
                >
                    <GradeHistoryFilterPanel
                        value={draftFilters}
                        onChange={setDraftFilters}
                        categoryTree={categoryIndex.tree}
                    />
                </MobileBottomSheet>
            )}
        </div>
    );
}
