(() => {
  'use strict';

  const API = 'https://carall.az/api';
  const qs  = new URLSearchParams(window.location.search);

  function money(n) {
    return `${Number(n || 0).toLocaleString('az-AZ')} AZN`;
  }

  function esc(str) {
    return String(str || '')
      .replaceAll('&', '&amp;').replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;').replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function imgSrc(item) {
    return item.imageUrl || item.image || item.img ||
      (typeof item.images?.[0] === 'string' ? item.images[0] : null) ||
      'images/no-image.png';
  }

  // ── Kategoriya siyahısını çək ──
  async function fetchCategories() {
    try {
      const res = await fetch(`${API}/SpareParts/categories`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data
        : Array.isArray(data.data) ? data.data : [];
    } catch { return []; }
  }

  // ── Məhsulları çək ──
  async function fetchParts(params = {}) {
    const url = new URL(`${API}/SpareParts`);
    Object.entries(params).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') url.searchParams.set(k, v);
    });
    try {
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data
        : Array.isArray(data.data) ? data.data
        : Array.isArray(data.items) ? data.items : [];
    } catch { return []; }
  }

  // ── Tək məhsul çək ──
  async function fetchPartById(id) {
    try {
      const res = await fetch(`${API}/SpareParts/${id}`);
      if (!res.ok) return null;
      return await res.json();
    } catch { return null; }
  }

  /* ============================================================
     LIST PAGE  (partsGrid elementi varsa)
  ============================================================ */
  const partsGrid   = document.getElementById('partsGrid');

  if (partsGrid) {
    const pageTitle   = document.getElementById('partsPageTitle');
    const pageDesc    = document.getElementById('partsPageDesc');
    const searchInput = document.getElementById('partsSearch');
    const partsEmpty  = document.getElementById('partsEmpty');
    const partsCount  = document.getElementById('partsCount');
    const catLinks    = document.querySelectorAll('[data-cat-link]');

    let allParts = [];
    let currentCatId = Number(qs.get('cat')) || null;
    let currentCatName = qs.get('catName') || '';

    function cardTemplate(item) {
      const catLabel = item.categoryName || item.category?.name || currentCatName || 'Ehtiyat hissəsi';
      return `
        <article class="part-card">
          <div class="part-card__media">
            <img
              src="${esc(imgSrc(item))}"
              alt="${esc(item.name || item.title || '')}"
              loading="lazy"
              onerror="this.onerror=null;this.src='images/no-image.png';"
            />
            <span class="part-card__badge">${esc(catLabel)}</span>
          </div>
          <div class="part-card__body">
            <h3 class="part-card__title">${esc(item.name || item.title || '—')}</h3>
            <p class="part-card__desc">${esc(item.description || item.desc || '')}</p>
            <div class="part-card__meta">
              <span>${esc(item.manufacturerName || item.brand || '')}</span>
              <span>${esc(item.variant || item.spec || '')}</span>
            </div>
            <div class="part-card__bottom">
              <strong class="part-card__price">${money(item.price)}</strong>
              <a class="part-card__btn" href="ehtiyyat_details.html?id=${item.id}">Ətraflı bax</a>
            </div>
          </div>
        </article>
      `;
    }

    function renderList(list) {
      const q = (searchInput?.value || '').trim().toLowerCase();
      const filtered = q
        ? list.filter(x =>
            [x.name, x.title, x.description, x.manufacturerName, x.brand, x.variant]
              .join(' ').toLowerCase().includes(q))
        : list;

      partsGrid.innerHTML = filtered.map(cardTemplate).join('');
      if (partsCount) partsCount.textContent = `${filtered.length} məhsul`;
      partsGrid.hidden   = filtered.length === 0;
      if (partsEmpty) partsEmpty.hidden = filtered.length > 0;
    }

    // Kategoriyaları yüklə və nav-a əlavə et
    async function initCategories() {
      const cats = await fetchCategories();

      if (cats.length && catLinks.length === 0) {
        // Dinamik nav yoxdursa — ən azı title/desc yenilə
      }

      // Mövcud nav linklərini aktivləşdir
      catLinks.forEach(link => {
        const catId = Number(link.getAttribute('data-cat-link'));
        link.classList.toggle('is-active', catId === currentCatId);
        link.addEventListener('click', async e => {
          e.preventDefault();
          currentCatId   = catId;
          currentCatName = link.textContent.trim();
          catLinks.forEach(l => l.classList.remove('is-active'));
          link.classList.add('is-active');
          await loadParts();
        });
      });

      // Əgər nav-da data-cat-link-lər sayısal id daşıyırsa, ilk aktivi tap
      if (!currentCatId && cats.length) {
        currentCatId   = cats[0].id;
        currentCatName = cats[0].name || '';
      }

      // Aktiv kateqoriyanın adını başlıqa yaz
      const activeCat = cats.find(c => c.id === currentCatId);
      if (activeCat) {
        if (pageTitle) pageTitle.textContent = activeCat.name || '';
        if (pageDesc)  pageDesc.textContent  = activeCat.description || '';
        currentCatName = activeCat.name || '';
      }
    }

    async function loadParts() {
      if (partsCount) partsCount.textContent = 'Yüklənir...';
      partsGrid.innerHTML = '';

      const params = {};
      if (currentCatId) params.CategoryId = currentCatId;

      allParts = await fetchParts(params);
      renderList(allParts);
    }

    if (searchInput) {
      searchInput.addEventListener('input', () => renderList(allParts));
    }

    // İnit
    (async () => {
      await initCategories();
      await loadParts();
    })();
  }

  /* ============================================================
     DETAIL PAGE  (partDetail elementi varsa)
  ============================================================ */
  const partDetail = document.getElementById('partDetail');

  if (partDetail) {
    const id      = Number(qs.get('id'));
    const emptyBox = document.getElementById('partDetailEmpty');

    (async () => {
      if (!id) {
        partDetail.hidden = true;
        if (emptyBox) emptyBox.hidden = false;
        return;
      }

      const item = await fetchPartById(id);

      if (!item) {
        partDetail.hidden = true;
        if (emptyBox) emptyBox.hidden = false;
        return;
      }

      const name     = item.name     || item.title       || '—';
      const desc     = item.description || item.desc     || '';
      const catLabel = item.categoryName || item.category?.name || 'Ehtiyat hissəsi';
      const brand    = item.manufacturerName || item.brand || '—';
      const variant  = item.variant  || item.spec        || '—';
      const phone    = item.phone    || item.contactPhone || '';

      document.title = `${name} - CarAll`;

      partDetail.innerHTML = `
        <div class="part-detail__media">
          <div class="part-detail__imgbox">
            <img
              src="${esc(imgSrc(item))}"
              alt="${esc(name)}"
              onerror="this.onerror=null;this.src='images/no-image.png';"
            />
          </div>
        </div>

        <div class="part-detail__info">
          <span class="part-detail__badge">${esc(catLabel)}</span>

          <h1 class="part-detail__title">${esc(name)}</h1>
          <p class="part-detail__desc">${esc(desc)}</p>

          <div class="part-detail__price">${money(item.price)}</div>

          <div class="part-detail__meta">
            <div class="part-detail__row">
              <div class="part-detail__label">Marka</div>
              <div class="part-detail__value">${esc(brand)}</div>
            </div>
            <div class="part-detail__row">
              <div class="part-detail__label">Xüsusiyyət</div>
              <div class="part-detail__value">${esc(variant)}</div>
            </div>
            ${item.fitment || item.compatibility ? `
            <div class="part-detail__row">
              <div class="part-detail__label">Uyğunluq</div>
              <div class="part-detail__value">${esc(item.fitment || item.compatibility)}</div>
            </div>` : ''}
          </div>

          ${phone ? `
          <div class="part-detail__contact">
            <span class="part-detail__phone-label">Satıcı ilə əlaqə</span>
            <a class="part-detail__phone" href="tel:${phone.replace(/\s+/g, '')}">
              ${esc(phone)}
            </a>
          </div>` : ''}
        </div>
      `;
    })();
  }

})();
