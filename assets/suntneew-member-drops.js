(() => {
  'use strict';
  if (customElements.get('suntneew-member-drops')) return;
  const core = window.SuntNeewMemberDrops;
  if (!core) return;
  class MemberDrops extends HTMLElement {
    connectedCallback() {
      if (this.initialized) return;
      this.initialized = true;
      this.config = JSON.parse(this.querySelector('[data-drop-config]').textContent);
      this.choices = new Map();
      this.busy = new Set();
      this.pendingRefresh = null;
      this.stale = false;
      this.controller = new AbortController();
      this.anchorTime = Number(this.config.serverNow);
      this.anchorTick = performance.now();
      this.setupClaim();
      this.usePreview();
      this.render();
      this.querySelector('[data-loading]').hidden = true;
      this.querySelector('[data-content]').hidden = false;
      this.timer = setInterval(() => this.tick(), 1000);
      if (!this.config.designMode) {
        this.stale = true; // A cached Liquid response cannot authorize a purchase.
        this.refresh();
        this.refreshTimer = setInterval(() => { if (!document.hidden) this.refresh(); }, 60000);
        document.addEventListener('visibilitychange', () => { if (!document.hidden) this.refresh(); }, { signal: this.controller.signal });
        window.addEventListener('pageshow', e => { if (e.persisted) this.refresh(); }, { signal: this.controller.signal });
      }
    }
    disconnectedCallback() {
      clearInterval(this.timer);
      clearInterval(this.refreshTimer);
      this.controller?.abort();
      this.requestController?.abort();
      this.initialized = false;
    }
    t(key, replacements = {}) {
      let value = this.config.text[key] || key;
      for (const [name, replacement] of Object.entries(replacements)) value = value.replaceAll(`{${name}}`, String(replacement));
      return value;
    }
    $(selector) { return this.querySelector(selector); }
    text(selector, value) { this.$(selector).textContent = value; }
    now() { return this.anchorTime + performance.now() - this.anchorTick; }
    money(value) { return new Intl.NumberFormat(this.config.locale, { style: 'currency', currency: this.config.currency }).format(value / 100); }
    usePreview() {
      if (!this.config.designMode) return;
      const mode = this.config.previewState;
      if (mode === 'auto') return;
      const date = this.now();
      const campaign = this.config.campaigns[0];
      campaign.enabled = true;
      campaign.startsAt = new Date(date + (mode === 'preview' ? 86400000 * 2 : -86400000)).toISOString();
      campaign.endsAt = new Date(date + (mode === 'ended' ? -60000 : 86400000 * 3)).toISOString();
      if (!campaign.products.length) {
        campaign.products = [{ id: 'demo', title: this.t('demo_product'), image: this.config.demoImage, cutout: true,
          rule: 'percentage', value: 25, variants: [{ id: 'demo-variant', title: 'Default Title', price: 7999, available: true, image: this.config.demoImage }] }];
      }
      // Preview states never modify stored schedules or allow commerce actions.
      this.config.campaigns[1].enabled = false;
    }
    render() {
      const { campaign, conflict } = core.chooseCampaign(this.config.campaigns, this.now());
      this.campaign = campaign;
      this.conflict = conflict;
      this.phase = campaign ? core.phase(campaign, this.now()) : 'disabled';
      this.issues = core.validateCampaigns(this.config.campaigns);
      this.dataset.phase = this.phase;
      this.dataset.reveal = campaign?.reveal || 'mystery';
      const phase = ['live', 'preview', 'ended'].includes(this.phase) ? this.phase : 'idle';
      this.text('[data-member-label]', this.t(this.config.member && this.config.claimMode !== 'native-codes' ? 'member_unlocked' : 'members_only'));
      this.text('[data-status]', this.t(`status_${phase}`));
      this.text('[data-number]', campaign?.number ? `DROP ${campaign.number}` : this.t('members_only'));
      this.text('[data-stage-number]', campaign?.number || '01');
      this.text('[data-hero-title]', campaign?.title || this.t(`title_${phase}`));
      this.text('[data-intro]', this.t(this.config.claimMode === 'native-codes' && phase === 'live' ? 'claim_intro' : `intro_${phase}`));
      this.text('[data-stage-caption]', this.t(`status_${phase}`));
      this.text('[data-catalog-kicker]', this.t(phase === 'preview' ? 'next_drop' : 'member_selection'));
      this.text('[data-catalog-title]', this.t(phase === 'preview' ? 'coming_soon' : phase === 'ended' ? 'previous_drop' : 'shop_drop'));
      const products = campaign?.products || [];
      this.text('[data-product-count]', products.length ? this.t('product_count', { count: products.length }) : '');
      const heroAction = this.$('[data-hero-action]');
      const browse = this.config.claimMode === 'native-codes' || this.config.member || !this.config.accountsEnabled || this.config.designMode;
      heroAction.href = browse ? `#DropProducts-${this.config.sectionId}` : this.config.loginUrl;
      this.text('[data-hero-action-label]', this.t(browse ? 'explore_drop' : 'join_free'));
      this.$('[data-clock-wrap]').hidden = !(campaign?.showTime && (phase === 'live' || phase === 'preview'));
      this.text('[data-clock-label]', this.t(phase === 'live' ? 'ends_in' : 'starts_in'));
      const container = this.$('[data-products]');
      container.replaceChildren();
      container.dataset.count = String(products.length);
      for (const product of products) container.append(this.card(product));
      this.$('[data-empty]').hidden = products.length > 0;
      this.stage(products.find(p => p.id === this.spotlight) || products[0]);
      let notice = '';
      if (this.issues.length || conflict) notice = this.t('not_available');
      else if (this.config.claimMode !== 'native-codes' && !this.config.accountsEnabled && phase === 'live') notice = this.t('not_available');
      else if (phase === 'live' && !this.config.designMode && this.config.claimMode !== 'native-codes' && !core.matchingBinding(this.config, campaign, this.config.binding)) notice = this.t('not_available');
      else if (this.stale && phase === 'live') notice = this.t('refreshing');
      this.text('[data-notice]', notice);
      this.$('[data-notice]').hidden = !notice;
      if (this.config.designMode && this.$('[data-editor-issues]')) {
        this.text('[data-editor-issues]', this.issues.join(' '));
      }
      this.renderNext();
      this.tick();
    }
    variant(product) {
      return product.variants?.find(v => String(v.id) === this.choices.get(product.id)) || product.variants?.find(v => v.available) || product.variants?.[0];
    }
    stage(product) {
      const image = this.$('[data-stage-image]');
      const variant = product && this.variant(product);
      const source = (variant?.image || product?.image || '');
      const concealed = this.phase === 'preview' && this.campaign?.reveal === 'mystery';
      image.hidden = !source || concealed;
      this.$('[data-stage-mystery]').hidden = !!source && !concealed;
      if (source && !concealed) image.src = source;
      else image.removeAttribute('src');
      image.classList.toggle('sn-drops__stage-image--photo', !product?.cutout);
    }
    card(product) {
      const card = this.$('[data-card-template]').content.firstElementChild.cloneNode(true);
      const get = s => card.querySelector(s);
      card.dataset.productId = product.id;
      const hidden = !!product.locked || (this.phase === 'preview' && this.campaign.reveal !== 'full');
      card.dataset.locked = String(hidden);
      get('[data-card-title]').textContent = hidden ? this.t('mystery_product') : product.title;
      get('[data-card-tag]').textContent = product.tag || this.t(hidden ? 'reveals_soon' : 'members_only');
      const variant = this.variant(product);
      const image = variant?.image || product.image;
      if (image && !(this.phase === 'preview' && this.campaign.reveal === 'mystery')) {
        get('[data-card-image]').src = image;
        get('[data-card-image]').alt = hidden ? '' : product.title;
        get('[data-card-image]').hidden = false;
        get('[data-card-mystery]').hidden = true;
      }
      if (product.url && !hidden) {
        get('[data-details]').href = product.url;
        get('[data-details]').hidden = false;
      }
      if (!hidden && product.variants?.length > 1) {
        const select = get('[data-variant]');
        select.hidden = false;
        select.setAttribute('aria-label', `${product.title}: ${this.t('choose_variant')}`);
        for (const v of product.variants) {
          const option = document.createElement('option');
          option.value = v.id;
          option.textContent = `${v.title}${v.available ? '' : ` — ${this.t('sold_out')}`}`;
          option.selected = v.id === variant?.id;
          select.append(option);
        }
        select.addEventListener('change', () => {
          this.choices.set(product.id, select.value);
          this.spotlight = product.id;
          this.updateCard(card, product);
          this.stage(product);
        });
      }
      get('[data-buy]').addEventListener('click', () => this.buy(product.id));
      get('[data-login]').href = this.config.loginUrl;
      this.updateCard(card, product);
      return card;
    }
    updateCard(card, product) {
      const get = s => card.querySelector(s), variant = this.variant(product);
      const concealed = card.dataset.locked === 'true';
      const offer = variant && core.price(variant.price, product.rule, product.value);
      const verified = core.isVerified(this.config, this.campaign, product, variant);
      const native = this.config.claimMode === 'native-codes';
      const allowed = this.phase === 'live' && verified && !this.conflict && !this.issues.length && !this.stale && (native || this.config.accountsEnabled);
      get('[data-price-wrap]').hidden = concealed || !offer || (this.phase === 'live' && !verified && !this.config.designMode);
      if (offer) {
        get('[data-price]').textContent = this.money(offer.final);
        get('[data-compare]').textContent = this.money(offer.base);
        get('[data-compare]').hidden = !this.config.showCompare;
        const percent = this.t('save_percent', { percent: offer.percent });
        const amount = this.t('save_amount', { amount: this.money(offer.saving) });
        get('[data-saving]').textContent = this.config.savingsDisplay === 'amount' ? amount : this.config.savingsDisplay === 'both' ? `${percent} · ${amount}` : percent;
        get('[data-saving]').hidden = this.config.savingsDisplay === 'hidden';
      }
      if (!concealed && variant?.image) get('[data-card-image]').src = variant.image;
      let label = 'coming_soon';
      if (this.phase === 'ended') label = 'ended';
      else if (this.phase === 'live') label = !variant?.available ? 'sold_out' : allowed ? 'add_offer' : 'not_available_short';
      if (native && this.phase === 'live' && variant?.available && (allowed || this.config.designMode)) label = 'claim_open';
      else if (this.config.designMode && this.phase === 'live') label = 'preview_only';
      const busy = this.busy.has(product.id);
      if (busy) label = 'adding';
      get('[data-buy]').textContent = this.t(label);
      get('[data-buy]').disabled = native ? (!(allowed || (this.config.designMode && this.phase === 'live')) || !variant?.available || busy) : (!allowed || !this.config.member || !variant?.available || this.config.designMode || busy);
      get('[data-buy]').setAttribute('aria-busy', String(busy));
      const showLogin = !native && this.config.accountsEnabled && !this.config.member && !this.config.designMode && (this.phase === 'preview' || (allowed && variant?.available));
      get('[data-login]').hidden = !showLogin;
      get('[data-buy]').hidden = showLogin;
      get('[data-card-note]').textContent = this.t(this.phase === 'ended' ? 'offer_ended' : this.phase === 'preview' ? 'reveals_soon' : 'no_stacking');
    }
    renderNext() {
      const next = this.config.campaigns.filter(c => c !== this.campaign && core.phase(c, this.now()) === 'preview').sort((a, b) => core.timestamp(a.startsAt) - core.timestamp(b.startsAt))[0];
      const shown = !!next && this.config.showNext;
      this.$('[data-next]').hidden = !shown;
      if (!shown) return;
      this.text('[data-next-title]', next.title || this.t('title_preview'));
      let detail = next.showTime ? this.t('starts_on', { date: new Intl.DateTimeFormat(this.config.locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(next.startsAt)) }) : this.t('date_unannounced');
      if (next.reveal === 'full') detail += ` · ${next.products.map(p => p.title).filter(Boolean).join(' / ')}`;
      this.text('[data-next-date]', detail);
      const stack = this.$('[data-next-stack]');
      stack.replaceChildren();
      for (const product of next.products.slice(0, 3)) {
        const tile = document.createElement('div'); tile.className = 'sn-drops__next-tile';
        if (next.reveal === 'full' && product.image) {
          const image = document.createElement('img'); image.src = product.image; image.alt = ''; image.loading = 'lazy'; tile.append(image);
        } else tile.append(this.$('[data-stage-mystery] svg').cloneNode(true));
        stack.append(tile);
      }
    }
    tick() {
      if (!this.campaign || !this.isConnected) return;
      const current = core.phase(this.campaign, this.now());
      if (current !== this.phase) {
        this.stale = true;
        if (this.config.designMode) this.render();
        else this.refresh();
        // Disable every purchase immediately, including while a refresh is in flight.
        this.querySelectorAll('[data-buy]').forEach(b => { b.disabled = true; });
      }
      const target = core.timestamp(this.phase === 'live' ? this.campaign.endsAt : this.campaign.startsAt);
      if (Number.isFinite(target)) {
        const parts = core.countdown(target, this.now());
        this.querySelectorAll('[data-clock-part]').forEach((el, i) => { if (el.textContent !== parts[i]) el.textContent = parts[i]; });
      }
    }
    async refresh() {
      if (this.config.designMode) return true;
      if (this.pendingRefresh) return this.pendingRefresh;
      this.pendingRefresh = (async () => {
        const request = new AbortController(); this.requestController = request;
        const timeout = setTimeout(() => request.abort(), 12000);
        try {
          const url = new URL(this.config.pageUrl, location.origin);
          url.searchParams.set('sections', this.config.sectionId);
          url.searchParams.set('_drop', String(Date.now()));
          const response = await fetch(url, { credentials: 'same-origin', cache: 'no-store', signal: request.signal });
          if (!response.ok) throw new Error('refresh');
          const payload = await response.json();
          const doc = new DOMParser().parseFromString(payload[this.config.sectionId] || '', 'text/html');
          const source = doc.querySelector('[data-drop-config]');
          if (!source) throw new Error('missing section');
          const config = JSON.parse(source.textContent);
          if (config.sectionId !== this.config.sectionId || config.designMode) throw new Error('invalid section');
          this.config = config;
          const serverDate = Date.parse(response.headers.get('date') || '');
          this.anchorTime = Number.isFinite(serverDate) ? serverDate : Number(config.serverNow);
          this.anchorTick = performance.now();
          this.stale = false;
          this.render();
          return true;
        } catch (error) {
          this.stale = true;
          if (this.isConnected) this.render();
          return false;
        } finally {
          clearTimeout(timeout);
          this.pendingRefresh = null;
        }
      })();
      return this.pendingRefresh;
    }
    feedback(id, key, viewCart = false) {
      const card = Array.from(this.querySelectorAll('[data-product-id]')).find(el => el.dataset.productId === id);
      const target = card?.querySelector('[data-feedback]');
      if (!target) return;
      target.textContent = this.t(key);
      if (viewCart) {
        const link = document.createElement('a'); link.href = `${this.config.rootUrl.replace(/\/?$/, '/')}cart`;
        link.textContent = ` ${this.t('view_cart')}`; link.className = 'sn-drops__link'; target.append(link);
      }
      target.hidden = false;
    }
    setupClaim() {
      const dialog = this.$('[data-claim-dialog]');
      const contact = this.$('[data-claim-contact]'), verify = this.$('[data-claim-verify]');
      this.claimGeneration = 0;
      this.$('[data-claim-close]').addEventListener('click', () => dialog.close());
      dialog.addEventListener('close', () => { this.claimGeneration++; contact.reset(); verify.reset(); this.claimResult = null; this.challengeId = null; });
      this.$('[data-claim-restart]').addEventListener('click', () => { this.claimGeneration++; contact.hidden = false; verify.hidden = true; this.challengeId = null; this.text('[data-claim-feedback]', ''); });
      contact.addEventListener('submit', async event => {
        event.preventDefault();
        if (this.claimPending) return;
        const values = Object.fromEntries(new FormData(contact));
        if (!/^\+[1-9]\d{7,14}$/.test(values.phone.replace(/[\s()-]/g, ''))) { this.claimMessage('invalid_contact'); return; }
        const generation = this.claimGeneration;
        this.claimPending = true; this.claimBusy(true); this.claimMessage('claim_sending');
        try {
          const response = await fetch(contact.action, { method: 'POST', body: new FormData(contact), credentials: 'same-origin' });
          if (!response.ok && !this.config.designMode) throw new Error('backend_unavailable');
          const data = { challengeId: 'native-form' };
          if (generation !== this.claimGeneration) return;
          this.challengeId = data.challengeId; contact.hidden = true; verify.hidden = true;
          this.$('[data-claim-success]').hidden = false;
          this.text('[data-claim-feedback]', this.config.designMode ? this.t('claim_demo_done') : this.t('claim_ready'));
          this.$('[data-claim-checkout]').disabled = this.config.designMode;
        } catch (error) { if (generation === this.claimGeneration) this.claimMessage(error.message); }
        finally { this.claimPending = false; this.claimBusy(false); }
      });
      verify.addEventListener('submit', async event => {
        event.preventDefault(); if (this.claimPending) return;
        const generation = this.claimGeneration;
        this.claimPending = true; this.claimBusy(true);
        try {
          if (this.config.designMode) {
            if (verify.elements.code.value !== '123456') throw new Error('invalid_code');
            this.claimResult = { preview: true, discountPath: `/discount/${this.config.fixedDiscountCode}?redirect=%2Fcheckout` };
          } else {
            const data = await this.claimFetch('verify', { challengeId: this.challengeId, code: verify.elements.code.value });
            if (generation !== this.claimGeneration) return;
            if (String(data.variantId) !== String(this.claimVariant.id) || !/^MD-[A-F0-9]{28}$/.test(data.code) || data.discountPath !== `/discount/${data.code}?redirect=%2Fcheckout`) throw new Error('backend_unavailable');
            this.claimResult = data;
          }
          verify.hidden = true; this.$('[data-claim-success]').hidden = false;
          this.claimMessage(this.config.designMode ? 'claim_demo_done' : 'claim_ready');
          this.$('[data-claim-checkout]').disabled = this.config.designMode;
        } catch (error) { if (generation === this.claimGeneration) this.claimMessage(error.message); }
        finally { this.claimPending = false; this.claimBusy(false); if (this.config.designMode) this.$('[data-claim-checkout]').disabled = true; }
      });
      this.$('[data-claim-checkout]').addEventListener('click', () => this.claimCheckout());
    }
    claimBusy(value) { this.querySelectorAll('[data-claim-dialog] button:not([data-claim-close])').forEach(b => { b.disabled = value; }); }
    claimMessage(key) { this.text('[data-claim-feedback]', this.t(this.config.text[key] ? key : 'backend_unavailable')); }
    async claimFetch(action, body) {
      const endpoint = this.config.claimEndpoint;
      if (!/^\/apps\/[a-z0-9-]+$/.test(endpoint)) throw new Error('backend_unavailable');
      const response = await fetch(`${endpoint}/${action}`, { method: 'POST', credentials: 'same-origin', signal: AbortSignal.timeout(20000), headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'backend_unavailable');
      return result;
    }
    openClaim(id) {
      if (this.claimPending) return;
      const product = this.campaign?.products.find(p => p.id === id), variant = product && this.variant(product);
      if (this.phase !== 'live' || !variant?.available || (!this.config.designMode && (this.stale || !core.isVerified(this.config, this.campaign, product, variant)))) return;
      this.claimVariant = { ...variant }; this.claimCampaign = this.campaign.key;
      this.claimGeneration++; this.claimResult = null; this.claimMarker = null; this.claimAdded = false;
      this.$('[data-claim-contact]').hidden = false; this.$('[data-claim-verify]').hidden = true; this.$('[data-claim-success]').hidden = true;
      this.text('[data-claim-product]', `${product.title} · ${this.money(core.price(variant.price, product.rule, product.value).final)}`);
      this.claimMessage(this.config.designMode ? 'claim_demo_start' : 'claim_checkout_note');
      this.claimBusy(false); this.$('[data-claim-dialog]').showModal();
    }
    async claimCheckout() {
      const result = this.claimResult || (!this.config.designMode && this.config.fixedDiscountCode ? { discountPath: `/discount/${this.config.fixedDiscountCode}?redirect=%2Fcheckout`, expiresAt: this.campaign?.endsAt } : null);
      if (!result || this.claimPending) return;
      const generation = this.claimGeneration;
      this.claimPending = true; this.claimBusy(true);
      const root = this.config.rootUrl.replace(/\/?$/, '/');
      try {
        if (this.config.claimMode === 'native-codes') { location.assign(result.discountPath); return; }
        if (!await this.refresh() || this.phase !== 'live' || Date.parse(result.expiresAt) <= this.now()) throw new Error('not_available');
        const product = this.campaign.products.find(p => p.variants?.some(v => String(v.id) === String(this.claimVariant.id)));
        const variant = product?.variants.find(v => String(v.id) === String(this.claimVariant.id));
        if (!variant?.available || !core.isVerified(this.config, this.campaign, product, variant)) throw new Error('not_available');
        if (!this.claimMarker) this.claimMarker = `claim-${crypto.randomUUID()}`;
        // Reconcile a lost POST response before retrying; never add a second unit by accident.
        const existing = await fetch(`${root}cart.js`, { credentials: 'same-origin', cache: 'no-store' });
        if (!existing.ok) throw new Error('add_failed');
        const cart = await existing.json();
        if (cart.currency !== this.config.currency) throw new Error('not_available');
        this.claimAdded = cart.items.some(i => i.properties?._member_drop_line === this.claimMarker);
        if (generation !== this.claimGeneration) return;
        if (!this.claimAdded) {
          const added = await fetch(`${root}cart/add.js`, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: [{ id: variant.id, quantity: 1, properties: { _member_drop: this.claimCampaign, _member_drop_line: this.claimMarker } }] }) });
          if (!added.ok) throw new Error('add_failed');
          this.claimAdded = true;
        }
        // Native customer-restricted codes apply when the verified email is entered at checkout.
        // Existing cart items are preserved; Shopify enforces discount combinations and expiry.
        if (generation === this.claimGeneration) location.assign(result.discountPath);
      } catch (error) { this.claimMessage(error.message); }
      finally { this.claimPending = false; this.claimBusy(false); }
    }
    async buy(id) {
      if (this.config.claimMode === 'native-codes') { this.openClaim(id); return; }
      if (this.config.designMode || this.busy.has(id)) return;
      this.busy.add(id);
      let lineKey = null;
      let cartWasAdded = false;
      let resolved = false;
      const marker = `drop-${crypto.randomUUID()}`;
      const root = this.config.rootUrl.replace(/\/?$/, '/');
      try {
        if (!await this.refresh()) throw new Error('refreshing');
        const product = this.campaign?.products.find(p => p.id === id), variant = product && this.variant(product);
        if (!this.config.member) { this.feedback(id, 'login_again'); return; }
        if (this.phase !== 'live' || this.conflict || this.issues.length || !variant?.available || !core.isVerified(this.config, this.campaign, product, variant)) throw new Error('not_available');
        const expected = core.price(variant.price, product.rule, product.value).final;
        const sections = [];
        document.documentElement.dispatchEvent(new CustomEvent('cart:prepare-bundled-sections', { bubbles: true, detail: { sections } }));
        cartWasAdded = true; // Also reconcile a POST whose response is lost after Shopify accepts it.
        const response = await fetch(`${root}cart/add.js`, {
          method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
          body: JSON.stringify({ items: [{ id: variant.id, quantity: 1, properties: { _member_drop: this.campaign.key, _member_drop_line: marker } }], sections, sections_url: this.config.pageUrl })
        });
        const result = await response.json();
        if (!response.ok) throw new Error('add_failed');
        const cartResponse = await fetch(`${root}cart.js`, { cache: 'no-store', credentials: 'same-origin' });
        if (!cartResponse.ok) throw new Error('price_changed');
        const cart = await cartResponse.json();
        const line = cart.items.find(item => item.properties?._member_drop_line === marker);
        lineKey = line?.key;
        // Never quietly send an undiscounted or additionally discounted item to checkout.
        if (!line || line.quantity !== 1 || line.final_line_price !== expected || cart.currency !== this.config.currency || (cart.cart_level_discount_applications || []).some(d => d.total_allocated_amount > 0)) throw new Error('price_changed');
        resolved = true;
        cart.sections = result.sections;
        document.documentElement.dispatchEvent(new CustomEvent('cart:change', { bubbles: true, detail: { baseEvent: 'variant:add', cart } }));
        this.dispatchEvent(new CustomEvent('variant:add', { bubbles: true, detail: { items: result.items || [result], cart } }));
        this.feedback(id, 'added', true);
      } catch (error) {
        let rollbackFailed = false;
        if (cartWasAdded && !resolved) {
          try {
            if (!lineKey) {
              const r = await fetch(`${root}cart.js`, { cache: 'no-store', credentials: 'same-origin' });
              if (!r.ok) throw new Error('cart unavailable');
              const c = await r.json(); lineKey = c.items.find(item => item.properties?._member_drop_line === marker)?.key;
            }
            if (lineKey) {
              const r = await fetch(`${root}cart/change.js`, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: lineKey, quantity: 0 }) });
              if (!r.ok) throw new Error('rollback');
            }
          } catch { rollbackFailed = true; }
          document.dispatchEvent(new CustomEvent('cart:refresh'));
        }
        this.feedback(id, rollbackFailed ? 'review_cart' : this.config.text[error.message] ? error.message : 'add_failed', rollbackFailed);
      } finally {
        this.busy.delete(id);
        const product = this.campaign?.products.find(p => p.id === id);
        const card = Array.from(this.querySelectorAll('[data-product-id]')).find(el => el.dataset.productId === id);
        if (product && card) this.updateCard(card, product);
      }
    }
  }
  customElements.define('suntneew-member-drops', MemberDrops);
})();
