// map.spec.js — Tests for the interactive district map in feed.html.
//
// Coverage:
//   Player MAP tab  — mission selector, locked/unlocked cells, detail card
//   Keeper MAP tab  — order numbers, NPC pills, unlock toggle, visited button,
//                     bulk actions (REVEAL ALL / RESET MAP / ALL VISITED / CLEAR VISITED)
//
// All D1 calls are mocked — portal-maps.json and session-data.json are read
// from disk at module level so tests stay in sync with real data.

import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ── MODULE-LEVEL DATA ─────────────────────────────────────────────────────────

const mapsData    = JSON.parse(readFileSync(resolve('./data/portal-maps.json'),   'utf-8'));
const sessionData = JSON.parse(readFileSync(resolve('./data/session-data.json'),  'utf-8'));

const aldermoorMap    = mapsData.maps.find(m => m.id === 'aldermoor');
const allLocs         = aldermoorMap.grid.flat().filter(c => c && c.type === 'loc');
const firstLoc        = allLocs[0];
const locsWithNpcs    = allLocs.filter(c => c.npcs && c.npcs.length > 0);
const locsWithOrder   = allLocs.filter(c => c.order);
const mappedSession   = sessionData.find(s => s.id === aldermoorMap.session_id);
const unmappedSession = sessionData.find(s => s.id !== aldermoorMap.session_id);

// Pre-built fully-unlocked state for bulk-action tests.
const ALL_UNLOCKED = { u: Object.fromEntries(allLocs.map(c => [c.id, true])), v: {} };

// ── HELPERS ───────────────────────────────────────────────────────────────────

// Mock all D1-backed endpoints used by feed.html. Static JSON files pass through.
async function mockMapApis(page, { mapState = { u: {}, v: {} } } = {}) {
  await page.route('**/api/v1/rolls**', r => r.fulfill({ json: [] }));
  await page.route('**/api/v1/messages**', async r => {
    if (r.request().method() !== 'GET') return r.fulfill({ json: { ok: true, id: 99 } });
    return r.fulfill({ json: [] });
  });
  await page.route('**/api/v1/hunters/**', r => r.fulfill({ json: null }));
  await page.route('**/api/v1/maps/**/state', async r => {
    if (r.request().method() === 'PUT') return r.fulfill({ json: { ok: true } });
    return r.fulfill({ json: mapState });
  });
}

async function activateKeeperMode(page) {
  const logo = page.locator('.logo');
  for (let i = 0; i < 5; i++) await logo.click();
  await expect(page.locator('.keeper-tab').first()).toBeVisible();
}

async function openPlayerMapTab(page) {
  await page.locator('[data-tab="map"]').click();
  await page.waitForLoadState('networkidle');
}

async function openKeeperMapTab(page) {
  await activateKeeperMode(page);
  await page.locator('[data-ktab="map"]').click();
  await page.waitForLoadState('networkidle');
}

// ── PLAYER MAP TAB ────────────────────────────────────────────────────────────

