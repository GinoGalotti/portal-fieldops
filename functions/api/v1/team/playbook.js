export async function onRequestGet({ env }) {
  const result = await env.portal_db.prepare(
    'SELECT state FROM team_state WHERE key = ?'
  ).bind('playbook').first();

  return new Response(result ? result.state : '{}', {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function onRequestPut({ env, request }) {
  const body = await request.text();

  try { JSON.parse(body); } catch {
    return new Response('{"error":"invalid JSON"}', { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  await env.portal_db.prepare(
    'INSERT OR REPLACE INTO team_state (key, state, updated_at) VALUES (?, ?, datetime("now"))'
  ).bind('playbook', body).run();

  return new Response('{"ok":true}', { headers: { 'Content-Type': 'application/json' } });
}
