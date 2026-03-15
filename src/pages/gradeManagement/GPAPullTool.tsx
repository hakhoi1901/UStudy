import { useState, useMemo, useCallback } from 'react';
import { Calculator, ChevronDown, ChevronUp, TrendingUp, Target, BookOpen } from 'lucide-react';
import { readFromStorage } from '../../helpers/localStorage/save';
import { STORAGE_KEYS } from '../../config';
import { GPACalculator } from '../../logic/GPACalculator';
import { redistributeSuggestedGrades, getSemesterWarning } from '../../logic/gpaPullRedistribution';
import { getRemainingCoursesForGpaPull, splitRemainingIntoSemesters } from '../../logic/gpaPullRemainingCourses';
import { ACADEMIC_RULES, GPA_CONFIG } from '../../config';
import type { StudentCourseGrade, SimulatorCourseGrade, GPAPullCourse, GPAPullSemester } from '../../types';

interface GPAPullToolProps {
    gradesHistory: StudentCourseGrade[];
    getClassification: (gpa: number) => string;
    simulatorCourses: SimulatorCourseGrade[];
    handleGradeChange: (courseCode: string, grade: number | null) => void;
    currentGPA: number;
    accumulatedCredits: number;
    totalCredits: number;
    /** CTĐT: dùng để lấy môn còn lại cho các kỳ sau */
    allCoursesMeta?: any[];
}

/** Map simulator courses (có tín chỉ) sang GPAPullCourse với suggestedGrade = requiredAverage. */
function buildNextSemesterFromSimulator(
    simulatorCourses: SimulatorCourseGrade[],
    requiredAverage: number
): GPAPullSemester | null {
    const coursesWithCredits = simulatorCourses.filter((c): c is SimulatorCourseGrade & { credits: number } => c.credits != null && c.credits > 0);
    if (coursesWithCredits.length === 0) return null;

    const totalCredits = coursesWithCredits.reduce((sum, c) => sum + c.credits!, 0);
    const courses: GPAPullCourse[] = coursesWithCredits.map((c) => ({
        code: c.code,
        name: c.name,
        credits: c.credits!,
        lockedGrade: c.currentGrade ?? null,
        projectedGrade: c.projectedGrade ?? null,
        suggestedGrade: requiredAverage,
        isLocked: c.currentGrade != null,
        source: c.source,
    }));

    return {
        id: 'next',
        label: 'Học kỳ tiếp theo',
        courses,
        requiredGPA: requiredAverage,
        totalCredits,
        pointsNeeded: requiredAverage * totalCredits,
    };
}

