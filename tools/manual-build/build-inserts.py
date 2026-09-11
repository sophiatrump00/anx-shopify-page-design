#!/usr/bin/env python3
"""生成 KB700 / U32 / OJ02 / C2 的产品插页 PDF。

做法：以现有插页原件为底版（搭电宝家族共用同一套版式和图标），只把需要替换的
字段（型号、制造商与地址、E-mail/Tel、Distributor）用白底覆盖后重写，
logo、警示图标、8 语言警示正文和第 2 页整页保持原样。

用法：
    python3 tools/manual-build/build-inserts.py            # 生成全部
    python3 tools/manual-build/build-inserts.py kb700      # 只生成一个

依赖：google-chrome（打印 PDF）、pypdf（叠加）、pdfinfo（校验）。
"""

from __future__ import annotations

import html
import math
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image
from pypdf import PdfReader, PdfWriter

ROOT = Path(__file__).resolve().parents[2]
INSERTS = ROOT / "tools" / "manual-build" / "inserts"
BUILD = INSERTS / ".build"

PAGE_W, PAGE_H = 226.772, 340.157  # 80 x 120 mm
VALUE_SIZE = 7 / 1.5               # 原件 value 字号（XML 单位 ÷ 1.5）
TEXT_COLOR = "#231f20"
MEASURE_DPI = 300                  # 量取底版墨迹用的渲染精度
COVER_PAD_X = 0.8
COVER_PAD_Y = 0.45
RULE_MIN_RUN = 20.0                # 超过这个长度的横向深色段视为表格分隔线

# 字段位置来自原件版面测量：top, left, width, height（pt）
U23_BASE = {
    "model": (16.67, 66.0, 8.67, 7.33),
    "brand": (24.0, 64.67, 24.0, 7.33),
    "manufacturer": (32.0, 64.67, 103.33, 7.33),
    "address1": (40.67, 64.67, 142.0, 7.33),
    "address2": (46.0, 64.67, 146.67, 7.33),
    "address3": (51.33, 64.67, 148.67, 7.33),
    "address4": (56.67, 64.67, 63.33, 7.33),
    "email": (66.0, 64.67, 54.0, 7.33),
    "distributor": (74.67, 65.33, 130.0, 7.33),
}

C2_BASE = {
    "model": (13.33, 66.0, 14.67, 7.33),
    "brand": (20.67, 64.67, 24.0, 7.33),
    "manufacturer": (28.67, 64.67, 110.0, 7.33),
    "address1": (39.33, 64.67, 139.33, 7.33),
    "address2": (46.0, 64.67, 143.33, 7.33),
    "address3": (52.67, 64.67, 13.33, 7.33),
    "email": (62.67, 64.67, 54.0, 7.33),
    "distributor": (71.33, 65.33, 130.0, 7.33),
}

DISTRIBUTOR = "Shanghai Shunxiangyang Clean Energy Technology Co., Ltd."
EMAIL = "info@suntneew.com"

PLUS_MANUFACTURER = "Shenzhen Plus Electronic Technology Co., Ltd"
PLUS_ADDRESS = [
    "Room 201,3rd floor301,9th Building, Donghai Industrial Zone,",
    "No.2 Shanxixia Road.Dakang Community, Yuanshan Sub-district",
    "Administrative Offices, Longgang District, Shenzhen, Guangdong",
    "Province, P. R. China 518100",
]

JOBS = [
    {
        "id": "kb700",
        "base": "u23-insert.pdf",
        "geometry": U23_BASE,
        "fields": {
            "model": "KP-700",
            "email": EMAIL,
            "distributor": DISTRIBUTOR,
        },
    },
    {
        "id": "u32",
        "base": "u23-insert.pdf",
        "geometry": U23_BASE,
        "fields": {
            "model": "U32",
            "email": EMAIL,
            "distributor": DISTRIBUTOR,
        },
    },
    {
        "id": "oj02",
        "base": "u23-insert.pdf",
        "geometry": U23_BASE,
        "fields": {
            "model": "OJ02",
            "manufacturer": "Guangdong Boltpower Energy Co.,Ltd",
            "address1": "No.22 Xinfu Road, Lincun, Tangxia Town, Dongguan City,",
            "address2": "Guangdong Province, China. 523710",
            "address3": "",
            "address4": "",
            "email": EMAIL,
            "distributor": DISTRIBUTOR,
        },
    },
    {
        "id": "c2",
        "base": "c2-base.pdf",
        "geometry": C2_BASE,
        "fields": {
            "email": EMAIL,
            "distributor": DISTRIBUTOR,
        },
    },
]


