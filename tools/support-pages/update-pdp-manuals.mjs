#!/usr/bin/env node
// 把产品页「Documents」区块里的说明书下载切到三语版本（EN + FR + DE 单文件）。
// 只在文本层面做定点替换，保留模板原有格式。
//
// 用法：node tools/support-pages/update-pdp-manuals.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { repoRoot } from '../manual-build/lib/render.mjs';

const JOBS = [
  {
    file: 'templates/product.kb700.json',
    oldAsset: 'suntneew-kb700-user-manual-en.pdf',
    newAsset: 'suntneew-kb700-user-manual-en-fr-de.pdf',
    oldLabel: 'KB700 user manual (English PDF)',
    newLabel: 'KB700 user manual — EN · FR · DE (PDF)',
  },
  {
    file: 'templates/product.u23.json',
    oldAsset: 'suntneew-u23-user-manual-en.pdf',
    newAsset: 'suntneew-u23-user-manual-en-fr-de.pdf',
    oldLabel: 'U23 user manual (English PDF)',
    newLabel: 'U23 user manual — EN · FR · DE (PDF)',
  },
  {
    file: 'templates/product.u32.json',
    oldAsset: 'suntneew-u32-user-manual-en.pdf',
    newAsset: 'suntneew-u32-user-manual-en-fr-de.pdf',
    oldLabel: 'U32 user manual (English PDF)',
    newLabel: 'U32 user manual — EN · FR · DE (PDF)',
  },
  {
    file: 'templates/product.oj02.json',
    oldAsset: 'suntneew-oj02-user-manual-en.pdf',
    newAsset: 'suntneew-oj02-user-manual-en-fr-de.pdf',
    oldLabel: 'OJ02 user manual (English PDF)',
    newLabel: 'OJ02 user manual — EN · FR · DE (PDF)',
  },
  {
    file: 'templates/product.rv-g31.json',
    oldAsset: 'suntneew-rv-g31-manual-en.pdf',
    newAsset: 'suntneew-rv-g31-manual-en-fr-de.pdf',
    oldLabel: 'Group 31 product manual — English PDF',
    newLabel: 'Group 31 product manual — EN · FR · DE (PDF)',
  },
  {
    file: 'templates/product.rv-g24.json',
    oldAsset: 'suntneew-rv-g24-manual-en.pdf',
    newAsset: 'suntneew-rv-g24-manual-en-fr-de.pdf',
    oldLabel: 'Group 24 product manual — English PDF',
    newLabel: 'Group 24 product manual — EN · FR · DE (PDF)',
  },
  {
    file: 'templates/product.rv-230ah.json',
    oldAsset: 'suntneew-rv-230ah-manual-en.pdf',
    newAsset: 'suntneew-rv-230ah-manual-en-fr-de.pdf',
    oldLabel: '230Ah user manual (EN PDF)',
    newLabel: '230Ah user manual — EN · FR · DE (PDF)',
  },
  {
    file: 'templates/product.rv-314ah.json',
    oldAsset: 'suntneew-rv-314ah-manual-en.pdf',
    newAsset: 'suntneew-rv-314ah-manual-en-fr-de.pdf',
    oldLabel: '314Ah user manual (EN PDF)',
    newLabel: '314Ah user manual — EN · FR · DE (PDF)',
  },
];

let changed = 0;

for (const job of JOBS) {
  const path = resolve(repoRoot, job.file);
  const before = readFileSync(path, 'utf8');
  let after = before.split(job.oldAsset).join(job.newAsset);
  if (job.oldLabel) after = after.split(job.oldLabel).join(job.newLabel);

  if (after === before) {
    console.log(`- ${job.file} 无需改动`);
    continue;
  }
  writeFileSync(path, after, 'utf8');
  changed += 1;
  console.log(`✓ ${job.file} → ${job.newAsset}`);
}

console.log(`\n共更新 ${changed} 个产品页模板。`);
