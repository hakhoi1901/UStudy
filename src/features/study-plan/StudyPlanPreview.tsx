import { useEffect, useMemo, useState, type ElementType } from 'react';
import { AlertTriangle, ArrowLeft, BookOpen, CheckCircle2, Route, Sigma } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Line, Cell, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getRequiredCredits } from './credit-progress';
import type { CourseMeta, StudyPlanStorage } from './types';
import { ACADEMIC_RULES } from '../../constants/academic'

    


interface StudyPlanPreviewProps {
    studyPlan: StudyPlanStorage;
    courseById: Map<string, CourseMeta>;
    categories: Record<string, any>;
    getAccumulationCredits: (courseId: string) => number;
    getMissingPrerequisites: (courseId: string, semesterIndex: number) => string[];
    onBackToPlan: () => void;
}

type SemesterStatus = 'completed' | 'current' | 'planned';

const STATUS_STYLE: Record<SemesterStatus, {
    label: string;
    color: string;
    bgClass: string;
    textClass: string;
    dotClass: string;
}> = {
    completed: {
        label: 'Đã hoàn thành',
        color: '#16A34A',
        bgClass: 'bg-emerald-50',
        textClass: 'text-emerald-700',
        dotClass: 'bg-emerald-500',
    },
    current: {
        label: 'Đang học',
        color: '#0058B2',
        bgClass: 'bg-blue-50',
        textClass: 'text-[#004A98]',
        dotClass: 'bg-[#0058B2]',
    },
    planned: {
        label: 'Dự kiến',
        color: '#7C3AED',
        bgClass: 'bg-violet-50',
        textClass: 'text-violet-700',
        dotClass: 'bg-violet-500',
    },
};

