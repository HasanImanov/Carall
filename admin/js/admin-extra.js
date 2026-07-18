(() => {
  'use strict';

  const API   = 'https://carall.az/api';
  const TOKEN = () => localStorage.getItem('access_token') || '';

  // ── Tab keçidi ──
  const sections = ['dashboard','listingsSection','usersSection',
                    'rentcarsSection','showroomsSection','sparepartsSection'];

  function showSection(id) {
    sections.forEach(s => {
      const el = document.getElementById(s);
      if (el) el.style.display = (s === id) ? '' : 'none';
    });
    document.querySelectorAll('.admin-nav a').forEach(a => {
      a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
    });
  }

  document.querySelectorAll('.admin-nav a').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const id = a.getAttribute('href').slice(1);
      showSection(id);
      if (id === 'rentcarsSection') loadRentcars();
      if (id === 'showroomsSection') loadShowrooms();
      if (id === 'sparepartsSection') loadSparts();
    });
  });

  // ── Köməkçilər ──
  function esc(s) {
    return String(s || '')
      .replaceAll('&','&amp;').replaceAll('<','&lt;')
      .replaceAll('>','&gt;').replaceAll('"','&quot;');
  }

  function setMsg(elId, msg, ok = true) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.textContent  = msg;
    el.style.color  = ok ? '#16a34a' : '#dc2626';
  }

  async function apiFetch(path, opts = {}) {
    return fetch(`${API}${path}`, {
      ...opts,
      headers: { 'Authorization': `Bearer ${TOKEN()}`, ...(opts.headers || {}) }
    });
  }

  // ══════════════════════════════
  //  RENT A CAR
  // ══════════════════════════════
  async function loadRentcars() {
    const tbody = document.getElementById('rentcarsTbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4">Yüklənir...</td></tr>';
    try {
      const res  = await apiFetch('/RentCars?page=1&pageSize=100');
      const json = await res.json();
      const list = Array.isArray(json) ? json : (json.data || json.items || []);
      if (!list.length) { tbody.innerHTML = '<tr><td colspan="4">Məlumat yoxdur</td></tr>'; return; }
      tbody.innerHTML = list.map(r => `
        <tr>
          <td><strong>${esc(r.name)}</strong></td>
          <td>${esc(r.phone || '—')}</td>
          <td>${esc(r.address || '—')}</td>
          <td><button class="btn-reject" onclick="adminDeleteRentcar(${r.id})">🗑 Sil</button></td>
        </tr>`).join('');
    } catch { tbody.innerHTML = '<tr><td colspan="4">Xəta baş verdi</td></tr>'; }
  }

  window.adminDeleteRentcar = async (id) => {
    if (!confirm('Bu icarə şirkətini silmək istəyirsən?')) return;
    try {
      await apiFetch(`/RentCars/${id}`, { method: 'DELETE' });
      loadRentcars();
    } catch { alert('Silmə xətası'); }
  };

  const rcForm = document.getElementById('rentcarForm');
  if (rcForm) {
    rcForm.addEventListener('submit', async e => {
      e.preventDefault();
      const data = {
        name:        document.getElementById('rc_name').value.trim(),
        phone:       document.getElementById('rc_phone').value.trim(),
        address:     document.getElementById('rc_address').value.trim(),
        description: document.getElementById('rc_desc').value.trim()
      };
      const logoFile = document.getElementById('rc_logo')?.files?.[0];
      const fd = new FormData();
      fd.append('Data', JSON.stringify(data));
      if (logoFile) fd.append('Images', logoFile);

      try {
        const res = await apiFetch('/RentCars', { method: 'POST', body: fd });
        if (res.ok) {
          setMsg('rcMsg', '✅ Şirkət əlavə edildi!');
          rcForm.reset();
          loadRentcars();
        } else {
          setMsg('rcMsg', `Xəta: ${res.status}`, false);
        }
      } catch { setMsg('rcMsg', 'Bağlantı xətası', false); }
    });
  }

  // ══════════════════════════════
  //  AVTOSALONLAR
  // ══════════════════════════════
  async function loadShowrooms() {
    const tbody = document.getElementById('showroomsTbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4">Yüklənir...</td></tr>';
    try {
      const res  = await apiFetch('/Showrooms?page=1&pageSize=100');
      const json = await res.json();
      const list = Array.isArray(json) ? json : (json.data || json.items || []);
      if (!list.length) { tbody.innerHTML = '<tr><td colspan="4">Məlumat yoxdur</td></tr>'; return; }
      tbody.innerHTML = list.map(s => `
        <tr>
          <td><strong>${esc(s.name)}</strong></td>
          <td>${esc(s.phone || '—')}</td>
          <td>${esc(s.address || '—')}</td>
          <td><button class="btn-reject" onclick="adminDeleteShowroom(${s.id})">🗑 Sil</button></td>
        </tr>`).join('');
    } catch { tbody.innerHTML = '<tr><td colspan="4">Xəta baş verdi</td></tr>'; }
  }

  window.adminDeleteShowroom = async (id) => {
    if (!confirm('Bu salonu silmək istəyirsən?')) return;
    try {
      await apiFetch(`/Showrooms/${id}`, { method: 'DELETE' });
      loadShowrooms();
    } catch { alert('Silmə xətası'); }
  };

  const srForm = document.getElementById('showroomForm');
  if (srForm) {
    srForm.addEventListener('submit', async e => {
      e.preventDefault();
      const data = {
        name:    document.getElementById('sr_name').value.trim(),
        phone:   document.getElementById('sr_phone').value.trim(),
        address: document.getElementById('sr_address').value.trim(),
        city:    document.getElementById('sr_city').value.trim()
      };
      const logoFile = document.getElementById('sr_logo')?.files?.[0];
      const fd = new FormData();
      fd.append('Data', JSON.stringify(data));
      if (logoFile) fd.append('Logo', logoFile);

      try {
        const res = await apiFetch('/Showrooms', { method: 'POST', body: fd });
        if (res.ok) {
          setMsg('srMsg', '✅ Salon əlavə edildi!');
          srForm.reset();
          loadShowrooms();
        } else {
          setMsg('srMsg', `Xəta: ${res.status}`, false);
        }
      } catch { setMsg('srMsg', 'Bağlantı xətası', false); }
    });
  }

  // ══════════════════════════════
  //  EHTİYYAT HİSSƏLƏRİ
  // ══════════════════════════════
  async function loadSparts() {
    const tbody = document.getElementById('spartsTbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4">Yüklənir...</td></tr>';
    try {
      const res  = await apiFetch('/SpareParts?page=1&pageSize=100');
      const json = await res.json();
      const list = Array.isArray(json) ? json : (json.data || json.items || []);
      if (!list.length) { tbody.innerHTML = '<tr><td colspan="4">Məlumat yoxdur</td></tr>'; return; }
      tbody.innerHTML = list.map(p => `
        <tr>
          <td><strong>${esc(p.name || p.title)}</strong></td>
          <td>${esc(p.manufacturerName || p.brand || '—')}</td>
          <td>${Number(p.price || 0).toLocaleString('az-AZ')} AZN</td>
          <td><button class="btn-reject" onclick="adminDeleteSpart(${p.id})">🗑 Sil</button></td>
        </tr>`).join('');
    } catch { tbody.innerHTML = '<tr><td colspan="4">Xəta baş verdi</td></tr>'; }
  }

  window.adminDeleteSpart = async (id) => {
    if (!confirm('Bu hissəni silmək istəyirsən?')) return;
    try {
      await apiFetch(`/SpareParts/${id}`, { method: 'DELETE' });
      loadSparts();
    } catch { alert('Silmə xətası'); }
  };

  const spForm = document.getElementById('spartForm');
  if (spForm) {
    spForm.addEventListener('submit', async e => {
      e.preventDefault();
      const data = {
        name:             document.getElementById('sp_name').value.trim(),
        price:            Number(document.getElementById('sp_price').value) || 0,
        manufacturerName: document.getElementById('sp_brand').value.trim(),
        variant:          document.getElementById('sp_variant').value.trim(),
        description:      document.getElementById('sp_desc').value.trim(),
        categoryId:       Number(document.getElementById('sp_catId').value) || null,
        brandId:          Number(document.getElementById('sp_brandId').value) || null
      };
      const imgFile = document.getElementById('sp_image')?.files?.[0];
      const fd = new FormData();
      fd.append('Data', JSON.stringify(data));
      if (imgFile) fd.append('Image', imgFile);

      try {
        const res = await apiFetch('/SpareParts', { method: 'POST', body: fd });
        if (res.ok) {
          setMsg('spMsg', '✅ Hissə əlavə edildi!');
          spForm.reset();
          loadSparts();
        } else {
          setMsg('spMsg', `Xəta: ${res.status}`, false);
        }
      } catch { setMsg('spMsg', 'Bağlantı xətası', false); }
    });
  }

})();
