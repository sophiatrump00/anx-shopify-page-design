import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import { Liquid } from 'liquidjs';

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

test('A20 native Pack selection changes SKU ID and resets the form to one pack', async t => {
  const { w, p, form } = setup(t);
  const variants = [
    { ...variant(1), option3: '1 unit', price: 4599, sku: 'A20-1' },
    { ...variant(2), option3: '2 units', price: 8598, sku: 'A20-2PK' },
    { ...variant(4), option3: '4 units', price: 17196, sku: 'A20-4PK' },
    { ...variant(9), option3: 'Any quantity', price: 4599, sku: 'A20-CUSTOM' },
  ];
  const dock = w.document.createElement('suntneew-mobile-buy');
  dock.setAttribute('form', 'p');
  Object.assign(dock.dataset, { packOption: 'option3', currency: 'USD', soldOut: 'Sold out', unavailable: 'Unavailable', addLabel: 'Add to cart' });
  dock.innerHTML = `<strong data-mobile-total></strong><span data-mobile-quantity></span><p data-mobile-feedback hidden></p><button data-mobile-add></button><button data-suntneew-buy-now></button><script data-mobile-variants>${JSON.stringify(variants)}</script>`;
  w.document.body.append(dock); w.eval(read('assets/suntneew-pdp-unified.js'));
  const quantity = form.elements.namedItem('quantity');
  quantity.value = '7';
  w.fetch = async () => response(variants[1]);
  await p.selectCombination({ optionValues: ['8000', 'orange', '2units'] });
  assert.equal(new w.FormData(form).get('id'), '2');
  assert.equal(new w.FormData(form).get('quantity'), '1');
  assert.equal(dock.querySelector('[data-mobile-total]').textContent, '$85.98');
  w.fetch = async () => response(variants[2]);
  await p.selectCombination({ optionValues: ['8000', 'orange', '4units'] });
  assert.equal(new w.FormData(form).get('id'), '4');
  assert.equal(new w.FormData(form).get('quantity'), '1');
  assert.equal(dock.querySelector('[data-mobile-total]').textContent, '$171.96');
});

test('A20 pack prices render for the selected capacity and color without falling back to another SKU', t => {
  const engine = new Liquid({ root: fileURLToPath(new URL('../snippets', import.meta.url)), extname: '.liquid' });
  engine.registerFilter('money', cents => `$${(Number(cents) / 100).toFixed(2)}`);
  engine.registerFilter('t', (key, ...args) => key === 'product.quantity.unit_count' ? `${Object.fromEntries(args).count} units` : key);
  const optionValues = ['1 unit', '2 units', '4 units', 'Any quantity'].map((name, index) => ({ name, id: 10 + index, selected: index === 0, available: true }));
  const catalog = optionValues.map((option, index) => ({ id: index + 1, available: true, options: ['8000mAh', 'Orange', option.name], price: [4599, 8598, 17196, 4599][index], compare_at_price: [6699, 13398, 26796, 6699][index] }));
  catalog.push({ id: 99, available: true, options: ['8000mAh', 'Red', '2 units'], price: 99998, compare_at_price: 199998 });
  const product = { variants: catalog, options_with_values: [{ name: 'Capacity', position: 1, selected_value: '8000mAh' }, { name: 'Color', position: 2, selected_value: 'Orange' }, { name: 'Pack', position: 3, selected_value: '1 unit' }] };
  const render = (option_value, source = product) => engine.renderFileSync('suntneew-pack-option', { product: source, section: { id: 'main' }, option_value, option_position: 3, param_name: 'p-option3', form_id: 'p' });
  for (const [index, unit, saved, total] of [[1, '$42.99 / unit', 'Save $24.00 / unit', 'Total $85.98'], [2, '$42.99 / unit', 'Save $24.00 / unit', 'Total $171.96']]) {
    const dom = new JSDOM(`<form id="p"></form>${render(optionValues[index])}`);
    t.after(() => dom.window.close());
    const d = dom.window.document;
    assert.equal(d.querySelector('.sn-pack-prices__price').textContent, unit);
    assert.equal(d.querySelector('del').textContent, '$66.99 / unit');
    assert.equal(d.querySelector('.sn-pack-prices__saving').textContent, saved);
    assert.equal(d.querySelector('.sn-pack-prices__total').textContent, total);
    assert.equal(d.querySelector('input').form.id, 'p');
    assert.equal(d.querySelector('input').dataset.optionPosition, '3');
    assert.equal(d.querySelector('label').htmlFor, d.querySelector('input').id);
  }
  const regular = render(optionValues[1], { ...product, variants: catalog.map(item => ({ ...item, compare_at_price: null })) });
  assert.doesNotMatch(regular, /<del\b|sn-pack-prices__saving/);
  const absent = render(optionValues[1], { ...product, options_with_values: product.options_with_values.map(option => option.name === 'Capacity' ? { ...option, selected_value: '12000mAh' } : option) });
  assert.doesNotMatch(absent, /sn-pack-prices__price|\$42.99|\$999.98/);
  assert.match(absent, /product.general.unavailable_button/);
  assert.doesNotMatch(render(optionValues[3]), /sn-pack-prices__price|<del\b/);
});

