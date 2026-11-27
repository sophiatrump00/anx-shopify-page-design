(() => {
  'use strict';

  const SESSION_KEY = 'sn_bf_promo_code';
  const DISMISSED_KEY = 'sn_bf_promo_dismissed';
  const ALLOWED_CODES = new Set(['SN10', 'SN175', 'JS10', 'RV20']);
  const JS10_HANDLES = new Set([
    'suntneew-u23-portable-car-jump-starter-8-000mah',
    'suntneew-u32-portable-car-jump-starter-10-000mah',
    'suntneew-kb700-fan-jump-starter-7-200mah',
    'suntneew-a3-jump-starter-16000mah',
    'suntneew-b21ap-5000a-jump-starter-air-compressor',
  ]);
  const RV20_HANDLES = new Set([
    'suntneew-12-8v-100ah-lifepo4-rv-battery-group-24',
    'suntneew-12-8v-230ah-lifepo4-rv-battery',
  ]);
  let autoSyncInFlight = false;
  let lastAutoSyncSignature = '';

  function extractItemHandle(item) {
    const direct = String(item?.handle || '').trim().toLowerCase();
    if (direct) return direct;
    const url = String(item?.url || '');
    const m = url.match(/\/products\/([^/?#]+)/i);
    return m ? m[1].toLowerCase() : '';
  }

  function pickOptimalCartCode(cart) {
    const items = Array.isArray(cart?.items) ? cart.items : [];
    let hasRv20 = false;
    let hasJs10 = false;
    let snQty = 0;

    for (const item of items) {
      const h = extractItemHandle(item);
      const q = Math.max(0, Number(item?.quantity || 0));
      if (RV20_HANDLES.has(h)) {
        hasRv20 = true;
      } else if (JS10_HANDLES.has(h)) {
        hasJs10 = true;
      } else {
        snQty += q;
      }
    }

    if (hasRv20) return 'RV20';
    if (snQty >= 2) return 'SN175';
    if (hasJs10 && snQty === 0) return 'JS10';
    return 'SN10';
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

  function resolveActiveCode(preferredCode) {
    const preferred = String(preferredCode || '').trim().toUpperCase();
    if (ALLOWED_CODES.has(preferred)) {
      return preferred;
    }
    const cartBar = document.querySelector('[data-sn-promo-bar][data-sn-cart-applied-code]');
    const cartApplied = String(cartBar?.dataset.snCartAppliedCode || '').trim().toUpperCase();
    if (ALLOWED_CODES.has(cartApplied)) {
      return cartApplied;
    }
    const saved = safeGetSession(SESSION_KEY).trim().toUpperCase();
    return ALLOWED_CODES.has(saved) ? saved : '';
  }

  function syncAppliedUI(preferredCode = '') {
    const activeCode = resolveActiveCode(preferredCode);
    document.querySelectorAll('[data-sn-promo-apply]').forEach((btn) => {
      const btnCode = String(btn.dataset.snPromoApply || '').trim().toUpperCase();
      const isMatch = Boolean(activeCode && btnCode === activeCode);
      btn.classList.toggle('is-applied', isMatch);
      btn.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
      const cta = btn.querySelector('[data-sn-promo-cta]');
      if (cta) {
        cta.textContent = isMatch ? '✓ Applied' : 'Apply';
      }
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

  async function postDiscountToCart(code) {
    const root = getRoot();
    const cookieReq = fetch(`${root}discount/${encodeURIComponent(code)}`, {
      method: 'GET',
      credentials: 'same-origin',
      keepalive: true,
    }).catch(() => null);

    const cartReq = fetch(`${root}cart/update.js`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ discount: code }),
    })
      .then(async (res) => ({
        ok: res.ok,
        data: res.ok ? await res.json().catch(() => null) : null,
      }))
      .catch(() => ({ ok: false, data: null }));

    const [, cartResult] = await Promise.all([cookieReq, cartReq]);
    return cartResult;
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

    setStatus(bar, `✓ ${code} applied — discount will show automatically at checkout.`);

    if (!cartResult.ok || hasInapplicable || itemCount <= 0) return;

    if (btn.closest('cart-drawer')) {
      btn.dispatchEvent(new CustomEvent('cart:refresh', { bubbles: true }));
      return;
    }

    if (
      window.themeVariables?.settings?.pageType === 'cart' &&
      String(bar?.dataset.snCartAppliedCode || '').trim().toUpperCase() !== code
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

      const targetCode = pickOptimalCartCode(cart);
      const alreadyApplied = existingCodes.some((d) => {
        const c = String(d?.code || '').trim().toUpperCase();
        return c === targetCode && d.applicable !== false;
      });

      const sig = `${itemCount}:${targetCode}`;
      if (alreadyApplied) {
        safeSetSession(SESSION_KEY, targetCode);
        syncAppliedUI(targetCode);
        lastAutoSyncSignature = sig;
        return;
      }

      if (!options.force && lastAutoSyncSignature === sig) return;
      lastAutoSyncSignature = sig;

      const updateResult = await postDiscountToCart(targetCode);
      if (!updateResult || !updateResult.ok) return;

      safeSetSession(SESSION_KEY, targetCode);
      syncAppliedUI(targetCode);

      const drawer = document.getElementById('cart-drawer');
      if (drawer && (drawer.open || options.refreshDrawer)) {
        drawer.dispatchEvent(new CustomEvent('cart:refresh', { bubbles: true }));
      }

      if (window.themeVariables?.settings?.pageType === 'cart') {
        const cartBar = document.querySelector('[data-sn-promo-bar][data-sn-context="cart"]');
        const renderedCode = String(cartBar?.dataset.snCartAppliedCode || '').trim().toUpperCase();
        if (renderedCode !== targetCode) {
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

    const target =
      event.target && event.target.closest ? event.target.closest('[data-sn-promo-apply]') : null;
    if (!target) return;
    applyPromoCode(target);
  });

  document.addEventListener('change', (event) => {
    const t = event.target;
    if (!t) return;
    if (t.name === 'pack' || t.name === 'quantity' || t.id === 'quantity') {
      window.setTimeout(syncPackHint, 20);
    }
  });

  function scheduleSync(checkCart = false) {
    window.setTimeout(() => {
      syncAppliedUI();
      syncPackHint();
      if (checkCart) {
        void ensureOptimalCartDiscount({ refreshDrawer: true });
      }
    }, 80);
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

  document.addEventListener('variant:add', () => scheduleSync(true));
  document.addEventListener('variant:change', () => window.setTimeout(syncPackHint, 20));
  document.addEventListener('cart:refresh', () => scheduleSync(false));
  document.addEventListener('cart:change', () => scheduleSync(true));

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
