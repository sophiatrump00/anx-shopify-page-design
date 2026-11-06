const productKey = new URLSearchParams(location.search).get('product') === 'g31' ? 'g31' : 'a20';
const p = PRODUCTS[productKey];
const app = document.getElementById('app');
const dialog = document.getElementById('info-dialog');
const dialogContent = document.getElementById('dialog-content');
let quantity = 1;
let cartQuantity = 0;
let galleryIndex = 0;
let activeFeature = 0;
const money = value => new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(value);
const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const arrow = icon('arrow');
const img = (name, alt, className = '', eager = false) => `<img class="${className}" src="assets/${name}.webp" alt="${alt}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
const symbols = `<svg class="icon-defs" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>
  <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M4 12h15M13 5l7 7-7 7"/></symbol>
  <symbol id="i-chevron" viewBox="0 0 24 24"><path d="m9 5 7 7-7 7"/></symbol>
  <symbol id="i-bag" viewBox="0 0 24 24"><path d="M5 7h14l1 14H4L5 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/></symbol>
  <symbol id="i-shield" viewBox="0 0 24 24"><path d="m12 2 8 3v6c0 5-4 8-8 11-4-3-8-6-8-11V5l8-3Z"/><path d="m8 12 3 3 5-6"/></symbol>
  <symbol id="i-return" viewBox="0 0 24 24"><path d="m6 3-4 4 4 4M3 7h11a7 7 0 0 1 0 14H8"/></symbol>
  <symbol id="i-truck" viewBox="0 0 24 24"><path d="M1 4h13v13H1zM14 9h5l4 5v3h-9"/><circle cx="6" cy="18" r="3"/><circle cx="19" cy="18" r="3"/></symbol>
  <symbol id="i-help" viewBox="0 0 24 24"><path d="M4 13v-2a8 8 0 0 1 16 0v2M4 12H2v7h4v-7H4ZM20 12h2v7h-4v-7h2ZM19 19v3h-6"/></symbol>
  <symbol id="i-bolt" viewBox="0 0 24 24"><path d="m13 2-9 12h7l-1 8 10-13h-8l1-7Z"/></symbol>
  <symbol id="i-usb" viewBox="0 0 24 24"><path d="M12 22V3m-3 3 3-4 3 4M12 15l-6-4V7m6 11 6-4V9"/><circle cx="6" cy="5" r="2"/><path d="M16 5h4v4h-4z"/></symbol>
  <symbol id="i-light" viewBox="0 0 24 24"><path d="M7 3h10v5l-3 4v9h-4v-9L7 8V3ZM7 7h10M9 15h6M2 4H0m24 0h-2M4 0 3 1m18-1-1 1"/></symbol>
  <symbol id="i-screen" viewBox="0 0 24 24"><rect x="5" y="1" width="14" height="22" rx="3"/><path d="M9 18h6M9 8l2-2 2 4 2-3"/></symbol>
  <symbol id="i-fit" viewBox="0 0 24 24"><path d="M2 8V2h6m8 0h6v6M2 16v6h6m8 0h6v-6M7 7h10v10H7z"/></symbol>
  <symbol id="i-drop" viewBox="0 0 24 24"><path d="M12 2C10 7 4 11 4 16a8 8 0 0 0 16 0c0-5-6-9-8-14Z"/><path d="M8 16a4 4 0 0 0 4 4"/></symbol>
  <symbol id="i-book" viewBox="0 0 24 24"><path d="M12 5C8 2 5 2 2 3v17c4-1 7-1 10 2 3-3 6-3 10-2V3c-3-1-6-1-10 2v17"/></symbol>
  <symbol id="i-download" viewBox="0 0 24 24"><path d="M12 2v14m-5-5 5 5 5-5M3 15v7h18v-7"/></symbol>
  <symbol id="i-play" viewBox="0 0 24 24"><path d="m9 5 11 7-11 7V5Z"/></symbol>
  <symbol id="i-zoom" viewBox="0 0 24 24"><circle cx="10" cy="10" r="7"/><path d="m15 15 7 7M6 10h8m-4-4v8"/></symbol>
