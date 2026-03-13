// GET  /api/v1/maps/:id/state  — returns { location_id: true, ... } of unlocked areas
// PUT  /api/v1/maps/:id/state  — persists full unlock state (JSON object)

export async function onRequestGet({ params, env }) {
  const row = await env.portal_db
    .prepare('SELECT state FROM map_state WHERE map_id = ?')
    .bind(params.id)
    .first();
  if (!row) return Response.json({});
  try {
    return Response.json(JSON.parse(row.state));
  } catch {
    return Response.json({});
  }
}

export async function onRequestPut({ params, env, request }) {
  const body = await request.json();
  const state = JSON.stringify(body);
  const now = new Date().toISOString();
  await env.portal_db
    .prepare('INSERT OR REPLACE INTO map_state (map_id, state, updated_at) VALUES (?, ?, ?)')
    .bind(params.id, state, now)
    .run();
  return Response.json({ ok: true });
}
