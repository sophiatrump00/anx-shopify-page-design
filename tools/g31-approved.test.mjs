import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { JSDOM } from 'jsdom';

const read = name => fs.readFileSync(new URL('../' + name, import.meta.url), 'utf8');
const code = read('assets/suntneew-g31-approved.js');
const theme = read('assets/theme.js');
const formCode = theme.slice(theme.indexOf('var ProductForm ='), theme.indexOf('// js/common/product/product-form-listeners.js'));
function setup(t, available = true) {
  const dom = new JSDOM(`<div data-g31-approved data-form="g31" data-unit-price="24000" data-compare-price="32999" data-currency="USD" data-available="${available}">
    <div id="main-price"><strong data-g31-price></strong><del data-g31-compare></del><span data-g31-saving></span></div><p data-g31-price-quantity hidden></p>
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
  const template = JSON.parse(read('templates/product.rv-g31.json'));
  assert.deepEqual(template.order, ['main']);
  assert.equal(template.sections.main.type, 'suntneew-g31-approved');
  assert.equal(Object.values(template.sections.main.blocks).filter(b => b.type === 'selling_point').length, 5);
  assert.equal(Object.values(template.sections.main.blocks).filter(b => b.type.startsWith('shopify://apps/')).length, 1);
  assert.equal(Object.values(template.sections.main.blocks).filter(b => b.type === 'spec').length, 26);
  assert.doesNotMatch(read('sections/suntneew-g31-approved.liquid'), /Overview|cart-demo|review-card/);
});
