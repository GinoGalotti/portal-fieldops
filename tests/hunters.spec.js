// hunters.spec.js — Tests for hunters/*.html (Hunter pages).
//
// ARCHITECTURE NOTES (read before editing):
// - Hunter pages share hunter.js for all persistence logic. Testing reed.html
//   covers the shared code; rex.html is smoke-tested for basic structure.
// - hunter.js fetches two D1 endpoints on load:
//     GET /api/v1/hunters/{id}/arc-state  → arc choices, beats, resolution
//     GET /api/v1/hunters/{id}/sheet       → stats, harm/luck/xp tracks, checks
//   Both are mocked here to return {} so the page uses empty/default state.
// - Static file /data/hunters.json is served normally (no mock needed) —
//   it populates #luck-special and area-of-study-effect via loadLuckSpecial().
// - Track pips: .track-pip[data-track="harm|luck|xp"]. Cumulative fill:
//   clicking pip N fills 1..N; clicking the last filled pip unfills it.
// - Save button: #save-btn calls window.saveNow(btn). On click: button text
//   changes to "// SAVING…"; after both PUTs resolve OK: "// SAVED ✓".

import { test, expect } from '@playwright/test';

// ── MOCK HELPER ───────────────────────────────────────────────────────────────

// Intercepts both D1 API calls for a hunter. GET returns {}, PUT returns 200 {}.
// /data/hunters.json passes through (static file).
async function mockHunterApis(page) {
  await page.route('**/api/v1/hunters/**', async route => {
    if (route.request().method() === 'PUT') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    }
    return route.fulfill({ contentType: 'application/json', body: '{}' });
  });
}

// Inject a fake admin JWT so _canEdit() returns true and auth gating does not
// apply pointer-events:none / display:none to interactive elements.
function injectFakeAdminAuth(page) {
  return page.addInitScript(() => {
    var payload = btoa(JSON.stringify({ sub: 'admin', role: 'admin', display: 'Admin', exp: 9999999999 }))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    localStorage.setItem('portal-auth-token', 'hdr.' + payload + '.sig');
  });
}

// Clear hunter-related localStorage keys before each test so state is clean.
function clearHunterStorage(page) {
  injectFakeAdminAuth(page);
  return page.addInitScript(() => {
    ['portal_hunter_reed', 'portal_sheet_reed', 'portal_hunter_rex', 'portal_sheet_rex'].forEach(function (k) {
      try { localStorage.removeItem(k); } catch (e) {}
    });
  });
}

// ── STRUCTURE — reed.html ─────────────────────────────────────────────────────

test.describe('Hunter pages — structure (reed.html)', () => {

  test.beforeEach(async ({ page }) => {
    clearHunterStorage(page);
    await mockHunterApis(page);
    await page.goto('/hunters/reed.html');
    await page.waitForLoadState('networkidle');
  });

  test('page title contains "REED ATWOOD"', async ({ page }) => {
    await expect(page).toHaveTitle(/Reed Atwood/i);
  });

  test('player-nav is injected with links', async ({ page }) => {
    const nav = page.locator('#player-nav');
    await expect(nav).toBeVisible();
    await expect(nav.locator('a').first()).toBeVisible();
  });

  test('.hero-title is visible', async ({ page }) => {
    await expect(page.locator('.hero-title')).toBeVisible();
  });

  test('stat inputs render for all five stats', async ({ page }) => {
    const statInputs = page.locator('.stat-input[data-stat]');
    await expect(statInputs).toHaveCount(5);
  });

  test('harm track pips render', async ({ page }) => {
    const harmPips = page.locator('.track-pip[data-track="harm"]');
    await expect(harmPips.first()).toBeVisible();
  });

  test('luck track pips render', async ({ page }) => {
    const luckPips = page.locator('.track-pip[data-track="luck"]');
    await expect(luckPips.first()).toBeVisible();
  });

  test('xp track pips render', async ({ page }) => {
    const xpPips = page.locator('.track-pip[data-track="xp"]');
    await expect(xpPips.first()).toBeVisible();
  });

  test('#luck-special element exists', async ({ page }) => {
    // hunter.js calls loadLuckSpecial() which fetches /data/hunters.json
    // and populates #luck-special. The element must exist in HTML.
    await expect(page.locator('#luck-special')).toBeAttached();
  });

  test('arc containers render (at least one .arc[id])', async ({ page }) => {
    const arcs = page.locator('.arc[id]');
    await expect(arcs.first()).toBeVisible();
  });

  test('beat-boxes are visible inside arc containers', async ({ page }) => {
    const beatBoxes = page.locator('.arc .beat-box');
    await expect(beatBoxes.first()).toBeVisible();
  });

  test('.choice-opt elements are present and clickable', async ({ page }) => {
    const opts = page.locator('.choice-opt');
    await expect(opts.first()).toBeVisible();
  });

});

