// campbell-logs.spec.js — Tests for campbell-logs.html.
//
// ARCHITECTURE NOTES (read before editing):
// - Page fetches data/campbell-logs.json and /api/v1/campbell-logs/hints on load.
// - Batches are session-gated: each batch has a `session` field; only batches
//   whose session <= active session are rendered. Data order: newest first (w4,w3,w2).
// - Newest visible batch is expanded (.batch-section without .collapsed).
//   Older batches are collapsed (.batch-section.collapsed).
// - Layer 1 (highlights): always rendered — .highlight-teddy/.highlight-priya/.highlight-john spans.
// - Layer 2 (anomaly flags): .log-entry.anomaly — always visible.
// - Layer 3 (clue spans): .clue-hint — hidden until keeper reveals via REVEAL CLUES.
// - Keeper mode: 5× click on #page-eyebrow → #keeper-toolbar becomes visible.
// - Search: typing in #log-search adds .search-match (matching) / .search-dim (non-matching).
// - DATA-DRIVEN: source data loaded at module level so tests stay correct as batches are added.

import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const logsData    = JSON.parse(readFileSync(resolve('./data/campbell-logs.json'), 'utf-8'));
const sessionsData = JSON.parse(readFileSync(resolve('./data/sessions.json'), 'utf-8'));

const allBatches   = logsData.batches; // ordered newest-first in JSON
const sessionIds   = sessionsData.map(s => s.id);

// Batches visible at a given session (session reached or passed)
function batchesVisibleAt(sessionId) {
  const idx = sessionIds.indexOf(sessionId);
  return allBatches.filter(b => {
    const bIdx = sessionIds.indexOf(b.session);
    return bIdx !== -1 && bIdx <= idx;
  });
}

function mockSession(page, sessionId) {
  return page.route('**/api/v1/session/active', route =>
    route.fulfill({ json: { session_id: sessionId } })
  );
}

function mockHints(page, value = 'hidden') {
  return page.route('**/api/v1/campbell-logs/hints', route =>
    route.fulfill({ json: { value } })
  );
}

// ── PAGE STRUCTURE ─────────────────────────────────────────────────────────────

test.describe('CAMPBELL logs — page structure', () => {

  test.beforeEach(async ({ page }) => {
    await mockSession(page, 'w3');
    await mockHints(page, 'hidden');
    await page.goto('/campbell-logs.html');
    await page.waitForLoadState('networkidle');
  });

  test('page title contains CAMPBELL Logs', async ({ page }) => {
    await expect(page).toHaveTitle(/CAMPBELL/i);
  });

  test('page eyebrow #page-eyebrow is visible', async ({ page }) => {
    await expect(page.locator('#page-eyebrow')).toBeVisible();
    await expect(page.locator('#page-eyebrow')).toContainText('CAMPBELL ACTIVITY LOGS');
  });

  test('search bar #log-search is visible', async ({ page }) => {
    await expect(page.locator('#log-search')).toBeVisible();
  });

  test('#batches-container is present', async ({ page }) => {
    await expect(page.locator('#batches-container')).toBeAttached();
  });

  test('nav "Logs" link is present', async ({ page }) => {
    const logsLink = page.locator('#player-nav a').filter({ hasText: 'Logs' });
    await expect(logsLink).toBeVisible();
  });

});

// ── SESSION GATING ─────────────────────────────────────────────────────────────

test.describe('CAMPBELL logs — session gating (w2)', () => {

  test.beforeEach(async ({ page }) => {
    await mockSession(page, 'w2');
    await mockHints(page, 'hidden');
    await page.goto('/campbell-logs.html');
    await page.waitForLoadState('networkidle');
  });

  test('at w2 only batches with session <= w2 are rendered', async ({ page }) => {
    const visible = batchesVisibleAt('w2');
    await expect(page.locator('.batch-section')).toHaveCount(visible.length);
  });

  test('at w2 the w2 batch is rendered', async ({ page }) => {
    await expect(page.locator('#batch-logs-w2')).toBeAttached();
  });

  test('at w2 the w3 batch is NOT rendered', async ({ page }) => {
    await expect(page.locator('#batch-logs-w3')).not.toBeAttached();
  });

});

test.describe('CAMPBELL logs — session gating (w3)', () => {

  test.beforeEach(async ({ page }) => {
    await mockSession(page, 'w3');
    await mockHints(page, 'hidden');
    await page.goto('/campbell-logs.html');
    await page.waitForLoadState('networkidle');
  });

  test('at w3 both w2 and w3 batches are rendered', async ({ page }) => {
    const visible = batchesVisibleAt('w3');
    await expect(page.locator('.batch-section')).toHaveCount(visible.length);
  });

  test('at w3 the newest visible batch is expanded (no .collapsed)', async ({ page }) => {
    // newest batch = first rendered = first .batch-section
    const newest = page.locator('.batch-section').first();
    await expect(newest).not.toHaveClass(/\bcollapsed\b/);
  });

  test('at w3 older batches are collapsed', async ({ page }) => {
    const sections = page.locator('.batch-section');
    const count = await sections.count();
    // all except the first should be collapsed
    for (let i = 1; i < count; i++) {
      await expect(sections.nth(i)).toHaveClass(/\bcollapsed\b/);
    }
  });

});

