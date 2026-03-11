// GET  /api/v1/rolls?limit=200&after=<id>   — feed poll (after = last known id)
// GET  /api/v1/rolls?limit=200&offset=<n>   — pagination (load older)
// POST /api/v1/rolls                        — log a roll

export async function onRequestGet({ request, env }) {
  const url    = new URL(request.url);
  const limit  = Math.min(parseInt(url.searchParams.get('limit')  || '200', 10), 500);
  const after  = parseInt(url.searchParams.get('after')  || '0',   10);
  const offset = parseInt(url.searchParams.get('offset') || '0',   10);

  let result;
  if (after > 0) {
    // Polling: only return rows newer than known id
    result = await env.portal_db
      .prepare('SELECT * FROM rolls WHERE id > ? ORDER BY id ASC LIMIT ?')
      .bind(after, limit)
      .all();
  } else {
    // Initial load or pagination: newest first, then reverse client-side
    result = await env.portal_db
      .prepare('SELECT * FROM rolls ORDER BY id DESC LIMIT ? OFFSET ?')
      .bind(limit, offset)
      .all();
  }

  return Response.json(result.results || []);
}

export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => null);
  if (!body || !body.move_name) {
    return Response.json({ error: 'invalid body' }, { status: 400 });
  }

  // Custom thresholds: 13+ advanced, 11-12 hit, 7-10 partial, 6- miss
  const outcome = body.total >= 13 ? 'advanced' : body.total >= 11 ? 'hit' : body.total >= 7 ? 'partial' : 'miss';

  const result = await env.portal_db
    .prepare(`INSERT INTO rolls
      (hunter_id, session, move_name, stat_used, roll_1, roll_2, modifier, total, outcome, note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(
      body.hunter_id  || null,
      body.session    || null,
      body.move_name,
      body.stat_used  || null,
      body.roll_1,
      body.roll_2,
      body.modifier   || 0,
      body.total,
      outcome,
      body.note       || null
    )
    .run();

  return Response.json({ ok: true, id: result.meta.last_row_id, outcome });
}
