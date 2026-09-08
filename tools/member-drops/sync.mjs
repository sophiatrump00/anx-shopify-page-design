#!/usr/bin/env node
/** Default: read-only plan. --apply is a separate, explicit backend operation. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { parseArgs, isDeepStrictEqual } from 'node:util';
import { compilePlan, assertBackend } from './plan.mjs';

const { values: args } = parseArgs({ options: {
  store: { type: 'string' }, cli: { type: 'string', default: 'shopify' },
  template: { type: 'string', default: 'templates/page.member-drops.json' },
  output: { type: 'string', default: 'output/member-drops/backend-plan.json' },
  apply: { type: 'boolean', default: false }, 'function-id': { type: 'string' }, 'page-id': { type: 'string' }
} });
if (!args.store || !/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(args.store)) throw new Error('Pass --store YOUR-STORE.myshopify.com.');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const output = path.resolve(root, args.output);
fs.mkdirSync(path.dirname(output), { recursive: true });
const json = p => JSON.parse(fs.readFileSync(p, 'utf8').replace(/^\s*\/\*[\s\S]*?\*\/\s*/, ''));
async function execute(query, variables = {}, mutation = false) {
  if (mutation && !args.apply) throw new Error('Mutations require --apply.');
  if (process.env.SHOPIFY_ADMIN_ACCESS_TOKEN) {
    const response = await fetch(`https://${args.store}/admin/api/2026-07/graphql.json`, {
      method: 'POST', signal: AbortSignal.timeout(30000),
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_ACCESS_TOKEN },
      body: JSON.stringify({ query, variables })
    });
    if (!response.ok) throw new Error(`Shopify Admin API returned HTTP ${response.status}.`);
    const payload = await response.json();
    if (payload.errors?.length) throw new Error(JSON.stringify(payload.errors));
    for (const field of Object.values(payload.data || {})) if (field?.userErrors?.length) throw new Error(JSON.stringify(field.userErrors));
    if (!payload.data) throw new Error('Shopify returned no data.');
    return payload.data;
  }
  const directory = fs.mkdtempSync(path.join(path.dirname(output), '.request-'));
  const q = path.join(directory, 'query.graphql'), v = path.join(directory, 'variables.json'), r = path.join(directory, 'result.json');
  fs.writeFileSync(q, query); fs.writeFileSync(v, JSON.stringify(variables));
  const cliArgs = ['store', 'execute', '--store', args.store, '--version', '2026-07', '--query-file', q, '--variable-file', v, '--output-file', r, '--json'];
  if (mutation) cliArgs.push('--allow-mutations');
  try {
    const isJs = /\.[cm]?js$/.test(args.cli);
    execFileSync(isJs ? process.execPath : args.cli, isJs ? [args.cli, ...cliArgs] : cliArgs, { stdio: ['ignore', 'pipe', 'pipe'], timeout: 120000 });
    const payload = json(r);
    if (payload.errors?.length) throw new Error(JSON.stringify(payload.errors));
    const data = payload.data || payload;
    for (const field of Object.values(data)) if (field?.userErrors?.length) throw new Error(JSON.stringify(field.userErrors));
    return data;
  } catch (error) {
    throw new Error(error.stderr?.toString() || error.message);
  } finally { fs.rmSync(directory, { recursive: true, force: true }); }
}
const template = json(path.resolve(root, args.template));
const sections = Object.values(template.sections).filter(s => s.type === 'suntneew-member-drops');
if (sections.length !== 1) throw new Error('The template must contain exactly one member-drop section.');
const section = sections[0];
if (section.settings.claim_mode === 'native-codes') throw new Error('This is the legacy Function synchronizer. Use native/prepare.mjs and the native service deployment workflow for native-codes. No changes were made.');
const handles = [...new Set(Object.values(section.blocks || {}).filter(b => section.settings[b.type === 'next_product' ? 'next_enabled' : 'enabled']).map(b => b.settings?.product).filter(Boolean))];
if (handles.some(h => !/^[a-z0-9][a-z0-9-]*$/.test(h))) throw new Error('Product selections must be Shopify product handles.');
const info = await execute('query { shop { name currencyCode ianaTimezone plan { displayName shopifyPlus } } currentAppInstallation { app { id } accessScopes { handle } } }');
const products = handles.length ? (await execute('query($search: String!) { products(first: 100, query: $search) { nodes { handle title status onlineStoreUrl variants(first: 250) { pageInfo { hasNextPage } nodes { id title price } } } } }', { search: handles.map(h => `handle:${h}`).join(' OR ') })).products.nodes : [];
const plan = compilePlan(section, products, info.shop);
fs.writeFileSync(output, JSON.stringify(plan, null, 2) + '\n');
console.log(`Reviewable plan saved: ${output}`);
console.log(`Campaigns enabled: ${plan.configuration.campaigns.filter(c => c.enabled).length}; eligible variants: ${plan.configuration.campaigns.reduce((n, c) => n + c.rules.length, 0)}.`);
if (!args.apply) process.exit(0);

