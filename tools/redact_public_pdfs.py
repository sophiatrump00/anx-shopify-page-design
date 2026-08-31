#!/usr/bin/env python3
"""Create flattened, consumer-facing copies of the currently published documents.

The originals remain untouched. Sensitive contact details, signatures, QR codes,
and detailed addresses are painted over after rasterization so the source text
cannot be recovered from the public copy by selecting or extracting PDF text.
"""

from __future__ import annotations

import argparse
import shutil
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
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
        "kind": "huax",
    },
    {
        "source": "suntneew-u32-fcc-sdoc.pdf",
        "output": "suntneew-u32-fcc-sdoc-public.pdf",
        "kind": "huax",
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
    # Coordinates are normalized against the 1075 x 1521 review render.
    "huax": [
        (0.38, 0.215, 0.99, 0.265),  # certificate holder address
        (0.38, 0.305, 0.99, 0.35),  # manufacturer address
        (0.55, 0.675, 0.88, 0.805),  # signature / manager identity
        (0.14, 0.875, 0.82, 0.985),  # testing-lab address and contacts
        (0.74, 0.86, 0.995, 0.998),  # QR code
    ],
    "htt_fcc": [
        (0.32, 0.245, 0.99, 0.30),  # applicant address
        (0.32, 0.318, 0.99, 0.373),  # manufacturer address
        (0.32, 0.388, 0.99, 0.443),  # factory address
        (0.18, 0.76, 0.82, 0.925),  # authorised signatory
        (0.38, 0.895, 0.84, 0.985),  # laboratory contacts
        (0.77, 0.885, 0.995, 0.998),  # QR code
    ],
    "htt_emc": [
        (0.30, 0.295, 0.99, 0.36),  # applicant address
        (0.30, 0.38, 0.99, 0.445),  # manufacturer address
        (0.30, 0.46, 0.99, 0.522),  # factory address
        (0.18, 0.78, 0.82, 0.925),  # authorised signatory
        (0.38, 0.895, 0.84, 0.985),  # laboratory contacts
        (0.77, 0.885, 0.995, 0.998),  # QR code
    ],
    "ip65": [
        (0.18, 0.025, 0.82, 0.105),  # laboratory street address
        (0.36, 0.255, 0.99, 0.365),  # holder address
        (0.36, 0.365, 0.99, 0.475),  # manufacturer address
        (0.65, 0.685, 0.91, 0.805),  # manager signature
        (0.20, 0.945, 0.995, 0.998),  # footer phone/email/web
    ],
    "grant": [
        (0.04, 0.215, 0.43, 0.315),  # grantee street address
        (0.04, 0.315, 0.38, 0.385),  # attention contact
        (0.40, 0.175, 0.65, 0.245),  # issuing lab street address
    ],
    "rohs": [
        (0.25, 0.215, 0.94, 0.315),  # client address on page 1
        (0.10, 0.905, 0.90, 0.995),  # laboratory contacts on page 1
        (0.75, 0.705, 0.97, 0.855),  # QR code on page 1
    ],
}


def font_for(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size=size)
    return ImageFont.load_default()


def render_pages(source: Path, work: Path, dpi: int) -> list[Path]:
    prefix = work / "page"
    subprocess.run(
        ["pdftoppm", "-r", str(dpi), "-png", str(source), str(prefix)],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE,
    )
    return sorted(work.glob("page-*.png"))


def apply_masks(image: Image.Image, masks: list[tuple[float, float, float, float]]) -> Image.Image:
    image = image.convert("RGB")
    draw = ImageDraw.Draw(image)
    width, height = image.size
    for left, top, right, bottom in masks:
        box = (
            max(0, int(left * width)),
            max(0, int(top * height)),
            min(width, int(right * width)),
            min(height, int(bottom * height)),
        )
        draw.rectangle(box, fill=(220, 224, 228), outline=(145, 152, 160), width=max(2, width // 700))
        label_size = max(12, min(28, int((box[3] - box[1]) * 0.18)))
        font = font_for(label_size)
        label = "REDACTED"
        bounds = draw.textbbox((0, 0), label, font=font)
        label_width = bounds[2] - bounds[0]
        label_height = bounds[3] - bounds[1]
        x = box[0] + max(4, (box[2] - box[0] - label_width) // 2)
        y = box[1] + max(4, (box[3] - box[1] - label_height) // 2) - bounds[1]
        draw.text((x, y), label, fill=(76, 83, 91), font=font)
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
