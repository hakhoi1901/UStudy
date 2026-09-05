import type { CSSProperties } from 'react';
import { useMemo, useState, useRef } from 'react';
import { AlertTriangle, Calendar, Clock, Camera, Download, Loader2 } from 'lucide-react';
import { STORAGE_KEYS, UI_COLORS } from '../../../config';
import { readFromStorage, saveToStorage } from '../../../helpers/localStorage/save';
import { weekDays, timePeriods } from '../../../constants';
import { maskToSections } from '../../../logic/scheduler/ScheduleDecoder';
import type { GroupScheduleOption } from '../types';
import type { ClassSection, SavedSchedule } from '../../../types';
import type { OpenClassDetailTarget } from '../../../components/course';
import { AppSelect } from '../../../components/ui/form';
import { ScheduleOptionSelector } from '../../schedule';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { captureElementAsDataURL, slugify, downloadImage } from '../../../utils/export';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../../../components/ui/overlays/dropdown-menu';
import { getScheduleConflictLabel, ScheduleConflictHoverCard } from '../../../components/schedule/schedule-conflict-hover-card';

interface GroupScheduleCalendarPreviewProps {
  options: GroupScheduleOption[];
  activeOptionIndex: number;
  activeMemberIndex: number;
  setActiveOptionIndex: (index: number) => void;
  setActiveMemberIndex: (index: number) => void;
  onOpenClassDetails: (target: OpenClassDetailTarget) => void;
}

const PALETTE = UI_COLORS.SCHEDULE_PALETTE;

function getSolidTint(hexColor: string, tint = 0.9) {
  const normalized = hexColor.replace('#', '');
  if (!/^[0-9A-Fa-f]{6}$/.test(normalized)) return '#F8FAFC';

  const red = parseInt(normalized.slice(0, 2), 16);
  const green = parseInt(normalized.slice(2, 4), 16);
  const blue = parseInt(normalized.slice(4, 6), 16);
  const mix = (channel: number) => Math.round(channel + (255 - channel) * tint);

  return `rgb(${mix(red)}, ${mix(green)}, ${mix(blue)})`;
}

export function getGroupMemberSections(option: GroupScheduleOption | undefined, memberIndex: number): ClassSection[] {
  const memberSchedule = option?.schedules.find((schedule) => schedule.memberIndex === memberIndex);
  if (!memberSchedule) return [];

  return memberSchedule.items.flatMap((item, itemIndex) => maskToSections(
    item.mask,
    item.courseId,
    item.courseName,
    item.classId,
    PALETTE[itemIndex % PALETTE.length],
    0,
  ));
}

export function buildSavedGroupSchedule(
  option: GroupScheduleOption | undefined,
  memberIndex: number,
  scheduleName: string,
): SavedSchedule | null {
  const member = option?.schedules.find((schedule) => schedule.memberIndex === memberIndex) ?? option?.schedules[0];
  if (!option || !member || !scheduleName.trim()) return null;

  const sections = getGroupMemberSections(option, member.memberIndex);
  if (sections.length === 0) return null;

  const groupMembers = option.schedules.map((schedule) => {
    const memberSections = getGroupMemberSections(option, schedule.memberIndex);
    const memberCourses = Array.from(new Set(schedule.items.map((item) => item.courseId)));
    const memberAllowedClassesMap = schedule.items.reduce<Record<string, string[]>>((acc, item) => {
      acc[item.courseId] = Array.from(new Set([...(acc[item.courseId] ?? []), item.classId]));
      return acc;
    }, {});

    return {
      memberIndex: schedule.memberIndex,
      nickname: schedule.nickname,
      sessions: memberSections,
      selectedCourses: memberCourses,
      allowedClassesMap: memberAllowedClassesMap,
    };
  });

  const selectedCourses = Array.from(new Set(member.items.map((item) => item.courseId)));
  const allowedClassesMap = member.items.reduce<Record<string, string[]>>((acc, item) => {
    acc[item.courseId] = Array.from(new Set([...(acc[item.courseId] ?? []), item.classId]));
    return acc;
  }, {});

  return {
    id: crypto.randomUUID(),
    name: scheduleName.trim(),
    createdAt: new Date().toISOString(),
    sessions: sections,
    selectedCourses,
    allowedClassesMap,
    groupSchedule: {
      option: option.option,
      members: groupMembers,
      rawOption: option,
    },
  };
}

