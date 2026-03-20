// POST /api/auth/login
// Body: { username, password }
// Returns: { token, user: { username, role, display } } or 401

import { signJWT } from '../v1/_auth.js';

const DISPLAY = {
  rex:   'Rex Bangley',
  alan:  'Alan Frazier',
  reed:  'Reed Atwood',
  sven:  'Sven',
  john:  'John Johnson',
  admin: 'Keeper',
};

const ROLE = {
  rex: 'player', alan: 'player', reed: 'player',
  sven: 'player', john: 'player', admin: 'admin',
};

export async function onRequestPost({ request, env }) {
  if (!env.AUTH_PASSWORDS || !env.AUTH_JWT_SECRET) {
    return Response.json({ error: 'auth not configured' }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  if (!body || !body.username || !body.password) {
    return Response.json({ error: 'username and password required' }, { status: 400 });
  }

  let passwords;
  try { passwords = JSON.parse(env.AUTH_PASSWORDS); }
  catch { return Response.json({ error: 'server error' }, { status: 500 }); }

  const username = String(body.username).toLowerCase().trim();

  // Reject unknown usernames or wrong passwords with the same generic message
  if (!DISPLAY[username] || !passwords[username] || passwords[username] !== String(body.password)) {
    return Response.json({ error: 'Invalid username or password' }, { status: 401 });
  }

  const role    = ROLE[username];
  const display = DISPLAY[username];
  const now     = Math.floor(Date.now() / 1000);
  const token   = await signJWT(
    { sub: username, role, display, iat: now, exp: now + 30 * 24 * 60 * 60 },
    env.AUTH_JWT_SECRET
  );

  return Response.json({ token, user: { username, role, display } });
}
