# Commitment Extension — Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Build a Manifest V3 browser extension that reads the family's commitments from the existing API and enforces them at the browser level — blocking agreed sites during agreed hours and showing a reminder overlay that quotes the family agreement instead of a generic "blocked" page.

**Architecture:** Rules are stored as structured JSON on the existing `family_commitments` row (one source of truth), authored through the web app's parent UI. A single shared pure function evaluates "is this blocked right now" and is consumed by both the web app and the extension, so the two can never disagree. The extension pairs by Family ID (the same ID the web app already uses) and evaluates rules locally, so blocking keeps working when offline.

**Tech Stack:** TypeScript, Manifest V3 (chrome.declarativeNetRequest + service worker), Drizzle ORM (existing), React (existing parent UI), Vitest (new — for the rule engine).

**Source of truth:** `docs/commitment-enforcement-research.md` option #1.

---

## Current Context

Verified facts from the codebase as of this plan:

- `shared/schema.ts:75-86` — `familyCommitments` has `title`, `terms`, `members` (free text), `status`, `ledgerHash`, `metadataCid`. **No enforcement fields.** This is why the `rules` column is step one.
- `server/routes.ts:413-520` — endpoints exist and are **unauthenticated**: `GET /api/family/commitments?familyId=`, `GET /:id`, `POST /`, `POST /:id/complete`, `POST /:id/milestones`.
- `src/lib/profiles.ts:61` — `familyId` is generated as `family-${id.slice(0,8)}` and lives in localStorage profiles.
- `src/pages/FamilyCommitments.tsx:47-86` — existing client API wrapper; extend, don't duplicate.
- Build command includes `npm run db:push`, so a schema change migrates automatically on Vercel deploy.
- **No test framework installed** (`package.json` has no `test` script, no vitest/jest). Task 1 fixes that.

---

## Open Risks (read before starting)

| Risk | Severity | Mitigation |
|---|---|---|
| **The API is unauthenticated.** Any Family ID grants read/write to that family's commitments. | High — pre-existing, not introduced here | Out of scope for this plan, but the extension must not write. Extension is **read-only** against the API. Tracked as a follow-up. |
| **A wrong rule blocks the wrong kid.** No timezone handling means "21:00" is ambiguous. | High | Rules engine is pure and unit-tested (Task 2). Store the family's IANA timezone on the rule set and evaluate in that zone, not the browser's. |
| `declarativeNetRequest` cannot match wildcards in a way that covers subdomains for free. | Medium | Normalize domains to a `requestDomains` matcher plus explicit `www.` handling; test with a real subdomain. |
| Encrypted `terms`/`members` are decrypted server-side and returned in plaintext. | Medium | Accepted for MVP; the extension needs the agreement text to quote it. |

---

## Proposed Approach

**Phase 1 — data model + rule engine (the part that must be right)**
**Phase 2 — parent authoring UI in the web app**
**Phase 3 — extension shell + pairing**
**Phase 4 — enforcement (blocking + reminder overlay)**

Rule shape (stored as JSON in `family_commitments.rules`):

```ts
type CommitmentRules = {
  timezone: string;              // IANA, e.g. "Asia/Dubai" — rules evaluate in THIS zone
  entries: RuleEntry[];
};

type RuleEntry = {
  domains: string[];             // ["instagram.com", "tiktok.com"] — matched on suffix
  windows: TimeWindow[];         // when this entry applies
  appliesTo: string[];           // member names; [] = whole family
  action: "block" | "remind";
};

type TimeWindow = {
  days: number[];                // 0=Sun..6=Sat
  start: string;                 // "21:00" local to `timezone`
  end: string;                   // "07:00" (may wrap past midnight)
};
```

The evaluator (in `shared/commitment-rules.ts`, imported by web app and extension alike):

```ts
export type RuleVerdict =
  | { blocked: false }
  | { blocked: true; commitmentId: number; title: string; terms: string; agreedBy: string };

export function evaluateCommitmentRules(
  commitments: Array<{ id: number; title: string; terms: string; members: string; rules: CommitmentRules | null }>,
  input: { hostname: string; member: string | null; now: Date },
): RuleVerdict
```

---

## Step-by-Step Plan

### Phase 1 — Data model and rule engine

---

### Task 1: Add Vitest

**Objective:** Give the rule engine a test runner, since it has none.

**Files:**
- Modify: `package.json`

**Step 1: Install**

