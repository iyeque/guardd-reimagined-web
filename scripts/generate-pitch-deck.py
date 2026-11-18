#!/usr/bin/env python3
"""Generate the Nestlé sprint pitch deck for Digital Guardian.

Outputs:
  outputs/Digital-Guardian-Pitch.pptx  (editable, 7 slides)
  outputs/pitch-deck.html              (print-ready, 7 pages -> PDF)

Run with the Hermes documents environment (python-pptx installed).
"""
import html
import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "outputs")

TEAL = "4FD1C5"
TEAL_DEEP = "2C7A7B"
CORAL = "FF9A8B"
LAV = "B794F4"
INK = "0F172A"
MUTED = "475569"
BG = "F8FAFC"
WHITE = "FFFFFF"
TINT = "EAF8F5"

SLIDES = [
    {
        "title": "It's 9pm. The iPad is still on.",
        "lead": "Homework and sleep lose. Every night.",
        "cards": [
            {"label": "BLOCK EVERYTHING", "body": "Kids find workarounds. Trust breaks."},
            {"label": "GIVE IN", "body": "Another fight. Another tired morning."},
        ],
        "strip": "One problem: the nightly screen-time fight.",
        "note": "Open with the scene, not the product. 20 seconds. Parents know this moment instantly. Do not list features yet.",
    },
    {
        "title": "One beachhead: one school, one WhatsApp group.",
        "lead": "We help parents of Grade 4–7 children at [SCHOOL NAME] in Sharjah or Dubai who struggle with the nightly screen-time fight over a personal device achieve a calm, agreed cutoff — through family commitments the child co-authors.",
        "cards": [
            {"label": "PLACE", "body": "Class WhatsApp group + school pickup line"},
            {"label": "PAYER ≠ USER", "body": "Parent pays. Child uses — and must accept the deal."},
            {"label": "ONE-QUESTION TEST", "body": "Name 10 parents at this school and reach them this week."},
        ],
        "strip": "Focus area: Health & Nutrition (healthy routines, sleep) · AI as accelerator",
        "note": "This is a placeholder for the school name — say so openly. The whale is narrow on purpose: one place we can reach 10 real people this week.",
    },
    {
        "title": "A commitment they co-author — not a block they resent.",
        "lead": "Three steps. One deal.",
        "cards": [
            {"label": "1 · AGREE TOGETHER", "body": "Parent and child set the bedtime limit in one shared commitment. It's their rule too."},
            {"label": "2 · IT HOLDS", "body": "The extension reminds first, then keeps the limit — even when you're not in the room."},
            {"label": "3 · EARN IT BACK", "body": "Points for keeping the deal turn into extra screen time. A reason to stick with it."},
        ],
        "strip": "Negotiated, transparent, rewarded — carrot and guardrail.",
        "note": "The differentiator is child acceptance. Blunt parental controls fail because kids work around them. Here the child writes the rule.",
    },
    {
        "title": "Live now — not a mockup.",
        "lead": "One page. One job. One button: Get the free extension.",
        "image": "pitch-hero.png",
        "cards": [
            {"label": "LANDING PAGE", "body": "digitalguardianwellness.org/agreement.html"},
            {"label": "CHROME WEB STORE", "body": "DigitalGuard v0.3.0 · published and approved"},
        ],
        "note": "Show the live page, then the store listing. A demo beats a description. Keep this slide to 30 seconds.",
    },
    {
        "title": "What's real today — and what we'll test.",
        "lead": "No invented evidence. Placeholders are marked.",
        "cards": [
            {"label": "SHIPPED", "body": "Chrome extension v0.3.0 approved; beachhead landing page live."},
            {"label": "BUILT", "body": "Web platform, family commitments, Windows desktop app; 64 tests green."},
            {"label": "TO VALIDATE", "body": "10 parent interviews at [SCHOOL] — in progress, not claimed as proof."},
        ],
        "strip": "The next proof point is behavioural: will children accept a rule they helped write?",
        "note": "Be explicit that interviews are pending. Judges reward honest validation over fabricated traction.",
    },
    {
        "title": "Why us: we already built the machine.",
        "lead": "Founder-led. Shipped in weeks, not outsourced.",
        "cards": [
            {"label": "DELIVERED", "body": "Web platform → Chrome extension → Windows desktop app. One codebase, three surfaces."},
            {"label": "[FOUNDER NAME]", "body": "[PHOTO / SHORT BIO] — replace before submitting."},
        ],
        "strip": "The team that wrote the code is the team in the room.",
        "note": "Fill the founder name and photo before submission. Keep it to one line — this is not the slide to overclaim.",
    },
    {
        "title": "The ask.",
        "lead": "AED 75K grant + introductions to 3 UAE school parent communities.",
        "cards": [
            {"label": "100-FAMILY PILOT", "body": "Run the 9pm Agreement in one school community; measure kept commitments and sleep."},
            {"label": "FINISH THE UAE PACK", "body": "Arabic 'sitr' privacy scenarios, onboarding, and AI-assisted Welli guidance."},
        ],
        "strip": "Health & Nutrition  ·  AI as an accelerator  ·  Responsible business",
        "note": "Close on the concrete ask and the next milestone. Tie back to the focus areas in one sentence, then stop.",
    },
]


