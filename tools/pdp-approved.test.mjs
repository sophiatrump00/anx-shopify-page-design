import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { JSDOM } from 'jsdom';
const read = name => fs.readFileSync(new URL('../' + name, import.meta.url), 'utf8');
const code = read('assets/suntneew-pdp-approved.js');
const theme = read('assets/theme.js');
const formCode = theme.slice(theme.indexOf('var ProductForm ='), theme.indexOf('// js/common/product/product-form-listeners.js'));
const variants = [
 { id: 1, title: '8000mAh / Orange', options: ['8000mAh', 'Orange'], available: true, price: 4999, compare: 5999, min: 1, max: 5, step: 1, imageId: 10 },
 { id: 2, title: '8000mAh / Red', options: ['8000mAh', 'Red'], available: true, price: 4999, compare: 5999, min: 1, max: 3, step: 1, imageId: 20 },
 { id: 3, title: '12000mAh / Orange', options: ['12000mAh', 'Orange'], available: false, price: 5399, compare: 6599, min: 1, max: 0, step: 1, imageId: 10 }
];
function setup(t, catalog = variants) {
 const dom = new JSDOM(`<div data-pdp-approved data-form="p" data-currency="USD" data-colour-index="1" data-add-label="Add to cart" data-sold-out-label="Sold out" data-unavailable-label="Unavailable">
 <script type="application/json" data-approved-variants>${JSON.stringify(catalog)}</script>
 <div data-main-price><strong data-approved-price></strong><del data-approved-compare></del><span data-approved-saving></span></div><p data-approved-price-quantity hidden></p><p data-approved-availability hidden></p>
 <select data-approved-option="0"><option>8000mAh</option><option>12000mAh</option></select><select data-approved-option="1"><option>Orange</option><option>Red</option></select>
 <input form="p" name="quantity" value="1"><button data-approved-quantity="-1"></button><button data-approved-quantity="1"></button>
 <form is="product-form" id="p"><input name="id" value="1"><button type="submit">Add to cart</button></form><button form="p" data-suntneew-buy-now>Buy now</button>
 <aside class="sticky-buy" hidden><div class="sticky-product"><img><span data-approved-selected></span></div><strong data-approved-price></strong><button type="submit" form="p" data-approved-sticky-add><span data-approved-button-label>Add to cart</span></button></aside>
 <p class="approved-cart-feedback" hidden></p><a class="approved-cart-link" hidden></a>
 <img class="main-image"><b data-gallery-index>01</b><span data-gallery-count></span><button data-gallery="0" data-image-id="10" data-image-colour="Orange" data-full="orange.webp" data-alt="Orange"></button><button data-gallery="1" data-image-id="20" data-image-colour="Red" data-full="red.webp" data-alt="Red"></button>
 <div data-variant-match="8000mAh">8000 spec / manual</div><div data-variant-match="12000mAh">12000 spec / manual</div>
 <nav class="product-nav"><div class="nav-links"><a href="#features">Features</a><a href="#specs">Specifications</a><a href="#box">In the box</a></div></nav>
 <section id="features"><button data-feature="0" aria-controls="f0"></button><button data-feature="1" aria-controls="f1"></button><div id="f0"></div><div id="f1" hidden></div></section><section id="box"></section><section id="specs"><details id="manuals"><summary>Manuals</summary>Actual manual</details></section><a id="manual-link" href="#manuals">Manual</a></div>`, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://example.com/products/a20' });
 t.after(() => dom.window.close()); const w = dom.window;
 w.Shopify = { routes: { root: '/' } }; w.themeVariables = { settings: { cartType: 'drawer', pageType: 'product' } };
 w.HTMLElement.prototype.scrollIntoView = () => {};
 w.eval(formCode); w.eval(code); w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
 const root = w.document.querySelector('[data-pdp-approved]'), form = w.document.forms.p;
 const choose = (capacity, color) => { const inputs = root.querySelectorAll('select'); inputs[0].value = capacity; inputs[1].value = color; inputs[1].dispatchEvent(new w.Event('change')); };
 return { w, root, form, quantity: form.elements.namedItem('quantity'), choose };
}
test('A20 switches the real ID, color image, matching specs and inventory limits together', t => {
 const { w, root, form, quantity, choose } = setup(t);
 choose('8000mAh', 'Red'); assert.equal(form.elements.namedItem('id').value, '2');
 assert.match(root.querySelector('.main-image').src, /red.webp$/); assert.equal(root.querySelector('[data-gallery="0"]').hidden, true);
 quantity.value = '99'; quantity.dispatchEvent(new w.Event('change')); assert.equal(quantity.value, '3');
 assert.equal(new w.FormData(form).get('quantity'), '3'); assert.equal(root.querySelector('[data-approved-price]').textContent, '$149.97');
 assert.equal(root.querySelector('[data-variant-match="12000mAh"]').hidden, true);
 choose('12000mAh', 'Orange'); assert.equal(form.elements.namedItem('id').value, '3'); assert.equal(form.elements.namedItem('id').disabled, true);
 assert.equal(root.querySelector('[data-approved-price]').textContent, '$53.99'); assert.equal(form.querySelector('button').textContent, 'Sold out');
 assert.equal(root.querySelector('[data-variant-match="8000mAh"]').hidden, true); assert.equal(root.querySelector('[data-variant-match="12000mAh"]').hidden, false);
 for (const button of root.querySelectorAll('[type="submit"], [data-suntneew-buy-now], [data-approved-quantity]')) assert.equal(button.disabled, true);
 choose('8000mAh', 'Orange'); assert.equal(form.elements.namedItem('id').value, '1'); assert.equal(form.querySelector('button').disabled, false);
});
test('a nonexistent A20 capacity and color clears purchase state without a fallback', async t => {
 const { root, form, choose } = setup(t); let calls = 0;
 choose('12000mAh', 'Red'); assert.equal(form.elements.namedItem('id').value, ''); assert.equal(form.dataset.variantState, 'error');
 assert.equal(root.querySelector('[data-approved-price]').textContent, 'Unavailable'); assert.equal(root.querySelector('[data-approved-compare]').hidden, true);
 assert.match(root.querySelector('[data-approved-availability]').textContent, /combination is unavailable/);
 form.ownerDocument.defaultView.fetch = async () => { calls++; };
 await form._onSubmit({ preventDefault() {} }); assert.equal(calls, 0);
 choose('8000mAh', 'Red'); assert.equal(form.elements.namedItem('id').value, '2'); assert.equal(form.dataset.variantState, 'ready');
});
test('native purchase sends the selected option and quantity once, locks controls and recovers', async t => {
 const { w, root, form, quantity, choose } = setup(t); choose('8000mAh', 'Red'); quantity.value = '2'; quantity.dispatchEvent(new w.Event('change'));
 let resolve, calls = 0, submitted;
 w.fetch = async (url, options) => { calls++; submitted = options.body; return new Promise(done => { resolve = done; }); };
 const first = form._onSubmit({ preventDefault() {} }); await form._onSubmit({ preventDefault() {} }); await Promise.resolve();
 assert.equal(calls, 1); assert.equal(submitted.get('id'), '2'); assert.equal(submitted.get('quantity'), '2');
 assert.equal(root.querySelector('select').disabled, true); assert.equal(quantity.disabled, true);
 resolve({ ok: false, json: async () => ({ description: 'Inventory changed.' }) }); await first;
 assert.equal(root.querySelector('select').disabled, false); assert.equal(quantity.disabled, false); assert.equal(root.querySelector('[data-approved-sticky-add]').disabled, false);
 assert.equal(root.querySelector('.approved-cart-feedback').textContent, 'Inventory changed.');
});
test('quantity rules preserve valid increments and the price dock never duplicates a visible main price', async t => {
 const { w, root, quantity } = setup(t, [{ ...variants[0], min: 2, max: 8, step: 3 }]);
 quantity.value = '100'; quantity.dispatchEvent(new w.Event('change')); assert.equal(quantity.value, '8');
 root.querySelector('[data-approved-quantity="-1"]').click(); assert.equal(quantity.value, '5');
 let bottom = 50; root.querySelector('[data-main-price]').getBoundingClientRect = () => ({ bottom });
 const update = async () => { w.dispatchEvent(new w.Event('scroll')); await new Promise(resolve => w.requestAnimationFrame(resolve)); };
 await update(); assert.equal(root.querySelector('.sticky-buy').hidden, true);
 bottom = -10; await update(); assert.equal(root.querySelector('.sticky-buy').hidden, false);
 bottom = 70; await update(); assert.equal(root.querySelector('.sticky-buy').hidden, true);
});
test('documents open from their link and active navigation follows the actual section order', async t => {
 const { w, root } = setup(t);
 root.querySelector('#manual-link').click(); assert.equal(root.querySelector('#manuals').open, true); assert.equal(w.location.hash, '#manuals');
 root.querySelector('#features').getBoundingClientRect = () => ({ top: -500 });
 root.querySelector('#box').getBoundingClientRect = () => ({ top: -300 });
 root.querySelector('#specs').getBoundingClientRect = () => ({ top: -100 });
 w.dispatchEvent(new w.Event('scroll')); await new Promise(resolve => w.requestAnimationFrame(resolve));
 assert.equal(root.querySelector('.nav-links a.active').getAttribute('href'), '#specs');
 root.querySelector('[data-feature="0"]').dispatchEvent(new w.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
 assert.equal(root.querySelector('#f0').hidden, true); assert.equal(root.querySelector('#f1').hidden, false);
});
