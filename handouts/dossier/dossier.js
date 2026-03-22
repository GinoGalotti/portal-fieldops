/*
 * PORTAL DOSSIER — shared behaviour script
 *
 * USAGE: set DOSSIER_ID before including this script, e.g.:
 *   <script>const DOSSIER_ID = 's03-clara-notebooks';</script>
 *   <script src="dossier.js"></script>
 *
 * This script handles two behaviours:
 *   1. Keeper mode  — 5× click on .classification activates .keeper-active
 *   2. Clue reveal  — toggle .clues-revealed; state synced to D1 + localStorage
 *
 * D1 endpoint: GET/PUT /api/v1/dossiers/{DOSSIER_ID}/state
 * Payload:     { "revealed": true|false }
 * Fallback:    localStorage key portal-dossier-{DOSSIER_ID}-hints
 */
(function () {
  var id     = (typeof DOSSIER_ID !== 'undefined') ? DOSSIER_ID : 'unknown';
  var apiUrl = '/api/v1/dossiers/' + id + '/state';
  var lsKey  = 'portal-dossier-' + id + '-hints';

  var wrapper   = document.querySelector('.dossier-wrapper');
  var toggleBtn = document.getElementById('toggle-hints');
  var statusEl  = document.getElementById('hint-status');

  if (!wrapper) return; // safety guard

  // ── Keeper mode ──────────────────────────────────────────────────────────
  // 5 clicks within 2 s on the .classification line activates keeper mode.
  var clicks = 0, clickTimer = null;
  var header = document.querySelector('.classification');
  if (header) {
    header.style.cursor = 'default';
    header.addEventListener('click', function () {
      clicks++;
      clearTimeout(clickTimer);
      clickTimer = setTimeout(function () { clicks = 0; }, 2000);
      if (clicks >= 5) {
        wrapper.classList.toggle('keeper-active');
        clicks = 0;
      }
    });
  }

  // ── Clue reveal ──────────────────────────────────────────────────────────
  function applyHints(revealed) {
    if (revealed) {
      wrapper.classList.add('clues-revealed');
      if (toggleBtn) { toggleBtn.textContent = 'HIDE CLUES'; toggleBtn.classList.add('active'); }
      if (statusEl)  { statusEl.textContent = 'clues: visible to all'; }
    } else {
      wrapper.classList.remove('clues-revealed');
      if (toggleBtn) { toggleBtn.textContent = 'REVEAL CLUES'; toggleBtn.classList.remove('active'); }
      if (statusEl)  { statusEl.textContent = 'clues: hidden'; }
    }
  }

  // On load: fetch from D1, fall back to localStorage
  fetch(apiUrl)
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      var revealed = (data && typeof data.revealed === 'boolean')
        ? data.revealed
        : localStorage.getItem(lsKey) === 'revealed';
      applyHints(revealed);
    })
    .catch(function () {
      applyHints(localStorage.getItem(lsKey) === 'revealed');
    });

  // Toggle (keeper toolbar button)
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      var newState = !wrapper.classList.contains('clues-revealed');
      applyHints(newState);
      try { localStorage.setItem(lsKey, newState ? 'revealed' : 'hidden'); } catch (e) {}
      fetch(apiUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revealed: newState })
      }).catch(function () {});
    });
  }
})();
