/**
 * The Family Commitments tour: how the browser extension connects to the
 * commitments on this page.
 *
 * Deliberately separate from the main onboarding tour. Two auto-starting tours
 * on one site is hostile, so this one only runs from an explicit click — and that
 * click waits for cookie consent, like every other tour entry point.
 *
 * Steps 2 and 4 anchor to real elements on the page, so the tour cannot drift
 * away from the UI it is describing.
 */

import { runWhenConsentResolved } from "@/lib/onboarding";

export const EXTENSION_TOUR_STORAGE_KEY = "dg_extension_tour_seen";

export function startExtensionTour(): void {
  if (typeof window === "undefined") return;
  runWhenConsentResolved(() => {
    // Imported lazily so this module has no hard dependency on driver.js at load.
    void import("driver.js").then(({ driver }) => {
      const d = driver({
        showProgress: true,
        allowClose: true,
        nextBtnText: "Next",
        prevBtnText: "Back",
        doneBtnText: "Got it",
        steps: [
          {
            popover: {
              title: "Enforcing commitments in the browser",
              description:
                "Your commitments can block agreed sites during agreed hours, right in the browser. Four steps, and you only do the first one here.",
            },
          },
          {
            element: () => document.querySelector('[data-tour="extension-connect"]') as Element,
            popover: {
              title: "1 · Install the extension",
              description:
                "Load it from the Chrome Web Store, or load the unpacked folder in chrome://extensions with Developer mode on.",
            },
          },
          {
            element: () => document.querySelector('[data-tour="extension-key"]') as Element,
            popover: {
              title: "2 · Copy your family key",
              description:
                "This key is what ties the extension to your family. It decides which family you see, so a key from one family will never show another's. Keep it somewhere safe — clearing browser data loses it.",
            },
          },
          {
            popover: {
              title: "3 · Paste it into the extension",
              description:
                "Open the extension's options page and paste the key. No key yet? The extension can create a family for you, then you set up commitments here.",
            },
          },
          {
            element: () => document.querySelector('[data-tour="extension-rules"]') as Element,
            popover: {
              title: "4 · Set the rules",
              description:
                "Pick the sites, the hours and the days. Times use your family's timezone. A rule can block a site outright, or just remind without blocking.",
            },
          },
          {
            popover: {
              title: "What happens next",
              description:
                "During an active window the browser shows your family's own wording instead of a generic error page. When the window ends, the block lifts on its own.",
            },
          },
        ],
        onDestroyed: () => {
          localStorage.setItem(EXTENSION_TOUR_STORAGE_KEY, "true");
        },
      });
      d.drive();
    });
  });
}

/** Has this device already seen the extension tour? */
export function hasSeenExtensionTour(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(EXTENSION_TOUR_STORAGE_KEY) === "true";
}
