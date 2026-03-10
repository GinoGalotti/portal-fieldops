export async function onRequestGet({ params, env }) {
  const result = await env.portal_db.prepare(
    'SELECT state FROM field_reports WHERE session_id = ?'
  ).bind(params.id).first();

  return new Response(result ? result.state : '{}', {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function onRequestPut({ params, env, request }) {
  const body = await request.text();

  try { JSON.parse(body); } catch {
    return new Response('{"error":"invalid JSON"}', { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  await env.portal_db.prepare(
    'INSERT OR REPLACE INTO field_reports (session_id, state, updated_at) VALUES (?, ?, datetime("now"))'
  ).bind(params.id, body).run();

  return new Response('{"ok":true}', { headers: { 'Content-Type': 'application/json' } });
}
