// d1-round-trip.spec.js — Full save→reload→restore cycle tests.
//
// IMPORTANT: These tests do NOT mock D1 API endpoints. They hit the real local
// D1 database served by `wrangler pages dev .` to confirm data actually survives
// a page reload. Run with the wrangler server already running, or let Playwright
// start it via webServer config (playwright.config.js).
//
// Nine scenarios:
//   1. Hunter sheet — harm track value persists across reload
//   2. Hunter arc state — choice-opt selection persists across reload
//   3. Incident state — choice button selection persists across reload
//   4. Player report — rating pip selection persists across reload
//   5. Player report — textarea text persists across reload
//   6. Map state — unlock state persists across page reload
//   7. Map state — visited state persists across page reload
//   8. Feed messages — POST insert + GET retrieval (guards against FK constraint regressions)
//   9. Feed rolls    — POST insert + GET retrieval (guards against FK constraint regressions)
//
// ARCHITECTURE:
// - beforeEach: PUT '{}' to each D1 endpoint to reset state from prior runs.
// - addInitScript: clears relevant localStorage keys before every navigation
//   (including reload) so the page always fetches fresh from D1, never cache.
// - Wait strategy: waitForText('// SAVED ✓') for hunter saves; waitForResponse
//   for incident/report saves; waitForLoadState('networkidle') after reload.
// - Player report: after reload, week + hunter must be re-selected to trigger
//   loadCurrent() — the page always starts unselected.

import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// All tests in this file hit the real local D1. Force serial execution so
// parallel test files don't race on shared D1 state between our reset and verify.
test.describe.configure({ mode: 'serial' });

const BASE = 'http://localhost:8788';

// Load incidents data at module level to derive activeWeek and its choice incident dynamically
// (same pattern as incidents.spec.js — never hardcode week IDs or incident IDs).
const incidentsData = JSON.parse(readFileSync(resolve('./data/incidents.json'), 'utf-8'));
const activeWeek = incidentsData.weeks.find(w => w.status === 'active');
const activeChoiceInc = activeWeek.incidents.find(i => i.type === 'choice');

// ── HELPERS ──────────────────────────────────────────────────────────────────

// Register an initScript that wipes hunter localStorage keys before every
// page load (including reload). This forces the page to fetch from D1.
async function clearHunterStorage(page) {
  await page.addInitScript(() => {
    ['portal_hunter_reed', 'portal_sheet_reed'].forEach(function (k) {
      try { localStorage.removeItem(k); } catch (e) {}
    });
  });
}

// Register an initScript that wipes the incident state key for a given weekId.
async function clearIncidentStorage(page, weekId) {
  await page.addInitScript((id) => {
    try { localStorage.removeItem('portal-incident-state-' + id); } catch (e) {}
  }, weekId);
}

// Register an initScript that wipes all player-report localStorage keys.
// Key pattern: portal_player_report_{week}_{hunter} (e.g. portal_player_report_W01_reed).
async function clearPlayerReportStorage(page) {
  await page.addInitScript(() => {
    try {
      Object.keys(localStorage)
        .filter(function (k) { return k.startsWith('portal_player_report_'); })
        .forEach(function (k) { localStorage.removeItem(k); });
    } catch (e) {}
  });
}

// ── RESET D1 BEFORE EACH TEST ────────────────────────────────────────────────

test.beforeEach(async ({ request }) => {
  // PUT '{}' to each endpoint to ensure a clean slate regardless of prior runs.
  // sheet.js and arc-state.js accept text bodies that are valid JSON.
  // incidents/state.js uses request.json() so we send an object (Playwright
  // serialises it as JSON with the correct Content-Type automatically).
  await Promise.all([
    request.put(`${BASE}/api/v1/hunters/reed/sheet`, {
      headers: { 'Content-Type': 'text/plain' },
      data: '{}',
    }),
    request.put(`${BASE}/api/v1/hunters/reed/arc-state`, {
      headers: { 'Content-Type': 'text/plain' },
      data: '{}',
    }),
    request.put(`${BASE}/api/v1/incidents/${activeWeek.id}/state`, {
      data: {},
    }),
    // player-reports API also uses request.text() so send as text/plain.
    request.put(`${BASE}/api/v1/player-reports/W01/reed/state`, {
      headers: { 'Content-Type': 'text/plain' },
      data: '{}',
    }),
    // Map state uses JSON body — reset to clean { u:{}, v:{} } structure.
    request.put(`${BASE}/api/v1/maps/aldermoor/state`, {
      data: { u: {}, v: {} },
    }),
    // Ensure W01 player report is enabled (no D1 row = default locked, which blocks form unlock).
    request.put(`${BASE}/api/v1/player-reports/W01/visibility`, {
      data: { enabled: true },
    }),
    // Clean up any leftover messages from prior round-trip test runs.
    request.delete(`${BASE}/api/v1/messages?session_id=rt-test`),
  ]);
});