const scopes = new Set(info.currentAppInstallation.accessScopes.map(s => s.handle));
for (const scope of ['write_discounts', 'write_content']) if (!scopes.has(scope)) throw new Error(`Missing ${scope}. Authenticate the installed Function provider app with the required access before applying; no changes were made.`);
if (!args['function-id'] || !/^gid:\/\/shopify\/Page\/\d+$/.test(args['page-id'] || '')) throw new Error('--apply requires an installed --function-id and the destination --page-id gid://shopify/Page/NUMBER.');
const functions = (await execute('query { shopifyFunctions(first: 100) { nodes { id title handle apiVersion app { id } } } }')).shopifyFunctions.nodes;
const installed = functions.find(f => f.id === args['function-id'] && f.title === plan.title && f.handle === 'suntneew-member-drops' && f.apiVersion === '2026-07' && f.app.id === info.currentAppInstallation.app.id);
if (!installed) throw new Error('The expected Member Drops Function is not installed for this app. Shopify Basic requires an eligible public app distribution and the same provider app token; do not substitute an unrelated Function.');
const page = (await execute('query($id: ID!) { page(id: $id) { id title templateSuffix } }', { id: args['page-id'] })).page;
if (!page || page.templateSuffix !== 'member-drops') throw new Error('The target page must use the member-drops template.');
const existing = (await execute('query { discountNodes(first: 100, query: "title:\"SuntNeew Member Drops\"") { nodes { id discount { __typename ... on DiscountAutomaticApp { title appDiscountType { functionId } } } } } }')).discountNodes.nodes.filter(n => n.discount.title === plan.title);
if (existing.length > 1 || existing.some(n => n.discount.__typename !== 'DiscountAutomaticApp' || n.discount.appDiscountType.functionId !== args['function-id'])) throw new Error('An unrelated or duplicate member discount exists. Review it before synchronization.');
async function metafield(ownerId, key, value) {
  const data = await execute('mutation($fields: [MetafieldsSetInput!]!) { metafieldsSet(metafields: $fields) { metafields { namespace key value } userErrors { field message } } }', { fields: [{ ownerId, namespace: 'suntneew', key, type: 'json', value: JSON.stringify(value) }] }, true);
  const saved = data.metafieldsSet.metafields?.[0];
  if (!saved || !isDeepStrictEqual(JSON.parse(saved.value), value)) throw new Error(`Metafield write could not be verified: ${key}.`);
}
// Revoke storefront purchase eligibility first. A failed sync never leaves a new
// display configuration paired with an unverified checkout configuration.
await metafield(page.id, 'member_drops_binding', {});
const input = { title: plan.title, startsAt: new Date(Date.now() - 60000).toISOString(), endsAt: null, discountClasses: ['PRODUCT'], combinesWith: plan.combinesWith, appliesOnOneTimePurchase: true, appliesOnSubscription: false };
let discountId = existing[0]?.id;
if (discountId) {
  await execute('mutation($id: ID!, $input: DiscountAutomaticAppInput!) { discountAutomaticAppUpdate(id: $id, automaticAppDiscount: $input) { userErrors { field message } } }', { id: discountId, input }, true);
} else {
  const result = await execute('mutation($input: DiscountAutomaticAppInput!) { discountAutomaticAppCreate(automaticAppDiscount: $input) { automaticAppDiscount { discountId } userErrors { field message } } }', { input: { ...input, functionHandle: installed.handle, metafields: [{ namespace: 'suntneew', key: 'member_drops', type: 'json', value: JSON.stringify(plan.configuration) }] } }, true);
  discountId = result.discountAutomaticAppCreate.automaticAppDiscount?.discountId;
  if (!discountId) throw new Error('No discount ID returned; storefront binding remains revoked.');
}
await metafield(discountId, 'member_drops', plan.configuration);
const verified = (await execute('query($id: ID!) { discountNode(id: $id) { metafield(namespace: "suntneew", key: "member_drops") { jsonValue } discount { ... on DiscountAutomaticApp { title status combinesWith { productDiscounts orderDiscounts shippingDiscounts } } } } }', { id: discountId })).discountNode;
assertBackend(verified?.discount, plan);
if (!isDeepStrictEqual(verified.metafield.jsonValue, plan.configuration)) throw new Error('The backend configuration differs from the reviewed plan; storefront binding remains revoked.');
await metafield(page.id, 'member_drops_binding', { ...plan.binding, discountId, verifiedAt: new Date().toISOString() });
console.log(`Backend verified and page bound to ${discountId}. Theme publication is a separate step.`);
