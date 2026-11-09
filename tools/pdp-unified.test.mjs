import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { JSDOM } from 'jsdom';

const read = name => fs.readFileSync(new URL('../' + name, import.meta.url), 'utf8');
const theme = read('assets/theme.js');
const helpers = theme.slice(0, theme.indexOf('// js/common/utilities/country-selector.js'));
const pickerCode = theme.slice(theme.indexOf('var CACHE_EVICTION_TIME'), theme.indexOf('// js/common/media/base-media.js'));
const formCode = theme.slice(theme.indexOf('var ProductForm ='), theme.indexOf('// js/common/product/product-form-listeners.js'));
const deferred = () => { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };
const variant = (id, available = true) => ({ id, available, price: 4999, options: ['8000mAh', 'Orange'] });
const response = value => ({ ok: true, text: async () => `<variant-picker form-id="p"><script data-variant>${JSON.stringify(value)}</script></variant-picker>` });
function setup(t) {
  const dom = new JSDOM('<form id="p"><input name="id" value="1"><input name="quantity" value="1"><button type="submit">Add</button></form>', { runScripts: 'outside-only', url: 'https://example.com/products/a20' });
  t.after(() => dom.window.close());
  const w = dom.window;
  w.IntersectionObserver = class { observe() {} unobserve() {} };
  w.Delegate4 = class { on() {} off() {} };
  w.Shopify = { routes: { root: '/' } };
  w.deepQuerySelector = (root, selector) => root.querySelector(selector);
  w.eval(helpers + pickerCode);
  const p = w.document.createElement('variant-picker');
  p.setAttribute('form-id', 'p'); p.setAttribute('section-id', 'main'); p.setAttribute('handle', 'a20');
  p.innerHTML = '<script data-variant>{"id":1,"available":true}</script><div data-variant-feedback hidden><button data-variant-retry>Retry</button></div>';
  w.document.body.append(p);
  return { w, p, form: w.document.forms.p };
}

test('variant failure evicts the rejected request, blocks stale purchase, and a retry recovers', async t => {
  const { w, p, form } = setup(t);
  let calls = 0;
  w.fetch = async () => { if (++calls === 1) throw new Error('offline'); return response(variant(2)); };
  await p.selectCombination({ optionValues: ['red'] });
  assert.equal(form.dataset.variantState, 'error');
  assert.equal(form.elements.namedItem('id').disabled, true);
  assert.equal(form.querySelector('button').disabled, true);
  assert.equal(p.querySelector('[data-variant-feedback]').hidden, false);
  await p.selectCombination({ optionValues: ['red'] });
  assert.equal(calls, 2);
  assert.equal(form.elements.namedItem('id').value, '2');
  assert.equal(form.elements.namedItem('id').disabled, false);
  assert.equal(form.dataset.variantState, 'ready');
});

test('a slower previous option response cannot overwrite the most recent choice', async t => {
  const { w, p, form } = setup(t);
  const first = deferred(), second = deferred(); let calls = 0;
  w.fetch = () => ++calls === 1 ? first.promise : second.promise;
  const a = p.selectCombination({ optionValues: ['orange'] });
  const b = p.selectCombination({ optionValues: ['red'] });
  second.resolve(response(variant(2))); await b;
  first.resolve(response(variant(1))); await a;
  assert.equal(form.elements.namedItem('id').value, '2');
  assert.equal(p.selectedVariant.id, 2);
  assert.equal(form.dataset.variantState, 'ready');
});

test('an unavailable option combination clears the purchase ID instead of falling back', async t => {
  const { w, p, form } = setup(t);
  w.fetch = async () => response(null);
  await p.selectCombination({ optionValues: ['12000', 'red'] });
  assert.equal(p.selectedVariant, null);
  assert.equal(form.elements.namedItem('id').value, '');
});

test('mobile totals use the actual form, the 3/6/9 percent ladder and current availability', t => {
  const { w, form } = setup(t);
  const selector = w.document.createElement('div');
  selector.dataset.suntneewBundleSelector = ''; selector.dataset.formId = 'p'; selector.dataset.discountStep = '3'; w.document.body.append(selector);
  const dock = w.document.createElement('suntneew-mobile-buy');
  dock.setAttribute('form', 'p');
  Object.assign(dock.dataset, { currency: 'USD', soldOut: 'Sold out', unavailable: 'Unavailable', addLabel: 'Add to cart' });
  dock.innerHTML = `<strong data-mobile-total></strong><span data-mobile-quantity></span><p data-mobile-feedback hidden></p><button data-mobile-add></button><button data-suntneew-buy-now></button><script data-mobile-variants>${JSON.stringify([variant(1), variant(3, false)])}</script>`;
  w.document.body.append(dock); w.eval(read('assets/suntneew-pdp-unified.js'));
  const quantity = form.elements.namedItem('quantity');
  quantity.value = '3'; dock.sync(); assert.equal(dock.querySelector('strong').textContent, '$141.00');
  quantity.value = '4'; dock.sync(); assert.equal(dock.querySelector('strong').textContent, '$182.00');
  form.elements.namedItem('id').value = '3'; dock.sync(); assert.equal(dock.querySelector('button').disabled, true); assert.equal(dock.querySelector('button').textContent, 'Sold out');
  form.elements.namedItem('id').value = ''; dock.sync(); assert.equal(dock.querySelector('strong').textContent, 'Unavailable'); assert.equal(dock.querySelector('button').disabled, true);
  form.elements.namedItem('id').value = '1'; form.dataset.variantState = 'loading'; dock.sync(); assert.equal(dock.querySelector('strong').textContent, '…'); assert.equal(dock.querySelector('button').disabled, true);
  form.dataset.variantState = 'ready'; form.dataset.purchaseBusy = 'true'; dock.sync(); assert.equal(dock.querySelector('button').disabled, true);
});

