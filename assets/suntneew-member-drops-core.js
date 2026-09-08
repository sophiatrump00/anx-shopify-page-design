/* Shared pricing and schedule rules. Money uses Shopify's integer minor units. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SuntNeewMemberDrops = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/;
  function timestamp(value) {
    if (typeof value !== 'string' || !DATE.test(value)) return NaN;
    const time = Date.parse(value);
    // Date.parse normalizes impossible calendar dates (for example February 30).
    const [year, month, day] = value.slice(0, 10).split('-').map(Number);
    if (month < 1 || month > 12 || day < 1 || day > new Date(Date.UTC(year, month, 0)).getUTCDate()) return NaN;
    return time;
  }
  function phase(campaign, now = Date.now()) {
    if (!campaign?.enabled) return 'disabled';
    const start = timestamp(campaign.startsAt), end = timestamp(campaign.endsAt);
    if (!Number.isFinite(now) || !Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 'invalid';
    if (now < start) return 'preview';
    return now < end ? 'live' : 'ended';
  }
  function price(base, type, rawValue) {
    if (!/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(String(rawValue).trim())) return null;
    const value = typeof rawValue === 'number' ? rawValue : Number(String(rawValue).trim());
    if (!Number.isSafeInteger(base) || base <= 0 || rawValue === '' || rawValue == null || !Number.isFinite(value) || value < 0) return null;
    let final;
    if (type === 'percentage' && value <= 100) final = base - Math.round(base * value / 100);
    else if (type === 'amount_off') final = base - Math.round(value * 100);
    else if (type === 'fixed_price') final = Math.round(value * 100);
    else return null;
    if (!Number.isSafeInteger(final) || final < 0 || final >= base) return null;
    return { base, final, saving: base - final, percent: type === 'percentage' ? value : Math.floor((base - final) / base * 100 + 1e-9) };
  }
  function chooseCampaign(campaigns, now = Date.now()) {
    const enabled = campaigns.filter(c => c.enabled);
    const live = enabled.filter(c => phase(c, now) === 'live');
    if (live.length > 1) return { campaign: live[0], conflict: true };
    if (live.length) return { campaign: live[0], conflict: false };
    const ended = enabled.filter(c => phase(c, now) === 'ended').sort((a, b) => timestamp(b.endsAt) - timestamp(a.endsAt));
    if (enabled.some(c => c.key === 'current' && phase(c, now) === 'ended')) return { campaign: ended[0], conflict: false };
    const upcoming = enabled.filter(c => phase(c, now) === 'preview').sort((a, b) => timestamp(a.startsAt) - timestamp(b.startsAt));
    if (upcoming.length) return { campaign: upcoming[0], conflict: false };
    return { campaign: ended[0] || enabled[0] || null, conflict: false };
  }
  function matchingBinding(config, campaign, binding) {
    if (binding?.version !== 1 || !['shopify-function', 'native-codes'].includes(binding.engine) || binding.engine !== (config.claimMode || 'shopify-function') || binding.currency !== config.currency || binding.currency !== 'USD') return null;
    const match = binding.campaigns?.find(c => c.key === campaign.key);
    if (!match || !match.enabled || match.startsAt !== campaign.startsAt || match.endsAt !== campaign.endsAt) return null;
    return match;
  }
  function isVerified(config, campaign, product, variant) {
    const binding = matchingBinding(config, campaign, config.binding);
    if (!binding || !variant || product.locked) return false;
    const rule = binding.rules?.find(r => String(r.variantId) === String(variant.id));
    const offer = price(variant.price, product.rule, product.value);
    return !!(offer && rule && rule.type === product.rule && Number(rule.value) === Number(product.value) && rule.base === variant.price && rule.final === offer.final);
  }
  function countdown(target, now) {
    let seconds = Math.max(0, Math.ceil((target - now) / 1000));
    const days = Math.floor(seconds / 86400); seconds %= 86400;
    const hours = Math.floor(seconds / 3600); seconds %= 3600;
    return [days, hours, Math.floor(seconds / 60), seconds % 60].map(v => String(v).padStart(2, '0'));
  }
  function validateCampaigns(campaigns) {
    const issues = [];
    const active = campaigns.filter(c => c.enabled);
    for (const c of active) {
      if (phase(c) === 'invalid') issues.push(`${c.key}: use valid ISO dates with a timezone; the end must follow the start.`);
      if (!c.products?.length) issues.push(`${c.key}: select at least one product.`);
      const seen = new Set();
      for (const p of c.products || []) {
        if (p.locked) continue;
        if (!p.variants?.length) issues.push(`${c.key}: ${p.title || p.id} has no selected variants.`);
        for (const v of p.variants || []) {
          if (seen.has(String(v.id))) issues.push(`${c.key}: variant ${v.id} appears more than once.`);
          seen.add(String(v.id));
          if (!price(v.price, p.rule, p.value)) issues.push(`${c.key}: ${p.title || p.id}, ${v.title}: the offer must be below the selling price and at least zero.`);
        }
      }
    }
    if (active.length === 2 && timestamp(active[0].startsAt) < timestamp(active[1].endsAt) && timestamp(active[1].startsAt) < timestamp(active[0].endsAt)) issues.push('The two campaign schedules overlap.');
    return issues;
  }
  return { timestamp, phase, price, chooseCampaign, matchingBinding, isVerified, countdown, validateCampaigns };
});