// ── TEST 1: Hunter sheet — harm track ────────────────────────────────────────

test('hunter sheet — harm track value persists across reload', async ({ page }) => {
  // Clear localStorage so every load (incl. reload) must fetch from D1.
  await clearHunterStorage(page);

  await page.goto('/hunters/reed.html');
  await page.waitForLoadState('networkidle');

  // Click pip at index 2 → fills pips 0, 1, 2 (cumulative fill behaviour).
  const harmPips = page.locator('.track-pip[data-track="harm"]');
  await harmPips.nth(2).click();

  // Verify pips filled before saving.
  await expect(harmPips.nth(0)).toHaveClass(/filled-harm/);
  await expect(harmPips.nth(1)).toHaveClass(/filled-harm/);
  await expect(harmPips.nth(2)).toHaveClass(/filled-harm/);

  // Click Save and wait for the confirmed-saved feedback text.
  const saveBtn = page.locator('#save-btn');
  await saveBtn.click();
  await expect(saveBtn).toHaveText('// SAVED ✓', { timeout: 5000 });

  // Reload — addInitScript clears localStorage so the page fetches from D1.
  await page.reload();
  await page.waitForLoadState('networkidle');

  // Pips 0–2 must still be filled (restored from D1, not localStorage cache).
  await expect(harmPips.nth(0)).toHaveClass(/filled-harm/);
  await expect(harmPips.nth(1)).toHaveClass(/filled-harm/);
  await expect(harmPips.nth(2)).toHaveClass(/filled-harm/);
  await expect(harmPips.nth(3)).not.toHaveClass(/filled-harm/);
});

// ── TEST 2: Hunter arc state — choice selection ───────────────────────────────

test('hunter arc state — choice-opt selection persists across reload', async ({ page }) => {
  await clearHunterStorage(page);

  await page.goto('/hunters/reed.html');
  await page.waitForLoadState('networkidle');

  // Click the first choice option in the arcs panel.
  const firstOpt = page.locator('.choice-opt').first();
  await firstOpt.click();
  await expect(firstOpt).toHaveClass(/selected/);

  // Save and wait for confirmation.
  const saveBtn = page.locator('#save-btn');
  await saveBtn.click();
  await expect(saveBtn).toHaveText('// SAVED ✓', { timeout: 5000 });

  // Reload — localStorage cleared by addInitScript, page fetches from D1.
  await page.reload();
  await page.waitForLoadState('networkidle');

  // The same choice-opt must still be selected (restored from D1).
  await expect(page.locator('.choice-opt').first()).toHaveClass(/selected/);
});

// ── TEST 3: Incident choice state ────────────────────────────────────────────

test('incident choice state — selection persists across reload', async ({ page }) => {
  // Use the active week's choice incident — avoids hardcoding IDs that change as weeks advance.
  await clearIncidentStorage(page, activeWeek.id);

  await page.goto('/lab-incidents.html');
  await page.waitForLoadState('networkidle');

  // Select choice A (first .choice-btn in the active week's choice grid).
  const choiceGridId = '#choice-grid-' + activeChoiceInc.id;
  const btnA = page.locator(choiceGridId + ' .choice-btn').first();
  await btnA.click();
  await expect(btnA).toHaveClass(/selected/);

  // Click Save and wait for the PUT to reach D1.
  const saveBtn = page.locator('#save-btn');
  await saveBtn.click();
  await page.waitForResponse(
    r => r.url().includes('/api/v1/incidents/') && r.request().method() === 'PUT'
  );
  await expect(saveBtn).toHaveText('SAVED', { timeout: 5000 });

  // Reload — addInitScript clears localStorage, page fetches from D1.
  await page.reload();
  await page.waitForLoadState('networkidle');

  // Choice A must still be selected (lockChoiceUI restores it from D1 state).
  await expect(page.locator(choiceGridId + ' .choice-btn').first()).toHaveClass(/selected/);
});

// ── TEST 4: Player report — rating pip ───────────────────────────────────────

