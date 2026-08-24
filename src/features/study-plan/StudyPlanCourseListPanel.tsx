import { useEffect, useState } from 'react';
import { Info, Search, X } from 'lucide-react';
import { StudyPlanCategoryNode } from './StudyPlanCategoryNode';
import { STORAGE_KEYS } from '../../config';
import { readFromStorage, saveToStorage } from '../../helpers/localStorage/save';
import type { CourseDragStartHandler, MobilePlannerOpenHandler } from './types';

interface StudyPlanCourseListPanelProps {
    mobileVisible: boolean;
    searchTerm: string;
    categories: Record<string, any>;
    manuallyPlannedCourseIds: Set<string>;
    onSearchTermChange: (value: string) => void;
    onDragStart: CourseDragStartHandler;
    onRemoveFromPlan: (courseId: string) => void;
    onOpenMobilePlanner: MobilePlannerOpenHandler;
}

export function StudyPlanCourseListPanel({
    mobileVisible,
    searchTerm,
    categories,
    manuallyPlannedCourseIds,
    onSearchTermChange,
    onDragStart,
    onRemoveFromPlan,
    onOpenMobilePlanner,
}: StudyPlanCourseListPanelProps) {
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
        return readFromStorage<Record<string, boolean>>(STORAGE_KEYS.STUDY_PLAN_CATEGORY_EXPANSION, {});
    });

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.STUDY_PLAN_CATEGORY_EXPANSION, expandedCategories);
    }, [expandedCategories]);

    const handleCategoryExpandedChange = (categoryKey: string, expanded: boolean) => {
        setExpandedCategories((current) => ({
            ...current,
            [categoryKey]: expanded,
        }));
    };

    return (
        <section data-guide="study-plan-course-list" className={`${mobileVisible ? 'block' : 'hidden'} min-w-0 lg:block lg:pr-3`}>
            <div className="mb-4 md:mb-6 p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2 md:gap-3">
                <Info className="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <p className="text-xs md:text-sm text-blue-900 font-medium">
                        Kế hoạch học tập
                    </p>
                    {/* Mô tả chi tiết: ẩn trên mobile */}
                    <p className="hidden md:block text-xs text-blue-700 mt-1">
                        Tiến độ tín chỉ tạm tính cả môn đã tích lũy, môn đang học và môn đã lên lịch.
                    </p>
                    <p className="hidden md:block text-xs text-blue-700 mt-1">
                        Kéo môn chưa học từ chương trình đào tạo sang từng học kỳ ở khung bên phải để phác thảo lộ trình tương lai.
                    </p>
                </div>
            </div>

            <div className="mb-5 flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo mã môn hoặc tên môn..."
                        value={searchTerm}
                        onChange={(event) => onSearchTermChange(event.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm shadow-sm transition-all focus:border-[#004A98] focus:outline-none focus:ring-2 focus:ring-[#004A98]/20"
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => onSearchTermChange('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 transition-colors hover:bg-gray-100"
                        >
                            <X className="h-4 w-4 text-gray-500" />
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                {Object.entries(categories).map(([key, category]) => (
                    <StudyPlanCategoryNode
                        key={key}
                        categoryKey={key}
                        category={category}
                        expandedCategories={expandedCategories}
                        onCategoryExpandedChange={handleCategoryExpandedChange}
                        manuallyPlannedCourseIds={manuallyPlannedCourseIds}
                        onDragStart={onDragStart}
                        onRemoveFromPlan={onRemoveFromPlan}
                        onOpenMobilePlanner={onOpenMobilePlanner}
                    />
                ))}
            </div>
        </section>
    );
}
