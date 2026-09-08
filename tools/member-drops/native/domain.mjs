import crypto from 'node:crypto';
import { createRequire } from 'node:module';
const core = createRequire(import.meta.url)('../../../assets/suntneew-member-drops-core.js');
export const hash = (key, value) => crypto.createHmac('sha256', key).update(value).digest('hex');
export function contact(input) {
  const email = String(input.email || '').trim().toLowerCase();
  const phone = String(input.phone || '').replace(/[\s()-]/g, '');
  if (email.length > 254 || !/^[a-z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$/i.test(email) || !/^\+[1-9]\d{7,14}$/.test(phone)) throw new Error('invalid_contact');
  return { email, phone };
}
export function verifyProxy(url, secret, shop, now = Date.now()) {
  const p = new URL(url, 'https://proxy.invalid').searchParams;
  const signature = p.get('signature'); p.delete('signature');
  const keys = [...new Set(p.keys())].sort();
  const message = keys.map(k => `${k}=${p.getAll(k).join(',')}`).join('');
  const expected = hash(secret, message);
  return /^[a-f0-9]{64}$/.test(signature || '') && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected)) && p.getAll('shop').length === 1 && p.get('shop') === shop && p.getAll('timestamp').length === 1 && Math.abs(now / 1000 - Number(p.get('timestamp'))) < 300;
}
export function activeRule(plan, campaignKey, variantId, now = Date.now()) {
  const c = plan.campaigns.find(c => c.key === campaignKey);
  const r = c?.rules.find(r => String(r.variantId) === String(variantId));
  if (plan.engine !== 'native-codes' || plan.currency !== 'USD' || core.phase(c, now) !== 'live' || !r || !core.price(r.base, r.type, r.value) || core.price(r.base, r.type, r.value).final !== r.final) throw new Error('not_available');
  return { campaign: c, rule: r };
}
export function discountInput(campaign, rule, customerId, code) {
  if (!/^gid:\/\/shopify\/Customer\/\d+$/.test(customerId)) throw new Error('invalid_customer');
  return {
    title: `Member Drops ${campaign.key} ${code.slice(-8)}`, code,
    startsAt: campaign.startsAt, endsAt: campaign.endsAt, usageLimit: 1, appliesOncePerCustomer: true,
    context: { customers: { add: [customerId] } },
    combinesWith: { productDiscounts: false, orderDiscounts: false, shippingDiscounts: false },
    customerGets: { appliesOnOneTimePurchase: true, appliesOnSubscription: false,
      items: { products: { productVariantsToAdd: [`gid://shopify/ProductVariant/${rule.variantId}`] } },
      value: rule.type === 'percentage' ? { percentage: rule.value / 100 } : { discountAmount: { amount: ((rule.base - rule.final) / 100).toFixed(2), appliesOnEachItem: true } }
    }
  };
}
export function campaignFingerprint(campaign) {
  return crypto.createHash('sha256').update(JSON.stringify(campaign)).digest('hex');
}
