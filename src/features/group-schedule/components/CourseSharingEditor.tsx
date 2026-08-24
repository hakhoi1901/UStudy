import { useMemo, useState } from 'react';
import { DndContext, KeyboardSensor, PointerSensor, TouchSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { GripVertical, Plus, Trash2, Users } from 'lucide-react';

import { AppSelect } from '../../../components/ui/form';
import { useGuideAction } from '../../user-guide';
import type { CourseSharingMode, CourseSharingRule, GroupMemberToken, ClassPreferenceSelection } from '../types';

interface CourseSharingEditorProps {
  courseId: string;
  subscribers: number[];
  members: GroupMemberToken[];
  value?: CourseSharingRule;
  onChange: (value: CourseSharingRule) => void;
}

const SHARING_MODES: Array<{ id: CourseSharingMode; label: string; description: string }> = [
  { id: 'required', label: 'Bắt buộc cùng lớp', description: 'Các thành viên trong từng nhóm luôn được xếp chung một lớp.' },
  { id: 'preferred', label: 'Ưu tiên cùng lớp', description: 'Cố gắng học cùng, nhưng có thể tách nếu không còn lịch hợp lệ.' },
  { id: 'independent', label: 'Ai cũng được', description: 'Mỗi thành viên được chọn lớp độc lập.' },
];

function memberName(members: GroupMemberToken[], memberIndex: number): string {
  return members[memberIndex]?.nickname || `Thành viên ${memberIndex + 1}`;
}

function DraggableMember({ id, name, groupValue, groupOptions, onGroupChange }: {
  id: string;
  name: string;
  groupValue: string;
  groupOptions: Array<{ id: string; name: string }>;
  onGroupChange: (value: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  return (
    <div ref={setNodeRef} style={{ transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined }} className={`flex min-w-0 items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2 py-1.5 shadow-sm ${isDragging ? 'z-20 opacity-60' : ''}`}>
      <button type="button" className="touch-none cursor-grab text-gray-400 active:cursor-grabbing" {...listeners} {...attributes} aria-label={`Kéo ${name}`}><GripVertical className="h-3.5 w-3.5" /></button>
      <span className="min-w-0 flex-1 truncate text-xs font-medium text-gray-700">{name}</span>
      <AppSelect value={groupValue} onChange={onGroupChange} options={groupOptions} ariaLabel={`Chọn nhóm cho ${name}`} className="w-24 shrink-0 sm:hidden" triggerClassName="h-7 px-1.5 text-[11px]" menuClassName="right-0 left-auto w-28" optionClassName="px-2 py-2 text-xs" />
    </div>
  );
}

function GroupDropZone({ id, label, children, onRemove }: { id: string; label: React.ReactNode; children: React.ReactNode; onRemove?: () => void }) {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={`min-h-20 rounded-lg border p-2 transition-colors ${isOver ? 'border-[#004A98] bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="text-xs font-semibold text-gray-700">{label}</div>
        {onRemove ? <button type="button" onClick={onRemove} className="text-gray-400 hover:text-red-600" aria-label="Xóa"><Trash2 className="h-3.5 w-3.5" /></button> : null}
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

export function CourseSharingEditor({ courseId, subscribers, members, value, onChange }: CourseSharingEditorProps) {
  const rule: CourseSharingRule = value ?? { mode: 'required' };
  const isCustomGrouping = rule.mode !== 'independent' && rule.groups !== undefined;
  const [isExpanded, setIsExpanded] = useState(false);
  
  const setGroupingMode = (custom: boolean) => onChange({
    ...rule,
    groups: custom ? [subscribers, []] : undefined,
    groupClassPreferences: {},
  });

  useGuideAction('expand-course-sharing', () => setIsExpanded(true));
  useGuideAction('enable-course-sharing-split', () => {
    setIsExpanded(true);
    if (rule.mode !== 'independent' && !isCustomGrouping) {
      setGroupingMode(true);
    }
  });

  const groups = rule.groups ?? [];
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }), useSensor(KeyboardSensor));
  const groupOptions = useMemo(() => [{ id: 'solo', name: 'Học riêng' }, ...groups.map((_, groupIndex) => ({ id: `group-${groupIndex}`, name: `Nhóm ${groupIndex + 1}` }))], [groups]);

  const updateGroups = (nextGroups: number[][]) => onChange({ ...rule, groups: nextGroups });
  const setMode = (mode: CourseSharingMode) => onChange({
    ...rule,
    mode,
    groups: mode === 'independent' ? undefined : rule.mode === 'independent' ? undefined : rule.groups,
    ...(mode !== rule.mode ? { groupClassPreferences: {} } : {}),
  });
  const setMemberGroup = (memberIndex: number, nextGroupId: string) => {
    const nextGroups = groups.map((group) => group.filter((candidate) => candidate !== memberIndex));
    if (nextGroupId !== 'solo') {
      const groupIndex = Number(nextGroupId.replace('group-', ''));
      if (Number.isInteger(groupIndex) && nextGroups[groupIndex]) nextGroups[groupIndex].push(memberIndex);
    }
    updateGroups(nextGroups);
  };
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) return;
    const memberIndex = Number(String(active.id).replace(`${courseId}:member-`, ''));
    const target = String(over.id).replace(`${courseId}:`, '');
    if (Number.isInteger(memberIndex)) setMemberGroup(memberIndex, target);
  };
  const removeGroup = (groupIndex: number) => {
    const removedMembers = groups[groupIndex] ?? [];
    const nextGroups = groups.filter((_, index) => index !== groupIndex);
    if (nextGroups.length === 0) nextGroups.push([]);
    nextGroups[0] = Array.from(new Set([...nextGroups[0], ...removedMembers]));
    const nextPreferences = Object.fromEntries(Object.entries(rule.groupClassPreferences ?? {}).flatMap(([groupId, selection]) => {
      if (!groupId.startsWith('group-')) return [[groupId, selection] as const];
      const index = Number(groupId.slice(6));
      if (index === groupIndex) return [];
      return [[`group-${index > groupIndex ? index - 1 : index}`, selection] as const];
    }));
    onChange({ ...rule, groups: nextGroups, groupClassPreferences: nextPreferences });
  };
  const soloMembers = subscribers.filter((memberIndex) => !groups.some((group) => group.includes(memberIndex)));

  return (
    <div data-guide="group-course-sharing" className="border-t border-gray-100 pt-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
          <Users className="h-4 w-4 text-[#004A98]" /> Ai cần học cùng nhau?
        </div>
        <button type="button" onClick={() => setIsExpanded(!isExpanded)} className="text-xs font-medium text-[#004A98] hover:underline">
          {isExpanded ? 'Thu gọn' : 'Thiết lập nhóm'}
        </button>
      </div>

      {!isExpanded && (
        <p className="mt-1.5 text-xs text-gray-500">
          {rule.mode === 'independent' ? 'Ai cũng được (Mỗi người tự xếp riêng)' : rule.mode === 'required' ? `Bắt buộc cùng lớp (${isCustomGrouping ? `Đã chia ${groups.length} nhóm` : 'Tất cả học chung'})` : `Ưu tiên cùng lớp (${isCustomGrouping ? `Đã chia ${groups.length} nhóm` : 'Tất cả học chung'})`}
        </p>
      )}

      {isExpanded && (
        <div className="mt-3 space-y-3">
          <div>
            <div data-guide="group-course-sharing-modes" className="grid gap-1 rounded-lg bg-gray-100 p-1 sm:grid-cols-3">
              {SHARING_MODES.map((mode) => <button key={mode.id} type="button" onClick={() => setMode(mode.id)} className={`rounded-md px-2.5 py-2 text-xs font-medium transition-colors ${rule.mode === mode.id ? 'bg-white text-[#004A98] shadow-sm' : 'text-gray-500 hover:text-gray-800'}`} title={mode.description}>{mode.label}</button>)}
            </div>
            <p className="mt-1.5 text-xs text-gray-500">{SHARING_MODES.find((mode) => mode.id === rule.mode)?.description}</p>
          </div>

          {rule.mode !== 'independent' ? (
            <div className="space-y-2">
              <div data-guide="group-course-sharing-split" className="flex flex-wrap items-center gap-1.5">
                <button type="button" onClick={() => setGroupingMode(false)} className={`rounded-md border px-2.5 py-1.5 text-xs font-medium ${!isCustomGrouping ? 'border-[#004A98] bg-blue-50 text-[#004A98]' : 'border-gray-200 bg-white text-gray-600'}`}>Tất cả học chung</button>
                <button type="button" onClick={() => setGroupingMode(true)} className={`rounded-md border px-2.5 py-1.5 text-xs font-medium ${isCustomGrouping ? 'border-[#004A98] bg-blue-50 text-[#004A98]' : 'border-gray-200 bg-white text-gray-600'}`}>Chia nhóm</button>
                {isCustomGrouping && groups.length < subscribers.length ? <button type="button" onClick={() => updateGroups([...groups, []])} className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-[#004A98]"><Plus className="h-3.5 w-3.5" />Thêm nhóm</button> : null}
              </div>

              {isCustomGrouping ? (
                <div data-guide="group-course-sharing-dnd">
                  <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                      {groups.map((group, groupIndex) => (
                        <GroupDropZone key={groupIndex} id={`${courseId}:group-${groupIndex}`} label={`Nhóm ${groupIndex + 1}`} onRemove={groups.length > 1 ? () => removeGroup(groupIndex) : undefined}>
                          {group.filter((memberIndex) => subscribers.includes(memberIndex)).map((memberIndex) => <DraggableMember key={memberIndex} id={`${courseId}:member-${memberIndex}`} name={memberName(members, memberIndex)} groupValue={`group-${groupIndex}`} groupOptions={groupOptions} onGroupChange={(next) => setMemberGroup(memberIndex, next)} />)}
                        </GroupDropZone>
                      ))}
                      <GroupDropZone id={`${courseId}:solo`} label="Học riêng">
                        {soloMembers.map((memberIndex) => <DraggableMember key={memberIndex} id={`${courseId}:member-${memberIndex}`} name={memberName(members, memberIndex)} groupValue="solo" groupOptions={groupOptions} onGroupChange={(next) => setMemberGroup(memberIndex, next)} />)}
                      </GroupDropZone>
                    </div>
                  </DndContext>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
