I need you to implement an authentication system for the PORTAL campaign website. The full design document is in `context/auth-system-design.md` — read it completely before starting.

Key points:
- 6 hardcoded users (5 players + 1 admin/keeper), passwords stored in Cloudflare environment secrets `AUTH_PASSWORDS` and `AUTH_JWT_SECRET` (already set in the CF Pages dashboard — do not hardcode any passwords or secrets in code)
- JWT-based sessions stored in localStorage, 30-day expiry
- Server-side enforcement on all API write endpoints — the UI hides controls, but the Worker rejects unauthorized writes with 401/403
- All pages remain readable without auth — auth only gates writes
- Keeper mode (5× click) stays unchanged everywhere except the feed, where admin login replaces it

Implementation order from the design doc:
1. Worker: auth middleware (`validateAuth()` function + JWT sign/verify using `AUTH_JWT_SECRET` from env)
2. Worker: `POST /api/auth/login` endpoint (validates against `AUTH_PASSWORDS` from env)
3. Client: `auth.js` shared module (token management, user state, permission checks, `auth.fetch()` wrapper)
4. Client: nav integration (login form / username display in the top bar, near CAMPBELL: ONLINE)
5. Worker: add auth checks to every existing PUT/POST endpoint per the permission matrix in the design doc
6. Client: UI gating (hide/disable save buttons, inputs, etc. based on `auth.canWrite()`)
7. Feed: show keeper tabs automatically for admin (replace 5× click for feed only)
8. Report + Feed: auto-select logged-in hunter

Read `context/auth-system-design.md` for the complete permission matrix, API specs, migration notes, and security considerations. Start with steps 1-4 as a single unit, then do 5-8 incrementally.

Important: the `AUTH_PASSWORDS` env secret is a JSON string like `{"rex":"pass1","admin":"pass2",...}` — parse it in the Worker at runtime. Never log, echo, or expose password values in any response.
