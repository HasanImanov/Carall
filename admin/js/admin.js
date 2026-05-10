const API_BASE = "https://carall.az/api";
const LISTINGS_API = `${API_BASE}/Listings`;

let ALL_LISTINGS = [];

const listingsTbody = document.getElementById("listingsTbody");
const usersTbody = document.getElementById("usersTbody");

const statUsers = document.getElementById("statUsers");
const statListings = document.getElementById("statListings");
const statPending = document.getElementById("statPending");
const statApproved = document.getElementById("statApproved");
const notifCount = document.getElementById("notifCount");

const listingSearch = document.getElementById("listingSearch");
const statusFilter = document.getElementById("statusFilter");

function safe(v, fb = "—") {
  return v === null || v === undefined || String(v).trim() === "" ? fb : String(v);
}

function money(v) {
  return Number(v || 0).toLocaleString("az-AZ") + " ₼";
}

function getImg(x) {
  if (x.imageUrl) return x.imageUrl;
  if (x.mainImage) return x.mainImage;
  if (x.image) return x.image;

  if (Array.isArray(x.images) && x.images.length) {
    const first = x.images[0];
    return first.url || first.imageUrl || first.path || first;
  }

  return "../images/no-image.png";
}

function getBrand(x) {
  return (
    x.makeName ||
    x.brand ||
    x.brandName ||
    x.carDetails?.makeName ||
    x.modelYear?.model?.make?.name ||
    "—"
  );
}

function getModel(x) {
  return (
    x.modelName ||
    x.model ||
    x.carDetails?.modelName ||
    x.modelYear?.model?.name ||
    "—"
  );
}

function getYear(x) {
  return x.year || x.modelYear?.year || x.carDetails?.year || "—";
}

function getPrice(x) {
  return x.price || x.carDetails?.price || 0;
}

function getUserName(x) {
  const u = x.user || x.owner || x.appUser;

  if (!u) return "—";

  const full = [u.name, u.surname].filter(Boolean).join(" ");
  return full || u.fullName || u.userName || u.email || "—";
}

function getDate(x) {
  const d = x.createDate || x.createdAt || x.createdDate;
  if (!d) return "—";

  return new Date(d).toLocaleDateString("az-AZ");
}

function getStatus(x) {
  if (x.status !== undefined) return Number(x.status);

  if (x.statusName === "Approved") return 1;
  if (x.statusName === "Rejected") return 2;
  if (x.statusName === "Pending") return 0;

  return 1;
}

function statusText(status) {
  if (status === 0) return "Pending";
  if (status === 1) return "Təsdiqlənmiş";
  if (status === 2) return "İmtina edilmiş";
  return "Bilinmir";
}

function normalize(data) {
  if (Array.isArray(data)) return data;
  return data.items || data.data || data.listings || data.result || [];
}

async function loadListings() {
  listingsTbody.innerHTML = `<tr><td colspan="7">Yüklənir...</td></tr>`;

  try {
    const res = await fetch(LISTINGS_API);

    if (!res.ok) throw new Error(`API error: ${res.status}`);

    const data = await res.json();

    ALL_LISTINGS = normalize(data);

    renderStats();
    renderListings();
    renderUsersPlaceholder();

  } catch (err) {
    console.error(err);

    listingsTbody.innerHTML = `
      <tr>
        <td colspan="7">Elanlar yüklənmədi</td>
      </tr>
    `;
  }
}

function renderStats() {
  const total = ALL_LISTINGS.length;
  const pending = ALL_LISTINGS.filter(x => getStatus(x) === 0).length;
  const approved = ALL_LISTINGS.filter(x => getStatus(x) === 1).length;

  statUsers.textContent = "0";
  statListings.textContent = total;
  statPending.textContent = pending;
  statApproved.textContent = approved;

  if (pending > 0) {
    notifCount.hidden = false;
    notifCount.textContent = pending;
  } else {
    notifCount.hidden = true;
  }
}

function renderListings() {
  let list = [...ALL_LISTINGS];

  const q = listingSearch.value.trim().toLowerCase();
  const st = statusFilter.value;

  if (q) {
    list = list.filter(x => {
      const text = [
        x.id,
        getBrand(x),
        getModel(x),
        getYear(x),
        getUserName(x),
        getPrice(x)
      ].join(" ").toLowerCase();

      return text.includes(q);
    });
  }

  if (st !== "") {
    list = list.filter(x => String(getStatus(x)) === st);
  }

  if (!list.length) {
    listingsTbody.innerHTML = `<tr><td colspan="7">Elan tapılmadı</td></tr>`;
    return;
  }

  listingsTbody.innerHTML = list.map(x => {
    const id = x.id || x.listingId;
    const status = getStatus(x);

    return `
      <tr>
        <td>
          <img class="admin-car-img" src="${getImg(x)}" alt="">
        </td>

        <td>
          <strong>${safe(getBrand(x))} ${safe(getModel(x))}</strong>
          <small>${safe(getYear(x))}</small>
        </td>

        <td>${money(getPrice(x))}</td>

        <td>${safe(getUserName(x))}</td>

        <td>${getDate(x)}</td>

        <td>
          <span class="admin-status status-${status}">
            ${statusText(status)}
          </span>
        </td>

        <td>
          <a class="admin-btn small" href="../details.html?id=${id}" target="_blank">
            Bax
          </a>
        </td>
      </tr>
    `;
  }).join("");
}

function renderUsersPlaceholder() {
  usersTbody.innerHTML = `
    <tr>
      <td colspan="5">User endpoint yoxdur</td>
    </tr>
  `;
}

listingSearch.addEventListener("input", renderListings);
statusFilter.addEventListener("change", renderListings);

document.addEventListener("DOMContentLoaded", loadListings);