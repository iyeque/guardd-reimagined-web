/**
 * The extension loads two bundles as globals: shared/commitment-rules.ts is
 * built as `DGRules` and shared/chapters.ts as `DGChapters`. Calling a chapter
 * function on the wrong namespace throws at runtime —
 *
 *     DGRules.evaluateChapterCollection is not a function
 *
 * — and only on a path that needs live data from the server, so the extension
 * simply fails to sync while every test in the repo stays green. That happened:
 * `chapter` and `evaluateChapterCollection` were called on DGRules in three
 * places, and the only symptom was a failed sync in a real browser.
 *
 * This reads the BUILT bundles to learn which names each global actually
 * exposes, then checks every call site in the extension source against them.
 * If a function moves between the two shared modules, this fails loudly.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const here = dirname(fileURLToPath(import.meta.url));

/** Evaluate a built bundle and return the names its global exposes. */
function namesOn(bundle: string, globalName: string): Set<string> {
  // Do not pass `globalThis: undefined` — the bundle's own global assignment
  // then throws. An empty context is enough; both bundles are pure logic.
  const ctx = vm.createContext({});
  vm.runInContext(readFileSync(join(here, bundle), "utf8"), ctx);
  const value = vm.runInContext(globalName, ctx);
  return new Set(Object.keys(value ?? {}));
}

const CONSUMERS = ["background.js", "content.js", "blocked.js", "options.js"];
const BUNDLE_OF: Record<string, string> = { DGRules: "rules.js", DGChapters: "chapters.js" };

describe("extension global namespaces", () => {
  it("defines both globals, so no call site is silently undefined", () => {
    expect(namesOn("rules.js", "DGRules").size).toBeGreaterThan(0);
    expect(namesOn("chapters.js", "DGChapters").size).toBeGreaterThan(0);
  });

  it("resolves every DGRules.* / DGChapters.* call to a real export", () => {
    const available: Record<string, Set<string>> = {
      DGRules: namesOn("rules.js", "DGRules"),
      DGChapters: namesOn("chapters.js", "DGChapters"),
    };

    const problems: string[] = [];
    for (const file of CONSUMERS) {
      const src = readFileSync(join(here, file), "utf8");
      for (const match of src.matchAll(/\b(DGRules|DGChapters)\.([A-Za-z_$][\w$]*)/g)) {
        const [, namespace, name] = match;
        if (!available[namespace].has(name)) {
          problems.push(
            `${file}: ${namespace}.${name} — ${BUNDLE_OF[namespace]} does not export "${name}"`,
          );
        }
      }
    }

    expect(problems).toEqual([]);
  });

  // Guards the split itself: chapter logic must not drift into the commitment
  // engine's bundle, which is what the namespace rule above depends on.
  it("keeps chapter functions off the commitment engine's global", () => {
    const rules = namesOn("rules.js", "DGRules");
    expect(rules.has("evaluateChapterCollection")).toBe(false);
    expect(rules.has("chapter")).toBe(false);
    expect(rules.has("evaluateCommitmentRules")).toBe(true);
  });
});
