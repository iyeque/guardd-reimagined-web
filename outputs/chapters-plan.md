# Plan — chapters (Family Commitments content packs)

**Project:** guardd-reimagined-web
**File:** shared/chapters.ts + a content-pack library
**Status:** pre-approval design · reviewed against the live code, not guessed
**Date:** 2026-10-12

> This is the scope and checklist. It says what Chapters *is*, not what it isn't —
> and what I'm not doing today.

---

## 1 · What Chapters is (and isn't)

**What it is.** A content library per family, per device, surfaced by the existing
extension. A *Chapter* is a themed pack of games rated to a member's age and
family role (`kids` / `teens` / `parents` / `family`), with a title, a one-line
summary, an icon, a difficulty, and a play order. The family picks which members
a chapter is for; the extension gates real-world behaviour on a chapter being
completed.

**What it is not.**

- **One server table.** `server/` has no `chapters` table and no `/api/chapters`
  route. Content is the client / extension's job. That is by design: the
  family-access work deliberately made the web app opinion-free, and chapters are
  the family's own content. There is no sign-up or admin path for it yet.
- **A school / timeline system.** "Units", "terms", "weeks" are a future phase.
  Chapters here are self-contained packs, not a curriculum map.
- **A rewrite of EducationalGames.** Games keep working exactly as they do now.
  Chapters are a library on top of them.

---

## 2 · Data model — `shared/chapters.ts`

The same shape as `shared/commitment-rules.ts`: types and logic in one file,
bundled once into the extension and never copied, so the web app and the
extension cannot drift.

```ts
// shared/chapters.ts

/** Which family member this chapter is for. */
export type ChapterKind = 'kids' | 'teens' | 'parents' | 'family';

export type ChapterDifficulty = 'Easy' | 'Medium' | 'Hard';

/** The real-world action a chapter's completion gates. */
export type RuleStatement =
  | 'complete_games_in_order'
  | 'play_for_minutes'
  | 'screen_free_block'
  | 'not_before_time';

export interface ChapterDefinition {
  id: string;            // stable, readable: "focus-week-1"
  label: string;         // "Week 1 — Focus"
  summary: string;       // one line the member reads
  path: string[];        // game ids, in play order
  difficulty: ChapterDifficulty;
  kind: ChapterKind;     // for which family member
  members: string[];     // linked to family member nicknames
  color: string;         // for the library tile
  rule: RuleStatement;   // what a completed chapter unlocks
  requireAll: boolean;   // block until every game is done
}
```

Design notes (these follow from the stuff I already built, not my opinion):

- **A chapter is content, not code.** The data file is the definition. Adding a
  chapter = adding one object. The engine for enforcing it is the extension,
  which already has the machinery (`declarativeNetRequest`, `store`).
- **Progress is per profile.** There is no cross-device progress until the
  extension ships account sync, so this lives in the browser's `localStorage`,
  the same place the family-access key lives.
- **A chapter is empty until it has a `path`.** The library with no games would
  be a dead end, so the authoring step is what creates the first real chapter.

---

## 3 · What it looks like

**Web app.** A page somewhere (likely `/chapters`) that lists chapters for the
active member, in play order, with a checkmark on completed ones. Each chapter
shows its games as clickable cards. Tapping one starts it through the existing
game mechanism.

**Extension.** The same library, but the enforcement is real:

- A chapter is `active` only while `play_order` matches the member's active
  `chapterOrder`.
- Completing all of a chapter marks it done and records the completion time.
- `requireAll = true` means the child must see the "all games completed" screen
  before the chapter counts as done — otherwise they could skip straight to the
  last game.
- `rule = complete_games_in_order` etc. maps to a network rule. The rules that
  exist today are content-free ("block site X during Y"), so a real "complete
  the chapter" rule is the first *meaningful* rule we add.
- A **remember** rule for the chapter summary appears mid-game: that's the
  anti-cheating step.

**Progress model.** Per profile, over the browser. A member's completed chapters
are persisted when the browser tab closes; unlike the family-access key, this is
never meant to be portable, so no QR/shortcode export is needed.

---

## 4 · The implementation plan (smallest first)

### Phase A — Content library + rule engine
1. Write `shared/chapters.ts` with the types above.
2. Write the construction logic: build the per-member chapter list from a
   content source + the member's `kind` and `members` selectors.
3. Add a `GameDefinition` so game data lives in the same file as the chapter
   content (not duplicated across the web app and the extension).
4. Verify: `tsc` clean, `npm test` green. The engine builds a chapter list with
   3+ games and correct difficulty/*kind* filters. NOT YET SHIPPED.

### Phase B — Extension compliance
5. Extension reads a chapter's `rule` and builds the matching
   `declarativeNetRequest` rules at sync time. "Complete the chapter before
   21:00" becomes a time-block, not just "block a domain".
6. Add the "remember the summary" mid-game prompt as the anti-cheating step.
7. Verify: the mocked-DNR test suite covers `complete_games_in_order`;
   manual review confirms nothing blocks outside the agreed window.

### Phase C — Authoring UI
8. Add a "Create a chapter" form on `/chapters` that writes a `ChapterDefinition`
   into a content file. No bespoke admin UI — a plain, self-contained form.
9. Show the current chapter the member is working through, with a
   "complete" screen that records the completion in local storage.
10. Verify: 3+ chapters can be authored, played, and completed without a page
    reload; a fresh import starts from the default chapter set.

### Phase D — Distribution
11. Tree-shake the extension so `rules.js` only ships the rules the active
    chapters use.
12. Browser-store `manifest_version` / `permission` justification so a store
    listing is possible without a store-specific rewrite.
13. Verify: build passes, `rules.js` is present and subsetted, `manifest.json`
    is valid.

---

## 5 · Checklist (the items you can point to as "did it work")

| # | Item | Verified by |
|---|---|---|
| 1 | `npm test` 15/15, `tsc --noEmit` clean | command output |
| 2 | A chapter's `path` resolves to real games (no dangling ids) | unit test |
| 3 | Manual switch of `kind` / `members` changes the library (not just the label) | eyeballed + screenshot |
| 4 | Extension enforces a rule only inside its window | mocked-DNR test |
| 5 | Completing every game records the completion, isn't lost on reload | 2-page session test |
| 6 | `requireAll` blocks until all games are done | manual playback |
| 7 | Adding a chapter from the form lands in the library | eyeballed |

---

## 6 · The honest open points

1. **Cost of Phase C.** A working authoring UI is ~1–2 days in total across all
   phases, and it is the only place a family adds their own content. I'd rather
   ship A + C than B + C and leave the library empty.
2. **Enforcement is a first-class rule.** Today the extension has no *meaningful*
   rule — its single "rule" today is just "block a domain". Task 10 is the first
   genuinely meaningful rule type, so building on it here is cheap.
3. **Cross-device is a future phase.** Chapter progress is per-browser for now.
   Any "continue on another device" story needs a real account, which touches
   `server/routes.ts` and `profiles.ts`.

---

## Approval checklist — what I need from you before cooking

- [ ] You're happy that Chapters is **content, not a server schema** (Phase A is
       authoring, not data modelling).
- [ ] You're happy with the price: **no cross-device progress**, and a
       "complete a chapter" rule that adds enforcement beyond today's domain
       blocks.
- [ ] I have approval to start, either:
  - **Immediate** — build A + C (library + authoring UI) and skip B until we've
    talked about the enforcement wording; or
  - **Hold** until you've confirmed the chapter wording and the enforcement
    semantics with the family.

I've kept this to what we can actually ship in a session. Pushing the
cross-device and curricular work into future commits if it comes up.
