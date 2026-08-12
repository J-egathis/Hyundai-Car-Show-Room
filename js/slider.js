/* =============================
   slider.js - premium collection slider + testimonials
   ============================= */

(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);

  function initInfiniteAutoSlider() {
    const track = $('#collectionTrack');
    if (!track) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const speed = Number(track.getAttribute('data-speed') || '55'); // px/s
    const pauseOnHover = true;

    const outer = track.closest('.auto-slider');
    let rafId = null;
    let last = performance.now();
    let x = 0;

    // Clone first set if needed to enable seamless loop
    const cards = Array.from(track.children);
    if (cards.length) {
      // duplicate once
      cards.slice(0).forEach((c) => track.appendChild(c.cloneNode(true)));
    }

    const loop = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      x += speed * dt;

      // Shift and wrap
      const scrollW = track.scrollWidth / 2; // because we duplicated once
      if (x >= scrollW) x = 0;

      track.style.transform = `translateX(${-x}px)`;
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    if (pauseOnHover && outer) {
      outer.addEventListener('mouseenter', () => cancelAnimationFrame(rafId));
      outer.addEventListener('mouseleave', () => {
        last = performance.now();
        rafId = requestAnimationFrame(loop);
      });
    }
  }

  function initTestimonialsSlider() {
    const wrap = $('#testimonialsPanel') || $('#testimonials');
    const track = $('#testimonialsTrack');
    if (!wrap || !track) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const cards = Array.from(track.children);
    if (cards.length <= 1) return;

    let idx = 0;
    const getCardW = () => {
      const first = cards[0]?.getBoundingClientRect();
      const styles = getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap || '24');
      return (first?.width || 420) + gap;
    };
    let w = getCardW();

    const set = () => {
      w = getCardW();
      track.style.transform = `translateX(${-idx * w}px)`;
    };
    requestAnimationFrame(() => set());
    set();

    let timer = null;
    const start = () => {
      stop();
      timer = window.setInterval(() => {
        idx = (idx + 1) % cards.length;
        set();
      }, 4200);
    };
    const stop = () => timer && window.clearInterval(timer);

    start();

    wrap.addEventListener('mouseenter', stop);
    wrap.addEventListener('mouseleave', start);
    window.addEventListener('resize', () => {
      idx = 0;
      set();
    }, { passive: true });
  }

  function init() {
    initInfiniteAutoSlider();
    initTestimonialsSlider();
  }

  window.addEventListener('DOMContentLoaded', init, { once: true });
})();

