import { STORAGE_KEYS } from '../config';
import type { GroupMemberToken } from '../logic/scheduler/GroupTypes';

const MEMBER_ID_STORAGE_KEY = `${STORAGE_KEYS.ACTIVE_GROUP_SCHEDULE}_member_id`;

export interface GroupRoomPayload {
  roomId: string;
  members: GroupMemberToken[];
  updatedAt: string;
}

export interface GroupRoomApiResponse {
  room: GroupRoomPayload;
  storage: 'supabase' | 'memory';
}

export function createGroupRoomId(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((byte) => byte.toString(36).padStart(2, '0').slice(-2).toUpperCase())
    .join('')
    .slice(0, 8);
}

export function getLocalGroupMemberId(): string {
  const existing = localStorage.getItem(MEMBER_ID_STORAGE_KEY);
  if (existing) return existing;

  const memberId = crypto.randomUUID();
  localStorage.setItem(MEMBER_ID_STORAGE_KEY, memberId);
  return memberId;
}

export function getGroupRoomIdFromUrl(): string {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get('room')?.trim().toUpperCase() || '';
}

export function buildGroupRoomUrl(roomId: string): string {
  return `${window.location.origin}/group?room=${encodeURIComponent(roomId)}`;
}

export function setGroupRoomUrl(roomId: string) {
  if (typeof window === 'undefined') return;
  window.history.replaceState(null, '', `/group?room=${encodeURIComponent(roomId)}`);
}

export async function fetchGroupRoom(roomId: string): Promise<GroupRoomApiResponse> {
  const response = await fetch(`/api/group-room?roomId=${encodeURIComponent(roomId)}`);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error || 'Không tải được phòng nhóm.');
  }

  return data;
}

export async function upsertGroupRoomMember(roomId: string, member: GroupMemberToken): Promise<GroupRoomApiResponse> {
  const response = await fetch('/api/group-room', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId, member }),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error || 'Không đồng bộ được thành viên lên phòng nhóm.');
  }

  return data;
}