test('player report — rating pip selection persists across reload', async ({ page }) => {
  // addInitScript clears all portal_player_report_* keys before every navigation.
  await clearPlayerReportStorage(page);

  await page.goto('/reports/player-report.html');
  await page.waitForLoadState('networkidle');

  // Unlock the form by selecting week W01 and hunter Reed.
  await page.locator('[data-week="W01"]').click();
  await page.locator('[data-hunter="reed"]').click();
  // Wait for loadCurrent() D1 fetch to complete before interacting.
  await page.waitForLoadState('networkidle');

  // Click the "story" rating pip with value 3.
  const storyPip3 = page.locator('.rating-pip[data-rating="story"][data-val="3"]');
  await storyPip3.click();
  await expect(storyPip3).toHaveClass(/selected/);

  // Save and wait for the PUT to reach D1.
  await page.locator('#btn-save-bottom').click();
  await page.waitForResponse(
    r => r.url().includes('/api/v1/player-reports/') && r.request().method() === 'PUT'
  );

  // Reload — addInitScript clears localStorage, so page must fetch from D1.
  await page.reload();
  await page.waitForLoadState('networkidle');

  // Re-select week + hunter to trigger loadCurrent() (page always starts unselected).
  await page.locator('[data-week="W01"]').click();
  await page.locator('[data-hunter="reed"]').click();
  await page.waitForLoadState('networkidle');

  // Story pip 3 must still be selected (restored from D1 via applyState()).
  await expect(page.locator('.rating-pip[data-rating="story"][data-val="3"]')).toHaveClass(/selected/);
  // Other pips in the same category must not be selected.
  await expect(page.locator('.rating-pip[data-rating="story"][data-val="4"]')).not.toHaveClass(/selected/);
});

// ── TEST 5: Player report — textarea text ─────────────────────────────────────

test('player report — favourite moment text persists across reload', async ({ page }) => {
  await clearPlayerReportStorage(page);

  await page.goto('/reports/player-report.html');
  await page.waitForLoadState('networkidle');

  await page.locator('[data-week="W01"]').click();
  await page.locator('[data-hunter="reed"]').click();
  await page.waitForLoadState('networkidle');

  // Fill in the favourite moment textarea.
  const text = 'The moment Reed found the locket.';
  await page.locator('#f-favourite').fill(text);
  await expect(page.locator('#f-favourite')).toHaveValue(text);

  // Save and wait for PUT confirmation.
  await page.locator('#btn-save-bottom').click();
  await page.waitForResponse(
    r => r.url().includes('/api/v1/player-reports/') && r.request().method() === 'PUT'
  );

  // Reload — localStorage cleared, page fetches from D1.
  await page.reload();
  await page.waitForLoadState('networkidle');

  // Re-select to trigger loadCurrent().
  await page.locator('[data-week="W01"]').click();
  await page.locator('[data-hunter="reed"]').click();
  await page.waitForLoadState('networkidle');

  // Text must be restored from D1 (not from localStorage or memCache).
  await expect(page.locator('#f-favourite')).toHaveValue(text);
});

// ── TEST 6: Map unlock state ───────────────────────────────────────────────────
//
// Map state has no localStorage cache — every tab open fetches from D1.
// This makes the test straightforward: unlock a cell, reload, assert it's still unlocked.

test('map state — unlock persists across reload', async ({ page }) => {
  // Activate keeper mode and open the MAP tab.
  await page.goto('/feed.html');
  await page.waitForLoadState('networkidle');
  const logo = page.locator('.logo');
  for (let i = 0; i < 5; i++) await logo.click();
  await page.locator('[data-ktab="map"]').click();
  // Select the M02 session — the keeper MAP defaults to the last session (M03)
  // which has no map. M02 = aldermoor (the only map in portal-maps.json).
  await page.locator('.data-sess-btn', { hasText: 'M02' }).click();
  await page.waitForLoadState('networkidle');

  // Confirm all cells are locked (beforeEach reset state to {}).
  const firstCell = page.locator('.map-cell-loc').first();
  await expect(firstCell).toHaveClass(/locked/);

  // Unlock first cell — triggers PUT to D1.
  const putPromise = page.waitForResponse(
    r => r.url().includes('/api/v1/maps/') && r.request().method() === 'PUT'
  );
  await firstCell.click();
  await putPromise;
  await expect(page.locator('.map-cell-loc').first()).toHaveClass(/unlocked/);

  // Reload — no localStorage to clear, map always fetches fresh from D1.
  await page.reload();
  await page.waitForLoadState('networkidle');

  // Re-enter keeper mode, open MAP tab, re-select M02 (keeperMapSession resets on reload).
  for (let i = 0; i < 5; i++) await logo.click();
  await page.locator('[data-ktab="map"]').click();
  await page.locator('.data-sess-btn', { hasText: 'M02' }).click();
  await page.waitForLoadState('networkidle');

  // First cell must still be unlocked (restored from D1).
  await expect(page.locator('.map-cell-loc').first()).toHaveClass(/unlocked/);
});

