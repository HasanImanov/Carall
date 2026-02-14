/* =========================
   CarAll - FULL script.js
   Advanced search auto-fill + chips + equipment + filters + menu + favs
   ========================= */

// ===== Favorites =====
// ============================
// GLOBAL TSEL MANAGER (FIX)
// - birini açanda o biri bağlansın
// - outside click hamısını bağlasın
// - ESC hamısını bağlasın
// ============================
(function TSEL_GLOBAL_MANAGER(){
  if (window.__TSEL_GLOBAL_MANAGER__) return;
  window.__TSEL_GLOBAL_MANAGER__ = true;

  function closeAll(exceptWrap){
    document.querySelectorAll(".tsel.is-open").forEach(w=>{
      if (exceptWrap && w === exceptWrap) return;
      w.classList.remove("is-open");
    });
  }

  // 1) CAPTURE click: toggle edəndən ƏVVƏL bağla
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".tsel__btn");
    if (!btn) return;

    const wrap = btn.closest(".tsel");
    if (!wrap) return;

    // bu düyməyə basanda digər hamısı bağlansın
    closeAll(wrap);

    // toggle normal davam etsin (makeTurboSelect-in toggle-u işləsin)
  }, true);

  // 2) outside click: hamısını bağla
  document.addEventListener("click", (e) => {
    if (e.target.closest(".tsel")) return;
    closeAll(null);
  });

  // 3) ESC: hamısını bağla
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAll(null);
  });
})();


document.addEventListener("DOMContentLoaded", () => {
  const advPanel = document.getElementById("advPanel");
  const btnReset = document.getElementById("btnReset");

  if (!advPanel || !btnReset) return;

  const sync = () => {
    const isOpen =
      advPanel.classList.contains("is-open") &&
      !advPanel.hasAttribute("hidden");

    btnReset.style.marginTop = isOpen ? "10px" : "";
  };

  // advPanel necə açılıb-bağlanırsa bağlansın — hamısını tut
  new MutationObserver(sync).observe(advPanel, {
    attributes: true,
    attributeFilter: ["class", "hidden"],
  });

  sync();
});

const FAV_KEY = "carall_favs_v1";

function loadFavs() {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(arr.map(String));
  } catch (e) {
    return new Set();
  }
}
function saveFavs(set) {
  localStorage.setItem(FAV_KEY, JSON.stringify([...set]));
}

// ===== Small helpers =====
const $ = (id) => document.getElementById(id);
const exists = (x) => x !== null && x !== undefined && String(x).trim() !== "";
// ===== Date helpers (card date label) =====
function pad2(n){ return String(n).padStart(2, "0"); }

function formatDMY(d){
  return `${pad2(d.getDate())}.${pad2(d.getMonth()+1)}.${d.getFullYear()}`;
}

function pickCarDateValue(car){
  if (!car || typeof car !== "object") return null;

  const keys = [
    "postedAt","createdAt","updatedAt",
    "posted_at","created_at","updated_at",
    "date","publishDate","createdDate"
  ];
  for (const k of keys){
    const v = car[k];
    if (v !== null && v !== undefined && String(v).trim() !== "") return v;
  }
  return null;
}

