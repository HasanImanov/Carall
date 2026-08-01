const API_BASE = "https://carall.az/api";
const TOKEN = () => localStorage.getItem('access_token') || '';

let ALL_LISTINGS = [];

const listingsTbody = document.getElementById("listingsTbody");
const usersTbody    = document.getElementById("usersTbody");
const statUsers     = document.getElementById("statUsers");
const statListings  = document.getElementById("statListings");
const statPending   = document.getElementById("statPending");
const statApproved  = document.getElementById("statApproved");
const notifCount    = document.getElementById("notifCount");
const listingSearch = document.getElementById("listingSearch");
const statusFilter  = document.getElementById("statusFilter");

function safe(v, fb = "—") {
  return v === null || v === undefined || String(v).trim() === "" ? fb : String(v);
}

function money(v) {
  return Number(v || 0).toLocaleString("az-AZ") + " ₼";
}

function normalize(data) {
  if (Array.isArray(data)) return data;
  return data.data || data.items || data.listings || data.result || [];
}

function authFetch(url, opts = {}) {
  return fetch(url, {
    ...opts,
    headers: {
      'Authorization': `Bearer ${TOKEN()}`,
      'Accept': 'application/json',
      ...(opts.headers || {})
    }
  });
}

function getImg(x) {
  if (x.mainImage) return x.mainImage;
  if (x.imageUrl)  return x.imageUrl;
  if (x.image)     return x.image;
  if (Array.isArray(x.images) && x.images.length) {
    const first = x.images[0];
    if (typeof first === 'string') return first;
    return first.large || first.original || first.small || first.url || first.imageUrl || '../images/no-image.png';
  }
  return '../images/no-image.png';
}

function getBrand(x)    { return x.brand    || x.brandName  || x.make     || ""; }
function getModel(x)    { return x.model    || x.modelName  || "";              }
function getYear(x)     { return x.modelYear || x.year      || "";              }
function getCity(x)     { return x.city     || x.cityName   || "";              }
function getPrice(x)    { return x.price    || 0;                               }
function getUserName(x) { return x.user?.name || x.user?.phoneNumber || x.userName || ""; }
function getDate(x)     {
  const d = x.createDate || x.createdAt || x.date;
  return d ? new Date(d).toLocaleDateString("az-AZ") : "—";
}

function getStatus(x) {
  return x.status !== undefined && x.status !== null ? Number(x.status) : 1;
}

function statusText(s) {
  if (s === 1) return "Gözləyir";
  if (s === 2) return "Təsdiqlənmiş";
  if (s === 3) return "Rədd edilmiş";
  return "Naməlum";
}

// ── Admin Stats ──
async function loadStats() {
  try {
    const res = await authFetch(`${API_BASE}/admin/stats`);
    if (!res.ok) return;
    const data = await res.json();
    if (statUsers)    statUsers.textContent    = data.totalUsers    ?? "0";
    if (statListings) statListings.textContent = data.totalListings ?? "0";
    if (statPending)  statPending.textContent  = data.pendingListings ?? "0";
    if (statApproved) statApproved.textContent = (data.totalListings - data.pendingListings) ?? "0";
    if (notifCount) {
      const p = data.pendingListings || 0;
      notifCount.hidden      = p === 0;
      notifCount.textContent = p;
    }
  } catch(e) {
    // Stats endpoint əlçatan deyil, fallback — ALL_LISTINGS-dən say
    renderStatsFromListings();
  }
}

function renderStatsFromListings() {
  const total    = ALL_LISTINGS.length;
  const pending  = ALL_LISTINGS.filter(x => getStatus(x) === 1).length;
  const approved = ALL_LISTINGS.filter(x => getStatus(x) === 2).length;
  if (statListings) statListings.textContent = total;
  if (statPending)  statPending.textContent  = pending;
  if (statApproved) statApproved.textContent = approved;
  if (notifCount) {
    notifCount.hidden      = pending === 0;
    notifCount.textContent = pending;
  }
}

