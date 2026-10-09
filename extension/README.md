# Digital Guardian — Family Commitments extension

A Manifest V3 browser extension that enforces a family's agreed commitments at the
browser level: blocking the sites they agreed to avoid, during the hours they
agreed, for the child they agreed about.

## What works today (Phase 3)

- **Pairs with one family access key.** The key is the only credential — it
  identifies the family server-side, so the extension never stores or guesses a
  `familyId`.
- **Syncs commitments every 30 minutes** and caches them locally, so enforcement
  keeps working offline.
- **Evaluates rules with the same engine the web app uses.**

## Not built yet (Phase 4)

`declarativeNetRequest` blocking and the reminder overlay. The plumbing is in
place — `applyRules()` in `background.js` is where per-domain rules get pushed.

## Load it

```
npm run build:extension      # bundles shared/commitment-rules.ts -> extension/rules.js
```

Then `chrome://extensions` → **Developer mode** → **Load unpacked** → select
`extension/`.

## Pairing

1. In Digital Guardian, open **Family Commitments** → **Connect this device** and
   copy the key.
2. Paste it into the extension's options page.
3. Pick which child uses this browser, or leave it on **Everyone** for a shared
   machine.

A rejected key is reported plainly rather than silently retrying every 30 minutes.

## Architecture

```
shared/commitment-rules.ts   ← single source of truth for rule decisions
        │  npm run build:extension (esbuild)
        ▼
extension/rules.js          ← bundled, exposes global DGRules
        │
        ├── background.js   ← syncs, evaluates, arms the next window boundary
        └── content.js      ← renders the agreement (Phase 4)
```

The rule engine is **never** duplicated. If the web app's blocking behaviour
changes, `shared/commitment-rules.ts` changes and the bundle is rebuilt — a test
compares the bundle against the source so drift cannot pass unnoticed.

## The timezone / boundary trap

`declarativeNetRequest` evaluates a **static** rule set — it has no concept of
time. A rule only applies inside its window, so the rule set must be re-applied
whenever a window edge is crossed, or blocks stay active outside the agreed hours.
`nextWindowBoundary()` in `background.js` computes the next edge and arms an alarm
for it. This is the single most likely bug in this feature.

## Verification

```
npx tsx tmp/compare-engines.ts   # bundle vs source, same inputs
node tmp/verify-boundary.mjs     # window-boundary arming
```

`tmp/` is scratch and gitignored; promote anything worth keeping into `scripts/`.