function parseCarDate(raw){
  if (raw === null || raw === undefined) return null;

  // timestamp (seconds or ms)
  const sraw = String(raw).trim();
  if (/^\d{10,13}$/.test(sraw)){
    const n = Number(sraw);
    const ms = sraw.length === 10 ? n * 1000 : n;
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  // dd.MM.yyyy
  const m1 = sraw.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (m1){
    const dd = Number(m1[1]), mm = Number(m1[2]), yy = Number(m1[3]);
    const d = new Date(yy, mm-1, dd);
    if (d.getFullYear()===yy && d.getMonth()===mm-1 && d.getDate()===dd) return d;
    return null;
  }

  // YYYY-MM-DD or YYYY/MM/DD
  const m2 = sraw.match(/^(\d{4})[-/](\d{2})[-/](\d{2})/);
  if (m2){
    const yy = Number(m2[1]), mm = Number(m2[2]), dd = Number(m2[3]);
    const d = new Date(yy, mm-1, dd);
    if (d.getFullYear()===yy && d.getMonth()===mm-1 && d.getDate()===dd) return d;
    return null;
  }

  // ISO / other parseable strings
  const d = new Date(sraw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function getCarDateLabel(car){
  const raw = pickCarDateValue(car);
  const d = parseCarDate(raw);
  if (!d) return "—";

  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  return sameDay ? "Bu gün" : formatDMY(d);
}

const uniq = (arr) => [...new Set(arr.filter(exists))];

const num = (v) => {
  if (!exists(v)) return null;
  const n = Number(String(v).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : null;
};

function money(n) {
  return new Intl.NumberFormat("az-AZ").format(n) + " ₼";
}

const countryName = (code) =>
  ({
    AZ: "Azərbaycan",
    TR: "Türkiyə",
    GE: "Gürcüstan",
    DE: "Almaniya",
  }[code] || code);

// ===== Elements (existing) =====
const qCountry  = $("qCountry");
const qBrand    = $("qBrand");
const qModel    = $("qModel");
const qCity     = $("qCity");
const qMinPrice = $("qMinPrice");
const qMaxPrice = $("qMaxPrice");
const qYear     = $("qYear");
const qYearMax  = $("qYearMax");

const btnSearch = $("btnSearch");
const btnReset  = $("btnReset");
const sortBy    = $("sortBy");

const premiumBlock = $("premiumBlock");
const premiumGrid  = $("premiumGrid");
const latestGrid   = $("latestGrid");
const resultInfo = $("resultInfo");
const statusBox  = $("statusBox");

const yearNowEl = $("yearNow");
if (yearNowEl) yearNowEl.textContent = new Date().getFullYear();

// ===== Advanced panel elements =====
const btnAdvanced = $("btnAdvanced");
const advPanel = $("advPanel");
const btnAdvancedClose = $("btnAdvancedClose");
const advApply = $("advApply");
const advClear = $("advClear");
const equipChipsWrap = $("equipChips");

// ===== Default lists (Turbo.az style) =====
const ALL_EQUIPMENTS = [
  "Yüngül lehimli disklər",
  "ABS",
  "Lyuk",
  "Yağış sensoru",
  "Mərkəzi qapanma",
  "Park radarı",
  "Kondisioner",
  "Oturacaqların isidilməsi",
  "Dəri salon",
  "Ksenon lampalar",
  "360° kamera",
  "Arxa görüntü kamerası",
  "Yan pərdələr",
  "Oturacaqların ventilyasiyası",
  "Start/Stop",
  "Cruise control",
  "Bluetooth",
  "Multimedia",
  "Sükan isidilməsi",
  "Elektrik güzgülər",
];

const ALL_BODY_TYPES = [
  "Sedan",
  "Hetçbek",
  "Universal",
  "SUV",
  "Krossover",
  "Pikap",
  "Kupé",
  "Kabriolet",
  "Miniven",
  "Furqon",
];

const ALL_DRIVE = ["Ön", "Arxa", "Tam (4x4)"];
const ALL_FUEL = ["Benzin", "Dizel", "Hibrid", "Elektro", "Qaz"];
const ALL_GEARBOX = ["Avtomat", "Mexaniki", "Robot", "Variator"];
const ALL_STATUS = ["Satışda", "Satılıb", "Rezervdə"];
const ALL_MARKET = ["Rəsmi", "ABŞ", "Avropa", "Koreya", "Yaponiya", "Gürcüstan", "Digər"];

// ===== UI state for chips/toggles =====
const UI = {
  condition: "",      // "new" | "used" | ""
  credit: false,
  barter: false,
  noHit: false,       // vuruğu yoxdur
  notPainted: false,  // rənglənməyib
  onlyCrashed: false, // yalnız qəzalı
  selectedEquip: new Set(),
};

// ===== DOM helpers =====
function fillSelect(el, values, placeholder = "Hamısı") {
  if (!el) return;
  const list = uniq(values).sort((a, b) => String(a).localeCompare(String(b), "az"));
  el.innerHTML =
    `<option value="">${placeholder}</option>` +
    list.map((v) => `<option value="${String(v)}">${String(v)}</option>`).join("");
}

function fillSelectMinMax(minEl, maxEl, values, minLabel = "Min", maxLabel = "Max") {
  if (!minEl || !maxEl) return;
  const list = uniq(values.map((x) => num(x)).filter((x) => x !== null))
    .sort((a, b) => a - b);

  minEl.innerHTML =
    `<option value="">${minLabel}</option>` +
    list.map((v) => `<option value="${v}">${v}</option>`).join("");

  maxEl.innerHTML =
    `<option value="">${maxLabel}</option>` +
    list.map((v) => `<option value="${v}">${v}</option>`).join("");
}

function setChipOn(el, on) {
  if (!el) return;
  el.classList.toggle("is-on", !!on);
}

// ===== Render cards =====
// ===== Render cards (FULL / 3 param) =====
// usage:
// renderCars(list, carsGrid, false)     -> replace
// renderCars(nextChunk, carsGrid, true) -> append (infinite)
// ===== Render cards (supports target + append, backward compatible) =====
function renderCars(list, targetEl = null, append = false) {
  // ✅ adapter: 3-cü parametr həm boolean, həm object ola bilər
  // renderCars(list, grid, true/false)
  // renderCars(list, grid, { append: true/false })
  if (append && typeof append === "object") append = !!append.append;

  const grid = targetEl || document.getElementById("carsGrid");
  if (!grid) return;

  if (!Array.isArray(list) || list.length === 0) {
    if (!append) {
      grid.innerHTML = `
        <div class="empty">
          <div class="empty__t">Nəticə tapılmadı</div>
          <div class="empty__d">Filterləri dəyiş və yenidən yoxla.</div>
        </div>
      `;
    }
    return;
  }

  const favIds = loadFavs ? loadFavs() : new Set();

  const html = list
    .map((car) => {
      const favOn = favIds.has(String(car.id));
      return `
      <a class="cardlink" href="details.html?id=${car.id}" aria-label="${car.brand} ${car.model}">
        <article class="card">
          <div class="card__imgwrap">
            <img class="card__img" src="${car.img}" alt="${car.brand} ${car.model}">
            <div class="card__top">
              <button class="fav-btn ${favOn ? "is-on" : ""}" type="button" data-id="${car.id}" aria-label="Favorit">
                <svg class="fav-ic ic-off" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"
                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <svg class="fav-ic ic-on" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 21.23 4.22 13.45 3.16 12.39a5.5 5.5 0 0 1 7.78-7.78L12 5.67l1.06-1.06a5.5 5.5 0 0 1 7.78 7.78l-1.06 1.06L12 21.23Z"/>
                </svg>
              </button>

              <div class="badges">
                ${car.adType === 2 ? `<span class="badge vip">⭐</span>` : ``}
                ${car.adType === 3 ? `<span class="badge premium">👑</span>` : ``}
              </div>
            </div>

            <div class="badge">${countryName(car.country)} • ${car.city}</div>
          </div>

          <div class="card__body">
            <div class="card__title">${car.brand} ${car.model}</div>
            <div class="card__meta">
              <span>${car.year}</span><span>•</span>
              <span>${Number(car.mileage || 0).toLocaleString("az-AZ")} km</span><span>•</span>
              <span>${car.fuel || ""}</span><span>•</span>
              <span>${car.gearbox || ""}</span>
            </div>
            <div class="card__bottom">
              <div class="card__price-row">
                <div class="card__price">${money(car.price)}</div>
                <div class="card__date" title="${getCarDateLabel(car)}">${getCarDateLabel(car)}</div>
              </div>
            </div>
          </div>
        </article>
      </a>
    `;
    })
    .join("");

  // ✅ append support
  if (append) grid.insertAdjacentHTML("beforeend", html);
  else grid.innerHTML = html;
}







// ===== Read advanced inputs safely (supports missing) =====
function getSelectValue(id) {
  const el = $(id);
  return el ? el.value : "";
}
function getInputNumber(id) {
  const el = $(id);
  return el ? num(el.value) : null;
}
function hasField(car, key) {
  return car && Object.prototype.hasOwnProperty.call(car, key);
}

// ===== Main filter logic =====
function applyFilters() {
  if (typeof CARS === "undefined" || !Array.isArray(CARS)) {
    console.error("CARS tapılmadı (carsdata.js yüklənməyib).");
    return;
  }

  // Base filters (existing)
  const f = {
    country: qCountry?.value || "",
    brand: qBrand?.value || "",
    model: qModel?.value || "",
    city: qCity?.value || "",
    minPrice: qMinPrice?.value ? num(qMinPrice.value) : null,
    maxPrice: qMaxPrice?.value ? num(qMaxPrice.value) : null,
    yearMin: qYear?.value ? num(qYear.value) : null,
    yearMax: qYearMax?.value ? num(qYearMax.value) : null,
  };

  // Additional advanced fields (if you added them in HTML with these IDs)
  const adv = {
    color: getSelectValue("qColor"),
    body: getSelectValue("qBody"),
    fuel: getSelectValue("qFuel"),
    drive: getSelectValue("qDrive"),
    gearbox: getSelectValue("qGearbox"),
    owners: getSelectValue("qOwners"),
    seats: getSelectValue("qSeats"),
    market: getSelectValue("qMarket"),
    status: getSelectValue("qStatus"),

    volumeMin: getInputNumber("qVolumeMin"),
    volumeMax: getInputNumber("qVolumeMax"),
    powerMin: getInputNumber("qPowerMin"),
    powerMax: getInputNumber("qPowerMax"),
    mileageMin: getInputNumber("qMileageMin"),
    mileageMax: getInputNumber("qMileageMax"),
  };

  let list = CARS.slice();

  // Base filters
  if (f.country) list = list.filter((x) => x.country === f.country);
  if (f.brand) list = list.filter((x) => x.brand === f.brand);
  if (f.model) list = list.filter((x) => x.model === f.model);
  if (f.city) list = list.filter((x) => x.city === f.city);

  if (f.yearMin !== null) list = list.filter((x) => num(x.year) !== null && num(x.year) >= f.yearMin);
  if (f.yearMax !== null) list = list.filter((x) => num(x.year) !== null && num(x.year) <= f.yearMax);

  if (f.minPrice !== null) list = list.filter((x) => num(x.price) !== null && num(x.price) >= f.minPrice);
  if (f.maxPrice !== null) list = list.filter((x) => num(x.price) !== null && num(x.price) <= f.maxPrice);

  // Advanced selects (only if car has that key)
  if (adv.color) list = list.filter((x) => !hasField(x, "color") ? true : x.color === adv.color);
  if (adv.body) list = list.filter((x) => !hasField(x, "body") ? true : x.body === adv.body);
  if (adv.fuel) list = list.filter((x) => !hasField(x, "fuel") ? true : x.fuel === adv.fuel);
  if (adv.drive) list = list.filter((x) => !hasField(x, "drive") ? true : x.drive === adv.drive);
  if (adv.gearbox) list = list.filter((x) => !hasField(x, "gearbox") ? true : x.gearbox === adv.gearbox);
  if (adv.owners) list = list.filter((x) => !hasField(x, "owners") ? true : String(x.owners) === String(adv.owners));
  if (adv.seats) list = list.filter((x) => !hasField(x, "seats") ? true : String(x.seats) === String(adv.seats));
  if (adv.market) list = list.filter((x) => !hasField(x, "market") ? true : x.market === adv.market);
  if (adv.status) list = list.filter((x) => !hasField(x, "status") ? true : x.status === adv.status);

  // Advanced numeric ranges
  if (adv.volumeMin !== null) list = list.filter((x) => !hasField(x, "volume") ? true : num(x.volume) !== null && num(x.volume) >= adv.volumeMin);
  if (adv.volumeMax !== null) list = list.filter((x) => !hasField(x, "volume") ? true : num(x.volume) !== null && num(x.volume) <= adv.volumeMax);

  if (adv.powerMin !== null) list = list.filter((x) => !hasField(x, "power") ? true : num(x.power) !== null && num(x.power) >= adv.powerMin);
  if (adv.powerMax !== null) list = list.filter((x) => !hasField(x, "power") ? true : num(x.power) !== null && num(x.power) <= adv.powerMax);

  if (adv.mileageMin !== null) list = list.filter((x) => !hasField(x, "mileage") ? true : num(x.mileage) !== null && num(x.mileage) >= adv.mileageMin);
  if (adv.mileageMax !== null) list = list.filter((x) => !hasField(x, "mileage") ? true : num(x.mileage) !== null && num(x.mileage) <= adv.mileageMax);

  // Chips / toggles
  if (UI.condition === "new") {
    list = list.filter((x) => !hasField(x, "condition") ? true : x.condition === "new");
  }
  if (UI.condition === "used") {
    list = list.filter((x) => !hasField(x, "condition") ? true : x.condition === "used");
  }

  if (UI.credit) list = list.filter((x) => !hasField(x, "credit") ? true : !!x.credit);
  if (UI.barter) list = list.filter((x) => !hasField(x, "barter") ? true : !!x.barter);

  if (UI.noHit) list = list.filter((x) => !hasField(x, "noHit") ? true : !!x.noHit);
  if (UI.notPainted) list = list.filter((x) => !hasField(x, "notPainted") ? true : !!x.notPainted);
  if (UI.onlyCrashed) list = list.filter((x) => !hasField(x, "onlyCrashed") ? true : !!x.onlyCrashed);

  // Equipment chips: every selected equipment must be in car.features
  if (UI.selectedEquip.size) {
    const need = [...UI.selectedEquip];
    list = list.filter((car) => {
      if (!Array.isArray(car.features)) return false;
      return need.every((eq) => car.features.includes(eq));
    });
  }

  // Sorting
  const s = sortBy?.value || "new";
  if (s === "price_asc") list.sort((a, b) => a.price - b.price);
  if (s === "price_desc") list.sort((a, b) => b.price - a.price);
  if (s === "year_desc") list.sort((a, b) => b.year - a.year);
  if (s === "year_asc") list.sort((a, b) => a.year - b.year);
  if (s === "new") list.sort((a, b) => b.id - a.id);

  // renderCars(list);
  // if (resultInfo) resultInfo.textContent = `${list.length} nəticə tapıldı.`;
  //if (statusBox) statusBox.textContent = `Demo data: ${CARS.length} elan.`; 
  // ✅ Filter nəticəsini pager-ə ver

// list artıq sort olunub (sənin sort hissən)
// ✅ əvvəl VIP/Premium, sonra digərləri
PREMIUM_CARS = list.filter(x => x.vip || x.premium);
LATEST_CARS  = list.filter(x => !(x.vip || x.premium));

// pager cursors sıfırlansın
resetPagerDual();

// info
if (resultInfo) resultInfo.textContent = `${list.length} nəticə tapıldı.`;
if (statusBox) statusBox.textContent = `Demo data: ${ALL_CARS.length} elan.`;

}

function resetAll() {
  // base
  if (qCountry) qCountry.value = "";
  if (qBrand) qBrand.value = "";
  if (qModel) qModel.value = "";
  if (qCity) qCity.value = "";
  if (qMinPrice) qMinPrice.value = "";
  if (qMaxPrice) qMaxPrice.value = "";
  if (qYear) qYear.value = "";
  if (qYearMax) qYearMax.value = "";
  if (sortBy) sortBy.value = "new";

  // advanced
  ["qColor","qBody","qFuel","qDrive","qGearbox","qOwners","qSeats","qMarket","qStatus"].forEach((id) => {
    const el = $(id);
    if (el) el.value = "";
  });
  ["qVolumeMin","qVolumeMax","qPowerMin","qPowerMax","qMileageMin","qMileageMax"].forEach((id) => {
    const el = $(id);
    if (el) el.value = "";
  });

  // chips state
  UI.condition = "";
  UI.credit = false;
  UI.barter = false;
  UI.noHit = false;
  UI.notPainted = false;
  UI.onlyCrashed = false;
  UI.selectedEquip.clear();

  // update UI chips if present
  updateAllChipUI();

  applyFilters();
}

// ===== Favorites click =====
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".fav-btn");
  if (!btn) return;

  e.preventDefault();
  e.stopPropagation();

  const id = String(btn.dataset.id || "");
  if (!id) return;

  const favIds = loadFavs();
  if (favIds.has(id)) favIds.delete(id);
  else favIds.add(id);

  saveFavs(favIds);
  btn.classList.toggle("is-on");
});

// ===== Bind filter events (base) =====
[qCountry, qBrand, qModel, qCity, qYear, qYearMax].forEach((el) => el && el.addEventListener("change", applyFilters));
[qMinPrice, qMaxPrice].forEach((el) => el && el.addEventListener("input", applyFilters));
sortBy && sortBy.addEventListener("change", applyFilters);

btnSearch && btnSearch.addEventListener("click", applyFilters);
btnReset && btnReset.addEventListener("click", resetAll);

// ===== Advanced: auto-fill EVERYTHING =====
function initAdvancedAutoFill() {
  if (typeof CARS === "undefined" || !Array.isArray(CARS)) return;

  // base selects already exist
  if (qCountry) fillSelect(qCountry, CARS.map((c) => c.country), "Ölkə");
  if (qBrand) fillSelect(qBrand, CARS.map((c) => c.brand), "Marka");
  if (qCity) fillSelect(qCity, CARS.map((c) => c.city), "Şəhər");

  // brand -> model dependency
  if (qBrand && qModel) {
    const fillModels = () => {
      const b = qBrand.value;
      const models = CARS.filter((c) => !b || c.brand === b).map((c) => c.model);
      fillSelect(qModel, models, "Model");
    };
    qBrand.addEventListener("change", () => {
      fillModels();
      applyFilters();
    });
    fillModels();
  }

  // price/year min-max: if they are inputs, skip; if selects, fill
  if (qYear && qYearMax && qYear.tagName === "SELECT" && qYearMax.tagName === "SELECT") {
    fillSelectMinMax(qYear, qYearMax, CARS.map((c) => c.year), "İl, min.", "maks.");
  }
  if (qMinPrice && qMaxPrice && qMinPrice.tagName === "SELECT" && qMaxPrice.tagName === "SELECT") {
    fillSelectMinMax(qMinPrice, qMaxPrice, CARS.map((c) => c.price), "Qiymət, min.", "maks.");
  }

  // advanced IDs (if exist in your HTML)
  const qColor = $("qColor");
  const qBody = $("qBody");
  const qFuel = $("qFuel");
  const qDrive = $("qDrive");
  const qGearbox = $("qGearbox");
  const qOwners = $("qOwners");
  const qSeats = $("qSeats");
  const qMarket = $("qMarket");
  const qStatus = $("qStatus");

  if (qColor) fillSelect(qColor, CARS.map((c) => c.color), "Rəng");
  if (qBody) fillSelect(qBody, CARS.map((c) => c.body).concat(ALL_BODY_TYPES), "Ban növü");
  if (qFuel) fillSelect(qFuel, CARS.map((c) => c.fuel).concat(ALL_FUEL), "Yanacaq növü");
  if (qDrive) fillSelect(qDrive, CARS.map((c) => c.drive).concat(ALL_DRIVE), "Ötürücü");
  if (qGearbox) fillSelect(qGearbox, CARS.map((c) => c.gearbox).concat(ALL_GEARBOX), "Sürətlər qutusu");
  if (qOwners) fillSelect(qOwners, CARS.map((c) => c.owners), "Sahiblərinin sayı");
  if (qSeats) fillSelect(qSeats, CARS.map((c) => c.seats), "Yerlərin sayı");
  if (qMarket) fillSelect(qMarket, CARS.map((c) => c.market).concat(ALL_MARKET), "Hansı bazar üçün yığılıb");
  if (qStatus) fillSelect(qStatus, CARS.map((c) => c.status).concat(ALL_STATUS), "Status");

  // numeric ranges for advanced (if exist)
  const qVolumeMin = $("qVolumeMin");
  const qVolumeMax = $("qVolumeMax");
  const qPowerMin = $("qPowerMin");
  const qPowerMax = $("qPowerMax");
  const qMileageMin = $("qMileageMin");
  const qMileageMax = $("qMileageMax");

  if (qVolumeMin && qVolumeMax && qVolumeMin.tagName === "SELECT" && qVolumeMax.tagName === "SELECT") {
    fillSelectMinMax(qVolumeMin, qVolumeMax, CARS.map((c) => c.volume), "Həcm (sm³), min.", "maks.");
  }
  if (qPowerMin && qPowerMax && qPowerMin.tagName === "SELECT" && qPowerMax.tagName === "SELECT") {
    fillSelectMinMax(qPowerMin, qPowerMax, CARS.map((c) => c.power), "Güc (a.g.), min.", "maks.");
  }
  if (qMileageMin && qMileageMax && qMileageMin.tagName === "SELECT" && qMileageMax.tagName === "SELECT") {
    fillSelectMinMax(qMileageMin, qMileageMax, CARS.map((c) => c.mileage), "Yürüş (km), min.", "maks.");
  }

  // bind change/input for advanced fields (so filter updates)
  [
    qColor, qBody, qFuel, qDrive, qGearbox, qOwners, qSeats, qMarket, qStatus,
    qVolumeMin, qVolumeMax, qPowerMin, qPowerMax, qMileageMin, qMileageMax
  ].forEach((el) => el && el.addEventListener("change", applyFilters));

  [
    qVolumeMin, qVolumeMax, qPowerMin, qPowerMax, qMileageMin, qMileageMax
  ].forEach((el) => el && el.tagName === "INPUT" && el.addEventListener("input", applyFilters));
  function fillSelectEl(el, values, placeholderText) {
  if (!el) return;
  const list = [...new Set(values.filter(v => v !== null && v !== undefined && String(v).trim() !== ""))]
    .sort((a,b) => String(a).localeCompare(String(b), "az"));

  const ph = placeholderText || "Hamısı";
  el.innerHTML = `<option value="">${ph}</option>` + list.map(v => `<option value="${v}">${v}</option>`).join("");
}

function initAdvancedAutoFill_NoIds() {
  const cars = window.CARS || [];
  if (!cars.length) return;

  const panel = document.getElementById("advPanel") || document;
  const selects = [...panel.querySelectorAll("select")];

  const getPh = (sel) => {
    // 1) data-ph varsa
    if (sel.dataset && sel.dataset.ph) return sel.dataset.ph;
    // 2) ilk option text
    const opt = sel.querySelector("option");
    if (opt && opt.textContent) return opt.textContent.trim();
    // 3) yaxın label text
    const lbl = sel.closest(".f")?.querySelector("label");
    if (lbl) return lbl.textContent.trim();
    return "";
  };

  const phIncludes = (ph, words) => words.some(w => ph.toLowerCase().includes(w));

  selects.forEach(sel => {
    const ph = getPh(sel);

    // Marka
    if (phIncludes(ph, ["marka"])) {
      fillSelectEl(sel, cars.map(c => c.brand), "Marka");
      return;
    }

    // Model (markadan asılı olma üçün ayrıca handle edəcəyik aşağıda)
    if (phIncludes(ph, ["model"])) {
      fillSelectEl(sel, cars.map(c => c.model), "Model");
      return;
    }

    // Şəhər
    if (phIncludes(ph, ["şəhər", "seher"])) {
      fillSelectEl(sel, cars.map(c => c.city), "Şəhər");
      return;
    }

    // Rəng
    if (phIncludes(ph, ["rəng", "reng"])) {
      fillSelectEl(sel, cars.map(c => c.color), "Rəng");
      return;
    }

    // Ban növü
    if (phIncludes(ph, ["ban"])) {
      fillSelectEl(sel, cars.map(c => c.body), "Ban növü");
      return;
    }

    // Yanacaq
    if (phIncludes(ph, ["yanacaq", "fuel"])) {
      fillSelectEl(sel, cars.map(c => c.fuel), "Yanacaq növü");
      return;
    }

    // Ötürücü
    if (phIncludes(ph, ["ötürücü", "oturucu", "drive"])) {
      fillSelectEl(sel, cars.map(c => c.drive), "Ötürücü");
      return;
    }

    // Sürətlər qutusu
    if (phIncludes(ph, ["sürətlər", "suretl", "qutu"])) {
      fillSelectEl(sel, cars.map(c => c.gearbox), "Sürətlər qutusu");
      return;
    }

    // Sahiblərinin sayı
    if (phIncludes(ph, ["sahibl", "sahib"])) {
      fillSelectEl(sel, cars.map(c => c.owners), "Sahiblərinin sayı");
      return;
    }

    // Yerlərin sayı
    if (phIncludes(ph, ["yerlərin", "yer"])) {
      fillSelectEl(sel, cars.map(c => c.seats), "Yerlərin sayı");
      return;
    }

    // Status
    if (phIncludes(ph, ["status"])) {
      fillSelectEl(sel, cars.map(c => c.status), "Status");
      return;
    }

    // Bazar
    if (phIncludes(ph, ["bazar"])) {
      fillSelectEl(sel, cars.map(c => c.market), "Hansı bazar üçün yığılıb");
      return;
    }
  });

  // ✅ Marka → Model dependency (ID yox, placeholder ilə tapırıq)
  const brandSel = selects.find(s => (getPh(s).toLowerCase().includes("marka")));
  const modelSel = selects.find(s => (getPh(s).toLowerCase().includes("model")));

  if (brandSel && modelSel) {
    const fillModelsByBrand = () => {
      const b = brandSel.value;
      const models = cars.filter(c => !b || c.brand === b).map(c => c.model);
      fillSelectEl(modelSel, models, "Model");
    };
    brandSel.addEventListener("change", fillModelsByBrand);
    fillModelsByBrand();
  }
}

// panel açılmadan da doldursun:
document.addEventListener("DOMContentLoaded", initAdvancedAutoFill_NoIds);

}

// ===== Equipment chips (Turbo.az like) =====
function initEquipmentChips() {
  if (!equipChipsWrap) return;

  equipChipsWrap.innerHTML = ALL_EQUIPMENTS.map((name) => `
    <button type="button" class="chip" data-eq="${name}">${name}</button>
  `).join("");

  equipChipsWrap.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    const eq = chip.dataset.eq;

    if (UI.selectedEquip.has(eq)) UI.selectedEquip.delete(eq);
    else UI.selectedEquip.add(eq);

    chip.classList.toggle("is-on");
    applyFilters();
  });
}

