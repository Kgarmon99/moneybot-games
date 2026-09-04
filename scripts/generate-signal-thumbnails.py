#!/usr/bin/env python3
"""Generate a cohesive MoneyBot Signal thumbnail for every catalog entry.

Original artwork remains untouched. Outputs are written to
moneybot-official/assets/thumbs-signal and the canonical manifest is updated to
reference those derived files.
"""
from __future__ import annotations

import json
import math
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "moneybot-official"
MANIFEST = SITE / "data" / "games.manifest.json"
SOURCES = SITE / "data" / "thumbnail-sources.json"
OUT = SITE / "assets" / "thumbs-signal"
FONTS = SITE / "assets" / "fonts"
LOGO = SITE / "assets" / "logo.jpg"

W, H = 640, 360
PAPER = "#F5F5F0"
PAPER_DEEP = "#ECECE5"
INK = "#090B0A"
BODY = "#454A46"
MUTED = "#6F756F"
GREEN = "#00E676"
WHITE = "#FFFFFF"
GOLD = "#FBBF24"


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    path = FONTS / name
    if not path.exists():
        path = Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf")
    return ImageFont.truetype(str(path), size)


def open_source(path: Path) -> Image.Image:
    try:
        return Image.open(path).convert("RGB")
    except Exception:
        # SVGs and missing files fall back to the official MoneyBot logo.
        logo = LOGO if LOGO.exists() else SITE / "assets" / "logo.jpg"
        if not logo.exists():
            logo = SITE / "assets" / "moneybot-logo-1.jpg"
        return Image.open(logo).convert("RGB")


def cover(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    return ImageOps.fit(image, size, method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))


def contain(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    fitted = ImageOps.contain(image, size, method=Image.Resampling.LANCZOS)
    layer = Image.new("RGB", size, INK)
    layer.paste(fitted, ((size[0] - fitted.width) // 2, (size[1] - fitted.height) // 2))
    return layer


def wrap_title(draw: ImageDraw.ImageDraw, title: str, face: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    words = title.upper().split()
    lines: list[str] = []
    current = ""
    for word in words:
        trial = word if not current else f"{current} {word}"
        if draw.textbbox((0, 0), trial, font=face)[2] <= max_width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines[:2]


def slug(value: str) -> str:
    return re.sub(r"[^a-z0-9-]+", "-", value.lower()).strip("-")


def make_thumbnail(game: dict, index: int, source: Path) -> Image.Image:
    canvas = Image.new("RGB", (W, H), PAPER)
    draw = ImageDraw.Draw(canvas)

    # Signal glow. Built as soft concentric fields to stay deterministic.
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    for radius in range(260, 20, -12):
        alpha = int(2 + 24 * (1 - radius / 260) ** 2)
        gd.ellipse((W - radius - 10, -radius // 2, W + radius - 10, radius + radius // 2), fill=(0, 230, 118, alpha))
    canvas = Image.alpha_composite(canvas.convert("RGBA"), glow).convert("RGB")
    draw = ImageDraw.Draw(canvas)

    # Technical index and category marker.
    label_face = font("Inter-Bold.ttf", 16)
    draw.text((24, 18), f"MBG / {index:03d}", font=label_face, fill=MUTED)
    topic = str(game.get("topic", "money-skills")).replace("-", " ").upper()
    topic_width = draw.textbbox((0, 0), topic, font=label_face)[2]
    draw.rectangle((W - topic_width - 48, 12, W - 20, 42), fill=GREEN, outline=INK, width=2)
    draw.text((W - topic_width - 34, 18), topic, font=label_face, fill=INK)

    # Existing game art is preserved inside a consistent physical frame.
    source_image = open_source(source)
    art_box = (22, 56, 618, 246)
    art_size = (art_box[2] - art_box[0], art_box[3] - art_box[1])
    background = cover(source_image, art_size).filter(ImageFilter.GaussianBlur(10))
    background = Image.blend(background, Image.new("RGB", art_size, INK), 0.34)
    canvas.paste(background, art_box[:2])
    foreground = cover(source_image, art_size)
    foreground = Image.blend(background, foreground, 0.9)
    canvas.paste(foreground, art_box[:2])
    draw.rectangle(art_box, outline=INK, width=4)
    draw.rectangle((art_box[0], art_box[3] - 8, art_box[2], art_box[3]), fill=GREEN)

    # Editorial title block.
    title_face = font("Inter-Black.ttf", 34)
    title_lines = wrap_title(draw, str(game["title"]), title_face, 476)
    title_y = 268 if len(title_lines) == 1 else 254
    for line in title_lines:
        draw.text((24, title_y), line, font=title_face, fill=INK, stroke_width=0)
        title_y += 36

    difficulty = str(game.get("difficulty", "play")).upper()
    status = str(game.get("status", "beta")).upper()
    badge_color = GOLD if status == "FLAGSHIP" else GREEN
    badge_face = font("Inter-Bold.ttf", 14)
    badge = f"{status} / {difficulty}"
    badge_w = draw.textbbox((0, 0), badge, font=badge_face)[2] + 20
    draw.rectangle((W - badge_w - 20, 302, W - 20, 334), fill=badge_color, outline=INK, width=2)
    draw.text((W - badge_w - 10, 310), badge, font=badge_face, fill=INK)

    # A minimal MoneyBot signal seal, using the official asset.
    logo = Image.open(LOGO).convert("RGBA")
    logo.thumbnail((58, 58), Image.Resampling.LANCZOS)
    seal = Image.new("RGBA", (64, 64), (245, 245, 240, 240))
    seal.alpha_composite(logo, ((64 - logo.width) // 2, (64 - logo.height) // 2))
    canvas.paste(seal.convert("RGB"), (W - 84, 250))
    draw.rectangle((W - 84, 250, W - 20, 314), outline=INK, width=2)

    return canvas


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    data = json.loads(MANIFEST.read_text())
    games = data["games"]
    sources = json.loads(SOURCES.read_text()) if SOURCES.exists() else {}
    generated = 0
    for index, game in enumerate(games, start=1):
        source_rel = sources.get(game["id"], game["thumbnail"])
        source = SITE / source_rel
        output_name = f"{slug(game['id'])}.webp"
        output = OUT / output_name
        image = make_thumbnail(game, index, source)
        image.save(output, "WEBP", quality=88, method=6)
        game["thumbnail"] = f"assets/thumbs-signal/{output_name}"
        generated += 1

    data["thumbnailSystem"] = {
        "name": "MoneyBot Signal",
        "version": "1.0",
        "generatedCount": generated,
        "sourcePolicy": "Original game art preserved inside a standardized Signal frame"
    }
    MANIFEST.write_text(json.dumps(data, indent=2) + "\n")
    print(f"Generated {generated} MoneyBot Signal thumbnails in {OUT}")


if __name__ == "__main__":
    main()
