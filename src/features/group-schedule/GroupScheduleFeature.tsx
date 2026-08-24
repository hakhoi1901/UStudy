import { useEffect, useMemo, useState, Fragment } from 'react';
import { AlertTriangle, Calendar, Check, Moon, Save, Settings, Sun, X, Zap, List } from 'lucide-react';

import { GroupMemberRosterEditor, type GroupRosterCourse } from './components/GroupMemberRosterEditor';
import { buildSavedGroupSchedule, GroupScheduleCalendarPreview } from './components/GroupScheduleCalendarPreview';
import { GroupScheduleResult, type GroupScheduleResultViewMode } from './components/GroupScheduleResult';
import { GroupScheduleResultViewTabs } from './components/GroupScheduleResultViewTabs';
import { CourseSharingEditor } from './components/CourseSharingEditor';
import { GroupScheduleComparison } from './components/GroupScheduleComparison';
import { SavedSchedulesModal } from './components/SavedSchedulesModal';
import { Button } from '../../components/ui/form/button';
import { AppSelect } from '../../components/ui/form';
import { PageHeader } from '../../components/layout/page-header';
import { buildDensityMap } from './services/group-scheduler';
import type { ClassPreferenceLevel, ClassPreferenceSelection, CourseSharingMap, GroupMemberToken } from './types';
import { parseCourseInput, useGroupScheduler } from './hooks/use-group-scheduler';
import { readFromStorage, saveToStorage } from '../../helpers/localStorage/save';
import { STORAGE_KEYS } from '../../config';
import type { Course, SavedSchedule } from '../../types';
import type { SolverPreferences } from '../study-roadmap';
import courseDbJson from '../../logic/scheduler/Course_db.json';
import { cycleDayOffSession, formatDayOffSession, formatDaysOff, getDayOffSession } from '../../utils/dayOffPreferences';
import { OpenClassDetailDialog, type OpenClassDetailTarget } from '../../components/course';
import { ScheduleOptionSelector } from '../schedule';
import { AppDialog } from '../../components/ui/overlays/app-dialog';

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
    selectedCourseIds?: Set<string>;
    allCourses?: Course[];
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
        id: globalThis.crypto?.randomUUID?.() ?? `member-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        nickname: '',
        sharedCourses: [],
        personalCourses: [],
        busyMask: [],
    };
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
        stored.forEach(item => {
            const existing = mergedMap.get(item.id);
            if (existing && (!item.classes || item.classes.length === 0) && existing.classes && existing.classes.length > 0) {
                item.classes = existing.classes;
            }
            mergedMap.set(item.id, item);
        });
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
    selectedCourseIds,
    allCourses = [],
    onRemoveSelectedCourse,
    embedded = false,
    modeSwitch,
}: GroupSchedulePageProps) {
    const {
        members,
        decodeError,
        solving,
        result,
        solveError,
        validationIssues,
        importedShareConfig,
        availableCourses,
        setMembersFromURL,
        addMember,
        replaceMembers,
        solve,
        validateConfiguration,
        setShareConfig,
        analyzeTradeoff,
        clearResult,
        setResult,
    } = useGroupScheduler();

    const savedUIState = useMemo(() => {
        return readFromStorage(STORAGE_KEYS.GROUP_SCHEDULE_UI_STATE, {
            activeStep: 1 as GroupScheduleStep,
            resultViewMode: 'course' as GroupScheduleResultViewMode,
            isAdvancedOpen: false,
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
    const [newMemberNickname, setNewMemberNickname] = useState('');
    const [manualCourseInput, setManualCourseInput] = useState('');
    const [localNotice, setLocalNotice] = useState<string | null>(null);

    const [showListModal, setShowListModal] = useState(false);
    const [savedSchedules, setSavedSchedules] = useState<SavedSchedule[]>(() => {
        return readFromStorage<SavedSchedule[]>(STORAGE_KEYS.SAVED_SCHEDULES, []);
    });
    const [groupPreferredClasses, setGroupPreferredClasses] = useState<Record<string, ClassPreferenceSelection>>(() => {
        return readFromStorage<Record<string, ClassPreferenceSelection>>(STORAGE_KEYS.GROUP_SCHEDULER_CLASS_PREFERENCES, {});
    });
    const [courseSharing, setCourseSharing] = useState<CourseSharingMap>(() => {
        return readFromStorage<CourseSharingMap>(STORAGE_KEYS.GROUP_SCHEDULER_COURSE_SHARING, {});
    });
    const [groupPrefs, setGroupPrefs] = useState<SolverPreferences>(() => readFromStorage<SolverPreferences>(STORAGE_KEYS.SOLVER_PREFERENCES, defaultSolverPreferences));
    const [classPreferenceTargetByCourse, setClassPreferenceTargetByCourse] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!importedShareConfig) return;
        if (importedShareConfig.groupPreferredClasses) setGroupPreferredClasses(importedShareConfig.groupPreferredClasses as Record<string, ClassPreferenceSelection>);
        if (importedShareConfig.courseSharing) setCourseSharing(importedShareConfig.courseSharing);
        if (importedShareConfig.groupPreferences) setGroupPrefs((current) => ({ ...current, ...importedShareConfig.groupPreferences }));
    }, [importedShareConfig]);
    
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.GROUP_SCHEDULER_CLASS_PREFERENCES, groupPreferredClasses);
    }, [groupPreferredClasses]);
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.GROUP_SCHEDULER_COURSE_SHARING, courseSharing);
    }, [courseSharing]);
    useEffect(() => {
        setShareConfig({
            groupPreferredClasses,
            courseSharing,
            groupPreferences: groupPrefs,
        });
    }, [courseSharing, groupPreferredClasses, groupPrefs, setShareConfig]);
    const [expandedClassCourseId, setExpandedClassCourseId] = useState<string | null>(null);
    const [isAdvancedOpen] = useState(savedUIState.isAdvancedOpen);
    const [editingMemberIndex, setEditingMemberIndex] = useState<number | null>(null);
    const [openClassDetails, setOpenClassDetails] = useState<OpenClassDetailTarget | null>(null);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.GROUP_SCHEDULE_UI_STATE, {
            activeStep,
            resultViewMode,
            isAdvancedOpen,
            showGroupCalendarPreview,
        });
    }, [activeStep, resultViewMode, isAdvancedOpen, showGroupCalendarPreview]);

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
    const groupCourseIds = useMemo(() => {
        const courseIds = new Set<string>([
            ...basketCourses.map(getCourseCode),
            ...parseCourseInput(manualCourseInput),
        ]);
        members.forEach((member) => {
            [...member.sharedCourses, ...member.personalCourses].forEach((courseId) => courseIds.add(courseId));
        });
        return Array.from(courseIds);
    }, [basketCourses, manualCourseInput, members]);
    const rosterCourses = useMemo<GroupRosterCourse[]>(() => {
        const coursesById = new Map<string, Course>();
        allCourses.forEach((course) => {
            coursesById.set(getCourseCode(course), course);
            coursesById.set(course.id.toUpperCase(), course);
        });
        return groupCourseIds.map((courseId) => {
            const course = coursesById.get(courseId);
            return {
                id: courseId,
                name: course?.nameVi || course?.name || 'Môn chưa có tên trong dữ liệu',
                credits: course?.credits,
            };
        });
    }, [allCourses, groupCourseIds]);

    const groupCourses = useMemo(() => buildDensityMap(members), [members]);
    const classOptionsByCourse = useMemo(() => loadClassOptionsByCourse(), []);
    const selectedOption = result?.solutions[activeResultIndex] ?? result?.solutions[0];

    const addRosterMember = () => {
        if (groupCourseIds.length === 0) {
            setLocalNotice('Hãy chọn hoặc nhập ít nhất một môn trước khi thêm thành viên.');
            return;
        }

        const unknownCourses = groupCourseIds.filter((course) => knownCourseIds.size > 0 && !knownCourseIds.has(course));
        setLocalNotice(unknownCourses.length > 0 ? `Các môn chưa có trong dữ liệu lớp học: ${unknownCourses.join(', ')}.` : null);
        if (addMember({
            ...makeDraft(),
            nickname: newMemberNickname,
            personalCourses: groupCourseIds,
        })) {
            setNewMemberNickname('');
        }
    };

    const updateCourseParticipants = (courseId: string, participantIndexes: number[]) => {
        const participants = new Set(participantIndexes);
        replaceMembers(members.map((member, memberIndex) => {
            const sharedCourses = member.sharedCourses.filter((id) => id !== courseId);
            const personalCourses = member.personalCourses.filter((id) => id !== courseId);
            if (participants.has(memberIndex)) personalCourses.push(courseId);
            return { ...member, sharedCourses, personalCourses };
        }));
        clearResult();
    };

    const removeCourseFromGroup = (courseId: string) => {
        updateCourseParticipants(courseId, []);
        onRemoveSelectedCourse?.(courseId);
        setManualCourseInput((current) => parseCourseInput(current).filter((id) => id !== courseId).join(', '));
    };

    const removeMember = (index: number) => {
        setCourseSharing((current) => Object.fromEntries(
            Object.entries(current).map(([courseId, rule]) => [
                courseId,
                {
                    ...rule,
                    groups: rule.groups?.map((group) => group
                        .filter((memberIndex) => memberIndex !== index)
                        .map((memberIndex) => memberIndex > index ? memberIndex - 1 : memberIndex)),
                },
            ]),
        ));
        replaceMembers(members.filter((_, memberIndex) => memberIndex !== index));
        clearResult();
    };

    const getClassPreferenceTargets = (courseId: string, subscribers: number[]) => {
        const rule = courseSharing[courseId];
        const targets = [{ id: 'global', name: 'Toàn bộ môn' }];
        if (rule?.mode === 'independent') {
            return [...targets, ...subscribers.map((memberIndex) => ({ id: `member-${memberIndex}`, name: members[memberIndex]?.nickname || `Thành viên ${memberIndex + 1}` }))];
        }
        if (!rule?.groups) return [...targets, { id: 'all', name: 'Nhóm học chung' }];
        rule.groups.forEach((group, groupIndex) => {
            if (group.some((memberIndex) => subscribers.includes(memberIndex))) targets.push({ id: `group-${groupIndex}`, name: `Nhóm ${groupIndex + 1}` });
        });
        subscribers.filter((memberIndex) => !rule.groups?.some((group) => group.includes(memberIndex))).forEach((memberIndex) => targets.push({ id: `member-${memberIndex}`, name: members[memberIndex]?.nickname || `Học riêng ${memberIndex + 1}` }));
        return targets;
    };

    const getTargetSelection = (courseId: string): ClassPreferenceSelection | undefined => {
        const target = classPreferenceTargetByCourse[courseId] ?? 'global';
        return target === 'global' ? groupPreferredClasses[courseId] : courseSharing[courseId]?.groupClassPreferences?.[target];
    };

    const getGroupClassPreferenceLevel = (courseId: string, classId: string): ClassPreferenceLevel | null => {
        const selection = getTargetSelection(courseId);
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
        const target = classPreferenceTargetByCourse[courseId] ?? 'global';
        const updateSelection = (currentSelection?: ClassPreferenceSelection): ClassPreferenceSelection | undefined => {
            const excluded = new Set(currentSelection?.excluded ?? []);
            const preferred = new Set(currentSelection?.preferred ?? []);
            const required = new Set(currentSelection?.required ?? []);
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
                return undefined;
            }
            return nextSelection;
        };
        if (target === 'global') {
            setGroupPreferredClasses((current) => {
                const next = updateSelection(current[courseId]);
                if (!next) {
                    const { [courseId]: _removed, ...rest } = current;
                    return rest;
                }
                return { ...current, [courseId]: next };
            });
            return;
        }
        setCourseSharing((current) => {
            const rule = current[courseId] ?? { mode: 'required' as const };
            const next = updateSelection(rule.groupClassPreferences?.[target]);
            const groupClassPreferences = { ...(rule.groupClassPreferences ?? {}) };
            if (next) groupClassPreferences[target] = next;
            else delete groupClassPreferences[target];
            return { ...current, [courseId]: { ...rule, groupClassPreferences } };
        });
    };

    const clearGroupClassPreference = (courseId: string) => {
        const target = classPreferenceTargetByCourse[courseId] ?? 'global';
        if (target !== 'global') {
            setCourseSharing((current) => {
                const rule = current[courseId];
                if (!rule) return current;
                const groupClassPreferences = { ...(rule.groupClassPreferences ?? {}) };
                delete groupClassPreferences[target];
                return { ...current, [courseId]: { ...rule, groupClassPreferences } };
            });
            return;
        }
        setGroupPreferredClasses((current) => {
            const { [courseId]: _removed, ...rest } = current;
            return rest;
        });
    };

    const runGroupSolve = () => {
        const config = { ...groupPrefs, groupPreferredClasses, courseSharing };
        const issues = validateConfiguration(config);
        if (issues.some((issue) => issue.severity === 'error')) {
            setActiveStep(2);
            return;
        }
        setActiveStep(3);
        setShowGroupCalendarPreview(true);
        solve(config);
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


    const editingMember = editingMemberIndex === null ? null : members[editingMemberIndex] ?? null;

    const updateEditingMember = (updater: (member: GroupMemberToken) => GroupMemberToken) => {
        if (editingMemberIndex === null) return;
        replaceMembers(members.map((member, index) => index === editingMemberIndex ? updater(member) : member));
        clearResult();
    };

    const renderMemberSettingsDialog = () => {
        if (!editingMember || editingMemberIndex === null) return null;
        const nickname = editingMember.nickname || `Thành viên ${editingMemberIndex + 1}`;
        return (
            <AppDialog
                open
                onOpenChange={(open) => !open && setEditingMemberIndex(null)}
                title={`Tùy chỉnh ${nickname}`}
                description="Thiết lập riêng này chỉ ảnh hưởng lịch của thành viên đã chọn."
                icon={Settings}
                size="sm"
                footer={<Button type="button" onClick={() => setEditingMemberIndex(null)} className="w-full bg-[#004A98] text-white hover:bg-[#003d7a] sm:w-auto">Xong</Button>}
            >
                <div>
                    <label className="text-sm font-semibold text-slate-800">Nickname</label>
                    <input
                        value={editingMember.nickname || ''}
                        onChange={(event) => updateEditingMember((member) => ({ ...member, nickname: event.target.value }))}
                        className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#004A98] focus:ring-2 focus:ring-[#004A98]/20"
                        placeholder={`Thành viên ${editingMemberIndex + 1}`}
                    />
                </div>
                <div className="border-t border-slate-100 pt-4">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-800">Ngày không muốn học</h3>
                            <p className="mt-1 text-xs text-slate-500">Solver sẽ trừ điểm mạnh cho lịch rơi vào các buổi này.</p>
                        </div>
                        <span className="shrink-0 text-xs font-medium text-slate-400">{formatDaysOff(editingMember.personalConfig?.daysOff)}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                            const offSession = getDayOffSession(editingMember.personalConfig?.daysOff, day);
                            return (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => updateEditingMember((member) => ({
                                        ...member,
                                        personalConfig: {
                                            ...member.personalConfig,
                                            daysOff: cycleDayOffSession(member.personalConfig?.daysOff, day),
                                        },
                                    }))}
                                    className={`flex h-10 min-w-10 flex-col items-center justify-center rounded-lg border px-2 text-xs font-semibold transition-colors ${offSession === 'all'
                                        ? 'border-[#004A98] bg-blue-50 text-[#004A98]'
                                        : offSession === 'morning' || offSession === 'afternoon'
                                            ? 'border-blue-200 bg-blue-50/50 text-[#004A98]'
                                            : 'border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:bg-blue-50/40'
                                    }`}
                                    title="Bấm lần lượt: cả ngày, sáng, chiều, bỏ chọn"
                                >
                                    <span>{day === 6 ? 'CN' : `T${day + 2}`}</span>
                                    {offSession && <span className="mt-0.5 text-[9px] font-medium leading-none">{formatDayOffSession(offSession)}</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </AppDialog>
        );
    };

    const renderMemberStep = () => (
        <div className="space-y-4">
            <GroupMemberRosterEditor
                members={members}
                courses={rosterCourses}
                nickname={newMemberNickname}
                onNicknameChange={setNewMemberNickname}
                manualCourseInput={manualCourseInput}
                onManualCourseInputChange={setManualCourseInput}
                onAddMember={addRosterMember}
                onRemoveMember={removeMember}
                onRemoveCourse={removeCourseFromGroup}
                onUpdateCourseParticipants={updateCourseParticipants}
                onOpenMemberSettings={setEditingMemberIndex}
            />
            {localNotice && <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">{localNotice}</p>}
            {renderMemberSettingsDialog()}
        </div>
    );
    const renderGroupConfigStep = () => (
        <section className="space-y-4">
            
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Ưu tiên tùy chọn</h2>
                    <p className="mt-1 text-sm text-gray-500">Các thiết lập hiện tại được gửi kèm khi bạn chia sẻ link nhóm.</p>
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
                        {solving ? 'Đang xếp lịch...' : result?.solutions.length ? 'Tạo phương án mới' : 'Xếp lịch nhóm'}
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

            {validationIssues.length > 0 ? (
                <div className="overflow-hidden rounded-xl border border-amber-200 bg-amber-50">
                    <div className="flex items-start gap-2 px-4 py-3"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" /><div><p className="text-sm font-semibold text-amber-950">Kiểm tra cấu hình trước khi xếp</p><p className="mt-0.5 text-xs text-amber-800">Các lý do dưới đây được đối chiếu trực tiếp với lớp mở, lịch bận và bộ lọc hiện tại.</p></div></div>
                    <div className="divide-y divide-amber-200 border-t border-amber-200 bg-white/70">
                        {validationIssues.map((issue) => <details key={issue.id} className="group px-4 py-2.5"><summary className="cursor-pointer list-none text-sm font-medium text-gray-900">{issue.severity === 'error' ? 'Không thể xếp' : 'Có thể phải tách nhóm'} · {issue.title}</summary><p className="mt-1 text-xs text-gray-600">{issue.description}</p>{issue.rejectedClasses?.length ? <div className="mt-2 space-y-1 text-xs text-gray-500">{issue.rejectedClasses.map((entry) => <p key={entry.classId}><span className="font-mono font-medium text-gray-700">{entry.classId}:</span> {entry.reasons.join('; ')}</p>)}</div> : null}</details>)}
                    </div>
                </div>
            ) : null}

            <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900"><Settings className="h-4 w-4 text-[#004A98]" />Ưu tiên theo môn</h3>
                    <p className="mt-1 text-xs text-gray-500">Đặt lớp ưu tiên hoặc bắt buộc, sau đó chọn các thành viên cần học cùng nhau.</p>
                </div>
                {groupCourses.length === 0 ? (
                    <div className="ustudy-muted-panel text-sm text-gray-500">Chưa có môn nào trong nhóm.</div>
                ) : (
                    groupCourses.map((course) => {
                        const targetSelection = getTargetSelection(course.courseId);
                        const preferenceTargets = getClassPreferenceTargets(course.courseId, course.subscribers);
                        return (
                        <div key={course.courseId} className="grid gap-3 rounded-lg border border-gray-200 border-l-[3px] border-l-[#004A98] p-3 lg:grid-cols-[320px_minmax(0,1fr)]">
                            <div>
                                <div className="font-mono text-sm font-semibold text-gray-900">{course.courseId}</div>
                                <div className="mt-0.5 text-sm font-medium text-gray-800">{getGroupCourseName(course.courseId)}</div>
                                <div className="mt-1 space-y-1.5 text-xs text-gray-500">
                                    {(() => {
                                        const rule = courseSharing[course.courseId];
                                        const isCustomGrouping = rule?.mode !== 'independent' && rule?.groups !== undefined;
                                        if (!isCustomGrouping) {
                                            return <div>Cùng đăng ký: {course.subscribers.map((memberIndex) => members[memberIndex]?.nickname || `Thành viên ${memberIndex + 1}`).join(', ')}</div>;
                                        }

                                        const groups = rule.groups ?? [];
                                        const soloMembers = course.subscribers.filter((memberIndex) => !groups.some((group) => group.includes(memberIndex)));

                                        return (
                                            <>
                                                {groups.map((group, groupIndex) => {
                                                    if (!group.length) return null;
                                                    const prefs = rule.groupClassPreferences?.[`group-${groupIndex}`];
                                                    return (
                                                        <div key={groupIndex}>
                                                            <div className="font-medium text-gray-700">Nhóm {groupIndex + 1}: <span className="font-normal text-gray-500">{group.map((memberIndex) => members[memberIndex]?.nickname || `Thành viên ${memberIndex + 1}`).join(', ')}</span></div>
                                                            {prefs?.excluded?.length ? <div className="text-[11px] text-rose-600">+ Cấm: {prefs.excluded.map(c => c.replace(/_/g, ' ')).join(', ')}</div> : null}
                                                            {prefs?.required?.length ? <div className="text-[11px] text-red-600">+ Bắt buộc: {prefs.required.map(c => c.replace(/_/g, ' ')).join(', ')}</div> : null}
                                                            {prefs?.preferred?.length ? <div className="text-[11px] text-[#004A98]">+ Ưu tiên: {prefs.preferred.map(c => c.replace(/_/g, ' ')).join(', ')}</div> : null}
                                                        </div>
                                                    );
                                                })}
                                                {soloMembers.length > 0 && (
                                                    <div>
                                                        <div className="font-medium text-gray-700">Học riêng: <span className="font-normal text-gray-500">{soloMembers.map((memberIndex) => members[memberIndex]?.nickname || `Thành viên ${memberIndex + 1}`).join(', ')}</span></div>
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex flex-col gap-2 rounded-lg bg-gray-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex flex-wrap gap-1.5 text-xs">
                                        {(targetSelection?.excluded?.length ?? 0) > 0 && <span className="rounded-full bg-rose-100 px-2 py-1 font-medium text-rose-700">{targetSelection?.excluded?.length} cấm</span>}
                                        {(targetSelection?.preferred?.length ?? 0) > 0 && <span className="rounded-full bg-blue-100 px-2 py-1 font-medium text-[#004A98]">{targetSelection?.preferred?.length} ưu tiên</span>}
                                        {(targetSelection?.required?.length ?? 0) > 0 && <span className="rounded-full bg-red-100 px-2 py-1 font-medium text-red-700">{targetSelection?.required?.length} bắt buộc</span>}
                                        {((targetSelection?.excluded?.length ?? 0) + (targetSelection?.preferred?.length ?? 0) + (targetSelection?.required?.length ?? 0)) === 0 && <span className="text-gray-500">Chưa chọn lớp ưu tiên</span>}
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
                                        <div className="sticky top-0 z-10 flex items-center justify-between gap-2 bg-white pb-1">
                                            <span className="text-xs font-medium text-gray-500">Áp dụng cho</span>
                                            <AppSelect value={classPreferenceTargetByCourse[course.courseId] ?? 'global'} onChange={(value) => setClassPreferenceTargetByCourse((current) => ({ ...current, [course.courseId]: value }))} options={preferenceTargets} ariaLabel={`Chọn nhóm áp dụng ưu tiên lớp cho ${course.courseId}`} className="w-44" triggerClassName="h-8 px-2.5 text-xs" menuClassName="right-0 left-auto w-48" />
                                        </div>
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
                                        {((targetSelection?.excluded?.length ?? 0) + (targetSelection?.preferred?.length ?? 0) + (targetSelection?.required?.length ?? 0)) > 0 && (
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
                                {course.subscribers.length >= 2 ? (
                                    <CourseSharingEditor
                                        courseId={course.courseId}
                                        subscribers={course.subscribers}
                                        members={members}
                                        value={courseSharing[course.courseId]}
                                        onChange={(nextRule) => {
                                            setCourseSharing((current) => ({ ...current, [course.courseId]: nextRule }));
                                            setClassPreferenceTargetByCourse((current) => ({ ...current, [course.courseId]: 'global' }));
                                        }}
                                    />
                                ) : null}
                            </div>
                        </div>
                    );})
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
                    <button type="button" onClick={() => setActiveStep(2)} className="ustudy-button-normal"><Settings className="h-4 w-4" /><span className="hidden sm:inline">Chỉnh cấu hình</span></button>
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


                        {selectedOption && (
                            <GroupScheduleResult
                                option={selectedOption}
                                viewMode={resultViewMode}
                                onOpenClassDetails={setOpenClassDetails}
                                onAnalyzeTradeoff={(tradeoff) => analyzeTradeoff(selectedOption, tradeoff, { ...groupPrefs, groupPreferredClasses, courseSharing })}
                            />
                        )}
                    </>
                )
            ) : (
                <div className="rounded-md bg-gray-50 p-4 text-sm text-gray-500">Chưa có kết quả. Hãy chạy xếp lịch trước.</div>
            )}

            {result?.solutions.length ? <div className="mt-4"><GroupScheduleComparison options={result.solutions} activeIndex={activeResultIndex} /></div> : null}

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