// ===== Chips/toggles (if you have these buttons in HTML) =====
// Expected IDs (optional):
// btnCondAll, btnCondNew, btnCondUsed, chipCredit, chipBarter, chipNoHit, chipNotPainted, chipOnlyCrashed
function updateAllChipUI() {
  setChipOn($("btnCondAll"), UI.condition === "");
  setChipOn($("btnCondNew"), UI.condition === "new");
  setChipOn($("btnCondUsed"), UI.condition === "used");

  setChipOn($("chipCredit"), UI.credit);
  setChipOn($("chipBarter"), UI.barter);
  setChipOn($("chipNoHit"), UI.noHit);
  setChipOn($("chipNotPainted"), UI.notPainted);
  setChipOn($("chipOnlyCrashed"), UI.onlyCrashed);

  // equipment chips UI already toggles per click, but resetAll uses this:
  if (equipChipsWrap) {
    equipChipsWrap.querySelectorAll(".chip").forEach((c) => {
      c.classList.toggle("is-on", UI.selectedEquip.has(c.dataset.eq));
    });
  }
}

function bindChipsIfExist() {
  const btnCondAll = $("btnCondAll");
  const btnCondNew = $("btnCondNew");
  const btnCondUsed = $("btnCondUsed");

  btnCondAll && btnCondAll.addEventListener("click", () => { UI.condition = ""; updateAllChipUI(); applyFilters(); });
  btnCondNew && btnCondNew.addEventListener("click", () => { UI.condition = "new"; updateAllChipUI(); applyFilters(); });
  btnCondUsed && btnCondUsed.addEventListener("click", () => { UI.condition = "used"; updateAllChipUI(); applyFilters(); });

  const chipCredit = $("chipCredit");
  const chipBarter = $("chipBarter");
  const chipNoHit = $("chipNoHit");
  const chipNotPainted = $("chipNotPainted");
  const chipOnlyCrashed = $("chipOnlyCrashed");

  chipCredit && chipCredit.addEventListener("click", () => { UI.credit = !UI.credit; updateAllChipUI(); applyFilters(); });
  chipBarter && chipBarter.addEventListener("click", () => { UI.barter = !UI.barter; updateAllChipUI(); applyFilters(); });
  chipNoHit && chipNoHit.addEventListener("click", () => { UI.noHit = !UI.noHit; updateAllChipUI(); applyFilters(); });
  chipNotPainted && chipNotPainted.addEventListener("click", () => { UI.notPainted = !UI.notPainted; updateAllChipUI(); applyFilters(); });
  chipOnlyCrashed && chipOnlyCrashed.addEventListener("click", () => { UI.onlyCrashed = !UI.onlyCrashed; updateAllChipUI(); applyFilters(); });

  updateAllChipUI();
}

