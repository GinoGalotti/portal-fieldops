// feed.spec.js — Tests for feed.html (live session tool).
//
// ARCHITECTURE NOTES (read before editing):
// - feed.html polls /api/v1/rolls and /api/v1/messages every 6s after load.
//   Tests mock these API endpoints via page.route() so they run deterministically
//   without a live D1 database. Static JSON files (/data/*.json) are served normally.
// - Initial load: GET rolls?limit=200 + GET messages?limit=100, merged by timestamp.
//   Tests pass pre-sorted DESC arrays (newest first) — initialLoad() reverses them.
// - Keeper mode: click the logo 5 times. Keeper tabs replace player tabs.
// - Expand/collapse: clicking a .feed-entry expands it exclusively (collapses
//   any other open entry). Click again to collapse. Only roll entries have a
//   .feed-outcome-detail block. Move cards in the panel work the same way.
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

// ── NEW HANDOUT TYPE MOCK DATA ────────────────────────────────────────────────

const MOCK_TONE = {
  id: 30, type: 'tone', sender: 'KEEPER',
  body: 'The stage manager\'s clipboard lowers.',
  subject: null,
  payload: JSON.stringify({ text: 'The stage manager\'s clipboard lowers.' }),
  delivered: 1, delivered_at: '2025-01-01 12:02:00', session_id: 'M03',
};

const MOCK_LINECARD_REX = {
  id: 31, type: 'linecard', sender: 'KEEPER',
  body: '[LINECARD — FIRST OUTLAW → REX]',
  subject: null,
  payload: JSON.stringify({
    recipient: 'rex',
    character: 'First Outlaw',
    context: 'You are an outlaw in a forest.',
    lines: [{ cue: null, text: 'Stand, sir, and throw us that you have about ye.' }],
    intensity: 'normal',
    stage_direction: null,
  }),
  delivered: 1, delivered_at: '2025-01-01 12:03:00', session_id: 'M03',
};

const MOCK_SCAN_NOMINAL = {
  id: 32, type: 'scan', sender: 'KEEPER',
  body: 'Victorian Wig Stand',
  subject: null,
  payload: JSON.stringify({
    label: 'Victorian Wig Stand', sublabel: 'c.1850',
    reading: '0.00 BIM', reading_display: '0.00 BIM',
    status: 'nominal', note: null,
  }),
  delivered: 1, delivered_at: '2025-01-01 12:04:00', session_id: 'M03',
};

const MOCK_SCAN_ALERT = {
  ...MOCK_SCAN_NOMINAL, id: 33,
  body: 'The Prompt Book',
  payload: JSON.stringify({
    label: 'The Prompt Book', sublabel: 'Victorian theatrical prompt book, annotated',
    reading: '4.2 BIM', reading_display: '4.20 BIM',
    status: 'alert', note: 'Secondary signature detected.',
  }),
};

const MOCK_READALOUD = {
  id: 34, type: 'readaloud', sender: 'KEEPER',
  body: '',
  subject: null,
  payload: JSON.stringify({
    label: 'Cold Open — Someone Had to Keep Things Going',
    text: 'The ward is quiet. A woman sits in the chair beside the bed.',
  }),
  delivered: 1, delivered_at: '2025-01-01 12:05:00', session_id: 'M03',
};

