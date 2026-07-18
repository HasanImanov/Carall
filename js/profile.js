(() => {
  'use strict';

  const API         = 'https://carall.az/api';
  const SESSION_KEY = 'carall_session_v1';

  const qs = (s, r = document) => r.querySelector(s);

  // ── Sessiya ──
  function getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; }
  }

  function getToken() {
    return localStorage.getItem('access_token') || '';
  }

  // ── DOM ──
  const nameEl    = qs('#profileName');
  const emailEl   = qs('#profileEmail');
  const logoutBtn = qs('#logoutBtn');
  const grid      = qs('#myCarsGrid');
  const emptyBox  = qs('#myCarsEmpty');
  const countEl   = qs('#myCarsCount');

  // ── Login yoxlanışı ──
  const session = getSession();
  const token   = getToken();

  if (!session?.loggedIn || !token) {
    window.location.href = 'login.html?return=profile.html';
    return;
  }

  // ── Profil məlumatı ──
  if (nameEl)  nameEl.textContent  = session.name  || 'İstifadəçi';
  if (emailEl) emailEl.textContent = session.phone || session.email || '';

  // ── Çıxış ──
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = 'index.html';
    });
  }

  // ── Kart HTML ──
  function imgSrc(x) {
    return x.img || x.image || x.mainImage || x.mainPhotoUrl ||
      (typeof x.images?.[0] === 'string' ? x.images[0] : null) ||
      x.images?.[0]?.original || x.images?.[0]?.large || x.images?.[0]?.small ||
      'images/no-image.png';
  }

  function renderCards(cars) {
    if (!grid) return;
    grid.innerHTML = '';

    if (countEl) countEl.textContent = `${cars.length} elan`;

    if (!cars.length) {
      if (emptyBox) emptyBox.hidden = false;
      return;
    }
    if (emptyBox) emptyBox.hidden = true;

    cars.forEach(car => {
      const brand  = car.brand  || car.make || car.makeName || '';
      const model  = car.model  || car.modelName || '';
      const title  = `${brand} ${model}`.trim() || 'Avtomobil';
      const price  = car.price != null ? `${Number(car.price).toLocaleString('az-AZ')} AZN` : '';
      const city   = car.city  || car.cityName || '';
      const year   = car.year  || car.modelYear || '';
      const src    = imgSrc(car);

      const card = document.createElement('div');
      card.className = 'car-card';
      card.style.cursor = 'pointer';
      card.innerHTML = `
        <img src="${src}" alt="${title}" style="width:100%;height:160px;object-fit:cover;border-radius:8px;"
             onerror="this.onerror=null;this.src='images/no-image.png'">
        <div class="car-info" style="padding:8px 4px">
          <h3 style="margin:4px 0;font-size:15px">${title}</h3>
          <div style="font-size:13px;color:#64748b">${[year, city].filter(Boolean).join(' • ')}</div>
          <div class="price" style="font-weight:700;color:#1B3A6B;margin-top:4px">${price}</div>
        </div>
      `;
      card.addEventListener('click', () => {
        window.location.href = `details.html?id=${car.id}`;
      });
      grid.appendChild(card);
    });
  }

  // ── Yükləmə mesajı ──
  function setStatus(msg) {
    if (countEl) countEl.textContent = msg;
  }

  // ── API-dən mənim elanlarımı çək ──
  async function loadMyListings() {
    setStatus('Yüklənir...');
    try {
      const res = await fetch(`${API}/users/me/listings?page=1&pageSize=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (res.status === 401) {
        // Token köhnəlib — login-ə yönləndir
        localStorage.removeItem('access_token');
        localStorage.removeItem(SESSION_KEY);
        window.location.href = 'login.html?return=profile.html';
        return;
      }

      if (!res.ok) {
        setStatus('Elanlar yüklənə bilmədi.');
        return;
      }

      const data = await res.json();
      const cars = Array.isArray(data) ? data :
                   Array.isArray(data?.data) ? data.data :
                   Array.isArray(data?.items) ? data.items : [];

      renderCards(cars);

    } catch (err) {
      setStatus('Bağlantı xətası.');
    }
  }

  loadMyListings();

})();
