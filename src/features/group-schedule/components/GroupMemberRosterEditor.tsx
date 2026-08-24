import { useMemo, useState } from 'react';
import { Check, Plus, Settings2, Trash2, Users } from 'lucide-react';

import { Button } from '../../../components/ui/form/button';
import { Input } from '../../../components/ui/form/input';
import { Textarea } from '../../../components/ui/form/textarea';
import { AppDialog } from '../../../components/ui/overlays/app-dialog';
import type { GroupMemberToken } from '../types';

export interface GroupRosterCourse {
  id: string;
  name: string;
  credits?: number | string;
}

interface GroupMemberRosterEditorProps {
  members: GroupMemberToken[];
  courses: GroupRosterCourse[];
  nickname: string;
  onNicknameChange: (value: string) => void;
  manualCourseInput: string;
  onManualCourseInputChange: (value: string) => void;
  onAddMember: () => void;
  onRemoveMember: (memberIndex: number) => void;
  onRemoveCourse: (courseId: string) => void;
  onUpdateCourseParticipants: (courseId: string, memberIndexes: number[]) => void;
  onOpenMemberSettings: (memberIndex: number) => void;
}

function memberName(member: GroupMemberToken, index: number) {
  return member.nickname || `Thành viên ${index + 1}`;
}

function initials(name: string) {
  return name.trim().slice(0, 1).toUpperCase() || '?';
}

