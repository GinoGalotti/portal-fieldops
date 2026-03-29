// incidents.spec.js — Tests for lab-incidents.html.
// This is the most complex page: it fetches data/incidents.json, builds week
// tabs dynamically, and renders five incident types (choice, open, informational,
// teaser, updates). All assertions must wait for networkidle since nothing renders
// until the JSON fetch completes.
//
// DATA-DRIVEN DESIGN: This file reads data/incidents.json at test-load time so
// that assertions about "which week is active" and "what does the hero eyebrow
// say" stay correct as new weeks are added. Never hardcode content strings that
// come from the JSON — derive them from the source file instead.

import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load incidents data once at module level so all tests can reference it.
const incidentsData = JSON.parse(readFileSync(resolve('./data/incidents.json'), 'utf-8'));
const activeWeek   = incidentsData.weeks.find(w => w.status === 'active');
const closedWeeks  = incidentsData.weeks.filter(w => w.status === 'closed');
// W1 is the permanent empty-placeholder week — always the first week in the list.
const w1Week = incidentsData.weeks.find(w => w.id === 'W1');
const w2Week = incidentsData.weeks.find(w => w.id === 'W2');
const w3Week = incidentsData.weeks.find(w => w.id === 'W3');

// Pull W3 incident objects for data-driven assertions.
const w3ChoiceInc  = w3Week.incidents.find(i => i.type === 'choice');
const w3UpdatesInc = w3Week.incidents.find(i => i.type === 'updates');
const w3TeaserInc  = w3Week.incidents.find(i => i.type === 'teaser');

