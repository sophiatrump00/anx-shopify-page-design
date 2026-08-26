(() => {
  const initialized = new WeakSet();
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const setup = (gallery) => {
    if (initialized.has(gallery)) return;
    initialized.add(gallery);

    const slides = [...gallery.querySelectorAll('[data-rv-gallery-slide]')];
    const thumbs = [...gallery.querySelectorAll('[data-rv-gallery-thumb]')];
    const progress = gallery.querySelector('[data-rv-gallery-progress]');
    const prev = gallery.querySelector('[data-rv-gallery-prev]');
    const next = gallery.querySelector('[data-rv-gallery-next]');
    if (!slides.length) return;

    let index = 0;
    let timer;

    const stop = () => {
      window.clearTimeout(timer);
      timer = undefined;
    };

    const schedule = () => {
      stop();
      if (reduceMotion || document.hidden || gallery.matches(':hover') || gallery.contains(document.activeElement)) return;
      timer = window.setTimeout(() => {
        activate(index + 1);
        schedule();
      }, 6200);
    };

    const activate = (nextIndex, focusThumb = false) => {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        const active = slideIndex === index;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', String(!active));
      });
      thumbs.forEach((thumb, thumbIndex) => {
        const active = thumbIndex === index;
        thumb.classList.toggle('is-active', active);
        thumb.setAttribute('aria-selected', String(active));
        if (active && focusThumb) thumb.focus();
      });
      if (progress) progress.style.width = `${((index + 1) / slides.length) * 100}%`;
    };

    thumbs.forEach((thumb, thumbIndex) => thumb.addEventListener('click', () => {
      activate(thumbIndex);
      schedule();
    }));
    prev?.addEventListener('click', () => { activate(index - 1); schedule(); });
    next?.addEventListener('click', () => { activate(index + 1); schedule(); });

    gallery.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); activate(index - 1, true); schedule(); }
      if (event.key === 'ArrowRight') { event.preventDefault(); activate(index + 1, true); schedule(); }
    });
    gallery.addEventListener('pointerenter', stop);
    gallery.addEventListener('pointerleave', schedule);
    gallery.addEventListener('focusin', stop);
    gallery.addEventListener('focusout', () => window.setTimeout(schedule, 0));
    document.addEventListener('visibilitychange', schedule);

    activate(0);
    schedule();
  };

  const initialize = (root = document) => root.querySelectorAll?.('[data-rv-showcase-gallery]').forEach(setup);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => initialize(), { once: true });
  else initialize();

  document.addEventListener('shopify:section:load', (event) => initialize(event.target));
})();
