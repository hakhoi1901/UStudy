import { Suspense, lazy, useEffect, useMemo, useRef, useState, type CSSProperties, type DragEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { DatabaseBackup } from 'lucide-react';
import { useDepartmentData } from '../../context/DepartmentContext';
import { STORAGE_KEYS } from '../../config';
import { readFromStorage, saveToStorage } from '../../helpers/localStorage/save';
import { AcademicRulesEngine } from '../grades';
import { DraftCourseListPanel } from './DraftCourseListPanel';
import { DraftSemesterPanel } from './DraftSemesterPanel';
import { MobileCoursePlannerSheet } from './MobileCoursePlannerSheet';
import {
    DEFAULT_LEFT_PANEL_PERCENT,
    DEFAULT_SEMESTER_COUNT,
    addSemesters,
    buildHistoricalDraft,
    clampPanelPercent,
    createDefaultSemesters,
    formatSemesterLabel,
    getAnchorSemester,
    getSemesterId,
    getSemesterSequenceValue,
    isDraftStorage,
    mergeHistoricalDraft,
    parseSemesterLabel,
} from './semester-utils';
import type { CourseMeta, CourseStatus, DraftStorage, MobilePlannerTab, MobileSheetStep, ParsedSemester, PrerequisiteRule } from './types';

const StudyPlanPreview = lazy(() => import('./StudyPlanPreview'));

export function StudyPlannerDraftContainer() {
    const { data: { courses, categories, prerequisites } } = useDepartmentData() as ReturnType<typeof useDepartmentData> & {
        data: ReturnType<typeof useDepartmentData>['data'] & { prerequisites: PrerequisiteRule[] };
    };

    const layoutRef = useRef<HTMLDivElement>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeDropId, setActiveDropId] = useState<string | null>(null);
    const [mobileTab, setMobileTab] = useState<MobilePlannerTab>('courses');
    const [mobileSheetStep, setMobileSheetStep] = useState<MobileSheetStep>('details');
    const [selectedMobileCourseId, setSelectedMobileCourseId] = useState<string | null>(null);
    const [selectedMobileCourseRootCompleted, setSelectedMobileCourseRootCompleted] = useState(false);
    const [isResizingLayout, setIsResizingLayout] = useState(false);
    const [rightView, setRightView] = useState<'plan' | 'preview'>('plan');
    const studentDb = useMemo(() => readFromStorage<any>(STORAGE_KEYS.STUDENT_DB, null), []);
    const [leftPanelPercent, setLeftPanelPercent] = useState(() => {
        const saved = readFromStorage<number>(STORAGE_KEYS.STUDY_PLAN_DRAFT_LAYOUT, DEFAULT_LEFT_PANEL_PERCENT);
        return clampPanelPercent(saved);
    });
    const [draft, setDraft] = useState<DraftStorage>(() => {
        const saved = readFromStorage<unknown>(STORAGE_KEYS.STUDY_PLAN_DRAFT, null);
        if (isDraftStorage(saved)) return saved;

        const semesters = createDefaultSemesters(getAnchorSemester(studentDb?.grades));
        return {
            semesters,
            plan: Object.fromEntries(semesters.map((semester) => [semester.id, []])),
        };
    });

    const hasBLMExemption = useMemo(() => {
        if (!studentDb?.grades) return false;
        return AcademicRulesEngine.checkBLMExemption(studentDb.grades);
    }, [studentDb]);

    const getCourseStatus = useMemo(() => (courseId: string): CourseStatus => {
        if (!studentDb?.grades) return 'none';
        return AcademicRulesEngine.getCourseStatus(courseId, studentDb.grades, hasBLMExemption);
    }, [studentDb, hasBLMExemption]);

    const courseById = useMemo(() => {
        return new Map(courses.map((course: CourseMeta) => [course.course_id, course]));
    }, [courses]);

    const selectedMobileCourse = useMemo(() => {
        if (!selectedMobileCourseId) return null;
        const course = courseById.get(selectedMobileCourseId);
        if (!course) return null;
        return { ...course, status: getCourseStatus(course.course_id) };
    }, [courseById, getCourseStatus, selectedMobileCourseId]);

    const historicalDraft = useMemo(() => {
        return buildHistoricalDraft(studentDb?.grades, courseById, hasBLMExemption);
    }, [courseById, hasBLMExemption, studentDb]);

    const semesterScaffold = useMemo(() => {
        const anchor = getAnchorSemester(studentDb?.grades);
        const historicalLabels = new Set(historicalDraft.semesters.map((semester) => semester.label));
        return createDefaultSemesters(anchor, DEFAULT_SEMESTER_COUNT, historicalLabels);
    }, [historicalDraft.semesters, studentDb]);

    useEffect(() => {
        setDraft((previous) => mergeHistoricalDraft(previous, semesterScaffold, historicalDraft));
    }, [historicalDraft, semesterScaffold]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.STUDY_PLAN_DRAFT, draft);
    }, [draft]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.STUDY_PLAN_DRAFT_LAYOUT, leftPanelPercent);
    }, [leftPanelPercent]);

    const plannedCourseIds = useMemo(() => {
        return new Set(Object.values(draft.plan).flat());
    }, [draft.plan]);

    const manuallyPlannedCourseIds = useMemo(() => {
        const ids = new Set<string>();

        draft.semesters
            .filter((semester) => !semester.isHistorical)
            .forEach((semester) => {
                (draft.plan[semester.id] || []).forEach((courseId) => {
                    const status = getCourseStatus(courseId);
                    if (status !== 'passed' && status !== 'studying') {
                        ids.add(courseId);
                    }
                });
            });

        return ids;
    }, [draft.plan, draft.semesters, getCourseStatus]);

    const getAccumulationCredits = useMemo(() => (courseId: string) => {
        const course = courseById.get(courseId);
        if (!course || AcademicRulesEngine.isCourseExcludedFromAccumulation(courseId)) return 0;
        return Number(course.credits) || 0;
    }, [courseById]);

    const plannedStats = useMemo(() => {
        const totalCredits = Array.from(plannedCourseIds).reduce((sum, courseId) => {
            return sum + getAccumulationCredits(courseId);
        }, 0);

        return {
            courses: plannedCourseIds.size,
            credits: totalCredits,
        };
    }, [getAccumulationCredits, plannedCourseIds]);

    const prereqByCourse = useMemo(() => {
        const map = new Map<string, PrerequisiteRule[]>();
        prerequisites.forEach((rule) => {
            if (!map.has(rule.course_id)) map.set(rule.course_id, []);
            map.get(rule.course_id)!.push(rule);
        });
        return map;
    }, [prerequisites]);

    const selectedCoursePlannedSemester = useMemo(() => {
        if (!selectedMobileCourseId) return null;
        return draft.semesters.find((semester) => (
            !semester.isHistorical &&
            (draft.plan[semester.id] || []).includes(selectedMobileCourseId)
        )) || null;
    }, [draft.plan, draft.semesters, selectedMobileCourseId]);

    const selectedMobileCourseLocked = Boolean(
        selectedMobileCourse &&
        (
            selectedMobileCourse.status === 'passed' ||
            selectedMobileCourse.status === 'studying' ||
            selectedMobileCourseRootCompleted
        )
    );

    const getMissingPrerequisites = (courseId: string, semesterIndex: number) => {
        const rules = prereqByCourse.get(courseId) || [];
        if (rules.length === 0) return [];

        const completedBefore = new Set<string>();
        draft.semesters.slice(0, semesterIndex).forEach((semester) => {
            (draft.plan[semester.id] || []).forEach((plannedId) => completedBefore.add(plannedId));
        });

        return rules
            .filter((rule) => !completedBefore.has(rule.prereq_id))
            .map((rule) => rule.prereq_id);
    };

    const preprocessedCategories = useMemo(() => {
        const lowerSearch = searchTerm.trim().toLowerCase();

        const attachCoursesData = (category: any): any => {
            const processedCategory = { ...category };
            const buildCourseList = (courseIds: string[]) =>
                courseIds
                    .map((id) => courseById.get(id))
                    .filter((course): course is CourseMeta => !!course)
                    .map((course) => ({ ...course, status: getCourseStatus(course.course_id) }));

            const filterCourseList = (courseList: CourseMeta[]) => {
                if (!lowerSearch) return courseList;

                return courseList.filter((course) => (
                    course.course_id.toLowerCase().includes(lowerSearch) ||
                    course.course_name_vi.toLowerCase().includes(lowerSearch)
                ));
            };

            if (Array.isArray(processedCategory.courses)) {
                const allCoursesData = buildCourseList(processedCategory.courses);
                processedCategory.allCoursesData = allCoursesData;
                processedCategory.coursesData = filterCourseList(allCoursesData);
            }

            if (processedCategory.breakdown) {
                processedCategory.breakdown = Object.entries(processedCategory.breakdown).reduce((acc: Record<string, any>, [key, child]) => {
                    acc[key] = attachCoursesData(child);
                    return acc;
                }, {});
            }

            if (Array.isArray(processedCategory.options)) {
                processedCategory.options = processedCategory.options.map((option: any) => {
                    if (!Array.isArray(option.courses)) return option;
                    const allCoursesData = buildCourseList(option.courses);
                    return {
                        ...option,
                        allCoursesData,
                        coursesData: filterCourseList(allCoursesData),
                    };
                });
            }

            return processedCategory;
        };

        return Object.entries(categories).reduce((acc: Record<string, any>, [key, category]) => {
            acc[key] = attachCoursesData(category);
            return acc;
        }, {});
    }, [categories, courseById, getCourseStatus, searchTerm]);

    const handleDragStart = (courseId: string, event: DragEvent<HTMLDivElement>) => {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', courseId);
    };

    const openMobileCoursePlanner = (course: CourseMeta, rootCompleted = false): boolean => {
        if (typeof window === 'undefined' || window.innerWidth >= 1024) return false;

        setSelectedMobileCourseId(course.course_id);
        setSelectedMobileCourseRootCompleted(rootCompleted);
        setMobileSheetStep('details');
        return true;
    };

    const closeMobileCoursePlanner = () => {
        setSelectedMobileCourseId(null);
        setSelectedMobileCourseRootCompleted(false);
        setMobileSheetStep('details');
    };

    const addCourseToSemester = (courseId: string, semesterId: string) => {
        if (!courseById.has(courseId)) return;
        if (draft.semesters.find((semester) => semester.id === semesterId)?.isHistorical) return;
        const status = getCourseStatus(courseId);
        if (status === 'passed' || status === 'studying') return;

        setDraft((previous) => ({
            ...previous,
            plan: Object.fromEntries(
                previous.semesters.map((semester) => {
                    const currentCourseIds = previous.plan[semester.id] || [];
                    const withoutCourse = semester.isHistorical
                        ? currentCourseIds
                        : currentCourseIds.filter((id) => id !== courseId);
                    return [
                        semester.id,
                        semester.id === semesterId ? [...withoutCourse, courseId] : withoutCourse,
                    ];
                })
            ),
        }));
    };

    const removeCourseFromPlan = (courseId: string) => {
        setDraft((previous) => ({
            ...previous,
            plan: Object.fromEntries(
                previous.semesters.map((semester) => [
                    semester.id,
                    semester.isHistorical
                        ? (previous.plan[semester.id] || [])
                        : (previous.plan[semester.id] || []).filter((id) => id !== courseId),
                ])
            ),
        }));
    };

    const removeCourseFromSemester = (courseId: string, semesterId: string) => {
        if (draft.semesters.find((semester) => semester.id === semesterId)?.isHistorical) return;

        setDraft((previous) => ({
            ...previous,
            plan: {
                ...previous.plan,
                [semesterId]: (previous.plan[semesterId] || []).filter((id) => id !== courseId),
            },
        }));
    };

    const addSemester = () => {
        setDraft((previous) => {
            const parsedSemesters = previous.semesters
                .map((semester) => parseSemesterLabel(semester.label))
                .filter((semester): semester is ParsedSemester => !!semester);
            const sortedSemesters = parsedSemesters.sort((a, b) => getSemesterSequenceValue(a) - getSemesterSequenceValue(b));
            const anchorSemester = sortedSemesters[0] || getAnchorSemester(studentDb?.grades);
            const lastParsedSemester = sortedSemesters[sortedSemesters.length - 1];
            const nextSemester = addSemesters(lastParsedSemester || anchorSemester, lastParsedSemester ? 1 : previous.semesters.length);
            const label = formatSemesterLabel(nextSemester, anchorSemester);
            const newSemester = {
                id: getSemesterId(label),
                label,
            };

            return {
                semesters: [...previous.semesters, newSemester],
                plan: {
                    ...previous.plan,
                    [newSemester.id]: [],
                },
            };
        });
    };

    const deleteSemester = (semesterId: string) => {
        setDraft((previous) => {
            const semester = previous.semesters.find((item) => item.id === semesterId);
            if (!semester || semester.isHistorical) return previous;

            const { [semesterId]: _removedPlan, ...remainingPlan } = previous.plan;

            return {
                semesters: previous.semesters.filter((item) => item.id !== semesterId),
                plan: remainingPlan,
            };
        });
    };

    const clearDraft = () => {
        setDraft((previous) => ({
            ...previous,
            plan: Object.fromEntries(previous.semesters.map((semester) => [
                semester.id,
                semester.isHistorical ? (historicalDraft.plan[semester.id] || previous.plan[semester.id] || []) : [],
            ])),
        }));
    };

    const addMobileCourseToSemester = (semesterId: string) => {
        if (!selectedMobileCourse) return;
        addCourseToSemester(selectedMobileCourse.course_id, semesterId);
        closeMobileCoursePlanner();
        setMobileTab('semesters');
    };

    const updateLayoutWidth = (clientX: number) => {
        const rect = layoutRef.current?.getBoundingClientRect();
        if (!rect || rect.width <= 0) return;
        const nextPercent = ((clientX - rect.left) / rect.width) * 100;
        setLeftPanelPercent(clampPanelPercent(nextPercent));
    };

    const handleLayoutResizeStart = (event: ReactPointerEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setIsResizingLayout(true);
        updateLayoutWidth(event.clientX);

        const handlePointerMove = (moveEvent: PointerEvent) => {
            updateLayoutWidth(moveEvent.clientX);
        };

        const handlePointerUp = () => {
            setIsResizingLayout(false);
            document.removeEventListener('pointermove', handlePointerMove);
            document.removeEventListener('pointerup', handlePointerUp);
        };

        document.addEventListener('pointermove', handlePointerMove);
        document.addEventListener('pointerup', handlePointerUp);
    };

    const layoutStyle = {
        '--draft-planner-grid-template': `minmax(320px, ${leftPanelPercent}fr) 1rem minmax(300px, ${100 - leftPanelPercent}fr)`,
    } as CSSProperties & Record<string, string>;

    if (courses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-blue-200 bg-white p-8 shadow-sm">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 shadow-sm ring-4 ring-white">
                    <DatabaseBackup className="h-10 w-10 text-blue-500" />
                </div>
                <h2 className="mb-2 text-xl font-bold text-gray-900">Đang cập nhật dữ liệu</h2>
                <p className="max-w-md text-center leading-relaxed text-gray-500">
                    Chương trình đào tạo cho chuyên ngành và khóa học này hiện đang trong quá trình thu thập.
                </p>
            </div>
        );
    }

    if (rightView === 'preview') {
        return (
            <Suspense
                fallback={(
                    <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-sm">
                        Đang mở bản xem trực quan...
                    </div>
                )}
            >
                <StudyPlanPreview
                    draft={draft}
                    courseById={courseById}
                    getAccumulationCredits={getAccumulationCredits}
                    getMissingPrerequisites={getMissingPrerequisites}
                    onBackToPlan={() => setRightView('plan')}
                />
            </Suspense>
        );
    }

    return (
        <>
            <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm lg:hidden">
                <button
                    type="button"
                    onClick={() => setMobileTab('courses')}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${mobileTab === 'courses' ? 'bg-[#004A98] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    Môn học
                </button>
                <button
                    type="button"
                    onClick={() => setMobileTab('semesters')}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${mobileTab === 'semesters' ? 'bg-[#004A98] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    Học kỳ
                </button>
            </div>

            <div
                ref={layoutRef}
                style={layoutStyle}
                className={`animate-in fade-in grid gap-y-5 duration-500 lg:gap-x-0 lg:[grid-template-columns:var(--draft-planner-grid-template)] ${isResizingLayout ? 'select-none' : ''}`}
            >
                <DraftCourseListPanel
                    mobileVisible={mobileTab === 'courses'}
                    searchTerm={searchTerm}
                    categories={preprocessedCategories}
                    manuallyPlannedCourseIds={manuallyPlannedCourseIds}
                    onSearchTermChange={setSearchTerm}
                    onDragStart={handleDragStart}
                    onRemoveFromPlan={removeCourseFromPlan}
                    onOpenMobilePlanner={openMobileCoursePlanner}
                />

                <div className="hidden items-stretch justify-center lg:flex">
                    <button
                        type="button"
                        onPointerDown={handleLayoutResizeStart}
                        className={`group flex h-full min-h-[28rem] w-4 cursor-col-resize items-center justify-center rounded-lg transition-colors ${isResizingLayout ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
                        title="Kéo để chỉnh chiều rộng"
                        aria-label="Kéo để chỉnh chiều rộng danh sách môn và khung học kỳ"
                    >
                        <span className={`h-14 w-1 rounded-full transition-colors ${isResizingLayout ? 'bg-[#004A98]' : 'bg-gray-300 group-hover:bg-gray-400'}`} />
                    </button>
                </div>

                <DraftSemesterPanel
                    mobileVisible={mobileTab === 'semesters'}
                    draft={draft}
                    courseById={courseById}
                    activeDropId={activeDropId}
                    plannedStats={plannedStats}
                    getAccumulationCredits={getAccumulationCredits}
                    getMissingPrerequisites={getMissingPrerequisites}
                    onActiveDropIdChange={setActiveDropId}
                    onAddCourseToSemester={addCourseToSemester}
                    onRemoveCourseFromSemester={removeCourseFromSemester}
                    onAddSemester={addSemester}
                    onDeleteSemester={deleteSemester}
                    onClearDraft={clearDraft}
                    onOpenPreview={() => setRightView('preview')}
                    onDragStart={handleDragStart}
                />
            </div>

            <MobileCoursePlannerSheet
                course={selectedMobileCourse}
                draft={draft}
                sheetStep={mobileSheetStep}
                rootCompleted={selectedMobileCourseRootCompleted}
                isLocked={selectedMobileCourseLocked}
                manuallyPlannedCourseIds={manuallyPlannedCourseIds}
                selectedPlannedSemester={selectedCoursePlannedSemester}
                prereqByCourse={prereqByCourse}
                getMissingPrerequisites={getMissingPrerequisites}
                onClose={closeMobileCoursePlanner}
                onSheetStepChange={setMobileSheetStep}
                onAddCourseToSemester={addMobileCourseToSemester}
            />
        </>
    );
}
