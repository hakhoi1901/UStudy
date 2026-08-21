import {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  type MutableRefObject,
} from 'react';
import { Calendar, PanelLeftOpen } from 'lucide-react';
import type { Course, ClassSection } from '../../../types';
import type { SolverPreferences, ScheduleOption } from '../hooks/use-schedule-solver';
import { useScheduleDraft } from '../hooks/use-schedule-draft';
import { useConflictValidator } from '../hooks/use-conflict-validator';
import { CourseSidebar } from './CourseSidebar';
import { BuilderGrid } from './BuilderGrid';
import { BuilderToolbar } from './BuilderToolbar';
import { ScheduleOptionSelector } from '../../schedule/components/ScheduleOptionSelector';
import type { Tab } from '../types';

// ─── Props ──────────────────────────────────────────────────────────────────

interface ScheduleBuilderProps {
  selectedCourses: Set<string>;
  allCurrentCourses: Course[];
  registeredSections?: ClassSection[];
  solve: (courses: Course[], allowedClassesMap: Record<string, string[]>, prefs?: SolverPreferences) => void;
  solving: boolean;
  solverError: string | null;
  options: ScheduleOption[];
  activeOption: number;
  setActiveOption: (index: number) => void;
  currentSections: ClassSection[];
  allowedClassesMap: Record<string, string[]>;
  setAllowedClassesMap: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  prefs: SolverPreferences;
  savedSchedulesCount: number;
  setActiveTab: (tab: Tab) => void;
  onOpenConfig: () => void;
  onOpenSavedList: () => void;
  onOpenSaveModal: () => void;
  onClearSolver: () => void;
  onDraftSectionsChange: (sections: ClassSection[]) => void;
  showToolbar?: boolean;
  onDraftStateChange?: (hasSelections: boolean) => void;
  clearDraftRef?: MutableRefObject<(() => void) | null>;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function ScheduleBuilder({
  selectedCourses,
  allCurrentCourses,
  registeredSections = [],
  solve,
  solving,
  solverError,
  options,
  activeOption,
  setActiveOption,
  currentSections,
  allowedClassesMap,
  setAllowedClassesMap,
  prefs,
  savedSchedulesCount,
  setActiveTab,
  onOpenConfig,
  onOpenSavedList,
  onOpenSaveModal,
  onClearSolver,
  onDraftSectionsChange,
  showToolbar = true,
  onDraftStateChange,
  clearDraftRef,
}: ScheduleBuilderProps) {
  const draft = useScheduleDraft();
  const displaySections = useMemo(
    () => [...registeredSections, ...draft.allSections],
    [registeredSections, draft.allSections],
  );
  const { conflicts } = useConflictValidator(draft.selections, displaySections);
  const [focusedCourseCode, setFocusedCourseCode] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleFullSolve = useCallback(() => {
    const coursesToSchedule = Array.from(selectedCourses)
      .map(id => allCurrentCourses.find(c => c.id === id || c.code === id))
      .filter((c): c is Course => !!c);
    solve(coursesToSchedule, allowedClassesMap, prefs);
  }, [selectedCourses, allCurrentCourses, solve, allowedClassesMap, prefs]);

  const selectedCoursesKey = useMemo(
    () => Array.from(selectedCourses).sort().join('|'),
    [selectedCourses]
  );

  const previousSelectedCoursesKey = useRef(selectedCoursesKey);

  useEffect(() => {
    draft.pruneSelections(
      selectedCourses,
      allCurrentCourses
    );
  }, [
    selectedCoursesKey,
    allCurrentCourses,
    draft.pruneSelections,
  ]);

  useEffect(() => {
    if (
      previousSelectedCoursesKey.current ===
      selectedCoursesKey
    ) {
      return;
    }

    previousSelectedCoursesKey.current =
      selectedCoursesKey;

    onClearSolver();
  }, [
    selectedCoursesKey,
    onClearSolver,
  ]);

  // Import solver results when they arrive
  useEffect(() => {
    if (currentSections.length === 0) return;

    draft.importSolverResult(
      currentSections,
      selectedCourses,
      allCurrentCourses
    );
  }, [
    currentSections,
    activeOption,
    selectedCoursesKey,
    allCurrentCourses,
    draft.importSolverResult,
  ]);

  // Notify parent of draft sections for save/export
  const draftSections = draft.allSections;

  useEffect(() => {
    onDraftSectionsChange(draftSections);
  }, [draftSections, onDraftSectionsChange]);

  // Hybrid solve: keep locked classes, fill the rest
  const handleHybridSolve = useCallback(() => {
    // 1. Hard Constraints (Locked)
    const lockedConstraints = draft.getLockedConstraints();
    const hybridAllowedMap = { ...allowedClassesMap };
    for (const constraint of lockedConstraints) {
      hybridAllowedMap[constraint.courseCode] = [constraint.classId];
    }

    // 2. Soft Constraints (Manual unlocked selections)
    const preferredAllowedMap: Record<string, string> = {};
    for (const s of draft.selections) {
      if (!s.locked && s.source === 'manual') {
        preferredAllowedMap[s.courseCode] = s.classId;
      }
    }

    const coursesToSchedule = Array.from(selectedCourses)
      .map(id => allCurrentCourses.find(c => c.id === id || c.code === id))
      .filter((c): c is Course => !!c);

    solve(coursesToSchedule, hybridAllowedMap, { ...prefs, preferredClassesMap: preferredAllowedMap });
  }, [draft, selectedCourses, allCurrentCourses, solve, allowedClassesMap, prefs]);

  const handleSelectClass = useCallback((courseCode: string, classId: string) => {
    draft.selectClass(courseCode, classId, allCurrentCourses);
  }, [draft, allCurrentCourses]);

  const handleToggleAllowedClass = useCallback((courseCode: string, classId: string, classIds: string[]) => {
    setAllowedClassesMap((current) => {
      const allowed = new Set(current[courseCode] ?? classIds);
      if (allowed.has(classId)) allowed.delete(classId);
      else allowed.add(classId);
      return { ...current, [courseCode]: Array.from(allowed) };
    });
  }, [setAllowedClassesMap]);

  const handleClickSection = useCallback((courseCode: string) => {
    setFocusedCourseCode(courseCode);
  }, []);

  const totalCredits = useMemo(() => {
    const scheduledCodes = new Set(draft.selections.map(s => s.courseCode));
    return allCurrentCourses
      .filter(c => scheduledCodes.has(c.id) || scheduledCodes.has(c.code))
      .reduce((sum, c) => sum + (c.credits ?? 0), 0);
  }, [draft.selections, allCurrentCourses]);

  const unfilledCount =
    draft.getUnfilledCourses(
      selectedCourses,
      allCurrentCourses
    ).length;

  const handleClear = useCallback(() => {
    draft.clearDraft();
    onClearSolver();
  }, [draft, onClearSolver]);

  useEffect(() => {
    onDraftStateChange?.(draft.hasAnySelection);
  }, [draft.hasAnySelection, onDraftStateChange]);

  useEffect(() => {
    if (!clearDraftRef) return;
    clearDraftRef.current = handleClear;
    return () => {
      clearDraftRef.current = null;
    };
  }, [clearDraftRef, handleClear]);

  // ── Empty state ───────────────────────────────────────────────────────────
  if (selectedCourses.size === 0 && registeredSections.length === 0) {
    return (
      <div className="space-y-4">
        <div className="ustudy-card p-8 text-center md:p-12">
          <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <h3 className="mb-2 text-base font-semibold text-gray-900">Chưa chọn môn học nào</h3>
          <p className="mb-4 text-sm text-gray-500">
            Vui lòng chuyển sang tab "Chọn môn" để chọn các môn học bạn muốn đăng ký.
          </p>
          <button
            type="button"
            onClick={() => setActiveTab('selection')}
            className="ustudy-button-primary w-auto"
          >
            Đi đến Chọn môn
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Solver error */}
      {solverError && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <span>⚠️</span>
          <span>{solverError}</span>
        </div>
      )}

      {/* Toolbar */}
      {showToolbar && (
        <BuilderToolbar
          hasSelections={draft.hasAnySelection}
          solving={solving}
          savedSchedulesCount={savedSchedulesCount}
          onFullSolve={handleFullSolve}
          onOpenConfig={onOpenConfig}
          onOpenSavedList={onOpenSavedList}
          onSave={onOpenSaveModal}
          onClear={handleClear}
        />
      )}

      {/* ── 2-panel layout: Left sidebar | Right calendar ── */}
      <div className="flex gap-3">
        {/* LEFT: Sidebar — courses + summary + hybrid CTA (desktop) */}
        <div className="hidden w-[280px] shrink-0 xl:w-[320px] lg:block">
          <div className="ustudy-card sticky top-0 overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 7rem)' }}>
            <CourseSidebar
              selectedCourseIds={selectedCourses}
              allCourses={allCurrentCourses}
              allowedClassesMap={allowedClassesMap}
              selections={draft.selections}
              conflicts={conflicts}
              focusedCourseCode={focusedCourseCode}
              onSelectClass={handleSelectClass}
              onRemoveSelection={draft.removeSelection}
              onToggleAllowedClass={handleToggleAllowedClass}
              // Summary props
              unfilledCount={unfilledCount}
              totalCredits={totalCredits}
              onHybridSolve={handleHybridSolve}
              solvingHybrid={solving}
            />
          </div>
        </div>

        {/* RIGHT: Calendar grid */}
        <div className="min-w-0 flex-1 flex flex-col" style={{ height: 'calc(100vh - 7rem)' }}>
          {options.length > 0 && (
            <div className="mb-3">
              <ScheduleOptionSelector
                options={options.map((_, i) => ({ id: i, label: `PA ${i + 1}` }))}
                activeIndex={activeOption}
                onChange={setActiveOption}
              />
            </div>
          )}

          <div className="relative flex-1 min-h-0">
            <BuilderGrid
              allSections={displaySections}
              selections={draft.selections}
              conflicts={conflicts}
              focusedCourseCode={focusedCourseCode}
              onClickSection={handleClickSection}
            />
          </div>
        </div>
      </div>

      {/* Mobile: FAB to open sidebar */}
      <button
        type="button"
        onClick={() => setMobileSidebarOpen(true)}
        className="fixed bottom-20 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-[#004A98] text-white shadow-lg transition-transform active:scale-95 lg:hidden"
        style={{ boxShadow: '0 4px 20px rgba(0,74,152,0.4)' }}
      >
        <PanelLeftOpen className="h-5 w-5" />
      </button>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            style={{ backdropFilter: 'blur(2px)' }}
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div
            className="fixed bottom-16 left-0 right-0 z-50 flex flex-col rounded-t-2xl bg-white shadow-2xl lg:hidden"
            style={{ maxHeight: '75vh' }}
          >
            <div className="flex justify-center pb-1 pt-3">
              <div className="h-1 w-10 rounded-full bg-gray-300" />
            </div>
            <div className="flex-1 overflow-hidden">
              <CourseSidebar
                selectedCourseIds={selectedCourses}
                allCourses={allCurrentCourses}
                allowedClassesMap={allowedClassesMap}
                selections={draft.selections}
                conflicts={conflicts}
                focusedCourseCode={focusedCourseCode}
                onSelectClass={handleSelectClass}
                onRemoveSelection={draft.removeSelection}
                onToggleAllowedClass={handleToggleAllowedClass}
                unfilledCount={unfilledCount}
                totalCredits={totalCredits}
                onHybridSolve={handleHybridSolve}
                solvingHybrid={solving}
              />
            </div>
          </div>
        </>
      )}

      {/* Mobile summary bar */}
      <div className="fixed bottom-16 left-0 right-0 z-30 border-t border-gray-200 bg-white px-4 py-2 shadow-lg lg:hidden">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-900">
              {draft.selections.length}/{selectedCourses.size} môn · {totalCredits} TC
            </p>
            {conflicts.length > 0 && (
              <p className="text-[10px] text-amber-600">⚠️ {conflicts.length} xung đột</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unfilledCount > 0 && (
              <button
                type="button"
                onClick={handleHybridSolve}
                disabled={solving}
                className="h-8 rounded-lg bg-gradient-to-r from-[#004A98] to-[#0066CC] px-3 text-xs font-semibold text-white disabled:opacity-60"
              >
                Hoàn thiện
              </button>
            )}
            {draft.hasAnySelection && (
              <button
                type="button"
                onClick={onOpenSaveModal}
                className="h-8 rounded-lg border border-emerald-200 px-3 text-xs font-semibold text-emerald-700"
              >
                Lưu
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
