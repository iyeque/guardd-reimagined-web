/**
 * Cross-device profile data transfer (export / import) — pure logic, no UI.
 *
 * Payload format (v1 plaintext):
 *   base64url(JSON(TransferBlob))
 *
 * Scope rules:
 *  - INCLUDE: dg_profiles, dg_current_profile, and every dg_* key that is
 *    profile-scoped (course/workshop/companion progress, etc.)
 *  - EXCLUDE (device-level, never travel): dg_cookie_consent, theme,
 *    wellness-pop-highscore, and any key the app does not own.
 *
 * Import policy:
 *  - "replace"  → set profiles list + currentProfileId from blob; for each
 *                 profile in the blob, clear its existing scoped keys and
 *                 write the blob's keys; remove scoped keys belonging to
 *                 profiles NOT in the blob; leave device-level keys intact.
 *  - "merge"    → add profiles absent locally; overwrite scoped keys for
 *                 overlapping profiles; keep device-only profiles + keys intact.
 */

import type { Profile } from "@/lib/profiles";

/** The only values `mode` may hold. Anything else came from a hand-edited or foreign blob. */
const VALID_MODES = ["parent", "child", "family"] as const;

/**
 * Force a profile's `mode` into the union.
 *
 * A transfer blob is untrusted input — it is JSON a user pasted, or a file from
 * another device or an older build. Nothing validated `mode` on the way in, so a
 * profile carrying `mode: "both"` (or any string) was written straight to
 * localStorage. ProfileSwitcher then displays that raw value, and its cycler does
 * `MODE_CYCLE.indexOf(current)`, which returns -1 for anything unrecognised — so
 * the first click jumps to "parent" instead of cycling, and the badge shows a
 * value that is not a mode at all.
 *
 * Same shape as the content-age-group bug: derived state and unvalidated import
 * both let a value outside the union reach the UI.
 */
function sanitizeProfileMode<T extends { mode?: unknown }>(profile: T): T {
  const mode = profile.mode;
  return {
    ...profile,
    mode: VALID_MODES.includes(mode as (typeof VALID_MODES)[number])
      ? mode
      : "family",
  };
}

// ---------------------------------------------------------------------------
// Scope: which top-level localStorage keys are conceptually "device-level" and
// should NOT be part of a profile transfer.
// ---------------------------------------------------------------------------

const DEVICE_LEVEL_KEYS = new Set([
  "dg_cookie_consent", // consent is per-browser, re-consent on the new device
  "theme", // device visual preference
  "wellness-pop-highscore", // device-level game score
]);

const PROFILE_SCOPED_PREFIXES = ["dg_course_", "dg_workshops_", "dg_companion_"];

// ---------------------------------------------------------------------------
// Base64 helpers
// ---------------------------------------------------------------------------

