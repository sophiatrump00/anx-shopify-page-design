if (!customElements.get('suntneew-shop-navigation')) {
  customElements.define(
    'suntneew-shop-navigation',
    class SuntneewShopNavigation extends HTMLElement {
      connectedCallback() {
        this.bar = this.querySelector('.sn-shop-nav__bar');

        if (!this.bar) {
          return;
        }

        this.abortController = new AbortController();
        this.resizeObserver = new ResizeObserver(() => this.measure());
        this.resizeObserver.observe(this.bar);

        window.addEventListener('scroll', () => this.scheduleUpdate(), {
          passive: true,
          signal: this.abortController.signal,
        });
        window.addEventListener('resize', () => this.measure(), {
          passive: true,
          signal: this.abortController.signal,
        });

        requestAnimationFrame(() => this.measure());
      }

      disconnectedCallback() {
        this.abortController?.abort();
        this.resizeObserver?.disconnect();

        if (this.frameRequest) {
          cancelAnimationFrame(this.frameRequest);
        }
      }

      get headerHeight() {
        return Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 0;
      }

      measure() {
        this.style.setProperty('--sn-shop-nav-bar-height', `${Math.round(this.bar.offsetHeight)}px`);
        this.threshold = window.scrollY + this.getBoundingClientRect().top;
        this.update();
      }

      scheduleUpdate() {
        if (this.frameRequest) {
          return;
        }

        this.frameRequest = requestAnimationFrame(() => {
          this.frameRequest = null;
          this.update();
        });
      }

      update() {
        if (this.threshold === undefined) {
          return;
        }

        this.classList.toggle('is-fixed', window.scrollY + this.headerHeight >= this.threshold);
      }
    }
  );
}
