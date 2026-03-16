import { useState, useMemo } from 'react';
import { Calculator, ChevronDown, ChevronUp, TrendingUp, Target, BookOpen } from 'lucide-react';
import { GPACalculator } from '../../logic/GPACalculator';
import { redistributeSuggestedGrades, getSemesterWarning } from '../../logic/gpaPullRedistribution';
import { getRetakeSuggestions } from '../../logic/gpaPullRetakeSuggestions';
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
}: GPAPullToolProps) {
    const [targetGPAInput, setTargetGPAInput] = useState<string>('');
    const [expanded, setExpanded] = useState(true);
    const [mode, setMode] = useState<'all' | 'foundationMajor'>('all');
    const [draftProjectedGrades, setDraftProjectedGrades] = useState<Record<string, string>>({});
    const [draftProjectedGradeErrors, setDraftProjectedGradeErrors] = useState<Record<string, string>>({});

    const pullDecimals = 2;
    const minTargetGpa = ACADEMIC_RULES.PASS_GRADE_DECIMAL;

    const parsedTargetGpa = useMemo(() => parseFloat(targetGPAInput.replace(',', '.')), [targetGPAInput]);
    const targetGpaError = useMemo(() => {
        if (targetGPAInput.trim() === '') return null;
        if (Number.isNaN(parsedTargetGpa)) return `Vui lòng nhập GPA hợp lệ từ ${minTargetGpa} đến ${ACADEMIC_RULES.MAX_GPA}.`;
        if (parsedTargetGpa < minTargetGpa) return `GPA mục tiêu không được nhỏ hơn ${minTargetGpa.toFixed(pullDecimals)}.`;
        if (parsedTargetGpa > ACADEMIC_RULES.MAX_GPA) return `GPA mục tiêu không được lớn hơn ${ACADEMIC_RULES.MAX_GPA.toFixed(pullDecimals)}.`;
        return null;
    }, [targetGPAInput, parsedTargetGpa, minTargetGpa]);

    const targetGPA = useMemo(() => {
        if (targetGpaError) return null;
        return parsedTargetGpa;
    }, [parsedTargetGpa, targetGpaError]);

    const courseCategoryByCode = useMemo(() => {
        // Best-effort: build from available CTĐT data if present in localStorage.
        // If not available, fallback to empty map (mode will behave like 'all').
        try {
            const raw = localStorage.getItem('student_db_full');
            const parsed = raw ? JSON.parse(raw) : null;
            const meta = parsed?.departmentData?.courses ?? parsed?.courses ?? null;
            const list = Array.isArray(meta) ? meta : [];
            const m = new Map<string, string>();
            for (const c of list) {
                const code = (c?.course_id ?? c?.id ?? '').toString().trim();
                if (!code) continue;
                const cat = (c?.category ?? '').toString().trim();
                if (!cat) continue;
                m.set(code, cat);
            }
            return m;
        } catch {
            return new Map<string, string>();
        }
    }, []);

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
        const filteredSimulator =
            mode === 'foundationMajor'
                ? simulatorCourses.filter((c) => {
                      const cat = courseCategoryByCode.get(c.code);
                      return cat === 'FOUNDATION' || cat === 'MAJOR';
                  })
                : simulatorCourses;
        const raw = buildNextSemesterFromSimulator(filteredSimulator, baseResult.requiredAverage);
        if (!raw) return null;
        const courses = redistributeSuggestedGrades(raw.courses, baseResult.requiredAverage);
        return { ...raw, courses };
    }, [baseResult, simulatorCourses, mode, courseCategoryByCode]);

    const semesters = useMemo((): GPAPullSemester[] => {
        const list: GPAPullSemester[] = [];
        if (nextSemester) list.push(nextSemester);
        return list;
    }, [nextSemester]);

    const decimals = pullDecimals;
    const requiredAverageTooLow =
        baseResult?.success &&
        !baseResult.impossible &&
        !baseResult.alreadyAchieved &&
        baseResult.requiredAverage != null &&
        baseResult.requiredAverage < minTargetGpa;

    const maxAchievableGpaAtGraduation = useMemo(() => {
        if (baseResult?.currentPoints == null || baseResult.currentCredits == null) return null;
        const remainingCredits = (ACADEMIC_RULES.TOTAL_CREDITS ?? totalCredits) - baseResult.currentCredits;
        if (remainingCredits <= 0) return null;
        return (baseResult.currentPoints + 10 * remainingCredits) / (ACADEMIC_RULES.TOTAL_CREDITS ?? totalCredits);
    }, [baseResult, totalCredits]);

    const shouldShowRetakeSuggestions = useMemo(() => {
        if (!targetGPA || !baseResult) return false;
        if (baseResult.impossible) return true;
        const semesterWarning = nextSemester ? getSemesterWarning(nextSemester.courses, nextSemester.requiredGPA) : null;
        if (semesterWarning) return true;
        if (maxAchievableGpaAtGraduation != null && targetGPA > maxAchievableGpaAtGraduation + 1e-6) return true;
        return false;
    }, [targetGPA, baseResult, nextSemester, maxAchievableGpaAtGraduation]);

    const retakeSuggestions = useMemo(() => {
        if (!shouldShowRetakeSuggestions) return [];
        return getRetakeSuggestions(gradesHistory);
    }, [shouldShowRetakeSuggestions, gradesHistory]);

    const validateProjectedGradeText = (raw: string): string | null => {
        const trimmed = (raw ?? '').trim();
        if (trimmed === '') return null;
        const parsed = parseFloat(trimmed.replace(',', '.'));
        if (Number.isNaN(parsed)) return 'Vui lòng nhập số hợp lệ.';
        if (parsed < ACADEMIC_RULES.PASS_GRADE_DECIMAL) return `Điểm không được nhỏ hơn ${ACADEMIC_RULES.PASS_GRADE_DECIMAL.toFixed(decimals)}.`;
        if (parsed > 10) return 'Điểm không được lớn hơn 10.00.';
        return null;
    };

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
                        Ngược với GPA dự kiến: bạn nhập mức GPA mong muốn lúc tốt nghiệp (Xuất sắc: 9.0–10.0; Giỏi: 8.0–&lt;9.0; Khá: 7.0–&lt;8.0).
                        Hệ thống tính điểm TB tối thiểu cần đạt và đề xuất điểm từng môn trong học kỳ tiếp theo.
                    </p>

                    {/* Mode tabs */}
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setMode('all')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                                mode === 'all'
                                    ? 'bg-[#004A98] text-white border-[#004A98]'
                                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            Tất cả các môn
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('foundationMajor')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                                mode === 'foundationMajor'
                                    ? 'bg-[#004A98] text-white border-[#004A98]'
                                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                            }`}
                            title="Chỉ hiển thị môn thuộc khối Kiến thức cơ sở ngành + Kiến thức chuyên ngành (nếu dữ liệu CTĐT có category)."
                        >
                            Cơ sở ngành + Chuyên ngành
                        </button>
                        {mode === 'foundationMajor' && courseCategoryByCode.size === 0 && (
                            <span className="text-xs text-amber-700">
                                Chưa có dữ liệu category để lọc (tạm thời hiển thị như “Tất cả”).
                            </span>
                        )}
                    </div>

                    {/* Nhập GPA mục tiêu */}
                    <div className="flex flex-wrap items-end gap-3">
                        <div>
                            <label htmlFor="gpa-pull-target" className="block text-xs font-medium text-gray-600 mb-1">
                                GPA mong muốn lúc ra trường (0–10)
                            </label>
                            <input
                                id="gpa-pull-target"
                                type="number"
                                min={minTargetGpa}
                                max={ACADEMIC_RULES.MAX_GPA}
                                step={0.1}
                                value={targetGPAInput}
                                onChange={(e) => setTargetGPAInput(e.target.value)}
                                placeholder="VD: 8.0"
                                aria-label="GPA mong muốn lúc ra trường (0 đến 10)"
                                className={`w-28 px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent ${
                                    targetGpaError
                                        ? 'border-red-300 focus:ring-red-300'
                                        : 'border-gray-200 focus:ring-[#004A98]'
                                }`}
                            />
                            <div className="min-h-[1.25rem] mt-1">
                                {targetGpaError && (
                                    <p className="text-xs text-red-600" role="alert" aria-live="polite">
                                        {targetGpaError}
                                    </p>
                                )}
                            </div>
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
                                                ? 'bg-red-50 border-red-200'
                                                : 'bg-gray-50 border-gray-200'
                                }`}
                            >
                                <p className={`text-sm font-medium mb-1 ${baseResult.impossible ? 'text-red-800' : 'text-gray-800'}`}>{baseResult.message}</p>
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
                                <div className="grid grid-cols-3 sm:grid-cols-3 gap-4">
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
                                            <p className="text-xs text-gray-500">
                                                Các kỳ sau duy trì TB ≥ {baseResult.requiredAverage.toFixed(decimals)}
                                                {requiredAverageTooLow && (
                                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded bg-red-100 text-red-700 font-medium">
                                                        &lt; {minTargetGpa.toFixed(decimals)}
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Danh sách kỳ: Học kỳ tiếp theo + các kỳ sau */}
                            {semesters.length > 0 ? (
                                semesters.map((semester) => {
                                    const isNext = semester.id === 'next';
                                    const onGradeChange = handleGradeChange;
                                    const warning = getSemesterWarning(semester.courses, semester.requiredGPA);
                                    return (
                                        <div key={semester.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                                <h4 className="text-sm font-semibold text-gray-800">
                                                    {isNext ? 'Học kỳ đang học' : semester.label}
                                                </h4>
                                                <p className="text-xs text-gray-600 mt-0.5">
                                                    GPA cần đạt: <span className="font-medium text-[#004A98]">{semester.requiredGPA.toFixed(decimals)}</span>
                                                    {' · '}Tổng {semester.totalCredits} TC · Tổng điểm cần: {semester.pointsNeeded.toFixed(2)}
                                                    {' · '}<span className="text-gray-500">Điểm đề xuất/dự kiến: 5–10 (dưới 5 phải học lại)</span>
                                                </p>
                                            </div>
                                            {warning && (
                                                <div className="px-4 py-3 bg-red-50 border-b border-red-200" role="alert" aria-live="polite">
                                                    <p className="text-sm text-red-800">{warning}</p>
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
                                                                                <div className="inline-flex flex-col items-center">
                                                                                    <input
                                                                                        type="text"
                                                                                        min={ACADEMIC_RULES.PASS_GRADE_DECIMAL}
                                                                                        max={10}
                                                                                        step={0.1}
                                                                                        inputMode="decimal"
                                                                                        value={draftProjectedGrades[course.code] ?? (course.projectedGrade != null ? course.projectedGrade.toFixed(decimals) : '')}
                                                                                        placeholder={course.suggestedGrade != null ? String(course.suggestedGrade.toFixed(decimals)) : '—'}
                                                                                        title="Điểm từ 5–10 (dưới 5 phải học lại)"
                                                                                        aria-label={`Điểm dự kiến môn ${course.code}`}
                                                                                        aria-invalid={Boolean(draftProjectedGradeErrors[course.code])}
                                                                                        onChange={(e) => {
                                                                                            const val = e.target.value;
                                                                                            setDraftProjectedGrades((prev) => ({ ...prev, [course.code]: val }));
                                                                                            const err = validateProjectedGradeText(val);
                                                                                            setDraftProjectedGradeErrors((prev) => {
                                                                                                if (!err) {
                                                                                                    if (!prev[course.code]) return prev;
                                                                                                    const next = { ...prev };
                                                                                                    delete next[course.code];
                                                                                                    return next;
                                                                                                }
                                                                                                return { ...prev, [course.code]: err };
                                                                                            });
                                                                                        }}
                                                                                        onBlur={(e) => {
                                                                                            const raw = (e.target.value ?? '').trim();
                                                                                            if (raw === '') {
                                                                                                onGradeChange(course.code, null);
                                                                                                setDraftProjectedGrades((prev) => {
                                                                                                    const next = { ...prev };
                                                                                                    delete next[course.code];
                                                                                                    return next;
                                                                                                });
                                                                                                setDraftProjectedGradeErrors((prev) => {
                                                                                                    if (!prev[course.code]) return prev;
                                                                                                    const next = { ...prev };
                                                                                                    delete next[course.code];
                                                                                                    return next;
                                                                                                });
                                                                                                return;
                                                                                            }

                                                                                            const err = validateProjectedGradeText(raw);
                                                                                            if (err) {
                                                                                                setDraftProjectedGradeErrors((prev) => ({ ...prev, [course.code]: err }));
                                                                                                return;
                                                                                            }

                                                                                            const parsed = parseFloat(raw.replace(',', '.'));
                                                                                            const rounded = Math.round(parsed * 100) / 100;
                                                                                            onGradeChange(course.code, rounded);
                                                                                            setDraftProjectedGrades((prev) => ({ ...prev, [course.code]: rounded.toFixed(decimals) }));
                                                                                            setDraftProjectedGradeErrors((prev) => {
                                                                                                if (!prev[course.code]) return prev;
                                                                                                const next = { ...prev };
                                                                                                delete next[course.code];
                                                                                                return next;
                                                                                            });
                                                                                        }}
                                                                                        className={`w-16 px-2 py-1 bg-gray-100 border rounded text-center text-sm focus:outline-none focus:ring-2 ${
                                                                                            draftProjectedGradeErrors[course.code]
                                                                                                ? 'border-red-300 focus:ring-red-300'
                                                                                                : 'border-gray-200 focus:ring-[#004A98]'
                                                                                        }`}
                                                                                    />
                                                                                    <div className="min-h-[1rem] mt-1">
                                                                                        {draftProjectedGradeErrors[course.code] && (
                                                                                            <p className="text-[10px] leading-4 text-red-600" role="alert" aria-live="polite">
                                                                                                {draftProjectedGradeErrors[course.code]}
                                                                                            </p>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
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

                            {shouldShowRetakeSuggestions && retakeSuggestions.length > 0 && (
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                        <h4 className="text-sm font-semibold text-gray-800">Gợi ý học cải thiện để kéo GPA</h4>
                                        <p className="text-xs text-gray-600 mt-0.5">
                                            Ưu tiên môn điểm thấp, nhiều tín chỉ và còn tiềm năng tăng đáng kể.
                                        </p>
                                        {maxAchievableGpaAtGraduation != null && targetGPA != null && targetGPA > maxAchievableGpaAtGraduation && (
                                            <p className="text-xs text-amber-700 mt-1">
                                                Dù các môn còn lại đều đạt 10, GPA tốt nghiệp tối đa ước tính chỉ khoảng <span className="font-medium">{maxAchievableGpaAtGraduation.toFixed(decimals)}</span>.
                                            </p>
                                        )}
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-white border-b border-gray-200">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Mã môn</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Tên môn</th>
                                                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">TC</th>
                                                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">Điểm hiện tại</th>
                                                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">Tiềm năng tăng</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {retakeSuggestions.map((s) => (
                                                    <tr key={s.code} className="hover:bg-gray-50/50">
                                                        <td className="px-4 py-2 font-medium text-gray-900">{s.code}</td>
                                                        <td className="px-4 py-2 text-gray-700">{s.nameVi}</td>
                                                        <td className="px-4 py-2 text-center">{s.credits}</td>
                                                        <td className="px-4 py-2 text-center text-gray-700">{s.currentGrade.toFixed(decimals)}</td>
                                                        <td className="px-4 py-2 text-center text-[#004A98] font-medium">+{s.potentialImprove.toFixed(decimals)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