/** Base64url-encode a UTF-8 string (no padding). */
export function toBase64url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Decode a base64url string to a UTF-8 string. Returns null on bad input. */
export function fromBase64url(code: string): string | null {
  try {
    let s = code.replace(/-/g, "+").replace(/_/g, "/");
    const pad = (4 - (s.length % 4)) % 4;
    s += "=".repeat(pad);
    const binary = atob(s);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Scope helpers
// ---------------------------------------------------------------------------

function isProfileScopedKey(key: string, profileId: string): boolean {
  if (DEVICE_LEVEL_KEYS.has(key)) return false;
  if (key === "dg_profiles" || key === "dg_current_profile") return false;
  for (const prefix of PROFILE_SCOPED_PREFIXES) {
    if (key.startsWith(prefix) && key.slice(prefix.length) === profileId) {
      return true;
    }
  }
  return false;
}

function collectScopedKeys(profileId: string): Record<string, string> {
  if (typeof window === "undefined") return {};
  const out: Record<string, string> = {};
  const existing = localStorage;
  for (let i = 0; i < existing.length; i++) {
    const key = existing.key(i);
    if (!key) continue;
    if (isProfileScopedKey(key, profileId)) {
      out[key] = existing.getItem(key) ?? "";
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface TransferBlob {
  version: 1;
  exportedAt: number;
  exportedByProfileId: string | null;
  profiles: Profile[];
  currentProfileId: string | null;
  scoped: Record<string, Record<string, string>>;
}

export interface TransferPreview {
  profileCount: number;
  currentProfileId: string | null;
  scopedKeyCount: number;
  scopedKeyDetails: Array<{ profileId: string; keyCount: number; exampleKeys: string[] }>;
  encodedSizeBytes: number;
  encodedString: string;
  snippet: string;
}

export type ImportMode = "replace" | "merge";

export interface CompanionExportOptions {
  /** Trim companion faqHistory to this many most-recent entries. 0 = no trim. Default 5 when true. */
  trimCompanionHistory?: boolean | number;
}

// ---------------------------------------------------------------------------
// Blob construction / preview
// ---------------------------------------------------------------------------

export const MAX_QR_UTF8_BYTES = 1_700; // safe single-QR threshold (v40 EC-L ≈ 1.8KB; keep margin)

export function buildTransferBlob(options?: CompanionExportOptions): TransferBlob {
  if (typeof window === "undefined") {
    return {
      version: 1,
      exportedAt: Date.now(),
      exportedByProfileId: null,
      profiles: [],
      currentProfileId: null,
      scoped: {},
    };
  }
  const profilesRaw = localStorage.getItem("dg_profiles");
  let profiles: Profile[] = [];
  if (profilesRaw) {
    try {
      const parsed = JSON.parse(profilesRaw);
      // dg_profiles is stored as Record<string, Profile> (keyed by profile id),
      // not as an array — convert to array for the transfer blob.
      profiles = Array.isArray(parsed)
        ? (parsed as Profile[])
        : Object.values(parsed as Record<string, Profile>);
      if (!Array.isArray(profiles)) profiles = [];
    } catch {
      profiles = [];
    }
  }
  const currentProfileId = localStorage.getItem("dg_current_profile") ?? null;
  const scoped: Record<string, Record<string, string>> = {};
  for (const p of profiles) {
    scoped[p.id] = collectScopedKeys(p.id);
  }
  // Include orphaned profile-scoped keys for profile ids not tracked in dg_profiles
  // (defensive: legacy data from before profiles were tracked).
  const knownIds = new Set(profiles.map((p) => p.id));
  const orphanKeys = new Set<string>();
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith("dg_")) continue;
    // Keys like dg_profiles or dg_current_profile are top-level, not profile IDs.
    if (key === "dg_profiles" || key === "dg_current_profile") continue;
    // Extract the profile id suffix from a profile-scoped key, or skip if it isn't one.
    let keyProfileId: string | null = null;
    for (const prefix of PROFILE_SCOPED_PREFIXES) {
      if (key.startsWith(prefix)) {
        keyProfileId = key.slice(prefix.length);
        break;
      }
    }
    // Keys that are not profile-scoped (device-level keys) are handled elsewhere;
    // ignore them here.
    if (!keyProfileId) continue;
    // Key belongs to a known profile → not orphaned.
    if (knownIds.has(keyProfileId)) continue;
    if (keyProfileId) orphanKeys.add(keyProfileId);
  }
  for (const id of Array.from(orphanKeys)) {
    scoped[id] = collectScopedKeys(id);
  }

  // Trim companion faqHistory if requested (keeps most recent N entries).
  const companionTrim = typeof options?.trimCompanionHistory === "number"
    ? options.trimCompanionHistory
    : options?.trimCompanionHistory === true
      ? 5
      : 0;
  if (companionTrim > 0) {
    for (const [profileId, keys] of Object.entries(scoped)) {
      const companionKey = `dg_companion_${profileId}`;
      if (keys[companionKey]) {
        keys[companionKey] = trimCompanionHistory(keys[companionKey], companionTrim);
      }
    }
  }

  return {
    version: 1,
    exportedAt: Date.now(),
    exportedByProfileId: currentProfileId,
    profiles,
    currentProfileId,
    scoped,
  };
}

export function previewBlob(blob: TransferBlob): TransferPreview {
  let scopedKeyCount = 0;
  const details: TransferPreview["scopedKeyDetails"] = [];
  for (const [profileId, keys] of Object.entries(blob.scoped)) {
    scopedKeyCount += Object.keys(keys).length;
    details.push({
      profileId,
      keyCount: Object.keys(keys).length,
      exampleKeys: Object.keys(keys).slice(0, 5),
    });
  }
  const encoded = toBase64url(JSON.stringify(blob));
  const snippet = encoded.length > 140 ? encoded.slice(0, 140) + "…" : encoded;
  return {
    profileCount: blob.profiles.length,
    currentProfileId: blob.currentProfileId,
    scopedKeyCount,
    scopedKeyDetails: details,
    encodedSizeBytes: new TextEncoder().encode(encoded).byteLength,
    encodedString: encoded,
    snippet,
  };
}

/** Encode a TransferBlob into a plaintext transfer code (base64url JSON). */
export function encodeBlob(blob: TransferBlob): string {
  return toBase64url(JSON.stringify(blob));
}

/** Decode a transfer code back into a TransferBlob. Returns null on bad input. */
export function decodeBlob(code: string): TransferBlob | null {
  const text = fromBase64url(code.trim());
  if (!text) return null;
  try {
    const parsed = JSON.parse(text) as TransferBlob;
    if (parsed.version !== 1) return null;
    if (!Array.isArray(parsed.profiles)) return null;
    if (typeof parsed.exportedAt !== "number") return null;
    if (typeof parsed.scoped !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Import side effects (called only after user confirms in the UI)
// ---------------------------------------------------------------------------

/**
 * Apply a TransferBlob to localStorage.
 * - "replace": set profiles list + currentProfileId from blob; for each profile
 *   in the blob, clear its existing scoped keys and write the blob's keys; remove
 *   scoped keys belonging to profiles NOT in the blob; leave device-level keys intact.
 * - "merge": add profiles absent locally; overwrite scoped keys for overlapping
 *   profiles; keep device-only profiles + keys intact.
 *
 * Returns a summary of what was written.
 */
export function applyTransferBlob(
  blob: TransferBlob,
  mode: ImportMode
): { writtenProfiles: number; writtenKeys: number; errors: string[] } {
  const errors: string[] = [];
  if (typeof window === "undefined") {
    errors.push("window is undefined");
    return { writtenProfiles: 0, writtenKeys: 0, errors };
  }

  const writeProfilesList = (profiles: Profile[]) => {
    // Sanitise on the way in: a blob is untrusted, and an out-of-union `mode`
    // reaches the Mode button's cycler, which cannot index it.
    localStorage.setItem(
      "dg_profiles",
      JSON.stringify(profiles.map(sanitizeProfileMode))
    );
  };

  const existingRaw = localStorage.getItem("dg_profiles");
  let existingProfiles: Profile[] = [];
  if (existingRaw) {
    try {
      existingProfiles = JSON.parse(existingRaw) as Profile[];
      if (!Array.isArray(existingProfiles)) existingProfiles = [];
    } catch (err) {
      errors.push(`Failed to parse existing profiles: ${err instanceof Error ? err.message : "unknown error"}`);
      existingProfiles = [];
    }
  }
  const existingIds = new Set(existingProfiles.map((p) => p.id));
  const blobProfileIds = new Set(blob.profiles.map((p) => p.id));

  // Snapshot all keys before mutating localStorage during the operation.
  const allKeys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k) allKeys.push(k);
  }

  if (mode === "replace") {
    // 1. Set profiles list + currentProfileId from the blob.
    writeProfilesList(blob.profiles);
    if (blob.currentProfileId) {
      localStorage.setItem("dg_current_profile", blob.currentProfileId);
    }

    // 2. For profiles in the blob: clear their existing scoped keys first.
    for (const key of allKeys) {
      if (!key.startsWith("dg_")) continue;
      if (DEVICE_LEVEL_KEYS.has(key)) continue;
      if (key === "dg_profiles" || key === "dg_current_profile") continue;
      for (const prefix of PROFILE_SCOPED_PREFIXES) {
        if (key.startsWith(prefix)) {
          const suffix = key.slice(prefix.length);
          if (suffix && blobProfileIds.has(suffix)) {
            localStorage.removeItem(key);
          }
          break;
        }
      }
    }

    // 3. Write the blob's scoped keys.
    let writtenKeys = 0;
    for (const [profileId, keys] of Object.entries(blob.scoped)) {
      for (const [k, v] of Object.entries(keys)) {
        localStorage.setItem(k, v);
        writtenKeys++;
      }
    }

    // 4. Remove scoped keys belonging to profiles NOT in the blob.
    for (const key of allKeys) {
      if (!key.startsWith("dg_")) continue;
      if (DEVICE_LEVEL_KEYS.has(key)) continue;
      if (key === "dg_profiles" || key === "dg_current_profile") continue;
      for (const prefix of PROFILE_SCOPED_PREFIXES) {
        if (key.startsWith(prefix)) {
          const suffix = key.slice(prefix.length);
          if (suffix && !blobProfileIds.has(suffix)) {
            localStorage.removeItem(key);
          }
          break;
        }
      }
    }

    return { writtenProfiles: blob.profiles.length, writtenKeys, errors };
  }

  // ---- merge ----
  const mergedProfiles = existingProfiles.map((p) => ({ ...p }));
  const mergedIds = new Set(mergedProfiles.map((p) => p.id));
  let writtenProfiles = 0;
  let writtenKeys = 0;

  for (const p of blob.profiles) {
    if (mergedIds.has(p.id)) {
      const idx = mergedProfiles.findIndex((x) => x.id === p.id);
      if (idx >= 0) mergedProfiles[idx] = { ...mergedProfiles[idx], ...p };
    } else {
      mergedProfiles.push({ ...p });
      mergedIds.add(p.id);
      writtenProfiles++;
    }
  }
  writeProfilesList(mergedProfiles);
  if (blob.currentProfileId && mergedIds.has(blob.currentProfileId)) {
    localStorage.setItem("dg_current_profile", blob.currentProfileId);
  }

  for (const [profileId, keys] of Object.entries(blob.scoped)) {
    for (const [k, v] of Object.entries(keys)) {
      localStorage.setItem(k, v);
      writtenKeys++;
    }
  }

  return { writtenProfiles, writtenKeys, errors };
}

// ---------------------------------------------------------------------------
// Companion history helpers
// ---------------------------------------------------------------------------

/** Trim a companion faqHistory JSON value to the N most-recent entries. */
export function trimCompanionHistory(value: string, keepCount: number): string {
  try {
    const parsed = JSON.parse(value);
    if (parsed && Array.isArray(parsed.faqHistory)) {
      const trimmed = parsed.faqHistory.slice(-keepCount);
      return JSON.stringify({ faqHistory: trimmed });
    }
  } catch {
    // malformed — return as-is
  }
  return value;
}

/**
 * Build a TransferBlob containing only the companion history for one profile.
 * The resulting code fits in a QR when the companion value is small enough.
 */
export function buildCompanionExportBlob(profileId: string, options?: CompanionExportOptions): TransferBlob {
  const companionKey = `dg_companion_${profileId}`;
  const raw = typeof window !== "undefined"
    ? localStorage.getItem(companionKey)
    : null;
  let companionValue = raw ?? "{}";
  if (options?.trimCompanionHistory) {
    companionValue = trimCompanionHistory(companionValue, typeof options.trimCompanionHistory === "number"
      ? options.trimCompanionHistory
      : 5);
  }
  return {
    version: 1,
    exportedAt: Date.now(),
    exportedByProfileId: profileId,
    profiles: [],
    currentProfileId: profileId,
    scoped: {
      [profileId]: {
        [companionKey]: companionValue,
      },
    },
  };
}

/**
 * Write a companion export blob's scoped keys back to localStorage.
 * Used when importing a companion-only transfer on another device.
 */
export function applyCompanionExport(blob: TransferBlob): void {
  if (typeof window === "undefined") return;
  for (const [profileId, keys] of Object.entries(blob.scoped)) {
    for (const [key, value] of Object.entries(keys)) {
      localStorage.setItem(key, value);
    }
  }
}
