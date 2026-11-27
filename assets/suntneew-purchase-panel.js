(() => {
  if (window.suntneewPurchasePanelReady) return;
  window.suntneewPurchasePanelReady = true;

  const resetFormPurchaseState = (form) => {
    if (!form) return;
    const variantInput = form.elements.namedItem('id');
    const isBlocked = ['loading', 'error'].includes(form.dataset.variantState) || Boolean(variantInput?.disabled);
    const id = form.getAttribute('id');
    const buttons = [
      ...form.querySelectorAll('[data-suntneew-buy-now]'),
      ...(id ? document.querySelectorAll(`[data-suntneew-buy-now][form="${id}"]`) : []),
    ];
    buttons.forEach((btn) => {
      btn.removeAttribute('aria-busy');
      btn.disabled = isBlocked;
    });
    delete form.dataset.purchaseBusy;
    form.dispatchEvent(new CustomEvent('purchase:idle'));
  };

  window.addEventListener('pageshow', () => {
    document.querySelectorAll('form[data-purchase-busy]').forEach(resetFormPurchaseState);
    document.querySelectorAll('[data-suntneew-buy-now][aria-busy="true"]').forEach((btn) => {
      const formId = btn.getAttribute('form');
      resetFormPurchaseState(formId ? document.getElementById(formId) : btn.closest('form'));
    });
  });

  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-suntneew-buy-now]');
    if (!button) return;

    event.preventDefault();

    const formId = button.getAttribute('form');
    const form = formId ? document.getElementById(formId) : button.closest('form');
    if (!form || button.disabled || button.getAttribute('aria-busy') === 'true' || form.dataset.purchaseBusy === 'true' || ['loading', 'error'].includes(form.dataset.variantState)) return;
    const variantInput = form.elements.namedItem('id');
    if (!variantInput?.value || variantInput.disabled) return;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const qtyInput = form.elements.namedItem('quantity');
    const qty = Math.max(1, Math.floor(Number(qtyInput?.value || 1)));
    if (!Number.isFinite(qty) || qty < 1) return;

    button.setAttribute('aria-busy', 'true');
    button.disabled = true;
    form.dataset.purchaseBusy = 'true';

    let fallbackTimer;
    try {
      try {
        window.clarity?.('set', 'buy_now_variant', String(variantInput.value));
        form.dispatchEvent(new CustomEvent('suntneew:buy-now', {
          bubbles: true,
          detail: { variantId: String(variantInput.value), quantity: qty }
        }));
      } catch (_) {}

      await new Promise((resolve) => setTimeout(resolve, 80));
      const rootRoute = window.Shopify?.routes?.root || '/';
      let promoCode = '';
      try {
        const promoBar = document.querySelector('[data-sn-promo-bar]');
        const dismissed = window.sessionStorage?.getItem('sn_bf_promo_dismissed') === '1';
        if (promoBar && !dismissed) {
          const defaultCode = String(promoBar.dataset.snDefaultCode || '').trim().toUpperCase();
          if (defaultCode === 'RV20' || defaultCode === 'JS10') {
            promoCode = defaultCode;
          } else {
            promoCode = qty >= 2 ? 'SN175' : 'SN10';
          }
        }
      } catch (_) {}
      const query = promoCode ? `discount=${encodeURIComponent(promoCode)}` : 'checkout';
      const checkoutUrl = `${rootRoute}cart/${encodeURIComponent(String(variantInput.value))}:${encodeURIComponent(String(qty))}?${query}`;
      fallbackTimer = setTimeout(() => resetFormPurchaseState(form), 3500);
      window.location.assign(checkoutUrl);
    } catch (error) {
      if (fallbackTimer) clearTimeout(fallbackTimer);
      form.dispatchEvent(new CustomEvent('cart:error', {
        bubbles: true,
        detail: { error: 'The checkout could not be opened. Check your cart before trying again.' }
      }));
      resetFormPurchaseState(form);
    }
  });
})();
