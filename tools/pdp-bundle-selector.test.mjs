import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { Liquid } from 'liquidjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const script = fs.readFileSync(path.join(root, 'assets/suntneew-pdp-experience.js'), 'utf8');
const translations = JSON.parse(fs.readFileSync(path.join(root, 'locales/en.default.json'), 'utf8').replace(/^\s*\/\*[\s\S]*?\*\/\s*/, ''));
const engine = new Liquid({ root: path.join(root, 'snippets'), extname: '.liquid' });
// LiquidDoc contains documentation only; Shopify parses it without storefront output.
engine.registerTag('doc', {
  parse(token, tokens) {
    this.liquid.parser.parseStream(tokens).on('tag:enddoc', function () { this.stop(); }).start();
  },
  render() { return ''; },
});
engine.registerFilter('money', cents => `$${(Math.round(Number(cents)) / 100).toFixed(2)}`);
engine.registerFilter('t', (key, ...args) => {
  let text = key.split('.').reduce((node, part) => node?.[part], translations);
  if (text && typeof text === 'object') text = text[Number(Object.fromEntries(args).count) === 1 ? 'one' : 'other'];
  assert.equal(typeof text, 'string', key);
  for (const [name, value] of args) text = text.replaceAll(`{{ ${name} }}`, String(value));
  return text;
});

// The four real A20 combinations; unavailable red capacities have no variant ID.
const variants = [
  { id: 51847425032487, price: 4999, available: true },
  { id: 51848503001383, price: 4999, available: true },
  { id: 51864706285863, price: 5399, available: false },
  { id: 51864706318631, price: 5999, available: false },
].map(variant => ({ ...variant, quantity_rule: { min: 1, max: null, increment: 1 } }));

async function fixture({ selected = variants[0], catalog = variants, savings = true, activate = true } = {}) {
  const html = await engine.renderFile('suntneew-bundle-selector', {
    product: { available: true, selected_or_first_available_variant: selected, variants: catalog },
    product_form_id: 'pdp-form',
    block: { settings: { enabled: true, show_savings: savings, discount_percent: 3, heading: 'Choose quantity' } },
    localization: { country: { currency: { iso_code: 'USD' } } },
  });
  const dom = new JSDOM(`<html lang="en-US"><body><div class="product-info"><form id="pdp-form"><input name="id" value="${selected?.id ?? ''}"></form><input id="pdp-form-quantity" name="quantity" form="pdp-form" value="${selected?.quantity_rule?.min ?? 1}">${html}</div></body></html>`, { runScripts: 'outside-only' });
  const { window } = dom;
  window.matchMedia = () => ({ matches: true });
  const doc = window.document;
  const form = doc.getElementById('pdp-form');
  const selector = doc.querySelector('[data-suntneew-bundle-selector]');
  const buttons = [...selector.querySelectorAll('[data-bundle-quantity]')];
  const prices = () => buttons.map(button => button.querySelector('[data-bundle-price]').textContent);
  const choose = variant => {
    form.querySelector('[name="id"]').value = variant?.id;
    form.dispatchEvent(new window.Event('change', { bubbles: true }));
    form.dispatchEvent(new window.CustomEvent('variant:change', { bubbles: true, detail: { variant } }));
  };
  if (activate) {
    window.eval(script);
    doc.dispatchEvent(new window.Event('DOMContentLoaded'));
  }
  return { dom, window, doc, form, selector, buttons, prices, choose };
}

function assertUnavailable(ui, state, label) {
  assert.equal(ui.selector.dataset.selectionState, state);
  assert.deepEqual(ui.prices(), Array(4).fill(label));
  for (const button of [...ui.buttons, ui.selector.querySelector('[data-bundle-custom]')]) {
    assert.equal(button.disabled, true);
    assert.equal(button.getAttribute('aria-pressed'), 'false');
  }
  for (const node of ui.selector.querySelectorAll('[data-bundle-compare]')) {
    assert.equal(node.hidden, true);
    assert.equal(node.textContent, '');
  }
  assert.ok([...ui.selector.querySelectorAll('[data-bundle-savings]')].every(node => node.hidden));
  assert.equal(ui.selector.querySelector('[data-bundle-status]').textContent, label);
  assert.equal(ui.selector.querySelector('[data-bundle-status]').hidden, false);
}

