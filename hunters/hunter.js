(function () {

  // ── KEYBOARD ACTIVATION HELPER ────────────────────────────────────────────
  // Makes a non-interactive element (div/span) keyboard-accessible:
  // adds tabindex, role, and Enter/Space keydown handler that triggers click.
  function makeKeyboardAccessible(el, role) {
    el.setAttribute('tabindex', '0');
    if (role) el.setAttribute('role', role);
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        el.click();
      }
    });
  }

  // ── KEEPER TOGGLE ─────────────────────────────────────────────────────────
  // 5 rapid clicks on .hero-eyebrow reveals/re-blurs keeper content.
  var unlocked    = false;
  var keeperClicks = 0;
  var keeperTimer  = null;

  function toggleKeeper() {
    unlocked = !unlocked;
    document.querySelectorAll('.arc-keeper').forEach(function (el) {
      el.classList.toggle('blurred', !unlocked);
    });
    document.querySelectorAll('.blur-notice').forEach(function (el) {
      el.style.display = unlocked ? 'none' : '';
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var eyebrow = document.querySelector('.hero-eyebrow');
    if (!eyebrow) return;
    eyebrow.addEventListener('click', function () {
      keeperClicks++;
      clearTimeout(keeperTimer);
      if (keeperClicks >= 5) {
        keeperClicks = 0;
        toggleKeeper();
      } else {
        keeperTimer = setTimeout(function () { keeperClicks = 0; }, 2000);
      }
    });
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

  var pendingImprovements = 0;


  // ── HARM STATUS + PENDING IMPROVEMENTS UI ────────────────────────────────

  function injectHarmStatusUI() {
    var harmPip = document.querySelector('.track-pip[data-track="harm"]');
    if (!harmPip) return;
    var row = harmPip.closest('.track-row');
    if (!row) return;
    var el = document.createElement('span');
    el.id = 'harm-status';
    el.className = 'harm-status okay';
    el.textContent = '// OKAY';
    row.appendChild(el);
  }

  function updateHarmStatus() {
    var el = document.getElementById('harm-status');
    if (!el) return;
    var count = 0;
    document.querySelectorAll('.track-pip[data-track="harm"]').forEach(function (pip) {
      if (pip.classList.contains('filled-harm')) count++;
    });
    if (count >= 7) {
      el.textContent = '// DYING';
      el.className = 'harm-status dying';
    } else if (count >= 3) {
      el.textContent = '// UNSTABLE';
      el.className = 'harm-status unstable';
    } else {
      el.textContent = '// OKAY';
      el.className = 'harm-status okay';
    }
  }

  function injectPendingImprovementsUI() {
    var xpPip = document.querySelector('.track-pip[data-track="xp"]');
    if (!xpPip) return;
    var row = xpPip.closest('.track-row');
    if (!row) return;
    var el = document.createElement('div');
    el.id = 'pending-improvements-counter';
    el.className = 'pending-improvements';
    el.style.display = 'none';
    el.innerHTML =
      '<span class="pi-label">// PENDING IMPROVEMENTS</span>' +
      '<span class="pi-count">0</span>' +
      '<button class="pi-use-btn" title="Spend improvement">−</button>';
    el.querySelector('.pi-use-btn').addEventListener('click', function () {
      if (pendingImprovements > 0) {
        pendingImprovements--;
        updatePendingImprovementsUI();
        save();
      }
    });
    row.insertAdjacentElement('afterend', el);
  }

  function updatePendingImprovementsUI() {
    var el = document.getElementById('pending-improvements-counter');
    if (!el) return;
    if (pendingImprovements > 0) {
      el.style.display = '';
      el.querySelector('.pi-count').textContent = pendingImprovements;
    } else {
      el.style.display = 'none';
    }
  }


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
    var sheet = { stats: {}, harm: 0, luck: 0, xp: 0, bonds: [], notes: '', special: [], checks: {}, hiddenLists: [] };

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

    // Hidden lists (hide-unchosen toggle state)
    sheet.hiddenLists = [];
    document.querySelectorAll('.check-list.hide-unchecked').forEach(function (el) {
      if (el.id) sheet.hiddenLists.push(el.id);
    });

    sheet.pendingImprovements = pendingImprovements;

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

    // Restore hidden lists
    if (sheet.hiddenLists && sheet.hiddenLists.length > 0) {
      sheet.hiddenLists.forEach(function (id) {
        var list = document.getElementById(id);
        if (!list) return;
        list.classList.add('hide-unchecked');
        var btn = document.querySelector('.hide-toggle[onclick*="\'' + id + '\'"]');
        if (btn) btn.textContent = '// SHOW ALL';
      });
    }

    // Pending improvements + harm status
    if (typeof sheet.pendingImprovements === 'number') pendingImprovements = sheet.pendingImprovements;
    updatePendingImprovementsUI();
    updateHarmStatus();
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
      makeKeyboardAccessible(pip, 'button');
      pip.setAttribute('aria-label', name.charAt(0).toUpperCase() + name.slice(1) + ' pip ' + (i + 1) + ' of ' + pips.length);
      pip.addEventListener('click', function () {
        var currentFill = 0;
        pips.forEach(function (p, j) { if (p.classList.contains('filled-' + name)) currentFill = j + 1; });
        var newVal = currentFill === i + 1 ? i : i + 1;
        // XP overflow: filling the last pip earns an improvement instead
        if (name === 'xp' && newVal === pips.length) {
          setTrack('xp', 0);
          pendingImprovements++;
          updatePendingImprovementsUI();
        } else {
          setTrack(name, newVal);
        }
        if (name === 'harm') updateHarmStatus();
        save();
      });
    });
  });


  // ── AUTH HELPERS ───────────────────────────────────────────────────────────

  function _authFetch() {
    return (window.portalAuth && window.portalAuth.isLoggedIn())
      ? window.portalAuth.fetch.bind(window.portalAuth) : fetch;
  }

  function _canEdit() {
    var auth = window.portalAuth;
    if (!auth) return false;
    var user = auth.getUser();
    if (!user) return false;
    return user.role === 'admin' || user.username === hunterId;
  }

  function _applyAuthGating() {
    var editable = _canEdit();
    // Disable interactive elements for non-owners
    document.querySelectorAll(
      '.choice-opt, .beat-box, .res-move, .track-pip, .stat-input, ' +
      '[data-sheet], .pb-special-input, .check-item:not(.mandatory), .choice-open input, .pi-use-btn'
    ).forEach(function (el) {
      el.style.pointerEvents = editable ? '' : 'none';
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.disabled = !editable;
      if (el.hasAttribute('tabindex')) el.setAttribute('tabindex', editable ? '0' : '-1');
    });

    // Show/hide explicit save buttons
    document.querySelectorAll('[onclick*="saveNow"], [onclick*="resetAll"]').forEach(function (btn) {
      btn.style.display = editable ? '' : 'none';
    });

    // Auth notice
    var noticeId = 'hunter-auth-notice';
    var existing = document.getElementById(noticeId);
    if (!editable && !existing) {
      var notice = document.createElement('div');
      notice.id = noticeId;
      notice.style.cssText = 'font-family:"Share Tech Mono",monospace;font-size:0.65rem;' +
        'color:var(--text-dim,#5a7a62);text-align:center;padding:0.75rem 0 0.25rem';
      var user = window.portalAuth ? window.portalAuth.getUser() : null;
      notice.textContent = user
        ? '// NOT AUTHORISED TO EDIT THIS OPERATIVE'
        : '// LOG IN TO EDIT THIS OPERATIVE';
      var anchor = document.querySelector('.pb-save-bar, .arc-save, .page-actions, header');
      if (anchor) anchor.insertAdjacentElement('afterend', notice);
      else document.body.prepend(notice);
    } else if (editable && existing) {
      existing.remove();
    }
  }


  // ── SAVE ──────────────────────────────────────────────────────────────────

  function save() {
    if (!_canEdit()) return;
    var arcState   = serialise();
    var sheetState = serialiseSheet();

    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arcState));   } catch (e) {}
    try { localStorage.setItem(SHEET_KEY,   JSON.stringify(sheetState)); } catch (e) {}

    var af = _authFetch();
    af(API_BASE,  { method: 'PUT', body: JSON.stringify(arcState),   headers: { 'Content-Type': 'application/json' } }).catch(function () {});
    af(SHEET_API, { method: 'PUT', body: JSON.stringify(sheetState), headers: { 'Content-Type': 'application/json' } }).catch(function () {});
  }

  // Add aria-live to save button so screen readers announce status changes
  var saveBtn = document.getElementById('save-btn');
  if (saveBtn) saveBtn.setAttribute('aria-live', 'polite');

  window.saveNow = function (btn) {
    if (!_canEdit()) return;
    var arcState   = serialise();
    var sheetState = serialiseSheet();

    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arcState));   } catch (e) {}
    try { localStorage.setItem(SHEET_KEY,   JSON.stringify(sheetState)); } catch (e) {}

    var original = btn.textContent;
    btn.disabled = true;
    btn.textContent = '// SAVING…';

    var af = _authFetch();
    Promise.all([
      af(API_BASE,  { method: 'PUT', body: JSON.stringify(arcState),   headers: { 'Content-Type': 'application/json' } }),
      af(SHEET_API, { method: 'PUT', body: JSON.stringify(sheetState), headers: { 'Content-Type': 'application/json' } })
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
    makeKeyboardAccessible(opt, 'checkbox');
    opt.setAttribute('aria-checked', opt.classList.contains('selected') ? 'true' : 'false');
    opt.addEventListener('click', function () {
      this.classList.toggle('selected');
      this.setAttribute('aria-checked', this.classList.contains('selected') ? 'true' : 'false');
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
      makeKeyboardAccessible(box, 'checkbox');
      box.setAttribute('aria-label', 'Beat ' + (i + 1) + ' of ' + boxes.length);
      box.setAttribute('aria-checked', box.classList.contains('filled') ? 'true' : 'false');
      box.addEventListener('click', function () {
        if (this.classList.contains('filled')) {
          boxes.forEach(function (b, j) { if (j >= i) { b.classList.remove('filled'); b.setAttribute('aria-checked', 'false'); } });
        } else {
          boxes.forEach(function (b, j) { if (j <= i) { b.classList.add('filled'); b.setAttribute('aria-checked', 'true'); } });
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
    makeKeyboardAccessible(el, 'checkbox');
    el.setAttribute('aria-checked', el.classList.contains('checked') ? 'true' : 'false');
    el.addEventListener('click', function () {
      el.classList.toggle('checked');
      el.setAttribute('aria-checked', el.classList.contains('checked') ? 'true' : 'false');
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
    pendingImprovements = 0;
    updatePendingImprovementsUI();
    updateHarmStatus();

    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    try { localStorage.removeItem(SHEET_KEY);   } catch (e) {}

    var af = _authFetch();
    af(API_BASE,  { method: 'PUT', body: '{}', headers: { 'Content-Type': 'application/json' } }).catch(function () {});
    af(SHEET_API, { method: 'PUT', body: '{}', headers: { 'Content-Type': 'application/json' } }).catch(function () {});
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


  // ── LUCK SPECIAL ─────────────────────────────────────────────────────────
  function loadLuckSpecial() {
    var el = document.getElementById('luck-special');
    if (!el) return;
    fetch('/data/hunters.json')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data) return;
        var hunter = data.hunters.filter(function (h) { return h.id === hunterId; })[0];
        if (!hunter) return;
        if (hunter.luck_special) {
          el.innerHTML =
            '<span class="luck-special-label">// LUCK SPECIAL</span>' +
            '<span class="luck-special-text">' + hunter.luck_special + '</span>';
        }
        if (hunter.area_of_study && hunter.area_of_study.effect) {
          var aosEl = document.getElementById('area-of-study-effect');
          if (aosEl) aosEl.textContent = hunter.area_of_study.effect;
        }
      })
      .catch(function () {});
  }


  // ── BOOT ─────────────────────────────────────────────────────────────────
  injectHarmStatusUI();
  injectPendingImprovementsUI();

  if (window.portalAuth) {
    _applyAuthGating();
  } else {
    window.addEventListener('portalAuthReady', _applyAuthGating, { once: true });
  }

  load();
  loadLuckSpecial();

}());
