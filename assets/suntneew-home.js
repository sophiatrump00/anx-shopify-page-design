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

  document.querySelectorAll('[data-sn-rv-hotspots]').forEach((section) => {
    const triggers = Array.from(section.querySelectorAll('[data-sn-rv-trigger]'));
    const details = Array.from(section.querySelectorAll('[data-sn-rv-detail]'));

    const show = (trigger) => {
      const targetId = trigger.getAttribute('aria-controls');
      triggers.forEach((item) => item.setAttribute('aria-expanded', item === trigger ? 'true' : 'false'));
      details.forEach((detail) => { detail.hidden = detail.id !== targetId; });
    };

    triggers.forEach((trigger) => trigger.addEventListener('click', () => show(trigger)));
  });

  document.querySelectorAll('[data-sn-chooser]').forEach((chooser) => {
    const buttons = Array.from(chooser.querySelectorAll('[data-sn-choice]'));
    const resultTitle = chooser.querySelector('[data-sn-result-title]');
    const resultText = chooser.querySelector('[data-sn-result-text]');
    const resultLink = chooser.querySelector('[data-sn-result-link]');
    const selections = {};

    const recommendations = {
      'battery-fit': ['Compare the 100Ah RV battery options', 'Start with the battery bay dimensions and terminal orientation, then review the 100Ah case options.', '/collections/rv-batteries', 'View RV battery options'],
      'battery-runtime': ['Explore longer-runtime RV options', 'Choose usable energy around the time you want to spend off-grid, while confirming the available installation space.', '/collections/rv-batteries', 'Explore RV batteries'],
      'battery-power': ['Explore higher-output RV options', 'Compare continuous output with the loads you plan to run. Capacity alone does not answer that question.', '/collections/rv-batteries', 'Explore RV batteries'],
      'jump-coverage': ['Find a jump starter for your vehicle', 'Start with the supported vehicle and engine information before comparing convenience features.', '/collections/jump-starters', 'Explore jump starters'],
      'jump-carry': ['Choose a practical roadside backup', 'Pick a carrying size that will stay with the vehicle, then compare the supported coverage by model.', '/collections/jump-starters', 'Explore jump starters'],
      'jump-utility': ['Compare roadside functions by model', 'Review charging ports and emergency functions after the vehicle coverage is confirmed.', '/collections/jump-starters', 'Explore jump starters'],
      'home-entry': ['Plan a 5 kWh starting point', 'We will confirm suitable equipment, delivery availability and installation requirements before an order is placed.', '/pages/request-for-quote', 'Check system availability'],
      'home-capacity': ['Plan more stored energy', 'Start with the household demand, then confirm the installation and inverter requirements for the proposed system.', '/pages/request-for-quote', 'Plan your home system'],
      'home-system': ['Plan the system around compatibility', 'For a system-led setup, confirm the inverter, installation approach and delivery availability before ordering.', '/pages/request-for-quote', 'Plan your home system']
    };

    const resetResult = () => {
      resultTitle.textContent = 'Choose the priority that matters most';
      resultText.textContent = 'The next step will point to the right collection or a home-energy planning path.';
      resultLink.hidden = true;
      resultLink.removeAttribute('href');
    };

    const render = () => {
      const key = `${selections.line || ''}-${selections.need || ''}`;
      const recommendation = recommendations[key];
      if (!recommendation) return;
      resultTitle.textContent = recommendation[0];
      resultText.textContent = recommendation[1];
      resultLink.href = recommendation[2];
      resultLink.textContent = recommendation[3];
      resultLink.hidden = false;
    };

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const group = button.dataset.group;
        selections[group] = button.dataset.value;
        chooser.querySelectorAll(`[data-group="${group}"]`).forEach((item) => item.setAttribute('aria-pressed', item === button ? 'true' : 'false'));

        if (group === 'line') {
          chooser.querySelectorAll('[data-sn-need-group]').forEach((panel) => {
            panel.hidden = panel.dataset.snNeedGroup !== selections.line;
          });
          delete selections.need;
          chooser.querySelectorAll('[data-group="need"]').forEach((item) => item.setAttribute('aria-pressed', 'false'));
          resetResult();
          return;
        }

        render();
      });
    });
  });
})();
