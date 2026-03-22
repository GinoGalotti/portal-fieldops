// post-session-integrity.spec.js — Structural integrity checks for campaign data files.
//
// These tests run without a browser — they read JSON directly from data/ and assert
// structural correctness. They catch common post-session ingestion mistakes:
//   - Forgetting to close the previous week in sessions/briefings/incidents
//   - Leaving [REDACT] in a completed mission card
//   - Clock filled > segments (impossible state)
//   - Overlapping mission phase display windows
//   - Duplicate IDs in threads or sessions
//
// DESIGN: Never assert specific session IDs, week numbers, or content values.
// Only assert shape and constraints. Tests remain valid indefinitely as the
// campaign advances — no edits required after each session.

import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function readJSON(path) {
  return JSON.parse(readFileSync(resolve(path), 'utf-8'));
}

const sessions  = readJSON('./data/sessions.json');                  // flat array
const briefings = readJSON('./data/briefings.json');                 // { weeks: [] }
const incidents = readJSON('./data/incidents.json');                 // { weeks: [] }
const missions  = readJSON('./data/portal-missions.json');           // { missions: [] }
const clocks    = readJSON('./data/portal-clocks.json');             // { clocks: [] }
const threads   = readJSON('./data/portal-threads.json');            // { threads: [] }

const VALID_SESSION_STATUSES  = ['active', 'closed', 'upcoming'];
const VALID_MISSION_STATUSES  = ['active', 'completed', 'upcoming'];
const VALID_CLOCK_STATUSES    = ['active', 'resolved'];
const VALID_THREAD_STATUSES   = ['active', 'dormant', 'resolved'];
const VALID_THREAD_CATEGORIES = ['faction', 'mystery', 'personal', 'case'];

// ── sessions.json ─────────────────────────────────────────────────────────────

test.describe('sessions.json', () => {
  test('exactly one session is active', () => {
    const active = sessions.filter(s => s.status === 'active');
    expect(active, `Expected 1 active session, got: ${active.map(s => s.id).join(', ')}`).toHaveLength(1);
  });

  test('all statuses are valid', () => {
    for (const s of sessions) {
      expect(VALID_SESSION_STATUSES, `Session "${s.id}" has invalid status: "${s.status}"`).toContain(s.status);
    }
  });

  test('no duplicate session ids', () => {
    const ids = sessions.map(s => s.id);
    expect(new Set(ids).size, `Duplicate session ids found`).toBe(ids.length);
  });

  test('active session has a real title (not placeholder)', () => {
    const active = sessions.find(s => s.status === 'active');
    if (!active) return; // caught by "exactly one" test above
    expect(active.title, `Active session "${active.id}" has no title`).toBeTruthy();
    expect(active.title).not.toMatch(/pending/i);
  });
});

// ── briefings.json ────────────────────────────────────────────────────────────

test.describe('briefings.json', () => {
  test('exactly one week is active', () => {
    const active = briefings.weeks.filter(w => w.status === 'active');
    expect(active, `Expected 1 active briefing week, got: ${active.map(w => w.id).join(', ')}`).toHaveLength(1);
  });

  test('all statuses are active or closed', () => {
    for (const w of briefings.weeks) {
      expect(['active', 'closed'], `Briefing week "${w.id}" has invalid status: "${w.status}"`).toContain(w.status);
    }
  });

  test('no duplicate week ids', () => {
    const ids = briefings.weeks.map(w => w.id);
    expect(new Set(ids).size, `Duplicate briefing week ids found`).toBe(ids.length);
  });
});

// ── incidents.json ────────────────────────────────────────────────────────────

test.describe('incidents.json', () => {
  test('exactly one week is active', () => {
    const active = incidents.weeks.filter(w => w.status === 'active');
    expect(active, `Expected 1 active incident week, got: ${active.map(w => w.id).join(', ')}`).toHaveLength(1);
  });

  test('all statuses are active or closed', () => {
    for (const w of incidents.weeks) {
      expect(['active', 'closed'], `Incident week "${w.id}" has invalid status: "${w.status}"`).toContain(w.status);
    }
  });

  test('no duplicate incident ids within any week', () => {
    for (const week of incidents.weeks) {
      const ids = week.incidents.map(i => i.id);
      expect(new Set(ids).size, `Duplicate incident ids in week "${week.id}"`).toBe(ids.length);
    }
  });
});

