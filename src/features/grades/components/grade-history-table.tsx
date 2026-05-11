import { useState, useMemo } from "react";
import { Filter, History, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { StudentCourseGrade } from "../types";
import { GradeHistoryMobileCard } from "./grade-history-mobile-card";
import { GradeHistoryRow } from "./grade-history-row";
import type { GradeHistoryTableProps } from "../types";

export function GradeHistoryTable({
    filteredHistory,
    selectedSemester,
    uniqueSemesters,
    setSelectedSemester
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                    <History className="w-6 h-6 md:w-8 md:h-8 text-[#004A98]" />
                    <h3 className="text-sm font-semibold text-gray-800">Lịch sử điểm</h3>
                    <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
                        {filteredHistory.length} môn
                    </span>
                </div>

                {/* Lọc theo học kỳ */}
                <div className="flex items-center gap-1.5 md:gap-2">
                    <Filter className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-500" />
                    <select
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                        className="px-2 md:px-3 py-1 md:py-1.5 border border-gray-200 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#004A98]"
                    >
                        <option value="all">Tất cả</option>
                        {uniqueSemesters.map(sem => (
                            <option key={sem} value={sem}>{sem}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Mobile: Card view */}
            <div className="md:hidden divide-y divide-gray-100">
                {sortedHistory.map((course, idx) => (
                    <GradeHistoryMobileCard key={`${course.code}-${idx}`} course={course} />
                ))}
            </div>

            {/* Desktop: Table view */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th
                                className="px-4 py-3 text-left text-xs text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors group select-none"
                                onClick={() => requestSort('code')}
                            >
                                <div className="flex items-center gap-2">
                                    Mã môn {getSortIcon('code')}
                                </div>
                            </th>
                            <th
                                className="px-4 py-3 text-left text-xs text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors group select-none"
                                onClick={() => requestSort('nameVi')}
                            >
                                <div className="flex items-center gap-2">
                                    Tên môn học {getSortIcon('nameVi')}
                                </div>
                            </th>
                            <th
                                className="px-4 py-3 text-center text-xs text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors group select-none"
                                onClick={() => requestSort('semester')}
                            >
                                <div className="relative flex items-center justify-center w-full">
                                    <span>Học kỳ</span>
                                    <span className="absolute right-0">{getSortIcon('semester')}</span>
                                </div>
                            </th>
                            <th
                                className="px-4 py-3 text-center text-xs text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors group select-none"
                                onClick={() => requestSort('credits')}
                            >
                                <div className="relative flex items-center justify-center w-full">
                                    <span>Tín chỉ</span>
                                    <span className="absolute right-0">{getSortIcon('credits')}</span>
                                </div>
                            </th>
                            <th
                                className="px-4 py-3 text-center text-xs text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors group select-none"
                                onClick={() => requestSort('grade')}
                            >
                                <div className="relative flex items-center justify-center w-full">
                                    <span>Điểm</span>
                                    <span className="absolute right-0">{getSortIcon('grade')}</span>
                                </div>
                            </th>
                            <th
                                className="px-4 py-3 text-center text-xs text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors group select-none"
                                onClick={() => requestSort('status')}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    Trạng thái {getSortIcon('status')}
                                </div>
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                        {sortedHistory.map((course, idx) => (
                            <GradeHistoryRow key={`${course.code}-${idx}`} course={course} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
