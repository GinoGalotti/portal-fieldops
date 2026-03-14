// threads.spec.js — Tests for missions/threads.html (Campaign Thread & Clock Tracker)
//
// ARCHITECTURE NOTES:
// - threads.html fetches /data/portal-threads.json and /data/portal-clocks.json
//   via Promise.all on load. Both are mocked here with minimal fixture data so
//   tests remain stable regardless of real campaign data changes.
// - Clocks: each clock renders pip circles (.clock-pip); filled pips have .filled,
//   the next unfilled pip has .current. When filled === segments the clock has fired
//   and .clock-current-label shows "CLOCK FIRED".
// - Threads: grouped by category (faction → mystery → personal → case) in that order.
//   Each thread card gets class status-{active|dormant|resolved}.
// - Stats row: #stat-active (threads with status=active), #stat-dormant, #stat-resolved,
//   #stat-clocks (clocks where status=active AND filled < segments).

import { test, expect } from '@playwright/test';

// ── FIXTURE DATA ──────────────────────────────────────────────────────────────

const MOCK_THREADS = {
  threads: [
    {
      id: 'faction-a',
      name: 'Faction Thread',
      category: 'faction',
      status: 'active',
      last_moved: 'w2',
      summary: 'Faction summary text.',
      notes: 'Faction keeper notes.',
    },
    {
      id: 'mystery-a',
      name: 'Mystery Thread',
      category: 'mystery',
      status: 'dormant',
      last_moved: 'w1',
      summary: 'Mystery summary text.',
      notes: null,
    },
    {
      id: 'personal-a',
      name: 'Personal Thread',
      category: 'personal',
      status: 'resolved',
      last_moved: 'w2',
      summary: 'Personal summary text.',
      notes: 'Personal keeper notes.',
    },
    {
      id: 'case-a',
      name: 'Case Thread',
      category: 'case',
      status: 'active',
      last_moved: 'w1',
      summary: 'Case summary text.',
      notes: null,
    },
  ],
};

const MOCK_CLOCKS = {
  clocks: [
    {
      id: 'clock-a',
      label: 'Clock Alpha',
      description: 'Alpha clock description.',
      segments: 4,
      filled: 1,
      status: 'active',
      segment_labels: ['Seg 1', 'Seg 2', 'Seg 3', 'Seg 4'],
      advancement_note: 'Advance when the hunters do nothing.',
      notes: 'Clock Alpha keeper notes.',
    },
    {
      id: 'clock-b',
      label: 'Clock Beta',
      description: 'Beta clock description.',
      segments: 4,
      filled: 4,
      status: 'active',
      segment_labels: ['B1', 'B2', 'B3', 'B4'],
      advancement_note: 'Advance when Y.',
      notes: null,
    },
  ],
};

// ── SETUP ─────────────────────────────────────────────────────────────────────

