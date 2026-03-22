// arcs.spec.js — Tests for missions/arcs.html (Hunter Arc Tracker).
//
// arcs.html is a keeper-only page that fetches hunter-arcs.json and renders
// all 4 hunters × 3 arcs + 6 intersections. Beat/status/notes are interactive
// and persist to localStorage under key 'portal-arcs-v1'.
//
// DATA-DRIVEN DESIGN: Source data is loaded at module level so assertions about
// arc IDs, types, labels, and counts stay correct as arcs evolve. Never hardcode
// content strings that come from the JSON.

import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const arcsData = JSON.parse(readFileSync(resolve('./data/hunter-arcs.json'), 'utf-8'));
const allArcs = arcsData.hunters.flatMap(h => h.arcs);
const portalArcs = allArcs.filter(a => a.type === 'portal');
const svenArc2 = allArcs.find(a => a.id === 'sven-2');
const svenArc3 = allArcs.find(a => a.id === 'sven-3');

const STORE = 'portal-arcs-v1';

function clearArcsStorage(page) {
  return page.evaluate(key => localStorage.removeItem(key), STORE);
}

// ── Render structure ──────────────────────────────────────────────────────────

test.describe('Arcs render structure', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/missions/arcs.html');
    await page.waitForLoadState('networkidle');
  });

  test('#arcs-container is non-empty after networkidle', async ({ page }) => {
    const container = page.locator('#arcs-container');
    await expect(container).not.toBeEmpty();
  });

  test('all 4 hunter sections are present', async ({ page }) => {
    await expect(page.locator('.hs-rex')).toBeVisible();
    await expect(page.locator('.hs-reed')).toBeVisible();
    await expect(page.locator('.hs-alan')).toBeVisible();
    await expect(page.locator('.hs-sven')).toBeVisible();
  });

  test('hunter names render correctly', async ({ page }) => {
    // Data-driven: derive from JSON
    for (const hunter of arcsData.hunters) {
      await expect(page.locator('.hunter-name', { hasText: hunter.name })).toBeVisible();
    }
  });

  test('exactly 12 .arc-card elements (4 hunters × 3 arcs)', async ({ page }) => {
    await expect(page.locator('.arc-card')).toHaveCount(allArcs.length);
  });

  test('all 6 .int-row intersection rows present', async ({ page }) => {
    await expect(page.locator('.int-row')).toHaveCount(arcsData.intersections.length);
  });

  test('portal arcs have .portal CSS class', async ({ page }) => {
    for (const arc of portalArcs) {
      await expect(page.locator(`#${arc.id}`)).toHaveClass(/portal/);
    }
  });

  test('non-portal arcs do not have .portal CSS class', async ({ page }) => {
    const adaptedArcs = allArcs.filter(a => a.type !== 'portal');
    for (const arc of adaptedArcs) {
      await expect(page.locator(`#${arc.id}`)).not.toHaveClass(/portal/);
    }
  });

});

// ── Custom res_label (data-driven) ───────────────────────────────────────────

test.describe('Arc custom res_label', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/missions/arcs.html');
    await page.waitForLoadState('networkidle');
  });

  test('sven-2 .arc-res-label matches JSON res_label', async ({ page }) => {
    await expect(page.locator('#sven-2 .arc-res-label')).toHaveText(svenArc2.res_label);
  });

  test('sven-3 .arc-res-label matches JSON res_label', async ({ page }) => {
    await expect(page.locator('#sven-3 .arc-res-label')).toHaveText(svenArc3.res_label);
  });

  test('arcs without custom res_label show default "// RESOLUTION NOTE"', async ({ page }) => {
    // rex-1 has no res_label in JSON → falls back to default
    const rex1 = allArcs.find(a => a.id === 'rex-1');
    const expectedLabel = rex1.res_label || '// RESOLUTION NOTE';
    await expect(page.locator('#rex-1 .arc-res-label')).toHaveText(expectedLabel);
  });

});

// ── Beat box interaction ──────────────────────────────────────────────────────

