#!/usr/bin/env python3
"""Create flattened, consumer-facing copies of the currently published documents.

The originals remain untouched. Sensitive contact details, signatures, QR codes,
and detailed addresses are softly blurred or defocused after rasterization so the
source text cannot be recovered from the public copy by selecting or extracting
PDF text. The public copy keeps the certificate's normal typography, marks, model
numbers, standards, and dates instead of adding conspicuous redaction labels.
"""

from __future__ import annotations

import argparse
import shutil
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageStat
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
OUTPUT_DIR = ROOT / "output" / "pdf" / "public-docs"
PRIVATE_ORIGINALS = ROOT / "output" / "private-originals"
WORK_DIR = ROOT / "tmp" / "pdfs" / "public-redaction-work-20260831"


JOBS = [
    {
        "source": "suntneew-a20-fcc-sdoc.pdf",
        "output": "suntneew-a20-fcc-sdoc-public.pdf",
        "kind": "huax",
    },
    {
        "source": "suntneew-a3-fcc-sdoc.pdf",
        "output": "suntneew-a3-fcc-sdoc-public.pdf",
        "kind": "huax",
    },
    {
        "source": "suntneew-u23-fcc-sdoc.pdf",
        "output": "suntneew-u23-fcc-sdoc-public.pdf",
        "kind": "huax_u_series",
    },
    {
        "source": "suntneew-u32-fcc-sdoc.pdf",
        "output": "suntneew-u32-fcc-sdoc-public.pdf",
        "kind": "huax_u_series",
    },
    {
        "source": "suntneew-rv-g24-g31-fcc-sdoc.pdf",
        "output": "suntneew-rv-g24-g31-fcc-sdoc-public.pdf",
        "kind": "htt_fcc",
    },
    {
        "source": "suntneew-rv-g24-g31-emc-certificate.pdf",
        "output": "suntneew-rv-g24-g31-emc-certificate-public.pdf",
        "kind": "htt_emc",
    },
    {
        "source": "suntneew-rv-230-314-fcc-sdoc.pdf",
        "output": "suntneew-rv-230-314-fcc-sdoc-public.pdf",
        "kind": "htt_fcc",
    },
    {
        "source": "suntneew-rv-230-314-emc-certificate.pdf",
        "output": "suntneew-rv-230-314-emc-certificate-public.pdf",
        "kind": "htt_emc",
    },
    {
        "source": "suntneew-rv-g31-ip65-certificate.pdf",
        "output": "suntneew-rv-g31-ip65-certificate-public.pdf",
        "kind": "ip65",
    },
    {
        "source": "suntneew-rv-g31-fcc-grant.pdf",
        "output": "suntneew-rv-g31-fcc-grant-public.pdf",
        "kind": "grant",
    },
    {
        "source": "suntneew-rv-series-rohs-test-report.pdf",
        "output": "suntneew-rv-series-rohs-test-report-public-excerpt.pdf",
        "kind": "rohs",
        "keep_pages": 14,
    },
]


