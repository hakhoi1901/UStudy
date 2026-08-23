import { Users } from 'lucide-react';

import { AppSelect } from '../../../components/ui/form';
import type { CourseSharingMode, CourseSharingRule, GroupMemberToken } from '../types';

interface CourseSharingEditorProps {
  subscribers: number[];
  members: GroupMemberToken[];
  value?: CourseSharingRule;
  onChange: (value: CourseSharingRule) => void;
}

const SHARING_MODES: Array<{ id: CourseSharingMode; label: string; description: string }> = [
  { id: 'required', label: 'Bắt buộc cùng lớp', description: 'Không tách nhóm dù cần dùng phương án dự phòng.' },
  { id: 'preferred', label: 'Ưu tiên cùng lớp', description: 'Cố gắng học cùng, nhưng có thể tách nếu không còn lịch hợp lệ.' },
  { id: 'independent', label: 'Ai cũng được', description: 'Mỗi thành viên được chọn lớp độc lập.' },
];

function memberName(members: GroupMemberToken[], memberIndex: number): string {
  return members[memberIndex]?.nickname || `Thành viên ${memberIndex + 1}`;
}

export function CourseSharingEditor({ subscribers, members, value, onChange }: CourseSharingEditorProps) {
  const rule: CourseSharingRule = value ?? { mode: 'required' };
  const isCustomGrouping = rule.mode !== 'independent' && rule.groups !== undefined;
  const groupCount = Math.max(subscribers.length, rule.groups?.length ?? 0);

  const setMode = (mode: CourseSharingMode) => {
    if (mode === 'independent') {
      onChange({ mode });
      return;
    }
    onChange({ mode, groups: rule.mode === 'independent' ? undefined : rule.groups });
  };

  const setGroupingMode = (custom: boolean) => {
    onChange({
      mode: rule.mode,
      groups: custom ? [subscribers] : undefined,
    });
  };

  const setMemberGroup = (memberIndex: number, nextGroupId: string) => {
    const nextGroups = Array.from({ length: groupCount }, (_, groupIndex) => (
      (rule.groups?.[groupIndex] ?? []).filter((candidate) => candidate !== memberIndex)
    ));
    if (nextGroupId !== 'solo') {
      const groupIndex = Number(nextGroupId.replace('group-', ''));
      if (Number.isInteger(groupIndex) && nextGroups[groupIndex]) nextGroups[groupIndex].push(memberIndex);
    }
    onChange({ mode: rule.mode, groups: nextGroups });
  };

  const summary = (rule.groups ?? [])
    .map((group, groupIndex) => ({
      groupIndex,
      members: group.filter((memberIndex) => subscribers.includes(memberIndex)),
    }))
    .filter((group) => group.members.length >= 2);

  return (
    <div className="space-y-3 border-t border-gray-100 pt-3">
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-gray-700">
          <Users className="h-4 w-4 text-[#004A98]" />
          Ai cần học cùng nhau?
        </div>
        <div className="grid gap-1 rounded-lg bg-gray-100 p-1 sm:grid-cols-3">
          {SHARING_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setMode(mode.id)}
              className={`rounded-md px-2.5 py-2 text-xs font-medium transition-colors ${rule.mode === mode.id ? 'bg-white text-[#004A98] shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
              title={mode.description}
            >
              {mode.label}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-gray-500">
          {SHARING_MODES.find((mode) => mode.id === rule.mode)?.description}
        </p>
      </div>

      {rule.mode !== 'independent' ? (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setGroupingMode(false)}
              className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${!isCustomGrouping ? 'border-[#004A98] bg-blue-50 text-[#004A98]' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              Tất cả học chung
            </button>
            <button
              type="button"
              onClick={() => setGroupingMode(true)}
              className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${isCustomGrouping ? 'border-[#004A98] bg-blue-50 text-[#004A98]' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              Chia nhóm
            </button>
          </div>

          {isCustomGrouping ? (
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {subscribers.map((memberIndex) => {
                const selectedGroupIndex = rule.groups?.findIndex((group) => group.includes(memberIndex)) ?? -1;
                return (
                  <div key={memberIndex} className="flex min-w-0 items-center gap-2 rounded-lg bg-gray-50 px-2.5 py-2">
                    <span className="min-w-0 flex-1 truncate text-xs font-medium text-gray-700">
                      {memberName(members, memberIndex)}
                    </span>
                    <AppSelect
                      value={selectedGroupIndex >= 0 ? `group-${selectedGroupIndex}` : 'solo'}
                      onChange={(nextValue) => setMemberGroup(memberIndex, nextValue)}
                      options={[
                        { id: 'solo', name: 'Học riêng' },
                        ...Array.from({ length: groupCount }, (_, groupIndex) => ({ id: `group-${groupIndex}`, name: `Nhóm ${groupIndex + 1}` })),
                      ]}
                      ariaLabel={`Chọn nhóm học cùng cho ${memberName(members, memberIndex)}`}
                      className="w-28 shrink-0"
                      triggerClassName="h-8 px-2 text-xs"
                      menuClassName="right-0 left-auto w-32"
                      optionClassName="px-2 py-2 text-xs"
                    />
                  </div>
                );
              })}
            </div>
          ) : null}

          {isCustomGrouping ? (
            summary.length > 0 ? (
              <div className="space-y-1 text-xs text-gray-500">
                {summary.map((group) => (
                  <p key={group.groupIndex}>
                    <span className="font-medium text-gray-700">Nhóm {group.groupIndex + 1}:</span>{' '}
                    {group.members.map((memberIndex) => memberName(members, memberIndex)).join(', ')}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">Chưa có nhóm nào từ hai người trở lên; mọi người sẽ được xếp lớp riêng.</p>
            )
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
