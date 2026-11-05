import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const { Liquid } = await import(process.env.LIQUIDJS_MODULE || 'liquidjs');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const engine = new Liquid({ root: path.join(root, 'snippets'), extname: '.liquid' });
engine.registerFilter('asset_url', name => `/assets/${name}`);
engine.registerFilter('money', cents => `$${(Number(cents) / 100).toFixed(2)}`);

async function render(overrides = {}) {
  return engine.renderFile('suntneew-g31-mobile', {
    product: {
      title: 'G31 & RV',
      selected_or_first_available_variant: {
        id: 987654, price: 19900, compare_at_price: 25000,
        available: true, inventory_management: 'shopify',
        inventory_policy: 'deny', inventory_quantity: 3,
        ...overrides,
      },
      metafields: { reviews: { rating: { value: { rating: 4.5 } }, rating_count: { value: 12 } } },
    },
    routes: { root_url: '/', cart_add_url: '/cart/add', cart_url: '/cart', collections_url: '/collections' },
    cart: { currency: { iso_code: 'USD' } },
  });
}

test('cart submission uses the selected variant, live prices and inventory cap', async () => {
  const html = await render();
  assert.match(html, /method="post" action="\/cart\/add"/);
  assert.match(html, /name="id" value="987654"/);
  assert.match(html, /name="quantity"[^>]+max="3"/);
  assert.match(html, /<strong>\$398\.00<\/strong>/);
  assert.match(html, /4\.5 \(12 reviews\)/);
  assert.equal((html.match(/form="g31m-product-form"/g) || []).length, 4);
  assert.doesNotMatch(html, /PREVIEW ONLY|Checkout disabled|data-preview-action/);
});

test('sold-out variants cannot be submitted from either purchase location', async () => {
  const html = await render({ available: false, inventory_quantity: 0 });
  assert.equal((html.match(/data-purchase="(?:cart|now)" disabled/g) || []).length, 4);
  assert.equal((html.match(/>Sold out<\/button>/g) || []).length, 4);
});

test('no-discount products hide compare-at prices and use one external review instance', async () => {
  const html = await render({ compare_at_price: 19900, inventory_policy: 'continue', inventory_quantity: 0 });
  assert.equal((html.match(/<s data-compare-total hidden>/g) || []).length, 1);
  assert.equal((html.match(/class="discount-tag" hidden/g) || []).length, 1);
  assert.match(html, /name="quantity"[^>]+max="99"/);
  assert.match(html, /data-g31-review-slot/);
  assert.doesNotMatch(html, /id="judgeme_product_reviews"/);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size);
});
