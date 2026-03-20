// auth.spec.js — Tests for the PORTAL auth system.
//
// ARCHITECTURE NOTES (read before editing):
// - auth.js is loaded dynamically by player-nav.js on every player-facing page.
//   It reads localStorage('portal-auth-token') — a JWT with { sub, role, display, exp }.
// - The CLIENT decodes the JWT payload without verifying the signature. This lets
//   us inject structurally-valid fake tokens via page.addInitScript() — no real
//   passwords are needed for any test.
// - Server-side 401/403 behaviour is tested by mocking API responses with page.route().
// - auth.js fires 'portalAuthReady' synchronously (before DOMContentLoaded), and
//   page scripts listen for this event. Injecting the token via addInitScript()
//   means it's in localStorage before auth.js runs, so getUser() returns the right
//   user on the very first call.
//
// FAKE TOKEN FORMAT:
//   <base64url_header>.<base64url_payload>.<base64url_signature>
//   The signature portion is ignored by the client — any string works there.
//
// PERMISSION MATRIX (from auth.js canWrite()):
//   'hunter'  — owner (username === resourceId) or admin
//   'report'  — owner (username === resourceId) or admin
//   'incident'— any authenticated user
//   'lab'     — any authenticated user
//   'feed'    — any authenticated user (tracker edits checked separately)
//   'map', 'session', 'handout' — admin only

import { test, expect } from '@playwright/test';

// ── FAKE JWT HELPER ────────────────────────────────────────────────────────────

// Creates a structurally-valid JWT that the client will accept (no signature check).
// Uses Node.js Buffer.from / btoa equivalents — runs in Node test context.
function makeToken(payload) {
  function b64url(obj) {
    const json = typeof obj === 'string' ? obj : JSON.stringify(obj);
    return Buffer.from(json).toString('base64url');
  }
  const header = b64url({ alg: 'HS256', typ: 'JWT' });
  const body   = b64url({ iat: 1700000000, exp: 9999999999, ...payload });
  const sig    = b64url('fake-sig');
  return `${header}.${body}.${sig}`;
}

const TOKENS = {
  rex:   makeToken({ sub: 'rex',   role: 'player', display: 'Rex Bangley'  }),
  alan:  makeToken({ sub: 'alan',  role: 'player', display: 'Alan Frazier' }),
  reed:  makeToken({ sub: 'reed',  role: 'player', display: 'Reed Atwood'  }),
  admin: makeToken({ sub: 'admin', role: 'admin',  display: 'Keeper'        }),
};

// ── SETUP HELPERS ──────────────────────────────────────────────────────────────

// Injects a fake auth token into localStorage before the page loads.
function injectAuth(page, token) {
  return page.addInitScript((t) => {
    localStorage.setItem('portal-auth-token', t);
  }, token);
}

// Clears any auth token from localStorage before the page loads.
function clearAuth(page) {
  return page.addInitScript(() => {
    localStorage.removeItem('portal-auth-token');
  });
}

// Mocks both hunter D1 endpoints. GETs return {}; PUTs return 200.
async function mockHunterApis(page, { putStatus = 200 } = {}) {
  await page.route('**/api/v1/hunters/**', async route => {
    if (route.request().method() === 'PUT') {
      return route.fulfill({
        status: putStatus,
        contentType: 'application/json',
        body: putStatus === 200 ? '{}' : JSON.stringify({ error: 'Unauthorized' }),
      });
    }
    return route.fulfill({ contentType: 'application/json', body: '{}' });
  });
}

// Mocks all player-report D1 endpoints.
async function mockPlayerReportApi(page) {
  await page.route('**/api/v1/player-reports/**', async route => {
    if (route.request().method() === 'PUT') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    }
    if (route.request().url().includes('/visibility')) {
      return route.fulfill({ contentType: 'application/json', body: '{"enabled":true}' });
    }
    return route.fulfill({ contentType: 'application/json', body: '{}' });
  });
  // Keeper recap section also fetches from /api/v1/reports
  await page.route('**/api/v1/reports/**', route =>
    route.fulfill({ contentType: 'application/json', body: '{}' })
  );
}

// ── UNAUTHENTICATED VISITOR ────────────────────────────────────────────────────

