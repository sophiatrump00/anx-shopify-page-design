(() => {
  if (customElements.get('suntneew-mobile-buy')) return;
  class MobileBuy extends HTMLElement {
    connectedCallback() {
      this.form = document.getElementById(this.getAttribute('form'));
      if (!this.form) return;
      this.variants = JSON.parse(this.querySelector('[data-mobile-variants]').textContent);
      this.format = new Intl.NumberFormat(document.documentElement.lang || 'en-US', { style: 'currency', currency: this.dataset.currency || 'USD' });
      this.controller = new AbortController();
      const signal = this.controller.signal;
      const sync = () => this.sync();
      document.addEventListener('input', sync, { signal });
      document.addEventListener('change', sync, { signal });
      for (const event of ['variant:change', 'variant:loading', 'variant:loaded', 'variant:error', 'purchase:idle']) this.form.addEventListener(event, sync, { signal });
      this.form.addEventListener('cart:error', (event) => this.feedback(event.detail.error), { signal });
      this.form.addEventListener('variant:add', () => this.feedback(''), { signal });
      this.form.addEventListener('variant:loading', () => this.feedback(''), { signal });
      this.observer = new MutationObserver(sync);
      this.observer.observe(this.form, { subtree: true, attributes: true, attributeFilter: ['disabled', 'aria-busy', 'data-purchase-busy', 'data-variant-state'] });
      document.documentElement.classList.add('sn-unified-ready');
      this.hidden = false;
      this.sync();
    }
    disconnectedCallback() { this.controller?.abort(); this.observer?.disconnect(); }
    feedback(message) {
      const node = this.querySelector('[data-mobile-feedback]');
      node.textContent = message;
      node.hidden = !message;
    }
    sync() {
      const variantInput = this.form.elements.namedItem('id');
      const variant = this.variants.find((item) => String(item.id) === variantInput?.value);
      const quantityInput = this.form.elements.namedItem('quantity');
      const quantity = Number(quantityInput?.value || 1);
      const selector = document.querySelector(`[data-suntneew-bundle-selector][data-form-id="${this.getAttribute('form')}"]`);
      const step = Number(selector?.dataset.discountStep || 0);
      const discount = quantity >= 4 ? step * 3 : quantity >= 3 ? step * 2 : quantity >= 2 ? step : 0;
      const total = variant ? (variant.price - Math.floor(variant.price * discount / 100)) * quantity : 0;
      const pending = ['loading', 'error'].includes(this.form.dataset.variantState);
      const busy = this.form.dataset.purchaseBusy === 'true';
      const validQuantity = Number.isInteger(quantity) && quantity > 0 && (!quantityInput || quantityInput.checkValidity());
      const available = Boolean(variant?.available && !pending && !busy && !variantInput?.disabled && validQuantity);
      this.querySelector('[data-mobile-total]').textContent = pending ? '…' : variant ? this.format.format(total / 100) : this.dataset.unavailable;
      this.querySelector('[data-mobile-quantity]').textContent = Number.isFinite(quantity) ? `${quantity} ×` : '';
      this.querySelector('[data-mobile-add]').textContent = pending || busy ? '…' : !variant ? this.dataset.unavailable : !variant.available ? this.dataset.soldOut : this.dataset.addLabel;
      this.querySelectorAll('button').forEach((button) => { if (button.disabled === available) button.disabled = !available; });
    }
  }
  customElements.define('suntneew-mobile-buy', MobileBuy);
})();