// ── BATCH COLLAPSE / EXPAND ────────────────────────────────────────────────────

test.describe('CAMPBELL logs — collapse/expand', () => {

  test.beforeEach(async ({ page }) => {
    await mockSession(page, 'w3');
    await mockHints(page, 'hidden');
    await page.goto('/campbell-logs.html');
    await page.waitForLoadState('networkidle');
  });

  test('clicking a collapsed batch header expands it (removes .collapsed)', async ({ page }) => {
    const second = page.locator('.batch-section').nth(1);
    await expect(second).toHaveClass(/\bcollapsed\b/);
    await second.locator('.batch-header').click();
    await expect(second).not.toHaveClass(/\bcollapsed\b/);
  });

  test('clicking an expanded batch header collapses it (adds .collapsed)', async ({ page }) => {
    const first = page.locator('.batch-section').first();
    await expect(first).not.toHaveClass(/\bcollapsed\b/);
    await first.locator('.batch-header').click();
    await expect(first).toHaveClass(/\bcollapsed\b/);
  });

  test('batch toggle icon changes between ▶ and ▼', async ({ page }) => {
    const second = page.locator('.batch-section').nth(1);
    const toggle = second.locator('.batch-toggle');
    await expect(toggle).toHaveText('▶');
    await second.locator('.batch-header').click();
    await expect(toggle).toHaveText('▼');
  });

  test('batch body has max-height 0px when collapsed', async ({ page }) => {
    const second = page.locator('.batch-section').nth(1);
    await expect(second).toHaveClass(/\bcollapsed\b/);
    // max-height:0 + overflow:hidden collapses the body — verify via CSS property
    await expect(second.locator('.batch-body')).toHaveCSS('max-height', '0px');
  });

  test('batch body is visible when expanded', async ({ page }) => {
    const first = page.locator('.batch-section').first();
    await expect(first.locator('.entries-list')).toBeVisible();
  });

});

// ── LAYER 1: HIGHLIGHTS ────────────────────────────────────────────────────────

test.describe('CAMPBELL logs — Layer 1 highlights', () => {

  // Use w2 — the w2 batch has Teddy, Priya, and John highlights
  const w2Batch = allBatches.find(b => b.id === 'logs-w2');

  test.beforeEach(async ({ page }) => {
    await mockSession(page, 'w2');
    await mockHints(page, 'hidden');
    await page.goto('/campbell-logs.html');
    await page.waitForLoadState('networkidle');
  });

  test('highlight-teddy spans render in the w2 batch', async ({ page }) => {
    const teddyHighlights = w2Batch.highlights.filter(h => h.by === 'teddy');
    // At least one teddy highlight exists in data
    expect(teddyHighlights.length).toBeGreaterThan(0);
    const spans = page.locator('#batch-logs-w2 .highlight-teddy');
    await expect(spans.first()).toBeVisible();
  });

  test('each teddy highlight term appears as a .highlight-teddy span', async ({ page }) => {
    const teddyHighlights = w2Batch.highlights.filter(h => h.by === 'teddy');
    for (const hl of teddyHighlights) {
      const span = page.locator('#batch-logs-w2 .highlight-teddy').filter({ hasText: hl.term });
      await expect(span).toBeAttached();
    }
  });

  test('teddy highlight with a note renders an .hl-note-teddy annotation', async ({ page }) => {
    const withNote = w2Batch.highlights.find(h => h.by === 'teddy' && h.note);
    if (!withNote) { test.skip(); return; }
    await expect(page.locator('#batch-logs-w2 .hl-note-teddy').first()).toBeVisible();
  });

  test('priya highlight renders as .highlight-priya with no annotation (silent)', async ({ page }) => {
    const priyaHl = w2Batch.highlights.find(h => h.by === 'priya');
    if (!priyaHl) { test.skip(); return; }
    const span = page.locator('#batch-logs-w2 .highlight-priya').filter({ hasText: priyaHl.term });
    await expect(span).toBeAttached();
    // Priya's notes are null — no .hl-note-priya should exist for her
    if (priyaHl.note === null) {
      await expect(page.locator('#batch-logs-w2 .hl-note-priya')).not.toBeAttached();
    }
  });

});

