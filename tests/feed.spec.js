// feed.spec.js — Tests for feed.html (live session tool).
//
// ARCHITECTURE NOTES (read before editing):
// - feed.html polls /api/v1/rolls and /api/v1/messages every 6s after load.
//   Tests mock these API endpoints via page.route() so they run deterministically
//   without a live D1 database. Static JSON files (/data/*.json) are served normally.
// - Initial load: GET rolls?limit=200 + GET messages?limit=100, merged by timestamp.
//   Tests pass pre-sorted DESC arrays (newest first) — initialLoad() reverses them.
// - Keeper mode: click the logo 5 times. Keeper tabs replace player tabs.
// - Expand/collapse: clicking a .feed-entry toggles .expanded; CSS shows/hides
//   .feed-outcome-detail. Only roll entries have this detail block.
// - Clear feed: posts type:'clear' sentinel, all clients wipe on receipt/reload.
// - Clear handouts: clears localStorage immediately, re-renders keeper panel.
//
// IMPORTANT: feed.html starts polling after load (setInterval 6s). Tests that
// need time control use page.clock.install(). Tests that just check initial
// render do NOT need clock control — the mock API returns instantly.

import { test, expect } from '@playwright/test';

// ── MOCK DATA ────────────────────────────────────────────────────────────────

// Roll entry with embedded outcomes — buildDetailHtml() uses entry.outcomes directly
// when present, so tests don't depend on playbook-moves.json content.
const MOCK_ROLL = {
  id: 1,
  hunter_id: 'reed',
  move_name: 'Act Under Pressure',
  roll_total: 9,
  roll_dice: [4, 5],
  stat_modifier: 0,
  stat_name: 'cool',
  outcome: 'partial',
  outcomes: {
    '10_plus': 'You do it cleanly.',
    '7_9': 'You do it, but there is a cost.',
    'miss': 'Something goes badly wrong.',
  },
  delivered: 1,
  rolled_at: '2025-01-01 12:00:00',
};

const MOCK_ROLL_2 = {
  ...MOCK_ROLL,
  id: 2,
  move_name: 'Help Out',
  rolled_at: '2025-01-01 12:00:01',
};

const MOCK_MSG = {
  id: 10,
  type: 'message',
  sender: 'CAMPBELL',
  body: 'Operative, your briefing is ready.',
  subject: null,
  payload: null,
  delivered: 1,
  delivered_at: '2025-01-01 12:00:05',
  session_id: 'S02',
};

// ── ROUTE HELPER ─────────────────────────────────────────────────────────────

// Intercepts all D1-backed API calls. Static files (/data/*.json) pass through.
// rolls / messages — configurable response arrays (DESC order, as the API returns).
async function mockFeedApis(page, { rolls = [], messages = [] } = {}) {
  await page.route('**/api/v1/rolls**', route =>
    route.fulfill({ json: rolls })
  );
  await page.route('**/api/v1/messages**', async route => {
    const method = route.request().method();
    if (method === 'POST')   return route.fulfill({ json: { ok: true, id: 99 } });
    if (method === 'DELETE') return route.fulfill({ json: { ok: true } });
    return route.fulfill({ json: messages });
  });
  await page.route('**/api/v1/hunters/**', route =>
    route.fulfill({ json: null })
  );
}

// ── STRUCTURAL ───────────────────────────────────────────────────────────────

test.describe('feed.html — structural', () => {

  test('page loads and feed-entries area is present', async ({ page }) => {
    await mockFeedApis(page);
    await page.goto('/feed.html');
    await expect(page.locator('#feed-entries')).toBeVisible();
    await expect(page.locator('.feed-composer')).toBeVisible();
    await expect(page.locator('#load-more-btn')).toBeVisible();
  });

  test('player panel tabs are visible on load (MOVES, CONTACTS, HANDOUTS)', async ({ page }) => {
    await mockFeedApis(page);
    await page.goto('/feed.html');
    await expect(page.locator('[data-tab="moves"]')).toBeVisible();
    await expect(page.locator('[data-tab="contacts"]')).toBeVisible();
    await expect(page.locator('[data-tab="handouts"]')).toBeVisible();
  });

  test('roll entries returned by the API are rendered in the feed', async ({ page }) => {
    await mockFeedApis(page, { rolls: [MOCK_ROLL] });
    await page.goto('/feed.html');
    // Roll entries are appended by appendFeedEntry(); wait for one to appear.
    await page.waitForSelector('.feed-entry');
    await expect(page.locator('.feed-move-name')).toContainText('Act Under Pressure');
    await expect(page.locator('.feed-badge.partial')).toBeVisible();
  });

  test('message entries returned by the API are rendered in the feed', async ({ page }) => {
    await mockFeedApis(page, { messages: [MOCK_MSG] });
    await page.goto('/feed.html');
    await page.waitForSelector('.msg-entry');
    await expect(page.locator('.feed-msg-sender')).toContainText('CAMPBELL');
    await expect(page.locator('.feed-msg-body')).toContainText('briefing is ready');
  });

});