test.describe('Lab Incidents page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/lab-incidents.html');
    // The page renders nothing useful until incidents.json is fetched and parsed.
    // networkidle ensures the fetch is done and DOM is populated.
    await page.waitForLoadState('networkidle');
  });

  // ── TAB SWITCHER ────────────────────────────────────────────────────────

  test('at least two week tabs are visible after load', async ({ page }) => {
    // buildTabs() creates one .week-tab button per entry in data.weeks[].
    // Asserting >= 2 keeps this test valid as new weeks are added over time.
    const tabs = page.locator('.week-tab');
    const count = await tabs.count();
    expect(count).toBeGreaterThanOrEqual(2);
    // The permanent W1 placeholder and the current active week must always be present.
    await expect(page.locator('.week-tab').filter({ hasText: w1Week.label })).toBeVisible();
    await expect(page.locator('.week-tab').filter({ hasText: activeWeek.label })).toBeVisible();
  });

  test('active week tab is selected by default on load', async ({ page }) => {
    // activateWeek() is called with the first week whose status === 'active'.
    // The active tab gets the CSS class "active" via classList.toggle('active', ...).
    // We derive the expected label from incidents.json — no hardcoded week label.
    // Use CSS selector .week-tab.active to check the active token is present without
    // matching 'status-active'. Playwright string toHaveClass matches the full class
    // attribute in v1.49+, so we rely on the selector instead.
    await expect(page.locator('.week-tab.active').filter({ hasText: activeWeek.label })).toBeVisible();
  });

  test('active week tab is no longer active after clicking W1', async ({ page }) => {
    // Clicking W1 should remove the 'active' class from the current active week.
    // Note: 'status-active' stays on the active week permanently (it marks the JSON status field).
    const w1Tab = page.locator('.week-tab').filter({ hasText: w1Week.label });
    await w1Tab.click();
    // Active week loses 'active' (but retains 'status-active') — verified by CSS selector absence.
    await expect(page.locator('.week-tab.active').filter({ hasText: activeWeek.label })).not.toBeVisible();
    await expect(page.locator('.week-tab.active').filter({ hasText: w1Week.label })).toBeVisible();
  });

  // ── ACTIVE WEEK CONTENT (data-driven) ───────────────────────────────────

  test('active week shows incident titles derived from incidents.json', async ({ page }) => {
    // Each visible week renders incident titles from its incidents[] array.
    // We check the first incident title from the active week — fully data-driven.
    const firstInc = activeWeek.incidents[0];
    await expect(page.getByText(firstInc.title, { exact: false })).toBeVisible();
  });

  test('active week hero eyebrow matches incidents.json', async ({ page }) => {
    // updateHero() sets #hero-eyebrow to week.hero_eyebrow.
    // We compare against the first 20 chars of the actual value from the JSON
    // so this test survives minor wording tweaks while still confirming the
    // correct week is displayed.
    const eyebrow = page.locator('#hero-eyebrow');
    await expect(eyebrow).toContainText(activeWeek.hero_eyebrow.substring(0, 20));
  });

  // ── W1 EMPTY STATE ──────────────────────────────────────────────────────

  test('W1 shows the empty state message when clicked', async ({ page }) => {
    // W1 has incidents: [] in incidents.json. renderWeek() renders the
    // .empty-state div with the text "// NO INCIDENTS LOGGED — THIS PERIOD IS CLOSED."
    const w1Tab = page.locator('.week-tab').filter({ hasText: w1Week.label });
    await w1Tab.click();
    // The empty-state element replaces #main-content content
    await expect(page.locator('.empty-state')).toBeVisible();
    await expect(page.locator('.empty-state')).toContainText('NO INCIDENTS LOGGED');
  });

  test('W1 shows no incident cards when clicked', async ({ page }) => {
    // Clicking W1 should clear all .incident-card elements since W1 has no incidents
    const w1Tab = page.locator('.week-tab').filter({ hasText: w1Week.label });
    await w1Tab.click();
    await expect(page.locator('.incident-card')).toHaveCount(0);
  });

  test('W1 hero eyebrow updates when switching from active week to W1', async ({ page }) => {
    // Rather than hardcoding the eyebrow string, we verify it CHANGES from the
    // active-week value. This is resilient to any rewording in incidents.json.
    const eyebrow = page.locator('#hero-eyebrow');
    const activeText = await eyebrow.textContent();
    const w1Tab = page.locator('.week-tab').filter({ hasText: w1Week.label });
    await w1Tab.click();
    const w1Text = await eyebrow.textContent();
    expect(w1Text).not.toBe(activeText);
    // Also confirm it matches what the JSON says (first 20 chars as a stable anchor).
    await expect(eyebrow).toContainText(w1Week.hero_eyebrow.substring(0, 20));
  });

  // ── W2 INCIDENTS (closed tab — must click W2 to view) ───────────────────

  test.describe('W2 incidents', () => {

    test.beforeEach(async ({ page }) => {
      // W2 is closed so the page loads W3 by default. Click W2 to switch.
      await page.locator('.week-tab').filter({ hasText: w2Week.label }).click();
    });

    test('W2 shows all four incident titles', async ({ page }) => {
      await expect(page.getByText('The Eszter Particulate')).toBeVisible();
      await expect(page.getByText('The Bálint Question')).toBeVisible();
      await expect(page.getByText('The Lab at 3am')).toBeVisible();
      await expect(page.getByText('CAMPBELL Activity Logs')).toBeVisible();
    });

    test('W2 choice incident has three choice buttons', async ({ page }) => {
      // S01-I01 has choices A, B, C.
      const choiceBtns = page.locator('#choice-grid-S01-I01 .choice-btn');
      await expect(choiceBtns).toHaveCount(3);
    });

    test('W2 choice button labels start with A —, B —, C —', async ({ page }) => {
      await expect(page.locator('.ch-label').filter({ hasText: 'A —' })).toBeVisible();
      await expect(page.locator('.ch-label').filter({ hasText: 'B —' })).toBeVisible();
      await expect(page.locator('.ch-label').filter({ hasText: 'C —' })).toBeVisible();
    });

    test('W2 clicking a choice button gives it the selected class', async ({ page }) => {
      const btnA = page.locator('#choice-grid-S01-I01 .choice-btn').first();
      await btnA.click();
      await expect(btnA).toHaveClass(/selected/);
    });

    test('W2 selecting a choice enables the SAVE RESPONSES button', async ({ page }) => {
      const saveBtn = page.locator('#save-btn');
      await expect(saveBtn).toBeDisabled();
      const btnA = page.locator('#choice-grid-S01-I01 .choice-btn').first();
      await btnA.click();
      await expect(saveBtn).not.toBeDisabled();
    });

    test('W2 choice incident has allow_custom textarea', async ({ page }) => {
      // S01-I01 has allow_custom: true.
      await expect(page.locator('#custom-S01-I01')).toBeVisible();
    });

    test('W2 SAVE RESPONSES button is present', async ({ page }) => {
      const saveBtn = page.locator('#save-btn');
      await expect(saveBtn).toBeVisible();
      await expect(saveBtn).toHaveText('SAVE RESPONSES');
    });

    test('W2 open incident has a textarea for freetext response', async ({ page }) => {
      await expect(page.locator('#resp-text-S01-I02')).toBeVisible();
    });

    test('W2 open incident has a SUBMIT RESPONSE button', async ({ page }) => {
      const submitBtn = page.locator('#submit-btn-S01-I02');
      await expect(submitBtn).toBeVisible();
      await expect(submitBtn).toHaveText('SUBMIT RESPONSE');
    });

    test('W2 open incident SUBMIT button is disabled until text is entered', async ({ page }) => {
      const submitBtn = page.locator('#submit-btn-S01-I02');
      await expect(submitBtn).toBeDisabled();
      await page.locator('#resp-text-S01-I02').fill('This is a test response.');
      await expect(submitBtn).not.toBeDisabled();
    });

    test('W2 informational incident renders content but has no choice or submit buttons', async ({ page }) => {
      const card = page.locator('#incident-S01-I03');
      await expect(card).toBeVisible();
      await expect(card.locator('.choice-btn')).toHaveCount(0);
      await expect(card.locator('.submit-btn')).toHaveCount(0);
    });

    test('W2 informational incident narrative text is visible', async ({ page }) => {
      await expect(page.locator('#incident-S01-I03 .narrative').first()).toBeVisible();
    });

    test('W2 teaser renders inside .campbell-log-section (not .incident-card)', async ({ page }) => {
      const teaserSection = page.locator('#incident-S01-CAMPBELL-LOG');
      await expect(teaserSection).toBeVisible();
      await expect(teaserSection).toHaveClass(/campbell-log-section/);
    });

    test('W2 anomaly spans are rendered in CAMPBELL log excerpts', async ({ page }) => {
      const anomalySpans = page.locator('#incident-S01-CAMPBELL-LOG .log-anomaly');
      const count = await anomalySpans.count();
      expect(count).toBeGreaterThan(0);
    });

    test('W2 email block from Teddy is visible in the teaser', async ({ page }) => {
      const emailBlock = page.locator('#incident-S01-CAMPBELL-LOG .email-block');
      await expect(emailBlock).toBeVisible();
      await expect(emailBlock.locator('.email-header')).toContainText('teddy.brandt@portal-internal.org');
    });

    test('W2 teaser VIEW FULL LOGS link points to campbell-logs.html', async ({ page }) => {
      const link = page.locator('#incident-S01-CAMPBELL-LOG .log-full-link a');
      await expect(link).toBeVisible();
      await expect(link).toContainText('VIEW FULL LOGS');
      const href = await link.getAttribute('href');
      expect(href).toContain('campbell-logs.html');
    });

  });

  // ── W3 INCIDENTS (active week — default on load) ─────────────────────────

  test.describe('W3 incidents', () => {

    // No tab click needed — W3 is active and loads by default.

    // ── Choice incident (S02-I05) ──

    test('W3 choice incident renders with two choice buttons', async ({ page }) => {
      // S02-I05 has choices A and B (no C) — 2 choices.
      const choiceBtns = page.locator(`#choice-grid-${w3ChoiceInc.id} .choice-btn`);
      await expect(choiceBtns).toHaveCount(w3ChoiceInc.choices.length);
    });

    test('W3 choice incident has allow_custom textarea', async ({ page }) => {
      // S02-I05 has allow_custom: true.
      await expect(page.locator(`#custom-${w3ChoiceInc.id}`)).toBeVisible();
    });

    test('W3 SAVE RESPONSES button is present when choice incident is rendered', async ({ page }) => {
      // W3 has a choice incident so renderWeek() must include the save bar.
      await expect(page.locator('#save-btn')).toBeVisible();
    });

    test('W3 choice incident title is visible', async ({ page }) => {
      await expect(page.getByText(w3ChoiceInc.title, { exact: false })).toBeVisible();
    });

    // ── Informational incident (S02-I06) ──

    test('W3 informational incident renders with no choice or submit buttons', async ({ page }) => {
      const card = page.locator('#incident-S02-I06');
      await expect(card).toBeVisible();
      await expect(card.locator('.choice-btn')).toHaveCount(0);
      await expect(card.locator('.submit-btn')).toHaveCount(0);
    });

    test('W3 informational incident item_label does not contain "undefined"', async ({ page }) => {
      // Regression: incidents missing badge/color fields previously rendered "undefined".
      const idLine = page.locator('#incident-S02-I06 .incident-id');
      await expect(idLine).toBeVisible();
      await expect(idLine).not.toContainText('undefined');
    });

    // ── Updates digest (S02-UPDATES) ──
    // S02-UPDATES has a `digest` field, so renderUpdates() calls renderDigest()
    // which produces .incident-digest > .id-header + .id-lines + .id-sig.
    // (Items are not rendered as .update-item when a digest field is present.)

    test('W3 updates digest renders as .updates-card not .incident-card', async ({ page }) => {
      // renderUpdates() produces a .updates-card div, not .incident-card.
      const card = page.locator('#incident-S02-UPDATES');
      await expect(card).toBeVisible();
      await expect(card).toHaveClass(/updates-card/);
      await expect(card).not.toHaveClass(/incident-card/);
    });

    test('W3 updates digest renders .incident-digest (compact view)', async ({ page }) => {
      // When inc.digest exists, renderDigest() is called — produces .incident-digest.
      const digest = page.locator('#incident-S02-UPDATES .incident-digest');
      await expect(digest).toBeVisible();
    });

    test('W3 updates digest .id-header contains digest header text', async ({ page }) => {
      // .id-header spans: left = digest.header, right = digest.count.
      const header = page.locator('#incident-S02-UPDATES .id-header');
      await expect(header).toBeVisible();
      await expect(header).toContainText(w3UpdatesInc.digest.header.substring(0, 20));
    });

    test('W3 updates digest badge shows INFORMATIONAL with badge-green class', async ({ page }) => {
      // The updates card uses badge_color: "green" → .badge-green CSS class.
      const badge = page.locator('#incident-S02-UPDATES .incident-badge');
      await expect(badge).toBeVisible();
      await expect(badge).toHaveClass(/badge-green/);
      await expect(badge).toContainText('INFORMATIONAL');
    });

    test('W3 updates digest item_label does not contain "undefined"', async ({ page }) => {
      // Regression guard: updates type should render its item_label cleanly.
      const idLine = page.locator('#incident-S02-UPDATES .incident-id');
      await expect(idLine).toBeVisible();
      await expect(idLine).not.toContainText('undefined');
    });

    test('W3 updates digest .id-sig contains signature text', async ({ page }) => {
      // renderDigest() renders digest.sig into .id-sig.
      const sig = page.locator('#incident-S02-UPDATES .id-sig');
      await expect(sig).toBeVisible();
      await expect(sig).toContainText(w3UpdatesInc.digest.sig.substring(0, 20));
    });

    // ── Teaser (S02-CAMPBELL-LOG-2) ──

    test('W3 teaser renders inside .campbell-log-section', async ({ page }) => {
      const teaserSection = page.locator(`#incident-${w3TeaserInc.id}`);
      await expect(teaserSection).toBeVisible();
      await expect(teaserSection).toHaveClass(/campbell-log-section/);
    });

    test('W3 teaser contains email from Teddy about second log review', async ({ page }) => {
      // The teaser email subject is "re: the campbell thing — more logs".
      const emailBlock = page.locator(`#incident-${w3TeaserInc.id} .email-block`);
      await expect(emailBlock).toBeVisible();
      await expect(emailBlock.locator('.email-header')).toContainText('teddy.brandt@portal-internal.org');
    });

    test('W3 teaser EXCERPT G has anomaly spans referencing Privacy Protocol 7', async ({ page }) => {
      // Excerpt G in S02-CAMPBELL-LOG-2 contains {{anomaly:PRIVACY PROTOCOL 7...}}.
      // inlineMarkup() turns these into .log-anomaly spans.
      const anomalySpans = page.locator(`#incident-${w3TeaserInc.id} .log-anomaly`);
      const count = await anomalySpans.count();
      expect(count).toBeGreaterThan(0);
      // At least one should mention Privacy Protocol 7.
      await expect(page.locator(`#incident-${w3TeaserInc.id}`)).toContainText('PRIVACY PROTOCOL 7');
    });

    test('W3 teaser annotation text is visible for Excerpt D', async ({ page }) => {
      // Excerpt D has annotation about the 0.34s diagnostic timing anomaly.
      await expect(page.locator(`#incident-${w3TeaserInc.id}`)).toContainText('0.34 seconds');
    });

    test('W3 teaser VIEW FULL LOGS link points to campbell-logs.html', async ({ page }) => {
      const link = page.locator(`#incident-${w3TeaserInc.id} .log-full-link a`);
      await expect(link).toBeVisible();
      await expect(link).toContainText('VIEW FULL LOGS');
      const href = await link.getAttribute('href');
      expect(href).toContain('campbell-logs.html');
    });

  });

});
