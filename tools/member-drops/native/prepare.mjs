#!/usr/bin/env node
// Read-only Shopify access. Generates deployment inputs; does not start a sale.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import { createRequire } from 'node:module';
import { shopifyClient } from './shopify.mjs';
const core = createRequire(import.meta.url)('../../../assets/suntneew-member-drops-core.js');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const { values } = parseArgs({ options: { store: { type: 'string' }, cli: { type: 'string', default: 'shopify' }, 'launch-at': { type: 'string' }, output: { type: 'string', default: 'output/member-drops/native-plan.json' } } });
if (!/^[a-z0-9-]+\.myshopify\.com$/.test(values.store || '')) throw new Error('--store is required');
const template = JSON.parse(fs.readFileSync(path.join(root, 'templates/page.member-drops.json'), 'utf8'));
const section = Object.values(template.sections).find(s => s.type === 'suntneew-member-drops');
if (section.settings.claim_mode !== 'native-codes') throw new Error('Select the native-codes claim mode.');
const handles = [...new Set(Object.values(section.blocks).map(b => b.settings.product).filter(Boolean))];
if (handles.some(h => !/^[a-z0-9-]+$/.test(h))) throw new Error('Invalid product handle');
const query = `query($search:String!){shop{currencyCode} products(first:100,query:$search){nodes{id title handle status onlineStoreUrl variants(first:250){pageInfo{hasNextPage} nodes{id title price}}}}}`;
const variables = { search: handles.map(h => `handle:${h}`).join(' OR ') };
let data;
if (process.env.SHOPIFY_ADMIN_ACCESS_TOKEN) data = await shopifyClient({ shop: values.store, token: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN })(query, variables);
else {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'native-plan-'));
  try {
    fs.writeFileSync(path.join(dir, 'q'), query); fs.writeFileSync(path.join(dir, 'v'), JSON.stringify(variables));
    const args = ['store', 'execute', '--store', values.store, '--version', '2026-07', '--query-file', path.join(dir, 'q'), '--variable-file', path.join(dir, 'v'), '--output-file', path.join(dir, 'r'), '--json'];
    execFileSync(/\.js$/.test(values.cli) ? process.execPath : values.cli, /\.js$/.test(values.cli) ? [values.cli, ...args] : args, { stdio: 'pipe', timeout: 120000 });
    const response = JSON.parse(fs.readFileSync(path.join(dir, 'r'), 'utf8')); if (response.errors) throw new Error('Shopify query failed'); data = response.data || response;
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}
if (data.shop.currencyCode !== 'USD') throw new Error('Only USD is supported.');
if (values['launch-at']) {
  const start = core.timestamp(values['launch-at']), days = section.settings.duration_days;
  if (!Number.isFinite(start) || start <= Date.now() || !Number.isInteger(days) || days < 1 || days > 30) throw new Error('--launch-at must be a future ISO timestamp with timezone; duration must be 1–30 days.');
  Object.assign(section.settings, { enabled: true, starts_at: new Date(start).toISOString(), ends_at: new Date(start + days * 86400000).toISOString() });
}
const campaigns = [];
for (const [key, prefix, blockType] of [['current', '', 'current_product'], ['next', 'next_', 'next_product']]) {
  const c = { key, enabled: section.settings[`${prefix}enabled`] === true, startsAt: section.settings[`${prefix}starts_at`] || '', endsAt: section.settings[`${prefix}ends_at`] || '', rules: [], products: [] };
  for (const id of section.block_order) {
    const b = section.blocks[id]; if (b.type !== blockType || !b.settings.product) continue;
    const p = data.products.nodes.find(p => p.handle === b.settings.product); if (!p) throw new Error('Missing product: ' + b.settings.product);
    if (c.enabled && (p.status !== 'ACTIVE' || !p.onlineStoreUrl)) throw new Error(`${p.handle} must be active and published to the Online Store before scheduling.`);
    const selected = b.settings.variant_id;
    if (!selected && p.variants.pageInfo.hasNextPage) throw new Error('Select a variant for products with more than 250 variants.');
    const variants = p.variants.nodes.filter(v => !selected || v.id.split('/').at(-1) === selected).map(v => ({ id: v.id.split('/').at(-1), title: v.title, price: Math.round(Number(v.price) * 100) }));
    if (!variants.length) throw new Error('Missing variant');
    const type = b.settings.offer_type, value = Number(b.settings.offer_value);
    c.products.push({ id: p.id, title: p.title, variants, rule: type, value });
    for (const v of variants) { const price = core.price(v.price, type, b.settings.offer_value); if (!price) throw new Error('Invalid offer'); c.rules.push({ variantId: v.id, type, value, base: price.base, final: price.final }); }
  }
  campaigns.push(c);
}
const errors = core.validateCampaigns(campaigns); if (errors.length) throw new Error(errors.join('\n'));
const plan = { version: 1, engine: 'native-codes', currency: 'USD', campaigns: campaigns.map(({ products, ...c }) => c) };
const out = path.resolve(root, values.output); fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(plan, null, 2) + '\n');
fs.writeFileSync(out.replace(/\.json$/, '.template.json'), JSON.stringify(template, null, 2) + '\n');
console.log(`Prepared ${out}; ${campaigns.filter(c => c.enabled).length} enabled campaigns. No Shopify changes or activation performed.`);