```bash
npm install -D vitest
```

**Step 2: Add the script** — in `package.json` `scripts`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

**Step 3: Verify**

Run: `npx vitest --version`
Expected: a version number, exit 0.

**Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(test): add vitest for rule engine"
```

---

### Task 2: Add the `rules` column to the schema

**Objective:** Store structured enforcement rules on each commitment.

**Files:**
- Modify: `shared/schema.ts:75-86`

**Step 1: Add the column**

In `shared/schema.ts`, after `metadataCid`:

```ts
  rules: jsonb("rules").$type<CommitmentRules | null>(),
```

**Step 2: Export the types** — add above the table definition:

```ts
export type TimeWindow = {
  days: number[];
  start: string;
  end: string;
};

export type RuleEntry = {
  domains: string[];
  windows: TimeWindow[];
  appliesTo: string[];
  action: "block" | "remind";
};

export type CommitmentRules = {
  timezone: string;
  entries: RuleEntry[];
};
```

**Step 3: Migrate** (additive, nullable — safe on live data)

Run: `npm run db:push`
Expected: column added, no data loss.

**Step 4: Verify**

Run: `npx tsc --noEmit`
Expected: exit 0.

**Step 5: Commit**

```bash
git add shared/schema.ts
git commit -m "feat(commitments): add nullable rules jsonb column"
```

---

### Task 3: Write the rule engine — failing tests first

**Objective:** Pin down "is this blocked right now" with tests before any implementation exists.

**Files:**
- Test: `shared/commitment-rules.test.ts`

**Step 1: Write failing test**

```ts
import { describe, it, expect } from "vitest";
import { evaluateCommitmentRules, type CommitmentLike } from "./commitment-rules";

const base = {
  id: 1,
  title: "No social media after 9pm",
  terms: "We agreed as a family that screens stop at 21:00 on school nights.",
  members: "Amina, Dad",
};

const makeCommitment = (over: Partial<CommitmentLike> = {}): CommitmentLike => ({
  ...base,
  rules: {
    timezone: "UTC",
    entries: [
      {
        domains: ["instagram.com", "tiktok.com"],
        windows: [{ days: [0, 1, 2, 3, 4], start: "21:00", end: "07:00" }],
        appliesTo: [],
        action: "block",
      },
    ],
  },
  ...over,
});

// 2026-10-11 is a Sunday (day 0). 22:00 UTC is inside the window.
const sunday22 = new Date("2026-10-11T22:00:00Z");
// 2026-10-12 is a Monday (day 1). 20:00 UTC is before the window.
const monday20 = new Date("2026-10-12T20:00:00Z");

