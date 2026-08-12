(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('[data-sn-hero]').forEach((hero) => {
    const slides = Array.from(hero.querySelectorAll('[data-sn-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-sn-dot]'));
    const prev = hero.querySelector('[data-sn-prev]');
    const next = hero.querySelector('[data-sn-next]');
    const autoplay = hero.dataset.autoplay === 'true' && !reducedMotion;
    const delay = Math.max(4, Number(hero.dataset.delay) || 6) * 1000;
    let current = 0;
    let timer;

    const show = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.setAttribute('aria-hidden', i === current ? 'false' : 'true'));
      dots.forEach((dot, i) => dot.setAttribute('aria-current', i === current ? 'true' : 'false'));
    };

    const stop = () => window.clearInterval(timer);
    const start = () => {
      stop();
      if (autoplay && slides.length > 1) timer = window.setInterval(() => show(current + 1), delay);
    };

    prev?.addEventListener('click', () => { show(current - 1); start(); });
    next?.addEventListener('click', () => { show(current + 1); start(); });
    dots.forEach((dot, i) => dot.addEventListener('click', () => { show(i); start(); }));
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    hero.addEventListener('focusin', stop);
    hero.addEventListener('focusout', start);
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    show(0);
    start();
  });

  document.querySelectorAll('[data-sn-proof]').forEach((proof) => {
    const range = proof.querySelector('input[type="range"]');
    if (!range) return;
    const update = () => proof.style.setProperty('--sn-proof-position', `${range.value}%`);
    range.addEventListener('input', update);
    update();
  });

  document.querySelectorAll('[data-sn-chooser]').forEach((chooser) => {
    const buttons = Array.from(chooser.querySelectorAll('[data-sn-choice]'));
    const resultTitle = chooser.querySelector('[data-sn-result-title]');
    const resultText = chooser.querySelector('[data-sn-result-text]');
    const resultLink = chooser.querySelector('[data-sn-result-link]');
    const selections = {};

    const recommendations = {
      'battery-fit': ['G24 / G31 100Ah', 'Start with physical fit. Compare the G24 and G31 case sizes before choosing.', '/collections/rv-batteries'],
      'battery-runtime': ['314Ah LiFePO4 Battery', 'Built for longer off-grid runtime where installation space and system limits allow.', '/products/suntneew-12-8v-314ah-lifepo4-rv-battery'],
      'battery-power': ['230Ah LiFePO4 Battery', 'A strong balance of usable energy and higher continuous output for demanding RV systems.', '/products/suntneew-12-8v-230ah-lifepo4-rv-battery'],
      'jump-compact': ['A20 Jump Starter', 'Compact everyday roadside backup with jump-starting, charging and emergency lighting.', '/products/suntneew-a20-jump-starter-8000mah'],
      'jump-capacity': ['A3 Jump Starter', 'Choose A3 when you want a larger-format emergency power option and broader utility.', '/products/suntneew-a3-jump-starter-16000mah']
    };

    const render = () => {
      const key = `${selections.line || ''}-${selections.need || ''}`;
      const rec = recommendations[key];
      if (!rec) return;
      resultTitle.textContent = rec[0];
      resultText.textContent = rec[1];
      resultLink.href = rec[2];
      resultLink.hidden = false;
    };

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const group = button.dataset.group;
        selections[group] = button.dataset.value;
        chooser.querySelectorAll(`[data-group="${group}"]`).forEach((item) => item.setAttribute('aria-pressed', item === button ? 'true' : 'false'));
        if (group === 'line') {
          chooser.querySelectorAll('[data-sn-need-group]').forEach((panel) => panel.hidden = panel.dataset.snNeedGroup !== selections.line);
          delete selections.need;
        }
        render();
      });
    });
  });
})();