test.describe('Auth — unauthenticated visitor', () => {

  test.beforeEach(async ({ page }) => {
    clearAuth(page);
    await mockHunterApis(page);
  });

  test('shows LOG IN button in header on hunter page', async ({ page }) => {
    await page.goto('/hunters/reed.html');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#portal-login-btn')).toBeVisible();
    await expect(page.locator('#portal-login-btn')).toHaveText('LOG IN');
  });

  test('hunter page shows "LOG IN TO EDIT" notice', async ({ page }) => {
    await page.goto('/hunters/reed.html');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#hunter-auth-notice')).toBeVisible();
    await expect(page.locator('#hunter-auth-notice')).toContainText('LOG IN TO EDIT');
  });

  test('hunter save buttons are hidden when not logged in', async ({ page }) => {
    await page.goto('/hunters/reed.html');
    await page.waitForLoadState('networkidle');
    const saveBtns = page.locator('[onclick*="saveNow"]');
    const count = await saveBtns.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(saveBtns.nth(i)).toBeHidden();
    }
  });

  test('player-report save button is disabled when not logged in and hunter selected', async ({ page }) => {
    clearAuth(page);
    await mockPlayerReportApi(page);
    await page.goto('/reports/player-report.html');
    await page.waitForLoadState('networkidle');
    await page.locator('[data-week="W01"]').click();
    await page.locator('[data-hunter="reed"]').click();
    await expect(page.locator('#btn-save-bottom')).toBeDisabled();
  });

  test('login popover opens on LOG IN click', async ({ page }) => {
    await page.goto('/hunters/reed.html');
    await page.waitForLoadState('networkidle');
    await page.click('#portal-login-btn');
    await expect(page.locator('.auth-login-popover')).toHaveClass(/open/);
    await expect(page.locator('#auth-un')).toBeVisible();
    await expect(page.locator('#auth-pw')).toBeVisible();
  });

  test('failed login shows error message', async ({ page }) => {
    await page.route('**/api/auth/login', route =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid username or password' }),
      })
    );
    await page.goto('/hunters/reed.html');
    await page.waitForLoadState('networkidle');
    await page.click('#portal-login-btn');
    await page.fill('#auth-un', 'rex');
    await page.fill('#auth-pw', 'wrong');
    await page.click('#auth-go');
    await expect(page.locator('#auth-err')).toBeVisible();
    await expect(page.locator('#auth-err')).toContainText('Invalid username or password');
    // Button should be re-enabled after failure
    await expect(page.locator('#auth-go')).toBeEnabled();
  });

  test('login button goes to loading state during request', async ({ page }) => {
    // Slow the response so we can catch the in-flight state
    await page.route('**/api/auth/login', async route => {
      await new Promise(r => setTimeout(r, 200));
      return route.fulfill({ status: 401, contentType: 'application/json', body: '{"error":"x"}' });
    });
    await page.goto('/hunters/reed.html');
    await page.waitForLoadState('networkidle');
    await page.click('#portal-login-btn');
    await page.fill('#auth-un', 'rex');
    await page.fill('#auth-pw', 'p');
    await page.click('#auth-go');
    await expect(page.locator('#auth-go')).toHaveText('…');
    await expect(page.locator('#auth-go')).toBeDisabled();
  });

});

// ── LOGGED IN AS PLAYER (REX) ──────────────────────────────────────────────────

