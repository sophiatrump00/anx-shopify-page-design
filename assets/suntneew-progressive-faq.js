/* Progressive FAQ disclosure: shows core questions first and reveals related follow-ups on expand. */
(() => {
  'use strict';

  function initProgressiveFaqGroup(group) {
    if (!group || group.dataset.progressiveFaqReady === 'true') return;
    group.dataset.progressiveFaqReady = 'true';

    const allItems = [...group.querySelectorAll('details')];
    const relatedItems = allItems.filter(el => Boolean(el.dataset.faqParent));
    if (!relatedItems.length) return;

    const moreRow = group.parentElement?.querySelector('.faq-more-row');
    const toggleBtn = group.parentElement?.querySelector('[data-faq-toggle-all]');
    const totalCount = allItems.length;

    function syncButton() {
      if (!moreRow || !toggleBtn) return;
      const hiddenCount = relatedItems.filter(el => el.hidden).length;
      moreRow.hidden = false;
      if (hiddenCount > 0) {
        toggleBtn.textContent = `Show all ${totalCount} questions (+${hiddenCount})`;
        toggleBtn.setAttribute('aria-expanded', 'false');
      } else {
        toggleBtn.textContent = 'Show fewer questions';
        toggleBtn.setAttribute('aria-expanded', 'true');
      }
    }

    function revealForParent(parentId) {
      let changed = false;
      for (const item of relatedItems) {
        if (item.dataset.faqParent === parentId && item.hidden) {
          item.hidden = false;
          item.classList.add('is-revealing');
          changed = true;
        }
      }
      if (changed) syncButton();
    }

    allItems.forEach(item => {
      const id = item.dataset.faqId;
      if (!id) return;
      const onOpen = () => {
        if (item.open) revealForParent(id);
      };
      item.addEventListener('toggle', onOpen);
      item.querySelector('summary')?.addEventListener('click', () => queueMicrotask(onOpen));
    });

    toggleBtn?.addEventListener('click', () => {
      const shouldShowAll = relatedItems.some(el => el.hidden);
      relatedItems.forEach(el => {
        el.hidden = !shouldShowAll;
        if (shouldShowAll) {
          el.classList.add('is-revealing');
        } else {
          el.open = false;
          el.classList.remove('is-revealing');
        }
      });
      syncButton();
    });

    syncButton();
  }

  document.querySelectorAll('[data-progressive-faq]').forEach(initProgressiveFaqGroup);
})();
