(() => {
  if (window.__suntneewPdpInitialized) return;
  window.__suntneewPdpInitialized = true;

  const normalize = (value) => String(value || '').trim().toLowerCase();
  const setupTabs = (nav) => {
    const tabs = [...nav.querySelectorAll('[data-pdp-tab]')];
    if (!tabs.length) return;

    const panels = [...document.querySelectorAll('[data-pdp-panel]')];
    const hosts = [...document.querySelectorAll('[data-pdp-panel-host]')];
    const targets = tabs.map((tab) => tab.dataset.pdpTab);

    const activate = (target, scroll) => {
      if (!targets.includes(target)) target = targets[0];

      tabs.forEach((tab) => {
        const active = tab.dataset.pdpTab === target;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
      });

      panels.forEach((panel) => { panel.hidden = panel.dataset.pdpPanel !== target; });
      hosts.forEach((host) => { host.hidden = !host.querySelector(`[data-pdp-panel="${target}"]`); });

      if (scroll) {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        nav.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    };

    tabs.forEach((tab) => {
      tab.addEventListener('click', (event) => {
        event.preventDefault();
        activate(tab.dataset.pdpTab, true);
        history.replaceState(null, '', `#${tab.dataset.pdpTab}`);
      });

      tab.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault();
        const direction = event.key === 'ArrowRight' ? 1 : -1;
        const next = tabs[(tabs.indexOf(tab) + direction + tabs.length) % tabs.length];
        next.focus();
        next.click();
      });
    });

    const hashTarget = window.location.hash.replace('#', '');
    activate(targets.includes(hashTarget) ? hashTarget : targets[0], false);
  };

  const applyVariant = (variant) => {
    const tokens = [variant?.title, variant?.sku, ...(variant?.options || [])].map(normalize).filter(Boolean);

    document.querySelectorAll('.sn-pdp [data-variant-match]').forEach((element) => {
      const match = normalize(element.dataset.variantMatch);
      element.hidden = Boolean(match) && !tokens.some((token) => token.includes(match));
    });
  };

  document.addEventListener('variant:change', (event) => applyVariant(event.detail?.variant));

  const initialize = () => {
    document.querySelectorAll('.sn-pdp-nav').forEach(setupTabs);
    const variantScript = document.querySelector('variant-picker script[data-variant]');
    if (!variantScript?.textContent) return;
    try { applyVariant(JSON.parse(variantScript.textContent)); } catch (_) {}
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
