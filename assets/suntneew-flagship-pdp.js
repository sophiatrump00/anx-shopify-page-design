/* SuntNeew Flagship 6-Tab PDP controller: gallery & multi-card feature carousels, 6-tab panel switcher, quantity pricing, zoom modal, and sticky buy bar. */
(() => {
  const root = document.querySelector('[data-flagship-pdp]');
  if (!root || root.dataset.initialized === 'true') return;
  root.dataset.initialized = 'true';

  const byId = (id) => root.querySelector(`#${id}`);
  const variantEl = root.querySelector('[data-flagship-variant]');
  const modelLabel = root.dataset.modelLabel || 'SuntNeew';
  const subLabel = root.dataset.stickySub || '';
  let variantData = { id: '', sku: '', currency: 'USD', priceCents: 0, compareAtCents: 0, available: true, maxQty: 999 };
  try {
    if (variantEl?.textContent) variantData = { ...variantData, ...JSON.parse(variantEl.textContent) };
  } catch (_) {}

  const money = (cents) => {
    const amount = Number(cents || 0) / 100;
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: variantData.currency || 'USD' }).format(amount);
    } catch (_) {
      return `$${amount.toFixed(2)}`;
    }
  };

  /* 1. Carousels (Hero gallery + interactive sub-feature pairs) */
  const carousels = {};
  root.querySelectorAll('[data-carousel]').forEach((wrapper) => {
    const key = wrapper.dataset.carousel;
    const isGallery = key === 'gallery';
    const track = wrapper.querySelector('.pair-track');
    const cards = [...wrapper.querySelectorAll('.feature-card')];
    const tabs = [...wrapper.querySelectorAll('[data-carousel-tab]')];
    const prevBtn = wrapper.querySelector('[data-carousel-prev]');
    const nextBtn = wrapper.querySelector('[data-carousel-next]');
    const counter = wrapper.querySelector('.pair-counter');
    const caption = wrapper.querySelector('.gallery-current');
    if (!track || !cards.length) return;

    let active = 0;
    let rafId = 0;
    let drag = null;
    let suppressClick = false;

    const updateUI = (idx) => {
      const clamped = Math.max(0, Math.min(cards.length - 1, idx));
      active = clamped;
      tabs.forEach((tab, i) => tab.setAttribute('aria-pressed', String(i === clamped)));
      if (counter) counter.textContent = `${clamped + 1} / ${cards.length}`;
      if (prevBtn) prevBtn.disabled = clamped === 0;
      if (nextBtn) nextBtn.disabled = clamped === cards.length - 1;
      if (isGallery && caption && tabs[clamped]) {
        caption.textContent = tabs[clamped].dataset.slideLabel || '';
        const navWrap = tabs[clamped].parentElement;
        if (navWrap?.scrollTo) {
          navWrap.scrollTo({
            left: tabs[clamped].offsetLeft - navWrap.offsetLeft - navWrap.clientWidth / 2 + tabs[clamped].clientWidth / 2,
            behavior: 'smooth',
          });
        }
      }
    };

    const go = (idx) => {
      const target = Math.max(0, Math.min(cards.length - 1, idx));
      const left = cards[target].offsetLeft - cards[0].offsetLeft;
      track.scrollTo({
        left,
        behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      });
      updateUI(target);
    };

    tabs.forEach((tab, i) => tab.addEventListener('click', () => go(i)));
    prevBtn?.addEventListener('click', () => go(active - 1));
    nextBtn?.addEventListener('click', () => go(active + 1));

    track.addEventListener('keydown', (e) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
      e.preventDefault();
      if (e.key === 'Home') return go(0);
      if (e.key === 'End') return go(cards.length - 1);
      return go(active + (e.key === 'ArrowRight' ? 1 : -1));
    });

    track.addEventListener('scroll', () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const step = cards.length > 1 ? Math.max(1, cards[1].offsetLeft - cards[0].offsetLeft) : Math.max(1, track.clientWidth);
        updateUI(Math.round(track.scrollLeft / step));
      });
    }, { passive: true });

    track.addEventListener('pointerdown', (e) => {
      suppressClick = false;
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      drag = { x: e.clientX, left: track.scrollLeft, moved: false };
    });
    track.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (Math.abs(dx) > 6) {
        drag.moved = true;
        track.classList.add('is-dragging');
        track.scrollLeft = drag.left - dx;
      }
    });
    const endDrag = () => {
      if (drag?.moved) suppressClick = true;
      drag = null;
      track.classList.remove('is-dragging');
    };
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
    track.addEventListener('click', (e) => {
      if (suppressClick) {
        e.preventDefault();
        e.stopPropagation();
        suppressClick = false;
      }
    }, true);

    updateUI(0);
    carousels[key] = { go, wrapper };
  });

  /* 2. Highlights Toggle */
  const highlightsList = byId('product-highlights');
  const highlightsToggle = byId('highlights-toggle');
  if (highlightsList && highlightsToggle) {
    const extraCount = highlightsList.querySelectorAll('.sn-highlight-extra').length;
    highlightsToggle.addEventListener('click', () => {
      const collapsed = highlightsList.dataset.collapsed === 'true';
      highlightsList.dataset.collapsed = collapsed ? 'false' : 'true';
      highlightsToggle.setAttribute('aria-expanded', collapsed ? 'true' : 'false');
      highlightsToggle.textContent = collapsed ? 'Show fewer highlights ▴' : `+ ${extraCount} more highlights ▾`;
    });
  }

  /* 3. Quantity & Live Pricing */
  const formId = root.dataset.form;
  const form = formId ? document.getElementById(formId) : root.querySelector('form');
  const qtyInput = byId('quantity');
  const minusBtn = byId('quantity-minus');
  const plusBtn = byId('quantity-plus');
  const totalEl = byId('total-price');
  const compareEl = byId('compare-price');
  const savingEl = byId('total-saving');
  const summaryEl = byId('quantity-summary');
  const stickyTotal = byId('sticky-total');
  const stickyOptions = byId('sticky-options');
  const purchaseBtn = byId('purchase-button');
  const stickyPurchaseBtn = byId('sticky-purchase-button');
  const buyNowBtns = [...root.querySelectorAll('[data-suntneew-buy-now]')];

  let count = 1;
  const maxQty = Math.max(1, Number(variantData.maxQty || 999));

  const syncPrice = () => {
    const busy = form?.dataset.purchaseBusy === 'true';
    const avail = Boolean(variantData.available);
    const total = Number(variantData.priceCents || 0) * count;
    const compareTotal = Number(variantData.compareAtCents || 0) * count;
    const hasSaving = compareTotal > total;

    if (totalEl) totalEl.textContent = money(total);
    if (compareEl) {
      compareEl.hidden = !hasSaving;
      compareEl.textContent = hasSaving ? money(compareTotal) : '';
    }
    if (savingEl) {
      savingEl.hidden = !hasSaving;
      savingEl.textContent = hasSaving ? `You save ${money(compareTotal - total)} in total vs. regular price` : '';
    }
    if (summaryEl) {
      summaryEl.textContent = `${count} ${count === 1 ? 'unit' : 'units'} · ${money(variantData.priceCents)} per unit`;
    }
    if (stickyTotal) stickyTotal.textContent = money(total);
    if (stickyOptions) {
      stickyOptions.textContent = subLabel ? `${subLabel} · ${count} ${count === 1 ? 'unit' : 'units'}` : `${count} ${count === 1 ? 'unit' : 'units'}`;
    }
    if (qtyInput) {
      qtyInput.value = String(count);
      qtyInput.disabled = !avail || busy;
    }
    if (minusBtn) minusBtn.disabled = !avail || busy || count <= 1;
    if (plusBtn) plusBtn.disabled = !avail || busy || count >= maxQty;
    if (purchaseBtn) purchaseBtn.disabled = !avail || busy;
    if (stickyPurchaseBtn) stickyPurchaseBtn.disabled = !avail || busy;
    buyNowBtns.forEach((btn) => { btn.disabled = !avail || busy; });
  };

  minusBtn?.addEventListener('click', () => {
    if (count > 1) { count -= 1; syncPrice(); }
  });
  plusBtn?.addEventListener('click', () => {
    if (count < maxQty) { count += 1; syncPrice(); }
  });
  qtyInput?.addEventListener('change', () => {
    const parsed = Math.floor(Number(qtyInput.value || 1));
    count = Number.isFinite(parsed) ? Math.max(1, Math.min(maxQty, parsed)) : 1;
    syncPrice();
  });

  if (form) {
    new MutationObserver(syncPrice).observe(form, { attributes: true, attributeFilter: ['data-purchase-busy'] });
    form.addEventListener('purchase:idle', syncPrice);
    form.addEventListener('cart:error', (e) => {
      const msg = e.detail?.error || 'Check your cart before trying again.';
      const note = root.querySelector('.cart-feedback');
      if (note) { note.textContent = msg; note.hidden = false; }
      const link = root.querySelector('.cart-feedback-link');
      if (link) link.hidden = false;
      const checkout = root.querySelector('.cart-checkout-link');
      if (checkout) checkout.hidden = true;
      const sNote = byId('sticky-feedback');
      if (sNote) { sNote.textContent = msg; sNote.hidden = false; }
    });
    form.addEventListener('variant:add', () => {
      const note = root.querySelector('.cart-feedback');
      if (note) { note.textContent = 'Added to your cart.'; note.hidden = false; }
      const link = root.querySelector('.cart-feedback-link');
      if (link) link.hidden = false;
      const checkout = root.querySelector('.cart-checkout-link');
      if (checkout) checkout.hidden = false;
      const stickyCheckout = root.querySelector('.sticky-checkout-link');
      if (stickyCheckout) stickyCheckout.hidden = false;
      const sNote = byId('sticky-feedback');
      if (sNote) {
        sNote.textContent = 'Added to your cart.';
        sNote.hidden = false;
        setTimeout(() => { sNote.hidden = true; }, 4000);
      }
      try {
        const drawer = document.getElementById('cart-drawer');
        if (drawer && typeof drawer.show === 'function' && !drawer.open) drawer.show();
      } catch (_) {}
    });
  }
  syncPrice();

  /* 4. Image Zoom Modal */
  const dialog = byId('image-dialog');
  const zoomImg = byId('zoom-image');
  const zoomTitle = byId('image-title');
  const zoomControls = root.querySelector('.zoom-gallery-controls');
  const zoomCounter = byId('zoom-counter');
  const zoomPrev = byId('zoom-previous');
  const zoomNext = byId('zoom-next');
  const zoomSizeBtn = byId('zoom-size');
  const zoomHint = root.querySelector('.zoom-hint');
  const zoomScroll = root.querySelector('.zoom-scroll');

  const galleryZoomItems = [...root.querySelectorAll('#pair-gallery [data-zoom-trigger]')].map((btn) => ({
    src: btn.dataset.zoomSrc,
    title: btn.dataset.zoomTitle || `${modelLabel} product image`,
  }));
  let galleryZoomIdx = 0;

  const setZoomExpanded = (expanded) => {
    if (!dialog || !zoomSizeBtn) return;
    dialog.classList.toggle('is-zoomed', expanded);
    zoomSizeBtn.setAttribute('aria-pressed', String(expanded));
    zoomSizeBtn.setAttribute('aria-label', expanded ? 'Fit image to screen' : 'View at original size');
    zoomSizeBtn.textContent = expanded ? '−' : '+';
    if (!expanded) zoomScroll?.scrollTo({ left: 0, top: 0, behavior: 'instant' });
  };

  const showGalleryZoomAt = (idx) => {
    if (!galleryZoomItems.length || !dialog || !zoomImg) return;
    galleryZoomIdx = Math.max(0, Math.min(galleryZoomItems.length - 1, idx));
    const item = galleryZoomItems[galleryZoomIdx];
    zoomImg.removeAttribute('width');
    zoomImg.removeAttribute('height');
    zoomImg.src = item.src;
    zoomImg.alt = item.title;
    if (zoomTitle) zoomTitle.textContent = item.title;
    if (zoomCounter) zoomCounter.textContent = `${galleryZoomIdx + 1} / ${galleryZoomItems.length}`;
    if (zoomPrev) zoomPrev.disabled = galleryZoomIdx === 0;
    if (zoomNext) zoomNext.disabled = galleryZoomIdx === galleryZoomItems.length - 1;
    setZoomExpanded(false);
    carousels.gallery?.go(galleryZoomIdx);
  };

  root.querySelectorAll('[data-zoom-trigger]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!dialog || !zoomImg) return;
      const gIdx = btn.dataset.zoomGalleryIndex;
      if (gIdx !== undefined) {
        dialog.classList.add('gallery-lightbox');
        if (zoomControls) zoomControls.hidden = false;
        if (zoomHint) zoomHint.textContent = 'Click image or + to zoom. Use arrows to browse. Press Esc to close.';
        showGalleryZoomAt(Number(gIdx));
      } else {
        dialog.classList.remove('gallery-lightbox');
        if (zoomControls) zoomControls.hidden = true;
        if (zoomHint) zoomHint.textContent = 'Click image or + to view full resolution. Press Esc to close.';
        zoomImg.src = btn.dataset.zoomSrc;
        zoomImg.alt = btn.dataset.zoomTitle || `${modelLabel} feature image`;
        if (zoomTitle) zoomTitle.textContent = btn.dataset.zoomTitle || `${modelLabel} product image`;
        setZoomExpanded(false);
      }
      dialog.showModal();
    });
  });

  zoomPrev?.addEventListener('click', () => showGalleryZoomAt(galleryZoomIdx - 1));
  zoomNext?.addEventListener('click', () => showGalleryZoomAt(galleryZoomIdx + 1));
  zoomSizeBtn?.addEventListener('click', () => setZoomExpanded(!dialog?.classList.contains('is-zoomed')));
  zoomImg?.addEventListener('click', () => setZoomExpanded(!dialog?.classList.contains('is-zoomed')));
  dialog?.querySelector('[data-close]')?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', (e) => {
    if (e.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
  });
  dialog?.addEventListener('keydown', (e) => {
    if (!dialog.classList.contains('gallery-lightbox') || dialog.classList.contains('is-zoomed')) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); showGalleryZoomAt(galleryZoomIdx - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); showGalleryZoomAt(galleryZoomIdx + 1); }
  });

  /* 5. Assurance Details Close Buttons & Responsive Slot Placement */
  root.querySelectorAll('.assurance-close').forEach((btn) => {
    btn.addEventListener('click', () => {
      const det = btn.closest('details');
      if (det) det.open = false;
    });
  });

  const frameEl = byId('frame');
  const galleryEl = root.querySelector('.product-gallery');
  const assurancesEl = byId('purchase-assurances');
  const desktopSlot = byId('gallery-assurances-slot');
  const mobileSlot = byId('mobile-assurances-slot');
  const syncAssurancesLayout = () => {
    if (!frameEl || !assurancesEl || !desktopSlot || !mobileSlot) return;
    const isDesktop = frameEl.clientWidth >= 1000;
    const targetSlot = isDesktop ? desktopSlot : mobileSlot;
    if (assurancesEl.parentElement !== targetSlot) targetSlot.appendChild(assurancesEl);
    const pair = galleryEl?.querySelector('.gallery-pair');
    if (isDesktop && galleryEl && pair) {
      const chrome = Math.ceil(galleryEl.getBoundingClientRect().height - pair.getBoundingClientRect().height);
      frameEl.style.setProperty('--gallery-chrome-height', `${chrome}px`);
    }
  };
  syncAssurancesLayout();
  window.addEventListener('resize', () => requestAnimationFrame(syncAssurancesLayout), { passive: true });

  /* 6. Sticky Buy Bar Observer */
  const stickyAnchor = byId('purchase-button') || totalEl;
  const stickyBar = byId('sticky-buy');
  const updateSticky = () => {
    if (!stickyBar || !stickyAnchor) return;
    if (dialog?.open) { stickyBar.hidden = true; return; }
    const rect = stickyAnchor.getBoundingClientRect();
    stickyBar.hidden = rect.bottom > 0;
  };
  if (stickyAnchor && stickyBar) {
    new IntersectionObserver(updateSticky, { threshold: 0 }).observe(stickyAnchor);
    dialog?.addEventListener('close', updateSticky);
    window.addEventListener('scroll', updateSticky, { passive: true });
    updateSticky();
  }

  /* 7. 6-Tab Navigation & Hash Deep Linking */
  const nav = root.querySelector('.product-nav');
  const navTabs = [...root.querySelectorAll('.product-nav [data-pdp-tab]')];
  const tabPanels = [...root.querySelectorAll('.pdp-tab-panel[data-tab-panel]')];
  const panelsContainer = root.querySelector('.pdp-tab-panels');

  const activateTab = (tabId, { scroll = false, updateHash = false } = {}) => {
    const activeTab = navTabs.find((t) => t.dataset.pdpTab === tabId);
    if (!activeTab) return false;
    root.querySelectorAll('video').forEach((v) => { if (!v.paused) v.pause(); });
    navTabs.forEach((tab) => {
      const isCurrent = tab === activeTab;
      tab.classList.toggle('active', isCurrent);
      tab.setAttribute('aria-selected', String(isCurrent));
      tab.tabIndex = isCurrent ? 0 : -1;
      if (isCurrent) tab.setAttribute('aria-current', 'location');
      else tab.removeAttribute('aria-current');
    });
    tabPanels.forEach((panel) => {
      panel.hidden = panel.dataset.tabPanel !== tabId;
    });
    if (nav && nav.offsetHeight > 0) root.style.setProperty('--nav-offset', `${nav.offsetHeight}px`);
    if (updateHash && window.location.hash !== `#${tabId}`) {
      history.pushState(null, '', `#${tabId}`);
    }
    if (scroll) panelsContainer?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    updateSticky();
    return true;
  };

  navTabs.forEach((tab) => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      activateTab(tab.dataset.pdpTab, { scroll: true, updateHash: true });
    });
    tab.addEventListener('keydown', (e) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      e.preventDefault();
      const dir = e.key === 'ArrowRight' ? 1 : -1;
      const next = navTabs[(navTabs.indexOf(tab) + dir + navTabs.length) % navTabs.length];
      next.focus();
      activateTab(next.dataset.pdpTab, { scroll: true, updateHash: true });
    });
  });

  root.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]:not([data-pdp-tab])');
    if (!link) return;
    const id = link.getAttribute('href').slice(1);
    const matchingTab = navTabs.find((t) => t.dataset.pdpTab === id);
    if (matchingTab) {
      e.preventDefault();
      activateTab(id, { scroll: true, updateHash: true });
    }
  });

  const syncHash = () => {
    const id = window.location.hash.replace('#', '');
    if (navTabs.some((t) => t.dataset.pdpTab === id)) {
      activateTab(id, { scroll: false, updateHash: false });
    }
  };
  window.addEventListener('hashchange', syncHash);
  syncHash();
})();
