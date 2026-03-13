// entities.spec.js — Tests for missions/entities.html (Entity Registry).
//
// entities.html is a keeper-only page that renders three sections:
//   Section I  — Confirmed entities (from portal-entities.json display{} blocks)
//   Section II — Theoretical type cards (from portal-entity-types.json)
//   Section III — Gathered database: custom entries (portal-db-custom.json)
//                 + deck entries (portal-db-deck.json)
//
// DATA-DRIVEN DESIGN: source JSON files are read at module level so assertions
// about counts, IDs, and labels stay correct as content evolves.

import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const entitiesData = JSON.parse(readFileSync(resolve('./data/portal-entities.json'), 'utf-8'));
const typesData    = JSON.parse(readFileSync(resolve('./data/portal-entity-types.json'), 'utf-8'));
const customDBData = JSON.parse(readFileSync(resolve('./data/portal-db-custom.json'), 'utf-8'));
const deckDBData   = JSON.parse(readFileSync(resolve('./data/portal-db-deck.json'), 'utf-8'));

const displayEntities  = entitiesData.entities.filter(e => e.display);
const resolvedEntities = displayEntities.filter(e => e.display.card_class === 'resolved');
const confirmedCount   = String(displayEntities.length).padStart(2, '0');
const resolvedCount    = String(resolvedEntities.length).padStart(2, '0');

// ── Page load ─────────────────────────────────────────────────────────────────

test.describe('entities.html — page load', () => {

  test('page loads with correct title', async ({ page }) => {
    await page.goto('/missions/entities.html');
    await expect(page).toHaveTitle(/Entity Registry/);
  });

  test('keeper banner is visible', async ({ page }) => {
    await page.goto('/missions/entities.html');
    await expect(page.locator('.keeper-banner')).toBeVisible();
  });

});

// ── Section I — Confirmed Entities ────────────────────────────────────────────

test.describe('Section I — Confirmed Entities', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/missions/entities.html');
    await page.waitForLoadState('networkidle');
  });

  test('#entity-list is non-empty after render', async ({ page }) => {
    await expect(page.locator('#entity-list')).not.toBeEmpty();
  });

  test('correct number of entity cards rendered', async ({ page }) => {
    await expect(page.locator('#entity-list .ecard')).toHaveCount(displayEntities.length);
  });

  test('each display entity has its card in the DOM', async ({ page }) => {
    for (const entity of displayEntities) {
      await expect(page.locator(`#${entity.display.id}`)).toBeVisible();
    }
  });

  test('resolved entity cards have .resolved class', async ({ page }) => {
    for (const entity of resolvedEntities) {
      await expect(page.locator(`#${entity.display.id}`)).toHaveClass(/resolved/);
    }
  });

  test('active entity cards have .active class', async ({ page }) => {
    const activeEntities = displayEntities.filter(e => e.display.card_class === 'active');
    for (const entity of activeEntities) {
      await expect(page.locator(`#${entity.display.id}`)).toHaveClass(/active/);
    }
  });

  test('entity card names render correctly', async ({ page }) => {
    for (const entity of displayEntities) {
      await expect(page.locator(`#${entity.display.id} .ecard-name`)).toHaveText(entity.display.name);
    }
  });

  test('entity body is hidden by default', async ({ page }) => {
    for (const entity of displayEntities) {
      await expect(page.locator(`#${entity.display.id}-body`)).not.toHaveClass(/open/);
    }
  });

  test('clicking entity header expands the body', async ({ page }) => {
    const id = displayEntities[0].display.id;
    await page.locator(`#${id} .ecard-header`).click();
    await expect(page.locator(`#${id}-body`)).toHaveClass(/open/);
  });

  test('toggle text changes to COLLAPSE when expanded', async ({ page }) => {
    const id = displayEntities[0].display.id;
    await page.locator(`#${id} .ecard-header`).click();
    await expect(page.locator(`#${id} .ecard-toggle`)).toContainText('COLLAPSE');
  });

  test('clicking expanded entity header collapses it', async ({ page }) => {
    const id = displayEntities[0].display.id;
    await page.locator(`#${id} .ecard-header`).click();
    await page.locator(`#${id} .ecard-header`).click();
    await expect(page.locator(`#${id}-body`)).not.toHaveClass(/open/);
  });

  test('harm row renders in expanded stat block', async ({ page }) => {
    const id = displayEntities[0].display.id;
    await page.locator(`#${id} .ecard-header`).click();
    await expect(page.locator(`#${id}-body .harm-row`)).toBeVisible();
  });

  test('stat pill confirmed count matches display entities', async ({ page }) => {
    await expect(page.locator('#stat-confirmed')).toHaveText(confirmedCount);
  });

  test('stat pill resolved count matches resolved entities', async ({ page }) => {
    await expect(page.locator('#stat-resolved')).toHaveText(resolvedCount);
  });

});

// ── Section II — Theoretical Type Cards ───────────────────────────────────────