function getConflicts(section: ClassSection, sections: ClassSection[]): ClassSection[] {
  return sections.filter((candidate) => (
    candidate.id !== section.id &&
    candidate.day === section.day &&
    candidate.startPeriod <= section.endPeriod &&
    candidate.endPeriod >= section.startPeriod
  ));
}

function getStats(sections: ClassSection[]) {
  const totalPeriods = sections.reduce((sum, section) => sum + Math.round(section.endPeriod - section.startPeriod + 1), 0);
  const periodsPerDay: Record<number, number> = {};

  sections.forEach((section) => {
    periodsPerDay[section.day] = (periodsPerDay[section.day] ?? 0) + Math.round(section.endPeriod - section.startPeriod + 1);
  });

  return {
    totalPeriods,
    periodsPerDay,
    scheduledDays: Object.keys(periodsPerDay).length,
  };
}

export function GroupScheduleCalendarPreview({
  options,
  activeOptionIndex,
  activeMemberIndex,
  setActiveOptionIndex,
  setActiveMemberIndex,
  onOpenClassDetails,
}: GroupScheduleCalendarPreviewProps) {
  const option = options[activeOptionIndex] ?? options[0];
  const member = option?.schedules.find((schedule) => schedule.memberIndex === activeMemberIndex) ?? option?.schedules[0];
  const effectiveMemberIndex = member?.memberIndex ?? 0;
  const sections = getGroupMemberSections(option, effectiveMemberIndex);
  const groupLabelByClass = useMemo(() => new Map((member?.items ?? []).map((item) => [`${item.courseId}:${item.classId}`, item.sharingGroupLabel])), [member]);
  const stats = getStats(sections);
  
  const calendarRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportTotal, setExportTotal] = useState(0);

  const handleExportCurrent = async () => {
    if (!calendarRef.current || !option || !member) return;
    setIsExporting(true);
    try {
      const dataUrl = await captureElementAsDataURL(calendarRef.current);
      const nickname = slugify(member.nickname || `Thanh vien ${effectiveMemberIndex + 1}`);
      downloadImage(dataUrl, `${nickname}-pa${option.option}.png`);
    } catch (e) {
      console.error('Export failed', e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAllZip = async () => {
    if (!calendarRef.current) return;
    setIsExporting(true);
    
    const totalImages = options.reduce((sum, opt) => sum + opt.schedules.length, 0);
    setExportTotal(totalImages);
    setExportProgress(0);

    const zip = new JSZip();
    let count = 0;
    
    // Lưu lại index hiện tại để khôi phục
    const originalOptionIndex = activeOptionIndex;
    const originalMemberIndex = activeMemberIndex;
    
    try {
      for (let i = 0; i < options.length; i++) {
        const opt = options[i];
        const folderName = `phuong-an-${String(opt.option).padStart(2, '0')}`;
        const folder = zip.folder(folderName);
        
        setActiveOptionIndex(i);
        
        for (let j = 0; j < opt.schedules.length; j++) {
          const sched = opt.schedules[j];
          setActiveMemberIndex(sched.memberIndex);
          
          // Chờ DOM cập nhật
          await new Promise(resolve => setTimeout(resolve, 200));
          
          const dataUrl = await captureElementAsDataURL(calendarRef.current);
          const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
          const nickname = slugify(sched.nickname || `Thanh vien ${sched.memberIndex + 1}`);
          
          folder?.file(`${nickname}-pa${opt.option}.png`, base64Data, { base64: true });
          
          count++;
          setExportProgress(count);
        }
      }
      
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'Lich_Nhom.zip');
      
    } catch (e) {
      console.error('Export zip failed', e);
    } finally {
      setActiveOptionIndex(originalOptionIndex);
      setActiveMemberIndex(originalMemberIndex);
      setIsExporting(false);
      setExportProgress(0);
      setExportTotal(0);
    }
  };

  if (!option || !member) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
        Chưa có phương án lịch để xem.
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg">
      <div className="flex flex-col gap-3 border-b border-gray-200 pb-3 lg:flex-row lg:items-center lg:justify-between">
        <ScheduleOptionSelector
          options={options.map((item) => ({ id: item.option, label: `PA ${item.option}` }))}
          activeIndex={activeOptionIndex}
          onChange={setActiveOptionIndex}
        />

        <div className="flex shrink-0 items-center gap-2 lg:border-l lg:border-gray-200 lg:pl-3">
          <span className="text-xs font-medium text-gray-500">Thành viên</span>
          <AppSelect
            value={String(effectiveMemberIndex)}
            options={option.schedules.map((schedule) => ({
              id: String(schedule.memberIndex),
              name: schedule.nickname,
            }))}
            onChange={(value) => setActiveMemberIndex(Number(value))}
            ariaLabel="Chọn thành viên để xem lịch"
            className="min-w-40"
            triggerClassName="h-9 px-3 py-0 text-sm font-medium"
            disabled={isExporting}
          />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                type="button" 
                disabled={isExporting}
                className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                <span className="hidden sm:inline">{isExporting && exportTotal > 0 ? `Đang xuất... (${exportProgress}/${exportTotal})` : 'Xuất ảnh'}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white z-50">
              <DropdownMenuItem onClick={handleExportCurrent} className="cursor-pointer hover:bg-gray-100">
                <Camera className="mr-2 h-4 w-4" /> Xuất hiện tại (1 ảnh)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportAllZip} className="cursor-pointer hover:bg-gray-100">
                <Download className="mr-2 h-4 w-4" /> Xuất toàn bộ (ZIP)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div ref={calendarRef} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-gray-200 bg-slate-50 px-3 py-3 md:flex-row md:items-center md:justify-between md:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#004A98] text-white shadow-sm">
              <Calendar className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-gray-900">
                Lịch của {member.nickname} {isExporting && `- Phương án ${option.option}`}
              </h3>
              <p className="truncate text-xs text-gray-500">
                {sections.length > 0 ? `${sections.length} lớp · ${stats.totalPeriods} tiết · ${stats.scheduledDays} ngày học` : 'Thành viên này chưa có lớp được xếp'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-500">
            <span className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1">
              <Clock className="h-3 w-3 text-[#004A98]" />
              Sáng 1-5
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1">
              <Clock className="h-3 w-3 text-orange-500" />
              Chiều 6-10
            </span>
          </div>
        </div>

        <div className="overflow-auto">
          <div className="min-w-[620px] md:min-w-[1000px]">
            <div className="sticky top-0 z-20 grid bg-[#004A98]" style={{ gridTemplateColumns: '64px repeat(6, 1fr)' }}>
              <div className="sticky left-0 z-30 flex h-11 items-center justify-center border-r border-white/20 bg-[#004A98] md:h-12">
                <span className="text-[10px] font-semibold text-white md:text-xs">Tiết</span>
              </div>
              {weekDays.map((day) => (
                <div key={day.day} className="flex h-11 flex-col items-center justify-center border-l border-white/15 bg-[#004A98] px-1 text-white md:h-12">
                  <span className="hidden text-[10px] font-normal leading-none text-white/70 md:block">{day.nameVi}</span>
                  <span className="text-[11px] font-semibold leading-tight md:text-[13px]">{day.short}</span>
                  {(stats.periodsPerDay[day.day] ?? 0) > 0 && (
                    <span className="mt-0.5 hidden rounded-full bg-white/20 px-1.5 text-[9px] font-bold leading-4 md:inline-flex">
                      {Math.round(stats.periodsPerDay[day.day])} tiết
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div style={{ position: 'relative', isolation: 'isolate' }}>
              {/* Không tạo stacking context để cột Tiết sticky nằm trên thẻ môn khi vuốt ngang. */}
              <div style={{ position: 'relative' }}>
                {timePeriods.map((period) => {
                  const isFirstAfternoon = period.period === 6;
                  return (
                    <div key={period.period}>
                      {isFirstAfternoon && (
                        <div className="grid items-stretch border-y border-orange-200 bg-orange-50" style={{ gridTemplateColumns: '64px 1fr', height: '34px' }}>
                          <div className="sticky left-0 flex items-center justify-center border-r border-orange-200 bg-orange-50" style={{ zIndex: 4 }}>
                            <span className="text-[9px] font-semibold uppercase tracking-wide text-orange-700 md:text-[11px]">Trưa</span>
                          </div>
                          <div className="flex items-center justify-center bg-orange-50 px-3">
                            <span className="text-[10px] font-semibold text-orange-700 md:text-xs">Nghỉ trưa 11:50 - 12:40</span>
                          </div>
                        </div>
                      )}

                      <div className={`grid ${period.period <= 5 ? 'bg-sky-50/20' : ''}`} style={{ gridTemplateColumns: '64px repeat(6, 1fr)', height: '56px' }}>
                        <div className="sticky left-0 flex flex-col items-center justify-center border-b border-r border-gray-200 bg-gray-50 px-1 text-center" style={{ zIndex: 4 }}>
                          <div className="text-[11px] font-semibold text-gray-700 md:text-[13px]">{period.period}</div>
                          <span className="text-[8px] leading-tight text-gray-500 md:text-[10px]">{period.time.split(' - ')[0]}</span>
                          <span className="text-[8px] leading-none text-gray-400 md:text-[10px]">-</span>
                          <span className="text-[8px] leading-tight text-gray-500 md:text-[10px]">{period.time.split(' - ')[1]}</span>
                        </div>
                        {weekDays.map((day) => (
                          <div key={`${day.day}-${period.period}`} className="border-b border-l border-gray-200 bg-white transition-colors hover:bg-slate-50/80" />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pointer-events-none absolute inset-0 z-[2]">
                {sections.map((section) => {
                  const conflicts = getConflicts(section, sections);
                  const hasConflict = conflicts.length > 0;
                  const conflictLabel = getScheduleConflictLabel(section, conflicts);
                  const rowHeight = 56;
                  const lunchBreakOffset = section.startPeriod >= 6 ? 34 : 0;
                  const top = (section.startPeriod - 1) * rowHeight + lunchBreakOffset;
                  const heightPeriods = section.endPeriod - section.startPeriod + 1;
                  const spansLunch = section.startPeriod < 6 && section.endPeriod >= 6;
                  const height = heightPeriods * rowHeight + (spansLunch ? 34 : 0);
                  const dayIndex = section.day - 2;
                  const baseColor = hasConflict ? '#EF4444' : section.color;
                  const backgroundColor = hasConflict ? '#FFF1F2' : getSolidTint(section.color);
                  const textColor = hasConflict ? '#991B1B' : '#111827';
                  const subTextColor = hasConflict ? '#B91C1C' : '#6B7280';
                  const pillBg = hasConflict ? '#FEE2E2' : getSolidTint(section.color, 0.82);
                  const pillText = hasConflict ? '#991B1B' : '#374151';
                  const startTime = timePeriods.find((period) => period.period === section.startPeriod)?.time.split(' - ')[0] ?? '';
                  const endTime = timePeriods.find((period) => period.period === section.endPeriod)?.time.split(' - ')[1] ?? '';
                  const isCompact = height < 80;
                  const isMedium = height >= 80 && height < 150;
                  const isTall = height >= 150;

                  return (
                    <ScheduleConflictHoverCard
                      key={section.id}
                      section={section}
                      conflictingSections={conflicts}
                    >
                      <div
                      role="button"
                      tabIndex={0}
                      aria-label={`Xem lớp mở ${section.sectionNumber} của môn ${section.courseCode}`}
                      onClick={() => onOpenClassDetails({
                        courseCode: section.courseCode,
                        courseName: section.courseNameVi || section.courseName,
                        classId: section.selectedClassId || section.sectionNumber,
                      })}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          onOpenClassDetails({
                            courseCode: section.courseCode,
                            courseName: section.courseNameVi || section.courseName,
                            classId: section.selectedClassId || section.sectionNumber,
                          });
                        }
                      }}
                      style={{
                        position: 'absolute',
                        top: top + 2,
                        left: `calc(64px + ${dayIndex} * ((100% - 64px) / 6) + 3px)`,
                        width: 'calc((100% - 64px) / 6 - 6px)',
                        height: height - 4,
                        backgroundColor,
                        borderRadius: '8px',
                        border: `1px solid ${hasConflict ? '#FECACA' : getSolidTint(section.color, 0.65)}`,
                        borderLeftWidth: '3.5px',
                        borderLeftColor: baseColor,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        padding: isCompact ? '3px 6px' : '5px 7px',
                        gap: 0,
                        boxSizing: 'border-box',
                        boxShadow: hasConflict ? '0 2px 8px rgba(239,68,68,0.15)' : '0 1px 4px rgba(15,23,42,0.08)',
                        cursor: 'pointer',
                        zIndex: 2,
                        pointerEvents: 'auto',
                      }}
                    >
                      {hasConflict && !isCompact && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3,
                          background: '#FEE2E2',
                          borderRadius: 4,
                          padding: '1px 5px',
                          marginBottom: 3,
                          width: 'fit-content',
                        }}>
                          <AlertTriangle style={{ width: 9, height: 9, color: '#DC2626', flexShrink: 0 }} />
                          <span style={{ fontSize: 8, fontWeight: 700, color: '#B91C1C' }}>{conflictLabel}</span>
                        </div>
                      )}

                      <p style={{
                        fontFamily: 'ui-monospace, monospace',
                        fontSize: isCompact ? 9 : 11,
                        fontWeight: 700,
                        color: textColor,
                        lineHeight: 1.2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        marginBottom: isCompact ? 0 : 2,
                      }}>
                        {section.courseCode}
                        {isCompact && (
                          <span style={{ fontFamily: 'inherit', fontWeight: 500, color: subTextColor, fontSize: 8, marginLeft: 4 }}>
                            · Lớp {section.sectionNumber}
                          </span>
                        )}
                      </p>

                      {!isCompact && groupLabelByClass.get(`${section.courseCode}:${section.selectedClassId || section.sectionNumber}`) ? (
                        <span style={{ alignSelf: 'flex-start', marginBottom: 2, borderRadius: 4, background: pillBg, padding: '1px 5px', fontSize: 8, fontWeight: 700, color: pillText }}>
                          {groupLabelByClass.get(`${section.courseCode}:${section.selectedClassId || section.sectionNumber}`)}
                        </span>
                      ) : null}

                      {!isCompact && (
                        <p style={{
                          fontSize: 9,
                          fontWeight: 600,
                          color: subTextColor,
                          lineHeight: 1.3,
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: isMedium ? 2 : 3,
                          WebkitBoxOrient: 'vertical',
                          flexShrink: 1,
                          minHeight: 0,
                          marginBottom: 'auto',
                        } as CSSProperties}>
                          {section.courseNameVi}
                        </p>
                      )}

                      {isTall && <div style={{ flex: 1 }} />}

                      {!isCompact && (
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2,
                          flexShrink: 0,
                          marginTop: isMedium ? 'auto' : 4,
                          paddingTop: 3,
                          borderTop: `1px solid ${hasConflict ? '#FECACA' : getSolidTint(section.color, 0.72)}`,
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
                            <span style={{
                              flexShrink: 0,
                              background: pillBg,
                              color: pillText,
                              fontSize: 8,
                              fontWeight: 700,
                              borderRadius: 4,
                              padding: '1px 5px',
                              lineHeight: 1.5,
                              whiteSpace: 'nowrap',
                            }}>
                              Lớp {section.sectionNumber}
                            </span>
                            {section.room && section.room !== '---' && (
                              <span style={{
                                fontSize: 8,
                                fontWeight: 600,
                                color: subTextColor,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}>
                                {section.room}
                              </span>
                            )}
                          </div>

                          {startTime && (isTall || isMedium) && (
                            <span style={{
                              fontSize: 8,
                              fontWeight: 500,
                              color: subTextColor,
                              lineHeight: 1.2,
                              whiteSpace: 'nowrap',
                            }}>
                              {startTime} - {endTime}
                            </span>
                          )}
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
    </div>
  );
}
