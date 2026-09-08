import test from 'node:test';
import assert from 'node:assert/strict';
import { contact, hash, verifyProxy, activeRule, discountInput } from './domain.mjs';
import { createService } from './service.mjs';
const time = Date.parse('2026-09-08T00:00:00Z');
const campaign = { key: 'current', enabled: true, startsAt: new Date(time - 1000).toISOString(), endsAt: new Date(time + 7 * 86400000 - 1000).toISOString(), rules: [{ variantId: '50860787204391', type: 'percentage', value: 85, base: 11999, final: 1800 }] };
const plan = { version: 1, engine: 'native-codes', currency: 'USD', campaigns: [campaign] };
const secret = 'test-secret-with-more-than-32-characters';
function fixture({ mailFails = false, variantPrice = '119.99', tamper = false } = {}) {
  let clock = time, mail, creates = 0, customerWrites = 0, stored;
  const calls = [];
  const api = async (q, v) => {
    calls.push({ q, v });
    if (q.includes('productVariant(id:')) return { productVariant: { price: variantPrice, availableForSale: true, product: { status: 'ACTIVE', onlineStoreUrl: 'https://example.com/products/ad19' } } };
    if (q.includes('customers(first:')) return { customers: { nodes: [] } };
    if (q.includes('customerCreate')) { customerWrites++; return { customerCreate: { customer: { id: 'gid://shopify/Customer/1', phone: '+12025550123' } } }; }
    if (q.includes('codeDiscountNodeByCode')) return { codeDiscountNodeByCode: stored };
    if (q.includes('discountCodeBasicCreate')) {
      creates++; const input = v.input;
      stored = { id: 'gid://shopify/DiscountCodeNode/1', codeDiscount: { ...input, context: { customers: [{ id: 'gid://shopify/Customer/1' }] }, customerGets: { ...input.customerGets, items: { products: { nodes: [] }, productVariants: { nodes: [{ id: 'gid://shopify/ProductVariant/50860787204391' }] } } } } };
      if (tamper) stored.codeDiscount.combinesWith.orderDiscounts = true;
      return { discountCodeBasicCreate: { codeDiscountNode: { id: stored.id } } };
    }
    throw new Error('unexpected query');
  };
  let currentPlan = structuredClone(plan);
  const service = createService({ database: ':memory:', secret, proxySecret: secret, shop: 'test.myshopify.com', loadPlan: () => currentPlan, api, now: () => clock,
    sendEmail: async (email, code) => { if (mailFails) throw new Error('mail'); mail = { email, code }; } });
  return { service, calls, get mail() { return mail; }, get creates() { return creates; }, get customerWrites() { return customerWrites; }, advance: ms => { clock += ms; }, change: () => { currentPlan.campaigns[0].rules[0].value = 80; } };
}
const input = { email: 'Person@example.com', phone: '+1 202 555 0123', campaign: 'current', variantId: campaign.rules[0].variantId };
test('contact normalization requires email and an international phone; no credentials are accepted as identity', () => {
  assert.deepEqual(contact(input), { email: 'person@example.com', phone: '+12025550123' });
  for (const bad of [{ ...input, email: 'a\nb@example.com' }, { ...input, phone: '123' }, { ...input, email: 'x' }]) assert.throws(() => contact(bad));
});
test('85% off AD19 is 1800 cents and native discounts cannot combine with any class', () => {
  const { rule } = activeRule(plan, 'current', input.variantId, time);
  const d = discountInput(campaign, rule, 'gid://shopify/Customer/1', 'MD-TEST');
  assert.equal(d.customerGets.value.percentage, .85); assert.equal(rule.final, 1800);
  assert.equal(Date.parse(d.endsAt) - Date.parse(d.startsAt), 7 * 86400000);
  assert.deepEqual(d.combinesWith, { productDiscounts: false, orderDiscounts: false, shippingDiscounts: false });
  assert.deepEqual(d.context.customers.add, ['gid://shopify/Customer/1']); assert.equal(d.usageLimit, 1);
  assert.throws(() => activeRule(plan, 'current', input.variantId, Date.parse(campaign.endsAt)));
});
test('app proxy authentication rejects wrong shop, forged signatures and replayed requests', () => {
  const params = `shop=test.myshopify.com&timestamp=${time / 1000}`;
  const signature = hash(secret, `shop=test.myshopify.comtimestamp=${time / 1000}`);
  const url = `/request?${params}&signature=${signature}`;
  assert.equal(verifyProxy(url, secret, 'test.myshopify.com', time), true);
  assert.equal(verifyProxy(url, secret, 'other.myshopify.com', time), false);
  assert.equal(verifyProxy(url, secret, 'test.myshopify.com', time + 301000), false);
  assert.equal(verifyProxy(url.replace(signature, '0'.repeat(64)), secret, 'test.myshopify.com', time), false);
});
test('customer and discount are created only after correct OTP, and retries reuse one restricted code', async () => {
  const f = fixture();
  try {
    const challenge = await f.service.request(input);
    assert.equal(f.customerWrites, 0); assert.equal(f.creates, 0);
    await assert.rejects(f.service.verify({ challengeId: challenge.challengeId, code: '000000' }), /invalid_code/);
    assert.equal(f.customerWrites, 0);
    const result = await f.service.verify({ challengeId: challenge.challengeId, code: f.mail.code });
    assert.match(result.code, /^MD-[A-F0-9]{28}$/); assert.equal(f.creates, 1);
    assert.equal(f.calls.find(c => c.q.includes('customerCreate')).v.input.emailMarketingConsent, undefined);
    await assert.rejects(f.service.verify({ challengeId: challenge.challengeId, code: f.mail.code }), /invalid_code/);
    f.advance(61000);
    const next = await f.service.request(input);
    const again = await f.service.verify({ challengeId: next.challengeId, code: f.mail.code });
    assert.equal(again.code, result.code); assert.equal(f.creates, 1);
  } finally { f.service.close(); }
});
test('five wrong guesses consume a challenge and sending is rate limited', async () => {
  const f = fixture(); try {
    const c = await f.service.request(input);
    await assert.rejects(f.service.request(input), /rate_limited/);
    for (let i = 0; i < 5; i++) await assert.rejects(f.service.verify({ challengeId: c.challengeId, code: '000000' }), /invalid_code/);
    await assert.rejects(f.service.verify({ challengeId: c.challengeId, code: f.mail.code }), /invalid_code/);
    assert.equal(f.creates, 0);
  } finally { f.service.close(); }
});
test('expired OTP, changed campaign, price drift and mail failure never issue a discount', async () => {
  for (const scenario of ['expired', 'changed', 'price', 'mail']) {
    const f = fixture({ variantPrice: scenario === 'price' ? '129.99' : '119.99', mailFails: scenario === 'mail' });
    try {
      if (['price', 'mail'].includes(scenario)) await assert.rejects(f.service.request(input));
      else { const c = await f.service.request(input); if (scenario === 'expired') f.advance(600001); else f.change(); await assert.rejects(f.service.verify({ challengeId: c.challengeId, code: f.mail.code })); }
      assert.equal(f.creates, 0); assert.equal(f.customerWrites, 0);
    } finally { f.service.close(); }
  }
});
test('self-owned app credentials refresh expiring tokens without putting secrets in query strings', async t => {
  const { shopifyClient } = await import('./shopify.mjs');
  let clock = 0, grants = 0; const headers = [];
  t.mock.method(Date, 'now', () => clock);
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url.includes('secret'), false);
    if (url.endsWith('/oauth/access_token')) { grants++; assert.equal(options.body.get('grant_type'), 'client_credentials'); return { ok: true, json: async () => ({ access_token: `token-${grants}`, expires_in: 121 }) }; }
    headers.push(options.headers['X-Shopify-Access-Token']); return { ok: true, json: async () => ({ data: { shop: { currencyCode: 'USD' } } }) };
  });
  const api = shopifyClient({ shop: 'test.myshopify.com', clientId: 'test-client', clientSecret: 'test-secret' });
  await Promise.all([api('query{shop{currencyCode}}'), api('query{shop{currencyCode}}')]);
  assert.equal(grants, 1); clock = 62000; await api('query{shop{currencyCode}}');
  assert.equal(grants, 2); assert.deepEqual(headers, ['token-1', 'token-1', 'token-2']);
});

test('an incorrectly configured Shopify discount is never delivered to the shopper', async () => {
  const f = fixture({ tamper: true });
  try { const c = await f.service.request(input); await assert.rejects(f.service.verify({ challengeId: c.challengeId, code: f.mail.code }), /backend_unavailable/); }
  finally { f.service.close(); }
});
