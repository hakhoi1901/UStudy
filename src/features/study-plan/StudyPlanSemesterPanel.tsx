import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import * as XLSX from 'xlsx';
import { AlertTriangle, ChevronRight, Download, FileSpreadsheet, FileText, Plus, RotateCcw, Trash2, Info, GraduationCap, MoreVertical, Maximize } from 'lucide-react';
import type { CourseDragStartHandler, CourseMeta, StudyPlanStorage } from './types';
import { DEFAULT_SEMESTER_COUNT, formatStudyPlanSemesterLabel, getStudyPlanSemesterIndex } from './semester-utils';

interface StudyPlanSemesterPanelProps {
    mobileVisible: boolean;
    studyPlan: StudyPlanStorage;
    courseById: Map<string, CourseMeta>;
    activeDropId: string | null;
    plannedStats: { courses: number; credits: number };
    getAccumulationCredits: (courseId: string) => number;
    getMissingPrerequisites: (courseId: string, semesterIndex: number) => string[];
    onActiveDropIdChange: (semesterId: string | null) => void;
    onAddCourseToSemester: (courseId: string, semesterId: string) => void;
    onRemoveCourseFromSemester: (courseId: string, semesterId: string) => void;
    onAddSemester: (semesterIndex: number) => void;
    onClearStudyPlan: () => void;
    onOpenPreview: () => void;
    onDragStart: CourseDragStartHandler;
    onDeleteSemester?: (semesterId: string) => void;
}

type CourseListExportFormat = 'txt' | 'csv' | 'xlsx';
type FlyoutSide = 'left' | 'right';

interface FlyoutMenuProps {
    open: boolean;
    onToggle: () => void;
    icon: ReactNode;
    label: string;
    children: ReactNode;
    contentClassName?: string;
}

