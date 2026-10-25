/**
 * Where a family actually gets the extension.
 *
 * The page has always implied it enforces commitments itself, and it does not —
 * enforcement lives entirely in the extension's declarativeNetRequest rules.
 * Until the extension is paired, a commitment naming facebook.com blocks nothing.
 * This module is the single place that answers "how do I install it", so the page
 * can be honest about the gap instead of silently under-enforcing.
 *
 * The extension is listed, so the install path is a real link. The unset-ID
 * branch stays as the honest fallback — if the listing is ever pulled, a plain
 * "not available yet" beats a button that goes nowhere.
 */

/**
 * The Chrome Web Store ID, taken from the listing URL:
 * https://chromewebstore.google.com/detail/caebokejnkeoehkmmhbjcnbfiobngnai
 */
export const CHROME_STORE_ID = "caebokejnkeoehkmmhbjcnbfiobngnai";

/** The public listing. Canonical host; the old chrome.google.com path redirects here. */
export const CHROME_STORE_URL = `https://chromewebstore.google.com/detail/${CHROME_STORE_ID}`;

export type InstallPath = {
  /** Headline for the install step. */
  label: string;
  /** One line explaining what this path is. */
  detail: string;
  /** Where to go, or null when there is nothing to link to yet. */
  href: string | null;
  /** Copy for the link/button. */
  cta: string;
  /** True when the extension is on the store and this is the normal route. */
  live: boolean;
};

/**
 * The install path for a given situation. `paired` means this browser already
 * has a working family key, in which case there is nothing to tell them.
 */
export function installPath(paired: boolean): InstallPath {
  if (paired) {
    return {
      label: "Extension connected",
      detail: "This browser is paired to your family, so commitments are enforced here.",
      href: null,
      cta: "Manage",
      live: true,
    };
  }

  if (CHROME_STORE_ID) {
    return {
      label: "Add the extension",
      detail:
        "The extension is what enforces your commitments in the browser. Install it once on each device your family uses.",
      href: CHROME_STORE_URL,
      cta: "Install from Chrome Web Store",
      live: true,
    };
  }

  return {
    label: "Add the extension",
    detail:
      "The extension is what enforces your commitments in the browser — until it is installed, a commitment that names a site blocks nothing. It is coming to the Chrome Web Store shortly.",
    href: null,
    cta: "Coming soon",
    live: false,
  };
}

/**
 * Does this browser have the extension at all?
 *
 * Detection is deliberately conservative: a classic extension probe returns
 * false both when the extension is absent and when it is present but we cannot
 * see it, and there is no reliable way to tell those apart. Only trust it to say
 * "yes".
 */
export function extensionInstalled(): boolean {
  if (typeof window === "undefined") return false;
  const anyWindow = window as unknown as Record<string, unknown>;
  return Boolean(anyWindow.__dgExtensionPresent);
}

/**
 * The one thing a family must be told and currently is not: enforcement is
 * client-side, so it is only as strong as the browser it runs in.
 */
export const ENFORCEMENT_LIMIT_NOTE =
  "Commitments are enforced in the browser, so removing the extension, or opening this site in a new browser profile, stops them applying. This works for families who have agreed the rules together — it is not a lock someone can be kept behind.";