</defs></svg>`;

const careItems = [
  ['warranty', 'shield', '5-year warranty', 'Limited warranty'],
  ['returns', 'return', '14-day returns', 'Eligibility applies'],
  ['shipping', 'truck', 'Free U.S. shipping', '48 states + DC'],
  ['support', 'help', 'Lifetime support', 'Product & setup help']
];
function featurePanel(index) {
  const item = p.featureTabs[index];
  return `<div class="feature-copy"><p class="eyebrow">${String(index + 1).padStart(2, '0')} / ${item.label}</p><h3>${item.title}</h3><p>${item.text}</p><div class="feature-metrics">${item.metrics.map(m => `<div><strong>${m[0]}</strong><span>${m[1]}</span></div>`).join('')}</div><small>${item.note}</small></div><div class="feature-image">${img(item.image, item.alt)}</div>`;
}
function render() {
  document.title = `${p.short} · SuntNeew PDP preview`;
  app.innerHTML = `${symbols}
    <div class="announcement">Free standard U.S. shipping <span>·</span> Contiguous 48 states + DC</div>
    <header class="site-header"><div class="container header-inner"><a class="logo" href="#main" aria-label="SuntNeew product">${img('logo', 'SuntNeew', '', true)}</a><nav class="site-nav" aria-label="Main navigation"><a href="product.html?product=a20" ${productKey === 'a20' ? 'aria-current="page"' : ''}>Jump Starters</a><a href="product.html?product=g31" ${productKey === 'g31' ? 'aria-current="page"' : ''}>RV Batteries</a><a href="#support">Support</a></nav><button type="button" class="cart-button" data-cart aria-label="Open preview cart">${icon('bag')}<span class="cart-count" id="cart-count">0</span></button></div></header>
    <main id="main">
      <div class="container breadcrumb"><a href="https://www.suntneew.com/" target="_blank" rel="noopener">Home</a>${icon('chevron')}<span>${p.category}</span>${icon('chevron')}<span>${p.short}</span></div>
      <section class="container product-grid" id="purchase" aria-label="${p.short} product and purchase">
        <div class="product-gallery"><div class="gallery-stage"><span class="gallery-tag">${p.short} / ${productKey === 'a20' ? '8,000mAh' : '12.8V 100Ah'}</span>${img(p.gallery[0][0], p.gallery[0][1], 'main-image', true)}<button class="zoom-button" data-zoom type="button" aria-label="Enlarge product image">${icon('zoom')}</button><span class="image-count"><b id="gallery-index">01</b> / 05</span></div><div class="gallery-thumbnails" aria-label="Product images">${p.gallery.map((item, index) => `<button type="button" data-gallery="${index}" aria-label="View ${item[2]}" aria-pressed="${index === 0}">${img(item[0], '', '', index < 2)}<span>${item[2]}</span></button>`).join('')}</div><p class="gallery-caption">${productKey === 'a20' ? 'The A20 8,000mAh kit · Orange' : 'Group 31 · 12.8V 100Ah · LiFePO4'}</p></div>
        <div class="purchase-panel"><p class="eyebrow">${p.kind}</p><h1>${p.title}</h1><a class="rating-link" href="#reviews"><span class="stars" aria-label="${p.rating} out of 5 stars">★★★★★</span><strong>${p.rating}</strong><span>${p.count} reviews</span>${icon('chevron')}</a><p class="product-description">${p.description}</p><ul class="product-highlights">${p.highlights.map(text => `<li>${icon('shield')}<span>${text}</span></li>`).join('')}</ul><div class="product-price" id="main-price"><strong>${money(p.price)}</strong><del>${money(p.compare)}</del><span>Save ${money(p.compare - p.price)}</span></div><p class="tax-note">Taxes calculated at checkout.</p><div class="configuration"><span>${productKey === 'a20' ? 'Your A20' : 'Your battery'}</span><strong>${p.config}</strong></div><div class="buy-row"><div class="quantity"><button type="button" data-quantity="-1" aria-label="Decrease quantity" disabled>−</button><output id="quantity" aria-label="Quantity">1</output><button type="button" data-quantity="1" aria-label="Increase quantity">+</button></div><button type="button" class="button button-primary" data-add>Add to cart ${icon('bag')}</button></div><a class="fit-help" href="#specs">Check ${productKey === 'a20' ? 'vehicle compatibility' : 'dimensions & system fit'} ${arrow}</a><div class="purchase-care"><p>Buy with confidence.</p><div class="care-grid">${careItems.map(item => `<button type="button" data-policy="${item[0]}">${icon(item[1])}<span><strong>${item[2]}</strong><small>${item[3]}</small></span></button>`).join('')}</div></div></div>
      </section>
      <nav class="product-nav" aria-label="Product information"><div class="container"><span class="nav-product">${p.short}</span><div class="nav-links"><a class="active" href="#story">Overview</a><a href="#features">Features</a><a href="#specs">Specifications</a><a href="#box">In the box</a><a href="#support">Support</a><a href="#faq">FAQ</a></div><a class="nav-up" href="#purchase">Choose ${p.short} ↑</a></div></nav>
      <section class="story-hero" id="story"><picture><source media="(max-width:650px)" srcset="assets/${p.heroMobile}.webp">${img(p.hero, p.heroAlt)}</picture><div class="hero-shade"></div><div class="container hero-content"><p class="eyebrow">SUNTNEEW / ${p.kind}</p><h2>${p.heroTitle}</h2><p>${p.heroCopy}</p><a class="hero-link" href="${p.video ? '#in-action' : '#features'}">${p.video ? icon('play') : icon('bolt')}${p.heroButton} ${arrow}</a></div><div class="hero-foot"><span>POWER FOR LIFE, ON THE ROAD & BEYOND.</span><span>${p.short} / SUNTNEEW</span></div></section>
      <section class="section overview container"><div class="section-heading"><div><p class="eyebrow">THE EVERYDAY REASONS</p><h2>${p.overviewTitle}</h2></div><p>${p.overviewCopy}</p></div><div class="benefit-grid">${p.benefits.map((b, i) => `<article class="benefit"><div class="benefit-top">${icon(b.icon)}<span>0${i + 1}</span></div><strong class="benefit-value">${b.value}</strong><h3>${b.title}</h3><p>${b.text}</p></article>`).join('')}</div></section>
      <section class="section features-section" id="features"><div class="container"><div class="center-heading"><p class="eyebrow">DESIGNED TO BE USEFUL</p><h2>${p.featureHeading}</h2><p>${p.featureLede}</p></div><div class="feature-tabs" role="tablist" aria-label="${p.short} features">${p.featureTabs.map((item, i) => `<button type="button" role="tab" id="feature-tab-${i}" data-feature="${i}" aria-selected="${i === 0}" aria-controls="feature-panel" tabindex="${i === 0 ? '0' : '-1'}">${item.label}</button>`).join('')}</div><div class="feature-panel" role="tabpanel" id="feature-panel" aria-labelledby="feature-tab-0">${featurePanel(0)}</div></div></section>
      <section class="section container reliability"><div class="split-media">${img(p.reliability.image, p.reliability.alt)}</div><div class="split-copy"><p class="eyebrow">${p.reliability.eyebrow}</p><h2>${p.reliability.title}</h2><p>${p.reliability.text}</p><div class="protection-points">${p.reliability.points.map(point => `<div>${icon(point[0])}<span><strong>${point[1]}</strong><small>${point[2]}</small></span></div>`).join('')}</div><small class="fineprint">${p.reliability.foot}</small></div></section>
      <section class="practical-section"><div class="container practical"><div class="split-copy"><p class="eyebrow">${p.practical.eyebrow}</p><h2>${p.practical.title}</h2><p>${p.practical.text}</p><div class="feature-metrics">${p.practical.metrics.map(m => `<div><strong>${m[0]}</strong><span>${m[1]}</span></div>`).join('')}</div><small class="fineprint">${p.practical.note}</small></div><div class="practical-media">${img(p.practical.image, p.practical.alt)}</div></div></section>
      ${p.video ? `<section class="section container in-action" id="in-action"><div class="section-heading"><div><p class="eyebrow">TAKE A CLOSER LOOK</p><h2>${p.video.title}</h2></div><p>${p.video.text}</p></div><button type="button" class="video-poster" data-video aria-label="Play A20 demonstration">${img(p.video.image, 'Actual A20 demonstration in a vehicle engine bay')}<span class="video-shade"></span><span class="play-circle">${icon('play')}</span><span class="video-label">WATCH THE A20 DEMONSTRATION ${arrow}</span></button><p class="video-credit">${p.video.credit}</p></section>` : ''}
      <section class="section setup-section"><div class="container"><div class="section-heading"><div><p class="eyebrow">BEFORE YOUR FIRST USE</p><h2>${p.setupTitle}</h2></div><p>${p.setupText}</p></div><div class="setup-grid">${p.steps.map((step, i) => `<article><span>0${i + 1}</span><h3>${step[0]}</h3><p>${step[1]}</p></article>`).join('')}</div><a class="text-link" href="assets/${p.manual}" target="_blank" rel="noopener">Read the full ${p.short} manual ${icon('download')}</a></div></section>
      <section class="section container box-section" id="box"><div class="box-image">${img(p.kitImage, `${p.short} kit and included accessories`)}</div><div><p class="eyebrow">YOUR KIT</p><h2>What comes<br>with your ${p.short}.</h2><ul class="kit-list">${p.kit.map(item => `<li><span>✓</span>${item}</li>`).join('')}</ul><a class="text-link" href="assets/${p.manual}" target="_blank" rel="noopener">${p.manualLabel} ${icon('download')}</a></div></section>
      <section class="section specs-section" id="specs"><div class="container specs-layout"><div><p class="eyebrow">THE DETAILS</p><h2>Know your ${p.short}.</h2><p>${p.config}</p><a class="text-link" href="assets/${p.manual}" target="_blank" rel="noopener">Download the manual ${icon('download')}</a></div><div class="specs-table"><dl>${p.specs.slice(0, 6).map(s => `<div><dt>${s[0]}</dt><dd>${s[1]}</dd></div>`).join('')}</dl><details class="more-specs"><summary>More specifications <span>+</span></summary><dl>${p.specs.slice(6).map(s => `<div><dt>${s[0]}</dt><dd>${s[1]}</dd></div>`).join('')}</dl></details></div></div></section>
      <section class="section container reviews-section" id="reviews"><div class="section-heading"><div><p class="eyebrow">FROM OUR CUSTOMERS</p><h2>Out on the road.</h2></div><div class="review-summary"><strong>${p.rating}<span>/ 5</span></strong><span class="stars">★★★★★</span><a href="${p.url}#judgeme_product_reviews" target="_blank" rel="noopener">Read all ${p.count} reviews ↗</a></div></div><div class="reviews-grid">${p.reviews.map(r => `<article class="review-card"><span class="stars" aria-label="${r.stars} out of 5 stars">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</span><h3>${r.title}</h3><p>“${r.text}”</p><span class="review-author">${r.name}</span></article>`).join('')}</div></section>
      <section class="care-section" id="support"><div class="container care-layout"><div class="care-promise"><p class="eyebrow">SUNTNEEW, AFTER THE SALE</p><span class="warranty-number">5<span>YEAR</span></span><h2>Covered for the long road.</h2><p>Your ${p.short} includes a five-year limited warranty for eligible defects. And a place to turn for product and setup questions.</p><button type="button" class="text-link" data-policy="warranty">See your warranty ${arrow}</button></div><div class="care-details"><h3>A little more peace of mind.</h3><button type="button" data-policy="shipping">${icon('truck')}<span><strong>From U.S. stock to your door.</strong><small>Free standard delivery to the contiguous 48 states + DC.</small></span>${icon('chevron')}</button><button type="button" data-policy="returns">${icon('return')}<span><strong>14 days to request a return.</strong><small>For eligible items. Contact us for approval before returning.</small></span>${icon('chevron')}</button><button type="button" data-policy="support">${icon('help')}<span><strong>Questions now. Support later.</strong><small>Lifetime technical support for your SuntNeew product.</small></span>${icon('chevron')}</button><a class="button button-dark" href="https://www.suntneew.com/pages/contact-us" target="_blank" rel="noopener">Talk to SuntNeew ${arrow}</a></div></div></section>
      <section class="section container faq-section" id="faq"><div><p class="eyebrow">BEFORE YOU GO</p><h2>A few useful answers.</h2><p>More questions about your ${p.short}?</p><button type="button" class="text-link" data-policy="support">We’re here to help ${arrow}</button></div><div class="faq-group">${p.faqs.map(faq => `<details><summary>${faq[0]}<span>+</span></summary><p>${faq[1]}</p></details>`).join('')}</div></section>
      <section class="closing-banner"><div class="container"><div><p class="eyebrow">SUNTNEEW / ${p.short}</p><h2>${productKey === 'a20' ? 'Make room for backup.' : 'Make more of the road.'}</h2></div><a class="button button-primary" href="#purchase">Choose your ${p.short} ${arrow}</a></div></section>
    </main>
    <footer class="site-footer"><div class="container footer-main"><a class="logo" href="#main">${img('logo-light', 'SuntNeew')}</a><p>Power for life,<br>on the road & beyond.</p><div><a href="https://www.suntneew.com/pages/contact-us" target="_blank" rel="noopener">Contact us ↗</a><a href="assets/${p.manual}" target="_blank" rel="noopener">Product manual ↗</a></div></div><div class="container footer-bottom"><span>© 2026 SuntNeew. All rights reserved.</span><span>Power. Prepared.</span></div></footer>
    <aside class="sticky-buy" id="sticky-buy" aria-label="Quick purchase" hidden><div class="container"><div class="sticky-product">${img(p.gallery[0][0], '')}<span><strong>${p.short}</strong><small>${p.config}</small></span></div><strong class="sticky-price" id="sticky-price">${money(p.price)}</strong><button type="button" class="button button-primary" data-add>Add to cart ${icon('bag')}</button></div></aside>`;
}
render();

function showDialog(content, extraClass = '') {
  dialog.className = `modal ${extraClass}`;
  dialogContent.innerHTML = content;
  dialog.showModal();
}
function showPolicy(policy) {
  const warrantyBody = productKey === 'a20'
    ? '<h3>Help with a covered issue</h3><p>Contact our team with your model, order details and a description of the fault. We will review the issue and explain the available service under the applicable terms.</p><h3>Coverage has conditions</h3><p>Misuse, unauthorized modifications, damage outside the product’s limits and normal wear are not covered. Keep your proof of purchase and follow the product manual.</p>'
    : '<h3>Help with your Group 31</h3><p>Contact our team with your order details, model and a description of the fault. Keep your proof of purchase and follow the product manual.</p><h3>Model-specific coverage</h3><p>The G31 product page states five years of limited warranty coverage for eligible product defects under the model-specific terms. Contact product support to review the applicable terms and service for your battery.</p>';
  const policies = {
    warranty: {eyebrow: 'LONG-TERM COVER', title: 'Five-year limited warranty.', copy: `Your SuntNeew ${p.short} includes five years of limited warranty coverage for eligible defects under normal use.`, body: warrantyBody, link: productKey === 'a20' ? 'https://www.suntneew.com/pages/warranty' : 'https://www.suntneew.com/pages/support-rv-g31', linkLabel: productKey === 'a20' ? 'Full warranty policy' : 'Group 31 product support'},
    returns: {eyebrow: 'A CLEAR RETURN WINDOW', title: '14-day returns.', copy: 'Request an eligible return within 14 days after delivery. Contact us for approval and an RMA before shipping.', body: '<h3>What is eligible?</h3><p>Unused items in resalable condition, with the original packaging, accessories and proof of purchase.</p><h3>Return shipping</h3><p>For a change of mind or an incorrectly chosen model, the customer pays return shipping. The published policy explains the handling of damaged, defective or incorrect items.</p>', link: 'https://www.suntneew.com/pages/return-policy', linkLabel: 'Full return policy'},
    shipping: {eyebrow: 'U.S. DELIVERY', title: 'Free standard shipping.', copy: 'Delivery to the contiguous 48 United States and Washington, DC, from available U.S. stock.', body: '<h3>Processing and transit</h3><p>Allow 2 business days for processing, plus an estimated 2–5 business days in transit after dispatch. Business days are Monday–Friday.</p><h3>Delivery area</h3><p>Alaska, Hawaii, Puerto Rico, other U.S. territories, military addresses and destinations outside the U.S. are excluded.</p>', link: 'https://www.suntneew.com/pages/shipping-policy', linkLabel: 'Full shipping policy'},
    support: {eyebrow: 'BEFORE & AFTER YOUR PURCHASE', title: 'A place to turn.', copy: `Get lifetime technical support for your ${p.short}, from compatibility questions to setup and use.`, body: `<h3>Start with the right information</h3><p>Tell us the product model and your question. For an order or service issue, include the order number and clear photos where useful.</p><a class="manual-dialog-link" href="assets/${p.manual}" target="_blank" rel="noopener">${icon('book')} ${p.manualLabel} ${arrow}</a>`, link: 'https://www.suntneew.com/pages/contact-us', linkLabel: 'Contact SuntNeew'}
  };
  const item = policies[policy];
  if (!item) return;
  showDialog(`<p class="eyebrow">${item.eyebrow}</p><h2 id="dialog-title">${item.title}</h2><p class="modal-lede">${item.copy}</p><div class="modal-body">${item.body}</div><a class="button button-dark" href="${item.link}" target="_blank" rel="noopener">${item.linkLabel} ${arrow}</a>`);
}
function showCart() {
  showDialog(`<p class="eyebrow">LOCAL DEMO / PREVIEW CART</p><h2 id="dialog-title">${cartQuantity ? 'Your preview cart.' : 'Your preview cart is empty.'}</h2>${cartQuantity ? `<div class="cart-line">${img(p.gallery[0][0], p.name)}<div><strong>${p.name}</strong><p>${p.config}</p><small>Quantity: ${cartQuantity}</small></div></div><div class="cart-total"><span>Preview subtotal</span><strong>${money(p.price * cartQuantity)}</strong></div>` : ''}<p class="cart-demo-note">This is a local layout demo. No live basket, order or payment is created.</p><button type="button" class="button button-dark" data-close>Continue exploring ${arrow}</button>`);
}
function updateSticky() {
  const show = document.getElementById('main-price').getBoundingClientRect().bottom < 0;
  document.getElementById('sticky-buy').hidden = !show;
}
function chooseFeature(index, focus = false) {
  activeFeature = index;
  document.querySelectorAll('[data-feature]').forEach(el => {
    const selected = Number(el.dataset.feature) === index;
    el.setAttribute('aria-selected', String(selected));
    el.tabIndex = selected ? 0 : -1;
    if (selected && focus) el.focus();
  });
  const panel = document.getElementById('feature-panel');
  panel.setAttribute('aria-labelledby', `feature-tab-${index}`);
  panel.innerHTML = featurePanel(index);
}
document.addEventListener('click', event => {
  const policy = event.target.closest('[data-policy]');
  if (policy) showPolicy(policy.dataset.policy);
  if (event.target.closest('[data-close]')) dialog.close();
  if (event.target.closest('[data-cart]')) showCart();
  const gallery = event.target.closest('[data-gallery]');
  if (gallery) {
    galleryIndex = Number(gallery.dataset.gallery);
    const image = document.querySelector('.main-image');
    image.src = `assets/${p.gallery[galleryIndex][0]}.webp`;
    image.alt = p.gallery[galleryIndex][1];
    document.getElementById('gallery-index').textContent = String(galleryIndex + 1).padStart(2, '0');
    document.querySelectorAll('[data-gallery]').forEach(el => el.setAttribute('aria-pressed', String(el === gallery)));
  }
  if (event.target.closest('[data-zoom]')) showDialog(`<h2 class="sr-only" id="dialog-title">${p.gallery[galleryIndex][2]}</h2>${img(p.gallery[galleryIndex][0], p.gallery[galleryIndex][1])}`, 'image-modal');
  const quantityButton = event.target.closest('[data-quantity]');
  if (quantityButton) {
    quantity = Math.min(10, Math.max(1, quantity + Number(quantityButton.dataset.quantity)));
    document.getElementById('quantity').textContent = quantity;
    document.querySelector('[data-quantity="-1"]').disabled = quantity === 1;
    document.querySelector('[data-quantity="1"]').disabled = quantity === 10;
  }
  const feature = event.target.closest('[data-feature]');
  if (feature) chooseFeature(Number(feature.dataset.feature));
  if (event.target.closest('[data-add]')) {
    cartQuantity += quantity;
    document.getElementById('cart-count').textContent = cartQuantity;
    showCart();
  }
  if (event.target.closest('[data-video]') && p.video) {
    showDialog(`<h2 id="dialog-title">The A20 in action.</h2><div class="video-embed"><iframe title="A20 product demonstration" src="https://www.youtube-nocookie.com/embed/${p.video.id}" allow="encrypted-media; fullscreen; picture-in-picture" allowfullscreen></iframe></div><p class="video-credit">${p.video.credit}</p><a class="text-link" href="https://www.youtube.com/watch?v=${p.video.id}" target="_blank" rel="noopener">Watch on YouTube ↗</a>`, 'video-modal');
  }
});
document.querySelector('.feature-tabs').addEventListener('keydown', event => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const count = p.featureTabs.length;
  const index = event.key === 'Home' ? 0 : event.key === 'End' ? count - 1 : (activeFeature + (event.key === 'ArrowRight' ? 1 : -1) + count) % count;
  chooseFeature(index, true);
});
dialog.addEventListener('click', event => {
  if (event.target === dialog) {
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  }
});
const navLinks = [...document.querySelectorAll('.nav-links a')];
let scrollScheduled = false;
window.addEventListener('scroll', () => {
  if (scrollScheduled) return;
  scrollScheduled = true;
  requestAnimationFrame(() => {
    updateSticky();
    let active = navLinks[0];
    navLinks.forEach(link => {if (document.querySelector(link.hash).getBoundingClientRect().top <= 150) active = link;});
    navLinks.forEach(link => link.classList.toggle('active', link === active));
    scrollScheduled = false;
  });
}, {passive: true});
window.addEventListener('resize', updateSticky);
window.addEventListener('message', event => {
  if (event.origin === location.origin && event.source === parent && event.data?.type === 'suntneew-demo-top') {
    window.scrollTo({top: 0, behavior: 'instant'});
    updateSticky();
  }
});
window.parent.postMessage({type: 'suntneew-demo-product', product: productKey}, location.origin);
updateSticky();
