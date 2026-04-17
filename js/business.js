/* business.js */
(() => {
  "use strict";

  // ---------------------------
  // Helpers
  // ---------------------------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const fmtNumber = (n) => {
    const x = Number(n);
    if (Number.isNaN(x)) return String(n ?? "");
    return x.toLocaleString("az-AZ");
  };

  const escapeHtml = (str) =>
    String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const getQuery = () => Object.fromEntries(new URLSearchParams(location.search).entries());

  // supports "a.b" and "phones[0].masked"
  const getByPath = (obj, path) => {
    if (!obj || !path) return undefined;
    const normalized = path.replace(/\[(\d+)\]/g, ".$1");
    return normalized
      .split(".")
      .reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
  };

  const setText = (el, val) => {
    if (!el) return;
    el.textContent = val == null ? "" : String(val);
  };

  const setImg = (el, url) => {
    if (!el) return;
    el.src = url || "";
    el.alt = el.alt || "";
  };

  const setHref = (el, url) => {
    if (!el) return;
    el.setAttribute("href", url || "#");
  };

  const enableLink = (el, href) => {
    if (!el) return;
    el.setAttribute("aria-disabled", "false");
    setHref(el, href);
  };

  const disableLink = (el) => {
    if (!el) return;
    el.setAttribute("aria-disabled", "true");
    setHref(el, "#");
  };

  // ---------------------------
  // Config
  // ---------------------------
  const API = {
    business: (id) => `/api/businesses/${encodeURIComponent(id)}`,
    listings: (id, params) =>
      `/api/businesses/${encodeURIComponent(id)}/listings?${new URLSearchParams(params).toString()}`,
    revealPhone: (id) => `/api/businesses/${encodeURIComponent(id)}/reveal-phone`,
  };

  const DEMO = {
    cover: "./images/biz-cover.png",
    logo: "./images/biz-logo.png",
    carFallback: "./images/car.jpg",
    carPool: ["./images/car-1.jpg", "./images/car-2.jpg", "./images/car-3.jpg"],
  };

  const state = {
    businessId: null,
    business: null,
    listings: [],
    filteredListings: [],
    offset: 0,
    limit: 12,
    sort: "new",
    isPhoneRevealed: false,
  };

  // ---------------------------
  // Binding / business info
  // ---------------------------
  function bindBasics(root, data) {
    $$("[data-bind]", root).forEach((el) => {
      const path = el.getAttribute("data-bind");
      const val = getByPath(data, path);

      if (el.tagName === "IMG") setImg(el, val);
      else setText(el, val);
    });

    $$("[data-bind-href]", root).forEach((el) => {
      const path = el.getAttribute("data-bind-href");
      const val = getByPath(data, path);
      if (val != null) setHref(el, val);
    });
  }

  function renderWorkingHours(hours = []) {
    const host = $('[data-bind-list="working_hours"]');
    if (!host) return;

    host.innerHTML = "";
    if (!Array.isArray(hours) || hours.length === 0) return;

    hours.forEach((h) => {
      const row = document.createElement("div");
      row.className = "biz-hours__row";
      const from = h?.from ?? "";
      const to = h?.to ?? "";
      const days = h?.days ?? "";
      row.innerHTML = `<span class="ico" aria-hidden="true">🕒</span><span>${escapeHtml(days)}: ${escapeHtml(from)}–${escapeHtml(to)}</span>`;
      host.appendChild(row);
    });
  }

  function renderBadges(badges = []) {
    const host = $('[data-bind-list="badges"]');
    if (!host) return;

    host.innerHTML = "";
    if (!Array.isArray(badges) || badges.length === 0) return;

    badges.forEach((b) => {
      const el = document.createElement("span");
      el.className = "tag";
      el.textContent = String(b);
      host.appendChild(el);
    });
  }

  function buildMapUrl(biz) {
    if (biz?.map_url) return biz.map_url;

    const lat = biz?.location?.lat;
    const lng = biz?.location?.lng;
    if (lat != null && lng != null) {
      return `https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}`;
    }

    const q = [biz?.city, biz?.address].filter(Boolean).join(", ");
    return q ? `https://www.google.com/maps?q=${encodeURIComponent(q)}` : "#";
  }

  function hydratePhones(biz) {
    const phones = Array.isArray(biz.phones) ? biz.phones : [];
    if (!phones[0]) return biz;

    const p0 = phones[0];
    const raw = String(p0.value || "");
    const masked =
      p0.masked ||
      (raw
        ? raw.replace(/^(\+\d{3})(\d{2})\d+(\d{2})$/, "$1 $2 *** $3").replace(/\s{2,}/g, " ")
        : "+994 ...");

    const digits = raw.replace(/[^\d+]/g, "");
    const telHref = digits ? `tel:${digits}` : "#";
    const waDigits = raw.replace(/[^\d]/g, "");
    const waHref = waDigits ? `https://wa.me/${waDigits}` : "#";

    p0.masked = masked;
    p0.tel_href = telHref;
    p0.wa_href = waHref;
    return biz;
  }

  function renderBusiness(biz) {
    biz.map_url = buildMapUrl(biz);
    hydratePhones(biz);

    bindBasics(document, biz);

    const viewsEl = $('[data-bind="stats.views"]');
    if (viewsEl) setText(viewsEl, fmtNumber(biz?.stats?.views ?? 0));

    renderWorkingHours(biz.working_hours);
    renderBadges(biz.badges);

    setText($("#maskedPhone"), getByPath(biz, "phones[0].masked") || "+994 ...");

    disableLink($("#callLink"));
    disableLink($("#waLink"));
  }

  // ---------------------------
  // Demo fallback
  // ---------------------------
  function pickDemoCar(i) {
    const url = DEMO.carPool[i % DEMO.carPool.length] || DEMO.carFallback;
    return url;
  }

  function mockBusiness(id) {
    return {
      id,
      name: "Cars For Aze",
      logo_url: DEMO.logo,
      cover_url: DEMO.cover,
      city: "Bakı",
      address: "Xətai r., Nəcəfqulu Rəfiyev küç., 10",
      location: { lat: 40.385, lng: 49.863 },
      phones: [{ label: "Əsas", value: "+994501234567", is_public: false, is_whatsapp: true }],
      working_hours: [
        { days: "B.e – Cümə", from: "09:00", to: "18:00" },
        { days: "Şənbə – Bazar", from: "10:00", to: "18:00" },
      ],
      about:
        "\"Cars For Aze\" MMC 2019-cu ildən etibarən avtomobillərin idxalı və satışı ilə məşğuldur.",
      stats: { views: 73829, listings_count: 12, followers: 0 },
      turbo_seller_since: "12.12.2023 tarixindən",
      badges: ["verified", "premium_seller"],
    };
  }

  function mockListings() {
    const arr = [];
    for (let i = 1; i <= 12; i++) {
      arr.push({
        id: `car_${i}`,
        brand: "Mercedes",
        model: `C250`,
        price: 18000 + i * 350,
        year: 2010 + (i % 10),
        mileage: 120000 + i * 3500,
        fuel: "Benzin",
        gearbox: "Avtomat",
        city: "Bakı",
        country: "AZ",
        img: pickDemoCar(i),
        adType: i % 7 === 0 ? 3 : i % 5 === 0 ? 2 : 1,
        ownerId: state.businessId,
        ownerType: "salon",
        createdAt: Date.now() - i * 86400000
      });
    }
    return arr;
  }

  // ---------------------------
  // API / data
  // ---------------------------
  async function apiGet(url) {
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
    return res.json();
  }

  async function apiPost(url, body) {
    const res = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });
    if (!res.ok) throw new Error(`POST ${url} failed: ${res.status}`);
    return res.json();
  }

  async function loadBusiness(id) {
    try {
      const data = await apiGet(API.business(id));
      return data;
    } catch (e) {
      console.warn("Business fetch failed, using mock:", e);
      return mockBusiness(id);
    }
  }

  async function loadListings(id, { limit, offset, sort }) {
  // 1) API
  const apiItems = await loadListingsFromApi(id, { limit, offset, sort });
  if (Array.isArray(apiItems) && apiItems.length) {
    return apiItems.map(normalizeLocalCar);
  }

  // 2) local/window cars
  const allCars = getWindowCars();
  if (Array.isArray(allCars) && allCars.length) {
    let mine = allCars.filter((car) => String(car.ownerId) === String(id));
    mine = mine.map(normalizeLocalCar);
    mine = sortListings(mine, sort);
    return mine.slice(offset, offset + limit);
  }

  // 3) demo yalnız demo səhifədirsə
  if (String(id) === "demo") {
    const all = sortListings(mockListings(), sort);
    return all.slice(offset, offset + limit);
  }

  return [];
}

  function getWindowCars() {
    return window.ALL_CARS || window.CARS || window.cars || [];
  }

  function normalizeLocalCar(car) {
    return {
      ...car,
      img: car.img || car.image_url || car.thumb_url || DEMO.carFallback,
      mileage: car.mileage ?? car.km ?? 0,
      brand: car.brand || car.make || "",
      model: car.model || "",
      country: car.country || "AZ",
      city: car.city || "",
      fuel: car.fuel || "",
      gearbox: car.gearbox || "",
      adType: car.adType || (car.is_premium ? 3 : car.is_vip ? 2 : 1),
      createdAt: car.createdAt || Date.now()
    };
  }

  function sortListings(list, sort) {
    const arr = [...list];

    if (sort === "price_asc") {
      arr.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
      return arr;
    }

    if (sort === "price_desc") {
      arr.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
      return arr;
    }

    arr.sort((a, b) => Number(b.createdAt || b.id || 0) - Number(a.createdAt || a.id || 0));
    return arr;
  }

  async function loadListings(id, { limit, offset, sort }) {
    // 1) API
    const apiItems = await loadListingsFromApi(id, { limit, offset, sort });
    if (Array.isArray(apiItems) && apiItems.length) {
      return apiItems.map(normalizeLocalCar);
    }

    // 2) local/window cars
    const allCars = getWindowCars();
    if (Array.isArray(allCars) && allCars.length) {
      let mine = allCars.filter((car) => String(car.ownerId) === String(id));

      // ownerId hələ yoxdursa fallback kimi boş qalmamasın
      if (!mine.length) {
        mine = allCars;
      }

      mine = mine.map(normalizeLocalCar);
      mine = sortListings(mine, sort);
      return mine.slice(offset, offset + limit);
    }

    // 3) demo
    const all = sortListings(mockListings(), sort);
    return all.slice(offset, offset + limit);
  }

  // ---------------------------
  // Listings render
  // ---------------------------
  function renderEmpty() {
    const grid = $("#bizListingsGrid");
    if (!grid) return;
    grid.innerHTML = `<div class="muted" style="padding:10px;color:rgba(0,0,0,.6)">Elan tapılmadı.</div>`;
  }

  function renderListings(list, { append = false } = {}) {
    const grid = $("#bizListingsGrid");
    if (!grid) return;

    if (!Array.isArray(list) || list.length === 0) {
      if (!append) renderEmpty();
      return;
    }

    // script.js içindəki hazır renderCars istifadə olunur
    if (typeof window.renderCars === "function") {
      window.renderCars(list, grid, append);
      return;
    }

    // fallback sadə render
    if (!append) grid.innerHTML = "";

    const html = list.map((car) => {
      const href = `details.html?id=${encodeURIComponent(car.id)}`;
      return `
        <a class="cardlink" href="${href}" aria-label="${escapeHtml(car.brand)} ${escapeHtml(car.model)}">
          <article class="card">
            <div class="card__imgwrap">
              <img class="card__img" src="${escapeHtml(car.img || DEMO.carFallback)}" alt="${escapeHtml(car.brand)} ${escapeHtml(car.model)}">
            </div>
            <div class="card__body">
              <div class="card__title">${escapeHtml(car.brand)} ${escapeHtml(car.model)}</div>
              <div class="card__price">${fmtNumber(car.price)} ₼</div>
            </div>
          </article>
        </a>
      `;
    }).join("");

    if (append) grid.insertAdjacentHTML("beforeend", html);
    else grid.innerHTML = html;
  }

  // ---------------------------
  // Actions
  // ---------------------------
  async function revealPhone() {
    if (state.isPhoneRevealed) return;
    const biz = state.business;
    if (!biz?.phones?.[0]) return;

    const btn = $("#revealPhoneBtn");
    const hint = document.querySelector(".biz-phonecard__hint");
    if (btn) btn.disabled = true;

    try {
      const r = await apiPost(API.revealPhone(state.businessId), { phone_index: 0 });
      const phone = r?.phone || biz.phones[0].value;

      state.isPhoneRevealed = true;
      setText($("#maskedPhone"), phone);
      if (hint) hint.textContent = "Nömrə açıldı";

      const digits = String(phone).replace(/[^\d+]/g, "");
      const telHref = digits ? `tel:${digits}` : "#";
      const waDigits = String(phone).replace(/[^\d]/g, "");
      const waHref = waDigits ? `https://wa.me/${waDigits}` : "#";

      enableLink($("#callLink"), telHref);
      enableLink($("#waLink"), waHref);
    } catch (e) {
      console.warn("Reveal failed, demo reveal used:", e);
      state.isPhoneRevealed = true;

      const phone = biz.phones[0].value;
      setText($("#maskedPhone"), phone);
      if (hint) hint.textContent = "Nömrə açıldı";

      enableLink($("#callLink"), biz.phones[0].tel_href || `tel:${phone}`);
      enableLink($("#waLink"), biz.phones[0].wa_href || "#");
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  function setupTabs() {
    const tabs = $$(".tab");
    const panes = $$("[data-tabpane]");

    tabs.forEach((t) => {
      t.addEventListener("click", () => {
        const name = t.getAttribute("data-tab");
        tabs.forEach((x) => x.classList.toggle("is-active", x === t));
        panes.forEach((p) => p.classList.toggle("is-active", p.getAttribute("data-tabpane") === name));
      });
    });
  }

  async function refreshListings({ reset = false } = {}) {
    if (!state.businessId) return;

    if (reset) {
      state.offset = 0;
      state.listings = [];
      const grid = $("#bizListingsGrid");
      if (grid) grid.innerHTML = "";
    }

    const items = await loadListings(state.businessId, {
      limit: state.limit,
      offset: state.offset,
      sort: state.sort,
    });

    state.listings = reset ? items : state.listings.concat(items);

    renderListings(items, { append: !reset });

    const btn = $("#loadMoreBtn");
    if (btn) {
      btn.style.display = items.length < state.limit ? "none" : "inline-flex";
    }

    state.offset += items.length;
  }

  function setupListingControls() {
    const sort = $("#sortListings");
    if (sort) {
      sort.addEventListener("change", async () => {
        state.sort = sort.value || "new";
        await refreshListings({ reset: true });
      });
    }

    const more = $("#loadMoreBtn");
    if (more) {
      more.addEventListener("click", async () => {
        await refreshListings({ reset: false });
      });
    }
  }

  function setupReveal() {
    const btn = $("#revealPhoneBtn");
    if (btn) btn.addEventListener("click", revealPhone);
  }

  function setupImageFallback() {
    document.addEventListener(
      "error",
      (e) => {
        const img = e.target;
        if (!(img instanceof HTMLImageElement)) return;

        const src = img.getAttribute("src") || "";
        if (src.includes("/images/car-") && !img.dataset.fallbackApplied) {
          img.dataset.fallbackApplied = "1";
          img.src = DEMO.carFallback;
        }
        if (src.includes("/images/biz-cover") && !img.dataset.fallbackApplied) {
          img.dataset.fallbackApplied = "1";
          img.src = DEMO.cover;
        }
        if (src.includes("/images/biz-logo") && !img.dataset.fallbackApplied) {
          img.dataset.fallbackApplied = "1";
          img.src = DEMO.logo;
        }
      },
      true
    );
  }

  // ---------------------------
  // Boot
  // ---------------------------
  async function init() {
    const q = getQuery();
    state.businessId = q.id || q.business_id || "demo";

    setupImageFallback();
    setupTabs();
    setupReveal();
    setupListingControls();

    const biz = await loadBusiness(state.businessId);
    state.business = biz;
    renderBusiness(biz);

    await refreshListings({ reset: true });
  }

  document.addEventListener("DOMContentLoaded", init);
})();