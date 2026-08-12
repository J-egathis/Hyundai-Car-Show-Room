/* =============================
   wishlist.js - localStorage wishlist
   ============================= */

(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const KEY = 'car-showroom-wishlist-v1';

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '[]');
    } catch {
      return [];
    }
  }

  function save(ids) {
    localStorage.setItem(KEY, JSON.stringify(ids));
  }

  function setActive(button, active) {
    if (!button) return;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
  }

  function initWishlist() {
    const buttons = $$('[data-wish-id]');
    if (!buttons.length) return;

    const current = new Set(load());

    buttons.forEach((btn) => {
      const id = btn.getAttribute('data-wish-id');
      if (!id) return;
      setActive(btn, current.has(id));

      btn.addEventListener('click', () => {
        const active = !btn.classList.contains('active');
        if (active) current.add(id);
        else current.delete(id);
        setActive(btn, active);
        save(Array.from(current));
      });
    });
  }

  window.addEventListener('DOMContentLoaded', initWishlist, { once: true });
})();

