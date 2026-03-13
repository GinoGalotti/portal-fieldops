// report.spec.js — Tests for missions/report.html (Keeper Field Report).
//
// Coverage:
//   - Session tabs render (one per SESSIONS key: S01, S02)
//   - First tab is active by default
//   - Switching tabs changes active tab and updates session title
//   - SAVE REPORT buttons (top + bottom) are present
//   - COPY FOR CLAUDE button is present
//   - Outcome buttons render and toggling one marks it active
//   - Scene textareas render for the active session
//   - Thread tags render for the active session
//   - SAVE triggers PUT to D1 and shows save feedback
//
// All D1 calls are mocked — the page's SESSIONS config is the source of truth,
// not an external JSON file, so tests derive expected values directly from the DOM.

import { test, expect } from '@playwright/test';

// ── HELPERS ──────────────────────────────────────────────────────────────────

// Mock D1 report endpoints so tests don't depend on local wrangler state.
async function mockReportApis(page, { state = {} } = {}) {
  await page.route('**/api/v1/reports/**/state', async r => {
    if (r.request().method() === 'PUT') return r.fulfill({ json: { ok: true } });
    return r.fulfill({ json: state });
  });
  // Silence player-report API calls (operative reports section)
  await page.route('**/api/v1/player-reports/**', r => r.fulfill({ json: null }));
}

async function gotoReport(page) {
  await mockReportApis(page);
  await page.goto('/missions/report.html');
  await page.waitForLoadState('networkidle');
}

// ── SESSION TABS ──────────────────────────────────────────────────────────────

test.describe('missions/report.html — session tabs', () => {

  test('session tabs render for S01 and S02', async ({ page }) => {
    await gotoReport(page);
    await expect(page.locator('.stab[data-sid="S01"]')).toBeVisible();
    await expect(page.locator('.stab[data-sid="S02"]')).toBeVisible();
  });

  test('S01 tab is active by default', async ({ page }) => {
    await gotoReport(page);
    await expect(page.locator('.stab[data-sid="S01"]')).toHaveClass(/active/);
    await expect(page.locator('.stab[data-sid="S02"]')).not.toHaveClass(/active/);
  });

  test('session title bar shows S01 title on load', async ({ page }) => {
    await gotoReport(page);
    await expect(page.locator('#session-title')).toContainText('A Promise is a Promise');
  });

  test('clicking S02 tab makes it active and updates title', async ({ page }) => {
    await gotoReport(page);
    await page.locator('.stab[data-sid="S02"]').click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.stab[data-sid="S02"]')).toHaveClass(/active/);
    await expect(page.locator('.stab[data-sid="S01"]')).not.toHaveClass(/active/);
    await expect(page.locator('#session-title')).toContainText('Something That Wants to Be Known');
  });

});

// ── SAVE + COPY BUTTONS ───────────────────────────────────────────────────────

test.describe('missions/report.html — save and copy buttons', () => {

  test('SAVE REPORT button (top) is present', async ({ page }) => {
    await gotoReport(page);
    await expect(page.locator('#btn-save')).toBeVisible();
    await expect(page.locator('#btn-save')).toContainText('SAVE REPORT');
  });

  test('SAVE REPORT button (bottom) is present', async ({ page }) => {
    await gotoReport(page);
    await expect(page.locator('#btn-save-bottom')).toBeVisible();
    await expect(page.locator('#btn-save-bottom')).toContainText('SAVE REPORT');
  });

  test('COPY FOR CLAUDE button is present', async ({ page }) => {
    await gotoReport(page);
    await expect(page.locator('#btn-copy-claude')).toBeVisible();
    await expect(page.locator('#btn-copy-claude')).toContainText('COPY FOR CLAUDE');
  });

  test('clicking SAVE sends PUT to D1 and shows save feedback', async ({ page }) => {
    await gotoReport(page);
    const putPromise = page.waitForResponse(
      r => r.url().includes('/api/v1/reports/') && r.request().method() === 'PUT'
    );
    await page.locator('#btn-save').click();
    await putPromise;
    await expect(page.locator('#save-flash')).toBeVisible();
    await expect(page.locator('#save-flash')).toContainText('SAVED');
  });

});

// ── OUTCOME BUTTONS ───────────────────────────────────────────────────────────

test.describe('missions/report.html — outcome buttons', () => {

  test('all three outcome buttons render', async ({ page }) => {
    await gotoReport(page);
    await expect(page.locator('.outcome-btn[data-outcome="humane"]')).toBeVisible();
    await expect(page.locator('.outcome-btn[data-outcome="partial"]')).toBeVisible();
    await expect(page.locator('.outcome-btn[data-outcome="bad"]')).toBeVisible();
  });

  test('clicking an outcome button marks it active', async ({ page }) => {
    await gotoReport(page);
    const btn = page.locator('.outcome-btn[data-outcome="humane"]');
    await expect(btn).not.toHaveClass(/active/);
    await btn.click();
    await expect(btn).toHaveClass(/active/);
  });

  test('selecting one outcome deactivates the others', async ({ page }) => {
    await gotoReport(page);
    await page.locator('.outcome-btn[data-outcome="humane"]').click();
    await page.locator('.outcome-btn[data-outcome="partial"]').click();
    await expect(page.locator('.outcome-btn[data-outcome="partial"]')).toHaveClass(/active/);
    await expect(page.locator('.outcome-btn[data-outcome="humane"]')).not.toHaveClass(/active/);
  });

});

// ── SCENE TEXTAREAS ───────────────────────────────────────────────────────────

test.describe('missions/report.html — scene textareas', () => {

  test('S01 scene textareas render (eszter-resolution, mesa-keller, bim-usage)', async ({ page }) => {
    await gotoReport(page);
    await expect(page.locator('[data-scene="eszter-resolution"]')).toBeVisible();
    await expect(page.locator('[data-scene="mesa-keller"]')).toBeVisible();
    await expect(page.locator('[data-scene="bim-usage"]')).toBeVisible();
  });

  test('switching to S02 renders S02 scene textareas', async ({ page }) => {
    await gotoReport(page);
    await page.locator('.stab[data-sid="S02"]').click();
    await page.waitForLoadState('networkidle');
    // S02 has its own scene IDs — just assert at least one [data-scene] textarea is present
    await expect(page.locator('[data-scene]').first()).toBeVisible();
  });

});

// ── THREAD TAGS ───────────────────────────────────────────────────────────────

test.describe('missions/report.html — thread tags', () => {

  test('thread tags render for S01', async ({ page }) => {
    await gotoReport(page);
    // S01 threads include PROJECT VEIL, MESA, CAMPBELL, ESZTER, BÁLINT etc.
    await expect(page.locator('.thread-tag').first()).toBeVisible();
    const count = await page.locator('.thread-tag').count();
    expect(count).toBeGreaterThan(0);
  });

  test('clicking a thread tag toggles it active', async ({ page }) => {
    await gotoReport(page);
    const tag = page.locator('.thread-tag').first();
    await expect(tag).not.toHaveClass(/active/);
    await tag.click();
    await expect(tag).toHaveClass(/active/);
    await tag.click();
    await expect(tag).not.toHaveClass(/active/);
  });

});