// ── EXPAND / COLLAPSE ────────────────────────────────────────────────────────
//
// Default mode: click a .feed-entry to add .expanded class (shows detail).
// Click again to remove it (collapses). Multiple entries can be open at once.
// ?mouseover=true restores legacy CSS :hover behaviour — not tested here (hover
// state is not reliably triggerable in Playwright headless mode).

test.describe('feed.html — expand/collapse on click', () => {

  test('roll entry has no .expanded class before any click', async ({ page }) => {
    await mockFeedApis(page, { rolls: [MOCK_ROLL] });
    await page.goto('/feed.html');
    await page.waitForSelector('.feed-entry');
    // .expanded is only added by JS click handler; entries start collapsed.
    await expect(page.locator('.feed-entry').first()).not.toHaveClass(/expanded/);
  });

  test('clicking a roll entry adds .expanded and shows outcome detail', async ({ page }) => {
    await mockFeedApis(page, { rolls: [MOCK_ROLL] });
    await page.goto('/feed.html');
    await page.waitForSelector('.feed-entry');
    const entry = page.locator('.feed-entry').first();
    await entry.click();
    // .expanded class is toggled by the event-delegated click handler on #feed-entries.
    // Use regex — toHaveClass(string) in Playwright 1.49+ matches the full class attribute.
    await expect(entry).toHaveClass(/\bexpanded\b/);
    // The detail block is hidden via CSS (opacity:0, max-height:0) until .expanded.
    await expect(entry.locator('.feed-outcome-detail')).toBeVisible();
    await expect(entry.locator('.feed-outcome-detail')).toContainText('cost');
  });

  test('clicking an already-expanded entry collapses it', async ({ page }) => {
    await mockFeedApis(page, { rolls: [MOCK_ROLL] });
    await page.goto('/feed.html');
    await page.waitForSelector('.feed-entry');
    const entry = page.locator('.feed-entry').first();
    await entry.click(); // expand
    await expect(entry).toHaveClass(/\bexpanded\b/);
    await entry.click(); // collapse
    await expect(entry).not.toHaveClass(/expanded/);
  });

  test('two different entries can be expanded simultaneously', async ({ page }) => {
    // Expanding entry B does NOT collapse entry A — each toggle is independent.
    await mockFeedApis(page, { rolls: [MOCK_ROLL_2, MOCK_ROLL] }); // DESC order
    await page.goto('/feed.html');
    await page.waitForSelector('.feed-entry');
    const entries = page.locator('.feed-entry');
    await entries.nth(0).click();
    await entries.nth(1).click();
    await expect(entries.nth(0)).toHaveClass(/\bexpanded\b/);
    await expect(entries.nth(1)).toHaveClass(/\bexpanded\b/);
  });

});

// ── KEEPER MODE ───────────────────────────────────────────────────────────────

