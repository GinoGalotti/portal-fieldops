// bestiary.spec.js — Tests for the data-driven bestiary on index.html.
//
// The bestiary section is rendered from portal-entities.json by an inline
// <script> in index.html. Session-gated visibility is applied by session-state.js
// after fetching /api/v1/session/active. All assertions wait for networkidle
// since rendering requires two async fetches (entities JSON + session API).
//
// DATA-DRIVEN DESIGN: Source data is loaded at module level. Expected entity
// names, phase counts, and blur properties are derived from the JSON — never
// hardcoded — so the tests remain correct as new entities or phases are added.

import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const entitiesData = JSON.parse(readFileSync(resolve('./data/portal-entities.json'), 'utf-8'));
const eszter = entitiesData.entities.find(e => e.id === 'eszter');
const cartographer = entitiesData.entities.find(e => e.id === 'the-cartographer');

// Phase helpers — easier references in test bodies
const eszterPhaseW1 = eszter.bestiary.phases.find(p => p.show_until === 'w1');
const eszterPhaseW2 = eszter.bestiary.phases.find(p => p.show_from === 'w2');
const cartographerPhaseW2 = cartographer.bestiary.phases.find(p => p.show_until === 'w2');
const cartographerPhaseW3 = cartographer.bestiary.phases.find(p => p.show_from === 'w3');

// Total beast-card elements that should be in DOM (all phases of show:true entities)
const expectedTotalCards = entitiesData.entities
  .filter(e => e.bestiary && e.bestiary.show)
  .reduce((sum, e) => sum + e.bestiary.phases.length, 0);

// Mock active session to a specific week
function mockSession(page, sessionId) {
  return page.route('**/api/v1/session/active', route =>
    route.fulfill({ json: { session_id: sessionId } })
  );
}

// ── Default session (w2 — live from wrangler dev server) ────────────────────

test.describe('Bestiary render — default session (w2)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
  });

  test('#bestiary-grid exists and is non-empty', async ({ page }) => {
    const grid = page.locator('#bestiary-grid');
    await expect(grid).toBeVisible();
    await expect(grid).not.toBeEmpty();
  });

  test('grid contains at least one .beast-card', async ({ page }) => {
    const cards = page.locator('#bestiary-grid .beast-card');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('Eszter w2 phase card is visible', async ({ page }) => {
    // At w2: eszter phase[0] (show_until=w1) is hidden; phase[1] (show_from=w2) is visible.
    // The w2 phase has no blur_all and no classified_blurred — full profile visible.
    // data-session-from is on the .beast-card itself, so use CSS attribute selector directly.
    const eszterCard = page.locator('.beast-card[data-session-from="w2"]', {
      has: page.locator('.beast-name', { hasText: 'Eszter' })
    });
    await expect(eszterCard).toBeVisible();
  });

  test('Cartographer w2 phase card is visible with blur_all', async ({ page }) => {
    // At w2: cartographer phase[0] (show_from=w2, show_until=w2, blur_all=true) is visible.
    const cartographerCard = page.locator('.beast-card[data-session-from="w2"][data-session-until="w2"]');
    await expect(cartographerCard).toBeVisible();
    // blur_all:true means .beast-name gets .blurred
    await expect(cartographerCard.locator('.beast-name')).toHaveClass(/blurred/);
  });

  test('Cartographer w2 phase has .blur-notice with expected text', async ({ page }) => {
    const cartographerCard = page.locator('.beast-card[data-session-from="w2"][data-session-until="w2"]');
    const blurNotice = cartographerCard.locator('.blur-notice');
    await expect(blurNotice).toBeVisible();
    // Data-driven: derive expected text from JSON
    await expect(blurNotice).toContainText(cartographerPhaseW2.blur_notice.substring(0, 20));
  });

});

// ── Session gating — w1 mock ─────────────────────────────────────────────────

