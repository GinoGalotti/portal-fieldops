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

// Clear hunter-related localStorage keys before each test so state is clean.
function clearHunterStorage(page) {
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
    await mockHunterApis(page); // PUT returns 200 {}
    await page.goto('/hunters/reed.html');
    await page.waitForLoadState('networkidle');

    const saveBtn = page.locator('#save-btn');
    await saveBtn.click();

    // Should immediately flip to SAVING…
    await expect(saveBtn).toHaveText('// SAVING…');

    // After both fetches resolve OK → SAVED ✓
    await expect(saveBtn).toHaveText('// SAVED ✓', { timeout: 4000 });
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
