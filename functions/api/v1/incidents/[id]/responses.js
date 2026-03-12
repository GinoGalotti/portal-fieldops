// GET  /api/v1/incidents/:id/responses — all responses for an incident (keeper export)
// POST /api/v1/incidents/:id/responses — submit a response

export async function onRequestGet({ params, env }) {
  const { id } = params;
  const { results } = await env.portal_db
    .prepare('SELECT id, incident_id, hunter_name, response_text, submitted_at FROM incident_responses WHERE incident_id = ? ORDER BY id')
    .bind(id)
    .all();
  return Response.json(results || []);
}

export async function onRequestPost({ params, env, request }) {
  const { id } = params;
  const body = await request.json();
  const name = ((body.name || '').trim() || 'Anonymous').slice(0, 100);
  const text = (body.text || '').trim().slice(0, 5000);
  if (!text) return Response.json({ error: 'text required' }, { status: 400 });
  const now = new Date().toISOString();
  const result = await env.portal_db
    .prepare('INSERT INTO incident_responses (incident_id, hunter_name, response_text, submitted_at) VALUES (?, ?, ?, ?)')
    .bind(id, name, text, now)
    .run();
  return Response.json({ ok: true, id: result.meta.last_row_id });
}
