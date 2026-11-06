const app = document.getElementById('app');
const dialog = document.getElementById('policy-dialog');
const dialogContent = document.getElementById('dialog-content');
const toast = document.getElementById('toast');
let quantity = 1;
let toastTimer;
let formDraft = {};
const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const arrow = icon('arrow');
const escapeText = text => String(text ?? '').replace(/[&<>"']/g, character => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[character]));
const productThumb = `<div class="support-product"><img src="assets/a3-kit.webp" alt="A3 jump starter and included kit" width="1477" height="1500"><div><p class="eyebrow">YOUR PRODUCT</p><strong>SuntNeew A3</strong><small>Portable Car Jump Starter · CY-A3</small></div></div>`;
function breadcrumbs(label) {
  return `<div class="container breadcrumb"><a href="#product">SuntNeew</a>${icon('chevron')}<a href="#resources">Product support</a>${icon('chevron')}<span>${label}</span></div>`;
}
function steps(compact = false) {
  const title = compact ? 'h4' : 'h3';
  return `<div class="process-grid"><div class="process-step"><span class="step-num">01</span><div><${title}>Tell us what happened</${title}><p>Share the model, order number and a short description. Photos can help us understand the issue.</p></div></div><div class="process-step"><span class="step-num">02</span><div><${title}>We review it with you</${title}><p>Our support team checks the details and explains the available next steps.</p></div></div><div class="process-step"><span class="step-num">03</span><div><${title}>Follow the agreed next step</${title}><p>Get setup help or instructions for an approved return or warranty claim.</p></div></div></div>`;
}
function product() {
  return `${breadcrumbs('A3')}
    <div class="container"><div class="product-grid">
      <div class="product-gallery"><div class="gallery-main"><img id="main-image" src="assets/a3-kit.webp" alt="SuntNeew A3 jump starter with clamps, cable and carry case" width="1477" height="1500"><span class="gallery-count" id="gallery-count">01 / 03</span></div><div class="gallery-thumbs" aria-label="Product images"><button type="button" data-image="a3-kit.webp" data-image-index="01" data-image-alt="SuntNeew A3 jump starter with clamps, cable and carry case" aria-label="View A3 kit" aria-pressed="true"><img src="assets/a3-kit.webp" alt="" width="1477" height="1500"></button><button type="button" data-image="a3-starting.webp" data-image-index="02" data-image-alt="A3 connected to a vehicle battery" aria-label="View A3 in use" aria-pressed="false"><img src="assets/a3-starting.webp" alt="" width="960" height="960"></button><button type="button" data-image="a3-clamp.webp" data-image-index="03" data-image-alt="A3 smart clamp detail" aria-label="View clamp detail" aria-pressed="false"><img src="assets/a3-clamp.webp" alt="" width="960" height="960"></button></div></div>
      <section class="purchase-panel" id="product-purchase" aria-label="A3 purchase and care">
        <div class="product-heading"><p class="eyebrow">READY FOR THE UNEXPECTED</p><h1>A3 Portable<br>Car Jump Starter</h1><div class="model-line"><span class="tag">12V VEHICLES</span><span>16,000mAh · USB-C PD60W</span></div></div>
        <p class="product-intro">Emergency starting, device power and a practical light. Packed with smart clamps and an EVA carry case.</p>
        <div class="desktop-price"><strong>$79.99</strong><del>$97.99</del><span class="discount">18% OFF</span></div>
        <div class="buy-row"><div class="quantity" aria-label="Quantity"><button type="button" data-quantity="-1" aria-label="Decrease quantity">−</button><output id="quantity">1</output><button type="button" data-quantity="1" aria-label="Increase quantity">+</button></div><button class="button button-primary" type="button" data-demo-cart>Add to cart ${icon('bag')}</button></div>
        <div class="secure-note">${icon('lock')} Secure payment at checkout</div>
        <div id="purchase-care"><div class="care-heading">${icon('shield')} A little more peace of mind.</div>
        <div class="trust-grid">
          <button type="button" class="trust-card" data-policy="warranty">${icon('shield')}<span><strong>5-year warranty</strong><small>For covered defects<br>under normal use</small></span><span class="tiny-arrow" aria-hidden="true">↗</span></button>
          <button type="button" class="trust-card" data-policy="returns">${icon('return')}<span><strong>14-day returns</strong><small>Unused items · approval<br>required before return</small></span><span class="tiny-arrow" aria-hidden="true">↗</span></button>
          <button type="button" class="trust-card" data-policy="shipping">${icon('truck')}<span><strong>Free U.S. shipping</strong><small>Standard delivery<br>48 states + DC</small></span><span class="tiny-arrow" aria-hidden="true">↗</span></button>
          <button type="button" class="trust-card" data-policy="help">${icon('help')}<span><strong>Product support</strong><small>Before you buy.<br>After you get started.</small></span><span class="tiny-arrow" aria-hidden="true">↗</span></button>
        </div><p class="care-fineprint">Coverage and eligibility apply. Tap a benefit for the details.</p>
        <a class="help-link" href="#support">${icon('help')}<span><strong>Questions about your A3?</strong><small>Setup help, orders, returns &amp; warranty</small></span><svg class="right" aria-hidden="true"><use href="#i-arrow"/></svg></a></div>
      </section>
    </div>
    <nav class="product-tabs" aria-label="A3 information"><a href="#product">Overview</a><a href="#resources">Manual &amp; setup</a><a href="#product" data-anchor="care-section" class="active">Support &amp; care</a></nav>
    <section class="care-section" id="care-section"><div class="section-head"><div><p class="eyebrow">FROM DAY ONE</p><h2>Support that stays<br>with your A3.</h2></div><p>Get to know your product. Find the right guidance. Reach our team when you need a hand.</p></div><div class="care-feature-grid"><div class="care-image"><img src="assets/a3-clamp.webp" alt="A3 jump starter and smart clamp detail" width="960" height="960" loading="lazy"><div class="image-copy"><span>GET STARTED WITH CONFIDENCE</span><h3>A clear first step.<br>A place to turn.</h3></div></div><div class="care-destinations"><a class="destination" href="#resources">${icon('book')}<span><strong>Get to know your A3</strong><small>Quick start &amp; everyday care</small></span><svg class="right"><use href="#i-chevron"/></svg></a><a class="destination" href="#resources" data-open-faq="faq-start">${icon('tools')}<span><strong>Find help with an issue</strong><small>Charging, clamps &amp; starting</small></span><svg class="right"><use href="#i-chevron"/></svg></a><a class="destination" href="#support">${icon('help')}<span><strong>Talk to product support</strong><small>Model-specific help &amp; aftercare</small></span><svg class="right"><use href="#i-chevron"/></svg></a></div></div></section>
    <section class="process-section"><p class="eyebrow">IF SOMETHING ISN'T RIGHT</p><h2>A clear path to help.</h2>${steps()}</section></div>
    <aside class="sticky-buy" aria-label="A3 purchase"><div class="sticky-price"><span>A3 · 1 UNIT</span><strong>$79.99</strong><del>$97.99</del></div><button class="button button-primary" type="button" data-demo-cart>Add to cart ${icon('bag')}</button></aside>`;
}
const guidance = {
  technical: ['Let’s start with the symptoms.', 'Tell us what the unit and clamp indicators show, how it was charged, and what you have already tried.'],
  order: ['Help us find the right order.', 'Include your order number and tell us whether your question is about processing, tracking or delivery.'],
  returns: ['Request approval before returning.', 'Eligible unused items can be requested within 14 days after delivery. Our team confirms the RMA and the correct warehouse first.'],
  warranty: ['Tell us about the fault.', 'The A3 jump-starter warranty covers eligible defects under normal use. Include the purchase date, fault and relevant photos in your follow-up email.']
};
function support() {
  return `${breadcrumbs('Contact support')}<section class="support-hero"><div class="container"><div><p class="eyebrow">SUNTNEEW PRODUCT CARE</p><h1>Let’s get you<br>the right help.</h1><p class="intro">A product question, an order update or something that isn’t working? Start here.</p></div>${productThumb}</div></section>
  <div class="container support-body"><div class="support-form" id="form-region"><h2>How can we help?</h2><p class="form-intro">Your product is already selected. Add a few details below.</p>
  <form id="support-form" novalidate>
    <fieldset class="issue-options"><legend>What do you need help with?</legend>
      <label class="issue-option"><input type="radio" name="issue" value="technical" checked required>${icon('tools')}<span>Product &amp; setup</span></label>
      <label class="issue-option"><input type="radio" name="issue" value="order">${icon('truck')}<span>Order &amp; delivery</span></label>
      <label class="issue-option"><input type="radio" name="issue" value="returns">${icon('return')}<span>Return request</span></label>
      <label class="issue-option"><input type="radio" name="issue" value="warranty">${icon('shield')}<span>Warranty claim</span></label>
    </fieldset>
    <div class="issue-guidance" id="issue-guidance"><strong>${guidance.technical[0]}</strong>${guidance.technical[1]}</div>
    <div class="field-grid"><label class="field" for="support-name">Your name <input id="support-name" name="name" placeholder="Name" autocomplete="name" required maxlength="100"></label><label class="field" for="support-email">Email address <input id="support-email" name="email" type="email" placeholder="you@example.com" autocomplete="email" required maxlength="200"></label></div>
    <div class="field-grid"><label class="field" for="support-model">Product model <select name="model" id="support-model"><option value="SuntNeew A3 · CY-A3">SuntNeew A3 · CY-A3</option></select></label><label class="field" for="support-order">Order number <span class="optional" id="order-optional">(if available)</span><input id="support-order" name="order" placeholder="e.g. #1234" maxlength="80"><small id="order-hint">You can ask a product question without an order.</small></label></div>
    <label class="field" for="support-message">Tell us what happened<textarea id="support-message" name="message" placeholder="What are you seeing, and what have you tried?" required maxlength="3000"></textarea><small>Have photos or a video? Mention them here; add them when emailing our team.</small></label>
    <button type="submit" class="button button-primary button-full">Preview support request ${arrow}</button>
    <p class="privacy-note">Demo only. This form previews your request in this browser; nothing is sent or stored. For live support, email info@suntneew.com.</p>
  </form></div>
  <aside class="side-guide"><p class="eyebrow">WHAT HAPPENS NEXT</p><h3>A clear path to help.</h3>${steps(true)}<div class="side-email">Prefer email?<a href="mailto:info@suntneew.com">info@suntneew.com</a><p>Include your model, order number and a short description.</p></div></aside></div>`;
}
function resources() {
  return `${breadcrumbs('A3 resources')}<section class="support-hero"><div class="resources-hero"><div><p class="eyebrow">A3 / PRODUCT SUPPORT</p><h1>Get to know<br>your A3.</h1><p>Start with the essentials. Find everyday care tips and help when you need it.</p><button type="button" class="button button-outline" data-policy="quickstart">Quick-start guide ${arrow}</button></div><img src="assets/a3-kit.webp" alt="A3 jump starter, carry case and accessories" width="1477" height="1500"></div></section>
  <div class="container"><div class="resource-links">
    <button type="button" class="resource-link" data-policy="quickstart">${icon('book')}<span><strong>Start with the essentials</strong><small>A short guide to preparation, connection and everyday care.</small><span class="resource-action">Read quick start ${arrow}</span></span></button>
    <a class="resource-link" href="#resources" data-open-faq="faq-charge">${icon('tools')}<span><strong>Find an answer</strong><small>Charging, clamp indicators and starting questions.</small><span class="resource-action">Troubleshoot your A3 ${arrow}</span></span></a>
    <button type="button" class="resource-link" data-policy="warranty">${icon('shield')}<span><strong>Know your coverage</strong><small>What the warranty covers and how to start a claim.</small><span class="resource-action">Warranty &amp; care ${arrow}</span></span></button>
  </div>
  <section class="faq-layout" id="troubleshooting"><div><p class="eyebrow">A LITTLE GUIDANCE</p><h2>Let’s work<br>through it.</h2><p>Check the product and vehicle instructions before use. If something still doesn’t look right, contact us.</p></div><div class="faq-group">
    <details id="faq-charge"><summary>My A3 isn’t charging. What should I check?</summary><p>Check the cable, charger and connection. Use a compatible USB-C PD charger and inspect the charging indicator. If the unit remains unresponsive, stop using it and contact product support with a photo of the display and charger details.</p></details>
    <details id="faq-start"><summary>The car won’t start. What should I do?</summary><p>Confirm that the vehicle uses a compatible 12V battery and that the A3 is sufficiently charged. Check the clamp connection and ready indication against the manual. Do not keep repeating attempts or override a warning. Contact us with the vehicle details and clamp indication.</p></details>
    <details id="faq-clamp"><summary>The clamp shows a warning.</summary><p>Stop the starting attempt and check the clamp indicator against the product instructions. Do not short the clamps or bypass protection. If you are unsure, contact support before trying again.</p></details>
    <details id="faq-return"><summary>How do I request a return or warranty service?</summary><p>Choose “Return request” or “Warranty claim” in product support. Include the order number, model and reason. Wait for approval and shipping instructions before sending a product back. For a damaged or swollen battery, contact us before handling or shipping it.</p><a class="button button-outline" href="#support" data-issue="warranty">Get product support ${arrow}</a></details>
  </div></section>
  <section class="support-banner"><div><p class="eyebrow">YOUR NEXT STEP</p><h2>Still need a hand?</h2><p>Tell us what’s happening. We’ll help you find the next step.</p></div><a class="button button-primary" href="#support">Contact A3 support ${arrow}</a></section></div>`;
}
const policies = {
  warranty: {
    icon: 'shield', title: '5-year warranty.',
    lede: 'Your SuntNeew A3 is covered for eligible defects under normal use, starting on the delivery date.',
    body: '<h3>What’s covered</h3><p>Manufacturing defects and component failure under normal use, including covered charging and starting faults within the product’s documented limits.</p><h3>How we help</h3><p>For an approved claim, we repair or replace the unit with the same or an equivalent model. If neither is available, we refund the purchase price. We cover the cost of sending the replacement to you.</p><h3>Keep these details ready</h3><p>Your order number, product model, a short description of the fault, and relevant photos or video. Damage, misuse, liquid damage, unauthorized repair and normal wear are excluded.</p>',
    action: 'Start a warranty request', issue: 'warranty', link: 'https://www.suntneew.com/pages/warranty', linkText: 'Read the full warranty policy', foot: 'A3 jump-starter coverage. The current warranty policy states an aim to reply within two business days. This is a response target, not a resolution time.'
  },
  returns: {
    icon: 'return', title: '14-day returns.',
    lede: 'Request an eligible return within 14 days after delivery. Contact us before sending anything back.',
    body: '<h3>Return conditions</h3><p>The item must be unused, in resalable condition, with the original packaging, accessories and included materials. Keep your proof of purchase.</p><h3>Who pays return shipping?</h3><p>For a change of mind or an incorrectly chosen model, you pay the return shipping. If the item arrived damaged, defective or incorrect, we cover that cost.</p><h3>Approval comes first</h3><p>Our team must approve the RMA and confirm the correct U.S. return warehouse. Batteries require specific handling and carrier instructions.</p>',
    action: 'Request a return', issue: 'returns', link: 'https://www.suntneew.com/pages/return-policy', linkText: 'Read the full return policy', foot: 'Approved refunds are processed after receipt and inspection. The return policy explains processing and bank posting times. Never send a damaged or swollen battery without support instructions.'
  },
  shipping: {
    icon: 'truck', title: 'Free U.S. shipping.',
    lede: 'Free standard shipping to supported addresses in the contiguous 48 United States and Washington, DC.',
    body: '<h3>Processing</h3><p>Within 2 business days after payment and order verification.</p><h3>In transit</h3><p>Estimated 2–5 business days after dispatch. Processing and transit are separate; estimated total time is 4–7 business days from order verification.</p><h3>Where we deliver</h3><p>We do not ship to Alaska, Hawaii, Puerto Rico, other U.S. territories, military addresses or countries outside the United States.</p>',
    action: 'Ask about an order', issue: 'order', link: 'https://www.suntneew.com/pages/shipping-policy', linkText: 'Read the full shipping policy', foot: 'Business days are Monday–Friday, excluding public holidays. Delivery estimates are not guaranteed; carrier, weather and address issues can affect timing.'
  },
  help: {
    icon: 'help', title: 'Here to help.',
    lede: 'Before your first use and when something isn’t working, you have a place to turn.',
    body: '<h3>Before you buy</h3><p>Ask about vehicle fit, connections and product features so you can choose with more confidence.</p><h3>After delivery</h3><p>Find setup guidance, ask about an order, or request a return or warranty review.</p><h3>Make the first message count</h3><p>Share the A3 model, your order number if available, and a short description. Our team may ask for photos or a video to understand the issue.</p>',
    action: 'Get product support', issue: 'technical', link: '#resources', linkText: 'Explore A3 resources', foot: 'You can also email info@suntneew.com. The demo request form previews your message locally and does not send it.'
  },
  quickstart: {
    icon: 'book', title: 'Your first steps.',
    lede: 'A quick introduction to the A3. Always read the full product and vehicle instructions before use.',
    body: '<h3>01 · Prepare</h3><p>Use only with a compatible 12V vehicle battery. Check the unit’s charge, condition and the operating limits before attempting to start a vehicle.</p><h3>02 · Connect with care</h3><p>Turn off the vehicle and electrical loads. Follow the manual’s clamp sequence and polarity instructions. Confirm the clamp ready indication before starting.</p><h3>03 · Pack &amp; care</h3><p>Remove the clamps as directed after starting. Keep the unit and accessories together, away from water and heat, and recharge regularly while stored.</p>',
    action: 'Ask a setup question', issue: 'technical', link: '#resources', linkText: 'Back to A3 resources', foot: 'This overview does not replace the complete manual. Do not use a damaged unit or bypass clamp warnings.'
  }
};
function openPolicy(name) {
  const policy = policies[name];
  if (!policy) return;
  dialogContent.innerHTML = `<div class="dialog-icon">${icon(policy.icon)}</div><h2 id="dialog-title">${policy.title}</h2><p class="policy-lede">${policy.lede}</p>${policy.body}<div class="policy-links"><a class="button button-primary button-full" href="#support" data-issue="${policy.issue}">${policy.action} ${arrow}</a><a href="${policy.link}" ${policy.link.startsWith('https:') ? 'target="_blank" rel="noopener"' : ''}>${policy.linkText} ${policy.link.startsWith('https:') ? '↗' : '→'}</a></div><p class="policy-foot">${policy.foot}</p>`;
  dialog.showModal();
  dialog.scrollTop = 0;
  document.getElementById('close-dialog').focus({preventScroll: true});
}
function setIssue(value) {
  const input = document.querySelector(`input[name="issue"][value="${value}"]`);
  if (!input) return;
  input.checked = true;
  const [title, text] = guidance[value];
  document.getElementById('issue-guidance').innerHTML = `<strong>${title}</strong>${text}`;
  const orderRequired = ['returns', 'warranty', 'order'].includes(value);
  document.getElementById('support-order').required = orderRequired;
  document.getElementById('order-optional').textContent = orderRequired ? '(required)' : '(if available)';
  document.getElementById('order-hint').textContent = orderRequired ? 'Find it in your order confirmation email.' : 'You can ask a product question without an order.';
}
function requestPreview(event) {
  event.preventDefault();
  const form = event.target;
  if (!form.reportValidity()) return;
  formDraft = Object.fromEntries(new FormData(form).entries());
  const issueNames = {technical: 'Product & setup', order: 'Order & delivery', returns: 'Return request', warranty: 'Warranty claim'};
  document.getElementById('form-region').innerHTML = `<section class="review-pane" aria-labelledby="request-preview-heading"><span class="preview-badge">PREVIEW ONLY · NOT SENT</span><h2 id="request-preview-heading">Your request,<br>ready to review.</h2><p>Here’s the information our team would receive. Nothing has been sent from this demo.</p><dl class="review-list"><div><dt>Product</dt><dd>${escapeText(formDraft.model)}</dd></div><div><dt>Request</dt><dd>${escapeText(issueNames[formDraft.issue])}</dd></div><div><dt>Name</dt><dd>${escapeText(formDraft.name)}</dd></div><div><dt>Email</dt><dd>${escapeText(formDraft.email)}</dd></div><div><dt>Order</dt><dd>${escapeText(formDraft.order || 'Not provided')}</dd></div><div><dt>Message</dt><dd>${escapeText(formDraft.message)}</dd></div></dl><div class="review-actions"><button type="button" class="button button-outline" id="edit-request">Edit details</button><a class="button" href="#resources">Explore A3 resources ${arrow}</a></div><p class="privacy-note">For an actual request, email info@suntneew.com. No case has been created here.</p></section>`;
  scrollToElement(document.getElementById('form-region'));
  document.getElementById('edit-request').addEventListener('click', () => render('support', false, true));
}
function wireForm() {
  const form = document.getElementById('support-form');
  if (!form) return;
  form.addEventListener('submit', requestPreview);
  form.querySelectorAll('input[name="issue"]').forEach(input => input.addEventListener('change', () => setIssue(input.value)));
  for (const [name, value] of Object.entries(formDraft)) {
    if (name !== 'issue' && form.elements.namedItem(name)) form.elements.namedItem(name).value = value;
  }
  setIssue(formDraft.issue || 'technical');
}
function notify(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  toastTimer = setTimeout(() => { toast.hidden = true; }, 4500);
}
function scrollToElement(element) {
  if (element) window.scrollTo({top: element.getBoundingClientRect().top + window.scrollY - 78, behavior: 'instant'});
}
function render(route, resetScroll = true, keepDraft = false) {
  if (!['product', 'support', 'resources'].includes(route)) route = 'product';
  if (!keepDraft) formDraft = {};
  if (dialog.open) dialog.close();
  toast.hidden = true;
  document.body.classList.toggle('is-product', route === 'product');
  app.innerHTML = ({product, support, resources})[route]();
  document.title = `${{product: 'A3 · Purchase care', support: 'A3 · Product support', resources: 'A3 · Resources'}[route]} | SuntNeew preview`;
  document.querySelectorAll('.store-header nav a').forEach(link => link.setAttribute('aria-current', link.hash === `#${route}` ? 'page' : 'false'));
  wireForm();
  quantity = 1;
  if (resetScroll) {
    window.scrollTo({top: 0, behavior: 'instant'});
    if (route === 'product' && window.matchMedia('(max-width:800px)').matches) {
      requestAnimationFrame(() => {
        const purchase = document.getElementById('product-purchase');
        const care = document.getElementById('purchase-care');
        const available = window.innerHeight - 170;
        const position = Math.max(purchase.getBoundingClientRect().top + scrollY - 78, care.getBoundingClientRect().top + scrollY - Math.max(100, available - care.offsetHeight));
        window.scrollTo({top: position, behavior: 'instant'});
      });
    }
  }
  if (parent !== window) parent.postMessage({type: 'suntneew-route-changed', route}, location.origin);
}
function navigate(route, issue, faq) {
  if (location.hash !== `#${route}`) history.pushState(null, '', `#${route}`);
  render(route);
  if (issue) setIssue(issue);
  if (faq) {
    const detail = document.getElementById(faq);
    if (detail) { detail.open = true; scrollToElement(detail); }
  }
}
document.addEventListener('click', event => {
  const policyButton = event.target.closest('[data-policy]');
  if (policyButton) { openPolicy(policyButton.dataset.policy); return; }
  const imageButton = event.target.closest('[data-image]');
  if (imageButton) {
    document.getElementById('main-image').src = `assets/${imageButton.dataset.image}`;
    document.getElementById('main-image').alt = imageButton.dataset.imageAlt;
    document.getElementById('gallery-count').textContent = `${imageButton.dataset.imageIndex} / 03`;
    document.querySelectorAll('[data-image]').forEach(button => button.setAttribute('aria-pressed', String(button === imageButton)));
    return;
  }
  const quantityButton = event.target.closest('[data-quantity]');
  if (quantityButton) {
    quantity = Math.min(10, Math.max(1, quantity + Number(quantityButton.dataset.quantity)));
    document.getElementById('quantity').textContent = quantity;
    document.querySelector('.sticky-price>span').textContent = `A3 · ${quantity} ${quantity === 1 ? 'UNIT' : 'UNITS'} · UNIT PRICE`;
    return;
  }
  if (event.target.closest('[data-demo-cart]')) { notify('Purchase preview only. No items were added to a live cart.'); return; }
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;
  const route = link.hash.slice(1);
  if (!['product', 'support', 'resources'].includes(route)) return;
  event.preventDefault();
  if (link.dataset.anchor && document.getElementById(link.dataset.anchor)) {
    scrollToElement(document.getElementById(link.dataset.anchor));
    return;
  }
  document.getElementById('mobile-menu').hidden = true;
  document.getElementById('menu-button').setAttribute('aria-expanded', 'false');
  navigate(route, link.dataset.issue, link.dataset.openFaq);
});
document.getElementById('close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
document.getElementById('menu-button').addEventListener('click', () => {
  const menu = document.getElementById('mobile-menu');
  menu.hidden = !menu.hidden;
  document.getElementById('menu-button').setAttribute('aria-expanded', String(!menu.hidden));
});
window.addEventListener('message', event => {
  if (event.source !== parent || event.origin !== location.origin || event.data?.type !== 'suntneew-route') return;
  navigate(event.data.route);
});
window.addEventListener('popstate', () => render(location.hash.slice(1)));
render(location.hash.slice(1) || 'product');
