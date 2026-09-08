import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const core = require('../../assets/suntneew-member-drops-core.js');

export function localDate(iso, timezone) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(iso));
  const get = type => parts.find(p => p.type === type)?.value;
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}`;
}

export function compilePlan(section, products, shop) {
  if (shop.currencyCode !== 'USD') throw new Error('This version supports USD only. Currency conversion must be implemented and verified before another currency is enabled.');
  const settings = section.settings || {}, campaigns = [];
  for (const [key, prefix, type] of [['current', '', 'current_product'], ['next', 'next_', 'next_product']]) {
    const enabled = settings[`${prefix}enabled`] === true;
    const campaign = { key, enabled, startsAt: settings[`${prefix}starts_at`] || '', endsAt: settings[`${prefix}ends_at`] || '', products: [] };
    for (const id of section.block_order || []) {
      const block = section.blocks[id];
      if (block?.type !== type || !enabled) continue;
      const value = block.settings || {};
      const product = products.find(p => p.handle === value.product);
      if (!product || product.status !== 'ACTIVE' || !product.onlineStoreUrl) throw new Error(`${key}: ${value.product || id} is missing or not available on the Online Store.`);
      const variantId = String(value.variant_id || '').trim();
      const variants = product.variants.nodes.filter(v => !variantId || v.id.split('/').at(-1) === variantId).map(v => ({ id: v.id.split('/').at(-1), title: v.title, price: Math.round(Number(v.price) * 100) }));
      if (product.variants.pageInfo?.hasNextPage && !variantId) throw new Error(`${product.handle}: over 250 variants; select a specific variant.`);
      campaign.products.push({ id, title: product.title, rule: value.offer_type || 'percentage', value: value.offer_value ?? '20', variants });
    }
    campaigns.push(campaign);
  }
  const issues = core.validateCampaigns(campaigns);
  if (issues.length) throw new Error(issues.join('\n'));
  const binding = { version: 1, engine: 'shopify-function', currency: 'USD', campaigns: campaigns.map(c => ({ key: c.key, enabled: c.enabled, startsAt: c.startsAt, endsAt: c.endsAt, rules: c.products.flatMap(p => p.variants.map(v => ({ variantId: v.id, type: p.rule, value: Number(p.value), base: v.price, final: core.price(v.price, p.rule, p.value).final }))) })) };
  const configuration = { ...binding };
  if (configuration.campaigns.some(c => c.rules.length > 100)) throw new Error('Select at most 100 variants per campaign. Use the variant ID field for large products.');
  for (const c of campaigns) {
    configuration[`${c.key}StartsLocal`] = c.enabled ? localDate(c.startsAt, shop.ianaTimezone) : '2099-01-01T00:00:00';
    configuration[`${c.key}EndsLocal`] = c.enabled ? localDate(c.endsAt, shop.ianaTimezone) : '2099-01-01T00:00:00';
    // Without a server UTC clock, dateTimeAfter uses the store timezone. Reject DST
    // offset changes and ambiguous DST zones until a provider handles them explicitly.
    if (c.enabled && shop.ianaTimezone !== 'Asia/Shanghai' && shop.ianaTimezone !== 'Etc/UTC' && shop.ianaTimezone !== 'UTC') throw new Error('This integration is verified for Asia/Shanghai and UTC schedules only. Review timezone handling before changing the shop timezone.');
  }
  return { title: 'SuntNeew Member Drops', shopTimezone: shop.ianaTimezone, combinesWith: { productDiscounts: false, orderDiscounts: false, shippingDiscounts: false }, binding, configuration };
}

export function assertBackend(node, plan) {
  if (!node || node.title !== plan.title) throw new Error('The server did not return the expected member discount.');
  if (node.combinesWith?.productDiscounts !== false || node.combinesWith?.orderDiscounts !== false || node.combinesWith?.shippingDiscounts !== false) throw new Error('Discount combinations must all be disabled.');
  if (node.status !== 'ACTIVE') throw new Error('The member discount engine must be active before binding the page. Campaign windows are independently enforced by the Function.');
}
