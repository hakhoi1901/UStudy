import { SyncSession } from './SyncSession';
import type { Env } from './env';
import { isAllowedOrigin, isValidSessionId, parseAllowedOrigins, SYNC_PROTOCOL } from './protocol';

export { SyncSession };

function corsHeaders(request: Request, env: Env): HeadersInit {
  const origin = request.headers.get('Origin');
  if (!isAllowedOrigin(origin, parseAllowedOrigins(env.ALLOWED_ORIGINS))) return {};
  return {
    'Access-Control-Allow-Origin': origin!,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
}

function json(value: unknown, request: Request, env: Env, status = 200): Response {
  return new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json', ...corsHeaders(request, env) } });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/health' && request.method === 'GET') {
      return json({ ok: true, service: 'ustudy-sync-signaling', protocol: SYNC_PROTOCOL }, request, env);
    }
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(request, env) });

    const match = url.pathname.match(/^\/session\/([^/]+)$/);
    if (!match) return json({ error: 'not_found' }, request, env, 404);
    if (!isValidSessionId(match[1])) return json({ error: 'invalid_session_id' }, request, env, 400);
    if (!isAllowedOrigin(request.headers.get('Origin'), parseAllowedOrigins(env.ALLOWED_ORIGINS))) {
      return json({ error: 'origin_not_allowed' }, request, env, 403);
    }
    if (request.headers.get('Upgrade')?.toLowerCase() !== 'websocket') return json({ error: 'websocket_required' }, request, env, 426);

    const stub = env.SYNC_SESSION.getByName(match[1]);
    return stub.fetch(request);
  },
};
