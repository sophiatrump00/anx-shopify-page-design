import test from 'node:test';
import assert from 'node:assert/strict';
import { run } from './function/src/run.js';
function input() {
  return { cart: { buyerIdentity: { isAuthenticated: true, customer: { id: 'gid://shopify/Customer/1' } }, lines: [
    { id: 'line-1', quantity: 2, merchandise: { __typename: 'ProductVariant', id: 'gid://shopify/ProductVariant/101' }, cost: { amountPerQuantity: { amount: '79.99', currencyCode: 'USD' } } },
    { id: 'line-2', quantity: 1, merchandise: { __typename: 'ProductVariant', id: 'gid://shopify/ProductVariant/102' }, cost: { amountPerQuantity: { amount: '49.99', currencyCode: 'USD' } } }
  ] }, shop: { localTime: { currentStarted: true, currentEnded: false, nextStarted: false, nextEnded: false } }, discount: { configuration: { jsonValue: { version: 1, currency: 'USD', campaigns: [{ key: 'current', enabled: true, rules: [{ variantId: '101', base: 7999, final: 5999 }, { variantId: '102', base: 4999, final: 3999 }] }] } } } };
}
test('authenticated member gets distinct prices on multiple cart lines in one discount', () => {
  const out = run(input()).operations[0].productDiscountsAdd;
  assert.equal(out.selectionStrategy, 'ALL');
  assert.equal(out.candidates.length, 2);
  assert.deepEqual(out.candidates[0].value, { fixedAmount: { amount: '20.00', appliesToEachItem: true } });
  assert.deepEqual(out.candidates[1].value, { fixedAmount: { amount: '10.00', appliesToEachItem: true } });
});
test('known customer ID without authentication cannot obtain the discount', () => {
  const i = input(); i.cart.buyerIdentity.isAuthenticated = false;
  assert.deepEqual(run(i), { operations: [] });
});
test('forged membership cart attributes and a missing customer cannot qualify', () => {
  const i = input(); i.cart.buyerIdentity.customer = null; i.cart.attributes = { member: true };
  assert.deepEqual(run(i), { operations: [] });
});
test('start is inclusive; end is exclusive and enforced by Shopify local time', () => {
  const i = input(); i.shop.localTime.currentStarted = false; assert.deepEqual(run(i), { operations: [] });
  i.shop.localTime.currentStarted = true; assert.equal(run(i).operations.length, 1);
  i.shop.localTime.currentEnded = true; assert.deepEqual(run(i), { operations: [] });
});
test('overlapping campaigns, missing configuration and duplicate rules fail closed', () => {
  const i = input(); i.discount.configuration.jsonValue.campaigns.push({ key: 'next', enabled: true }); i.shop.localTime.nextStarted = true;
  assert.deepEqual(run(i), { operations: [] });
  assert.deepEqual(run({ cart: i.cart }), { operations: [] });
  const j = input(); j.discount.configuration.jsonValue.campaigns[0].rules.push({ variantId: '101', base: 7999, final: 999 });
  assert.deepEqual(run(j), { operations: [] });
});
test('other products, currency changes and changed selling prices do not receive the offer', () => {
  const i = input(); i.cart.lines[0].cost.amountPerQuantity.amount = '59.99'; i.cart.lines[1].cost.amountPerQuantity.currencyCode = 'EUR';
  assert.deepEqual(run(i), { operations: [] });
  const j = input(); j.cart.lines.forEach(l => l.merchandise.id += '9'); assert.deepEqual(run(j), { operations: [] });
});
test('subscriptions and invalid negative target prices never receive a member discount', () => {
  const i = input(); i.cart.lines.forEach(l => l.sellingPlanAllocation = { sellingPlan: { id: '1' } }); assert.deepEqual(run(i), { operations: [] });
  const j = input(); j.discount.configuration.jsonValue.campaigns[0].rules[0].final = -1; assert.deepEqual(run(j), { operations: [] });
});
