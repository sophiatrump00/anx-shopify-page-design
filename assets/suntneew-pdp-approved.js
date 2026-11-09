/* One responsive product page, backed by a single native Shopify product form. */
(() => {
  if (window.suntneewPDPApprovedReady) return;
  window.suntneewPDPApprovedReady = true;

  function initialize(root) {
    if (root.dataset.initialized) return;
    const form = document.getElementById(root.dataset.form);
    const quantity = form?.elements.namedItem('quantity');
    const variantInput = form?.elements.namedItem('id');
    if (!form || !quantity || !variantInput) return;
    let variants;
    try { variants = JSON.parse(root.querySelector('[data-approved-variants]').textContent); }
    catch { variantInput.disabled = true; return; }
    root.dataset.initialized = 'true';
    const signal = new AbortController();
    const on = (element, event, listener, options = {}) => element?.addEventListener(event, listener, { ...options, signal: signal.signal });
    const optionInputs = [...root.querySelectorAll('[data-approved-option]')];
    let variant = variants.find(item => String(item.id) === variantInput.value) || null;
    const money = cents => new Intl.NumberFormat(document.documentElement.lang || 'en-US', { style: 'currency', currency: root.dataset.currency || 'USD' }).format(cents / 100);
    const feedback = root.querySelector('.approved-cart-feedback');
    const cartLink = root.querySelector('.approved-cart-link');
    const sticky = root.querySelector('.sticky-buy');
    const mainPrice = root.querySelector('[data-main-price]');
    const nav = root.querySelector('.product-nav');
    const mainButton = form.querySelector('[type="submit"]');
    const stickyButton = root.querySelector('[data-approved-sticky-add]');
    const purchaseButtons = [mainButton, stickyButton, root.querySelector('[data-suntneew-buy-now]')].filter(Boolean);
    const image = root.querySelector('.main-image');
    const thumbnails = [...root.querySelectorAll('[data-gallery]')];
    let frame;
    let min = 1, step = 1, maxValid = 1;
    const busy = () => form.dataset.purchaseBusy === 'true';
    function label(button, text) {
      if (!button) return;
      // Preserve the theme custom-button's content and loader elements.
      const content = button.querySelector('[data-approved-button-label]') || button.contentElement || button;
      if (content.textContent !== text) content.textContent = text;
    }
    function sync() {
      min = Math.max(1, Number(variant?.min) || 1);
      step = Math.max(1, Number(variant?.step) || 1);
      const max = Math.max(min, Number(variant?.max) || min);
      maxValid = min + Math.floor((max - min) / step) * step;
      Object.assign(quantity, { min: String(min), max: String(maxValid), step: String(step) });
      const raw = Number(quantity.value);
      const count = Math.min(maxValid, Math.max(min, min + Math.round(((Number.isFinite(raw) ? raw : min) - min) / step) * step));
      quantity.value = String(count);
      root.querySelectorAll('[data-approved-price]').forEach(node => { node.textContent = variant ? money(variant.price * count) : root.dataset.unavailableLabel; });
      root.querySelectorAll('[data-approved-compare]').forEach(node => { node.hidden = !variant || variant.compare <= variant.price; node.textContent = variant ? money(variant.compare * count) : ''; });
      root.querySelectorAll('[data-approved-saving]').forEach(node => { node.hidden = !variant || variant.compare <= variant.price; node.textContent = variant ? `Save ${money((variant.compare - variant.price) * count)}` : ''; });
      const note = root.querySelector('[data-approved-price-quantity]');
      if (note) { note.hidden = !variant || count === 1; note.textContent = variant ? `${count} units · ${money(variant.price)} each, before any checkout discounts` : ''; }
      const available = !!variant?.available;
      const disabled = !available || busy();
      purchaseButtons.forEach(button => { button.disabled = disabled; });
      optionInputs.forEach(input => { input.disabled = busy(); });
      root.querySelectorAll('[data-approved-quantity]').forEach(button => { button.disabled = disabled || (Number(button.dataset.approvedQuantity) < 0 ? count <= min : count >= maxValid); });
      quantity.disabled = disabled;
      variantInput.disabled = !available;
      const text = !variant ? root.dataset.unavailableLabel : available ? root.dataset.addLabel : root.dataset.soldOutLabel;
      label(mainButton, text); label(stickyButton, text);
      const stock = root.querySelector('[data-approved-availability]');
      if (stock) { stock.hidden = available; stock.textContent = variant ? root.dataset.soldOutLabel : 'This capacity and color combination is unavailable. Please choose another combination.'; }
      queueLayout();
    }
    function showImage(button) {
      if (!button || button.hidden || !image) return;
      image.src = button.dataset.full;
      image.srcset = button.dataset.srcset || '';
      image.alt = button.dataset.alt || '';
      const visible = thumbnails.filter(item => !item.hidden);
      const index = root.querySelector('[data-gallery-index]');
      if (index) index.textContent = String(visible.indexOf(button) + 1).padStart(2, '0');
      thumbnails.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    }
    function syncGallery() {
      const colourIndex = Number(root.dataset.colourIndex);
      const colour = colourIndex >= 0 ? (variant?.options[colourIndex] || optionInputs[colourIndex]?.value) : '';
      thumbnails.forEach(button => { button.hidden = !!button.dataset.imageColour && button.dataset.imageColour !== colour; });
      const visible = thumbnails.filter(button => !button.hidden);
      const count = root.querySelector('[data-gallery-count]');
      if (count) count.textContent = String(visible.length).padStart(2, '0');
      const selected = visible.find(button => String(variant?.imageId) === button.dataset.imageId) || visible[0];
      showImage(selected);
      const smallImage = sticky?.querySelector('.sticky-product>img');
      if (smallImage && image) { smallImage.src = image.src; smallImage.srcset = image.srcset; }
    }
    function applyVariant(next, updateUrl = false) {
      variant = next;
      if (variant) optionInputs.forEach((input, index) => { input.value = variant.options[index]; });
      // An impossible option combination never inherits a previous variant ID.
      variantInput.value = variant ? String(variant.id) : '';
      form.dataset.variantState = variant ? 'ready' : 'error';
      root.querySelectorAll('[data-variant-match]').forEach(node => { node.hidden = !!node.dataset.variantMatch && (!variant || !variant.title.includes(node.dataset.variantMatch)); });
      const selected = root.querySelector('[data-approved-selected]');
      if (selected && optionInputs.length) selected.textContent = variant?.title || 'Choose your options';
      if (feedback) feedback.hidden = true;
      if (updateUrl) {
        const url = new URL(location.href);
        if (variant) url.searchParams.set('variant', variant.id);
        else url.searchParams.delete('variant');
        history.replaceState(null, '', url);
      }
      syncGallery(); sync();
    }
    optionInputs.forEach(input => on(input, 'change', () => {
      if (busy()) return;
      const options = optionInputs.map(item => item.value);
      applyVariant(variants.find(item => item.options.every((value, index) => value === options[index])) || null, true);
    }));
    thumbnails.forEach(button => on(button, 'click', () => showImage(button)));
    function layout() {
      frame = undefined;
      if (!root.isConnected) return;
      // Keep one visible purchase price when scrolling past the main purchase area.
      if (sticky) sticky.hidden = !variant?.available || mainPrice.getBoundingClientRect().bottom > 0 || !!root.querySelector('dialog[open]');
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
    function reveal(hash, scroll = true) {
      if (!/^#[a-zA-Z][\w-]*$/.test(hash)) return false;
      const target = root.querySelector(hash);
      if (!target) return false;
      const details = target.closest('details');
      if (details) details.open = true;
      if (scroll) target.scrollIntoView({ block: 'start', behavior: 'auto' });
      queueLayout(); return true;
    }
    on(window, 'scroll', queueLayout, { passive: true });
    on(window, 'resize', queueLayout, { passive: true });
    on(window, 'hashchange', () => reveal(location.hash));
    on(window, 'popstate', () => {
      const id = new URL(location.href).searchParams.get('variant');
      if (optionInputs.length && id) {
        const next = variants.find(item => String(item.id) === id) || null;
        if (next) optionInputs.forEach((input, index) => { input.value = next.options[index]; });
        applyVariant(next);
      }
      reveal(location.hash);
    });
    on(root, 'click', event => {
      const link = event.target.closest('a[href^="#"]');
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const hash = link.getAttribute('href');
      if (!reveal(hash)) return;
      event.preventDefault();
      if (location.hash !== hash) history.pushState(null, '', hash);
    });
    on(quantity, 'change', sync);
    root.querySelectorAll('[data-approved-quantity]').forEach(button => on(button, 'click', () => {
      if (busy() || !variant?.available) return;
      quantity.value = String(Number(quantity.value) + Number(button.dataset.approvedQuantity) * step);
      sync(); quantity.dispatchEvent(new Event('change', { bubbles: true }));
    }));
    // The native form and Buy now handler capture FormData before this queued lock.
    on(form, 'submit', () => queueMicrotask(sync));
    on(root.querySelector('[data-suntneew-buy-now]'), 'click', () => queueMicrotask(sync));
    on(form, 'purchase:idle', sync);
    const observer = new MutationObserver(sync);
    observer.observe(form, { attributes: true, attributeFilter: ['data-purchase-busy'] });
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
    root.querySelectorAll('[data-policy]').forEach(button => on(button, 'click', () => openDialog(root.querySelector(`#approved-policy-${button.dataset.policy}`))));
    on(root.querySelector('[data-zoom]'), 'click', () => {
      const dialog = root.querySelector('#approved-image-dialog');
      const full = dialog.querySelector('img'); full.src = image.src; full.alt = image.alt;
      openDialog(dialog);
    });
    root.querySelectorAll('dialog').forEach(dialog => {
      on(dialog.querySelector('[data-approved-close]'), 'click', () => dialog.close());
      on(dialog, 'close', queueLayout);
      on(dialog, 'click', event => {
        const rect = dialog.getBoundingClientRect();
        if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
      });
    });
    on(document, 'shopify:section:unload', event => {
      if (event.target.contains(root)) { signal.abort(); observer.disconnect(); if (frame) cancelAnimationFrame(frame); }
    });
    applyVariant(variant); reveal(location.hash, false); layout();
  }
  const initializeAll = () => document.querySelectorAll('[data-pdp-approved]').forEach(initialize);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeAll, { once: true });
  else initializeAll();
  document.addEventListener('shopify:section:load', initializeAll);
})();