test.describe('feed.html — player MAP tab', () => {

  test('MAP tab button exists in player panel', async ({ page }) => {
    await mockMapApis(page);
    await page.goto('/feed.html');
    await expect(page.locator('[data-tab="map"]')).toBeVisible();
  });

  test('MAP tab renders a mission selector with one button per session', async ({ page }) => {
    await mockMapApis(page);
    await page.goto('/feed.html');
    await openPlayerMapTab(page);
    // One .handout-panel-tab per session entry in session-data.json
    await expect(page.locator('#panel-body .handout-panel-tab'))
      .toHaveCount(sessionData.length);
    for (const s of sessionData) {
      await expect(page.locator(`#panel-body .handout-panel-tab:has-text("${s.session_key}")`))
        .toBeVisible();
    }
  });

  test('selecting a session with no map shows NO MAP FOR THIS MISSION', async ({ page }) => {
    await mockMapApis(page);
    await page.goto('/feed.html');
    await openPlayerMapTab(page);
    await page.locator(`#panel-body .handout-panel-tab:has-text("${unmappedSession.session_key}")`).click();
    await expect(page.locator('#panel-body')).toContainText('NO MAP FOR THIS MISSION');
  });

  test('mapped session renders .map-grid with location cells', async ({ page }) => {
    await mockMapApis(page);
    await page.goto('/feed.html');
    await openPlayerMapTab(page);
    // M02 is the default (last session in session-data.json)
    await expect(page.locator('.map-grid')).toBeVisible();
    await expect(page.locator('.map-cell-loc').first()).toBeVisible();
  });

  test('locked cells show redacted blocks, not location labels', async ({ page }) => {
    await mockMapApis(page); // all cells locked
    await page.goto('/feed.html');
    await openPlayerMapTab(page);
    await expect(page.locator('.map-cell-loc.locked').first()).toBeVisible();
    await expect(page.locator('.map-loc-redacted').first()).toBeVisible();
    // No real labels rendered while everything is locked
    await expect(page.locator('.map-loc-label')).toHaveCount(0);
  });

  test('unlocked cell shows label and sublabel', async ({ page }) => {
    await mockMapApis(page, { mapState: { u: { [firstLoc.id]: true }, v: {} } });
    await page.goto('/feed.html');
    await openPlayerMapTab(page);
    await expect(page.locator('.map-cell-loc.unlocked')).toBeVisible();
    await expect(page.locator('.map-loc-label').first()).toContainText(firstLoc.label.slice(0, 8));
    await expect(page.locator('.map-loc-sublabel').first()).toBeVisible();
  });

  test('clicking unlocked cell shows detail card with player description', async ({ page }) => {
    await mockMapApis(page, { mapState: { u: { [firstLoc.id]: true }, v: {} } });
    await page.goto('/feed.html');
    await openPlayerMapTab(page);
    await expect(page.locator('.map-detail-card')).toHaveCount(0);
    await page.locator('.map-cell-loc.unlocked').first().click();
    await expect(page.locator('.map-detail-card')).toBeVisible();
    await expect(page.locator('.map-detail-desc'))
      .toContainText(firstLoc.player_desc.slice(0, 20));
  });

  test('clicking unlocked cell twice collapses the detail card', async ({ page }) => {
    await mockMapApis(page, { mapState: { u: { [firstLoc.id]: true }, v: {} } });
    await page.goto('/feed.html');
    await openPlayerMapTab(page);
    const cell = page.locator('.map-cell-loc.unlocked').first();
    await cell.click();
    await expect(page.locator('.map-detail-card')).toBeVisible();
    await cell.click();
    await expect(page.locator('.map-detail-card')).toHaveCount(0);
  });

  test('SYNC MAP button is present in player map view', async ({ page }) => {
    await mockMapApis(page);
    await page.goto('/feed.html');
    await openPlayerMapTab(page);
    await expect(page.locator('.map-sync-btn')).toBeVisible();
  });

  test('order numbers are NOT visible in the player view', async ({ page }) => {
    await mockMapApis(page, { mapState: ALL_UNLOCKED });
    await page.goto('/feed.html');
    await openPlayerMapTab(page);
    await expect(page.locator('.map-loc-order')).toHaveCount(0);
  });

});

// ── KEEPER MAP TAB ────────────────────────────────────────────────────────────