def ink_boxes(base_png: Path, geometry: dict, fields: list[str]) -> dict[str, tuple[float, float, float, float]]:
    """在底版渲染图上量出每个字段的真实墨迹范围（pt），跳过行分隔线。"""
    image = Image.open(base_png).convert("L")
    pixels = image.load()
    scale = MEASURE_DPI / 72.0
    result: dict[str, tuple[float, float, float, float]] = {}

    for field in fields:
        top, left, width, height = geometry[field]
        x0, x1 = int((left - 1.5) * scale), int((left + width + 2.0) * scale)
        y0, y1 = int((top - 1.0) * scale), int((top + height + 1.0) * scale)
        rows: list[tuple[int, int, int]] = []
        for y in range(y0, y1):
            run = best = 0
            first = last = None
            for x in range(x0, x1):
                if pixels[x, y] < 205:
                    run += 1
                    if first is None:
                        first = x
                    last = x
                    best = max(best, run)
                else:
                    run = 0
            if best == 0:
                continue
            if best / scale > RULE_MIN_RUN:  # 表格横线，跳过
                continue
            rows.append((y, first, last))
        if not rows:
            continue
        ys = [row[0] for row in rows]
        xs0 = [row[1] for row in rows]
        xs1 = [row[2] for row in rows]
        result[field] = (
            min(ys) / scale,
            min(xs0) / scale,
            (max(xs1) - min(xs0)) / scale,
            (max(ys) - min(ys)) / scale,
        )
    return result


def overlay_html(job: dict, boxes_geometry: dict[str, tuple[float, float, float, float]]) -> str:
    geometry = job["geometry"]
    boxes = []
    texts = []
    for field, value in job["fields"].items():
        measured = boxes_geometry.get(field)
        if measured is None:
            measured = geometry[field]
        top, left, width, height = measured
        boxes.append(
            f'<span class="cover" style="left:{left - COVER_PAD_X:.2f}pt;top:{top - COVER_PAD_Y:.2f}pt;'
            f'width:{width + 2 * COVER_PAD_X:.2f}pt;height:{height + 2 * COVER_PAD_Y:.2f}pt"></span>'
        )
        if not value:
            continue
        line_height = VALUE_SIZE * 1.2
        y = top + (height - line_height) / 2
        texts.append(
            f'<span class="value" style="left:{left:.2f}pt;top:{y:.2f}pt">{html.escape(value)}</span>'
        )

    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<style>
  @page {{ size: {PAGE_W}pt {PAGE_H}pt; margin: 0; }}
  html, body {{ margin: 0; padding: 0; width: {PAGE_W}pt; height: {PAGE_H}pt; }}
  .cover {{ position: absolute; background: #ffffff; }}
  .value {{
    position: absolute; white-space: nowrap; color: {TEXT_COLOR};
    font-family: Arial, 'Liberation Sans', Helvetica, sans-serif;
    font-size: {VALUE_SIZE:.3f}pt; line-height: {VALUE_SIZE * 1.2:.3f}pt;
  }}
</style>
</head>
<body>
{chr(10).join(boxes)}
{chr(10).join(texts)}
</body>
</html>
"""


def run(command: list[str]) -> None:
    subprocess.run(command, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def build(job: dict) -> Path:
    BUILD.mkdir(parents=True, exist_ok=True)
    base_path = INSERTS / job["base"]
    if not base_path.exists():
        raise SystemExit(f"缺少底版：{base_path}")

    # 先在底版渲染图上量出要替换字段的真实墨迹，避免覆盖框压到表格横线
    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(
            ["pdftoppm", "-r", str(MEASURE_DPI), "-png", "-f", "1", "-l", "1", str(base_path), str(Path(tmp) / "base")],
            check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        )
        base_png = next(Path(tmp).glob("base*.png"))
        measured = ink_boxes(base_png, job["geometry"], list(job["fields"]))

    overlay_html_path = BUILD / f"{job['id']}-overlay.html"
    overlay_pdf = BUILD / f"{job['id']}-overlay.pdf"
    overlay_html_path.write_text(overlay_html(job, measured), encoding="utf-8")
    run([
        "google-chrome", "--headless=new", "--no-sandbox", "--disable-gpu",
        "--no-pdf-header-footer", "--virtual-time-budget=10000",
        f"--print-to-pdf={overlay_pdf}", f"file://{overlay_html_path}",
    ])

    base = PdfReader(str(base_path))
    overlay = PdfReader(str(overlay_pdf))
    writer = PdfWriter()
    first = base.pages[0]
    first.merge_page(overlay.pages[0], over=True)
    writer.add_page(first)
    for page in base.pages[1:]:
        writer.add_page(page)

    output = INSERTS / f"{job['id']}-insert.pdf"
    with output.open("wb") as handle:
        writer.write(handle)
    return output


def main() -> int:
    wanted = sys.argv[1:] or [job["id"] for job in JOBS]
    for job in JOBS:
        if job["id"] not in wanted:
            continue
        output = build(job)
        info = subprocess.run(["pdfinfo", str(output)], capture_output=True, text=True).stdout
        pages = next((line.split(":")[1].strip() for line in info.splitlines() if line.startswith("Pages")), "?")
        size = next((line.split(":", 1)[1].strip() for line in info.splitlines() if line.startswith("Page size")), "?")
        print(f"✓ {job['id']:6} {output.name}  {pages} 页  {size}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