function SummaryItem({
    icon: Icon,
    label,
    value,
    tone = 'blue',
}: {
    icon: ElementType;
    label: string;
    value: string | number;
    tone?: 'blue' | 'green' | 'amber' | 'violet';
}) {
    const toneClass = {
        blue: 'bg-blue-50 text-[#004A98]',
        green: 'bg-emerald-50 text-emerald-700',
        amber: 'bg-amber-50 text-amber-700',
        violet: 'bg-violet-50 text-violet-700',
    }[tone];

    return (
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${toneClass}`}>
                <Icon className="h-4 w-4" />
            </div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">{label}</p>
            <p className="ml-auto text-xl font-bold tabular-nums text-gray-900">{value}</p>
        </div>
    );
}

function ProgressRing({ value, plannedValue, total }: { value: number; plannedValue: number; total: number }) {
    const radius = 48;
    const circumference = 2 * Math.PI * radius;
    const percent = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
    const plannedPercent = total > 0 ? Math.min(100, Math.round(((value + plannedValue) / total) * 100)) : 0;
    const strokeDashoffset = circumference - (percent / 100) * circumference;
    const plannedStrokeDashoffset = circumference - (plannedPercent / 100) * circumference;

    return (
        <div className="flex items-center justify-center">
            <div className="relative h-36 w-36">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" role="img" aria-label={`${percent}% tín chỉ đã tích lũy`}>
                    <circle cx="60" cy="60" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="10" />
                    <circle
                        cx="60"
                        cy="60"
                        r={radius}
                        fill="none"
                        stroke="#004A98"
                        strokeLinecap="round"
                        strokeWidth="10"
                        strokeDasharray={circumference}
                        strokeDashoffset={plannedStrokeDashoffset}
                    />
                    <circle
                        cx="60"
                        cy="60"
                        r={radius}
                        fill="none"
                        stroke="#16A34A"
                        strokeLinecap="round"
                        strokeWidth="10"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-bold text-gray-900">{percent}%</span>
                    <span className="mt-1 text-[11px] font-medium text-gray-500">đã tích lũy</span>
                </div>
            </div>
        </div>
    );
}

export function StudyPlanPreview({
    studyPlan,
    courseById,
    categories,
    getAccumulationCredits,
    getMissingPrerequisites,
    onBackToPlan,
}: StudyPlanPreviewProps) {
    const firstEditableSemesterId = useMemo(
        () => studyPlan.semesters.find((semester) => !semester.isHistorical)?.id ?? null,
        [studyPlan.semesters]
    );
    const hasImportedCurrentSemester = useMemo(
        () => studyPlan.semesters.some((semester) => semester.isCurrent),
        [studyPlan.semesters]
    );

    const [activeSemesterId, setActiveSemesterId] = useState<string | null>(studyPlan.semesters[0]?.id ?? null);

    useEffect(() => {
        if (!studyPlan.semesters.some((semester) => semester.id === activeSemesterId)) {
            setActiveSemesterId(studyPlan.semesters[0]?.id ?? null);
        }
    }, [activeSemesterId, studyPlan.semesters]);

    const semesterRows = useMemo(() => {
        let cumulativeCredits = 0;

        return studyPlan.semesters.map((semester, semesterIndex) => {
            const courseIds = studyPlan.plan[semester.id] || [];
            const credits = courseIds.reduce((sum, courseId) => sum + getAccumulationCredits(courseId), 0);
            cumulativeCredits += credits;
            const warningCourseIds = courseIds.filter((courseId) => getMissingPrerequisites(courseId, semesterIndex).length > 0);
            const status: SemesterStatus = semester.isCurrent
                ? 'current'
                : semester.isHistorical
                ? 'completed'
                : !hasImportedCurrentSemester && semester.id === firstEditableSemesterId
                    ? 'current'
                    : 'planned';

            return {
                semester,
                semesterIndex,
                courseIds,
                credits,
                cumulativeCredits,
                warningCourseIds,
                status,
                statusStyle: STATUS_STYLE[status],
            };
        });
    }, [studyPlan.plan, studyPlan.semesters, firstEditableSemesterId, getAccumulationCredits, getMissingPrerequisites, hasImportedCurrentSemester]);

    const coursePlanState = useMemo(() => {
        const earned = new Set<string>();
        const planned = new Set<string>();

        semesterRows.forEach((semesterRow) => {
            semesterRow.courseIds.forEach((courseId) => {
                if (semesterRow.semester.isHistorical) {
                    earned.add(courseId);
                    planned.delete(courseId);
                    return;
                }

                if (!earned.has(courseId)) {
                    planned.add(courseId);
                }
            });
        });

        return { earned, planned };
    }, [semesterRows]);

    const collectCategoryCourseIds = (category: any, courseIds = new Set<string>()) => {
        if (Array.isArray(category.courses)) {
            category.courses.forEach((courseId: string) => courseIds.add(courseId));
        }

        if (category.breakdown) {
            Object.values(category.breakdown).forEach((childCategory: any) => {
                collectCategoryCourseIds(childCategory, courseIds);
            });
        }

        if (Array.isArray(category.options)) {
            category.options.forEach((option: any) => {
                collectCategoryCourseIds(option, courseIds);
            });
        }

        return courseIds;
    };

    const knowledgeBlockRows = useMemo(() => {
        return Object.entries(categories)
            .map(([key, category]) => {
                const requiredCredits = getRequiredCredits(category);
                if (requiredCredits <= 0) return null;

                return {
                    key,
                    label: category.name || key,
                    requiredCredits,
                    courseIds: collectCategoryCourseIds(category),
                };
            })
            .filter((block): block is {
                key: string;
                label: string;
                requiredCredits: number;
                courseIds: Set<string>;
            } => block !== null)
            .map((block) => {
                let earnedCredits = 0;
                let plannedCredits = 0;

                block.courseIds.forEach((courseId) => {
                    const credits = getAccumulationCredits(courseId);
                    if (coursePlanState.earned.has(courseId)) {
                        earnedCredits += credits;
                        return;
                    }

                    if (coursePlanState.planned.has(courseId)) {
                        plannedCredits += credits;
                    }
                });

            const remainingCredits = Math.max(
                0,
                block.requiredCredits - earnedCredits - plannedCredits
            );

            const progressPercent =
                block.requiredCredits > 0
                    ? Math.min(
                        100,
                        Math.round(
                            (earnedCredits / block.requiredCredits) * 100
                        )
                    )
                    : 0;

            return {
                ...block,
                earnedCredits,
                plannedCredits,
                remainingCredits,
                progressPercent,
            };
        });
    }, [categories, coursePlanState, getAccumulationCredits]);

    const totalProgramCredits = useMemo(() => {
        return knowledgeBlockRows.reduce((sum, block) => sum + block.requiredCredits, 0);
    }, [knowledgeBlockRows]);
    
    const summary = useMemo(() => {
        const totalCourses = semesterRows.reduce((sum, row) => sum + row.courseIds.length, 0);
        const totalCredits = semesterRows.reduce((sum, row) => sum + row.credits, 0);
        const earnedCredits = semesterRows
            .filter((row) => row.semester.isHistorical)
            .reduce((sum, row) => sum + row.credits, 0);
        const plannedCredits = semesterRows
            .filter((row) => !row.semester.isHistorical)
            .reduce((sum, row) => sum + row.credits, 0);
        const completedCourses = semesterRows
            .filter((row) => row.semester.isHistorical)
            .reduce((sum, row) => sum + row.courseIds.length, 0);
        const warnings = semesterRows.reduce((sum, row) => sum + row.warningCourseIds.length, 0);

        return { totalCourses, totalCredits, earnedCredits, plannedCredits, completedCourses, warnings };
    }, [semesterRows]);

    const chartData = useMemo(
    () =>
        semesterRows.map((row) => ({
            id: row.semester.id,
            label: row.semester.label,
            credits: row.credits,
            cumulativeCredits: row.cumulativeCredits,
            color: row.statusStyle.color,
            courses: row.courseIds.length,
        })),
    [semesterRows]
);

    const activeRow = semesterRows.find((row) => row.semester.id === activeSemesterId) ?? semesterRows[0] ?? null;

    return (
            <div className="">
                <div className="">
                    <button
                        type="button"
                        onClick={onBackToPlan}
                        className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-[#004A98]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại chỉnh sửa
                    </button>
                    <h2 className="text-2xl font-bold text-gray-900">Tổng quan kế hoạch học tập</h2>
                    <p className="mt-1 text-sm text-gray-500">Theo dõi tiến độ tín chỉ, học kỳ và các cảnh báo tiên quyết. Các số liệu tại đây bao gồm các môn đã được đăng ký ở kỳ hiện tại</p>
                </div>

                <div className="space-y-4 bg-gray-50/60 p-4">
                    {studyPlan.semesters.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-10 text-center text-sm text-gray-500">
                            Chưa có học kỳ nào để xem trực quan.
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-4 xl:grid-cols-[minmax(0,0.6fr)_minmax(320px,1.6fr)]">
                                <div className="space-y-4">
                                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                                        <h3 className="mb-3 text-sm font-bold text-gray-900">Tiến độ tích lũy</h3>
                                        <div className="grid grid-cols-[132px_minmax(0,1fr)] items-center gap-3">
                                            <ProgressRing value={summary.earnedCredits} plannedValue={summary.plannedCredits} total={ACADEMIC_RULES.TOTAL_CREDITS} />
                                            <div className="space-y-3 text-sm">
                                                <div><p className="text-xs text-gray-500">Đang tích lũy</p><p className="mt-0.5 font-bold text-gray-900">{summary.earnedCredits} / {ACADEMIC_RULES.TOTAL_CREDITS} TC</p></div>
                                                <div><p className="text-xs text-gray-500">Đã lên kế hoạch</p><p className="mt-0.5 font-bold text-[#004A98]">{summary.plannedCredits} TC</p></div>
                                                <div><p className="text-xs text-gray-500">Còn lại</p><p className="mt-0.5 font-bold text-gray-900">{Math.max(0, ACADEMIC_RULES.TOTAL_CREDITS - summary.earnedCredits - summary.plannedCredits)} TC</p></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                                        <h3 className="mb-3 text-sm font-bold text-gray-900">Số môn học</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-end justify-between gap-3">
                                                <div>
                                                    <p className="text-2xl font-bold tabular-nums text-gray-900">{summary.completedCourses} / {summary.totalCourses}</p>
                                                    <p className="mt-1 text-xs text-gray-500">môn đã học / Số môn đã chọn</p>
                                                </div>
                                                <span className="text-sm font-semibold tabular-nums text-[#004A98]">
                                                    {summary.totalCourses > 0 ? Math.round((summary.completedCourses / summary.totalCourses) * 100) : 0}%
                                                </span>
                                            </div>
                                            <div className="h-2 overflow-hidden rounded-full bg-gray-100" aria-label={`${summary.completedCourses}/${summary.totalCourses} môn đã học`}>
                                                <div
                                                    className="h-full rounded-full bg-[#0066CC] transition-[width] duration-300"
                                                    style={{ width: `${summary.totalCourses > 0 ? Math.min(100, (summary.completedCourses / summary.totalCourses) * 100) : 0}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                                    <h3 className="mb-3 text-sm font-bold text-gray-900">
                                        Tín chỉ theo học kỳ
                                    </h3>

                                    <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                                        <span className="flex items-center gap-1.5">
                                            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                                            Đã hoàn thành
                                        </span>

                                        <span className="flex items-center gap-1.5">
                                            <span className="h-2.5 w-2.5 rounded-sm bg-blue-700" />
                                            Hiện tại
                                        </span>

                                        <span className="flex items-center gap-1.5">
                                            <span className="h-2.5 w-2.5 rounded-sm bg-violet-500" />
                                            Dự kiến
                                        </span>

                                        <span className="flex items-center gap-1.5">
                                            <span className="h-0.5 w-4 bg-[#004A98]" />
                                            Tín chỉ tích lũy
                                        </span>
                                    </div>

                                    <div className="h-72">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <ComposedChart
                                                data={chartData}
                                                margin={{
                                                    top: 12,
                                                    right: 8,
                                                    left: -12,
                                                    bottom: 0,
                                                }}
                                            >
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    vertical={false}
                                                />

                                                <XAxis
                                                    dataKey="label"
                                                    tick={{ fontSize: 10 }}
                                                    interval={0}
                                                />

                                                {/* Trục trái: tín chỉ từng học kỳ */}
                                                <YAxis
                                                    yAxisId="semester"
                                                    orientation="left"
                                                    allowDecimals={false}
                                                    tick={{ fontSize: 11 }}
                                                    domain={[0, "dataMax + 4"]}
                                                    label={{
                                                        value: "TC / học kỳ",
                                                        angle: -90,
                                                        position: "insideLeft",
                                                        style: {
                                                            fontSize: 10,
                                                            fill: "#6B7280",
                                                        },
                                                    }}
                                                />

                                                {/* Trục phải: tín chỉ tích lũy */}
                                                <YAxis
                                                    yAxisId="cumulative"
                                                    orientation="right"
                                                    allowDecimals={false}
                                                    tick={{ fontSize: 11 }}
                                                    domain={[0, ACADEMIC_RULES.TOTAL_CREDITS]}
                                                    label={{
                                                        value: "TC tích lũy",
                                                        angle: 90,
                                                        position: "insideRight",
                                                        style: {
                                                            fontSize: 10,
                                                            fill: "#6B7280",
                                                        },
                                                    }}
                                                />

                                                <Tooltip
                                                    cursor={{
                                                        fill: "rgba(0, 88, 178, 0.05)",
                                                    }}
                                                    labelFormatter={(_, payload) => {
                                                        const item = payload?.[0]?.payload;

                                                        return item
                                                            ? `${item.label} · ${item.courses} môn`
                                                            : "";
                                                    }}
                                                    formatter={(value, name) => {
                                                        if (name === "credits") {
                                                            return [
                                                                `${value ?? 0} TC`,
                                                                "Tín chỉ kỳ này",
                                                            ];
                                                        }

                                                        if (name === "cumulativeCredits") {
                                                            return [
                                                                `${value ?? 0} TC`,
                                                                "Tín chỉ tích lũy",
                                                            ];
                                                        }

                                                        return [value, name];
                                                    }}
                                                />

                                                <Bar
                                                    yAxisId="semester"
                                                    dataKey="credits"
                                                    radius={[6, 6, 0, 0]}
                                                    maxBarSize={36}
                                                >
                                                    {chartData.map((entry) => (
                                                        <Cell
                                                            key={entry.id}
                                                            fill={entry.color}
                                                        />
                                                    ))}
                                                </Bar>

                                                <Line
                                                    yAxisId="cumulative"
                                                    type="monotone"
                                                    dataKey="cumulativeCredits"
                                                    stroke="#004A98"
                                                    strokeWidth={2.5}
                                                    dot={{
                                                        r: 4,
                                                        fill: "#FFFFFF",
                                                        stroke: "#004A98",
                                                        strokeWidth: 2,
                                                    }}
                                                    activeDot={{
                                                        r: 6,
                                                        fill: "#004A98",
                                                    }}
                                                />
                                            </ComposedChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                                    <div className="border-b border-gray-200 px-5 py-4">
                                        <h3 className="text-base font-bold text-gray-900">
                                            Tiến độ theo khối kiến thức
                                        </h3>

                                        <p className="mt-1 text-xs text-gray-500">
                                            So sánh số tín chỉ yêu cầu, đã tích lũy và đã được xếp vào kế hoạch.
                                        </p>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[760px]">
                                            <thead className="border-b border-gray-200 bg-gray-50">
                                                <tr>
                                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                                        Khối kiến thức
                                                    </th>

                                                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-600">
                                                        Yêu cầu
                                                    </th>

                                                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-600">
                                                        Đã học
                                                    </th>

                                                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-600">
                                                        Đã lên lịch
                                                    </th>

                                                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-600">
                                                        Còn thiếu
                                                    </th>

                                                    <th className="w-52 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                                        Tiến độ
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody className="divide-y divide-gray-200">
                                                {knowledgeBlockRows.map((block) => (
                                                    <tr
                                                        key={block.key}
                                                        className="transition-colors hover:bg-gray-50"
                                                    >
                                                        <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                                                            {block.label}
                                                        </td>

                                                        <td className="px-4 py-4 text-center text-sm font-semibold tabular-nums text-gray-700">
                                                            {block.requiredCredits} TC
                                                        </td>

                                                        <td className="px-4 py-4 text-center text-sm font-semibold tabular-nums text-emerald-700">
                                                            {block.earnedCredits} TC
                                                        </td>

                                                        <td className="px-4 py-4 text-center text-sm font-semibold tabular-nums text-[#004A98]">
                                                            {block.plannedCredits} TC
                                                        </td>

                                                        <td className="px-4 py-4 text-center text-sm font-semibold tabular-nums text-gray-500">
                                                            {block.remainingCredits} TC
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                                                                <span className="text-gray-500">
                                                                    Đã tích lũy
                                                                </span>

                                                                <span className="font-semibold tabular-nums text-gray-700">
                                                                    {block.progressPercent}%
                                                                </span>
                                                            </div>

                                                            <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                                                                <div
                                                                    className="h-full rounded-full bg-emerald-500 transition-[width] duration-300"
                                                                    style={{
                                                                        width: `${block.progressPercent}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>

                            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                                <div className="flex flex-col gap-2 border-b border-gray-200 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
                                    <div>
                                        <h3 className="text-base font-semibold text-gray-900">Timeline học kỳ</h3>
                                        <p className="mt-1 text-sm text-gray-500">Chọn một học kỳ để xem các học phần và tiến độ tích lũy.</p>
                                    </div>
                                    {activeRow && <span className="shrink-0 text-sm font-medium text-[#004A98]">Đang xem: {activeRow.semester.label}</span>}
                                </div>

                                <div className="overflow-x-auto bg-gray-50 px-4 py-5 sm:px-5">
                                    <div className="relative flex min-w-max snap-x snap-mandatory gap-3 pt-4">
                                        <div className="absolute left-6 right-6 top-[21px] h-px bg-gray-200" />

                                        {semesterRows.map((row) => {
                                            const progressPercent = Math.min(
                                                100,
                                                Math.round(
                                                    (row.cumulativeCredits / ACADEMIC_RULES.TOTAL_CREDITS) * 100
                                                )
                                            );

                                            const isActive =
                                                row.semester.id === activeRow?.semester.id;

                                            return (
                                                <button
                                                    key={row.semester.id}
                                                    type="button"
                                                    onClick={() =>
                                                        setActiveSemesterId(row.semester.id)
                                                    }
                                                    className="relative z-10 w-52 shrink-0 snap-start pt-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#004A98] focus-visible:ring-offset-2"
                                                >
                                                    <span className={`absolute left-4 top-0 h-3.5 w-3.5 rounded-full ring-4 ring-gray-50 transition-transform ${row.statusStyle.dotClass} ${isActive ? 'scale-110' : ''}`} />

                                                    <span className={`flex min-h-[148px] flex-col rounded-xl border p-4 transition-colors ${isActive ? 'border-[#004A98] bg-[#EAF3FF] shadow-sm' : 'border-gray-200 bg-white hover:border-[#0058B2] hover:bg-white'}`}>
                                                        <span className="flex items-start justify-between gap-2">
                                                            <span className="min-w-0">
                                                                <span className="block truncate text-sm font-semibold text-gray-900">{row.semester.label}</span>
                                                                <span className={`mt-1 inline-flex items-center gap-1.5 text-xs font-medium ${row.statusStyle.textClass}`}>
                                                                    <span className={`h-1.5 w-1.5 rounded-full ${row.statusStyle.dotClass}`} />
                                                                    {row.statusStyle.label}
                                                                </span>
                                                            </span>
                                                            <span className="text-xs font-semibold tabular-nums text-gray-500">{progressPercent}%</span>
                                                        </span>

                                                        <span className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-200 pt-3">
                                                            <span><span className="block text-[11px] text-gray-500">Học phần</span><span className="mt-0.5 block text-sm font-semibold tabular-nums text-gray-900">{row.courseIds.length} môn</span></span>
                                                            <span className="text-right"><span className="block text-[11px] text-gray-500">Tín chỉ kỳ</span><span className="mt-0.5 block text-sm font-semibold tabular-nums text-gray-900">{row.credits} TC</span></span>
                                                        </span>

                                                        <span className="mt-auto block pt-3">
                                                            <span className="mb-1 flex justify-between text-[11px] text-gray-500"><span>Tích lũy</span><span className="font-semibold tabular-nums text-gray-700">{row.cumulativeCredits} TC</span></span>
                                                            <span className="block h-1.5 overflow-hidden rounded-full bg-gray-200"><span className="block h-full rounded-full bg-[#004A98] transition-all" style={{ width: `${progressPercent}%` }} /></span>
                                                        </span>
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </section>

                            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                                <div className="flex flex-col gap-4 border-b border-gray-200 bg-gray-50 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="truncate text-base font-semibold text-gray-900">
                                                {activeRow?.semester.label || "Chi tiết học kỳ"}
                                            </h3>
                                            {activeRow && (
                                                <span className={`inline-flex items-center gap-1.5 rounded-full bg-white px-2 py-1 text-xs font-medium shadow-sm ring-1 ring-inset ring-gray-200 ${activeRow.statusStyle.textClass}`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${activeRow.statusStyle.dotClass}`} />
                                                    {activeRow.statusStyle.label}
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-1 text-sm text-gray-500">Danh sách học phần của học kỳ đang chọn.</p>
                                    </div>

                                    {activeRow && (
                                        <div className="flex shrink-0 divide-x divide-gray-200 rounded-lg border border-gray-200 bg-white text-sm shadow-sm">
                                            <div className="px-3 py-2">
                                                <p className="text-[11px] text-gray-500">Học phần</p>
                                                <p className="mt-0.5 font-semibold tabular-nums text-gray-900">{activeRow.courseIds.length} môn</p>
                                            </div>
                                            <div className="px-3 py-2">
                                                <p className="text-[11px] text-gray-500">Tín chỉ</p>
                                                <p className="mt-0.5 font-semibold tabular-nums text-gray-900">{activeRow.credits} TC</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Empty state */}
                                {!activeRow || activeRow.courseIds.length === 0 ? (
                                    <div className="flex flex-col items-center px-5 py-10 text-center">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                                            <BookOpen className="h-5 w-5 text-gray-400" />
                                        </div>

                                        <p className="mt-3 text-sm font-medium text-gray-700">
                                            Học kỳ này chưa có môn nào
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                            Quay lại kế hoạch để thêm môn học vào học kỳ này.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-200">
                                        {activeRow.courseIds.map((courseId) => {
                                            const course = courseById.get(courseId);
                                            const missing = getMissingPrerequisites(
                                                courseId,
                                                activeRow.semesterIndex
                                            );

                                            if (!course) return null;

                                            const accumulationCredits =
                                                getAccumulationCredits(courseId);

                                            return (
                                                <div
                                                    key={courseId}
                                                    className="grid gap-2 px-4 py-4 transition-colors hover:bg-gray-50 sm:grid-cols-[112px_minmax(0,1fr)_auto] sm:items-start sm:gap-4 sm:px-5"
                                                >
                                                    <p className="text-xs font-semibold text-[#004A98] sm:pt-0.5">
                                                        {course.course_id}
                                                    </p>

                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold leading-5 text-gray-900" title={course.course_name_vi}>
                                                            {course.course_name_vi}
                                                        </p>

                                                        {missing.length > 0 && (
                                                            <div className="mt-2 flex items-start gap-2 text-xs text-amber-800">
                                                                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                                                                <span><span className="font-semibold">Thiếu tiên quyết:</span> {missing.join(", ")}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="text-left sm:text-right">
                                                        {accumulationCredits > 0 ? (
                                                            <><span className="text-sm font-bold tabular-nums text-gray-900">{accumulationCredits}</span><span className="ml-1 text-xs font-medium text-gray-500">TC</span></>
                                                        ) : (
                                                            <span className="text-xs font-medium text-gray-400">Không tính TC</span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </section>
                        </>
                    )}
                </div>
            </div>
    );
}

export default StudyPlanPreview;
