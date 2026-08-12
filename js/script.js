/* =============================
   script.js - main UI interactions
   Vanilla JS only
   ============================= */

(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /** Preloader with percentage */
  const preloader = $('#preloader');
  const percentEl = $('#preloaderPercent');

  function runPreloader() {
    if (!preloader) return;

    let p = 0;
    const start = performance.now();
    const duration = 1100; // ms

    const timer = window.setInterval(() => {
      const t = performance.now() - start;
      p = Math.min(100, Math.floor((t / duration) * 100));
      if (percentEl) percentEl.textContent = `${p}%`;

      if (p >= 100) {
        window.clearInterval(timer);
        window.setTimeout(() => {
          preloader.classList.add('fade-out');
          preloader.addEventListener('transitionend', () => preloader.remove(), { once: true });
        }, 180);
      }
    }, 18);
  }

  /** Custom cursor */
  const cursor = $('#cursor');
  let mouseX = 0;
  let mouseY = 0;

  function updateCursor() {
    cursor && (cursor.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`);
  }

  function initCursor() {
    if (!cursor) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      updateCursor();
    }, { passive: true });

    const hoverables = $$('button, a, input, select, textarea, label');
    hoverables.forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('grow'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('grow'));

      if (el.classList.contains('btn') || el.closest('.btn')) {
        cursor.classList.add('btn');
        el.addEventListener('mouseenter', () => cursor.classList.add('btn'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('btn'));
      }
    });

    window.addEventListener('scroll', updateCursor, { passive: true });
  }

  /** Sticky navbar blur */
  const header = $('.site-header');
  function initNavbar() {
    if (!header) return;
    const onScroll = () => {
      if (window.scrollY > 10) header.querySelector('.navbar')?.classList.add('scrolled');
      else header.querySelector('.navbar')?.classList.remove('scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /** Mobile menu */
  function initMobileMenu() {
    const btn = $('#hamburgerBtn');
    const overlay = $('#mobileOverlay');
    const drawer = $('#mobileDrawer');
    if (!btn || !overlay || !drawer) return;

    function open() {
      overlay.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      overlay.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    btn.addEventListener('click', open);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });

    $$('#mobileDrawer a').forEach((a) => a.addEventListener('click', close));
    close();
  }

  /** Typing animation */
  function initTyping() {
    const el = $('#typingEl');
    if (!el) return;

    const words = el.getAttribute('data-words')?.split('|').map(s => s.trim()).filter(Boolean);
    const speed = Number(el.getAttribute('data-speed') || '70');
    const pause = Number(el.getAttribute('data-pause') || '1000');

    if (!words || words.length === 0) {
      el.textContent = el.textContent || 'Luxury';
      return;
    }

    let wordIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function tick() {
      const word = words[wordIndex];

      if (!deleting) {
        charIndex++;
        el.textContent = word.slice(0, charIndex);
        if (charIndex >= word.length) {
          deleting = true;
          window.setTimeout(tick, pause);
          return;
        }
      } else {
        charIndex--;
        el.textContent = word.slice(0, charIndex);
        if (charIndex <= 0) {
          deleting = false;
          wordIndex = (wordIndex + 1) % words.length;
        }
      }

      window.setTimeout(tick, deleting ? Math.max(18, speed - 20) : speed);
    }

    tick();
  }

  /** Scroll reveal */
  function initReveal() {
    const items = $$('.reveal');
    if (items.length === 0) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });

    items.forEach((i) => io.observe(i));
  }

  /** Back to top */
  function initBackToTop() {
    const btn = $('#toTop');
    if (!btn) return;

    const onScroll = () => {
      if (window.scrollY > 550) btn.classList.add('show');
      else btn.classList.remove('show');
    };
    onScroll();

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /** Progress bar */
  function initProgressBar() {
    const i = $('.progressbar > i');
    if (!i) return;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      i.style.width = `${pct}%`;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /** FAQ accordion */
  function initFAQ() {
    const faq = $('#faq');
    if (!faq) return;

    const items = $$('.faq-item', faq);
    const buttons = items.map(item => $('.faq-btn', item)).filter(Boolean);

    items.forEach((item) => {
      const body = $('.faq-body', item);
      if (body) body.style.maxHeight = '0px';
    });

    function closeAll(except) {
      items.forEach((it) => {
        const open = it === except;
        const body = $('.faq-body', it);
        if (!body) return;
        if (open) {
          it.classList.add('open');
          body.classList.add('open');
          body.style.maxHeight = body.scrollHeight + 'px';
        } else {
          it.classList.remove('open');
          body.classList.remove('open');
          body.style.maxHeight = '0px';
        }
      });
    }

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        if (!item) return;
        const isOpen = item.classList.contains('open');
        closeAll(isOpen ? null : item);
      });
    });

    // Start with none open
    closeAll(null);
  }

  /** Gallery lightbox */
  function initGalleryLightbox() {
    const lb = $('#lightbox');
    if (!lb) return;
    const img = $('#lightboxImg');
    const title = $('#lightboxTitle');
    const closeBtn = $('#lightboxClose');

    const open = ({ src, alt, heading }) => {
      if (img) img.src = src;
      if (img) img.alt = alt || 'Gallery image';
      if (title) title.textContent = heading || alt || '';
      lb.classList.add('open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      closeBtn?.focus();
    };

    const close = () => {
      lb.classList.remove('open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    $$('#gallery').forEach(()=>{});

    $$('.gallery-item[data-src]').forEach((item) => {
      item.addEventListener('click', () => {
        open({
          src: item.getAttribute('data-src'),
          alt: item.getAttribute('data-alt') || item.getAttribute('data-caption') || 'Gallery image',
          heading: item.getAttribute('data-caption') || ''
        });
      });
    });

    closeBtn?.addEventListener('click', close);
    lb.addEventListener('click', (e) => {
      if (e.target === lb) close();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lb.classList.contains('open')) close();
    });

    lb.setAttribute('aria-hidden', 'true');
  }

  /** Card tilt micro-interaction */
  function initTilt() {
    const cards = $$('.car-card, .collection-card, .icon-card, .big-stat');
    if (!cards.length) return;

    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        const ry = (x - 0.5) * 10;
        const rx = -(y - 0.5) * 8;
        card.style.setProperty('--rx', `${rx}deg`);
        card.style.setProperty('--ry', `${ry}deg`);
        card.classList.add('tilt');
      });
      card.addEventListener('mouseleave', () => {
        card.classList.remove('tilt');
        card.style.removeProperty('--rx');
        card.style.removeProperty('--ry');
      });
    });
  }

  function init() {
    runPreloader();
    initCursor();
    initNavbar();
    initMobileMenu();
    initTyping();
    initReveal();
    initBackToTop();
    initProgressBar();
    initFAQ();
    initGalleryLightbox();
    initTilt();
  }

  window.addEventListener('DOMContentLoaded', init, { once: true });
})();

