const API_BASE = "https://carall.az/api";
const LISTINGS_API = `${API_BASE}/Listings/cards`;

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

function normalize(data) {
  if (Array.isArray(data)) return data;

  return (
    data.data ||
    data.items ||
    data.listings ||
    data.result ||
    []
  );
}

function getImg(x) {
  if (x.mainImage) return x.mainImage;
  if (x.imageUrl) return x.imageUrl;
  if (x.image) return x.image;

  if (Array.isArray(x.images) && x.images.length) {
    const first = x.images[0];
    return first.url || first.imageUrl || first.path || first;
  }

  if (Array.isArray(x.imageUrls) && x.imageUrls.length) {
    return x.imageUrls[0];
  }

  return "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='80'%3E%3Crect width='120' height='80' fill='%23e5e7eb'/%3E%3Ctext x='60' y='43' text-anchor='middle' font-size='13' fill='%236b7280'%3ENo image%3C/text%3E%3C/svg%3E";
}

function getBrand(x) {
  return (
    x.brand ||
    x.makeName ||
    x.brandName ||
    x.carDetails?.brand ||
    x.carDetails?.makeName ||
    x.modelYear?.model?.make?.name ||
    "—"
  );
}

function getModel(x) {
  return (
    x.model ||
    x.modelName ||
    x.carDetails?.model ||
    x.carDetails?.modelName ||
    x.modelYear?.model?.name ||
    "—"
  );
}

function getYear(x) {
  return (
    x.modelYear ||
    x.year ||
    x.carDetails?.year ||
    "—"
  );
}

function getPrice(x) {
  return x.price || x.carDetails?.price || 0;
}

function getCity(x) {
  return x.city || x.cityName || x.carDetails?.city || "—";
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
  if (x.status !== undefined && x.status !== null) {
    return Number(x.status);
  }

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

function renderUsersPlaceholder() {
  if (!usersTbody) return;

  usersTbody.innerHTML = `
    <tr>
      <td colspan="5">User endpoint yoxdur</td>
    </tr>
  `;
}

async function loadListings() {
  if (!listingsTbody) return;

  listingsTbody.innerHTML = `
    <tr>
      <td colspan="7">Yüklənir...</td>
    </tr>
  `;

  try {
    const res = await fetch(LISTINGS_API, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });

    if (!res.ok) {
      throw new Error(`Listings API error: ${res.status}`);
    }

    const data = await res.json();

    ALL_LISTINGS = normalize(data);

    renderStats();
    renderListings();
    renderUsersPlaceholder();

  } catch (err) {
    console.error("Admin listings error:", err);

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

  if (statUsers) statUsers.textContent = "0";
  if (statListings) statListings.textContent = total;
  if (statPending) statPending.textContent = pending;
  if (statApproved) statApproved.textContent = approved;

  if (notifCount) {
    if (pending > 0) {
      notifCount.hidden = false;
      notifCount.textContent = pending;
    } else {
      notifCount.hidden = true;
    }
  }
}

function renderListings() {
  let list = [...ALL_LISTINGS];

  const q = listingSearch ? listingSearch.value.trim().toLowerCase() : "";
  const st = statusFilter ? statusFilter.value : "";

  if (q) {
    list = list.filter(x => {
      const text = [
        x.id,
        getBrand(x),
        getModel(x),
        getYear(x),
        getCity(x),
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
    listingsTbody.innerHTML = `
      <tr>
        <td colspan="7">Elan tapılmadı</td>
      </tr>
    `;
    return;
  }

  listingsTbody.innerHTML = list.map(x => {
    const id = x.id || x.listingId;
    const status = getStatus(x);

    return `
      <tr>
        <td>
          <img
            class="admin-car-img"
            src="${getImg(x)}"
            alt="${safe(getBrand(x))} ${safe(getModel(x))}"
            onerror="this.src='../images/no-image.png'"
          >
        </td>

        <td>
          <strong>${safe(getBrand(x))} ${safe(getModel(x))}</strong>
          <small style="display:block;color:#6b7280;margin-top:4px;">
            ${safe(getYear(x))} • ${safe(getCity(x))}
          </small>
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

if (listingSearch) {
  listingSearch.addEventListener("input", renderListings);
}

if (statusFilter) {
  statusFilter.addEventListener("change", renderListings);
}

document.addEventListener("DOMContentLoaded", loadListings);