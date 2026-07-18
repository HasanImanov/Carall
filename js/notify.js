(() => {
  'use strict';

  const API = 'https://carall.az/api';

  // ── Elementlər ──
  const modal       = document.querySelector('.notify-modal');
  const notifyBtn   = document.getElementById('notifyBtn');
  const form        = modal?.querySelector('.notify-form');
  const emailInput  = form?.querySelector('input[type="email"]');
  const nameInput   = form?.querySelector('input[type="text"]');
  const brandSel    = document.getElementById('brandSelect');
  const modelSel    = document.getElementById('modelSelect');
  const citySel     = document.getElementById('citySelect');
  const colorSel    = document.getElementById('colorSelect');
  const minYearInp  = document.getElementById('minYear');
  const maxYearInp  = document.getElementById('maxYear');
  const minPriceInp = document.getElementById('minPrice');
  const maxPriceInp = document.getElementById('maxPrice');

  if (!modal || !notifyBtn || !form) return;

  // ── Modal aç/bağla ──
  function openModal() {
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('is-open');
    emailInput?.focus();
  }

  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('is-open');
    form.reset();
    resetModelSelect();
  }

  notifyBtn.addEventListener('click', openModal);

  modal.querySelectorAll('.js-notify-close').forEach(el => {
    el.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  // ── Lookup yükləmə köməkçisi ──
  async function fetchLookup(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : (data.data || data.items || []);
    } catch { return []; }
  }

  function fillSelect(sel, items, labelKey = 'name', valueKey = 'id') {
    const cur = sel.value;
    while (sel.options.length > 1) sel.remove(1);
    items.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item[valueKey] ?? '';
      opt.textContent = item[labelKey] ?? item[valueKey] ?? '';
      sel.appendChild(opt);
    });
    sel.value = cur;
  }

  function resetModelSelect() {
    while (modelSel.options.length > 1) modelSel.remove(1);
    modelSel.disabled = true;
    modelSel.value = '';
  }

  // ── Dropdown-ları API-dən doldur ──
  async function loadDropdowns() {
    const [makes, cities, colors] = await Promise.all([
      fetchLookup(`${API}/lookups/makes`),
      fetchLookup(`${API}/lookups/cities`),
      fetchLookup(`${API}/lookups/colors`),
    ]);
    fillSelect(brandSel, makes);
    fillSelect(citySel,  cities);
    fillSelect(colorSel, colors);
  }

  loadDropdowns();

  // ── Marka dəyişəndə modeli yüklə ──
  brandSel.addEventListener('change', async () => {
    resetModelSelect();
    const makeId = brandSel.value;
    if (!makeId) return;
    const models = await fetchLookup(`${API}/lookups/models/${makeId}`);
    if (models.length) {
      fillSelect(modelSel, models);
      modelSel.disabled = false;
    }
  });

  // ── Mesaj göstər ──
  function showMsg(msg, ok = true) {
    let el = form.querySelector('.notify-msg');
    if (!el) {
      el = document.createElement('p');
      el.className = 'notify-msg';
      el.style.cssText = 'margin:8px 0;font-size:.875rem;font-weight:600;';
      form.querySelector('.notify-modal__footer')?.before(el);
    }
    el.textContent = msg;
    el.style.color = ok ? '#16a34a' : '#dc2626';
  }

  // ── Form göndər ──
  form.addEventListener('submit', async e => {
    e.preventDefault();

    const email      = emailInput?.value.trim();
    const filterName = nameInput?.value.trim();

    if (!email || !filterName) {
      showMsg('Email və filter adı mütləqdir.', false);
      return;
    }

    const brandId  = brandSel.value  ? Number(brandSel.value)  : null;
    const modelId  = modelSel.value  ? Number(modelSel.value)  : null;
    const cityId   = citySel.value   ? Number(citySel.value)   : null;
    const colorId  = colorSel.value  ? Number(colorSel.value)  : null;
    const minYear  = minYearInp?.value  ? Number(minYearInp.value)  : null;
    const maxYear  = maxYearInp?.value  ? Number(maxYearInp.value)  : null;
    const minPrice = minPriceInp?.value ? Number(minPriceInp.value) : null;
    const maxPrice = maxPriceInp?.value ? Number(maxPriceInp.value) : null;

    // Ən azı bir filter seçilməlidir
    if (!brandId && !modelId && !cityId && !colorId &&
        !minYear && !maxYear && !minPrice && !maxPrice) {
      showMsg('Ən azı bir filtr seçin.', false);
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Göndərilir...';

    try {
      const res = await fetch(`${API}/saved-search-notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email, filterName,
          brandId, modelId, cityId, colorId,
          minYear, maxYear, minPrice, maxPrice
        })
      });

      if (res.ok) {
        showMsg('✅ Bildiriş uğurla yaradıldı! Emailinizi yoxlayın.');
        setTimeout(closeModal, 2000);
      } else {
        const txt = await res.text().catch(() => '');
        showMsg('Xəta baş verdi: ' + (txt || res.status), false);
      }
    } catch (err) {
      showMsg('Bağlantı xətası: ' + err.message, false);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Bildiriş yarat';
    }
  });

})();
