/* Shared PDP Media Hub: mobile-first custom video controls (no download), auto-pause on leave/scroll, gallery switcher & theater modal */
(() => {
  const PLAY_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  const PAUSE_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>';
  const VOL_ON_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>';
  const VOL_OFF_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z"/></svg>';

  const fmtTime = (sec) => {
    if (!Number.isFinite(sec) || sec < 0) return '0:00';
    const whole = Math.floor(sec);
    const m = Math.floor(whole / 60);
    const s = String(whole % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const init = () => {
    const observedMap = new WeakMap();
    let visibilityObserver = null;

    const pauseAllVideos = (exceptVideo = null) => {
      document.querySelectorAll('video').forEach((v) => {
        if (v !== exceptVideo && !v.paused) v.pause();
      });
    };

    if ('IntersectionObserver' in window) {
      visibilityObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const v = observedMap.get(entry.target);
            if (v && !v.paused && (!entry.isIntersecting || entry.intersectionRatio < 0.25)) {
              v.pause();
            }
          });
        },
        { threshold: [0, 0.25] },
      );
    }

    const observeContainerForPause = (container, video) => {
      if (!visibilityObserver || !container || !video) return;
      observedMap.set(container, video);
      visibilityObserver.observe(container);
    };

    const hardenVideo = (video, { keepControls = false } = {}) => {
      if (!video) return;
      if (!keepControls) {
        video.controls = false;
        video.removeAttribute('controls');
      }
      video.setAttribute('controlslist', 'nodownload noplaybackrate noremoteplayback');
      video.disablePictureInPicture = true;
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      if (!video.dataset.snHardened) {
        video.dataset.snHardened = 'true';
        video.addEventListener('contextmenu', (e) => e.preventDefault());
      }
    };

    const mountCustomControls = (video, hostEl, { isStageCard = false, card = null } = {}) => {
      if (!video || !hostEl || video.dataset.snControlsMounted) return;
      video.dataset.snControlsMounted = 'true';
      hardenVideo(video, { keepControls: false });

      if (!isStageCard) {
        const centerBtn = document.createElement('button');
        centerBtn.type = 'button';
        centerBtn.className = 'sn-vp-center-btn';
        centerBtn.setAttribute('aria-label', 'Play video');
        centerBtn.innerHTML = `<span class="sn-vp-center-circle">${PLAY_SVG}</span>`;
        centerBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          pauseAllVideos(video);
          video.play().catch(() => {});
        });
        hostEl.appendChild(centerBtn);
      }

      const dock = document.createElement('div');
      dock.className = 'sn-vp-dock';
      dock.innerHTML = `
        <button type="button" class="sn-vp-toggle" aria-label="Play">${PLAY_SVG}</button>
        <input type="range" class="sn-vp-range" min="0" max="1000" value="0" aria-label="Seek video">
        <span class="sn-vp-time">0:00 / 0:00</span>
        <button type="button" class="sn-vp-mute" aria-label="Mute">${VOL_ON_SVG}</button>
      `;
      dock.addEventListener('click', (e) => e.stopPropagation());
      hostEl.appendChild(dock);

      const toggleBtn = dock.querySelector('.sn-vp-toggle');
      const rangeEl = dock.querySelector('.sn-vp-range');
      const timeEl = dock.querySelector('.sn-vp-time');
      const muteBtn = dock.querySelector('.sn-vp-mute');

      const syncPlaybackUi = () => {
        const playing = !video.paused && !video.ended;
        toggleBtn.innerHTML = playing ? PAUSE_SVG : PLAY_SVG;
        toggleBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
        if (isStageCard && card) {
          card.dataset.playing = String(playing);
          if (playing) card.dataset.started = 'true';
        } else {
          hostEl.dataset.playing = String(playing);
        }
      };

      const syncTimeUi = () => {
        const dur = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
        const cur = Number.isFinite(video.currentTime) ? video.currentTime : 0;
        const ratio = dur > 0 ? Math.min(1, Math.max(0, cur / dur)) : 0;
        const pct = `${(ratio * 100).toFixed(2)}%`;
        rangeEl.value = String(Math.round(ratio * 1000));
        rangeEl.style.setProperty('--vp-pct', pct);
        timeEl.textContent = `${fmtTime(cur)} / ${fmtTime(dur)}`;
      };

      const syncMuteUi = () => {
        const muted = Boolean(video.muted || video.volume === 0);
        muteBtn.innerHTML = muted ? VOL_OFF_SVG : VOL_ON_SVG;
        muteBtn.setAttribute('aria-label', muted ? 'Unmute' : 'Mute');
      };

      const togglePlay = () => {
        if (video.paused || video.ended) {
          pauseAllVideos(video);
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      };

      toggleBtn.addEventListener('click', togglePlay);
      video.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePlay();
      });

      const handleSeek = () => {
        const dur = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
        const pct = Number(rangeEl.value) / 1000;
        rangeEl.style.setProperty('--vp-pct', `${(pct * 100).toFixed(2)}%`);
        if (dur > 0) video.currentTime = pct * dur;
      };
      rangeEl.addEventListener('input', handleSeek);
      rangeEl.addEventListener('change', handleSeek);

      muteBtn.addEventListener('click', () => {
        video.muted = !video.muted;
        syncMuteUi();
      });

      video.addEventListener('play', syncPlaybackUi);
      video.addEventListener('pause', syncPlaybackUi);
      video.addEventListener('ended', syncPlaybackUi);
      video.addEventListener('timeupdate', syncTimeUi);
      video.addEventListener('loadedmetadata', syncTimeUi);
      video.addEventListener('durationchange', syncTimeUi);
      video.addEventListener('volumechange', syncMuteUi);

      syncPlaybackUi();
      syncTimeUi();
      syncMuteUi();

      video._snResetUi = () => {
        rangeEl.value = '0';
        rangeEl.style.setProperty('--vp-pct', '0%');
        timeEl.textContent = '0:00 / 0:00';
      };
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
      const galleryBox = vidPane?.querySelector('.sn-vp-box');
      const galleryVid = vidPane?.querySelector('video');
      const galleryMeta = vidPane?.querySelector('.sn-gallery-video-meta');
      const tabs = [...wrap.querySelectorAll('[data-sn-gallery-mode]')];
      const tabList = wrap.querySelector('.sn-media-tabs');

      if (galleryVid && galleryBox) {
        mountCustomControls(galleryVid, galleryBox, { isStageCard: false });
        observeContainerForPause(galleryBox, galleryVid);
      }

      tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
          const mode = tab.dataset.snGalleryMode;
          tabs.forEach((t) => {
            const active = t === tab;
            t.classList.toggle('active', active);
            t.setAttribute('aria-selected', String(active));
          });
          if (mode === 'videos') {
            if (galleryContent) galleryContent.hidden = true;
            if (galleryHelp) galleryHelp.hidden = true;
            if (vidPane) vidPane.hidden = false;
            pauseAllVideos(galleryVid || null);
            galleryVid?.play().catch(() => {});
          } else {
            galleryVid?.pause();
            if (vidPane) vidPane.hidden = true;
            if (galleryContent) galleryContent.hidden = false;
            if (galleryHelp) galleryHelp.hidden = false;
          }
        });
      });

      if (tabList && tabs.length) {
        tabList.addEventListener('click', (e) => {
          if (e.target.closest('[data-sn-gallery-mode]')) return;
          let nearest = tabs[0];
          let minDist = Infinity;
          for (const tab of tabs) {
            const rect = tab.getBoundingClientRect();
            const center = rect.left + rect.width / 2;
            const dist = Math.abs(e.clientX - center);
            if (dist < minDist) {
              minDist = dist;
              nearest = tab;
            }
          }
          nearest.click();
        });
      }

      vidPane?.querySelectorAll('.sn-gallery-video-pill').forEach((pill) => {
        pill.addEventListener('click', () => {
          vidPane.querySelectorAll('.sn-gallery-video-pill').forEach((p) => p.classList.toggle('active', p === pill));
          if (galleryVid) {
            galleryVid.pause();
            galleryVid.poster = pill.dataset.vidPoster || '';
            galleryVid.src = pill.dataset.vidSrc || '';
            galleryVid.load();
            galleryVid._snResetUi?.();
            pauseAllVideos(galleryVid);
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
    const modalBox = modal?.querySelector('.sn-vp-box--modal');
    const modalVideo = document.getElementById('sn-video-modal-player');
    const modalCloseBtn = document.getElementById('sn-video-modal-close');

    if (modalVideo && modalBox) {
      mountCustomControls(modalVideo, modalBox, { isStageCard: false });
    }

    const closeModal = () => {
      if (!modal || !modalVideo) return;
      modalVideo.pause();
      modalVideo.removeAttribute('src');
      modalVideo.load();
      modalVideo._snResetUi?.();
      modal.classList.remove('open');
    };

    const openModal = (src, title) => {
      if (!modal || !modalVideo) return;
      pauseAllVideos(modalVideo);
      if (modalTitle) modalTitle.textContent = title || 'Customer Video';
      modalVideo.src = src;
      modalVideo.load();
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

    // 3. Option A Video Stage Selector + Inline Play/Pause + Expand Modal
    document.querySelectorAll('[data-sn-video-stage]').forEach((mod) => {
      if (mod.dataset.snBound) return;
      mod.dataset.snBound = 'true';
      const card = mod.querySelector('.sn-vs-stage-card');
      const frameEl = mod.querySelector('.sn-vs-player-frame');
      const posterEl = mod.querySelector('.sn-vs-poster');
      const vidEl = mod.querySelector('.sn-vs-inline-video');
      const playBtn = mod.querySelector('.sn-vs-play-overlay');
      const tagEl = mod.querySelector('.sn-vs-tag');
      const titleEl = mod.querySelector('.sn-vs-title');
      const descEl = mod.querySelector('.sn-vs-desc');
      const counterEl = mod.querySelector('.sn-vs-counter');
      const expandBtn = mod.querySelector('.sn-vs-expand-btn');
      const thumbBtns = [...mod.querySelectorAll('.sn-vs-thumb-btn')];

      if (vidEl && frameEl) {
        mountCustomControls(vidEl, frameEl, { isStageCard: true, card });
        observeContainerForPause(frameEl, vidEl);
      }

      thumbBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          pauseAllVideos();
          thumbBtns.forEach((b) => b.setAttribute('aria-selected', String(b === btn)));
          if (card) {
            card.dataset.started = 'false';
            card.dataset.playing = 'false';
          }
          if (posterEl) {
            posterEl.src = btn.dataset.vsPoster || '';
            posterEl.alt = btn.dataset.vsTitle || '';
          }
          if (vidEl) {
            vidEl.pause();
            vidEl.poster = btn.dataset.vsPoster || '';
            vidEl.src = btn.dataset.vsVideo || '';
            vidEl.load();
            vidEl._snResetUi?.();
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
        pauseAllVideos(vidEl || null);
        if (card) card.dataset.started = 'true';
        vidEl?.play().catch(() => {});
      });

      expandBtn?.addEventListener('click', () => {
        openModal(expandBtn.dataset.modalVideo || '', expandBtn.dataset.modalTitle || 'Customer Video');
      });
    });

    // 4. Harden & auto-pause any third-party videos (e.g. Judge.me reviews)
    const protectThirdPartyVideo = (v) => {
      if (!v || v.hasAttribute('data-sn-custom-video')) return;
      hardenVideo(v, { keepControls: true });
      observeContainerForPause(v, v);
    };
    document.querySelectorAll('video').forEach(protectThirdPartyVideo);

    if ('MutationObserver' in window) {
      const mo = new MutationObserver((muts) => {
        muts.forEach((m) => {
          m.addedNodes.forEach((node) => {
            if (node.nodeType !== 1) return;
            if (node.tagName === 'VIDEO') protectThirdPartyVideo(node);
            else node.querySelectorAll?.('video').forEach(protectThirdPartyVideo);
          });
        });
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }

    // 5. Pause active videos on single-active play, PDP tab/nav clicks, color switch, pagehide, and tab switch
    if (!document.documentElement.dataset.snGlobalVideoGuards) {
      document.documentElement.dataset.snGlobalVideoGuards = 'true';
      document.addEventListener(
        'play',
        (e) => {
          if (e.target && e.target.tagName === 'VIDEO') pauseAllVideos(e.target);
        },
        true,
      );
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) pauseAllVideos();
      });
      window.addEventListener('pagehide', () => pauseAllVideos());
      window.addEventListener('hashchange', () => pauseAllVideos());
    }

    document
      .querySelectorAll('.product-nav [data-pdp-tab], .rating-link, .fit-help, .product-links a[href^="#"], [data-colour]')
      .forEach((el) => {
        if (el.dataset.snPauseBound) return;
        el.dataset.snPauseBound = 'true';
        el.addEventListener('click', () => pauseAllVideos());
      });

    document.querySelectorAll('[data-sn-jump-tab]').forEach((btn) => {
      if (btn.dataset.snBound) return;
      btn.dataset.snBound = 'true';
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        pauseAllVideos();
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
