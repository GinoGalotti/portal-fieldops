// keeper-nav.js — shared keeper navigation for all missions/*.html pages
// Usage: place <nav id="keeper-nav"></nav> in the header, then <script src="keeper-nav.js"></script>
(function () {
  var nav = document.getElementById('keeper-nav');
  if (!nav) return;

  // Skip-to-main link (WCAG 2.4.1) — visually hidden until focused
  var skip = document.createElement('a');
  skip.href = '#main-content';
  skip.className = 'skip-link';
  skip.textContent = 'Skip to content';
  nav.parentNode.insertBefore(skip, nav.parentNode.firstChild);

  var file = window.location.pathname.split('/').pop() || '';

  var items = [
    { label: 'Player Site',     href: '../index.html' },
    { label: 'Keeper Index',    href: 'keeper.html',     match: 'keeper.html' },
    { label: 'Field Report',    href: 'report.html',     match: 'report.html' },
    { label: 'Field Debrief',   href: 'debrief.html',    match: 'debrief.html' },
    { label: 'References',      href: 'references.html', match: 'references.html' },
    { label: 'Entities',        href: 'entities.html',   match: 'entities.html' },
    { label: 'Arcs',            href: 'arcs.html',       match: 'arcs.html' },
    { label: 'Threads',         href: 'threads.html',    match: 'threads.html' },
    { label: 'Gallery',         href: 'gallery.html',    match: 'gallery.html' },
    { label: 'Journals',        href: 'journal.html',    match: 'journal.html' },
  ];

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

  // Mobile hamburger toggle
  var toggle = document.createElement('button');
  toggle.className = 'nav-toggle';
  toggle.textContent = '≡';
  toggle.setAttribute('aria-label', 'Toggle navigation');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    toggle.textContent = open ? '✕' : '≡';
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      var first = nav.querySelector('a');
      if (first) first.focus();
    }
  });
  nav.parentNode.appendChild(toggle);

  // Close menu when a nav link is clicked — return focus to toggle
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      nav.classList.remove('open');
      toggle.textContent = '≡';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    }
  });

  // Site credit footer
  var footer = document.createElement('footer');
  footer.style.cssText = 'text-align:center;padding:1.5rem 1rem;font-size:0.7rem;color:var(--text-dim);letter-spacing:0.05em;border-top:1px solid var(--border);margin-top:2rem;';
  footer.innerHTML = 'Made by Gino with Claude &nbsp;·&nbsp; <a href="https://github.com/GinoGalotti/portal-fieldops" target="_blank" rel="noopener" style="color:var(--text-dim);text-decoration:underline;">GitHub</a>';
  document.body.appendChild(footer);
}());
