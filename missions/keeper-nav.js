// keeper-nav.js — shared keeper navigation for all missions/*.html pages
// Usage: place <nav id="keeper-nav"></nav> in the header, then <script src="keeper-nav.js"></script>
(function () {
  var nav = document.getElementById('keeper-nav');
  if (!nav) return;

  var file = window.location.pathname.split('/').pop() || '';

  var items = [
    { label: 'Player Site',     href: '../index.html' },
    { label: 'Keeper Index',    href: 'keeper.html',     match: 'keeper.html' },
    { label: 'Field Report',    href: 'report.html',     match: 'report.html' },
    { label: 'References',      href: 'references.html', match: 'references.html' },
    { label: 'Entities',        href: 'entities.html',   match: 'entities.html' },
    { label: 'Arcs',            href: 'arcs.html',       match: 'arcs.html' },
    { label: 'Gallery',         href: 'gallery.html',    match: 'gallery.html' },
  ];

  items.forEach(function (item) {
    var a = document.createElement('a');
    a.href = item.href;
    a.textContent = item.label;
    if (item.match && file === item.match) a.className = 'active';
    nav.appendChild(a);
  });

  // Mobile hamburger toggle
  var toggle = document.createElement('button');
  toggle.className = 'nav-toggle';
  toggle.textContent = '≡';
  toggle.setAttribute('aria-label', 'Toggle navigation');
  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    toggle.textContent = open ? '✕' : '≡';
  });
  nav.parentNode.appendChild(toggle);

  // Close menu when a nav link is clicked
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      nav.classList.remove('open');
      toggle.textContent = '≡';
    }
  });
}());