test.describe('feed.html — keeper mode', () => {

  test('keeper mode activates after 5 logo clicks', async ({ page }) => {
    await mockFeedApis(page);
    await page.goto('/feed.html');
    // isKeeperMode is false by default; keeper tabs are hidden.
    await expect(page.locator('.keeper-tab').first()).not.toBeVisible();
    const logo = page.locator('.logo');
    for (let i = 0; i < 5; i++) await logo.click();
    // After the 5th click, keeper tabs replace player tabs.
    await expect(page.locator('.keeper-tab').first()).toBeVisible();
  });

  test('keeper HANDOUTS tab is present and clickable in keeper mode', async ({ page }) => {
    await mockFeedApis(page);
    await page.goto('/feed.html');
    const logo = page.locator('.logo');
    for (let i = 0; i < 5; i++) await logo.click();
    const handoutsTab = page.locator('[data-ktab="handouts"]');
    await expect(handoutsTab).toBeVisible();
    await handoutsTab.click();
    // session-data.json is a real static file — wait for it to load and render.
    await page.waitForSelector('.handout-list');
    await expect(page.locator('.handout-list')).toBeVisible();
  });

  test('keeper handout list shows POST buttons for S02 session', async ({ page }) => {
    await mockFeedApis(page);
    await page.goto('/feed.html');
    const logo = page.locator('.logo');
    for (let i = 0; i < 5; i++) await logo.click();
    await page.locator('[data-ktab="handouts"]').click();
    await page.waitForSelector('.handout-list');
    // Every non-map handout should have a ▶ POST button by default (none posted yet).
    const postBtns = page.locator('.handout-post-btn');
    await expect(postBtns.first()).toBeVisible();
    await expect(postBtns.first()).not.toHaveClass(/repost/);
  });

});

// ── CLEAR HANDOUTS ────────────────────────────────────────────────────────────
//
// The "CLEAR HANDOUTS" button in the keeper HANDOUTS tab immediately:
//   1. Clears localStorage portal_posted_handouts for that session.
//   2. Re-renders the keeper panel (buttons go back to ▶ POST).
//   3. Fires a background DELETE to D1 (no UI dependency — always mocked as ok).
// The re-render happens synchronously, BEFORE the D1 call completes.

test.describe('feed.html — clear handouts', () => {

  test('clear handouts immediately resets RE-POST buttons to POST', async ({ page }) => {
    // Pre-seed localStorage so S02 handouts look already-posted.
    await page.addInitScript(() => {
      localStorage.setItem('portal_posted_handouts', JSON.stringify({
        's02-ra-01': '12:00',
        's02-ra-02': '12:00',
        's02-pda-01': '12:00',
        's02-img-01': '12:00',
      }));
    });
    await mockFeedApis(page);
    await page.goto('/feed.html');
    const logo = page.locator('.logo');
    for (let i = 0; i < 5; i++) await logo.click();
    await page.locator('[data-ktab="handouts"]').click();
    await page.waitForSelector('.handout-list');

    // At least one button should be in RE-POST state (from localStorage seed).
    await expect(page.locator('.handout-post-btn.repost').first()).toBeVisible();

    // Click clear.
    await page.locator('.handout-clear-btn').click();

    // All RE-POST buttons must be gone immediately — no reload required.
    // This was previously broken because renderFeed() (non-existent) threw before
    // renderKeeperHandoutsTab() could run.
    await expect(page.locator('.handout-post-btn.repost')).toHaveCount(0);
    // Normal POST buttons should still be present (handout list is still shown).
    await expect(page.locator('.handout-post-btn').first()).toBeVisible();
  });

  test('clear handouts removes handout DOM entries from the feed column', async ({ page }) => {
    // Pre-seed localStorage as posted, and start with an image entry in the feed.
    await page.addInitScript(() => {
      localStorage.setItem('portal_posted_handouts', JSON.stringify({
        's02-img-01': '12:00',
      }));
    });
    const IMG_ENTRY = {
      id: 20,
      type: 'image',
      sender: 'KEEPER',
      body: 'Aldermoor — District Exterior',
      subject: 'Aldermoor — District Exterior',
      payload: JSON.stringify({ src: 'images/M2-aldermoor-exterior.png', label: 'Aldermoor — District Exterior' }),
      delivered: 1,
      delivered_at: '2025-01-01 12:00:00',
      session_id: 'S02',
    };
    await mockFeedApis(page, { messages: [IMG_ENTRY] });
    await page.goto('/feed.html');
    await page.waitForSelector('.feed-image');

    // Confirm image entry is in the feed before clearing.
    await expect(page.locator('.feed-image')).toBeVisible();

    // Activate keeper mode and clear handouts for S02.
    const logo = page.locator('.logo');
    for (let i = 0; i < 5; i++) await logo.click();
    await page.locator('[data-ktab="handouts"]').click();
    await page.waitForSelector('.handout-clear-btn');
    await page.locator('.handout-clear-btn').click();

    // Image entries (.feed-image) should be removed from the feed DOM immediately.
    await expect(page.locator('.feed-image')).toHaveCount(0);
  });

});

