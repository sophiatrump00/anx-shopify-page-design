/* Shared PDP Media Hub: LiTime gallery switcher, Option A video stage, and theater modal */
(() => {
  const init = () => {
    const resetInlineStages = (exceptVideo = null) => {
      document.querySelectorAll('video').forEach((v) => {
        if (v !== exceptVideo && !v.paused) v.pause();
      });
      document.querySelectorAll('.sn-vs-stage-card').forEach((card) => {
        const inlineVid = card.querySelector('.sn-vs-inline-video');
        if (inlineVid !== exceptVideo) card.dataset.playing = 'false';
      });
    };

    // 1. LiTime Images | Videos Gallery Mode Tabs
    document.querySelectorAll('[data-sn-gallery-tabs]').forEach((wrap) => {
      if (wrap.dataset.snBound) return;
      wrap.dataset.snBound = 'true';
      const galleryCol = wrap.closest('.product-gallery');
      if (!galleryCol) return;
      const galleryContent = galleryCol.querySelector('#gallery-content');
      const galleryHelp = galleryCol.querySelector('.gallery-help');
      const vidPane = galleryCol.querySelector('.sn-gallery-video-pane');
      const galleryVid = vidPane?.querySelector('video');
      const galleryMeta = vidPane?.querySelector('.sn-gallery-video-meta');
      const tabs = [...wrap.querySelectorAll('[data-sn-gallery-mode]')];

      tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
          const mode = tab.dataset.snGalleryMode;
          tabs.forEach((t) => t.classList.toggle('active', t === tab));
          if (mode === 'videos') {
            if (galleryContent) galleryContent.hidden = true;
            if (galleryHelp) galleryHelp.hidden = true;
            if (vidPane) vidPane.hidden = false;
            resetInlineStages(galleryVid || null);
            galleryVid?.play().catch(() => {});
          } else {
            galleryVid?.pause();
            if (vidPane) vidPane.hidden = true;
            if (galleryContent) galleryContent.hidden = false;
            if (galleryHelp) galleryHelp.hidden = false;
          }
        });
      });

      vidPane?.querySelectorAll('.sn-gallery-video-pill').forEach((pill) => {
        pill.addEventListener('click', () => {
          vidPane.querySelectorAll('.sn-gallery-video-pill').forEach((p) => p.classList.toggle('active', p === pill));
          if (galleryVid) {
            galleryVid.pause();
            galleryVid.poster = pill.dataset.vidPoster || '';
            galleryVid.src = pill.dataset.vidSrc || '';
            galleryVid.load();
            resetInlineStages(galleryVid);
            galleryVid.play().catch(() => {});
          }
          if (galleryMeta && pill.dataset.vidCaption) {
            galleryMeta.innerHTML = pill.dataset.vidCaption;
          }
        });
      });
    });

    // 2. Modal Lightbox (shared across Option A expand buttons)
    const modal = document.getElementById('sn-video-modal');
    const modalTitle = document.getElementById('sn-video-modal-title');
    const modalVideo = document.getElementById('sn-video-modal-player');
    const modalCloseBtn = document.getElementById('sn-video-modal-close');

    const closeModal = () => {
      if (!modal || !modalVideo) return;
      modalVideo.pause();
      modalVideo.removeAttribute('src');
      modalVideo.load();
      modal.classList.remove('open');
    };

    const openModal = (src, title) => {
      if (!modal || !modalVideo) return;
      resetInlineStages(modalVideo);
      if (modalTitle) modalTitle.textContent = title || 'Customer Video';
      modalVideo.src = src;
      modal.classList.add('open');
      modalVideo.play().catch(() => {});
    };

    if (modal && !modal.dataset.snBound) {
      modal.dataset.snBound = 'true';
      modalCloseBtn?.addEventListener('click', closeModal);
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
      });
    }

    // 3. Option A Video Stage Selector + Inline Play + Expand Modal
    document.querySelectorAll('[data-sn-video-stage]').forEach((mod) => {
      if (mod.dataset.snBound) return;
      mod.dataset.snBound = 'true';
      const card = mod.querySelector('.sn-vs-stage-card');
      const posterEl = mod.querySelector('.sn-vs-poster');
      const vidEl = mod.querySelector('.sn-vs-inline-video');
      const playBtn = mod.querySelector('.sn-vs-play-overlay');
      const tagEl = mod.querySelector('.sn-vs-tag');
      const titleEl = mod.querySelector('.sn-vs-title');
      const descEl = mod.querySelector('.sn-vs-desc');
      const counterEl = mod.querySelector('.sn-vs-counter');
      const expandBtn = mod.querySelector('.sn-vs-expand-btn');
      const thumbBtns = [...mod.querySelectorAll('.sn-vs-thumb-btn')];

      thumbBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          resetInlineStages();
          thumbBtns.forEach((b) => b.setAttribute('aria-selected', String(b === btn)));
          if (posterEl) {
            posterEl.src = btn.dataset.vsPoster || '';
            posterEl.alt = btn.dataset.vsTitle || '';
          }
          if (vidEl) {
            vidEl.pause();
            vidEl.poster = btn.dataset.vsPoster || '';
            vidEl.src = btn.dataset.vsVideo || '';
            vidEl.load();
          }
          if (tagEl) {
            tagEl.textContent = btn.dataset.vsTag || '';
            tagEl.classList.toggle('star', btn.dataset.vsStar === 'true');
          }
          if (titleEl) titleEl.textContent = btn.dataset.vsTitle || '';
          if (descEl) descEl.textContent = btn.dataset.vsDesc || '';
          if (counterEl) counterEl.textContent = `${btn.dataset.vsIdx} / ${thumbBtns.length}`;
          if (expandBtn) {
            expandBtn.dataset.modalVideo = btn.dataset.vsVideo || '';
            expandBtn.dataset.modalTitle = btn.dataset.vsModalTitle || btn.dataset.vsTitle || 'Owner Video';
          }
        });
      });

      playBtn?.addEventListener('click', () => {
        resetInlineStages(vidEl || null);
        if (card) card.dataset.playing = 'true';
        vidEl?.play().catch(() => {});
      });

      expandBtn?.addEventListener('click', () => {
        openModal(expandBtn.dataset.modalVideo || '', expandBtn.dataset.modalTitle || 'Customer Video');
      });
    });

    // 4. Pause inline stages when switching PDP tabs & handle Jump-to-Tab buttons
    document.querySelectorAll('.product-nav [data-pdp-tab]').forEach((tab) => {
      if (tab.dataset.snPauseBound) return;
      tab.dataset.snPauseBound = 'true';
      tab.addEventListener('click', () => resetInlineStages());
    });

    document.querySelectorAll('[data-sn-jump-tab]').forEach((btn) => {
      if (btn.dataset.snBound) return;
      btn.dataset.snBound = 'true';
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetTab = btn.dataset.snJumpTab;
        const container = btn.closest('.shopify-section, main, body') || document;
        const tabBtn = container.querySelector(`.product-nav [data-pdp-tab="${targetTab}"]`);
        if (tabBtn) tabBtn.click();
      });
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
