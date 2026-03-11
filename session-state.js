/**
 * session-state.js — P.O.R.T.A.L session-aware content system
 *
 * Resolves the active campaign session and applies visibility rules to
 * HTML elements annotated with data-session-* attributes.
 *
 * Supported attributes:
 *   data-session-from="wN"  — show only if current session >= wN
 *   data-session-until="wN" — show only if current session <= wN
 *
 * Resolution order (player pages): URL param ?session=wN > localStorage > D1 API > fallback
 * Resolution order (keeper pages):  localStorage > D1 (with keeper toggle widget injected)
 *
 * Include at end of <body> on any session-aware page.
 */
(function () {
  var LS_KEY = 'portal_active_session';
  var API_PATH = '/api/v1/session/active';

  // Detect base path for relative fetches (root vs subdirectory)
  var depth = window.location.pathname.split('/').filter(function (s) { return s.length > 0; }).length;
  var base = depth >= 2 ? '../' : '';

  // Detect keeper page
  var isKeeper = !!document.querySelector('.keeper-banner');

  // Sync session (instant — URL param or localStorage)
  function getSyncSession() {
    var params = new URLSearchParams(window.location.search);
    return params.get('session') || localStorage.getItem(LS_KEY);
  }
  var syncSession = getSyncSession();

  // Apply session rules immediately from localStorage — keeper pages only.
  // Player pages always wait for D1 so the keeper's active session is always authoritative.
  if (syncSession && isKeeper) {
    fetch(base + 'data/sessions.json')
      .then(function (r) { return r.json(); })
      .then(function (sessions) {
        var ids = sessions.map(function (s) { return s.id; });
        if (ids.indexOf(syncSession) !== -1) {
          applySession(sessions, syncSession);
        }
      })
      .catch(function () {});
  }

  // Full async resolution: sessions.json + D1 in parallel
  Promise.all([
    fetch(base + 'data/sessions.json').then(function (r) { return r.json(); }),
    (function () {
      var params = new URLSearchParams(window.location.search);
      // URL param takes priority — no API call needed
      if (params.get('session')) return Promise.resolve(params.get('session'));
      // Keeper with cached session — use cache instantly, sync D1 quietly
      if (isKeeper && localStorage.getItem(LS_KEY)) {
        fetch(API_PATH)
          .then(function (r) { return r.json(); })
          .then(function (d) { if (d && d.session_id) localStorage.setItem(LS_KEY, d.session_id); })
          .catch(function () {});
        return Promise.resolve(localStorage.getItem(LS_KEY));
      }
      // Default: fetch from D1
      return fetch(API_PATH)
        .then(function (r) { return r.json(); })
        .then(function (d) { return d.session_id || null; })
        .catch(function () { return syncSession; });
    })()
  ]).then(function (results) {
    var sessions = results[0];
    var sessionId = results[1];
    var ids = sessions.map(function (s) { return s.id; });

    // Validate; fall back to last non-upcoming session
    if (!sessionId || ids.indexOf(sessionId) === -1) {
      var available = sessions.filter(function (s) { return s.status !== 'upcoming'; });
      sessionId = available.length ? available[available.length - 1].id : ids[0];
    }

    // Cache (skip caching URL param overrides)
    if (!new URLSearchParams(window.location.search).get('session')) {
      localStorage.setItem(LS_KEY, sessionId);
    }

    window.PORTAL_SESSIONS = sessions;
    window.PORTAL_SESSION = sessionId;
    window.PORTAL_SESSION_INDEX = ids.indexOf(sessionId);

    applySession(sessions, sessionId);

    if (isKeeper) injectKeeperToggle(sessions, sessionId);

    document.dispatchEvent(new CustomEvent('portalSessionReady', {
      detail: { session: sessionId, sessions: sessions }
    }));
  }).catch(function (err) {
    console.error('[PORTAL] session-state error:', err);
    document.dispatchEvent(new CustomEvent('portalSessionReady', { detail: { session: null } }));
  });

  /**
   * Apply data-session-from / data-session-until visibility rules.
   * data-session-from: strict — unknown sessions are treated as "not yet reached" (hidden).
   * data-session-until: permissive — unknown sessions are treated as "not yet passed" (visible).
   */
  function applySession(sessions, sessionId) {
    var ids = sessions.map(function (s) { return s.id; });
    var idx = ids.indexOf(sessionId);

    document.querySelectorAll('[data-session-from],[data-session-until]').forEach(function (el) {
      var visible = true;

      if (el.hasAttribute('data-session-from')) {
        var fromIdx = ids.indexOf(el.dataset.sessionFrom);
        // Hide if session is unknown (fromIdx = -1) or not yet reached
        if (fromIdx === -1 || fromIdx > idx) visible = false;
      }

      if (el.hasAttribute('data-session-until')) {
        var untilIdx = ids.indexOf(el.dataset.sessionUntil);
        // Hide only if the until-session is known and we have passed it
        if (untilIdx !== -1 && untilIdx < idx) visible = false;
      }

      el.style.display = visible ? '' : 'none';
    });
  }

  /** Inject the session toggle widget into .keeper-banner */
  function injectKeeperToggle(sessions, activeSession) {
    var banner = document.querySelector('.keeper-banner');
    if (!banner) return;

    // Inject CSS once
    if (!document.getElementById('session-toggle-style')) {
      var style = document.createElement('style');
      style.id = 'session-toggle-style';
      style.textContent =
        '#keeper-session-toggle{display:flex;align-items:center;gap:6px;margin-left:auto;}' +
        '.st-label{font-family:"Share Tech Mono",monospace;font-size:0.58rem;letter-spacing:0.14em;color:var(--keeper-dim);white-space:nowrap;padding-right:2px;}' +
        '.st-btn{font-family:"Share Tech Mono",monospace;font-size:0.6rem;letter-spacing:0.1em;padding:2px 8px;border:1px solid var(--keeper-dim);background:transparent;color:var(--keeper-dim);cursor:pointer;transition:all 0.15s;}' +
        '.st-btn:hover{color:var(--keeper);border-color:var(--keeper);}' +
        '.st-btn.active{color:var(--keeper);border-color:var(--keeper);background:rgba(168,85,247,0.12);}';
      document.head.appendChild(style);
    }

    var container = document.getElementById('keeper-session-toggle');
    if (!container) {
      container = document.createElement('div');
      container.id = 'keeper-session-toggle';
      banner.appendChild(container);
    }
    container.innerHTML = '';

    var label = document.createElement('span');
    label.className = 'st-label';
    label.textContent = '// SESSION:';
    container.appendChild(label);

    sessions.forEach(function (session) {
      var btn = document.createElement('button');
      btn.className = 'st-btn' + (session.id === activeSession ? ' active' : '');
      btn.textContent = session.label;
      btn.title = session.title;
      btn.addEventListener('click', function () { setKeeperSession(sessions, session.id); });
      container.appendChild(btn);
    });
  }

  /** Update active session: saves to localStorage + D1, re-applies to current page */
  function setKeeperSession(sessions, sessionId) {
    localStorage.setItem(LS_KEY, sessionId);

    // Update D1 — this propagates to all player pages
    fetch(API_PATH, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId })
    }).catch(function () {});

    window.PORTAL_SESSION = sessionId;
    window.PORTAL_SESSION_INDEX = sessions.map(function (s) { return s.id; }).indexOf(sessionId);

    applySession(sessions, sessionId);
    injectKeeperToggle(sessions, sessionId);
  }
}());
