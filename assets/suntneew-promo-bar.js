(() => {
  'use strict';

  const SESSION_KEY = 'sn_bf_promo_code';
  const ALLOWED_CODES = new Set(['SN10', 'SN175']);

  function safeGetSession(key) {
    try {
      return window.sessionStorage.getItem(key) || '';
    } catch {
      return '';
    }
  }

  function safeSetSession(key, value) {
    try {
      window.sessionStorage.setItem(key, value);
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

  async function applyPromoCode(btn) {
    const code = String(btn.dataset.snPromoApply || '').trim().toUpperCase();
    if (!ALLOWED_CODES.has(code)) return;

    const bar = btn.closest('[data-sn-promo-bar]');
    const root = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';

    copyCodeSilently(code);
    safeSetSession(SESSION_KEY, code);
    syncAppliedUI(code);

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
        '✓ SN175 saved & copied — add 2+ items to cart to get $17.50 OFF at checkout.'
      );
      return;
    }

    setStatus(bar, `✓ ${code} applied & copied — discount will show automatically at checkout.`);

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

  document.addEventListener('click', (event) => {
    const target = event.target && event.target.closest ? event.target.closest('[data-sn-promo-apply]') : null;
    if (!target) return;
    applyPromoCode(target);
  });

  function scheduleSync() {
    window.setTimeout(() => syncAppliedUI(), 80);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => syncAppliedUI(), { once: true });
  } else {
    syncAppliedUI();
  }

  document.addEventListener('cart:refresh', scheduleSync);
  document.addEventListener('cart:change', scheduleSync);

  function observeCartDrawer() {
    const drawer = document.getElementById('cart-drawer');
    if (!drawer || typeof MutationObserver !== 'function') return;
    const observer = new MutationObserver(() => syncAppliedUI());
    observer.observe(drawer, { childList: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeCartDrawer, { once: true });
  } else {
    observeCartDrawer();
  }
})();
