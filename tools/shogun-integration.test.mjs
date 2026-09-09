import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
const { Liquid } = await import(process.env.LIQUIDJS_MODULE || 'liquidjs');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const engine = new Liquid({ root: path.join(root, 'snippets'), extname: '.liquid' });
// Shopify's paginate tag is parsed but never reached: these fixtures have no collections.
engine.registerTag('paginate', {
  parse(token, tokens) {
    this.liquid.parser.parseStream(tokens).on('tag:endpaginate', function () { this.stop(); }).start();
  },
  render() { throw new Error('Pagination is outside these integration fixtures'); },
});
const nativeHead = '<script id="shopify-native">window.shopifyNative = true;</script>';
const nativeBody = '<main id="native-content">Product content</main>';
const harness = `{% include 'shogun-content-handler' %}<head>{{ content_for_header }}{{ shogun_content_for_header }}</head><body>{{ shogun_content_for_layout }}</body><aside>{{ content_for_header }}{{ content_for_layout }}</aside>`;
async function render(shogun = {}, customer = null) {
  return engine.parseAndRender(harness, {
    template: { suffix: 'test' }, page: { metafields: { shogun } }, customer,
    content_for_header: nativeHead, content_for_layout: nativeBody,
  });
}
const snippets = { value: { head: { test: '<meta name="shogun-test">' }, body: { test: '<footer>Shogun footer</footer>' } } };
const wrapper = { value: { html: '<section data-variant="VARIANT">CONTENT</section>', content_for_layout_placeholder: 'CONTENT', page_variant_id_placeholder: 'VARIANT', template_suffix_to_variant_id_map: { test: 'variant-a' } } };
test('unconfigured pages preserve native Shopify output', async () => {
  const html = await render();
  assert.ok(html.includes(`<body>${nativeBody}</body>`));
  assert.ok(html.includes(`<aside>${nativeHead}${nativeBody}</aside>`));
  assert.doesNotMatch(html, /shogun-variant-/);
});
test('Shogun head, body and wrappers render once without mutating native objects', async () => {
  const html = await render({ json_template_snippets: snippets, json_template_html_wrapper: wrapper });
  assert.equal(html.match(/name="shogun-test"/g).length, 1);
  assert.equal(html.match(/Shogun footer/g).length, 1);
  assert.match(html, /<section data-variant="variant-a">\s*<main[^>]*>Product content<\/main>\s*<footer>Shogun footer<\/footer>\s*<\/section>/);
  assert.ok(html.includes(`<aside>${nativeHead}${nativeBody}</aside>`));
});
test('optimizer isolates Shogun variants while Shopify scripts remain active', async () => {
  const html = await render({ json_template_snippets: snippets, json_template_html_wrapper: wrapper, json_template_optimizer: { value: { head: '<script id="shogun-optimizer"></script>', body: '<div id="variant-outlet"></div>' } } }, { id: 123 });
  const head = html.match(/<head>([\s\S]*?)<\/head>/)[1];
  assert.ok(head.startsWith(nativeHead));
  const variant = head.match(/<template id="shogun-variant-head">([\s\S]*?)<\/template>/)[1];
  assert.doesNotMatch(variant, /shopify-native/);
  assert.match(variant, /name="shogun-test"/);
  assert.match(head, /"id": "123"/);
  assert.equal(html.match(/Shogun footer/g).length, 1);
  assert.match(html, /id="variant-outlet"/);
  assert.ok(html.includes(`<aside>${nativeHead}${nativeBody}</aside>`));
});
test('every integrating layout emits native headers once and initializes Shogun once', () => {
  for (const name of ['theme.liquid', 'password.liquid', 'theme.shogun.landing.liquid']) {
    const text = fs.readFileSync(path.join(root, 'layout', name), 'utf8');
    assert.equal((text.match(/include 'shogun-content-handler'/g) || []).length, 1, name);
    assert.equal((text.match(/\{\{ content_for_header \}\}/g) || []).length, 1, name);
    assert.match(text, /\{\{ content_for_header \}\}\s*\{\{ shogun_content_for_header \}\}/, name);
  }
});
