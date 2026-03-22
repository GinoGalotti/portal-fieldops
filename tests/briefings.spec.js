// briefings.spec.js — Tests for missions/campbell-briefings.html.
//
// ARCHITECTURE NOTES (read before editing):
// - The page fetches ../data/briefings.json at boot and renders all week tabs
//   plus the content for the initially-active week.
// - Week tabs: .week-tab elements; active tab has .active class.
//   Weeks with status:"active" also have .status-active class.
// - Content area: #briefing-content. Case cards are .briefing elements.
// - Tab switch: JS renders new HTML into #briefing-content and calls
//   history.replaceState() to update the URL hash to #<week-id>.
// - DATA-DRIVEN: source data loaded at module level so assertions stay
//   correct as new weeks/cases are added to briefings.json.

import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const briefingsData = JSON.parse(readFileSync(resolve('./data/briefings.json'), 'utf-8'));
const allWeeks      = briefingsData.weeks;
const firstWeek     = allWeeks[0];

// Count case items per week (items[] can include section-labels, skip those).
function casesForWeek(week) {
  return (week.items || []).filter(i => i.type === 'case');
}

// ── TAB STRUCTURE ─────────────────────────────────────────────────────────────

test.describe('CAMPBELL briefings — tabs', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/missions/campbell-briefings.html');
    await page.waitForLoadState('networkidle');
  });

  test('renders exactly N week tabs derived from briefings.json', async ({ page }) => {
    await expect(page.locator('.week-tab')).toHaveCount(allWeeks.length);
  });

  test('first week tab is active by default', async ({ page }) => {
    // The boot script activates the first week (or hash-matched week).
    // With no URL hash, firstWeek is activated.
    const firstTab = page.locator('.week-tab').first();
    await expect(firstTab).toHaveClass(/\bactive\b/);
  });

  test('weeks with status "active" have .status-active class on their tab', async ({ page }) => {
    for (const week of allWeeks) {
      const tab = page.locator(`.week-tab[data-id="${week.id}"]`);
      if (week.status === 'active') {
        await expect(tab).toHaveClass(/\bstatus-active\b/);
      } else {
        await expect(tab).not.toHaveClass(/status-active/);
      }
    }
  });

  test('clicking a different tab makes it .active and removes .active from others', async ({ page }) => {
    // Click the second tab
    const tabs = page.locator('.week-tab');
    await tabs.nth(1).click();
    await expect(tabs.nth(1)).toHaveClass(/\bactive\b/);
    await expect(tabs.nth(0)).not.toHaveClass(/\bactive\b/);
  });

});

// ── CONTENT ───────────────────────────────────────────────────────────────────

test.describe('CAMPBELL briefings — content', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/missions/campbell-briefings.html');
    await page.waitForLoadState('networkidle');
  });

  test('#briefing-content is visible', async ({ page }) => {
    await expect(page.locator('#briefing-content')).toBeVisible();
  });

  test('default week renders the correct number of case cards', async ({ page }) => {
    const expected = casesForWeek(firstWeek).length;
    await expect(page.locator('#briefing-content .briefing')).toHaveCount(expected);
  });

  test('high-priority case has a .priority-badge.high element', async ({ page }) => {
    // At least one week has a high-priority case — navigate all tabs if needed
    const highCase = allWeeks
      .flatMap(w => casesForWeek(w))
      .find(c => c.priority === 'high');

    if (!highCase) {
      // No high-priority case exists in data — skip gracefully
      test.skip();
      return;
    }

    // Find the tab containing this case and activate it
    const weekForCase = allWeeks.find(w => casesForWeek(w).some(c => c.id === highCase.id));
    await page.locator(`.week-tab[data-id="${weekForCase.id}"]`).click();

    await expect(page.locator('.priority-badge.high')).toBeVisible();
  });

});

// ── WEEK SWITCHING ────────────────────────────────────────────────────────────

test.describe('CAMPBELL briefings — week switching', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/missions/campbell-briefings.html');
    await page.waitForLoadState('networkidle');
  });

  test('clicking the second tab renders the correct number of cases for that week', async ({ page }) => {
    const secondWeek = allWeeks[1];
    await page.locator(`.week-tab[data-id="${secondWeek.id}"]`).click();
    const expected = casesForWeek(secondWeek).length;
    await expect(page.locator('#briefing-content .briefing')).toHaveCount(expected);
  });

  test('switching back to the first tab renders the correct case count again', async ({ page }) => {
    const secondWeek = allWeeks[1];
    await page.locator(`.week-tab[data-id="${secondWeek.id}"]`).click();
    await page.locator(`.week-tab[data-id="${firstWeek.id}"]`).click();
    const expected = casesForWeek(firstWeek).length;
    await expect(page.locator('#briefing-content .briefing')).toHaveCount(expected);
  });

  test('URL hash updates to #<week-id> on tab click', async ({ page }) => {
    const secondWeek = allWeeks[1];
    await page.locator(`.week-tab[data-id="${secondWeek.id}"]`).click();
    // history.replaceState changes the hash in-place
    const url = page.url();
    expect(url).toContain('#' + secondWeek.id);
  });

  test('switching back to first tab updates URL hash to #<first-week-id>', async ({ page }) => {
    // Go to second, then back to first
    await page.locator(`.week-tab[data-id="${allWeeks[1].id}"]`).click();
    await page.locator(`.week-tab[data-id="${firstWeek.id}"]`).click();
    const url = page.url();
    expect(url).toContain('#' + firstWeek.id);
  });

});

// ── DATA-DRIVEN CASE COUNT ────────────────────────────────────────────────────

test.describe('CAMPBELL briefings — data-driven totals', () => {

  test('each week renders exactly the number of cases in briefings.json', async ({ page }) => {
    await page.goto('/missions/campbell-briefings.html');
    await page.waitForLoadState('networkidle');

    for (const week of allWeeks) {
      await page.locator(`.week-tab[data-id="${week.id}"]`).click();
      const expected = casesForWeek(week).length;
      await expect(page.locator('#briefing-content .briefing')).toHaveCount(expected);
    }
  });

});
