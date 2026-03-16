// player-report-visibility.spec.js — Tests for the keeper-controlled
// per-week visibility toggle on reports/player-report.html and missions/report.html.
//
// ARCHITECTURE NOTES:
// - GET /api/v1/player-reports/{week}/visibility → { week, enabled: bool }
//   No row in D1 = default enabled (backwards compat for W01/W02).
// - PUT /api/v1/player-reports/{week}/visibility { enabled: bool }
// - Player page: checkVisAndLoad() fetches visibility before unlocking form.
//   If disabled: #locked-banner shows, #form-body stays hidden, save disabled.
//   If enabled: normal unlock flow (loadCurrent() fires, form shows).
//   visCache keyed by week — cleared between test cases.
// - Keeper page: loadVisibility(sid) on tab switch + boot.
//   #btn-vis-toggle shows "// OPEN" (enabled) or "// LOCKED" (disabled).
//   Click → optimistic toggle + PUT to D1.

import { test, expect } from '@playwright/test';

// ── HELPERS ───────────────────────────────────────────────────────────────────

function clearPlayerReportStorage(page) {
  return page.addInitScript(() => {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith('portal_player_report_'))
        .forEach(k => localStorage.removeItem(k));
    } catch (e) {}
  });
}

async function mockReportSchema(page) {
  // Let report-schema.json through normally (served by wrangler pages dev)
}

async function mockVisibility(page, weekStates) {
  // weekStates: { W01: true, W02: true, W03: false } etc.
  await page.route('**/api/v1/player-reports/*/visibility', async route => {
    const url  = route.request().url();
    const week = url.match(/player-reports\/(\w+)\/visibility/)?.[1];
    if (route.request().method() === 'PUT') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    }
    const enabled = week && weekStates[week] !== undefined ? weekStates[week] : true;
    return route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ week, enabled })
    });
  });
}

async function mockPlayerStateApi(page) {
  await page.route('**/api/v1/player-reports/**', async route => {
    const url = route.request().url();
    if (url.includes('/visibility')) return route.fallback(); // let mockVisibility handle it
    if (route.request().method() === 'PUT') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    }
    return route.fulfill({ contentType: 'application/json', body: '{}' });
  });
}

async function mockKeeperReportApi(page) {
  await page.route('**/api/v1/reports/**', async route => {
    return route.fulfill({ contentType: 'application/json', body: '{}' });
  });
}

// ── PLAYER PAGE — LOCKED WEEK ──────────────────────────────────────────────────

test.describe('Player report visibility — locked week', () => {

  test.beforeEach(async ({ page }) => {
    clearPlayerReportStorage(page);
    await mockVisibility(page, { W01: true, W02: true, W03: false });
    await mockPlayerStateApi(page);
    await mockKeeperReportApi(page);
    await page.goto('/reports/player-report.html');
    await page.waitForLoadState('networkidle');
  });

  test('locked W03 + hunter: #locked-banner is visible', async ({ page }) => {
    await page.locator('[data-week="W03"]').click();
    await page.locator('[data-hunter="reed"]').click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#locked-banner')).toHaveClass(/visible/);
  });

  test('locked W03: #form-body does NOT have .unlocked', async ({ page }) => {
    await page.locator('[data-week="W03"]').click();
    await page.locator('[data-hunter="reed"]').click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#form-body')).not.toHaveClass(/unlocked/);
  });

  test('locked W03: save button is disabled', async ({ page }) => {
    await page.locator('[data-week="W03"]').click();
    await page.locator('[data-hunter="reed"]').click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#btn-save-bottom')).toBeDisabled();
  });

  test('locked W03: banner contains ACCESS RESTRICTED text', async ({ page }) => {
    await page.locator('[data-week="W03"]').click();
    await page.locator('[data-hunter="reed"]').click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#locked-banner')).toContainText('ACCESS RESTRICTED');
  });

});

// ── PLAYER PAGE — UNLOCKED WEEK ────────────────────────────────────────────────

test.describe('Player report visibility — unlocked week', () => {

  test.beforeEach(async ({ page }) => {
    clearPlayerReportStorage(page);
    await mockVisibility(page, { W01: true, W02: true, W03: true });
    await mockPlayerStateApi(page);
    await mockKeeperReportApi(page);
    await page.goto('/reports/player-report.html');
    await page.waitForLoadState('networkidle');
  });

  test('enabled W03 + hunter: form unlocks', async ({ page }) => {
    await page.locator('[data-week="W03"]').click();
    await page.locator('[data-hunter="reed"]').click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#form-body')).toHaveClass(/unlocked/);
  });

  test('enabled W03: #locked-banner is NOT visible', async ({ page }) => {
    await page.locator('[data-week="W03"]').click();
    await page.locator('[data-hunter="reed"]').click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#locked-banner')).not.toHaveClass(/visible/);
  });

  test('enabled W03: save button is enabled', async ({ page }) => {
    await page.locator('[data-week="W03"]').click();
    await page.locator('[data-hunter="reed"]').click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#btn-save-bottom')).toBeEnabled();
  });

});

// ── PLAYER PAGE — WEEK SWITCH ─────────────────────────────────────────────────

