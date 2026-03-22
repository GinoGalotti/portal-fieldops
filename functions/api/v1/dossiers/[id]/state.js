// GET  /api/v1/dossiers/:id/state  — returns { revealed: bool } for clue highlight state
// PUT  /api/v1/dossiers/:id/state  — persists { revealed: bool }

export async function onRequestGet({ params, env }) {
  const row = await env.portal_db
    .prepare('SELECT state FROM dossier_state WHERE dossier_id = ?')
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
    .prepare('INSERT OR REPLACE INTO dossier_state (dossier_id, state, updated_at) VALUES (?, ?, ?)')
    .bind(params.id, state, now)
    .run();
  return Response.json({ ok: true });
}
