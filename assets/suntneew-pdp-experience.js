(() => {
  const initialized = new WeakSet();
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const normalizedType = (value) => {
    const type = (value || '').toLowerCase();
    if (type.includes('video')) return 'video';
    if (type === 'model') return 'model';
    return 'image';
  };

  const formatMoney = (cents, currency) => {
    try {
      return new Intl.NumberFormat(document.documentElement.lang || 'en-US', {
        style: 'currency',
        currency: currency || 'USD'
      }).format(cents / 100);
    } catch (_) {
      return `$${(cents / 100).toFixed(2)}`;
    }
  };

  const setupMediaGallery = (gallery) => {
    if (initialized.has(gallery)) return;
    initialized.add(gallery);

    const modeButtons = [...gallery.querySelectorAll('[data-media-mode]')];
    const thumbnails = () => [...gallery.querySelectorAll('.product-gallery__thumbnail:not([hidden])')];
    const visibleImageThumbnails = () => thumbnails().filter((button) => normalizedType(button.dataset.mediaType) === 'image');
    const interval = Math.max(3, Number(gallery.dataset.autoplayInterval || 6)) * 1000;
    let timer;

    const setActiveMode = (mode) => {
      modeButtons.forEach((button) => button.setAttribute('aria-selected', String(button.dataset.mediaMode === mode)));
      gallery.dataset.activeMediaMode = mode;
    };

    const activeThumb = () => thumbnails().find((button) => button.getAttribute('aria-current') === 'true');

    const stop = () => {
      window.clearTimeout(timer);
      timer = undefined;
    };

    const schedule = () => {
      stop();
      if (reduceMotion || document.hidden || gallery.matches(':hover') || gallery.contains(document.activeElement)) return;

      const images = visibleImageThumbnails();
      if (images.length < 2) return;

      timer = window.setTimeout(() => {
        const current = activeThumb();
        const currentIndex = images.indexOf(current);
        images[(currentIndex + 1 + images.length) % images.length].click();
        schedule();
      }, interval);
    };

    modeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const mode = button.dataset.mediaMode;
        const target = thumbnails().find((thumbnail) => normalizedType(thumbnail.dataset.mediaType) === mode);
        if (target) target.click();
        setActiveMode(mode);
        stop();
      });
    });

    gallery.addEventListener('pointerenter', stop);
    gallery.addEventListener('pointerleave', schedule);
    gallery.addEventListener('focusin', stop);
    gallery.addEventListener('focusout', () => window.setTimeout(schedule, 0));
    document.addEventListener('visibilitychange', schedule);

    const observer = new MutationObserver(() => {
      const current = activeThumb();
      if (current) setActiveMode(normalizedType(current.dataset.mediaType));
    });
    observer.observe(gallery, { subtree: true, attributes: true, attributeFilter: ['aria-current', 'hidden'] });

    const initial = activeThumb();
    if (initial) setActiveMode(normalizedType(initial.dataset.mediaType));
    schedule();
  };

  const setupBundleSelector = (selector) => {
    if (initialized.has(selector)) return;
    initialized.add(selector);

    const form = document.getElementById(selector.dataset.formId);
    const data = selector.querySelector('[data-suntneew-bundle-variants]');
    if (!form || !data) return;

    let variants = [];
    try { variants = JSON.parse(data.textContent); } catch (_) { return; }

    const currency = selector.dataset.currency;
    const quantityInput = () => document.getElementById(`${selector.dataset.formId}-quantity`) || document.querySelector(`[name="quantity"][form="${selector.dataset.formId}"]`);
    const optionButtons = [...selector.querySelectorAll('[data-bundle-quantity]')];
    const customButton = selector.querySelector('[data-bundle-custom]');
    const productInfo = selector.closest('.product-info') || document;
    let currentVariantId;

    const selectedVariant = () => {
      const idInput = form.querySelector('[name="id"]:not([disabled])')
        || form.querySelector('[name="id"]')
        || document.querySelector(`[name="id"][form="${selector.dataset.formId}"]`);
      return variants.find((variant) => String(variant.id) === String(currentVariantId || idInput?.value)) || variants[0];
    };

    const refresh = () => {
      const variant = selectedVariant();
      if (!variant) return;

      const quantityRule = variant.quantity_rule || {};
      const minimum = Number(quantityRule.min || 1);
      const maximum = quantityRule.max == null ? null : Number(quantityRule.max);
      const increment = Number(quantityRule.increment || 1);

      optionButtons.forEach((button) => {
        const quantity = Number(button.dataset.bundleQuantity);
        const original = variant.price * quantity;
        const discount = Number(button.dataset.bundleDiscount || 0) / 100;
        const finalPrice = Math.round(original * (1 - discount));
        const offset = quantity - minimum;
        const available = variant.available !== false
          && offset >= 0
          && (maximum === null || quantity <= maximum)
          && offset % increment === 0;
        button.disabled = !available;
        const price = button.querySelector('[data-bundle-price]');
        const compare = button.querySelector('[data-bundle-compare]');
        if (price) price.textContent = formatMoney(finalPrice, currency);
        if (compare) {
          compare.textContent = formatMoney(original, currency);
          compare.hidden = discount === 0;
        }
      });
    };

    const syncSelection = () => {
      const input = quantityInput();
      const value = Number(input?.value);
      let presetSelected = false;
      optionButtons.forEach((button) => {
        const selected = !button.disabled && Number(button.dataset.bundleQuantity) === value;
        button.classList.toggle('is-selected', selected);
        button.setAttribute('aria-pressed', String(selected));
        if (selected) presetSelected = true;
      });
      if (customButton) {
        customButton.classList.toggle('is-selected', !presetSelected);
        customButton.setAttribute('aria-pressed', String(!presetSelected));
      }
    };

    optionButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const quantity = Number(button.dataset.bundleQuantity);
        const input = quantityInput();
        if (input) {
          input.value = quantity;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    });

    customButton?.addEventListener('click', () => {
      optionButtons.forEach((button) => {
        button.classList.remove('is-selected');
        button.setAttribute('aria-pressed', 'false');
      });
      customButton.classList.add('is-selected');
      customButton.setAttribute('aria-pressed', 'true');
      const input = quantityInput();
      input?.focus();
      input?.select();
    });

    productInfo.addEventListener('input', (event) => {
      if (event.target?.matches?.(`[name="quantity"][form="${selector.dataset.formId}"]`)) syncSelection();
    });
    productInfo.addEventListener('change', (event) => {
      if (event.target?.matches?.(`[name="quantity"][form="${selector.dataset.formId}"]`)) syncSelection();
    });

    form.addEventListener('change', refresh);
    form.addEventListener('variant:change', (event) => {
      currentVariantId = event.detail?.variant?.id;
      refresh();
      syncSelection();
    });
    refresh();
    syncSelection();
  };

  const initialize = (root = document) => {
    root.querySelectorAll?.('[data-suntneew-media-gallery]').forEach(setupMediaGallery);
    root.querySelectorAll?.('[data-suntneew-bundle-selector]').forEach(setupBundleSelector);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initialize());
  } else {
    initialize();
  }

  document.addEventListener('shopify:section:load', (event) => initialize(event.target));
  new MutationObserver((entries) => {
    entries.forEach((entry) => entry.addedNodes.forEach((node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      if (node.matches?.('[data-suntneew-media-gallery], [data-suntneew-bundle-selector]')) initialize(node.parentElement || document);
      initialize(node);
    }));
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