test.describe('Auth — logged in as player (rex)', () => {

  test.beforeEach(async ({ page }) => {
    injectAuth(page, TOKENS.rex);
    await mockHunterApis(page);
  });

  test('shows player display name in header (not LOG IN)', async ({ page }) => {
    await page.goto('/hunters/rex.html');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.auth-user-btn')).toBeVisible();
    await expect(page.locator('.auth-user-btn')).toContainText('REX BANGLEY');
    await expect(page.locator('#portal-login-btn')).not.toBeVisible();
  });

  test('own hunter page — save button visible, no auth notice', async ({ page }) => {
    await page.goto('/hunters/rex.html');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#hunter-auth-notice')).not.toBeVisible();
    const saveBtns = page.locator('[onclick*="saveNow"]');
    await expect(saveBtns.first()).toBeVisible();
  });

  test('other player hunter page — save buttons are hidden', async ({ page }) => {
    await page.goto('/hunters/reed.html');
    await page.waitForLoadState('networkidle');
    const saveBtns = page.locator('[onclick*="saveNow"]');
    const count = await saveBtns.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(saveBtns.nth(i)).toBeHidden();
    }
  });

  test('other player hunter page — shows "NOT AUTHORISED" notice', async ({ page }) => {
    await page.goto('/hunters/reed.html');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#hunter-auth-notice')).toBeVisible();
    await expect(page.locator('#hunter-auth-notice')).toContainText('NOT AUTHORISED TO EDIT');
  });

  test('other player hunter page — stat inputs are disabled', async ({ page }) => {
    await page.goto('/hunters/reed.html');
    await page.waitForLoadState('networkidle');
    const statInputs = page.locator('.stat-input');
    const count = await statInputs.count();
    expect(count).toBeGreaterThan(0);
    await expect(statInputs.first()).toBeDisabled();
  });

  test('player-report — own hunter (rex) auto-selected by auth', async ({ page }) => {
    injectAuth(page, TOKENS.rex);
    await mockPlayerReportApi(page);
    await page.goto('/reports/player-report.html');
    await page.waitForLoadState('networkidle');
    // rex should be auto-selected by tryAutoSelect()
    await expect(page.locator('[data-hunter="rex"]')).toHaveClass(/active/);
  });

  test('player-report — save enabled for own hunter after week selected', async ({ page }) => {
    injectAuth(page, TOKENS.rex);
    await mockPlayerReportApi(page);
    await page.goto('/reports/player-report.html');
    await page.waitForLoadState('networkidle');
    await page.locator('[data-week="W01"]').click();
    // hunter auto-selected as rex
    await expect(page.locator('#btn-save-bottom')).not.toBeDisabled();
  });

  test('player-report — save disabled for another hunter', async ({ page }) => {
    injectAuth(page, TOKENS.rex);
    await mockPlayerReportApi(page);
    await page.goto('/reports/player-report.html');
    await page.waitForLoadState('networkidle');
    await page.locator('[data-week="W01"]').click();
    await page.locator('[data-hunter="reed"]').click();
    await expect(page.locator('#btn-save-bottom')).toBeDisabled();
  });

  test('user dropdown shows LOG OUT option', async ({ page }) => {
    await page.goto('/hunters/rex.html');
    await page.waitForLoadState('networkidle');
    await page.locator('.auth-user-btn').click();
    const dropdown = page.locator('.auth-dropdown');
    await expect(dropdown).toHaveClass(/open/);
    await expect(dropdown.locator('button')).toContainText('LOG OUT');
  });

  test('log out removes token from localStorage', async ({ page }) => {
    // Note: injectAuth (from beforeEach) re-runs on every navigation via addInitScript,
    // so we patch window.portalAuth.logout via evaluate (after initial load) to skip
    // the actual reload and test only the _clear() behaviour.
    await page.goto('/hunters/rex.html');
    await page.waitForLoadState('networkidle');
    const before = await page.evaluate(() => localStorage.getItem('portal-auth-token'));
    expect(before).toBeTruthy();
    // Override logout to skip reload so we can inspect localStorage immediately after
    await page.evaluate(() => {
      window.portalAuth.logout = function () { this._clear(); };
    });
    await page.locator('.auth-user-btn').click();
    await page.locator('.auth-dropdown button').click();
    const after = await page.evaluate(() => localStorage.getItem('portal-auth-token'));
    expect(after).toBeNull();
  });

});

// ── LOGGED IN AS ADMIN (KEEPER) ────────────────────────────────────────────────

