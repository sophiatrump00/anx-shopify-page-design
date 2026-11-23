(() => {
  const DISMISS_KEY = 'sn_auth_prompt_dismissed_until';
  const ACTED_SESSION_KEY = 'sn_auth_prompt_acted';
  const PENDING_UNLOCK_KEY = 'sn_auth_pending_unlock';
  const WELCOME_CODE_KEY = 'sn_auth_welcome_code';
  const APPLIED_SESSION_KEY = 'sn_auth_applied_code';
  const UNLOCK_ACK_KEY = 'sn_auth_unlock_ack';
  const INAPP_UA_RE = /FBAN|FBAV|Instagram|BytedanceWebview|Musical_ly|TikTok|Line\/|MicroMessenger/i;

  function safeGet(storage, key) {
    try {
      return storage ? storage.getItem(key) : null;
    } catch {
      return null;
    }
  }

  function safeSet(storage, key, value) {
    try {
      if (storage) storage.setItem(key, value);
    } catch {
      // Ignore storage quota or private-mode restrictions.
    }
  }

  function safeRemove(storage, key) {
    try {
      if (storage) storage.removeItem(key);
    } catch {
      // Ignore storage restrictions.
    }
  }

  function pickDeterministicCode(pool, customerId) {
    if (!customerId) {
      return pool[Math.floor(Math.random() * pool.length)];
    }
    const str = String(customerId);
    let hash = 0;
    for (let i = 0; i < str.length; i += 1) {
      hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    }
    return pool[hash % pool.length];
  }

  function fallbackCopyText(text) {
    try {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      const copied = typeof document.execCommand === 'function' && document.execCommand('copy');
      document.body.removeChild(area);
      return Boolean(copied);
    } catch {
      return false;
    }
  }

  class SuntneewAuthPrompt extends HTMLElement {
    constructor() {
      super();
      this._openTimer = null;
      this._copyResetTimer = null;
      this._attentionTimer = null;
      this._observer = null;
      this._touchStart = null;
      this._assignedCode = '';
      this._boundUpdateOffset = () => this.updateBottomOffset();
      this._boundSyncSuspension = () => this.syncOverlaySuspension();
      this._boundKeydown = (event) => {
        if (event.key === 'Escape' && this.dataset.open === 'true') {
          this.dismiss();
        }
      };
    }

    connectedCallback() {
      if (this._initialized) return;
      this._initialized = true;

      this._actionsEl = this.querySelector('[data-auth-actions]');
      this._googleBtn = this.querySelector('[data-auth-google]');
      this._facebookBtn = this.querySelector('[data-auth-facebook]');
      this._otherBtn = this.querySelector('[data-auth-other]');
      this._consentInput = this.querySelector('[data-auth-consent]');
      this._closeBtn = this.querySelector('[data-auth-close]');
      this._launcherBtn = this.querySelector('[data-auth-launcher]');
      this._copyBtn = this.querySelector('[data-offer-copy]');
      this._copyCodeText = this.querySelector('[data-offer-code-text]');
      this._copyActionLabel = this.querySelector('[data-offer-copy-label]');
      this._lockedBtn = this.querySelector('[data-offer-locked]');
      this._continueBtn = this.querySelector('[data-unlock-continue]');

      if (this.isUnlockedState()) {
        this.initOfferCode();
        if (!this.isDesignMode()) {
          this.ensureSessionDiscountApplied();
          safeRemove(window.sessionStorage, PENDING_UNLOCK_KEY);
        }
        this.bindUnlockedEvents();

        if (this.isPreviewForced()) {
          this.openUnlocked();
          return;
        }

        if (this.isDesignMode()) return;

        if (safeGet(window.localStorage, UNLOCK_ACK_KEY) === this.getUnlockAckToken()) {
          this.hide(false);
          return;
        }

        this._openTimer = window.setTimeout(() => this.openUnlocked(), 300);
        return;
      }

      if (this.isCustomerSignedIn() && !this.isDesignMode()) {
        this.hide(false);
        return;
      }

      this.adaptForEnvironment();
      this.syncUrls();
      this.bindGuestEvents();

      if (this.isPreviewForced()) {
        this.open(true);
        return;
      }

      if (this.isDesignMode()) return;

      if (this.isSuppressed()) return;

      // Non-intrusive mode: show compact bottom-left 6% OFF launcher pill instead of auto-opening a blocking card.
      this.showLauncher();
    }

    showLauncher() {
      this.clearOpenTimer();
      if (this._openRaf) {
        window.cancelAnimationFrame(this._openRaf);
        this._openRaf = null;
      }
      this.hidden = false;
      this.dataset.open = 'false';
      this.dataset.launcher = 'true';
      if (this._launcherBtn) this._launcherBtn.setAttribute('aria-expanded', 'false');
      this.updateBottomOffset();
      this.syncOverlaySuspension();
      this.attachOpenListeners();
    }

    disconnectedCallback() {
      this.clearOpenTimer();
      if (this._copyResetTimer) {
        window.clearTimeout(this._copyResetTimer);
        this._copyResetTimer = null;
      }
      if (this._attentionTimer) {
        window.clearTimeout(this._attentionTimer);
        this._attentionTimer = null;
      }
      this.teardownOpenListeners();
      document.removeEventListener('shopify:section:select', this._onSectionSelect);
      document.removeEventListener('shopify:section:deselect', this._onSectionDeselect);
    }

    isDesignMode() {
      return this.dataset.designMode === 'true' || Boolean(window.Shopify && window.Shopify.designMode);
    }

    isPreviewForced() {
      try {
        return new URLSearchParams(window.location.search).get('sn_auth_preview') === '1';
      } catch {
        return false;
      }
    }

    isUnlockedState() {
      return this.dataset.authState === 'unlocked';
    }

    getUnlockAckToken() {
      return this.dataset.customerId ? String(this.dataset.customerId) : '1';
    }

    isCustomerSignedIn() {
      if (this.dataset.signedIn === 'true') return true;
      const storeEl = document.querySelector('shopify-store');
      return Boolean(storeEl && storeEl.getAttribute('customer-access-token'));
    }

    isSuppressed() {
      if (safeGet(window.sessionStorage, ACTED_SESSION_KEY) === '1') return true;
      const until = Number(safeGet(window.localStorage, DISMISS_KEY) || 0);
      return Number.isFinite(until) && until > Date.now();
    }

    initOfferCode() {
      const raw = this.dataset.offerCodes || '';
      const pool = raw
        .split(/[,;\n]+/)
        .map((code) => code.trim())
        .filter(Boolean);
      if (pool.length === 0) {
        this._assignedCode = this._copyBtn ? this._copyBtn.dataset.offerCode || '' : '';
        return;
      }

      let chosen = '';
      if (this.dataset.customerId) {
        chosen = pickDeterministicCode(pool, this.dataset.customerId);
      } else {
        const saved = safeGet(window.localStorage, WELCOME_CODE_KEY);
        chosen = saved && pool.includes(saved) ? saved : pickDeterministicCode(pool, null);
      }
      safeSet(window.localStorage, WELCOME_CODE_KEY, chosen);
      this._assignedCode = chosen;

      if (this._copyCodeText) this._copyCodeText.textContent = chosen;
      if (this._copyBtn) {
        this._copyBtn.dataset.offerCode = chosen;
        this._copyBtn.setAttribute('aria-label', `Copy discount code ${chosen}`);
      }
    }

    ensureSessionDiscountApplied() {
      if (!this._assignedCode) return;
      if (safeGet(window.sessionStorage, APPLIED_SESSION_KEY) === this._assignedCode) return;
      this.preApplyDiscountCookie();
      safeSet(window.sessionStorage, APPLIED_SESSION_KEY, this._assignedCode);
    }

    preApplyDiscountCookie() {
      if (!this._assignedCode || typeof window.fetch !== 'function') return;
      try {
        window
          .fetch(`/discount/${encodeURIComponent(this._assignedCode)}`, {
            method: 'GET',
            credentials: 'same-origin',
            keepalive: true,
          })
          .catch(() => {});
      } catch {
        // Ignore network errors on pre-apply hint.
      }
    }

    buildReturnTo() {
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('sn_auth_preview');
        const query = url.searchParams.toString();
        const path = url.pathname && url.pathname.startsWith('/') ? url.pathname : '/';
        return query ? `${path}?${query}` : path;
      } catch {
        return '/';
      }
    }

    buildAuthUrl(provider) {
      const base = this.dataset.loginUrl || '/customer_authentication/login';
      const url = new URL(base, window.location.origin);
      url.searchParams.set('return_to', this.buildReturnTo());
      if (provider) {
        url.searchParams.set('acr_values', `provider:${provider}`);
      } else {
        url.searchParams.delete('acr_values');
      }
      if (this._consentInput) {
        url.searchParams.set('marketing_consent', this._consentInput.checked ? 'true' : 'false');
      }
      return `${url.pathname}${url.search}`;
    }

    syncUrls() {
      if (this._googleBtn) this._googleBtn.setAttribute('href', this.buildAuthUrl('google'));
      if (this._facebookBtn) this._facebookBtn.setAttribute('href', this.buildAuthUrl('facebook'));
      if (this._otherBtn) this._otherBtn.setAttribute('href', this.buildAuthUrl(null));
    }

    adaptForEnvironment() {
      if (!this._actionsEl || !this._googleBtn || !this._otherBtn) return;
      const ua = (navigator && navigator.userAgent) || '';
      if (!INAPP_UA_RE.test(ua)) return;

      this.dataset.inappWebview = 'true';
      if (this._facebookBtn) {
        this._actionsEl.insertBefore(this._facebookBtn, this._actionsEl.firstChild);
        return;
      }
      this._actionsEl.insertBefore(this._otherBtn, this._googleBtn);
      this._otherBtn.classList.remove('sn-auth-prompt__btn--secondary');
      this._otherBtn.classList.add('sn-auth-prompt__btn--primary');
      this._googleBtn.classList.remove('sn-auth-prompt__btn--primary');
      this._googleBtn.classList.add('sn-auth-prompt__btn--secondary');
    }

    bindCommonEvents() {
      if (this._closeBtn) {
        this._closeBtn.addEventListener('click', () => this.dismiss());
      }

      this.addEventListener(
        'touchstart',
        (event) => {
          if (event.touches.length !== 1) return;
          this._touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
        },
        { passive: true },
      );
      this.addEventListener(
        'touchend',
        (event) => {
          if (!this._touchStart || event.changedTouches.length !== 1 || window.innerWidth >= 750) {
            this._touchStart = null;
            return;
          }
          const dx = event.changedTouches[0].clientX - this._touchStart.x;
          const dy = event.changedTouches[0].clientY - this._touchStart.y;
          this._touchStart = null;
          if (dy > 36 && dy > Math.abs(dx)) {
            this.dismiss();
          }
        },
        { passive: true },
      );

      this._onSectionSelect = (event) => {
        if (event.detail && event.detail.sectionId === this.dataset.sectionId) {
          if (this.isUnlockedState()) {
            this.openUnlocked();
          } else {
            this.open(true);
          }
        }
      };
      this._onSectionDeselect = (event) => {
        if (event.detail && event.detail.sectionId === this.dataset.sectionId) {
          this.hide(false);
        }
      };
      document.addEventListener('shopify:section:select', this._onSectionSelect);
      document.addEventListener('shopify:section:deselect', this._onSectionDeselect);
    }

    bindUnlockedEvents() {
      this.bindCommonEvents();
      if (this._copyBtn) {
        this._copyBtn.addEventListener('click', () => this.copyOfferCode());
      }
      if (this._continueBtn) {
        this._continueBtn.addEventListener('click', () => this.acknowledgeUnlock());
      }
    }

    bindGuestEvents() {
      this.bindCommonEvents();
      if (this._launcherBtn) {
        this._launcherBtn.addEventListener('click', () => this.open(true));
      }
      if (this._consentInput) {
        this._consentInput.addEventListener('change', () => this.syncUrls());
      }
      if (this._lockedBtn) {
        this._lockedBtn.addEventListener('click', () => this.nudgeSignIn());
      }
      if (this._googleBtn) {
        this._googleBtn.addEventListener('click', () => {
          this.syncUrls();
          safeSet(window.sessionStorage, ACTED_SESSION_KEY, '1');
          safeSet(window.sessionStorage, PENDING_UNLOCK_KEY, '1');
        });
      }
      if (this._facebookBtn) {
        this._facebookBtn.addEventListener('click', () => {
          this.syncUrls();
          safeSet(window.sessionStorage, ACTED_SESSION_KEY, '1');
          safeSet(window.sessionStorage, PENDING_UNLOCK_KEY, '1');
        });
      }
      if (this._otherBtn) {
        this._otherBtn.addEventListener('click', (event) => this.handleOtherClick(event));
      }
    }

    nudgeSignIn() {
      if (!this._actionsEl) return;
      this._actionsEl.classList.remove('is-attention');
      void this._actionsEl.offsetWidth;
      this._actionsEl.classList.add('is-attention');
      if (this._attentionTimer) window.clearTimeout(this._attentionTimer);
      this._attentionTimer = window.setTimeout(() => {
        if (this._actionsEl) this._actionsEl.classList.remove('is-attention');
        this._attentionTimer = null;
      }, 420);
      const firstBtn = this._actionsEl.querySelector('.sn-auth-prompt__btn');
      if (firstBtn && typeof firstBtn.focus === 'function') {
        firstBtn.focus();
      }
    }

    findVisibleAccountComponent() {
      const candidates = Array.from(document.querySelectorAll('shopify-account'));
      return (
        candidates.find((el) => {
          if (typeof el.showModal !== 'function') return false;
          if (el.getClientRects && el.getClientRects().length > 0) return true;
          return el.offsetWidth > 0 || el.offsetHeight > 0;
        }) || null
      );
    }

    handleOtherClick(event) {
      this.syncUrls();
      safeSet(window.sessionStorage, ACTED_SESSION_KEY, '1');
      safeSet(window.sessionStorage, PENDING_UNLOCK_KEY, '1');

      const accountEl = this.findVisibleAccountComponent();
      if (!accountEl) return;

      event.preventDefault();
      const fallbackHref = this._otherBtn.getAttribute('href') || this.buildAuthUrl(null);
      this.hide(false);

      try {
        Promise.resolve(accountEl.showModal()).catch(() => {
          window.location.assign(fallbackHref);
        });
      } catch {
        window.location.assign(fallbackHref);
        return;
      }

      window.setTimeout(() => {
        const dialog = accountEl.shadowRoot && accountEl.shadowRoot.querySelector('dialog');
        if (!dialog || !dialog.open) {
          window.location.assign(fallbackHref);
        }
      }, 320);
    }

    copyOfferCode() {
      if (!this._copyBtn) return;
      const code = this._assignedCode || this._copyBtn.dataset.offerCode || '';
      if (!code) return;

      this.preApplyDiscountCookie();

      const copiedLabel = this._copyBtn.dataset.copiedLabel || 'Copied ✓';
      const defaultLabel = this._copyBtn.dataset.defaultLabel || 'Copy';
      const labelEl = this._copyActionLabel || this._copyBtn;

      const showCopied = () => {
        labelEl.textContent = copiedLabel;
        if (this._copyResetTimer) window.clearTimeout(this._copyResetTimer);
        this._copyResetTimer = window.setTimeout(() => {
          labelEl.textContent = defaultLabel;
          this._copyResetTimer = null;
        }, 2000);
      };

      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard
          .writeText(code)
          .then(showCopied)
          .catch(() => {
            if (fallbackCopyText(code)) showCopied();
          });
      } else if (fallbackCopyText(code)) {
        showCopied();
      }
    }

    clearOpenTimer() {
      if (this._openTimer) {
        window.clearTimeout(this._openTimer);
        this._openTimer = null;
      }
    }

    showCard() {
      this.removeAttribute('hidden');
      this.dataset.launcher = 'false';
      if (this._launcherBtn) this._launcherBtn.setAttribute('aria-expanded', 'true');
      this.updateBottomOffset();
      this.syncOverlaySuspension();
      this.attachOpenListeners();
      if (this._openRaf) window.cancelAnimationFrame(this._openRaf);
      this._openRaf = window.requestAnimationFrame(() => {
        this._openRaf = null;
        this.dataset.open = 'true';
      });
    }

    open(force) {
      this.clearOpenTimer();
      if (!force && (this.isCustomerSignedIn() || this.isSuppressed())) return;
      this.syncUrls();
      this.showCard();
    }

    openUnlocked() {
      this.clearOpenTimer();
      this.showCard();
    }

    hide(persistCooldown) {
      this.clearOpenTimer();
      if (this._openRaf) {
        window.cancelAnimationFrame(this._openRaf);
        this._openRaf = null;
      }
      this.dataset.open = 'false';
      this.dataset.launcher = 'false';
      if (this._launcherBtn) this._launcherBtn.setAttribute('aria-expanded', 'false');
      this.teardownOpenListeners();
      if (persistCooldown) {
        const days = Math.max(0, Number(this.dataset.cooldownDays || 1));
        if (days > 0) {
          safeSet(window.localStorage, DISMISS_KEY, String(Date.now() + days * 86400_000));
        } else {
          safeSet(window.sessionStorage, ACTED_SESSION_KEY, '1');
        }
      }
      this.setAttribute('hidden', '');
    }

    acknowledgeUnlock() {
      safeSet(window.localStorage, UNLOCK_ACK_KEY, this.getUnlockAckToken());
      this.hide(false);
    }

    dismiss() {
      if (this.isUnlockedState()) {
        this.acknowledgeUnlock();
        return;
      }
      if (this._launcherBtn && !this.isDesignMode()) {
        this.showLauncher();
        return;
      }
      this.hide(true);
    }

    updateBottomOffset() {
      if (window.innerWidth >= 750 && this.dataset.launcher !== 'true') {
        this.style.setProperty('--sn-auth-sticky-offset', '0px');
        return;
      }
      const bars = document.querySelectorAll('.sticky-buy, .mobile-purchase');
      let maxOffset = 0;
      for (const bar of bars) {
        const style = window.getComputedStyle(bar);
        if (
          style.display === 'none' ||
          style.visibility === 'hidden' ||
          style.pointerEvents === 'none' ||
          parseFloat(style.opacity || '1') <= 0.05
        ) {
          continue;
        }
        const rect = bar.getBoundingClientRect();
        if (rect.height <= 0 || rect.top >= window.innerHeight || rect.bottom < window.innerHeight - 8) {
          continue;
        }
        maxOffset = Math.max(maxOffset, Math.ceil(window.innerHeight - rect.top));
      }
      this.style.setProperty('--sn-auth-sticky-offset', `${maxOffset}px`);
    }

    syncOverlaySuspension() {
      const otherOverlayOpen = Boolean(
        document.querySelector('cart-drawer[open], search-drawer[open], navigation-drawer[open], dialog[open]') ||
          Array.from(document.querySelectorAll('shopify-account')).some((el) =>
            Boolean(el.shadowRoot && el.shadowRoot.querySelector('dialog[open]')),
          ),
      );
      this.dataset.suspended = otherOverlayOpen ? 'true' : 'false';
    }

    attachOpenListeners() {
      if (this._listenersAttached) return;
      this._listenersAttached = true;
      window.addEventListener('scroll', this._boundUpdateOffset, { passive: true });
      window.addEventListener('resize', this._boundUpdateOffset, { passive: true });
      document.addEventListener('keydown', this._boundKeydown);
      document.addEventListener('open', this._boundSyncSuspension, true);
      document.addEventListener('close', this._boundSyncSuspension, true);
      if (typeof window.MutationObserver === 'function' && document.body) {
        this._observer = new window.MutationObserver(this._boundSyncSuspension);
        this._observer.observe(document.body, {
          subtree: true,
          attributes: true,
          attributeFilter: ['open'],
        });
      }
    }

    teardownOpenListeners() {
      if (!this._listenersAttached) return;
      this._listenersAttached = false;
      window.removeEventListener('scroll', this._boundUpdateOffset);
      window.removeEventListener('resize', this._boundUpdateOffset);
      document.removeEventListener('keydown', this._boundKeydown);
      document.removeEventListener('open', this._boundSyncSuspension, true);
      document.removeEventListener('close', this._boundSyncSuspension, true);
      if (this._observer) {
        this._observer.disconnect();
        this._observer = null;
      }
    }
  }

  if (window.customElements && !window.customElements.get('suntneew-auth-prompt')) {
    window.customElements.define('suntneew-auth-prompt', SuntneewAuthPrompt);
  }
})();
