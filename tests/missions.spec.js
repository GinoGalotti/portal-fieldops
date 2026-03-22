// missions.spec.js — Tests for data-driven mission rendering.
//
// Covers:
//   - .sessions-grid on index.html (rendered from portal-missions.json)
//   - .missions-list on missions/missions.html (same source data)
//
// DATA-DRIVEN DESIGN: Source data loaded at module level. All assertions
// about counts, titles, statuses, anchors, and actions derive from the JSON.

import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const missionsData = JSON.parse(readFileSync(resolve('./data/portal-missions.json'), 'utf-8'));

// Total phase count: each phase = one card in DOM regardless of session gating
const totalIndexPhases = missionsData.missions.reduce((sum, m) => sum + m.phases.length, 0);

const m01 = missionsData.missions.find(m => m.id === 'mission-01');
const m01PhaseW1 = m01.phases.find(p => p.show_until === 'w1');
const m01PhaseW2 = m01.phases.find(p => p.show_from === 'w2');
const m02 = missionsData.missions.find(m => m.id === 'mission-02');

// Count [REDACT] tokens in a string → number of .redact spans rendered
function redactCount(text) {
  return (text ? text.match(/\[REDACT\]/g) || [] : []).length;
}

function mockSession(page, sessionId) {
  return page.route('**/api/v1/session/active', route =>
    route.fulfill({ json: { session_id: sessionId } })
  );
}

// ── index.html — missions grid render ────────────────────────────────────────

test.describe('index.html — missions grid render', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
  });

  test('.sessions-grid is non-empty after networkidle', async ({ page }) => {
    await expect(page.locator('.sessions-grid')).not.toBeEmpty();
  });

  test('correct total session card count matches JSON phase count', async ({ page }) => {
    await expect(page.locator('.sessions-grid .session-card')).toHaveCount(totalIndexPhases);
  });

  test('each session card has .session-num and .session-title', async ({ page }) => {
    const cards = page.locator('.sessions-grid .session-card');
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i).locator('.session-num')).toBeAttached();
      await expect(cards.nth(i).locator('.session-title')).toBeAttached();
    }
  });

});

// ── index.html — missions session gating w1 ──────────────────────────────────

test.describe('index.html — missions session gating w1', () => {

  test.beforeEach(async ({ page }) => {
    await mockSession(page, 'w1');
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
  });

  test('M01 w1 phase card is visible', async ({ page }) => {
    const card = page.locator('.sessions-grid .session-card[data-session-from="w1"][data-session-until="w1"]');
    await expect(card).toBeVisible();
  });

  test('M01 w1 phase shows ACTIVE status', async ({ page }) => {
    const card = page.locator('.sessions-grid .session-card[data-session-from="w1"][data-session-until="w1"]');
    await expect(card.locator('.session-status')).toContainText('ACTIVE');
  });

  test('M01 w1 phase has .session-redacted with .redact spans (entity type hidden)', async ({ page }) => {
    const card = page.locator('.sessions-grid .session-card[data-session-from="w1"][data-session-until="w1"]');
    const expectedRedacts = redactCount(m01PhaseW1.index_redacted);
    await expect(card.locator('.session-redacted .redact')).toHaveCount(expectedRedacts);
  });

  test('cards with show_from=w2 are all hidden at w1', async ({ page }) => {
    const w2Cards = page.locator('.sessions-grid .session-card[data-session-from="w2"]');
    const count = await w2Cards.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(w2Cards.nth(i)).toBeHidden();
    }
  });

});

// ── index.html — missions session gating w2 ──────────────────────────────────