test.describe('Section II — Theoretical Types', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/missions/entities.html');
    await page.waitForLoadState('networkidle');
  });

  test('#tcard-grid is non-empty after render', async ({ page }) => {
    await expect(page.locator('#tcard-grid')).not.toBeEmpty();
  });

  test('correct number of type cards rendered', async ({ page }) => {
    await expect(page.locator('#tcard-grid .tcard')).toHaveCount(typesData.types.length);
  });

  test('each type card is present in the DOM', async ({ page }) => {
    for (const type of typesData.types) {
      await expect(page.locator(`#${type.id}`)).toBeVisible();
    }
  });

  test('type card class badges render with correct class', async ({ page }) => {
    for (const type of typesData.types) {
      await expect(page.locator(`#${type.id} .class-badge`)).toHaveClass(new RegExp(type.class_badge));
    }
  });

  test('type card body is hidden by default', async ({ page }) => {
    for (const type of typesData.types) {
      await expect(page.locator(`#${type.id}-body`)).not.toHaveClass(/open/);
    }
  });

  test('clicking type card header expands body', async ({ page }) => {
    const first = typesData.types[0];
    await page.locator(`#${first.id} .tcard-header`).click();
    await expect(page.locator(`#${first.id}-body`)).toHaveClass(/open/);
  });

  test('blurred sections render with .t-blurred class', async ({ page }) => {
    const blurredType = typesData.types.find(t => t.sections.some(s => s.blurred));
    await page.locator(`#${blurredType.id} .tcard-header`).click();
    await expect(page.locator(`#${blurredType.id}-body .t-blurred`)).toBeVisible();
  });

});

// ── Section III — Custom DB entries ───────────────────────────────────────────

test.describe('Section III — Database: custom entries', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/missions/entities.html');
    await page.waitForLoadState('networkidle');
  });

  test('custom entries are present in #db-grid', async ({ page }) => {
    for (const entry of customDBData.entries) {
      await expect(page.locator(`#db-grid #${entry.id}`)).toBeVisible();
    }
  });

  test('custom entries have data-type="custom"', async ({ page }) => {
    for (const entry of customDBData.entries) {
      await expect(page.locator(`#${entry.id}`)).toHaveAttribute('data-type', 'custom');
    }
  });

  test('custom entries have .custom CSS class', async ({ page }) => {
    for (const entry of customDBData.entries) {
      await expect(page.locator(`#${entry.id}`)).toHaveClass(/custom/);
    }
  });

  test('custom entry body expands on click', async ({ page }) => {
    const first = customDBData.entries[0];
    await page.locator(`#${first.id} .dbcard-header`).click();
    await expect(page.locator(`#${first.id}-body`)).toHaveClass(/open/);
  });

});

// ── Section III — Deck DB entries ─────────────────────────────────────────────

test.describe('Section III — Database: deck entries', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/missions/entities.html');
    await page.waitForLoadState('networkidle');
  });

  test('correct number of deck entries rendered', async ({ page }) => {
    await expect(page.locator('#db-grid .dbcard[data-type="deck"]')).toHaveCount(deckDBData.entries.length);
  });

  test('first and last deck entries are present', async ({ page }) => {
    const first = deckDBData.entries[0];
    const last  = deckDBData.entries[deckDBData.entries.length - 1];
    await expect(page.locator(`#${first.id}`)).toBeVisible();
    await expect(page.locator(`#${last.id}`)).toBeVisible();
  });

  test('deck entry body expands on click and shows db-grid layout', async ({ page }) => {
    const first = deckDBData.entries[0];
    await page.locator(`#${first.id} .dbcard-header`).click();
    await expect(page.locator(`#${first.id}-body`)).toHaveClass(/open/);
    await expect(page.locator(`#${first.id}-body .db-grid`)).toBeVisible();
  });

  test('custom entry appears before deck entries in DOM order', async ({ page }) => {
    const customId   = customDBData.entries[0].id;
    const firstDeckId = deckDBData.entries[0].id;
    const allIds = await page.locator('#db-grid .dbcard').evaluateAll(cards => cards.map(c => c.id));
    expect(allIds.indexOf(customId)).toBeLessThan(allIds.indexOf(firstDeckId));
  });

});

// ── Section III — Filter bar ───────────────────────────────────────────────────

test.describe('Section III — Database: filter bar', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/missions/entities.html');
    await page.waitForLoadState('networkidle');
  });

  test('ALL button is active by default', async ({ page }) => {
    await expect(page.locator('.db-filter-btn', { hasText: 'ALL' })).toHaveClass(/active/);
  });

  test('filter CUSTOM shows only custom entries', async ({ page }) => {
    await page.locator('.db-filter-btn', { hasText: '// CUSTOM' }).click();
    await expect(page.locator('#db-grid .dbcard:not(.hidden)')).toHaveCount(customDBData.entries.length);
  });

  test('filter CUSTOM hides all deck entries', async ({ page }) => {
    await page.locator('.db-filter-btn', { hasText: '// CUSTOM' }).click();
    await expect(page.locator('#db-grid .dbcard.hidden')).toHaveCount(deckDBData.entries.length);
  });

  test('filter ALL resets hidden entries', async ({ page }) => {
    await page.locator('.db-filter-btn', { hasText: '// CUSTOM' }).click();
    await page.locator('.db-filter-btn', { hasText: 'ALL' }).click();
    await expect(page.locator('#db-grid .dbcard.hidden')).toHaveCount(0);
  });

  test('filter by monster type shows matching entries only', async ({ page }) => {
    await page.locator('.db-filter-btn', { hasText: 'EXECUTIONER' }).click();
    const visible = page.locator('#db-grid .dbcard:not(.hidden)');
    await expect(visible).not.toHaveCount(0);
    // all visible cards should contain the filter term in their tags
    const tagTexts = await visible.evaluateAll(cards =>
      cards.map(c => [...c.querySelectorAll('.etag')].map(t => t.textContent.toLowerCase()).join(' '))
    );
    for (const text of tagTexts) {
      expect(text).toContain('executioner');
    }
  });

  test('clicked filter button gets .active class', async ({ page }) => {
    await page.locator('.db-filter-btn', { hasText: 'EXECUTIONER' }).click();
    await expect(page.locator('.db-filter-btn', { hasText: 'EXECUTIONER' })).toHaveClass(/active/);
    await expect(page.locator('.db-filter-btn', { hasText: 'ALL' })).not.toHaveClass(/active/);
  });

});
