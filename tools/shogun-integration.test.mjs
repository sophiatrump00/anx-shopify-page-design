import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
const { Liquid } = await import(process.env.LIQUIDJS_MODULE || 'liquidjs');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const layouts = ['theme.liquid', 'password.liquid', 'theme.shogun.landing.liquid', 'theme.suntneew-shogun.landing.liquid'];
function createEngine(roots = [path.join(root, 'snippets')]) {
  const engine = new Liquid({ root: roots, extname: '.liquid' });
  // Shopify's paginate tag is parsed but never reached: these fixtures have no collections.
  engine.registerTag('paginate', {
    parse(token, tokens) {
      this.liquid.parser.parseStream(tokens).on('tag:endpaginate', function () { this.stop(); }).start();
    },
    render() { throw new Error('Pagination is outside these integration fixtures'); },
  });
  return engine;
}
const engine = createEngine();
const nativeHead = '<script id="shopify-native">window.shopifyNative = true;</script>';
const nativeBody = '<main id="native-content">Product content</main>';
const harness = `{% include 'suntneew-shogun-content-handler' %}<head>{{ content_for_header }}{{ shogun_content_for_header }}</head><body>{{ shogun_content_for_layout }}</body><aside>{{ content_for_header }}{{ content_for_layout }}</aside>`;
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
  for (const name of layouts) {
    const text = fs.readFileSync(path.join(root, 'layout', name), 'utf8');
    assert.equal((text.match(/include 'suntneew-shogun-content-handler'/g) || []).length, 1, name);
    assert.equal((text.match(/\{\{ content_for_header \}\}/g) || []).length, 1, name);
    assert.match(text, /\{\{ content_for_header \}\}\s*\{\{ shogun_content_for_header \}\}/, name);
  }
});

test('regenerating the legacy app handler cannot change the active layout integration', async t => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'shogun-regression-'));
  t.after(() => fs.rmSync(temporaryRoot, { recursive: true, force: true }));
  fs.writeFileSync(path.join(temporaryRoot, 'shogun-content-handler.liquid'), `{% assign content_for_header = 'BROKEN_NATIVE_HEADER' %}{% assign content_for_layout = 'BROKEN_NATIVE_BODY' %}`);
  const isolated = createEngine([temporaryRoot, path.join(root, 'snippets')]);
  const context = { template: { suffix: 'test' }, page: { metafields: { shogun: {} } }, content_for_header: nativeHead, content_for_layout: nativeBody };
  const poisoned = await isolated.parseAndRender(`{% include 'shogun-content-handler' %}{{ content_for_header }}`, context);
  assert.match(poisoned, /BROKEN_NATIVE_HEADER/);
  for (const name of layouts) {
    const layout = fs.readFileSync(path.join(root, 'layout', name), 'utf8');
    const integration = layout.match(/\{% include '[^']*shogun-content-handler' %\}/)?.[0];
    assert.ok(integration, name);
    const html = await isolated.parseAndRender(`${integration}<head>{{ content_for_header }}{{ shogun_content_for_header }}</head><body>{{ shogun_content_for_layout }}</body><aside>{{ content_for_header }}{{ content_for_layout }}</aside>`, context);
    assert.doesNotMatch(html, /BROKEN_NATIVE/, name);
    assert.ok(html.includes(`<body>${nativeBody}</body>`), name);
    assert.ok(html.includes(`<aside>${nativeHead}${nativeBody}</aside>`), name);
  }
});

test('the landing entry uses the theme-owned layout without duplicating product initialization', () => {
  const text = fs.readFileSync(path.join(root, 'templates/page.shogun.landing.liquid'), 'utf8');
  assert.match(text, /layout 'theme.suntneew-shogun.landing'/);
  assert.doesNotMatch(text, /render 'shogun-products'/);
  for (const name of layouts) {
    const layout = fs.readFileSync(path.join(root, 'layout', name), 'utf8');
    assert.doesNotMatch(layout, /include 'shogun-content-handler'/, name);
  }
});
