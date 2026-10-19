"""Render the AI lab terminal as looping GIFs with a static SVG fallback."""

from __future__ import annotations

import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets"

BG = (7, 11, 20)
SURFACE = (11, 19, 35)
CYAN = (0, 229, 255)
BLUE = (57, 139, 255)
VIOLET = (148, 112, 255)
TEXT = (237, 247, 255)
MUTED = (147, 169, 191)
LINE = (42, 74, 104)

FONT_DIR = Path(os.environ.get("WINDIR", r"C:\Windows")) / "Fonts"
def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    name = "consolab.ttf" if bold else "consola.ttf"
    return ImageFont.truetype(str(FONT_DIR / name), size)


def script(mobile: bool) -> list[tuple[str, str]]:
    mission = (
        [
            ("out", "Engineering intelligent systems"),
            ("out", "that transform complex problems"),
            ("out", "into practical software."),
        ]
        if mobile
        else [
            ("out", "Engineering intelligent systems that transform"),
            ("out", "complex problems into practical software."),
        ]
    )
    return [
        ("prompt", "whoami"),
        ("out", "Vinay Vasamsetty"),
        ("out", "Founder & AI Systems Engineer"),
        ("gap", ""),
        ("prompt", "focus"),
        ("item", "Agentic AI Systems"),
        ("item", "Retrieval-Augmented Generation"),
        ("item", "AI Infrastructure"),
        ("item", "Intelligent Automation"),
        ("item", "Full-Stack Engineering"),
        ("gap", ""),
        ("prompt", "mission"),
        *mission,
        ("gap", ""),
        ("prompt", "status"),
        ("status", "SYSTEMS ONLINE"),
        ("ready", "READY TO BUILD"),
    ]


def draw_background(image: Image.Image, header: int) -> None:
    draw = ImageDraw.Draw(image)
    w, h = image.size
    draw.rectangle((0, 0, w, h), fill=BG)
    draw.rectangle((0, 0, w, header), fill=SURFACE)
    draw.line((0, header, w, header), fill=LINE, width=1)
    draw.rectangle((0, 0, w - 1, h - 1), outline=LINE)
    for index, color in enumerate((MUTED, CYAN, BLUE)):
        cx = 28 + index * 18
        draw.ellipse((cx - 5, header // 2 - 5, cx + 5, header // 2 + 5), fill=color)


def text_width(draw: ImageDraw.ImageDraw, value: str, face: ImageFont.FreeTypeFont) -> int:
    return int(draw.textlength(value, font=face))


def canvas_size(mobile: bool) -> tuple[int, int, int, int, int]:
    size = 26 if mobile else 20
    header = 64 if mobile else 56
    line_h = 40 if mobile else 32
    width = 720 if mobile else 1040
    rows = script(mobile)
    content = sum(line_h if kind != "gap" else int(line_h * 0.45) for kind, _ in rows)
    height = header + 36 + content + 36
    return width, height, header, line_h, size


def render(lines: list[tuple[str, str]], cursor: bool, mobile: bool) -> Image.Image:
    width, height, header, line_h, size = canvas_size(mobile)
    face = font(size)
    face_bold = font(size, True)
    header_face = font(16 if mobile else 15)
    image = Image.new("RGB", (width, height), BG)
    draw_background(image, header)
    draw = ImageDraw.Draw(image)
    title = "ai-lab   ·   session 01"
    tw = text_width(draw, title, header_face)
    draw.text(((width - tw) / 2, header // 2 - 10), title, font=header_face, fill=MUTED)
    status = "SYS.OK"
    draw.text((width - 24 - text_width(draw, status, header_face), header // 2 - 10), status, font=header_face, fill=CYAN)
    y = header + 28
    for kind, value in lines:
        if kind == "gap":
            y += int(line_h * 0.45)
            continue
        if kind == "prompt":
            prompt = "vinay@ai-lab:~$ "
            draw.text((28, y), prompt, font=face, fill=CYAN)
            draw.text((28 + text_width(draw, prompt, face), y), value, font=face, fill=TEXT)
        elif kind == "item":
            draw.text((28, y), ">", font=face, fill=VIOLET)
            draw.text((28 + text_width(draw, "> ", face), y), value, font=face, fill=MUTED)
        elif kind == "status":
            draw.text((28, y), value, font=face_bold, fill=CYAN)
        elif kind == "ready":
            draw.text((28, y), value, font=face_bold, fill=TEXT)
            if cursor:
                cx = 28 + text_width(draw, value + " ", face_bold)
                draw.rectangle((cx, y + 4, cx + int(size * 0.55), y + size - 2), fill=CYAN)
        else:
            draw.text((28, y), value, font=face, fill=MUTED)
        y += line_h
    return image


def snapshots(mobile: bool) -> list[tuple[Image.Image, int]]:
    rows = script(mobile)
    frames: list[tuple[list[tuple[str, str]], bool, int]] = []
    visible: list[tuple[str, str]] = []
    index = 0
    while index < len(rows):
        kind, value = rows[index]
        if kind == "prompt":
            for count in range(len(value) + 1):
                frames.append(([*visible, ("prompt", value[:count])], True, 75))
            visible.append((kind, value))
            index += 1
            block: list[tuple[str, str]] = []
            while index < len(rows) and rows[index][0] != "prompt":
                block.append(rows[index])
                index += 1
            visible.extend(block)
            frames.append((list(visible), True, 280))
            frames.append((list(visible), False, 280))
            frames.append((list(visible), True, 700))
        else:
            visible.append((kind, value))
            index += 1
    for _ in range(3):
        frames.append((list(visible), True, 420))
        frames.append((list(visible), False, 280))
    frames.append(([], True, 240))
    return [(render(lines, cursor, mobile), delay) for lines, cursor, delay in frames]


def save_gif(frames: list[tuple[Image.Image, int]], path: Path) -> None:
    images = [frame.convert("RGB") for frame, _ in frames]
    durations = [delay for _, delay in frames]
    palette = images[len(images) // 2].quantize(colors=64, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    quantized = [image.quantize(palette=palette, dither=Image.Dither.NONE) for image in images]
    quantized[0].save(
        path,
        save_all=True,
        append_images=quantized[1:],
        duration=durations,
        loop=0,
        optimize=True,
        disposal=2,
    )


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for mobile, name in ((False, "terminal.gif"), (True, "terminal-mobile.gif")):
        frames = snapshots(mobile)
        target = OUT / name
        save_gif(frames, target)
        print(f"{name} {target.stat().st_size} bytes  {len(frames)} frames  {frames[0][0].size}")


if __name__ == "__main__":
    main()