// ── portal-missions.json ──────────────────────────────────────────────────────

test.describe('portal-missions.json', () => {
  test('all phase statuses are valid', () => {
    for (const mission of missions.missions) {
      for (const phase of mission.phases) {
        expect(VALID_MISSION_STATUSES, `Mission ${mission.num} has invalid phase status: "${phase.status}"`).toContain(phase.status);
      }
    }
  });

  test('no completed phase has [REDACT] in index_redacted', () => {
    for (const mission of missions.missions) {
      for (const phase of mission.phases) {
        if (phase.status === 'completed' && phase.index_redacted) {
          expect(phase.index_redacted, `Mission ${mission.num} completed phase still has [REDACT] in index_redacted`).not.toContain('[REDACT]');
        }
      }
    }
  });

  test('multi-phase missions: only the last phase may omit show_until', () => {
    for (const mission of missions.missions) {
      if (mission.phases.length < 2) continue;
      const nonFinal = mission.phases.slice(0, -1);
      for (const phase of nonFinal) {
        expect(phase.show_until, `Mission ${mission.num}: a non-final phase is missing show_until — display windows will overlap`).toBeTruthy();
      }
    }
  });

  test('no duplicate mission ids', () => {
    const ids = missions.missions.map(m => m.id);
    expect(new Set(ids).size, `Duplicate mission ids found`).toBe(ids.length);
  });
});

// ── portal-clocks.json ────────────────────────────────────────────────────────

test.describe('portal-clocks.json', () => {
  test('no clock has filled > segments', () => {
    for (const clock of clocks.clocks) {
      expect(clock.filled, `Clock "${clock.id}": filled (${clock.filled}) exceeds segments (${clock.segments})`).toBeLessThanOrEqual(clock.segments);
    }
  });

  test('filled is non-negative', () => {
    for (const clock of clocks.clocks) {
      expect(clock.filled, `Clock "${clock.id}" has negative filled value`).toBeGreaterThanOrEqual(0);
    }
  });

  test('segment_labels count matches segments', () => {
    for (const clock of clocks.clocks) {
      expect(clock.segment_labels.length, `Clock "${clock.id}": segment_labels has ${clock.segment_labels.length} entries but segments is ${clock.segments}`).toBe(clock.segments);
    }
  });

  test('all statuses are valid', () => {
    for (const clock of clocks.clocks) {
      expect(VALID_CLOCK_STATUSES, `Clock "${clock.id}" has invalid status: "${clock.status}"`).toContain(clock.status);
    }
  });

  test('no duplicate clock ids', () => {
    const ids = clocks.clocks.map(c => c.id);
    expect(new Set(ids).size, `Duplicate clock ids found`).toBe(ids.length);
  });
});

// ── portal-threads.json ───────────────────────────────────────────────────────

test.describe('portal-threads.json', () => {
  test('no duplicate thread ids', () => {
    const ids = threads.threads.map(t => t.id);
    expect(new Set(ids).size, `Duplicate thread ids found`).toBe(ids.length);
  });

  test('all statuses are valid', () => {
    for (const t of threads.threads) {
      expect(VALID_THREAD_STATUSES, `Thread "${t.id}" has invalid status: "${t.status}"`).toContain(t.status);
    }
  });

  test('all categories are valid', () => {
    for (const t of threads.threads) {
      expect(VALID_THREAD_CATEGORIES, `Thread "${t.id}" has invalid category: "${t.category}"`).toContain(t.category);
    }
  });

  test('all threads have a non-empty summary', () => {
    for (const t of threads.threads) {
      expect(t.summary, `Thread "${t.id}" has no summary`).toBeTruthy();
    }
  });
});