MASKS = {
    # Coordinates are normalized to the rendered page.  Only the value lines
    # are covered; company names, certificate numbers, models, standards, dates,
    # logos, and approval marks remain visible for consumer confidence.
    "huax": [
        {"box": (0.39, 0.222, 0.985, 0.260), "mode": "soft", "radius": 9, "feather": 5},
        {"box": (0.39, 0.307, 0.985, 0.355), "mode": "soft", "radius": 9, "feather": 5},
        {"box": (0.57, 0.685, 0.76, 0.745), "mode": "soft", "radius": 11, "feather": 6},
        {"box": (0.15, 0.895, 0.77, 0.932), "mode": "soft", "radius": 8, "feather": 4},
        {"box": (0.15, 0.932, 0.77, 0.972), "mode": "soft", "radius": 8, "feather": 4},
        {"box": (0.75, 0.875, 0.995, 0.998), "mode": "qr", "radius": 4, "feather": 5},
    ],
    "huax_u_series": [
        {"box": (0.39, 0.222, 0.985, 0.282), "mode": "soft", "radius": 9, "feather": 5},
        {"box": (0.39, 0.323, 0.985, 0.402), "mode": "soft", "radius": 9, "feather": 5},
        {"box": (0.57, 0.685, 0.81, 0.745), "mode": "soft", "radius": 11, "feather": 6},
        {"box": (0.15, 0.895, 0.77, 0.932), "mode": "soft", "radius": 8, "feather": 4},
        {"box": (0.15, 0.932, 0.77, 0.972), "mode": "soft", "radius": 8, "feather": 4},
        {"box": (0.75, 0.875, 0.995, 0.998), "mode": "qr", "radius": 4, "feather": 5},
    ],
    "htt_fcc": [
        {"box": (0.33, 0.248, 0.99, 0.300), "mode": "soft", "radius": 9, "feather": 5},
        {"box": (0.33, 0.322, 0.99, 0.372), "mode": "soft", "radius": 9, "feather": 5},
        {"box": (0.33, 0.391, 0.99, 0.441), "mode": "soft", "radius": 9, "feather": 5},
        {"box": (0.60, 0.785, 0.79, 0.875), "mode": "soft", "radius": 11, "feather": 6},
        {"box": (0.40, 0.935, 0.80, 0.960), "mode": "soft", "radius": 8, "feather": 4},
        {"box": (0.40, 0.958, 0.80, 0.987), "mode": "soft", "radius": 8, "feather": 4},
        {"box": (0.78, 0.885, 0.995, 0.998), "mode": "qr", "radius": 4, "feather": 5},
    ],
    "htt_emc": [
        {"box": (0.29, 0.300, 0.99, 0.358), "mode": "soft", "radius": 9, "feather": 5},
        {"box": (0.29, 0.384, 0.99, 0.442), "mode": "soft", "radius": 9, "feather": 5},
        {"box": (0.29, 0.466, 0.99, 0.524), "mode": "soft", "radius": 9, "feather": 5},
        {"box": (0.22, 0.84, 0.48, 0.915), "mode": "soft", "radius": 11, "feather": 6},
        {"box": (0.40, 0.935, 0.80, 0.960), "mode": "soft", "radius": 8, "feather": 4},
        {"box": (0.40, 0.958, 0.80, 0.987), "mode": "soft", "radius": 8, "feather": 4},
        {"box": (0.78, 0.885, 0.995, 0.998), "mode": "qr", "radius": 4, "feather": 5},
    ],
    "ip65": [
        {"box": (0.18, 0.055, 0.80, 0.100), "mode": "soft", "radius": 9, "feather": 5},
        {"box": (0.36, 0.270, 0.99, 0.335), "mode": "soft", "radius": 9, "feather": 5},
        {"box": (0.36, 0.350, 0.99, 0.410), "mode": "soft", "radius": 9, "feather": 5},
        {"box": (0.70, 0.705, 0.86, 0.775), "mode": "soft", "radius": 10, "feather": 6},
        {"box": (0.20, 0.955, 0.995, 0.998), "mode": "soft", "radius": 8, "feather": 5},
    ],
    "grant": [
        {"box": (0.04, 0.220, 0.43, 0.305), "mode": "soft", "radius": 9, "feather": 6},
        {"box": (0.04, 0.315, 0.42, 0.365), "mode": "soft", "radius": 9, "feather": 5},
        {"box": (0.40, 0.190, 0.65, 0.225), "mode": "soft", "radius": 9, "feather": 5},
    ],
    "rohs": [
        {"box": (0.28, 0.243, 0.92, 0.310), "mode": "soft", "radius": 8, "feather": 4},
        {"box": (0.10, 0.868, 0.90, 0.889), "mode": "soft", "radius": 7, "feather": 4},
        {"box": (0.10, 0.889, 0.90, 0.926), "mode": "soft", "radius": 7, "feather": 4},
        {"box": (0.75, 0.705, 0.87, 0.825), "mode": "qr", "radius": 4, "feather": 5},
    ],
}


def render_pages(source: Path, work: Path, dpi: int) -> list[Path]:
    prefix = work / "page"
    subprocess.run(
        ["pdftoppm", "-r", str(dpi), "-png", str(source), str(prefix)],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE,
    )
    return sorted(work.glob("page-*.png"))


