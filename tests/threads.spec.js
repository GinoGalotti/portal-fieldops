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

const MOCK_SESSIONS = [
  { id: 'w1', label: 'WEEK 01', title: 'A Promise is a Promise', status: 'closed' },
  { id: 'w2', label: 'WEEK 02', title: 'Something That Wants to Be Known', status: 'active' },
];

const MOCK_BRIEFINGS = {
  weeks: [
    {
      id: 'w01', label: 'WEEK 01', status: 'closed', title: 'Test week 1',
      items: [
        {
          type: 'case', id: 'case-a', title: 'THE VOLUNTEER',
          subtitle: 'Medical · Vitality Displacement',
          priority: 'high', footer_status: 'ACTIVE — TIME CRITICAL',
          rows: [{ k: 'LOCATION', v: 'Hargrove Medical Centre' }],
          directive: { label: '// DIRECTOR NOTE', paragraphs: ['Establish contact.'], dim_note: '// Find who shut down Meridian.' },
        },
        {
          type: 'case', id: 'case-c', title: 'THE RECORDER',
          subtitle: 'Informational · Precognitive',
          priority: 'info', footer_status: 'ACTIVE — CONTACT URGENT',
          rows: [{ k: 'SOURCE', v: 'Nadia Osei blog' }],
          directive: { label: '// DIRECTOR NOTE', paragraphs: ['Make contact.'] },
        },
      ],
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
    await page.route('**/sessions.json', route =>
      route.fulfill({ contentType: 'application/json', body: JSON.stringify(MOCK_SESSIONS) })
    );
    await page.route('**/briefings.json', route =>
      route.fulfill({ contentType: 'application/json', body: JSON.stringify(MOCK_BRIEFINGS) })
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

  // ── SESSION PREP EXPORT ──────────────────────────────────────────────────

  test('session prep section is visible', async ({ page }) => {
    await expect(page.locator('.prep-section')).toBeVisible();
  });

  test('case picker renders a button for each case in the latest briefing week', async ({ page }) => {
    // MOCK_BRIEFINGS has 2 cases: case-a, case-c
    await expect(page.locator('.case-btn')).toHaveCount(2);
  });

  test('case buttons show case letter and title', async ({ page }) => {
    await expect(page.locator('.case-btn').first()).toContainText('CASE A');
    await expect(page.locator('.case-btn').first()).toContainText('THE VOLUNTEER');
  });

  test('clicking a case button selects it (.selected class)', async ({ page }) => {
    const btn = page.locator('.case-btn').first();
    await btn.click();
    await expect(btn).toHaveClass(/selected/);
  });

  test('clicking a different case button deselects the first', async ({ page }) => {
    const first = page.locator('.case-btn').first();
    const second = page.locator('.case-btn').nth(1);
    await first.click();
    await second.click();
    await expect(first).not.toHaveClass(/selected/);
    await expect(second).toHaveClass(/selected/);
  });

  test('COPY SESSION CONTEXT button is visible', async ({ page }) => {
    await expect(page.locator('#prep-copy-btn')).toBeVisible();
  });

  test('copy button writes case + threads + clocks to clipboard', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.route('**/api/v1/reports/**', route =>
      route.fulfill({ status: 404, body: 'not found' })
    );

    await page.locator('.case-btn').first().click();
    await page.locator('#prep-copy-btn').click();

    await expect(page.locator('#prep-feedback')).toContainText('COPIED', { timeout: 5000 });

    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toContain('SESSION PREP CONTEXT');
    expect(copied).toContain('CASE A');
    expect(copied).toContain('THE VOLUNTEER');
    expect(copied).toContain('COUNTDOWN CLOCKS');
    expect(copied).toContain('CAMPAIGN THREADS');
  });

  test('copy output groups threads by status', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.route('**/api/v1/reports/**', route =>
      route.fulfill({ status: 404, body: 'not found' })
    );

    await page.locator('.case-btn').first().click();
    await page.locator('#prep-copy-btn').click();
    await expect(page.locator('#prep-feedback')).toContainText('COPIED', { timeout: 5000 });

    const copied = await page.evaluate(() => navigator.clipboard.readText());
    // Active, dormant, resolved sections all present
    expect(copied).toContain('ACTIVE');
    expect(copied).toContain('DORMANT');
    expect(copied).toContain('RESOLVED');
    // Thread names present
    expect(copied).toContain('Faction Thread');
    expect(copied).toContain('Mystery Thread');
    expect(copied).toContain('Personal Thread');
  });

});
