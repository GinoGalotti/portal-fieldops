// player-nav.js — shared player navigation
// Works from any directory depth (root, missions/, hunters/)
// Usage: place <nav id="player-nav"></nav> in the header, then <script src="player-nav.js"></script>
// (adjust src path for subdirectory pages: "../player-nav.js")
(function () {
  var nav = document.getElementById('player-nav');
  if (!nav) return;

  // Skip-to-main link (WCAG 2.4.1) — visually hidden until focused
  var skip = document.createElement('a');
  skip.href = '#main-content';
  skip.className = 'skip-link';
  skip.textContent = 'Skip to content';
  nav.parentNode.insertBefore(skip, nav.parentNode.firstChild);

  var parts = window.location.pathname.replace(/\/$/, '').split('/');
  var file  = parts[parts.length - 1] || '';
  var dir   = parts[parts.length - 2] || '';

  // Base paths relative to current directory
  var b = (dir === 'missions' || dir === 'hunters' || dir === 'reports') ? '../' : '';
  var m = b + 'missions/';

  var items = [
    { label: 'Briefing',   href: b + 'index.html#sessions' },
    { label: 'Operatives', href: b + 'index.html#operatives' },
    { label: 'Bestiary',   href: b + 'index.html#bestiary' },
    { label: 'Logs',       href: b + 'campbell-logs.html',      match: 'campbell-logs.html' },
    { label: 'Artefacts',  href: b + 'index.html#artefacts' },
    { label: 'Missions',   href: m + 'missions.html',  match: 'missions.html' },
    { label: 'Evidence',   href: b + 'evidence.html',   match: 'evidence.html' },
    { label: 'Contacts',   href: b + 'contacts.html',   match: 'contacts.html' },
    { label: 'Report',     href: b + 'reports/player-report.html',    match: 'player-report.html' },
    { label: 'Queue',      href: m + 'campbell-briefings.html',        match: 'campbell-briefings.html' },
    { label: 'Incidents',  href: b + 'lab-incidents.html',             match: 'lab-incidents.html' },
    { label: 'Feed',       href: b + 'feed.html',       match: 'feed.html' },
  ];

  // Status dot
  var dot = document.createElement('span');
  dot.className = 'status-dot';
  nav.appendChild(dot);

  items.forEach(function (item) {
    var a = document.createElement('a');
    a.href = item.href;
    a.textContent = item.label;
    if (item.match && file === item.match) {
      a.className = 'active';
      a.setAttribute('aria-current', 'page');
    }
    nav.appendChild(a);
  });

  // CAMPBELL ONLINE — injected as right-side header element on all player pages
  var campbell = document.createElement('div');
  var cdot = document.createElement('span');
  cdot.className = 'status-dot';
  var clabel = document.createElement('span');
  clabel.id = 'campbell-status';
  clabel.textContent = 'CAMPBELL ONLINE';
  clabel.style.cssText = "font-family:'Share Tech Mono',monospace;font-size:0.7rem;letter-spacing:0.1em;color:var(--green-dim);cursor:default;user-select:none;";
  campbell.appendChild(cdot);
  campbell.appendChild(clabel);
  nav.parentNode.appendChild(campbell);

  // Double-click CAMPBELL ONLINE to enter keeper mode
  clabel.addEventListener('dblclick', function () {
    window.location.href = b + 'missions/keeper.html';
  });

  // Mobile hamburger toggle — injected between nav and campbell
  var toggle = document.createElement('button');
  toggle.className = 'nav-toggle';
  toggle.textContent = '≡';
  toggle.setAttribute('aria-label', 'Toggle navigation');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    toggle.textContent = open ? '✕' : '≡';
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    // Focus management: move focus into menu on open
    if (open) {
      var first = nav.querySelector('a');
      if (first) first.focus();
    }
  });
  nav.parentNode.insertBefore(toggle, campbell);

  // Close menu when a nav link is clicked — return focus to toggle
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      nav.classList.remove('open');
      toggle.textContent = '≡';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    }
  });

  // Load auth module (auth.js lives next to player-nav.js)
  var authScr = document.createElement('script');
  authScr.src = b + 'auth.js';
  document.head.appendChild(authScr);

  // ── KEYBOARD SHORTCUTS GUIDE ──────────────────────────────────────────────
  // Press ? to open, ? or Escape to close. Shows page-context-aware shortcuts.
  (function () {
    var overlay = document.createElement('div');
    overlay.id = 'kb-help';
    overlay.style.cssText = 'display:none;position:fixed;inset:0;z-index:300;background:rgba(5,8,6,0.92);backdrop-filter:blur(6px);justify-content:center;align-items:center;';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'Keyboard shortcuts');

    var panel = document.createElement('div');
    panel.style.cssText = "background:var(--bg2,#0d1410);border:1px solid var(--border-bright,#2ecc7155);padding:2rem 2.5rem;max-width:480px;width:90%;font-family:'Share Tech Mono',monospace;color:var(--text,#c8ddd0);position:relative;";

    var title = document.createElement('div');
    title.style.cssText = "font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:1.2rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--green,#2ecc71);margin-bottom:1.2rem;";
    title.textContent = 'KEYBOARD SHORTCUTS';

    var close = document.createElement('button');
    close.style.cssText = 'position:absolute;top:0.8rem;right:1rem;background:none;border:none;color:var(--text-dim,#7a9a82);font-size:1.2rem;cursor:pointer;font-family:inherit;';
    close.textContent = '✕';
    close.setAttribute('aria-label', 'Close');
    close.addEventListener('click', function () { hideHelp(); });

    var shortcuts = [
      ['Tab', 'Move between interactive elements'],
      ['Enter / Space', 'Activate buttons, pips, checkboxes'],
      ['?', 'Toggle this help panel'],
      ['Esc', 'Close this panel / close menus'],
    ];

    // Page-specific hints
    if (file === 'feed.html') {
      shortcuts.push(['Enter / Space', 'Expand/collapse feed entries']);
      shortcuts.push(['Enter', 'Submit roll (when modifier input focused)']);
    }
    if (dir === 'hunters') {
      shortcuts.push(['Enter / Space', 'Toggle harm/luck/xp pips']);
      shortcuts.push(['Enter / Space', 'Check/uncheck moves, beats, choices']);
    }
    if (file === 'campbell-logs.html' || file === 'evidence.html') {
      shortcuts.push(['Enter / Space', 'Expand/collapse sections']);
    }

    var list = document.createElement('div');
    shortcuts.forEach(function (s) {
      var row = document.createElement('div');
      row.style.cssText = 'display:flex;justify-content:space-between;gap:1rem;padding:0.4rem 0;border-bottom:1px solid var(--border,#1e3428);font-size:0.78rem;';
      var key = document.createElement('span');
      key.style.cssText = 'color:var(--green,#2ecc71);white-space:nowrap;min-width:120px;';
      key.textContent = s[0];
      var desc = document.createElement('span');
      desc.style.cssText = 'color:var(--text-dim,#7a9a82);text-align:right;';
      desc.textContent = s[1];
      row.appendChild(key);
      row.appendChild(desc);
      list.appendChild(row);
    });

    var hint = document.createElement('div');
    hint.style.cssText = 'margin-top:1rem;font-size:0.68rem;color:var(--text-dim,#7a9a82);letter-spacing:0.05em;text-align:center;';
    hint.textContent = 'Press ? or Esc to close';

    panel.appendChild(title);
    panel.appendChild(close);
    panel.appendChild(list);
    panel.appendChild(hint);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    function showHelp() {
      overlay.style.display = 'flex';
      close.focus();
    }
    function hideHelp() {
      overlay.style.display = 'none';
    }

    document.addEventListener('keydown', function (e) {
      // Don't trigger when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
      if (e.key === '?') {
        overlay.style.display === 'none' ? showHelp() : hideHelp();
      }
      if (e.key === 'Escape' && overlay.style.display !== 'none') {
        hideHelp();
      }
    });

    // Close on backdrop click
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) hideHelp();
    });
  }());

  // Site credit footer — deferred so it always lands at end of body
  // even when this script runs synchronously inside <header>
  function appendSiteFooter() {
    var footer = document.createElement('footer');
    footer.style.cssText = 'display:flex;justify-content:center;align-items:center;padding:1.5rem 1rem;font-size:0.7rem;color:var(--text-dim);letter-spacing:0.05em;border-top:1px solid var(--border);margin-top:2rem;';
    footer.innerHTML = 'Made by Gino with Claude &nbsp;·&nbsp; <a href="https://github.com/GinoGalotti/portal-fieldops" target="_blank" rel="noopener" style="color:var(--text-dim);text-decoration:underline;">GitHub</a>';
    document.body.appendChild(footer);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', appendSiteFooter);
  } else {
    appendSiteFooter();
  }
}());
