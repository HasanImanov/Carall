const carsGrid = document.getElementById("carsGrid");
const FAV_KEY = "carall_favs_v1";
const API_BASE = "https://carall.az";

function loadFavs() {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(arr.map(String));
  } catch {
    return new Set();
  }
}

function saveFavs(set) {
  localStorage.setItem(FAV_KEY, JSON.stringify([...set]));
}

function money(n) {
  if (n === null || n === undefined || n === "") return "—";
  const num = Number(String(n).replace(/[^\d]/g, ""));
  return Number.isFinite(num) ? `${num.toLocaleString("az-AZ")} ₼` : String(n);
}

function renderEmpty() {
  if (!carsGrid) return;

  carsGrid.innerHTML = `
    <div class="empty">
      <div class="empty__t">Seçilmiş elan yoxdur</div>
      <div class="empty__d">Bəyəndiyin elanları ürəyə basıb bura əlavə edə bilərsən.</div>
      <a class="empty__btn" href="index.html#list">Elanlara bax</a>
    </div>
  `;
}

function mapListing(x) {
  return {
    id: x.id,
    brand: x.brand || x.makeName || x.brandName || x.make?.name || "—",
    model: x.model || x.modelName || x.model?.name || "—",
    price: x.price || 0,
    year: x.year || "—",
    city: x.city || x.cityName || x.city?.name || "",
    mileage: x.mileage || x.odometerReading || 0,
    fuel: x.fuel || x.fuelTypeName || x.fuelType?.name || "—",
    gearbox: x.gearbox || x.transmissionType || x.transmissionName || x.transmission?.type || "—",
    img:
      x.img || x.image || x.mainImage || x.mainPhotoUrl || x.imageUrl ||
      x.images?.[0]?.original || x.images?.[0]?.Original ||
      x.images?.[0]?.large || x.images?.[0]?.Large ||
      x.images?.[0]?.small || x.images?.[0]?.Small ||
      "images/Logo.png",
    images: x.images || x.imageUrls || x.photos || [],
    link: `details.html?id=${encodeURIComponent(x.id)}`
  };
}

async function fetchListingById(id) {
  try {
    const res = await fetch(`${API_BASE}/api/Listings/${encodeURIComponent(id)}`, {
      method: "GET",
      headers: { "Accept": "application/json" }
    });

    if (!res.ok) return null;

    const data = await res.json();
    return mapListing(data);
  } catch (err) {
    console.error("FAV DETAIL LOAD ERROR:", err);
    return null;
  }
}

async function getFavoriteCars() {
  const favIds = [...loadFavs()];

  if (!favIds.length) return [];

  const cars = await Promise.all(
    favIds.map(id => fetchListingById(id))
  );

  return cars.filter(Boolean);
}

function renderCars(list) {
  if (!carsGrid) return;

  if (!list.length) {
    renderEmpty();
    return;
  }

  const favIds = loadFavs();

  carsGrid.innerHTML = list.map(car => {
    const id = car.id;
    const href = car.link || `details.html?id=${encodeURIComponent(id)}`;
    const img = car.img || "images/Logo.png";
    const title = `${car.brand || ""} ${car.model || ""}`.trim() || "Elan";
    const favOn = favIds.has(String(id));

    return `
      <a class="cardlink" href="${href}" aria-label="${title} detallar">
        <article class="card">
          <div class="card__imgwrap">
            <img class="card__img"
                 src="${img}"
                 alt="${title}"
                 loading="lazy"
                 referrerpolicy="no-referrer"
                 onerror="this.onerror=null; this.src='images/Logo.png'">

            <button class="fav-btn ${favOn ? "is-on" : ""}"
                    type="button"
                    data-id="${id}"
                    aria-label="Favorit">
              <svg class="fav-ic ic-off" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"
                  fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>

              <svg class="fav-ic ic-on" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 21.23 4.22 13.45 3.16 12.39a5.5 5.5 0 0 1 7.78-7.78L12 5.67l1.06-1.06a5.5 5.5 0 0 1 7.78 7.78l-1.06 1.06L12 21.23Z"/>
              </svg>
            </button>

            <div class="badge">${car.city || ""}</div>
          </div>

          <div class="card__body">
            <div class="card__title">${title}</div>

            <div class="card__meta">
              <span>${car.year || "—"}</span><span>•</span>
              <span>${Number(car.mileage || 0).toLocaleString("az-AZ")} km</span><span>•</span>
              <span>${car.fuel || "—"}</span><span>•</span>
              <span>${car.gearbox || "—"}</span>
            </div>

            <div class="card__bottom">
              <div class="card__price">${money(car.price)}</div>
            </div>
          </div>
        </article>
      </a>
    `;
  }).join("");
}

async function renderFavorites() {
  if (!carsGrid) return;

  carsGrid.innerHTML = `<div class="empty"><div class="empty__t">Yüklənir...</div></div>`;

  const favCars = await getFavoriteCars();
  renderCars(favCars);
}

document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".fav-btn");
  if (!btn) return;

  e.preventDefault();
  e.stopPropagation();

  const id = String(btn.dataset.id);
  const favIds = loadFavs();

  if (favIds.has(id)) favIds.delete(id);
  else favIds.add(id);

  saveFavs(favIds);
  await renderFavorites();
});

document.addEventListener("DOMContentLoaded", renderFavorites);