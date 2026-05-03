  /* =========================
    CarAll - FIXED script.js
    - VIP/Premium backend-dən çəkilir
    - Infinite scroll aktiv
    - Təkrar dəyişənlər silindi
    - DOMContentLoaded birləşdirildi
  ========================= */

  // ============================
  // GLOBAL TSEL MANAGER
  // ============================
  (function TSEL_GLOBAL_MANAGER() {
    if (window.__TSEL_GLOBAL_MANAGER__) return;
    window.__TSEL_GLOBAL_MANAGER__ = true;

    function closeAll(exceptWrap) {
      document.querySelectorAll(".tsel.is-open").forEach((w) => {
        if (exceptWrap && w === exceptWrap) return;
        w.classList.remove("is-open");
      });
    }

    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".tsel__btn");
      if (!btn) return;
      const wrap = btn.closest(".tsel");
      if (!wrap) return;
      closeAll(wrap);
    }, true);

    document.addEventListener("click", (e) => {
      if (e.target.closest(".tsel")) return;
      closeAll(null);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeAll(null);
    });
  })();

  // ===== Favorites =====
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

  // ===== Helpers =====
  const $ = (id) => document.getElementById(id);
  const exists = (x) => x !== null && x !== undefined && String(x).trim() !== "";

  function pad2(n) { return String(n).padStart(2, "0"); }
  function formatDMY(d) {
    return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}`;
  }

  function pickCarDateValue(car) {
    if (!car || typeof car !== "object") return null;
    const keys = ["postedAt", "createdAt", "updatedAt", "posted_at", "created_at", "updated_at", "date", "publishDate", "createdDate"];
    for (const k of keys) {
      const v = car[k];
      if (v !== null && v !== undefined && String(v).trim() !== "") return v;
    }
    return null;
  }

  function parseCarDate(raw) {
    if (raw === null || raw === undefined) return null;
    const sraw = String(raw).trim();
    if (/^\d{10,13}$/.test(sraw)) {
      const n = Number(sraw);
      const ms = sraw.length === 10 ? n * 1000 : n;
      const d = new Date(ms);
      return Number.isNaN(d.getTime()) ? null : d;
    }
    const m1 = sraw.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (m1) {
      const dd = Number(m1[1]), mm = Number(m1[2]), yy = Number(m1[3]);
      const d = new Date(yy, mm - 1, dd);
      if (d.getFullYear() === yy && d.getMonth() === mm - 1 && d.getDate() === dd) return d;
      return null;
    }
    const m2 = sraw.match(/^(\d{4})[-/](\d{2})[-/](\d{2})/);
    if (m2) {
      const yy = Number(m2[1]), mm = Number(m2[2]), dd = Number(m2[3]);
      const d = new Date(yy, mm - 1, dd);
      if (d.getFullYear() === yy && d.getMonth() === mm - 1 && d.getDate() === dd) return d;
      return null;
    }
    const d = new Date(sraw);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  function getCarDateLabel(car) {
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
    ({ AZ: "Azərbaycan", TR: "Türkiyə", GE: "Gürcüstan", DE: "Almaniya" }[code] || code);

  // ===== Elements =====
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
  const premiumGrid  = $("premiumGrid");
  const latestGrid   = $("latestGrid");
  const equipChipsWrap = $("equipChips");

  const yearNowEl = $("yearNow");
  if (yearNowEl) yearNowEl.textContent = new Date().getFullYear();

  // ===== API =====
  const API_BASE = "https://carall.az/api";

  // ===== Pager state — YALNIZ 1 DƏFƏ =====
  let currentPage = 1;
  const pageSize = 8;
  let isLoading = false;
  let hasMore = true;
  let currentFilterBody = null;

  // ===== mapListing — YALNIZ 1 DƏFƏ =====
  function mapListing(x) {
    return {
      id: x.id,
      brand: x.brand || x.makeName || x.brandName || x.make?.name || "—",
      model: x.model || x.modelName || x.model?.name || "—",
      price: x.price || 0,
      year: x.year || "—",
      city: x.city || x.cityName || x.city?.name || "—",
      img: x.img || x.image || x.mainImage || x.mainPhotoUrl || x.imageUrl || "images/no-image.png",
      mileage: x.mileage || x.odometerReading || 0,
      fuel: x.fuel || x.fuelTypeName || x.fuelType?.name || "",
      gearbox: x.gearbox || x.transmissionType || x.transmissionName || x.transmission?.type || "",
      country: x.country || x.countryCode || "AZ",
      adType: x.adType || x.listingType || 1,
      createdAt: x.createdAt || x.createdDate || x.postedAt
    };
  }

  // ===== Render cards =====
  function renderCars(list, targetEl = null, append = false) {
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

    const html = list.map((car) => {
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
                  ${car.adType === 2 ? `<span class="badge vip">⭐</span>` : ""}
                  ${car.adType === 3 ? `<span class="badge premium">👑</span>` : ""}
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
                  <div class="card__date">${getCarDateLabel(car)}</div>
                </div>
              </div>
            </div>
          </article>
        </a>
      `;
    }).join("");

    if (append) grid.insertAdjacentHTML("beforeend", html);
    else grid.innerHTML = html;
  }

  // ===== emptyFilter helper — schema-ya uyğun =====
  function emptyFilter() {
    return {
      brandIds: [],
      modelIds: [],
      cityIds: [],
      vehicleTypeIds: [],
      fuelTypeIds: [],
      colorIds: [],
      engineVolumeIds: [],
      transmissionIds: [],
      typeOfRoofIds: [],
      assembledForIds: [],
      statuses: [],
      valutas: [],
      accessoryIds: [],
      minPrice: 0, maxPrice: 0,
      minYear: 0, maxYear: 0,
      minOwnersCount: 0, maxOwnersCount: 0,
      minOdometerReading: 0, maxOdometerReading: 0,
      minDoor: 0, maxDoor: 0,
      minNoOfPassenger: 0, maxNoOfPassenger: 0,
      minEnginePower: 0, maxEnginePower: 0,
      isVip: null,
      isPremium: null,
      isCredit: null,
      isBarter: null,
      isShowroom: null,
      createdFrom: null,
      createdTo: null,
      includeTotalCount: false
    };
  }

  // ===== VIP/Premium — backend-dən çək (həm VIP həm Premium) =====
  async function loadVipPremium() {
    const grid = $("premiumGrid");
    const block = $("premiumBlock");
    if (!grid) return;

    try {
      // ✅ Paralel olaraq həm VIP həm Premium çək
      const [vipRes, premRes] = await Promise.all([
        fetch(`${API_BASE}/Listings/full_filter`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({
            ...emptyFilter(),
            isVip: true,
            isPremium: null,
            sort: "new", page: 1, pageSize: 8
          })
        }),
        fetch(`${API_BASE}/Listings/full_filter`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({
            ...emptyFilter(),
            isVip: null,
            isPremium: true,
            sort: "new", page: 1, pageSize: 8
          })
        })
      ]);

      const vipData  = vipRes.ok  ? await vipRes.json()  : { data: [] };
      const premData = premRes.ok ? await premRes.json() : { data: [] };

      const vipList  = (vipData.data  || vipData.items  || []).map(mapListing);
      const premList = (premData.data || premData.items || []).map(mapListing);

      // ✅ Birləşdir, dublikatları təmizlə
      const seen = new Set();
      const combined = [...vipList, ...premList].filter((x) => {
        if (seen.has(x.id)) return false;
        seen.add(x.id);
        return true;
      });

      if (!combined.length) {
        if (block) block.style.display = "none";
        return;
      }

      if (block) block.style.display = "";
      renderCars(combined, grid, false);

    } catch (err) {
      console.error("VIP/PREMIUM LOAD ERROR:", err);
      if (block) block.style.display = "none";
    }
  }

  // ===== buildFilterBody — YALNIZ 1 DƏFƏ =====
  function buildFilterBody(page = 1) {
    const arr = (v) => v ? [Number(v)] : [];

    const selectedAccessories = Array.from(
      document.querySelectorAll("#equipChips .chip.is-on")
    ).map((el) => Number(el.dataset.id));

    return {
      brandIds: arr(qBrand?.value),
      modelIds: arr(qModel?.value),
      cityIds: arr(qCity?.value),
      vehicleTypeIds: arr(document.getElementById("qBody")?.value),
      fuelTypeIds: arr(document.getElementById("qFuel")?.value),
      colorIds: arr(document.getElementById("qColor")?.value),
      engineVolumeIds: arr(document.getElementById("qEngineVolume")?.value),
      transmissionIds: arr(document.getElementById("qGearbox")?.value),
      typeOfRoofIds: arr(document.getElementById("qCondition")?.value),
      accessoryIds: selectedAccessories,
      minPrice: qMinPrice?.value ? Number(qMinPrice.value) : 0,
      maxPrice: qMaxPrice?.value ? Number(qMaxPrice.value) : 0,
      minYear: qYear?.value ? Number(qYear.value) : 0,
      maxYear: qYearMax?.value ? Number(qYearMax.value) : 0,
      minOwnersCount: 0, maxOwnersCount: 0,
      driveType: null,
      minOdometerReading: 0, maxOdometerReading: 0,
      minDoor: 0, maxDoor: 0,
      minNoOfPassenger: 0, maxNoOfPassenger: 0,
      minEnginePower: 0, maxEnginePower: 0,
      assembledForIds: [],
      statuses: [],
      valutas: [],
      isVip: null, isPremium: null,
      isCredit: null, isBarter: null, isShowroom: null,
      createdFrom: null, createdTo: null,
      sort: sortBy?.value || "new",
      page,
      pageSize,
      includeTotalCount: true
    };
  }

  // ===== loadListingsFromBackend — YALNIZ 1 DƏFƏ =====
  async function loadListingsFromBackend({ reset = false } = {}) {
    if (isLoading || (!hasMore && !reset)) return;

    isLoading = true;

    if (reset) {
      currentPage = 1;
      hasMore = true;
      currentFilterBody = buildFilterBody(1);
    }

    const body = {
      ...(currentFilterBody || buildFilterBody(currentPage)),
      page: currentPage,
      pageSize
    };

    try {
      const res = await fetch(`${API_BASE}/Listings/full_filter`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        console.error("LISTINGS API ERROR:", res.status);
        return;
      }

      const result = await res.json();
      const raw = result.data || result.items || result.listings || [];
      console.log("INDEX RAW:", raw);

      const mapped = raw.map(mapListing);
      console.log("INDEX MAPPED:", mapped);

      const grid = latestGrid || document.getElementById("carsGrid");
      renderCars(mapped, grid, !reset);

      if (mapped.length < pageSize) {
        hasMore = false;
      } else {
        currentPage++;
      }

    } catch (err) {
      console.error("BACKEND LISTINGS ERROR:", err);
    } finally {
      isLoading = false;
    }
  }

  async function loadAllListings({ reset = false } = {}) {
  if (isLoading || (!hasMore && !reset)) return;
  isLoading = true;

  if (reset) {
    currentPage = 1;
    hasMore = true;
  }

  try {
    const res = await fetch(`${API_BASE}/Listings/cards?page=${currentPage}&pageSize=${pageSize}`);

    if (!res.ok) {
      console.error("LISTINGS GET ERROR:", res.status);
      return;
    }

    const result = await res.json();
    const raw = result.data || result.items || result || [];
    const mapped = raw.map(mapListing);

    const grid = latestGrid || document.getElementById("carsGrid");
    renderCars(mapped, grid, !reset);

    if (mapped.length < pageSize) hasMore = false;
    else currentPage++;

  } catch (err) {
    console.error("GET LISTINGS ERROR:", err);
  } finally {
    isLoading = false;
  }
}

  async function applyFilters() {
    await loadListingsFromBackend({ reset: true });
  }

  // ===== ✅ INFINITE SCROLL — AKTİV =====
  function initInfiniteScroll() {
    const sentinel = document.getElementById("pagerSentinel");
    if (!sentinel) return;

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !isLoading && hasMore) {
        loadListingsFromBackend({ reset: false });
      }
    }, { rootMargin: "300px 0px" });

    io.observe(sentinel);
  }

  // ===== API Loaders =====
  async function loadMakesFromApi() {
    if (!qBrand) return;
    try {
      const res = await fetch(`${API_BASE}/lookups/makes`);
      const data = await res.json();
      qBrand.innerHTML =
        `<option value="">Hamısı</option>` +
        data.map((m) => `<option value="${m.id}">${m.name}</option>`).join("");
      if (qModel) {
        qModel.innerHTML = `<option value="">Hamısı</option>`;
        qModel.disabled = true;
      }
    } catch (err) { console.error("MAKES ERROR:", err); }
  }

  async function loadModelsFromApi(makeId) {
    if (!qModel) return;
    if (!makeId) {
      qModel.innerHTML = `<option value="">Hamısı</option>`;
      qModel.disabled = true;
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/lookups/models/${makeId}`);
      const data = await res.json();
      qModel.innerHTML =
        `<option value="">Hamısı</option>` +
        data.map((m) => `<option value="${m.id}">${m.name}</option>`).join("");
      qModel.disabled = false;
    } catch (err) { console.error("MODELS ERROR:", err); }
  }

  async function loadVehicleTypesFromApi() {
    const el = document.getElementById("qBody");
    if (!el) return;
    try {
      const res = await fetch(`${API_BASE}/lookups/vehicle-types`);
      const data = await res.json();
      el.innerHTML = `<option value="">Hamısı</option>` + data.map((x) => `<option value="${x.id}">${x.name}</option>`).join("");
    } catch (err) { console.error("VEHICLE TYPES ERROR:", err); }
  }

  async function loadFuelTypesFromApi() {
    const el = document.getElementById("qFuel");
    if (!el) return;
    try {
      const res = await fetch(`${API_BASE}/lookups/fuel-types`);
      const data = await res.json();
      el.innerHTML = `<option value="">Hamısı</option>` + data.map((x) => `<option value="${x.id}">${x.name}</option>`).join("");
    } catch (err) { console.error("FUEL TYPES ERROR:", err); }
  }

  async function loadColorsFromApi() {
    const el = document.getElementById("qColor");
    if (!el) return;
    try {
      const res = await fetch(`${API_BASE}/lookups/colors`);
      const data = await res.json();
      el.innerHTML = `<option value="">Hamısı</option>` + data.map((x) => `<option value="${x.id}">${x.name}</option>`).join("");
    } catch (err) { console.error("COLORS ERROR:", err); }
  }

  async function loadCountriesFromApi() {
    if (!qCountry) return;
    try {
      const res = await fetch(`${API_BASE}/lookups/countries`);
      const data = await res.json();
      qCountry.innerHTML = `<option value="">Hamısı</option>` + data.map((x) => `<option value="${x.id}">${x.name}</option>`).join("");
    } catch (err) { console.error("COUNTRIES ERROR:", err); }
  }

  async function loadCitiesFromApi(countryId) {
    if (!qCity) return;
    if (!countryId) {
      qCity.innerHTML = `<option value="">Hamısı</option>`;
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/lookups/countries/${countryId}/cities`);
      const data = await res.json();
      qCity.innerHTML = `<option value="">Hamısı</option>` + data.map((x) => `<option value="${x.id}">${x.name}</option>`).join("");
    } catch (err) { console.error("CITIES ERROR:", err); }
  }

  async function loadTransmissionsFromApi() {
    const el = document.getElementById("qGearbox");
    if (!el) return;
    try {
      const res = await fetch(`${API_BASE}/lookups/transmissions`);
      const data = await res.json();
      el.innerHTML = `<option value="">Hamısı</option>` + data.map((x) => `<option value="${x.id}">${x.type}</option>`).join("");
    } catch (err) { console.error("TRANSMISSIONS ERROR:", err); }
  }

  async function loadEngineVolumesFromApi() {
    const el = document.getElementById("qEngineVolume");
    if (!el) return;
    try {
      const res = await fetch(`${API_BASE}/lookups/engine-volumes`);
      const data = await res.json();
      el.innerHTML = `<option value="">Hamısı</option>` + data.map((x) => `<option value="${x.id}">${x.power}</option>`).join("");
    } catch (err) { console.error("ENGINE VOLUMES ERROR:", err); }
  }

  async function loadAssembledFromApi() {
    const el = document.getElementById("qAssembled");
    if (!el) return;
    try {
      const res = await fetch(`${API_BASE}/lookups/assembled-for`);
      const data = await res.json();
      el.innerHTML = `<option value="">Hamısı</option>` + data.map((x) => `<option value="${x.id}">${x.name}</option>`).join("");
    } catch (err) { console.error("ASSEMBLED ERROR:", err); }
  }

  async function loadRoofTypesFromApi() {
    const el = document.getElementById("qCondition");
    if (!el) return;
    try {
      const res = await fetch(`${API_BASE}/lookups/type-of-roofs`);
      const data = await res.json();
      el.innerHTML = `<option value="">Hamısı</option>` + data.map((x) => `<option value="${x.id}">${x.name}</option>`).join("");
    } catch (err) { console.error("ROOF TYPES ERROR:", err); }
  }

  async function loadAccessoriesFromApi() {
    if (!equipChipsWrap) return;
    try {
      const res = await fetch(`${API_BASE}/lookups/accessories`);
      const data = await res.json();
      equipChipsWrap.innerHTML = data.map((x) => `
        <button type="button" class="chip" data-id="${x.id}">${x.name}</button>
      `).join("");
      equipChipsWrap.querySelectorAll(".chip").forEach((btn) => {
        btn.addEventListener("click", () => btn.classList.toggle("is-on"));
      });
    } catch (err) { console.error("ACCESSORIES ERROR:", err); }
  }

  // ===== Advanced panel fields =====
  function ensureAdvFields() {
    const advGrid = document.getElementById("advGrid");
    if (!advGrid || document.getElementById("qColor")) return;

    const mkSelect = (label, id) => {
      const wrap = document.createElement("div");
      wrap.className = "field";
      wrap.innerHTML = `
        <label class="field__label" for="${id}">${label}</label>
        <select class="field__control" id="${id}"></select>
      `;
      return wrap;
    };

    advGrid.appendChild(mkSelect("Mühərrik həcmi", "qEngineVolume"));
    advGrid.appendChild(mkSelect("Rəng", "qColor"));
    advGrid.appendChild(mkSelect("Ban növü", "qBody"));
    advGrid.appendChild(mkSelect("Ötürücü", "qDrive"));
    advGrid.appendChild(mkSelect("Sürətlər qutusu", "qGearbox"));
    advGrid.appendChild(mkSelect("Yanacaq növü", "qFuel"));
    advGrid.appendChild(mkSelect("Hansı bazar üçün yığılıb", "qAssembled"));
    advGrid.appendChild(mkSelect("Vəziyyət", "qCondition"));
    advGrid.appendChild(mkSelect("Sahiblərinin sayı", "qOwners"));
    advGrid.appendChild(mkSelect("Yerlərin sayı", "qSeats"));
  }

  // ===== UI Chips =====
  const UI = {
    condition: "", credit: false, barter: false,
    noHit: false, notPainted: false, onlyCrashed: false,
    selectedEquip: new Set(),
  };

  function setChipOn(el, on) {
    if (!el) return;
    el.classList.toggle("is-on", !!on);
  }

  function updateAllChipUI() {
    setChipOn($("btnCondAll"), UI.condition === "");
    setChipOn($("btnCondNew"), UI.condition === "new");
    setChipOn($("btnCondUsed"), UI.condition === "used");
    setChipOn($("chipCredit"), UI.credit);
    setChipOn($("chipBarter"), UI.barter);
    setChipOn($("chipNoHit"), UI.noHit);
    setChipOn($("chipNotPainted"), UI.notPainted);
    setChipOn($("chipOnlyCrashed"), UI.onlyCrashed);
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
    btnCondAll?.addEventListener("click", () => { UI.condition = ""; updateAllChipUI(); applyFilters(); });
    btnCondNew?.addEventListener("click", () => { UI.condition = "new"; updateAllChipUI(); applyFilters(); });
    btnCondUsed?.addEventListener("click", () => { UI.condition = "used"; updateAllChipUI(); applyFilters(); });

    $("chipCredit")?.addEventListener("click", () => { UI.credit = !UI.credit; updateAllChipUI(); applyFilters(); });
    $("chipBarter")?.addEventListener("click", () => { UI.barter = !UI.barter; updateAllChipUI(); applyFilters(); });
    $("chipNoHit")?.addEventListener("click", () => { UI.noHit = !UI.noHit; updateAllChipUI(); applyFilters(); });
    $("chipNotPainted")?.addEventListener("click", () => { UI.notPainted = !UI.notPainted; updateAllChipUI(); applyFilters(); });
    $("chipOnlyCrashed")?.addEventListener("click", () => { UI.onlyCrashed = !UI.onlyCrashed; updateAllChipUI(); applyFilters(); });
    updateAllChipUI();
  }

  function resetAll() {
    if (qCountry) qCountry.value = "";
    if (qBrand) qBrand.value = "";
    if (qModel) qModel.value = "";
    if (qCity) qCity.value = "";
    if (qMinPrice) qMinPrice.value = "";
    if (qMaxPrice) qMaxPrice.value = "";
    if (qYear) qYear.value = "";
    if (qYearMax) qYearMax.value = "";
    if (sortBy) sortBy.value = "new";
    ["qColor","qBody","qFuel","qDrive","qGearbox","qOwners","qSeats","qAssembled","qCondition"].forEach((id) => {
      const el = $(id); if (el) el.value = "";
    });
    UI.condition = ""; UI.credit = false; UI.barter = false;
    UI.noHit = false; UI.notPainted = false; UI.onlyCrashed = false;
    UI.selectedEquip.clear();
    updateAllChipUI();
    applyFilters();
  }

  // ===== Advanced Panel =====
  const closeAllTurboSelects = () => {
    document.querySelectorAll(".tsel.is-open").forEach((w) => w.classList.remove("is-open"));
  };

  function initAdvancedPanel() {
    const btnAdvanced = $("btnAdvanced");
    const advPanel = $("advPanel");
    const btnAdvancedClose = $("btnAdvancedClose");
    const advApply = $("advApply");
    const advClear = $("advClear");
    if (!btnAdvanced || !advPanel) return;

    const open = () => {
      closeAllTurboSelects();
      advPanel.removeAttribute("hidden");
      advPanel.setAttribute("aria-hidden", "false");
      requestAnimationFrame(() => advPanel.classList.add("is-open"));
    };
    const close = () => {
      advPanel.classList.remove("is-open");
      advPanel.setAttribute("aria-hidden", "true");
      setTimeout(() => advPanel.setAttribute("hidden", ""), 220);
    };
    const toggle = () => {
      const isOpen = advPanel.classList.contains("is-open") && !advPanel.hasAttribute("hidden");
      isOpen ? close() : open();
    };

    btnAdvanced.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); toggle(); });
    btnAdvancedClose?.addEventListener("click", (e) => { e.preventDefault(); close(); });
    advApply?.addEventListener("click", () => { btnSearch?.click(); close(); });
    advClear?.addEventListener("click", () => btnReset?.click());

    document.addEventListener("click", (e) => {
      if (advPanel.hasAttribute("hidden")) return;
      if (e.target.closest("#advPanel") || e.target.closest("#btnAdvanced") || e.target.closest(".tsel")) return;
      close();
    });
  }

  // ===== Hamburger Menu =====
  function initHamburgerMenu() {
    const hamburgerBtn = $("hamburgerBtn");
    const mobileMenu = $("mobileMenu");
    const mobileMenuClose = $("mobileMenuClose");
    const mobileMenuOverlay = $("mobileMenuOverlay");
    if (!hamburgerBtn || !mobileMenu) return;

    const isOpen = () => mobileMenu.classList.contains("is-open");
    const openMenu = () => { mobileMenu.classList.add("is-open"); hamburgerBtn.setAttribute("aria-expanded", "true"); };
    const closeMenu = () => { mobileMenu.classList.remove("is-open"); hamburgerBtn.setAttribute("aria-expanded", "false"); };
    const toggleMenu = () => isOpen() ? closeMenu() : openMenu();

    hamburgerBtn.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); toggleMenu(); });
    mobileMenuClose?.addEventListener("click", (e) => { e.preventDefault(); closeMenu(); });
    mobileMenuOverlay?.addEventListener("click", closeMenu);

    document.addEventListener("click", (e) => {
      if (!isOpen()) return;
      if (e.target.closest("#mobileMenu") || e.target.closest("#hamburgerBtn")) return;
      closeMenu();
    }, true);

    window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });
    mobileMenu.addEventListener("click", (e) => { if (e.target.closest("a, button")) closeMenu(); });
  }

  // ===== TurboSelect =====
  function makeTurboSelect(select, { searchable = true, placeholder = "Seçin", clearText = "Sıfırla" } = {}) {
    if (!select || select.dataset.turboized) return;
    select.dataset.turboized = "1";

    const wrap = document.createElement("div");
    wrap.className = "tsel";
    const btn = document.createElement("button");
    btn.type = "button"; btn.className = "tsel__btn";
    const chev = document.createElement("span");
    chev.className = "tsel__chev"; chev.textContent = "▾";
    const panel = document.createElement("div");
    panel.className = "tsel__panel";
    const search = document.createElement("div");
    search.className = "tsel__search";
    const input = document.createElement("input");
    input.className = "tsel__input"; input.type = "text"; input.placeholder = placeholder;
    const clearBox = document.createElement("div");
    clearBox.className = "tsel__clear";
    const clearRow = document.createElement("div");
    clearRow.className = "tsel__row";
    clearRow.innerHTML = `<span class="tsel__x">×</span> <span>${clearText}</span>`;
    const list = document.createElement("div");
    list.className = "tsel__list";

    if (searchable) { search.appendChild(input); panel.appendChild(search); }
    clearBox.appendChild(clearRow);
    panel.appendChild(clearBox);
    panel.appendChild(list);

    select.parentNode.insertBefore(wrap, select);
    wrap.appendChild(select);
    wrap.appendChild(btn);
    btn.appendChild(chev);
    wrap.appendChild(panel);

    select.style.cssText = "position:absolute;opacity:0;pointer-events:none;height:0;width:0;";

    const getOptions = () => [...select.options].map((o) => ({ value: o.value, label: o.textContent }));

    const setBtnLabel = () => {
      const opts = getOptions();
      const cur = select.value;
      const found = opts.find((x) => x.value === cur);
      btn.textContent = found?.label || opts[0]?.label || "";
      btn.appendChild(chev);
    };

    const renderList = (q = "") => {
      const qq = q.trim().toLowerCase();
      list.innerHTML = "";
      getOptions().forEach((o) => {
        if (qq && !o.label.toLowerCase().includes(qq)) return;
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

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const willOpen = !wrap.classList.contains("is-open");
      closeAllTurboSelects();
      if (willOpen) {
        wrap.classList.add("is-open");
        renderList(input.value);
        setBtnLabel();
        if (searchable) setTimeout(() => { input.focus(); input.select(); }, 0);
      }
    });

    document.addEventListener("click", (e) => { if (!wrap.contains(e.target)) wrap.classList.remove("is-open"); });
    clearRow.addEventListener("click", (e) => {
      e.stopPropagation();
      select.value = ""; select.dispatchEvent(new Event("change", { bubbles: true }));
      input.value = ""; setBtnLabel(); renderList(""); wrap.classList.remove("is-open");
    });
    input.addEventListener("input", () => renderList(input.value));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") wrap.classList.remove("is-open"); });

    new MutationObserver(() => { setBtnLabel(); renderList(input.value); }).observe(select, { childList: true, subtree: true });
    setBtnLabel();
  }

  function initTurboSelects() {
    document.querySelectorAll("#advPanel select, .filters select, select.sort")
      .forEach((sel) => makeTurboSelect(sel, { searchable: true, placeholder: "Yazın...", clearText: "Sıfırla" }));
  }

  // ===== Header user =====
  (function () {
    const el = document.getElementById("headerUser");
    if (!el) return;

    function getSession() {
      try { return JSON.parse(localStorage.getItem("carall_session_v1") || "null"); } catch { return null; }
    }

    const session = getSession();
    const token = localStorage.getItem("access_token");
    const isLogged = session && (session.loggedIn === true || session.accessToken || session.token || token);

    if (!isLogged) {
      el.href = "login.html";
      el.classList.remove("has-user", "open");
      el.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="8" r="3"></circle>
          <path d="M4 21c1.5-4 14.5-4 16 0"></path>
        </svg>`;
      return;
    }

    const displayName = session.name || session.fullName || session.userName || "Profil";
    el.href = "#"; el.classList.add("has-user");
    el.innerHTML = `
      <span class="header-user-pill">
        <span class="header-user-avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="8" r="3"></circle>
            <path d="M4 21c1.5-4 14.5-4 16 0"></path>
          </svg>
        </span>
        <span class="header-user-name">${displayName}</span>
        <span class="header-user-arrow">▾</span>
      </span>
      <div class="header-user-dropdown">
        <a href="profile.html" id="profileLink">Profilim</a>
        <button type="button" id="logoutBtn">Çıxış et</button>
      </div>`;

    el.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); el.classList.toggle("open"); });
    document.addEventListener("click", () => el.classList.remove("open"));
    el.querySelector("#profileLink")?.addEventListener("click", (e) => e.stopPropagation());
    el.querySelector("#logoutBtn")?.addEventListener("click", async (e) => {
      e.preventDefault(); e.stopPropagation();
      try {
        if (token) {
          await fetch(`${API_BASE}/auth/logout`, {
            method: "POST",
            headers: { Authorization: "Bearer " + token, Accept: "application/json" }
          });
        }
      } catch (err) { console.warn("Logout error:", err); }
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("carall_session_v1");
      sessionStorage.clear();
      location.href = "index.html";
    });
  })();

  // ===== Favorites click =====
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".fav-btn");
    if (!btn) return;
    e.preventDefault(); e.stopPropagation();
    const id = String(btn.dataset.id || "");
    if (!id) return;
    const favIds = loadFavs();
    if (favIds.has(id)) favIds.delete(id); else favIds.add(id);
    saveFavs(favIds);
    btn.classList.toggle("is-on");
  });

  // ===== Modal =====
  (function () {
    if (window.__CARALL_MODAL_READY__) return;
    window.__CARALL_MODAL_READY__ = true;

    const map = {
      created: { title: "Elan uğurla yerləşdirildi", text: "Elanınız sistemə əlavə olundu.", primaryText: "Elanlarıma bax", primaryHref: "profile.html", secondaryText: "Ana səhifəyə qayıt", secondaryHref: "index.html" },
      edited:  { title: "Elan uğurla yeniləndi", text: "Dəyişikliklər yadda saxlanıldı.", primaryText: "Elana bax", primaryHref: "", secondaryText: "Ana səhifəyə qayıt", secondaryHref: "index.html" },
      deleted: { title: "Elan uğurla silindi", text: "Elan artıq siyahıda görünməyəcək.", primaryText: "Elanlarıma bax", primaryHref: "profile.html", secondaryText: "Ana səhifəyə qayıt", secondaryHref: "index.html" }
    };

    window.openCarallModal = function (type = "created", options = {}) {
      const modal = $("caModal"), title = $("caModalTitle"), text = $("caModalText");
      const primary = $("caModalPrimary"), secondary = $("caModalSecondary");
      if (!modal) return;
      const c = map[type] || map.created;
      title.textContent = options.title || c.title;
      text.textContent = options.text || c.text;
      primary.textContent = options.primaryText || c.primaryText;
      primary.setAttribute("href", options.primaryHref || c.primaryHref || location.href);
      secondary.textContent = options.secondaryText || c.secondaryText;
      secondary.setAttribute("href", options.secondaryHref || c.secondaryHref);
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
    };

    window.closeCarallModal = function () {
      const modal = $("caModal");
      if (!modal) return;
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
    };

    document.addEventListener("click", (e) => {
      if (e.target.matches("[data-ca-close]") || e.target.id === "caModalClose") window.closeCarallModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && $("caModal")?.classList.contains("is-open")) window.closeCarallModal();
    });
  })();

  // ===== ✅ BİRLƏŞDİRİLMİŞ DOMContentLoaded =====
  document.addEventListener("DOMContentLoaded", () => {

    // Footer year
    const footerYear = $("footerYear");
    if (footerYear) footerYear.textContent = new Date().getFullYear();

    // UI init
    bindChipsIfExist();
    initAdvancedPanel();
    initHamburgerMenu();
    ensureAdvFields();

    // TurboSelects
    initTurboSelects();

    // ✅ VIP/Premium — backend-dən çək (müstəqil işləyir)
    loadVipPremium();

    // ✅ Əvvəl page 1 yüklə, bitəndən sonra infinite scroll aktiv et
    // Race condition fix: sentinel görünürsə eyni anda 2x page 1 olmasın
    loadAllListings({ reset: true }).then(() => {
     initInfiniteScroll();
    });

    // ===== API Loaders =====
    loadMakesFromApi();
    loadVehicleTypesFromApi();
    loadFuelTypesFromApi();
    loadColorsFromApi();
    loadCountriesFromApi();
    loadTransmissionsFromApi();
    loadEngineVolumesFromApi();
    loadAssembledFromApi();
    loadRoofTypesFromApi();
    loadAccessoriesFromApi();

    // ===== Events =====
    btnSearch?.addEventListener("click", applyFilters);
    btnReset?.addEventListener("click", resetAll);

    qBrand?.addEventListener("change", () => loadModelsFromApi(qBrand.value));
    qCountry?.addEventListener("change", () => loadCitiesFromApi(qCountry.value));

    // "Hamısına bax" düyməsi
    $("latestMore")?.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
      location.href = $("latestMore").getAttribute("href") || "latest.html";
    }, true);

    // Advanced panel açılınca yenilə
    $("btnAdvanced")?.addEventListener("click", () => {
      ensureAdvFields();
      loadVehicleTypesFromApi();
      loadFuelTypesFromApi();
      loadColorsFromApi();
      loadTransmissionsFromApi();
      loadEngineVolumesFromApi();
      loadAssembledFromApi();
      loadRoofTypesFromApi();
      setTimeout(initTurboSelects, 0);
    });

    // advPanel sync
    const advPanel = $("advPanel");
    const btnReset2 = $("btnReset");
    if (advPanel && btnReset2) {
      const sync = () => {
        const isOpen = advPanel.classList.contains("is-open") && !advPanel.hasAttribute("hidden");
        btnReset2.style.marginTop = isOpen ? "10px" : "";
      };
      new MutationObserver(sync).observe(advPanel, { attributes: true, attributeFilter: ["class", "hidden"] });
      sync();
    }

    // Hash #adv
    if (location.hash === "#adv") {
      const btnAdv = $("btnAdvanced");
      const adv = $("advPanel");
      if (btnAdv && adv) {
        const isOpen = adv.classList.contains("is-open") && !adv.hasAttribute("hidden");
        if (!isOpen) btnAdv.click();
        setTimeout(() => (document.querySelector(".filters") || adv).scrollIntoView({ behavior: "smooth", block: "start" }), 120);
      }
    }
  });