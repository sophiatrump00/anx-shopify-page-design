import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import { Liquid } from 'liquidjs';

const read = name => fs.readFileSync(new URL('../' + name, import.meta.url), 'utf8');
const code = read('assets/suntneew-g31-approved.js');
const theme = read('assets/theme.js');
const formCode = theme.slice(theme.indexOf('var ProductForm ='), theme.indexOf('// js/common/product/product-form-listeners.js'));
const translations = JSON.parse(read('locales/en.default.json').replace(/^\s*\/\*[\s\S]*?\*\/\s*/, ''));
const engine = new Liquid({ root: fileURLToPath(new URL('../snippets', import.meta.url)), extname: '.liquid' });
engine.registerFilter('money', cents => `$${(Number(cents) / 100).toFixed(2)}`);
engine.registerFilter('json', value => JSON.stringify(value));
engine.registerFilter('t', (key, ...args) => {
  const values = Object.fromEntries(args);
  let text = key.split('.').reduce((node, part) => node?.[part], translations);
  if (typeof text === 'object') text = text[Number(values.count) === 1 ? 'one' : 'other'];
  for (const [name, value] of args) text = text.replaceAll(`{{ ${name} }}`, String(value));
  return text;
});
function setup(t, available = true, withPacks = false, onSale = false) {
  const variants = [
    { id: 51847422509351, option1: '1 unit', price: 22999, inventory_quantity: 5 },
    { id: 102, option1: '2 units', price: 44998, inventory_quantity: 2 },
    { id: 104, option1: '4 units', price: 87996, inventory_quantity: 1 },
    { id: 199, option1: 'Any quantity', price: 22999, inventory_quantity: 5 },
  ].map((variant, index) => ({ ...variant, compare_at_price: onSale ? [32999, 65998, 131996, 32999][index] : null, available, requires_components: true, sku: `G31-${variant.id}`, quantity_rule: { min: 1, increment: 1 } }));
  const choices = withPacks ? engine.parseAndRenderSync(read('snippets/suntneew-g31-quantity-options.liquid'), { product: { variants, selected_or_first_available_variant: variants[0] }, section_id: 'test' }) : '';
  const dom = new JSDOM(`<div data-g31-approved data-form="g31" data-unit-price="24000" data-compare-price="32999" data-currency="USD" data-available="${available}">
    <div id="main-price"><strong data-g31-price></strong><del data-g31-compare></del><span data-g31-saving></span></div><p data-g31-price-quantity hidden></p>
    ${choices}
    <input name="quantity" form="g31" value="1" min="1" max="5" step="1"><button data-g31-quantity="-1"></button><button data-g31-quantity="1"></button>
    <form is="product-form" id="g31"><input name="id" value="51847422509351"><button type="submit">Add</button></form>
    <button data-suntneew-buy-now form="g31"></button><aside class="sticky-buy" hidden><strong data-g31-price></strong><button data-g31-sticky-add type="submit" form="g31">Add</button></aside>
    <p class="g31-cart-feedback" hidden></p><a class="g31-cart-link" hidden></a>
    <img class="main-image" src="main.webp" alt="Main"><b id="gallery-index">01</b><button data-gallery="0" data-full="main.webp" data-srcset="main.webp 1200w" data-alt="Main"></button><button data-gallery="1" data-full="install.webp" data-srcset="install.webp 1600w" data-alt="Installation"></button>
    <button role="tab" data-feature="0" aria-controls="panel-0"></button><button role="tab" data-feature="1" aria-controls="panel-1"></button><div id="panel-0"></div><div id="panel-1" hidden></div>
    <nav class="product-nav"><div class="nav-links"><a href="#panel-0"></a><a href="#panel-1"></a></div></nav></div>`, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://example.com/products/g31' });
  t.after(() => dom.window.close());
  const w = dom.window;
  w.Shopify = { routes: { root: '/' } }; w.themeVariables = { settings: { cartType: 'drawer', pageType: 'product' } };
  w.eval(formCode); w.eval(code); w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
  return { w, root: w.document.querySelector('[data-g31-approved]'), form: w.document.forms.g31, quantity: w.document.forms.g31.elements.namedItem('quantity') };
}
test('approved page quantity is associated with the real form and clamps to inventory', t => {
  const { w, root, form, quantity } = setup(t);
  root.querySelector('[data-g31-quantity="1"]').click();
  assert.equal(new w.FormData(form).get('quantity'), '2');
  assert.deepEqual([...root.querySelectorAll('[data-g31-price]')].map(n => n.textContent), ['$480.00', '$480.00']);
  quantity.value = '900'; quantity.dispatchEvent(new w.Event('change'));
  assert.equal(quantity.value, '5'); assert.equal(root.querySelector('[data-g31-quantity="1"]').disabled, true);
  quantity.value = '-1'; quantity.dispatchEvent(new w.Event('change'));
  assert.equal(quantity.value, '1'); assert.equal(root.querySelector('[data-g31-quantity="-1"]').disabled, true);
});
test('G31 pack buttons select separate SKU IDs and submit one pack instead of multiplying quantity', async t => {
  const { w, root, form, quantity } = setup(t, true, true);
  const choices = [...root.querySelectorAll('[data-g31-variant]')];
  assert.equal(choices.length, 4);
  let submitted;
  w.fetch = async (url, options) => {
    if (url === '/cart/add.js') { submitted = [options.body.get('id'), options.body.get('quantity')]; return { ok: true, json: async () => ({ id: 102, quantity: 1 }) }; }
    return { ok: true, json: async () => ({ item_count: 1, items: [] }) };
  };
  root.querySelector('[data-g31-pack="2"]').click();
  assert.equal(form.elements.namedItem('id').value, '102');
  assert.equal(quantity.value, '1');
  assert.equal(root.querySelector('[data-g31-price]').textContent, '$449.98');
  assert.equal(w.location.search, '?variant=102');
  await form._onSubmit({ preventDefault() {} });
  assert.deepEqual(submitted, ['102', '1']);
  root.querySelector('[data-g31-custom]').click();
  quantity.value = '3'; quantity.dispatchEvent(new w.Event('change'));
  assert.equal(new w.FormData(form).get('id'), '199');
  assert.equal(new w.FormData(form).get('quantity'), '3');
  root.querySelector('[data-g31-pack="4"]').click();
  assert.equal(form.elements.namedItem('id').value, '104');
  assert.equal(quantity.value, '1');
  assert.equal(quantity.max, '1', 'inventory is measured in four-unit packs');
});
test('sold-out G31 pack variants remain disabled', t => {
  const { root } = setup(t, false, true);
  assert.ok([...root.querySelectorAll('[data-g31-variant]')].every(button => button.disabled));
});
test('G31 sale pack cards show original and sale unit prices, unit savings, and pack totals', t => {
  const { root } = setup(t, true, true, true);
  assert.deepEqual([...root.querySelectorAll('.sn-pack-prices__compare')].map(node => [node.tagName, node.textContent]), [['DEL', '$329.99 / unit'], ['DEL', '$329.99 / unit'], ['DEL', '$329.99 / unit']]);
  assert.deepEqual([...root.querySelectorAll('.sn-pack-prices__price')].map(node => node.textContent), ['$229.99 / unit', '$224.99 / unit', '$219.99 / unit']);
  assert.deepEqual([...root.querySelectorAll('.sn-pack-prices__saving')].map(node => node.textContent), ['Save $100.00 / unit', 'Save $105.00 / unit', 'Save $110.00 / unit']);
  assert.deepEqual([...root.querySelectorAll('.sn-pack-prices__total')].map(node => node.textContent), ['Total $229.99', 'Total $449.98', 'Total $879.96']);
  assert.equal(root.querySelector('[data-g31-custom] del'), null);
  root.querySelector('[data-g31-pack="2"]').click();
  assert.equal(root.querySelector('[data-g31-price]').textContent, '$449.98');
  assert.equal(root.querySelector('[data-g31-compare]').textContent, '$659.98');
  assert.equal(root.querySelector('[data-g31-compare]').hidden, false);
  assert.equal(root.querySelector('[data-g31-saving]').textContent, 'You save $210.00 in total vs. regular price');
  root.querySelector('[data-g31-pack="4"]').click();
  assert.equal(root.querySelector('[data-g31-price]').textContent, '$879.96');
  assert.equal(root.querySelector('[data-g31-saving]').textContent, 'You save $440.00 in total vs. regular price');
});
test('G31 regular pack cards do not show a struck-through price without an actual reduction', t => {
  const { root } = setup(t, true, true);
  assert.equal(root.querySelector('.g31-quantity-choices del'), null);
  assert.equal(root.querySelector('.sn-pack-prices__saving'), null);
  assert.equal(root.querySelector('[data-g31-compare]').hidden, true);
  for (const compare_at_price of [null, 0, 32999, 22999]) {
    const variant = { id: 1, option1: '1 unit', price: 32999, compare_at_price, available: true };
    const html = engine.parseAndRenderSync(read('snippets/suntneew-g31-quantity-options.liquid'), { product: { variants: [variant], selected_or_first_available_variant: variant } });
    assert.doesNotMatch(html, /<del\b/);
  }
});
test('native purchase locks prevent double submits, preserve quantity, and recover after an error', async t => {
  const { w, form, quantity, root } = setup(t);
  let resolve, calls = 0, submitted;
  w.fetch = async (url, options) => { calls++; submitted = options.body.get('quantity'); return new Promise(done => { resolve = done; }); };
  quantity.value = '3'; quantity.dispatchEvent(new w.Event('change'));
  const first = form._onSubmit({ preventDefault() {} });
  await form._onSubmit({ preventDefault() {} });
  assert.equal(calls, 1); assert.equal(submitted, '3');
  await Promise.resolve(); assert.equal(root.querySelector('[data-suntneew-buy-now]').disabled, true);
  resolve({ ok: false, json: async () => ({ description: 'Inventory changed. Try a smaller quantity.' }) });
  await first;
  assert.match(root.querySelector('.g31-cart-feedback').textContent, /Inventory changed/);
  assert.equal(root.querySelector('.g31-cart-link').hidden, false);
  assert.equal(quantity.disabled, false); assert.equal(root.querySelector('[data-g31-sticky-add]').disabled, false);
  w.fetch = async url => url === '/cart/add.js' ? { ok: true, json: async () => ({ id: 1, quantity: 3 }) } : { ok: true, json: async () => ({ item_count: 3, items: [] }) };
  await form._onSubmit({ preventDefault() {} });
  assert.equal(root.querySelector('.g31-cart-feedback').textContent, 'Added to your cart.');
});
test('sold-out G31 disables every purchase route', t => {
  const { root, quantity } = setup(t, false);
  assert.equal(quantity.disabled, true);
  for (const button of root.querySelectorAll('[type="submit"], [data-suntneew-buy-now], [data-g31-quantity]')) assert.equal(button.disabled, true);
  assert.equal(root.querySelector('.sticky-buy').hidden, true);
});
test('price dock hides whenever the main price is visible, including after scrolling back', async t => {
  const { w, root } = setup(t);
  let bottom = 25;
  root.querySelector('#main-price').getBoundingClientRect = () => ({ bottom });
  const update = async () => { w.dispatchEvent(new w.Event('scroll')); await new Promise(resolve => w.requestAnimationFrame(resolve)); };
  await update(); assert.equal(root.querySelector('.sticky-buy').hidden, true);
  bottom = -1; await update(); assert.equal(root.querySelector('.sticky-buy').hidden, false);
  bottom = 100; await update(); assert.equal(root.querySelector('.sticky-buy').hidden, true);
});
test('gallery and keyboard tabs reveal actual content and reinitialization does not duplicate listeners', t => {
  const { w, root, quantity } = setup(t);
  root.querySelector('[data-gallery="1"]').click(); assert.match(root.querySelector('.main-image').src, /install.webp$/); assert.equal(root.querySelector('.main-image').alt, 'Installation');
  root.querySelector('[data-feature="0"]').dispatchEvent(new w.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
  assert.equal(root.querySelector('#panel-0').hidden, true); assert.equal(root.querySelector('#panel-1').hidden, false);
  assert.equal(root.querySelector('[data-feature="1"]').getAttribute('aria-selected'), 'true');
  w.document.dispatchEvent(new w.Event('shopify:section:load')); root.querySelector('[data-g31-quantity="1"]').click(); assert.equal(quantity.value, '2');
});
test('section links prevent competing theme scrolling and retain the URL hash', t => {
  const { w, root } = setup(t);
  let localScrolls = 0, themeScrolls = 0;
  root.querySelector('#panel-1').scrollIntoView = options => { assert.equal(options.behavior, 'auto'); localScrolls++; };
  w.document.addEventListener('click', event => { if (!event.defaultPrevented) themeScrolls++; });
  root.querySelector('a[href="#panel-1"]').click();
  assert.equal(localScrolls, 1); assert.equal(themeScrolls, 0); assert.equal(w.location.hash, '#panel-1');
});
test('section highlight follows page position when menu order differs from content order', async t => {
  const { w, root } = setup(t);
  w.document.documentElement.style.setProperty('--header-height', '87px');
  w.document.documentElement.style.setProperty('--sticky-header-enabled', '1');
  const nav = root.querySelector('.product-nav');
  nav.getBoundingClientRect = () => ({ bottom: 51 });
  Object.defineProperty(nav, 'offsetHeight', { value: 51 });
  root.querySelector('#panel-0').getBoundingClientRect = () => ({ top: 152 });
  root.querySelector('#panel-1').getBoundingClientRect = () => ({ top: -536 });
  w.dispatchEvent(new w.Event('scroll'));
  await new Promise(resolve => w.requestAnimationFrame(resolve));
  assert.equal(root.querySelector('[aria-current="location"]').getAttribute('href'), '#panel-0');
});
test('G31 template has one responsive product section, five selling points and one real review app', () => {
  const template = JSON.parse(read('templates/product.rv-g31.json').replace(/^\s*\/\*[\s\S]*?\*\/\s*/, ''));
  assert.deepEqual(template.order, ['main']);
  assert.equal(template.sections.main.type, 'suntneew-g31-approved');
  assert.equal(Object.values(template.sections.main.blocks).filter(b => b.type === 'selling_point').length, 5);
  assert.equal(Object.values(template.sections.main.blocks).filter(b => b.type.startsWith('shopify://apps/')).length, 1);
  assert.equal(Object.values(template.sections.main.blocks).filter(b => b.type === 'spec').length, 26);
  assert.doesNotMatch(read('sections/suntneew-g31-approved.liquid'), /Overview|cart-demo|review-card/);
});
