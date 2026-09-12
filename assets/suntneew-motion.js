(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = [...document.querySelectorAll('main .shopify-section, main product-card')];

  if (reduceMotion || !targets.length) return;

  document.documentElement.classList.add('sn-motion-ready');
  targets.forEach((element, index) => {
    element.classList.add('sn-scroll-reveal');
    element.style.setProperty('--sn-reveal-delay', `${Math.min(index % 6, 5) * 55}ms`);
  });

  if (!('IntersectionObserver' in window)) {
    targets.forEach((element) => element.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, instance) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      instance.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.01 });

  targets.forEach((element) => observer.observe(element));
})();