// ── TRACK PIPS — harm ─────────────────────────────────────────────────────────

test.describe('Hunter pages — track pip interaction', () => {

  test.beforeEach(async ({ page }) => {
    clearHunterStorage(page);
    await mockHunterApis(page);
    await page.goto('/hunters/reed.html');
    await page.waitForLoadState('networkidle');
  });

  test('clicking pip 3 fills pips 1–3 on the harm track', async ({ page }) => {
    // Harm pips are 0-indexed. Pip index 2 = pip 3 visually.
    const harmPips = page.locator('.track-pip[data-track="harm"]');
    await harmPips.nth(2).click();
    // hunter.js setTrack fills pips 0..N-1 with class 'filled-harm'
    await expect(harmPips.nth(0)).toHaveClass(/filled-harm/);
    await expect(harmPips.nth(1)).toHaveClass(/filled-harm/);
    await expect(harmPips.nth(2)).toHaveClass(/filled-harm/);
    await expect(harmPips.nth(3)).not.toHaveClass(/filled-harm/);
  });

  test('clicking pip 3 again (already filled) unfills it — harm becomes 2', async ({ page }) => {
    const harmPips = page.locator('.track-pip[data-track="harm"]');
    await harmPips.nth(2).click(); // fill to 3
    await harmPips.nth(2).click(); // clicking last filled pip → unfills it → harm=2
    await expect(harmPips.nth(0)).toHaveClass(/filled-harm/);
    await expect(harmPips.nth(1)).toHaveClass(/filled-harm/);
    await expect(harmPips.nth(2)).not.toHaveClass(/filled-harm/);
  });

  test('clicking pip 1 on luck track fills only pip 1', async ({ page }) => {
    const luckPips = page.locator('.track-pip[data-track="luck"]');
    await luckPips.nth(0).click(); // pip 1 (0-indexed = 0)
    await expect(luckPips.nth(0)).toHaveClass(/filled-luck/);
    await expect(luckPips.nth(1)).not.toHaveClass(/filled-luck/);
  });

});

// ── ARC INTERACTION ───────────────────────────────────────────────────────────

test.describe('Hunter pages — arc state', () => {

  test.beforeEach(async ({ page }) => {
    clearHunterStorage(page);
    await mockHunterApis(page);
    await page.goto('/hunters/reed.html');
    await page.waitForLoadState('networkidle');
  });

  test('clicking a .choice-opt adds .selected class', async ({ page }) => {
    const opt = page.locator('.choice-opt').first();
    await expect(opt).not.toHaveClass(/selected/);
    await opt.click();
    await expect(opt).toHaveClass(/selected/);
  });

  test('clicking a selected .choice-opt removes .selected class (toggle)', async ({ page }) => {
    const opt = page.locator('.choice-opt').first();
    await opt.click();
    await expect(opt).toHaveClass(/selected/);
    await opt.click();
    await expect(opt).not.toHaveClass(/selected/);
  });

});

// ── SAVE BUTTON ───────────────────────────────────────────────────────────────

