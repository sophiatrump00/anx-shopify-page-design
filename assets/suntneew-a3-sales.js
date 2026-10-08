/* A3 sales interactions. Purchases use the theme's native product-form/cart flow. */
(() => {
  const initialized = new WeakSet();
  function initialize(root) {
    if (!root || initialized.has(root)) return;
    initialized.add(root);
    const query = (selector) => root.querySelector(selector);
    const all = (selector) => [...root.querySelectorAll(selector)];
    const thumbnails = all('[data-gallery-src]');
    const image = query('#galleryImage');
    const dialog = query('#gallery-lightbox');
    const enlarged = query('#gallery-lightbox-image');
    let lastFocus;
    const currentIndex = () => Math.max(0, thumbnails.findIndex((b) => b.getAttribute('aria-pressed') === 'true'));
    function selectImage(button) {
      thumbnails.forEach((b) => {
        b.classList.toggle('is-active', b === button);
        b.setAttribute('aria-pressed', String(b === button));
      });
      image.src = button.dataset.gallerySrc;
      image.alt = button.dataset.galleryAlt;
      query('#galleryLabel').textContent = button.dataset.galleryLabel;
      const count = `${currentIndex() + 1} / ${thumbnails.length}`;
      query('#galleryPosition').textContent = count;
      enlarged.src = button.dataset.gallerySrc;
      enlarged.alt = button.dataset.galleryAlt;
      query('#gallery-lightbox-title').textContent = `A3 · ${button.dataset.galleryLabel}`;
      query('#gallery-lightbox-count').textContent = count;
      query('#gallery-original').href = button.dataset.gallerySrc;
    }
    thumbnails.forEach((b) => b.addEventListener('click', () => selectImage(b)));
    all('[data-gallery-pick]').forEach((a) => a.addEventListener('click', () => {
      const suffix = String(a.dataset.galleryPick).padStart(2, '0');
      const button = thumbnails.find((b) => b.dataset.gallerySrc.includes(`gallery-${suffix}.jpg`));
      if (button) selectImage(button);
    }));
    all('[data-open-gallery]').forEach((b) => b.addEventListener('click', () => {
      lastFocus = document.activeElement;
      selectImage(thumbnails[currentIndex()]);
      dialog.showModal();
      query('[data-gallery-close]').focus();
    }));
    query('[data-gallery-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => { if (lastFocus?.isConnected) lastFocus.focus(); });
    function change(offset) { selectImage(thumbnails[(currentIndex() + offset + thumbnails.length) % thumbnails.length]); }
    query('[data-gallery-prev]').addEventListener('click', () => change(-1));
    query('[data-gallery-next]').addEventListener('click', () => change(1));
    dialog.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault(); change(event.key === 'ArrowLeft' ? -1 : 1);
      }
    });

    const steps = [
      {title: 'Your order confirmation', copy: 'Keep your confirmation email and order number. They make delivery questions and support easier to resolve.', label: 'Order questions ↗', href: 'mailto:info@suntneew.com?subject=A3%20order%20question'},
      {title: 'Dispatch and tracking', copy: 'Free Standard shipping from our U.S. warehouses to the contiguous 48 states and Washington, DC. Processing takes 2 business days; transit after dispatch takes 2–5 business days (Monday–Friday). See the shipping policy for conditions and estimates.', label: 'Shipping policy ↗', href: '/pages/shipping-policy'},
      {title: 'Set up your A3', copy: 'Check the kit, charge A3 and read the supplied guide. Confirm vehicle fit and follow the clamp connection sequence before starting.', label: 'Open A3 guide ↗', href: root.dataset.manualUrl},
      {title: 'Help after delivery', copy: 'For an issue, send your order number and clear photos. Request eligible returns within 14 days of delivery; contact us before sending anything back.', label: 'Contact support ↗', href: 'mailto:info@suntneew.com?subject=A3%20after-sales%20support'}
    ];
    const stepButtons = all('[data-journey-step]');
    stepButtons.forEach((button) => button.addEventListener('click', () => {
      const step = steps[Number(button.dataset.journeyStep)];
      stepButtons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
      query('#journey-title').textContent = step.title;
      query('#journey-copy').textContent = step.copy;
      const link = query('#journey-link');
      link.textContent = step.label; link.href = step.href;
      if (step.href.includes('.pdf')) { link.target = '_blank'; link.rel = 'noopener'; }
      else { link.removeAttribute('target'); link.removeAttribute('rel'); }
    }));
    const journey = query('.order-journey');
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) { journey.classList.add('is-seen'); observer.disconnect(); }
      }, {threshold: .3});
      observer.observe(journey);
    }
    function openTarget() {
      const target = query(`[id="${CSS.escape(location.hash.slice(1))}"]`);
      if (target?.tagName === 'DETAILS') target.open = true;
    }
    all('a[href="#payments"],a[href="#starting-help"]').forEach((a) => a.addEventListener('click', () => {
      const target = query(a.getAttribute('href'));
      if (target) target.open = true;
    }));
    window.addEventListener('hashchange', openTarget);
    openTarget();

    const tabs = all('.pdp-tabs a');
    const destinations = tabs.map((a) => query(a.getAttribute('href')));
    let scheduled = false;
    function updateLayout() {
      const header = document.querySelector('store-header[sticky]');
      const announcement = document.querySelector('.shopify-section--announcement-bar');
      const headerBottom = header ? Math.max(0, header.getBoundingClientRect().bottom) : 0;
      const announcementBottom = announcement && getComputedStyle(announcement).position === 'sticky' ? Math.max(0, announcement.getBoundingClientRect().bottom) : 0;
      const offset = Math.max(headerBottom, announcementBottom);
      const navHeight = query('.pdp-tabs').getBoundingClientRect().height;
      root.style.setProperty('--a3-header-h', `${offset}px`);
      root.style.setProperty('--nav-h', `${navHeight}px`);
      const hero = query('#hero-buy').getBoundingClientRect();
      const closing = query('#closing-buy').getBoundingClientRect();
      query('[data-a3-sticky-purchase]').classList.toggle('is-visible', hero.bottom < offset && !(closing.top < innerHeight && closing.bottom > offset));
      let active = 0;
      destinations.forEach((el, i) => { if (el?.getBoundingClientRect().top <= offset + navHeight + 28) active = i; });
      tabs.forEach((a, i) => {
        a.classList.toggle('is-active', i === active);
        if (i === active) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
      });
    }
    function scheduleLayout() {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => { updateLayout(); scheduled = false; });
    }
    window.addEventListener('scroll', scheduleLayout, {passive: true});
    window.addEventListener('resize', scheduleLayout);
    all('details').forEach((d) => d.addEventListener('toggle', scheduleLayout));
    if ('ResizeObserver' in window) new ResizeObserver(scheduleLayout).observe(root);
    scheduleLayout();

    const widget = query('#judgeme_product_reviews');
    const badge = query('[data-a3-rating]');
    const reviewLabel = query('[data-a3-review-label]');
    const fallback = query('[data-a3-review-fallback]');
    function syncReviews() {
      const data = window.jdgm?.data?.reviewWidget?.[root.dataset.productId];
      const shared = data?.reviews?.some((review) => review.is_for_product_from_group) ?? false;
      const count = Number(widget?.querySelector('[data-number-of-reviews]')?.dataset.numberOfReviews ?? badge?.querySelector('[data-number-of-reviews]')?.dataset.numberOfReviews ?? data?.number_of_reviews ?? 0);
      if (badge) badge.hidden = count === 0;
      if (reviewLabel) reviewLabel.textContent = count > 0 ? 'Read reviews' : 'Customer reviews';
      const scope = query('[data-a3-review-scope]');
      const context = query('[data-a3-review-context]');
      if (scope && data) scope.hidden = !shared || count === 0;
      if (context && data) context.hidden = !shared || count === 0;
      if (data) query('#reviews-heading').textContent = shared ? 'From our jump starter range.' : 'Experiences with A3.';
      if (fallback) fallback.hidden = !!widget?.querySelector('[data-widget-container="review-widget"], .jdgm-rev-widg');
    }
    syncReviews();
    if (widget) new MutationObserver(syncReviews).observe(widget, {childList: true, subtree: true});
    if (badge) new MutationObserver(syncReviews).observe(badge, {childList: true, subtree: true});
    window.addEventListener('load', () => {
      syncReviews(); scheduleLayout();
      if (['#customer-reviews', '#reviews', '#judgeme_product_reviews'].includes(location.hash)) query('#customer-reviews')?.scrollIntoView({behavior: 'instant', block: 'start'});
    }, {once: true});
  }
  document.querySelectorAll('.sn-a3-sales').forEach(initialize);
  document.addEventListener('shopify:section:load', (event) => initialize(event.target.querySelector('.sn-a3-sales')));
})();
