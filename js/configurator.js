/* =============================
   configurator.js - color + wheels, instant preview
   Vanilla JS only
   ============================= */

(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);

  const config = {
    colors: [
      { id: 'aqua', label: 'Aqua Neon', paint: '#00C8FF' },
      { id: 'violet', label: 'Violet Pulse', paint: '#6C63FF' },
      { id: 'gold', label: 'Luxury Gold', paint: '#FFD700' },
      { id: 'graphite', label: 'Graphite', paint: '#2b2b2b' }
    ],
    wheels: [
      { id: 'aero', label: 'Aero Spoke', accent: '#00C8FF' },
      { id: 'turbine', label: 'Turbine', accent: '#6C63FF' },
      { id: 'forged', label: 'Forged Black', accent: '#FFD700' }
    ]
  };

  function buildColorSwatches(container) {
    const frag = document.createDocumentFragment();
    config.colors.forEach((c, idx) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'swatch';
      b.dataset.type = 'color';
      b.dataset.id = c.id;
      if (idx === 0) b.classList.add('active');

      b.innerHTML = `<span class="fill" style="background:${c.paint}"></span>`;
      frag.appendChild(b);
    });
    container.appendChild(frag);
  }

  function buildWheelSwatches(container) {
    const frag = document.createDocumentFragment();
    config.wheels.forEach((w, idx) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'swatch';
      b.dataset.type = 'wheels';
      b.dataset.id = w.id;
      if (idx === 0) b.classList.add('active');
      b.innerHTML = `<span class="fill" style="background:${w.accent}"></span>`;
      frag.appendChild(b);
    });
    container.appendChild(frag);
  }

  function createCarSVG() {
    // Inline SVG (no external assets) so no broken images.
    return `
      <svg width="100%" height="100%" viewBox="0 0 720 420" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bodyGrad" x1="130" y1="120" x2="610" y2="310" gradientUnits="userSpaceOnUse">
            <stop stop-color="${'{{PAINT}}'}" stop-opacity="0.95"/>
            <stop offset="1" stop-color="#0B0B0B" stop-opacity="0.8"/>
          </linearGradient>
          <linearGradient id="neon" x1="80" y1="160" x2="650" y2="160" gradientUnits="userSpaceOnUse">
            <stop stop-color="${'{{ACCENT}}'}" stop-opacity="0.95"/>
            <stop offset="1" stop-color="${'{{ACCENT}}'}" stop-opacity="0.08"/>
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <!-- Floor glow -->
        <ellipse cx="360" cy="340" rx="240" ry="26" fill="url(#neon)" opacity="0.55" filter="url(#glow)"/>

        <!-- Car silhouette -->
        <path d="M150 245C170 190 225 155 300 145C350 135 390 135 440 145C510 160 560 190 585 235C594 252 595 270 590 286C585 300 570 306 550 308H170C145 306 132 292 132 275C132 266 138 257 150 245Z" fill="url(#bodyGrad)"/>

        <!-- Neon stripe -->
        <path d="M190 260C230 215 270 198 335 190C400 182 455 188 515 220" stroke="url(#neon)" stroke-width="8" stroke-linecap="round" filter="url(#glow)"/>

        <!-- Windows -->
        <path d="M260 205C300 175 370 168 430 180C465 187 490 205 500 225C480 232 450 235 410 235H285C270 235 260 228 260 205Z" fill="#050505" opacity="0.7"/>

        <!-- Headlights -->
        <circle cx="220" cy="292" r="14" fill="url(#neon)" opacity="0.9"/>
        <circle cx="500" cy="292" r="14" fill="url(#neon)" opacity="0.9"/>

        <!-- Wheels -->
        <g id="wheels">
          <circle cx="245" cy="315" r="38" fill="#0A0A0A" stroke="url(#neon)" stroke-width="3" opacity="0.95"/>
          <circle cx="245" cy="315" r="18" fill="#0F0F0F"/>
          <circle cx="480" cy="315" r="38" fill="#0A0A0A" stroke="url(#neon)" stroke-width="3" opacity="0.95"/>
          <circle cx="480" cy="315" r="18" fill="#0F0F0F"/>
        </g>
      </svg>
    `.trim();
  }

  function applyPreview(paint, accent) {
    const svgContainer = $('#configCarSVG');
    if (!svgContainer) return;
    const html = createCarSVG()
      .replaceAll('{{PAINT}}', paint)
      .replaceAll('{{ACCENT}}', accent);

    svgContainer.innerHTML = html;
  }

  function init() {
    const colorWrap = $('#colorSwatches');
    const wheelWrap = $('#wheelSwatches');
    if (!colorWrap || !wheelWrap) return;

    buildColorSwatches(colorWrap);
    buildWheelSwatches(wheelWrap);

    const activeColor = colorWrap.querySelector('.swatch.active');
    const activeWheel = wheelWrap.querySelector('.swatch.active');

    const color = config.colors.find(c => c.id === activeColor?.dataset.id) || config.colors[0];
    const wheel = config.wheels.find(w => w.id === activeWheel?.dataset.id) || config.wheels[0];

    applyPreview(color.paint, wheel.accent);

    document.addEventListener('click', (e) => {
      const t = e.target.closest('.swatch');
      if (!t) return;

      if (t.dataset.type === 'color') {
        $$('.swatch[data-type="color"]', colorWrap).forEach(s => s.classList.remove('active'));
        t.classList.add('active');
        const selected = config.colors.find(c => c.id === t.dataset.id);
        if (selected) {
          const aw = wheelWrap.querySelector('.swatch.active');
          const wheelSel = config.wheels.find(w => w.id === aw?.dataset.id) || config.wheels[0];
          applyPreview(selected.paint, wheelSel.accent);
        }
      }

      if (t.dataset.type === 'wheels') {
        $$('.swatch[data-type="wheels"]', wheelWrap).forEach(s => s.classList.remove('active'));
        t.classList.add('active');
        const selectedW = config.wheels.find(w => w.id === t.dataset.id);
        if (selectedW) {
          const ac = colorWrap.querySelector('.swatch.active');
          const colorSel = config.colors.find(c => c.id === ac?.dataset.id) || config.colors[0];
          applyPreview(colorSel.paint, selectedW.accent);
        }
      }
    });
  }

  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  window.addEventListener('DOMContentLoaded', init, { once: true });
})();

