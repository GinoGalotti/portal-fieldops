// report.spec.js — Tests for missions/report.html (Keeper Field Report).
//
// Coverage:
//   - Session tabs render (S01, S02, S03 — driven by /data/report-schema.json)
//   - First tab is active by default
//   - Switching tabs changes active tab and updates session title
//   - SAVE REPORT buttons (top + bottom) are present
//   - COPY FOR CLAUDE button is present
//   - Outcome buttons render and toggling one marks it active
//   - Scene textareas render for the active session
//   - Thread tags render for the active session
//   - SAVE triggers PUT to D1 and shows save feedback
//   - Canon slots render for S03 with correct category badges
//   - Sessions with no canon_slots show the empty placeholder message
//
// D1 calls are mocked. /data/report-schema.json is served by wrangler pages dev
// (static file — no mock needed).

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

  test('session tabs render for S01, S02, and S03', async ({ page }) => {
    await gotoReport(page);
    await expect(page.locator('.stab[data-sid="S01"]')).toBeVisible();
    await expect(page.locator('.stab[data-sid="S02"]')).toBeVisible();
    await expect(page.locator('.stab[data-sid="S03"]')).toBeVisible();
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

// ── S03 TAB ────────────────────────────────────────────────────────────────────

test.describe('missions/report.html — S03 tab', () => {

  async function gotoS03(page) {
    await mockReportApis(page);
    await page.goto('/missions/report.html');
    await page.waitForLoadState('networkidle');
    await page.locator('.stab[data-sid="S03"]').click();
    await page.waitForLoadState('networkidle');
  }

  test('S03 tab is active after clicking it', async ({ page }) => {
    await gotoS03(page);
    await expect(page.locator('.stab[data-sid="S03"]')).toHaveClass(/active/);
  });

  test('session title updates to S03 subtitle', async ({ page }) => {
    await gotoS03(page);
    await expect(page.locator('#session-title')).toContainText('The Understudies');
  });

  test('S03 scene textareas render (investigation, mesa-confrontation, climax-resolution)', async ({ page }) => {
    await gotoS03(page);
    await expect(page.locator('[data-scene="investigation"]')).toBeVisible();
    await expect(page.locator('[data-scene="mesa-confrontation"]')).toBeVisible();
    await expect(page.locator('[data-scene="climax-resolution"]')).toBeVisible();
  });

  test('S03 thread tags include MESA and THE UNDERSTUDIES entries', async ({ page }) => {
    await gotoS03(page);
    // Thread tags are rendered from keeper_threads — spot-check two S03-specific ones
    const tags = page.locator('.thread-tag');
    const count = await tags.count();
    expect(count).toBeGreaterThan(0);
    // Check that the container includes S03-specific thread text
    const threadContainer = page.locator('#threads-container');
    await expect(threadContainer).toContainText('M.E.S.A. INVESTIGATION');
    await expect(threadContainer).toContainText('THE UNDERSTUDIES — MERIDIAN THEATRE');
  });

});

// ── CANON SLOTS ────────────────────────────────────────────────────────────────

test.describe('missions/report.html — canon slots', () => {

  test('S01 shows the empty canon placeholder (no slots defined)', async ({ page }) => {
    await gotoReport(page);
    await expect(page.locator('#canon-container .canon-empty')).toBeVisible();
    await expect(page.locator('#canon-container .canon-empty')).toContainText('No open canon slots');
  });

  test('S03 renders 6 canon slot textareas', async ({ page }) => {
    await mockReportApis(page);
    await page.goto('/missions/report.html');
    await page.waitForLoadState('networkidle');
    await page.locator('.stab[data-sid="S03"]').click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#canon-container [data-canon]')).toHaveCount(6);
  });

  test('S03 canon slots include GADGET, TEXTURE, and THEORY category badges', async ({ page }) => {
    await mockReportApis(page);
    await page.goto('/missions/report.html');
    await page.waitForLoadState('networkidle');
    await page.locator('.stab[data-sid="S03"]').click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.canon-tag--gadget').first()).toBeVisible();
    await expect(page.locator('.canon-tag--texture').first()).toBeVisible();
    await expect(page.locator('.canon-tag--theory').first()).toBeVisible();
  });

  test('S03 canon slot for bim-scanner-design is present', async ({ page }) => {
    await mockReportApis(page);
    await page.goto('/missions/report.html');
    await page.waitForLoadState('networkidle');
    await page.locator('.stab[data-sid="S03"]').click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-canon="bim-scanner-design"]')).toBeVisible();
  });

  test('typing into a canon slot textarea is possible', async ({ page }) => {
    await mockReportApis(page);
    await page.goto('/missions/report.html');
    await page.waitForLoadState('networkidle');
    await page.locator('.stab[data-sid="S03"]').click();
    await page.waitForLoadState('networkidle');
    const ta = page.locator('[data-canon="bim-scanner-design"]');
    await ta.fill('Rex called it the Harmonic Resonance Detector — a modified geiger counter with a custom frequency dial.');
    await expect(ta).toHaveValue('Rex called it the Harmonic Resonance Detector — a modified geiger counter with a custom frequency dial.');
  });

  test('canon slot hint text is visible', async ({ page }) => {
    await mockReportApis(page);
    await page.goto('/missions/report.html');
    await page.waitForLoadState('networkidle');
    await page.locator('.stab[data-sid="S03"]').click();
    await page.waitForLoadState('networkidle');
    // Each slot renders a .canon-hint with the prompt text
    const hints = page.locator('.canon-hint');
    await expect(hints.first()).toBeVisible();
    const count = await hints.count();
    expect(count).toBe(6);
  });

  test('switching from S03 back to S01 restores empty canon placeholder', async ({ page }) => {
    await mockReportApis(page);
    await page.goto('/missions/report.html');
    await page.waitForLoadState('networkidle');
    await page.locator('.stab[data-sid="S03"]').click();
    await page.waitForLoadState('networkidle');
    await page.locator('.stab[data-sid="S01"]').click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#canon-container .canon-empty')).toBeVisible();
  });

});