// ── TEST 7: Map visited state ──────────────────────────────────────────────────

test('map state — visited mark persists across reload', async ({ page }) => {
  await page.goto('/feed.html');
  await page.waitForLoadState('networkidle');
  const logo = page.locator('.logo');
  for (let i = 0; i < 5; i++) await logo.click();
  await page.locator('[data-ktab="map"]').click();
  // Select M02 — the only session with a map (aldermoor, session_id=w2).
  await page.locator('.data-sess-btn', { hasText: 'M02' }).click();
  await page.waitForLoadState('networkidle');

  // Mark first cell as visited.
  const visitedBtn = page.locator('.map-loc-visited-btn').first();
  await expect(visitedBtn).toContainText('○ NOT VISITED');
  const putPromise = page.waitForResponse(
    r => r.url().includes('/api/v1/maps/') && r.request().method() === 'PUT'
  );
  await visitedBtn.click();
  await putPromise;
  await expect(page.locator('.map-loc-visited-btn').first()).toContainText('✓ VISITED');

  // Reload and re-enter keeper MAP tab, re-select M02.
  await page.reload();
  await page.waitForLoadState('networkidle');
  for (let i = 0; i < 5; i++) await logo.click();
  await page.locator('[data-ktab="map"]').click();
  await page.locator('.data-sess-btn', { hasText: 'M02' }).click();
  await page.waitForLoadState('networkidle');

  // Visited mark must still be there (restored from D1).
  await expect(page.locator('.map-loc-visited-btn').first()).toContainText('✓ VISITED');
});

// ── TEST 8: Feed messages — POST + GET round-trip ─────────────────────────────
//
// Guards against FK constraint regressions (the legacy messages table had
// session_id → sessions(id) which blocked every INSERT with a free-text key).
// Uses the `request` fixture directly — no browser navigation needed.

test('feed messages — POST insert succeeds and GET returns the row', async ({ request }) => {
  // POST a message using a realistic session_id ('M02') and hunter-style sender.
  const postRes = await request.post(`${BASE}/api/v1/messages`, {
    data: {
      session_id: 'rt-test',
      sender: 'REED',
      body: 'Round-trip test message',
      type: 'message',
    },
  });
  expect(postRes.ok()).toBeTruthy();
  const postBody = await postRes.json();
  expect(postBody.ok).toBe(true);
  expect(typeof postBody.id).toBe('number');

  // GET and verify the message appears in the feed.
  const getRes = await request.get(`${BASE}/api/v1/messages?after=0`);
  expect(getRes.ok()).toBeTruthy();
  const messages = await getRes.json();
  const found = messages.find(m => m.id === postBody.id);
  expect(found).toBeTruthy();
  expect(found.sender).toBe('REED');
  expect(found.body).toBe('Round-trip test message');
});

// ── TEST 9: Feed rolls — POST + GET round-trip ────────────────────────────────
//
// Guards against FK constraint regressions (the legacy rolls table had
// hunter_id → hunters(id) which blocked every INSERT with a string like 'reed').

test('feed rolls — POST insert succeeds and GET returns the row', async ({ request }) => {
  // POST a roll using a realistic hunter_id and session key.
  const postRes = await request.post(`${BASE}/api/v1/rolls`, {
    data: {
      hunter_id: 'reed',
      session: 'rt-test',
      move_name: 'Act Under Pressure',
      stat_used: 'cool',
      roll_1: 4,
      roll_2: 5,
      modifier: 1,
      total: 10,
    },
  });
  expect(postRes.ok()).toBeTruthy();
  const postBody = await postRes.json();
  expect(postBody.ok).toBe(true);
  expect(typeof postBody.id).toBe('number');
  expect(postBody.outcome).toBe('partial'); // 10 → 7-10 partial

  // GET and verify the roll appears in the feed.
  const getRes = await request.get(`${BASE}/api/v1/rolls?after=0`);
  expect(getRes.ok()).toBeTruthy();
  const rolls = await getRes.json();
  const found = rolls.find(r => r.id === postBody.id);
  expect(found).toBeTruthy();
  expect(found.hunter_id).toBe('reed');
  expect(found.move_name).toBe('Act Under Pressure');
});