// ===== Advanced panel open/close (smooth friendly) =====
const closeAllTurboSelects = () => {
  document.querySelectorAll(".tsel.is-open").forEach((w) => {
    if (w !== wrap) w.classList.remove("is-open");
  });
};

function initAdvancedPanel() {
  if (!btnAdvanced || !advPanel) return;

  const open = () => {
  closeAllTurboSelects();          // ✅ əlavə et
  wrap.classList.add("is-open");
  renderList(input.value);
  setBtnLabel();
  if (searchable) {
    setTimeout(() => { input.focus(); input.select(); }, 0);
  }
};

  const close = () => {
    advPanel.classList.remove("is-open");
    advPanel.setAttribute("aria-hidden", "true");

    // transition-friendly hide
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      advPanel.setAttribute("hidden", "");
      advPanel.removeEventListener("transitionend", onEnd);
    };
    const onEnd = () => finish();
    advPanel.addEventListener("transitionend", onEnd);
    setTimeout(finish, 220);
  };

  const toggle = () => (advPanel.classList.contains("is-open") ? close() : open());

  btnAdvanced.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggle();
  });

  btnAdvancedClose && btnAdvancedClose.addEventListener("click", (e) => {
    e.preventDefault();
    close();
  });

  advApply && advApply.addEventListener("click", () => {
    btnSearch && btnSearch.click();
    close();
  });

  advClear && advClear.addEventListener("click", () => {
    btnReset && btnReset.click();
  });

  // outside click -> close
  document.addEventListener("click", (e) => {
    if (advPanel.hasAttribute("hidden")) return;
    if (e.target.closest("#advPanel") || e.target.closest("#btnAdvanced")) return;
    close();
  });
}

// ===== Hamburger menu (open/close) =====
function initHamburgerMenu() {
  const hamburgerBtn = $("hamburgerBtn");
  const mobileMenu = $("mobileMenu");
  const mobileMenuClose = $("mobileMenuClose");
  const mobileMenuOverlay = $("mobileMenuOverlay");

  if (!hamburgerBtn || !mobileMenu) return;

  const isOpen = () => mobileMenu.classList.contains("is-open");

  const openMenu = () => {
    mobileMenu.classList.add("is-open");
    hamburgerBtn.setAttribute("aria-expanded", "true");
  };
  const closeMenu = () => {
    mobileMenu.classList.remove("is-open");
    hamburgerBtn.setAttribute("aria-expanded", "false");
  };
  const toggleMenu = () => (isOpen() ? closeMenu() : openMenu());

  hamburgerBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMenu();
  });

  mobileMenuClose && mobileMenuClose.addEventListener("click", (e) => {
    e.preventDefault();
    closeMenu();
  });

  mobileMenuOverlay && mobileMenuOverlay.addEventListener("click", closeMenu);

  document.addEventListener(
    "click",
    (e) => {
      if (!isOpen()) return;
      if (e.target.closest("#mobileMenu") || e.target.closest("#hamburgerBtn")) return;
      closeMenu();
    },
    true
  );

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  mobileMenu.addEventListener("click", (e) => {
    const a = e.target.closest("a, button");
    if (!a) return;
    closeMenu();
  });
}

// ===== Init everything =====
document.addEventListener("DOMContentLoaded", () => {
  // 1) auto-fill selects/ranges (full)
  initAdvancedAutoFill();

  // 2) chips (credit/barter/condition flags) if you have them
  bindChipsIfExist();

  // 3) equipment chips always (Turbo.az like)
  initEquipmentChips();

  // 4) advanced panel toggle
  initAdvancedPanel();

  // 5) hamburger
  initHamburgerMenu();

  // 6) initial render
  // 6) initial render
  applyFilters();
  
});
function ensureAdvFields() {
  const advGrid = document.getElementById("advGrid");
  if (!advGrid) return;

  // bir dəfə yaratsın
  if (document.getElementById("qColor")) return;

  const mkSelect = (label, id) => {
    const wrap = document.createElement("div");
    wrap.className = "field";
    wrap.innerHTML = `
      <label class="field__label" for="${id}">${label}</label>
      <select class="field__control" id="${id}"></select>
    `;
    return wrap;
  };

  // FULL advanced selects
  advGrid.appendChild(mkSelect("Rəng", "qColor"));
  advGrid.appendChild(mkSelect("Ban növü", "qBody"));
  advGrid.appendChild(mkSelect("Ötürücü", "qDrive"));
  advGrid.appendChild(mkSelect("Sürətlər qutusu", "qGearbox2"));
  advGrid.appendChild(mkSelect("Yanacaq növü", "qFuel2"));
  advGrid.appendChild(mkSelect("Sahiblərinin sayı", "qOwners"));
  advGrid.appendChild(mkSelect("Yerlərin sayı", "qSeats"));
  advGrid.appendChild(mkSelect("Hansı bazar üçün yığılıb", "qMarket"));
  advGrid.appendChild(mkSelect("Status", "qStatus"));
}

