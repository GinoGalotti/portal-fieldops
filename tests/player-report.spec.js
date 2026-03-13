// player-report.spec.js — Tests for reports/player-report.html.
//
// ARCHITECTURE NOTES (read before editing):
// - The page has two selector rows: week (#week-selector) and hunter
//   (#hunter-selector). Both must be selected to unlock #form-body.
// - Weeks (WEEKS) and hunters (HUNTERS) are hardcoded in the page JS.
// - Rating pips: .rating-pip[data-rating][data-val]. 5 pips per category
//   × 5 categories = 25 total. Clicking a pip selects it (.selected) and
//   deselects any other pip in the same category.
// - Save: #btn-save-bottom, initially disabled. On click: text → "// SAVING…",
//   then #bottom-flash shows "✓ FILED" (or "⚠ ERROR" on failure).
// - API: GET/PUT /api/v1/player-reports/{week}/{hunter}/state — mocked here
//   to return {} (empty state) so the form starts blank.

import { test, expect } from '@playwright/test';

// ── MOCK HELPER ───────────────────────────────────────────────────────────────

// Intercepts all player-report D1 calls. GET returns {}, PUT returns 200.
async function mockPlayerReportApi(page) {
  await page.route('**/api/v1/player-reports/**', async route => {
    if (route.request().method() === 'PUT') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    }
    return route.fulfill({ contentType: 'application/json', body: '{}' });
  });
}

function clearPlayerReportStorage(page) {
  return page.addInitScript(() => {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith('portal_player_report_'))
        .forEach(k => localStorage.removeItem(k));
    } catch (e) {}
  });
}

// ── SELECTORS ─────────────────────────────────────────────────────────────────

test.describe('Player report — selectors', () => {

  test.beforeEach(async ({ page }) => {
    clearPlayerReportStorage(page);
    await mockPlayerReportApi(page);
    await page.goto('/reports/player-report.html');
    await page.waitForLoadState('networkidle');
  });

  test('week selector buttons render (at least W01)', async ({ page }) => {
    const weekBtns = page.locator('#week-selector .sel-btn');
    await expect(weekBtns.first()).toBeVisible();
    // W01 must be present
    await expect(page.locator('[data-week="W01"]')).toBeVisible();
  });

  test('hunter selector buttons render (Reed, Rex, Alan, Sven, John)', async ({ page }) => {
    const hunterBtns = page.locator('#hunter-selector .sel-btn');
    await expect(hunterBtns.first()).toBeVisible();
    // Spot-check a few hunters
    await expect(page.locator('[data-hunter="reed"]')).toBeVisible();
    await expect(page.locator('[data-hunter="rex"]')).toBeVisible();
    await expect(page.locator('[data-hunter="alan"]')).toBeVisible();
  });

  test('form is not visible before selection (#form-body lacks .unlocked)', async ({ page }) => {
    await expect(page.locator('#form-body')).not.toHaveClass(/unlocked/);
  });

  test('clicking W01 then Reed unlocks the form (#form-body gets .unlocked)', async ({ page }) => {
    await page.locator('[data-week="W01"]').click();
    await page.locator('[data-hunter="reed"]').click();
    await expect(page.locator('#form-body')).toHaveClass(/unlocked/);
  });

  test('#selection-summary updates text after both week and hunter are selected', async ({ page }) => {
    await page.locator('[data-week="W01"]').click();
    await page.locator('[data-hunter="reed"]').click();
    // JS writes "Filing as <hunter> · <week> — <subtitle>"
    const summary = page.locator('#selection-summary');
    await expect(summary).toContainText('Reed Atwood');
    await expect(summary).toContainText('Week 01');
  });

  test('selecting only a week does not unlock the form', async ({ page }) => {
    await page.locator('[data-week="W01"]').click();
    await expect(page.locator('#form-body')).not.toHaveClass(/unlocked/);
  });

  test('selecting only a hunter does not unlock the form', async ({ page }) => {
    await page.locator('[data-hunter="reed"]').click();
    await expect(page.locator('#form-body')).not.toHaveClass(/unlocked/);
  });

});

// ── RATING PIPS ───────────────────────────────────────────────────────────────

