(() => {
  const body = document.body;
  const hero = document.querySelector('#hero-image');
  if (!hero) return;
  const thumbs = [...document.querySelectorAll('.thumbnail')];
  const rail = document.querySelector('#thumbnail-rail');
  const stage = document.querySelector('.gallery-stage');
  const zoom = document.querySelector('#zoom-dialog');
  const zoomImage = document.querySelector('#zoom-image');
  const quantityInput = document.querySelector('#quantity');
  const packs = [...document.querySelectorAll('.pack-option')];
  const sticky = document.querySelector('#sticky-buy');
  const actions = document.querySelector('.pack-section .buy-actions');
  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: body.dataset.currency || 'USD' });
  const unitPrice = Number(body.dataset.unitPrice);
  const comparePrice = Number(body.dataset.comparePrice);
  const available = body.dataset.available !== 'false';
  let index = 0;
  let quantity = 1;
  let toastTimer;
  let startPoint;

  const setImage = (next, align = true) => {
    index = (next + thumbs.length) % thumbs.length;
    const current = thumbs[index];
    hero.src = current.dataset.full;
    hero.alt = current.dataset.alt;
    document.querySelector('#image-count').textContent = `${index + 1} / ${thumbs.length}`;
    thumbs.forEach((thumb, position) => thumb.setAttribute('aria-current', String(position === index)));
    if (align) {
      // Scroll only the rail; scrollIntoView can also move the whole product page.
      rail.scrollTo({ left: current.offsetLeft - rail.offsetLeft - rail.clientWidth / 2 + current.clientWidth / 2, behavior: 'smooth' });
    }
  };
  thumbs.forEach((thumb, position) => thumb.addEventListener('click', () => setImage(position)));
  document.querySelectorAll('[data-gallery-step]').forEach((button) => button.addEventListener('click', () => setImage(index + Number(button.dataset.galleryStep))));
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
  document.querySelector('[data-open-zoom]').addEventListener('click', () => {
    zoomImage.src = hero.src;
    zoomImage.alt = hero.alt;
    zoom.showModal();
  });
  document.querySelector('[data-close-zoom]').addEventListener('click', () => zoom.close());
  zoom.addEventListener('click', (event) => { if (event.target === zoom) zoom.close(); });

  const updateQuantity = (value) => {
    quantity = Math.max(1, Math.min(99, Number.isFinite(Number(value)) ? Math.floor(Number(value)) : 1));
    quantityInput.value = String(quantity);
    packs.forEach((pack) => {
      const selected = Number(pack.dataset.quantity) === quantity;
      pack.classList.toggle('is-selected', selected);
      pack.setAttribute('aria-pressed', String(selected));
      pack.querySelector('strong').textContent = formatter.format(unitPrice * Number(pack.dataset.quantity) / 100);
    });
    document.querySelectorAll('[data-price-total]').forEach((node) => { node.textContent = formatter.format(unitPrice * quantity / 100); });
    document.querySelectorAll('[data-compare-total]').forEach((node) => {
      node.hidden = comparePrice <= unitPrice;
      node.textContent = formatter.format(comparePrice * quantity / 100);
    });
    document.querySelectorAll('.discount-tag').forEach((node) => {
      node.hidden = comparePrice <= unitPrice;
      node.textContent = comparePrice > unitPrice ? `${Math.round((1 - unitPrice / comparePrice) * 100)}% OFF` : '';
    });
    document.querySelectorAll('[data-quantity-label]').forEach((node) => { node.textContent = `${quantity} ${quantity === 1 ? 'battery' : 'batteries'}`; });
    document.querySelector('#selection-count').textContent = `${quantity} selected`;
    document.querySelector('.pack-disclaimer').textContent = `${formatter.format(unitPrice / 100)} per battery · Battery-only packs`;
  };
  packs.forEach((pack) => pack.addEventListener('click', () => updateQuantity(pack.dataset.quantity)));
  quantityInput.addEventListener('change', () => updateQuantity(quantityInput.value));
  document.querySelectorAll('[data-quantity-step]').forEach((button) => button.addEventListener('click', () => updateQuantity(quantity + Number(button.dataset.quantityStep))));
  document.querySelectorAll('[data-preview-action]').forEach((button) => {
    if (!available && button.classList.contains('buy-button')) { button.disabled = true; button.textContent = 'Unavailable'; }
    button.addEventListener('click', () => {
      const toast = document.querySelector('#preview-toast');
      toast.textContent = `${quantity} ${quantity === 1 ? 'battery' : 'batteries'} selected · Preview only, checkout disabled.`;
      toast.classList.add('is-visible');
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2500);
    });
  });
  document.querySelector('.show-more').addEventListener('click', (event) => {
    const button = event.currentTarget;
    const expanded = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(expanded));
    button.innerHTML = expanded ? 'Show less <span aria-hidden="true">⌃</span>' : 'Show more <span aria-hidden="true">⌄</span>';
    document.querySelector('#key-points').classList.toggle('is-expanded', expanded);
  });

  const tabs = [...document.querySelectorAll('[data-panel]')];
  const openPanel = (id, shouldScroll = false) => {
    tabs.forEach((tab) => {
      const selected = tab.dataset.panel === id;
      tab.setAttribute('aria-selected', String(selected));
      tab.classList.toggle('is-active', selected);
      tab.tabIndex = selected ? 0 : -1;
      document.getElementById(tab.dataset.panel).hidden = !selected;
    });
    const active = tabs.find((tab) => tab.dataset.panel === id);
    if (active) {
      const nav = active.parentElement;
      nav.scrollTo({ left: active.offsetLeft - nav.offsetLeft - 15, behavior: 'smooth' });
    }
    if (shouldScroll) document.querySelector('.detail-nav').scrollIntoView({ block: 'start', behavior: 'smooth' });
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
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
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
