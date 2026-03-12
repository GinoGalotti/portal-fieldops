// smoke.spec.js — Basic availability checks for the five key pages.
// These tests verify that each page returns HTTP 200 and contains the
// expected structural landmark element. If any of these fail, something
// is fundamentally broken (wrong base URL, missing file, server not up).

import { test, expect } from '@playwright/test';

test.describe('Smoke tests — pages load without errors', () => {

  test('index.html returns 200 and has a <title>', async ({ page }) => {
    const response = await page.goto('/index.html');
    expect(response.status()).toBe(200);
    // The title element is always in the HTML regardless of JS execution
    await expect(page).toHaveTitle(/P\.O\.R\.T\.A\.L/);
  });

  test('lab-incidents.html returns 200 and has <main>', async ({ page }) => {
    const response = await page.goto('/lab-incidents.html');
    expect(response.status()).toBe(200);
    // #incidents-main is the dynamically-populated container rendered by JS
    await expect(page.locator('#incidents-main')).toBeAttached();
  });

  test('contacts.html returns 200', async ({ page }) => {
    const response = await page.goto('/contacts.html');
    expect(response.status()).toBe(200);
    // #contacts-root is present in static HTML before JS runs
    await expect(page.locator('#contacts-root')).toBeAttached();
  });

  test('hunters/reed.html returns 200', async ({ page }) => {
    const response = await page.goto('/hunters/reed.html');
    expect(response.status()).toBe(200);
    // Hunter pages use <main> as the top-level content container
    await expect(page.locator('main')).toBeAttached();
  });

  test('missions/campbell-briefings.html returns 200', async ({ page }) => {
    // Note: briefings page may live at this path per the nav config
    const response = await page.goto('/missions/01-portal-campbell-briefings.html');
    expect(response.status()).toBe(200);
    await expect(page.locator('body')).toBeAttached();
  });

});