test('available A20 pack totals match server output and quantity selection updates the actual form', async t => {
  const ui = await fixture();
  t.after(() => ui.dom.window.close());
  // Recorded live Shopify cart totals: the percentage discount is truncated per unit.
  assert.deepEqual(ui.prices(), ['$49.99', '$97.00', '$227.50', '$455.00']);
  const server = await fixture({ activate: false });
  t.after(() => server.dom.window.close());
  assert.deepEqual(server.prices(), ui.prices());
  assert.ok(ui.buttons.every(button => !button.disabled));
  ui.buttons[1].click();
  assert.equal(ui.doc.getElementById('pdp-form-quantity').value, '2');
  assert.equal(ui.buttons[1].getAttribute('aria-pressed'), 'true');
  assert.equal(ui.buttons[0].getAttribute('aria-pressed'), 'false');
});

test('an absent red capacity cannot fall back to another variant price, and switching back restores the pack', async t => {
  const ui = await fixture();
  t.after(() => ui.dom.window.close());
  ui.choose(null);
  assertUnavailable(ui, 'unavailable', 'Unavailable');
  ui.choose(variants[1]);
  assert.equal(ui.selector.dataset.selectionState, 'available');
  assert.equal(ui.prices()[1], '$97.00');
  assert.ok(ui.buttons.every(button => !button.disabled));
  assert.equal(ui.buttons[0].getAttribute('aria-pressed'), 'true');
  assert.ok([...ui.selector.querySelectorAll('[data-bundle-savings]')].every(node => !node.hidden));
  assert.equal(ui.selector.querySelector('[data-bundle-status]').hidden, true);
  ui.choose(variants[0]);
  assert.equal(ui.prices()[0], '$49.99');
});

test('both real sold-out capacities clear old totals and disable pack and custom controls', async t => {
  const ui = await fixture();
  t.after(() => ui.dom.window.close());
  for (const variant of variants.slice(2)) {
    ui.choose(variant);
    assertUnavailable(ui, 'sold-out', 'Sold out');
  }
  ui.choose(variants[0]);
  assert.equal(ui.prices()[0], '$49.99');
  assert.equal(ui.selector.querySelector('[data-bundle-custom]').disabled, false);
});

test('unavailable and sold-out direct loads are safe before and after JavaScript initializes', async t => {
  for (const activate of [false, true]) {
    for (const selected of [null, variants[2], variants[3]]) {
      const ui = await fixture({ selected, activate });
      t.after(() => ui.dom.window.close());
      assertUnavailable(ui, selected ? 'sold-out' : 'unavailable', selected ? 'Sold out' : 'Unavailable');
    }
  }
});

test('switching available variants reads the current form ID instead of a cached price', async t => {
  const second = { ...variants[1], price: 7499 };
  const ui = await fixture({ catalog: [variants[0], second] });
  t.after(() => ui.dom.window.close());
  ui.choose(second);
  assert.equal(ui.prices()[0], '$74.99');
  assert.equal(ui.prices()[1], '$145.50');
  ui.choose(variants[0]);
  assert.equal(ui.prices()[0], '$49.99');
});

test('quantity rules and undiscounted products retain their original behavior', async t => {
  const selected = { ...variants[0], quantity_rule: { min: 2, max: 6, increment: 3 } };
  for (const activate of [false, true]) {
    const ui = await fixture({ selected, catalog: [selected], savings: false, activate });
    t.after(() => ui.dom.window.close());
    assert.deepEqual(ui.buttons.map(button => button.disabled), [true, false, false, true]);
    assert.deepEqual(ui.prices(), ['$49.99', '$99.98', '$249.95', '$499.90']);
    assert.equal(ui.buttons[1].getAttribute('aria-pressed'), 'true');
  }
  const customVariant = { ...selected, quantity_rule: { min: 3, max: 9, increment: 3 } };
  const ui = await fixture({ selected: customVariant, catalog: [customVariant] });
  t.after(() => ui.dom.window.close());
  assert.equal(ui.selector.querySelector('[data-bundle-custom]').getAttribute('aria-pressed'), 'true');
});

test('A20 has no expired ANX15 promotion and its CTA targets the existing purchase region', () => {
  for (const file of ['templates/product.a20.json', 'sections/suntneew-pdp-video-band.liquid']) {
    assert.doesNotMatch(fs.readFileSync(path.join(root, file), 'utf8'), /ANX15|2026-10-20|2026-10-21|discount=ANX15/i, file);
  }
  assert.match(fs.readFileSync(path.join(root, 'templates/product.a20.json'), 'utf8'), /"cta_link": "#main"/);
  assert.match(fs.readFileSync(path.join(root, 'layout/theme.liquid'), 'utf8'), /id="main"/);
});
