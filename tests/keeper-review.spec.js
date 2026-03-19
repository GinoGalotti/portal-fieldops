// keeper-review.spec.js — Tests for reports/keeper-review.html.
//
// ARCHITECTURE NOTES:
// - Page is keeper-facing (keeper.css, no player nav).
// - On load: buildTabs() creates W01 + W02 tabs; W01 auto-loads.
// - loadWeek(week): fires 5 parallel fetches (one per hunter) to
//   GET /api/v1/player-reports/{week}/{hunter}/state.
//   Returns {} for unfiled; returns data object for filed hunters.
// - renderGrid(): renders .op-grid with one .op-card per hunter.
//   Filed cards show .op-filed-badge + rating pips.
//   Unfiled cards show .op-not-filed + no pip rows.
// - filed count bar: "{n} / 5 REPORTS FILED — {week}".
// - Tabs: clicking a .rtab activates it and loads the corresponding week.

import { test, expect } from '@playwright/test';

// One realistic filed report — Reed only.
const MOCK_REED_REPORT = {
  ratings: { story: 4, atmosphere: 3, role: 4, emotion: 5, overall: 4 },
  scenes: { 'eszter-balint': 'The confrontation landed well.', 'portal-directive': '', 'your-moment': '' },
  favourite: 'The moment Reed found the locket.',
  different: '',
  operative: '',
  other: '',
};

// Route helper: fulfils reed with a filed report; all others return {}.
async function mockPlayerReports(page) {
  await page.route('**/api/v1/player-reports/**', async route => {
    const url = route.request().url();
    if (url.includes('/reed/')) return route.fulfill({ json: MOCK_REED_REPORT });
    return route.fulfill({ json: {} });
  });
}

test.describe('keeper-review.html', () => {

  test.beforeEach(async ({ page }) => {
    await page.route('**/api/v1/session/active', route =>
      route.fulfill({ json: { session_id: 'w3' } })
    );
    await mockPlayerReports(page);
    await page.goto('/reports/keeper-review.html');
    await page.waitForLoadState('networkidle');
  });

  // ── PAGE STRUCTURE ──────────────────────────────────────────────────────────

  test('page title contains P.O.R.T.A.L', async ({ page }) => {
    await expect(page).toHaveTitle(/P\.O\.R\.T\.A\.L/i);
  });

  test('two week tabs render (W01 and W02)', async ({ page }) => {
    await expect(page.locator('.rtab', { hasText: 'W01' })).toBeVisible();
    await expect(page.locator('.rtab', { hasText: 'W02' })).toBeVisible();
  });

  test('W01 tab is active by default', async ({ page }) => {
    await expect(page.locator('.rtab.active')).toContainText('W01');
  });

  // ── REPORT GRID (W01 auto-loaded) ───────────────────────────────────────────

  test('.op-grid is visible after W01 auto-loads', async ({ page }) => {
    await expect(page.locator('.op-grid')).toBeVisible();
  });

  test('one .op-card renders per hunter (5 total)', async ({ page }) => {
    await expect(page.locator('.op-card')).toHaveCount(5);
  });

  test('Reed card shows ✓ FILED badge', async ({ page }) => {
    const reedCard = page.locator('.op-card').filter({ hasText: 'Reed Atwood' });
    await expect(reedCard.locator('.op-filed-badge')).toBeVisible();
    await expect(reedCard.locator('.op-filed-badge')).toContainText('FILED');
  });

  test('unfiled hunters (Rex) show NOT FILED label', async ({ page }) => {
    const rexCard = page.locator('.op-card').filter({ hasText: 'Rex Bangley' });
    await expect(rexCard.locator('.op-not-filed')).toBeVisible();
  });

  test('filed count bar shows 1 / 5', async ({ page }) => {
    await expect(page.locator('.op-filed-count')).toContainText('1 / 5');
  });

  test('Reed card has filled rating pips', async ({ page }) => {
    const reedCard = page.locator('.op-card').filter({ hasText: 'Reed Atwood' });
    await expect(reedCard.locator('.op-pip.filled').first()).toBeVisible();
  });

  test('Reed card shows favourite moment text', async ({ page }) => {
    const reedCard = page.locator('.op-card').filter({ hasText: 'Reed Atwood' });
    await expect(reedCard).toContainText('locket');
  });

  // ── TAB SWITCH ───────────────────────────────────────────────────────────────

  test('clicking W02 tab activates it and loads W02 data', async ({ page }) => {
    await page.locator('.rtab', { hasText: 'W02' }).click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.rtab.active')).toContainText('W02');
    // W02 still shows grid (reed report covers both weeks via same mock)
    await expect(page.locator('.op-grid')).toBeVisible();
  });

  test('subtitle updates when switching tabs', async ({ page }) => {
    const subtitle = page.locator('#review-subtitle');
    await expect(subtitle).toContainText('W01');
    await page.locator('.rtab', { hasText: 'W02' }).click();
    await page.waitForLoadState('networkidle');
    await expect(subtitle).toContainText('W02');
  });

});