def rgb(h):
    return RGBColor.from_string(h)


def add_text(slide, text, left, top, width, height, size, bold=False,
             color=INK, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP):
    box = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(width), Inches(height))
    tf = box.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    tf.margin_left = Inches(0.02)
    tf.margin_right = Inches(0.02)
    tf.margin_top = Inches(0.01)
    tf.margin_bottom = Inches(0.01)
    for i, line in enumerate(text.split("\n")):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        p.space_after = Pt(4)
        r = p.add_run()
        r.text = line
        r.font.size = Pt(size)
        r.font.bold = bold
        r.font.color.rgb = rgb(color)
        r.font.name = "Arial"
    return box


def add_card(slide, left, top, width, height, fill=WHITE, line="DCE5EA"):
    shape = slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top),
        Inches(width), Inches(height))
    shape.fill.solid()
    shape.fill.fore_color.rgb = rgb(fill)
    shape.line.color.rgb = rgb(line)
    shape.line.width = Pt(1)
    return shape


def build_pptx():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank = prs.slide_layouts[6]

    for idx, s in enumerate(SLIDES, 1):
        slide = prs.slides.add_slide(blank)
        slide.background.fill.solid()
        slide.background.fill.fore_color.rgb = rgb(BG)

        # header
        logo = os.path.join(ROOT, "public", "dg-logo.png")
        if os.path.exists(logo):
            slide.shapes.add_picture(logo, Inches(0.55), Inches(0.3), width=Inches(0.42))
        add_text(slide, "DIGITAL GUARD WELLNESS  ·  NESTLÉ NEXTGEN FOUNDERS",
                 1.08, 0.32, 9.5, 0.35, 10, True, TEAL_DEEP)
        add_text(slide, f"{idx:02d} / 07", 11.9, 0.32, 0.85, 0.35, 10, True,
                 MUTED, PP_ALIGN.RIGHT)
        for j, c in enumerate((TEAL, CORAL, LAV)):
            bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.6 + j * 0.52),
                                         Inches(0.82), Inches(0.44), Inches(0.055))
            bar.fill.solid(); bar.fill.fore_color.rgb = rgb(c); bar.line.fill.background()

        add_text(slide, s["title"], 0.6, 1.05, 12.1, 0.85, 31, True, INK)
        has_img = bool(s.get("image"))
        if s.get("lead"):
            add_text(slide, s["lead"], 0.62, 1.95, 12.05, 0.95,
                     15 if len(s["lead"]) > 130 else 19, False, MUTED)

        cards = s["cards"]
        if has_img:
            img = os.path.join(OUT, s["image"])
            if os.path.exists(img):
                slide.shapes.add_picture(img, Inches(0.6), Inches(2.55), width=Inches(7.05))
            x0, cw, top, ch = 7.95, 4.75, 2.6, 1.75
        else:
            x0, top, ch = 0.6, 3.05, 2.35
            cw = 12.1 / len(cards) - 0.22
        for i, card in enumerate(cards):
            x = x0 + i * (cw + 0.22) if not has_img else x0
            y = top + i * (ch + 0.22) if has_img else top
            add_card(slide, x, y, cw, ch)
            add_text(slide, card["label"], x + 0.22, y + 0.18, cw - 0.44, 0.35,
                     12, True, TEAL_DEEP)
            add_text(slide, card["body"], x + 0.22, y + 0.62, cw - 0.44, ch - 0.75,
                     14 if len(card["body"]) < 110 else 12.5, False, INK)

        if s.get("strip"):
            bar = add_card(slide, 0.6, 6.25, 12.1, 0.72, TINT, TEAL)
            add_text(slide, s["strip"], 0.85, 6.43, 11.6, 0.4, 12.5, True,
                     TEAL_DEEP, PP_ALIGN.CENTER)

        slide.notes_slide.notes_text_frame.text = s["note"]

    out = os.path.join(OUT, "Digital-Guardian-Pitch.pptx")
    prs.save(out)
    print("PPTX:", out, "slides:", len(prs.slides._sldIdLst))


