import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import { Liquid } from 'liquidjs';

const script = fs.readFileSync(new URL('../assets/suntneew-pdp-experience.js', import.meta.url), 'utf8');

test('G31 autoplay opt-out survives pointer, focus and dialog transitions while other galleries retain autoplay', t => {
  const dom = new JSDOM(`<div data-suntneew-media-gallery data-autoplay="false"><button class="product-gallery__thumbnail" data-media-type="image" aria-current="true"></button><button class="product-gallery__thumbnail" data-media-type="image"></button></div><div data-suntneew-media-gallery data-autoplay-interval="6"><button class="product-gallery__thumbnail" data-media-type="image" aria-current="true"></button><button class="product-gallery__thumbnail" data-media-type="image"></button></div>`, { runScripts: 'outside-only', pretendToBeVisual: true });
  t.after(() => dom.window.close());
  const { window } = dom;
  const timers = new Map();
  let id = 0;
  window.setTimeout = (fn, delay) => { timers.set(++id, { fn, delay }); return id; };
  window.clearTimeout = key => timers.delete(key);
  window.matchMedia = () => ({ matches: false });
  let g31Clicks = 0;
  let otherClicks = 0;
  const [g31, other] = window.document.querySelectorAll('[data-suntneew-media-gallery]');
  g31.addEventListener('click', () => { g31Clicks++; });
  other.addEventListener('click', () => { otherClicks++; });
  window.eval(script);
  window.document.dispatchEvent(new window.Event('DOMContentLoaded'));
  const runTimers = () => {
    const pending = [...timers.values()];
    timers.clear();
    pending.forEach(timer => timer.fn());
  };
  assert.equal(timers.size, 1);
  runTimers();
  assert.equal(otherClicks, 1);
  assert.equal(g31Clicks, 0);
  for (const event of ['pointerenter', 'pointerleave', 'focusin', 'focusout']) g31.dispatchEvent(new window.Event(event));
  for (const event of ['visibilitychange', 'dialog:after-show', 'dialog:after-hide']) window.document.dispatchEvent(new window.Event(event));
  runTimers();
  runTimers();
  assert.equal(g31Clicks, 0);
  g31.querySelectorAll('button')[1].click();
  assert.equal(g31Clicks, 1, 'manual thumbnail navigation remains available');
});

test('desktop rating uses the live count and correct review anchor, and hides missing review data', async () => {
  const engine = new Liquid();
  engine.registerTag('doc', {
    parse(token, tokens) { this.liquid.parser.parseStream(tokens).on('tag:enddoc', function () { this.stop(); }).start(); },
    render() { return ''; },
  });
  engine.registerFilter('t', (key, ...args) => `${Object.fromEntries(args).count} reviews`);
  const source = fs.readFileSync(new URL('../snippets/suntneew-g31-desktop-rating.liquid', import.meta.url), 'utf8');
  const render = (count, rating = { rating: 4.5, scale_max: 5 }) => engine.parseAndRender(source, { product: { metafields: { reviews: { rating_count: { value: count }, rating: { value: rating } } } } });
  const html = await render(7);
  assert.match(html, /href="#judgeme_product_reviews"/);
  assert.match(html, /4\.5 \/ 5/);
  assert.match(html, /7 reviews/);
  assert.equal((await render(0)).trim(), '');
  assert.equal((await render(7, null)).trim(), '');
});
