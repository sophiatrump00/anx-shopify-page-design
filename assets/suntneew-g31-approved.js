/* One live Shopify form serves the approved responsive G31 page. */
(() => {
  if (window.suntneewG31ApprovedReady) return;
  window.suntneewG31ApprovedReady = true;

  function initialize(root) {
    if (root.dataset.initialized) return;
    const form = document.getElementById(root.dataset.form);
    const quantity = form?.elements.namedItem('quantity');
    if (!form || !quantity) return;
    root.dataset.initialized = 'true';
    const signal = new AbortController();
    const on = (element, event, listener, options = {}) => element?.addEventListener(event, listener, { ...options, signal: signal.signal });
    const variantInput = form.elements.namedItem('id');
    const variantsData = root.querySelector('[data-g31-variants]');
    const variants = variantsData ? JSON.parse(variantsData.textContent) : [{ id: variantInput.value, price: Number(root.dataset.unitPrice), compare_at_price: Number(root.dataset.comparePrice), available: root.dataset.available === 'true', pack_size: 1, quantity_rule: { min: quantity.min, max: quantity.max, increment: quantity.step } }];
    const selectedVariant = () => variants.find(variant => String(variant.id) === variantInput.value);
    const money = cents => new Intl.NumberFormat(document.documentElement.lang || 'en-US', { style: 'currency', currency: root.dataset.currency || 'USD' }).format(cents / 100);
    const choices = [...root.querySelectorAll('[data-g31-variant]')];
    const feedback = root.querySelector('.g31-cart-feedback');
    const cartLink = root.querySelector('.g31-cart-link');
    const sticky = root.querySelector('.sticky-buy');
    const mainPrice = root.querySelector('#main-price');
    const nav = root.querySelector('.product-nav');
    const purchaseButtons = [form.querySelector('[type="submit"]'), root.querySelector('[data-g31-sticky-add]'), root.querySelector('[data-suntneew-buy-now]')].filter(Boolean);
    let frame;

    function sync() {
      const variant = selectedVariant();
      const available = variant?.available === true;
      const price = Number(variant?.price || 0);
      const compare = Number(variant?.compare_at_price || 0);
      const min = Math.max(1, Number(variant?.quantity_rule.min) || 1);
      const step = Math.max(1, Number(variant?.quantity_rule.increment) || 1);
      const max = Math.max(min, Number(variant?.quantity_rule.max) || 0);
      const maxValid = min + Math.floor((max - min) / step) * step;
      quantity.min = String(min); quantity.max = String(maxValid); quantity.step = String(step);
      const raw = Number(quantity.value);
      const count = Math.min(maxValid, Math.max(min, min + Math.round(((Number.isFinite(raw) ? raw : min) - min) / step) * step));
      quantity.value = String(count);
      root.querySelectorAll('[data-g31-price]').forEach(node => { node.textContent = money(price * count); });
      root.querySelectorAll('[data-g31-compare]').forEach(node => { node.hidden = compare <= price; node.textContent = money(compare * count); });
      root.querySelectorAll('[data-g31-saving]').forEach(node => { node.hidden = compare <= price; node.textContent = `Save ${money((compare - price) * count)}`; });
      const note = root.querySelector('[data-g31-price-quantity]');
      if (note) {
        note.hidden = count === 1 && !variant?.custom_quantity;
        note.textContent = variant?.custom_quantity ? `${count} batteries · ${money(price)} each, before any checkout discounts` : `${count} × ${variant?.pack_size || 1}-unit pack · ${(variant?.pack_size || 1) * count} batteries`;
      }
      const busy = form.dataset.purchaseBusy === 'true' || ['loading', 'error'].includes(form.dataset.variantState);
      purchaseButtons.forEach(button => { button.disabled = !available || busy; });
      root.querySelectorAll('[data-g31-quantity]').forEach(button => { button.disabled = !available || busy || (Number(button.dataset.g31Quantity) < 0 ? count <= min : count >= maxValid); });
      quantity.disabled = !available || busy;
      choices.forEach(button => {
        const choice = variants.find(item => String(item.id) === button.dataset.g31Variant);
        button.disabled = !choice?.available || busy;
        const selected = button.dataset.g31Variant === variantInput.value;
        button.classList.toggle('is-selected', selected);
        button.setAttribute('aria-pressed', String(selected));
      });
    }
    function layout() {
      frame = undefined;
      if (!root.isConnected) return;
      // Do not show a second price while the main price remains in the viewport.
      sticky.hidden = !selectedVariant()?.available || mainPrice.getBoundingClientRect().bottom > 0 || !!root.querySelector('dialog[open]');
      const shell = getComputedStyle(document.documentElement);
      const pixels = name => parseFloat(shell.getPropertyValue(name)) || 0;
      const reservedHeader = pixels('--header-height') * pixels('--sticky-header-enabled') + pixels('--announcement-bar-height') * pixels('--sticky-announcement-bar-enabled');
      const offset = Math.max((nav?.getBoundingClientRect().bottom || 0) + 30, reservedHeader + (nav?.offsetHeight || 0) + 20);
      let active = root.querySelector('.nav-links a');
      let nearestTop = -Infinity;
      root.querySelectorAll('.nav-links a').forEach(link => {
        const target = root.querySelector(link.getAttribute('href'));
        const top = target?.getBoundingClientRect().top;
        if (top <= offset && top > nearestTop) { active = link; nearestTop = top; }
      });
      root.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.toggle('active', link === active);
        if (link === active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
    function queueLayout() { if (!frame) frame = requestAnimationFrame(layout); }
    on(window, 'scroll', queueLayout, { passive: true });
    on(window, 'resize', queueLayout, { passive: true });
    // Own in-page navigation so the theme's delegated smooth scroll cannot
    // race the native anchor jump or leave the section halfway into view.
    on(root, 'click', event => {
      const link = event.target.closest('a[href^="#"]');
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const hash = link.getAttribute('href');
      if (!/^#[a-zA-Z][\w-]*$/.test(hash)) return;
      const target = root.querySelector(hash);
      if (!target) return;
      event.preventDefault();
      if (location.hash !== hash) history.pushState(null, '', hash);
      target.scrollIntoView({ block: 'start', behavior: 'auto' });
      queueLayout();
    });
    on(quantity, 'change', sync);
    choices.forEach(button => on(button, 'click', () => {
      const previousVariant = selectedVariant();
      variantInput.value = button.dataset.g31Variant;
      quantity.value = String(selectedVariant()?.quantity_rule.min || 1);
      const url = new URL(location.href);
      url.searchParams.set('variant', variantInput.value);
      history.replaceState(null, '', url);
      sync(); layout();
      form.dispatchEvent(new Event('change', { bubbles: true }));
      form.dispatchEvent(new CustomEvent('variant:change', { bubbles: true, detail: { variant: selectedVariant(), previousVariant } }));
      if (selectedVariant()?.custom_quantity) { quantity.focus(); quantity.select(); }
    }));
    root.querySelectorAll('[data-g31-quantity]').forEach(button => on(button, 'click', () => {
      quantity.value = String(Number(quantity.value) + Number(button.dataset.g31Quantity) * (Number(quantity.step) || 1));
      sync();
      quantity.dispatchEvent(new Event('change', { bubbles: true }));
    }));
    // Native form code acquires its lock before this queued synchronization.
    on(form, 'submit', () => queueMicrotask(sync));
    on(root.querySelector('[data-suntneew-buy-now]'), 'click', () => queueMicrotask(sync));
    on(form, 'purchase:idle', sync);
    const observer = new MutationObserver(sync);
    observer.observe(form, { attributes: true, attributeFilter: ['data-purchase-busy', 'data-variant-state'] });
    on(form, 'variant:add', () => {
      if (feedback) { feedback.textContent = 'Added to your cart.'; feedback.hidden = false; }
      if (cartLink) cartLink.hidden = false;
      sync();
    });
    on(form, 'cart:error', event => {
      if (feedback) { feedback.textContent = event.detail?.error || 'Check your cart before trying again.'; feedback.hidden = false; }
      if (cartLink) cartLink.hidden = false;
      sync();
    });

    const image = root.querySelector('.main-image');
    const thumbnails = [...root.querySelectorAll('[data-gallery]')];
    thumbnails.forEach((button, index) => on(button, 'click', () => {
      image.src = button.dataset.full;
      image.srcset = button.dataset.srcset;
      image.alt = button.dataset.alt;
      root.querySelector('#gallery-index').textContent = String(index + 1).padStart(2, '0');
      thumbnails.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    }));
    const tabs = [...root.querySelectorAll('[data-feature]')];
    const selectTab = tab => {
      tabs.forEach(item => {
        const selected = item === tab;
        item.setAttribute('aria-selected', String(selected));
        item.tabIndex = selected ? 0 : -1;
        root.querySelector(`#${item.getAttribute('aria-controls')}`).hidden = !selected;
      });
      queueLayout();
    };
    tabs.forEach((tab, index) => {
      on(tab, 'click', () => selectTab(tab));
      on(tab, 'keydown', event => {
        const target = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 }[event.key];
        if (target === undefined) return;
        event.preventDefault(); selectTab(tabs[target]); tabs[target].focus();
      });
    });
    function openDialog(dialog) {
      if (dialog?.showModal && !dialog.open) { dialog.showModal(); layout(); }
    }
    root.querySelectorAll('[data-policy]').forEach(button => on(button, 'click', () => openDialog(root.querySelector(`#g31-policy-${button.dataset.policy}`))));
    on(root.querySelector('[data-zoom]'), 'click', () => {
      const dialog = root.querySelector('#g31-image-dialog');
      const full = dialog.querySelector('img'); full.src = image.src; full.alt = image.alt;
      openDialog(dialog);
    });
    root.querySelectorAll('dialog').forEach(dialog => {
      on(dialog.querySelector('[data-g31-close]'), 'click', () => dialog.close());
      on(dialog, 'close', queueLayout);
      on(dialog, 'click', event => {
        const rect = dialog.getBoundingClientRect();
        if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
      });
    });
    on(document, 'shopify:section:unload', event => {
      if (event.target.contains(root)) { signal.abort(); observer.disconnect(); if (frame) cancelAnimationFrame(frame); }
    });
    sync(); layout();
  }
  const initializeAll = () => document.querySelectorAll('[data-g31-approved]').forEach(initialize);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeAll, { once: true });
  else initializeAll();
  document.addEventListener('shopify:section:load', initializeAll);
})();
