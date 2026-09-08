import test from 'node:test';
import assert from 'node:assert/strict';
import { compilePlan, assertBackend, localDate } from './plan.mjs';
const shop = { currencyCode: 'USD', ianaTimezone: 'Asia/Shanghai' };
const section = { settings: { enabled: true, starts_at: '2026-10-01T10:00:00+08:00', ends_at: '2026-10-02T10:00:00+08:00' }, blocks: { a: { type: 'current_product', settings: { product: 'a3', offer_type: 'fixed_price', offer_value: '39.99' } } }, block_order: ['a'] };
const products = [{ handle: 'a3', title: 'A3', status: 'ACTIVE', onlineStoreUrl: 'https://example.com/products/a3', variants: { nodes: [{ id: 'gid://shopify/ProductVariant/101', title: 'Black', price: '79.99' }, { id: 'gid://shopify/ProductVariant/102', title: 'Orange', price: '89.99' }] } }];
test('compiler binds real variants and produces identical storefront and server price rules', () => {
  const plan = compilePlan(section, products, shop);
  assert.deepEqual(plan.binding.campaigns, plan.configuration.campaigns);
  assert.equal(plan.binding.campaigns[0].rules.length, 2);
  assert.equal(plan.binding.campaigns[0].rules[1].final, 3999);
  assert.deepEqual(plan.combinesWith, { productDiscounts: false, orderDiscounts: false, shippingDiscounts: false });
  assert.equal(plan.configuration.currentStartsLocal, '2026-10-01T10:00:00');
});
test('configured schedule offsets are converted to the actual shop timezone', () => {
  assert.equal(localDate('2026-10-01T02:00:00Z', shop.ianaTimezone), '2026-10-01T10:00:00');
});
test('an inactive, empty first drop produces no eligible product rules', () => {
  const plan = compilePlan({ settings: {}, blocks: {}, block_order: [] }, [], shop);
  assert.ok(plan.configuration.campaigns.every(c => !c.enabled && c.rules.length === 0));
});
test('missing, unpublished, duplicate and ineligible variant configurations stop synchronization', () => {
  assert.throws(() => compilePlan(section, [], shop), /missing/);
  assert.throws(() => compilePlan(section, [{ ...products[0], status: 'DRAFT' }], shop), /missing/);
  const duplicate = structuredClone(section); duplicate.blocks.b = structuredClone(duplicate.blocks.a); duplicate.block_order.push('b');
  assert.throws(() => compilePlan(duplicate, products, shop), /more than once/);
  const wrong = structuredClone(section); wrong.blocks.a.settings.variant_id = '999'; assert.throws(() => compilePlan(wrong, products, shop), /no selected variants/);
});
test('backend receipt requires active engine and every combination flag to be explicitly false', () => {
  const plan = compilePlan(section, products, shop);
  assert.throws(() => assertBackend({ title: plan.title, status: 'ACTIVE', combinesWith: { ...plan.combinesWith, shippingDiscounts: true } }, plan), /combinations/);
  assert.throws(() => assertBackend({ title: plan.title, status: 'EXPIRED', combinesWith: plan.combinesWith }, plan), /active/);
  assert.doesNotThrow(() => assertBackend({ title: plan.title, status: 'ACTIVE', combinesWith: plan.combinesWith }, plan));
});
