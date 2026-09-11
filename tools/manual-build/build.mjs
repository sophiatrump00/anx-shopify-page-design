#!/usr/bin/env node
// 生成三语手册：英文原件（去掉中文页）+ 法语排版页 + 德语排版页 → 一份 PDF。
//
// 用法：
//   node tools/manual-build/build.mjs                 # 生成全部
//   node tools/manual-build/build.mjs --only rv-g31   # 只生成一个型号

import { copyFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  assetsDir,
  coverPage,
  ensureBuildDir,
  extractPages,
  htmlToPdf,
  mergePdfs,
  pageCount,
  repoRoot,
  renderDocument,
} from './lib/render.mjs';
import { models as rvModels, sections as rvSections } from './content/rv-battery.mjs';
import { jumpStarters } from './content/jump-starters.mjs';

const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null;

const jobs = [
  ...Object.entries(rvModels).map(([id, spec]) => ({
    id,
    spec,
    sections: (lang) => rvSections(lang, spec),
    // 房车电池英文原件 22 页，末尾两页为图案页，无中文
    dropPages: [],
    keepPages: { first: 1, last: 22 },
  })),
  ...jumpStarters.map((spec) => ({
    id: spec.id,
    spec,
    sections: spec.sections,
    dropPages: spec.dropPages ?? [],
    keepPages: spec.keepPages,
  })),
];

const buildDir = ensureBuildDir();
const results = [];

for (const job of jobs) {
  if (only && job.id !== only) continue;

  // 英文原件默认取自主题 assets/；仓库内的构建输入用 tools/ 开头的相对路径。
  const sourcePath = job.spec.source.startsWith('tools/')
    ? resolve(repoRoot, job.spec.source)
    : resolve(assetsDir, job.spec.source);
  if (!existsSync(sourcePath)) {
    console.error(`跳过 ${job.id}：找不到英文原件 ${sourcePath}`);
    continue;
  }

  const englishPdf = resolve(buildDir, `${job.id}-en.pdf`);
  extractPages(sourcePath, englishPdf, job.keepPages);
  const englishPages = pageCount(englishPdf);

  const languagePdfs = [];
  const languagePages = [];
  let cursor = 1 + englishPages;

  for (const lang of ['fr', 'de']) {
    const html = renderDocument({
      lang,
      html: job
        .sections(lang)
        .map((section) => `<section class="section">${`<h2>${section.title}</h2>${section.html}`}</section>`)
        .join('\n'),
      title: `${job.spec.model} — ${lang.toUpperCase()}`,
      model: job.spec.model,
      footerLabel: lang === 'fr' ? 'Français' : 'Deutsch',
    });
    const pdfPath = resolve(buildDir, `${job.id}-${lang}.pdf`);
    const { pages } = htmlToPdf(html, pdfPath, `${job.id}-${lang}`);
    languagePdfs.push(pdfPath);
    languagePages.push(pages);
    cursor += pages;
  }

  const frRange = `p. ${1 + englishPages + 1}–${1 + englishPages + languagePages[0]}`;
  const deRange = `p. ${cursor - languagePages[1] + 1}–${cursor}`;

  const coverHtml = renderDocument({
    lang: 'en',
    html: coverPage({
      model: job.spec.model,
      productTitle: job.spec.title,
      languages: [
        { label: 'English', pages: `p. 2–${1 + englishPages}` },
        { label: 'Français', pages: frRange },
        { label: 'Deutsch', pages: deRange },
      ],
      note: job.spec.coverNote,
      meta: {
        eyebrow: job.spec.coverEyebrow ?? 'User manual',
        footer: job.spec.coverFooter,
      },
    }),
    title: `${job.spec.model} manual`,
    model: job.spec.model,
    footerLabel: 'Languages',
  });
  const coverPdf = resolve(buildDir, `${job.id}-cover.pdf`);
  htmlToPdf(coverHtml, coverPdf, `${job.id}-cover`);

  const outputPath = resolve(assetsDir, job.spec.asset);
  const total = mergePdfs([coverPdf, englishPdf, ...languagePdfs], outputPath);

  // 旧版英文单语文件名在 CDN 上还有缓存。用同一份三语文件覆盖这些路径，
  // 这样历史链接（搜索结果、旧书签）拿到的也是没有中文页的最新手册。
  for (const alias of job.spec.legacyAliases ?? []) {
    copyFileSync(outputPath, resolve(assetsDir, alias));
  }

  results.push({ id: job.id, asset: job.spec.asset, pages: total, englishPages, french: languagePages[0], german: languagePages[1] });
  console.log(
    `✓ ${job.id.padEnd(10)} ${job.spec.asset}  共 ${total} 页（EN ${englishPages} / FR ${languagePages[0]} / DE ${languagePages[1]}）`,
  );
}

if (!results.length) {
  console.error('没有生成任何文件。');
  process.exit(1);
}

// 保持 .build 目录干净，只留最终产物
if (!process.argv.includes('--keep-temp')) {
  rmSync(resolve(buildDir), { recursive: true, force: true });
}

console.log('\n生成完成：');
results.forEach((r) => console.log(`- assets/${r.asset}（${r.pages} 页）`));
