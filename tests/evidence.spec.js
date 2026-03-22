// evidence.spec.js — Tests for evidence.html
//
// ARCHITECTURE NOTES:
// - Page fetches data/portal-threads.json, data/evidence.json, and
//   /api/v1/evidence/visibility on load, then listens for portalSessionReady.
// - Thread tracker: renders threads with non-null player_summary only.
//   Active threads: expanded section. Dormant/resolved: collapsible, collapsed by default.
// - Evidence cards: session-gated (item.session <= active session) AND not effectively
//   hidden. hidden:true + not in revealedIds → hidden from players.
// - Category filter: pills toggle visibility of .evidence-card[data-category="X"].
// - Keeper mode: 3× click on #page-eyebrow. Shows keeper-toolbar, keeper-notes,
//   .keeper-vis-row on every card. Keeper sees ALL cards regardless of session/hidden.
// - Visibility toggle: REVEAL/HIDE buttons update D1 via PUT /api/v1/evidence/visibility.
// - DATA-DRIVEN: source JSON loaded at module level.

import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const evidenceItems = JSON.parse(readFileSync(resolve('./data/evidence.json'), 'utf-8'));
const threadsRaw    = JSON.parse(readFileSync(resolve('./data/portal-threads.json'), 'utf-8'));
const sessionsData  = JSON.parse(readFileSync(resolve('./data/sessions.json'), 'utf-8'));

const threads   = threadsRaw.threads;
const sessionIds = sessionsData.map(s => s.id);

// Items a player can see at a given session (session-gated + not hidden:true)
function playerVisibleAt(sessionId) {
  const idx = sessionIds.indexOf(sessionId);
  return evidenceItems.filter(item => {
    const itemIdx = sessionIds.indexOf(item.session);
    return itemIdx !== -1 && itemIdx <= idx && !item.hidden;
  });
}

// Threads by status that have a player_summary
const activeThreads  = threads.filter(t => t.status === 'active'  && t.player_summary);
const dormantThreads = threads.filter(t => t.status === 'dormant' && t.player_summary);

function mockSession(page, sessionId) {
  return page.route('**/api/v1/session/active', route =>
    route.fulfill({ json: { session_id: sessionId } })
  );
}

function mockVisibility(page, state = { revealed: [], manually_hidden: [] }) {
  return page.route('**/api/v1/evidence/visibility', route =>
    route.fulfill({ json: state })
  );
}

async function activateKeeperMode(page) {
  const eyebrow = page.locator('#page-eyebrow');
  for (let i = 0; i < 3; i++) await eyebrow.click();
}

// ── PAGE STRUCTURE ──────────────────────────────────────────────────────────────

test.describe('evidence — page structure', () => {

  test.beforeEach(async ({ page }) => {
    await mockSession(page, 'w3');
    await mockVisibility(page);
    await page.goto('/evidence.html');
    await page.waitForLoadState('networkidle');
  });

  test('page title contains Investigation Log', async ({ page }) => {
    await expect(page).toHaveTitle(/Investigation Log/i);
  });

  test('#page-eyebrow is visible', async ({ page }) => {
    await expect(page.locator('#page-eyebrow')).toBeVisible();
  });

  test('nav "Evidence" link is present', async ({ page }) => {
    const link = page.locator('#player-nav a').filter({ hasText: 'Evidence' });
    await expect(link).toBeVisible();
  });

  test('#threads-section is present', async ({ page }) => {
    await expect(page.locator('#threads-section')).toBeAttached();
  });

  test('#evidence-grid is present', async ({ page }) => {
    await expect(page.locator('#evidence-grid')).toBeAttached();
  });

  test('filter bar #filter-bar is present', async ({ page }) => {
    await expect(page.locator('#filter-bar')).toBeAttached();
  });

  test('#keeper-toolbar is hidden before keeper mode', async ({ page }) => {
    await expect(page.locator('#keeper-toolbar')).not.toBeVisible();
  });

});

// ── THREAD TRACKER ──────────────────────────────────────────────────────────────