test.describe('Bestiary session gating — w1', () => {

  test.beforeEach(async ({ page }) => {
    await mockSession(page, 'w1');
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
  });

  test('Eszter w1 phase card is visible', async ({ page }) => {
    // At w1: eszter phase[0] (show_from=w1, show_until=w1) is visible.
    const eszterW1Card = page.locator('.beast-card[data-session-from="w1"][data-session-until="w1"]');
    await expect(eszterW1Card).toBeVisible();
  });

  test('Eszter w1 phase has .beast-classified.blurred (classified_blurred: true)', async ({ page }) => {
    const eszterW1Card = page.locator('.beast-card[data-session-from="w1"][data-session-until="w1"]');
    await expect(eszterW1Card.locator('.beast-classified')).toHaveClass(/blurred/);
  });

  test('Eszter w1 phase has .blur-notice visible', async ({ page }) => {
    const eszterW1Card = page.locator('.beast-card[data-session-from="w1"][data-session-until="w1"]');
    const blurNotice = eszterW1Card.locator('.blur-notice');
    await expect(blurNotice).toBeVisible();
    // Data-driven: derive from JSON
    await expect(blurNotice).toContainText(eszterPhaseW1.blur_notice.substring(0, 20));
  });

  test('Cartographer cards are NOT visible at w1 (show_from w2/w3 > w1)', async ({ page }) => {
    // Both cartographer phases have show_from > w1 so both should be hidden.
    const cartographerCards = page.locator('.beast-card', {
      has: page.locator('.beast-name', { hasText: 'The Cartographer' })
    });
    const count = await cartographerCards.count();
    // There may be 2 cards in DOM (both phases), but all should be hidden
    for (let i = 0; i < count; i++) {
      await expect(cartographerCards.nth(i)).toBeHidden();
    }
  });

});

// ── Session gating — w3 mock ─────────────────────────────────────────────────

test.describe('Bestiary session gating — w3', () => {

  test.beforeEach(async ({ page }) => {
    await mockSession(page, 'w3');
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
  });

  test('Cartographer w3 phase card is visible with no blur on .beast-name', async ({ page }) => {
    // At w3: cartographer phase[1] (show_from=w3, no blur_all) is visible.
    const cartographerW3Card = page.locator('.beast-card[data-session-from="w3"]', {
      has: page.locator('.beast-name', { hasText: 'The Cartographer' })
    });
    await expect(cartographerW3Card).toBeVisible();
    await expect(cartographerW3Card.locator('.beast-name')).not.toHaveClass(/blurred/);
  });

  test('Cartographer w2 phase is hidden at w3 (show_until=w2 < w3)', async ({ page }) => {
    const cartographerW2Card = page.locator('.beast-card[data-session-from="w2"][data-session-until="w2"]');
    await expect(cartographerW2Card).toBeHidden();
  });

  test('Eszter w1 phase is hidden at w3 (show_until=w1 < w3)', async ({ page }) => {
    const eszterW1Card = page.locator('.beast-card[data-session-from="w1"][data-session-until="w1"]');
    await expect(eszterW1Card).toBeHidden();
  });

  test('Eszter w2 phase is visible at w3', async ({ page }) => {
    // eszter phase[1] has show_from=w2, no show_until — visible at w3
    const eszterW2Card = page.locator('.beast-card[data-session-from="w2"]', {
      has: page.locator('.beast-name', { hasText: 'Eszter' })
    });
    await expect(eszterW2Card).toBeVisible();
  });

});

// ── Data integrity ────────────────────────────────────────────────────────────

test.describe('Bestiary data integrity', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
  });

  test('total .beast-card count in DOM matches phases of show:true entities', async ({ page }) => {
    // Only entities with bestiary.show === true generate cards.
    // Each phase creates one .beast-card. Count should match JSON exactly.
    const cards = page.locator('#bestiary-grid .beast-card');
    await expect(cards).toHaveCount(expectedTotalCards);
  });

  test('entities without bestiary.show produce no .beast-card with their name', async ({ page }) => {
    // Entities with show: null/false/undefined should not appear in the grid.
    const hiddenEntities = entitiesData.entities.filter(e => !e.bestiary || !e.bestiary.show);
    for (const entity of hiddenEntities) {
      const card = page.locator('#bestiary-grid .beast-card', {
        has: page.locator('.beast-name', { hasText: entity.name })
      });
      await expect(card).toHaveCount(0);
    }
  });

  test('Eszter w2 phase card has correct data-session-from attribute', async ({ page }) => {
    // data-session-from on the beast-card should match the phase's show_from value.
    const eszterW2Card = page.locator('.beast-card[data-session-from="w2"]', {
      has: page.locator('.beast-name', { hasText: 'Eszter' })
    });
    await expect(eszterW2Card).toHaveAttribute('data-session-from', eszterPhaseW2.show_from);
  });

});