test.describe('Beat box interaction', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/missions/arcs.html');
    await page.waitForLoadState('networkidle');
    await clearArcsStorage(page);
  });

  test('clicking beat 3 on rex-1 fills boxes 1–3, leaves 4–5 empty', async ({ page }) => {
    const beatBoxes = page.locator('#rex-1 .arc-beat');
    await beatBoxes.nth(2).click(); // beat 3 = index 2
    await expect(beatBoxes.nth(0)).toHaveClass(/filled/);
    await expect(beatBoxes.nth(1)).toHaveClass(/filled/);
    await expect(beatBoxes.nth(2)).toHaveClass(/filled/);
    await expect(beatBoxes.nth(3)).not.toHaveClass(/filled/);
    await expect(beatBoxes.nth(4)).not.toHaveClass(/filled/);
  });

  test('beat click persists to localStorage as beats: 3', async ({ page }) => {
    const beatBoxes = page.locator('#rex-1 .arc-beat');
    await beatBoxes.nth(2).click();
    const stored = await page.evaluate(key => JSON.parse(localStorage.getItem(key) || '{}'), STORE);
    expect(stored['rex-1'].beats).toBe(3);
  });

  test('clicking filled beat 3 unfills boxes 3–5, keeps 1–2 filled', async ({ page }) => {
    const beatBoxes = page.locator('#rex-1 .arc-beat');
    await beatBoxes.nth(2).click(); // fill 1–3
    await beatBoxes.nth(2).click(); // click again — already filled, unfills from 3
    await expect(beatBoxes.nth(0)).toHaveClass(/filled/);
    await expect(beatBoxes.nth(1)).toHaveClass(/filled/);
    await expect(beatBoxes.nth(2)).not.toHaveClass(/filled/);
    await expect(beatBoxes.nth(3)).not.toHaveClass(/filled/);
    await expect(beatBoxes.nth(4)).not.toHaveClass(/filled/);
    const stored = await page.evaluate(key => JSON.parse(localStorage.getItem(key) || '{}'), STORE);
    expect(stored['rex-1'].beats).toBe(2);
  });

  test('#stat-beats updates immediately on beat click', async ({ page }) => {
    const beatBoxes = page.locator('#rex-1 .arc-beat');
    await beatBoxes.nth(2).click();
    await expect(page.locator('#stat-beats')).toHaveText('3');
  });

});

// ── Status badge cycling ──────────────────────────────────────────────────────

test.describe('Status badge cycling', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/missions/arcs.html');
    await page.waitForLoadState('networkidle');
    await clearArcsStorage(page);
  });

  test('default state: .arc-status is dormant with text DORMANT', async ({ page }) => {
    const badge = page.locator('#rex-1 .arc-status');
    await expect(badge).toHaveClass(/dormant/);
    await expect(badge).toHaveText('DORMANT');
  });

  test('one click: status becomes active', async ({ page }) => {
    const badge = page.locator('#rex-1 .arc-status');
    await badge.click();
    await expect(badge).toHaveClass(/active/);
    await expect(badge).toHaveText('ACTIVE');
  });

  test('two clicks: status becomes resolved', async ({ page }) => {
    const badge = page.locator('#rex-1 .arc-status');
    await badge.click();
    await badge.click();
    await expect(badge).toHaveClass(/resolved/);
    await expect(badge).toHaveText('RESOLVED');
  });

  test('three clicks: status cycles back to dormant', async ({ page }) => {
    const badge = page.locator('#rex-1 .arc-status');
    await badge.click();
    await badge.click();
    await badge.click();
    await expect(badge).toHaveClass(/dormant/);
    await expect(badge).toHaveText('DORMANT');
  });

  test('status click persists to localStorage', async ({ page }) => {
    const badge = page.locator('#rex-1 .arc-status');
    await badge.click(); // → active
    const stored = await page.evaluate(key => JSON.parse(localStorage.getItem(key) || '{}'), STORE);
    expect(stored['rex-1'].status).toBe('active');
  });

  test('stat counters update after status click', async ({ page }) => {
    // All 12 arcs dormant at start → stat-active should be 0
    await expect(page.locator('#stat-active')).toHaveText('0');
    await expect(page.locator('#stat-dormant')).toHaveText(String(allArcs.length));

    const badge = page.locator('#rex-1 .arc-status');
    await badge.click(); // rex-1 → active

    await expect(page.locator('#stat-active')).toHaveText('1');
    await expect(page.locator('#stat-dormant')).toHaveText(String(allArcs.length - 1));
  });

});

// ── Resolution textarea persistence ──────────────────────────────────────────

test.describe('Resolution textarea persistence', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/missions/arcs.html');
    await page.waitForLoadState('networkidle');
    await clearArcsStorage(page);
  });

  test('typing in textarea saves to localStorage', async ({ page }) => {
    const textarea = page.locator('#rex-1 .arc-res-input');
    await textarea.fill('Test resolution note.');
    const stored = await page.evaluate(key => JSON.parse(localStorage.getItem(key) || '{}'), STORE);
    expect(stored['rex-1'].note).toContain('Test resolution note.');
  });

  test('textarea value restores on page reload', async ({ page }) => {
    const textarea = page.locator('#rex-1 .arc-res-input');
    await textarea.fill('Persisted note text.');

    await page.reload();
    await page.waitForLoadState('networkidle');

    await expect(page.locator('#rex-1 .arc-res-input')).toHaveValue('Persisted note text.');
  });

});

// ── Render-before-interact guard ──────────────────────────────────────────────

test.describe('Race condition guard', () => {

  test('beat boxes are immediately clickable after networkidle', async ({ page }) => {
    await page.goto('/missions/arcs.html');
    await page.waitForLoadState('networkidle');
    await page.evaluate(key => localStorage.removeItem(key), STORE);

    // Click beat and status immediately without extra waits — both should register
    const beatBoxes = page.locator('#rex-1 .arc-beat');
    await beatBoxes.nth(0).click();
    const badge = page.locator('#rex-1 .arc-status');
    await badge.click();

    await expect(beatBoxes.nth(0)).toHaveClass(/filled/);
    await expect(badge).toHaveClass(/active/);
  });

});
