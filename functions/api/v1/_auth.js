// Shared JWT utilities for Cloudflare Pages Functions (Web Crypto API)
// Import: import { validateAuth, signJWT, unauthorized, forbidden } from './_auth.js';

function _b64url(data) {
  let binary = '';
  if (typeof data === 'string') {
    new TextEncoder().encode(data).forEach(b => binary += String.fromCharCode(b));
  } else {
    new Uint8Array(data).forEach(b => binary += String.fromCharCode(b));
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function _b64urlDecode(str) {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}

async function _importKey(secret, usage) {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    [usage]
  );
}

export async function signJWT(payload, secret) {
  const header = _b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body   = _b64url(JSON.stringify(payload));
  const data   = `${header}.${body}`;
  const key    = await _importKey(secret, 'sign');
  const sig    = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return `${data}.${_b64url(sig)}`;
}

async function _verifyJWT(token, secret) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [hdr, body, sigStr] = parts;
  const key   = await _importKey(secret, 'verify');
  const valid = await crypto.subtle.verify(
    'HMAC', key,
    _b64urlDecode(sigStr),
    new TextEncoder().encode(`${hdr}.${body}`)
  );
  if (!valid) return null;
  let payload;
  try {
    payload = JSON.parse(new TextDecoder().decode(_b64urlDecode(body)));
  } catch { return null; }
  if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null;
  return payload;
}

// Extract and verify the Bearer token from the request.
// Returns the decoded payload { sub, role, display } or null if invalid/missing.
export async function validateAuth(request, env) {
  if (!env.AUTH_JWT_SECRET) return null;
  const auth = request.headers.get('Authorization') || '';
  if (!auth.startsWith('Bearer ')) return null;
  return _verifyJWT(auth.slice(7), env.AUTH_JWT_SECRET);
}

export function unauthorized() {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401, headers: { 'Content-Type': 'application/json' }
  });
}

export function forbidden() {
  return new Response(JSON.stringify({ error: 'Forbidden' }), {
    status: 403, headers: { 'Content-Type': 'application/json' }
  });
}
