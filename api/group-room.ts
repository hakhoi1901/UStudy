import { VercelRequest, VercelResponse } from '@vercel/node';

type GroupRoomPayload = {
    roomId: string;
    members: any[];
    updatedAt: string;
};

const memoryRooms = new Map<string, GroupRoomPayload>();

function getJwtRole(token: string): string {
    const payload = token.split('.')[1];
    if (!payload) return 'unknown';

    try {
        const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = Buffer.from(normalized, 'base64').toString('utf8');
        return JSON.parse(decoded)?.role || 'unknown';
    } catch {
        return 'unknown';
    }
}

function createSupabaseError(action: 'read' | 'write', status: number, body: string, key: string): Error {
    const role = getJwtRole(key);
    const rlsHint = status === 401 && body.includes('42501')
        ? ` Key role is "${role}". If this is anon, enable RLS policies for group_rooms or replace SUPABASE_SERVICE_ROLE_KEY with the real service_role key.`
        : '';

    return new Error(`Supabase ${action} failed: ${status} ${body}${rlsHint}`);
}

function getSupabaseConfig() {
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    const table = process.env.SUPABASE_GROUP_ROOMS_TABLE || 'group_rooms';

    return url && key ? { url, key, table } : null;
}

function normalizeRoomId(value: unknown): string {
    return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 32);
}

function makeRoom(roomId: string, members: any[] = []): GroupRoomPayload {
    return {
        roomId,
        members,
        updatedAt: new Date().toISOString(),
    };
}

async function readSupabaseRoom(roomId: string): Promise<GroupRoomPayload | null> {
    const config = getSupabaseConfig();
    if (!config) return null;

    const response = await fetch(`${config.url}/rest/v1/${config.table}?room_id=eq.${encodeURIComponent(roomId)}&select=payload`, {
        headers: {
            Authorization: `Bearer ${config.key}`,
            apikey: config.key,
        },
    });

    if (!response.ok) {
        const message = await response.text().catch(() => '');
        throw createSupabaseError('read', response.status, message, config.key);
    }

    const rows = await response.json();
    return rows?.[0]?.payload ?? null;
}

async function writeSupabaseRoom(room: GroupRoomPayload): Promise<void> {
    const config = getSupabaseConfig();
    if (!config) return;

    const response = await fetch(`${config.url}/rest/v1/${config.table}?on_conflict=room_id`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${config.key}`,
            apikey: config.key,
            'Content-Type': 'application/json',
            Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
            room_id: room.roomId,
            payload: room,
            updated_at: room.updatedAt,
        }),
    });

    if (!response.ok) {
        const message = await response.text().catch(() => '');
        throw createSupabaseError('write', response.status, message, config.key);
    }
}

async function readRoom(roomId: string): Promise<{ room: GroupRoomPayload; storage: 'supabase' | 'memory' }> {
    const hasSupabase = Boolean(getSupabaseConfig());
    if (hasSupabase) {
        const supabaseRoom = await readSupabaseRoom(roomId);
        return { room: supabaseRoom ?? makeRoom(roomId), storage: 'supabase' };
    }

    return { room: memoryRooms.get(roomId) ?? makeRoom(roomId), storage: 'memory' };
}

async function writeRoom(room: GroupRoomPayload): Promise<'supabase' | 'memory'> {
    if (getSupabaseConfig()) {
        await writeSupabaseRoom(room);
        return 'supabase';
    }

    memoryRooms.set(room.roomId, room);
    return 'memory';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        if (req.method === 'GET') {
            const roomId = normalizeRoomId(req.query.roomId);
            if (!roomId) return res.status(400).json({ error: 'Missing roomId.' });

            const { room, storage } = await readRoom(roomId);
            return res.status(200).json({ room, storage });
        }

        if (req.method === 'POST') {
            const roomId = normalizeRoomId(req.body?.roomId);
            const member = req.body?.member;

            if (!roomId) return res.status(400).json({ error: 'Missing roomId.' });
            if (!member?.memberId) return res.status(400).json({ error: 'Missing member.memberId.' });

            const { room } = await readRoom(roomId);
            const nextMembers = [
                ...room.members.filter((item) => item?.memberId !== member.memberId),
                member,
            ];
            const nextRoom = makeRoom(roomId, nextMembers);
            const storage = await writeRoom(nextRoom);

            return res.status(200).json({ room: nextRoom, storage });
        }

        return res.status(405).json({ error: 'Method Not Allowed.' });
    } catch (error: any) {
        return res.status(500).json({ error: error?.message || 'Internal Server Error.' });
    }
}