test.describe('feed.html — keeper MAP tab', () => {

  test('MAP tab is visible in keeper mode', async ({ page }) => {
    await mockMapApis(page);
    await page.goto('/feed.html');
    await activateKeeperMode(page);
    await expect(page.locator('[data-ktab="map"]')).toBeVisible();
  });

  test('keeper map renders mission selector with .data-sess-btn buttons', async ({ page }) => {
    await mockMapApis(page);
    await page.goto('/feed.html');
    await openKeeperMapTab(page);
    for (const s of sessionData) {
      await expect(page.locator(`.data-sess-btn:has-text("${s.session_key}")`)).toBeVisible();
    }
  });

  test('keeper M01 shows NO MAP FOR THIS MISSION', async ({ page }) => {
    await mockMapApis(page);
    await page.goto('/feed.html');
    await openKeeperMapTab(page);
    await page.locator(`.data-sess-btn:has-text("${unmappedSession.session_key}")`).click();
    await expect(page.locator('#panel-body')).toContainText('NO MAP FOR THIS MISSION');
  });

  test('order numbers visible on keeper cells (one per ordered loc)', async ({ page }) => {
    await mockMapApis(page);
    await page.goto('/feed.html');
    await openKeeperMapTab(page);
    await expect(page.locator('.map-loc-order')).toHaveCount(locsWithOrder.length);
    // Order numbers are numeric and within expected range
    const first = await page.locator('.map-loc-order').first().textContent();
    expect(Number(first)).toBeGreaterThanOrEqual(1);
  });

  test('NPC pills render on cells that have npcs defined', async ({ page }) => {
    await mockMapApis(page);
    await page.goto('/feed.html');
    await openKeeperMapTab(page);
    // Each loc with npcs should render that many pills
    for (const loc of locsWithNpcs) {
      for (const npc of loc.npcs) {
        await expect(page.locator(`.map-loc-npc:has-text("${npc}")`).first()).toBeVisible();
      }
    }
    // Cells without npcs should not produce extra pills
    const totalExpected = locsWithNpcs.reduce((n, c) => n + c.npcs.length, 0);
    await expect(page.locator('.map-loc-npc')).toHaveCount(totalExpected);
  });

  test('keeper cells show unlock toggle and visited button', async ({ page }) => {
    await mockMapApis(page);
    await page.goto('/feed.html');
    await openKeeperMapTab(page);
    await expect(page.locator('.map-loc-toggle').first()).toBeVisible();
    await expect(page.locator('.map-loc-visited-btn').first()).toBeVisible();
  });

  test('keeper cells start as locked; clicking one sends PUT and flips to unlocked', async ({ page }) => {
    await mockMapApis(page);
    await page.goto('/feed.html');
    await openKeeperMapTab(page);
    const firstCell = page.locator('.map-cell-loc').first();
    await expect(firstCell).toHaveClass(/locked/);
    const putPromise = page.waitForResponse(
      r => r.url().includes('/api/v1/maps/') && r.request().method() === 'PUT'
    );
    await firstCell.click();
    await putPromise;
    await expect(page.locator('.map-cell-loc').first()).toHaveClass(/unlocked/);
  });

  test('visited button shows ○ NOT VISITED initially; toggles to ✓ VISITED on click', async ({ page }) => {
    await mockMapApis(page);
    await page.goto('/feed.html');
    await openKeeperMapTab(page);
    const btn = page.locator('.map-loc-visited-btn').first();
    await expect(btn).toContainText('○ NOT VISITED');
    await btn.click();
    await expect(page.locator('.map-loc-visited-btn').first()).toContainText('✓ VISITED');
  });

  test('visiting a cell does not toggle the unlock state (stopPropagation)', async ({ page }) => {
    await mockMapApis(page);
    await page.goto('/feed.html');
    await openKeeperMapTab(page);
    const firstCell = page.locator('.map-cell-loc').first();
    await expect(firstCell).toHaveClass(/locked/);
    // Click only the visited button — should NOT unlock the cell
    await page.locator('.map-loc-visited-btn').first().click();
    await expect(page.locator('.map-cell-loc').first()).toHaveClass(/locked/);
  });

  test('bulk action buttons render below the grid', async ({ page }) => {
    await mockMapApis(page);
    await page.goto('/feed.html');
    await openKeeperMapTab(page);
    for (const label of ['REVEAL ALL', 'RESET MAP', 'ALL VISITED', 'CLEAR VISITED']) {
      await expect(page.locator(`.map-bulk-btn:has-text("${label}")`)).toBeVisible();
    }
  });

  test('REVEAL ALL unlocks every location cell', async ({ page }) => {
    await mockMapApis(page);
    await page.goto('/feed.html');
    await openKeeperMapTab(page);
    await expect(page.locator('.map-cell-loc.locked')).toHaveCount(allLocs.length);
    await page.locator('.map-bulk-btn:has-text("REVEAL ALL")').click();
    await expect(page.locator('.map-cell-loc.unlocked')).toHaveCount(allLocs.length);
    await expect(page.locator('.map-cell-loc.locked')).toHaveCount(0);
  });

  test('RESET MAP re-locks all cells', async ({ page }) => {
    await mockMapApis(page, { mapState: ALL_UNLOCKED });
    await page.goto('/feed.html');
    await openKeeperMapTab(page);
    await expect(page.locator('.map-cell-loc.unlocked')).toHaveCount(allLocs.length);
    await page.locator('.map-bulk-btn:has-text("RESET MAP")').click();
    await expect(page.locator('.map-cell-loc.locked')).toHaveCount(allLocs.length);
    await expect(page.locator('.map-cell-loc.unlocked')).toHaveCount(0);
  });

  test('ALL VISITED marks every cell visited', async ({ page }) => {
    await mockMapApis(page);
    await page.goto('/feed.html');
    await openKeeperMapTab(page);
    await page.locator('.map-bulk-btn:has-text("ALL VISITED")').click();
    const btns = page.locator('.map-loc-visited-btn');
    const count = await btns.count();
    for (let i = 0; i < count; i++) {
      await expect(btns.nth(i)).toContainText('✓ VISITED');
    }
  });

  test('CLEAR VISITED resets all visited cells to not-visited', async ({ page }) => {
    // Start with all cells visited
    const allVisited = { u: {}, v: Object.fromEntries(allLocs.map(c => [c.id, true])) };
    await mockMapApis(page, { mapState: allVisited });
    await page.goto('/feed.html');
    await openKeeperMapTab(page);
    // Confirm visited first
    await expect(page.locator('.map-loc-visited-btn').first()).toContainText('✓ VISITED');
    await page.locator('.map-bulk-btn:has-text("CLEAR VISITED")').click();
    const btns = page.locator('.map-loc-visited-btn');
    const count = await btns.count();
    for (let i = 0; i < count; i++) {
      await expect(btns.nth(i)).toContainText('○ NOT VISITED');
    }
  });

});
