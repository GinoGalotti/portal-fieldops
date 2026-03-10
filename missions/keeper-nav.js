// keeper-nav.js — shared keeper navigation for all missions/*.html pages
// Usage: place <nav id="keeper-nav"></nav> in the header, then <script src="keeper-nav.js"></script>
(function () {
  var nav = document.getElementById('keeper-nav');
  if (!nav) return;

  var file = window.location.pathname.split('/').pop() || '';

  var items = [
    { label: 'Player Site',     href: '../index.html' },
    { label: 'Public Missions', href: 'missions.html',   match: 'missions.html' },
    { label: 'Keeper Index',    href: 'keeper.html',     match: 'keeper.html' },
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
}());