test.describe('Auth — logged in as admin (keeper)', () => {

  test.beforeEach(async ({ page }) => {
    injectAuth(page, TOKENS.admin);
    await mockHunterApis(page);
  });

  test('shows admin display name with purple style', async ({ page }) => {
    await page.goto('/hunters/reed.html');
    await page.waitForLoadState('networkidle');
    const userBtn = page.locator('.auth-user-btn');
    await expect(userBtn).toBeVisible();
    await expect(userBtn).toContainText('KEEPER');
    await expect(userBtn).toHaveClass(/is-admin/);
  });

  test('admin sees save button on every hunter page (not just own)', async ({ page }) => {
    for (const hunter of ['reed', 'rex', 'alan', 'sven']) {
      await page.goto(`/hunters/${hunter}.html`);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('#hunter-auth-notice')).not.toBeVisible();
      const saveBtns = page.locator('[onclick*="saveNow"]');
      const count = await saveBtns.count();
      expect(count).toBeGreaterThan(0);
      await expect(saveBtns.first()).toBeVisible();
    }
  });

  test('admin player-report — save button enabled for any hunter', async ({ page }) => {
    injectAuth(page, TOKENS.admin);
    await mockPlayerReportApi(page);
    await page.goto('/reports/player-report.html');
    await page.waitForLoadState('networkidle');
    await page.locator('[data-week="W01"]').click();
    await page.locator('[data-hunter="reed"]').click();
    await expect(page.locator('#btn-save-bottom')).not.toBeDisabled();
  });

});

// ── SUCCESSFUL LOGIN FLOW ──────────────────────────────────────────────────────

test.describe('Auth — login flow', () => {

  test('successful login stores token in localStorage', async ({ page }) => {
    // We call portalAuth.login() directly to test token storage without triggering
    // location.reload(), which would cause the page to navigate away mid-test.
    await mockHunterApis(page);
    const fakeToken = TOKENS.rex;
    await page.route('**/api/auth/login', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: fakeToken, user: { username: 'rex', role: 'player', display: 'Rex Bangley' } }),
      })
    );

    await page.goto('/hunters/reed.html');
    await page.waitForLoadState('networkidle');

    // Call the login API method directly — it POSTs credentials, stores the token,
    // and returns the user object (before location.reload() would be called by doLogin())
    const user = await page.evaluate(async () => window.portalAuth.login('rex', 'anypassword'));

    expect(user).toMatchObject({ username: 'rex', role: 'player', display: 'Rex Bangley' });
    const stored = await page.evaluate(() => localStorage.getItem('portal-auth-token'));
    expect(stored).toBe(fakeToken);
  });

  test('Enter key in login form sends credentials to API', async ({ page }) => {
    // Tests that pressing Enter in the login form triggers a POST to /api/auth/login
    // with the right credentials. We use a 401 response to prevent location.reload().
    await mockHunterApis(page);
    let loginBody = null;
    await page.route('**/api/auth/login', async route => {
      loginBody = await route.request().postDataJSON();
      return route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid username or password' }),
      });
    });

    await page.goto('/hunters/reed.html');
    await page.waitForLoadState('networkidle');
    await page.click('#portal-login-btn');
    await page.fill('#auth-un', 'alan');
    await page.fill('#auth-pw', 'mypassword');
    await page.keyboard.press('Enter');

    // Wait for the error to confirm the API was called
    await expect(page.locator('#auth-err')).toBeVisible();
    expect(loginBody).toMatchObject({ username: 'alan', password: 'mypassword' });
  });

  test('Escape key closes login popover', async ({ page }) => {
    clearAuth(page);
    await mockHunterApis(page);
    await page.goto('/hunters/reed.html');
    await page.waitForLoadState('networkidle');
    await page.click('#portal-login-btn');
    await expect(page.locator('.auth-login-popover')).toHaveClass(/open/);
    await page.keyboard.press('Escape');
    await expect(page.locator('.auth-login-popover')).not.toHaveClass(/open/);
  });

});

// ── SERVER-SIDE GUARD — UI ROBUSTNESS ─────────────────────────────────────────

test.describe('Auth — server 401 handling', () => {

  test('hunter page save shows ERROR when server returns 401', async ({ page }) => {
    // Logged in as rex (owns the page), but server rejects with 401 (e.g. expired token)
    injectAuth(page, TOKENS.rex);
    await mockHunterApis(page, { putStatus: 401 });

    await page.goto('/hunters/rex.html');
    await page.waitForLoadState('networkidle');

    const saveBtn = page.locator('[onclick*="saveNow"]').first();
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    // Should show ERROR (server rejected) not SAVED ✓
    await expect(saveBtn).toHaveText(/ERROR|OFFLINE/, { timeout: 5000 });
  });

});