test.describe('Hunter pages — save button', () => {

  test('clicking save shows "// SAVING…" then "// SAVED ✓" on success', async ({ page }) => {
    clearHunterStorage(page);
    // Slow PUT so the SAVING… state is observable before SAVED ✓ renders.
    await page.route('**/api/v1/hunters/**', async route => {
      if (route.request().method() === 'PUT') {
        await new Promise(r => setTimeout(r, 150));
        return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      }
      return route.fulfill({ contentType: 'application/json', body: '{}' });
    });
    await page.goto('/hunters/reed.html');
    await page.waitForLoadState('networkidle');

    const saveBtn = page.locator('#save-btn');
    await saveBtn.click();

    // Should flip to SAVING… immediately; mock delay keeps it there long enough to assert.
    await expect(saveBtn).toHaveText('// SAVING…');

    // After both PUTs resolve OK → SAVED ✓
    await expect(saveBtn).toHaveText('// SAVED ✓', { timeout: 4000 });
  });

});

// ── JOHN JOHNSON SMOKE TEST ───────────────────────────────────────────────────

test.describe('Hunter pages — john.html smoke', () => {

  test.beforeEach(async ({ page }) => {
    injectFakeAdminAuth(page);
    await page.addInitScript(() => {
      ['portal_hunter_john', 'portal_sheet_john'].forEach(function (k) {
        try { localStorage.removeItem(k); } catch (e) {}
      });
    });
    await page.route('**/api/v1/hunters/**', async route => {
      if (route.request().method() === 'PUT') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      }
      return route.fulfill({ contentType: 'application/json', body: '{}' });
    });
    await page.goto('/hunters/john.html');
    await page.waitForLoadState('networkidle');
  });

  test('page title contains "John Johnson"', async ({ page }) => {
    await expect(page).toHaveTitle(/John Johnson/i);
  });

  test('player-nav is injected with links', async ({ page }) => {
    const nav = page.locator('#player-nav');
    await expect(nav).toBeVisible();
    await expect(nav.locator('a').first()).toBeVisible();
  });

  test('.hero-title contains "JOHN" and "JOHNSON"', async ({ page }) => {
    const title = page.locator('.hero-title');
    await expect(title).toContainText('JOHN');
    await expect(title).toContainText('JOHNSON');
  });

  test('stat inputs render for all five stats', async ({ page }) => {
    const statInputs = page.locator('.stat-input[data-stat]');
    await expect(statInputs).toHaveCount(5);
  });

  test('7 harm pips render', async ({ page }) => {
    const pips = page.locator('.track-pip[data-track="harm"]');
    await expect(pips).toHaveCount(7);
  });

  test('7 luck pips render', async ({ page }) => {
    const pips = page.locator('.track-pip[data-track="luck"]');
    await expect(pips).toHaveCount(7);
  });

  test('5 xp pips render', async ({ page }) => {
    const pips = page.locator('.track-pip[data-track="xp"]');
    await expect(pips).toHaveCount(5);
  });

  test('#luck-special element exists', async ({ page }) => {
    await expect(page.locator('#luck-special')).toBeAttached();
  });

  test('3 arc containers render', async ({ page }) => {
    const arcs = page.locator('.arc[id]');
    await expect(arcs).toHaveCount(3);
  });

  test('15 beat boxes render (5 per arc)', async ({ page }) => {
    const beatBoxes = page.locator('.arc .beat-box');
    await expect(beatBoxes).toHaveCount(15);
  });

  test('.choice-opt elements are present and clickable', async ({ page }) => {
    const opts = page.locator('.choice-opt');
    await expect(opts.first()).toBeVisible();
  });

  test('clicking a .choice-opt adds .selected class', async ({ page }) => {
    const opt = page.locator('.choice-opt').first();
    await opt.click();
    await expect(opt).toHaveClass(/selected/);
  });

  test('save button shows SAVING then SAVED on success', async ({ page }) => {
    // Override the route set in beforeEach to add a delay so SAVING… is observable.
    await page.route('**/api/v1/hunters/**', async route => {
      if (route.request().method() === 'PUT') {
        await new Promise(r => setTimeout(r, 150));
        return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      }
      return route.fulfill({ contentType: 'application/json', body: '{}' });
    });
    const saveBtn = page.locator('#save-btn');
    await saveBtn.click();
    await expect(saveBtn).toHaveText('// SAVING…');
    await expect(saveBtn).toHaveText('// SAVED ✓', { timeout: 4000 });
  });

});