test('A20 desktop and mobile savings track the actual pack price and hide when there is no discount', t => {
  const { w, form } = setup(t);
  const variants = [
    { ...variant(1), option3: '1 unit', price: 4599, compare_at_price: 6699 },
    { ...variant(2), option3: '2 units', price: 8598, compare_at_price: 13398 },
    { ...variant(4), option3: '4 units', price: 17196, compare_at_price: 26796 },
    { ...variant(8), option3: '2 units', price: 13398, compare_at_price: null },
  ];
  const summary = w.document.createElement('div');
  summary.dataset.snPackSummary = ''; summary.dataset.form = 'p';
  summary.innerHTML = '<strong data-sn-pack-total></strong><del data-sn-pack-compare></del><p data-sn-pack-saving></p>';
  w.document.body.append(summary);
  const dock = w.document.createElement('suntneew-mobile-buy');
  dock.setAttribute('form', 'p');
  Object.assign(dock.dataset, { packOption: 'option3', currency: 'USD', soldOut: 'Sold out', unavailable: 'Unavailable', addLabel: 'Add to cart' });
  dock.innerHTML = `<strong data-mobile-total></strong><del data-mobile-compare></del><span data-mobile-quantity></span><p data-mobile-saving></p><p data-mobile-feedback hidden></p><button data-mobile-add></button><button data-suntneew-buy-now></button><script data-mobile-variants>${JSON.stringify(variants)}</script>`;
  w.document.body.append(dock); w.eval(read('assets/suntneew-pdp-unified.js'));
  const choose = id => { form.elements.namedItem('id').value = String(id); form.elements.namedItem('quantity').value = '1'; dock.sync(); };
  choose(2);
  assert.equal(summary.querySelector('strong').textContent, '$85.98');
  assert.equal(summary.querySelector('del').textContent, '$133.98');
  assert.equal(summary.querySelector('[data-sn-pack-saving]').textContent, 'You save $48.00 in total vs. regular price');
  choose(4);
  assert.equal(dock.querySelector('[data-mobile-saving]').textContent, 'You save $96.00 in total vs. regular price');
  form.elements.namedItem('quantity').value = '2'; dock.sync();
  assert.equal(summary.querySelector('strong').textContent, '$343.92');
  assert.equal(summary.querySelector('[data-sn-pack-saving]').textContent, 'You save $192.00 in total vs. regular price');
  choose(8);
  assert.equal(summary.querySelector('del').hidden, true);
  assert.equal(summary.querySelector('[data-sn-pack-saving]').hidden, true);
  assert.equal(dock.querySelector('[data-mobile-saving]').hidden, true);
  choose(2); form.dataset.variantState = 'loading'; dock.sync();
  assert.equal(summary.querySelector('[data-sn-pack-saving]').hidden, true);
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

test('all ten in-scope public PDPs use native purchasing and model-specific details', () => {
  for (const name of ['ad19', 'a3', 'a20', 'rv-g24', 'rv-230ah', 'rv-314ah', 'u23', 'u32', 'kb700', 'oj02']) {
    const template = JSON.parse(read(`templates/product.${name}.json`).replace(/\/\*[\s\S]*?\*\//g, ''));
    if(name==='a20'){assert.equal(template.sections.main.type,'suntneew-a20-v8');assert.ok(Object.values(template.sections.main.blocks).some(b=>b.type.startsWith('shopify://apps/judge-me-reviews/')));continue;}
    assert.equal(template.sections.main.type, 'main-product', name);
    assert.equal(template.sections.main.settings.show_fixed_add_to_cart, false, name);
    assert.ok(template.sections.main.block_order.includes('reviews'), name);
    assert.ok(template.sections.details.block_order.length > 0, name);
    for (const asset of (template.sections.main.settings.suntneew_gallery_assets || '').split('|').filter(Boolean)) assert.ok(fs.existsSync(new URL('../assets/' + asset, import.meta.url)), `${name}: ${asset}`);
  }
  const a3 = read('templates/product.a3.json'); assert.doesNotMatch(a3, /suntneew-a3-sales/); assert.match(a3, /suntneew-a3-ul2743-test-report-v20.pdf/);
});

test('quantity preset offers match the captured active Shopify discount eligibility', () => {
  const live = JSON.parse(read('tools/fixtures/pdp-multi-pack-20261105.json'));
  const offers = new Map(live.levels[0].handles.map(handle => [handle, live.levels[0].percent]));
  const handles = {
    a20: 'suntneew-a20-jump-starter-8000mah', a3: 'suntneew-a3-jump-starter-16000mah',
    u23: 'suntneew-u23-portable-car-jump-starter-8-000mah', u32: 'suntneew-u32-portable-car-jump-starter-10-000mah'
  };
  for (const name of ['ad19', 'a3', 'a20', 'rv-g24', 'rv-230ah', 'rv-314ah', 'u23', 'u32', 'kb700', 'oj02']) {
    const template = JSON.parse(read(`templates/product.${name}.json`).replace(/\/\*[\s\S]*?\*\//g, ''));
    if(name==='a20'){assert.equal(template.sections.main.type,'suntneew-a20-v8');assert.doesNotMatch(read('assets/suntneew-a20-v8.js'),/discount_percent|discountStep/);continue;}
    const preset = Object.values(template.sections.main.blocks).find(block => block.type === 'suntneew_bundle_selector').settings;
    assert.equal(preset.enabled, true, name);
    assert.equal(preset.show_savings, offers.has(handles[name]), name);
    if (preset.show_savings) assert.equal(preset.discount_percent, offers.get(handles[name]), name);
  }
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