export function GroupMemberRosterEditor({
  members,
  courses,
  nickname,
  onNicknameChange,
  manualCourseInput,
  onManualCourseInputChange,
  onAddMember,
  onRemoveMember,
  onRemoveCourse,
  onUpdateCourseParticipants,
  onOpenMemberSettings,
}: GroupMemberRosterEditorProps) {
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const editingCourse = courses.find((course) => course.id === editingCourseId) ?? null;
  const participantIndexes = useMemo(() => {
    if (!editingCourse) return [];
    return members.flatMap((member, index) => (
      [...member.sharedCourses, ...member.personalCourses].includes(editingCourse.id) ? [index] : []
    ));
  }, [editingCourse, members]);

  const toggleParticipant = (memberIndex: number) => {
    if (!editingCourse) return;
    const next = participantIndexes.includes(memberIndex)
      ? participantIndexes.filter((index) => index !== memberIndex)
      : [...participantIndexes, memberIndex];
    onUpdateCourseParticipants(editingCourse.id, next);
  };

  return (
    <section className="ustudy-card overflow-hidden p-0">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Bước 1</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">Thành viên và môn học</h2>
            <p className="mt-1 text-sm text-slate-500">Thêm người trước, sau đó chọn ai học từng môn.</p>
          </div>
          <span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {members.length} người · {courses.length} môn
          </span>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
          <Input
            value={nickname}
            onChange={(event) => onNicknameChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                onAddMember();
              }
            }}
            placeholder="Nhập tên thành viên, rồi nhấn Enter"
            className="min-w-0 border-slate-200 focus-visible:ring-[#004A98]/25"
          />
          <Button type="button" onClick={onAddMember} className="w-full bg-[#004A98] text-white hover:bg-[#003d7a] sm:w-auto">
            <Plus className="h-4 w-4" />
            Thêm thành viên
          </Button>
        </div>
      </div>

      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-800">Thành viên nhóm</h3>
          {members.length >= 2 ? (
            <span className="text-xs font-medium text-emerald-700">Đủ điều kiện xếp lịch</span>
          ) : (
            <span className="text-xs font-medium text-amber-700">Cần thêm {2 - members.length} người</span>
          )}
        </div>

        {members.length > 0 ? (
          <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
            {members.map((member, index) => {
              const courseCount = new Set([...member.sharedCourses, ...member.personalCourses]).size;
              const name = memberName(member, index);
              return (
                <div key={member.id || `${name}-${index}`} className="flex min-w-0 items-center gap-3 px-3 py-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-[#004A98]">
                    {initials(name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{courseCount} môn đăng ký</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onOpenMemberSettings(index)}
                    className="h-8 w-8 shrink-0 text-slate-500 hover:bg-blue-50 hover:text-[#004A98]"
                    title="Tùy chỉnh thành viên"
                  >
                    <Settings2 className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveMember(index)}
                    className="h-8 w-8 shrink-0 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    title="Xóa thành viên"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="rounded-lg bg-slate-50 px-3 py-3 text-sm text-slate-500">Thêm ít nhất hai thành viên để bắt đầu xếp lịch nhóm.</p>
        )}
      </div>

      <div className="px-5 py-4 sm:px-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Môn đăng ký</h3>
            <p className="mt-0.5 text-xs text-slate-500">Mỗi môn chỉ mở danh sách người học khi cần chỉnh.</p>
          </div>
        </div>

        {courses.length > 0 ? (
          <div className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 bg-white">
            {courses.map((course) => {
              const participants = members.flatMap((member, index) => (
                [...member.sharedCourses, ...member.personalCourses].includes(course.id) ? [index] : []
              ));
              const participantNames = participants.slice(0, 3).map((index) => memberName(members[index], index));
              return (
                <div key={course.id} className="flex min-w-0 items-center gap-3 px-3 py-3 sm:px-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="shrink-0 text-xs font-semibold text-[#004A98]">{course.id}</span>
                      {course.credits && <span className="shrink-0 text-xs text-slate-400">{course.credits} TC</span>}
                    </div>
                    <p className="mt-0.5 truncate text-sm font-medium text-slate-800">{course.name}</p>
                    {participantNames.length > 0 && (
                      <p className="mt-1 truncate text-xs text-slate-500">{participantNames.join(', ')}{participants.length > 3 ? ` và ${participants.length - 3} người khác` : ''}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingCourseId(course.id)}
                    className="shrink-0 border-slate-200 text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-[#004A98]"
                  >
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">{participants.length}/{members.length} người</span>
                    <span className="sm:hidden">{participants.length}/{members.length}</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveCourse(course.id)}
                    className="h-8 w-8 shrink-0 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    title="Bỏ môn khỏi nhóm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="rounded-lg bg-slate-50 px-3 py-3 text-sm text-slate-500">Chọn môn ở “Chọn môn & Học phí”, hoặc nhập mã môn ở phần bên dưới.</p>
        )}

        <div className="mt-4 border-t border-slate-100 pt-4">
          <label className="text-sm font-semibold text-slate-800">Thêm mã môn thủ công</label>
          <p className="mt-1 text-xs text-slate-500">Nhập nhiều mã, ngăn cách bằng dấu phẩy hoặc xuống dòng.</p>
          <Textarea
            value={manualCourseInput}
            onChange={(event) => onManualCourseInputChange(event.target.value)}
            placeholder="CSC10001, MTH00003"
            className="mt-2 min-h-20 border-slate-200 text-sm focus-visible:ring-[#004A98]/25"
          />
        </div>
      </div>

      <AppDialog
        open={Boolean(editingCourse)}
        onOpenChange={(open) => !open && setEditingCourseId(null)}
        title={editingCourse ? `Ai học ${editingCourse.id}?` : 'Chọn người học'}
        description={editingCourse?.name}
        icon={Users}
        size="sm"
        footer={
          <Button type="button" onClick={() => setEditingCourseId(null)} className="w-full bg-[#004A98] text-white hover:bg-[#003d7a] sm:w-auto">
            Xong
          </Button>
        }
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <span className="text-sm text-slate-500">{participantIndexes.length}/{members.length} người học môn này</span>
          <button
            type="button"
            onClick={() => editingCourse && onUpdateCourseParticipants(editingCourse.id, members.map((_, index) => index))}
            className="text-sm font-semibold text-[#004A98] hover:text-[#003d7a]"
          >
            Chọn tất cả
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {members.map((member, index) => {
            const name = memberName(member, index);
            const checked = participantIndexes.includes(index);
            const isOnlyCourse = checked && new Set([...member.sharedCourses, ...member.personalCourses]).size <= 1;
            return (
              <label key={member.id || `${name}-${index}`} className={`flex items-center gap-3 py-3 text-sm text-slate-700 ${isOnlyCourse ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={isOnlyCourse}
                  onChange={() => toggleParticipant(index)}
                  className="h-4 w-4 rounded border-gray-300 text-[#004A98] focus:ring-[#004A98]"
                  title={isOnlyCourse ? 'Xóa thành viên nếu người này không còn học môn nào' : undefined}
                />
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">{initials(name)}</span>
                <span className="min-w-0 flex-1 truncate font-medium">{name}</span>
                {checked && <Check className="h-4 w-4 shrink-0 text-[#004A98]" />}
              </label>
            );
          })}
        </div>
      </AppDialog>
    </section>
  );
}