// ── Elanlar ──
async function loadListings() {
  if (!listingsTbody) return;
  listingsTbody.innerHTML = '<tr><td colspan="7">Yüklənir...</td></tr>';

  try {
    // Əvvəl pending endpoint-i cəhd et
    let list = [];
    const r1 = await authFetch(`${API_BASE}/admin/listings/pending?page=1&pageSize=200`);
    if (r1.ok) {
      const d = await r1.json();
      list = normalize(d);
    }

    // Sonra bütün elanları da əlavə et (full_filter ilə)
    const r2 = await fetch(`${API_BASE}/Listings/full_filter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ page: 1, pageSize: 200, includeTotalCount: true })
    });
    if (r2.ok) {
      const d2 = await r2.json();
      const all = normalize(d2);
      // Pending siyahısındakıları duplicate etmə
      const pendingIds = new Set(list.map(x => x.id));
      all.forEach(x => { if (!pendingIds.has(x.id)) list.push(x); });
    }

    ALL_LISTINGS = list;
    renderStatsFromListings();
    renderListings();
    await loadUsers();

  } catch(err) {
    listingsTbody.innerHTML = '<tr><td colspan="7">Elanlar yüklənmədi</td></tr>';
  }
}

// ── İstifadəçilər ──
async function loadUsers() {
  if (!usersTbody) return;
  usersTbody.innerHTML = '<tr><td colspan="5">Yüklənir...</td></tr>';
  try {
    const res = await authFetch(`${API_BASE}/admin/users?page=1&pageSize=50`);
    if (!res.ok) { usersTbody.innerHTML = '<tr><td colspan="5">—</td></tr>'; return; }
    const data = await res.json();
    const list = normalize(data);
    if (!list.length) { usersTbody.innerHTML = '<tr><td colspan="5">İstifadəçi yoxdur</td></tr>'; return; }
    usersTbody.innerHTML = list.map(u => `
      <tr>
        <td>${safe(u.name || u.fullName)}</td>
        <td>${safe(u.email)}</td>
        <td>${safe(u.phoneNumber || u.phone)}</td>
        <td>${safe(u.role || u.roleName || 'İstifadəçi')}</td>
        <td>${u.createdAt ? new Date(u.createdAt).toLocaleDateString('az-AZ') : '—'}</td>
      </tr>`).join('');
  } catch(e) {
    usersTbody.innerHTML = '<tr><td colspan="5">Yüklənmədi</td></tr>';
  }
}

// ── Elan render ──
function renderListings() {
  let list = [...ALL_LISTINGS];
  const q  = (listingSearch?.value || '').trim().toLowerCase();
  const st = statusFilter?.value || '';

  if (q) list = list.filter(x =>
    [x.id, getBrand(x), getModel(x), getYear(x), getCity(x), getUserName(x)].join(' ').toLowerCase().includes(q)
  );
  if (st) list = list.filter(x => String(getStatus(x)) === st);

  if (!list.length) {
    listingsTbody.innerHTML = '<tr><td colspan="7">Elan tapılmadı</td></tr>';
    return;
  }

  listingsTbody.innerHTML = list.map(x => {
    const id = x.id || x.listingId;
    const status = getStatus(x);
    return `
      <tr>
        <td><img class="admin-car-img" src="${getImg(x)}" alt="${safe(getBrand(x))}" onerror="this.src='../images/no-image.png'"></td>
        <td>
          <strong>${safe(getBrand(x))} ${safe(getModel(x))}</strong>
          <small style="display:block;color:#6b7280;margin-top:4px;">${safe(getYear(x))} • ${safe(getCity(x))}</small>
        </td>
        <td>${money(getPrice(x))}</td>
        <td>${safe(getUserName(x))}</td>
        <td>${getDate(x)}</td>
        <td><span class="admin-status status-${status}">${statusText(status)}</span></td>
        <td style="display:flex;gap:6px;flex-wrap:wrap;">
          <a class="admin-btn small" href="listing-details.html?id=${id}" target="_blank">Bax</a>
          ${status === 1 ? `
            <button class="btn-approve" onclick="approveL(${id})">✅</button>
            <button class="btn-reject"  onclick="rejectL(${id})">❌</button>` : ''}
          <button class="btn-reject" onclick="hardDeleteL(${id})" title="Tam sil">🗑</button>
        </td>
      </tr>`;
  }).join('');
}

// ── Əməliyyatlar ──
window.approveL = async (id) => {
  if (!confirm('Elanı təsdiqlə?')) return;
  const res = await authFetch(`${API_BASE}/Listings/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(2)
  });
  if (res.ok) {
    const x = ALL_LISTINGS.find(x => x.id === id);
    if (x) x.status = 2;
    renderListings();
    renderStatsFromListings();
  } else { alert('Xəta: ' + res.status); }
};

window.rejectL = async (id) => {
  if (!confirm('Elanı rədd et?')) return;
  const res = await authFetch(`${API_BASE}/Listings/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(3)
  });
  if (res.ok) {
    const x = ALL_LISTINGS.find(x => x.id === id);
    if (x) x.status = 3;
    renderListings();
    renderStatsFromListings();
  } else { alert('Xəta: ' + res.status); }
};

window.hardDeleteL = async (id) => {
  if (!confirm('Elanı tam silmək istəyirsən? Bu geri qaytarıla bilməz!')) return;
  const res = await authFetch(`${API_BASE}/Listings/hard/${id}`, { method: 'DELETE' });
  if (res.ok) {
    ALL_LISTINGS = ALL_LISTINGS.filter(x => x.id !== id);
    renderListings();
    renderStatsFromListings();
  } else { alert('Xəta: ' + res.status); }
};

if (listingSearch) listingSearch.addEventListener("input", renderListings);
if (statusFilter)  statusFilter.addEventListener("change", renderListings);

document.addEventListener("DOMContentLoaded", async () => {
  await loadStats();
  await loadListings();
});