def _mean_border_color(image: Image.Image, box: tuple[int, int, int, int]) -> tuple[int, int, int]:
    """Estimate the paper/background tone without sampling the text itself."""

    left, top, right, bottom = box
    width, height = image.size
    edge = max(3, min(24, (right - left) // 12, (bottom - top) // 3))
    strips = [
        image.crop((left, max(0, top - edge), right, top)),
        image.crop((left, bottom, right, min(height, bottom + edge))),
        image.crop((max(0, left - edge), top, left, bottom)),
        image.crop((right, top, min(width, right + edge), bottom)),
    ]
    means = [ImageStat.Stat(strip).mean for strip in strips if strip.width and strip.height]
    if not means:
        return (255, 255, 255)
    return tuple(round(sum(sample[channel] for sample in means) / len(means)) for channel in range(3))


def _soft_filtered_crop(crop: Image.Image, radius: int, wash: float) -> Image.Image:
    """Make a defocused, low-contrast copy that does not preserve readable glyphs."""

    # Median filtering removes thin strokes before the Gaussian blur.  The
    # low-contrast blend prevents black text from surviving as dark silhouettes.
    median_size = max(3, min(9, crop.width // 20 * 2 + 1, crop.height // 20 * 2 + 1))
    if median_size % 2 == 0:
        median_size += 1
    filtered = crop.filter(ImageFilter.MedianFilter(size=median_size))
    filtered = filtered.filter(ImageFilter.GaussianBlur(radius=max(2, radius)))
    pale = ImageEnhance.Contrast(filtered).enhance(0.18)
    pale = ImageEnhance.Brightness(pale).enhance(1.03)
    return Image.blend(filtered, pale, max(0.0, min(1.0, wash)))


def _qr_filtered_crop(crop: Image.Image, radius: int) -> Image.Image:
    """Defocus a QR code while retaining a subtle, paper-like visual texture."""

    # A QR code should remain visibly present but cannot be scannable.  Bilinear
    # reduction followed by bicubic enlargement removes module-level detail and
    # avoids the hard-edged grey rectangle used by the previous version.
    small_width = max(8, crop.width // 18)
    small_height = max(8, crop.height // 18)
    reduced = crop.resize((small_width, small_height), Image.Resampling.BILINEAR)
    enlarged = reduced.resize(crop.size, Image.Resampling.BICUBIC)
    return enlarged.filter(ImageFilter.GaussianBlur(max(2, radius)))


def _apply_one_mask(image: Image.Image, spec: dict[str, object]) -> Image.Image:
    width, height = image.size
    left, top, right, bottom = spec["box"]  # type: ignore[index]
    core = (
        max(0, int(float(left) * width)),
        max(0, int(float(top) * height)),
        min(width, int(float(right) * width)),
        min(height, int(float(bottom) * height)),
    )
    radius = int(spec.get("radius", 8))
    feather = int(spec.get("feather", 6))
    mode = str(spec.get("mode", "soft"))

    # Include context in the filter so the transition looks like a defocused
    # portion of the original page rather than a pasted rectangle.
    context = max(4, feather * 2)
    expanded = (
        max(0, core[0] - context),
        max(0, core[1] - context),
        min(width, core[2] + context),
        min(height, core[3] + context),
    )
    crop = image.crop(expanded)
    if mode == "qr":
        replacement = _qr_filtered_crop(crop, radius)
    else:
        replacement = _soft_filtered_crop(crop, radius, float(spec.get("wash", 0.68)))
        # Blend in a local paper tone so address/contact lines disappear into
        # the existing white or patterned background instead of becoming grey.
        tone = _mean_border_color(image, core)
        tint = Image.new("RGB", replacement.size, tone)
        replacement = Image.blend(replacement, tint, float(spec.get("tone", 0.34)))

    patched = image.copy()
    patched.paste(replacement, expanded)

    # Full opacity over the sensitive core, with a feathered edge outside it.
    mask = Image.new("L", image.size, 0)
    mask_draw = ImageDraw.Draw(mask)
    corner = max(2, min(feather * 2, (core[2] - core[0]) // 5, (core[3] - core[1]) // 2))
    mask_draw.rounded_rectangle(core, radius=corner, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(feather))
    return Image.composite(patched, image, mask)


def apply_masks(image: Image.Image, masks: list[dict[str, object]]) -> Image.Image:
    image = image.convert("RGB")
    for spec in masks:
        image = _apply_one_mask(image, spec)
    return image


def write_pdf(images: list[Path], destination: Path, jpeg: bool = False) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    first = Image.open(images[0])
    pixel_width, pixel_height = first.size
    # All source files are A4; using the source aspect ratio avoids stretching.
    page_width = 595.276
    page_height = page_width * pixel_height / pixel_width
    pdf = canvas.Canvas(str(destination), pagesize=(page_width, page_height), pageCompression=1)
    for image_path in images:
        if jpeg:
            image = Image.open(image_path).convert("RGB")
            jpeg_path = image_path.with_suffix(".jpg")
            image.save(jpeg_path, "JPEG", quality=95, optimize=True)
            draw_path = jpeg_path
        else:
            draw_path = image_path
        pdf.drawImage(ImageReader(str(draw_path)), 0, 0, width=page_width, height=page_height)
        pdf.showPage()
    pdf.save()


def create_job(job: dict) -> Path:
    source = PRIVATE_ORIGINALS / job["source"]
    if not source.exists():
        source = ASSETS / job["source"]
    if not source.exists():
        raise FileNotFoundError(source)
    job_work = WORK_DIR / Path(job["output"]).stem
    job_work.mkdir(parents=True, exist_ok=True)
    rendered = render_pages(source, job_work, dpi=200 if job["kind"] != "rohs" else 160)
    if job.get("keep_pages"):
        rendered = rendered[: int(job["keep_pages"])]
    processed: list[Path] = []
    for index, page in enumerate(rendered, start=1):
        image = Image.open(page)
        masks = MASKS[job["kind"]] if (job["kind"] != "rohs" or index == 1) else []
        image = apply_masks(image, masks)
        target = job_work / f"processed-{index:02d}.png"
        image.save(target, "PNG", optimize=True)
        processed.append(target)
    output = OUTPUT_DIR / job["output"]
    write_pdf(processed, output, jpeg=job["kind"] == "rohs")
    return output


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--copy-to-assets", action="store_true")
    parser.add_argument("--only", help="Process only the job whose output filename contains this value.")
    args = parser.parse_args()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    created = []
    jobs = JOBS
    if args.only:
        jobs = [job for job in JOBS if args.only in job["output"]]
        if not jobs:
            raise SystemExit(f"No job matched --only {args.only!r}")
    for job in jobs:
        output = create_job(job)
        if args.copy_to_assets:
            target = ASSETS / output.name
            shutil.copy2(output, target)
            created.append(target)
        else:
            created.append(output)
    for path in created:
        print(path)


if __name__ == "__main__":
    main()
