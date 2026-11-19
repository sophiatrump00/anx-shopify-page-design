(() => {
  if (window.__suntneewPdpInitialized) return;
  window.__suntneewPdpInitialized = true;

  const normalize = (value) => String(value || '').trim().toLowerCase();
  const setupTabs = (nav) => {
    if (nav.dataset.pdpNavBound === 'true') return;
    nav.dataset.pdpNavBound = 'true';

    const isLitime = nav.hasAttribute('data-litime-tabs');
    const allTabs = [...nav.querySelectorAll('[data-pdp-tab]')];
    if (!allTabs.length) return;

    const panels = [...document.querySelectorAll('[data-pdp-panel]')];
    const hosts = [...document.querySelectorAll('[data-pdp-panel-host]')];
    const availablePanelIds = new Set(panels.map((panel) => panel.dataset.pdpPanel).filter(Boolean));
    const tabs = isLitime
      ? allTabs.filter((tab) => {
          const exists = availablePanelIds.has(tab.dataset.pdpTab);
          tab.hidden = !exists;
          return exists;
        })
      : allTabs;
    if (!tabs.length) return;

    const targets = tabs.map((tab) => tab.dataset.pdpTab);
    const sectionWrappers = [
      ...new Set(
        panels
          .map((panel) => panel.closest('.shopify-section'))
          .filter((sec) => sec && !sec.contains(nav))
      ),
    ];

    let nextNav = null;
    let nextCards = [];
    if (isLitime) {
      const navSection = nav.closest('.shopify-section');
      if (navSection) {
        navSection.dataset.pdpStickyNav = 'true';
        navSection.classList.add('is-visible');
      }
      const nextTemplate =
        nav.parentElement?.querySelector('template[data-pdp-next-template]') ||
        document.querySelector('template[data-pdp-next-template]');
      const fragment = nextTemplate?.content?.cloneNode(true);
      const cloned = fragment?.querySelector('[data-pdp-next-nav]');
      if (cloned) {
        const anchor =
          sectionWrappers.at(-1) ||
          panels.at(-1)?.closest('[data-pdp-panel-host]') ||
          panels.at(-1);
        if (anchor?.parentNode) {
          anchor.after(cloned);
          nextNav = cloned;
          nextCards = [...nextNav.querySelectorAll('[data-pdp-next]')];
        }
      }
    }

    const updateNavOffset = () => {
      if (nav.offsetHeight > 0) {
        document.documentElement.style.setProperty('--sn-pdp-nav-offset', `${nav.offsetHeight}px`);
      }
    };
    if (typeof ResizeObserver === 'function') {
      new ResizeObserver(updateNavOffset).observe(nav);
    }

    const activate = (target, scroll, specificEl = null) => {
      if (!targets.includes(target)) target = targets[0];

      tabs.forEach((tab) => {
        const active = tab.dataset.pdpTab === target;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        if (isLitime) {
          if (active) tab.setAttribute('aria-current', 'location');
          else tab.removeAttribute('aria-current');
        }
      });

      panels.forEach((panel) => {
        panel.hidden = panel.dataset.pdpPanel !== target;
      });
      hosts.forEach((host) => {
        host.hidden = ![...host.querySelectorAll('[data-pdp-panel]')].some(
          (panel) => panel.dataset.pdpPanel === target
        );
      });
      sectionWrappers.forEach((sec) => {
        const hasActive = [...sec.querySelectorAll('[data-pdp-panel]')].some(
          (panel) => panel.dataset.pdpPanel === target
        );
        sec.hidden = !hasActive;
        sec.toggleAttribute('data-pdp-section-hidden', !hasActive);
        if (isLitime && hasActive) sec.classList.add('is-visible');
      });
      if (nextCards.length) {
        nextCards.forEach((card) => {
          card.hidden = card.dataset.pdpNext === target || !availablePanelIds.has(card.dataset.pdpNext);
        });
      }

      updateNavOffset();

      if (target === 'reviews') {
        try {
          window.dispatchEvent(new window.Event('resize'));
        } catch (_) {}
      }

      if (scroll) {
        if (isLitime) {
          const scrollEl =
            specificEl || panels.find((panel) => panel.dataset.pdpPanel === target) || nav;
          scrollEl?.scrollIntoView?.({ block: 'start', behavior: 'auto' });
        } else {
          const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
          (specificEl || nav)?.scrollIntoView?.({
            block: 'start',
            behavior: reduceMotion ? 'auto' : 'smooth',
          });
        }
      }
    };

    const resolveHash = (rawHash) => {
      const id = String(rawHash || '').replace(/^#/, '');
      if (!id) return null;
      if (
        ['judgeme_product_reviews', 'shopify-product-reviews', 'customer-reviews'].includes(id) &&
        targets.includes('reviews')
      ) {
        return { tab: 'reviews', element: null };
      }
      if (targets.includes(id)) {
        return { tab: id, element: null };
      }
      const el = document.getElementById(id);
      const owner = el?.closest('[data-pdp-panel]');
      if (owner && targets.includes(owner.dataset.pdpPanel)) {
        return { tab: owner.dataset.pdpPanel, element: el };
      }
      return null;
    };

    tabs.forEach((tab) => {
      tab.addEventListener('click', (event) => {
        event.preventDefault();
        activate(tab.dataset.pdpTab, true);
        if (window.location.hash !== `#${tab.dataset.pdpTab}`) {
          history.replaceState(null, '', `#${tab.dataset.pdpTab}`);
        }
      });

      tab.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const index = tabs.indexOf(tab);
        const nextIndex =
          event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? tabs.length - 1
              : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        const next = tabs[nextIndex];
        if (!next) return;
        next.focus({ preventScroll: true });
        activate(next.dataset.pdpTab, false);
        if (window.location.hash !== `#${next.dataset.pdpTab}`) {
          history.replaceState(null, '', `#${next.dataset.pdpTab}`);
        }
      });
    });

    if (nextNav) {
      nextNav.addEventListener('click', (event) => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const card = event.target.closest('[data-pdp-next]');
        if (!card) return;
        const target = card.dataset.pdpNext;
        if (!targets.includes(target)) return;
        event.preventDefault();
        activate(target, true);
        if (window.location.hash !== `#${target}`) {
          history.pushState(null, '', `#${target}`);
        }
      });
    }

    // Links in feature copy and FAQs must reveal the same panel as its tab.
    document.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest('a[href^="#"]:not([data-pdp-tab]):not([data-pdp-next])');
      if (!link) return;
      const resolved = resolveHash(link.getAttribute('href'));
      if (!resolved) return;
      event.preventDefault();
      activate(resolved.tab, true, resolved.element);
      const nextHash = `#${link.getAttribute('href').slice(1)}`;
      if (window.location.hash !== nextHash) {
        history.replaceState(null, '', nextHash);
      }
    });
    window.addEventListener('hashchange', () => {
      const resolved = resolveHash(window.location.hash);
      if (resolved) activate(resolved.tab, !isLitime, resolved.element);
    });
    window.addEventListener('popstate', () => {
      const resolved = resolveHash(window.location.hash);
      if (resolved) {
        activate(resolved.tab, false, resolved.element);
      } else {
        activate(targets[0], false);
      }
    });

    const initial = resolveHash(window.location.hash);
    if (initial) {
      activate(initial.tab, Boolean(initial.element), initial.element);
    } else {
      activate(targets[0], false);
    }
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
