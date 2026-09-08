import { discountInput } from './domain.mjs';
export function shopifyClient({ shop, token, clientId, clientSecret }) {
  let accessToken = token, expires = token ? Infinity : 0;
  let pendingToken;
  async function authorization() {
    if (accessToken && Date.now() < expires) return accessToken;
    if (!clientId || !clientSecret) throw new Error('backend_unavailable');
    if (!pendingToken) pendingToken = (async () => {
      const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
        method: 'POST', signal: AbortSignal.timeout(15000), headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'client_credentials', client_id: clientId, client_secret: clientSecret })
      });
      if (!response.ok) throw new Error('backend_unavailable');
      const data = await response.json();
      if (!data.access_token || !(Number(data.expires_in) > 120)) throw new Error('backend_unavailable');
      accessToken = data.access_token; expires = Date.now() + (Number(data.expires_in) - 60) * 1000;
      return accessToken;
    })().finally(() => { pendingToken = null; });
    return pendingToken;
  }
  return async function graphql(query, variables = {}) {
    const response = await fetch(`https://${shop}/admin/api/2026-07/graphql.json`, {
      method: 'POST', signal: AbortSignal.timeout(15000),
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': await authorization() }, body: JSON.stringify({ query, variables })
    });
    if (!response.ok) throw new Error('backend_unavailable');
    const result = await response.json();
    if (result.errors?.length || !result.data || Object.values(result.data).some(v => v?.userErrors?.length)) throw new Error('backend_unavailable');
    return result.data;
  };
}
export async function assertProduct(api, rule) {
  const { productVariant: v } = await api(`query($id:ID!){productVariant(id:$id){price availableForSale product{status onlineStoreUrl}}}`, { id: `gid://shopify/ProductVariant/${rule.variantId}` });
  if (!v || !v.availableForSale || v.product.status !== 'ACTIVE' || !v.product.onlineStoreUrl || Math.round(Number(v.price) * 100) !== rule.base) throw new Error('not_available');
}
export async function saveCustomer(api, { email, phone }, campaign) {
  // Search is escaped, and exact matching prevents partial search results from linking another person.
  const search = `email:"${email.replace(/[\\"]/g, '\\$&')}"`;
  const { customers } = await api(`query($q:String!){customers(first:10,query:$q){nodes{id email phone}}}`, { q: search });
  let customer = customers.nodes.find(c => c.email?.toLowerCase() === email);
  const metafields = [{ namespace: 'suntneew', key: 'member_drop_contact', type: 'json', value: JSON.stringify({ phone, phoneVerified: false, emailVerifiedAt: new Date().toISOString(), campaign }) }];
  if (!customer) {
    // Keep phone in a structured customer metafield even if the number belongs to an existing customer.
    // A phone number alone must never merge two customer identities.
    const result = await api(`mutation($input:CustomerInput!){customerCreate(input:$input){customer{id email phone} userErrors{field message}}}`, { input: { email, metafields, tags: ['member-drops', `member-drops-${campaign}`] } });
    customer = result.customerCreate.customer;
  } else {
    await api(`mutation($input:CustomerInput!){customerUpdate(input:$input){customer{id} userErrors{field message}}}`, { input: { id: customer.id, metafields } });
    await api(`mutation($id:ID!,$tags:[String!]!){tagsAdd(id:$id,tags:$tags){userErrors{field message}}}`, { id: customer.id, tags: ['member-drops', `member-drops-${campaign}`] });
  }
  if (!customer?.id) throw new Error('backend_unavailable');
  // Populate the standard phone field where Shopify accepts it. Preserve an existing phone.
  if (!customer.phone) {
    try { await api(`mutation($input:CustomerInput!){customerUpdate(input:$input){customer{id} userErrors{field message}}}`, { input: { id: customer.id, phone } }); } catch { /* The submitted phone is already retained in the customer metafield. */ }
  }
  return customer.id;
}
const fields = `id codeDiscount { ... on DiscountCodeBasic { startsAt endsAt usageLimit appliesOncePerCustomer combinesWith { productDiscounts orderDiscounts shippingDiscounts } context { ... on DiscountCustomers { customers { id } } } customerGets { appliesOnOneTimePurchase appliesOnSubscription value { ... on DiscountPercentage { percentage } ... on DiscountAmount { amount { amount currencyCode } appliesOnEachItem } } items { ... on DiscountProducts { products(first:2){nodes{id}} productVariants(first:2){nodes{id}} } } } } }`;
export async function issueDiscount(api, campaign, rule, customerId, code) {
  const read = async () => (await api(`query($code:String!){codeDiscountNodeByCode(code:$code){${fields}}}`, { code })).codeDiscountNodeByCode;
  let node = await read();
  if (!node) {
    try { await api(`mutation($input:DiscountCodeBasicInput!){discountCodeBasicCreate(basicCodeDiscount:$input){codeDiscountNode{id} userErrors{field message}}}`, { input: discountInput(campaign, rule, customerId, code) }); }
    catch { /* Retry-safe: a timed-out creation can already exist in Shopify. */ }
    node = await read();
  }
  const d = node?.codeDiscount, gets = d?.customerGets;
  const ids = gets?.items?.productVariants?.nodes?.map(v => v.id) || [];
  const customers = d?.context?.customers?.map(c => c.id) || [];
  const valueMatches = rule.type === 'percentage' ? gets?.value?.percentage === rule.value / 100 : Number(gets?.value?.amount?.amount) === (rule.base - rule.final) / 100 && gets.value.amount.currencyCode === 'USD' && gets.value.appliesOnEachItem === true;
  if (!d || Date.parse(d.startsAt) !== Date.parse(campaign.startsAt) || Date.parse(d.endsAt) !== Date.parse(campaign.endsAt) || d.usageLimit !== 1 || !d.appliesOncePerCustomer || ['productDiscounts', 'orderDiscounts', 'shippingDiscounts'].some(k => d.combinesWith?.[k] !== false) || customers.length !== 1 || customers[0] !== customerId || ids.length !== 1 || ids[0] !== `gid://shopify/ProductVariant/${rule.variantId}` || gets.items.products.nodes.length || !gets.appliesOnOneTimePurchase || gets.appliesOnSubscription || !valueMatches) throw new Error('backend_unavailable');
  return node.id;
}
