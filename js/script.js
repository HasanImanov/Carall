// ===== Demo Cars (JSON yoxdur) =====
const FAV_KEY = "carall_favs_v1";

function loadFavs(){
  try{
    const raw = localStorage.getItem(FAV_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(arr.map(String));
  }catch(e){
    return new Set();
  }
}

function saveFavs(set){
  localStorage.setItem(FAV_KEY, JSON.stringify([...set]));
}



// Şəkillər: Unsplash "source" (car queries) — maşın mövzulu çıxır.


// ===== Elements =====
const qCountry = document.getElementById("qCountry");
const qBrand = document.getElementById("qBrand");
const qModel = document.getElementById("qModel");
const qCity = document.getElementById("qCity");
const qMinPrice = document.getElementById("qMinPrice");
const qMaxPrice = document.getElementById("qMaxPrice");
const qYear = document.getElementById("qYear");

const btnSearch = document.getElementById("btnSearch");
const btnReset = document.getElementById("btnReset");
const sortBy = document.getElementById("sortBy");

const carsGrid = document.getElementById("carsGrid");
const resultInfo = document.getElementById("resultInfo");
const statusBox = document.getElementById("statusBox");
const qYearMax = document.getElementById("qYearMax");

document.getElementById("yearNow").textContent = new Date().getFullYear();

// ===== Helpers =====
const countryName = (code) => ({
  AZ: "Azərbaycan",
  TR: "Türkiyə",
  GE: "Gürcüstan",
  DE: "Almaniya"
}[code] || code);

function money(n){
  return new Intl.NumberFormat("az-AZ").format(n) + " ₼";
}

function renderCars(list){
  if(!list.length){
    carsGrid.innerHTML = `
      <div class="empty">
        <div class="empty__t">Nəticə tapılmadı</div>
        <div class="empty__d">Filterləri dəyiş və yenidən yoxla.</div>
      </div>
    `;
    return;
  }
  const favIds = loadFavs(); // 

  list.forEach(car => {
    car.fav = favIds.has(String(car.id));
  });
  carsGrid.innerHTML = list.map(car => `
    <a class="cardlink" href="${car.link}" aria-label="${car.brand} ${car.model} detallar">
      <article class="card">
        <div class="card__imgwrap">
          <img class="card__img" src="${car.img}" alt="${car.brand} ${car.model}">

          <div class="card__top">
            <button class="fav-btn ${car.fav ? 'is-on' : ''}" type="button" data-id="${car.id}" aria-label="Favorit">
                <!-- OUTLINE -->
                <svg class="fav-ic ic-off" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>

                <!-- FILLED -->
                <svg class="fav-ic ic-on" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 21.23 4.22 13.45 3.16 12.39a5.5 5.5 0 0 1 7.78-7.78L12 5.67l1.06-1.06a5.5 5.5 0 0 1 7.78 7.78l-1.06 1.06L12 21.23Z"/>
                </svg>
              </button>

            <div class="badges">
              ${car.vip ? `<span class="badge vip">⭐ VIP</span>` : ``}
              ${car.premium ? `<span class="badge premium">👑 Premium</span>` : ``}
            </div>
          </div>

  <!-- location badge -->
  <div class="badge">${countryName(car.country)} • ${car.city}</div>
</div>


        <div class="card__body">
          <div class="card__title">${car.brand} ${car.model}</div>
          <div class="card__meta">
            <span>${car.year}</span><span>•</span>
            <span>${car.mileage.toLocaleString("az-AZ")} km</span><span>•</span>
            <span>${car.fuel}</span><span>•</span>
            <span>${car.gearbox}</span>
          </div>

          <div class="card__bottom">
            <div class="card__price">${money(car.price)}</div>
          </div>
        </div>
      </article>
    </a>
  `).join("");
}

function applyFilters(){
  const f = {
    country: qCountry.value,
    brand: qBrand.value,
    model: qModel.value,
    city: qCity.value,
    min: qMinPrice.value ? Number(qMinPrice.value) : null,
    max: qMaxPrice.value ? Number(qMaxPrice.value) : null,
    year: qYear.value ? Number(qYear.value) : null,
    yearMax: qYearMax.value ? Number(qYearMax.value) : null,

  };

  let list = CARS.slice();

  if (f.country) list = list.filter(x => x.country === f.country);
  if (f.brand) list = list.filter(x => x.brand === f.brand);
  if (f.model) list = list.filter(x => x.model === f.model);
  if (f.city) list = list.filter(x => x.city === f.city);
  if (f.year) list = list.filter(x => x.year >= f.year);
  if (f.min !== null) list = list.filter(x => x.price >= f.min);
  if (f.max !== null) list = list.filter(x => x.price <= f.max);
  if (f.yearMax) list = list.filter(x => x.year <= f.yearMax);


  const s = sortBy.value;
  if (s === "price_asc") list.sort((a,b) => a.price - b.price);
  if (s === "price_desc") list.sort((a,b) => b.price - a.price);
  if (s === "year_desc") list.sort((a,b) => b.year - a.year);
  if (s === "year_asc") list.sort((a,b) => a.year - b.year);
  if (s === "new") list.sort((a,b) => b.id - a.id);

  renderCars(list);
  resultInfo.textContent = `${list.length} nəticə tapıldı.`;
  statusBox.textContent = `Demo data: ${CARS.length} elan.`;
}

function resetAll(){
  qCountry.value = "";
  qBrand.value = "";
  qModel.value = "";
  qCity.value = "";
  qMinPrice.value = "";
  qMaxPrice.value = "";
  qYear.value = "";
  qYearMax.value = "";
  sortBy.value = "new";
  applyFilters();
}

// Events
[qCountry, qBrand, qModel, qCity, qYear, qYearMax].forEach(el => el.addEventListener("change", applyFilters));
[qMinPrice, qMaxPrice].forEach(el => el.addEventListener("input", applyFilters));
sortBy.addEventListener("change", applyFilters);

btnSearch.addEventListener("click", applyFilters);
btnReset.addEventListener("click", resetAll);

// Init
applyFilters();

// hamburger menu
document.addEventListener("DOMContentLoaded", () => {
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  const mobileMenuClose = document.getElementById("mobileMenuClose");
  const mobileMenuOverlay = document.getElementById("mobileMenuOverlay");

  console.log("menu bind:", {
    hamburgerBtn: !!hamburgerBtn,
    mobileMenu: !!mobileMenu,
    mobileMenuClose: !!mobileMenuClose,
    mobileMenuOverlay: !!mobileMenuOverlay
  });

  if (!hamburgerBtn || !mobileMenu) return;

  const openMenu = () => mobileMenu.classList.add("is-open");
  const closeMenu = () => mobileMenu.classList.remove("is-open");

  hamburgerBtn.addEventListener("click", openMenu);
  mobileMenuOverlay && mobileMenuOverlay.addEventListener("click", closeMenu);
  mobileMenuClose && mobileMenuClose.addEventListener("click", closeMenu);
});
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".fav-btn");
  if(!btn) return;

  e.preventDefault();
  e.stopPropagation();

  const id = String(btn.dataset.id);

  const favIds = loadFavs();      // ✅ ən son state
  if(favIds.has(id)) favIds.delete(id);
  else favIds.add(id);

  saveFavs(favIds);

  btn.classList.toggle("is-on");
});



