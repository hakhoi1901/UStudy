import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

import { fileURLToPath, URL } from "node:url";

const localGroupRooms = new Map<string, any>();

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

function normalizeGroupRoomId(value: unknown): string {
  return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 32);
}

function makeGroupRoom(roomId: string, members: any[] = []) {
  return {
    roomId,
    members,
    updatedAt: new Date().toISOString(),
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;
  const supabaseGroupRoomsTable = env.SUPABASE_GROUP_ROOMS_TABLE || 'group_rooms';

  const readSupabaseGroupRoom = async (roomId: string) => {
    if (!supabaseUrl || !supabaseKey) return null;

    const response = await fetch(`${supabaseUrl}/rest/v1/${supabaseGroupRoomsTable}?room_id=eq.${encodeURIComponent(roomId)}&select=payload`, {
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        apikey: supabaseKey,
      },
    });

    if (!response.ok) {
      throw createSupabaseError('read', response.status, await response.text().catch(() => ''), supabaseKey);
    }

    const rows = await response.json() as any[];
    return rows?.[0]?.payload ?? null;
  };

  const writeSupabaseGroupRoom = async (room: any) => {
    if (!supabaseUrl || !supabaseKey) return false;

    const response = await fetch(`${supabaseUrl}/rest/v1/${supabaseGroupRoomsTable}?on_conflict=room_id`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        apikey: supabaseKey,
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
      throw createSupabaseError('write', response.status, await response.text().catch(() => ''), supabaseKey);
    }

    return true;
  };

  return {
    plugins: [
      react(),
      tailwindcss(),
      basicSsl(),
      // Middleware giả lập Vercel Serverless (chỉ dùng cho dev)
      {
        name: 'api-fallback',
        configureServer(server) {
          server.middlewares.use('/api/group-room', (req, res) => {
            const url = new URL(req.url || '', 'http://localhost');
            const sendJson = (statusCode: number, payload: any) => {
              res.statusCode = statusCode;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(payload));
            };

            if (req.method === 'GET') {
              void (async () => {
                const roomId = normalizeGroupRoomId(url.searchParams.get('roomId'));
                if (!roomId) {
                  sendJson(400, { error: 'Missing roomId.' });
                  return;
                }

                const supabaseRoom = await readSupabaseGroupRoom(roomId);
                if (supabaseRoom) {
                  sendJson(200, { room: supabaseRoom, storage: 'supabase' });
                  return;
                }

                sendJson(200, {
                  room: localGroupRooms.get(roomId) ?? makeGroupRoom(roomId),
                  storage: supabaseUrl && supabaseKey ? 'supabase' : 'memory',
                });
              })().catch((error: any) => sendJson(500, { error: error?.message || 'Internal Server Error.' }));
              return;
            }

            if (req.method !== 'POST') {
              sendJson(405, { error: 'Method Not Allowed' });
              return;
            }

            let body = '';
            req.on('data', (chunk) => { body += chunk.toString(); });
            req.on('end', () => {
              try {
                const parsedBody = JSON.parse(body || '{}');
                const roomId = normalizeGroupRoomId(parsedBody.roomId);
                const member = parsedBody.member;

                if (!roomId) {
                  sendJson(400, { error: 'Missing roomId.' });
                  return;
                }

                if (!member?.memberId) {
                  sendJson(400, { error: 'Missing member.memberId.' });
                  return;
                }

                void (async () => {
                  const previousRoom = await readSupabaseGroupRoom(roomId) ?? localGroupRooms.get(roomId) ?? makeGroupRoom(roomId);
                  const room = makeGroupRoom(roomId, [
                    ...previousRoom.members.filter((item: any) => item?.memberId !== member.memberId),
                    member,
                  ]);

                  const wroteSupabase = await writeSupabaseGroupRoom(room);
                  if (!wroteSupabase) localGroupRooms.set(roomId, room);

                  sendJson(200, { room, storage: wroteSupabase ? 'supabase' : 'memory' });
                })().catch((error: any) => sendJson(500, { error: error?.message || 'Internal Server Error.' }));
              } catch (error: any) {
                sendJson(500, { error: error?.message || 'Internal Server Error.' });
              }
            });
          });

          server.middlewares.use('/api/chat', (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.end(JSON.stringify({ error: 'Method Not Allowed' }));
              return;
            }

            let body = '';
            req.on('data', (chunk) => { body += chunk.toString(); });
            req.on('end', async () => {
              try {
                const parsedBody = JSON.parse(body);
                const geminiApiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY;
                const groqApiKey = env.VITE_GROQ_API_KEY || env.GROQ_API_KEY;
                const groqModel = env.VITE_GROQ_MODEL || env.GROQ_MODEL || 'llama-3.3-70b-specdec';

                if (!geminiApiKey && !groqApiKey) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: 'Chưa cấu hình API Key ở local.' }));
                  return;
                }

                const { systemInstruction, history, newMessage } = parsedBody;

                const callGemini = async () => {
                  if (!geminiApiKey) throw new Error('NO_GEMINI_KEY');
                  const contents = (history || []).map((msg: any) => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.content }]
                  }));
                  contents.push({ role: 'user', parts: [{ text: newMessage }] });

                  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
                  const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      contents,
                      systemInstruction: { parts: [{ text: systemInstruction || '' }] },
                      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
                    })
                  });

                  if (!response.ok) {
                    const err = await response.json().catch(() => ({})) as any;
                    const errMsg = err?.error?.message || '';
                    if (response.status === 429 || errMsg.toLowerCase().includes('quota') || errMsg.toLowerCase().includes('exhausted')) {
                      throw new Error('RATE_LIMIT');
                    }
                    throw new Error(errMsg);
                  }

                  const result = await response.json() as any;
                  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (!text) throw new Error('API Gemini không trả về dữ liệu');
                  return text;
                };

                const callGroq = async () => {
                  if (!groqApiKey) throw new Error('NO_GROQ_KEY');
                  const messages = [
                    { role: 'system', content: systemInstruction || '' },
                    ...(history || []).map((msg: any) => ({
                      role: msg.role === 'user' ? 'user' : 'assistant',
                      content: msg.content
                    })),
                    { role: 'user', content: newMessage }
                  ];

                  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${groqApiKey}`
                    },
                    body: JSON.stringify({
                      model: groqModel,
                      messages,
                      temperature: 0.7,
                      max_tokens: 2048
                    })
                  });

                  if (!response.ok) {
                    const err = await response.json().catch(() => ({})) as any;
                    throw new Error(err?.error?.message || 'Lỗi Groq API');
                  }

                  const result = await response.json() as any;
                  const text = result?.choices?.[0]?.message?.content;
                  if (!text) throw new Error('API Groq không trả về dữ liệu');
                  return text;
                };

                res.setHeader('Content-Type', 'application/json');

                try {
                  if (geminiApiKey) {
                    const reply = await callGemini();
                    res.end(JSON.stringify({ reply, provider: 'gemini' }));
                    return;
                  } else {
                    throw new Error('NO_GEMINI_KEY');
                  }
                } catch (error: any) {
                  const isRateLimit = error.message === 'RATE_LIMIT';
                  const isNoKey = error.message === 'NO_GEMINI_KEY';

                  if ((isRateLimit || isNoKey) && groqApiKey) {
                    console.log(`[Local Fallback] Gemini bận, chuyển sang Groq...`);
                    try {
                      const reply = await callGroq();
                      res.end(JSON.stringify({ reply, provider: 'groq' }));
                      return;
                    } catch (groqError: any) {
                      res.statusCode = 500;
                      res.end(JSON.stringify({ error: `Cả Gemini và Groq đều lỗi: ${groqError.message}` }));
                      return;
                    }
                  }

                  if (isRateLimit) {
                    res.statusCode = 429;
                    res.end(JSON.stringify({ error: 'Server đang bận (Chưa cấu hình Groq)' }));
                    return;
                  }

                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: error.message }));
                }

              } catch (e: any) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: e.message }));
              }
            });
          });
        }
      }
    ],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      target: 'esnext',
      outDir: 'dist',
    },
    server: {
      host: '0.0.0.0',
      port: 3005,
      open: true,
    },
  };
});
