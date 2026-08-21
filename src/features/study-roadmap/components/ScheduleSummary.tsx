import { Shuffle, BookOpen, Hash, Calendar, AlertTriangle, Check, Lock, Circle, Sparkles, Layers } from 'lucide-react';
import type { DraftSelection, ScheduleConflict } from '../types/schedule-builder-types';

// ─── Props ──────────────────────────────────────────────────────────────────

interface ScheduleSummaryProps {
  selections: DraftSelection[];
  conflicts: ScheduleConflict[];
  selectedCourseIds: Set<string>;
  unfilledCount: number;
  totalCredits: number;
  onHybridSolve: () => void;
  solvingHybrid: boolean;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function ScheduleSummary({
  selections,
  conflicts,
  selectedCourseIds,
  unfilledCount,
  totalCredits,
  onHybridSolve,
  solvingHybrid,
}: ScheduleSummaryProps) {
  const totalSections = selections.reduce((sum, s) => sum + s.classSections.length, 0);
  const totalPeriods = selections.reduce(
    (sum, s) => sum + s.classSections.reduce((ps, cs) => ps + Math.round(cs.endPeriod - cs.startPeriod + 1), 0),
    0,
  );
  const scheduledDays = new Set(selections.flatMap(s => s.classSections.map(cs => cs.day))).size;
  const hasErrors = conflicts.some(c => c.severity === 'error');
  const lockedCount = selections.filter(s => s.locked).length;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      Stats section
      <div className="flex-shrink-0 border-b border-gray-200 p-3">
        <h4 className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
          <Layers className="h-3 w-3" />
          Tổng quan
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <StatMini icon={BookOpen} label="Môn" value={`${selections.length}/${selectedCourseIds.size}`} />
          <StatMini icon={Hash} label="Tín chỉ" value={`${totalCredits}`} />
          <StatMini icon={Calendar} label="Ngày học" value={`${scheduledDays}`} />
          <StatMini icon={Hash} label="Tiết/tuần" value={`${totalPeriods}`} />
        </div>
      </div>

      {/* Per-course status */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
        <div className="p-3">
          <h4 className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Trạng thái môn học
          </h4>
          <div className="space-y-1">
            {selections.map(s => {
              const courseConflicts = conflicts.filter(c => c.involvedCourses.includes(s.courseCode));
              const hasConflict = courseConflicts.length > 0;

              return (
                <div key={s.courseCode} className="flex items-center gap-2 rounded-md px-2 py-1.5">
                  {hasConflict ? (
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                  ) : (
                    <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-gray-800">
                      {s.courseCode}
                    </p>
                    <p className="truncate text-[10px] text-gray-500">
                      Lớp {s.classId.replace(/_/g, ' ')}
                    </p>
                  </div>
                  {s.locked && <Lock className="h-3 w-3 shrink-0 text-amber-500" />}
                </div>
              );
            })}

            {/* Unfilled courses */}
            {unfilledCount > 0 && (
              <div className="flex items-center gap-2 rounded-md px-2 py-1.5">
                <Circle className="h-3.5 w-3.5 shrink-0 text-gray-300" />
                <p className="text-xs text-gray-400">{unfilledCount} môn chưa chọn lớp</p>
              </div>
            )}
          </div>
        </div>

        {/* Conflicts section */}
        <div className="border-t border-gray-100 p-3">
          <h4 className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            {hasErrors ? (
              <AlertTriangle className="h-3 w-3 text-amber-500" />
            ) : (
              <Check className="h-3 w-3 text-emerald-500" />
            )}
            {hasErrors ? 'Cảnh báo' : 'Xung đột'}
          </h4>

          {conflicts.length === 0 ? (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2">
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-700">Không có xung đột</span>
            </div>
          ) : (
            <div className="space-y-1.5">
              {conflicts.map((c, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg bg-amber-50 px-2.5 py-2">
                  <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-600" />
                  <span className="text-[11px] leading-snug text-amber-800">{c.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hybrid solve CTA */}
      {unfilledCount > 0 && (
        <div className="flex-shrink-0 border-t border-gray-200 p-3">
          <button
            type="button"
            onClick={onHybridSolve}
            disabled={solvingHybrid}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#004A98] to-[#0066CC] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-60"
          >
            <Shuffle className="h-4 w-4" />
            {solvingHybrid ? 'Đang xếp...' : 'Hoàn thiện lịch giúp tôi'}
          </button>
          <p className="mt-1.5 text-center text-[10px] text-gray-400">
            {lockedCount > 0
              ? `Giữ ${lockedCount} lớp đã khóa, xếp ${unfilledCount} môn còn lại`
              : `Xếp tự động ${unfilledCount} môn chưa chọn lớp`}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Mini stat ──────────────────────────────────────────────────────────────

function StatMini({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-2.5 py-2">
      <Icon className="h-3.5 w-3.5 shrink-0 text-[#004A98]" />
      <div>
        <p className="text-[9px] font-medium uppercase tracking-wide text-gray-400">{label}</p>
        <p className="text-sm font-bold leading-none text-gray-900">{value}</p>
      </div>
    </div>
  );
}
