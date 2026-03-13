// nav.spec.js — Verifies that player-nav.js injects navigation links correctly.
// The nav is entirely dynamically created — there are no hardcoded <a> tags in
// the HTML source. These tests confirm that the injection script runs successfully
// and produces the expected links on multiple pages.
//
// Also tests the mobile hamburger toggle injected by player-nav.js:
// .nav-toggle appears at ≤640px (CSS media query), clicking it opens the nav.

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
    // player-nav.js injects a .nav-toggle button. CSS shows it only at ≤640px.
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

test.describe('Nav toggle hidden at desktop', () => {

  test('.nav-toggle is not visible at 1280px viewport', async ({ page }) => {
    // At desktop width (>640px), CSS sets .nav-toggle { display: none }.
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/index.html');
    await expect(page.locator('.nav-toggle')).toBeHidden();
  });

});