// ── CLEAR FEED ────────────────────────────────────────────────────────────────
//
// The keeper "CLEAR FEED VIEW" button:
//   1. Clears this client's feed DOM immediately.
//   2. Posts a type:'clear' sentinel to D1 (mocked).
// Cross-client effect: other clients see the sentinel via polling and wipe their feed.
// Reload effect: initialLoad() finds the sentinel and discards pre-clear entries.

test.describe('feed.html — clear feed', () => {

  test('clear feed view removes all entries from DOM immediately', async ({ page }) => {
    await mockFeedApis(page, { rolls: [MOCK_ROLL], messages: [MOCK_MSG] });
    await page.goto('/feed.html');
    await page.waitForSelector('.feed-entry');
    await expect(page.locator('.feed-entry').first()).toBeVisible();

    // Activate keeper mode.
    const logo = page.locator('.logo');
    for (let i = 0; i < 5; i++) await logo.click();

    // Click CLEAR FEED VIEW (in the OPERATIVES tab controls).
    await page.locator('button:has-text("CLEAR FEED VIEW")').click();

    // All feed entries must be gone immediately.
    await expect(page.locator('.feed-entry')).toHaveCount(0);
  });

  test('on reload, messages before the clear sentinel are not rendered', async ({ page }) => {
    // The initial messages?limit=100 returns three entries (DESC order, newest first):
    // - MOCK_AFTER  (id 10, after the clear)
    // - MOCK_CLEAR  (id 8,  the sentinel itself — type:'clear')
    // - MOCK_OLD    (id 5,  before the clear — should be discarded)
    const MOCK_OLD = {
      id: 5, type: 'message', sender: 'REED',
      body: 'Message before the clear.',
      delivered: 1, delivered_at: '2025-01-01 10:00:00', session_id: 'S02',
    };
    const MOCK_CLEAR_ENTRY = {
      id: 8, type: 'clear', sender: 'KEEPER',
      body: '// FEED CLEARED',
      delivered: 1, delivered_at: '2025-01-01 11:00:00', session_id: 'S02',
    };
    const MOCK_AFTER = {
      id: 10, type: 'message', sender: 'CAMPBELL',
      body: 'Message after the clear.',
      delivered: 1, delivered_at: '2025-01-01 12:00:00', session_id: 'S02',
    };

    // API returns DESC (newest first); initialLoad() reverses to ASC before processing.
    await mockFeedApis(page, { messages: [MOCK_AFTER, MOCK_CLEAR_ENTRY, MOCK_OLD] });
    await page.goto('/feed.html');

    // Only MOCK_AFTER should be shown — pre-clear and sentinel are discarded.
    await page.waitForSelector('.feed-entry');
    const entries = page.locator('.feed-entry');
    await expect(entries).toHaveCount(1);
    await expect(entries.first()).toContainText('Message after the clear.');
  });

  test('clear sentinel received via polling wipes the visible feed', async ({ page }) => {
    // Initial load: one message visible. Then poll returns a clear sentinel.
    // The poll handler detects type:'clear' and wipes feedEntries + DOM.
    await page.clock.install({ time: new Date('2025-01-01T12:00:00Z') });

    let pollCount = 0;
    await page.route('**/api/v1/rolls**', route => route.fulfill({ json: [] }));
    await page.route('**/api/v1/messages**', async route => {
      if (route.request().method() !== 'GET') return route.fulfill({ json: { ok: true, id: 99 } });
      const url = route.request().url();
      if (url.includes('after=')) {
        pollCount++;
        // First poll returns the clear sentinel.
        if (pollCount === 1) {
          return route.fulfill({ json: [{ id: 20, type: 'clear', sender: 'KEEPER', body: '// FEED CLEARED', delivered: 1, delivered_at: '2025-01-01T13:00:00', session_id: 'S02' }] });
        }
        return route.fulfill({ json: [] });
      }
      // Initial load: one visible message.
      return route.fulfill({ json: [MOCK_MSG] });
    });
    await page.route('**/api/v1/hunters/**', route => route.fulfill({ json: null }));

    await page.goto('/feed.html');
    await page.waitForSelector('.msg-entry');
    await expect(page.locator('.msg-entry')).toBeVisible();

    // Advance clock past the 6-second poll interval.
    await page.clock.runFor(7000);

    // Feed should be empty after the clear sentinel is processed.
    await expect(page.locator('.feed-entry')).toHaveCount(0);
  });

  test('old rolls do not reappear on subsequent polls after a cleared feed', async ({ page }) => {
    // Regression test for: lastRollId staying 0 when all rolls predate the clear sentinel,
    // causing the next poll (after=0) to trigger the "initial load" branch in the API
    // and return all historical rolls — bypassing the clear.
    //
    // Fix: initialLoad() must advance lastRollId from the UNFILTERED roll list so the
    // poll cursor is never 0 after a clear, even when no rolls survive the clear filter.
    const oldTimestamp  = '2025-01-01T10:00:00.000Z';
    const clearTimestamp = '2025-01-01T12:00:00.000Z';

    const oldRolls = [
      { id: 1, hunter_id: 'reed', move_name: 'Act Under Pressure', roll_1: 3, roll_2: 4, modifier: 1, total: 8, outcome: 'partial', rolled_at: oldTimestamp },
      { id: 2, hunter_id: 'reed', move_name: 'Kick Some Ass',      roll_1: 5, roll_2: 6, modifier: 2, total: 13, outcome: 'advanced', rolled_at: oldTimestamp },
    ];
    const clearSentinel = { id: 10, sender: 'KEEPER', body: '// FEED CLEARED', type: 'clear', session_id: 'S01', delivered_at: clearTimestamp };

    await page.route('**/api/v1/rolls**', route => {
      const url   = new URL(route.request().url());
      const after = parseInt(url.searchParams.get('after') || '0', 10);
      // after=0 → "initial load" branch in rolls.js — returns ALL historical rolls.
      // The bug: if lastRollId stays 0 after a clear, every poll triggers this branch.
      // The fix: lastRollId is advanced past pre-clear rolls so polls use after=2, not after=0.
      route.fulfill({ json: after > 0 ? [] : oldRolls });
    });
    await page.route('**/api/v1/messages**', route => {
      const url   = new URL(route.request().url());
      const after = parseInt(url.searchParams.get('after') || '0', 10);
      // Return the clear sentinel only once (before lastMsgId advances past it).
      route.fulfill({ json: after >= 10 ? [] : [clearSentinel] });
    });
    await page.route('**/api/v1/hunters/**', route => route.fulfill({ json: null }));

    await page.clock.install();
    await page.goto('/feed.html');
    await page.waitForLoadState('networkidle');

    // Initial load applied the clear filter: no entries visible (all rolls predate clear).
    await expect(page.locator('.feed-entry')).toHaveCount(0);

    // Advance past the poll interval — triggers a new poll.
    // Without the fix: poll uses after=0 → API returns old rolls → they render.
    // With the fix:    poll uses after=2 → API returns []    → feed stays empty.
    await page.clock.runFor(7000);

    await expect(page.locator('.feed-entry')).toHaveCount(0);
  });

});

// ── FEED COMPOSER ─────────────────────────────────────────────────────────────

test.describe('feed.html — composer', () => {

  test('composer sends POST with correct sender and body', async ({ page }) => {
    const posts = [];
    await page.route('**/api/v1/messages**', async route => {
      if (route.request().method() === 'POST') {
        posts.push(await route.request().postDataJSON());
        return route.fulfill({ json: { ok: true, id: 99 } });
      }
      return route.fulfill({ json: [] });
    });
    await page.route('**/api/v1/rolls**', route => route.fulfill({ json: [] }));
    await page.route('**/api/v1/hunters/**', route => route.fulfill({ json: null }));

    await page.goto('/feed.html');
    await page.fill('#composer-name', 'REED');
    await page.fill('#composer-msg', 'Testing the feed composer.');
    await page.click('.composer-send');

    expect(posts).toHaveLength(1);
    expect(posts[0].sender).toBe('REED');
    expect(posts[0].body).toBe('Testing the feed composer.');
  });

});
