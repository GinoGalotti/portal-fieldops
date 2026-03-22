const KEY = 'evidence-visibility';

export async function onRequestGet({ env }) {
  const row = await env.portal_db.prepare(
    'SELECT value FROM global_flags WHERE key = ?'
  ).bind(KEY).first();

  const state = row ? JSON.parse(row.value) : { revealed: [], manually_hidden: [] };
  // Normalise in case state was written by older code
  if (!state.revealed)         state.revealed         = [];
  if (!state.manually_hidden)  state.manually_hidden  = [];

  return new Response(JSON.stringify(state), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function onRequestPut({ env, request }) {
  const body = await request.text();
  let parsed;
  try { parsed = JSON.parse(body); } catch {
    return new Response('{"error":"invalid JSON"}', { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  if (!Array.isArray(parsed.revealed) || !Array.isArray(parsed.manually_hidden)) {
    return new Response('{"error":"revealed and manually_hidden must be arrays"}', { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const state = { revealed: parsed.revealed, manually_hidden: parsed.manually_hidden };
  await env.portal_db.prepare(
    'INSERT OR REPLACE INTO global_flags (key, value, updated_at) VALUES (?, ?, datetime("now"))'
  ).bind(KEY, JSON.stringify(state)).run();

  return new Response('{"ok":true}', { headers: { 'Content-Type': 'application/json' } });
}
