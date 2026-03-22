import { validateAuth, unauthorized, forbidden } from '../../../_auth.js';

export async function onRequestGet({ params, env }) {
  const result = await env.portal_db.prepare(
    'SELECT state FROM player_reports WHERE week = ? AND hunter_id = ?'
  ).bind(params.week, params.hunter).first();

  return new Response(result ? result.state : '{}', {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function onRequestPut({ params, env, request }) {
  const user = await validateAuth(request, env);
  if (!user) return unauthorized();
  if (user.role !== 'admin' && user.sub !== params.hunter) return forbidden();

  const body = await request.text();
  try { JSON.parse(body); } catch {
    return new Response('{"error":"invalid JSON"}', { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  await env.portal_db.prepare(
    'INSERT OR REPLACE INTO player_reports (week, hunter_id, state, updated_at) VALUES (?, ?, ?, datetime("now"))'
  ).bind(params.week, params.hunter, body).run();

  return new Response('{"ok":true}', { headers: { 'Content-Type': 'application/json' } });
}
