import { useEffect, useMemo, useState, Fragment } from 'react';
import { AlertTriangle, Calendar, Check, Moon, Plus, Save, Settings, Sun, Users, X, Zap, MoreHorizontal, ChevronDown, ChevronUp, List, Info } from 'lucide-react';

import { GroupMemberCard } from './components/GroupMemberCard';
import { buildSavedGroupSchedule, GroupScheduleCalendarPreview } from './components/GroupScheduleCalendarPreview';
import { GroupScheduleResult, type GroupScheduleResultViewMode } from './components/GroupScheduleResult';
import { GroupScheduleResultViewTabs } from './components/GroupScheduleResultViewTabs';
import { SavedSchedulesModal } from './components/SavedSchedulesModal';
import { CourseClassFilterModal } from '../study-roadmap';
import { Button } from '../../components/ui/form/button';
import { Input } from '../../components/ui/form/input';
import { Textarea } from '../../components/ui/form/textarea';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../../components/ui/overlays/dropdown-menu';
import { PageHeader } from '../../components/layout/page-header';
import { buildDensityMap, decodeGroupURL } from './services/group-scheduler';
import type { ClassPreferenceLevel, ClassPreferenceSelection, GroupMemberToken, GroupScheduleOption } from './types';
import { parseCourseInput, useGroupScheduler } from './hooks/use-group-scheduler';
import { readFromStorage, saveToStorage } from '../../helpers/localStorage/save';
import { STORAGE_KEYS } from '../../config';
import type { Course, SavedSchedule } from '../../types';
import type { SolverPreferences } from '../study-roadmap';
import courseDbJson from '../../logic/scheduler/Course_db.json';
import { cycleDayOffSession, formatDayOffSession, formatDaysOff, getDayOffSession } from '../../utils/dayOffPreferences';
import { OpenClassDetailDialog, type OpenClassDetailTarget } from '../../components/course';
import { ScheduleOptionSelector } from '../schedule';

type GroupScheduleStep = 1 | 2 | 3;

const defaultSolverPreferences: SolverPreferences = {
    daysOff: [],
    session: '0',
    strategy: 'compress',
    noGaps: false,
};

const stepItems: Array<{ id: GroupScheduleStep; label: string }> = [
    { id: 1, label: 'Nhóm' },
    { id: 2, label: 'Ưu tiên' },
    { id: 3, label: 'Kết quả' },
];

interface GroupSchedulePageProps {
    onPageChange?: (page: string) => void;
    selectedCourseIds?: Set<string>;
    allCourses?: Course[];
    allowedClassesMap?: Record<string, string[]>;
    setAllowedClassesMap?: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
    onRemoveSelectedCourse?: (courseId: string) => void;
    embedded?: boolean;
    modeSwitch?: React.ReactNode;
}

interface GroupClassOption {
    id: string;
    schedule: string[];
}

function makeDraft(): GroupMemberToken {
    return {
        nickname: '',
        sharedCourses: [],
        personalCourses: [],
        busyMask: [],
    };
}

function extractHash(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) return '';
    try {
        return new URL(trimmed).hash;
    } catch {
        const hashIndex = trimmed.indexOf('#');
        return hashIndex >= 0 ? trimmed.slice(hashIndex) : trimmed;
    }
}

function getCourseCode(course: Course): string {
    return (course.code || course.id).toUpperCase();
}

function normalizeCourseId(value: unknown): string {
    return String(value || '').trim().toUpperCase();
}

function normalizeSchedule(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value.map((item) => String(item).trim()).filter(Boolean);
    }
    const text = String(value || '').trim();
    return text ? [text] : [];
}

function loadClassOptionsByCourse(): Record<string, GroupClassOption[]> {
    const stored = readFromStorage<any[]>(STORAGE_KEYS.COURSE_DB_OFFLINE, []);
    const mergedMap = new Map<string, any>();
    (courseDbJson as any[]).forEach(item => mergedMap.set(item.id, item));
    if (stored && Array.isArray(stored)) {
        stored.forEach(item => mergedMap.set(item.id, item));
    }
    const rawCourses = Array.from(mergedMap.values());

    return rawCourses.reduce<Record<string, GroupClassOption[]>>((acc, course) => {
        const courseId = normalizeCourseId(course?.id || course?.code || course?.course_id);
        if (!courseId || !Array.isArray(course?.classes)) return acc;

        const seen = new Set<string>();
        acc[courseId] = course.classes
            .map((cls: any) => ({
                id: String(cls?.id || cls?.classId || cls?.className || '').trim(),
                schedule: normalizeSchedule(cls?.schedule),
            }))
            .filter((cls: GroupClassOption) => {
                if (!cls.id || seen.has(cls.id)) return false;
                seen.add(cls.id);
                return true;
            })
            .sort((a: GroupClassOption, b: GroupClassOption) => a.id.localeCompare(b.id));

        return acc;
    }, {});
}

