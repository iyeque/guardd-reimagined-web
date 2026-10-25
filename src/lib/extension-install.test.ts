import { describe, expect, it } from "vitest";
import { CHROME_STORE_ID, CHROME_STORE_URL, installPath } from "./extension-install";

describe("installPath", () => {
  it("points at the real store listing, not a placeholder", () => {
    // Pinned deliberately: this ID is the only thing connecting the site to the
    // listing, and an empty or stale value silently downgrades the install
    // button to "coming soon" on a page that is telling families to install it.
    expect(CHROME_STORE_ID).toBe("caebokejnkeoehkmmhbjcnbfiobngnai");
    expect(CHROME_STORE_URL).toBe(
      "https://chromewebstore.google.com/detail/caebokejnkeoehkmmhbjcnbfiobngnai",
    );
  });

  it("gives an unpaired browser a working install link", () => {
    const path = installPath(false);

    expect(path.live).toBe(true);
    expect(path.href).toBe(CHROME_STORE_URL);
    expect(path.cta).toMatch(/Chrome Web Store/);
  });

  it("does not offer an install link to a browser that is already paired", () => {
    const path = installPath(true);

    expect(path.href).toBeNull();
    expect(path.label).toMatch(/connected/i);
  });
});
