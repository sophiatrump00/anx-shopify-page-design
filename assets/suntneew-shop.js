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

const setupSuntneewShopLoopCarousels = () => {
  document.querySelectorAll('.sn-shop-loop-carousel').forEach((carousel) => {
    if (carousel.dataset.loopReady === 'true') return;

    const scroller = carousel.querySelector('scroll-carousel');
    const previousButton = carousel.querySelector('[data-shop-carousel-prev]');
    const nextButton = carousel.querySelector('[data-shop-carousel-next]');
    if (!scroller || !previousButton || !nextButton) return;

    carousel.dataset.loopReady = 'true';
    const abortController = new AbortController();
    const { signal } = abortController;
    let frameRequest;
    let step = scroller.clientWidth;

    const getStep = () => {
      const cards = scroller.querySelectorAll('product-card');
      if (cards.length < 2) return scroller.clientWidth;
      const first = cards[0].getBoundingClientRect();
      const second = cards[1].getBoundingClientRect();
      return Math.max(second.left - first.left, first.width);
    };

    const measure = () => {
      const overflowing = scroller.scrollWidth > scroller.clientWidth + 2;
      carousel.classList.toggle('is-overflowing', overflowing);
      step = getStep();
    };

    const scheduleMeasure = () => {
      if (frameRequest) return;
      frameRequest = requestAnimationFrame(() => {
        frameRequest = undefined;
        measure();
      });
    };

    const move = (direction) => {
      if (!carousel.classList.contains('is-overflowing')) return;
      const maximum = scroller.scrollWidth - scroller.clientWidth;
      const current = scroller.scrollLeft;
      let target = current + direction * step;

      if (direction > 0 && target >= maximum - 2) target = 0;
      if (direction < 0 && target <= 2) target = maximum;
      scroller.scrollTo({ left: target, behavior: 'smooth' });
    };

    previousButton.addEventListener('click', () => move(-1), { signal });
    nextButton.addEventListener('click', () => move(1), { signal });
    scroller.addEventListener('scroll', scheduleMeasure, { passive: true, signal });
    window.addEventListener('resize', scheduleMeasure, { passive: true, signal });
    const resizeObserver = new ResizeObserver(scheduleMeasure);
    resizeObserver.observe(scroller);

    requestAnimationFrame(measure);
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupSuntneewShopLoopCarousels, { once: true });
} else {
  setupSuntneewShopLoopCarousels();
}

document.addEventListener('shopify:section:load', setupSuntneewShopLoopCarousels);
