import { Badge } from './ui/badge';
import type { ClassPreferenceSelection, GroupMemberToken } from '../logic/scheduler/GroupTypes';
import { formatDaysOff } from '../utils/dayOffPreferences';

interface GroupMemberCardProps {
  member: GroupMemberToken;
  index: number;
}

function normalizeSelection(value: string[] | ClassPreferenceSelection): ClassPreferenceSelection {
  if (Array.isArray(value)) return { preferred: value };
  return value;
}

export function GroupMemberCard({ member, index }: GroupMemberCardProps) {
  const nickname = member.nickname || `Thành viên ${index + 1}`;
  const hasBusyMask = Array.isArray(member.busyMask) && member.busyMask.some((part) => part !== 0);
  const registeredCourses = Array.from(new Set([...member.sharedCourses, ...member.personalCourses]));
  const preferredClassEntries = Object.entries(member.preferredClasses ?? {})
    .map(([courseId, selection]) => [courseId, normalizeSelection(selection)] as const)
    .filter(([, selection]) => (
      (selection.excluded?.length ?? 0) +
      (selection.preferred?.length ?? 0) +
      (selection.required?.length ?? 0)
    ) > 0);
  const prefs = member.personalConfig;
  const hasPersonalSettings = Boolean(prefs || preferredClassEntries.length > 0 || hasBusyMask);

  const sessionLabel = prefs?.session === '1' ? 'Sáng' : prefs?.session === '2' ? 'Chiều' : 'Tự do';
  const strategyLabel = prefs?.strategy === 'spread' ? 'Trải đều' : 'Dồn lịch';

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-gray-900">{nickname}</div>
          <div className="text-xs text-gray-500">{registeredCourses.length} môn</div>
        </div>
        {hasPersonalSettings && <Badge variant="outline">Có cấu hình</Badge>}
      </div>

      <div className="space-y-3">
        <div>
          <div className="mb-1.5 text-xs font-medium text-gray-500">Môn đăng ký</div>
          <div className="flex flex-wrap gap-1.5">
            {registeredCourses.length > 0 ? (
              registeredCourses.map((course) => (
                <Badge key={course} variant="secondary">{course}</Badge>
              ))
            ) : (
              <span className="text-xs text-gray-400">Chưa chọn</span>
            )}
          </div>
        </div>

        {hasPersonalSettings && (
          <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
            <div className="mb-2 text-xs font-medium text-gray-600">Cấu hình cá nhân</div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div><span className="text-gray-400">Buổi:</span> {sessionLabel}</div>
              <div><span className="text-gray-400">Kiểu:</span> {strategyLabel}</div>
              <div><span className="text-gray-400">Tiết trống:</span> {prefs?.noGaps ? 'Hạn chế' : 'Cho phép'}</div>
              <div><span className="text-gray-400">Ngày nghỉ:</span> {formatDaysOff(prefs?.daysOff)}</div>
            </div>

            {preferredClassEntries.length > 0 && (
              <div className="mt-2 border-t border-gray-200 pt-2">
                <div className="mb-1 text-xs text-gray-400">Cấu hình lớp</div>
                <div className="space-y-1">
                  {preferredClassEntries.map(([courseId, selection]) => (
                    <div key={courseId} className="text-xs text-gray-600">
                      <span className="font-mono font-medium text-gray-800">{courseId}</span>:{' '}
                      {[
                        selection.excluded?.length ? `cấm ${selection.excluded.join(', ')}` : null,
                        selection.preferred?.length ? `ưu tiên ${selection.preferred.join(', ')}` : null,
                        selection.required?.length ? `bắt buộc ${selection.required.join(', ')}` : null,
                      ].filter(Boolean).join('; ')}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hasBusyMask && <div className="mt-2 text-xs text-gray-500">Có lịch bận ngoài nhóm.</div>}
          </div>
        )}
      </div>
    </div>
  );
}
