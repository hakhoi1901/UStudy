import { Suspense, lazy, useEffect, useMemo, useRef, useState, type CSSProperties, type DragEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { DatabaseBackup } from 'lucide-react';
import { useDepartmentData } from '../../context/DepartmentContext';
import { useStudentDb } from '../../hooks/useStudentDb';
import { STORAGE_KEYS } from '../../config';
import { readFromStorage, saveToStorage } from '../../helpers/localStorage/save';
import { AcademicRulesEngine } from '../grades';
import { StudyPlanCourseListPanel } from './StudyPlanCourseListPanel';
import { StudyPlanSemesterPanel } from './StudyPlanSemesterPanel';
import { MobileCoursePlannerSheet } from './MobileCoursePlannerSheet';
import {
    DEFAULT_LEFT_PANEL_PERCENT,
    DEFAULT_SEMESTER_COUNT,
    SEMESTERS_PER_STUDY_YEAR,
    buildHistoricalStudyPlan,
    clampPanelPercent,
    createDefaultSemesters,
    formatStudyPlanSemesterLabel,
    getAnchorSemester,
    getSemesterId,
    getSemesterSortValue,
    getStudyPlanSemesterIndex,
    isStudyPlanStorage,
    mergeHistoricalStudyPlan,
} from './semester-utils';
import type { CourseMeta, CourseStatus, StudyPlanStorage, MobilePlannerTab, MobileSheetStep, PrerequisiteRule } from './types';

const StudyPlanPreview = lazy(() => import('./StudyPlanPreview'));

export function StudyPlanContainer() {
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
    const { rawObject: studentDb } = useStudentDb();
    const [leftPanelPercent, setLeftPanelPercent] = useState(() => {
        const saved = readFromStorage<number>(STORAGE_KEYS.STUDY_PLAN_LAYOUT, DEFAULT_LEFT_PANEL_PERCENT);
        return clampPanelPercent(saved);
    });
    const [studyPlan, setStudyPlan] = useState<StudyPlanStorage>(() => {
        const saved = readFromStorage<unknown>(STORAGE_KEYS.STUDY_PLAN, null);
        if (isStudyPlanStorage(saved)) return saved;

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

    const registeredCourseIds = useMemo(() => new Set(
        (studentDb?.registrations || [])
            .map((registration: { id?: string }) => String(registration.id || '').trim())
            .filter(Boolean)
    ), [studentDb]);

    const getCourseStatus = useMemo(() => (courseId: string): CourseStatus => {
        const gradeStatus = studentDb?.grades
            ? AcademicRulesEngine.getCourseStatus(courseId, studentDb.grades, hasBLMExemption)
            : 'none';
        if (gradeStatus === 'passed') return 'passed';
        return registeredCourseIds.has(courseId) ? 'studying' : gradeStatus;
    }, [studentDb, hasBLMExemption, registeredCourseIds]);

    const courseById = useMemo(() => {
        return new Map(courses.map((course: CourseMeta) => [course.course_id, course]));
    }, [courses]);

    const selectedMobileCourse = useMemo(() => {
        if (!selectedMobileCourseId) return null;
        const course = courseById.get(selectedMobileCourseId);
        if (!course) return null;
        return { ...course, status: getCourseStatus(course.course_id) };
    }, [courseById, getCourseStatus, selectedMobileCourseId]);

    const historicalStudyPlan = useMemo(() => {
        return buildHistoricalStudyPlan(
            studentDb?.grades,
            courseById,
            hasBLMExemption,
            studentDb?.registrations
        );
    }, [courseById, hasBLMExemption, studentDb]);

    const semesterScaffold = useMemo(() => {
        const anchor = getAnchorSemester(studentDb?.grades);
        const historicalLabels = new Set(historicalStudyPlan.semesters.map((semester) => semester.label));
        return createDefaultSemesters(anchor, DEFAULT_SEMESTER_COUNT, historicalLabels);
    }, [historicalStudyPlan.semesters, studentDb]);

    useEffect(() => {
        setStudyPlan((previous) => mergeHistoricalStudyPlan(previous, semesterScaffold, historicalStudyPlan));
    }, [historicalStudyPlan, semesterScaffold]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.STUDY_PLAN, studyPlan);
    }, [studyPlan]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.STUDY_PLAN_LAYOUT, leftPanelPercent);
    }, [leftPanelPercent]);

    const plannedCourseIds = useMemo(() => {
        return new Set(Object.values(studyPlan.plan).flat());
    }, [studyPlan.plan]);

    const manuallyPlannedCourseIds = useMemo(() => {
        const ids = new Set<string>();

        studyPlan.semesters
            .filter((semester) => !semester.isHistorical)
            .forEach((semester) => {
                (studyPlan.plan[semester.id] || []).forEach((courseId) => {
                    const status = getCourseStatus(courseId);
                    if (status !== 'passed' && status !== 'studying') {
                        ids.add(courseId);
                    }
                });
            });

        return ids;
    }, [studyPlan.plan, studyPlan.semesters, getCourseStatus]);

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
        return studyPlan.semesters.find((semester) => (
            !semester.isHistorical &&
            (studyPlan.plan[semester.id] || []).includes(selectedMobileCourseId)
        )) || null;
    }, [studyPlan.plan, studyPlan.semesters, selectedMobileCourseId]);

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
        studyPlan.semesters.slice(0, semesterIndex).forEach((semester) => {
            (studyPlan.plan[semester.id] || []).forEach((plannedId) => completedBefore.add(plannedId));
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
        if (studyPlan.semesters.find((semester) => semester.id === semesterId)?.isHistorical) return;
        const status = getCourseStatus(courseId);
        if (status === 'passed' || status === 'studying') return;

        setStudyPlan((previous) => ({
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
        setStudyPlan((previous) => ({
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
        if (studyPlan.semesters.find((semester) => semester.id === semesterId)?.isHistorical) return;

        setStudyPlan((previous) => ({
            ...previous,
            plan: {
                ...previous.plan,
                [semesterId]: (previous.plan[semesterId] || []).filter((id) => id !== courseId),
            },
        }));
    };

    const addSemester = (semesterIndex: number) => {
        setStudyPlan((previous) => {
            if (!Number.isInteger(semesterIndex) || semesterIndex < 0) return previous;
            if (previous.semesters.some((semester) => getStudyPlanSemesterIndex(semester.label) === semesterIndex)) return previous;

            const label = formatStudyPlanSemesterLabel(semesterIndex);
            const newSemester = {
                id: getSemesterId(label),
                label,
            };

            return {
                semesters: [...previous.semesters, newSemester]
                    .sort((first, second) => getSemesterSortValue(first.label) - getSemesterSortValue(second.label)),
                plan: {
                    ...previous.plan,
                    [newSemester.id]: [],
                },
            };
        });
    };

    const addStudyYear = (year: number) => {
        if (!Number.isInteger(year) || year < 1) return;

        setStudyPlan((previous) => {
            const existingIndices = new Set(
                previous.semesters
                    .map((semester) => getStudyPlanSemesterIndex(semester.label))
                    .filter((index): index is number => index !== null)
            );
            const firstSemesterIndex = (year - 1) * SEMESTERS_PER_STUDY_YEAR;
            const newSemesters = Array.from(
                { length: SEMESTERS_PER_STUDY_YEAR },
                (_, offset) => firstSemesterIndex + offset
            )
                .filter((semesterIndex) => !existingIndices.has(semesterIndex))
                .map((semesterIndex) => {
                    const label = formatStudyPlanSemesterLabel(semesterIndex);
                    return { id: getSemesterId(label), label };
                });

            if (newSemesters.length === 0) return previous;

            return {
                semesters: [...previous.semesters, ...newSemesters]
                    .sort((first, second) => getSemesterSortValue(first.label) - getSemesterSortValue(second.label)),
                plan: {
                    ...previous.plan,
                    ...Object.fromEntries(newSemesters.map((semester) => [semester.id, []])),
                },
            };
        });
    };

    const deleteSemester = (semesterId: string) => {
        setStudyPlan((previous) => {
            const semester = previous.semesters.find((item) => item.id === semesterId);
            if (!semester || semester.isHistorical) return previous;

            const { [semesterId]: _removedPlan, ...remainingPlan } = previous.plan;

            return {
                semesters: previous.semesters.filter((item) => item.id !== semesterId),
                plan: remainingPlan,
            };
        });
    };

    const deleteStudyYear = (year: number) => {
        if (!Number.isInteger(year) || year < 1) return;

        setStudyPlan((previous) => {
            const removableSemesterIds = new Set(
                previous.semesters
                    .filter((semester) => {
                        const semesterIndex = getStudyPlanSemesterIndex(semester.label);
                        return !semester.isHistorical
                            && semesterIndex !== null
                            && Math.floor(semesterIndex / SEMESTERS_PER_STUDY_YEAR) + 1 === year;
                    })
                    .map((semester) => semester.id)
            );

            if (removableSemesterIds.size === 0) return previous;

            return {
                semesters: previous.semesters.filter((semester) => !removableSemesterIds.has(semester.id)),
                plan: Object.fromEntries(
                    Object.entries(previous.plan).filter(([semesterId]) => !removableSemesterIds.has(semesterId))
                ),
            };
        });
    };

    const clearStudyPlan = () => {
        setStudyPlan((previous) => ({
            ...previous,
            plan: Object.fromEntries(previous.semesters.map((semester) => [
                semester.id,
                semester.isHistorical ? (historicalStudyPlan.plan[semester.id] || previous.plan[semester.id] || []) : [],
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
        '--study-plan-grid-template': `minmax(320px, ${leftPanelPercent}fr) 1rem minmax(300px, ${100 - leftPanelPercent}fr)`,
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
                    studyPlan={studyPlan}
                    courseById={courseById}
                    categories={categories}
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
                className={`animate-in fade-in grid gap-y-5 duration-500 lg:gap-x-0 lg:[grid-template-columns:var(--study-plan-grid-template)] ${isResizingLayout ? 'select-none' : ''}`}
            >
                <StudyPlanCourseListPanel
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

                <StudyPlanSemesterPanel
                    mobileVisible={mobileTab === 'semesters'}
                    studyPlan={studyPlan}
                    courseById={courseById}
                    activeDropId={activeDropId}
                    plannedStats={plannedStats}
                    getAccumulationCredits={getAccumulationCredits}
                    getMissingPrerequisites={getMissingPrerequisites}
                    onActiveDropIdChange={setActiveDropId}
                    onAddCourseToSemester={addCourseToSemester}
                    onRemoveCourseFromSemester={removeCourseFromSemester}
                    onAddSemester={addSemester}
                    onAddYear={addStudyYear}
                    onDeleteYear={deleteStudyYear}
                    onDeleteSemester={deleteSemester}
                    onClearStudyPlan={clearStudyPlan}
                    onOpenPreview={() => setRightView('preview')}
                    onDragStart={handleDragStart}
                />
            </div>

            <MobileCoursePlannerSheet
                course={selectedMobileCourse}
                studyPlan={studyPlan}
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
