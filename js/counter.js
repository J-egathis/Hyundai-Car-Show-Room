/* =============================
   counter.js - animated counters on scroll
   ============================= */

(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function animateCounter(el, to) {
    const duration = 1100;
    const start = performance.now();
    const from = 0;

    function tick(now) {
      const t = (now - start) / duration;
      const p = Math.min(1, t);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(from + (to - from) * eased);
      el.textContent = val.toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  function initCounters() {
    const counters = $$('[data-counter]');
    if (!counters.length) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const el = e.target;
          const to = Number(el.getAttribute('data-counter'));
          if (Number.isFinite(to)) animateCounter(el, to);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.25 });

    counters.forEach((c) => io.observe(c));
  }

  window.addEventListener('DOMContentLoaded', initCounters, { once: true });
})();

