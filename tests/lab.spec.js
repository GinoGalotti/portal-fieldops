// lab.spec.js — Tests for the-lab.html data-driven moves and assets.
//
// Moves and assets are rendered from data/motw-teambooks.json at page load.
// The mandatory asset (asset-the-lab) must be pre-checked and unclikable.
// All other check-items are toggle-able via click.
//
// DATA-DRIVEN DESIGN: Move and asset counts, keys, and names derive from
// the JSON. Never hardcode values that come from motw-teambooks.json.

import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const teambooksData = JSON.parse(readFileSync(resolve('./data/motw-teambooks.json'), 'utf-8'));
const lab = teambooksData.team_playbooks.find(p => p.id === 'research-lab');

const expectedMoveCount = lab.moves.length;
const expectedAssetCount = 1 + lab.assets.pick_one.length; // mandatory + all pick-one

// ── Moves render ──────────────────────────────────────────────────────────────

test.describe('the-lab.html — moves render', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/the-lab.html');
    await page.waitForLoadState('networkidle');
  });

  test('#moves-list is non-empty after networkidle', async ({ page }) => {
    await expect(page.locator('#moves-list')).not.toBeEmpty();
  });

  test('correct total move item count from JSON', async ({ page }) => {
    await expect(page.locator('#moves-list .check-item')).toHaveCount(expectedMoveCount);
  });

  test('each move has the expected data-check-key', async ({ page }) => {
    for (const move of lab.moves) {
      const expectedKey = 'move-' + move.id.replace('rl-', '');
      await expect(page.locator('#moves-list [data-check-key="' + expectedKey + '"]')).toBeAttached();
    }
  });

  test('move items have .check-box and strong name in .check-text', async ({ page }) => {
    const items = page.locator('#moves-list .check-item');
    const count = await items.count();
    for (let i = 0; i < count; i++) {
      await expect(items.nth(i).locator('.check-box')).toBeAttached();
      await expect(items.nth(i).locator('.check-text strong')).toBeAttached();
    }
  });

  test('move items have .check-subtext description', async ({ page }) => {
    const items = page.locator('#moves-list .check-item');
    const count = await items.count();
    for (let i = 0; i < count; i++) {
      await expect(items.nth(i).locator('.check-subtext')).toBeAttached();
    }
  });

});

// ── Assets render ─────────────────────────────────────────────────────────────

test.describe('the-lab.html — assets render', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/the-lab.html');
    await page.waitForLoadState('networkidle');
  });

  test('#assets-list is non-empty after networkidle', async ({ page }) => {
    await expect(page.locator('#assets-list')).not.toBeEmpty();
  });

  test('correct total asset item count (mandatory + all pick-one)', async ({ page }) => {
    await expect(page.locator('#assets-list .check-item')).toHaveCount(expectedAssetCount);
  });

  test('mandatory asset has .checked class pre-applied', async ({ page }) => {
    await expect(page.locator('[data-check-key="asset-the-lab"]')).toHaveClass(/checked/);
  });

  test('each pick-one asset has correct data-check-key', async ({ page }) => {
    for (const asset of lab.assets.pick_one) {
      const expectedKey = 'asset-' + asset.id.replace('rl-asset-', '');
      await expect(page.locator('#assets-list [data-check-key="' + expectedKey + '"]')).toBeAttached();
    }
  });

});

// ── Interactivity ─────────────────────────────────────────────────────────────

test.describe('the-lab.html — check-item interactivity', () => {

  test.beforeEach(async ({ page }) => {
    // Mock D1 GET to return empty state so no saved hiddenLists or checks interfere
    await page.route('**/api/v1/team/playbook', route => {
      if (route.request().method() === 'GET') {
        route.fulfill({ json: {} });
      } else {
        route.fulfill({ status: 200, body: '{}' });
      }
    });
    // Clear localStorage before page load
    await page.addInitScript(() => { localStorage.removeItem('portal_lab_playbook'); });
    await page.goto('/the-lab.html');
    await page.waitForLoadState('networkidle');
  });

  test('clicking mandatory asset does not remove .checked', async ({ page }) => {
    const mandatory = page.locator('[data-check-key="asset-the-lab"]');
    await expect(mandatory).toHaveClass(/checked/);
    await mandatory.click();
    await expect(mandatory).toHaveClass(/checked/);
  });

  test('clicking a non-mandatory asset toggles .checked on and off', async ({ page }) => {
    const sensorArray = page.locator('[data-check-key="asset-sensor-array"]');
    // Fresh state — should be unchecked
    await expect(sensorArray).not.toHaveClass(/checked/);
    await sensorArray.click();
    await expect(sensorArray).toHaveClass(/checked/);
    await sensorArray.click();
    await expect(sensorArray).not.toHaveClass(/checked/);
  });

  test('clicking a move item toggles .checked on and off', async ({ page }) => {
    const moveItem = page.locator('[data-check-key="move-scientific-method"]');
    // Fresh state — should be unchecked
    await expect(moveItem).not.toHaveClass(/checked/);
    await moveItem.click();
    await expect(moveItem).toHaveClass(/checked/);
    await moveItem.click();
    await expect(moveItem).not.toHaveClass(/checked/);
  });

});