describe("evaluateCommitmentRules", () => {
  it("blocks a listed domain inside the window", () => {
    const v = evaluateCommitmentRules([makeCommitment()], {
      hostname: "www.instagram.com",
      member: "Amina",
      now: sunday22,
    });
    expect(v.blocked).toBe(true);
  });

  it("allows the same domain outside the window", () => {
    const v = evaluateCommitmentRules([makeCommitment()], {
      hostname: "www.instagram.com",
      member: "Amina",
      now: monday20,
    });
    expect(v.blocked).toBe(false);
  });

  it("does not block a domain that is not listed", () => {
    const v = evaluateCommitmentRules([makeCommitment()], {
      hostname: "wikipedia.org",
      member: "Amina",
      now: sunday22,
    });
    expect(v.blocked).toBe(false);
  });

  it("ignores commitments with null rules", () => {
    const v = evaluateCommitmentRules([makeCommitment({ rules: null })], {
      hostname: "www.instagram.com",
      member: "Amina",
      now: sunday22,
    });
    expect(v.blocked).toBe(false);
  });

  it("blocks a window that wraps past midnight", () => {
    const c = makeCommitment({
      rules: {
        timezone: "UTC",
        entries: [
          {
            domains: ["instagram.com"],
            windows: [{ days: [1], start: "21:00", end: "07:00" }],
            appliesTo: [],
            action: "block",
          },
        ],
      },
    });
    // Monday 23:00 — inside a 21:00→07:00 window that started Monday
    expect(
      evaluateCommitmentRules([c], { hostname: "instagram.com", member: null, now: new Date("2026-10-12T23:00:00Z") }).blocked,
    ).toBe(true);
    // Tuesday 02:00 — still inside, the window carried over
    expect(
      evaluateCommitmentRules([c], { hostname: "instagram.com", member: null, now: new Date("2026-10-13T02:00:00Z") }).blocked,
    ).toBe(true);
    // Tuesday 08:00 — window has closed
    expect(
      evaluateCommitmentRules([c], { hostname: "instagram.com", member: null, now: new Date("2026-10-13T08:00:00Z") }).blocked,
    ).toBe(false);
  });

  it("honours appliesTo when a member is set", () => {
    const c = makeCommitment({
      rules: {
        timezone: "UTC",
        entries: [
          {
            domains: ["instagram.com"],
            windows: [{ days: [0, 1, 2, 3, 4], start: "21:00", end: "07:00" }],
            appliesTo: ["Amina"],
            action: "block",
          },
        ],
      },
    });
    expect(
      evaluateCommitmentRules([c], { hostname: "instagram.com", member: "Amina", now: sunday22 }).blocked,
    ).toBe(true);
    expect(
      evaluateCommitmentRules([c], { hostname: "instagram.com", member: "Dad", now: sunday22 }).blocked,
    ).toBe(false);
  });

  it("evaluates in the rule's timezone, not the browser's", () => {
    // Rule says 21:00 Asia/Dubai (UTC+4). At 19:00 UTC it is 23:00 local → blocked.
    const c = makeCommitment({
      rules: {
        timezone: "Asia/Dubai",
        entries: [
          {
            domains: ["instagram.com"],
            windows: [{ days: [0], start: "21:00", end: "23:59" }],
            appliesTo: [],
            action: "block",
          },
        ],
      },
    });
    expect(
      evaluateCommitmentRules([c], { hostname: "instagram.com", member: null, now: new Date("2026-10-11T19:00:00Z") }).blocked,
    ).toBe(true);
  });

  it("returns the agreement text so the overlay can quote it", () => {
    const v = evaluateCommitmentRules([makeCommitment()], {
      hostname: "instagram.com",
      member: "Amina",
      now: sunday22,
    });
    expect(v.blocked).toBe(true);
    if (v.blocked) {
      expect(v.title).toContain("No social media");
      expect(v.terms).toContain("agreed as a family");
    }
  });
});
```

**Step 2: Run test to verify failure**

Run: `npx vitest run shared/commitment-rules.test.ts`
Expected: FAIL — cannot resolve `./commitment-rules`.

---

### Task 4: Implement the rule engine

**Objective:** Make Task 3's tests pass.

**Files:**
- Create: `shared/commitment-rules.ts`

**Step 1: Write the implementation**

```ts
import type { CommitmentRules } from "./schema";

export type CommitmentLike = {
  id: number;
  title: string;
  terms: string;
  members: string;
  rules: CommitmentRules | null;
};

export type RuleVerdict =
  | { blocked: false }
  | {
      blocked: true;
      commitmentId: number;
      title: string;
      terms: string;
      agreedBy: string;
    };

/** "21:00" -> minutes since midnight. Returns null for malformed input. */
function parseClock(value: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

/** Local (to the rule's timezone) day-of-week and minutes-since-midnight. */
function zonedParts(now: Date, timezone: string): { day: number; minutes: number } {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const weekdays: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };
  // Intl can render midnight as "24" in some environments; normalise it.
  const hour = Number(get("hour")) % 24;
  return {
    day: weekdays[get("weekday")] ?? now.getDay(),
    minutes: hour * 60 + Number(get("minute")),
  };
}

function windowCovers(
  window: { days: number[]; start: string; end: string },
  day: number,
  minutes: number,
): boolean {
  const start = parseClock(window.start);
  const end = parseClock(window.end);
  if (start === null || end === null) return false;
  if (!window.days.includes(day)) return false;
  if (start <= end) return minutes >= start && minutes < end;
  // Wraps past midnight: covers late evening of `day`, and early hours of the next day.
  if (minutes >= start) return true;
  const prevDay = (day + 6) % 7;
  return window.days.includes(prevDay) && minutes < end;
}

function hostMatches(rule: string, hostname: string): boolean {
  const clean = rule.trim().toLowerCase().replace(/^www\./, "");
  const host = hostname.toLowerCase().replace(/^www\./, "");
  return host === clean || host.endsWith(`.${clean}`);
}