test.describe('evidence — thread tracker', () => {

  test.beforeEach(async ({ page }) => {
    await mockSession(page, 'w3');
    await mockVisibility(page);
    await page.goto('/evidence.html');
    await page.waitForLoadState('networkidle');
  });

  test('active threads section renders the correct number of thread cards', async ({ page }) => {
    const cards = page.locator('#active-threads .thread-card');
    await expect(cards).toHaveCount(activeThreads.length);
  });

  test('thread cards have .thread-summary text', async ({ page }) => {
    const first = page.locator('#active-threads .thread-card').first();
    await expect(first.locator('.thread-summary')).toBeVisible();
  });

  test('threads with null player_summary are not rendered', async ({ page }) => {
    const nullSummaryThreads = threads.filter(t => t.player_summary === null);
    for (const t of nullSummaryThreads) {
      // No thread card should contain the raw (keeper) name as its heading
      const match = page.locator('.thread-name').filter({ hasText: t.name });
      await expect(match).not.toBeAttached();
    }
  });

  test('dormant threads section is hidden when there are no dormant threads with summaries', async ({ page }) => {
    if (dormantThreads.length === 0) {
      await expect(page.locator('#dormant-threads-group')).not.toBeVisible();
    } else {
      await expect(page.locator('#dormant-threads-group')).toBeVisible();
    }
  });

  test('dormant section is collapsed by default', async ({ page }) => {
    if (dormantThreads.length === 0) { test.skip(); return; }
    await expect(page.locator('#dormant-threads-group')).toHaveClass(/\bcollapsed\b/);
  });

  test('clicking dormant section header expands it', async ({ page }) => {
    if (dormantThreads.length === 0) { test.skip(); return; }
    await page.locator('#dormant-header').click();
    await expect(page.locator('#dormant-threads-group')).not.toHaveClass(/\bcollapsed\b/);
  });

});

// ── SESSION GATING — W1 ─────────────────────────────────────────────────────────

test.describe('evidence — session gating (w1)', () => {

  const visibleW1 = playerVisibleAt('w1');

  test.beforeEach(async ({ page }) => {
    await mockSession(page, 'w1');
    await mockVisibility(page);
    await page.goto('/evidence.html');
    await page.waitForLoadState('networkidle');
  });

  test('at w1 only w1 items are visible', async ({ page }) => {
    const cards = page.locator('.evidence-card:not([style*="display: none"])');
    await expect(cards).toHaveCount(visibleW1.length);
  });

  test('at w1 a w2 item is not visible', async ({ page }) => {
    const w2Item = evidenceItems.find(i => i.session === 'w2');
    if (!w2Item) { test.skip(); return; }
    const card = page.locator(`.evidence-card[data-id="${w2Item.id}"]`);
    await expect(card).not.toBeVisible();
  });

});

// ── SESSION GATING — W3 ─────────────────────────────────────────────────────────

test.describe('evidence — session gating (w3)', () => {

  const visibleW3 = playerVisibleAt('w3');

  test.beforeEach(async ({ page }) => {
    await mockSession(page, 'w3');
    await mockVisibility(page);
    await page.goto('/evidence.html');
    await page.waitForLoadState('networkidle');
  });

  test('at w3 all non-hidden items are visible', async ({ page }) => {
    const cards = page.locator('.evidence-card:not([style*="display: none"])');
    await expect(cards).toHaveCount(visibleW3.length);
  });

  test('at w3 hidden:true items are not visible to players', async ({ page }) => {
    const hiddenItems = evidenceItems.filter(i => i.hidden === true);
    expect(hiddenItems.length).toBeGreaterThan(0); // ensure data has hidden items
    for (const item of hiddenItems) {
      const card = page.locator(`.evidence-card[data-id="${item.id}"]`);
      await expect(card).not.toBeVisible();
    }
  });

  test('at w3 a first hidden:true item is in the DOM but display:none', async ({ page }) => {
    const hiddenItem = evidenceItems.find(i => i.hidden === true);
    if (!hiddenItem) { test.skip(); return; }
    const card = page.locator(`.evidence-card[data-id="${hiddenItem.id}"]`);
    await expect(card).toBeAttached(); // in DOM
    await expect(card).not.toBeVisible(); // but hidden
  });

});

// ── CATEGORY FILTER ─────────────────────────────────────────────────────────────

test.describe('evidence — category filter', () => {

  test.beforeEach(async ({ page }) => {
    await mockSession(page, 'w2');
    await mockVisibility(page);
    await page.goto('/evidence.html');
    await page.waitForLoadState('networkidle');
  });

  test('filter pills render for each category present in data', async ({ page }) => {
    const cats = [...new Set(evidenceItems.map(i => i.category))];
    const pills = page.locator('.filter-pill');
    await expect(pills).toHaveCount(cats.length);
  });

  test('all filter pills start with .active class', async ({ page }) => {
    const pills = page.locator('.filter-pill');
    const count = await pills.count();
    for (let i = 0; i < count; i++) {
      await expect(pills.nth(i)).toHaveClass(/\bactive\b/);
    }
  });

  test('clicking a pill removes .active and hides cards of that category', async ({ page }) => {
    // Pick a category that has visible items at w2
    const visibleW2 = playerVisibleAt('w2');
    const cats = [...new Set(visibleW2.map(i => i.category))];
    if (cats.length === 0) { test.skip(); return; }
    const cat = cats[0];

    const pill = page.locator(`.filter-pill[data-cat="${cat}"]`);
    await pill.click();
    await expect(pill).not.toHaveClass(/\bactive\b/);

    // Cards of that category should be hidden
    const cards = page.locator(`.evidence-card[data-category="${cat}"]`);
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i)).not.toBeVisible();
    }
  });

  test('clicking the pill again restores .active and shows cards', async ({ page }) => {
    const visibleW2 = playerVisibleAt('w2');
    const cats = [...new Set(visibleW2.map(i => i.category))];
    if (cats.length === 0) { test.skip(); return; }
    const cat = cats[0];

    const pill = page.locator(`.filter-pill[data-cat="${cat}"]`);
    await pill.click(); // hide
    await pill.click(); // show again
    await expect(pill).toHaveClass(/\bactive\b/);

    // At least one card of that category should be visible now
    const cards = page.locator(`.evidence-card[data-category="${cat}"]`);
    const first = cards.first();
    await expect(first).toBeVisible();
  });

});

