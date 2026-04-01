// GET  /api/v1/rolls?limit=200&after=<id>   — feed poll (after = last known id)
// GET  /api/v1/rolls?limit=200&offset=<n>   — pagination (load older)
// POST /api/v1/rolls                        — log a roll

import { validateAuth, unauthorized } from './_auth.js';

export async function onRequestGet({ request, env }) {
  const url    = new URL(request.url);
  const limit  = Math.min(parseInt(url.searchParams.get('limit')  || '200', 10), 500);
  const after  = parseInt(url.searchParams.get('after')  || '0',   10);
  const offset = parseInt(url.searchParams.get('offset') || '0',   10);

  let result;
  if (after > 0) {
    result = await env.portal_db
      .prepare('SELECT * FROM rolls WHERE id > ? ORDER BY id ASC LIMIT ?')
      .bind(after, limit)
      .all();
  } else {
    result = await env.portal_db
      .prepare('SELECT * FROM rolls ORDER BY id DESC LIMIT ? OFFSET ?')
      .bind(limit, offset)
      .all();
  }

  return Response.json(result.results || []);
}

export async function onRequestPost({ request, env }) {
  const user = await validateAuth(request, env);
  if (!user) return unauthorized();

  const body = await request.json().catch(() => null);
  if (!body || !body.move_name) {
    return Response.json({ error: 'invalid body' }, { status: 400 });
  }

  // Custom thresholds: 13+ advanced, 10-12 hit, 7-9 partial, 6- miss
  const outcome = body.total >= 13 ? 'advanced' : body.total >= 10 ? 'hit' : body.total >= 7 ? 'partial' : 'miss';

  const result = await env.portal_db
    .prepare(`INSERT INTO rolls
      (hunter_id, session, move_name, stat_used, roll_1, roll_2, modifier, total, outcome, outcome_text, note, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`)
    .bind(
      body.hunter_id    || null,
      body.session      || null,
      body.move_name,
      body.stat_used    || null,
      body.roll_1,
      body.roll_2,
      body.modifier     || 0,
      body.total,
      outcome,
      body.outcome_text || null,
      body.note         || null
    )
    .run();

  return Response.json({ ok: true, id: result.meta.last_row_id, outcome });
}
