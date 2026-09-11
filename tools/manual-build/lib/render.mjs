// 三语手册 PDF 生成：HTML -> Chrome PDF -> 合并
//
// 目的：把供应商的英文 PDF 手册（去掉中文页）和本工具生成的
// 法语、德语排版页合并成一份可以一键打开/下载的 PDF。
//
// 依赖：google-chrome（--headless=new --print-to-pdf）、pdfunite、pdfinfo、gs。

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
export const assetsDir = resolve(repoRoot, 'assets');

const buildDir = resolve(repoRoot, 'tools', 'manual-build', '.build');

export function ensureBuildDir() {
  mkdirSync(buildDir, { recursive: true });
  return buildDir;
}

function run(command, args) {
  return execFileSync(command, args, { stdio: ['ignore', 'pipe', 'pipe'] }).toString();
}

export function pageCount(pdfPath) {
  const info = run('pdfinfo', [pdfPath]);
  const match = info.match(/^Pages:\s+(\d+)/m);
  if (!match) throw new Error(`无法读取页数：${pdfPath}`);
  return Number(match[1]);
}

// 用 Ghostscript 抽取英文原件的指定页（例如去掉最后一页中文印制说明）。
export function extractPages(sourcePdf, outputPdf, { first, last, drop = [] }) {
  const total = pageCount(sourcePdf);
  const kept = [];
  for (let page = first ?? 1; page <= (last ?? total); page += 1) {
    if (!drop.includes(page)) kept.push(page);
  }
  const chunks = [];
  kept.forEach((page, index) => {
    const chunk = resolve(buildDir, `${index}-${page}.pdf`);
    run('gs', [
      '-q', '-dNOPAUSE', '-dBATCH', '-sDEVICE=pdfwrite',
      '-dFirstPage=' + page, '-dLastPage=' + page,
      '-sOutputFile=' + chunk, sourcePdf,
    ]);
    chunks.push(chunk);
  });
  run('pdfunite', [...chunks, outputPdf]);
  chunks.forEach((chunk) => rmSync(chunk, { force: true }));
  return { kept, pageCount: kept.length };
}

export function htmlToPdf(html, outputPdf, name) {
  const htmlPath = resolve(buildDir, `${name}.html`);
  writeFileSync(htmlPath, html, 'utf8');
  run('google-chrome', [
    '--headless=new', '--no-sandbox', '--disable-gpu', '--no-pdf-header-footer',
    '--virtual-time-budget=15000',
    `--print-to-pdf=${outputPdf}`, `file://${htmlPath}`,
  ]);
  if (!existsSync(outputPdf)) throw new Error(`Chrome 未生成 ${outputPdf}`);
  return { htmlPath, pages: pageCount(outputPdf) };
}

export function mergePdfs(inputs, outputPdf) {
  run('pdfunite', [...inputs, outputPdf]);
  return pageCount(outputPdf);
}

// 把整张折页（多个面板排在一页上）按面板拆成多页。
// left / width / height 单位为 pt；inset 让每条折线上的分隔线完整落在页面内。
export function splitPanels(sourcePdf, outputPdf, { count, left, width, height, inset = 0 }) {
  const parts = [];
  for (let index = 0; index < count; index += 1) {
    const offset = left + width * index - inset;
    const mediaWidth = width + inset * 2;
    const part = resolve(buildDir, `panel-${index}.pdf`);
    run('gs', [
      '-q', '-dNOPAUSE', '-dBATCH', '-sDEVICE=pdfwrite', '-dFIXEDMEDIA',
      `-dDEVICEWIDTHPOINTS=${mediaWidth}`, `-dDEVICEHEIGHTPOINTS=${height}`,
      `-sOutputFile=${part}`,
      '-c', `<</PageOffset [${-offset} 0]>> setpagedevice`,
      '-f', sourcePdf,
    ]);
    parts.push(part);
  }
  run('pdfunite', [...parts, outputPdf]);
  parts.forEach((part) => rmSync(part, { force: true }));
  return { pageCount: count };
}

// ---------------------------------------------------------------------------
// 排版
// ---------------------------------------------------------------------------

