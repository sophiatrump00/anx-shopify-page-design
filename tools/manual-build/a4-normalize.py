#!/usr/bin/env python3
"""把 PDF 的每一页等比缩放并居中到 A4。

供应商原件是不同开本的（小开本手册、80x120mm 插页），生成的封面/法德文页是 A4；
混在一份文件里会让阅读器不断跳尺寸，也不方便打印。

用法：python3 tools/manual-build/a4-normalize.py 输入.pdf 输出.pdf
"""

from __future__ import annotations

import sys
from pathlib import Path

from pypdf import PageObject, PdfReader, PdfWriter, Transformation
from pypdf.generic import RectangleObject

A4_WIDTH = 595.28
A4_HEIGHT = 841.89


def normalize(source: Path, target: Path) -> int:
    reader = PdfReader(str(source))
    writer = PdfWriter()
    a4_box = RectangleObject([0, 0, A4_WIDTH, A4_HEIGHT])
    for page in reader.pages:
        width = float(page.mediabox.width)
        height = float(page.mediabox.height)
        scale = min(A4_WIDTH / width, A4_HEIGHT / height)
        page.add_transformation(
            Transformation()
            .scale(scale)
            .translate((A4_WIDTH - width * scale) / 2, (A4_HEIGHT - height * scale) / 2)
        )
        # pypdf 合并时会按来源页的裁剪框加一层裁剪，必须一起放大到 A4，
        # 否则缩放后的内容会被原来的小页面边界切掉。
        page.mediabox = a4_box
        page.cropbox = a4_box
        blank = PageObject.create_blank_page(width=A4_WIDTH, height=A4_HEIGHT)
        blank.merge_page(page)
        writer.add_page(blank)
    # 合并后的内容流默认不压缩，统一压一遍（必须在页面写入 writer 之后）
    for page in writer.pages:
        page.compress_content_streams()
    with target.open("wb") as handle:
        writer.write(handle)
    return len(reader.pages)


def main() -> int:
    if len(sys.argv) != 3:
        print(__doc__)
        return 2
    pages = normalize(Path(sys.argv[1]), Path(sys.argv[2]))
    return 0 if pages else 1


if __name__ == "__main__":
    raise SystemExit(main())