function fillSelect(id, values, ph) {
  const el = document.getElementById(id);
  if (!el) return;
  const list = [...new Set(values.filter(v => v != null && String(v).trim() !== ""))]
    .sort((a,b)=>String(a).localeCompare(String(b),"az"));
  el.innerHTML = `<option value="">${ph}</option>` + list.map(v => `<option value="${v}">${v}</option>`).join("");
}

function fillAdvOptions() {
  const cars = window.CARS || window.cars || [];
  if (!cars.length) return;

  fillSelect("qColor",  cars.map(c=>c.color),  "Hamısı");
  fillSelect("qBody",   cars.map(c=>c.body),   "Hamısı");
  fillSelect("qDrive",  cars.map(c=>c.drive),  "Hamısı");

  // əsas filterlərdə gearbox/fuel var, amma adv üçün ayrıca yaratdıq
  fillSelect("qGearbox2", cars.map(c=>c.gearbox), "Hamısı");
  fillSelect("qFuel2",    cars.map(c=>c.fuel),    "Hamısı");

  fillSelect("qOwners", cars.map(c=>c.owners), "Hamısı");
  fillSelect("qSeats",  cars.map(c=>c.seats),  "Hamısı");
  fillSelect("qMarket", cars.map(c=>c.market), "Hamısı");
  fillSelect("qStatus", cars.map(c=>c.status), "Hamısı");
}

document.addEventListener("DOMContentLoaded", () => {
  ensureAdvFields();
  fillAdvOptions();

  // panel açılıb bağlananda da dolu qalsın
  const btn = document.getElementById("btnAdvanced");
  btn?.addEventListener("click", () => {
    ensureAdvFields();
    fillAdvOptions();
  });
});
function makeTurboSelect(select, { searchable=true, placeholder="Seçin", clearText="Sıfırla" } = {}) {
  if (!select || select.dataset.turboized) return;
  select.dataset.turboized = "1";

  const wrap = document.createElement("div");
  wrap.className = "tsel";

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "tsel__btn";

  const chev = document.createElement("span");
  chev.className = "tsel__chev";
  chev.textContent = "▾";

  const panel = document.createElement("div");
  panel.className = "tsel__panel";

  const search = document.createElement("div");
  search.className = "tsel__search";

  const input = document.createElement("input");
  input.className = "tsel__input";
  input.type = "text";
  input.placeholder = placeholder;

  const clearBox = document.createElement("div");
  clearBox.className = "tsel__clear";

  const clearRow = document.createElement("div");
  clearRow.className = "tsel__row";
  clearRow.innerHTML = `<span class="tsel__x">×</span> <span>${clearText}</span>`;

  const list = document.createElement("div");
  list.className = "tsel__list";

  if (searchable) {
    search.appendChild(input);
    panel.appendChild(search);
  }
  clearBox.appendChild(clearRow);
  panel.appendChild(clearBox);
  panel.appendChild(list);

  // DOM replace: select qalır (hidden), custom üstə çıxır
  select.parentNode.insertBefore(wrap, select);
  wrap.appendChild(select);
  wrap.appendChild(btn);
  btn.appendChild(chev);
  wrap.appendChild(panel);

  // hide native select (dəyər dəyişməsi yenə işləyir)
  select.style.position = "absolute";
  select.style.opacity = "0";
  select.style.pointerEvents = "none";
  select.style.height = "0";
  select.style.width = "0";

  const getOptions = () => [...select.options].map(o => ({ value: o.value, label: o.textContent }));

  const setBtnLabel = () => {
    const opts = getOptions();
    const cur = select.value;
    const found = opts.find(x => x.value === cur);
    btn.childNodes[0]?.remove?.(); // safety
    btn.textContent = found?.label || opts[0]?.label || "";
    btn.appendChild(chev);
  };

  const renderList = (q="") => {
    const qq = q.trim().toLowerCase();
    const opts = getOptions();

    list.innerHTML = "";
    opts.forEach(o => {
      if (qq && !o.label.toLowerCase().includes(qq)) return;

      // ilk option (Hamısı/Min/Max) listdə də görünsün istəyirsənsə saxla:
      // indi saxlayırıq, çünki Turbo az da göstərir.
      const row = document.createElement("div");
      row.className = "tsel__row" + (o.value === select.value ? " is-active" : "");
      row.textContent = o.label;

      row.addEventListener("click", () => {
        select.value = o.value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        setBtnLabel();
        wrap.classList.remove("is-open");
      });

      list.appendChild(row);
    });
  };

  const open = () => {
    wrap.classList.add("is-open");
    renderList(input.value);
    setBtnLabel();
    if (searchable) {
      setTimeout(() => { input.focus(); input.select(); }, 0);
    }
  };
  const close = () => wrap.classList.remove("is-open");
  const toggle = (e) => { e?.stopPropagation(); wrap.classList.contains("is-open") ? close() : open(); };

  btn.addEventListener("click", toggle);
  document.addEventListener("click", (e) => {
    if (!wrap.contains(e.target)) close();
  });

  clearRow.addEventListener("click", (e) => {
    e.stopPropagation();
    select.value = "";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    input.value = "";
    setBtnLabel();
    renderList("");
    close();
  });

  input.addEventListener("input", () => renderList(input.value));

  // ESC bağla
  document.addEventListener("keydown", (e) => {
    if (!wrap.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
  });

  // options sonradan dəyişərsə (səndə marka/model kimi), sync
  const obs = new MutationObserver(() => {
    setBtnLabel();
    renderList(input.value);
  });
  obs.observe(select, { childList: true, subtree: true });

  setBtnLabel();
}

// tətbiq: istəsən yalnız advPanel select-ləri
function initTurboSelects() {
  document.querySelectorAll("#advPanel select, .filters select, select.sort")
    .forEach(sel => makeTurboSelect(sel, { searchable: true, placeholder: "Yazın...", clearText: "Sıfırla" }));
}

document.addEventListener("DOMContentLoaded", () => {
  initTurboSelects();
  // Ətraflı panel açılınca yenilər yaranırsa
  document.getElementById("btnAdvanced")?.addEventListener("click", () => setTimeout(initTurboSelects, 0));
});

// === BUTTON SWAP: Ətraflı açılınca Axtar/Sıfırla aşağı düşsün ===
document.addEventListener("DOMContentLoaded", () => {
  const advPanel = document.getElementById("advPanel");
  const btnGroup = document.getElementById("topActions");
  const actions = btnGroup?.closest(".actions");

  if (!advPanel || !btnGroup || !actions) return;

  // ilkin yerini yadda saxla
  const homeParent = actions;
  const homeNext = btnGroup.nextSibling;

  const moveDown = () => {
    advPanel.insertAdjacentElement("afterend", btnGroup);
  };

  const moveUp = () => {
    if (homeNext) homeParent.insertBefore(btnGroup, homeNext);
    else homeParent.appendChild(btnGroup);
  };

  const sync = () => {
    const open =
      advPanel.classList.contains("is-open") &&
      !advPanel.hasAttribute("hidden");

    if (open) moveDown();
    else moveUp();
  };

  // advPanel açılıb–bağlananda avtomatik izləyir
  new MutationObserver(sync).observe(advPanel, {
    attributes: true,
    attributeFilter: ["class", "hidden"],
  });

  sync();
});
// === PATCH v2: adv açılınca btn-group aşağı düşsün + araya spacer qoyulsun ===
document.addEventListener("DOMContentLoaded", () => {
  const advPanel = document.getElementById("advPanel");
  const btnGroup = document.getElementById("topActions");
  const actions = btnGroup?.closest(".actions");

  if (!advPanel || !btnGroup || !actions) return;

  // ilkin yerini yadda saxla
  const homeParent = actions;
  const homeNext = btnGroup.nextSibling;

  // spacer (yalnız aşağıda olanda istifadə edəcəyik)
  const spacer = document.createElement("div");
  spacer.className = "adv-actions-spacer";

  const moveDown = () => {
    // spacer yoxdursa əlavə et
    if (!spacer.isConnected) advPanel.insertAdjacentElement("afterend", spacer);
    // btnGroup-u spacer-dən sonra qoy
    spacer.insertAdjacentElement("afterend", btnGroup);
  };

  const moveUp = () => {
    // btnGroup-u geri qaytar
    if (homeNext) homeParent.insertBefore(btnGroup, homeNext);
    else homeParent.appendChild(btnGroup);

    // spacer-i sil (yalnız aşağıda lazım idi)
    if (spacer.isConnected) spacer.remove();
  };

  const sync = () => {
    const open = advPanel.classList.contains("is-open") && !advPanel.hasAttribute("hidden");
    if (open) moveDown();
    else moveUp();
  };

  // panel açılıb-bağlananda izləyək
  new MutationObserver(sync).observe(advPanel, {
    attributes: true,
    attributeFilter: ["class", "hidden"],
  });

  sync();
});
// === FINAL: Mobil-də Qiymət/İl həmişə Ətraflı (advGrid) içində qalsın ===
document.addEventListener("DOMContentLoaded", () => {
  const advPanel = document.getElementById("advPanel");
  const advGrid  = document.getElementById("advGrid");
  if (!advPanel || !advGrid) return;

  const ids = ["qMinPrice", "qMaxPrice", "qYear", "qYearMax"];

  const getFields = () =>
    ids
      .map((id) => document.getElementById(id))
      .map((el) => el?.closest(".field"))
      .filter(Boolean);

  const fields = getFields();
  if (!fields.length) return;

  // ilkin yerlər (desktop üçün geri qaytarmaq)
  const homes = fields.map((f) => ({ el: f, parent: f.parentNode, next: f.nextSibling }));

  const isMobile = () => window.matchMedia("(max-width: 640px)").matches;

  const moveToAdv = () => {
    // artıq advGrid-dədirsə toxunma
    fields.forEach((f) => {
      if (advGrid.contains(f)) return;
      advGrid.insertBefore(f, advGrid.firstChild);
    });
  };

  const moveBack = () => {
    homes.forEach((h) => {
      if (!h.parent) return;
      if (h.next) h.parent.insertBefore(h.el, h.next);
      else h.parent.appendChild(h.el);
    });
  };

  const sync = () => {
    if (isMobile()) moveToAdv();   // ✅ mobil-də həmişə adv-də qalsın
    else moveBack();               // ✅ desktop-da köhnə yerində
  };

  // panel açılıb-bağlananda da, resize olanda da sync et
  new MutationObserver(sync).observe(advPanel, {
    attributes: true,
    attributeFilter: ["class", "hidden"],
  });
  window.addEventListener("resize", sync);

  sync();
});
// === Mobile bottom nav "Axtar" → Ətraflı axtarış aç + scroll ===
document.addEventListener("DOMContentLoaded", () => {
  const advPanel = document.getElementById("advPanel");
  const btnAdvanced = document.getElementById("btnAdvanced");

  // bottom nav-dakı "Axtar" linkini tap
  const mobileSearchBtn = document.querySelector(
    '.bnav__item[aria-label="Search"]'
  );

  if (!advPanel || !btnAdvanced || !mobileSearchBtn) return;

  const isMobile = () => window.matchMedia("(max-width: 640px)").matches;

  mobileSearchBtn.addEventListener("click", (e) => {
    if (!isMobile()) return;

    // default #list scroll-u bir az gecikdirək
    e.preventDefault();

    const isOpen =
      advPanel.classList.contains("is-open") &&
      !advPanel.hasAttribute("hidden");

    // ətraflı açıq deyilsə → aç
    if (!isOpen) {
      btnAdvanced.click();
    }

    // panelin olduğu yerə yumuşaq scroll
    setTimeout(() => {
      advPanel.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);
  });
});
// === Mobile bottom nav: "Axtar" basanda Ətraflı axtarışa scroll + aç ===
document.addEventListener("DOMContentLoaded", () => {
  const advPanel = document.getElementById("advPanel");
  const btnAdvanced = document.getElementById("btnAdvanced");
  const filtersTop = document.querySelector(".filters") || btnAdvanced; // scroll target

  if (!advPanel || !btnAdvanced) return;

  // bnav içində "Axtar" text-i olan linki tap
  const bnavLinks = [...document.querySelectorAll(".bnav a.bnav__item")];
  const mobileSearchBtn = bnavLinks.find(a =>
    (a.querySelector(".bnav__text")?.textContent || "").trim().toLowerCase() === "axtar"
  );

  if (!mobileSearchBtn) return;

  const isMobile = () => window.matchMedia("(max-width: 640px)").matches;

  mobileSearchBtn.addEventListener("click", (e) => {
    if (!isMobile()) return;

    // #list default scroll-u dayandır
    e.preventDefault();
    e.stopPropagation();

    const isOpen =
      advPanel.classList.contains("is-open") &&
      !advPanel.hasAttribute("hidden");

    // bağlıdırsa aç
    if (!isOpen) btnAdvanced.click();

    // panel/filters hissəsinə yumşaq scroll
    setTimeout(() => {
      (filtersTop || advPanel).scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }, true);
});
document.addEventListener("DOMContentLoaded", () => {
  const flag = localStorage.getItem("carall_open_adv");
  if (flag !== "1") return;

  localStorage.removeItem("carall_open_adv");

  const advPanel = document.getElementById("advPanel");
  const btnAdvanced = document.getElementById("btnAdvanced");
  const target = document.querySelector(".filters") || advPanel;

  if (!advPanel || !btnAdvanced) return;

  // aç
  btnAdvanced.click();

  // scroll
  setTimeout(() => {
    (target || advPanel).scrollIntoView({ behavior:"smooth", block:"start" });
  }, 120);
});
document.addEventListener("DOMContentLoaded", () => {
  const axtar = document.getElementById("bnavSearch");
  if (!axtar) return;

  axtar.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopImmediatePropagation(); // ✅ başqa listener-ləri də kəsir
    location.href = "index.html#adv";
  }, true); // ✅ capture
});
document.addEventListener("DOMContentLoaded", () => {
  if (location.hash !== "#adv") return;

  const advPanel = document.getElementById("advPanel");
  const btnAdvanced = document.getElementById("btnAdvanced");
  if (!advPanel || !btnAdvanced) return;

  const isOpen = advPanel.classList.contains("is-open") && !advPanel.hasAttribute("hidden");
  if (!isOpen) btnAdvanced.click();

  setTimeout(() => {
    (document.querySelector(".filters") || advPanel)
      .scrollIntoView({ behavior: "smooth", block: "start" });
  }, 120);
});
// ========== DEV AUTH (only for development) ==========
(function devAuth(){
  const DEV_MODE = true; // prod olanda false edəcəksən

  if(!DEV_MODE) return;

  const SESSION_KEY = "carall_session_v1";
  const USERS_KEY   = "carall_users_v1";

  const session = (() => {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; }
  })();

  if(session?.userId) return; // artıq login var

  // DEV user-i users listinə yaz
  let users = [];
  try { users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); } catch {}

  let devUser = users.find(u => u.id === "DEV_USER");
  if(!devUser){
    devUser = {
      id: "DEV_USER",
      type: "personal",
      email: "dev@carall.local",
      profile: { firstName: "DEV", lastName: "USER" },
      password: "dev12345",
      createdAt: Date.now()
    };
    users.unshift(devUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  // session yarat
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    userId: "DEV_USER",
    type: "personal",
    createdAt: Date.now()
  }));
})();
const ALL_CARS = [...cars];        // backend/json gələndə də burası dəyişməyəcək
let FILTERED_CARS = [...ALL_CARS];
let SORTED_CARS   = [...FILTERED_CARS];
let VISIBLE_CARS  = [];