// ── EVIDENCE CARD CONTENT ───────────────────────────────────────────────────────

test.describe('evidence — card content', () => {

  test.beforeEach(async ({ page }) => {
    await mockSession(page, 'w1');
    await mockVisibility(page);
    await page.goto('/evidence.html');
    await page.waitForLoadState('networkidle');
  });

  test('visible card has .ev-label element', async ({ page }) => {
    await expect(page.locator('.evidence-card:visible .ev-label').first()).toBeVisible();
  });

  test('visible card has .ev-summary element', async ({ page }) => {
    await expect(page.locator('.evidence-card:visible .ev-summary').first()).toBeVisible();
  });

  test('visible card has .ev-session-badge', async ({ page }) => {
    await expect(page.locator('.evidence-card:visible .ev-session-badge').first()).toBeVisible();
  });

  test('visible card has .ev-hunter-badge', async ({ page }) => {
    await expect(page.locator('.evidence-card:visible .ev-hunter-badge').first()).toBeVisible();
  });

  test('card with dossier_link renders .ev-dossier-link', async ({ page }) => {
    // Switch to w2 where some items have dossier links
    await mockSession(page, 'w2');
    await page.goto('/evidence.html');
    await page.waitForLoadState('networkidle');
    const withLink = evidenceItems.find(i => i.dossier_link && !i.hidden && i.session !== 'w3');
    if (!withLink) { test.skip(); return; }
    const link = page.locator(`.evidence-card[data-id="${withLink.id}"] .ev-dossier-link`);
    await expect(link).toBeVisible();
  });

  test('.keeper-note is hidden by default', async ({ page }) => {
    // Use a w1 item
    const item = evidenceItems.find(i => i.session === 'w1');
    const note = page.locator(`.evidence-card[data-id="${item.id}"] .keeper-note`);
    await expect(note).not.toBeVisible();
  });

});

// ── KEEPER MODE ─────────────────────────────────────────────────────────────────

test.describe('evidence — keeper mode activation', () => {

  test.beforeEach(async ({ page }) => {
    await mockSession(page, 'w3');
    await mockVisibility(page);
    await page.goto('/evidence.html');
    await page.waitForLoadState('networkidle');
  });

  test('3× click on #page-eyebrow shows #keeper-toolbar', async ({ page }) => {
    await activateKeeperMode(page);
    await expect(page.locator('#keeper-toolbar')).toBeVisible();
  });

  test('fewer than 3 clicks does not activate keeper mode', async ({ page }) => {
    const eyebrow = page.locator('#page-eyebrow');
    await eyebrow.click();
    await eyebrow.click();
    await expect(page.locator('#keeper-toolbar')).not.toBeVisible();
  });

  test('keeper mode shows .keeper-note on visible cards', async ({ page }) => {
    await activateKeeperMode(page);
    const note = page.locator('.evidence-card:visible .keeper-note').first();
    await expect(note).toBeVisible();
  });

  test('in keeper mode hidden:true items become visible', async ({ page }) => {
    await activateKeeperMode(page);
    const hiddenItem = evidenceItems.find(i => i.hidden === true);
    if (!hiddenItem) { test.skip(); return; }
    const card = page.locator(`.evidence-card[data-id="${hiddenItem.id}"]`);
    await expect(card).toBeVisible();
  });

  test('in keeper mode every visible card has a .keeper-vis-row', async ({ page }) => {
    await activateKeeperMode(page);
    const firstCard = page.locator('.evidence-card').first();
    await expect(firstCard.locator('.keeper-vis-row')).toBeVisible();
  });

});

// ── KEEPER VISIBILITY TOGGLE ────────────────────────────────────────────────────