test.describe('Player report visibility — week switch', () => {

  test('switching from locked W03 to enabled W01 hides banner and unlocks form', async ({ page }) => {
    clearPlayerReportStorage(page);
    await mockVisibility(page, { W01: true, W02: true, W03: false });
    await mockPlayerStateApi(page);
    await mockKeeperReportApi(page);
    await page.goto('/reports/player-report.html');
    await page.waitForLoadState('networkidle');

    // Select W03 + hunter — locked
    await page.locator('[data-week="W03"]').click();
    await page.locator('[data-hunter="reed"]').click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#locked-banner')).toHaveClass(/visible/);

    // Switch to W01 — unlocked
    await page.locator('[data-week="W01"]').click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#locked-banner')).not.toHaveClass(/visible/);
    await expect(page.locator('#form-body')).toHaveClass(/unlocked/);
  });

});

// ── PLAYER PAGE — API FAILURE (FAIL-OPEN) ─────────────────────────────────────

test.describe('Player report visibility — API failure is fail-open', () => {

  test('visibility endpoint 500 → form unlocks (fail-open)', async ({ page }) => {
    clearPlayerReportStorage(page);
    await page.route('**/api/v1/player-reports/*/visibility', async route => {
      return route.fulfill({ status: 500, body: 'Internal Server Error' });
    });
    await mockPlayerStateApi(page);
    await mockKeeperReportApi(page);
    await page.goto('/reports/player-report.html');
    await page.waitForLoadState('networkidle');

    await page.locator('[data-week="W03"]').click();
    await page.locator('[data-hunter="reed"]').click();
    await page.waitForLoadState('networkidle');

    // Fail-open: form unlocks even when visibility API fails
    await expect(page.locator('#form-body')).toHaveClass(/unlocked/);
    await expect(page.locator('#locked-banner')).not.toHaveClass(/visible/);
  });

});

// ── KEEPER PAGE — VISIBILITY TOGGLE ───────────────────────────────────────────

async function mockKeeperApis(page, weekStates) {
  // Visibility endpoint
  await page.route('**/api/v1/player-reports/*/visibility', async route => {
    const url  = route.request().url();
    const week = url.match(/player-reports\/(\w+)\/visibility/)?.[1];
    if (route.request().method() === 'PUT') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    }
    const enabled = week && weekStates[week] !== undefined ? weekStates[week] : true;
    return route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ week, enabled })
    });
  });
  // Keeper report state
  await page.route('**/api/v1/reports/**', async route => {
    return route.fulfill({ contentType: 'application/json', body: '{}' });
  });
  // Player reports (operative view)
  await page.route('**/api/v1/player-reports/**', async route => {
    if (route.request().url().includes('/visibility')) return route.fallback();
    return route.fulfill({ contentType: 'application/json', body: '{}' });
  });
  // Session active
  await page.route('**/api/v1/session/active', async route => {
    return route.fulfill({ contentType: 'application/json', body: '{"session_id":"S01"}' });
  });
}

test.describe('Keeper report — visibility toggle button', () => {

  test('S01 (enabled): #btn-vis-toggle shows "// OPEN"', async ({ page }) => {
    await mockKeeperApis(page, { W01: true });
    await page.goto('/missions/report.html');
    await page.waitForLoadState('networkidle');
    const btn = page.locator('#btn-vis-toggle');
    await expect(btn).toHaveClass(/enabled/);
    await expect(btn).toHaveText('// OPEN');
  });

  test('S01 with W01 locked: #btn-vis-toggle shows "// LOCKED"', async ({ page }) => {
    await mockKeeperApis(page, { W01: false });
    await page.goto('/missions/report.html');
    await page.waitForLoadState('networkidle');
    const btn = page.locator('#btn-vis-toggle');
    await expect(btn).toHaveClass(/disabled/);
    await expect(btn).toHaveText('// LOCKED');
  });

  test('clicking toggle (enabled → disabled) switches button to "// LOCKED"', async ({ page }) => {
    const puts = [];
    await page.route('**/api/v1/player-reports/*/visibility', async route => {
      const url  = route.request().url();
      const week = url.match(/player-reports\/(\w+)\/visibility/)?.[1];
      if (route.request().method() === 'PUT') {
        const body = await route.request().postDataJSON();
        puts.push({ week, body });
        return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
      }
      return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ week, enabled: true }) });
    });
    await page.route('**/api/v1/reports/**', async route => {
      return route.fulfill({ contentType: 'application/json', body: '{}' });
    });
    await page.route('**/api/v1/player-reports/**', async route => {
      if (route.request().url().includes('/visibility')) return route.fallback();
      return route.fulfill({ contentType: 'application/json', body: '{}' });
    });
    await page.route('**/api/v1/session/active', async route => {
      return route.fulfill({ contentType: 'application/json', body: '{"session_id":"S01"}' });
    });
    await page.goto('/missions/report.html');
    await page.waitForLoadState('networkidle');

    const btn = page.locator('#btn-vis-toggle');
    await expect(btn).toHaveText('// OPEN');
    await btn.click();
    await expect(btn).toHaveText('// LOCKED');
    await expect(btn).toHaveClass(/disabled/);
    // PUT should have fired with enabled:false
    await page.waitForTimeout(200);
    expect(puts.length).toBeGreaterThanOrEqual(1);
    expect(puts[0].body.enabled).toBe(false);
  });

  test('clicking toggle (disabled → enabled) switches button to "// OPEN"', async ({ page }) => {
    await mockKeeperApis(page, { W01: false });
    await page.goto('/missions/report.html');
    await page.waitForLoadState('networkidle');

    const btn = page.locator('#btn-vis-toggle');
    await expect(btn).toHaveText('// LOCKED');
    await btn.click();
    await expect(btn).toHaveText('// OPEN');
    await expect(btn).toHaveClass(/enabled/);
  });

});
