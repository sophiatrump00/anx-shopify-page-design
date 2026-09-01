from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
SOURCE_ARTWORK = ROOT / "tools" / "source-artwork" / "legacy-energy-star"


def _logo(name: str) -> Image.Image:
    image = Image.open(ASSETS / name).convert("RGBA")
    return image.crop(image.getbbox())


DARK_LOGO = _logo("suntneew-logo-ai-dark.png")
LIGHT_LOGO = _logo("suntneew-logo-ai-white.png")


def _scaled_box(image: Image.Image, box: tuple[float, float, float, float]) -> tuple[int, int, int, int]:
    width, height = image.size
    return tuple(round(value * (width if index % 2 == 0 else height)) for index, value in enumerate(box))


def _erase(image: Image.Image, box: tuple[int, int, int, int]) -> None:
    left, top, right, bottom = box
    width = right - left
    height = bottom - top
    source = np.asarray(image.convert("RGB"), dtype=np.float32)
    upper = source[max(0, top - 3), left:right]
    lower = source[min(source.shape[0] - 1, bottom + 3), left:right]
    interpolation = np.empty((height, width, 3), dtype=np.uint8)
    for row in range(height):
        ratio = row / max(1, height - 1)
        interpolation[row] = np.clip(upper * (1 - ratio) + lower * ratio, 0, 255)
    patch = Image.fromarray(interpolation, "RGB")
    mask = Image.new("L", (width, height), 255).filter(ImageFilter.GaussianBlur(max(2, height // 10)))
    image.paste(patch, (left, top), mask)


def _place_logo(
    image: Image.Image,
    box: tuple[int, int, int, int],
    variant: str,
    width_ratio: float = 0.82,
) -> None:
    left, top, right, bottom = box
    logo = DARK_LOGO if variant == "dark" else LIGHT_LOGO
    target_width = max(24, round((right - left) * width_ratio))
    target_height = max(8, round(target_width * logo.height / logo.width))
    max_height = max(8, round((bottom - top) * 0.72))
    if target_height > max_height:
        target_height = max_height
        target_width = round(target_height * logo.width / logo.height)
    logo = logo.resize((target_width, target_height), Image.Resampling.LANCZOS)
    x = left + (right - left - target_width) // 2
    y = top + (bottom - top - target_height) // 2
    image.alpha_composite(logo, (x, y))


def rebrand(
    source_name: str,
    output_name: str,
    boxes: list[tuple[tuple[float, float, float, float], str, float]],
) -> None:
    source = Image.open(SOURCE_ARTWORK / source_name).convert("RGBA")
    for relative_box, logo_variant, width_ratio in boxes:
        box = _scaled_box(source, relative_box)
        _erase(source, box)
        _place_logo(source, box, logo_variant, width_ratio)
    output = ASSETS / output_name
    if output.suffix.lower() in {".jpg", ".jpeg"}:
        source.convert("RGB").save(output, quality=94, optimize=True, progressive=True)
    else:
        source.save(output, optimize=True)


def copy_asset(source_name: str, output_name: str) -> None:
    image = Image.open(SOURCE_ARTWORK / source_name)
    output = ASSETS / output_name
    if output.suffix.lower() in {".jpg", ".jpeg"}:
        image.convert("RGB").save(output, quality=94, optimize=True, progressive=True)
    else:
        image.save(output, optimize=True)


def main() -> None:
    rebrand(
        "energy-star-home-hero-v1.png",
        "suntneew-home-hero-v2.png",
        [
            ((0.684, 0.710, 0.755, 0.790), "dark", 0.74),
            ((0.800, 0.760, 0.883, 0.840), "dark", 0.74),
        ],
    )
    rebrand(
        "energy-star-wl5a-main-v1.jpg",
        "suntneew-wl5a-main-v2.jpg",
        [((0.365, 0.690, 0.585, 0.825), "dark", 0.78)],
    )
    rebrand(
        "energy-star-wl5a-install-v1.png",
        "suntneew-wl5a-install-v2.png",
        [((0.445, 0.535, 0.595, 0.625), "dark", 0.78)],
    )
    rebrand(
        "energy-star-wl5a-gallery-01.jpg",
        "suntneew-wl5a-gallery-01-v2.jpg",
        [((0.335, 0.585, 0.680, 0.810), "dark", 0.48)],
    )
    rebrand(
        "energy-star-wl10b-main-v1.jpg",
        "suntneew-wl10b-main-v2.jpg",
        [((0.390, 0.730, 0.590, 0.850), "dark", 0.78)],
    )
    rebrand(
        "energy-star-wl10b-install-v1.png",
        "suntneew-wl10b-install-v2.png",
        [((0.285, 0.620, 0.505, 0.790), "dark", 0.48)],
    )
    rebrand(
        "energy-star-wl10b-gallery-01.jpg",
        "suntneew-wl10b-gallery-01-v2.jpg",
        [((0.350, 0.695, 0.645, 0.815), "dark", 0.78)],
    )
    rebrand(
        "energy-star-vh-install-v1.png",
        "suntneew-vh-install-v2.png",
        [((0.505, 0.155, 0.665, 0.235), "light", 0.72)],
    )
    rebrand(
        "energy-star-vh10-vh15-main-v1.jpg",
        "suntneew-vh10-vh15-main-v2.jpg",
        [
            ((0.205, 0.320, 0.410, 0.425), "light", 0.52),
            ((0.520, 0.135, 0.760, 0.245), "light", 0.52),
        ],
    )
    rebrand(
        "energy-star-vh10-gallery-01.jpg",
        "suntneew-vh10-gallery-01-v2.jpg",
        [
            ((0.185, 0.405, 0.415, 0.545), "light", 0.48),
            ((0.515, 0.205, 0.785, 0.350), "light", 0.48),
        ],
    )
    rebrand(
        "energy-star-vh10-gallery-04.jpg",
        "suntneew-vh10-gallery-04-v2.jpg",
        [((0.150, 0.430, 0.585, 0.570), "light", 0.44)],
    )

    for source_name, output_name in [
        ("energy-star-wl5a-gallery-04.jpg", "suntneew-wl5a-gallery-04-v2.jpg"),
        ("energy-star-wl5a-gallery-05.jpg", "suntneew-wl5a-gallery-05-v2.jpg"),
        ("energy-star-wl5a-gallery-07.jpg", "suntneew-wl5a-gallery-07-v2.jpg"),
        ("energy-star-wl5a-spec-v1.jpg", "suntneew-wl5a-spec-v2.jpg"),
        ("energy-star-wl10b-gallery-04.jpg", "suntneew-wl10b-gallery-04-v2.jpg"),
        ("energy-star-wl10b-gallery-05.jpg", "suntneew-wl10b-gallery-05-v2.jpg"),
        ("energy-star-wl10b-gallery-07.jpg", "suntneew-wl10b-gallery-07-v2.jpg"),
        ("energy-star-wl10b-spec-v1.jpg", "suntneew-wl10b-spec-v2.jpg"),
        ("energy-star-vh10-gallery-02.jpg", "suntneew-vh10-gallery-02-v2.jpg"),
        ("energy-star-vh10-gallery-03.jpg", "suntneew-vh10-gallery-03-v2.jpg"),
        ("energy-star-vh10-vh15-spec-v1.jpg", "suntneew-vh10-vh15-spec-v2.jpg"),
    ]:
        copy_asset(source_name, output_name)


if __name__ == "__main__":
    main()
