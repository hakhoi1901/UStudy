import { useState, useMemo } from "react";
import { History, ArrowUpDown, ArrowUp, ArrowDown, SearchX } from "lucide-react";
import type { StudentCourseGrade } from "../types";
import { GradeHistoryMobileCard } from "./grade-history-mobile-card";
import { GradeHistoryRow } from "./grade-history-row";
import { GradeHistoryFilterControls } from "./grade-history-filter-controls";
import type { GradeHistoryTableProps } from "../types";

export function GradeHistoryTable({
    filteredHistory,
    semesterScopedHistory,
    selectedSemester,
    uniqueSemesters,
    setSelectedSemester,
    historyFilters,
    setHistoryFilters,
    categoryIndex,
    embedded = false
}: GradeHistoryTableProps) {
    const [sortConfig, setSortConfig] = useState<{ key: keyof StudentCourseGrade, direction: 'asc' | 'desc' } | null>(null);

    const sortedHistory = useMemo(() => {
        let sortableItems = [...filteredHistory];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                let aValue: any = a[sortConfig.key];
                let bValue: any = b[sortConfig.key];

                if (sortConfig.key === 'status') {
                    aValue = a.needsRetake ? 1 : 0;
                    bValue = b.needsRetake ? 1 : 0;
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredHistory, sortConfig]);

    const requestSort = (key: keyof StudentCourseGrade) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: keyof StudentCourseGrade) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <ArrowUpDown className="w-4 h-4 ml-1 inline-block text-gray-400 group-hover:text-gray-600 transition-colors" />;
        }
        if (sortConfig.direction === 'asc') {
            return <ArrowUp className="w-4 h-4 ml-1 inline-block text-[#004A98]" />;
        }
        return <ArrowDown className="w-4 h-4 ml-1 inline-block text-[#004A98]" />;
    };

    return (
        <div className={embedded ? "overflow-hidden" : "overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"}>
            <div className="border-b border-gray-200 px-4 py-3 md:px-6 md:py-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-center gap-2 md:gap-3">
                        <History className="h-6 w-6 text-[#004A98] md:h-8 md:w-8" />
                        <h3 className="text-sm font-semibold text-gray-800">Lịch sử điểm</h3>
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                            {filteredHistory.length} môn
                        </span>
                    </div>

                    <GradeHistoryFilterControls
                        selectedSemester={selectedSemester}
                        uniqueSemesters={uniqueSemesters}
                        setSelectedSemester={setSelectedSemester}
                        filters={historyFilters}
                        setFilters={setHistoryFilters}
                        categoryIndex={categoryIndex}
                        semesterScopedHistory={semesterScopedHistory}
                    />
                </div>
            </div>

            {sortedHistory.length === 0 && (
                <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
                    <SearchX className="h-8 w-8 text-gray-300" />
                    <p className="mt-3 text-sm font-medium text-gray-700">Không có môn học phù hợp</p>
                    <p className="mt-1 text-xs text-gray-500">Thử đổi học kỳ hoặc xóa bớt điều kiện lọc.</p>
                </div>
            )}

            {/* Mobile: Card view */}
            <div className={`${sortedHistory.length === 0 ? 'hidden ' : ''}divide-y divide-gray-100 md:hidden`}>
                {sortedHistory.map((course, idx) => (
                    <GradeHistoryMobileCard key={`${course.code}-${idx}`} course={course} />
                ))}
            </div>

            {/* Desktop: Table view */}
            <div className={`${sortedHistory.length === 0 ? 'hidden ' : ''}overflow-x-auto md:block`}>
                <table className="w-full table-fixed">
                    <colgroup>
                        <col className="w-[14%]" />
                        <col className="w-[37%]" />
                        <col className="w-[12%]" />
                        <col className="w-[11%]" />
                        <col className="w-[11%]" />
                        <col className="w-[15%]" />
                    </colgroup>

                    <thead className="border-b border-gray-200 bg-gray-50">
                        <tr>
                            <th
                                className="cursor-pointer select-none px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 transition-colors hover:bg-gray-100"
                                onClick={() => requestSort("code")}
                            >
                                <div className="flex items-center gap-2">
                                    Mã môn
                                    {getSortIcon("code")}
                                </div>
                            </th>

                            <th
                                className="cursor-pointer select-none px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 transition-colors hover:bg-gray-100"
                                onClick={() => requestSort("nameVi")}
                            >
                                <div className="flex items-center gap-2">
                                    Tên môn học
                                    {getSortIcon("nameVi")}
                                </div>
                            </th>

                            <th
                                className="cursor-pointer select-none px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600 transition-colors hover:bg-gray-100"
                                onClick={() => requestSort("semester")}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    Học kỳ
                                    {getSortIcon("semester")}
                                </div>
                            </th>

                            <th
                                className="cursor-pointer select-none px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600 transition-colors hover:bg-gray-100"
                                onClick={() => requestSort("credits")}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    Tín chỉ
                                    {getSortIcon("credits")}
                                </div>
                            </th>

                            <th
                                className="cursor-pointer select-none px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600 transition-colors hover:bg-gray-100"
                                onClick={() => requestSort("grade")}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    Điểm
                                    {getSortIcon("grade")}
                                </div>
                            </th>

                            <th
                                className="cursor-pointer select-none px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600 transition-colors hover:bg-gray-100"
                                onClick={() => requestSort("status")}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    Trạng thái
                                    {getSortIcon("status")}
                                </div>
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                        {sortedHistory.map((course, idx) => (
                            <GradeHistoryRow
                                key={`${course.code}-${idx}`}
                                course={course}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
