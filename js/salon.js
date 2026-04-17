/* =========================
   CarAll — salon.js
   - business-style salon hero
   - exact index cards
   - favs + search + infinite scroll
   ========================= */

(() => {
  const PAGE_SIZE = 8;
  const ROOT_MARGIN = "450px 0px";
  const THROTTLE_MS = 160;

  const grid = document.getElementById("salonCarsGrid");
  const empty = document.getElementById("salonCarsEmpty");
  const countEl = document.getElementById("salonCarsCount");
  const sentinel = document.getElementById("pagerSentinel");
  const sentinelText = document.getElementById("sentinelText");

  const searchEl = document.getElementById("salonSearch");
  const clearBtn = document.getElementById("salonClear");

  if (!grid) return;

  const qs = new URLSearchParams(location.search);
  const salonId = Number(qs.get("id") || 0);

  const salons = Array.isArray(window.SALONS)
    ? window.SALONS
    : (typeof SALONS !== "undefined" ? SALONS : []);

  const cars = Array.isArray(window.CARS)
    ? window.CARS
    : (typeof CARS !== "undefined" ? CARS : []);

  // ---- FAVS ----
  const FAVS_KEY = "carall_favs_v1";

  const loadFavs = () => {
    try {
      return new Set((JSON.parse(localStorage.getItem(FAVS_KEY)) || []).map(String));
    } catch {
      return new Set();
    }
  };

  const saveFavs = (set) =>
    localStorage.setItem(FAVS_KEY, JSON.stringify([...set]));

  // ---- helpers ----
  const esc = (s) =>
    String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const norm = (s) => String(s || "").toLowerCase().trim();

  const money =
    window.money ||
    ((p) => {
      if (p === null || p === undefined || p === "") return "—";
      const n = Number(String(p).replace(/[^\d.]/g, ""));
      if (!Number.isFinite(n)) return String(p);
      return n.toLocaleString("az-AZ") + " ₼";
    });

  const countryName = window.countryName || ((c) => c || "Azərbaycan");

  const getCarDateLabel =
    window.getCarDateLabel ||
    ((car) => {
      const raw = car?.createdAt || car?.date || car?.created_at || "";
      return raw ? String(raw) : "—";
    });

  function getCarImg(car) {
    if (car?.img) return car.img;
    const imgs = car?.images || car?.imgs || car?.photos || [];
    if (Array.isArray(imgs) && imgs.length) return imgs[0];
    return car?.image || car?.imgUrl || "images/car.jpg";
  }

  function getDemoSalonId(carId, salonsCount) {
    const n = Number(carId);
    if (!Number.isFinite(n) || salonsCount <= 0) return 0;
    return ((n - 1) % salonsCount) + 1;
  }

  function setCount(n) {
    if (countEl) countEl.textContent = `${n} elan`;
  }

  function setSentinelText(t) {
    if (sentinelText) sentinelText.textContent = t;
  }

  function setEmptyUI(isEmpty) {
    if (empty) empty.hidden = !isEmpty;
    if (sentinel) sentinel.hidden = isEmpty;
  }

  function buildMapUrl(s) {
    if (s?.map_url) return s.map_url;

    const lat = s?.location?.lat;
    const lng = s?.location?.lng;

    if (lat != null && lng != null) {
      return `https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}`;
    }

    const q = [s?.city, s?.address].filter(Boolean).join(", ");
    return q ? `https://www.google.com/maps?q=${encodeURIComponent(q)}` : "#";
  }

  function getSalonPhone(s) {
    if (s?.phone) return String(s.phone);
    if (Array.isArray(s?.phones) && s.phones[0]?.value) return String(s.phones[0].value);
    return "";
  }

  function getMaskedPhone(phone) {
    if (!phone) return "+994 ...";
    return phone
      .replace(/^(\+\d{3})(\d{2})\d+(\d{2})$/, "$1 $2 *** $3")
      .replace(/\s{2,}/g, " ");
  }

  function getTelHref(phone) {
    const digits = String(phone || "").replace(/[^\d+]/g, "");
    return digits ? `tel:${digits}` : "#";
  }

  function getWaHref(phone) {
    const waDigits = String(phone || "").replace(/[^\d]/g, "");
    return waDigits ? `https://wa.me/${waDigits}` : "#";
  }

  function getSalonLogo(s) {
    return s?.logo || s?.logo_url || s?.image || "images/biz-logo.png";
  }

  function getSalonCover(s) {
    return (
    s?.cover ||
    s?.cover_url ||
    s?.coverImage ||
    s?.image ||
    s?.img ||
    "images/biz-cover.png"
    );
  }

  function getSalonViews(s) {
    return s?.stats?.views || s?.views || 0;
  }

  function getSalonSince(s) {
    return s?.turbo_seller_since || s?.seller_since || "12.12.2023 tarixindən";
  }

  function getWorkingHours(s) {
    if (Array.isArray(s?.working_hours) && s.working_hours.length) {
      return s.working_hours;
    }
    return [
      { days: "B.e – Cümə", from: "09:00", to: "18:00" },
      { days: "Şənbə – Bazar", from: "10:00", to: "18:00" }
    ];
  }

  // ---- HERO ----
  function renderSalonHero(s) {
    const hero = document.getElementById("salonHero");
    if (!hero) return;

    if (!s) {
      hero.innerHTML = `
        <div class="salon-hero__bar">
          <div class="hero-logo">
            <span class="hero-logo__txt">?</span>
          </div>
          <div class="hero-main">
            <h1 class="hero-name">Salon tapılmadı</h1>
            <div class="hero-meta">
              <div class="hero-meta__item">Bu ID ilə salon yoxdur.</div>
            </div>
          </div>
        </div>
      `;
      return;
    }

    const name = s.name || "Salon adı";
    const city = s.city || "Bakı";
    const address = s.address || "Ünvan";
    const phone = getSalonPhone(s);
    const masked = getMaskedPhone(phone);
    const telHref = getTelHref(phone);
    const waHref = getWaHref(phone);
    const logo = getSalonLogo(s);
    const cover = getSalonCover(s);
    const views = Number(getSalonViews(s)).toLocaleString("az-AZ");
    const since = getSalonSince(s);
    const mapUrl = buildMapUrl(s);
    const workingHours = getWorkingHours(s);

    const coverBox = document.querySelector(".salon-cover");
    if (coverBox) {
      coverBox.innerHTML = `<img id="salonCoverImg" src="${esc(cover)}" alt="${esc(name)}">`;
    }

    hero.innerHTML = `
      <div class="salon-hero__bar">
        <div class="hero-logo" aria-label="Salon logo">
          ${
            logo
              ? `<img id="salonLogoImg" src="${esc(logo)}" alt="${esc(name)}">`
              : `<span class="hero-logo__txt">${esc(name.trim().charAt(0).toUpperCase())}</span>`
          }
        </div>

        <div class="hero-main">
          <h1 class="hero-name">${esc(name)}</h1>

          <div class="hero-meta">
            <a class="hero-meta__item hero-address"
               id="salonMapLink"
               href="${esc(mapUrl)}"
               target="_blank"
               rel="noopener"
               aria-label="Xəritədə aç">
              <span class="ico" aria-hidden="true">📍</span>
              <span>${esc(address)}</span>
            </a>

            <div class="hero-meta__item">
              <span class="ico" aria-hidden="true">👤</span>
              <span>${esc(since)}</span>
            </div>

            <div class="hero-meta__item">
              <span class="ico" aria-hidden="true">👁️</span>
              <span>${views}</span>
            </div>
          </div>

          <div class="hero-hours">
            ${workingHours.map(h => `
              <div class="hero-hours__row">
                <span class="ico">🕒</span>
                <span>${esc(h.days)}: ${esc(h.from)}–${esc(h.to)}</span>
              </div>
            `).join("")}
          </div>
        </div>

        <aside class="salon-cta" aria-label="Əlaqə">
          <button class="salon-phonecard" type="button" id="revealPhoneBtn">
            <span class="salon-phonecard__top">Əlaqə nömrəsi</span>
            <span class="salon-phonecard__number" id="maskedPhone">${esc(masked)}</span>
            <span class="salon-phonecard__hint" id="phoneHint">Nömrəni göstərmək üçün kliklə</span>
          </button>

          <div class="salon-cta__links">
            <a class="hero-btn hero-btn--ghost" id="callLink" href="#" aria-disabled="true">Zəng et</a>
            <a class="hero-btn hero-btn--ghost" id="waLink" href="#" aria-disabled="true">WhatsApp</a>
          </div>
        </aside>
      </div>
    `;

    const revealBtn = document.getElementById("revealPhoneBtn");
    const maskedPhoneEl = document.getElementById("maskedPhone");
    const phoneHintEl = document.getElementById("phoneHint");
    const callLinkEl = document.getElementById("callLink");
    const waLinkEl = document.getElementById("waLink");

    if (revealBtn) {
      revealBtn.addEventListener("click", () => {
        if (!phone.trim()) {
          if (maskedPhoneEl) maskedPhoneEl.textContent = "Nömrə yoxdur";
          if (phoneHintEl) phoneHintEl.textContent = "Əlaqə nömrəsi əlavə edilməyib";
          revealBtn.disabled = true;
          return;
        }

        if (maskedPhoneEl) maskedPhoneEl.textContent = phone;
        if (phoneHintEl) phoneHintEl.textContent = "Nömrə açıldı";

        if (callLinkEl) {
          callLinkEl.href = telHref;
          callLinkEl.setAttribute("aria-disabled", "false");
        }

        if (waLinkEl) {
          waLinkEl.href = waHref;
          waLinkEl.setAttribute("aria-disabled", "false");
        }
      });
    }
  }

  // ---- cards ----
  function cardTpl(car, favOn) {
    const c = { ...car };

    c.img = getCarImg(c);
    c.mileage = c.mileage ?? c.km ?? 0;
    c.gearbox = c.gearbox ?? c.transmission ?? c.gear ?? "";
    c.fuel = c.fuel ?? c.fuelType ?? "";
    c.country = c.country ?? "AZ";
    c.city = c.city ?? "Bakı";

    return `
      <a class="cardlink" href="details.html?id=${encodeURIComponent(String(c.id))}" aria-label="${esc(c.brand)} ${esc(c.model)}">
        <article class="card">
          <div class="card__imgwrap">
            <img class="card__img" src="${esc(c.img)}" alt="${esc(c.brand)} ${esc(c.model)}">
            <div class="card__top">
              <button class="fav-btn ${favOn ? "is-on" : ""}" type="button" data-id="${esc(String(c.id))}" aria-label="Favorit">
                <svg class="fav-ic ic-off" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"
                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <svg class="fav-ic ic-on" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 21.23 4.22 13.45 3.16 12.39a5.5 5.5 0 0 1 7.78-7.78L12 5.67l1.06-1.06a5.5 5.5 0 0 1 7.78 7.78l-1.06 1.06L12 21.23Z"/>
                </svg>
              </button>

              <div class="badges">
                ${c.adType === 2 ? `<span class="badge vip">⭐VIP</span>` : ``}
                ${c.adType === 3 ? `<span class="badge premium">👑</span>` : ``}
              </div>
            </div>

            <div class="badge">${esc(countryName(c.country))} • ${esc(c.city)}</div>
          </div>

          <div class="card__body">
            <div class="card__title">${esc(c.brand)} ${esc(c.model)}</div>
            <div class="card__meta">
              <span>${esc(c.year)}</span><span>•</span>
              <span>${Number(c.mileage || 0).toLocaleString("az-AZ")} km</span><span>•</span>
              <span>${esc(c.fuel || "")}</span><span>•</span>
              <span>${esc(c.gearbox || "")}</span>
            </div>
            <div class="card__bottom">
              <div class="card__price-row">
                <div class="card__price">${esc(money(c.price))}</div>
                <div class="card__date" title="${esc(getCarDateLabel(c))}">${esc(getCarDateLabel(c))}</div>
              </div>
            </div>
          </div>
        </article>
      </a>
    `;
  }

  // ---- pager ----
  let allList = [];
  let filtered = [];
  let cursor = 0;
  let isLoading = false;
  let io = null;
  let lastTick = 0;

  function appendChunk(list) {
    const favs = loadFavs();
    const html = list.map((car) => cardTpl(car, favs.has(String(car.id)))).join("");
    grid.insertAdjacentHTML("beforeend", html);
  }

  function loadMore() {
    if (isLoading) return;

    if (cursor >= filtered.length) {
      setSentinelText("Hamısı göstərildi");
      if (io && sentinel) io.unobserve(sentinel);
      return;
    }

    isLoading = true;

    const next = filtered.slice(cursor, cursor + PAGE_SIZE);
    cursor += next.length;

    appendChunk(next);

    if (cursor >= filtered.length) {
      setSentinelText("Hamısı göstərildi");
      if (io && sentinel) io.unobserve(sentinel);
    } else {
      setSentinelText("Daha çox yüklənir…");
    }

    isLoading = false;
  }

  function restartObserver() {
    if (!sentinel) return;

    if (io) io.disconnect();

    io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;

      const now = Date.now();
      if (now - lastTick < THROTTLE_MS) return;
      lastTick = now;

      loadMore();
    }, { rootMargin: ROOT_MARGIN });

    io.observe(sentinel);
  }

  function initPager(list) {
    filtered = list.slice();
    cursor = 0;
    isLoading = false;

    grid.innerHTML = "";
    setCount(filtered.length);

    if (!filtered.length) {
      setEmptyUI(true);
      return;
    }

    setEmptyUI(false);
    setSentinelText("Yüklənir…");

    loadMore();
    restartObserver();
  }

  // ---- search ----
  function applySearch(q) {
    const t = norm(q);

    if (!t) {
      initPager(allList);
      return;
    }

    const res = allList.filter((c) => {
      const hay = norm(
        `${c.brand || ""} ${c.model || ""} ${c.year || ""} ${c.mileage || c.km || ""} ${c.fuel || c.fuelType || ""} ${c.gearbox || c.transmission || ""}`
      );
      return hay.includes(t);
    });

    initPager(res);
  }

  if (searchEl) {
    searchEl.addEventListener("input", (e) => {
      const v = e.target.value || "";
      if (clearBtn) clearBtn.hidden = v.length === 0;
      applySearch(v);
    });
  }

  if (clearBtn && searchEl) {
    clearBtn.addEventListener("click", () => {
      searchEl.value = "";
      clearBtn.hidden = true;
      applySearch("");
      searchEl.focus();
    });
  }

  // ---- fav click ----
  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".fav-btn");
    if (!btn) return;

    e.preventDefault();
    e.stopPropagation();

    const id = btn.getAttribute("data-id");
    if (!id) return;

    const favs = loadFavs();

    if (favs.has(String(id))) {
      favs.delete(String(id));
      btn.classList.remove("is-on");
    } else {
      favs.add(String(id));
      btn.classList.add("is-on");
    }

    saveFavs(favs);
  });

  // ---- init ----
  const salon = salons.find((x) => Number(x.id) === salonId);
  renderSalonHero(salon);

  if (!salon) {
    allList = [];
    initPager([]);
    return;
  }

  const salonsCount = salons.length || 1;

  allList = cars.filter((c) => {
    const real = Number(c?.salonId);
    if (Number.isFinite(real) && real > 0) return real === salonId;
    return getDemoSalonId(c?.id, salonsCount) === salonId;
  });

  initPager(allList);
})();