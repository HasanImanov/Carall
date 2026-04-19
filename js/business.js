(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);

  const state = {
    businessId: null,
    business: null,
    allCars: [],
    filteredCars: []
  };

  const DEMO = {
    logo: "images/biz-logo.png",
    car: "images/car.jpg"
  };

  function fmtNumber(n) {
    const x = Number(n || 0);
    return x.toLocaleString("az-AZ");
  }

  function fmtPrice(n) {
    return `${fmtNumber(n)} ₼`;
  }

  function fmtDate(v) {
    if (!v) return "—";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return String(v);
    return d.toLocaleDateString("az-AZ");
  }

  function safeText(v, fb = "—") {
    if (v === null || v === undefined || String(v).trim() === "") return fb;
    return String(v);
  }

  function escapeHtml(str) {
    return String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function getQueryParams() {
    return Object.fromEntries(new URLSearchParams(window.location.search).entries());
  }

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem("carall_session_v1")) || null;
    } catch {
      return null;
    }
  }

  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem("carall_users_v1")) || [];
    } catch {
      return [];
    }
  }

  function getLocalCars() {
    try {
      return JSON.parse(localStorage.getItem("carall_cars_v1")) || [];
    } catch {
      return [];
    }
  }

  function getWindowCars() {
    const fromWindow = window.ALL_CARS || window.CARS || window.cars || [];
    const fromLocal = getLocalCars();
    return [...fromWindow, ...fromLocal];
  }

  function getBusinessFromSession() {
    const q = getQueryParams();
    const session = getSession();
    const users = getUsers();

    const explicitBusinessId = q.business_id || q.id || q.ownerId || q.salonId;
    if (explicitBusinessId) {
      const byId = users.find(u =>
        String(u.id) === String(explicitBusinessId) ||
        String(u.userId) === String(explicitBusinessId) ||
        String(u.ownerId) === String(explicitBusinessId)
      );
      if (byId) return normalizeBusiness(byId, explicitBusinessId);

      return buildDemoBusiness(explicitBusinessId);
    }

    if (session) {
      const sessionId = session.userId || session.id || session.ownerId || "demo-business";
      const user = users.find(u =>
        String(u.id) === String(sessionId) ||
        String(u.userId) === String(sessionId)
      );

      if (user) return normalizeBusiness(user, sessionId);
      return buildDemoBusiness(sessionId);
    }

    return buildDemoBusiness("demo-business");
  }

  function normalizeBusiness(user, fallbackId) {
    const businessTypeRaw =
      user.businessType ||
      user.companyType ||
      user.type ||
      user.accountType ||
      "salon";

    const businessType =
      String(businessTypeRaw).toLowerCase().includes("rent") ? "Rent a car" : "Avtosalon";

    return {
      id: user.id || user.userId || user.ownerId || fallbackId,
      name: user.companyName || user.businessName || user.name || user.fullName || "Business hesab",
      city: user.city || user.addressCity || "Bakı",
      type: businessType,
      logo: user.logo || user.logoUrl || user.image || DEMO.logo,
      createdAt: user.createdAt || "2026-01-01"
    };
  }

  function buildDemoBusiness(id) {
    return {
      id,
      name: "Cars For Aze",
      city: "Bakı",
      type: "Avtosalon",
      logo: DEMO.logo,
      createdAt: "2026-01-01"
    };
  }

  function normalizeCar(car, idx = 0) {
    const status = normalizeStatus(car.status || car.adStatus || car.moderationStatus);
    const views = Number(car.views ?? car.viewCount ?? car.clicks ?? randomRange(40, 460, idx));
    const phoneClicks = Number(car.phoneClicks ?? car.phone_clicks ?? randomRange(2, 36, idx + 5));
    const whatsappClicks = Number(car.whatsappClicks ?? car.whatsapp_clicks ?? randomRange(1, 24, idx + 9));
    const todayClicks = Number(car.todayClicks ?? car.today_clicks ?? Math.max(1, Math.round(views * 0.08)));

    return {
      id: car.id ?? `car-${idx + 1}`,
      ownerId: car.ownerId ?? car.userId ?? car.businessId ?? null,
      ownerType: car.ownerType || "salon",
      brand: safeText(car.brand || car.make, "Marka"),
      model: safeText(car.model, "Model"),
      year: safeText(car.year, "—"),
      city: safeText(car.city, "Bakı"),
      price: Number(car.price || 0),
      mileage: Number(car.mileage ?? car.km ?? 0),
      img: car.img || car.image || car.image_url || car.thumb_url || DEMO.car,
      createdAt: car.createdAt || car.updatedAt || new Date().toISOString(),
      status,
      views,
      phoneClicks,
      whatsappClicks,
      todayClicks
    };
  }

  function normalizeStatus(status) {
    const s = String(status || "").toLowerCase();

    if (
      s.includes("active") ||
      s.includes("aktiv") ||
      s === "1" ||
      s === "published"
    ) return "active";

    if (
      s.includes("pending") ||
      s.includes("moderation") ||
      s.includes("wait") ||
      s.includes("review") ||
      s.includes("gözləm")
    ) return "pending";

    if (
      s.includes("sold") ||
      s.includes("sat")
    ) return "sold";

    if (
      s.includes("deactive") ||
      s.includes("inactive") ||
      s.includes("passive") ||
      s.includes("off")
    ) return "deactive";

    return "active";
  }

  function randomRange(min, max, seed) {
    const x = Math.sin(seed + 1) * 10000;
    const r = x - Math.floor(x);
    return Math.floor(r * (max - min + 1)) + min;
  }

  function buildDemoCars(businessId) {
    const demo = [
      ["Toyota", "Camry", 2020, 24500, "active"],
      ["Kia", "Sorento", 2018, 28900, "pending"],
      ["Mercedes", "E 220", 2017, 33200, "active"],
      ["Hyundai", "Elantra", 2019, 19800, "sold"],
      ["BMW", "530", 2016, 30500, "deactive"],
      ["Lexus", "RX 350", 2021, 51800, "active"]
    ];

    return demo.map((item, i) => normalizeCar({
      id: `demo-${i + 1}`,
      ownerId: businessId,
      ownerType: "salon",
      brand: item[0],
      model: item[1],
      year: item[2],
      price: item[3],
      status: item[4],
      city: "Bakı",
      img: DEMO.car,
      createdAt: new Date(Date.now() - i * 86400000 * 3).toISOString()
    }, i));
  }

  function getBusinessCars(businessId) {
    const all = getWindowCars().map((car, idx) => normalizeCar(car, idx));

    let mine = all.filter(car => String(car.ownerId) === String(businessId));

    if (!mine.length) {
      mine = all.filter(car =>
        String(car.ownerType || "").toLowerCase() === "salon" ||
        String(car.ownerType || "").toLowerCase() === "rent"
      );
    }

    if (!mine.length) {
      mine = buildDemoCars(businessId);
    }

    return dedupeCars(mine);
  }

  function dedupeCars(list) {
    const map = new Map();
    list.forEach(item => {
      map.set(String(item.id), item);
    });
    return Array.from(map.values());
  }

  function renderBusinessHeader() {
    const b = state.business;
    $("#bizName").textContent = b.name;
    $("#bizCity").textContent = b.city;
    $("#bizType").textContent = b.type;
    $("#bizSince").textContent = `${fmtDate(b.createdAt)}-dan`;
    $("#bizLogo").src = b.logo || DEMO.logo;
  }

  function calcStats(cars) {
    const totalCars = cars.length;
    const activeCars = cars.filter(c => c.status === "active").length;
    const totalViews = cars.reduce((sum, c) => sum + Number(c.views || 0), 0);
    const todayClicks = cars.reduce((sum, c) => sum + Number(c.todayClicks || 0), 0);

    return {
      totalCars,
      activeCars,
      totalViews,
      todayClicks
    };
  }

  function renderStats(cars) {
    const stats = calcStats(cars);

    $("#statTotalCars").textContent = fmtNumber(stats.totalCars);
    $("#statActiveCars").textContent = fmtNumber(stats.activeCars);
    $("#statViews").textContent = fmtNumber(stats.totalViews);
    $("#statTodayClicks").textContent = fmtNumber(stats.todayClicks);
  }

  function getStatusLabel(status) {
    if (status === "active") return "Aktiv";
    if (status === "pending") return "Gözləmədə";
    if (status === "sold") return "Satılıb";
    return "Deaktiv";
  }

  function buildRow(car) {
    return `
      <tr>
        <td>
          <div class="bd-carCell">
            <img
              class="bd-carCell__img"
              src="${escapeHtml(car.img)}"
              alt="${escapeHtml(car.brand)} ${escapeHtml(car.model)}"
              onerror="this.src='images/car.jpg'"
            />
            <div class="bd-carCell__body">
              <div class="bd-carCell__title">${escapeHtml(car.brand)} ${escapeHtml(car.model)}</div>
              <div class="bd-carCell__meta">
                ID: ${escapeHtml(car.id)} • ${escapeHtml(car.year)} • ${escapeHtml(car.city)}
              </div>
            </div>
          </div>
        </td>

        <td>
          <div class="bd-price">${fmtPrice(car.price)}</div>
        </td>

        <td>
          <span class="bd-pill bd-pill--${escapeHtml(car.status)}">
            ${getStatusLabel(car.status)}
          </span>
        </td>

        <td>
          <span class="bd-num">${fmtNumber(car.views)}</span>
        </td>

        <td>
          <span class="bd-num">${fmtNumber(car.phoneClicks)}</span>
        </td>

        <td>
          <span class="bd-num">${fmtNumber(car.whatsappClicks)}</span>
        </td>

        <td>
          <span class="bd-date">${fmtDate(car.createdAt)}</span>
        </td>

        <td>
          <div class="bd-actions">
            <a class="bd-action" href="details.html?id=${encodeURIComponent(car.id)}">Bax</a>
            <a class="bd-action" href="addproduct.html?edit=${encodeURIComponent(car.id)}">Düzəliş et</a>
            <button class="bd-action bd-action--danger" type="button" data-delete-id="${escapeHtml(car.id)}">Sil</button>
          </div>
        </td>
      </tr>
    `;
  }

  function renderTable(cars) {
    const tbody = $("#bizCarsTableBody");
    const empty = $("#bizEmptyState");

    $("#resultCount").textContent = fmtNumber(cars.length);

    if (!cars.length) {
      tbody.innerHTML = "";
      empty.hidden = false;
      return;
    }

    empty.hidden = true;
    tbody.innerHTML = cars.map(buildRow).join("");
  }

  function applyFilters() {
    const q = ($("#bizSearchInput").value || "").trim().toLowerCase();
    const status = $("#bizStatusFilter").value;
    const sort = $("#bizSortSelect").value;

    let list = [...state.allCars];

    if (q) {
      list = list.filter(car => {
        const hay = [
          car.id,
          car.brand,
          car.model,
          car.city,
          car.year,
          car.price
        ].join(" ").toLowerCase();

        return hay.includes(q);
      });
    }

    if (status !== "all") {
      list = list.filter(car => car.status === status);
    }

    list = sortCars(list, sort);

    state.filteredCars = list;

    renderStats(list);
    renderTable(list);
  }

  function sortCars(list, sort) {
    const arr = [...list];

    if (sort === "old") {
      arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      return arr;
    }

    if (sort === "views_desc") {
      arr.sort((a, b) => Number(b.views) - Number(a.views));
      return arr;
    }

    if (sort === "price_desc") {
      arr.sort((a, b) => Number(b.price) - Number(a.price));
      return arr;
    }

    if (sort === "price_asc") {
      arr.sort((a, b) => Number(a.price) - Number(b.price));
      return arr;
    }

    arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return arr;
  }

  function bindEvents() {
    $("#bizSearchInput").addEventListener("input", applyFilters);
    $("#bizStatusFilter").addEventListener("change", applyFilters);
    $("#bizSortSelect").addEventListener("change", applyFilters);

    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-delete-id]");
      if (!btn) return;

      const id = btn.getAttribute("data-delete-id");
      const ok = window.confirm(`Bu elanı silmək istəyirsən?\nID: ${id}`);
      if (!ok) return;

      state.allCars = state.allCars.filter(car => String(car.id) !== String(id));

      try {
        const localCars = getLocalCars().filter(car => String(car.id) !== String(id));
        localStorage.setItem("carall_cars_v1", JSON.stringify(localCars));
      } catch (_) {}

      applyFilters();
    });
  }

  function setYear() {
    const y = $("#yearNow");
    if (y) y.textContent = new Date().getFullYear();
  }

  function init() {
    setYear();

    state.business = getBusinessFromSession();
    state.businessId = state.business.id;
    state.allCars = getBusinessCars(state.businessId);

    renderBusinessHeader();
    bindEvents();
    applyFilters();
  }

  document.addEventListener("DOMContentLoaded", init);
})();