// pager state
let cursor = 0;
const FIRST = 8;
const NEXT  = 8;
// ===== SORT (default: ən yenilər yuxarıda) =====
function applyDefaultSort() {
  SORTED_CARS = [...FILTERED_CARS].sort(
    (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
  );
}
// ===== PAGER =====
function resetPager() {
  cursor = 0;
  VISIBLE_CARS = SORTED_CARS.slice(0, FIRST);
  cursor = VISIBLE_CARS.length;

 renderCars(VISIBLE_CARS, latestGrid, { append: !reset }); // reset=true olanda replace, sonra append


}

function loadMore() {
  const next = SORTED_CARS.slice(cursor, cursor + NEXT);
  if (!next.length) return;

  VISIBLE_CARS = VISIBLE_CARS.concat(next);
  cursor += next.length;

  renderCars(next, carsGrid, true);

}
// ===== INIT =====
// applyDefaultSort();
// resetPager();
// ===== INFINITE SCROLL =====


// if (pagerSentinel) {
//   const io = new IntersectionObserver(([entry]) => {
//     if (!entry.isIntersecting) return;

//     // ✅ HOME-da ONLY latest artır
//     if (document.getElementById("latestGrid")) {
//       // sənin latest-only IIFE-də loadMore var idi:
//       // onu window-a çıxarmışdın/çıxarmamısansa aşağıda deyəcəm
//       if (typeof window.__latestLoadMore === "function") window.__latestLoadMore();
//       return;
//     }

//     // digər səhifələrdə dual varsa, onu işlət
//     if (typeof loadMoreDual === "function") loadMoreDual();
//     else if (typeof loadMore === "function") loadMore();
//   }, { rootMargin: "250px 0px" });

// }

(function () {
  const modal = document.querySelector(".notify-modal");
  const openBtn = document.getElementById("notifyBtn");

  if (!modal || !openBtn) {
    console.warn("[NotifyModal] modal və ya notifyBtn tapılmadı");
    return;
  }

  function openModal() {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.documentElement.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.documentElement.style.overflow = "";
  }

  // Aç
  openBtn.addEventListener("click", (e) => {
    e.preventDefault();
    openModal();
  });

  // Bağla (overlay, X, Ləğv et)
  modal.addEventListener("click", (e) => {
    if (
      e.target.classList.contains("notify-modal__overlay") ||
      e.target.classList.contains("notify-modal__close") ||
      e.target.closest(".js-notify-close")
    ) {
      closeModal();
    }
  });

  // ESC ilə bağla
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });
})();

// ====== CarAll - Dynamic filter selects (brand->model + city + color) ======

