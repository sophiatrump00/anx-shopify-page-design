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
    'G24U32',
    'RVU32FREE',
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
  const RV_BONUS_BATTERY_HANDLES = new Set([
    'suntneew-12-8v-100ah-lifepo4-rv-battery-group-24',
    'suntneew-12-8v-230ah-lifepo4-rv-battery',
  ]);
  const U32_HANDLE = 'suntneew-u32-portable-car-jump-starter-10-000mah';

  function getRoot() {
    const r = window.Shopify?.routes?.root || '/';
    return r.endsWith('/') ? r : `${r}/`;
  }

  function extractItemHandle(item) {
    const direct = String(item?.handle || '').trim().toLowerCase();
    if (direct) return direct;
    const url = String(item?.url || '');
    const m = url.match(/\/products\/([^/?#]+)/i);
    return m ? m[1].toLowerCase() : '';
  }

  function pickOptimalCartCode(cart) {
    const items = Array.isArray(cart?.items) ? cart.items : [];
    const hasRvBonusBattery = items.some((item) =>
      RV_BONUS_BATTERY_HANDLES.has(extractItemHandle(item))
    );
    const dedicatedCodes = [];
    let dedicatedTotal = 0;
    let snQty = 0;
    let rvSubtotalCents = 0;
    let hasU32 = false;

    for (const item of items) {
      const h = extractItemHandle(item);
      const q = Math.max(0, Number(item?.quantity || 0));
      if (RV_BONUS_BATTERY_HANDLES.has(h)) {
        const lineCents = Number(
          item?.original_line_price ?? Number(item?.original_price ?? item?.price ?? 0) * q
        );
        rvSubtotalCents += Math.max(0, lineCents);
      } else if (h === U32_HANDLE) {
        hasU32 = true;
      }

      const spec = DEDICATED_COUPONS.get(h);
      if (spec) {
        if (hasRvBonusBattery && spec.code === 'U32BF') continue;
        if (!dedicatedCodes.includes(spec.code)) {
          dedicatedCodes.push(spec.code);
          dedicatedTotal += spec.amount;
        }
      } else {
        snQty += q;
      }
    }

    if (hasRvBonusBattery && hasU32) {
      const bonusCode = rvSubtotalCents >= 37500 ? 'RVU32FREE' : 'G24U32';
      if (!dedicatedCodes.includes(bonusCode)) {
        dedicatedCodes.push(bonusCode);
        dedicatedTotal += bonusCode === 'RVU32FREE' ? 47.99 : 18;
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

  function fmt(n) {
    return (
      '$' +
      Number(n).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }

  function initSection(rootEl) {
    if (!rootEl || rootEl.dataset.snBfInit === '1') return;
    rootEl.dataset.snBfInit = '1';

    const configNode = rootEl.querySelector('[data-sn-bf-config]');
    let config = {};
    try {
      config = JSON.parse(configNode?.textContent || '{}');
    } catch {
      config = {};
    }

    const endMs = Date.parse(config.endsAt || '2026-12-01T15:00:00+08:00');
    const variants = config.variants || {};
    const prices = config.prices || {};
    let isEnded = false;

    const toastEl = rootEl.querySelector('[data-sn-bf-toast]');
    let toastTimer = 0;

    function showToast(msg) {
      if (!toastEl) return;
      toastEl.textContent = msg;
      toastEl.classList.add('is-visible');
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => toastEl.classList.remove('is-visible'), 2200);
    }

    function applyEndedState(ended) {
      isEnded = ended;
      const endedBanner = rootEl.querySelector('[data-sn-bf-ended-banner]');
      if (endedBanner) endedBanner.hidden = !ended;
      rootEl.querySelectorAll('[data-sn-bf-atc], [data-sn-bf-bundle]').forEach((btn) => {
        btn.disabled = ended;
        if (ended && btn.hasAttribute('data-sn-bf-atc')) {
          btn.textContent = 'Event Ended';
        }
      });
    }

    function updateCountdown() {
      const nowMs = Date.now();
      const diff = nowMs >= endMs ? 0 : endMs - nowMs;
      const ended = diff === 0;
      if (ended !== isEnded) {
        applyEndedState(ended);
      }

      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      const dEl = rootEl.querySelector('[data-cd="days"]');
      const hEl = rootEl.querySelector('[data-cd="hours"]');
      const mEl = rootEl.querySelector('[data-cd="mins"]');
      const sEl = rootEl.querySelector('[data-cd="secs"]');
      const lblEl = rootEl.querySelector('[data-cd-label]');

      if (dEl) dEl.textContent = String(d).padStart(2, '0');
      if (hEl) hEl.textContent = String(h).padStart(2, '0');
      if (mEl) mEl.textContent = String(m).padStart(2, '0');
      if (sEl) sEl.textContent = String(s).padStart(2, '0');
      if (lblEl) lblEl.textContent = ended ? 'Event Ended (Dec 1, 2026)' : 'Sale Ends In';
    }

    updateCountdown();
    window.setInterval(updateCountdown, 1000);

    // Category filter tabs
    function selectCategory(cat) {
      rootEl.querySelectorAll('[data-sn-bf-cat-tab]').forEach((btn) => {
        const active = btn.dataset.snBfCatTab === cat;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      rootEl.querySelectorAll('[data-sn-bf-card]').forEach((card) => {
        const c = card.dataset.cat;
        const hasCoupon = card.dataset.hasCoupon === 'true';
        let show = true;
        if (cat === 'instant-coupons') show = hasCoupon;
        else if (cat !== 'all') show = c === cat;
        card.hidden = !show;
      });
    }

    rootEl.querySelectorAll('[data-sn-bf-cat-tab]').forEach((btn) => {
      btn.addEventListener('click', () => selectCategory(btn.dataset.snBfCatTab));
    });

    rootEl.querySelectorAll('[data-sn-bf-jump-cat]').forEach((link) => {
      link.addEventListener('click', () => {
        selectCategory(link.dataset.snBfJumpCat);
      });
    });

    // Coupon center tabs
    rootEl.querySelectorAll('[data-sn-bf-ctab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.snBfCtab;
        rootEl.querySelectorAll('[data-sn-bf-ctab]').forEach((b) => {
          const active = b.dataset.snBfCtab === tab;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        rootEl.querySelectorAll('[data-sn-bf-cgrid]').forEach((g) => {
          g.hidden = g.dataset.snBfCgrid !== tab;
        });
      });
    });

    // Pack switcher for G24 and 230Ah
    rootEl.querySelectorAll('[data-sn-bf-pack-btn]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const card = btn.closest('[data-sn-bf-card]');
        if (!card) return;
        const qty = Math.max(1, Number(btn.dataset.qty || 1));
        const key = btn.dataset.key;
        const unitPrice = Number(prices[key]?.price || 0);
        const unitCompare = Number(prices[key]?.compareAt || 0);
        const couponOff = Number(btn.dataset.couponOff || 0);
        const code = btn.dataset.code || '';

        card.querySelectorAll('[data-sn-bf-pack-btn]').forEach((b) => {
          b.classList.toggle('is-active', b === btn);
        });

        const totalDisplay = unitPrice * qty;
        const totalCompare = unitCompare * qty;
        const totalFinal = (unitPrice - couponOff) * qty;

        const nowEl = card.querySelector('[data-pack-now]');
        const wasEl = card.querySelector('[data-pack-was]');
        const gmcEl = card.querySelector('[data-pack-gmc]');
        const codeFinalEl = card.querySelector('[data-pack-code-final]');
        const giftEl = card.querySelector('[data-pack-gift]');
        const atcBtn = card.querySelector('[data-sn-bf-atc]');

        if (nowEl) nowEl.textContent = fmt(totalFinal);
        if (wasEl) wasEl.textContent = fmt(totalCompare);
        if (gmcEl) gmcEl.textContent = `Display price: ${fmt(totalDisplay)} before auto-applied ${code}`;
        if (codeFinalEl) codeFinalEl.textContent = fmt(totalFinal);
        if (giftEl && key === 'g24') {
          giftEl.textContent =
            qty >= 2
              ? 'Unlocks FREE U32 ($47.99 value)'
              : 'U32 for $29.99 (or FREE w/ 2+)';
        }
        if (atcBtn) {
          atcBtn.dataset.qty = String(qty);
          if (!isEnded) {
            atcBtn.textContent = qty > 1 ? `Add ${qty}× to Cart` : 'Add to Cart';
          }
        }
      });
    });

    // Copy code buttons
    rootEl.querySelectorAll('[data-sn-bf-copy]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const code = btn.dataset.snBfCopy;
        if (isEnded) {
          showToast('Black Friday codes expired on Dec 1, 2026');
          return;
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(code).catch(() => {});
        }
        showToast(`Copied code: ${code}`);
      });
    });

    // FAQ accordion
    rootEl.querySelectorAll('[data-sn-bf-faq-btn]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.sn-bf-faq-item');
        if (!item) return;
        const nextOpen = !item.classList.contains('is-open');
        item.classList.toggle('is-open', nextOpen);
        btn.setAttribute('aria-expanded', nextOpen ? 'true' : 'false');
      });
    });

    // Real Shopify Cart Add + Optimal Auto-Applied Coupon + Open Drawer
    async function addItemsAndOpenCart(items, btn) {
      if (isEnded) {
        showToast('Black Friday Sale has ended.');
        return;
      }
      if (!items.length || btn.disabled) return;

      const prevText = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Adding...';

      try {
        try {
          window.sessionStorage.removeItem(DISMISSED_KEY);
        } catch {}

        const root = getRoot();
        const addRes = await fetch(`${root}cart/add.js`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'same-origin',
          body: JSON.stringify({ items }),
        });

        if (!addRes.ok) {
          throw new Error(`Add failed (${addRes.status})`);
        }
        const addData = await addRes.json().catch(() => null);

        const cartRes = await fetch(`${root}cart.js`, {
          method: 'GET',
          credentials: 'same-origin',
        });
        const cart = cartRes.ok ? await cartRes.json().catch(() => null) : null;
        const codeExpr = cart ? pickOptimalCartCode(cart) : '';

        if (codeExpr && ALLOWED_CODES.has(codeExpr.split(',')[0])) {
          try {
            window.sessionStorage.setItem(SESSION_KEY, codeExpr);
          } catch {}

          const isMultiCode = codeExpr.includes(',');
          const firstCode = codeExpr.split(',')[0].trim();
          const cookieReq =
            !isMultiCode && firstCode
              ? fetch(`${root}discount/${encodeURIComponent(firstCode)}`, {
                  method: 'GET',
                  credentials: 'same-origin',
                  keepalive: true,
                }).catch(() => null)
              : Promise.resolve(null);

          const updateReq = fetch(`${root}cart/update.js`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ discount: codeExpr }),
          }).catch(() => null);

          await Promise.all([cookieReq, updateReq]);
        }

        document.dispatchEvent(new CustomEvent('cart:refresh', { bubbles: true }));

        const drawer = document.getElementById('cart-drawer');
        if (drawer) {
          if (typeof drawer.show === 'function') {
            drawer.show();
          } else {
            drawer.setAttribute('open', '');
          }
          window.setTimeout(() => {
            document.dispatchEvent(new CustomEvent('cart:refresh', { bubbles: true }));
          }, 350);
        }

        btn.textContent = '✓ Added';
        window.setTimeout(() => {
          btn.disabled = isEnded;
          btn.textContent = isEnded ? 'Event Ended' : prevText;
        }, 1200);
      } catch {
        btn.disabled = isEnded;
        btn.textContent = prevText;
        showToast('Could not add item to cart. Please try again.');
      }
    }

    rootEl.querySelectorAll('[data-sn-bf-atc]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.snBfAtc;
        const vid = Number(variants[key] || 0);
        const qty = Math.max(1, Number(btn.dataset.qty || 1));
        if (!vid) return;
        void addItemsAndOpenCart([{ id: vid, quantity: qty }], btn);
      });
    });

    rootEl.querySelectorAll('[data-sn-bf-bundle]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const kind = btn.dataset.snBfBundle;
        const u32Vid = Number(variants.u32 || 0);
        const g24Vid = Number(variants.g24 || 0);
        const rv230Vid = Number(variants['230ah'] || 0);
        let items = [];
        if (kind === 'g24-1-u32' && g24Vid && u32Vid) {
          items = [
            { id: g24Vid, quantity: 1 },
            { id: u32Vid, quantity: 1 },
          ];
        } else if (kind === 'g24-2-free' && g24Vid && u32Vid) {
          items = [
            { id: g24Vid, quantity: 2 },
            { id: u32Vid, quantity: 1 },
          ];
        } else if (kind === '230ah-1-free' && rv230Vid && u32Vid) {
          items = [
            { id: rv230Vid, quantity: 1 },
            { id: u32Vid, quantity: 1 },
          ];
        }
        if (items.length) {
          void addItemsAndOpenCart(items, btn);
        }
      });
    });

    // Scroll spy for sticky anchor nav
    const anchorIds = ['flash-sale', 'black-friday-deals', 'rv-bonus', 'coupon-guide'];
    window.addEventListener(
      'scroll',
      () => {
        const y = window.scrollY + 180;
        let current = anchorIds[0];
        for (const id of anchorIds) {
          const el = rootEl.querySelector(`#${id}`);
          if (el && el.offsetTop <= y) current = id;
        }
        rootEl.querySelectorAll('.sn-bf-anchor-link').forEach((a) => {
          a.classList.toggle('is-active', a.dataset.snBfAnchor === current);
        });
      },
      { passive: true }
    );
  }

  function boot() {
    document.querySelectorAll('[data-sn-bf-root]').forEach(initSection);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
