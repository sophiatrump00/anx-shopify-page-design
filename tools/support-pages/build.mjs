#!/usr/bin/env node
// 由 tools/support-pages/content.mjs 生成：
//   1. templates/page.support-<id>.json —— 每个产品的支持页模板
//   2. templates/page.manuals-certifications.json —— 产品资源目录
//
// 用法：node tools/support-pages/build.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { DIRECTORY_SETTINGS, PRODUCTS } from './content.mjs';
import { repoRoot } from '../manual-build/lib/render.mjs';

const HEADER = `/*
 * ------------------------------------------------------------
 * IMPORTANT: The contents of this file are auto-generated.
 *
 * This file may be updated by the Shopify admin theme editor
 * or related systems. Please exercise caution as any changes
 * made to this file may be overwritten.
 * ------------------------------------------------------------
 */
`;

const templatesDir = resolve(repoRoot, 'templates');

function writeTemplate(filename, data) {
  writeFileSync(resolve(templatesDir, filename), `${HEADER}${JSON.stringify(data, null, 2)}\n`, 'utf8');
  console.log(`✓ templates/${filename}`);
}

function directoryLabels(product) {
  if (product.category === 'home-energy-storage') {
    return {
      online_label: 'Product information',
      pdf_label: 'Documents in preparation',
      certifications_label: 'Compliance status',
    };
  }
  if (!product.manualAsset) {
    return {
      online_label: 'Online guide',
      pdf_label: 'Documents on product page',
      certifications_label: 'Compliance',
    };
  }
  return {
    online_label: 'Online HTML manual',
    pdf_label: 'EN · FR · DE PDF',
    certifications_label: 'Certifications',
  };
}

// ---------------------------------------------------------------------------
// 1. 支持页模板
// ---------------------------------------------------------------------------

for (const product of PRODUCTS) {
  if (product.exists) continue;

  const blocks = {};
  const order = [];

  product.facts.forEach((fact, index) => {
    const id = `fact_${index + 1}`;
    blocks[id] = { type: 'quick_fact', settings: { label: fact.label, value: fact.value } };
    order.push(id);
  });

  product.sections.forEach((section, index) => {
    const id = `manual_${index + 1}`;
    blocks[id] = {
      type: 'manual_section',
      settings: {
        title: section.title,
        body: section.body,
        asset_name: '',
        image_alt: '',
        image_caption: '',
      },
    };
    order.push(id);
  });

  product.complianceItems.forEach((item, index) => {
    const id = `compliance_${index + 1}`;
    blocks[id] = {
      type: 'compliance_item',
      settings: {
        standard: item.standard,
        title: item.title,
        description: item.description,
        status: item.status,
      },
    };
    order.push(id);
  });

  const hasPdf = Boolean(product.manualAsset);
  const complianceHeading =
    product.category === 'home-energy-storage' ? 'Documents & Compliance' : 'Safety & Compliance';

  writeTemplate(`page.${product.handle}.json`, {
    sections: {
      main: {
        type: 'suntneew-product-support',
        blocks,
        block_order: order,
        settings: {
          support_label: 'Support',
          resources_label: 'Product Resources',
          eyebrow: 'PRODUCT SUPPORT',
          model: product.model,
          heading: product.heading,
          intro: product.intro,
          resource_nav_label: product.resourceNavLabel,
          online_card_eyebrow: 'MOBILE & MULTILINGUAL',
          online_card_label: 'Read the online manual',
          online_card_description:
            'Responsive instructions that follow the language selected on the store.',
          online_card_action: 'Start reading',
          manual_asset_name: product.manualAsset,
          pdf_card_eyebrow: product.pdfCardEyebrow,
          pdf_label: hasPdf ? 'Download manual — EN · FR · DE' : '',
          pdf_card_description: product.pdfCardDescription,
          pdf_card_action: 'Download PDF',
          certifications_card_eyebrow: 'MODEL-MATCHED INFORMATION',
          certifications_label:
            product.category === 'home-energy-storage' ? 'View documents' : 'View certifications',
          certifications_card_description: product.certificationsCardDescription,
          certifications_card_action: 'View information',
          product_label: product.productLabel,
          product_url: product.productUrl,
          manual_eyebrow: 'ONLINE USER MANUAL',
          manual_heading: product.manualHeading,
          manual_intro: product.manualIntro,
          manual_version: product.manualVersion,
          compliance_eyebrow: 'MODEL-MATCHED INFORMATION',
          compliance_heading: complianceHeading,
          compliance_intro: product.complianceIntro,
          compliance_note:
            'Match every document to the model printed on the product label. Safety testing, transport records and safety data serve different purposes.',
          compliance_contact_label: 'Contact product support',
        },
      },
    },
    order: ['main'],
  });
}

// ---------------------------------------------------------------------------
// 2. 产品资源目录
// ---------------------------------------------------------------------------

// KB700 支持页已存在：只把 PDF 与多语言文案切到三语版本，保留原有内容块。
const kb700Path = resolve(templatesDir, 'page.support-kb700.json');
const kb700Raw = readFileSync(kb700Path, 'utf8').replace(/^\/\*[\s\S]*?\*\/\s*/, '');
const kb700 = JSON.parse(kb700Raw);
Object.assign(kb700.sections.main.settings, {
  manual_asset_name: 'suntneew-kb700-user-manual-en-fr-de.pdf',
  pdf_card_eyebrow: 'ENGLISH · FRANÇAIS · DEUTSCH',
  pdf_label: 'Download manual — EN · FR · DE',
  pdf_card_description:
    'One file with the original English booklet plus the French and German sections for offline use.',
  manual_version:
    'Online edition based on the English manual dated May 7, 2026. The download also contains the French and German sections.',
});
writeTemplate('page.support-kb700.json', kb700.sections ? { sections: kb700.sections, order: kb700.order } : kb700);

// ---------------------------------------------------------------------------
// 3. 产品资源目录
// ---------------------------------------------------------------------------

const directoryBlocks = {};
const directoryOrder = [];

for (const product of PRODUCTS) {
  const labels = directoryLabels(product);
  directoryBlocks[product.id] = {
    type: 'product_resource',
    settings: {
      category: product.category,
      family: product.family,
      model: product.model,
      title: product.cardTitle,
      description: product.cardDescription,
      asset_name: product.cardImage,
      image_alt: product.cardImageAlt,
      page_handle: product.handle,
      online_label: labels.online_label,
      pdf_label: labels.pdf_label,
      certifications_label: labels.certifications_label,
      cta_label: `Open ${product.model} support`,
    },
  };
  directoryOrder.push(product.id);
}

writeTemplate('page.manuals-certifications.json', {
  sections: {
    main: {
      type: 'suntneew-resource-directory',
      blocks: directoryBlocks,
      block_order: directoryOrder,
      settings: DIRECTORY_SETTINGS,
    },
  },
  order: ['main'],
});

console.log(`\n共生成 ${PRODUCTS.length} 个目录卡片，${PRODUCTS.filter((p) => !p.exists).length} 个支持页模板。`);