test.describe('Player report — rating pips', () => {

  test.beforeEach(async ({ page }) => {
    clearPlayerReportStorage(page);
    await mockPlayerReportApi(page);
    await page.goto('/reports/player-report.html');
    await page.waitForLoadState('networkidle');
    // Unlock form to see ratings
    await page.locator('[data-week="W01"]').click();
    await page.locator('[data-hunter="reed"]').click();
    // Wait for API call to resolve so applyState() finishes
    await page.waitForLoadState('networkidle');
  });

  test('each rating category has exactly 5 pips', async ({ page }) => {
    // 5 categories × 5 pips = 25 total .rating-pip elements
    await expect(page.locator('.rating-pip')).toHaveCount(25);
  });

  test('clicking pip 3 on "story" marks it .selected', async ({ page }) => {
    const storyPip3 = page.locator('.rating-pip[data-rating="story"][data-val="3"]');
    await expect(storyPip3).not.toHaveClass(/selected/);
    await storyPip3.click();
    await expect(storyPip3).toHaveClass(/selected/);
  });

  test('clicking pip 4 moves selection from pip 3 to pip 4', async ({ page }) => {
    const storyPip3 = page.locator('.rating-pip[data-rating="story"][data-val="3"]');
    const storyPip4 = page.locator('.rating-pip[data-rating="story"][data-val="4"]');
    await storyPip3.click();
    await expect(storyPip3).toHaveClass(/selected/);
    await storyPip4.click();
    await expect(storyPip4).toHaveClass(/selected/);
    await expect(storyPip3).not.toHaveClass(/selected/);
  });

  test('clicking an already-selected pip deselects it (toggle)', async ({ page }) => {
    const storyPip3 = page.locator('.rating-pip[data-rating="story"][data-val="3"]');
    await storyPip3.click();
    await expect(storyPip3).toHaveClass(/selected/);
    await storyPip3.click(); // clicking again deselects
    await expect(storyPip3).not.toHaveClass(/selected/);
  });

});

// ── TEXTAREAS ─────────────────────────────────────────────────────────────────

test.describe('Player report — textareas', () => {

  test.beforeEach(async ({ page }) => {
    clearPlayerReportStorage(page);
    await mockPlayerReportApi(page);
    await page.goto('/reports/player-report.html');
    await page.waitForLoadState('networkidle');
    await page.locator('[data-week="W01"]').click();
    await page.locator('[data-hunter="reed"]').click();
    await page.waitForLoadState('networkidle');
  });

  test('#f-favourite textarea is present and editable', async ({ page }) => {
    const ta = page.locator('#f-favourite');
    await expect(ta).toBeVisible();
    await ta.fill('Best moment of the session.');
    await expect(ta).toHaveValue('Best moment of the session.');
  });

  test('#f-different textarea is present and editable', async ({ page }) => {
    const ta = page.locator('#f-different');
    await expect(ta).toBeVisible();
    await ta.fill('I would have asked for help earlier.');
    await expect(ta).toHaveValue('I would have asked for help earlier.');
  });

  test('scene-specific textareas render ([data-scene] elements)', async ({ page }) => {
    // buildScenes() populates these dynamically for the selected week
    const sceneAreas = page.locator('[data-scene]');
    await expect(sceneAreas.first()).toBeVisible();
  });

});

// ── SAVE BUTTON ───────────────────────────────────────────────────────────────

test.describe('Player report — save button', () => {

  test('#btn-save-bottom is disabled before selection', async ({ page }) => {
    clearPlayerReportStorage(page);
    await mockPlayerReportApi(page);
    await page.goto('/reports/player-report.html');
    await expect(page.locator('#btn-save-bottom')).toBeDisabled();
  });

  test('#btn-save-bottom is enabled after week + hunter selection', async ({ page }) => {
    clearPlayerReportStorage(page);
    await mockPlayerReportApi(page);
    await page.goto('/reports/player-report.html');
    await page.locator('[data-week="W01"]').click();
    await page.locator('[data-hunter="reed"]').click();
    await expect(page.locator('#btn-save-bottom')).toBeEnabled();
  });

  test('clicking save changes button text to "// SAVING…"', async ({ page }) => {
    clearPlayerReportStorage(page);
    await mockPlayerReportApi(page);
    await page.goto('/reports/player-report.html');
    await page.locator('[data-week="W01"]').click();
    await page.locator('[data-hunter="reed"]').click();
    await page.waitForLoadState('networkidle');

    const btn = page.locator('#btn-save-bottom');
    await btn.click();
    await expect(btn).toHaveText('// SAVING…');
  });

  test('after mock PUT resolves OK, flash message shows "✓ FILED"', async ({ page }) => {
    clearPlayerReportStorage(page);
    await mockPlayerReportApi(page);
    await page.goto('/reports/player-report.html');
    await page.locator('[data-week="W01"]').click();
    await page.locator('[data-hunter="reed"]').click();
    await page.waitForLoadState('networkidle');

    await page.locator('#btn-save-bottom').click();

    // saveReport() sets flash.textContent = '✓ FILED' and adds .visible
    await expect(page.locator('#bottom-flash')).toHaveClass(/visible/, { timeout: 4000 });
    await expect(page.locator('#bottom-flash')).toContainText('✓ FILED');
  });

  test('switching week+hunter after save loads fresh state (memCache isolation)', async ({ page }) => {
    clearPlayerReportStorage(page);
    await mockPlayerReportApi(page);
    await page.goto('/reports/player-report.html');

    // Fill W01+Reed
    await page.locator('[data-week="W01"]').click();
    await page.locator('[data-hunter="reed"]').click();
    await page.waitForLoadState('networkidle');
    await page.locator('#f-favourite').fill('Session 01 memory');
    await page.locator('#btn-save-bottom').click();
    await page.locator('#bottom-flash').waitFor({ state: 'visible' });

    // Switch to W01+Rex
    await page.locator('[data-hunter="rex"]').click();
    await page.waitForLoadState('networkidle');

    // Rex's form should start blank (separate memCache key)
    await expect(page.locator('#f-favourite')).toHaveValue('');
  });

});
