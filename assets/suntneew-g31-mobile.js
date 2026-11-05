(() => {
  const body = document.querySelector("#g31-mobile");
  if (!body) return;
  const hero = body.querySelector('#g31m-hero-image');
  if (!hero) return;
  const thumbs = [...body.querySelectorAll('.thumbnail')];
  const rail = body.querySelector('#g31m-thumbnail-rail');
  const stage = body.querySelector('.gallery-stage');
  const zoom = body.querySelector('#g31m-zoom-dialog');
  const zoomImage = body.querySelector('#g31m-zoom-image');
  const quantityInput = body.querySelector('#g31m-quantity');
  const packs = [...body.querySelectorAll('.pack-option')];
  const sticky = body.querySelector('#g31m-sticky-buy');
  const actions = body.querySelector('.pack-section .buy-actions');
  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: body.dataset.currency || 'USD' });
  const unitPrice = Number(body.dataset.unitPrice);
  const comparePrice = Number(body.dataset.comparePrice);
  const available = body.dataset.available !== 'false';
  let index = 0;
  let quantity = 1;
  let toastTimer;
  let submitting = false;
  const maxQuantity = Number(quantityInput.max) || 99;
  let startPoint;

  const setImage = (next, align = true) => {
    index = (next + thumbs.length) % thumbs.length;
    const current = thumbs[index];
    hero.src = current.dataset.full;
    hero.alt = current.dataset.alt;
    body.querySelector('#g31m-image-count').textContent = `${index + 1} / ${thumbs.length}`;
    thumbs.forEach((thumb, position) => thumb.setAttribute('aria-current', String(position === index)));
    if (align) {
      // Scroll only the rail; scrollIntoView can also move the whole product page.
      rail.scrollTo({ left: current.offsetLeft - rail.offsetLeft - rail.clientWidth / 2 + current.clientWidth / 2, behavior: 'smooth' });
    }
  };
  thumbs.forEach((thumb, position) => thumb.addEventListener('click', () => setImage(position)));
  body.querySelectorAll('[data-gallery-step]').forEach((button) => button.addEventListener('click', () => setImage(index + Number(button.dataset.galleryStep))));
  stage.addEventListener('pointerdown', (event) => { startPoint = { x: event.clientX, y: event.clientY }; });
  stage.addEventListener('pointercancel', () => { startPoint = undefined; });
  stage.addEventListener('pointerup', (event) => {
    if (!startPoint) return;
    const x = event.clientX - startPoint.x;
    const y = event.clientY - startPoint.y;
    startPoint = undefined;
    if (Math.abs(x) > 40 && Math.abs(x) > Math.abs(y) * 1.3) setImage(index + (x < 0 ? 1 : -1));
  });
  hero.addEventListener('dragstart', (event) => event.preventDefault());
  body.querySelector('[data-open-zoom]').addEventListener('click', () => {
    zoomImage.src = hero.src;
    zoomImage.alt = hero.alt;
    zoom.showModal();
  });
  body.querySelector('[data-close-zoom]').addEventListener('click', () => zoom.close());
  zoom.addEventListener('click', (event) => { if (event.target === zoom) zoom.close(); });

  const updateQuantity = (value) => {
    quantity = Math.max(1, Math.min(maxQuantity, Number.isFinite(Number(value)) ? Math.floor(Number(value)) : 1));
    quantityInput.value = String(quantity);
    packs.forEach((pack) => {
      const selected = Number(pack.dataset.quantity) === quantity;
      pack.disabled = !available || Number(pack.dataset.quantity) > maxQuantity;
      pack.classList.toggle('is-selected', selected);
      pack.setAttribute('aria-pressed', String(selected));
      pack.querySelector('strong').textContent = formatter.format(unitPrice * Number(pack.dataset.quantity) / 100);
    });
    body.querySelectorAll('[data-price-total]').forEach((node) => { node.textContent = formatter.format(unitPrice * quantity / 100); });
    body.querySelectorAll('[data-compare-total]').forEach((node) => {
      node.hidden = comparePrice <= unitPrice;
      node.textContent = formatter.format(comparePrice * quantity / 100);
    });
    body.querySelectorAll('.discount-tag').forEach((node) => {
      node.hidden = comparePrice <= unitPrice;
      node.textContent = comparePrice > unitPrice ? `${Math.round((1 - unitPrice / comparePrice) * 100)}% OFF` : '';
    });
    body.querySelectorAll('[data-quantity-label]').forEach((node) => { node.textContent = `${quantity} ${quantity === 1 ? 'battery' : 'batteries'}`; });
    body.querySelector('#g31m-selection-count').textContent = `${quantity} selected`;
    body.querySelector('.pack-disclaimer').textContent = `${formatter.format(unitPrice / 100)} per battery · Battery-only packs`;
  };
  packs.forEach((pack) => pack.addEventListener('click', () => updateQuantity(pack.dataset.quantity)));
  quantityInput.addEventListener('change', () => updateQuantity(quantityInput.value));
  body.querySelectorAll('[data-quantity-step]').forEach((button) => button.addEventListener('click', () => updateQuantity(quantity + Number(button.dataset.quantityStep))));
  const form = body.querySelector('#g31m-product-form');
  const purchaseButtons = [...body.querySelectorAll('[data-purchase]')];
  const feedback = body.querySelector('#g31m-cart-feedback');
  const cartLink = body.querySelector('.cart-feedback-link');
  const toast = body.querySelector('#g31m-preview-toast');
  const storefrontRoot = window.Shopify?.routes?.root || '/';
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitting || !available) return;
    updateQuantity(quantityInput.value);
    if (!form.reportValidity()) return;
    const checkout = event.submitter?.dataset.purchase === 'now';
    submitting = true;
    feedback.hidden = true;
    cartLink.hidden = true;
    toast.classList.remove('is-visible');
    purchaseButtons.forEach(button => { button.disabled = true; button.setAttribute('aria-busy', 'true'); });
    let added = false;
    try {
      const response = await fetch(`${storefrontRoot}cart/add.js`, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' }
      });
      const result = await response.json();
      if (!response.ok) {
        const message = typeof result.description === 'string' ? result.description : 'This quantity is not available. Please choose a smaller quantity.';
        throw new Error(message);
      }
      added = true;
      document.dispatchEvent(new CustomEvent('cart:refresh'));
      if (checkout) {
        window.location.assign(`${storefrontRoot}checkout`);
        return;
      }
      const message = `${quantity} ${quantity === 1 ? 'battery' : 'batteries'} added to your cart.`;
      feedback.textContent = message;
      feedback.dataset.error = 'false';
      body.querySelector('[data-cart-toast]').textContent = message;
      toast.classList.add('is-visible');
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 6000);
      cartLink.hidden = false;
    } catch (error) {
      feedback.textContent = error instanceof TypeError || added
        ? 'Please check your cart before trying again. The connection was interrupted.'
        : error.message || 'Could not update your cart. Please check your cart before trying again.';
      feedback.dataset.error = 'true';
      body.querySelector('[data-cart-toast]').textContent = feedback.textContent;
      toast.classList.add('is-visible');
      cartLink.hidden = false;
    } finally {
      feedback.hidden = false;
      submitting = false;
      purchaseButtons.forEach(button => { button.disabled = !available; button.removeAttribute('aria-busy'); });
    }
  });
  purchaseButtons.forEach(button => { button.disabled = !available; });
  const menu = body.querySelector('#g31m-menu');
  body.querySelector('[data-open-menu]').addEventListener('click', () => menu.showModal());
  body.querySelector('[data-close-menu]').addEventListener('click', () => menu.close());
  menu.addEventListener('click', event => { if (event.target === menu) menu.close(); });

  // Keep a single Judge.me instance and return it to its desktop position on resize.
  const phone = window.matchMedia('(max-width: 767px)');
  const reviewSlot = body.querySelector('[data-g31-review-slot]');
  let reviewWidget;
  let reviewHome;
  const placeReviews = () => {
    reviewWidget ||= document.querySelector('[data-g31-desktop] #judgeme_product_reviews');
    if (!reviewWidget) return false;
    if (!reviewHome) {
      reviewHome = document.createComment('G31 desktop reviews');
      reviewWidget.before(reviewHome);
    }
    if (phone.matches) reviewSlot.append(reviewWidget);
    else reviewHome.after(reviewWidget);
    return true;
  };
  if (!placeReviews()) {
    const observer = new MutationObserver(() => { if (placeReviews()) observer.disconnect(); });
    observer.observe(document.querySelector('[data-g31-desktop]'), { childList: true, subtree: true });
  }
  phone.addEventListener('change', () => {
    if (menu.open) menu.close();
    if (zoom.open) zoom.close();
    placeReviews();
  });
  body.querySelector('.show-more').addEventListener('click', (event) => {
    const button = event.currentTarget;
    const expanded = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(expanded));
    button.innerHTML = expanded ? 'Show less <span aria-hidden="true">⌃</span>' : 'Show more <span aria-hidden="true">⌄</span>';
    body.querySelector('#g31m-key-points').classList.toggle('is-expanded', expanded);
  });

  const tabs = [...body.querySelectorAll('[data-panel]')];
  const openPanel = (id, shouldScroll = false) => {
    tabs.forEach((tab) => {
      const selected = tab.dataset.panel === id;
      tab.setAttribute('aria-selected', String(selected));
      tab.classList.toggle('is-active', selected);
      tab.tabIndex = selected ? 0 : -1;
      body.querySelector(`#${tab.dataset.panel}`).hidden = !selected;
    });
    const active = tabs.find((tab) => tab.dataset.panel === id);
    if (active) {
      const nav = active.parentElement;
      nav.scrollTo({ left: active.offsetLeft - nav.offsetLeft - 15, behavior: 'smooth' });
    }
    if (shouldScroll) body.querySelector('.detail-nav').scrollIntoView({ block: 'start', behavior: 'smooth' });
  };
  tabs.forEach((tab, tabIndex) => {
    tab.addEventListener('click', () => openPanel(tab.dataset.panel, true));
    tab.addEventListener('keydown', (event) => {
      let next;
      if (event.key === 'ArrowRight') next = (tabIndex + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (tabIndex - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      tabs[next].focus();
      openPanel(tabs[next].dataset.panel);
    });
  });
  body.querySelectorAll('a[href^="#"]').forEach((link) => {
    const id = link.getAttribute('href').slice(1);
    if (!tabs.some((tab) => tab.dataset.panel === id)) return;
    link.addEventListener('click', (event) => { event.preventDefault(); openPanel(id, true); });
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      const visible = entry.intersectionRatio >= 0.7;
      sticky.hidden = visible;
      sticky.inert = visible;
    }, { threshold: 0.7 }).observe(actions);
  }
  setImage(0, false);
  updateQuantity(1);
})();