export function evaluateCommitmentRules(
  commitments: CommitmentLike[],
  input: { hostname: string; member: string | null; now: Date },
): RuleVerdict {
  for (const commitment of commitments) {
    const rules = commitment.rules;
    if (!rules?.entries?.length) continue;
    if (!rules.timezone) continue;

    const { day, minutes } = zonedParts(input.now, rules.timezone);

    for (const entry of rules.entries) {
      if (!entry.domains.some((d) => hostMatches(d, input.hostname))) continue;

      if (entry.appliesTo.length > 0) {
        if (!input.member) continue; // unknown user: a member-scoped rule does not apply
        const names = entry.appliesTo.map((n) => n.trim().toLowerCase());
        if (!names.includes(input.member.trim().toLowerCase())) continue;
      }

      const active = entry.windows.some((w) => windowCovers(w, day, minutes));
      if (!active) continue;

      return {
        blocked: true,
        commitmentId: commitment.id,
        title: commitment.title,
        terms: commitment.terms,
        agreedBy: commitment.members,
      };
    }
  }
  return { blocked: false };
}
```

**Step 2: Run tests to verify pass**

Run: `npx vitest run shared/commitment-rules.test.ts`
Expected: 8 passed.

**Step 3: Type-check and commit**

Run: `npx tsc --noEmit`

```bash
git add shared/commitment-rules.ts shared/commitment-rules.test.ts
git commit -m "feat(commitments): add shared rule evaluation engine with tests"
```

---

### Task 5: Expose rules through the API

**Objective:** The extension reads commitments with their rules attached.

**Files:**
- Modify: `server/routes.ts:413-429`
- Modify: `src/pages/FamilyCommitments.tsx:26-37`

**Step 1: Include rules in the list response**

`server/routes.ts`, in `GET /api/family/commitments`, add `rules` to the decrypted map:

```ts
      const decrypted = await Promise.all(
        items.map(async (item) => ({
          ...item,
          rules: (item.rules ?? null) as CommitmentRules | null,
        })),
      );
```

**Step 2: Add to the client type** — `src/pages/FamilyCommitments.tsx`:

```ts
type Commitment = {
  id: number;
  familyId: string;
  title: string;
  terms: string;
  members: string;
  status: string;
  rules: CommitmentRules | null;
  ledgerHash: string | null;
  metadataCid: string | null;
  startedAt: string | Date;
  completedAt: string | Date | null;
};
```

**Step 3: Verify**

Run: `npx tsc --noEmit`

**Step 4: Commit**

```bash
git add server/routes.ts src/pages/FamilyCommitments.tsx
git commit -m "feat(commitments): expose rules on the commitments API"
```

---

### Phase 2 — Parent authoring UI

---

### Task 6: Add a rules editor to the commitment form

**Objective:** A parent can define blocked domains, time windows, and who a rule applies to.

**Files:**
- Create: `src/components/commitments/RuleEditor.tsx`
- Modify: `src/pages/FamilyCommitments.tsx` (create form + `api.create`)

**Step 1: Build the editor component**

`RuleEditor.tsx` — controlled inputs for:
- `timezone` (default from `Intl.DateTimeFormat().resolvedOptions().timeZone`, editable)
- one or more entries, each with: domain list (comma-separated), day-of-week toggles, start/end time, applies-to (chips from the `members` field), action (`block` | `remind`)

Validation before submit: at least one domain, at least one day, well-formed `HH:MM` times, non-empty timezone. Surface errors with the existing `toast.error` pattern.

**Step 2: Wire into the create form** — add `rules` to the `api.create` body and the zod schema in `server/routes.ts:448-489`:

```ts
        .object({
          familyId: z.string(),
          title: z.string(),
          terms: z.string(),
          members: z.string(),
          rules: z
            .object({
              timezone: z.string().min(1),
              entries: z
                .array(
                  z.object({
                    domains: z.array(z.string().min(1)),
                    windows: z.array(
                      z.object({
                        days: z.array(z.number().min(0).max(6)),
                        start: z.string().regex(/^\d{1,2}:\d{2}$/),
                        end: z.string().regex(/^\d{1,2}:\d{2}$/),
                      }),
                    ),
                    appliesTo: z.array(z.string()),
                    action: z.enum(["block", "remind"]),
                  }),
                )
                .min(1),
            })
            .nullable(),
        })
