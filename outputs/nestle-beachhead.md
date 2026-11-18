# Digital Guardian — Beachhead
Built from the Nestlé NextGen Founders "Find Your Beachhead" Sprint Day framework.

## 1. What the framework actually demands

The deck's definition: **one customer + one painful problem + one place to reach them.** It rejects categories ("everyone", "young people", "small businesses") and force-ranks a narrow wedge. Two gates:

- **The one-question test:** "Can you name 10 real people with this problem, and reach them this week?" Yes = beachhead found. No = make it smaller.
- **Payer vs user:** name them separately when they differ.
- **Focus area:** link to one of Nestlé's priorities. "All industries are welcome, and AI-integrated ideas are prioritized."
- **Today's deliverables:** beachhead sentence + live one-page MVP (one job, one sign-up button) + 7-slide pitch deck. Submission by 20:00.

## 2. Recommended beachhead sentence

> **We help** parents of Grade 4–7 children at one private school in Sharjah or Dubai
> **in** that school's parent WhatsApp community and pickup line
> **who struggle with** the nightly screen-time fight, where a child with their own device ignores the agreed limit
> **achieve** a calm, agreed device cutoff that holds without spying or shouting
> **through** Digital Guardian's family commitments — the child co-authors the rule, the Chrome extension enforces it, and points buy back extra time.
>
> **Focus area:** Health & Nutrition (children's healthy routines and sleep), accelerated by AI (Welli).

Why this shape:

| Field | Value | Why it is narrow enough |
|---|---|---|
| Customer | Parents of Grade 4–7 (ages ~9–12) at ONE named school | A roll-call you can actually list, not "families" |
| Problem | The 9pm fight over YouTube/gaming on a personal device | One moment, one repeated pain, observable weekly |
| Place | That school's parent WhatsApp group + pickup line | The deck's Harvard/AUS model: one reachable channel |
| Outcome | An agreed cutoff that sticks, plus points for consistency | Clear before/after, matches the product's real wedge |
| Product | Family commitments + extension + rewards | One job, not the whole platform |

## 3. Pass the one-question test — this week

**Reach test (yes/no):** Pick the one school you can name 10 parents at — ideally one where you or a contact is already in a parent WhatsApp group, and where children have a school-issued laptop/tablet or their own phone. Write down 10 names. If you cannot reach 10 this week, switch to a tighter place (one Grade 5 class, not the whole school) and repeat.

**The question to ask those 10 (tests the strongest assumption — child acceptance):**

> "If your child helped set their own screen limit and earned points for extra time instead of you just blocking sites — would they accept that deal, and would you try it for two weeks?"

Do **not** ask "do you want better screen-time control?" — everyone says yes and it proves nothing. The riskiest assumption is that a child will accept a negotiated rule, because that is the whole differentiation against blunt parental controls.

**Optional second question (commercial, ask only after the first):** "If it worked, what would you pay per month — AED 15, 30, or nothing?" Record the answer as evidence or as an assumption still to test. The deck explicitly says not to invent evidence.

## 4. Payer vs user — and the assumptions to flag

- **Payer:** the parent.
- **User:** the child (9–12), whose buy-in determines whether the tool works at all.
- **Gatekeeper:** the school/parent community is the *channel*, not the buyer (no B2B sales cycle in a one-week beachhead).

Assumptions to mark as untested in the pitch, not as facts:
1. Parents in this group actually have the "personal device + nightly fight" problem (validate with the 10).
2. Children accept co-authored rules (the question above).
3. Parents will pay, not just sign up (optional question).
4. The UAE en+ar content pack and "sitr" privacy framing fit this school's cultural context — flag as a localisation hypothesis, not a proven fit.

## 5. Nestlé focus-area fit — the bridge

Digital Guardian is not a food idea, so make the health link explicit and do not overclaim:

- **Health & Nutrition (primary):** healthy daily routines, sleep, and screen-free homework hours for primary-school children — "nutrition education" broadened to health education for the whole family.
- **AI as an accelerator (secondary):** Welli answers parenting questions in context; AI adapts enforcement and nudges to the family's actual commitments. The program says AI-integrated solutions are prioritised — this is the hook.
- **Responsible business / inclusive practices (supporting):** negotiated, transparent family rules rather than covert surveillance; UAE-localised Arabic content.

## 6. The MVP — one page, one job, one button

Do **not** pitch the whole platform. Build one landing page for the single beachhead promise, per the deck's "one page, one job, one sign-up button."

- **Working title:** "The 9pm Agreement" — a family screen deal the kids agree to.
- **One job:** show the before/after of the nightly fight and explain the co-authored commitment in three steps.
- **One CTA, repeated:** "Join the 9pm Agreement waitlist" (or "Get the free Chrome extension"). One form field: parent email + child's age band.
- **Proof only if real:** the extension is live in the Chrome Web Store (v0.3.0) — that is genuine proof. No invented testimonials; use placeholders.
- **Reuse existing assets:** `public/dg-logo.png`, brand-kit tri-gradient colours, and the live Chrome Web Store link. This makes the page buildable in one sitting.

## 7. Seven-slide pitch skeleton (3 minutes, one idea per slide)

1. **Problem** — "It's 9pm. The iPad is still on. Homework and sleep lose." One screenshot of a real negotiated commitment.
2. **Customer** — the beachhead sentence, one school, parent WhatsApp group. Name the 10 real people you reached.
3. **Solution** — family commitments: child co-authors, extension enforces, points buy back time. Contrast with one-way blocking.
4. **Demo** — show the live one-page MVP and the Chrome Web Store listing. A demo beats a description.
5. **Proof** — extension published and approved; the 10 interviews (count only what you actually did); real commitments from a live family. Mark placeholders clearly.
6. **Team** — why you can build this (web + extension + Windows desktop already shipped).
7. **Ask** — be concrete: "AED 75K + introductions to 3 school parent communities to run a 100-family UAE pilot and finish the Arabic content pack."

## 8. Alternates considered and why not

- **"All UAE families with kids"** — a category, not a beachhead. Fails the 10-people test.
- **"UAE schools as B2B buyers"** — better later, but a sales cycle cannot be validated in one week and has a different payer.
- **"Teens"** — parents of teens are harder to reach in one school community this week, and device control is more contested; primary school is the cleaner wedge.

## 9. This week's checklist

The MVP landing page is built at `public/agreement.html` — a standalone one-page site using the brand kit (teal→coral→lavender gradient, ambient blobs, logo, glass cards) with one repeated CTA: **Get the free extension** → Chrome Web Store. Deployed URL will be `https://digitalguardianwellness.org/agreement.html`; locally `http://localhost:5000/agreement.html`. It carries `noindex` (a pitch demo page, not a canonical site page).

The 7-slide deck is built in two submittable formats: `outputs/Digital-Guardian-Pitch.pptx` (editable) and `outputs/Digital-Guardian-Pitch.pdf` (print-ready, generated from `outputs/pitch-deck.html`). Regenerate both with the Hermes documents Python environment via `scripts/generate-pitch-deck.py`. Slide previews are `outputs/slide-1.png` … `slide-7.png`. Placeholders that must be filled before submission: **[SCHOOL NAME]** (slide 2) and **[FOUNDER NAME]/[PHOTO]** (slide 6).

- [ ] Name the ONE school and write down 10 real parents.
- [ ] Ask the child-acceptance question to as many of the 10 as possible; log raw answers.
- [ ] Fill the beachhead sentence with the real school name and problem wording from those interviews.
- [ ] Build the one-page MVP (one CTA) and publish it; keep the link.
- [ ] Assemble the 7 slides; rehearse twice with a timer (3 minutes).
- [ ] Export deck to PDF, submit beachhead sentence + live link + deck by 20:00.