test.describe('Threads page', () => {

  test.beforeEach(async ({ page }) => {
    await page.route('**/portal-threads.json', route =>
      route.fulfill({ contentType: 'application/json', body: JSON.stringify(MOCK_THREADS) })
    );
    await page.route('**/portal-clocks.json', route =>
      route.fulfill({ contentType: 'application/json', body: JSON.stringify(MOCK_CLOCKS) })
    );
    await page.goto('/missions/threads.html');
    await page.waitForLoadState('networkidle');
  });

  // ── STRUCTURE ──────────────────────────────────────────────────────────────

  test('page title contains "Threads"', async ({ page }) => {
    await expect(page).toHaveTitle(/Threads/i);
  });

  test('keeper-nav is injected with links', async ({ page }) => {
    const nav = page.locator('#keeper-nav');
    await expect(nav).toBeVisible();
    await expect(nav.locator('a').first()).toBeVisible();
  });

  test('hero title is visible', async ({ page }) => {
    await expect(page.locator('.hero-title')).toBeVisible();
  });

  // ── STATS ROW ─────────────────────────────────────────────────────────────

  test('#stat-active shows count of active threads', async ({ page }) => {
    // faction-a + case-a = 2 active
    await expect(page.locator('#stat-active')).toHaveText('2');
  });

  test('#stat-dormant shows count of dormant threads', async ({ page }) => {
    // mystery-a = 1 dormant
    await expect(page.locator('#stat-dormant')).toHaveText('1');
  });

  test('#stat-resolved shows count of resolved threads', async ({ page }) => {
    // personal-a = 1 resolved
    await expect(page.locator('#stat-resolved')).toHaveText('1');
  });

  test('#stat-clocks counts only active clocks with ticks remaining', async ({ page }) => {
    // clock-a: filled=1 < segments=4 → counts
    // clock-b: filled=4 === segments=4 → fired, does not count
    await expect(page.locator('#stat-clocks')).toHaveText('1');
  });

  // ── CLOCKS SECTION ────────────────────────────────────────────────────────

  test('renders a clock card for each clock', async ({ page }) => {
    await expect(page.locator('.clock-card')).toHaveCount(2);
  });

  test('clock label is visible', async ({ page }) => {
    await expect(page.locator('.clock-label').first()).toContainText('Clock Alpha');
  });

  test('filled pips have .filled class', async ({ page }) => {
    // clock-a has 1 filled pip
    const clockA = page.locator('.clock-card').first();
    await expect(clockA.locator('.clock-pip.filled')).toHaveCount(1);
  });

  test('next unfilled pip has .current class', async ({ page }) => {
    // clock-a: pip index 1 is next (0-indexed) → .current
    const clockA = page.locator('.clock-card').first();
    await expect(clockA.locator('.clock-pip.current')).toHaveCount(1);
  });

  test('fired clock (filled === segments) shows CLOCK FIRED label', async ({ page }) => {
    // clock-b: filled=4, segments=4 → fired
    const clockB = page.locator('.clock-card').nth(1);
    await expect(clockB.locator('.clock-current-label')).toContainText('CLOCK FIRED');
  });

  test('active clock shows current segment label not CLOCK FIRED', async ({ page }) => {
    const clockA = page.locator('.clock-card').first();
    await expect(clockA.locator('.clock-current-label')).not.toContainText('CLOCK FIRED');
  });

  test('advancement note is visible', async ({ page }) => {
    await expect(page.locator('.clock-advancement').first()).toContainText('Advance when the hunters do nothing.');
  });

  // ── THREADS SECTION ───────────────────────────────────────────────────────

  test('renders a thread card for each thread', async ({ page }) => {
    await expect(page.locator('.thread-card')).toHaveCount(4);
  });

  test('active thread cards have status-active class', async ({ page }) => {
    await expect(page.locator('.thread-card.status-active')).toHaveCount(2);
  });

  test('dormant thread card has status-dormant class', async ({ page }) => {
    await expect(page.locator('.thread-card.status-dormant')).toHaveCount(1);
  });

  test('resolved thread card has status-resolved class', async ({ page }) => {
    await expect(page.locator('.thread-card.status-resolved')).toHaveCount(1);
  });

  test('status badge text matches thread status', async ({ page }) => {
    await expect(page.locator('.status-badge.active').first()).toContainText('ACTIVE');
    await expect(page.locator('.status-badge.dormant').first()).toContainText('DORMANT');
    await expect(page.locator('.status-badge.resolved').first()).toContainText('RESOLVED');
  });

  test('category label renders for faction group', async ({ page }) => {
    await expect(page.locator('.category-label').first()).toContainText('FACTION');
  });

  test('thread summary text is visible', async ({ page }) => {
    await expect(page.locator('.thread-summary').first()).toContainText('Faction summary text.');
  });

  test('thread notes render when present', async ({ page }) => {
    await expect(page.locator('.thread-notes').first()).toContainText('Faction keeper notes.');
  });

});
