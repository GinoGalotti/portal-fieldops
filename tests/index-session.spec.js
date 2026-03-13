// index-session.spec.js — Session gating tests for index.html
//
// Covers the missions grid (.sessions-grid) and hardcoded static elements
// (oracle-readout, lore-classified) whose visibility is controlled by
// data-session-from / data-session-until attributes + session-state.js.
//
// Artefacts and bestiary session gating are already covered by artefacts.spec.js
// and bestiary.spec.js respectively.
//
// DATA-DRIVEN: mission phase counts and show_from/show_until values are derived
// from portal-missions.json at module level so tests stay correct as content grows.

import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const missionsData = JSON.parse(readFileSync(resolve('./data/portal-missions.json'), 'utf-8'));

// Total .session-card elements expected in DOM (all phases across all missions)
const totalPhases = missionsData.missions.reduce((sum, m) => sum + m.phases.length, 0);

// Phases visible at w1: show_from <= w1 and (no show_until or show_until >= w1)
// w1 index = 0 in sessions.json, so only phases with show_from=w1 qualify
const visibleAtW1 = missionsData.missions.flatMap(m => m.phases)
  .filter(p => p.show_from === 'w1');

// Phases visible at w2: show_from in [w1,w2] and no show_until that expired before w2
const visibleAtW2 = missionsData.missions.flatMap(m => m.phases)
  .filter(p => p.show_from !== 'w3' && (p.show_until === null || p.show_until === 'w2' || p.show_from === 'w2'));

function mockSession(page, sessionId) {
  return page.route('**/api/v1/session/active', route =>
    route.fulfill({ json: { session_id: sessionId } })
  );
}

// ── Default session (w2 — live from wrangler dev) ─────────────────────────────

test.describe('index.html session gating — default (w2)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
  });

  test('.sessions-grid is non-empty', async ({ page }) => {
    await expect(page.locator('.sessions-grid')).not.toBeEmpty();
  });

  test('M01 active phase (show_from=w1, show_until=w1) is hidden at w2', async ({ page }) => {
    // This phase was the "in-progress" view; w2 has passed show_until=w1 so it hides
    const card = page.locator('.session-card[data-session-from="w1"][data-session-until="w1"]');
    await expect(card).toBeHidden();
  });

  test('M01 completed phase (show_from=w2) is visible at w2', async ({ page }) => {
    const card = page.locator('.session-card[data-session-from="w2"]', {
      has: page.locator('.session-status.completed')
    });
    await expect(card).toBeVisible();
  });

  test('M02 card (show_from=w2) is visible at w2', async ({ page }) => {
    const card = page.locator('.session-card[data-session-from="w2"]', {
      has: page.locator('.session-status.active')
    });
    await expect(card).toBeVisible();
  });

  test('oracle-readout w1-only (show_until=w1) is hidden at w2', async ({ page }) => {
    const el = page.locator('.oracle-readout[data-session-from="w1"][data-session-until="w1"]');
    await expect(el).toBeHidden();
  });

  test('oracle-readout w2+ (show_from=w2) is visible at w2', async ({ page }) => {
    const el = page.locator('.oracle-readout[data-session-from="w2"]');
    await expect(el).toBeVisible();
  });

  test('lore-classified (show_from=w2) is visible at w2', async ({ page }) => {
    const el = page.locator('.lore-classified[data-session-from="w2"]');
    await expect(el).toBeVisible();
  });

});

// ── Session gating — w1 ───────────────────────────────────────────────────────

test.describe('index.html session gating — w1', () => {

  test.beforeEach(async ({ page }) => {
    await mockSession(page, 'w1');
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
  });

  test('M01 active phase (show_from=w1, show_until=w1) is visible at w1', async ({ page }) => {
    const card = page.locator('.session-card[data-session-from="w1"][data-session-until="w1"]');
    await expect(card).toBeVisible();
  });

  test('M01 completed phase (show_from=w2) is hidden at w1', async ({ page }) => {
    const card = page.locator('.session-card[data-session-from="w2"]', {
      has: page.locator('.session-status.completed')
    });
    await expect(card).toBeHidden();
  });

  test('M02 card (show_from=w2) is hidden at w1', async ({ page }) => {
    const card = page.locator('.session-card[data-session-from="w2"]', {
      has: page.locator('.session-status.active')
    });
    await expect(card).toBeHidden();
  });

  test('oracle-readout w1-only is visible at w1', async ({ page }) => {
    const el = page.locator('.oracle-readout[data-session-from="w1"][data-session-until="w1"]');
    await expect(el).toBeVisible();
  });

  test('oracle-readout w2+ (show_from=w2) is hidden at w1', async ({ page }) => {
    const el = page.locator('.oracle-readout[data-session-from="w2"]');
    await expect(el).toBeHidden();
  });

  test('lore-classified (show_from=w2) is hidden at w1', async ({ page }) => {
    const el = page.locator('.lore-classified[data-session-from="w2"]');
    await expect(el).toBeHidden();
  });

});

// ── Data integrity ────────────────────────────────────────────────────────────

test.describe('index.html missions — data integrity', () => {

  test('total .session-card count in DOM matches JSON phases', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.sessions-grid .session-card')).toHaveCount(totalPhases);
  });

  test('only 1 mission card visible at w1', async ({ page }) => {
    await mockSession(page, 'w1');
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    const cards = page.locator('.sessions-grid .session-card');
    const count = await cards.count();
    let visibleCount = 0;
    for (let i = 0; i < count; i++) {
      if (await cards.nth(i).isVisible()) visibleCount++;
    }
    expect(visibleCount).toBe(visibleAtW1.length);
  });

  test('3 mission cards visible at w2', async ({ page }) => {
    await mockSession(page, 'w2');
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    const cards = page.locator('.sessions-grid .session-card');
    const count = await cards.count();
    let visibleCount = 0;
    for (let i = 0; i < count; i++) {
      if (await cards.nth(i).isVisible()) visibleCount++;
    }
    // w2 shows: M01-completed + M02-active + M03-placeholder
    expect(visibleCount).toBe(totalPhases - visibleAtW1.length);
  });

});
