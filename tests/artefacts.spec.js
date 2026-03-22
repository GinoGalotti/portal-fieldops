// artefacts.spec.js — Tests for data-driven artefact rendering on index.html.
//
// The .artefact-list section is rendered from portal-artefacts.json by an inline
// <script> in index.html. Session-gated visibility is applied after session
// resolution. All assertions wait for networkidle.
//
// DATA-DRIVEN DESIGN: Source data loaded at module level. Expected phase counts,
// statuses, blur properties, and blur-notice text derive from the JSON.

import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const artefactsData = JSON.parse(readFileSync(resolve('./data/portal-artefacts.json'), 'utf-8'));

const totalPhases = artefactsData.artefacts.reduce((sum, a) => sum + a.phases.length, 0);
const art001 = artefactsData.artefacts.find(a => a.id === 'art-001');
const art002 = artefactsData.artefacts.find(a => a.id === 'art-002');
const art002PhaseW2 = art002.phases.find(p => p.show_until === 'w2');

function mockSession(page, sessionId) {
  return page.route('**/api/v1/session/active', route =>
    route.fulfill({ json: { session_id: sessionId } })
  );
}

// ── Render ────────────────────────────────────────────────────────────────────

test.describe('index.html — artefacts render', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
  });

  test('.artefact-list is non-empty after networkidle', async ({ page }) => {
    await expect(page.locator('.artefact-list')).not.toBeEmpty();
  });

  test('correct total artefact phase cards in DOM', async ({ page }) => {
    await expect(page.locator('.artefact-list .artefact-card')).toHaveCount(totalPhases);
  });

  test('each artefact card has .artefact-id and .artefact-name', async ({ page }) => {
    const cards = page.locator('.artefact-list .artefact-card');
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i).locator('.artefact-id')).toBeAttached();
      await expect(cards.nth(i).locator('.artefact-name')).toBeAttached();
    }
  });

});

// ── Session gating — w1 ───────────────────────────────────────────────────────

test.describe('index.html — artefacts session gating w1', () => {

  test.beforeEach(async ({ page }) => {
    await mockSession(page, 'w1');
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
  });

  test('ART-001 w1 phase is visible', async ({ page }) => {
    await expect(
      page.locator('.artefact-card[data-session-from="w1"][data-session-until="w1"]')
    ).toBeVisible();
  });

  test('ART-001 w1 phase shows PENDING RECOVERY status', async ({ page }) => {
    const card = page.locator('.artefact-card[data-session-from="w1"][data-session-until="w1"]');
    await expect(card.locator('.artefact-id')).toContainText('PENDING RECOVERY');
  });

  test('ART-001 w1 phase name is not blurred', async ({ page }) => {
    const card = page.locator('.artefact-card[data-session-from="w1"][data-session-until="w1"]');
    await expect(card.locator('.artefact-name')).not.toHaveClass(/blurred/);
  });

  test('all cards with show_from=w2 or later are hidden at w1', async ({ page }) => {
    const w2Cards = page.locator('.artefact-card[data-session-from="w2"]');
    const w3Cards = page.locator('.artefact-card[data-session-from="w3"]');
    const w2Count = await w2Cards.count();
    const w3Count = await w3Cards.count();
    for (let i = 0; i < w2Count; i++) await expect(w2Cards.nth(i)).toBeHidden();
    for (let i = 0; i < w3Count; i++) await expect(w3Cards.nth(i)).toBeHidden();
  });

});

// ── Session gating — w2 ───────────────────────────────────────────────────────

test.describe('index.html — artefacts session gating w2', () => {

  test.beforeEach(async ({ page }) => {
    await mockSession(page, 'w2');
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
  });

  test('ART-001 w1 phase is hidden at w2', async ({ page }) => {
    await expect(
      page.locator('.artefact-card[data-session-from="w1"][data-session-until="w1"]')
    ).toBeHidden();
  });

  test('ART-001 w2+ phase (NOT RECOVERED) is visible', async ({ page }) => {
    const card = page.locator('.artefact-card[data-session-from="w2"]', {
      has: page.locator('.artefact-name', { hasText: art001.phases[0].name })
    });
    await expect(card).toBeVisible();
    await expect(card.locator('.artefact-id')).toContainText('NOT RECOVERED');
  });

  test('ART-002 w2 blurred phase is visible and name has .blurred class', async ({ page }) => {
    const card = page.locator('.artefact-card[data-session-from="w2"][data-session-until="w2"]');
    await expect(card).toBeVisible();
    await expect(card.locator('.artefact-name')).toHaveClass(/blurred/);
  });

  test('ART-002 w2 blurred phase has .blur-notice with expected text', async ({ page }) => {
    const card = page.locator('.artefact-card[data-session-from="w2"][data-session-until="w2"]');
    await expect(card.locator('.blur-notice')).toBeVisible();
    await expect(card.locator('.blur-notice')).toContainText(
      art002PhaseW2.blur_notice.substring(0, 15)
    );
  });

  test('ART-??? placeholder card is visible with reduced opacity', async ({ page }) => {
    const placeholder = page.locator('.artefact-card[data-session-from="w2"]', {
      has: page.locator('.artefact-name', { hasText: '— PENDING —' })
    });
    await expect(placeholder).toBeVisible();
    const opacity = await placeholder.evaluate(el => parseFloat(el.style.opacity));
    expect(opacity).toBeLessThan(1);
  });

  test('ART-002 w3+ phase (LAB POSSESSION) is hidden at w2', async ({ page }) => {
    await expect(page.locator('.artefact-card[data-session-from="w3"]')).toBeHidden();
  });

});

// ── Session gating — w3 ───────────────────────────────────────────────────────

test.describe('index.html — artefacts session gating w3', () => {

  test.beforeEach(async ({ page }) => {
    await mockSession(page, 'w3');
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
  });

  test('ART-002 w2 blurred phase is hidden at w3 (show_until=w2 passed)', async ({ page }) => {
    await expect(
      page.locator('.artefact-card[data-session-from="w2"][data-session-until="w2"]')
    ).toBeHidden();
  });

  test('ART-002 w3+ phase (LAB POSSESSION) is visible at w3', async ({ page }) => {
    const card = page.locator('.artefact-card[data-session-from="w3"]');
    await expect(card).toBeVisible();
    await expect(card.locator('.artefact-id')).toContainText('LAB POSSESSION');
  });

  test('ART-002 w3+ phase name is not blurred', async ({ page }) => {
    const card = page.locator('.artefact-card[data-session-from="w3"]');
    await expect(card.locator('.artefact-name')).not.toHaveClass(/blurred/);
  });

});
