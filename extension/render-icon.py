"""Renders the DigitalGuard store icon from BRAND_KIT.md's tri-color gradient.

Drawn with PIL rather than rasterised from SVG: ImageMagick is absent on this
Windows host (`convert` resolves to the filesystem utility of the same name), and
these shapes are simple enough to draw directly with supersampled antialiasing.

Brand tokens from BRAND_KIT.md section 2:
  teal #4FD1C5 -> coral #FF9A8B -> lavender #B794F4, 135deg
  deep teal #2C7A7B for text/marks on teal-tinted surfaces
"""

from PIL import Image, ImageDraw

# ---------------------------------------------------------------- brand tokens
TEAL = (0x4F, 0xD1, 0xC5)
CORAL = (0xFF, 0x9A, 0x8B)
LAVENDER = (0xB7, 0x94, 0xF4)
DEEP_TEAL = (0x2C, 0x7A, 0x7B)
SHEILD_TOP = (255, 255, 255)
SHEILD_BOTTOM = (0xF0, 0xFF, 0xF4)

CANVAS = 512          # design space
SUPERSAMPLE = 4       # render at 4x, downscale for clean edges


def lerp(a, b, t):
    return tuple(int(round(a[i] + (b[i] - a[i]) * t)) for i in range(3))


def gradient(size):
    """The brand triad, 135deg, evaluated per pixel."""
    img = Image.new("RGB", (size, size))
    px = img.load()
    span = size - 1
    for y in range(size):
        for x in range(size):
            # 135 degrees: progress runs along x + y
            t = (x + y) / (2 * span)
            if t < 0.5:
                col = lerp(TEAL, CORAL, t / 0.5)
            else:
                col = lerp(CORAL, LAVENDER, (t - 0.5) / 0.5)
            px[x, y] = col
    return img


def cubic(p0, p1, p2, p3, steps=48):
    """Sample a cubic bezier; PIL has no native curve, so tessellate it."""
    pts = []
    for i in range(steps + 1):
        t = i / steps
        mt = 1 - t
        x = mt**3 * p0[0] + 3 * mt**2 * t * p1[0] + 3 * mt * t**2 * p2[0] + t**3 * p3[0]
        y = mt**3 * p0[1] + 3 * mt**2 * t * p1[1] + 3 * mt * t**2 * p2[1] + t**3 * p3[1]
        pts.append((x, y))
    return pts


def shield_path(s):
    """Flat-topped shield curving to a point, in design coords scaled by s."""
    # outline: top-left -> top-right -> down the right edge -> curve to the
    # bottom point -> curve back up the left edge -> close
    outline = [
        (150 * s, 142 * s),
        (362 * s, 142 * s),
        (362 * s, 262 * s),
    ]
    outline += cubic(
        (362 * s, 262 * s), (362 * s, 336 * s), (314 * s, 374 * s), (256 * s, 404 * s)
    )
    outline += cubic(
        (256 * s, 404 * s), (198 * s, 374 * s), (150 * s, 336 * s), (150 * s, 262 * s)
    )
    return outline


def build(size):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    s = size / CANVAS

    # --- squircle ground carrying the brand gradient
    grad = gradient(size)
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [0, 0, size - 1, size - 1], radius=int(116 * s), fill=255
    )
    img.paste(grad, (0, 0), mask)

    d = ImageDraw.Draw(img)

    # --- shield, filled with a soft vertical wash so it does not read as flat.
    # No coloured outline: deep teal blends into the teal corner of the gradient,
    # so the white fill carries the separation on its own.
    shield_mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(shield_mask).polygon(shield_path(s), fill=255)

    wash = Image.new("RGB", (size, size))
    wp = wash.load()
    top_y, bot_y = 142 * s, 404 * s
    for y in range(size):
        t = min(1.0, max(0.0, (y - top_y) / (bot_y - top_y)))
        col = lerp(SHEILD_TOP, SHEILD_BOTTOM, t)
        for x in range(size):
            wp[x, y] = col
    img.paste(wash, (0, 0), shield_mask)

    d = ImageDraw.Draw(img)

    # --- the family, bottom-aligned in a row so it reads as a group of people
    # rather than a face. Two adults, one child: the varied size is what makes
    # it legible as a family at 16px, where three equal dots read as an ellipsis.
    d.ellipse([(206 - 21) * s, (288 - 21) * s, (206 + 21) * s, (288 + 21) * s], fill=DEEP_TEAL + (255,))
    d.ellipse([(256 - 21) * s, (288 - 21) * s, (256 + 21) * s, (288 + 21) * s], fill=DEEP_TEAL + (255,))
    d.ellipse([(303 - 15) * s, (294 - 15) * s, (303 + 15) * s, (294 + 15) * s], fill=DEEP_TEAL + (196,))

    return img


def main():
    big = build(CANVAS * SUPERSAMPLE)
    for out, px in [("store-icon-128.png", 128), ("icon-16.png", 16),
                    ("icon-32.png", 32), ("icon-48.png", 48), ("icon-128.png", 128)]:
        big.resize((px, px), Image.LANCZOS).save(out)
        print(f"  wrote {out} ({px}x{px})")


if __name__ == "__main__":
    main()