// ── LAYER 2: ANOMALY FLAGS ─────────────────────────────────────────────────────

test.describe('CAMPBELL logs — Layer 2 anomaly flags', () => {

  const w2Batch = allBatches.find(b => b.id === 'logs-w2');
  const anomalyCount = w2Batch.entries.filter(e => e.flags.includes('anomaly')).length;

  test.beforeEach(async ({ page }) => {
    await mockSession(page, 'w2');
    await mockHints(page, 'hidden');
    await page.goto('/campbell-logs.html');
    await page.waitForLoadState('networkidle');
  });

  test('w2 batch renders the correct number of .log-entry.anomaly elements', async ({ page }) => {
    await expect(page.locator('#batch-logs-w2 .log-entry.anomaly')).toHaveCount(anomalyCount);
  });

  test('non-anomaly entries do not have .anomaly class', async ({ page }) => {
    const nonAnomalyCount = w2Batch.entries.filter(e => !e.flags.includes('anomaly')).length;
    const allEntries = page.locator('#batch-logs-w2 .log-entry');
    const anomalies  = page.locator('#batch-logs-w2 .log-entry.anomaly');
    await expect(allEntries).toHaveCount(w2Batch.entries.length);
    await expect(anomalies).toHaveCount(anomalyCount);
    // cross-check
    expect(w2Batch.entries.length - anomalyCount).toBe(nonAnomalyCount);
  });

});

// ── LAYER 3: CLUE SPANS ────────────────────────────────────────────────────────

test.describe('CAMPBELL logs — Layer 3 clue spans (hidden by default)', () => {

  test.beforeEach(async ({ page }) => {
    await mockSession(page, 'w3');
    await mockHints(page, 'hidden');
    await page.goto('/campbell-logs.html');
    await page.waitForLoadState('networkidle');
  });

  test('.clue-hint elements are not present when hints are hidden', async ({ page }) => {
    await expect(page.locator('.clue-hint')).not.toBeAttached();
  });

});

// ── KEEPER MODE ────────────────────────────────────────────────────────────────

test.describe('CAMPBELL logs — keeper mode', () => {

  test.beforeEach(async ({ page }) => {
    await mockSession(page, 'w3');
    await mockHints(page, 'hidden');
    await page.goto('/campbell-logs.html');
    await page.waitForLoadState('networkidle');
  });

  test('#keeper-toolbar is hidden before activation', async ({ page }) => {
    await expect(page.locator('#keeper-toolbar')).not.toBeVisible();
  });

  test('5× click on #page-eyebrow shows #keeper-toolbar', async ({ page }) => {
    const eyebrow = page.locator('#page-eyebrow');
    for (let i = 0; i < 5; i++) await eyebrow.click();
    await expect(page.locator('#keeper-toolbar')).toBeVisible();
  });

  test('#toggle-hints button is present in the toolbar', async ({ page }) => {
    const eyebrow = page.locator('#page-eyebrow');
    for (let i = 0; i < 5; i++) await eyebrow.click();
    await expect(page.locator('#toggle-hints')).toBeVisible();
    await expect(page.locator('#toggle-hints')).toContainText('REVEAL CLUES');
  });

  test('REVEAL CLUES renders .clue-hint spans in visible batches', async ({ page }) => {
    // Activate keeper mode
    const eyebrow = page.locator('#page-eyebrow');
    for (let i = 0; i < 5; i++) await eyebrow.click();

    // Mock the PUT so it doesn't actually write to D1
    await page.route('**/api/v1/campbell-logs/hints', route => {
      if (route.request().method() === 'PUT') route.fulfill({ json: { ok: true } });
      else route.continue();
    });

    await page.locator('#toggle-hints').click();

    // At w3, both w2 and w3 batches are visible — clue spans should now exist
    const visibleBatches = batchesVisibleAt('w3');
    const totalClueSpans = visibleBatches.reduce((sum, b) => sum + b.clue_spans.length, 0);
    await expect(page.locator('.clue-hint')).toHaveCount(totalClueSpans);
  });

  test('REVEAL CLUES button text toggles to HIDE CLUES after click', async ({ page }) => {
    const eyebrow = page.locator('#page-eyebrow');
    for (let i = 0; i < 5; i++) await eyebrow.click();
    await page.route('**/api/v1/campbell-logs/hints', route =>
      route.fulfill({ json: { ok: true } })
    );
    await page.locator('#toggle-hints').click();
    await expect(page.locator('#toggle-hints')).toContainText('HIDE CLUES');
  });

  test('keeper note text on clue spans is visible after REVEAL CLUES (keeper mode)', async ({ page }) => {
    const eyebrow = page.locator('#page-eyebrow');
    for (let i = 0; i < 5; i++) await eyebrow.click();
    await page.route('**/api/v1/campbell-logs/hints', route =>
      route.fulfill({ json: { ok: true } })
    );
    await page.locator('#toggle-hints').click();
    await expect(page.locator('.clue-keeper-note').first()).toBeVisible();
  });

});

