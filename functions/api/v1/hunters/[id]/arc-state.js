export async function onRequestGet({ params, env }) {
  const result = await env.portal_db.prepare(
    'SELECT state FROM hunter_arc_state WHERE hunter_id = ?'
  ).bind(params.id).first();

  return new Response(result ? result.state : '{}', {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function onRequestPut({ params, env, request }) {
  const body = await request.text();

  // Basic sanity check — must be valid JSON
  try { JSON.parse(body); } catch {
    return new Response('{"error":"invalid JSON"}', { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  await env.portal_db.prepare(
    'INSERT OR REPLACE INTO hunter_arc_state (hunter_id, state, updated_at) VALUES (?, ?, datetime("now"))'
  ).bind(params.id, body).run();

  return new Response('{"ok":true}', { headers: { 'Content-Type': 'application/json' } });
}
