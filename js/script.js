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
    <a class="cardlink" href="details.html?id=${car.id}" aria-label="${car.brand} ${car.model} detallar">
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
// ===== LIGHTBOX (zoom + drag + keyboard) =====
const lbBackdrop = document.createElement("div");
lbBackdrop.className = "lb-backdrop";
lbBackdrop.innerHTML = `
  <div class="lb" role="dialog" aria-modal="true">
    <div class="lb-count" id="lbCount">1 / 1</div>
    <div class="lb-zoom" id="lbZoom">100%</div>
    <button class="lb-close" id="lbClose" aria-label="Bağla">×</button>
    <button class="lb-btn lb-prev" id="lbPrev" aria-label="Əvvəlki"></button>
    <div class="lb-viewport" id="lbViewport">
      <img class="lb-img" id="lbImg" alt="" referrerpolicy="no-referrer" />
    </div>
    <button class="lb-btn lb-next" id="lbNext" aria-label="Növbəti"></button>
  </div>
`;
document.body.appendChild(lbBackdrop);

const lb = {
  backdrop: lbBackdrop,
  img: lbBackdrop.querySelector("#lbImg"),
  viewport: lbBackdrop.querySelector("#lbViewport"),
  count: lbBackdrop.querySelector("#lbCount"),
  zoomLabel: lbBackdrop.querySelector("#lbZoom"),
  close: lbBackdrop.querySelector("#lbClose"),
  prev: lbBackdrop.querySelector("#lbPrev"),
  next: lbBackdrop.querySelector("#lbNext"),
};

let lbOpen = false;
let scale = 1;
let tx = 0;
let ty = 0;
let dragging = false;
let startX = 0;
let startY = 0;
let startTx = 0;
let startTy = 0;

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

const applyTransform = () => {
  lb.img.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  lb.zoomLabel.textContent = `${Math.round(scale * 100)}%`;
};

const resetView = () => {
  scale = 1;
  tx = 0;
  ty = 0;
  applyTransform();
};

const renderLb = () => {
  lb.img.src = imgs[idx];
  lb.count.textContent = `${idx + 1} / ${imgs.length}`;
  lb.prev.style.display = (idx === 0) ? "none" : "flex";
  lb.next.style.display = (idx === imgs.length - 1) ? "none" : "flex";
  resetView();
};

const openLb = (startIndex) => {
  idx = clamp(startIndex, 0, imgs.length - 1);
  lb.backdrop.classList.add("is-open");
  document.body.style.overflow = "hidden";
  lbOpen = true;
  renderLb();
};

const closeLb = () => {
  lb.backdrop.classList.remove("is-open");
  document.body.style.overflow = "";
  lbOpen = false;
};

// mainImg klik -> popup

// thumb klik -> popup (CTRL basıb açmaq istəyənlər üçün)
// thumbsGrid.addEventListener("dblclick", (e) => {
//   const t = e.target.closest(".thumb");
//   if (!t) return;
//   openLb(Number(t.dataset.i));
// });

// lb.close.addEventListener("click", closeLb);
// lb.backdrop.addEventListener("click", (e) => {
//   if (e.target === lb.backdrop) closeLb();
// });

// lb.prev.addEventListener("click", (e) => {
//   e.stopPropagation();
//   if (idx > 0) { idx -= 1; setMain(); renderLb(); }
// });
// lb.next.addEventListener("click", (e) => {
//   e.stopPropagation();
//   if (idx < imgs.length - 1) { idx += 1; setMain(); renderLb(); }
// });

// Keyboard: ESC, arrows
window.addEventListener("keydown", (e) => {
  if (!lbOpen) return;

  if (e.key === "Escape") closeLb();
  if (e.key === "ArrowLeft" && idx > 0) { idx -= 1; setMain(); renderLb(); }
  if (e.key === "ArrowRight" && idx < imgs.length - 1) { idx += 1; setMain(); renderLb(); }

  // Zoom keys: + / -
  if (e.key === "+" || e.key === "=") { scale = clamp(scale + 0.15, 1, 5); applyTransform(); }
  if (e.key === "-" || e.key === "_") { scale = clamp(scale - 0.15, 1, 5); applyTransform(); }
});

// Wheel zoom (mouse)
lb.viewport.addEventListener("wheel", (e) => {
  e.preventDefault();
  const delta = e.deltaY > 0 ? -0.12 : 0.12;
  const newScale = clamp(scale + delta, 1, 5);

  // Zoom mərkəzi: mouse-un olduğu yer
  const rect = lb.viewport.getBoundingClientRect();
  const cx = e.clientX - rect.left;
  const cy = e.clientY - rect.top;

  // transform: tx,ty dəyişərək cursor altını saxla
  const k = newScale / scale;
  tx = cx - k * (cx - tx);
  ty = cy - k * (cy - ty);

  scale = newScale;
  applyTransform();
}, { passive: false });

// Drag (pan)
lb.viewport.addEventListener("mousedown", (e) => {
  dragging = true;
  lb.viewport.classList.add("is-dragging");
  startX = e.clientX;
  startY = e.clientY;
  startTx = tx;
  startTy = ty;
});
window.addEventListener("mousemove", (e) => {
  if (!dragging || !lbOpen) return;
  tx = startTx + (e.clientX - startX);
  ty = startTy + (e.clientY - startY);
  applyTransform();
});
window.addEventListener("mouseup", () => {
  dragging = false;
  lb.viewport.classList.remove("is-dragging");
});

// Double click to zoom in/out
lb.viewport.addEventListener("dblclick", (e) => {
  e.preventDefault();
  if (scale === 1) {
    scale = 2;
  } else {
    scale = 1;
    tx = 0; ty = 0;
  }
  applyTransform();
});

// Touch pinch zoom (basic)
let tStartDist = 0;
let tStartScale = 1;
let tStartTx = 0;
let tStartTy = 0;

const dist = (a, b) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);

lb.viewport.addEventListener("touchstart", (e) => {
  if (!lbOpen) return;

  if (e.touches.length === 1) {
    // pan
    dragging = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    startTx = tx;
    startTy = ty;
  }

  if (e.touches.length === 2) {
    dragging = false;
    tStartDist = dist(e.touches[0], e.touches[1]);
    tStartScale = scale;
    tStartTx = tx;
    tStartTy = ty;
  }
}, { passive: true });

lb.viewport.addEventListener("touchmove", (e) => {
  if (!lbOpen) return;

  if (e.touches.length === 1 && dragging) {
    tx = startTx + (e.touches[0].clientX - startX);
    ty = startTy + (e.touches[0].clientY - startY);
    applyTransform();
  }

  if (e.touches.length === 2) {
    const d = dist(e.touches[0], e.touches[1]);
    const k = d / tStartDist;
    scale = clamp(tStartScale * k, 1, 5);
    tx = tStartTx;
    ty = tStartTy;
    applyTransform();
  }
}, { passive: true });

lb.viewport.addEventListener("touchend", () => {
  dragging = false;
}, { passive: true });

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
  const viewsEl = document.getElementById("viewsCount");
if (viewsEl) viewsEl.textContent = car.views ?? 0;
});



