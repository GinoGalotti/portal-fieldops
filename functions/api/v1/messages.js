// GET    /api/v1/messages?after=<id>&limit=100    — feed poll
// GET    /api/v1/messages?offset=<n>&limit=100   — pagination
// POST   /api/v1/messages                        — post a message or handout
// DELETE /api/v1/messages?session_id=<key>       — clear all non-message handouts for a session

import { validateAuth, unauthorized, forbidden } from './_auth.js';

export async function onRequestGet({ request, env }) {
  const url    = new URL(request.url);
  const limit  = Math.min(parseInt(url.searchParams.get('limit')  || '100', 10), 500);
  const after  = parseInt(url.searchParams.get('after')  || '0', 10);
  const offset = parseInt(url.searchParams.get('offset') || '0', 10);

  let result;
  if (after > 0) {
    result = await env.portal_db
      .prepare('SELECT * FROM messages WHERE id > ? AND delivered = 1 ORDER BY id ASC LIMIT ?')
      .bind(after, limit)
      .all();
  } else {
    result = await env.portal_db
      .prepare('SELECT * FROM messages WHERE delivered = 1 ORDER BY id DESC LIMIT ? OFFSET ?')
      .bind(limit, offset)
      .all();
  }

  return Response.json(result.results || []);
}

export async function onRequestPost({ request, env }) {
  const user = await validateAuth(request, env);
  if (!user) return unauthorized();

  const body = await request.json().catch(() => null);
  const isStructured = body && body.type && body.type !== 'message';

  // Only admin may post handouts / structured messages; any authenticated user may post chat
  if (isStructured && user.role !== 'admin') return forbidden();

  if (!body || (!isStructured && !body.body)) {
    return Response.json({ error: 'invalid body' }, { status: 400 });
  }

  // For regular chat messages, override sender with the authenticated user's display name
  const sender = isStructured
    ? (body.sender || 'CAMPBELL')
    : (user.display || user.sub || 'OPERATIVE');

  const result = await env.portal_db
    .prepare(`INSERT INTO messages (session_id, sender, recipient, subject, body, type, payload, delivered, delivered_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, datetime('now'))`)
    .bind(
      body.session_id || null,
      sender,
      body.recipient  || 'all',
      body.subject    || null,
      body.body || '',
      body.type       || 'message',
      body.payload    ? JSON.stringify(body.payload) : null
    )
    .run();

  return Response.json({ ok: true, id: result.meta.last_row_id });
}

export async function onRequestDelete({ request, env }) {
  const user = await validateAuth(request, env);
  if (!user) return unauthorized();
  if (user.role !== 'admin') return forbidden();

  const url       = new URL(request.url);
  const sessionId = url.searchParams.get('session_id');
  if (!sessionId) {
    return Response.json({ error: 'session_id required' }, { status: 400 });
  }

  await env.portal_db
    .prepare(`DELETE FROM messages WHERE session_id = ? AND type != 'message'`)
    .bind(sessionId)
    .run();

  return Response.json({ ok: true });
}