```

**Step 3: Verify** — `npx tsc --noEmit`, then create a commitment with rules via the UI.

**Step 4: Commit**

```bash
git add src/components/commitments/RuleEditor.tsx src/pages/FamilyCommitments.tsx server/routes.ts
git commit -m "feat(commitments): parent UI for authoring enforcement rules"
```

---

### Phase 3 — Extension shell and pairing

---

### Task 7: Scaffold the extension

**Objective:** A loadable MV3 extension with a settings page.

**Files:**
- Create: `extension/manifest.json`
- Create: `extension/options.html`, `extension/options.js`
- Create: `extension/README.md`
- Modify: `.gitignore` (ignore `extension/*.log`)

**Step 1: manifest.json**

```json
{
  "manifest_version": 3,
  "name": "Digital Guardian — Family Commitments",
  "version": "0.1.0",
  "description": "Enforces your family's agreed commitments at the browser level.",
  "permissions": ["storage", "declarativeNetRequest", "tabs"],
  "host_permissions": ["https://digitalguardianwellness.org/*"],
  "action": { "default_title": "Family Commitments" },
  "options_page": "options.html",
  "background": { "service_worker": "background.js" },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "run_at": "document_start"
    }
  ]
}
```

**Step 2: Options page** — inputs for `familyId` and `memberName`, saved to `chrome.storage.sync` (falls back to `local`). Shows a live status: connected / wrong Family ID / no commitments.

**Step 3: Verify** — `chrome://extensions` → Developer mode → Load unpacked → select `extension/`. Confirm the options page saves and reloads the values.

**Step 4: Commit**

```bash
git add extension/
git commit -m "feat(extension): scaffold MV3 extension with family-ID pairing"
```

---

### Task 8: Sync commitments into the extension

**Objective:** The extension holds the family's commitments locally so blocking works offline.

**Files:**
- Create: `extension/background.js` (or `background.ts` built to JS)
- Modify: `extension/manifest.json`

**Step 1: Fetch on a schedule**

In the service worker, read `chrome.storage` for `familyId`, then:

```js
const API = "https://digitalguardianwellness.org/api/family/commitments";
const ALARM = "dg-sync-commitments";

chrome.alarms.create(ALARM, { periodInMinutes: 30 });
chrome.alarms.onAlarm.addListener((a) => { if (a.name === ALARM) sync(); });
chrome.runtime.onStartup.addListener(sync);
chrome.runtime.onInstalled.addListener(sync);

async function sync() {
  const { familyId } = await chrome.storage.sync.get("familyId");
  if (!familyId) return;
  const res = await fetch(`${API}?familyId=${encodeURIComponent(familyId)}`);
  if (!res.ok) throw new Error(`sync failed: ${res.status}`);
  const commitments = await res.json();
  await chrome.storage.local.set({ commitments, syncedAt: Date.now() });
  await applyRules(commitments);
}
```

Add `"alarms"` to `permissions` in `manifest.json`.

**Step 2: Verify** — set a valid Family ID in options, wait for sync, confirm `chrome.storage.local` contains commitments (check via the options page status line).

**Step 3: Commit**

```bash
git add extension/background.js extension/manifest.json
git commit -m "feat(extension): sync commitments on a schedule for offline enforcement"
```

---

### Phase 4 — Enforcement

---

### Task 9: Block domains with declarativeNetRequest

**Objective:** Listed domains are actually blocked during active windows.

**Files:**
- Modify: `extension/background.js`

**Step 1: Build dynamic rules**

Port the Task 4 evaluator into the extension (copy `shared/commitment-rules.ts` compiled to plain JS, so there is one algorithm, not two). Then:

```js
async function applyRules(commitments) {
  const { memberName } = await chrome.storage.sync.get("memberName");
  const addRules = [];
  let id = 1;
  for (const c of commitments) {
    const verdict = evaluateCommitmentRules([c], {
      hostname: HOSTNAME_PLACEHOLDER, // see note below
      member: memberName ?? null,
      now: new Date(),
    });
    if (!verdict.blocked) continue;
    for (const entry of c.rules.entries) {
      for (const domain of entry.domains) {
        addRules.push({
          id: id++,
          priority: 1,
          action: { type: "block" },
          condition: { requestDomains: [domain], resourceTypes: ["main_frame"] },
        });
      }
    }
  }
  const old = await chrome.declarativeNetRequest.getDynamicRules();
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: old.map((r) => r.id),
    addRules,
  });
}
```

**Note on hostname:** `declarativeNetRequest` is not time-aware — it evaluates a static rule set. Because a rule only applies *during its window*, you must re-apply the rules whenever the boundary changes. Add a `chrome.alarms` entry for the next window boundary (computed from the rule set) and re-run `applyRules` then. Skipping this leaves blocks active outside their window — the single most likely bug in this feature.

**Step 2: Verify** — create a commitment blocking `example.com` with an always-on window, load the extension, visit `example.com`. Expect a blocked network request. Then set the window to a past range and confirm it is reachable after the alarm fires.

**Step 3: Commit**

```bash
git add extension/background.js
git commit -m "feat(extension): enforce domain blocks via declarativeNetRequest"
```

---

### Task 10: Reminder overlay with the family agreement text

**Objective:** The novel part — instead of a generic block, the visitor sees what the family actually agreed to.

**Files:**
- Create: `extension/content.js`
- Modify: `extension/manifest.json`

**Step 1: Content script**

At `document_start`, ask the background worker to evaluate the current tab's hostname against the commitments:

```js
chrome.runtime.sendMessage({ type: "dg:evaluate", hostname: location.hostname }, (verdict) => {
  if (!verdict?.blocked) return;
  const style = document.createElement("style");
  style.textContent = `
    .dg-commitment-overlay { position: fixed; inset: 0; z-index: 2147483647;
      background: #0F172A; color: #F8FAFC; display: flex; align-items: center;
      justify-content: center; padding: 24px; font-family: system-ui, sans-serif; }
    .dg-card { max-width: 34rem; text-align: center; }
    .dg-title { font-size: 1.5rem; font-weight: 700; color: #4FD1C5; margin-bottom: 12px; }
    .dg-terms { font-size: 0.95rem; line-height: 1.6; color: #CBD5E1; margin-bottom: 16px; }
    .dg-meta { font-size: 0.8rem; color: #64748B; }`;
  document.documentElement.appendChild(style);

  const overlay = document.createElement("div");
  overlay.className = "dg-commitment-overlay";
  overlay.innerHTML = `
    <div class="dg-card">
      <div class="dg-title"></div>
      <div class="dg-terms"></div>
      <div class="dg-meta"></div>
    </div>`;
  overlay.querySelector(".dg-title").textContent = verdict.title;
  overlay.querySelector(".dg-terms").textContent = `"${verdict.terms}"`;
  overlay.querySelector(".dg-meta").textContent =
    `Agreed by: ${verdict.agreedBy}`;

  const mount = () => document.documentElement.appendChild(overlay);
  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount);
});
```

**Use `textContent`, never `innerHTML`, for the agreement text** — `terms` is user-authored and would otherwise be an injection vector in the extension.

**Step 2: Verify** — with an active block rule, navigate to the domain. Expect the overlay quoting the real `terms`, with `textContent` confirmed (put `<b>hi</b>` in a terms field and check it renders as literal text).

**Step 3: Commit**

```bash
git add extension/content.js extension/manifest.json
git commit -m "feat(extension): show family agreement text on blocked pages"
```

---

## Files Likely to Change

| File | Change |
|---|---|
| `package.json` | vitest devDep + test scripts |
| `shared/schema.ts` | `rules` jsonb column + exported types |
| `shared/commitment-rules.ts` | **new** — rule evaluator |
| `shared/commitment-rules.test.ts` | **new** — 8 tests |
| `server/routes.ts` | accept + return `rules` |
| `src/pages/FamilyCommitments.tsx` | `rules` on type + create body |
| `src/components/commitments/RuleEditor.tsx` | **new** — parent authoring UI |
| `extension/` | **new directory** — manifest, background, content, options |

## Tests / Validation

- `npx vitest run` — 8 rule-engine tests green (the highest-risk logic).
- `npx tsc --noEmit` — clean.
- `npm run build` — succeeds.
- Manual, in order: author a rule in the web app → sync the extension → confirm block → advance past the window boundary → confirm unblock.
- Negative check: a commitment with `rules: null` blocks nothing (regression guard for existing rows).

## Out of Scope (deliberately)

- **API authentication.** The endpoints are wide open. The extension is read-only by design, but this is a real exposure and should be its own task.
- **"Earn time" / milestone unlocks** — needs a parent-approval flow; defer until blocking works end to end.
- **Firefox-specific packaging** — MV3 covers Chrome/Edge; Firefox needs a separate manifest tweak.
- **Mobile** — the companion app is doc option #4, separate.

---

*Plan written 2026-10-09. Saved to `.hermes/plans/2026-10-09_014159-commitment-extension.md`*