def build_html():
    parts = []
    for s in SLIDES:
        cards = "".join(
            f'<div class="card"><div class="label">{html.escape(c["label"])}</div>'
            f'<div class="body">{html.escape(c["body"])}</div></div>' for c in s["cards"])
        image = (f'<img class="shot" src="pitch-hero.png" alt="Landing page hero" />'
                 if s.get("image") else "")
        lead = f'<p class="lead">{html.escape(s["lead"])}</p>' if s.get("lead") else ""
        strip = (f'<div class="strip">{html.escape(s["strip"])}</div>'
                 if s.get("strip") else "")
        grid_class = "cards with-image" if s.get("image") else (
            "cards three" if len(s["cards"]) == 3 else "cards two")
        parts.append(f'''<section class="slide">
  <header><img src="../public/dg-logo.png" alt="" /><span>DIGITAL GUARD WELLNESS · NESTLÉ NEXTGEN FOUNDERS</span><b>{SLIDES.index(s)+1:02d} / 07</b></header>
  <div class="bars"><i></i><i></i><i></i></div>
  <h1>{html.escape(s["title"])}</h1>
  {lead}
  <div class="stage">{image}<div class="{grid_class}">{cards}</div></div>
  {strip}
  <p class="note">Speaker note: {html.escape(s["note"])}</p>
</section>''')

    doc = f'''<!DOCTYPE html><html lang="en"><head><meta charset="utf-8" />
<title>Digital Guardian — 7-slide pitch</title>
<style>
@page {{ size: 13.333in 7.5in; margin: 0; }}
* {{ box-sizing: border-box; }}
body {{ margin:0; background:#E5EAF0; font-family: Arial, Helvetica, sans-serif; color:#0F172A; }}
.slide {{ width:13.333in; height:7.5in; background:#F8FAFC; padding:0.45in 0.6in; position:relative;
          page-break-after:always; overflow:hidden; }}
header {{ height:0.5in; display:flex; align-items:center; gap:0.12in; }}
header img {{ width:0.42in; height:0.42in; object-fit:contain; }}
header span {{ font-size:10pt; font-weight:bold; color:#2C7A7B; letter-spacing:.06em; }}
header b {{ margin-left:auto; font-size:10pt; color:#475569; }}
.bars {{ display:flex; gap:0.08in; margin:0.05in 0 0.18in; }}
.bars i {{ width:0.44in; height:0.055in; }}
.bars i:nth-child(1) {{ background:#4FD1C5; }} .bars i:nth-child(2) {{ background:#FF9A8B; }} .bars i:nth-child(3) {{ background:#B794F4; }}
h1 {{ font-size:31pt; line-height:1.1; margin:0 0 0.12in; max-width:12in; }}
.lead {{ font-size:15pt; color:#475569; margin:0 0 0.24in; max-width:12in; line-height:1.35; }}
.stage {{ display:flex; gap:0.24in; }}
.shot {{ width:7.05in; height:auto; border-radius:14px; border:1px solid #DCE5EA; }}
.cards {{ display:grid; gap:0.22in; flex:1; align-content:start; }}
.cards.two {{ grid-template-columns:1fr 1fr; }}
.cards.three {{ grid-template-columns:repeat(3,1fr); }}
.cards.with-image {{ grid-template-columns:1fr; width:4.75in; }}
.card {{ background:white; border:1px solid #DCE5EA; border-radius:16px; padding:0.22in; min-height:2.35in; }}
.cards.with-image .card {{ min-height:1.75in; }}
.label {{ color:#2C7A7B; font-weight:bold; font-size:12pt; letter-spacing:.08em; margin-bottom:0.12in; }}
.body {{ font-size:14pt; line-height:1.32; }}
.strip {{ position:absolute; left:0.6in; right:0.6in; bottom:0.5in; background:#EAF8F5; border:1px solid #4FD1C5;
          border-radius:16px; text-align:center; padding:0.16in; color:#2C7A7B; font-weight:bold; font-size:12.5pt; }}
.note {{ display:none; }}
@media print {{ .note {{ display:none; }} .slide {{ page-break-after:always; }} }}
</style></head><body>
{''.join(parts)}
</body></html>'''
    out = os.path.join(OUT, "pitch-deck.html")
    with open(out, "w", encoding="utf-8") as fh:
        fh.write(doc)
    print("HTML:", out, "slides:", len(parts))


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    build_pptx()
    build_html()