const MOCK_DOCUMENT = {
  id: 35, type: 'document', sender: 'KEEPER',
  body: '',
  subject: null,
  payload: JSON.stringify({
    label: 'Solstice Property Group — Grant Documentation',
    classification: 'FIELD EVIDENCE — S03 — ROUTE C',
    body: 'Arts grant award to Meridian Theatre Company. $47,000.',
    link: 'handouts/dossier/s03-grant-documentation.html',
  }),
  delivered: 1, delivered_at: '2025-01-01 12:06:00', session_id: 'M03',
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
// Default mode: click a .feed-entry to expand it exclusively (collapses any
// other open entry). Click the same entry again to collapse it.
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

  test('clicking a second entry collapses the first (exclusive expansion)', async ({ page }) => {
    // Expanding entry B must collapse entry A — only one open at a time.
    await mockFeedApis(page, { rolls: [MOCK_ROLL_2, MOCK_ROLL] }); // DESC order
    await page.goto('/feed.html');
    await page.waitForSelector('.feed-entry');
    const entries = page.locator('.feed-entry');
    await entries.nth(0).click(); // open first
    await expect(entries.nth(0)).toHaveClass(/\bexpanded\b/);
    await entries.nth(1).click(); // open second → first collapses
    await expect(entries.nth(1)).toHaveClass(/\bexpanded\b/);
    await expect(entries.nth(0)).not.toHaveClass(/expanded/);
  });

  test('move cards expand on click in default (no-hover) mode', async ({ page }) => {
    // wireMoveCards() attaches a click handler to .move-card-top that toggles
    // .expanded exclusively. CSS body.no-hover suppresses the :hover rule.
    await mockFeedApis(page, { rolls: [], messages: [] });
    await page.goto('/feed.html');
    await page.waitForLoadState('networkidle');
    // Select a hunter so move cards render
    await page.route('**/api/v1/hunters/reed/sheet', route =>
      route.fulfill({ json: { stats: { charm: 1, cool: 0, sharp: 2, tough: -1, weird: 0 }, harm: 0, luck: 3, xp: 0, checks: {}, bonds: [] } })
    );
    await page.selectOption('#hunter-select', 'reed');
    await page.waitForSelector('.move-card');

    const card = page.locator('.move-card').first();
    await expect(card).not.toHaveClass(/expanded/);
    // Click the header area (.move-card-top)
    await card.locator('.move-card-top').click();
    await expect(card).toHaveClass(/\bexpanded\b/);
  });

  test('clicking a second move card collapses the first', async ({ page }) => {
    await mockFeedApis(page, { rolls: [], messages: [] });
    await page.goto('/feed.html');
    await page.waitForLoadState('networkidle');
    await page.route('**/api/v1/hunters/reed/sheet', route =>
      route.fulfill({ json: { stats: { charm: 1, cool: 0, sharp: 2, tough: -1, weird: 0 }, harm: 0, luck: 3, xp: 0, checks: {}, bonds: [] } })
    );
    await page.selectOption('#hunter-select', 'reed');
    await page.waitForSelector('.move-card');

    const cards = page.locator('.move-card');
    await cards.nth(0).locator('.move-card-top').click();
    await expect(cards.nth(0)).toHaveClass(/\bexpanded\b/);
    await cards.nth(1).locator('.move-card-top').click();
    await expect(cards.nth(1)).toHaveClass(/\bexpanded\b/);
    await expect(cards.nth(0)).not.toHaveClass(/expanded/);
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
    // sessions/index.json + per-session file are real static files — wait for them to load and render.
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
    // Default session is now M03 (last). Switch to M02 where the pre-seeded
    // localStorage keys (s02-*) live.
    await page.locator('.data-sess-btn:has-text("M02")').click();
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

// ── HUNTER PANEL ──────────────────────────────────────────────────────────────
//
// The panel's MOVES tab renders after selecting a hunter from #hunter-select.
// onHunterChange(id) fetches the hunter sheet from /api/v1/hunters/{id}/sheet,
// then calls renderMovesPanel() which:
//  - Shows stat chips and clickable tracks (.track-mini-pip) if sheet.stats exists
//  - Shows playbook move cards (.move-card) for checked moves in sheet.checks
//  - Always shows basic move cards (.move-card) from /data/motw-basic-moves.json
//  - Sets #composer-name to HUNTER_NAMES[id]
// doRoll() runs after a 350ms animation, then POSTs to /api/v1/rolls.

const MOCK_SHEET = {
  stats: { charm: 1, cool: 0, sharp: 2, tough: -1, weird: 0 },
  harm: 0, luck: 3, xp: 1,
  checks: {},
  bonds: [], notes: '', special: [], hiddenLists: [],
};

// Sets up fresh routes for the hunter panel tests (overrides mockFeedApis).
async function setupFeedWithHunter(page) {
  await page.route('**/api/v1/rolls**', async route => {
    if (route.request().method() === 'POST') return route.fulfill({ json: { ok: true, id: 99 } });
    return route.fulfill({ json: [] });
  });
  await page.route('**/api/v1/messages**', async route => {
    const method = route.request().method();
    if (method === 'POST' || method === 'DELETE') return route.fulfill({ json: { ok: true, id: 99 } });
    return route.fulfill({ json: [] });
  });
  // Return MOCK_SHEET for any hunter GET; swallow PUTs.
  await page.route('**/api/v1/hunters/**', async route => {
    if (route.request().method() === 'PUT') return route.fulfill({ status: 200, body: '{}' });
    return route.fulfill({ json: MOCK_SHEET });
  });
  await page.goto('/feed.html');
  await page.waitForLoadState('networkidle');
}

test.describe('feed.html — hunter panel', () => {

  test('hunter picker dropdown (#hunter-select) renders in panel header', async ({ page }) => {
    await setupFeedWithHunter(page);
    await expect(page.locator('#hunter-select')).toBeVisible();
  });

  test('selecting a hunter auto-fills composer name from HUNTER_NAMES', async ({ page }) => {
    await setupFeedWithHunter(page);
    await page.selectOption('#hunter-select', 'reed');
    // onHunterChange sets #composer-name to HUNTER_NAMES['reed'] = 'Reed Atwood'
    await expect(page.locator('#composer-name')).toHaveValue('Reed Atwood');
  });

  test('move cards render after hunter selection', async ({ page }) => {
    await setupFeedWithHunter(page);
    await page.selectOption('#hunter-select', 'reed');
    // renderMovesPanel() always renders basic moves from motw-basic-moves.json
    await page.waitForSelector('.move-card');
    await expect(page.locator('.move-card').first()).toBeVisible();
  });

  test('each move card has a // ROLL button', async ({ page }) => {
    await setupFeedWithHunter(page);
    await page.selectOption('#hunter-select', 'reed');
    await page.waitForSelector('.roll-btn');
    await expect(page.locator('.roll-btn').first()).toBeVisible();
    await expect(page.locator('.roll-btn').first()).toContainText('ROLL');
  });

  test('track pips (.track-mini-pip) render when sheet has stats', async ({ page }) => {
    await setupFeedWithHunter(page);
    await page.selectOption('#hunter-select', 'reed');
    // renderTrack() outputs .track-mini-pip elements only when hunterSheet.stats exists
    await page.waitForSelector('.track-mini-pip');
    await expect(page.locator('.track-mini-pip').first()).toBeVisible();
  });

  test('clicking ROLL appends a new feed entry to the feed column', async ({ page }) => {
    await setupFeedWithHunter(page);
    await page.selectOption('#hunter-select', 'reed');
    await page.waitForSelector('.roll-btn');

    const initialCount = await page.locator('.feed-entry').count();

    // Click the first ROLL button
    await page.locator('.roll-btn').first().click();

    // doRoll() appends a local entry after a 350ms setTimeout
    await page.waitForFunction(
      count => document.querySelectorAll('.feed-entry').length > count,
      initialCount,
      { timeout: 2000 }
    );

    const newCount = await page.locator('.feed-entry').count();
    expect(newCount).toBeGreaterThan(initialCount);
  });

  test('clicking ROLL sends POST to /api/v1/rolls with correct hunter_id', async ({ page }) => {
    const posts = [];

    await page.route('**/api/v1/rolls**', async route => {
      if (route.request().method() === 'POST') {
        posts.push(await route.request().postDataJSON());
        return route.fulfill({ json: { ok: true, id: 50 } });
      }
      return route.fulfill({ json: [] });
    });
    await page.route('**/api/v1/messages**', route => route.fulfill({ json: [] }));
    await page.route('**/api/v1/hunters/**', async route => {
      if (route.request().method() === 'PUT') return route.fulfill({ status: 200, body: '{}' });
      return route.fulfill({ json: MOCK_SHEET });
    });

    await page.goto('/feed.html');
    await page.waitForLoadState('networkidle');
    await page.selectOption('#hunter-select', 'reed');
    await page.waitForSelector('.roll-btn');
    await page.locator('.roll-btn').first().click();

    // Wait for the 350ms animation + fetch to fire
    await page.waitForFunction(() => window._rollPosted, undefined, { timeout: 2000 }).catch(() => {});
    // Fallback: small wait to allow the setTimeout(fn, 350) to execute
    await page.waitForTimeout(600);

    expect(posts.length).toBeGreaterThan(0);
    expect(posts[0].hunter_id).toBe('reed');
  });

});

// ── PLAYBOOK FILTER ───────────────────────────────────────────────────────────
//
// renderMovesPanel() filters playbook moves by matching playbook-moves.json's
// `playbook` field against the selected hunter's `playbook` from hunters.json
// (loaded into hunters_meta on boot). The `hunter` field is the fallback.
//
// This test verifies the primary path: select Reed (sidekick), sheet has both a
// sidekick move (move-theres-no-i) and a monstrous move (move-incorporeal) checked.
// Only the sidekick move should appear in the moves panel; the monstrous move must not.

test.describe('feed.html — playbook move filter', () => {

  test('only moves matching hunter playbook appear (sidekick vs monstrous)', async ({ page }) => {
    const sheetWithBothChecked = {
      stats: { charm: 1, cool: 0, sharp: 2, tough: -1, weird: 0 },
      harm: 0, luck: 0, xp: 0,
      checks: {
        'move-theres-no-i': true,   // sidekick — should appear for Reed
        'move-incorporeal': true,   // monstrous — should NOT appear for Reed
      },
      bonds: [], notes: '', special: [], hiddenLists: [],
    };

    await page.route('**/api/v1/rolls**', route => route.fulfill({ json: [] }));
    await page.route('**/api/v1/messages**', route => route.fulfill({ json: [] }));
    await page.route('**/api/v1/hunters/**', async route => {
      if (route.request().method() === 'PUT') return route.fulfill({ status: 200, body: '{}' });
      return route.fulfill({ json: sheetWithBothChecked });
    });

    await page.goto('/feed.html');
    await page.waitForLoadState('networkidle');
    await page.selectOption('#hunter-select', 'reed');
    await page.waitForSelector('.move-card');

    // Sidekick move must appear in the panel
    const sidekickCard = page.locator('.move-card', { hasText: 'There\'s No "I" In "Team"' });
    await expect(sidekickCard).toBeVisible();

    // Monstrous move must NOT appear (wrong playbook for Reed)
    const monstrousCard = page.locator('.move-card', { hasText: 'Incorporeal' });
    await expect(monstrousCard).not.toBeAttached();
  });

});

// ── HANDOUT COEXISTENCE ───────────────────────────────────────────────────────
//
// Regression: posting an image handout must not remove a previously-posted PDA
// from the feed. Both entries must be visible after both are posted in sequence.
//
// The stateful route mock tracks messages added via POST and filters GET responses
// by the `after` param, mirroring the real messages API behaviour.

test.describe('feed.html — handout coexistence', () => {

  test('posting an image after a PDA does not remove the PDA from the feed', async ({ page }) => {
    const postedMessages = [];
    let nextId = 50;

    await page.route('**/api/v1/rolls**', route => route.fulfill({ json: [] }));
    await page.route('**/api/v1/messages**', async route => {
      const method = route.request().method();
      if (method === 'POST') {
        const body = route.request().postDataJSON() || {};
        nextId++;
        postedMessages.push({
          id: nextId,
          type: body.type || 'message',
          sender: body.sender || 'KEEPER',
          subject: body.subject || null,
          body: body.body || '',
          payload: body.payload ? JSON.stringify(body.payload) : null,
          delivered: 1,
          delivered_at: `2025-01-01 12:${String(nextId).padStart(2, '0')}:00`,
          session_id: body.session_id || null,
        });
        return route.fulfill({ json: { ok: true, id: nextId } });
      }
      if (method === 'DELETE') return route.fulfill({ json: { ok: true } });
      // GET: mirror the real API — after=0 → DESC order; after=N → ASC, id > N only
      const url = new URL(route.request().url());
      const after = parseInt(url.searchParams.get('after') || '0', 10);
      if (after > 0) {
        return route.fulfill({ json: postedMessages.filter(m => m.id > after) });
      }
      return route.fulfill({ json: [...postedMessages].reverse() });
    });
    await page.route('**/api/v1/hunters/**', route => route.fulfill({ json: null }));

    await page.clock.install();
    await page.goto('/feed.html');

    // Enter keeper mode (5× logo click)
    const logo = page.locator('.logo');
    for (let i = 0; i < 5; i++) await logo.click();

    // Open keeper HANDOUTS tab and wait for the handout list
    await page.locator('[data-ktab="handouts"]').click();
    await page.waitForSelector('.handout-list');
    // Default session is now M03 (last). Switch to M02 which has the s02-* handouts.
    await page.locator('.data-sess-btn:has-text("M02")').click();
    await page.waitForSelector('.handout-list');

    // Post the PDA handout (s02-pda-01 — CAMPBELL Anomaly Report)
    await page.locator('#hbtn-s02-pda-01').click();

    // Advance clock past the 6s poll interval so the PDA arrives via polling
    await page.clock.runFor(7000);
    await expect(page.locator('.feed-pda')).toBeVisible();
    // Exactly 1 feed entry (the PDA) — no extras
    await expect(page.locator('.feed-entry')).toHaveCount(1);

    // Post the image handout (s02-img-01 — Aldermoor exterior)
    await page.locator('#hbtn-s02-img-01').click();

    // Advance clock again so the image arrives via the next poll
    await page.clock.runFor(7000);
    await expect(page.locator('.feed-image')).toBeVisible();

    // Feed must now have exactly 2 entries — PDA was not removed when image arrived
    await expect(page.locator('.feed-entry')).toHaveCount(2);
    await expect(page.locator('.feed-pda')).toHaveCount(1);
    await expect(page.locator('.feed-image')).toHaveCount(1);
  });

});

// ── TONE CARDS ────────────────────────────────────────────────────────────────

test.describe('feed.html — tone cards', () => {

  test('tone card renders as .feed-tone with italic text', async ({ page }) => {
    await mockFeedApis(page, { messages: [MOCK_TONE] });
    await page.goto('/feed.html');
    await page.waitForSelector('.feed-tone');
    await expect(page.locator('.feed-tone')).toBeVisible();
    await expect(page.locator('.feed-tone-text')).toContainText('clipboard lowers');
  });

  test('tone card has no sender badge or timestamp row', async ({ page }) => {
    await mockFeedApis(page, { messages: [MOCK_TONE] });
    await page.goto('/feed.html');
    await page.waitForSelector('.feed-tone');
    // Tone entries intentionally omit the meta row (sender + timestamp).
    await expect(page.locator('.feed-tone .feed-entry-meta')).toHaveCount(0);
  });

});

// ── SCAN RESULTS ──────────────────────────────────────────────────────────────

test.describe('feed.html — scan results', () => {

  test('nominal scan renders as .feed-scan without alert/critical class', async ({ page }) => {
    await mockFeedApis(page, { messages: [MOCK_SCAN_NOMINAL] });
    await page.goto('/feed.html');
    await page.waitForSelector('.feed-scan');
    await expect(page.locator('.feed-scan')).toBeVisible();
    await expect(page.locator('.feed-scan')).not.toHaveClass(/scan-alert/);
    await expect(page.locator('.feed-scan')).not.toHaveClass(/scan-critical/);
    await expect(page.locator('.scan-label')).toContainText('Victorian Wig Stand');
  });

  test('alert scan renders with .scan-alert class', async ({ page }) => {
    await mockFeedApis(page, { messages: [MOCK_SCAN_ALERT] });
    await page.goto('/feed.html');
    await page.waitForSelector('.feed-scan');
    await expect(page.locator('.feed-scan')).toHaveClass(/scan-alert/);
    await expect(page.locator('.scan-label')).toContainText('Prompt Book');
  });

  test('scan shows reading value and status pip', async ({ page }) => {
    await mockFeedApis(page, { messages: [MOCK_SCAN_ALERT] });
    await page.goto('/feed.html');
    await page.waitForSelector('.feed-scan');
    await expect(page.locator('.scan-reading-value')).toContainText('4.20 BIM');
    await expect(page.locator('.scan-status-pip')).toContainText('ALERT');
  });

});

// ── LINECARDS ─────────────────────────────────────────────────────────────────
//
// Linecards are recipient-sensitive: a player sees the full card only if the
// selected hunter matches the linecard recipient. Keeper mode bypasses this
// and always shows the full card regardless of selected hunter.

test.describe('feed.html — linecards', () => {

  test('linecard renders as .feed-linecard in the feed', async ({ page }) => {
    await mockFeedApis(page, { messages: [MOCK_LINECARD_REX] });
    await page.goto('/feed.html');
    await page.waitForSelector('.feed-linecard');
    await expect(page.locator('.feed-linecard')).toBeVisible();
  });

  test('linecard shows redacted notice when no hunter is selected', async ({ page }) => {
    await mockFeedApis(page, { messages: [MOCK_LINECARD_REX] });
    await page.goto('/feed.html');
    await page.waitForSelector('.feed-linecard');
    await expect(page.locator('.linecard-redacted')).toBeVisible();
    await expect(page.locator('.linecard-body')).toHaveCount(0);
  });

  test('linecard shows full card when recipient hunter is selected', async ({ page }) => {
    await mockFeedApis(page, { messages: [MOCK_LINECARD_REX] });
    await page.route('**/api/v1/hunters/rex/sheet', r =>
      r.fulfill({ json: { stats: { charm: 1, cool: 0, sharp: 0, tough: 1, weird: 1 }, harm: 0, luck: 7, xp: 0, checks: {}, bonds: [] } })
    );
    await page.goto('/feed.html');
    await page.waitForSelector('.feed-linecard');
    // Select rex — onHunterChange sets hunterId and calls refreshLinecardEntries()
    await page.selectOption('#hunter-select', 'rex');
    await expect(page.locator('.linecard-body')).toBeVisible();
    await expect(page.locator('.linecard-body')).toContainText('Stand, sir');
    await expect(page.locator('.linecard-redacted')).toHaveCount(0);
  });

  test('linecard reverts to redacted when a different hunter is selected', async ({ page }) => {
    await mockFeedApis(page, { messages: [MOCK_LINECARD_REX] });
    await page.route('**/api/v1/hunters/rex/sheet', r =>
      r.fulfill({ json: { stats: {}, harm: 0, luck: 7, xp: 0, checks: {}, bonds: [] } })
    );
    await page.route('**/api/v1/hunters/reed/sheet', r =>
      r.fulfill({ json: { stats: {}, harm: 0, luck: 7, xp: 0, checks: {}, bonds: [] } })
    );
    await page.goto('/feed.html');
    await page.waitForSelector('.feed-linecard');
    await page.selectOption('#hunter-select', 'rex');
    await expect(page.locator('.linecard-body')).toBeVisible();
    // Switch to a different hunter — card must revert to redacted immediately
    await page.selectOption('#hunter-select', 'reed');
    await expect(page.locator('.linecard-redacted')).toBeVisible();
    await expect(page.locator('.linecard-body')).toHaveCount(0);
  });

  test('keeper mode shows full linecard regardless of selected hunter', async ({ page }) => {
    // Initial load is empty; linecard arrives on first poll after keeper mode is active.
    await page.clock.install({ time: new Date('2025-01-01T12:00:00Z') });
    let pollCount = 0;
    await page.route('**/api/v1/rolls**', r => r.fulfill({ json: [] }));
    await page.route('**/api/v1/messages**', async r => {
      if (r.request().method() !== 'GET') return r.fulfill({ json: { ok: true, id: 99 } });
      if (r.request().url().includes('after=')) {
        pollCount++;
        return pollCount === 1
          ? r.fulfill({ json: [MOCK_LINECARD_REX] })
          : r.fulfill({ json: [] });
      }
      return r.fulfill({ json: [] }); // initial load: empty
    });
    await page.route('**/api/v1/hunters/**', r => r.fulfill({ json: null }));

    await page.goto('/feed.html');
    await page.waitForLoadState('networkidle');

    // Activate keeper mode before the poll fires
    const logo = page.locator('.logo');
    for (let i = 0; i < 5; i++) await logo.click();
    await expect(page.locator('.keeper-tab').first()).toBeVisible();

    // Advance past the poll interval — linecard arrives and is rendered in keeper mode
    await page.clock.runFor(7000);
    await page.waitForSelector('.feed-linecard');

    // Keeper sees full card, not redacted notice
    await expect(page.locator('.linecard-body')).toBeVisible();
    await expect(page.locator('.linecard-body')).toContainText('Stand, sir');
    await expect(page.locator('.linecard-redacted')).toHaveCount(0);
  });

});

// ── KEEPER TABS — CONTACTS / REFERENCES / THREATS ────────────────────────────

test.describe('feed.html — keeper tabs', () => {

  async function activateKeeper(page) {
    const logo = page.locator('.logo');
    for (let i = 0; i < 5; i++) await logo.click();
    await expect(page.locator('.keeper-tab').first()).toBeVisible();
  }

  test('CONTACTS tab shows NPC rows with visibility buttons', async ({ page }) => {
    await mockFeedApis(page);
    await page.goto('/feed.html');
    await page.waitForLoadState('networkidle');
    await activateKeeper(page);
    await page.locator('[data-ktab="contacts"]').click();
    // portal-npcs.json is a static file — wait for it to render
    await page.waitForSelector('.npc-row');
    await expect(page.locator('.npc-row').first()).toBeVisible();
    await expect(page.locator('.npc-vis-btn').first()).toBeVisible();
  });

  test('CONTACTS tab shows session filter pills', async ({ page }) => {
    await mockFeedApis(page);
    await page.goto('/feed.html');
    await page.waitForLoadState('networkidle');
    await activateKeeper(page);
    await page.locator('[data-ktab="contacts"]').click();
    await page.waitForSelector('.session-filter');
    await expect(page.locator('.session-pill:has-text("S01")')).toBeVisible();
    await expect(page.locator('.session-pill:has-text("ALL")')).toBeVisible();
  });

  test('REFERENCES tab shows roll outcomes section', async ({ page }) => {
    await mockFeedApis(page);
    await page.goto('/feed.html');
    await activateKeeper(page);
    await page.locator('[data-ktab="references"]').click();
    await expect(page.locator('.ref-section').first()).toBeVisible();
    await expect(page.locator('.ref-label').first()).toContainText('ROLL OUTCOMES');
  });

  test('REFERENCES tab shows 13+ advanced success threshold', async ({ page }) => {
    await mockFeedApis(page);
    await page.goto('/feed.html');
    await activateKeeper(page);
    await page.locator('[data-ktab="references"]').click();
    await expect(page.locator('.ref-row').first()).toContainText('13+');
  });

  test('THREATS tab shows session selector with all sessions', async ({ page }) => {
    await mockFeedApis(page);
    await page.goto('/feed.html');
    await page.waitForLoadState('networkidle');
    await activateKeeper(page);
    await page.locator('[data-ktab="threats"]').click();
    await page.waitForSelector('.data-session-selector');
    // sessions/index.json has M01, M02, M03
    await expect(page.locator('.data-sess-btn:has-text("M01")')).toBeVisible();
    await expect(page.locator('.data-sess-btn:has-text("M02")')).toBeVisible();
    await expect(page.locator('.data-sess-btn:has-text("M03")')).toBeVisible();
  });

  test('THREATS tab renders entity data for selected session', async ({ page }) => {
    await mockFeedApis(page);
    await page.goto('/feed.html');
    await page.waitForLoadState('networkidle');
    await activateKeeper(page);
    await page.locator('[data-ktab="threats"]').click();
    await page.waitForSelector('.data-session-selector');
    // M01 is selected by default; it has Eszter as an entity
    await page.waitForSelector('.data-entity-block', { timeout: 5000 });
    await expect(page.locator('.data-entity-block').first()).toBeVisible();
  });

});

// ── READALOUD HANDOUTS ────────────────────────────────────────────────────────
//
// Readaloud entries: keeper-read prose blocks. No sender/timestamp meta row.
// Payload: { label, text }. Rendered as .feed-readaloud with eyebrow + body.

test.describe('feed.html — readaloud handouts', () => {

  test('readaloud entry renders with .feed-readaloud class', async ({ page }) => {
    await mockFeedApis(page, { messages: [MOCK_READALOUD] });
    await page.goto('/feed.html');
    await page.waitForSelector('.feed-readaloud');
    await expect(page.locator('.feed-readaloud')).toBeVisible();
  });

  test('readaloud eyebrow contains KEEPER READALOUD and uppercased label', async ({ page }) => {
    await mockFeedApis(page, { messages: [MOCK_READALOUD] });
    await page.goto('/feed.html');
    await page.waitForSelector('.feed-readaloud');
    const eyebrow = page.locator('.feed-readaloud-eyebrow');
    await expect(eyebrow).toContainText('KEEPER READALOUD');
    // Label is uppercased by escHtml().toUpperCase() in the renderer
    await expect(eyebrow).toContainText('COLD OPEN');
  });

  test('readaloud renders text content in .feed-readaloud-text', async ({ page }) => {
    await mockFeedApis(page, { messages: [MOCK_READALOUD] });
    await page.goto('/feed.html');
    await page.waitForSelector('.feed-readaloud');
    await expect(page.locator('.feed-readaloud-text')).toContainText('ward is quiet');
  });

});

// ── DOCUMENT HANDOUTS ─────────────────────────────────────────────────────────
//
// Document entries: amber evidence-dossier cards. Payload: { label, classification,
// body, link? }. Optional link renders as .document-link "→ VIEW FULL DOCUMENT".

test.describe('feed.html — document handouts', () => {

  test('document entry renders with .feed-document class', async ({ page }) => {
    await mockFeedApis(page, { messages: [MOCK_DOCUMENT] });
    await page.goto('/feed.html');
    await page.waitForSelector('.feed-document');
    await expect(page.locator('.feed-document')).toBeVisible();
  });

  test('document shows classification stamp in .document-classification', async ({ page }) => {
    await mockFeedApis(page, { messages: [MOCK_DOCUMENT] });
    await page.goto('/feed.html');
    await page.waitForSelector('.feed-document');
    await expect(page.locator('.document-classification').first()).toContainText('FIELD EVIDENCE');
  });

  test('document shows title in .document-title and body in .document-body', async ({ page }) => {
    await mockFeedApis(page, { messages: [MOCK_DOCUMENT] });
    await page.goto('/feed.html');
    await page.waitForSelector('.feed-document');
    await expect(page.locator('.document-title')).toContainText('Solstice Property Group');
    await expect(page.locator('.document-body')).toContainText('$47,000');
  });

  test('document with link renders .document-link with VIEW FULL DOCUMENT text', async ({ page }) => {
    await mockFeedApis(page, { messages: [MOCK_DOCUMENT] });
    await page.goto('/feed.html');
    await page.waitForSelector('.feed-document');
    await expect(page.locator('.document-link')).toBeVisible();
    await expect(page.locator('.document-link')).toContainText('VIEW FULL DOCUMENT');
  });

  test('document without link has no .document-link element', async ({ page }) => {
    const docNoLink = {
      ...MOCK_DOCUMENT, id: 36,
      payload: JSON.stringify({ label: 'Field Notes', classification: 'UNCLASSIFIED', body: 'Quick notes.' }),
    };
    await mockFeedApis(page, { messages: [docNoLink] });
    await page.goto('/feed.html');
    await page.waitForSelector('.feed-document');
    await expect(page.locator('.document-link')).toHaveCount(0);
  });

});