test.describe('evidence — keeper visibility toggle', () => {

  test.beforeEach(async ({ page }) => {
    await mockSession(page, 'w3');
    await mockVisibility(page);
    // Mock the PUT so tests don't write to real D1
    await page.route('**/api/v1/evidence/visibility', route => {
      if (route.request().method() === 'PUT') {
        route.fulfill({ json: { ok: true } });
      } else {
        route.fulfill({ json: { revealed: [], manually_hidden: [] } });
      }
    });
    await page.goto('/evidence.html');
    await page.waitForLoadState('networkidle');
    await activateKeeperMode(page);
  });

  test('hidden:true item shows HIDDEN FROM PLAYERS badge', async ({ page }) => {
    const hiddenItem = evidenceItems.find(i => i.hidden === true);
    if (!hiddenItem) { test.skip(); return; }
    const badge = page.locator(`.evidence-card[data-id="${hiddenItem.id}"] .keeper-vis-badge`);
    await expect(badge).toContainText('HIDDEN FROM PLAYERS');
  });

  test('hidden:true item shows ▶ REVEAL button', async ({ page }) => {
    const hiddenItem = evidenceItems.find(i => i.hidden === true);
    if (!hiddenItem) { test.skip(); return; }
    const btn = page.locator(`.evidence-card[data-id="${hiddenItem.id}"] .keeper-vis-btn`);
    await expect(btn).toContainText('REVEAL');
  });

  test('hidden:false item shows VISIBLE TO PLAYERS badge', async ({ page }) => {
    const visibleItem = evidenceItems.find(i => !i.hidden);
    if (!visibleItem) { test.skip(); return; }
    const badge = page.locator(`.evidence-card[data-id="${visibleItem.id}"] .keeper-vis-badge`);
    await expect(badge).toContainText('VISIBLE TO PLAYERS');
  });

  test('hidden:false item shows HIDE button', async ({ page }) => {
    const visibleItem = evidenceItems.find(i => !i.hidden);
    if (!visibleItem) { test.skip(); return; }
    const btn = page.locator(`.evidence-card[data-id="${visibleItem.id}"] .keeper-vis-btn`);
    await expect(btn).toContainText('HIDE');
  });

  test('clicking REVEAL on a hidden:true item changes badge to VISIBLE TO PLAYERS', async ({ page }) => {
    const hiddenItem = evidenceItems.find(i => i.hidden === true);
    if (!hiddenItem) { test.skip(); return; }
    const card = page.locator(`.evidence-card[data-id="${hiddenItem.id}"]`);
    await card.locator('.keeper-vis-btn').click();
    await expect(card.locator('.keeper-vis-badge')).toContainText('VISIBLE TO PLAYERS');
  });

  test('clicking HIDE on a hidden:false item changes badge to HIDDEN FROM PLAYERS', async ({ page }) => {
    const visibleItem = evidenceItems.find(i => !i.hidden);
    if (!visibleItem) { test.skip(); return; }
    const card = page.locator(`.evidence-card[data-id="${visibleItem.id}"]`);
    await card.locator('.keeper-vis-btn').click();
    await expect(card.locator('.keeper-vis-badge')).toContainText('HIDDEN FROM PLAYERS');
  });

  test('REVEAL sends PUT to /api/v1/evidence/visibility', async ({ page }) => {
    let putBody = null;
    await page.route('**/api/v1/evidence/visibility', route => {
      if (route.request().method() === 'PUT') {
        putBody = route.request().postDataJSON();
        route.fulfill({ json: { ok: true } });
      } else {
        route.fulfill({ json: { revealed: [], manually_hidden: [] } });
      }
    });
    // Re-navigate to pick up new route
    await page.goto('/evidence.html');
    await page.waitForLoadState('networkidle');
    await activateKeeperMode(page);

    const hiddenItem = evidenceItems.find(i => i.hidden === true);
    if (!hiddenItem) { test.skip(); return; }
    await page.locator(`.evidence-card[data-id="${hiddenItem.id}"] .keeper-vis-btn`).click();

    // PUT should have been called with the item id in revealed
    await page.waitForTimeout(100); // allow fire-and-forget to dispatch
    expect(putBody).not.toBeNull();
    expect(putBody.revealed).toContain(hiddenItem.id);
  });

  test('pre-revealed items (from D1) show as VISIBLE TO PLAYERS on load', async ({ page }) => {
    const hiddenItem = evidenceItems.find(i => i.hidden === true);
    if (!hiddenItem) { test.skip(); return; }
    // Mock D1 as already having this item revealed
    await mockVisibility(page, { revealed: [hiddenItem.id], manually_hidden: [] });
    await page.goto('/evidence.html');
    await page.waitForLoadState('networkidle');
    await activateKeeperMode(page);
    const badge = page.locator(`.evidence-card[data-id="${hiddenItem.id}"] .keeper-vis-badge`);
    await expect(badge).toContainText('VISIBLE TO PLAYERS');
  });

});
