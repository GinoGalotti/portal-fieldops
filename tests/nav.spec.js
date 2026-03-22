// nav.spec.js — Verifies that player-nav.js injects navigation links correctly.
// The nav is entirely dynamically created — there are no hardcoded <a> tags in
// the HTML source. These tests confirm that the injection script runs successfully
// and produces the expected links on multiple pages.
//
// Also tests the mobile hamburger toggle injected by player-nav.js:
// .nav-toggle appears at ≤900px (CSS media query), clicking it opens the nav.
//
// Subdirectory path tests verify that player-nav.js adjusts hrefs correctly for
// pages in hunters/, missions/, and reports/ (b = '../') vs root pages (b = '').

// All 12 nav item labels defined in player-nav.js, in order.
const NAV_LABELS = [
  'Briefing', 'Operatives', 'Bestiary', 'Logs', 'Artefacts',
  'Missions', 'Evidence', 'Contacts', 'Report', 'Queue', 'Incidents', 'Feed',
];

import { test, expect } from '@playwright/test';

test.describe('Player nav injection', () => {

  test('player nav renders on index.html', async ({ page }) => {
    await page.goto('/index.html');
    // player-nav.js targets <nav id="player-nav"> and populates it with <a> elements.
    // Wait until at least one link appears — this confirms the script ran.
    const nav = page.locator('#player-nav');
    await expect(nav).toBeVisible();
    const links = nav.locator('a');
    await expect(links.first()).toBeVisible();
  });

  test('player nav renders on lab-incidents.html', async ({ page }) => {
    await page.goto('/lab-incidents.html');
    // Confirms nav injection works on a page that is NOT at the root
    // (lab-incidents.html is at root, so base path 'b' will be empty string)
    const nav = page.locator('#player-nav');
    await expect(nav).toBeVisible();
    const links = nav.locator('a');
    await expect(links.first()).toBeVisible();
  });

  test('Briefing link is present in player nav', async ({ page }) => {
    await page.goto('/index.html');
    // player-nav.js injects: { label: 'Briefing', href: 'index.html#sessions' }
    // The text content of each injected <a> is the label verbatim.
    const nav = page.locator('#player-nav');
    await expect(nav.getByText('Briefing')).toBeVisible();
  });

  test('Contacts link is present in player nav', async ({ page }) => {
    await page.goto('/index.html');
    // player-nav.js injects: { label: 'Contacts', href: 'missions/contacts.html' }
    const nav = page.locator('#player-nav');
    await expect(nav.getByText('Contacts')).toBeVisible();
  });

  test('CAMPBELL ONLINE status indicator is injected', async ({ page }) => {
    await page.goto('/index.html');
    // player-nav.js appends a #campbell-status span with text "CAMPBELL ONLINE"
    // to the right side of the header on every player page.
    await expect(page.locator('#campbell-status')).toBeVisible();
    await expect(page.locator('#campbell-status')).toHaveText('CAMPBELL ONLINE');
  });

});

test.describe('Mobile hamburger toggle', () => {

  test.use({ viewport: { width: 375, height: 812 } });

  test('.nav-toggle is visible at 375px viewport', async ({ page }) => {
    // player-nav.js injects a .nav-toggle button. CSS shows it only at ≤900px.
    await page.goto('/index.html');
    await expect(page.locator('.nav-toggle')).toBeVisible();
  });

  test('nav links are not visible before toggle click at 375px', async ({ page }) => {
    // At mobile width, nav has display:none unless .open class is present.
    await page.goto('/index.html');
    await expect(page.locator('#player-nav')).toBeHidden();
  });

  test('clicking .nav-toggle makes nav links visible', async ({ page }) => {
    await page.goto('/index.html');
    await page.locator('.nav-toggle').click();
    // .open class added to #player-nav → CSS sets display:flex
    await expect(page.locator('#player-nav')).toBeVisible();
    await expect(page.locator('#player-nav a').first()).toBeVisible();
  });

  test('clicking .nav-toggle again closes the nav', async ({ page }) => {
    await page.goto('/index.html');
    const toggle = page.locator('.nav-toggle');
    await toggle.click(); // open
    await toggle.click(); // close
    await expect(page.locator('#player-nav')).toBeHidden();
  });

});

test.describe('Nav toggle visible at intermediate widths (641–900px)', () => {

  test('.nav-toggle is visible at 800px viewport', async ({ page }) => {
    // 13 nav items overflow the header at 641–900px — hamburger must show in this range.
    await page.setViewportSize({ width: 800, height: 800 });
    await page.goto('/index.html');
    await expect(page.locator('.nav-toggle')).toBeVisible();
  });

});

test.describe('Nav toggle hidden at desktop', () => {

  test('.nav-toggle is not visible at 1280px viewport', async ({ page }) => {
    // At desktop width (>900px), CSS sets .nav-toggle { display: none }.
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/index.html');
    await expect(page.locator('.nav-toggle')).toBeHidden();
  });

});

// ── SUBDIRECTORY PATH TESTS ───────────────────────────────────────────────────
//
// player-nav.js detects the current directory and sets:
//   b = '../'  for pages in hunters/, missions/, reports/
//   b = ''     for root-level pages
//
// Root-targeted links (Feed, Contacts, The Lab, etc.) must include '../' from
// subdirectory pages so they don't produce 404s. Links that already have a
// subdir prefix (Missions → missions/missions.html) must also resolve correctly.