// ── D1 RESTORE — sheet ───────────────────────────────────────────────────────
//
// Mock the GET /api/v1/hunters/reed/sheet endpoint to return a known sheet state.
// Page must apply that state on load without any Save interaction.

test.describe('Hunter pages — sheet restore from D1', () => {

  test('harm pips restore from D1 sheet on load', async ({ page }) => {
    // Seed localStorage with empty so the page always goes to D1 first.
    await page.addInitScript(() => {
      try { localStorage.removeItem('portal_sheet_reed'); } catch (e) {}
    });
    await page.route('**/api/v1/hunters/reed/sheet', async route => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({ harm: 3, luck: 0, xp: 0, pendingImprovements: 0 }),
        });
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });
    await page.route('**/api/v1/hunters/reed/arc-state', async route => {
      return route.fulfill({ contentType: 'application/json', body: '{}' });
    });

    await page.goto('/hunters/reed.html');
    await page.waitForLoadState('networkidle');

    // harm=3 means pips 0, 1, 2 filled; pip 3 not filled.
    const harmPips = page.locator('.track-pip[data-track="harm"]');
    await expect(harmPips.nth(0)).toHaveClass(/filled-harm/);
    await expect(harmPips.nth(1)).toHaveClass(/filled-harm/);
    await expect(harmPips.nth(2)).toHaveClass(/filled-harm/);
    await expect(harmPips.nth(3)).not.toHaveClass(/filled-harm/);
  });

  test('pending improvements counter shows when D1 sheet returns pendingImprovements > 0', async ({ page }) => {
    await page.addInitScript(() => {
      try { localStorage.removeItem('portal_sheet_reed'); } catch (e) {}
    });
    await page.route('**/api/v1/hunters/reed/sheet', async route => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({ harm: 0, luck: 0, xp: 0, pendingImprovements: 2 }),
        });
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });
    await page.route('**/api/v1/hunters/reed/arc-state', async route => {
      return route.fulfill({ contentType: 'application/json', body: '{}' });
    });

    await page.goto('/hunters/reed.html');
    await page.waitForLoadState('networkidle');

    // #pending-improvements-counter must be visible with count = 2.
    const counter = page.locator('#pending-improvements-counter');
    await expect(counter).toBeVisible();
    await expect(counter.locator('.pi-count')).toHaveText('2');
  });

});

// ── D1 RESTORE — arc state ────────────────────────────────────────────────────

test.describe('Hunter pages — arc state restore from D1', () => {

  test('choice-opt restored as selected when D1 arc-state returns it chosen', async ({ page }) => {
    await page.addInitScript(() => {
      try { localStorage.removeItem('portal_hunter_reed'); } catch (e) {}
    });

    // Mock arc-state GET to return the first choice in arc-weakness group 0 as selected.
    await page.route('**/api/v1/hunters/reed/arc-state', async route => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          contentType: 'application/json',
          // Arc state structure: { arcId: { choices: { 'groupIdx-optIdx': true } } }
          // '0-0' selects the first option of the first choice-group in arc-weakness.
          body: JSON.stringify({ 'arc-weakness': { choices: { '0-0': true }, texts: {}, beats: 0, resolution: null } }),
        });
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });
    await page.route('**/api/v1/hunters/reed/sheet', async route => {
      return route.fulfill({ contentType: 'application/json', body: '{}' });
    });

    await page.goto('/hunters/reed.html');
    await page.waitForLoadState('networkidle');

    // The first .choice-opt inside #arc-weakness must be selected.
    const firstOpt = page.locator('#arc-weakness .choice-opt').first();
    await expect(firstOpt).toHaveClass(/selected/);

    // And the second option (0-1) must NOT be selected (wasn't in state).
    const secondOpt = page.locator('#arc-weakness .choice-opt').nth(1);
    await expect(secondOpt).not.toHaveClass(/selected/);
  });

});