export function GroupSchedulePage({
    onPageChange,
    selectedCourseIds,
    allCourses = [],
    allowedClassesMap = {},
    setAllowedClassesMap,
    onRemoveSelectedCourse,
    embedded = false,
    modeSwitch,
}: GroupSchedulePageProps) {
    const {
        members,
        shareUrl,
        urlWarning,
        decodeError,
        solving,
        result,
        solveError,
        availableCourses,
        setMembersFromURL,
        addMember,
        replaceMembers,
        solve,
        clearResult,
        setResult,
        getOptionRegistrations,
    } = useGroupScheduler();

    const savedUIState = useMemo(() => {
        return readFromStorage(STORAGE_KEYS.GROUP_SCHEDULE_UI_STATE, {
            activeStep: 1 as GroupScheduleStep,
            resultViewMode: 'course' as GroupScheduleResultViewMode,
            isAdvancedOpen: false,
            showMembersPanel: false,
            showGroupCalendarPreview: false,
        });
    }, []);

    const [activeStep, setActiveStep] = useState<GroupScheduleStep>(savedUIState.activeStep);
    const [activeResultIndex, setActiveResultIndex] = useState(0);
    const [activePreviewMemberIndex, setActivePreviewMemberIndex] = useState(0);
    const [showGroupCalendarPreview, setShowGroupCalendarPreview] = useState(savedUIState.showGroupCalendarPreview);
    const [showSaveGroupScheduleModal, setShowSaveGroupScheduleModal] = useState(false);
    const [groupScheduleName, setGroupScheduleName] = useState('');
    const [resultViewMode, setResultViewMode] = useState<GroupScheduleResultViewMode>(savedUIState.resultViewMode);
    const [draft, setDraft] = useState<GroupMemberToken>(makeDraft);
    const [manualCourseInput, setManualCourseInput] = useState('');
    const [mergeInput, setMergeInput] = useState('');
    const [localNotice, setLocalNotice] = useState<string | null>(null);

    const [showListModal, setShowListModal] = useState(false);
    const [savedSchedules, setSavedSchedules] = useState<SavedSchedule[]>(() => {
        return readFromStorage<SavedSchedule[]>(STORAGE_KEYS.SAVED_SCHEDULES, []);
    });
    const [personalClassPreferences, setPersonalClassPreferences] = useState<Record<string, ClassPreferenceSelection>>({});
    const [groupPreferredClasses, setGroupPreferredClasses] = useState<Record<string, ClassPreferenceSelection>>({});
    const [groupPrefs, setGroupPrefs] = useState<SolverPreferences>(() => readFromStorage<SolverPreferences>(STORAGE_KEYS.SOLVER_PREFERENCES, defaultSolverPreferences));
    const [expandedClassCourseId, setExpandedClassCourseId] = useState<string | null>(null);
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(savedUIState.isAdvancedOpen);
    const [showMembersPanel, setShowMembersPanel] = useState(savedUIState.showMembersPanel);
    const [filterModalCourse, setFilterModalCourse] = useState<Course | null>(null);
    const [openClassDetails, setOpenClassDetails] = useState<OpenClassDetailTarget | null>(null);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.GROUP_SCHEDULE_UI_STATE, {
            activeStep,
            resultViewMode,
            isAdvancedOpen,
            showMembersPanel,
            showGroupCalendarPreview,
        });
    }, [activeStep, resultViewMode, isAdvancedOpen, showMembersPanel, showGroupCalendarPreview]);

    useEffect(() => {
        const onHashChange = () => setMembersFromURL(window.location.hash);
        window.addEventListener('hashchange', onHashChange);
        return () => window.removeEventListener('hashchange', onHashChange);
    }, [setMembersFromURL]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.SOLVER_PREFERENCES, groupPrefs);
    }, [groupPrefs]);

    useEffect(() => {
        if (result?.solutions.length) {
            setActiveStep(3);
            setActiveResultIndex(0);
            setActivePreviewMemberIndex(result.solutions[0]?.schedules[0]?.memberIndex ?? 0);
            setShowGroupCalendarPreview(true);
        }
    }, [result]);

    const knownCourseIds = useMemo(() => new Set(availableCourses.map((course) => course.id)), [availableCourses]);
    const basketCourses = useMemo(() => {
        if (!selectedCourseIds || selectedCourseIds.size === 0) return [];
        return allCourses.filter((course) => selectedCourseIds.has(course.id) || selectedCourseIds.has(course.code));
    }, [allCourses, selectedCourseIds]);
    const draftCourseIds = useMemo(() => {
        if (basketCourses.length > 0) {
            return Array.from(new Set(basketCourses.map(getCourseCode)));
        }
        return parseCourseInput(manualCourseInput);
    }, [basketCourses, manualCourseInput]);
    const courseNames = useMemo(() => {
        return Object.fromEntries(allCourses.map((c) => [c.code || c.id, c.name]));
    }, [allCourses]);

    const groupCourses = useMemo(() => buildDensityMap(members), [members]);
    const classOptionsByCourse = useMemo(() => loadClassOptionsByCourse(), []);
    const selectedOption = result?.solutions[activeResultIndex] ?? result?.solutions[0];
    const sharedCourseCount = useMemo(() => groupCourses.filter((course) => course.isShared).length, [groupCourses]);
    const groupClassPreferenceSummary = useMemo(() => {
        return Object.values(groupPreferredClasses).reduce(
            (summary, selection) => ({
                excluded: summary.excluded + (selection.excluded?.length ?? 0),
                preferred: summary.preferred + (selection.preferred?.length ?? 0),
                required: summary.required + (selection.required?.length ?? 0),
            }),
            { excluded: 0, preferred: 0, required: 0 },
        );
    }, [groupPreferredClasses]);

    const submitDraft = () => {
        const nextDraft: GroupMemberToken = {
            ...draft,
            sharedCourses: [],
            personalCourses: draftCourseIds,
            busyMask: [],
        };

        const unknownCourses = draftCourseIds.filter((course) => knownCourseIds.size > 0 && !knownCourseIds.has(course));
        setLocalNotice(unknownCourses.length > 0 ? `Các môn chưa có trong dữ liệu lớp học: ${unknownCourses.join(', ')}.` : null);

        if (addMember(nextDraft)) {
            setDraft(makeDraft());
            setManualCourseInput('');
            setPersonalClassPreferences({});
        }
    };

    const mergeMembersFromLink = () => {
        try {
            const decoded = decodeGroupURL(extractHash(mergeInput));
            const existingKeys = new Set(members.map((member) => JSON.stringify({
                courses: [...member.sharedCourses, ...member.personalCourses].sort(),
                busyMask: member.busyMask,
            })));
            const merged = [...members];
            decoded.forEach((member) => {
                const key = JSON.stringify({
                    courses: [...member.sharedCourses, ...member.personalCourses].sort(),
                    busyMask: member.busyMask,
                });
                if (!existingKeys.has(key)) {
                    existingKeys.add(key);
                    merged.push(member);
                }
            });
            replaceMembers(merged);
            setMergeInput('');
            setLocalNotice(`Đã gộp ${merged.length - members.length} thành viên từ link.`);
        } catch (error) {
            setLocalNotice(error instanceof Error ? error.message : 'Không đọc được link nhóm.');
        }
    };

    const removeMember = (index: number) => {
        replaceMembers(members.filter((_, memberIndex) => memberIndex !== index));
        clearResult();
    };

    const getGroupClassPreferenceLevel = (courseId: string, classId: string): ClassPreferenceLevel | null => {
        const selection = groupPreferredClasses[courseId];
        if (selection?.excluded?.includes(classId)) return 'excluded';
        if (selection?.required?.includes(classId)) return 'required';
        if (selection?.preferred?.includes(classId)) return 'preferred';
        return null;
    };

    const getGroupCourseName = (courseId: string): string => {
        const course = allCourses.find((item) => item.id === courseId || item.code === courseId);
        const availableCourse = availableCourses.find((item) => item.id === courseId);
        return course?.nameVi || course?.name || availableCourse?.name || courseId;
    };

    const setGroupClassPreferenceLevel = (courseId: string, classId: string, level: ClassPreferenceLevel | null) => {
        setGroupPreferredClasses((current) => {
            const excluded = new Set(current[courseId]?.excluded ?? []);
            const preferred = new Set(current[courseId]?.preferred ?? []);
            const required = new Set(current[courseId]?.required ?? []);
            excluded.delete(classId);
            preferred.delete(classId);
            required.delete(classId);

            if (level === 'excluded') excluded.add(classId);
            if (level === 'preferred') preferred.add(classId);
            if (level === 'required') required.add(classId);

            const nextSelection: ClassPreferenceSelection = {
                excluded: Array.from(excluded).sort((a, b) => a.localeCompare(b)),
                preferred: Array.from(preferred).sort((a, b) => a.localeCompare(b)),
                required: Array.from(required).sort((a, b) => a.localeCompare(b)),
            };

            if ((nextSelection.excluded?.length ?? 0) === 0 && (nextSelection.preferred?.length ?? 0) === 0 && (nextSelection.required?.length ?? 0) === 0) {
                const { [courseId]: _removed, ...rest } = current;
                return rest;
            }

            return { ...current, [courseId]: nextSelection };
        });
    };

    const clearGroupClassPreference = (courseId: string) => {
        setGroupPreferredClasses((current) => {
            const { [courseId]: _removed, ...rest } = current;
            return rest;
        });
    };

    const runGroupSolve = () => {
        setActiveStep(3);
        setShowGroupCalendarPreview(true);
        solve({ ...groupPrefs, groupPreferredClasses });
    };

    const handleUseSchedule = (option: GroupScheduleOption, memberIndex: number) => {
        const registrations = getOptionRegistrations(option, memberIndex);
        saveToStorage(STORAGE_KEYS.ACTIVE_GROUP_SCHEDULE, {
            source: 'group-scheduler',
            updatedAt: new Date().toISOString(),
            registrations,
            option: option.option,
            memberIndex,
        });
        onPageChange?.('schedule');
    };

    const saveSelectedGroupSchedule = () => {
        const fallbackMemberIndex = selectedOption?.schedules[0]?.memberIndex ?? activePreviewMemberIndex;
        const memberIndex = showGroupCalendarPreview ? activePreviewMemberIndex : fallbackMemberIndex;
        const newSaved = buildSavedGroupSchedule(selectedOption, memberIndex, groupScheduleName);
        if (!newSaved) return;

        const savedSchedulesRaw = readFromStorage<unknown>(STORAGE_KEYS.SAVED_SCHEDULES, []);
        const savedSchedules = Array.isArray(savedSchedulesRaw) ? savedSchedulesRaw : [];
        saveToStorage(STORAGE_KEYS.SAVED_SCHEDULES, [newSaved, ...savedSchedules]);
        setSavedSchedules([newSaved, ...savedSchedules]);
        setShowSaveGroupScheduleModal(false);
        setGroupScheduleName('');
        setLocalNotice('Đã lưu lịch nhóm. Bạn có thể xem lại trong Lịch đã lưu.');
    };

    const handleLoadSchedule = (saved: SavedSchedule) => {
        if (!saved.groupSchedule) {
            if (window.confirm('Đây là lịch cá nhân. Bạn có muốn sang tab Lịch dự kiến để xem không?')) {
                alert('Vui lòng mở tab Lịch dự kiến để tải lịch này.');
            }
            return;
        }
        if (!saved.groupSchedule.rawOption) {
            alert('Lịch này được lưu ở phiên bản cũ và không thể mở lại trực tiếp trong Lịch nhóm. Vui lòng mở tab Lịch dự kiến (cá nhân) để xem chi tiết nhé!');
            return;
        }

        setResult({
            density: [],
            warnings: [],
            solutions: [saved.groupSchedule.rawOption]
        } as any);
        setActiveResultIndex(0);
        setShowListModal(false);
    };

    const handleDeleteSchedule = (id: string) => {
        const updated = savedSchedules.filter(s => s.id !== id);
        setSavedSchedules(updated);
        saveToStorage(STORAGE_KEYS.SAVED_SCHEDULES, updated);
    };

    const canOpenStep = (step: GroupScheduleStep) => {
        if (step === 1) return true;
        if (step === 2) return members.length > 0;
        return !!result?.solutions.length;
    };

    const renderDraftCourseList = () => (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="divide-y divide-slate-100">
                {basketCourses.map((course) => (
                    <div key={course.id} className="flex items-center gap-3 px-3 py-3">
                        <div className="min-w-0 flex-1">
                            <div className="flex min-w-0 items-center gap-2">
                                <span className="shrink-0 text-xs font-semibold uppercase text-slate-500">{course.code || course.id}</span>
                                <span className="min-w-0 truncate text-sm font-medium text-slate-900">{course.nameVi || course.name}</span>
                            </div>
                            <p className="mt-0.5 text-xs text-slate-500">{course.credits} tín chỉ</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                            {allowedClassesMap && setAllowedClassesMap && (
                                <button
                                    type="button"
                                    onClick={() => setFilterModalCourse(course)}
                                    className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-blue-50 hover:text-[#004A98]"
                                    title="Lọc lớp học"
                                >
                                    <Settings className="h-4 w-4" />
                                </button>
                            )}
                            {onRemoveSelectedCourse && (
                                <button
                                    type="button"
                                    onClick={() => onRemoveSelectedCourse(course.id)}
                                    className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                                    title="Xóa khỏi giỏ"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderStepper = () => (
        <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 md:flex-row md:items-center md:gap-4">
            {modeSwitch && (
                <div className="w-full shrink-0 border-b border-gray-100 pb-3 md:w-auto md:border-b-0 md:border-r md:pb-0 md:pr-4">
                    {modeSwitch}
                </div>
            )}
            <div className="flex min-w-0 flex-1 items-center justify-between gap-1 px-1">
                {stepItems.map((step, index) => {
                    const isActive = activeStep === step.id;
                    const isDone = activeStep > step.id || (step.id === 3 && !!result?.solutions.length);
                    const isClickable = canOpenStep(step.id);
                    const isLast = index === stepItems.length - 1;

                    return (
                        <Fragment key={step.id}>
                            <button
                                type="button"
                                disabled={!isClickable}
                                onClick={() => isClickable && setActiveStep(step.id)}
                                className="group relative z-10 flex min-w-0 items-center gap-2 text-left transition-opacity focus:outline-none disabled:opacity-45"
                            >
                                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${isDone
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : isActive
                                        ? 'bg-[#004A98] text-white shadow-sm ring-2 ring-blue-100 ring-offset-1'
                                        : 'bg-gray-100 text-gray-500 border border-gray-200 group-hover:bg-gray-200'
                                    }`}>
                                    {isDone ? <Check className="h-4 w-4" /> : step.id}
                                </div>
                                <span className={`hidden text-sm transition-colors md:block ${isActive ? 'text-[#004A98] font-bold' : isDone ? 'text-emerald-700 font-bold' : 'text-gray-500 font-medium'
                                    }`}>
                                    {step.label}
                                    <span className="mt-0.5 block text-xs font-normal text-gray-400">
                                        {step.id === 1 ? 'Thêm thành viên' : step.id === 2 ? 'Tùy chỉnh ưu tiên' : 'Xem & lưu lịch'}
                                    </span>
                                </span>
                            </button>

                            {!isLast && (
                                <div className={`mx-2 h-px flex-1 transition-colors md:mx-4 ${isDone ? 'bg-emerald-400' : 'bg-gray-200'
                                    }`} />
                            )}
                        </Fragment>
                    );
                })}
            </div>
        </div>
    );

    const renderMembersPanel = () => (
        <aside className="lg:sticky lg:top-4 lg:self-start">
            <div className="ustudy-card overflow-hidden p-0">
                <div className="border-b border-slate-100 p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h2 className="text-base font-semibold text-slate-900">Thành viên nhóm</h2>
                            <div className="mt-1 flex items-center gap-2 text-xs font-medium">
                                <span className={`h-2 w-2 rounded-full ${members.length >= 2 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                <span className={members.length >= 2 ? 'text-emerald-700' : 'text-amber-700'}>
                                    {members.length >= 2 ? 'Đã đủ điều kiện xếp lịch' : `Cần thêm ${2 - members.length} thành viên`}
                                </span>
                            </div>
                        </div>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                            {members.length} người
                        </span>
                    </div>
                </div>
                <div className="divide-y divide-slate-100 p-1">
                    {members.length === 0 ? (
                        <div className="px-4 py-5 text-sm text-slate-500">Chưa có thành viên nào.</div>
                    ) : (
                        members.map((member, index) => (
                            <div key={`${member.nickname || 'member'}-${index}`}>
                                <GroupMemberCard member={member} index={index} courseNames={courseNames} onRemove={() => removeMember(index)} />
                            </div>
                        ))
                    )}
                </div>
            </div>
            {/* <GroupURLShare url={shareUrl} warning={urlWarning} /> */}
        </aside>
    );

    const renderMemberStep = () => (
        <div
            className={`grid gap-4 ${showMembersPanel ? 'lg:grid-cols-[minmax(0,1fr)_360px]' : 'lg:grid-cols-1'
                }`}
        >
            <section className="ustudy-card space-y-6 p-5 sm:p-7">
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                        <span className="mt-1 h-6 w-[3px] rounded-full bg-[#004A98]" aria-hidden="true" />
                        <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-400 sm:text-[11px] sm:uppercase sm:tracking-[0.14em]">
                                Bước thêm thành viên
                            </p>
                            <h2 className="text-base font-semibold text-slate-900 sm:text-lg">Nhóm của bạn</h2>
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full justify-center border-slate-200 text-slate-600 hover:bg-slate-50 sm:w-auto sm:shrink-0"
                        onClick={() => setShowMembersPanel(!showMembersPanel)}
                    >
                        <Users className="mr-2 h-4 w-4 text-slate-400" />
                        <span className="sm:hidden">
                            {showMembersPanel ? 'Ẩn thành viên' : `Hiện thành viên (${members.length})`}
                        </span>
                        <span className="hidden sm:inline">
                            {showMembersPanel ? 'Ẩn danh sách thành viên' : `Hiện danh sách thành viên (${members.length})`}
                        </span>
                    </Button>
                </div>

                {/* Collapsed member chips */}
                {!showMembersPanel && members.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                        {members.slice(0, 5).map((member, index) => (
                            <span
                                key={`${member.nickname || 'member'}-${index}`}
                                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700"
                            >
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-white">
                                    {(member.nickname || String(index + 1)).slice(0, 1).toUpperCase()}
                                </span>
                                {member.nickname || `Thành viên ${index + 1}`}
                            </span>
                        ))}
                        {members.length > 5 && (
                            <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-semibold text-white">
                                +{members.length - 5}
                            </span>
                        )}
                    </div>
                )}

                {/* Nickname */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-800">
                        Nickname
                    </label>

                    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                        <Input
                            value={draft.nickname || ""}
                            onChange={(event) =>
                                setDraft((current) => ({
                                    ...current,
                                    nickname: event.target.value,
                                }))
                            }
                            placeholder="Bạn A"
                            className="min-w-0 flex-1 border-slate-200 focus-visible:ring-[#004A98]/25"
                        />

                        <Button
                            type="button"
                            onClick={submitDraft}
                            className="w-full bg-[#004A98] text-white hover:bg-[#003d7a] sm:w-auto sm:shrink-0"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="truncate">
                                {members.length === 0 ? "Tạo link nhóm" : "Thêm thành viên"}
                            </span>
                        </Button>
                    </div>
                </div>

                {/* Courses */}
                <div className="space-y-3 border-t border-slate-100 pt-6">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-slate-800">Môn đăng ký</label>
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                            {draftCourseIds.length} môn
                        </span>
                    </div>

                    {basketCourses.length > 0 ? (
                        <div>
                            {renderDraftCourseList()}
                            <p className="mt-3 text-xs leading-relaxed text-slate-400">
                                Môn trùng giữa các thành viên sẽ được ưu tiên xếp cùng lớp. Dùng nút lọc trong giỏ
                                để chọn lớp cấm, ưu tiên hoặc bắt buộc cho cá nhân.
                            </p>
                        </div>
                    ) : (
                        <Textarea
                            value={manualCourseInput}
                            onChange={(event) => setManualCourseInput(event.target.value)}
                            placeholder='CSC10001, MTH00003, PHY00001, hoặc chọn môn tại "Chọn môn & học phí"'
                            className="min-h-28 border-slate-200 focus-visible:ring-[#004A98]/25"
                        />
                    )}
                </div>

                {/* Footer: notice + submit */}
                {/* <div className="bottom-0 -mx-5 -mb-5 flex flex-col gap-3 border-t border-slate-100 bg-white/95 rounded-b-xl px-5 py-4 backdrop-blur sm:-mx-7 sm:-mb-7 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                    {members.length === 1 ? (
                        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                            <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                            <span className="font-medium">Cần ít nhất 2 thành viên để xếp lịch nhóm.</span>
                        </div>
                    ) : (
                        <span className="text-sm text-slate-400">
                            {draftCourseIds.length} môn trong form hiện tại
                        </span>
                    )}
                </div> */}

                {/* <div className="border-t border-slate-100 pt-4">
                    <label className="mb-1 block text-sm font-medium text-slate-700">Gộp từ link nhóm khác</label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                    <Input value={mergeInput} onChange={(event) => setMergeInput(event.target.value)} placeholder="Dán URL hoặc #v1_..." />
                    <Button type="button" variant="outline" onClick={mergeMembersFromLink}>
                        <Link2 className="h-4 w-4" />
                        Gộp link
                    </Button>
                    </div>
                </div> */}
            </section>

            {filterModalCourse && allowedClassesMap && setAllowedClassesMap && (
                <CourseClassFilterModal
                    courseCode={filterModalCourse.id}
                    courseNameVi={filterModalCourse.nameVi}
                    isOpen={!!filterModalCourse}
                    onClose={() => setFilterModalCourse(null)}
                    allowedClassesMap={allowedClassesMap}
                    setAllowedClassesMap={setAllowedClassesMap}
                    classPreferenceMap={personalClassPreferences}
                    setClassPreferenceMap={setPersonalClassPreferences}
                />
            )}

            {showMembersPanel && renderMembersPanel()}
        </div>
    );

    const renderGroupConfigStep = () => (
        <section className="space-y-4">
            
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Ưu tiên tùy chọn</h2>
                    <p className="mt-1 text-sm text-gray-500"></p>
                </div>
                
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex w-full flex-col gap-3 sm:m-2 sm:flex-row sm:items-start sm:justify-between">
                    {/* Phần tiêu đề bên trái */}
                    <div className="flex min-w-0 items-start gap-3 sm:pb-4">
                        <span className="mt-1 h-6 w-[3px] rounded-full bg-[#004A98]" aria-hidden="true" />
                        <div className="min-w-0">
                            <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
                                Cài đặt ưu tiên
                            </h2>
                            <p className="hidden text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400 sm:block">
                                Có thể bỏ qua bước này. Các ưu tiên dưới đây chỉ giúp solver chọn lịch hợp gu nhóm hơn.
                            </p>
                        </div>
                    </div>
                    
                    {/* Button tự động bị đẩy sang phải nhờ justify-between */}
                    <Button 
                        type="button" 
                        disabled={members.length < 2 || solving} 
                        onClick={runGroupSolve} 
                        className="w-full shrink-0 bg-emerald-600 text-white hover:bg-emerald-700 sm:w-auto"
                    >
                        <Calendar className="h-4 w-4" />
                        {solving ? 'Đang xếp lịch...' : 'Xếp lịch nhóm'}
                    </Button>
                </div>
                
                {/* Mobile: 1 cột - Laptop: 2 cột */}
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    {/* Buổi ưu tiên */}
                    <div>
                        <div className="mb-3 flex items-center gap-2">
                            <Sun className="h-4 w-4 text-[#004A98]" />

                            <label className="text-sm font-semibold text-gray-900">
                                Buổi ưu tiên của nhóm
                            </label>
                        </div>

                        <div className="flex rounded-lg bg-gray-100 p-1">
                            {[
                                { id: "0", label: "Tự do", icon: Zap },
                                { id: "1", label: "Sáng", icon: Sun },
                                { id: "2", label: "Chiều", icon: Moon },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() =>
                                        setGroupPrefs((current) => ({
                                            ...current,
                                            session: item.id,
                                        }))
                                    }
                                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-2 text-sm font-medium transition-all ${groupPrefs.session === item.id
                                            ? "bg-white text-[#004A98] shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"
                                        }`}
                                >
                                    <item.icon className="h-4 w-4 shrink-0" />

                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Chiến thuật */}
                    <div>
                        <div className="mb-3 flex items-center gap-2">
                            <Zap className="h-4 w-4 text-[#004A98]" />

                            <label className="text-sm font-semibold text-gray-900">
                                Chiến thuật xếp lịch
                            </label>
                        </div>

                        <div className="flex rounded-lg bg-gray-100 p-1">
                            {[
                                { id: "compress", label: "Dồn lịch" },
                                { id: "spread", label: "Trải đều" },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() =>
                                        setGroupPrefs((current) => ({
                                            ...current,
                                            strategy: item.id,
                                        }))
                                    }
                                    className={`flex-1 rounded-md px-2 py-2 text-sm font-medium transition-all ${groupPrefs.strategy === item.id
                                            ? "bg-white text-[#004A98] shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"
                                        }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Cài đặt nâng cao chiếm toàn chiều ngang */}
                <div className="border-gray-200">
                    <div className="py-4">
                        <div className="mt-4 grid gap-5 border-t border-gray-200 pt-4 lg:grid-cols-2">
                            {/* Tiết trống */}
                            <div>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
                                    Tiết trống nhóm
                                </label>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setGroupPrefs((current) => ({
                                            ...current,
                                            noGaps: !current.noGaps,
                                        }))
                                    }
                                    className={`w-full rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${groupPrefs.noGaps
                                            ? "border-blue-200 bg-blue-50 text-[#004A98]"
                                            : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    {groupPrefs.noGaps
                                        ? "Hạn chế tối đa tiết trống"
                                        : "Cho phép tiết trống"}
                                </button>
                            </div>

                            {/* Ngày nghỉ */}
                            <div>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
                                    Ngày nhóm muốn nghỉ
                                </label>

                                <div className="flex flex-wrap gap-2">
                                    {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                                        const offSession = getDayOffSession(
                                            groupPrefs.daysOff,
                                            day
                                        );

                                        return (
                                            <button
                                                key={day}
                                                type="button"
                                                onClick={() =>
                                                    setGroupPrefs((current) => ({
                                                        ...current,
                                                        daysOff: cycleDayOffSession(
                                                            current.daysOff,
                                                            day
                                                        ),
                                                    }))
                                                }
                                                className={`flex h-12 w-12 flex-col items-center justify-center rounded-lg border text-xs font-bold transition-colors ${offSession === "all"
                                                        ? "border-red-500 bg-red-500 text-white"
                                                        : offSession === "morning"
                                                            ? "border-amber-300 bg-amber-50 text-amber-700"
                                                            : offSession === "afternoon"
                                                                ? "border-orange-300 bg-orange-50 text-orange-700"
                                                                : "border-gray-200 bg-white text-gray-400 hover:border-red-300"
                                                    }`}
                                                title="Bấm lần lượt: nghỉ cả ngày, nghỉ sáng, nghỉ chiều, bỏ chọn"
                                            >
                                                <span>
                                                    {day === 6 ? "CN" : `T${day + 2}`}
                                                </span>

                                                {offSession && (
                                                    <span className="mt-0.5 text-[9px] font-medium leading-none">
                                                        {formatDayOffSession(offSession)}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900"><Settings className="h-4 w-4 text-[#004A98]" />Lớp ưu tiên theo môn chung</h3>
                    <p className="mt-1 text-xs text-gray-500">Ưu tiên nhóm có trọng số cao hơn ưu tiên cá nhân. Lớp bắt buộc sẽ bị phạt rất nặng nếu solver phải chọn lệch.</p>
                </div>
                {groupCourses.length === 0 ? (
                    <div className="ustudy-muted-panel text-sm text-gray-500">Chưa có môn nào trong nhóm.</div>
                ) : (
                    groupCourses.map((course) => (
                        <div key={course.courseId} className="grid gap-3 rounded-lg border border-gray-200 border-l-[3px] border-l-[#004A98] p-3 lg:grid-cols-[350px_minmax(0,1fr)]">
                            <div>
                                <div className="font-mono text-sm font-semibold text-gray-900">{course.courseId}</div>
                                <div className="mt-0.5 text-sm font-medium text-gray-800">{getGroupCourseName(course.courseId)}</div>
                                <div className="text-xs text-gray-500">
                                    Cùng đăng ký: {course.subscribers.map((memberIndex) => members[memberIndex]?.nickname || `Thành viên ${memberIndex + 1}`).join(', ')}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex flex-col gap-2 rounded-lg bg-gray-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex flex-wrap gap-1.5 text-xs">
                                        {(groupPreferredClasses[course.courseId]?.excluded?.length ?? 0) > 0 && <span className="rounded-full bg-rose-100 px-2 py-1 font-medium text-rose-700">{groupPreferredClasses[course.courseId]?.excluded?.length} cấm</span>}
                                        {(groupPreferredClasses[course.courseId]?.preferred?.length ?? 0) > 0 && <span className="rounded-full bg-blue-100 px-2 py-1 font-medium text-[#004A98]">{groupPreferredClasses[course.courseId]?.preferred?.length} ưu tiên</span>}
                                        {(groupPreferredClasses[course.courseId]?.required?.length ?? 0) > 0 && <span className="rounded-full bg-red-100 px-2 py-1 font-medium text-red-700">{groupPreferredClasses[course.courseId]?.required?.length} bắt buộc</span>}
                                        {((groupPreferredClasses[course.courseId]?.excluded?.length ?? 0) + (groupPreferredClasses[course.courseId]?.preferred?.length ?? 0) + (groupPreferredClasses[course.courseId]?.required?.length ?? 0)) === 0 && <span className="text-gray-500">Chưa chọn lớp ưu tiên</span>}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setExpandedClassCourseId((current) => current === course.courseId ? null : course.courseId)}
                                        disabled={(classOptionsByCourse[course.courseId] ?? []).length === 0}
                                    >
                                        {expandedClassCourseId === course.courseId ? 'Ẩn lớp' : 'Chọn lớp ưu tiên'}
                                    </Button>
                                </div>

                                {expandedClassCourseId === course.courseId && (
                                    <div className="gap-2 max-h-80 space-y-2 overflow-y-auto rounded-lg border border-gray-200 bg-white p-2 pr-1">
                                        {(classOptionsByCourse[course.courseId] ?? []).length === 0 ? (
                                            <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-500">
                                                Chưa có dữ liệu lớp cho môn này.
                                            </div>
                                        ) : (
                                            (classOptionsByCourse[course.courseId] ?? []).map((classOption) => {
                                                const selectedLevel = getGroupClassPreferenceLevel(course.courseId, classOption.id);

                                                return (
                                                    <div
                                                        key={classOption.id}
                                                        className={`flex w-full flex-col gap-3 rounded-lg border p-2 text-left transition-colors sm:flex-row sm:items-start sm:justify-between ${selectedLevel === 'excluded' ? 'border-rose-300 bg-rose-50 text-rose-950' : selectedLevel === 'required' ? 'border-red-300 bg-red-50 text-red-950' : selectedLevel === 'preferred' ? 'border-[#004A98] bg-blue-50 text-blue-950' : 'border-gray-200 bg-white text-gray-700'}`}
                                                    >
                                                        <span className="min-w-0 flex-1">
                                                            <span className="block font-mono text-sm font-semibold">{classOption.id.replace(/_/g, ' ')}</span>
                                                            <span className={`mt-1 block text-xs leading-relaxed ${selectedLevel === 'excluded' ? 'text-rose-700' : selectedLevel === 'required' ? 'text-red-700' : selectedLevel === 'preferred' ? 'text-blue-700' : 'text-gray-500'}`}>
                                                                {classOption.schedule.length > 0 ? classOption.schedule.join(', ') : 'Chưa có lịch học'}
                                                            </span>
                                                        </span>
                                                        <span className="grid grid-cols-2 gap-1 rounded-lg bg-white p-1 sm:w-[300px] sm:grid-cols-4">
                                                            {[
                                                                { value: 'excluded' as const, label: 'Cấm' },
                                                                { value: null, label: 'Chọn' },
                                                                { value: 'preferred' as const, label: 'Ưu tiên' },
                                                                { value: 'required' as const, label: 'Bắt buộc' },
                                                            ].map((item) => (
                                                                <button
                                                                    key={item.label}
                                                                    type="button"
                                                                    onClick={() => setGroupClassPreferenceLevel(course.courseId, classOption.id, item.value)}
                                                                    className={`rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${selectedLevel === item.value ? item.value === 'excluded' ? 'bg-rose-600 text-white' : item.value === 'required' ? 'bg-red-600 text-white' : item.value === 'preferred' ? 'bg-[#004A98] text-white' : 'bg-gray-700 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                                                                >
                                                                    {item.label}
                                                                </button>
                                                            ))}
                                                        </span>
                                                    </div>
                                                );
                                            })
                                        )}
                                        {((groupPreferredClasses[course.courseId]?.excluded?.length ?? 0) + (groupPreferredClasses[course.courseId]?.preferred?.length ?? 0) + (groupPreferredClasses[course.courseId]?.required?.length ?? 0)) > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => clearGroupClassPreference(course.courseId)}
                                                className="text-xs font-medium text-gray-500 hover:text-red-600"
                                            >
                                                Bỏ ưu tiên lớp
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );

    const renderResultStep = () => (
        <section className="ustudy-card p-4 sm:p-5">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Kết quả xếp lịch nhóm</h2>
                    <p className="mt-1 text-sm text-gray-500">{result?.solutions.length || 0} phương án khả dụng.</p>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                    {selectedOption && (
                        <button
                            type="button"
                            onClick={() => setShowSaveGroupScheduleModal(true)}
                            className="ustudy-button-normal"
                        >
                            <Save className="h-4 w-4" />
                            <span className="hidden sm:inline">Lưu lịch</span>
                        </button>
                    )}

                    <button
                        onClick={() => {
                            setSavedSchedules(readFromStorage<SavedSchedule[]>(STORAGE_KEYS.SAVED_SCHEDULES, []));
                            setShowListModal(true);
                        }}
                        className="ustudy-button-normal"
                    >
                        <List className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">Lịch đã lưu</span>
                        {savedSchedules.length > 0 && (
                            <span className="ustudy-badge-count text-[10px] font-bold">
                                {savedSchedules.length}
                            </span>
                        )}
                    </button>

                    {/* <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button type="button" className="ustudy-action-icon h-9 w-9 shrink-0 border border-gray-200 bg-white shadow-sm">
                                <MoreHorizontal className="h-5 w-5 text-gray-600" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="z-[100] w-52 bg-white">
                            <DropdownMenuItem onClick={() => setActiveStep(2)}>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Chỉnh ưu tiên</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu> */}
                </div>
            </div>

            <GroupScheduleResultViewTabs
                value={showGroupCalendarPreview ? 'calendar' : resultViewMode}
                onChange={(view) => {
                    if (view === 'calendar') {
                        setShowGroupCalendarPreview(true);
                        return;
                    }

                    setShowGroupCalendarPreview(false);
                    setResultViewMode(view);
                }}
            />

            {result?.warnings.length ? (
                <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    {result.warnings.map((warning) => (
                        <div key={warning}>{warning}</div>
                    ))}
                </div>
            ) : null}



            {result?.solutions.length ? (
                showGroupCalendarPreview ? (
                    <GroupScheduleCalendarPreview
                        options={result.solutions}
                        activeOptionIndex={activeResultIndex}
                        activeMemberIndex={activePreviewMemberIndex}
                        setActiveOptionIndex={(index) => {
                            setActiveResultIndex(index);
                        }}
                        setActiveMemberIndex={setActivePreviewMemberIndex}
                        onOpenClassDetails={setOpenClassDetails}
                    />
                ) : (
                    <>
                        <ScheduleOptionSelector
                            className="mb-4 border-b border-gray-200 pb-3"
                            options={result.solutions.map((option) => ({ id: option.option, label: `PA ${option.option}` }))}
                            activeIndex={activeResultIndex}
                            onChange={setActiveResultIndex}
                        />


                        {selectedOption && <GroupScheduleResult option={selectedOption} viewMode={resultViewMode} onOpenClassDetails={setOpenClassDetails} />}
                    </>
                )
            ) : (
                <div className="rounded-md bg-gray-50 p-4 text-sm text-gray-500">Chưa có kết quả. Hãy chạy xếp lịch trước.</div>
            )}

            <OpenClassDetailDialog target={openClassDetails} onOpenChange={(open) => { if (!open) setOpenClassDetails(null); }} />

            {showSaveGroupScheduleModal && selectedOption && (
                <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
                    <div className="w-full overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-w-lg sm:rounded-2xl">
                        <div className="flex items-center justify-between border-b border-gray-100 p-4 md:p-5">
                            <h3 className="flex items-center gap-2 text-base font-bold text-gray-900">
                                <Save className="h-4 w-4 text-emerald-600" />
                                Lưu lịch nhóm
                            </h3>
                            <button type="button" onClick={() => setShowSaveGroupScheduleModal(false)} className="rounded-full p-1 transition-colors hover:bg-gray-100">
                                <X className="h-5 w-5 text-gray-400" />
                            </button>
                        </div>
                        <div className="p-4 md:p-6">
                            <label className="mb-2 block text-sm font-bold text-gray-700">Tên gợi nhớ cho lịch này</label>
                            <input
                                autoFocus
                                type="text"
                                value={groupScheduleName}
                                onChange={(event) => setGroupScheduleName(event.target.value)}
                                placeholder={`VD: Nhóm - PA ${selectedOption.option}`}
                                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                                onKeyDown={(event) => event.key === 'Enter' && saveSelectedGroupSchedule()}
                            />
                            <p className="mt-3 text-xs italic text-gray-400">
                                Lưu toàn bộ thành viên trong phương án hiện tại. Khi mở lại ở tab lịch dự kiến, bạn có thể chuyển qua lại giữa các thành viên.
                            </p>
                        </div>
                        <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 p-4 md:p-5">
                            <button type="button" onClick={() => setShowSaveGroupScheduleModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-800">
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={saveSelectedGroupSchedule}
                                disabled={!groupScheduleName.trim()}
                                className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow transition-all hover:bg-emerald-700 disabled:opacity-50"
                            >
                                Xác nhận lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <SavedSchedulesModal
                isOpen={showListModal}
                onClose={() => setShowListModal(false)}
                savedSchedules={savedSchedules}
                onLoadSchedule={handleLoadSchedule}
                onDeleteSchedule={handleDeleteSchedule}
            />
        </section>
    );

    return (
        <div className={embedded ? 'space-y-4 pb-20 md:pb-4' : 'mx-auto max-w-6xl space-y-4 pb-20 md:pb-4'}>
            {!embedded && (
                <PageHeader
                    title="Xếp lịch nhóm"
                    description="Mời bạn bè, bấm xếp lịch, rồi chọn phương án phù hợp nhất cho cả nhóm."
                />
            )}

            {renderStepper()}

            {decodeError && (
                <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{decodeError} Nếu link không hoạt động, hãy copy toàn bộ URL vào trình duyệt.</span>
                </div>
            )}

            {(solveError || localNotice) && (
                <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{solveError || localNotice}</span>
                </div>
            )}

            {activeStep === 1 && renderMemberStep()}
            {activeStep === 2 && renderGroupConfigStep()}
            {activeStep === 3 && renderResultStep()}
        </div>
    );
}

export default GroupSchedulePage;
