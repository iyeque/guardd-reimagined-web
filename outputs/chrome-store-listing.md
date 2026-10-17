# Chrome Web Store listing — Digital Guardian Family Commitments

Ready-to-paste copy plus the permission justifications Chrome requires. Two gaps to close before submission are listed in §5.

---

## 1 · Listing basics

| Field | Value | Limit |
|---|---|---|
| **Name** | Digital Guardian — Family Commitments | 75 chars ✓ |
| **Summary** | Turn your family's screen-time agreements into something the browser actually enforces — and explains. | 132 chars ✓ |
| **Category** | Productivity *(primary)*, Social & Communication *(secondary)* | |
| **Language** | English (United Kingdom) | |
| **Website** | https://digitalguardianwellness.org | |
| **Privacy policy URL** | https://digitalguardianwellness.org/privacy-policy | |
| **Support URL** | https://digitalguardianwellness.org/family-commitments | |

---

## 2 · Short description (summary field, 132 chars)

```
Turn your family's screen-time agreements into something the browser actually enforces — and explains.
```

*Alternatives if you prefer a different angle:*

- `Your family agreed on screen time. This makes the browser keep it, and show the agreement when it does.`
- `Blocks agreed sites during agreed hours, then explains the family agreement instead of showing an error.`

---

## 3 · Full description

```
Every family has the same conversation. "No phones after nine." "Not during
homework." And then the agreement lives in someone's memory, and the browser
has no idea it exists.

Digital Guardian makes your family's commitments real.

AGREE FIRST, THEN ENFORCE
You write the commitment in plain words on digitalguardianwellness.org — what
you agreed, who it applies to, which sites, and which hours. Nothing is blocked
until your family has agreed to it. The extension enforces what you wrote; it
never decides for you.

IT EXPLAINS ITSELF
This is the part that matters most. A blocked page does not show a cold browser
error. It shows what your family actually agreed to, in your own words, with
who agreed to it. A child who hits a block learns why it exists — not just that
it does.

Choose "block" to stop a site during agreed hours, or "remind" to let it load
and show the agreement as a gentle overlay instead.

THE HOURS ARE THE POINT
Rules only apply inside their window. When homework time ends, the block lifts
by itself. The extension re-checks at every boundary, so nothing stays blocked
outside the hours you agreed.

BUILT FOR REAL FAMILIES
• One key per device — pair a laptop, a phone, a shared computer. Revoke one
  without locking out the others.
• Works offline once synced, so a dropped connection does not lift the rules.
• Pick which child uses a browser, or leave it shared.
• No accounts, no profiles to sign up for, no email required.
• No tracking, no analytics, no browsing history collected. Ever.

WHO IT IS FOR
Families who have already had the conversation and want it to stick. It is a
tool for agreements, not surveillance — if you are looking to monitor someone
without their knowledge, this is not that.

Free, with no advertising and nothing to buy.
```

*(~1,180 characters — well inside the 16,000 limit. Trim the "Who it is for" paragraph if you want it tighter.)*

---

## 4 · Permission justifications

Chrome reviews each of these individually. Copy these into the justification fields verbatim.

**Single purpose statement:**

> Digital Guardian enforces screen-time commitments that a family has explicitly agreed to. It reads the family's own written agreements from digitalguardianwellness.org and blocks or reminds on the named sites during the hours the family chose.

**`storage`**

> Stores the family's access key, the commitments fetched from the family's own account, and which family member uses this browser. Caching commitments locally is what allows blocking to keep working when the network is unavailable.

**`alarms`**

> Re-fetches commitments every 30 minutes so a parent's changes take effect, and re-evaluates the rules at each agreed window boundary. Blocking is time-based, so without a timer the extension could not know when an agreed window starts or ends.

**`declarativeNetRequest`**

> The mechanism that blocks or redirects the agreed domains during their agreed hours. This is the core function of the extension.

**Host permission — `https://digitalguardianwellness.org/*`**

> The extension fetches the family's commitments from, and sends its access key to, exactly one origin: the Digital Guardian service the family created their commitments on. No other origin is contacted.

**Content script — `<all_urls>`**

> The extension must be able to run on any site the family might have included in an agreement, because it cannot know in advance which domains those are. It reads only the hostname of the current page to decide whether a rule applies — it does not read page content, and it does not record which sites were visited.

---

## 5 · Chrome privacy disclosures

Answer these in the Privacy practices tab. **These are the answers your implementation supports** — I checked the code rather than guessing.

| Chrome category | Answer | Basis |
|---|---|---|
| Personally identifiable information | **Not collected** | No name, email, or account |
| Health information | **Not collected** | — |
| Financial and payment information | **Not collected** | — |
| Authentication information | **Collected** | The family access key |
| Personal communications | **Not collected** | — |
| Location | **Not collected** | — |
| Web history | **Not collected** | No visited-site logging |
| User activity | **Not collected** | No analytics or telemetry |
| Website content | **Not collected** | Hostname only, never page content |

**Data usage certifications** — you can certify all three:

- [x] I do not sell or transfer user data to third parties, outside of the approved use cases
- [x] I do not use or transfer user data for purposes that are unrelated to the item's primary purpose
- [x] I do not use or transfer user data to determine creditworthiness or for lending purposes

**What is actually sent to your server:** the family access key, as an `Authorization` header, to fetch that family's commitments. Nothing else leaves the browser. No browsing history, no hostnames visited, no crash reports, no analytics.

---

## 6 · Two gaps to close before submitting

**1. The privacy policy does not mention the extension.** `src/pages/PrivacyPolicy.tsx` contains zero references to it, but the policy URL is what Chrome points users to. The listing discloses an extension that sends an access key to your server; the linked policy must say so. Add a section covering: what the extension stores locally, what it sends (the access key, to fetch commitments), and that no browsing history is collected.

**2. The `<all_urls>` justification depends on a claim you should verify.** §4 states the extension reads only the hostname. That is true of the current code — `content.js` uses `location.hostname` and nothing more. If anyone later adds page-content reading, that justification becomes false and the listing is non-compliant. Worth a note in the repo so it is not changed casually.

---

## 7 · Assets checklist

| Asset | Spec | Status |
|---|---|---|
| Store icon | 128×128 PNG | Needed — no icon ships with the extension |
| Screenshot 1 | 1280×800 or 640×400 | Suggested: the block page showing a family agreement |
| Screenshot 2 | same | Suggested: the rule editor with sites and hours set |
| Screenshot 3 | same | Optional: the options page paired and synced |
| Small promo tile | 440×280 PNG | Optional |

**Screenshot 1 is the one that matters.** The block page — dark, the family's own words, "Agreed by baba, mama and baby" — is the entire product in one image. Every competing parental-control extension screenshots a settings panel; this one has a genuinely different thing to show.

---

## 8 · Review notes

Expect **3–7 business days** for a first submission. Extensions touching content blocking and children get extra scrutiny, so:

- The single-purpose statement (§4) is doing real work. Keep it in the same words you certified.
- The "Who it is for" paragraph in the description is deliberate. Reviewers reject parental-control extensions that read as covert monitoring tools, and naming the intended use pre-empts that.
- Answer the privacy tab from §5 exactly. If a category changes later, the listing must be updated or it is non-compliant.

**$5 one-time** developer registration fee before you can submit.