function FlyoutMenu({ open, onToggle, icon, label, children, contentClassName = '' }: FlyoutMenuProps) {
    const anchorRef = useRef<HTMLDivElement>(null);
    const [side, setSide] = useState<FlyoutSide>('right');

    useLayoutEffect(() => {
        if (!open || !anchorRef.current) return;

        const updateSide = () => {
            if (!anchorRef.current) return;
            const rect = anchorRef.current.getBoundingClientRect();
            const flyoutWidth = 224;
            const gap = 8;
            const spaceRight = window.innerWidth - rect.right;
            const spaceLeft = rect.left;
            setSide(spaceRight >= flyoutWidth + gap || spaceRight >= spaceLeft ? 'right' : 'left');
        };

        updateSide();
        window.addEventListener('resize', updateSide);
        return () => window.removeEventListener('resize', updateSide);
    }, [open]);

    return (
        <div ref={anchorRef} className="relative">
            <button
                type="button"
                role="menuitem"
                onClick={onToggle}
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-medium transition-colors ${open ? 'bg-blue-50 text-[#004A98]' : 'text-gray-700 hover:bg-gray-50'}`}
                aria-expanded={open}
                aria-haspopup="menu"
            >
                {icon}
                <span className="min-w-0 flex-1 truncate">{label}</span>
                <ChevronRight className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${side === 'left' ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div
                    role="menu"
                    className={`absolute top-0 z-[60] w-56 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-xl ${side === 'right' ? 'left-full ml-2' : 'right-full mr-2'} ${contentClassName}`}
                >
                    {children}
                </div>
            )}
        </div>
    );
}

function escapeCsvCell(value: string | number): string {
    const text = String(value);
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function StudyPlanSemesterPanel({
    mobileVisible,
    studyPlan,
    courseById,
    activeDropId,
    plannedStats,
    getAccumulationCredits,
    getMissingPrerequisites,
    onActiveDropIdChange,
    onAddCourseToSemester,
    onRemoveCourseFromSemester,
    onAddSemester,
    onClearStudyPlan,
    onOpenPreview,
    onDragStart,
    onDeleteSemester,
}: StudyPlanSemesterPanelProps) {
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const [isAddSemesterMenuOpen, setIsAddSemesterMenuOpen] = useState(false);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const existingSemesterIndices = new Set(
        studyPlan.semesters
            .map((semester) => getStudyPlanSemesterIndex(semester.label))
            .filter((index): index is number => index !== null)
    );
    const availableSemesterIndices = Array.from(
        { length: DEFAULT_SEMESTER_COUNT },
        (_, index) => index
    ).filter((index) => !existingSemesterIndices.has(index));

    const exportCourseList = (format: CourseListExportFormat) => {
        const rows = studyPlan.semesters.flatMap((semester) => (
            (studyPlan.plan[semester.id] || []).map((courseId) => {
                const course = courseById.get(courseId);
                return {
                    semester: semester.label,
                    courseId,
                    courseName: course?.course_name_vi || '',
                    credits: Number(course?.credits) || 0,
                    status: semester.isCurrent ? 'Đang học' : semester.isHistorical ? 'Đã hoàn thành' : 'Dự kiến',
                };
            })
        ));
        const fileName = `ke-hoach-hoc-tap-${new Date().toISOString().slice(0, 10)}`;

        if (format === 'xlsx') {
            const worksheet = XLSX.utils.json_to_sheet(rows.map((row) => ({
                'Học kỳ': row.semester,
                'Mã môn': row.courseId,
                'Tên môn': row.courseName,
                'Tín chỉ': row.credits,
                'Trạng thái': row.status,
            })));
            worksheet['!cols'] = [{ wch: 18 }, { wch: 14 }, { wch: 42 }, { wch: 10 }, { wch: 18 }];
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Kế hoạch học tập');
            XLSX.writeFile(workbook, `${fileName}.xlsx`);
        } else {
            const content = format === 'csv'
                ? [
                    ['Học kỳ', 'Mã môn', 'Tên môn', 'Tín chỉ', 'Trạng thái'].map(escapeCsvCell).join(','),
                    ...rows.map((row) => [row.semester, row.courseId, row.courseName, row.credits, row.status].map(escapeCsvCell).join(',')),
                ].join('\r\n')
                : studyPlan.semesters.map((semester) => {
                    const courses = (studyPlan.plan[semester.id] || []).map((courseId) => {
                        const course = courseById.get(courseId);
                        return `- ${courseId} | ${course?.course_name_vi || 'Chưa có tên môn'} | ${Number(course?.credits) || 0} TC`;
                    });
                    return `${semester.label}\r\n${courses.length > 0 ? courses.join('\r\n') : '- Chưa có môn'}`;
                }).join('\r\n\r\n');
            const blob = new Blob([format === 'csv' ? `\uFEFF${content}` : content], {
                type: format === 'csv' ? 'text/csv;charset=utf-8' : 'text/plain;charset=utf-8',
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${fileName}.${format}`;
            link.click();
            URL.revokeObjectURL(url);
        }

        setIsExportMenuOpen(false);
        setIsMoreMenuOpen(false);
    };

    return (
        <aside className={`${mobileVisible ? 'block' : 'hidden'} lg:sticky lg:top-0 lg:block lg:max-h-[calc(100vh-8rem)] lg:pl-3`}>
            <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white shadow-sm">
                {/* Header */}
                <div className="rounded-t-xl border-b border-white/10 bg-gradient-to-br from-[#0058B2] to-[#0066CC] p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h2 className="flex items-center text-xl font-bold tracking-tight text-white">
                                <span className="pr-1">Khung học kỳ</span>
                                <div className="group relative">
                                    <button
                                        type="button"
                                        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-blue-100 transition-colors hover:bg-white/10 hover:text-white"
                                        aria-label="Thông tin khung học kỳ"
                                    >
                                        <Info className="h-4 w-4" />
                                    </button>

                                    <div
                                        className="
                                            pointer-events-none
                                            absolute left-1/2 top-full z-30 mt-2
                                            w-64 -translate-x-1/2
                                            rounded-md border border-gray-200
                                            bg-white px-3 py-2
                                            text-xs font-normal leading-relaxed text-gray-600
                                            opacity-0 shadow-lg
                                            transition-all duration-150
                                            group-hover:translate-y-0
                                            group-hover:opacity-100
                                        "
                                    >
                                        Các học kỳ đã hoặc đang học được tự động điền từ dữ liệu điểm.
                                        Môn thiếu tiên quyết sẽ hiển thị cảnh báo ngay trong học kỳ.

                                        <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-l border-t border-gray-200 bg-white" />
                                    </div>
                                </div>
                            </h2>

                            <p className="mt-1 text-sm text-blue-100">
                                {plannedStats.courses} môn
                                <span className="mx-1.5 text-white/40">·</span>
                                {plannedStats.credits} tín chỉ tích lũy
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={onOpenPreview}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20"
                                title="Xem trực quan kế hoạch"
                            >
                                <Maximize className="h-4.5 w-4.5" />
                            </button>

                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsMoreMenuOpen((value) => !value);
                                        setIsAddSemesterMenuOpen(false);
                                        setIsExportMenuOpen(false);
                                    }}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20"
                                    title="Thêm tùy chọn"
                                    aria-expanded={isMoreMenuOpen}
                                    aria-haspopup="menu"
                                >
                                    <MoreVertical className="h-4.5 w-4.5" />
                                </button>

                                {isMoreMenuOpen && (
                                    <div
                                        role="menu"
                                        className="absolute right-0 top-full z-50 mt-2 w-52 overflow-visible rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                                    >
                                        <FlyoutMenu
                                            open={isAddSemesterMenuOpen}
                                            onToggle={() => {
                                                setIsAddSemesterMenuOpen((value) => !value);
                                                setIsExportMenuOpen(false);
                                            }}
                                            icon={<Plus className="h-4 w-4 text-gray-500" />}
                                            label="Thêm học kỳ"
                                            contentClassName="max-h-64 overflow-y-auto"
                                        >
                                            {availableSemesterIndices.length > 0 ? availableSemesterIndices.map((semesterIndex) => (
                                                <button
                                                    key={semesterIndex}
                                                    type="button"
                                                    role="menuitem"
                                                    onClick={() => {
                                                        onAddSemester(semesterIndex);
                                                        setIsAddSemesterMenuOpen(false);
                                                        setIsMoreMenuOpen(false);
                                                    }}
                                                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-blue-50 hover:text-[#004A98]"
                                                >
                                                    <Plus className="h-4 w-4 shrink-0 text-gray-400" />
                                                    {formatStudyPlanSemesterLabel(semesterIndex)}
                                                </button>
                                            )) : (
                                                <p className="px-3 py-3 text-sm text-gray-500">Đã có đủ các học kỳ</p>
                                            )}
                                        </FlyoutMenu>

                                        <FlyoutMenu
                                            open={isExportMenuOpen}
                                            onToggle={() => {
                                                setIsExportMenuOpen((value) => !value);
                                                setIsAddSemesterMenuOpen(false);
                                            }}
                                            icon={<Download className="h-4 w-4 text-gray-500" />}
                                            label="Xuất danh sách môn"
                                        >
                                            <button type="button" role="menuitem" onClick={() => exportCourseList('txt')} className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-[#004A98]">
                                                <FileText className="h-4 w-4 shrink-0 text-gray-400" /> Văn bản (.txt)
                                            </button>
                                            <button type="button" role="menuitem" onClick={() => exportCourseList('csv')} className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-[#004A98]">
                                                <FileText className="h-4 w-4 shrink-0 text-gray-400" /> Bảng CSV (.csv)
                                            </button>
                                            <button type="button" role="menuitem" onClick={() => exportCourseList('xlsx')} className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-[#004A98]">
                                                <FileSpreadsheet className="h-4 w-4 shrink-0 text-emerald-600" /> Excel (.xlsx)
                                            </button>
                                        </FlyoutMenu>

                                        <button
                                            type="button"
                                            role="menuitem"
                                            onClick={() => {
                                                onClearStudyPlan();
                                                setIsMoreMenuOpen(false);
                                            }}
                                            className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                            Đặt lại kế hoạch
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Semester groups */}
                <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50/60 p-4">
                    {studyPlan.semesters.map((semester, semesterIndex) => {
                        const plannedIds = studyPlan.plan[semester.id] || [];
                        const totalCredits = plannedIds.reduce((sum, courseId) => sum + getAccumulationCredits(courseId), 0);
                        const warningCount = plannedIds.filter((courseId) => getMissingPrerequisites(courseId, semesterIndex).length > 0).length;
                        return (
                            <div
                                key={semester.id}
                                onDragOver={(event) => {
                                    if (semester.isHistorical) return;
                                    event.preventDefault();
                                    onActiveDropIdChange(semester.id);
                                }}
                                onDragLeave={() => onActiveDropIdChange(null)}
                                onDrop={(event) => {
                                    if (semester.isHistorical) return;
                                    event.preventDefault();
                                    const courseId = event.dataTransfer.getData('text/plain');
                                    onAddCourseToSemester(courseId, semester.id);
                                    onActiveDropIdChange(null);
                                }}
                                className={`overflow-hidden rounded-xl border bg-white shadow-sm transition-all ${
                                    activeDropId === semester.id
                                        ? 'border-[#004A98] ring-2 ring-[#004A98]/10'
                                        : 'border-gray-200'
                                }`}
                            >
                                {/* Group header — visually separated from the course list */}
                                <div className="flex items-center justify-between gap-2 border-b border-gray-100 bg-gray-50 px-3 py-2.5">
                                    <div className="flex min-w-0 items-center gap-2.5">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0058B2]/10 text-[#004A98]">
                                            <GraduationCap className="h-4 w-4" />
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="truncate text-sm font-bold text-gray-900">{semester.label}</h3>
                                                {semester.isHistorical && (
                                                    <span className="rounded-full bg-[#004A98] px-2 py-0.5 text-[10px] font-medium text-white">
                                                        {semester.isCurrent ? 'Đang học' : 'Từ dữ liệu'}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                {plannedIds.length} môn · {totalCredits} TC tích lũy
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-1">
                                        {warningCount > 0 && (
                                            <span className="mr-1 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                                                <AlertTriangle className="h-3 w-3" />
                                                {warningCount}
                                            </span>
                                        )}

                                        {!semester.isHistorical && (
                                            <button
                                                type="button"
                                                onClick={() => onDeleteSemester?.(semester.id)}
                                                className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                                title="Xóa học kỳ"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Course list */}
                                <div className="p-2">
                                    {plannedIds.length === 0 ? (
                                        <div className="rounded-lg border border-dashed border-gray-300 bg-white px-3 py-5 text-center text-xs text-gray-500">
                                            {semester.isHistorical ? 'Chưa có dữ liệu môn trong kỳ này' : 'Thả môn vào đây'}
                                        </div>
                                    ) : (
                                        <div className="overflow-hidden rounded-lg border border-gray-200">
                                            {plannedIds.map((courseId) => {
                                                const course = courseById.get(courseId);
                                                if (!course) return null;

                                                const missingPrereqs = getMissingPrerequisites(courseId, semesterIndex);
                                                return (
                                                    <div
                                                        key={courseId}
                                                        draggable={!semester.isHistorical}
                                                        onDragStart={(event) => onDragStart(courseId, event)}
                                                        className="border-b border-gray-200 bg-white px-3 py-2.5 last:border-b-0 hover:bg-gray-50"
                                                    >
                                                        <div className="flex items-start gap-2">
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="pt-1 text-xs font-bold text-gray-900">{course.course_id}</span>
                                                                    <span className="text-[11px] font-semibold tabular-nums text-gray-500">
                                                                        {course.credits}
                                                                        <span className="ml-1 font-medium text-gray-400">TC</span>
                                                                    </span>
                                                                </div>
                                                                <p className="mt-1 truncate text-xs font-medium text-gray-600">
                                                                    {course.course_name_vi}
                                                                </p>
                                                            </div>
                                                            {!semester.isHistorical && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => onRemoveCourseFromSemester(courseId, semester.id)}
                                                                    className="rounded-md p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                                                    title="Xóa khỏi học kỳ"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </button>
                                                            )}
                                                        </div>

                                                        {missingPrereqs.length > 0 && (
                                                            <div className="mt-2 rounded-md bg-amber-50 px-2 py-1.5 text-[11px] leading-relaxed text-amber-800">
                                                                Chưa học môn tiên quyết: {missingPrereqs.map((prereqId) => {
                                                                    const prereq = courseById.get(prereqId);
                                                                    return prereq ? `${prereqId} - ${prereq.course_name_vi}` : prereqId;
                                                                }).join(', ')}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </aside>
    );
}