// ── SEARCH ─────────────────────────────────────────────────────────────────────

test.describe('CAMPBELL logs — search', () => {

  // Use a term we know exists in w2 data
  const w2Batch       = allBatches.find(b => b.id === 'logs-w2');
  const anomalyEntry  = w2Batch.entries.find(e => e.flags.includes('anomaly'));
  const searchTerm    = anomalyEntry.content.slice(0, 12).toLowerCase(); // first 12 chars

  test.beforeEach(async ({ page }) => {
    await mockSession(page, 'w2');
    await mockHints(page, 'hidden');
    await page.goto('/campbell-logs.html');
    await page.waitForLoadState('networkidle');
  });

  test('typing a matching term adds .search-match to matching entries', async ({ page }) => {
    await page.locator('#log-search').fill(searchTerm);
    await expect(page.locator('.log-entry.search-match').first()).toBeAttached();
  });

  test('non-matching entries get .search-dim class', async ({ page }) => {
    await page.locator('#log-search').fill(searchTerm);
    await expect(page.locator('.log-entry.search-dim').first()).toBeAttached();
  });

  test('clear button appears when search is active', async ({ page }) => {
    await expect(page.locator('#search-clear')).not.toBeVisible();
    await page.locator('#log-search').fill(searchTerm);
    await expect(page.locator('#search-clear')).toBeVisible();
  });

  test('clicking clear button removes search state', async ({ page }) => {
    await page.locator('#log-search').fill(searchTerm);
    await page.locator('#search-clear').click();
    await expect(page.locator('#log-search')).toHaveValue('');
    await expect(page.locator('.log-entry.search-match')).not.toBeAttached();
    await expect(page.locator('.log-entry.search-dim')).not.toBeAttached();
    await expect(page.locator('#search-clear')).not.toBeVisible();
  });

});

// ── CLUE PERSISTENCE ───────────────────────────────────────────────────────────
//
// When D1 stores value='revealed', the page loads with hintsRevealed=true and
// renders .clue-hint spans immediately — no keeper toolbar interaction required.

test.describe('CAMPBELL logs — clue persistence (pre-revealed from D1)', () => {

  test('clue-hint spans render on load when D1 says revealed', async ({ page }) => {
    await mockSession(page, 'w3');
    await mockHints(page, 'revealed');
    await page.goto('/campbell-logs.html');
    await page.waitForLoadState('networkidle');
    // Clues must appear without any keeper toolbar click
    const visibleBatches = batchesVisibleAt('w3');
    const totalClueSpans = visibleBatches.reduce((sum, b) => sum + b.clue_spans.length, 0);
    expect(totalClueSpans).toBeGreaterThan(0);
    await expect(page.locator('.clue-hint')).toHaveCount(totalClueSpans);
  });

  test('toggle button reads HIDE CLUES when activated in revealed state', async ({ page }) => {
    await mockSession(page, 'w3');
    await mockHints(page, 'revealed');
    await page.goto('/campbell-logs.html');
    await page.waitForLoadState('networkidle');
    // Activate keeper toolbar to inspect button state
    const eyebrow = page.locator('#page-eyebrow');
    for (let i = 0; i < 5; i++) await eyebrow.click();
    await expect(page.locator('#toggle-hints')).toContainText('HIDE CLUES');
  });

});

test.describe('CAMPBELL logs — search expands batches', () => {

  test('typing a search term expands all collapsed batches', async ({ page }) => {
    await mockSession(page, 'w3');
    await mockHints(page, 'hidden');
    await page.goto('/campbell-logs.html');
    await page.waitForLoadState('networkidle');

    // Confirm second batch starts collapsed
    const second = page.locator('.batch-section').nth(1);
    await expect(second).toHaveClass(/\bcollapsed\b/);

    // Search for a term present in both batches
    await page.locator('#log-search').fill('system');

    // All batches should now be expanded
    const sections = page.locator('.batch-section');
    const count = await sections.count();
    for (let i = 0; i < count; i++) {
      await expect(sections.nth(i)).not.toHaveClass(/\bcollapsed\b/);
    }
  });

  test('clearing search restores original collapsed state', async ({ page }) => {
    await mockSession(page, 'w3');
    await mockHints(page, 'hidden');
    await page.goto('/campbell-logs.html');
    await page.waitForLoadState('networkidle');

    await page.locator('#log-search').fill('system');
    await page.locator('#search-clear').click();

    // Second batch should be collapsed again
    await expect(page.locator('.batch-section').nth(1)).toHaveClass(/\bcollapsed\b/);
  });

});