export function GPAPullTool({
    gradesHistory,
    getClassification,
    simulatorCourses,
    handleGradeChange,
    currentGPA,
    accumulatedCredits,
    totalCredits,
    allCoursesMeta = [],
}: GPAPullToolProps) {
    const [targetGPAInput, setTargetGPAInput] = useState<string>('');
    const [expanded, setExpanded] = useState(true);
    const [futureProjectedGrades, setFutureProjectedGrades] = useState<Record<string, number>>(
        () => readFromStorage<Record<string, number>>(STORAGE_KEYS.GPA_PULL_FUTURE_GRADES, {})
    );

    const handleFutureGradeChange = useCallback((courseCode: string, grade: number | null) => {
        setFutureProjectedGrades((prev) => {
            const next = grade !== null ? { ...prev, [courseCode]: grade } : { ...prev };
            if (grade === null) delete next[courseCode];
            localStorage.setItem(STORAGE_KEYS.GPA_PULL_FUTURE_GRADES, JSON.stringify(next));
            return next;
        });
    }, []);

    const targetGPA = useMemo(() => {
        const n = parseFloat(targetGPAInput.replace(',', '.'));
        if (Number.isNaN(n) || n < 0 || n > ACADEMIC_RULES.MAX_GPA) return null;
        return n;
    }, [targetGPAInput]);

    const baseResult = useMemo(() => {
        if (targetGPA === null) return null;
        return GPACalculator.calculateRequiredAverageForTargetGPA(
            gradesHistory,
            targetGPA,
            ACADEMIC_RULES.TOTAL_CREDITS
        );
    }, [gradesHistory, targetGPA]);

    const nextSemester = useMemo((): GPAPullSemester | null => {
        if (!baseResult?.success || baseResult.requiredAverage == null || baseResult.impossible || baseResult.alreadyAchieved)
            return null;
        const raw = buildNextSemesterFromSimulator(simulatorCourses, baseResult.requiredAverage);
        if (!raw) return null;
        const courses = redistributeSuggestedGrades(raw.courses, baseResult.requiredAverage);
        return { ...raw, courses };
    }, [baseResult, simulatorCourses]);

    const futureSemesters = useMemo((): GPAPullSemester[] => {
        const req = baseResult?.requiredAverage;
        if (!baseResult?.success || req == null || baseResult.impossible || baseResult.alreadyAchieved || !allCoursesMeta?.length)
            return [];
        const simulatorCodes = new Set(simulatorCourses.map((c) => c.code));
        const remaining = getRemainingCoursesForGpaPull(gradesHistory, simulatorCodes, allCoursesMeta);
        const rawSemesters = splitRemainingIntoSemesters(remaining, req);
        return rawSemesters.map((sem) => {
            const coursesWithProjected = sem.courses.map((c) => ({
                ...c,
                projectedGrade: futureProjectedGrades[c.code] ?? null,
            }));
            const courses = redistributeSuggestedGrades(coursesWithProjected, req);
            return { ...sem, courses };
        });
    }, [baseResult, gradesHistory, simulatorCourses, allCoursesMeta, futureProjectedGrades]);

    const semesters = useMemo((): GPAPullSemester[] => {
        const list: GPAPullSemester[] = [];
        if (nextSemester) list.push(nextSemester);
        list.push(...futureSemesters);
        return list;
    }, [nextSemester, futureSemesters]);

    const decimals = ACADEMIC_RULES.GPA_POINT_DECIMAL;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <Calculator className="w-8 h-8 text-[#004A98]" />
                    <h3 className="text-sm font-semibold text-gray-800">Công cụ &quot;Kéo&quot; GPA</h3>
                    <span className="text-xs text-gray-500 hidden sm:inline">
                        Nhập GPA mong muốn lúc ra trường → điểm TB tối thiểu + đề xuất từng môn
                    </span>
                </div>
                {expanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
            </button>

            {expanded && (
                <div className="px-6 py-4 border-t border-gray-100 space-y-6">
                    <p className="text-sm text-gray-600">
                        Ngược với GPA dự kiến: bạn nhập mức GPA mong muốn lúc tốt nghiệp (ví dụ 8.0 để đạt loại Giỏi).
                        Hệ thống tính điểm TB tối thiểu cần đạt và đề xuất điểm từng môn trong học kỳ tiếp theo.
                    </p>

                    {/* Nhập GPA mục tiêu */}
                    <div className="flex flex-wrap items-end gap-3">
                        <div>
                            <label htmlFor="gpa-pull-target" className="block text-xs font-medium text-gray-600 mb-1">
                                GPA mong muốn lúc ra trường (0–10)
                            </label>
                            <input
                                id="gpa-pull-target"
                                type="number"
                                min={0}
                                max={ACADEMIC_RULES.MAX_GPA}
                                step={0.1}
                                value={targetGPAInput}
                                onChange={(e) => setTargetGPAInput(e.target.value)}
                                placeholder="VD: 8.0"
                                aria-label="GPA mong muốn lúc ra trường (0 đến 10)"
                                className="w-28 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004A98] focus:border-transparent"
                            />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {GPA_CONFIG.slice(0, 4).map((config) => (
                                <button
                                    key={config.value}
                                    type="button"
                                    onClick={() => setTargetGPAInput(String(config.value))}
                                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-[#004A98] hover:text-white hover:border-[#004A98] transition-colors"
                                >
                                    {config.lable} ({config.value})
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Kết quả tổng + GPA tổng / GPA theo kỳ */}
                    {baseResult && (
                        <>
                            <div
                                className={`rounded-lg border p-4 ${
                                    baseResult.success && !baseResult.impossible && !baseResult.alreadyAchieved
                                        ? 'bg-blue-50 border-blue-200'
                                        : baseResult.alreadyAchieved
                                            ? 'bg-green-50 border-green-200'
                                            : baseResult.impossible
                                                ? 'bg-amber-50 border-amber-200'
                                                : 'bg-gray-50 border-gray-200'
                                }`}
                            >
                                <p className="text-sm font-medium text-gray-800 mb-1">{baseResult.message}</p>
                                {baseResult.remainingCredits != null && (
                                    <p className="text-xs text-gray-600">
                                        Tín chỉ còn lại: <span className="font-semibold">{baseResult.remainingCredits}</span> / {ACADEMIC_RULES.TOTAL_CREDITS}
                                    </p>
                                )}
                                {baseResult.requiredAverage != null && !baseResult.impossible && (
                                    <p className="text-sm mt-2 text-[#004A98] font-semibold">
                                        → Trung bình tối thiểu cần đạt: {baseResult.requiredAverage.toFixed(decimals)} điểm
                                        {targetGPA != null && (
                                            <span className="text-gray-600 font-normal ml-1">
                                                (xếp loại: {getClassification(baseResult.requiredAverage)})
                                            </span>
                                        )}
                                    </p>
                                )}
                            </div>

                            {/* GPA tổng + GPA theo kỳ (chỉ khi có kết quả hợp lệ) */}
                            {baseResult.success && !baseResult.impossible && baseResult.requiredAverage != null && (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                                        <TrendingUp className="w-8 h-8 text-[#004A98] flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-gray-600">GPA hiện tại</p>
                                            <p className="text-lg font-bold text-[#004A98]">{currentGPA.toFixed(decimals)}<span className="text-xs text-gray-500">/10</span></p>
                                            <p className="text-xs text-gray-500">{accumulatedCredits} / {totalCredits} TC</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                                        <Target className="w-8 h-8 text-[#004A98] flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-gray-600">GPA mục tiêu</p>
                                            <p className="text-lg font-bold text-[#004A98]">{targetGPA!.toFixed(decimals)}<span className="text-xs text-gray-500">/10</span></p>
                                            {baseResult.remainingCredits != null && (
                                                <p className="text-xs text-gray-500">Còn {baseResult.remainingCredits} TC</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                                        <BookOpen className="w-8 h-8 text-[#004A98] flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-gray-600">GPA theo kỳ (cần đạt)</p>
                                            <p className="text-lg font-bold text-[#004A98]">{baseResult.requiredAverage.toFixed(decimals)}<span className="text-xs text-gray-500">/10</span></p>
                                            <p className="text-xs text-gray-500">Các kỳ sau duy trì TB ≥ {baseResult.requiredAverage.toFixed(decimals)}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Danh sách kỳ: Học kỳ tiếp theo + các kỳ sau */}
                            {semesters.length > 0 ? (
                                semesters.map((semester) => {
                                    const isNext = semester.id === 'next';
                                    const onGradeChange = isNext ? handleGradeChange : handleFutureGradeChange;
                                    const warning = getSemesterWarning(semester.courses, semester.requiredGPA);
                                    return (
                                        <div key={semester.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                                <h4 className="text-sm font-semibold text-gray-800">{semester.label}</h4>
                                                <p className="text-xs text-gray-600 mt-0.5">
                                                    GPA cần đạt: <span className="font-medium text-[#004A98]">{semester.requiredGPA.toFixed(decimals)}</span>
                                                    {' · '}Tổng {semester.totalCredits} TC · Tổng điểm cần: {semester.pointsNeeded.toFixed(2)}
                                                    {' · '}<span className="text-gray-500">Điểm đề xuất/dự kiến: 5–10 (dưới 5 phải học lại)</span>
                                                </p>
                                            </div>
                                            {warning && (
                                                <div className="px-4 py-3 bg-amber-50 border-b border-amber-200" role="alert" aria-live="polite">
                                                    <p className="text-sm text-amber-800">{warning}</p>
                                                </div>
                                            )}
                                            {semester.courses.length === 0 ? (
                                                <p className="px-4 py-4 text-sm text-gray-500">Chưa có môn trong kỳ này.</p>
                                            ) : (
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-sm">
                                                        <thead className="bg-gray-50 border-b border-gray-200">
                                                            <tr>
                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Mã môn</th>
                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Tên môn</th>
                                                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">TC</th>
                                                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">Điểm đề xuất</th>
                                                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">Điểm dự kiến</th>
                                                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">Xếp loại</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100">
                                                            {semester.courses.map((course) => {
                                                                const displayGrade = course.projectedGrade ?? course.suggestedGrade ?? 0;
                                                                return (
                                                                    <tr key={course.code} className="hover:bg-gray-50/50">
                                                                        <td className="px-4 py-2 font-medium text-gray-900">{course.code}</td>
                                                                        <td className="px-4 py-2 text-gray-700">{course.name}</td>
                                                                        <td className="px-4 py-2 text-center">{course.credits}</td>
                                                                        <td className="px-4 py-2 text-center text-[#004A98] font-medium">
                                                                            {(course.suggestedGrade ?? 0).toFixed(decimals)}
                                                                        </td>
                                                                        <td className="px-4 py-2 text-center">
                                                                            {course.isLocked ? (
                                                                                <span className="font-medium text-gray-700">{(course.lockedGrade ?? 0).toFixed(decimals)}</span>
                                                                            ) : (
                                                                                <input
                                                                                    type="number"
                                                                                    min={ACADEMIC_RULES.PASS_GRADE_DECIMAL}
                                                                                    max={10}
                                                                                    step={0.1}
                                                                                    value={course.projectedGrade ?? ''}
                                                                                    placeholder={course.suggestedGrade != null ? String(course.suggestedGrade.toFixed(decimals)) : '—'}
                                                                                    title="Điểm từ 5–10 (dưới 5 phải học lại)"
                                                                                    aria-label={`Điểm dự kiến môn ${course.code}`}
                                                                                    onChange={(e) => {
                                                                                        const val = e.target.value;
                                                                                        if (val === '') {
                                                                                            onGradeChange(course.code, null);
                                                                                            return;
                                                                                        }
                                                                                        const num = parseFloat(val);
                                                                                        const clamped = Math.min(10, Math.max(ACADEMIC_RULES.PASS_GRADE_DECIMAL, num));
                                                                                        onGradeChange(course.code, Number.isNaN(num) ? null : clamped);
                                                                                    }}
                                                                                    className="w-16 px-2 py-1 bg-gray-100 border border-gray-200 rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-[#004A98]"
                                                                                />
                                                                            )}
                                                                        </td>
                                                                        <td className="px-4 py-2 text-center">
                                                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                                                                displayGrade >= 9 ? 'bg-green-100 text-green-700' :
                                                                                displayGrade >= 8 ? 'bg-blue-100 text-blue-700' :
                                                                                displayGrade >= 7 ? 'bg-yellow-100 text-yellow-700' :
                                                                                'bg-gray-100 text-gray-700'
                                                                            }`}>
                                                                                {getClassification(displayGrade)}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            ) : baseResult.success && !baseResult.impossible && baseResult.requiredAverage != null && (
                                <p className="text-sm text-gray-500">Chưa có môn nào trong học kỳ tiếp theo. Import dữ liệu từ portal (điểm + ĐKHP) hoặc chọn đúng CTĐT để xem đề xuất.</p>
                            )}
                        </>
                    )}

                    {targetGPAInput !== '' && targetGPA === null && (
                        <p className="text-sm text-amber-600">
                            Vui lòng nhập GPA hợp lệ từ 0 đến {ACADEMIC_RULES.MAX_GPA}.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