test.describe('Nav subdirectory paths — hunters/', () => {

  test('all nav labels present on hunters/reed.html', async ({ page }) => {
    // Silence D1 API calls so test focuses on nav, not hunter data
    await page.route('**/api/v1/**', r => r.fulfill({ json: null }));
    await page.goto('/hunters/reed.html');
    const nav = page.locator('#player-nav');
    await expect(nav).toBeVisible();
    for (const label of NAV_LABELS) {
      await expect(nav.getByText(label, { exact: true })).toBeVisible();
    }
  });

  test('Feed link on hunters/reed.html uses ../ prefix', async ({ page }) => {
    await page.route('**/api/v1/**', r => r.fulfill({ json: null }));
    await page.goto('/hunters/reed.html');
    const feedLink = page.locator('#player-nav a').filter({ hasText: 'Feed' });
    await expect(feedLink).toHaveAttribute('href', '../feed.html');
  });

  test('Contacts link on hunters/reed.html uses ../ prefix', async ({ page }) => {
    await page.route('**/api/v1/**', r => r.fulfill({ json: null }));
    await page.goto('/hunters/reed.html');
    const link = page.locator('#player-nav a').filter({ hasText: 'Contacts' });
    await expect(link).toHaveAttribute('href', '../contacts.html');
  });

  test('Missions link on hunters/reed.html resolves to ../missions/missions.html', async ({ page }) => {
    await page.route('**/api/v1/**', r => r.fulfill({ json: null }));
    await page.goto('/hunters/reed.html');
    const link = page.locator('#player-nav a').filter({ hasText: 'Missions' });
    await expect(link).toHaveAttribute('href', '../missions/missions.html');
  });

});

test.describe('Nav subdirectory paths — missions/', () => {

  test('all nav labels present on missions/missions.html', async ({ page }) => {
    await page.route('**/api/v1/**', r => r.fulfill({ json: [] }));
    await page.goto('/missions/missions.html');
    await page.waitForLoadState('networkidle');
    const nav = page.locator('#player-nav');
    await expect(nav).toBeVisible();
    for (const label of NAV_LABELS) {
      await expect(nav.getByText(label, { exact: true })).toBeVisible();
    }
  });

  test('Feed link on missions/missions.html uses ../ prefix', async ({ page }) => {
    await page.route('**/api/v1/**', r => r.fulfill({ json: [] }));
    await page.goto('/missions/missions.html');
    await page.waitForLoadState('networkidle');
    const link = page.locator('#player-nav a').filter({ hasText: 'Feed' });
    await expect(link).toHaveAttribute('href', '../feed.html');
  });

  test('Report link on missions/missions.html resolves to ../reports/player-report.html', async ({ page }) => {
    await page.route('**/api/v1/**', r => r.fulfill({ json: [] }));
    await page.goto('/missions/missions.html');
    await page.waitForLoadState('networkidle');
    const link = page.locator('#player-nav a').filter({ hasText: 'Report' });
    await expect(link).toHaveAttribute('href', '../reports/player-report.html');
  });

});

test.describe('Nav subdirectory paths — reports/', () => {

  test('all nav labels present on reports/player-report.html', async ({ page }) => {
    await page.route('**/api/v1/**', r => r.fulfill({ json: null }));
    await page.goto('/reports/player-report.html');
    const nav = page.locator('#player-nav');
    await expect(nav).toBeVisible();
    for (const label of NAV_LABELS) {
      await expect(nav.getByText(label, { exact: true })).toBeVisible();
    }
  });

  test('Feed link on reports/player-report.html uses ../ prefix', async ({ page }) => {
    await page.route('**/api/v1/**', r => r.fulfill({ json: null }));
    await page.goto('/reports/player-report.html');
    const link = page.locator('#player-nav a').filter({ hasText: 'Feed' });
    await expect(link).toHaveAttribute('href', '../feed.html');
  });

  test('Incidents link on reports/player-report.html uses ../ prefix', async ({ page }) => {
    await page.route('**/api/v1/**', r => r.fulfill({ json: null }));
    await page.goto('/reports/player-report.html');
    const link = page.locator('#player-nav a').filter({ hasText: 'Incidents' });
    await expect(link).toHaveAttribute('href', '../lab-incidents.html');
  });

});

test.describe('Nav root paths — no ../ prefix', () => {

  test('Feed link on index.html does NOT use ../ prefix', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    const link = page.locator('#player-nav a').filter({ hasText: 'Feed' });
    await expect(link).toHaveAttribute('href', 'feed.html');
  });

  test('Contacts link on index.html does NOT use ../ prefix', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    const link = page.locator('#player-nav a').filter({ hasText: 'Contacts' });
    await expect(link).toHaveAttribute('href', 'contacts.html');
  });

});

// ── NAV 404 LINK CHECKS ───────────────────────────────────────────────────────
//
// Verify that every unique page reachable via player nav actually exists and
// returns HTTP 200. Anchor-only variants (index.html#sessions etc.) are
// deduplicated to their base page.

test.describe('Nav 404 link checks', () => {

  // Unique HTML pages reachable from the player nav (anchors stripped, deduped).
  // Matches the hrefs in player-nav.js as seen from a root-level page.
  const NAV_PAGES = [
    'index.html',
    'campbell-logs.html',
    'missions/missions.html',
    'evidence.html',
    'contacts.html',
    'reports/player-report.html',
    'missions/campbell-briefings.html',
    'lab-incidents.html',
    'feed.html',
  ];

  for (const path of NAV_PAGES) {
    test(`${path} returns HTTP 200`, async ({ request }) => {
      const response = await request.get('/' + path);
      expect(response.status()).toBe(200);
    });
  }

});
