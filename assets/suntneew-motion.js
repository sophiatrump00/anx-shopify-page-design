(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isHome = document.body.classList.contains('template-index');

  const addHomeTarget = (targets, element, kind, delay) => {
    if (!element || element.dataset.snMotionReady === 'true') return;
    element.dataset.snMotionReady = 'true';
    element.classList.add('sn-home-reveal', `sn-home-reveal--${kind}`);
    element.style.setProperty('--sn-reveal-delay', `${delay}ms`);
    targets.push(element);
  };

  const getHomeTargets = () => {
    const targets = [];
    document.querySelectorAll('.sn-section').forEach((section) => {
      addHomeTarget(targets, section.querySelector('.sn-heading'), 'copy', 0);
      section.querySelectorAll('.sn-path').forEach((card, index) => {
        addHomeTarget(targets, card.querySelector('img'), 'media', 90 + index * 80);
        addHomeTarget(targets, card.querySelector('.sn-path__content'), 'copy', 170 + index * 80);
      });
    });

    document.querySelectorAll('.sn-rv-tech-section').forEach((section) => {
      addHomeTarget(targets, section.querySelector('.sn-rv-tech__background'), 'media', 0);
      addHomeTarget(targets, section.querySelector('.sn-rv-tech__intro'), 'copy', 120);
      addHomeTarget(targets, section.querySelector('.sn-rv-tech__visual'), 'media', 90);
      section.querySelectorAll('.sn-rv-tech__hotspot').forEach((hotspot, index) => {
        addHomeTarget(targets, hotspot, 'hotspot', 360 + index * 90);
      });
    });

    document.querySelectorAll('.sn-proof').forEach((section) => {
      addHomeTarget(targets, section.querySelector('.sn-proof__visual'), 'media', 0);
      addHomeTarget(targets, section.querySelector('.sn-proof__content'), 'copy', 140);
    });

    document.querySelectorAll('.sn-home-energy').forEach((section) => {
      addHomeTarget(targets, section.querySelector('.sn-home-energy__content'), 'copy', 0);
      addHomeTarget(targets, section.querySelector('.sn-home-energy__visual'), 'media', 100);
      section.querySelectorAll('.sn-home-energy__choice').forEach((choice, index) => {
        addHomeTarget(targets, choice, 'card', 180 + index * 80);
      });
    });

    document.querySelectorAll('.sn-confidence').forEach((section) => {
      addHomeTarget(targets, section.querySelector('.sn-confidence__heading'), 'copy', 0);
      section.querySelectorAll('.sn-confidence__card').forEach((card, index) => {
        addHomeTarget(targets, card, 'card', 110 + index * 75);
      });
    });

    document.querySelectorAll('.sn-power-calculator-entry').forEach((section) => {
      addHomeTarget(targets, section.querySelector('.sn-power-calculator-entry__shell'), 'copy', 0);
    });

    return targets;
  };

  const targets = isHome
    ? getHomeTargets()
    : [...document.querySelectorAll('main .shopify-section, main product-card')];

  if (reduceMotion || !targets.length) return;

  document.documentElement.classList.add('sn-motion-ready');
  if (isHome) {
    document.documentElement.classList.add('sn-home-motion');
  } else {
    targets.forEach((element, index) => {
      element.classList.add('sn-scroll-reveal');
      element.style.setProperty('--sn-reveal-delay', `${Math.min(index % 6, 5) * 55}ms`);
    });
  }

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
  }, { rootMargin: '0px 0px -14% 0px', threshold: isHome ? 0.08 : 0.01 });

  targets.forEach((element) => observer.observe(element));
})();
