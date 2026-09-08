import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { Liquid } from 'liquidjs';
const require = createRequire(import.meta.url);
const core = require('../../assets/suntneew-member-drops-core.js');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const port = Number(process.env.DROP_PREVIEW_PORT || 4178);
const start = Date.now();
const iso = n => new Date(n).toISOString();
const source = (await fs.readFile(path.join(root, 'sections/suntneew-member-drops.liquid'), 'utf8')).replace(/{% schema %}[\s\S]*?{% endschema %}/, '');
const schemaSource = await fs.readFile(path.join(root, 'sections/suntneew-member-drops.liquid'), 'utf8');
const schema = JSON.parse(schemaSource.match(/{% schema %}([\s\S]*?){% endschema %}/)[1]);
const defaults = Object.fromEntries(schema.settings.filter(s => s.id).map(s => [s.id, s.default ?? '']));
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
function fixture(url) {
  const state = url.searchParams.get('state') || 'live';
  const designMode = url.searchParams.get('commerce_test') !== '1';
  const amount = Math.min(6, Math.max(1, Number(url.searchParams.get('items') || 3)));
  const enabled = state !== 'idle';
  const settings = { ...defaults, enabled, next_enabled: enabled && state !== 'preview', title: '', next_title: '', preview_state: 'auto',
    starts_at: iso(state === 'preview' ? start + 2 * 86400000 : start - 86400000), ends_at: iso(state === 'ended' ? start - 10000 : start + 3 * 86400000),
    next_starts_at: iso(start + 5 * 86400000), next_ends_at: iso(start + 8 * 86400000), show_time: url.searchParams.get('hide_time') !== '1', next_show_time: url.searchParams.get('hide_time') !== '1',
    reveal: url.searchParams.get('reveal') || 'silhouette', next_reveal: 'mystery', show_next: url.searchParams.get('hide_next') !== '1'
  };
  if (url.searchParams.get('end_at')) settings.ends_at = url.searchParams.get('end_at');
  const real = url.searchParams.get('sample') !== '1';
  settings.claim_mode = real || url.searchParams.get('native') === '1' ? 'native-codes' : 'shopify-function';
  if (real) { settings.title = 'AD19. Your next adventure.'; settings.next_enabled = false; settings.show_next = false; settings.savings_display = 'both'; settings.ends_at = iso(state === 'ended' ? start - 10000 : start + 7 * 86400000); settings.starts_at = iso(state === 'preview' ? start + 86400000 : start); }
  const blocks = [], rules = [];
  for (let i = 0; i < (real ? 1 : amount); i++) {
    const image = { src: '/assets/suntneew-drops-demo-a3.png' };
    const variants = [0, 1].map(n => ({ id: String(101 + i * 10 + n), title: n ? 'Orange / 16,000 mAh' : 'Black / 16,000 mAh', price: (i === 1 ? 4999 : i === 2 ? 6999 : 7999) + n * 1000, compare_at_price: 9999, available: url.searchParams.get('sold_out') !== '1', featured_image: image }));
    const product = { id: String(1001 + i), handle: `preview-product-${i}`, title: i === 0 ? 'A3 Portable Jump Starter' : i === 1 ? 'Member Travel Kit' : i === 2 ? 'Roadside Essentials' : `Member selection ${i + 1}`, featured_image: image, url: `/products/preview-${i}`, variants };
    let offer_type = i === 1 ? 'amount_off' : i === 2 ? 'fixed_price' : 'percentage', offer_value = i === 1 ? '10' : i === 2 ? '39.99' : '25';
    if (real) {
      const source = JSON.parse(require('node:fs').readFileSync(path.join(root, 'tools/member-drops/native/ad19-preview.json'), 'utf8'));
      image.src = source.featuredMedia.preview.image.url;
      variants.splice(0, variants.length, ...source.variants.nodes.map(v => ({ id: v.id.split('/').at(-1), title: v.title, price: Math.round(Number(v.price) * 100), available: v.inventoryQuantity > 0, featured_image: image })));
      Object.assign(product, { id: source.id.split('/').at(-1), title: source.title, handle: source.handle, url: '/products/' + source.handle });
      offer_type = 'percentage'; offer_value = '85';
    }
    blocks.push({ id: `product-${i}`, type: 'current_product', settings: { product, image, cutout: !real, offer_type, offer_value, variant_id: '', tag: real ? '85% OFF / DROP 01' : 'PREVIEW / SAMPLE PRICE' } });
    rules.push(...variants.map(v => ({ variantId: v.id, type: offer_type, value: Number(offer_value), base: v.price, final: core.price(v.price, offer_type, offer_value).final })));
  }
  blocks.push(...blocks.slice(0, 2).map((b, i) => ({ ...b, id: `next-${i}`, type: 'next_product' })));
  let binding = { version: 1, engine: settings.claim_mode, currency: 'USD', campaigns: [{ key: 'current', enabled, startsAt: settings.starts_at, endsAt: settings.ends_at, rules }, { key: 'next', enabled: settings.next_enabled, startsAt: settings.next_starts_at, endsAt: settings.next_ends_at, rules }] };
  if (url.searchParams.get('unverified') === '1') binding = null;
  const locale = url.searchParams.get('locale') || 'en';
  const canonical = new URL(url); canonical.searchParams.delete('sections'); canonical.searchParams.delete('_drop');
  return { section: { id: 'preview-member-drops', settings, blocks }, request: { design_mode: designMode, path: canonical.pathname + canonical.search, locale: { iso_code: locale } },
    cart: { currency: { iso_code: 'USD' } }, shop: { currency: 'USD', customer_accounts_enabled: true, privacy_policy: {url:'/policies/privacy-policy'} }, customer: url.searchParams.get('member') === '0' ? null : { id: 'preview-member' },
    routes: { root_url: '/', account_login_url: '/account/login', storefront_login_url: '/account/login', all_products_collection_url: '/collections/all' },
    page: { metafields: { suntneew: { member_drops_binding: { value: binding } } } }, locale
  };
}
async function render(context) {
  const localeName = context.locale === 'en' ? 'en.default' : context.locale;
  const messages = JSON.parse(await fs.readFile(path.join(root, 'locales', localeName + '.json'), 'utf8'));
  const globals = Object.fromEntries(['request', 'shop', 'cart', 'customer', 'routes', 'page'].map(key => [key, context[key]]));
  const engine = new Liquid({ root: [path.join(root, 'snippets')], extname: '.liquid', strictFilters: false, globals });
  engine.registerFilter('t', key => key.split('.').reduce((v, k) => v?.[k], messages) ?? key);
  engine.registerFilter('asset_url', name => `/assets/${name}`);
  engine.registerFilter('stylesheet_tag', url => `<link rel="stylesheet" href="${escape(url)}">`);
  engine.registerFilter('image_url', image => image?.src || '');
  engine.registerFilter('json', value => JSON.stringify(value ?? null));
  return engine.parseAndRender(source, context);
}
const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://127.0.0.1:${port}`);
    if (url.pathname.startsWith('/assets/')) {
      const target = path.resolve(root, '.' + decodeURIComponent(url.pathname));
      if (!target.startsWith(path.join(root, 'assets') + path.sep)) { response.writeHead(403).end(); return; }
      const file = await fs.readFile(target), ext = path.extname(target);
      response.writeHead(200, { 'Content-Type': ({ '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' })[ext] || 'application/octet-stream' }).end(file); return;
    }
    if (url.pathname === '/favicon.ico') { response.writeHead(204).end(); return; }
    const context = fixture(url), section = await render(context);
    if (url.searchParams.has('sections')) {
      response.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }).end(JSON.stringify({ [context.section.id]: section })); return;
    }
    const controls = ['live', 'preview', 'ended', 'idle'].map(state => `<a href="?state=${state}&items=${url.searchParams.get('items') || 3}">${state}</a>`).join('');
    const html = `<!doctype html><html lang="${escape(context.locale)}" dir="${context.locale === 'ar' ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Member Drops · Local preview</title><style>*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif}a{color:inherit}.preview-controls{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:14px;background:#eee7d9;color:#5c4f3d;padding:12px;font:12px/1.5 Arial}.preview-controls a{padding:3px 8px;border:1px solid #bfb19d;border-radius:4px}.preview-header{height:72px;display:flex;align-items:center;justify-content:space-between;gap:25px;padding:0 48px;background:#faf9f5;color:#333}.preview-header img{width:150px;height:auto}.preview-nav{display:flex;gap:28px;align-items:center;font-size:13px}.preview-entry{color:#ae4219;background:#fff0e7;border:1px solid #edc5b0;padding:8px 11px;border-radius:3px}.preview-mobile-entry{display:none}@media(max-width:749px){.preview-header{padding:0 18px;height:60px}.preview-header img{width:115px}.preview-nav{display:none}.preview-mobile-entry{display:block;background:#fff0e7;color:#ae4219;font:11px Arial;text-align:center;padding:10px}.preview-controls{font-size:10px;gap:7px}}button,input,select{font:inherit}</style></head><body><aside class="preview-controls"><strong>${url.searchParams.get('sample') === '1' ? '本地演示 · 示例价格不生效' : 'AD19 真实商品预览 · 优惠尚未启用'}</strong>${controls}<a href="?state=live&items=1">单商品</a><a href="?state=live&items=3&sample=1">多商品</a><a href="?state=preview&hide_time=1&reveal=mystery">隐藏时间</a><a href="?state=live&locale=ar">العربية</a></aside><header class="preview-header"><img src="/assets/suntneew-logo-ai-dark.png" alt="SuntNeew"><nav class="preview-nav"><span>All Products⌄</span><span>Help Me Choose</span><span>Journal</span><span>Support⌄</span><span class="preview-entry">ϟ Member Drops</span></nav><span>◎ &nbsp; Bag · 0</span></header><div class="preview-mobile-entry">ϟ Member Drops &nbsp; · &nbsp; Members only ↗</div>${section}</body></html>`;
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }).end(html);
  } catch (error) { response.writeHead(500, { 'Content-Type': 'text/plain' }).end(String(error.stack)); }
});
server.listen(port, '127.0.0.1', () => console.log(`Member Drops preview: http://127.0.0.1:${port}`));
