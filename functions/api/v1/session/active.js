export async function onRequestGet({ env }) {
  const result = await env.portal_db.prepare(
    'SELECT session_id FROM active_session WHERE id = ?'
  ).bind('global').first();

  return new Response(JSON.stringify({ session_id: result ? result.session_id : 'w3' }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function onRequestPut({ env, request }) {
  const body = await request.text();
  let parsed;
  try { parsed = JSON.parse(body); } catch {
    return new Response('{"error":"invalid JSON"}', { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  if (!parsed.session_id) {
    return new Response('{"error":"missing session_id"}', { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  await env.portal_db.prepare(
    'INSERT OR REPLACE INTO active_session (id, session_id, updated_at) VALUES (?, ?, datetime("now"))'
  ).bind('global', parsed.session_id).run();

  return new Response('{"ok":true}', { headers: { 'Content-Type': 'application/json' } });
}
