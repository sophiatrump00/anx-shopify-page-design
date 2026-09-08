import { test, expect } from '../../tools/member-drops/node_modules/@playwright/test/index.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const output = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../output/member-drops');
async function ready(page, query = '') {
  await page.goto('/?sample=1&' + query);
  await expect(page.locator('[data-content]')).toBeVisible();
}
test('real Liquid renders three independent pricing modes and variant changes', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await ready(page, 'state=live');
  await expect(page.locator('.sn-drops')).toHaveAttribute('data-phase', 'live');
  await expect(page.locator('[data-price]')).toHaveText(['$59.99', '$39.99', '$39.99']);
  await page.locator('[data-variant]').first().selectOption('102');
  await expect(page.locator('[data-price]').first()).toHaveText('$67.49');
  await expect(page.locator('[data-buy]').first()).toBeDisabled();
  expect(errors).toEqual([]);
  await page.screenshot({ path: path.join(output, 'desktop-live.png'), fullPage: true });
});
test('concealed previews do not leak product IDs, titles or backend price rules', async ({ page }) => {
  await ready(page, 'state=preview&reveal=mystery&commerce_test=1&member=0&hide_time=1');
  const data = await page.locator('[data-drop-config]').textContent();
  const config = JSON.parse(data);
  expect(config.campaigns[0].products.every(p => p.locked && !p.variants && !p.title && !p.image)).toBeTruthy();
  expect(config.binding.campaigns.every(c => c.rules.length === 0)).toBeTruthy();
  await expect(page.locator('[data-clock-wrap]')).toBeHidden();
  await expect(page.locator('[data-price-wrap]').first()).toBeHidden();
  await expect(page.locator('[data-login]').first()).toBeVisible();
});
test('unverified offers cannot display a live price or offer a purchase', async ({ page }) => {
  await ready(page, 'state=live&commerce_test=1&unverified=1');
  await expect(page.locator('[data-notice]')).toContainText('not available');
  await expect(page.locator('[data-buy]').first()).toBeDisabled();
  await expect(page.locator('[data-price-wrap]').first()).toBeHidden();
});
test('an eligible guest sees the sign-in action rather than an enabled purchase', async ({ page }) => {
  await ready(page, 'state=live&commerce_test=1&member=0');
  await expect(page.locator('[data-login]').first()).toBeVisible();
  await expect(page.locator('[data-login]').first()).toHaveAttribute('href', '/account/login');
  await expect(page.locator('[data-buy]').first()).toBeHidden();
});
async function mockCart(page, { final = 5999, orderDiscount = false, loseResponse = false } = {}) {
  const state = { properties: {}, changes: [], adds: 0 };
  await page.route('**/cart/add.js', async route => {
    state.adds++;
    state.properties = route.request().postDataJSON().items[0].properties;
    if (loseResponse) return route.abort();
    return route.fulfill({ json: { items: [{ id: 101 }], sections: {} } });
  });
  await page.route('**/cart.js', route => route.fulfill({ json: { currency: 'USD', items: [
    { key: 'existing-user-item', quantity: 1, final_line_price: 3000, properties: {} },
    { key: 'new-drop-item', quantity: 1, final_line_price: final, properties: state.properties }
  ], cart_level_discount_applications: orderDiscount ? [{ total_allocated_amount: 500 }] : [] } }));
  await page.route('**/cart/change.js', route => { state.changes.push(route.request().postDataJSON()); return route.fulfill({ json: { items: [] } }); });
  return state;
}
test('confirmed backend price is kept in the cart and a cart link is provided', async ({ page }) => {
  const state = await mockCart(page);
  await ready(page, 'state=live&commerce_test=1&items=1');
  await expect(page.locator('[data-buy]').first()).toBeEnabled();
  await page.locator('[data-buy]').first().click();
  await expect(page.locator('[data-feedback]').first()).toContainText('Member offer added');
  await expect(page.locator('[data-feedback] a')).toHaveAttribute('href', '/cart');
  expect(state.adds).toBe(1); expect(state.changes).toEqual([]);
});
for (const scenario of [{ name: 'wrong price', final: 7999 }, { name: 'order coupon stacking', orderDiscount: true }, { name: 'lost POST response', loseResponse: true }]) {
  test(`only the new cart line is removed after ${scenario.name}`, async ({ page }) => {
    const state = await mockCart(page, scenario);
    await ready(page, 'state=live&commerce_test=1&items=1');
    await expect(page.locator('[data-buy]').first()).toBeEnabled();
    await page.locator('[data-buy]').first().click();
    await expect(page.locator('[data-feedback]').first()).toBeVisible();
    expect(state.changes).toEqual([{ id: 'new-drop-item', quantity: 0 }]);
  });
}
test('refresh failures disable commerce until server state can be verified', async ({ page }) => {
  await page.route('**/*sections=*', route => route.abort());
  await ready(page, 'state=live&commerce_test=1&items=1');
  await expect(page.locator('[data-buy]').first()).toBeDisabled();
  await expect(page.locator('[data-notice]')).toContainText('Refreshing');
});
test('the end boundary removes purchase eligibility without a page reload', async ({ page }) => {
  const end = new Date(Date.now() + 4500).toISOString();
  await ready(page, 'state=live&commerce_test=1&items=1&end_at=' + encodeURIComponent(end));
  await expect(page.locator('[data-buy]').first()).toBeEnabled();
  await expect(page.locator('.sn-drops')).toHaveAttribute('data-phase', 'ended', { timeout: 10000 });
  await expect(page.locator('[data-buy]').first()).toBeDisabled();
});
test('sold out, ended and disabled states cannot create purchases', async ({ page }) => {
  for (const query of ['state=live&sold_out=1', 'state=ended', 'state=idle']) {
    await ready(page, query + '&commerce_test=1&items=1');
    expect(await page.locator('[data-buy]:enabled').count()).toBe(0);
  }
});
for (const width of [320, 390, 768, 1440]) {
  test(`layout fits ${width}px without horizontal overflow`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await ready(page, 'state=live&items=3');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
    if (width === 390) await page.screenshot({ path: path.join(output, 'mobile-live.png'), fullPage: true });
  });
}
test('preview, single-product, ended and Arabic layouts render with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [name, query] of [['preview', 'state=preview'], ['single', 'state=live&items=1'], ['ended', 'state=ended'], ['arabic', 'state=live&locale=ar']]) {
    await ready(page, query);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
    expect(await page.locator('.sn-drops__orbit-active').evaluate(el => getComputedStyle(el).animationName)).toBe('none');
    await page.screenshot({ path: path.join(output, `desktop-${name}.png`), fullPage: true });
  }
});
test('AD19 uses real product data, 85% off and a seven-day preview; no accounts or real mail required', async ({ page }) => {
  const sent = []; page.on('request', r => { if (r.method() === 'POST') sent.push(r.url()); });
  await page.goto('/?state=live&items=1');
  await expect(page.locator('[data-card-title]')).toHaveText('SP-AD19');
  await expect(page.locator('[data-price]')).toHaveText('$18.00');
  await expect(page.locator('[data-compare]')).toHaveText('$119.99');
  await expect(page.locator('[data-saving]')).toContainText('85%');
  const config = JSON.parse(await page.locator('[data-drop-config]').textContent());
  expect(Date.parse(config.campaigns[0].endsAt) - Date.parse(config.campaigns[0].startsAt)).toBe(7 * 86400000);
  await page.locator('[data-buy]').click();
  await expect(page.locator('[data-claim-dialog]')).toBeVisible();
  await page.locator('[name=email]').fill('preview@example.com');
  await page.locator('[name=phone]').fill('+1 202 555 0123');
  await page.locator('[data-claim-contact] button').click();
  await expect(page.locator('[data-claim-feedback]')).toContainText('123456');
  await page.locator('[name=code]').fill('000000');
  await page.locator('[data-claim-verify] button[type=submit]').click();
  await expect(page.locator('[data-claim-feedback]')).toContainText('incorrect');
  await page.locator('[name=code]').fill('123456');
  await page.locator('[data-claim-verify] button[type=submit]').click();
  await expect(page.locator('[data-claim-success]')).toBeVisible();
  await expect(page.locator('[data-claim-checkout]')).toBeDisabled();
  expect(sent).toEqual([]);
  await page.screenshot({ path: path.join(output, 'ad19-claim-desktop.png') });
});
test('native guest form handles service errors and verified offers without a login', async ({ page }) => {
  const requests = []; const code = 'MD-' + 'A'.repeat(28);
  await page.route('**/apps/member-drops/request', route => { requests.push(route.request().postDataJSON()); return route.fulfill({ json: { challengeId: 'test-challenge' } }); });
  await page.route('**/apps/member-drops/verify', route => route.request().postDataJSON().code === '123456' ? route.fulfill({ json: { variantId: '101', code, discountPath: `/discount/${code}?redirect=%2Fcheckout`, expiresAt: new Date(Date.now() + 86400000).toISOString() } }) : route.fulfill({ status: 400, json: { error: 'invalid_code' } }));
  await ready(page, 'state=live&commerce_test=1&items=1&native=1&member=0');
  await expect(page.locator('[data-buy]')).toBeEnabled();
  await expect(page.locator('[data-login]')).toBeHidden();
  await page.locator('[data-buy]').click();
  await page.locator('[name=email]').fill('guest@example.com');
  await page.locator('[name=phone]').fill('123');
  await page.locator('[data-claim-contact] button').click();
  await expect(page.locator('[data-claim-feedback]')).toContainText('country code'); expect(requests).toHaveLength(0);
  await page.locator('[name=phone]').fill('+12025550123');
  await page.locator('[data-claim-contact] button').click();
  await page.locator('[name=code]').fill('000000');
  await page.locator('[data-claim-verify] button[type=submit]').click();
  await expect(page.locator('[data-claim-feedback]')).toContainText('incorrect');
  await page.locator('[name=code]').fill('123456');
  await page.locator('[data-claim-verify] button[type=submit]').click();
  await expect(page.locator('[data-claim-checkout]')).toBeEnabled();
  expect(requests[0]).toEqual({ email: 'guest@example.com', phone: '+12025550123', campaign: 'current', variantId: '101' });
});
test('AD19 claim fits a phone and Escape clears contact details', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto('/?state=live');
  await page.screenshot({ path: path.join(output, 'ad19-mobile.png'), fullPage: true });
  await page.locator('[data-buy]').click();
  await page.locator('[name=email]').fill('preview@example.com');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
  await page.screenshot({ path: path.join(output, 'ad19-claim-mobile.png') });
  await page.keyboard.press('Escape'); await expect(page.locator('[data-claim-dialog]')).not.toBeVisible();
  await page.locator('[data-buy]').click(); await expect(page.locator('[name=email]')).toHaveValue('');
});
