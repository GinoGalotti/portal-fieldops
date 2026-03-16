export async function onRequestGet({ params, env }) {
  const row = await env.portal_db.prepare(
    'SELECT enabled FROM player_report_visibility WHERE week = ?'
  ).bind(params.week).first();
  // No row = not yet set = default locked
  const enabled = row === null ? false : row.enabled === 1;
  return new Response(JSON.stringify({ week: params.week, enabled }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function onRequestPut({ params, env, request }) {
  let parsed;
  try { parsed = await request.json(); } catch {
    return new Response('{"error":"invalid JSON"}', { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
  if (typeof parsed.enabled !== 'boolean') {
    return new Response('{"error":"enabled must be boolean"}', { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
  await env.portal_db.prepare(
    'INSERT OR REPLACE INTO player_report_visibility (week, enabled, updated_at) VALUES (?, ?, datetime("now"))'
  ).bind(params.week, parsed.enabled ? 1 : 0).run();
  return new Response(JSON.stringify({ ok: true, week: params.week, enabled: parsed.enabled }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
