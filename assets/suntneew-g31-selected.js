/* G31 preview: merchant-selected artwork, responsive LiTime-style gallery and native pack data. */
(() => {
  'use strict';
  const root = document.querySelector('[data-g31-pdp]');
  if (!root || root.dataset.initialized) return;
  root.dataset.initialized = 'true';
  const $ = id => root.querySelector(`#${id}`);
  const product = JSON.parse(root.querySelector('[data-g31-product]').textContent);
  const selection = JSON.parse(root.querySelector('[data-g31-assets]').textContent);
  const originalGalleryFirst = { ...selection.gallery_assets[0] };
  const form = document.getElementById(root.dataset.form);
  const money = cents => new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency || 'USD' }).format(Number(cents || 0) / 100);
  const params = new URLSearchParams(location.search);
  const packVariants = product.variants.filter(variant => variant.pack !== 'Any quantity');
  let selected = packVariants.find(variant => String(variant.id) === (params.get('variant') || String(product.selectedId))) || packVariants[0];
  let count = 1;
  let pairCleanups = [];
  let galleryController;
  let zoomRows = [];
  let zoomIndex = 0;
  let zoomIsGallery = false;
  let focusReturn;
  const existingButtons = new Map();

  const paragraph = (text, className) => {
    const node = document.createElement('p');
    node.textContent = text;
    if (className) node.className = className;
    return node;
  };

  function picture(asset, eager = false) {
    const existing = existingButtons.get(asset.id);
    if (existing) {
      const module = existing.closest('.image-module') || document.createElement('div');
      module.className = 'image-module';
      if (existing.parentElement !== module) module.append(existing);
      const image = existing.querySelector('img');
      if (image) image.dataset.imageId = asset.id;
      if (!existing.dataset.zoomBound) {
        existing.dataset.zoomBound = 'true';
        existing.addEventListener('click', () => openZoom(asset, existing));
      }
      return module;
    }
    const module = document.createElement('div');
    module.className = 'image-module';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'image-button';
    button.dataset.imageId = asset.id;
    button.setAttribute('aria-label', `Enlarge ${asset.purpose} image`);
    const image = document.createElement('img');
    image.dataset.imageId = asset.id;
    image.src = asset.src;
    image.width = asset.width;
    image.height = asset.height;
    image.alt = `SuntNeew G31 - ${asset.purpose}`;
    image.loading = eager ? 'eager' : 'lazy';
    image.decoding = 'async';
    image.draggable = false;
    if (eager) image.fetchPriority = 'high';
    const zoom = document.createElement('span');
    zoom.className = 'zoom-label';
    zoom.setAttribute('aria-hidden', 'true');
    button.append(image, zoom);
    button.dataset.zoomBound = 'true';
    button.addEventListener('click', () => openZoom(asset, button));
    module.append(button);
    return module;
  }

  function makePair(config, assets, isGallery = false) {
    const wrapper = document.createElement('div');
    wrapper.className = `feature-pair${isGallery ? ' gallery-pair' : ''}`;
    const tabs = document.createElement('div');
    tabs.className = `pair-tabs${isGallery ? ' gallery-thumbnails' : ''}`;
    tabs.setAttribute('aria-label', isGallery ? 'Product image thumbnails' : 'Choose a feature');
    const track = document.createElement('div');
    track.className = 'pair-track';
    track.id = `pair-${config.group}`;
    track.tabIndex = 0;
    track.setAttribute('role', 'region');
    track.setAttribute('aria-label', config.labels.join(' and '));
    const controls = document.createElement('div');
    controls.className = 'pair-controls';
    const hint = paragraph('', 'pair-hint');
    const desktopHint = document.createElement('span');
    desktopHint.className = 'pair-hint-desktop';
    desktopHint.textContent = 'Drag to explore';
    const mobileHint = document.createElement('span');
    mobileHint.className = 'pair-hint-mobile';
    mobileHint.textContent = 'Swipe to explore';
    hint.append(desktopHint, mobileHint);
    const counter = document.createElement('span');
    counter.className = 'pair-counter';
    counter.setAttribute('aria-live', 'polite');
    const arrows = document.createElement('div');
    arrows.className = 'pair-arrows';
    const previous = document.createElement('button');
    previous.type = 'button';
    previous.textContent = '\u2190';
    previous.setAttribute('aria-label', isGallery ? 'Previous product image' : 'Previous feature');
    previous.setAttribute('aria-controls', track.id);
    const next = document.createElement('button');
    next.type = 'button';
    next.textContent = '\u2192';
    next.setAttribute('aria-label', isGallery ? 'Next product image' : 'Next feature');
    next.setAttribute('aria-controls', track.id);
    arrows.append(previous, next);
    controls.append(hint, counter, arrows);
    const caption = paragraph('', 'gallery-current');
    const cards = [];
    const tabButtons = [];
    let active = -1;
    let raf;

    assets.forEach((asset, index) => {
      const card = document.createElement('article');
      card.className = 'feature-card';
      card.id = `feature-${config.group}-${asset.option}`;
      card.append(picture(asset, isGallery && index === 0));
      cards.push(card);
      track.append(card);
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.setAttribute('aria-controls', card.id);
      if (isGallery) {
        tab.setAttribute('aria-label', `Show image ${index + 1}: ${asset.purpose}`);
        tab.title = asset.purpose;
        const thumb = document.createElement('img');
        thumb.src = asset.thumb_src;
        thumb.alt = '';
        thumb.width = 88;
        thumb.height = 88;
        thumb.loading = 'lazy';
        thumb.decoding = 'async';
        thumb.draggable = false;
        tab.append(thumb);
      } else {
        tab.textContent = asset.purpose;
      }
      tabButtons.push(tab);
      tabs.append(tab);
    });

    let cachedStep = 0;
    const measureStep = () => {
      if (cards.length > 1) {
        const delta = cards[1].getBoundingClientRect().left - cards[0].getBoundingClientRect().left;
        if (delta > 0) cachedStep = delta;
      }
      return cachedStep || 1;
    };
    const go = index => {
      const target = Math.max(0, Math.min(cards.length - 1, index));
      const stepWidth = cachedStep || measureStep();
      const left = cards.length > 1 && cachedStep > 0
        ? target * stepWidth
        : (cards[target]?.getBoundingClientRect().left || 0) - (cards[0]?.getBoundingClientRect().left || 0);
      track.scrollTo({ left, behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    };
    const update = index => {
      const value = Math.max(0, Math.min(cards.length - 1, index));
      if (value === active) return;
      active = value;
      tabButtons.forEach((tab, i) => tab.setAttribute('aria-pressed', String(i === active)));
      counter.textContent = `${active + 1} / ${cards.length}`;
      previous.disabled = active === 0;
      next.disabled = active === cards.length - 1;
      if (isGallery) {
        caption.textContent = assets[active].purpose;
        tabs.scrollTo({ left: Math.max(0, tabButtons[active].offsetLeft - tabs.clientWidth / 2 + tabButtons[active].clientWidth / 2), behavior: 'smooth' });
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const step = cachedStep || measureStep();
        update(Math.round(track.scrollLeft / Math.max(step, 1)));
      });
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    tabButtons.forEach((tab, index) => tab.addEventListener('click', () => go(index)));
    previous.addEventListener('click', () => go(active - 1));
    next.addEventListener('click', () => go(active + 1));
    track.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      go(event.key === 'Home' ? 0 : event.key === 'End' ? cards.length - 1 : active + (event.key === 'ArrowRight' ? 1 : -1));
    });
    let drag;
    let suppressClick = false;
    track.addEventListener('pointerdown', event => {
      suppressClick = false;
      if (event.pointerType === 'mouse' && event.button === 0) drag = { id: event.pointerId, x: event.clientX, left: track.scrollLeft, moved: false };
    });
    track.addEventListener('pointermove', event => {
      if (!drag || drag.id !== event.pointerId) return;
      const distance = event.clientX - drag.x;
      if (!drag.moved && Math.abs(distance) > 7) {
        drag.moved = true;
        track.setPointerCapture(event.pointerId);
        track.classList.add('is-dragging');
      }
      if (drag.moved) {
        event.preventDefault();
        track.scrollLeft = drag.left - distance;
      }
    });
    const finishDrag = event => {
      if (!drag || drag.id !== event.pointerId) return;
      const moved = drag.moved;
      const distance = track.scrollLeft - drag.left;
      const step = cachedStep || measureStep();
      const index = Math.abs(distance) > Math.min(60, step * .15) ? Math.round(drag.left / step) + Math.sign(distance) : Math.round(track.scrollLeft / step);
      drag = undefined;
      if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
      track.classList.remove('is-dragging');
      if (moved) { suppressClick = true; go(index); }
    };
    track.addEventListener('pointerup', finishDrag);
    track.addEventListener('pointercancel', finishDrag);
    track.addEventListener('click', event => {
      if (suppressClick) { event.preventDefault(); event.stopPropagation(); suppressClick = false; }
    }, true);
    const resize = new ResizeObserver(() => { cachedStep = 0; measureStep(); onScroll(); });
    resize.observe(track);
    pairCleanups.push(() => { resize.disconnect(); cancelAnimationFrame(raf); track.removeEventListener('scroll', onScroll); });
    update(0);
    if (isGallery) {
      galleryController = {
        go,
        focusAt: index => cards[index]?.querySelector('.image-button')?.focus({ preventScroll: true }),
        refreshFirst: () => {
          const asset = assets[0];
          const button = cards[0]?.querySelector('.image-button');
          const image = button?.querySelector('img');
          const thumb = tabButtons[0]?.querySelector('img');
          if (image) {
            image.src = asset.src;
            image.alt = `SuntNeew G31 - ${asset.purpose}`;
          }
          button?.setAttribute('aria-label', `Enlarge ${asset.purpose} image`);
          if (thumb) thumb.src = asset.thumb_src;
          tabButtons[0]?.setAttribute('aria-label', `Show image 1: ${asset.purpose}`);
          if (tabButtons[0]) tabButtons[0].title = asset.purpose;
          track.setAttribute('aria-label', assets.map(row => row.purpose).join(' and '));
          if (active === 0) caption.textContent = asset.purpose;
          go(0);
        },
      };
      wrapper.append(track, caption, controls, tabs);
    } else {
      wrapper.append(tabs, track, controls);
    }
    return wrapper;
  }

  function renderImages() {
    root.querySelectorAll('#gallery-content .image-button[data-image-id], #feature-content .image-button[data-image-id]').forEach(btn => {
      if (!existingButtons.has(btn.dataset.imageId)) existingButtons.set(btn.dataset.imageId, btn);
    });
    pairCleanups.forEach(cleanup => cleanup());
    pairCleanups = [];
    const galleryRows = selection.gallery_assets;
    $('gallery-content').replaceChildren(makePair({ group: 'gallery', labels: galleryRows.map(row => row.purpose) }, galleryRows, true));
    const casesBand = $('g31-cases');
    const output = document.createDocumentFragment();
    for (const config of selection.config) {
      const rows = selection.assets.filter(asset => asset.group === config.group);
      const section = document.createElement('section');
      section.className = config.kind === 'opening' ? 'feature-opening' : 'feature-section';
      section.dataset.group = config.group;
      section.id = `feature-${config.group}`;
      if (config.kind !== 'opening') {
        const heading = document.createElement('div');
        heading.className = 'section-heading';
        const title = document.createElement('h2');
        title.textContent = config.heading;
        heading.append(paragraph(config.eyebrow, 'eyebrow'), title, paragraph(config.body));
        section.append(heading);
      }
      if (config.kind === 'pair') section.append(makePair({ ...config, labels: rows.map(row => row.purpose) }, rows));
      else rows.forEach(row => section.append(picture(row)));
      if (config.note) section.append(paragraph(config.note, 'support-text'));
      output.append(section);
      if (config.group === '04' && casesBand) output.append(casesBand);
    }
    $('feature-content').replaceChildren(output);
  }

  function openZoom(asset, trigger) {
    focusReturn = trigger;
    zoomIsGallery = asset.group === 'gallery';
    zoomRows = zoomIsGallery ? selection.gallery_assets : [asset];
    zoomIndex = Math.max(0, zoomRows.findIndex(row => row.asset_id === asset.asset_id));
    $('image-dialog').classList.add('gallery-lightbox');
    root.querySelector('.zoom-gallery-controls').hidden = false;
    $('zoom-previous').hidden = !zoomIsGallery;
    $('zoom-next').hidden = !zoomIsGallery;
    $('zoom-counter').hidden = !zoomIsGallery;
    showZoom(zoomIndex);
    $('image-dialog').showModal();
    updateSticky();
  }
  function showZoom(index) {
    zoomIndex = Math.max(0, Math.min(zoomRows.length - 1, index));
    const asset = zoomRows[zoomIndex];
    const image = $('zoom-image');
    image.src = asset.zoom_src;
    image.alt = `SuntNeew G31 - ${asset.purpose}`;
    image.dataset.imageId = asset.id;
    image.removeAttribute('width');
    image.removeAttribute('height');
    $('image-title').textContent = asset.purpose;
    $('zoom-counter').textContent = `${zoomIndex + 1} / ${zoomRows.length}`;
    $('zoom-previous').disabled = zoomIndex === 0;
    $('zoom-next').disabled = zoomIndex === zoomRows.length - 1;
    $('image-dialog').classList.remove('is-zoomed');
    $('zoom-size').textContent = '+';
    $('zoom-size').setAttribute('aria-pressed', 'false');
    root.querySelector('.zoom-scroll').scrollTo({ left: 0, top: 0, behavior: 'instant' });
    if (zoomIsGallery) galleryController?.go(zoomIndex);
  }
  $('zoom-previous').addEventListener('click', () => showZoom(zoomIndex - 1));
  $('zoom-next').addEventListener('click', () => showZoom(zoomIndex + 1));
  $('zoom-size').addEventListener('click', () => {
    const expanded = $('image-dialog').classList.toggle('is-zoomed');
    $('zoom-size').textContent = expanded ? '-' : '+';
    $('zoom-size').setAttribute('aria-pressed', String(expanded));
    $('zoom-size').setAttribute('aria-label', expanded ? 'Fit image to screen' : 'View at original size');
  });
  $('image-dialog').addEventListener('keydown', event => {
    if (!zoomIsGallery || $('image-dialog').classList.contains('is-zoomed')) return;
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    showZoom(event.key === 'Home' ? 0 : event.key === 'End' ? zoomRows.length - 1 : zoomIndex + (event.key === 'ArrowRight' ? 1 : -1));
  });
  let zoomDrag;
  const zoomScroller = root.querySelector('.zoom-scroll');
  zoomScroller.addEventListener('pointerdown', event => {
    if (zoomIsGallery && !$('image-dialog').classList.contains('is-zoomed') && event.button === 0) zoomDrag = { id: event.pointerId, x: event.clientX, y: event.clientY };
  });
  zoomScroller.addEventListener('pointerup', event => {
    if (!zoomDrag || zoomDrag.id !== event.pointerId) return;
    const dx = event.clientX - zoomDrag.x, dy = event.clientY - zoomDrag.y;
    zoomDrag = undefined;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.2) showZoom(zoomIndex + (dx < 0 ? 1 : -1));
  });
  zoomScroller.addEventListener('pointercancel', () => { zoomDrag = undefined; });
  $('image-dialog').querySelector('[data-close]').addEventListener('click', () => $('image-dialog').close());
  $('image-dialog').addEventListener('close', () => {
    $('image-dialog').classList.remove('gallery-lightbox', 'is-zoomed');
    zoomDrag = undefined;
    if (zoomIsGallery) galleryController?.focusAt(zoomIndex); else focusReturn?.focus({ preventScroll: true });
    updateSticky();
  });

  const packSize = variant => variant.pack === 'Any quantity' ? 1 : Math.max(1, Number.parseInt(variant.pack, 10) || 1);
  function updateGalleryImage() {
    const asset = selection.gallery_assets[0];
    if (!asset) return;
    const image = packSize(selected) > 1 ? selected.image : null;
    Object.assign(asset, originalGalleryFirst, image?.src ? {
      src: image.src,
      zoom_src: image.zoom_src || image.src,
      thumb_src: image.thumb_src || image.src,
      purpose: `Group 31 battery - ${selected.pack}`,
    } : {});
    galleryController?.refreshFirst();
  }
  const minimumFor = variant => Math.max(variant?.pack === 'Any quantity' ? 5 : 1, Number(variant?.min) || 1);
  const isAvailable = () => selected?.available === true && Number(selected.max) >= minimumFor(selected);
  const isBusy = () => form?.dataset.purchaseBusy === 'true' || ['loading', 'error'].includes(form?.dataset.variantState);
  const buyNowButtons = [...root.querySelectorAll('[data-suntneew-buy-now]')];
  let stickyFeedbackTimer;
  function updateSticky() {
    const price = $('total-price').getBoundingClientRect();
    const nav = root.querySelector('.product-nav')?.getBoundingClientRect();
    const priceVisible = price.bottom > (nav && nav.top < innerHeight ? nav.bottom : 0) && price.top < innerHeight;
    $('sticky-buy').hidden = priceVisible || price.top >= innerHeight || !!root.querySelector('dialog[open]');
  }
  function updatePrice() {
    const minimum = minimumFor(selected);
    const increment = Math.max(1, Number(selected?.step) || 1);
    const maximum = Math.max(minimum, Number(selected?.max) || minimum);
    const maxValid = minimum + Math.floor((maximum - minimum) / increment) * increment;
    count = Math.min(maxValid, Math.max(minimum, minimum + Math.round(((Number.isFinite(count) ? count : minimum) - minimum) / increment) * increment));
    const size = packSize(selected);
    const onSale = Number(selected?.compareAtCents) > Number(selected?.priceCents);
    const available = isAvailable();
    $('quantity').setCustomValidity('');
    $('quantity').value = String(count);
    $('quantity').min = String(minimum); $('quantity').max = String(maxValid); $('quantity').step = String(increment); $('quantity').disabled = !available || isBusy();
    $('selected-variant').value = selected?.id || '';
    $('selected-variant').disabled = !available;
    $('total-price').textContent = money(Number(selected?.priceCents || 0) * count);
    $('compare-price').hidden = !onSale; $('compare-price').textContent = onSale ? money(Number(selected.compareAtCents) * count) : '';
    $('total-saving').hidden = !onSale; $('total-saving').textContent = onSale ? `You save ${money((selected.compareAtCents - selected.priceCents) * count)} in total vs. regular price` : '';
    $('quantity-label').textContent = size > 1 ? 'Number of packs' : 'Number of units';
    $('quantity-summary').textContent = size > 1 ? `${count} x ${size}-unit ${count === 1 ? 'pack' : 'packs'} - ${size * count} batteries in total` : `${count} ${count === 1 ? 'battery' : 'batteries'} - ${money(selected.priceCents)} per battery${selected.pack === 'Any quantity' ? ` · Minimum ${minimum} batteries` : ''}`;
    $('quantity-minus').disabled = !available || isBusy() || count <= minimum;
    $('quantity-plus').disabled = !available || isBusy() || count >= maxValid;
    $('purchase-button').disabled = !available || isBusy();
    $('purchase-label').textContent = available ? 'Add to cart' : 'Sold out';
    if ($('sticky-purchase-button')) $('sticky-purchase-button').disabled = !available || isBusy();
    if ($('sticky-purchase-label')) $('sticky-purchase-label').textContent = available ? 'Add to cart' : 'Sold out';
    buyNowButtons.forEach(button => { button.disabled = !available || isBusy(); });
    $('stock-status').hidden = available; $('stock-status').textContent = 'This pack is currently sold out.';
    $('sticky-total').textContent = $('total-price').textContent; $('sticky-options').textContent = count > 1 ? `${selected.pack} × ${count}` : selected.pack;
    $('box-quantity-note').textContent = size * count > 1 ? `Contents shown per battery. Your selection contains ${size * count} batteries.` : 'Package contents listed per battery.';
    $('chosen-pack').textContent = selected.pack;
    root.querySelectorAll('#pack-choices input').forEach(input => { input.checked = input.dataset.variantId === String(selected.id); input.disabled = isBusy(); });
    const url = new URL(location.href); url.searchParams.set('variant', selected.id); history.replaceState(null, '', url);
    updateSticky();
  }
  function renderPacks() {
    const fragment = document.createDocumentFragment();
    const singleVariant = packVariants.find(variant => packSize(variant) === 1) || packVariants[0];
    const singleUnitCents = singleVariant ? Number(singleVariant.priceCents) / packSize(singleVariant) : 0;
    packVariants.forEach(variant => {
      const label = document.createElement('label');
      label.className = 'sn-pack-choice'; label.classList.toggle('is-disabled', !variant.available || Number(variant.max) < minimumFor(variant));
      const input = document.createElement('input');
      input.type = 'radio'; input.name = 'pack'; input.value = variant.pack; input.dataset.variantId = variant.id; input.dataset.sku = variant.sku;
      const card = document.createElement('span'); card.className = 'sn-pack-choice__body';
      const title = document.createElement('strong'); title.textContent = variant.pack; card.append(title);
      const prices = document.createElement('span'); prices.className = 'sn-pack-prices';
      const size = packSize(variant);
      const price = document.createElement('span'); price.className = 'sn-pack-prices__price'; price.append(document.createTextNode(money(variant.priceCents / size))); const unit = document.createElement('small'); unit.textContent = ' / unit'; price.append(unit); prices.append(price);
      card.append(prices);
      const bundleSavingCents = size > 1 && singleUnitCents > 0 ? Math.max(0, Math.round(singleUnitCents * size - Number(variant.priceCents))) : 0;
      if (bundleSavingCents >= 100) {
        const badge = document.createElement('span');
        badge.className = 'sn-pack-badge';
        badge.textContent = `Save ${money(bundleSavingCents)}`;
        card.append(badge);
      }
      const sceneMap = { 1: '12V RV / Trailer', 2: '24V / 200Ah Bank', 4: '48V / 400Ah Bank' };
      const sceneText = sceneMap[size];
      if (sceneText) {
        const scene = document.createElement('span');
        scene.className = 'sn-pack-scene';
        scene.textContent = sceneText;
        card.append(scene);
      }
      if (!variant.available || Number(variant.max) < minimumFor(variant)) { const sold = document.createElement('small'); sold.textContent = 'Sold out'; card.append(sold); }
      input.addEventListener('change', () => {
        if (isBusy()) return;
        const previousVariant = selected;
        selected = variant; count = 1; updatePrice(); updateGalleryImage();
        form.dispatchEvent(new CustomEvent('variant:change', { bubbles: true, detail: { variant: { id: selected.id, available: selected.available, price: selected.priceCents }, previousVariant } }));
      });
      label.append(input, card); fragment.append(label);
    });
    $('pack-choices').replaceChildren(fragment);
  }
  const changeQuantity = delta => { if (!isAvailable() || isBusy()) return; count = Number($('quantity').value) + delta * Math.max(1, Number(selected.step) || 1); updatePrice(); };
  $('quantity-minus').addEventListener('click', () => changeQuantity(-1));
  $('quantity-plus').addEventListener('click', () => changeQuantity(1));
  $('quantity').addEventListener('input', () => {
    const input = $('quantity');
    input.setCustomValidity('');
    if (input.checkValidity() && input.value !== '') {
      count = Number(input.value); updatePrice(); return;
    }
    input.setCustomValidity(`Enter a whole number from ${input.min} to ${input.max}.`);
    $('purchase-button').disabled = true;
    if ($('sticky-purchase-button')) $('sticky-purchase-button').disabled = true;
    buyNowButtons.forEach(button => { button.disabled = true; });
    $('quantity-summary').textContent = selected.pack === 'Any quantity' ? `Minimum ${minimumFor(selected)} batteries at ${money(selected.priceCents)} each.` : `Enter a whole number from ${input.min} to ${input.max}.`;
  });
  const normalizeQuantity = () => { count = Number($('quantity').value); updatePrice(); };
  $('quantity').addEventListener('change', normalizeQuantity);
  $('quantity').addEventListener('blur', normalizeQuantity);
  const validateQuantity = event => {
    if (!$('quantity').checkValidity() || $('quantity').value === '') {
      event.preventDefault(); event.stopImmediatePropagation(); $('quantity').reportValidity();
    }
  };
  form.addEventListener('submit', validateQuantity, true);
  buyNowButtons.forEach(button => {
    button.addEventListener('click', validateQuantity, true);
    button.addEventListener('click', () => queueMicrotask(updatePrice));
  });
  form.addEventListener('submit', () => queueMicrotask(updatePrice));
  form.addEventListener('purchase:idle', updatePrice);
  new MutationObserver(updatePrice).observe(form, { attributes: true, attributeFilter: ['data-purchase-busy', 'data-variant-state'] });
  form.addEventListener('variant:add', () => {
    const message = root.querySelector('.cart-feedback');
    message.textContent = 'Added to your cart.'; message.hidden = false;
    root.querySelector('.cart-feedback-link').hidden = false;
    const checkoutLink = root.querySelector('.cart-checkout-link');
    if (checkoutLink) checkoutLink.hidden = false;
    const stickyCheckout = root.querySelector('.sticky-checkout-link');
    if (stickyCheckout) stickyCheckout.hidden = false;
    const stickyMessage = $('sticky-feedback');
    if (stickyMessage) {
      stickyMessage.textContent = 'Added to your cart.'; stickyMessage.hidden = false;
      clearTimeout(stickyFeedbackTimer);
      stickyFeedbackTimer = setTimeout(() => { stickyMessage.hidden = true; }, 4000);
    }
    try {
      const drawer = document.getElementById('cart-drawer');
      if (drawer && typeof drawer.show === 'function' && !drawer.open) drawer.show();
    } catch (_) {}
    updatePrice();
  });
  form.addEventListener('cart:error', event => {
    const errorText = event.detail?.error || 'Check your cart before trying again.';
    const message = root.querySelector('.cart-feedback');
    message.textContent = errorText; message.hidden = false;
    root.querySelector('.cart-feedback-link').hidden = false;
    const checkoutLink = root.querySelector('.cart-checkout-link');
    if (checkoutLink) checkoutLink.hidden = true;
    const stickyCheckout = root.querySelector('.sticky-checkout-link');
    if (stickyCheckout) stickyCheckout.hidden = true;
    const stickyMessage = $('sticky-feedback');
    if (stickyMessage) {
      clearTimeout(stickyFeedbackTimer);
      stickyMessage.textContent = errorText; stickyMessage.hidden = false;
    }
    updatePrice();
  });

  const assurances = $('purchase-assurances');
  const desktopSlot = $('gallery-assurances-slot');
  const mobileSlot = $('mobile-assurances-slot');
  const frame = root.querySelector('.preview-frame');
  function moveAssurances() {
    const desktop = frame.clientWidth >= 1000;
    const slot = desktop ? desktopSlot : mobileSlot;
    if (assurances.parentElement !== slot) slot.append(assurances);
    frame.classList.toggle('is-desktop-layout', desktop);
    if (desktop) requestAnimationFrame(() => {
      const pair = root.querySelector('.gallery-pair');
      if (pair) frame.style.setProperty('--gallery-chrome-height', `${Math.ceil(root.querySelector('.product-gallery').getBoundingClientRect().height - pair.getBoundingClientRect().height)}px`);
    });
  }
  new ResizeObserver(moveAssurances).observe(frame);
  moveAssurances();
  assurances.querySelectorAll('details').forEach(details => {
    details.addEventListener('toggle', () => { if (details.open) assurances.querySelectorAll('details[open]').forEach(other => { if (other !== details) other.open = false; }); });
    details.querySelector('.assurance-close').addEventListener('click', () => { details.open = false; details.querySelector('summary').focus({ preventScroll: true }); });
  });
  document.addEventListener('pointerdown', event => { if (frame.clientWidth >= 1000 && !assurances.contains(event.target)) assurances.querySelectorAll('details[open]').forEach(details => { details.open = false; }); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !root.querySelector('dialog[open]')) assurances.querySelectorAll('details[open]').forEach(details => { details.open = false; }); });

  const frameEl = frame;
  const nav = root.querySelector('.product-nav');
  const navTabs = [...root.querySelectorAll('.product-nav [data-pdp-tab]')];
  const tabPanels = [...root.querySelectorAll('.pdp-tab-panel[data-tab-panel]')];
  const nextTabLinks = [...root.querySelectorAll('[data-pdp-next]')];
  const panelsContainer = root.querySelector('.pdp-tab-panels');
  const defaultTabId = navTabs[0]?.dataset.pdpTab || 'features';
  const mobileMedia = window.matchMedia?.('(max-width: 700px)');
  const isMobileLayout = () => Boolean(mobileMedia?.matches || frameEl?.classList.contains('is-mobile') || (frameEl?.clientWidth > 0 && frameEl.clientWidth <= 700));
  let mobileSpecsCollapsedOnce = false;
  let stickyRaf;
  const scheduleSticky = () => { if (!stickyRaf) stickyRaf = requestAnimationFrame(() => { stickyRaf = undefined; updateSticky(); }); };
  window.addEventListener('scroll', scheduleSticky, { passive: true });
  window.addEventListener('resize', scheduleSticky, { passive: true });

  function updateNavOffset() {
    if (nav && nav.offsetHeight > 0) {
      root.style.setProperty('--nav-offset', `${nav.offsetHeight}px`);
    }
  }

  function collapseMobileSpecsIfNeeded() {
    if (isMobileLayout() && !mobileSpecsCollapsedOnce) {
      mobileSpecsCollapsedOnce = true;
      root.querySelectorAll('#specs details.more-details[open]').forEach((detail) => { detail.open = false; });
    }
    updateNavOffset();
  }

  function syncLayoutMode() {
    collapseMobileSpecsIfNeeded();
    requestAnimationFrame(updateNavOffset);
  }

  function activateTab(tabId, { scroll = false, updateHash = false } = {}) {
    const activeTab = navTabs.find(tab => tab.dataset.pdpTab === tabId);
    if (!activeTab) return false;
    navTabs.forEach(tab => {
      const isCurrent = tab === activeTab;
      tab.classList.toggle('active', isCurrent);
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', String(isCurrent));
      tab.setAttribute('tabindex', isCurrent ? '0' : '-1');
      if (isCurrent) tab.setAttribute('aria-current', 'location');
      else tab.removeAttribute('aria-current');
    });
    tabPanels.forEach(panel => {
      panel.setAttribute('role', 'tabpanel');
      panel.hidden = panel.dataset.tabPanel !== tabId;
    });
    nextTabLinks.forEach(item => {
      item.hidden = item.dataset.pdpNext === tabId;
    });
    updateNavOffset();
    if (!isMobileLayout() && nav && typeof nav.scrollTo === 'function') {
      const left = Math.max(0, activeTab.offsetLeft - nav.clientWidth / 2 + activeTab.clientWidth / 2);
      const behavior = Math.abs(nav.scrollLeft - left) < 4 ? 'auto' : (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth');
      nav.scrollTo({ left, behavior });
    }
    const targetHash = '#' + tabId;
    if (updateHash && location.hash !== targetHash) history.pushState(null, '', targetHash);
    if (scroll) panelsContainer?.scrollIntoView({ block: 'start', behavior: 'auto' });
    updateSticky();
    return true;
  }

  function syncFromHash(hash) {
    if (!hash || hash === '#') return false;
    const id = hash.slice(1);
    const directTab = navTabs.find(tab => tab.dataset.pdpTab === id || tab.hash === hash);
    if (directTab) return activateTab(directTab.dataset.pdpTab, { scroll: false, updateHash: false });
    const target = root.querySelector('#' + CSS.escape(id));
    if (!target) return false;
    const ownerPanel = target.closest('[data-tab-panel]');
    if (ownerPanel) activateTab(ownerPanel.dataset.tabPanel, { scroll: false, updateHash: false });
    const detailsEl = target.tagName === 'DETAILS' ? target : target.closest('details');
    if (detailsEl) { detailsEl.hidden = false; detailsEl.open = true; }
    return true;
  }

  nav?.setAttribute('role', 'tablist');
  nav?.addEventListener('keydown', event => {
    const index = navTabs.indexOf(document.activeElement);
    if (index === -1 || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? navTabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + navTabs.length) % navTabs.length;
    const nextTab = navTabs[nextIndex];
    if (!nextTab) return;
    nextTab.focus({ preventScroll: true });
    activateTab(nextTab.dataset.pdpTab, { scroll: false, updateHash: true });
  });
  root.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const jumpTab = link.dataset.pdpTab || link.dataset.pdpNext;
    if (jumpTab) {
      event.preventDefault();
      activateTab(jumpTab, { scroll: true, updateHash: true });
      return;
    }
    const target = link.hash.length > 1 && root.querySelector('#' + CSS.escape(link.hash.slice(1))); if (!target) return;
    event.preventDefault();
    const ownerPanel = target.closest('[data-tab-panel]');
    if (ownerPanel) activateTab(ownerPanel.dataset.tabPanel, { scroll: false, updateHash: false });
    const detailsEl = target.tagName === 'DETAILS' ? target : target.closest('details'); if (detailsEl) { detailsEl.hidden = false; detailsEl.open = true; }
    if (location.hash !== link.hash) history.pushState(null, '', link.hash);
    updateNavOffset();
    target.scrollIntoView({ block: 'start', behavior: link.getAttribute('href') === '#sales-summary' && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'auto' });
    updateSticky();
  }));
  root.querySelectorAll('[data-manual-download]').forEach(link => link.addEventListener('click', async event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const href = link.href || link.getAttribute('href');
    if (!href || typeof window.fetch !== 'function' || typeof URL.createObjectURL !== 'function') return;
    event.preventDefault();
    try {
      const response = await window.fetch(href, { mode: 'cors' });
      if (!response.ok) throw new Error('Download failed');
      const blobUrl = URL.createObjectURL(await response.blob());
      const temp = document.createElement('a');
      temp.href = blobUrl;
      temp.download = link.getAttribute('download') || 'user-manual.pdf';
      temp.style.display = 'none';
      document.body.append(temp);
      temp.click();
      temp.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);
    } catch {
      window.open(href, '_blank', 'noopener');
    }
  }));
  window.addEventListener('hashchange', () => syncFromHash(location.hash));
  window.addEventListener('popstate', () => {
    if (!syncFromHash(location.hash)) {
      activateTab(defaultTabId, { scroll: false, updateHash: false });
    }
  });

  function measureHeader() {
    const shell = getComputedStyle(document.documentElement);
    const number = name => Number.parseFloat(shell.getPropertyValue(name)) || 0;
    root.style.setProperty('--review-height', `${number('--header-height') * number('--sticky-header-enabled') + number('--announcement-bar-height') * number('--sticky-announcement-bar-enabled')}px`);
  }
  const header = document.querySelector('store-header') || document.querySelector('header');
  if (header) new ResizeObserver(measureHeader).observe(header);
  window.addEventListener('resize', measureHeader, { passive: true }); measureHeader();

  renderImages();
  renderPacks();
  updatePrice();
  updateGalleryImage();
  if (frameEl && typeof MutationObserver === 'function') {
    new MutationObserver(syncLayoutMode).observe(frameEl, { attributes: true, attributeFilter: ['class'] });
  }
  if (frameEl && typeof ResizeObserver === 'function') {
    new ResizeObserver(syncLayoutMode).observe(frameEl);
  }
  if (nav && typeof ResizeObserver === 'function') {
    new ResizeObserver(updateNavOffset).observe(nav);
  }
  if (mobileMedia?.addEventListener) mobileMedia.addEventListener('change', syncLayoutMode);
  else mobileMedia?.addListener?.(syncLayoutMode);
  window.addEventListener('resize', syncLayoutMode, { passive: true });
  syncLayoutMode();
  if (!syncFromHash(location.hash)) activateTab(defaultTabId, { scroll: false, updateHash: false });
  updateSticky();
})();
