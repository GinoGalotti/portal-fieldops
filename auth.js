// auth.js — P.O.R.T.A.L authentication client module
// Loaded dynamically by player-nav.js on every player-facing page.
// Exposes window.portalAuth and injects login/logout UI into the page header.

(function () {
  var TOKEN_KEY = 'portal-auth-token';

  // ── JWT payload decoder (client-side, no signature verification) ──────────
  function decodePayload(token) {
    try {
      var b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      var bytes = Uint8Array.from(atob(b64), function (c) { return c.charCodeAt(0); });
      return JSON.parse(new TextDecoder().decode(bytes));
    } catch (e) { return null; }
  }

  // ── Public API ─────────────────────────────────────────────────────────────
  window.portalAuth = {
    getToken: function () {
      return localStorage.getItem(TOKEN_KEY);
    },

    getUser: function () {
      var token = this.getToken();
      if (!token) return null;
      var p = decodePayload(token);
      if (!p) { this._clear(); return null; }
      if (p.exp && Math.floor(Date.now() / 1000) > p.exp) { this._clear(); return null; }
      return { username: p.sub, role: p.role, display: p.display };
    },

    isLoggedIn: function () { return this.getUser() !== null; },

    // Returns the hunter ID if logged in as a player, null otherwise (admin / not logged in).
    getHunterId: function () {
      var u = this.getUser();
      return (u && u.role === 'player') ? u.username : null;
    },

    // Returns true if the logged-in user may write to the given resource.
    // resource: 'hunter'|'report'|'incident'|'lab'|'feed'|'map'|'session'|'handout'
    // resourceId: hunter/report id to check ownership (optional for team resources)
    canWrite: function (resource, resourceId) {
      var u = this.getUser();
      if (!u) return false;
      if (u.role === 'admin') return true;
      switch (resource) {
        case 'hunter':   return u.username === resourceId;
        case 'report':   return u.username === resourceId;
        case 'incident': return true;
        case 'lab':      return true;
        case 'feed':     return true;  // message posting; tracker edits checked separately
        default:         return false; // map, session, handout — admin only
      }
    },

    // fetch() wrapper that auto-adds the Authorization: Bearer header.
    fetch: function (url, options) {
      var opts = options || {};
      var token = this.getToken();
      if (token) {
        opts.headers = Object.assign({}, opts.headers || {}, { 'Authorization': 'Bearer ' + token });
      }
      return fetch(url, opts);
    },

    login: async function (username, password) {
      var resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, password: password })
      });
      var data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem(TOKEN_KEY, data.token);
      return data.user;
    },

    logout: function () {
      this._clear();
      location.reload();
    },

    _clear: function () {
      localStorage.removeItem(TOKEN_KEY);
    }
  };

  // Signal that portalAuth is ready (synchronous — fired before DOMContentLoaded)
  window.dispatchEvent(new Event('portalAuthReady'));

  // ── Styles ─────────────────────────────────────────────────────────────────
  function injectStyles() {
    var s = document.createElement('style');
    s.textContent = [
      '#portal-auth{display:flex;align-items:center;position:relative;flex-shrink:0}',
      '#portal-login-btn{font-family:"Share Tech Mono",monospace;font-size:0.68rem;letter-spacing:0.1em;',
        'color:var(--green-dim);background:none;border:1px solid var(--border);',
        'padding:0.2rem 0.55rem;cursor:pointer;text-transform:uppercase;white-space:nowrap}',
      '#portal-login-btn:hover{color:var(--green);border-color:var(--green-dim)}',
      '.auth-user-btn{font-family:"Share Tech Mono",monospace;font-size:0.68rem;letter-spacing:0.1em;',
        'color:var(--green);background:none;border:none;cursor:pointer;',
        'text-transform:uppercase;padding:0.2rem 0.25rem;white-space:nowrap}',
      '.auth-user-btn.is-admin{color:#a78bfa}',
      '.auth-dropdown{display:none;position:absolute;top:calc(100% + 4px);right:0;',
        'background:var(--bg2,#0d1410);border:1px solid var(--border);z-index:300;min-width:110px}',
      '.auth-dropdown.open{display:block}',
      '.auth-dropdown button{display:block;width:100%;text-align:left;',
        'font-family:"Share Tech Mono",monospace;font-size:0.65rem;letter-spacing:0.1em;',
        'color:var(--text);background:none;border:none;padding:0.45rem 0.75rem;',
        'cursor:pointer;text-transform:uppercase}',
      '.auth-dropdown button:hover{background:var(--border)}',
      '.auth-login-popover{display:none;position:absolute;top:calc(100% + 4px);right:0;',
        'background:var(--bg2,#0d1410);border:1px solid var(--border);z-index:300;',
        'padding:0.75rem;min-width:185px}',
      '.auth-login-popover.open{display:block}',
      '.auth-login-popover input{display:block;width:100%;',
        'font-family:"Share Tech Mono",monospace;font-size:0.68rem;letter-spacing:0.05em;',
        'background:var(--bg,#080c0a);border:1px solid var(--border);color:var(--text);',
        'padding:0.3rem 0.5rem;margin-bottom:0.45rem;box-sizing:border-box}',
      '.auth-login-popover input::placeholder{color:var(--text-dim,#5a7a62)}',
      '.auth-login-popover input:focus{outline:none;border-color:var(--green-dim)}',
      '.auth-submit-btn{display:block;width:100%;',
        'font-family:"Share Tech Mono",monospace;font-size:0.68rem;letter-spacing:0.1em;',
        'color:var(--bg,#080c0a);background:var(--green-dim,#1a7a43);border:none;',
        'padding:0.35rem 0.5rem;cursor:pointer;text-transform:uppercase;margin-top:0.1rem}',
      '.auth-submit-btn:hover{background:var(--green,#2ecc71)}',
      '.auth-submit-btn:disabled{opacity:0.5;cursor:default}',
      '.auth-login-error{font-family:"Share Tech Mono",monospace;font-size:0.62rem;',
        'color:var(--red,#e05050);margin-top:0.4rem;display:none}',
    ].join('');
    document.head.appendChild(s);
  }

  // ── Login popover ──────────────────────────────────────────────────────────
  function buildLoginUI(container) {
    var btn = document.createElement('button');
    btn.id = 'portal-login-btn';
    btn.textContent = 'LOG IN';

    var popover = document.createElement('div');
    popover.className = 'auth-login-popover';
    popover.innerHTML =
      '<input id="auth-un" type="text" placeholder="USERNAME" autocomplete="username" spellcheck="false">' +
      '<input id="auth-pw" type="password" placeholder="PASSWORD" autocomplete="current-password">' +
      '<div class="auth-login-error" id="auth-err"></div>' +
      '<button class="auth-submit-btn" id="auth-go">ENTER</button>';

    container.appendChild(btn);
    container.appendChild(popover);

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      popover.classList.toggle('open');
      if (popover.classList.contains('open')) {
        var unField = document.getElementById('auth-un');
        if (unField) unField.focus();
      }
    });

    popover.addEventListener('click', function (e) { e.stopPropagation(); });
    document.addEventListener('click', function () { popover.classList.remove('open'); });

    document.getElementById('auth-go').addEventListener('click', doLogin);
    popover.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') doLogin();
      if (e.key === 'Escape') popover.classList.remove('open');
    });

    async function doLogin() {
      var un  = (document.getElementById('auth-un').value || '').trim();
      var pw  = document.getElementById('auth-pw').value || '';
      var err = document.getElementById('auth-err');
      var go  = document.getElementById('auth-go');
      if (!un || !pw) return;
      go.textContent = '…';
      go.disabled = true;
      err.style.display = 'none';
      try {
        await window.portalAuth.login(un, pw);
        location.reload();
      } catch (ex) {
        err.textContent = ex.message || 'Login failed';
        err.style.display = 'block';
        go.textContent = 'ENTER';
        go.disabled = false;
      }
    }
  }

  // ── Logged-in user display ─────────────────────────────────────────────────
  function buildUserUI(container, user) {
    var btn = document.createElement('button');
    btn.className = 'auth-user-btn' + (user.role === 'admin' ? ' is-admin' : '');
    btn.textContent = user.display.toUpperCase() + ' ▾';

    var dd = document.createElement('div');
    dd.className = 'auth-dropdown';
    var logoutBtn = document.createElement('button');
    logoutBtn.textContent = 'LOG OUT';
    logoutBtn.addEventListener('click', function () { window.portalAuth.logout(); });
    dd.appendChild(logoutBtn);

    container.appendChild(btn);
    container.appendChild(dd);

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      dd.classList.toggle('open');
    });
    document.addEventListener('click', function () { dd.classList.remove('open'); });
  }

  // ── Inject into page header ────────────────────────────────────────────────
  function initAuthUI() {
    injectStyles();
    var header = document.querySelector('header');
    if (!header) return;
    var wrapper = document.createElement('div');
    wrapper.id = 'portal-auth';
    header.appendChild(wrapper);

    var user = window.portalAuth.getUser();
    if (user) {
      buildUserUI(wrapper, user);
    } else {
      buildLoginUI(wrapper);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuthUI);
  } else {
    initAuthUI();
  }
}());
