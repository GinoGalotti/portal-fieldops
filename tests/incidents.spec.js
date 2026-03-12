// incidents.spec.js — Tests for lab-incidents.html.
// This is the most complex page: it fetches data/incidents.json, builds week
// tabs dynamically, and renders four different incident types (choice, open,
// informational, teaser). All assertions must wait for networkidle since
// nothing renders until the JSON fetch completes.

import { test, expect } from '@playwright/test';

test.describe('Lab Incidents page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/lab-incidents.html');
    // The page renders nothing useful until incidents.json is fetched and parsed.
    // networkidle ensures the fetch is done and DOM is populated.
    await page.waitForLoadState('networkidle');
  });

  // ── TAB SWITCHER ────────────────────────────────────────────────────────

  test('both week tabs are visible after load', async ({ page }) => {
    // buildTabs() creates one .week-tab button per entry in data.weeks[].
    // incidents.json has two weeks: W1 (WEEK 01) and W2 (WEEK 02).
    const tabs = page.locator('.week-tab');
    await expect(tabs).toHaveCount(2);
    await expect(page.locator('.week-tab').filter({ hasText: 'WEEK 01' })).toBeVisible();
    await expect(page.locator('.week-tab').filter({ hasText: 'WEEK 02' })).toBeVisible();
  });

  test('W2 is the default active tab on load', async ({ page }) => {
    // activateWeek() is called with the first week whose status === 'active'.
    // In incidents.json, W2 has status: "active". The active tab gets the CSS
    // class "active" via classList.toggle('active', ...).
    const w2Tab = page.locator('.week-tab').filter({ hasText: 'WEEK 02' });
    await expect(w2Tab).toHaveClass(/active/);
  });

  test('W2 is not marked active after clicking W1', async ({ page }) => {
    // Clicking W1 should remove the active class from W2.
    const w1Tab = page.locator('.week-tab').filter({ hasText: 'WEEK 01' });
    await w1Tab.click();
    const w2Tab = page.locator('.week-tab').filter({ hasText: 'WEEK 02' });
    await expect(w2Tab).not.toHaveClass(/\bactive\b/);
    await expect(w1Tab).toHaveClass(/active/);
  });

  // ── W2 CONTENT ──────────────────────────────────────────────────────────

  test('W2 shows all four incident titles', async ({ page }) => {
    // W2 has four incidents in incidents.json. Each is rendered with an
    // .incident-title h2 (or in the teaser case, still an h2.incident-title).
    await expect(page.getByText('The Eszter Particulate')).toBeVisible();
    await expect(page.getByText('The Bálint Question')).toBeVisible();
    await expect(page.getByText('The Lab at 3am')).toBeVisible();
    await expect(page.getByText('CAMPBELL Activity Logs')).toBeVisible();
  });

  test('W2 hero eyebrow contains POST-S01', async ({ page }) => {
    // updateHero() sets #hero-eyebrow to week.hero_eyebrow.
    // For W2: "// BETWEEN-SESSION — POST-S01 STAFF COMMUNIQUÉS"
    const eyebrow = page.locator('#hero-eyebrow');
    await expect(eyebrow).toContainText('POST-S01');
  });

  // ── W1 EMPTY STATE ──────────────────────────────────────────────────────

  test('W1 shows the empty state message when clicked', async ({ page }) => {
    // W1 has incidents: [] in incidents.json. renderWeek() renders the
    // .empty-state div with the text "// NO INCIDENTS LOGGED — THIS PERIOD IS CLOSED."
    const w1Tab = page.locator('.week-tab').filter({ hasText: 'WEEK 01' });
    await w1Tab.click();
    // The empty-state element replaces #incidents-main content
    await expect(page.locator('.empty-state')).toBeVisible();
    await expect(page.locator('.empty-state')).toContainText('NO INCIDENTS LOGGED');
  });

  test('W1 shows no incident cards when clicked', async ({ page }) => {
    // Clicking W1 should clear all .incident-card elements since W1 has no incidents
    const w1Tab = page.locator('.week-tab').filter({ hasText: 'WEEK 01' });
    await w1Tab.click();
    await expect(page.locator('.incident-card')).toHaveCount(0);
  });

  test('W1 hero eyebrow contains POST-S00 after switching to W1', async ({ page }) => {
    // W1 hero_eyebrow: "// BETWEEN-SESSION — POST-S00 STAFF COMMUNIQUÉS"
    const w1Tab = page.locator('.week-tab').filter({ hasText: 'WEEK 01' });
    await w1Tab.click();
    const eyebrow = page.locator('#hero-eyebrow');
    await expect(eyebrow).toContainText('POST-S00');
  });

  // ── CHOICE INCIDENT (S01-I01: The Eszter Particulate) ───────────────────

  test('three choice buttons are visible on the Eszter Particulate incident', async ({ page }) => {
    // renderChoiceUI() creates one .choice-btn per entry in inc.choices[].
    // S01-I01 has choices A, B, C — each labelled with "A —", "B —", "C —".
    const choiceBtns = page.locator('#choice-grid-S01-I01 .choice-btn');
    await expect(choiceBtns).toHaveCount(3);
  });

  test('choice button labels start with A —, B —, C —', async ({ page }) => {
    // Each choice button contains a .ch-label span with the choice.label value.
    // From incidents.json: "A — Controlled Exposure Study", "B — Isolation...", "C — Flag..."
    await expect(page.locator('.ch-label').filter({ hasText: 'A —' })).toBeVisible();
    await expect(page.locator('.ch-label').filter({ hasText: 'B —' })).toBeVisible();
    await expect(page.locator('.ch-label').filter({ hasText: 'C —' })).toBeVisible();
  });

  test('clicking a choice button gives it the selected class', async ({ page }) => {
    // onChoiceClick() calls btn.classList.add('selected') on the clicked button
    // and removes 'selected' from all others in the same grid.
    const btnA = page.locator('#choice-grid-S01-I01 .choice-btn').first();
    await btnA.click();
    await expect(btnA).toHaveClass(/selected/);
  });

  test('selecting a choice enables the SAVE RESPONSES button', async ({ page }) => {
    // updateSaveButton() sets saveBtn.disabled = false when any pendingChoices[k].choice
    // is set. Before clicking a choice, the button is disabled.
    const saveBtn = page.locator('#save-btn');
    // Initially disabled (no selection yet)
    await expect(saveBtn).toBeDisabled();
    // Click choice A to make a selection
    const btnA = page.locator('#choice-grid-S01-I01 .choice-btn').first();
    await btnA.click();
    // Now the save button should be enabled
    await expect(saveBtn).not.toBeDisabled();
  });

  test('custom textarea is visible for the choice incident (allow_custom: true)', async ({ page }) => {
    // S01-I01 has allow_custom: true, so renderChoiceUI() renders a <textarea>
    // with id="custom-S01-I01". This lets players describe their own approach.
    const customTextarea = page.locator('#custom-S01-I01');
    await expect(customTextarea).toBeVisible();
  });

  test('SAVE RESPONSES button is present in the page', async ({ page }) => {
    // A .save-bar is rendered when any choice incidents exist in the week.
    // The button text is "SAVE RESPONSES" (set in the static HTML string in renderWeek).
    const saveBtn = page.locator('#save-btn');
    await expect(saveBtn).toBeVisible();
    await expect(saveBtn).toHaveText('SAVE RESPONSES');
  });

  // ── OPEN INCIDENT (S01-I02: The Bálint Question) ────────────────────────

  test('open incident has a textarea for freetext response', async ({ page }) => {
    // renderOpenUI() creates a <textarea id="resp-text-S01-I02"> for freetext entry.
    // This is the "discuss among yourselves" incident — no choice buttons.
    const textarea = page.locator('#resp-text-S01-I02');
    await expect(textarea).toBeVisible();
  });

  test('open incident has a SUBMIT RESPONSE button (not SAVE)', async ({ page }) => {
    // The open form has its own submit button (#submit-btn-S01-I02) labelled
    // "SUBMIT RESPONSE" — distinct from the global "SAVE RESPONSES" button.
    const submitBtn = page.locator('#submit-btn-S01-I02');
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toHaveText('SUBMIT RESPONSE');
  });

  test('open incident SUBMIT button is disabled until text is entered', async ({ page }) => {
    // The submit button starts disabled. The input event listener on the textarea
    // enables it only when textEl.value.trim().length > 0.
    const submitBtn = page.locator('#submit-btn-S01-I02');
    await expect(submitBtn).toBeDisabled();
    // Type something to enable it
    const textarea = page.locator('#resp-text-S01-I02');
    await textarea.fill('This is a test response.');
    await expect(submitBtn).not.toBeDisabled();
  });

  // ── INFORMATIONAL INCIDENT (S01-I03: The Lab at 3am) ───────────────────

  test('informational incident renders content but has no choice or submit buttons', async ({ page }) => {
    // S01-I03 has type: "informational" — renderCard() only calls renderBlock()
    // for it, with no renderChoiceUI() or renderOpenUI() call.
    // So there must be NO .choice-btn or submit button inside this card.
    const card = page.locator('#incident-S01-I03');
    await expect(card).toBeVisible();
    // No choice buttons inside the informational card
    await expect(card.locator('.choice-btn')).toHaveCount(0);
    // No submit button inside the informational card
    await expect(card.locator('.submit-btn')).toHaveCount(0);
  });

  test('informational incident narrative text is visible', async ({ page }) => {
    // The "Lab at 3am" incident contains multiple narrative blocks.
    // Checking for key text from the first narrative confirms render worked.
    const card = page.locator('#incident-S01-I03');
    await expect(card.locator('.narrative').first()).toBeVisible();
  });

  // ── TEASER INCIDENT (S01-CAMPBELL-LOG) ──────────────────────────────────

  test('teaser incident renders inside .campbell-log-section (not .incident-card)', async ({ page }) => {
    // renderTeaser() produces a .campbell-log-section div, not an .incident-card.
    // The teaser for CAMPBELL Activity Logs uses id="incident-S01-CAMPBELL-LOG".
    const teaserSection = page.locator('#incident-S01-CAMPBELL-LOG');
    await expect(teaserSection).toBeVisible();
    await expect(teaserSection).toHaveClass(/campbell-log-section/);
  });

  test('anomaly spans are rendered in the CAMPBELL log excerpts', async ({ page }) => {
    // inlineMarkup() replaces {{anomaly:TEXT}} with <span class="log-anomaly">TEXT</span>.
    // The log-excerpt blocks in S01-CAMPBELL-LOG contain multiple {{anomaly:...}} tokens.
    // At least one .log-anomaly span should be present after rendering.
    const anomalySpans = page.locator('.log-anomaly');
    const count = await anomalySpans.count();
    expect(count).toBeGreaterThan(0);
  });

  test('the email block from Teddy is visible in the teaser incident', async ({ page }) => {
    // S01-CAMPBELL-LOG contains a block of type "email" from teddy.brandt@portal-internal.org.
    // The email-header div renders "FROM: teddy.brandt@portal-internal.org".
    const emailBlock = page.locator('.email-block');
    await expect(emailBlock).toBeVisible();
    await expect(emailBlock.locator('.email-header')).toContainText('teddy.brandt@portal-internal.org');
  });

});
