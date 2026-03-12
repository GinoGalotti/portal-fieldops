// GET  /api/v1/incidents/:id/state — load saved choice state for a week
// PUT  /api/v1/incidents/:id/state — persist choice state for a week

export async function onRequestGet({ params, env }) {
  const { id } = params;
  const row = await env.portal_db
    .prepare('SELECT state FROM incident_state WHERE week = ?')
    .bind(id)
    .first();
  if (!row) return Response.json({});
  try {
    return Response.json(JSON.parse(row.state));
  } catch {
    return Response.json({});
  }
}

export async function onRequestPut({ params, env, request }) {
  const { id } = params;
  const body = await request.json();
  const state = JSON.stringify(body);
  const now = new Date().toISOString();
  await env.portal_db
    .prepare('INSERT OR REPLACE INTO incident_state (week, state, updated_at) VALUES (?, ?, ?)')
    .bind(id, state, now)
    .run();
  return Response.json({ ok: true });
}
