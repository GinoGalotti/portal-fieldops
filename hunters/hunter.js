(function () {

  // ── KEEPER TOGGLE ─────────────────────────────────────────────────────────
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


  // ── PERSISTENCE IDs ───────────────────────────────────────────────────────
  // Supports old (-hunter-stories.html), intermediate (-hunter.html), and new (name.html) filenames
  var hunterId = window.location.pathname.split('/').pop()
    .replace('-hunter-stories.html', '')
    .replace('-hunter.html', '')
    .replace('.html', '');

  var STORAGE_KEY = 'portal_hunter_' + hunterId;
  var SHEET_KEY   = 'portal_sheet_'  + hunterId;
  var API_BASE    = '/api/v1/hunters/' + hunterId + '/arc-state';
  var SHEET_API   = '/api/v1/hunters/' + hunterId + '/sheet';


  // ── ARC SERIALISE / APPLY ─────────────────────────────────────────────────

  function serialise() {
    var state = {};
    document.querySelectorAll('.arc[id]').forEach(function (arc) {
      var s = { choices: {}, texts: {}, beats: 0, resolution: null };

      arc.querySelectorAll('.choice-group').forEach(function (group, gi) {
        group.querySelectorAll('.choice-opt').forEach(function (opt, oi) {
          if (opt.classList.contains('selected')) s.choices[gi + '-' + oi] = true;
        });
      });

      arc.querySelectorAll('.choice-open input').forEach(function (inp, i) {
        if (inp.value) s.texts[i] = inp.value;
      });

      var filled = 0;
      arc.querySelectorAll('.beat-box').forEach(function (box) {
        if (box.classList.contains('filled')) filled++;
      });
      s.beats = filled;

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

      arc.querySelectorAll('.choice-group').forEach(function (group, gi) {
        group.querySelectorAll('.choice-opt').forEach(function (opt, oi) {
          if (s.choices && s.choices[gi + '-' + oi]) opt.classList.add('selected');
        });
      });

      arc.querySelectorAll('.choice-open input').forEach(function (inp, i) {
        if (s.texts && s.texts[i]) inp.value = s.texts[i];
      });

      if (s.beats > 0) {
        arc.querySelectorAll('.beat-box').forEach(function (box, i) {
          if (i < s.beats) box.classList.add('filled');
        });
      }

      if (s.resolution !== null && s.resolution !== undefined) {
        var moves = arc.querySelectorAll('.res-move');
        if (moves[s.resolution]) moves[s.resolution].classList.add('selected');
      }
    });
  }


  // ── SHEET SERIALISE / APPLY ───────────────────────────────────────────────

  function serialiseSheet() {
    var sheet = { stats: {}, harm: 0, luck: 0, xp: 0, bonds: [], notes: '', special: [], checks: {} };

    // Stats
    document.querySelectorAll('.stat-input[data-stat]').forEach(function (inp) {
      sheet.stats[inp.dataset.stat] = inp.value;
    });

    // Tracks
    ['harm', 'luck', 'xp'].forEach(function (name) {
      var count = 0;
      document.querySelectorAll('.track-pip[data-track="' + name + '"]').forEach(function (pip) {
        if (pip.classList.contains('filled-' + name)) count++;
      });
      sheet[name] = count;
    });

    // Scalar fields (notes textarea, etc.)
    document.querySelectorAll('[data-sheet]').forEach(function (el) {
      var key = el.dataset.sheet;
      sheet[key] = el.value;
    });

    // Dynamic bonds
    document.querySelectorAll('#bonds-container .bond-input').forEach(function (inp) {
      sheet.bonds.push(inp.value);
    });

    // Hunter-specific special inputs
    document.querySelectorAll('.pb-special-input[data-special-idx]').forEach(function (inp) {
      sheet.special[parseInt(inp.dataset.specialIdx, 10)] = inp.value;
    });

    // Checklists (moves, gear, improvements)
    document.querySelectorAll('.check-item[data-check-key]').forEach(function (el) {
      sheet.checks[el.dataset.checkKey] = el.classList.contains('checked');
    });

    return sheet;
  }

  function applySheet(sheet) {
    if (!sheet || typeof sheet !== 'object') return;

    // Stats
    document.querySelectorAll('.stat-input[data-stat]').forEach(function (inp) {
      if (sheet.stats && sheet.stats[inp.dataset.stat] !== undefined) {
        inp.value = sheet.stats[inp.dataset.stat];
      }
    });

    // Tracks
    ['harm', 'luck', 'xp'].forEach(function (name) {
      var count = sheet[name] || 0;
      var pips = document.querySelectorAll('.track-pip[data-track="' + name + '"]');
      pips.forEach(function (pip, i) {
        pip.classList.toggle('filled-' + name, i < count);
      });
    });

    // Scalar fields
    document.querySelectorAll('[data-sheet]').forEach(function (el) {
      var key = el.dataset.sheet;
      if (sheet[key] !== undefined) el.value = sheet[key];
    });

    // Dynamic bonds — rebuild rows from saved array
    var bc = document.getElementById('bonds-container');
    if (bc && sheet.bonds && sheet.bonds.length > 0) {
      bc.innerHTML = '';
      sheet.bonds.forEach(function (val) { createBondRow(val); });
    }

    // Special inputs
    document.querySelectorAll('.pb-special-input[data-special-idx]').forEach(function (inp) {
      var idx = parseInt(inp.dataset.specialIdx, 10);
      if (sheet.special && sheet.special[idx] !== undefined) inp.value = sheet.special[idx];
    });

    // Checklists
    if (sheet.checks) {
      document.querySelectorAll('.check-item[data-check-key]:not(.mandatory)').forEach(function (el) {
        if (sheet.checks[el.dataset.checkKey] !== undefined) {
          el.classList.toggle('checked', !!sheet.checks[el.dataset.checkKey]);
        }
      });
    }
  }


  // ── TRACK PIP INTERACTION ─────────────────────────────────────────────────

  function setTrack(name, val) {
    document.querySelectorAll('.track-pip[data-track="' + name + '"]').forEach(function (pip, i) {
      pip.classList.toggle('filled-' + name, i < val);
    });
  }

  // Wire up track pip clicks — cumulative fill, click last filled to unfill
  ['harm', 'luck', 'xp'].forEach(function (name) {
    var pips = Array.prototype.slice.call(
      document.querySelectorAll('.track-pip[data-track="' + name + '"]')
    );
    pips.forEach(function (pip, i) {
      pip.addEventListener('click', function () {
        var currentFill = 0;
        pips.forEach(function (p, j) { if (p.classList.contains('filled-' + name)) currentFill = j + 1; });
        setTrack(name, currentFill === i + 1 ? i : i + 1);
        save();
      });
    });
  });


  // ── SAVE ──────────────────────────────────────────────────────────────────

  function save() {
    var arcState   = serialise();
    var sheetState = serialiseSheet();

    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arcState));   } catch (e) {}
    try { localStorage.setItem(SHEET_KEY,   JSON.stringify(sheetState)); } catch (e) {}

    fetch(API_BASE,  { method: 'PUT', body: JSON.stringify(arcState),   headers: { 'Content-Type': 'application/json' } }).catch(function () {});
    fetch(SHEET_API, { method: 'PUT', body: JSON.stringify(sheetState), headers: { 'Content-Type': 'application/json' } }).catch(function () {});
  }

  window.saveNow = function (btn) {
    var arcState   = serialise();
    var sheetState = serialiseSheet();

    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arcState));   } catch (e) {}
    try { localStorage.setItem(SHEET_KEY,   JSON.stringify(sheetState)); } catch (e) {}

    var original = btn.textContent;
    btn.disabled = true;
    btn.textContent = '// SAVING…';

    Promise.all([
      fetch(API_BASE,  { method: 'PUT', body: JSON.stringify(arcState),   headers: { 'Content-Type': 'application/json' } }),
      fetch(SHEET_API, { method: 'PUT', body: JSON.stringify(sheetState), headers: { 'Content-Type': 'application/json' } })
    ])
      .then(function (responses) {
        btn.textContent = responses.every(function (r) { return r.ok; }) ? '// SAVED ✓' : '// ERROR';
      })
      .catch(function () {
        btn.textContent = '// OFFLINE';
      })
      .finally(function () {
        btn.disabled = false;
        setTimeout(function () { btn.textContent = original; }, 2000);
      });
  };


  // ── LOAD ──────────────────────────────────────────────────────────────────

  function load() {
    fetch(API_BASE)
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (state) {
        if (state && Object.keys(state).length > 0) {
          applyState(state);
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
        } else {
          loadArcFromLocalStorage();
        }
      })
      .catch(loadArcFromLocalStorage);

    fetch(SHEET_API)
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (sheet) {
        if (sheet && Object.keys(sheet).length > 0) {
          applySheet(sheet);
          try { localStorage.setItem(SHEET_KEY, JSON.stringify(sheet)); } catch (e) {}
        } else {
          loadSheetFromLocalStorage();
        }
      })
      .catch(loadSheetFromLocalStorage);
  }

  function loadArcFromLocalStorage() {
    var raw; try { raw = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    if (!raw) return;
    var state; try { state = JSON.parse(raw); } catch (e) { return; }
    applyState(state);
  }

  function loadSheetFromLocalStorage() {
    var raw; try { raw = localStorage.getItem(SHEET_KEY); } catch (e) {}
    if (!raw) return;
    var sheet; try { sheet = JSON.parse(raw); } catch (e) { return; }
    applySheet(sheet);
  }


  // ── INTERACTIONS ──────────────────────────────────────────────────────────

  // Arc: choice options
  document.querySelectorAll('.choice-opt').forEach(function (opt) {
    opt.addEventListener('click', function () {
      this.classList.toggle('selected');
      save();
    });
  });

  // Arc: open text inputs
  document.querySelectorAll('.choice-open input').forEach(function (inp) {
    inp.addEventListener('input', save);
  });

  // Arc: beat boxes (cumulative fill)
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

  // Arc: resolution moves
  window.toggleRes = function (el) {
    el.parentElement.querySelectorAll('.res-move').forEach(function (m) { m.classList.remove('selected'); });
    el.classList.add('selected');
    save();
  };

  // Sheet: stat inputs and all data-sheet / pb-special-input fields
  document.querySelectorAll('.stat-input, [data-sheet], .pb-special-input').forEach(function (el) {
    el.addEventListener('input', save);
  });

  // Dynamic bond rows
  function createBondRow(val) {
    var bc = document.getElementById('bonds-container');
    if (!bc) return;
    var row = document.createElement('div');
    row.className = 'bond-row';
    var inp = document.createElement('input');
    inp.type = 'text';
    inp.className = 'pb-field bond-input';
    inp.placeholder = 'Bond…';
    inp.value = val || '';
    inp.addEventListener('input', save);
    var btn = document.createElement('button');
    btn.className = 'remove-bond-btn';
    btn.textContent = '−';
    btn.title = 'Remove bond';
    btn.addEventListener('click', function () {
      if (bc.querySelectorAll('.bond-row').length > 1) { row.remove(); save(); }
    });
    row.appendChild(inp);
    row.appendChild(btn);
    bc.appendChild(row);
  }

  window.addBond = function () { createBondRow(''); save(); };

  // Wire static initial bond rows (loaded from HTML before applySheet runs)
  (function () {
    var bc = document.getElementById('bonds-container');
    if (!bc) return;
    bc.querySelectorAll('.bond-input').forEach(function (inp) {
      inp.addEventListener('input', save);
    });
    bc.querySelectorAll('.remove-bond-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var row = btn.closest('.bond-row');
        if (bc.querySelectorAll('.bond-row').length > 1) { row.remove(); save(); }
      });
    });
  }());

  // Checklists: move, gear, improvement items
  document.querySelectorAll('.check-item:not(.mandatory)').forEach(function (el) {
    el.addEventListener('click', function () {
      el.classList.toggle('checked');
      save();
    });
  });

  // Hide/show toggle
  window.toggleHide = function (btn, listId) {
    var list = document.getElementById(listId);
    var hidden = list.classList.toggle('hide-unchecked');
    btn.textContent = hidden ? '// SHOW ALL' : '// HIDE UNCHOSEN';
  };

  // Reset — clears all DOM, localStorage, and both D1 tables
  window.resetAll = function () {
    if (!confirm('Reset all choices and sheet data for this hunter?')) return;

    // Arc DOM
    document.querySelectorAll('.choice-opt').forEach(function (o) { o.classList.remove('selected'); });
    document.querySelectorAll('.res-move').forEach(function (o) { o.classList.remove('selected'); });
    document.querySelectorAll('.beat-box').forEach(function (o) { o.classList.remove('filled'); });
    document.querySelectorAll('.choice-open input').forEach(function (i) { i.value = ''; });

    // Checklist items
    document.querySelectorAll('.check-item:not(.mandatory)').forEach(function (el) { el.classList.remove('checked'); });

    // Sheet DOM
    document.querySelectorAll('.stat-input').forEach(function (i) { i.value = ''; });
    document.querySelectorAll('[data-sheet]').forEach(function (el) { el.value = ''; });
    document.querySelectorAll('.pb-special-input').forEach(function (el) { el.value = ''; });
    ['harm', 'luck', 'xp'].forEach(function (name) { setTrack(name, 0); });

    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    try { localStorage.removeItem(SHEET_KEY);   } catch (e) {}

    fetch(API_BASE,  { method: 'PUT', body: '{}', headers: { 'Content-Type': 'application/json' } }).catch(function () {});
    fetch(SHEET_API, { method: 'PUT', body: '{}', headers: { 'Content-Type': 'application/json' } }).catch(function () {});
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


  // ── BOOT ─────────────────────────────────────────────────────────────────
  load();

}());