(function () {
  const $ = (s, r = document) => r.querySelector(s);

  function fillSelectOptions(selectEl, items, placeholder = "Hamısı") {
    if (!selectEl) return;

    const esc = (s) => String(s).replaceAll('"', "&quot;");

    const opts = [
      `<option value="">${placeholder}</option>`,
      ...(items || []).map((v) => `<option value="${esc(v)}">${v}</option>`),
    ];

    selectEl.innerHTML = opts.join("");
  }

  function normalizeBrand(b) {
    b = (b || "").trim();

    // səndə "Mercedes" gəlirsə, datada "Mercedes-Benz" ola bilər – uyğunlaşdırırıq
    if (b.toLowerCase() === "mercedes") return "Mercedes-Benz";
    return b;
  }

  function getGlobals() {
    // carData.js-də bunları window-a çıxartmışdıq:
    // window.CARALL_BRAND_MODELS / window.CARALL_COLORS / window.CARALL_CITIES
    const BRAND_MODELS = window.CARALL_BRAND_MODELS || window.BRAND_MODELS || {};
    const COLORS = window.CARALL_COLORS || window.COLORS || [];
    const CITIES = window.CARALL_CITIES || window.CITIES || [];

    return { BRAND_MODELS, COLORS, CITIES };
  }

  function initFilterSelects() {
    const brandSel = $("#brandSelect");
    const modelSel = $("#modelSelect");
    const citySel = $("#citySelect");
    const colorSel = $("#colorSelect");

    const { BRAND_MODELS, COLORS, CITIES } = getGlobals();

    // Debug üçün (istəsən silə bilərsən)
    // console.log("BRAND_MODELS keys:", Object.keys(BRAND_MODELS));
    // console.log("COLORS:", COLORS);
    // console.log("CITIES:", CITIES);

    // 1) Brand select doldur
    if (brandSel) {
      const brands = Object.keys(BRAND_MODELS);
      fillSelectOptions(brandSel, brands, "Hamısı");
    }

    // 2) City & Color doldur
    if (citySel) fillSelectOptions(citySel, CITIES, "Hamısı");
    if (colorSel) fillSelectOptions(colorSel, COLORS, "Hamısı");

    // 3) Model select: brand-ə bağlı
    function refreshModels() {
      if (!modelSel) return;

      const b = normalizeBrand(brandSel ? brandSel.value : "");
      const models = (BRAND_MODELS && BRAND_MODELS[b]) ? BRAND_MODELS[b] : [];

      fillSelectOptions(modelSel, models, "Hamısı");
      modelSel.disabled = !b; // marka yoxdursa model bağlı qalsın
    }

    if (brandSel && modelSel) {
      brandSel.addEventListener("change", refreshModels);
      refreshModels(); // ilk açılışda da işləsin
    }

    // 4) Min/Max validasiya (opsional, amma faydalı)
    const minYear = $("#minYear");
    const maxYear = $("#maxYear");
    const minPrice = $("#minPrice");
    const maxPrice = $("#maxPrice");

    function clampMinMax(minEl, maxEl) {
      if (!minEl || !maxEl) return;
      const minV = Number(minEl.value);
      const maxV = Number(maxEl.value);
      if (!Number.isNaN(minV) && !Number.isNaN(maxV) && minV > maxV) {
        // min > max olarsa, max-ı min-ə bərabər edirik
        maxEl.value = String(minV);
      }
    }

    if (minYear && maxYear) {
      minYear.addEventListener("input", () => clampMinMax(minYear, maxYear));
      maxYear.addEventListener("input", () => clampMinMax(minYear, maxYear));
    }

    if (minPrice && maxPrice) {
      minPrice.addEventListener("input", () => clampMinMax(minPrice, maxPrice));
      maxPrice.addEventListener("input", () => clampMinMax(minPrice, maxPrice));
    }

    // 5) Əgər datalar boşdursa xəbərdar et (debug üçün)
    if (brandSel && Object.keys(BRAND_MODELS).length === 0) {
      console.warn("[CarAll] BRAND_MODELS boşdur. carData.js əvvəl yüklənməlidir.");
    }
    if (citySel && (!Array.isArray(CITIES) || CITIES.length === 0)) {
      console.warn("[CarAll] CITIES boşdur.");
    }
    if (colorSel && (!Array.isArray(COLORS) || COLORS.length === 0)) {
      console.warn("[CarAll] COLORS boşdur.");
    }
  }

  document.addEventListener("DOMContentLoaded", initFilterSelects);
})();

function resetPagerDual(){
  premCursor = 0;
  lateCursor = 0;

  if (premiumGrid) premiumGrid.innerHTML = "";
  if (latestGrid)  latestGrid.innerHTML  = "";

  // ilk porsiya: əvvəl premiumdan doldur, çatmasa latestdən tamamla
  loadChunk(FIRST, { reset: true });
}

function loadMoreDual(){
  loadChunk(NEXT, { reset: false });
}

function loadChunk(count, { reset }){
  let need = count;

  // 1) Premium/VIP-dən götür
  const prem = PREMIUM_CARS.slice(premCursor, premCursor + need);
  if (prem.length){
    renderCars(prem, premiumGrid, { append: !reset });
    premCursor += prem.length;
    need -= prem.length;
  }

  // 2) Qalanı Son elandan götür
  if (need > 0){
    const lat = LATEST_CARS.slice(lateCursor, lateCursor + need);
    if (lat.length){
      renderCars(lat, latestGrid); // latest həmişə append
      lateCursor += lat.length;
      need -= lat.length;
    }
  }

  // Heç nə gəlmirsə: dayan
  // (istəsən sentinelText-i dəyişərik)
}
// =============================
// HOME: VIP/Premium + Son elanlar render
// =============================
// document.addEventListener("DOMContentLoaded", () => {
//   const premGrid = document.getElementById("premiumGrid");
//   const lateGrid = document.getElementById("latestGrid");

//   // səndə data hardadısa, burdan götürür:
//   const ALL = window.ALL_CARS || window.CARS || window.cars || [];
//   if (!ALL.length) return;

//   // ✅ VIP/Premium: yalnız adType 2 və 3
//   const vipPremium = ALL.filter(c => c && (c.adType === 2 || c.adType === 3));

//   // ✅ Son elanlar: yenilər yuxarı
//   const latest = ALL.slice().sort((a,b)=> (b.createdAt || b.id || 0) - (a.createdAt || a.id || 0));

//   // 1) VIP/Premium ilk 8
//   if (premGrid) renderCars(vipPremium.slice(0, 8), premGrid, false);

//   // 2) Son elanlar ilk 8
//   if (lateGrid) renderCars(latest.slice(0, 8), lateGrid, false);

//   // Hamısına bax (sadəcə scroll eləsin)
//   document.getElementById("vipMore")?.addEventListener("click", (e) => {
//     e.preventDefault();
//     document.getElementById("vipBlock")?.scrollIntoView({ behavior: "smooth", block:"start" });
//   });

//   document.getElementById("latestMore")?.addEventListener("click", (e) => {
//     e.preventDefault();
//     document.getElementById("latestBlock")?.scrollIntoView({ behavior: "smooth", block:"start" });
//   });
// });

// =============================
// VIP/PREMIUM PAGER (infinite for VIP block)
// =============================
document.addEventListener("DOMContentLoaded", () => {
  const premGrid = document.getElementById("premiumGrid");
  const vipSentinel = document.getElementById("vipSentinel");
  const vipText = document.getElementById("vipSentinelText");

  const ALL = window.ALL_CARS || window.CARS || window.cars || [];
  if (!premGrid || !vipSentinel || !ALL.length) return;

  // yalnız adType source of truth
  const VIP_ALL = ALL.filter(c => c && (c.adType === 2 || c.adType === 3));

  const FIRST = 8;
  const NEXT = 8;
  let cursor = 0;

  function setVipLoading(on) {
    if (!vipText) return;
    vipText.innerHTML = on ? "Yüklənir…" : "";
  }

  function renderFirst() {
    premGrid.innerHTML = "";
    cursor = 0;

    const first = VIP_ALL.slice(0, FIRST);
    cursor = first.length;

    renderCars(first, premGrid, false);

    // əgər hamısı bitibsə sentinel boş qalsın
    if (cursor >= VIP_ALL.length) {
      setVipLoading(false);
      return;
    }

    setVipLoading(false);
  }

  function loadMoreVip() {
    if (cursor >= VIP_ALL.length) return;

    setVipLoading(true);

    // kiçik delay – UX üçün
    setTimeout(() => {
      const next = VIP_ALL.slice(cursor, cursor + NEXT);
      cursor += next.length;

      // ✅ append
      renderCars(next, premGrid, true);

      setVipLoading(false);
    }, 150);
  }

  // start render
  renderFirst();

  // infinite observer
  const io = new IntersectionObserver(
    ([entry]) => {
      if (!entry || !entry.isIntersecting) return;
      loadMoreVip();
    },
    { rootMargin: "400px 0px" }
  );

  io.observe(vipSentinel);
});
// ===============================
// HOME FORCE FIX (no renderCars edits)
// ===============================
(function HOME_FORCE_FIX(){
  const latestSel  = "#latestGrid";
  const premSel    = "#premiumGrid";
  const vipSel     = "#vipGrid";

  const BATCH_LIMIT = 5; // renderCars hard-limit 5 olsa da, batch-larla dolduracağıq
  let applying = false;
  let lastSig = "";

  function qs(s){ return document.querySelector(s); }

  function buckets(allCars){
    return {
      latest:  allCars.filter(x => String(x.adType) === "1"),
      premium: allCars.filter(x => String(x.adType) === "2"),
      vip:     allCars.filter(x => String(x.adType) === "3"),
    };
  }

  // renderCars() 5-dən artıq basmırsa, batch-larla bas
  function renderCarsInBatches(list, grid, batch = BATCH_LIMIT){
    if (!grid) return;
    grid.innerHTML = "";
    for (let i = 0; i < list.length; i += batch) {
      const chunk = list.slice(i, i + batch);
      renderCars(chunk, grid, { append: i > 0 });
    }
  }

  function forceRender(){
    if (applying) return;
    const allCars = window.ALL_CARS;
    if (!Array.isArray(allCars) || allCars.length === 0) return;

    const latestGrid = qs(latestSel);
    const premGrid   = qs(premSel);
    const vipGrid    = qs(vipSel);

    if (!latestGrid && !premGrid && !vipGrid) return;

    const { latest, premium, vip } = buckets(allCars);

    // signature: data+dom vəziyyəti eynidirsə boşuna təkrar etməsin
    const sig = [
      allCars.length,
      latest.length, premium.length, vip.length,
      latestGrid ? latestGrid.querySelectorAll(".cardlink").length : -1,
      premGrid   ? premGrid.querySelectorAll(".cardlink").length   : -1
    ].join("|");

    if (sig === lastSig) return;
    lastSig = sig;

    applying = true;

    // Burada köhnə DOM-u öldürürük və düzgün render edirik
    if (latestGrid) renderCarsInBatches(latest, latestGrid);
    if (premGrid)   renderCarsInBatches(premium, premGrid);
    if (vipGrid)    renderCarsInBatches(vip, vipGrid);

    console.log("[HOME_FORCE_FIX] rendered:",
      "ALL", allCars.length,
      "latest", latest.length,
      "premium", premium.length,
      "vip", vip.length,
      "DOM latest", latestGrid ? latestGrid.querySelectorAll(".cardlink").length : 0,
      "DOM premium", premGrid ? premGrid.querySelectorAll(".cardlink").length : 0
    );

    applying = false;
  }

  // 1) Data hazır olan kimi render et
  const wait = setInterval(() => {
    if (Array.isArray(window.ALL_CARS) && window.ALL_CARS.length) {
      clearInterval(wait);
      forceRender();
    }
  }, 50);
  setTimeout(() => clearInterval(wait), 8000);

  // 2) Köhnə kod sonradan DOM-u dəyişsə, yenə düzəlt
  const obsTargets = [qs(latestSel), qs(premSel), qs(vipSel)].filter(Boolean);
  if (obsTargets.length) {
    const mo = new MutationObserver(() => {
      // debounce kimi: eyni anda çox dəyişiklik gələndə 1 dəfə işləsin
      setTimeout(forceRender, 0);
    });
    obsTargets.forEach(el => mo.observe(el, { childList: true, subtree: true }));
  }

  // 3) Scroll/resize zamanı köhnə kod “yenidən yazırsa” yenə düzəlt
  window.addEventListener("scroll", () => setTimeout(forceRender, 0), { passive: true });
  window.addEventListener("resize", () => setTimeout(forceRender, 0));
})();

