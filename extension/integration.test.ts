/**
 * End-to-end test of the extension's enforcement path.
 *
 * The unit tests cover the shared engine, but they cannot see how the extension
 * *calls* it. Two real bugs slipped through exactly that gap: background.js
 * invoked chapter functions on the wrong global (`DGRules` instead of
 * `DGChapters`), and passed a bare array where `evaluateChapterCollection`
 * expects `{ chapters }`. Both only surface against live data, so the suite
 * stayed green while the extension failed in the browser.
 *
 * This loads the actual built bundles and background.js into a VM with a
 * stubbed `chrome`, then drives the same entry points the browser does.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const here = dirname(fileURLToPath(import.meta.url));

/** Monday 19 Oct 2026, 21:00 Dubai (UTC+4) — inside a 20:40–09:00 window. */
const FIXED_NOW_MS = Date.parse("2026-10-19T17:00:00.000Z");

/** Blocks facebook.com, Mon–Thu 20:40–09:00 Dubai, for the whole household. */
const blockingCommitment = {
  id: 9,
  familyId: "family-test",
  title: "weekend social media times",
  terms: "No social media after 20:40",
  members: "everyone",
  rules: {
    timezone: "Asia/Dubai",
    entries: [
      {
        scope: "specific",
        domains: ["facebook.com"],
        windows: [{ days: [1, 2, 3, 4], start: "20:40", end: "09:00" }],
        appliesTo: [],
        action: "block",
      },
    ],
  },
};

const bedtimePack = {
  id: "pack-1",
  title: "Bedtime basics",
  summary: "No games at night",
  memberIds: [],
  rules: {
    timezone: "Asia/Dubai",
    entries: [
      {
        scope: "specific",
        domains: ["roblox.com"],
        windows: [{ days: [1, 2, 3, 4], start: "20:40", end: "09:00" }],
        appliesTo: [],
        action: "block",
      },
    ],
  },
};

function makeChrome(stored: Record<string, unknown>) {
  const local: Record<string, unknown> = { ...stored };
  const noop = () => {};
  return {
    local,
    api: {
      runtime: {
        getURL: (p: string) => `chrome-extension://dg-test/${p}`,
        onInstalled: { addListener: noop },
        onStartup: { addListener: noop },
        onMessage: { addListener: noop },
      },
      alarms: { create: noop, onAlarm: { addListener: noop } },
      storage: {
        local: {
          async get(keys?: string | string[] | null) {
            if (keys == null) return { ...local };
            const list = Array.isArray(keys) ? keys : [keys];
            const out: Record<string, unknown> = {};
            for (const k of list) if (k in local) out[k] = local[k];
            return out;
          },
          async set(obj: Record<string, unknown>) {
            Object.assign(local, obj);
          },
        },
        sync: {
          async get() {
            return { familyAccessKey: "test-key" };
          },
        },
      },
      declarativeNetRequest: {
        async getDynamicRules() {
          return [];
        },
        async updateDynamicRules() {},
      },
    },
  };
}

/** Load the real extension files into a VM and hand back its test hooks. */
function loadExtension(stored: Record<string, unknown> = {}) {
  const { api } = makeChrome(stored);
  const context = vm.createContext({ chrome: api, console });

  // Freeze the clock inside the VM's own realm, so the window arithmetic the
  // bundle performs is deterministic instead of depending on the wall clock.
  const HostDate = Date;
  context.Date = class extends HostDate {
    constructor(...args: unknown[]) {
      if (args.length === 0) super(FIXED_NOW_MS);
      else super(...(args as []));
    }
  };

  // background.js pulls in its two bundles the same way the service worker does.
  context.importScripts = (...urls: string[]) => {
    for (const url of urls) {
      const file = String(url).split("/").pop() as string;
      vm.runInContext(readFileSync(join(here, file), "utf8"), context, { filename: file });
    }
  };

  vm.runInContext(readFileSync(join(here, "background.js"), "utf8"), context, {
    filename: "background.js",
  });

  const hooks = vm.runInContext("globalThis.__dgTestHooks", context) as {
    evaluateHost: (hostname: string) => Promise<{ blocked: boolean; reminded: boolean }>;
    applyRules: (commitments: unknown, chapters: unknown) => Promise<void>;
  };

  expect(hooks, "background.js must expose __dgTestHooks").toBeTruthy();
  return { hooks };
}

describe("extension enforcement path", () => {
  it("blocks a site through the real bundled engine", async () => {
    const { hooks } = loadExtension({
      commitments: [blockingCommitment],
      chapters: [],
      member: null,
    });

    const verdict = await hooks.evaluateHost("facebook.com");
    expect(verdict.blocked).toBe(true);
  });

  it("leaves an unrelated site alone", async () => {
    const { hooks } = loadExtension({
      commitments: [blockingCommitment],
      chapters: [],
      member: null,
    });

    const verdict = await hooks.evaluateHost("example.com");
    expect(verdict.blocked).toBe(false);
  });

  it("survives an empty chapter list", async () => {
    // Regression: threw "collection.chapters is not iterable" because the
    // extension passed a bare array instead of { chapters }.
    const { hooks } = loadExtension({
      commitments: [blockingCommitment],
      chapters: [],
      member: null,
    });

    const verdict = await hooks.evaluateHost("facebook.com");
    expect(verdict.blocked).toBe(true);
  });

  it("blocks from a content pack alone", async () => {
    // Regression: threw "DGRules.evaluateChapterCollection is not a function"
    // because the chapter functions were called on the wrong global.
    const { hooks } = loadExtension({
      commitments: [],
      chapters: [bedtimePack],
      member: null,
    });

    const verdict = await hooks.evaluateHost("roblox.com");
    expect(verdict.blocked).toBe(true);
  });

  it("builds dynamic rules from commitments and chapters", async () => {
    const { hooks } = loadExtension();

    // Throws if either the namespace or the chapter shape regresses.
    await hooks.applyRules([blockingCommitment], [bedtimePack]);
  });

  it("builds dynamic rules from an empty configuration", async () => {
    const { hooks } = loadExtension();
    await hooks.applyRules([], []);
  });
});