test('cart network failure releases the submit lock; retry submits the actual quantity', async t => {
  const dom = new JSDOM('<form is="product-form" id="cart-form"><input name="id" value="1"><input name="quantity" value="3"><button type="submit">Add</button></form>', { runScripts: 'outside-only', url: 'https://example.com/products/a20' });
  t.after(() => dom.window.close());
  const w = dom.window; w.Shopify = { routes: { root: '/' } }; w.themeVariables = { settings: { cartType: 'drawer', pageType: 'product' } }; w.eval(formCode);
  const form = w.document.forms[0]; let calls = 0, submittedQuantity;
  w.fetch = async (url, options) => {
    calls++;
    if (calls === 1) throw new Error('offline');
    if (url === '/cart/add.js') { submittedQuantity = options.body.get('quantity'); return { ok: true, json: async () => ({ id: 1, quantity: 3, sections: {} }) }; }
    return { ok: true, json: async () => ({ item_count: 3, items: [{ id: 1, quantity: 3 }] }) };
  };
  let errors = 0, added = 0;
  form.addEventListener('cart:error', () => errors++); form.addEventListener('variant:add', () => added++);
  await form._onSubmit({ preventDefault() {} }); assert.equal(errors, 1); assert.equal(form.dataset.purchaseBusy, undefined); assert.equal(form.querySelector('button').hasAttribute('aria-busy'), false);
  await form._onSubmit({ preventDefault() {} }); assert.equal(submittedQuantity, '3'); assert.equal(added, 1); assert.equal(calls, 3);
});

test('all ten approved PDPs retain model-specific specifications, available documents and real review widgets', () => {
  for (const name of ['ad19', 'a3', 'a20', 'rv-g24', 'rv-230ah', 'rv-314ah', 'u23', 'u32', 'kb700', 'oj02']) {
    const template = JSON.parse(read(`templates/product.${name}.json`));
    const section = template.sections.main;
    assert.equal(section.type, 'suntneew-pdp-approved', name);
    const blocks = Object.values(section.blocks);
    assert.ok(blocks.some(block => block.type === 'spec'), name);
    assert.ok(blocks.some(block => block.type.startsWith('shopify://apps/judge-me-reviews/')), name);
    assert.ok(blocks.length <= 50, name);
    for (const asset of (section.settings.gallery_assets || '').split('|').filter(Boolean)) assert.ok(fs.existsSync(new URL('../assets/' + asset, import.meta.url)), `${name}: ${asset}`);
    for (const block of blocks.filter(block => block.type === 'download')) {
      assert.ok(block.settings.asset_name || block.settings.link, name);
      if (block.settings.asset_name) assert.ok(fs.existsSync(new URL('../assets/' + block.settings.asset_name, import.meta.url)), `${name}: ${block.settings.asset_name}`);
    }
  }
  const a3 = read('templates/product.a3.json'); assert.doesNotMatch(a3, /suntneew-a3-sales/); assert.match(a3, /suntneew-a3-ul2743-test-report-v20.pdf/);
  for (const model of ['u23', 'u32']) assert.match(read(`templates/product.${model}.json`), /10\.5V/);
  assert.match(read('templates/product.rv-314ah.json'), /157A/);
});

test('in-page links and browser hash navigation reveal the requested detail panel', t => {
  const dom = new JSDOM('<nav class="sn-pdp-nav"><a data-pdp-tab="features" href="#features">Features</a><a data-pdp-tab="manuals" href="#manuals">Documents</a></nav><section data-pdp-panel="features"><a id="manual-link" href="#manuals">Read the manual</a></section><section data-pdp-panel="manuals">Manual PDF</section>', { runScripts: 'outside-only', url: 'https://example.com/products/a3' });
  t.after(() => dom.window.close());
  const w = dom.window; w.matchMedia = () => ({ matches: true }); w.HTMLElement.prototype.scrollIntoView = () => {};
  w.eval(read('assets/suntneew-pdp.js')); w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
  w.document.getElementById('manual-link').click();
  assert.equal(w.document.querySelector('[data-pdp-panel="manuals"]').hidden, false);
  assert.equal(w.document.querySelector('[data-pdp-panel="features"]').hidden, true);
  w.history.replaceState(null, '', '#features'); w.dispatchEvent(new w.HashChangeEvent('hashchange'));
  assert.equal(w.document.querySelector('[data-pdp-panel="features"]').hidden, false);
});