const CSS = `
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: 'Carlito', 'Liberation Sans', 'DejaVu Sans', Arial, sans-serif;
    color: #172331;
    font-size: 10.5pt;
    line-height: 1.5;
  }
  .page {
    width: 210mm;
    min-height: 297mm;
    padding: 18mm 17mm 16mm;
    page-break-after: always;
    position: relative;
  }
  .page:last-child { page-break-after: auto; }
  h1, h2, h3, h4 { color: #172331; line-height: 1.2; margin: 0 0 .5em; }
  h1 { font-size: 21pt; }
  h2 {
    font-size: 15pt;
    margin: 0 0 .55em;
    padding-bottom: .35em;
    border-bottom: 1.5pt solid #e9653b;
  }
  h3 { font-size: 11.5pt; margin: 1.1em 0 .35em; }
  h4 { font-size: 10.5pt; margin: .9em 0 .3em; }
  p { margin: 0 0 .65em; }
  ul, ol { margin: 0 0 .7em; padding-left: 1.15em; }
  li { margin-bottom: .28em; }
  strong { color: #0f1a26; }
  a { color: #172331; }
  .eyebrow {
    color: #e9653b;
    font-size: 8.5pt;
    font-weight: 700;
    letter-spacing: .14em;
    text-transform: uppercase;
    margin: 0 0 6px;
  }
  .lede { font-size: 11.5pt; color: #43536a; }
  .section { margin-bottom: 1.4em; break-inside: avoid; }
  .section--flow { break-inside: auto; }
  table { width: 100%; border-collapse: collapse; margin: 0 0 .8em; font-size: 9.5pt; }
  th, td { border: .6pt solid #c9d2dc; padding: 4.5px 6px; text-align: left; vertical-align: top; }
  th { background: #eef2f6; font-weight: 700; }
  td.num { white-space: nowrap; }
  .callout {
    border-left: 3pt solid #e9653b;
    background: #f7f4f1;
    padding: 8px 11px;
    margin: 0 0 .8em;
    break-inside: avoid;
  }
  .callout strong { color: #b8471f; }
  .cover {
    display: flex; flex-direction: column; justify-content: space-between;
    height: 258mm; padding: 0 3mm; overflow: hidden;
  }
  .cover__brand { font-size: 15pt; font-weight: 700; letter-spacing: .04em; }
  .cover__brand span { color: #e9653b; }
  .cover__model { font-size: 26pt; margin: 0 0 .2em; }
  .cover__title { font-size: 13pt; color: #43536a; margin: 0 0 1.4em; }
  .cover__languages { list-style: none; padding: 0; margin: 0; }
  .cover__languages li {
    display: flex; justify-content: space-between; gap: 12px;
    border-bottom: .6pt solid #d7dee6; padding: 7px 0; font-size: 11pt;
  }
  .cover__languages b { font-weight: 700; }
  .cover__note { font-size: 9pt; color: #5b6b7d; }
  .cover__meta { font-size: 9.5pt; color: #5b6b7d; border-top: .6pt solid #d7dee6; padding-top: 10px; }
  .page-footer {
    position: absolute; left: 17mm; right: 17mm; bottom: 9mm;
    border-top: .6pt solid #d7dee6; padding-top: 4px;
    font-size: 8pt; color: #7a8899; display: flex; justify-content: space-between;
  }
  .doc-list { list-style: none; padding: 0; }
  .doc-list li { border-bottom: .6pt solid #e4e9ee; padding: 5px 0; }
  .two-col { column-count: 2; column-gap: 9mm; }
`;

export function renderDocument({ lang, html, title, model, footerLabel }) {
  const pages = String(html)
    .split('<!--PAGE-->')
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map(
      (chunk, index, all) => `
      <section class="page">
        ${chunk}
        <div class="page-footer">
          <span>SuntNeew &middot; ${model}</span>
          <span>${footerLabel} &middot; ${index + 1}/${all.length}</span>
        </div>
      </section>`,
    )
    .join('\n');

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>${CSS}</style>
</head>
<body>
${pages}
</body>
</html>`;
}

export function coverPage({ model, productTitle, languages, note, meta }) {
  const rows = languages
    .map((entry) => `<li><b>${entry.label}</b><span>${entry.pages}</span></li>`)
    .join('');
  return `
  <div class="cover">
    <div>
      <p class="cover__brand">SuntNeew<span>.</span></p>
      <p class="eyebrow">${meta.eyebrow}</p>
      <h1 class="cover__model">${model}</h1>
      <p class="cover__title">${productTitle}</p>
      <ul class="cover__languages">${rows}</ul>
      <p class="cover__note">${note}</p>
    </div>
    <p class="cover__meta">${meta.footer}</p>
  </div>`;
}

export function readContent(path) {
  return readFileSync(path, 'utf8');
}
