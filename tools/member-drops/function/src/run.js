/** Shopify runs this on the server. No cart attribute is accepted as proof of membership. */
export function run(input) {
  const empty = { operations: [] };
  if (!input.cart?.buyerIdentity?.isAuthenticated || !input.cart.buyerIdentity.customer?.id) return empty;
  let config;
  try { config = input.discount?.configuration?.jsonValue; } catch { return empty; }
  if (!config || config.version !== 1 || config.currency !== 'USD' || !Array.isArray(config.campaigns)) return empty;
  const clock = input.shop?.localTime;
  if (!clock) return empty;
  const active = config.campaigns.filter(c => c && c.enabled === true && ['current', 'next'].includes(c.key) && clock[`${c.key}Started`] === true && clock[`${c.key}Ended`] === false);
  if (active.length !== 1) return empty;
  const rules = new Map();
  if (!Array.isArray(active[0].rules) || active[0].rules.length > 100) return empty;
  for (const rule of active[0].rules || []) {
    if (!rule || !/^\d+$/.test(String(rule.variantId))) return empty;
    const id = `gid://shopify/ProductVariant/${rule.variantId}`;
    if (rules.has(id)) return empty;
    if (!Number.isSafeInteger(rule.base) || !Number.isSafeInteger(rule.final) || rule.final < 0 || rule.final >= rule.base) return empty;
    rules.set(id, rule);
  }
  const candidates = [];
  for (const line of input.cart.lines || []) {
    if (line.merchandise?.__typename !== 'ProductVariant' || line.sellingPlanAllocation) continue;
    const rule = rules.get(line.merchandise.id), unit = line.cost?.amountPerQuantity;
    if (!rule || unit?.currencyCode !== config.currency || !Number.isInteger(line.quantity) || line.quantity < 1) continue;
    const base = Math.round(Number(unit.amount) * 100);
    // A changed selling price invalidates the published offer until the next sync.
    if (!Number.isSafeInteger(base) || base !== rule.base) continue;
    candidates.push({
      message: 'SuntNeew Member Drops',
      targets: [{ cartLine: { id: line.id } }],
      value: { fixedAmount: { amount: ((rule.base - rule.final) / 100).toFixed(2), appliesToEachItem: true } }
    });
  }
  return candidates.length ? { operations: [{ productDiscountsAdd: { candidates, selectionStrategy: 'ALL' } }] } : empty;
}
