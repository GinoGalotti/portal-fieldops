// contacts.spec.js — Tests for contacts.html.
// The page fetches /data/portal-npcs.json at runtime and renders NPC cards
// dynamically. Tests wait for networkidle to ensure the fetch has completed
// and the DOM has been populated before making assertions.

import { test, expect } from '@playwright/test';

test.describe('Contacts page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/contacts.html');
    // Wait for all network requests to settle — the page fetches portal-npcs.json
    // before rendering any cards, so networkidle confirms the fetch is done.
    await page.waitForLoadState('networkidle');
  });

  test('NPC cards render after data loads', async ({ page }) => {
    // contacts.html renders one .npc-card per visible NPC.
    // There are at least 6 NPCs with visible_to_players: true in portal-npcs.json
    // (Dr. Victor Leech, CAMPBELL, Dr. Priya Osei, Marcus Finch, Saoirse Mullen,
    // Teddy Brandt, Bálint, and several S02 civilians).
    const cards = page.locator('.npc-card');
    await expect(cards.first()).toBeVisible();
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(6);
  });

  test('NPC names are visible — CAMPBELL is present', async ({ page }) => {
    // CAMPBELL has visible_to_players: true and first_session: S01.
    // The name is rendered inside .npc-name with textContent from npc.name.
    await expect(page.locator('.npc-name').filter({ hasText: 'CAMPBELL' })).toBeVisible();
  });

  test('NPC names are visible — Dr. Victor Leech is present', async ({ page }) => {
    // Dr. Victor Leech has visible_to_players: true and first_session: S01.
    await expect(page.locator('.npc-name').filter({ hasText: 'Dr. Victor Leech' })).toBeVisible();
  });

  test('NPC names are visible — Teddy Brandt is present', async ({ page }) => {
    // Teddy Brandt has visible_to_players: true and first_session: S01.
    await expect(page.locator('.npc-name').filter({ hasText: 'Teddy' })).toBeVisible();
  });

  test('PORTAL staff section heading is rendered', async ({ page }) => {
    // contacts.html groups NPCs by affiliation using .contacts-eyebrow headings.
    // AFFIL_LABELS['PORTAL'] = '// PORTAL STAFF'
    await expect(page.getByText('// PORTAL STAFF')).toBeVisible();
  });

  test('MESA operatives are NOT visible to players', async ({ page }) => {
    // Agatha Dell and Claudia Vasile (Rook) have visible_to_players: false.
    // They should not appear in the rendered cards at all.
    const names = await page.locator('.npc-name').allTextContents();
    expect(names.some(n => n.includes('Agatha Dell'))).toBe(false);
    expect(names.some(n => n.includes('Rook'))).toBe(false);
  });

  test('the loading message is replaced after data loads', async ({ page }) => {
    // The initial HTML contains "// LOADING CONTACT DATABASE…" inside #contacts-root.
    // After a successful fetch and render, that element is replaced with NPC cards.
    const loadingMsg = page.locator('.loading-msg');
    // If loading succeeded, the loading message should be gone
    await expect(loadingMsg).toHaveCount(0);
  });

});
