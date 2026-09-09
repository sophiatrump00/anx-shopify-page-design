import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// npm install --prefix /tmp/suntneew-seo-tests liquidjs@10.29.0
// LIQUIDJS_MODULE=/tmp/suntneew-seo-tests/node_modules/liquidjs/dist/liquid.node.mjs node --test tools/seo-theme.test.mjs
const { Liquid } = await import(process.env.LIQUIDJS_MODULE || 'liquidjs');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const engine = new Liquid({ root: path.join(root, 'snippets'), extname: '.liquid' });
engine.registerFilter('asset_url', name => `/cdn/shop/t/test/assets/${name}?v=test`);
const locales = ['en.default', 'de', 'es', 'fr', 'it', 'pt-BR', 'ja', 'ar'];
const descriptions = Object.fromEntries(locales.map(locale => {
  const raw = fs.readFileSync(path.join(root, `locales/${locale}.json`), 'utf8').replace(/^\s*\/\*[\s\S]*?\*\/\s*/, '');
  return [locale, JSON.parse(raw).suntneew_seo];
}));
engine.registerFilter('t', function (key) {
  const locale = this.context.get(['test_locale']) || 'en.default';
  const value = descriptions[locale]?.[key.replace('suntneew_seo.', '')];
  assert.ok(value, `Missing translation ${locale}: ${key}`);
  return value;
});

test('all bundled variants referenced by rendered images exist, including tiny thumbnails', async () => {
  const sources = JSON.parse(fs.readFileSync(path.join(root, 'tools/seo-asset-sources.json')));
  for (const asset_name of sources) {
    for (const thumbnail of [false, true]) {
      const html = await engine.renderFile('suntneew-asset-image', { asset_name, thumbnail, alt: 'A & B "battery"' });
      const urls = [...html.matchAll(/\/assets\/([^?" ,]+)\?v=test/g)].map(m => m[1]);
      assert.ok(urls.length >= 2, asset_name);
      for (const name of urls) assert.ok(fs.existsSync(path.join(root, 'assets', name)), `Missing ${name}`);
      assert.match(html, /alt="A &amp; B (?:&quot;|&#34;)battery(?:&quot;|&#34;)"/);
      assert.match(html, /loading="lazy"/);
      if (thumbnail) assert.ok(urls.every(name => /-(160|320)\.webp$/.test(name)), asset_name);
    }
  }
});

test('new assets retain their source, hero loading priority and dimensions', async () => {
  const html = await engine.renderFile('suntneew-asset-image', { asset_name: 'new-battery.png', width: 500, height: 300, loading: 'eager', fetchpriority: 'high' });
  assert.match(html, /new-battery\.png/);
  assert.match(html, /width="500" height="300"/);
  assert.match(html, /loading="eager" fetchpriority="high"/);
});

test('local links preserve languages, queries and external destinations without double prefixes', async () => {
  const cases = [
    ['/fr', '/pages/contact-us', '/fr/pages/contact-us'],
    ['/pt', '/policies/shipping-policy', '/pt/policies/shipping-policy'],
    ['/', '/pages/contact-us', '/pages/contact-us'],
    ['/fr', '/fr/pages/contact-us', '/fr/pages/contact-us'],
    ['/ar', 'https://example.com/manual.pdf', 'https://example.com/manual.pdf'],
    ['/ja', '#manual', '#manual'],
    ['/de', '/pages/contact-us?a=1&b=2', '/de/pages/contact-us?a=1&amp;b=2'],
  ];
  for (const [root_url, url, expected] of cases) {
    assert.equal(await engine.renderFile('suntneew-local-url', { routes: { root_url }, url }), expected);
  }
});

test('SEO descriptions render in eight languages and preserve native Japanese SEO', async () => {
  for (const test_locale of locales) {
    const html = await engine.renderFile('suntneew-seo-head', { test_locale, page_title: 'Shipping Policy', current_page: 1, request: { page_type: 'page', path: '/pages/shipping-policy' }, page: { handle: 'shipping-policy' } });
    assert.ok(html.includes(descriptions[test_locale].shipping), test_locale);
    assert.equal((html.match(/name="description"/g) || []).length, 1);
  }
  const native = '製品の仕様と対応機器をご確認ください。';
  const html = await engine.renderFile('suntneew-seo-head', { page_title: 'Battery', page_description: native, current_page: 1, request: { page_type: 'product', path: '/ja/products/battery' } });
  assert.ok(html.includes(native));
});
