// nav.spec.js — Verifies that player-nav.js injects navigation links correctly.
// The nav is entirely dynamically created — there are no hardcoded <a> tags in
// the HTML source. These tests confirm that the injection script runs successfully
// and produces the expected links on multiple pages.

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