// ── OFFLINE FALLBACK ─────────────────────────────────────────────────────────
//
// When D1 endpoints return 500, hunter.js falls back to localStorage for both
// arc state and sheet state. This test seeds localStorage with known state,
// mocks both APIs to fail, then asserts that the stored state is applied.

test.describe('Hunter pages — offline fallback to localStorage', () => {

  test('sheet renders from localStorage when D1 sheet endpoint returns 500', async ({ page }) => {
    // Seed localStorage with harm=4 before the page loads.
    await page.addInitScript(() => {
      try {
        localStorage.setItem('portal_sheet_reed', JSON.stringify({
          harm: 4, luck: 0, xp: 0, pendingImprovements: 0,
        }));
        localStorage.removeItem('portal_hunter_reed'); // clear arc cache
      } catch (e) {}
    });

    // Both D1 endpoints return 500 (simulates offline).
    await page.route('**/api/v1/hunters/reed/sheet', async route => {
      return route.fulfill({ status: 500, body: 'Service Unavailable' });
    });
    await page.route('**/api/v1/hunters/reed/arc-state', async route => {
      return route.fulfill({ status: 500, body: 'Service Unavailable' });
    });

    await page.goto('/hunters/reed.html');
    await page.waitForLoadState('networkidle');

    // harm=4 → pips 0-3 filled (restored from localStorage, not D1).
    const harmPips = page.locator('.track-pip[data-track="harm"]');
    await expect(harmPips.nth(0)).toHaveClass(/filled-harm/);
    await expect(harmPips.nth(3)).toHaveClass(/filled-harm/);
    await expect(harmPips.nth(4)).not.toHaveClass(/filled-harm/);
  });

  test('arc state renders from localStorage when D1 arc endpoint returns 500', async ({ page }) => {
    // Seed localStorage with arc state: first choice-opt in arc-weakness selected.
    await page.addInitScript(() => {
      try {
        localStorage.setItem('portal_hunter_reed', JSON.stringify({
          'arc-weakness': { choices: { '0-0': true }, texts: {}, beats: 0, resolution: null },
        }));
        localStorage.removeItem('portal_sheet_reed');
      } catch (e) {}
    });

    await page.route('**/api/v1/hunters/reed/arc-state', async route => {
      return route.fulfill({ status: 500, body: 'Service Unavailable' });
    });
    await page.route('**/api/v1/hunters/reed/sheet', async route => {
      return route.fulfill({ status: 500, body: 'Service Unavailable' });
    });

    await page.goto('/hunters/reed.html');
    await page.waitForLoadState('networkidle');

    // First choice-opt in arc-weakness must be selected (from localStorage fallback).
    await expect(page.locator('#arc-weakness .choice-opt').first()).toHaveClass(/selected/);
  });

});

// ── REX SMOKE TEST ────────────────────────────────────────────────────────────

test.describe('Hunter pages — rex.html smoke', () => {

  test('rex.html page title contains "REX BANGLEY"', async ({ page }) => {
    clearHunterStorage(page);
    await mockHunterApis(page);
    await page.goto('/hunters/rex.html');
    await expect(page).toHaveTitle(/Rex Bangley/i);
  });

  test('stat inputs render on rex.html', async ({ page }) => {
    clearHunterStorage(page);
    await mockHunterApis(page);
    await page.goto('/hunters/rex.html');
    await page.waitForLoadState('networkidle');
    const statInputs = page.locator('.stat-input[data-stat]');
    await expect(statInputs.first()).toBeVisible();
  });

});