(() => {
  const latestGrid = document.querySelector("#latestGrid");
  if (!latestGrid) return; // home deyil

  const PAGE_SIZE = 8;

  let latestList = [];
  let cursor = 0;
  let busy = false;
  const rendered = new Set();

  function getType1List() {
    // SƏN DEDİN: 2 və 3 premium/vip çıxır, yalnız type=1 qalır
    return (window.ALL_CARS || []).filter(x => String(x.adType) === "1");
  }

  function resetAndFirstRender() {
    latestList = getType1List();
    cursor = 0;
    busy = false;
    rendered.clear();

    latestGrid.innerHTML = "";
    loadMore(); // ilk 8
  }

  function loadMore() {
    if (busy) return;
    busy = true;

    const chunk = latestList.slice(cursor, cursor + PAGE_SIZE);

    // dedupe by id (təhlükəsizlik)
    const safe = chunk.filter(c => {
      const id = String(c.id);
      if (rendered.has(id)) return false;
      rendered.add(id);
      return true;
    });

    // ilk dəfə append=false, sonra true
    const isAppend = cursor > 0;
    renderCars(safe, latestGrid, isAppend);

    cursor += chunk.length;
    busy = false;

    // istəsən düyməni gizlət:
    // if (cursor >= latestList.length) moreBtn.style.display = "none";
  }

  // Data hazır olan kimi işə sal (paper.js gec doldurur deyə)
  const wait = setInterval(() => {
    if (Array.isArray(window.ALL_CARS) && window.ALL_CARS.length) {
      clearInterval(wait);
      // tək dəfə init
      if (window.__HOME_LATEST_INIT__) return;
      window.__HOME_LATEST_INIT__ = true;

      resetAndFirstRender();
    }
  }, 50);
  setTimeout(() => clearInterval(wait), 8000);

  // “Hamısına bax” düyməsini bağla:
  // 1) Əgər səndə id varsa, buranı birbaşa yaz:
  const moreBtn =
    document.querySelector("#latestMore") || // varsa ideal budur
    (() => {
      // id yoxdursa: latestGrid-in yaxınlığında "Hamısına bax" tapmağa çalışır
      const sec = latestGrid.closest("section") || latestGrid.parentElement;
      if (!sec) return null;
      return Array.from(sec.querySelectorAll("a,button"))
        .find(el => (el.textContent || "").trim().toLowerCase().includes("hamısına bax"));
    })();

  if (moreBtn) {
    moreBtn.addEventListener("click", (e) => {
      e.preventDefault();
      loadMore(); // 8-8 artır
    });
  }

  // Debug üçün istəsən:
  // window.__latestLoadMore = loadMore;
})();
document.addEventListener("DOMContentLoaded", () => {
    const a = document.getElementById("latestMore");
    if (!a) return;

    a.addEventListener("click", (e) => {
      // digər JS-lər tutmasın
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      // məcburi yönləndir
      location.href = a.getAttribute("href") || "latest.html";
    }, true); // ✅ CAPTURE: hamısından əvvəl işləsin
  });
  /* =========================
   CarAll — LATEST SMART GUARD (keeps pagination even if a 5-item script renders first)
   - latestGrid: allow replace if it improves (list bigger than current DOM)
   - block only "worse" overwrites
   - dedupe only on append
   ========================= */
(function LATEST_SMART_GUARD(){
  if (window.__LATEST_SMART_GUARD__) return;
  window.__LATEST_SMART_GUARD__ = true;

  const orig = window.renderCars;
  if (typeof orig !== "function") return;

  const seen = new Set();

  function domCount(grid){
    try { return grid.querySelectorAll(".cardlink").length; } catch { return 0; }
  }

  window.renderCars = function(list, targetEl = null, append = false){
    if (append && typeof append === "object") append = !!append.append;

    const grid = targetEl || document.getElementById("carsGrid");
    const isLatest = grid && grid.id === "latestGrid";
    if (!isLatest) return orig.apply(this, arguments);

    const incomingLen = Array.isArray(list) ? list.length : 0;

    // ✅ REPLACE (append=false): allow only if it "improves" current grid
    if (!append) {
      const cur = domCount(grid);

      // Əgər grid boşdursa -> burax
      // Əgər incoming daha çoxdursa (məs: 8 gəlib 5-i əvəz edir) -> burax
      // Əks halda (məs: 5 gəlib 8-i əvəz etmək istəyir) -> BLOK
      if (cur > 0 && incomingLen > 0 && incomingLen < cur) {
        console.warn("[LATEST] blocked smaller overwrite:", incomingLen, "<", cur);
        return;
      }

      // seen doldur (append-də dup olmasın)
      seen.clear();
      (Array.isArray(list) ? list : []).forEach(c => {
        const id = String(c?.id ?? "");
        if (id) seen.add(id);
      });

      return orig.call(this, list, grid, false);
    }

    // ✅ APPEND: dedupe
    const safe = (Array.isArray(list) ? list : []).filter(c => {
      const id = String(c?.id ?? "");
      if (!id) return false;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    if (!safe.length) return;
    return orig.call(this, safe, grid, true);
  };
})();
(function HOME_LATEST_SCROLL_FIX(){
  if (window.__HOME_LATEST_SCROLL_FIX__) return;
  window.__HOME_LATEST_SCROLL_FIX__ = true;

  const grid = document.getElementById("latestGrid");
  const sentinel = document.getElementById("pagerSentinel");
  if (!grid || !sentinel) return;

  const PAGE = 8;
  let list = [];
  let cursor = 0;
  let busy = false;

  const getAll = () => window.ALL_CARS || window.CARS || window.cars || [];

  const build = () => {
    const all = getAll();
    if (!Array.isArray(all) || !all.length) return [];
    return all
      .filter(x => String(x?.adType) === "1")
      .sort((a,b)=> (b.createdAt || b.id || 0) - (a.createdAt || a.id || 0));
  };

  function renderNext(){
    if (busy) return;
    busy = true;

    if (!list.length) list = build();

    const chunk = list.slice(cursor, cursor + PAGE);
    if (!chunk.length) { busy = false; return; }

    renderCars(chunk, grid, { append: cursor > 0 });
    cursor += chunk.length;

    busy = false;
  }

  // first
  const wait = setInterval(()=>{
    if (getAll().length){
      clearInterval(wait);
      grid.innerHTML = "";
      list = build();
      cursor = 0;
      renderNext();
    }
  }, 50);
  setTimeout(()=>clearInterval(wait), 8000);

  new IntersectionObserver(([e])=>{
    if (e?.isIntersecting) renderNext();
  }, { rootMargin:"450px 0px" }).observe(sentinel);
})();

document.addEventListener("DOMContentLoaded", () => {
  const y = document.getElementById("footerYear");
  if (y) y.textContent = new Date().getFullYear();
});
