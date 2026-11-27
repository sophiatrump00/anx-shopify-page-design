(() => {
  'use strict';

  const SESSION_KEY = 'sn_bf_promo_code';
  const DISMISSED_KEY = 'sn_bf_promo_dismissed';
  const ALLOWED_CODES = new Set([
    'SN10',
    'SN175',
    'U23BF',
    'U32BF',
    'KP700BF',
    'A3BF',
    'B21APBF',
    'G24BF',
    '230AHBF',
  ]);
  const DEDICATED_COUPONS = new Map([
    ['suntneew-u23-portable-car-jump-starter-8-000mah', { code: 'U23BF', amount: 6 }],
    ['suntneew-u32-portable-car-jump-starter-10-000mah', { code: 'U32BF', amount: 13 }],
    ['suntneew-kb700-fan-jump-starter-7-200mah', { code: 'KP700BF', amount: 18 }],
    ['suntneew-a3-jump-starter-16000mah', { code: 'A3BF', amount: 46 }],
    ['suntneew-b21ap-5000a-jump-starter-air-compressor', { code: 'B21APBF', amount: 24 }],
    ['suntneew-12-8v-100ah-lifepo4-rv-battery-group-24', { code: 'G24BF', amount: 60 }],
    ['suntneew-12-8v-230ah-lifepo4-rv-battery', { code: '230AHBF', amount: 94 }],
  ]);

  let autoSyncInFlight = false;
  let lastAutoSyncSignature = '';
  let drawerSafetyTimer = 0;

  function extractItemHandle(item) {
    const direct = String(item?.handle || '').trim().toLowerCase();
    if (direct) return direct;
    const url = String(item?.url || '');
    const m = url.match(/\/products\/([^/?#]+)/i);
    return m ? m[1].toLowerCase() : '';
  }

  function pickOptimalCartCode(cart) {
    const items = Array.isArray(cart?.items) ? cart.items : [];
    const dedicatedCodes = [];
    let dedicatedTotal = 0;
    let snQty = 0;

    for (const item of items) {
      const h = extractItemHandle(item);
      const q = Math.max(0, Number(item?.quantity || 0));
      const spec = DEDICATED_COUPONS.get(h);
      if (spec) {
        if (!dedicatedCodes.includes(spec.code)) {
          dedicatedCodes.push(spec.code);
          dedicatedTotal += spec.amount;
        }
      } else {
        snQty += q;
      }
    }

    const legacyCode = snQty >= 2 ? 'SN175' : snQty > 0 ? 'SN10' : '';
    const legacyAmount = snQty >= 2 ? 17.5 : snQty > 0 ? 10 : 0;

    if (dedicatedCodes.length > 0 && dedicatedTotal >= legacyAmount) {
      return dedicatedCodes.join(',');
    }
    if (legacyCode) return legacyCode;
    return 'SN10';
  }

  function parseCodeSet(raw) {
    return new Set(
      String(raw || '')
        .split(',')
        .map((c) => c.trim().toUpperCase())
        .filter((c) => ALLOWED_CODES.has(c))
    );
  }

  function safeGetSession(key) {
    try {
      return window.sessionStorage.getItem(key) || '';
    } catch {
      return '';
    }
  }

  function safeSetSession(key, value) {
    try {
      if (value === '') {
        window.sessionStorage.removeItem(key);
      } else {
        window.sessionStorage.setItem(key, value);
      }
    } catch {
      // Ignore storage failures in restricted contexts.
    }
  }

  function copyCodeSilently(code) {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(code).catch(() => {});
      }
    } catch {
      // Ignore clipboard failures.
    }
  }

  function getRoot() {
    return (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
  }

  function resolveActiveCodeSet(preferredRaw) {
    const fromPreferred = parseCodeSet(preferredRaw);
    if (fromPreferred.size > 0) return fromPreferred;

    const cartBar = document.querySelector('[data-sn-promo-bar][data-sn-cart-applied-code]');
    const fromCartBar = parseCodeSet(cartBar?.dataset.snCartAppliedCode || '');
    if (fromCartBar.size > 0) return fromCartBar;

    return parseCodeSet(safeGetSession(SESSION_KEY));
  }

  function setToggleVisual(btn, isApplied) {
    const code = String(btn.dataset.snCouponToggle || '').trim().toUpperCase();
    const bar = btn.closest('[data-sn-promo-bar]');
    const dollars = String(bar?.dataset.snCouponOff || '').trim();

    btn.classList.toggle('is-applied', isApplied);
    btn.setAttribute('aria-checked', isApplied ? 'true' : 'false');

    const checkEl = btn.querySelector('.sn-coupon-toggle__check');
    if (checkEl) checkEl.textContent = isApplied ? '✓' : '';

    const tagEl = btn.querySelector('[data-sn-coupon-tag]');
    if (tagEl) tagEl.textContent = isApplied ? 'Applied' : 'Coupon';

    const leadEl = btn.querySelector('[data-sn-coupon-lead]');
    if (leadEl && dollars) {
      leadEl.textContent = isApplied ? `$${dollars} coupon applied` : `Apply $${dollars} coupon`;
    }

    const codeDeskEl = btn.querySelector('[data-sn-coupon-code]');
    if (codeDeskEl && code) {
      codeDeskEl.textContent = isApplied ? `(${code})` : code;
    }
  }

  function syncAppliedUI(preferredRaw = '') {
    const activeCodes = resolveActiveCodeSet(preferredRaw);

    document.querySelectorAll('[data-sn-promo-apply]').forEach((btn) => {
      const btnCode = String(btn.dataset.snPromoApply || '').trim().toUpperCase();
      const isMatch = activeCodes.has(btnCode);
      btn.classList.toggle('is-applied', isMatch);
      btn.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
      const cta = btn.querySelector('[data-sn-promo-cta]');
      if (cta) {
        cta.textContent = isMatch ? '✓ Applied' : 'Apply';
      }
    });

    document.querySelectorAll('[data-sn-coupon-toggle]').forEach((btn) => {
      const code = String(btn.dataset.snCouponToggle || '').trim().toUpperCase();
      const isMatch = activeCodes.has(code);
      setToggleVisual(btn, isMatch);
    });
  }

  function setStatus(bar, text) {
    const targets = bar ? [bar] : [...document.querySelectorAll('[data-sn-promo-bar]')];
    targets.forEach((node) => {
      const statusEl = node.querySelector('[data-sn-promo-status]');
      if (!statusEl) return;
      statusEl.textContent = text;
      statusEl.hidden = !text;
    });
  }

  function syncPackHint() {
    const packHints = document.querySelectorAll('[data-sn-pack-hint]');
    if (!packHints.length) return;

    const checkedPack = document.querySelector('#pack-choices input[name="pack"]:checked');
    const packValue = String(
      checkedPack?.value || document.getElementById('chosen-pack')?.textContent || ''
    ).trim();
    const isMultiUnitPack = /\b([2-9]|\d{2,})\s*units?\b/i.test(packValue);

    const qtyInput = document.querySelector('form[action*="/cart/add"] input[name="quantity"], #quantity');
    const qty = Math.max(1, Math.floor(Number(qtyInput?.value || 1)));

    const showHint = isMultiUnitPack && qty < 2;
    packHints.forEach((el) => {
      if (showHint) {
        el.textContent =
          'Pack savings included · Extra $10 OFF (SN10) auto-applies at checkout (SN175 requires cart qty 2+).';
        el.hidden = false;
      } else {
        el.textContent = '';
        el.hidden = true;
      }
    });
  }

  async function postDiscountToCart(codeExpr) {
    const root = getRoot();
    const firstCode = String(codeExpr || '').split(',')[0].trim();
    const cookieReq = firstCode
      ? fetch(`${root}discount/${encodeURIComponent(firstCode)}`, {
          method: 'GET',
          credentials: 'same-origin',
          keepalive: true,
        }).catch(() => null)
      : Promise.resolve(null);

    const cartReq = fetch(`${root}cart/update.js`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ discount: codeExpr }),
    })
      .then(async (res) => ({
        ok: res.ok,
        data: res.ok ? await res.json().catch(() => null) : null,
      }))
      .catch(() => ({ ok: false, data: null }));

    const [, cartResult] = await Promise.all([cookieReq, cartReq]);
    return cartResult;
  }

  function triggerCartDrawerRefresh(expectedCodeExpr = '') {
    document.dispatchEvent(new CustomEvent('cart:refresh', { bubbles: true }));
    if (drawerSafetyTimer) window.clearTimeout(drawerSafetyTimer);
    drawerSafetyTimer = window.setTimeout(() => {
      const drawer = document.getElementById('cart-drawer');
      if (!drawer || !drawer.open) return;
      const rendered = parseCodeSet(
        drawer.querySelector('[data-sn-promo-bar]')?.dataset.snCartAppliedCode || ''
      );
      const expected = parseCodeSet(expectedCodeExpr);
      const synced = [...expected].some((c) => rendered.has(c));
      if (!synced) {
        document.dispatchEvent(new CustomEvent('cart:refresh', { bubbles: true }));
      }
    }, 380);
  }

  async function toggleDedicatedCoupon(btn) {
    const code = String(btn.dataset.snCouponToggle || '').trim().toUpperCase();
    if (!ALLOWED_CODES.has(code)) return;

    const currentlyApplied = btn.getAttribute('aria-checked') === 'true';
    const nextApplied = !currentlyApplied;
    const bar = btn.closest('[data-sn-promo-bar]');

    if (!nextApplied) {
      const remaining = [...parseCodeSet(safeGetSession(SESSION_KEY))].filter((c) => c !== code);
      safeSetSession(SESSION_KEY, remaining.join(','));
      setToggleVisual(btn, false);
      setStatus(bar, '');
      return;
    }

    safeSetSession(DISMISSED_KEY, '');
    copyCodeSilently(code);

    const merged = new Set([...parseCodeSet(safeGetSession(SESSION_KEY)), code]);
    const codeExpr = [...merged].join(',');
    safeSetSession(SESSION_KEY, codeExpr);
    setToggleVisual(btn, true);

    const cartResult = await postDiscountToCart(codeExpr);
    if (cartResult.ok && Number(cartResult.data?.item_count || 0) > 0) {
      triggerCartDrawerRefresh(codeExpr);
    }
    setStatus(bar, '');
  }

  async function applyPromoCode(btn) {
    const code = String(btn.dataset.snPromoApply || '').trim().toUpperCase();
    if (!ALLOWED_CODES.has(code)) return;

    const bar = btn.closest('[data-sn-promo-bar]');

    safeSetSession(DISMISSED_KEY, '');
    copyCodeSilently(code);
    safeSetSession(SESSION_KEY, code);
    syncAppliedUI(code);

    const cartResult = await postDiscountToCart(code);
    const cartData = cartResult && cartResult.data;
    const itemCount = Number(cartData?.item_count || 0);
    const hasInapplicable =
      Array.isArray(cartData?.discount_codes) &&
      cartData.discount_codes.some(
        (d) => String(d.code || '').trim().toUpperCase() === code && d.applicable === false
      );
    const needsMoreItems = code === 'SN175' && itemCount < 2;

    if (needsMoreItems) {
      setStatus(
        bar,
        '✓ SN175 saved — add qty 2+ to cart for $17.50 OFF (single item or 2-pack/4-pack auto-uses $10 OFF SN10 at checkout).'
      );
      return;
    }

    if (bar?.dataset.snPromoGroup !== 'coupon') {
      setStatus(bar, `✓ ${code} applied — discount will show automatically at checkout.`);
    }

    if (!cartResult.ok || hasInapplicable || itemCount <= 0) return;

    if (btn.closest('cart-drawer')) {
      triggerCartDrawerRefresh(code);
      return;
    }

    if (
      window.themeVariables?.settings?.pageType === 'cart' &&
      !parseCodeSet(bar?.dataset.snCartAppliedCode || '').has(code)
    ) {
      window.location.reload();
    }
  }

  async function ensureOptimalCartDiscount(options = {}) {
    if (autoSyncInFlight) return;
    if (!document.querySelector('[data-sn-promo-bar]')) return;
    if (safeGetSession(DISMISSED_KEY) === '1') return;

    autoSyncInFlight = true;
    try {
      const root = getRoot();
      const res = await fetch(`${root}cart.js`, {
        method: 'GET',
        credentials: 'same-origin',
      }).catch(() => null);
      if (!res || !res.ok) return;

      const cart = await res.json().catch(() => null);
      if (!cart) return;

      const itemCount = Number(cart.item_count || 0);
      if (itemCount <= 0) {
        lastAutoSyncSignature = '';
        return;
      }

      const existingCodes = Array.isArray(cart.discount_codes) ? cart.discount_codes : [];
      const hasCustomApplicableCode = existingCodes.some((d) => {
        const c = String(d?.code || '').trim().toUpperCase();
        return Boolean(c && !ALLOWED_CODES.has(c) && d.applicable !== false);
      });
      if (hasCustomApplicableCode) return;

      const targetCodeExpr = pickOptimalCartCode(cart);
      const targetSet = parseCodeSet(targetCodeExpr);
      const existingApplicableSet = new Set(
        existingCodes
          .filter((d) => d && d.applicable !== false)
          .map((d) => String(d.code || '').trim().toUpperCase())
      );

      const allApplied =
        targetSet.size > 0 &&
        [...targetSet].every((c) => existingApplicableSet.has(c)) &&
        existingApplicableSet.size === targetSet.size;

      const sig = `${itemCount}:${targetCodeExpr}`;
      if (allApplied) {
        safeSetSession(SESSION_KEY, targetCodeExpr);
        syncAppliedUI(targetCodeExpr);
        lastAutoSyncSignature = sig;
        return;
      }

      if (!options.force && lastAutoSyncSignature === sig) return;
      lastAutoSyncSignature = sig;

      const updateResult = await postDiscountToCart(targetCodeExpr);
      if (!updateResult || !updateResult.ok) return;

      safeSetSession(SESSION_KEY, targetCodeExpr);
      syncAppliedUI(targetCodeExpr);

      const drawer = document.getElementById('cart-drawer');
      if (drawer && (drawer.open || options.refreshDrawer)) {
        triggerCartDrawerRefresh(targetCodeExpr);
      }

      if (window.themeVariables?.settings?.pageType === 'cart') {
        const cartBar = document.querySelector('[data-sn-promo-bar][data-sn-context="cart"]');
        const rendered = parseCodeSet(cartBar?.dataset.snCartAppliedCode || '');
        const synced = [...targetSet].some((c) => rendered.has(c));
        if (!synced) {
          window.location.reload();
        }
      }
    } finally {
      autoSyncInFlight = false;
    }
  }

  document.addEventListener('click', (event) => {
    const removeBtn =
      event.target && event.target.closest
        ? event.target.closest('cart-discount-remove-button')
        : null;
    if (removeBtn) {
      const removedCode = String(removeBtn.getAttribute('discount-code') || '').trim().toUpperCase();
      if (ALLOWED_CODES.has(removedCode)) {
        safeSetSession(DISMISSED_KEY, '1');
        safeSetSession(SESSION_KEY, '');
      }
      return;
    }

    const toggleBtn =
      event.target && event.target.closest ? event.target.closest('[data-sn-coupon-toggle]') : null;
    if (toggleBtn) {
      void toggleDedicatedCoupon(toggleBtn);
      return;
    }

    const target =
      event.target && event.target.closest ? event.target.closest('[data-sn-promo-apply]') : null;
    if (!target) return;
    void applyPromoCode(target);
  });

  document.addEventListener('change', (event) => {
    const t = event.target;
    if (!t) return;
    if (t.name === 'pack' || t.name === 'quantity' || t.id === 'quantity') {
      window.setTimeout(syncPackHint, 20);
    }
  });

  function scheduleSync(checkCart = false, force = false) {
    window.setTimeout(() => {
      syncAppliedUI();
      syncPackHint();
      if (checkCart) {
        void ensureOptimalCartDiscount({ refreshDrawer: true, force });
      }
    }, 60);
  }

  function init() {
    syncAppliedUI();
    syncPackHint();
    if (window.themeVariables?.settings?.pageType === 'cart') {
      void ensureOptimalCartDiscount();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  document.addEventListener('variant:add', () => scheduleSync(true, true));
  document.addEventListener('variant:change', () => window.setTimeout(syncPackHint, 20));
  document.addEventListener('cart:refresh', () => scheduleSync(false, false));
  document.addEventListener('cart:change', () => scheduleSync(true, true));

  function observeCartDrawer() {
    const drawer = document.getElementById('cart-drawer');
    if (!drawer || typeof MutationObserver !== 'function') return;
    const observer = new MutationObserver(() => {
      syncAppliedUI();
      if (drawer.open) {
        void ensureOptimalCartDiscount({ refreshDrawer: true });
      }
    });
    observer.observe(drawer, { childList: true, attributes: true, attributeFilter: ['open'] });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeCartDrawer, { once: true });
  } else {
    observeCartDrawer();
  }
})();
