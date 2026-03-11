// player-nav.js — shared player navigation
// Works from any directory depth (root, missions/, hunters/)
// Usage: place <nav id="player-nav"></nav> in the header, then <script src="player-nav.js"></script>
// (adjust src path for subdirectory pages: "../player-nav.js")
(function () {
  var nav = document.getElementById('player-nav');
  if (!nav) return;

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
    { label: 'The Lab',    href: b + 'the-lab.html',  match: 'the-lab.html' },
    { label: 'Artefacts',  href: b + 'index.html#artefacts' },
    { label: 'Missions',   href: m + 'missions.html',  match: 'missions.html' },
    { label: 'Contacts',   href: b + 'contacts.html',   match: 'contacts.html' },
    { label: 'Report',     href: b + 'reports/player-report.html',    match: 'player-report.html' },
    { label: 'Queue',      href: m + 'campbell-briefings.html',        match: 'campbell-briefings.html' },
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
    if (item.match && file === item.match) a.className = 'active';
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
  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    toggle.textContent = open ? '✕' : '≡';
  });
  nav.parentNode.insertBefore(toggle, campbell);

  // Close menu when a nav link is clicked
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      nav.classList.remove('open');
      toggle.textContent = '≡';
    }
  });
}());
