import { useMemo } from 'react';
import { AlertTriangle, Lock, Bot } from 'lucide-react';
import { weekDays, timePeriods } from '../../../constants';
import type { ClassSection } from '../../../types';
import { getConflicts } from '../../../logic/ScheduleValidator';
import { getScheduleConflictLabel, ScheduleConflictHoverCard } from '../../../components/schedule/schedule-conflict-hover-card';
import type { DraftSelection, ScheduleConflict } from '../types/schedule-builder-types';

// ─── Helpers ────────────────────────────────────────────────────────────────

function getSolidTint(hexColor: string, tint = 0.9) {
  const normalized = hexColor.replace('#', '');
  if (!/^[0-9A-Fa-f]{6}$/.test(normalized)) return '#F8FAFC';
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * tint);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

// ─── Props ──────────────────────────────────────────────────────────────────

interface BuilderGridProps {
  allSections: ClassSection[];
  selections: DraftSelection[];
  conflicts: ScheduleConflict[];
  focusedCourseCode: string | null;
  onClickSection: (courseCode: string) => void;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function BuilderGrid({
  allSections,
  selections,
  focusedCourseCode,
  onClickSection,
}: BuilderGridProps) {
  const conflictsBySectionId = useMemo(() => new Map(
    allSections.map((section) => [section.id, getConflicts(section, allSections)]),
  ), [allSections]);

  const selectionMap = useMemo(() => {
    const map = new Map<string, DraftSelection>();
    for (const s of selections) map.set(s.courseCode, s);
    return map;
  }, [selections]);

  // Stats per day
  const periodsPerDay = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const s of allSections) {
      counts[s.day] = (counts[s.day] ?? 0) + Math.round(s.endPeriod - s.startPeriod + 1);
    }
    return counts;
  }, [allSections]);

  return (
    <div className="ustudy-card overflow-hidden flex flex-col h-full">
      <div className="overflow-auto flex-1">
        <div className="min-w-[560px] md:min-w-[700px]">
          {/* Column headers */}
          <div
            className="sticky top-0 z-20 grid bg-[#004A98]"
            style={{ gridTemplateColumns: '56px repeat(6, 1fr)' }}
          >
            <div className="sticky left-0 z-30 flex h-10 items-center justify-center border-r border-white/20 bg-[#004A98]">
              <span className="text-[10px] font-semibold text-white">Tiết</span>
            </div>
            {weekDays.map(day => (
              <div
                key={day.day}
                className="flex flex-col items-center justify-center border-l border-white/15 bg-[#004A98] px-1 text-white"
              >
                <span className="text-[11px] font-semibold leading-tight">{day.short}</span>
                {(periodsPerDay[day.day] ?? 0) > 0 && (
                  <span className="mt-0.5 hidden text-[9px] font-medium text-white/60 md:inline">
                    {Math.round(periodsPerDay[day.day])} tiết
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Grid body */}
          <div style={{ position: 'relative', isolation: 'isolate' }}>
            {/* Layer 1: grid lines */}
            <div style={{ position: 'relative' }}>
              {timePeriods.map(period => {
                const isFirstAfternoon = period.period === 6;
                return (
                  <div key={period.period}>
                    {isFirstAfternoon && (
                      <div
                        className="grid items-stretch border-y border-orange-200 bg-orange-50"
                        style={{ gridTemplateColumns: '56px 1fr', height: '28px' }}
                      >
                        <div
                          className="sticky left-0 flex items-center justify-center border-r border-orange-200 bg-orange-50"
                          style={{ zIndex: 4 }}
                        >
                          <span className="text-[9px] font-semibold uppercase tracking-wide text-orange-700">Trưa</span>
                        </div>
                        <div className="flex items-center justify-center px-3">
                          <span className="text-[10px] font-semibold text-orange-700">
                            Nghỉ trưa 11:50 - 12:40
                          </span>
                        </div>
                      </div>
                    )}

                    <div
                      className={`grid ${period.period <= 5 ? 'bg-sky-50/20' : ''}`}
                      style={{ gridTemplateColumns: '56px repeat(6, 1fr)', height: '52px' }}
                    >
                      <div
                        className="sticky left-0 flex flex-col items-center justify-center border-b border-r border-gray-200 bg-gray-50 px-1 text-center"
                        style={{ zIndex: 4 }}
                      >
                        <div className="text-[11px] font-semibold text-gray-700">{period.period}</div>
                        <span className="text-[8px] text-gray-500 leading-tight">
                          {period.time.split(' - ')[0]}
                        </span>
                      </div>
                      {weekDays.map(day => (
                        <div
                          key={`${day.day}-${period.period}`}
                          className="border-b border-l border-gray-200 bg-white"
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Layer 2: class cards */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2, pointerEvents: 'none' }}>
              {allSections.map(section => {
                const conflictingSections = conflictsBySectionId.get(section.id) ?? [];
                const hasConflict = conflictingSections.length > 0;
                const conflictLabel = getScheduleConflictLabel(section, conflictingSections);
                const draft = selectionMap.get(section.courseCode);
                const isFocused = focusedCourseCode === section.courseCode;
                const isLocked = draft?.locked ?? false;
                const isSolver = draft?.source === 'solver';

                const rowH = 52;
                const lunchOffset = section.startPeriod >= 6 ? 28 : 0;
                const topPx = (section.startPeriod - 1) * rowH + lunchOffset;
                const heightPeriods = section.endPeriod - section.startPeriod + 1;
                const spansLunch = section.startPeriod < 6 && section.endPeriod >= 6;
                const heightPx = heightPeriods * rowH + (spansLunch ? 28 : 0);
                const dayColIndex = section.day - 2;

                const baseColor = hasConflict ? '#EF4444' : section.color;
                const bgColor = hasConflict ? '#FFF1F2' : getSolidTint(section.color);
                const textColor = hasConflict ? '#991B1B' : '#111827';
                const subTextColor = hasConflict ? '#B91C1C' : '#6B7280';

                const isCompact = heightPx < 72;
                const startTime = timePeriods.find(p => p.period === section.startPeriod)?.time.split(' - ')[0] ?? '';
                const endTime = timePeriods.find(p => p.period === section.endPeriod)?.time.split(' - ')[1] ?? '';

                return (
                  <ScheduleConflictHoverCard
                    key={section.id}
                    section={section}
                    conflictingSections={conflictingSections}
                  >
                    <div
                    role="button"
                    tabIndex={0}
                    onClick={() => onClickSection(section.courseCode)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onClickSection(section.courseCode);
                      }
                    }}
                    style={{
                      position: 'absolute',
                      top: topPx + 2,
                      left: `calc(56px + ${dayColIndex} * ((100% - 56px) / 6) + 2px)`,
                      width: `calc((100% - 56px) / 6 - 4px)`,
                      height: heightPx - 4,
                      backgroundColor: bgColor,
                      borderRadius: '6px',
                      borderLeft: `3px solid ${baseColor}`,
                      border: `1px solid ${hasConflict ? '#FECACA' : getSolidTint(section.color, 0.65)}`,
                      borderLeftWidth: '3px',
                      borderLeftColor: baseColor,
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      padding: isCompact ? '2px 5px' : '4px 6px',
                      boxShadow: isFocused
                        ? `0 0 0 2px ${section.color}40`
                        : hasConflict
                          ? '0 1px 6px rgba(239,68,68,0.15)'
                          : '0 1px 3px rgba(15,23,42,0.06)',
                      cursor: 'pointer',
                      zIndex: isFocused ? 3 : 2,
                      pointerEvents: 'auto',
                      transition: 'box-shadow 0.15s',
                    }}
                  >
                    {/* Conflict badge */}
                    {hasConflict && !isCompact && (
                      <div className="mb-0.5 flex w-fit items-center gap-1 rounded bg-red-100 px-1.5 py-px">
                        <AlertTriangle style={{ width: 8, height: 8, color: '#DC2626', flexShrink: 0 }} />
                        <span className="text-[8px] font-bold text-red-700">{conflictLabel}</span>
                      </div>
                    )}

                    {/* Course code */}
                    <p style={{
                      fontFamily: 'ui-monospace, monospace',
                      fontSize: isCompact ? 9 : 10,
                      fontWeight: 700,
                      color: textColor,
                      lineHeight: 1.2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}>
                      {section.courseCode}
                      {isCompact && (
                        <span style={{ fontWeight: 500, color: subTextColor, fontSize: 8, marginLeft: 3 }}>
                          · {section.sectionNumber}
                        </span>
                      )}
                    </p>

                    {/* Course name */}
                    {!isCompact && (
                      <p style={{
                        fontSize: 9,
                        fontWeight: 600,
                        color: subTextColor,
                        lineHeight: 1.3,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        flexShrink: 1,
                        minHeight: 0,
                        marginTop: 1,
                        marginBottom: 'auto',
                      } as React.CSSProperties}>
                        {section.courseNameVi}
                      </p>
                    )}

                    {/* Footer */}
                    {!isCompact && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0, marginTop: 2 }}>
                        <span style={{
                          fontSize: 8,
                          fontWeight: 700,
                          color: hasConflict ? '#991B1B' : '#374151',
                          background: hasConflict ? '#FEE2E2' : getSolidTint(section.color, 0.82),
                          borderRadius: 3,
                          padding: '0px 4px',
                          lineHeight: 1.6,
                        }}>
                          {section.sectionNumber}
                        </span>
                        {startTime && (
                          <span style={{ fontSize: 7, fontWeight: 500, color: subTextColor }}>
                            {startTime}–{endTime}
                          </span>
                        )}

                        {/* Lock / Solver badges */}
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: 2 }}>
                          {isLocked && <Lock style={{ width: 8, height: 8, color: '#D97706' }} />}
                          {isSolver && !isLocked && <Bot style={{ width: 8, height: 8, color: '#6B7280' }} />}
                        </div>
                      </div>
                    )}
                    </div>
                  </ScheduleConflictHoverCard>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
