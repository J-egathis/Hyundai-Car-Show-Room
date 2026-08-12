/* =============================
   featured.js - Featured cars, filters, search, compare, actions
   Vanilla JS only
   ============================= */

(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ---- Data (12 cars, no external assets required) ----
  const CAR_DATA = [
    {
      id: 'bmw-i7',
      brand: 'BMW',
      name: 'i7 xDrive',
      price: 119900,
      fuel: 'Electric',
      transmission: 'Single-speed',
      engine: 'Dual Motor',
      horsepower: 544,
      topSpeed: 149,
      mileage: 310,
      availability: 'In Stock',
      rating: 4.8,
      bodyType: 'Sedan',
      bodyLogo: 'bmw'
    },
    {
      id: 'audi-e-tron',
      brand: 'Audi',
      name: 'e-tron GT',
      price: 99900,
      fuel: 'Electric',
      transmission: '2-Speed',
      engine: 'Performance',
      horsepower: 637,
      topSpeed: 152,
      mileage: 300,
      availability: 'In Stock',
      rating: 4.7,
      bodyType: 'Sedan',
      bodyLogo: 'audi'
    },
    {
      id: 'merc-eqs',
      brand: 'Mercedes',
      name: 'EQS 580 4MATIC',
      price: 109500,
      fuel: 'Electric',
      transmission: 'Single-speed',
      engine: 'Twin Motor',
      horsepower: 516,
      topSpeed: 130,
      mileage: 320,
      availability: 'Preorder',
      rating: 4.9,
      bodyType: 'Luxury',
      bodyLogo: 'mercedes'
    },
    {
      id: 'porsche-taycan',
      brand: 'Porsche',
      name: 'Taycan Turbo S',
      price: 189900,
      fuel: 'Electric',
      transmission: '2-Speed',
      engine: 'Turbo',
      horsepower: 750,
      topSpeed: 161,
      mileage: 280,
      availability: 'In Stock',
      rating: 4.9,
      bodyType: 'Sport Sedan',
      bodyLogo: 'porsche'
    },
    {
      id: 'tesla-model-s',
      brand: 'Tesla',
      name: 'Model S Plaid',
      price: 89990,
      fuel: 'Electric',
      transmission: 'Single-speed',
      engine: 'Tri Motor',
      horsepower: 1020,
      topSpeed: 200,
      mileage: 396,
      availability: 'In Stock',
      rating: 4.7,
      bodyType: 'Sedan',
      bodyLogo: 'tesla'
    },
    {
      id: 'ferrari-roma',
      brand: 'Ferrari',
      name: 'Roma Spider',
      price: 279900,
      fuel: 'Gasoline',
      transmission: '8-Speed DCT',
      engine: 'V8 Twin-Turbo',
      horsepower: 620,
      topSpeed: 199,
      mileage: 17,
      availability: 'Preorder',
      rating: 4.6,
      bodyType: 'Grand Tourer',
      bodyLogo: 'ferrari'
    },
    {
      id: 'lamborghini-urus',
      brand: 'Lamborghini',
      name: 'Urus Performante',
      price: 259900,
      fuel: 'Gasoline',
      transmission: '8-Speed',
      engine: 'V8 Twin-Turbo',
      horsepower: 657,
      topSpeed: 190,
      mileage: 12,
      availability: 'In Stock',
      rating: 4.8,
      bodyType: 'SUV',
      bodyLogo: 'lamborghini'
    },
    {
      id: 'toyota-supra',
      brand: 'Toyota',
      name: 'Supra GR',
      price: 59000,
      fuel: 'Gasoline',
      transmission: '8-Speed',
      engine: '3.0L Turbo',
      horsepower: 382,
      topSpeed: 155,
      mileage: 24,
      availability: 'In Stock',
      rating: 4.5,
      bodyType: 'Coupe',
      bodyLogo: 'toyota'
    },
    {
      id: 'honda-nsxe',
      brand: 'Honda',
      name: 'NSX-e Concept',
      price: 74000,
      fuel: 'Hybrid',
      transmission: 'e-CVT',
      engine: 'Hybrid V6',
      horsepower: 500,
      topSpeed: 174,
      mileage: 38,
      availability: 'Preorder',
      rating: 4.4,
      bodyType: 'Sports',
      bodyLogo: 'honda'
    },
    {
      id: 'hyundai-ioniq',
      brand: 'Hyundai',
      name: 'IONIQ 6 N',
      price: 48900,
      fuel: 'Electric',
      transmission: 'Single-speed',
      engine: 'High Power',
      horsepower: 577,
      topSpeed: 160,
      mileage: 340,
      availability: 'In Stock',
      rating: 4.6,
      bodyType: 'Sedan',
      bodyLogo: 'hyundai'
    },
    {
      id: 'bmw-m4',
      brand: 'BMW',
      name: 'M4 Competition',
      price: 74900,
      fuel: 'Gasoline',
      transmission: '8-Speed DCT',
      engine: 'TwinPower Turbo',
      horsepower: 503,
      topSpeed: 174,
      mileage: 22,
      availability: 'In Stock',
      rating: 4.7,
      bodyType: 'Coupe',
      bodyLogo: 'bmw'
    },
    {
      id: 'audi-q8e',
      brand: 'Audi',
      name: 'Q8 e-tron Quattro',
      price: 72900,
      fuel: 'Electric',
      transmission: 'Single-speed',
      engine: 'Quattro',
      horsepower: 496,
      topSpeed: 124,
      mileage: 285,
      availability: 'Preorder',
      rating: 4.5,
      bodyType: 'SUV',
      bodyLogo: 'audi'
    }
  ];

  // ---- DOM ----
  const carsRoot = $('#carsGrid');
  const filterForm = $('#filtersForm');

  const compareSlotEls = [
    $('#compareSlot1'),
    $('#compareSlot2'),
    $('#compareSlot3')
  ];
  const compareEmpty = $('#compareEmpty');
  const compareHint = $('#compareHint');
  const compareTable = $('#compareTableBody');

  const state = {
    wishlist: new Set(),
    compare: [] // up to 3 ids
  };

  const WL_KEY = 'car-showroom-wishlist-v1';

  function safeParseWishlist() {
    try {
      const arr = JSON.parse(localStorage.getItem(WL_KEY) || '[]');
      if (Array.isArray(arr)) return arr;
    } catch {}
    return [];
  }

  function formatPrice(n) {
    return `$${Math.round(n).toLocaleString()}`;
  }

  function starString(rating) {
    const full = Math.floor(rating);
    return '★★★★★'.slice(0, full) + '☆☆☆☆☆'.slice(0, 5 - full);
  }

  function brandLogoSVG(brand) {
    // Inline SVG placeholders (no external assets)
    const b = (brand || '').toLowerCase();
    const common = 'filter="drop-shadow(0 0 18px rgba(0,200,255,.18))"';

    const map = {
      bmw: `<svg ${common} width="26" height="26" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M32 5c5 0 10 2 14 6 8 8 8 22 0 30L32 59 18 41c-8-8-8-22 0-30 4-4 9-6 14-6Z" fill="rgba(0,200,255,.15)" stroke="rgba(0,200,255,.8)" stroke-width="2"/><path d="M16 21h32l-16 30L16 21Z" fill="rgba(108,99,255,.2)" stroke="rgba(108,99,255,.85)" stroke-width="2"/></svg>`,
      audi: `<svg ${common} width="26" height="26" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="22" r="6" fill="rgba(0,200,255,.15)" stroke="rgba(0,200,255,.8)" stroke-width="2"/><circle cx="46" cy="22" r="6" fill="rgba(0,200,255,.15)" stroke="rgba(0,200,255,.8)" stroke-width="2"/><circle cx="32" cy="22" r="6" fill="rgba(108,99,255,.18)" stroke="rgba(108,99,255,.85)" stroke-width="2"/><path d="M12 38c8-6 32-6 40 0" fill="none" stroke="rgba(255,215,0,.85)" stroke-width="3" stroke-linecap="round"/></svg>`,
      mercedes: `<svg ${common} width="26" height="26" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M32 6 12 44l20 14 20-14L32 6Z" fill="rgba(255,255,255,.06)" stroke="rgba(0,200,255,.75)" stroke-width="2"/><path d="M32 16 24 36l8 6 8-6-8-20Z" fill="rgba(108,99,255,.18)" stroke="rgba(108,99,255,.85)" stroke-width="2"/></svg>`,
      porsche: `<svg ${common} width="26" height="26" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M32 6c12 0 22 10 22 22S44 50 32 50 10 40 10 28 20 6 32 6Z" fill="rgba(0,200,255,.12)" stroke="rgba(0,200,255,.75)" stroke-width="2"/><path d="M25 42V22h14v20H25Z" fill="rgba(108,99,255,.18)" stroke="rgba(108,99,255,.85)" stroke-width="2"/><path d="M22 38h20" stroke="rgba(255,215,0,.85)" stroke-width="3" stroke-linecap="round"/></svg>`,
      tesla: `<svg ${common} width="26" height="26" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M34 4 18 34h14l-6 26 20-32H30l4-24Z" fill="rgba(0,200,255,.14)" stroke="rgba(0,200,255,.85)" stroke-width="2"/></svg>`,
      ferrari: `<svg ${common} width="26" height="26" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M32 6c14 0 24 10 24 22S46 50 32 50 8 40 8 28 18 6 32 6Z" fill="rgba(108,99,255,.16)" stroke="rgba(108,99,255,.85)" stroke-width="2"/><path d="M22 28h20l-10 18-10-18Z" fill="rgba(0,200,255,.14)" stroke="rgba(0,200,255,.8)" stroke-width="2"/></svg>`,
      lamborghini: `<svg ${common} width="26" height="26" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M12 20 32 10l20 10-8 26H20l-8-26Z" fill="rgba(255,215,0,.12)" stroke="rgba(255,215,0,.85)" stroke-width="2"/><path d="M20 46h24" stroke="rgba(0,200,255,.85)" stroke-width="3" stroke-linecap="round"/></svg>`,
      toyota: `<svg ${common} width="26" height="26" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M32 6 44 18l-12 8-12-8L32 6Z" fill="rgba(0,200,255,.12)" stroke="rgba(0,200,255,.85)" stroke-width="2"/><path d="M16 30h32L32 58 16 30Z" fill="rgba(108,99,255,.16)" stroke="rgba(108,99,255,.85)" stroke-width="2"/></svg>`,
      honda: `<svg ${common} width="26" height="26" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="22" fill="rgba(0,200,255,.12)" stroke="rgba(0,200,255,.85)" stroke-width="2"/><path d="M22 42c10-18 20-18 20 0" fill="none" stroke="rgba(255,215,0,.85)" stroke-width="3" stroke-linecap="round"/></svg>`,
      hyundai: `<svg ${common} width="26" height="26" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M12 30c8-10 32-10 40 0" fill="none" stroke="rgba(0,200,255,.85)" stroke-width="3" stroke-linecap="round"/><path d="M18 40c6-6 22-6 28 0" fill="none" stroke="rgba(108,99,255,.85)" stroke-width="3" stroke-linecap="round"/><path d="M32 10v10" stroke="rgba(255,215,0,.85)" stroke-width="3" stroke-linecap="round"/></svg>`,
      default: `<svg ${common} width="26" height="26" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M10 32c6-18 38-18 44 0-6 18-38 18-44 0Z" fill="rgba(0,200,255,.12)" stroke="rgba(0,200,255,.85)" stroke-width="2"/></svg>`
    };

    return (map[b] || map.default);
  }

  function carCardTemplate(car) {
    return `
      <article class="car-card" data-car-id="${car.id}">
        <div class="car-thumb">
          <img alt="${car.brand} ${car.name}" loading="lazy" src="data:image/svg+xml;utf8,${encodeURIComponent(carHeroSVG(car))}" />
        </div>
        <div class="car-body">
          <div class="car-badge-row">
            <div class="car-brand-logo" aria-hidden="true">${brandLogoSVG(car.bodyLogo)}</div>
            <button class="wish" type="button" aria-label="Add to wishlist" data-wish-id="${car.id}">
              <svg class="heart" viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21s-7-4.7-9.2-8.6C1.2 9.4 2.6 6.9 5.2 6.2c1.5-.4 3.1.1 4.1 1.2 1-1.1 2.6-1.6 4.1-1.2 2.6.7 4 3.2 2.4 6.2C19 16.3 12 21 12 21z"/>
              </svg>
            </button>
          </div>

          <h3 class="car-title">${car.brand} ${car.name}</h3>
          <div class="car-price">${formatPrice(car.price)}</div>

          <div class="meta-list" aria-label="Car specifications">
            <div class="meta"><b>${car.fuel}</b> Fuel</div>
            <div class="meta"><b>${car.transmission}</b> Trans</div>
            <div class="meta"><b>${car.horsepower}</b> HP</div>
            <div class="meta"><b>${car.topSpeed}</b> Top</div>
            <div class="meta"><b>${car.mileage}</b> Mileage</div>
            <div class="meta"><b>${car.engine}</b> Engine</div>
          </div>

          <div class="rating-row">
            <div class="stars" aria-label="Rating">${starString(car.rating)}</div>
            <div class="avail"><span class="pulse" aria-hidden="true"></span>${car.availability}</div>
          </div>

          <div class="car-actions">
            <button class="btn btn-primary book" type="button" data-book-id="${car.id}">
              <span class="icon" aria-hidden="true">⟡</span>
              Book
            </button>
            <button class="btn details" type="button" data-compare-id="${car.id}">
              <span class="icon" aria-hidden="true">⇄</span>
              Compare
            </button>
          </div>
        </div>
      </article>
    `;
  }

  function carHeroSVG(car) {
    const accent = car.fuel === 'Electric' ? '#00C8FF' : (car.fuel === 'Hybrid' ? '#6C63FF' : '#FFD700');
    const brand = car.brand;
    const bodyType = (car.bodyType || '').toLowerCase();

    let bodyPath = `
      <path d="M170 260c20-55 110-105 210-110 80-4 150 10 200 46 25 18 45 42 55 66 10 26 6 52-12 63-15 9-45 11-82 11H230c-35 0-66-5-76-19-8-11-7-26 16-57z"
        fill="url(#g)" stroke="rgba(255,255,255,.12)"/>
    `;
    let roofPath = `
      <path d="M220 270c60-62 115-80 190-74 80 6 132 29 195 78"
        stroke="${accent}" stroke-width="10" stroke-linecap="round" opacity="0.85" filter="url(#glow)"/>
    `;

    if (bodyType.includes('suv')) {
      bodyPath = `
        <path d="M172 256l58-46h122l82 18h126l72 28h48c16 0 30 14 30 30v40c0 16-14 30-30 30H182c-18 0-32-14-32-30v-32c0-10 4-19 12-26z"
          fill="url(#g)" stroke="rgba(255,255,255,.12)"/>
      `;
      roofPath = `
        <path d="M248 242h152l90 18h76"
          stroke="${accent}" stroke-width="8" stroke-linecap="round" opacity="0.9" filter="url(#glow)"/>
      `;
    } else if (bodyType.includes('coupe') || bodyType.includes('sport') || bodyType.includes('grand')) {
      bodyPath = `
        <path d="M168 268l62-58h114l86 18h104l64 40h54c18 0 32 14 32 32v33c0 17-14 31-32 31H182c-18 0-32-14-32-31v-28c0-10 4-20 12-28z"
          fill="url(#g)" stroke="rgba(255,255,255,.12)"/>
      `;
      roofPath = `
        <path d="M224 254c58-36 120-46 188-38 70 8 130 34 184 82"
          stroke="${accent}" stroke-width="10" stroke-linecap="round" opacity="0.9" filter="url(#glow)"/>
      `;
    } else if (bodyType.includes('luxury')) {
      bodyPath = `
        <path d="M168 262l64-48h148l78 18h114l68 30h52c18 0 32 14 32 32v35c0 17-14 31-32 31H182c-18 0-32-14-32-31v-31c0-10 4-20 12-28z"
          fill="url(#g)" stroke="rgba(255,255,255,.12)"/>
      `;
      roofPath = `
        <path d="M248 240h148l86 16"
          stroke="${accent}" stroke-width="8" stroke-linecap="round" opacity="0.95" filter="url(#glow)"/>
      `;
    }

    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="420" viewBox="0 0 800 420">
        <defs>
          <linearGradient id="g" x1="120" y1="120" x2="720" y2="320" gradientUnits="userSpaceOnUse">
            <stop stop-color="${accent}" stop-opacity="0.95"/>
            <stop offset="1" stop-color="#070707" stop-opacity="0.9"/>
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="b"/>
            <feMerge>
              <feMergeNode in="b"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <rect width="800" height="420" rx="34" fill="rgba(255,255,255,0.02)"/>
        <ellipse cx="410" cy="340" rx="300" ry="26" fill="${accent}" opacity="0.18" filter="url(#glow)"/>
        ${bodyPath}
        ${roofPath}
        <g opacity="0.95">
          <circle cx="280" cy="310" r="48" fill="#060606" stroke="${accent}" stroke-width="4"/>
          <circle cx="280" cy="310" r="18" fill="#0F0F0F"/>
          <circle cx="550" cy="310" r="48" fill="#060606" stroke="${accent}" stroke-width="4"/>
          <circle cx="550" cy="310" r="18" fill="#0F0F0F"/>
        </g>
        <rect x="48" y="54" width="220" height="40" rx="20" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.14)"/>
        <text x="70" y="80" fill="rgba(255,255,255,.85)" font-family="Poppins, sans-serif" font-weight="800" font-size="24">${brand}</text>
      </svg>
    `.trim();
  }

  function applyWishlistState() {
    const current = new Set(safeParseWishlist());
    state.wishlist = current;

    $$('[data-wish-id]').forEach((btn) => {
      const id = btn.getAttribute('data-wish-id');
      btn.classList.toggle('active', current.has(id));
    });
  }

  function renderCars(list) {
    if (!carsRoot) return;
    carsRoot.innerHTML = list.map(carCardTemplate).join('');
    applyWishlistState();

    // Wire book + compare
    $$('[data-book-id]', carsRoot).forEach((b) => {
      b.addEventListener('click', () => {
        const id = b.getAttribute('data-book-id');
        const car = CAR_DATA.find(c => c.id === id);
        const form = $('#contactForm');
        const name = $('#contactName');
        if (form && car) {
          $('#contactTopic').value = `Test drive request: ${car.brand} ${car.name}`;
          name?.focus();
          form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    $$('[data-compare-id]', carsRoot).forEach((b) => {
      const id = b.getAttribute('data-compare-id');
      const active = state.compare.includes(id);
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
      b.addEventListener('click', () => toggleCompare(id));
    });
  }

  function getFilters() {
    const fd = new FormData(filterForm || undefined);
    const brand = fd.get('brand') || 'All';
    const price = fd.get('price') || 'All';
    const fuel = fd.get('fuel') || 'All';
    const transmission = fd.get('transmission') || 'All';
    const bodyType = fd.get('bodyType') || 'All';
    const search = (fd.get('search') || '').toString().trim().toLowerCase();
    return { brand, price, fuel, transmission, bodyType, search };
  }

  function priceMatch(car, price) {
    const p = car.price;
    if (price === 'All') return true;
    if (price === 'Under 60k') return p < 60000;
    if (price === '60k - 100k') return p >= 60000 && p <= 100000;
    if (price === '100k - 200k') return p > 100000 && p <= 200000;
    if (price === '200k+') return p > 200000;
    return true;
  }

  function toggleCompare(id) {
    const idx = state.compare.indexOf(id);
    if (idx !== -1) {
      state.compare.splice(idx, 1);
    } else {
      if (state.compare.length >= 3) state.compare.shift();
      state.compare.push(id);
    }
    renderCompare();
  }

  function renderCompare() {
    if (!compareTable) return;

    const cars = state.compare.map(cid => CAR_DATA.find(c => c.id === cid)).filter(Boolean);

    compareSlotEls.forEach((slotEl, i) => {
      const car = cars[i];
      if (!slotEl) return;
      if (!car) {
        slotEl.innerHTML = `<span class="small">Empty</span>`;
      } else {
        slotEl.innerHTML = `
          <div style="display:flex; align-items:center; gap:.8rem">
            <div class="car-brand-logo" aria-hidden="true">${brandLogoSVG(car.bodyLogo)}</div>
            <div>
              <div style="font-weight:900; font-family:'Space Grotesk'">${car.brand}</div>
              <div class="small">${car.name}</div>
            </div>
          </div>
        `;
      }
    });

    if (compareEmpty) {
      compareEmpty.style.display = cars.length ? 'none' : 'block';
      compareEmpty.textContent = cars.length ? 'Comparison ready.' : 'Select “Compare” on up to 3 cars to see details.';
    }
    if (compareHint) {
      compareHint.textContent = cars.length ? `${cars.length} car${cars.length > 1 ? 's' : ''} selected for comparison.` : 'Pick up to three cars to compare specs.';
    }

    const cols = [cars[0], cars[1], cars[2]];
    const rows = [
      ['Price', c => (c ? formatPrice(c.price) : '—')],
      ['Fuel', c => (c ? c.fuel : '—')],
      ['Transmission', c => (c ? c.transmission : '—')],
      ['Engine', c => (c ? c.engine : '—')],
      ['Horsepower', c => (c ? `${c.horsepower} HP` : '—')],
      ['Top Speed', c => (c ? `${c.topSpeed} mph` : '—')],
      ['Mileage', c => (c ? `${c.mileage} mi` : '—')],
      ['Availability', c => (c ? c.availability : '—')]
    ];

    compareTable.innerHTML = rows
      .map(([label, fn]) => {
        return `<tr><th scope="row">${label}</th>${cols.map(c => `<td>${fn(c)}</td>`).join('')}</tr>`;
      })
      .join('');
  }

  function applySearchFilter(list, search) {
    if (!search) return list;
    return list.filter(c => {
      const hay = `${c.brand} ${c.name} ${c.bodyType} ${c.fuel} ${c.transmission}`.toLowerCase();
      return hay.includes(search);
    });
  }

  function applyFilters() {
    const { brand, price, fuel, transmission, bodyType, search } = getFilters();

    let list = [...CAR_DATA];

    if (brand !== 'All') list = list.filter(c => c.brand === brand);
    if (fuel !== 'All') list = list.filter(c => c.fuel === fuel);
    if (transmission !== 'All') list = list.filter(c => c.transmission === transmission);
    if (bodyType !== 'All') list = list.filter(c => c.bodyType === bodyType);

    list = list.filter(c => priceMatch(c, price));
    list = applySearchFilter(list, search);

    renderCars(list);
  }

  function initFilterOptions() {
    // Fill filter selects from data (if the selects exist)
    const brandSel = $('#filterBrand');
    const priceSel = $('#filterPrice');
    const fuelSel = $('#filterFuel');
    const transSel = $('#filterTransmission');
    const bodySel = $('#filterBodyType');

    const setOptions = (sel, values) => {
      if (!sel) return;
      const uniq = Array.from(new Set(values));
      sel.innerHTML = `<option value="All">All</option>` + uniq.map(v => `<option value="${v}">${v}</option>`).join('');
    };

    setOptions(brandSel, CAR_DATA.map(c => c.brand));
    setOptions(fuelSel, CAR_DATA.map(c => c.fuel));
    setOptions(transSel, CAR_DATA.map(c => c.transmission));
    setOptions(bodySel, CAR_DATA.map(c => c.bodyType));

    // price is curated
    if (priceSel) {
      priceSel.innerHTML = `
        <option value="All">All Prices</option>
        <option value="Under 60k">Under 60k</option>
        <option value="60k - 100k">60k - 100k</option>
        <option value="100k - 200k">100k - 200k</option>
        <option value="200k+">200k+</option>
      `;
    }
  }

  function init() {
    initFilterOptions();
    applyWishlistState();
    renderCars(CAR_DATA.slice(0, 12));

    if (filterForm) {
      filterForm.addEventListener('input', (e) => {
        // Instant filtering
        // Prevent expensive reflow only for range events (not used)
        applyFilters();
      });
      filterForm.addEventListener('change', applyFilters);
    }

    // Wishlist wiring is handled in wishlist.js; ensure compare buttons work
    renderCompare();

    // Optional: compare clear button
    const clear = $('#clearCompare');
    clear?.addEventListener('click', () => {
      state.compare = [];
      renderCompare();
    });
  }

  window.addEventListener('DOMContentLoaded', init, { once: true });
})();

