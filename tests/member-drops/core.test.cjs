const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../../assets/suntneew-member-drops-core.js');
const campaign = { key: 'current', enabled: true, startsAt: '2026-10-01T10:00:00+08:00', endsAt: '2026-10-03T10:00:00+08:00', products: [] };
test('three pricing modes calculate in integer cents and never advertise a larger percentage', () => {
  assert.deepEqual(core.price(7999, 'percentage', '25'), { base: 7999, final: 5999, saving: 2000, percent: 25 });
  assert.equal(core.price(8999, 'fixed_price', '39.99').final, 3999);
  assert.equal(core.price(8999, 'amount_off', '10').final, 7999);
  assert.equal(core.price(1000, 'fixed_price', 0).final, 0);
  assert.equal(core.price(3000, 'fixed_price', '20').percent, 33);
});
test('invalid values fail closed, including accidental full-price or negative offers', () => {
  for (const [type, value] of [['percentage', 101], ['percentage', 0], ['amount_off', 100], ['fixed_price', -1], ['fixed_price', 80], ['fixed_price', ''], ['percentage', '20%'], ['percentage', Infinity]]) assert.equal(core.price(7999, type, value), null);
  assert.equal(core.price(0, 'percentage', 20), null);
});
test('absolute timestamps require a timezone and reject normalized invalid dates', () => {
  for (const value of ['2026-02-30T10:00:00+08:00', '2026-10-01 10:00', '2026-10-01T10:00:00', 'junk', null]) assert.ok(Number.isNaN(core.timestamp(value)));
  assert.equal(core.timestamp(campaign.startsAt), Date.parse('2026-10-01T02:00:00Z'));
});
test('arbitrary schedule duration, exact boundaries, and disabled campaigns', () => {
  const start = core.timestamp(campaign.startsAt), end = core.timestamp(campaign.endsAt);
  assert.equal(core.phase(campaign, start - 1), 'preview'); assert.equal(core.phase(campaign, start), 'live');
  assert.equal(core.phase(campaign, end - 1), 'live'); assert.equal(core.phase(campaign, end), 'ended');
  assert.equal(core.phase({ ...campaign, enabled: false }, start), 'disabled');
  assert.equal(core.phase({ ...campaign, endsAt: campaign.startsAt }, start), 'invalid');
});
test('next campaign becomes current automatically and overlap is rejected', () => {
  const next = { ...campaign, key: 'next', startsAt: campaign.endsAt, endsAt: '2026-10-05T10:00:00+08:00' };
  assert.equal(core.chooseCampaign([campaign, next], core.timestamp(next.startsAt)).campaign.key, 'next');
  assert.equal(core.chooseCampaign([campaign, { ...campaign, key: 'next' }], core.timestamp(campaign.startsAt)).conflict, true);
});
test('edited prices, times, currency or variant IDs invalidate a backend binding', () => {
  const v = { id: '101', price: 7999 }, p = { rule: 'percentage', value: 25 };
  const config = { currency: 'USD', binding: { version: 1, engine: 'shopify-function', currency: 'USD', campaigns: [{ ...campaign, rules: [{ variantId: '101', type: 'percentage', value: 25, base: 7999, final: 5999 }] }] } };
  assert.equal(core.isVerified(config, campaign, p, v), true);
  assert.equal(core.isVerified(config, campaign, { ...p, value: 30 }, v), false);
  assert.equal(core.isVerified(config, { ...campaign, endsAt: '2026-10-04T10:00:00+08:00' }, p, v), false);
  assert.equal(core.isVerified({ ...config, currency: 'EUR' }, campaign, p, v), false);
  assert.equal(core.isVerified(config, campaign, p, { ...v, price: 6999 }), false);
  assert.equal(core.isVerified(config, campaign, p, { ...v, id: '102' }), false);
});
test('the countdown reaches zero and does not wrap at the end', () => {
  assert.deepEqual(core.countdown(90061000, 0), ['01', '01', '01', '01']);
  assert.deepEqual(core.countdown(0, 1), ['00', '00', '00', '00']);
});
