export async function onRequestGet({ env }) {
  const row = await env.portal_db.prepare(
    'SELECT value FROM global_flags WHERE key = ?'
  ).bind('campbell-logs-hints').first();

  return new Response(JSON.stringify({ value: row ? row.value : 'hidden' }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function onRequestPut({ env, request }) {
  const body = await request.text();
  let parsed;
  try { parsed = JSON.parse(body); } catch {
    return new Response('{"error":"invalid JSON"}', { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  if (parsed.value !== 'revealed' && parsed.value !== 'hidden') {
    return new Response('{"error":"value must be \\"revealed\\" or \\"hidden\\""}', { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  await env.portal_db.prepare(
    'INSERT OR REPLACE INTO global_flags (key, value, updated_at) VALUES (?, ?, datetime("now"))'
  ).bind('campbell-logs-hints', parsed.value).run();

  return new Response('{"ok":true}', { headers: { 'Content-Type': 'application/json' } });
}