test.describe('index.html — missions session gating w2', () => {

  test.beforeEach(async ({ page }) => {
    await mockSession(page, 'w2');
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
  });

  test('M01 w1 phase is hidden at w2 (show_until=w1 passed)', async ({ page }) => {
    const w1Card = page.locator('.sessions-grid .session-card[data-session-from="w1"][data-session-until="w1"]');
    await expect(w1Card).toBeHidden();
  });

  test('M01 w2 completed phase is visible', async ({ page }) => {
    const completedCard = page.locator('.sessions-grid .session-card[data-session-from="w2"]', {
      has: page.locator('.session-status.completed')
    });
    await expect(completedCard).toBeVisible();
  });

  test('M01 w2 phase has no .redact spans (entity revealed)', async ({ page }) => {
    const completedCard = page.locator('.sessions-grid .session-card[data-session-from="w2"]', {
      has: page.locator('.session-status.completed')
    });
    await expect(completedCard.locator('.session-redacted .redact')).toHaveCount(0);
  });

  test('M02 active phase is visible at w2', async ({ page }) => {
    const m02Card = page.locator('.sessions-grid .session-card[data-session-from="w2"]', {
      has: page.locator('.session-status.active')
    });
    await expect(m02Card).toBeVisible();
  });

  test('M03 placeholder card is a <div> (not a link) and shows UPCOMING', async ({ page }) => {
    const placeholder = page.locator('.sessions-grid div.session-card[data-session-from="w2"]');
    await expect(placeholder).toBeVisible();
    await expect(placeholder.locator('.session-status')).toContainText('UPCOMING');
  });

});

// ── missions/missions.html — archive render ───────────────────────────────────

test.describe('missions/missions.html — archive render', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/missions/missions.html');
    await page.waitForLoadState('networkidle');
  });

  test('.missions-list is non-empty after networkidle', async ({ page }) => {
    await expect(page.locator('.missions-list')).not.toBeEmpty();
  });

  test('all mission phase cards have .mission-title', async ({ page }) => {
    const cards = page.locator('.missions-list .mission-card');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(1);
    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i).locator('.mission-title')).toBeAttached();
    }
  });

});

// ── missions/missions.html — session gating w2 ───────────────────────────────

test.describe('missions/missions.html — session gating w2', () => {

  test.beforeEach(async ({ page }) => {
    await mockSession(page, 'w2');
    await page.goto('/missions/missions.html');
    await page.waitForLoadState('networkidle');
  });

  test('M01 w1 phase is hidden at w2', async ({ page }) => {
    await expect(
      page.locator('.missions-list .mission-card[data-session-from="w1"][data-session-until="w1"]')
    ).toBeHidden();
  });

  test('M01 completed card has id="mission-01" and is visible', async ({ page }) => {
    await expect(page.locator('.missions-list #mission-01')).toBeVisible();
    await expect(page.locator('.missions-list #mission-01 .mission-status')).toHaveClass(/completed/);
  });

  test('M01 completed card has .mission-outcome block', async ({ page }) => {
    await expect(page.locator('.missions-list #mission-01 .mission-outcome')).toBeVisible();
  });

  test('M01 completed card has correct number of .mission-action-link elements', async ({ page }) => {
    await expect(
      page.locator('.missions-list #mission-01 .mission-actions .mission-action-link')
    ).toHaveCount(m01PhaseW2.actions.length);
  });

  test('M02 card has id="mission-02" and shows ACTIVE status', async ({ page }) => {
    await expect(page.locator('.missions-list #mission-02')).toBeVisible();
    await expect(page.locator('.missions-list #mission-02 .mission-status')).toHaveClass(/active/);
  });

  test('M02 card has .mission-redacted with .redact spans matching JSON', async ({ page }) => {
    const m02Phase = m02.phases[0];
    const expectedRedacts = redactCount(m02Phase.archive_redacted);
    await expect(
      page.locator('.missions-list #mission-02 .mission-redacted .redact')
    ).toHaveCount(expectedRedacts);
  });

  test('M02 card has .mission-actions links matching JSON', async ({ page }) => {
    const m02Phase = m02.phases[0];
    await expect(
      page.locator('.missions-list #mission-02 .mission-actions .mission-action-link')
    ).toHaveCount(m02Phase.actions.length);
  });

  test('M03 placeholder card has .upcoming class', async ({ page }) => {
    await expect(page.locator('.missions-list .mission-card.upcoming')).toBeVisible();
  });

  test('M03 placeholder shows PENDING status text', async ({ page }) => {
    await expect(
      page.locator('.missions-list .mission-card.upcoming .mission-status')
    ).toContainText('PENDING');
  });

});
