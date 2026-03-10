(function () {

  // ── KEEPER TOGGLE ────────────────────────────────────────────────────────
  // Double-click / double-tap the top-right corner to reveal keeper sections.
  var trigger = document.createElement('div');
  trigger.id = 'keeper-trigger';
  document.body.appendChild(trigger);

  var unlocked = false;
  var lastTap  = 0;

  function toggleKeeper() {
    unlocked = !unlocked;
    document.querySelectorAll('.arc-keeper').forEach(function (el) {
      el.classList.toggle('blurred', !unlocked);
    });
    document.querySelectorAll('.blur-notice').forEach(function (el) {
      el.style.display = unlocked ? 'none' : '';
    });
    trigger.classList.toggle('unlocked', unlocked);
  }

  trigger.addEventListener('dblclick', function (e) { e.preventDefault(); toggleKeeper(); });
  trigger.addEventListener('touchend', function (e) {
    var now = Date.now(), delta = now - lastTap;
    if (delta > 0 && delta < 350) { e.preventDefault(); toggleKeeper(); }
    lastTap = now;
  });


  // ── PERSISTENCE ──────────────────────────────────────────────────────────
  // Key derived from filename: "alan-hunter-stories.html" → "alan"
  var hunterId = window.location.pathname.split('/').pop().replace('-hunter-stories.html', '');
  var STORAGE_KEY = 'portal_hunter_' + hunterId;
  var API_BASE = '/api/v1/hunters/' + hunterId + '/arc-state';

  // ── SERIALISE / DESERIALISE ───────────────────────────────────────────────

  function serialise() {
    var state = {};

    document.querySelectorAll('.arc[id]').forEach(function (arc) {
      var s = { choices: {}, texts: {}, beats: 0, resolution: null };

      // Which choice options are selected, keyed by "groupIndex-choiceIndex"
      arc.querySelectorAll('.choice-group').forEach(function (group, gi) {
        group.querySelectorAll('.choice-opt').forEach(function (opt, oi) {
          if (opt.classList.contains('selected')) s.choices[gi + '-' + oi] = true;
        });
      });

      // Open text input values, keyed by index within the arc
      arc.querySelectorAll('.choice-open input').forEach(function (inp, i) {
        if (inp.value) s.texts[i] = inp.value;
      });

      // Beat count (sequential fill, so a number is enough)
      var filled = 0;
      arc.querySelectorAll('.beat-box').forEach(function (box) {
        if (box.classList.contains('filled')) filled++;
      });
      s.beats = filled;

      // Which resolution move is selected (index, or null)
      arc.querySelectorAll('.res-move').forEach(function (move, i) {
        if (move.classList.contains('selected')) s.resolution = i;
      });

      state[arc.id] = s;
    });

    return state;
  }

  function applyState(state) {
    document.querySelectorAll('.arc[id]').forEach(function (arc) {
      var s = state[arc.id];
      if (!s) return;

      // Restore choice selections
      arc.querySelectorAll('.choice-group').forEach(function (group, gi) {
        group.querySelectorAll('.choice-opt').forEach(function (opt, oi) {
          if (s.choices && s.choices[gi + '-' + oi]) opt.classList.add('selected');
        });
      });

      // Restore text inputs
      arc.querySelectorAll('.choice-open input').forEach(function (inp, i) {
        if (s.texts && s.texts[i]) inp.value = s.texts[i];
      });

      // Restore beats
      if (s.beats > 0) {
        arc.querySelectorAll('.beat-box').forEach(function (box, i) {
          if (i < s.beats) box.classList.add('filled');
        });
      }

      // Restore resolution move
      if (s.resolution !== null && s.resolution !== undefined) {
        var moves = arc.querySelectorAll('.res-move');
        if (moves[s.resolution]) moves[s.resolution].classList.add('selected');
      }
    });
  }

  // ── SAVE ─────────────────────────────────────────────────────────────────
  // Write to localStorage immediately; sync to D1 in the background.

  function save() {
    var state = serialise();
    var json  = JSON.stringify(state);

    // localStorage — always, works offline
    try { localStorage.setItem(STORAGE_KEY, json); } catch (e) {}

    // D1 via API — fire-and-forget, ignore errors
    fetch(API_BASE, { method: 'PUT', body: json, headers: { 'Content-Type': 'application/json' } })
      .catch(function () {});
  }

  // Explicit save with button feedback — called by onclick="saveNow(this)"
  window.saveNow = function (btn) {
    var state = serialise();
    var json  = JSON.stringify(state);

    try { localStorage.setItem(STORAGE_KEY, json); } catch (e) {}

    var original = btn.textContent;
    btn.disabled = true;
    btn.textContent = '// SAVING…';

    fetch(API_BASE, { method: 'PUT', body: json, headers: { 'Content-Type': 'application/json' } })
      .then(function (r) {
        btn.textContent = r.ok ? '// SAVED ✓' : '// ERROR';
      })
      .catch(function () {
        btn.textContent = '// OFFLINE';
      })
      .finally(function () {
        btn.disabled = false;
        setTimeout(function () { btn.textContent = original; }, 2000);
      });
  };

  // ── LOAD ─────────────────────────────────────────────────────────────────
  // Prefer D1 (shared across all users); fall back to localStorage.

  function load() {
    fetch(API_BASE)
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (state) {
        if (state && Object.keys(state).length > 0) {
          applyState(state);
          // Keep localStorage in sync with server state
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
        } else {
          loadFromLocalStorage();
        }
      })
      .catch(function () {
        // API unreachable (file://, offline, etc.) — use localStorage
        loadFromLocalStorage();
      });
  }

  function loadFromLocalStorage() {
    var raw;
    try { raw = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    if (!raw) return;
    var state;
    try { state = JSON.parse(raw); } catch (e) { return; }
    applyState(state);
  }


  // ── INTERACTIONS (save after every change) ───────────────────────────────

  // Choice options — toggle selected, save
  document.querySelectorAll('.choice-opt').forEach(function (opt) {
    opt.addEventListener('click', function () {
      this.classList.toggle('selected');
      save();
    });
  });

  // Open text inputs — save on input
  document.querySelectorAll('.choice-open input').forEach(function (inp) {
    inp.addEventListener('input', save);
  });

  // Beat boxes — cumulative fill/unfill, save
  document.querySelectorAll('.beats-track').forEach(function (track) {
    var boxes = track.querySelectorAll('.beat-box');
    boxes.forEach(function (box, i) {
      box.addEventListener('click', function () {
        if (this.classList.contains('filled')) {
          boxes.forEach(function (b, j) { if (j >= i) b.classList.remove('filled'); });
        } else {
          boxes.forEach(function (b, j) { if (j <= i) b.classList.add('filled'); });
        }
        save();
      });
    });
  });

  // Resolution moves — radio-style, exposed on window for onclick attributes
  window.toggleRes = function (el) {
    el.parentElement.querySelectorAll('.res-move').forEach(function (m) {
      m.classList.remove('selected');
    });
    el.classList.add('selected');
    save();
  };

  // Reset — clears DOM, localStorage, and D1
  window.resetAll = function () {
    if (!confirm('Reset all choices for this hunter?')) return;
    document.querySelectorAll('.choice-opt').forEach(function (o) { o.classList.remove('selected'); });
    document.querySelectorAll('.res-move').forEach(function (o) { o.classList.remove('selected'); });
    document.querySelectorAll('.beat-box').forEach(function (o) { o.classList.remove('filled'); });
    document.querySelectorAll('.choice-open input').forEach(function (i) { i.value = ''; });
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    fetch(API_BASE, { method: 'PUT', body: '{}', headers: { 'Content-Type': 'application/json' } })
      .catch(function () {});
  };

  // Arc nav smooth scroll
  document.querySelectorAll('.arc-nav a').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        var target = document.querySelector(href);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });


  // ── BOOT ────────────────────────────────────────────────────────────────
  load();

}());
