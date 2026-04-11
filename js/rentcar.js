(() => {
  const PAGE_SIZE = 8;
  const ROOT_MARGIN = "450px 0px";
  const THROTTLE_MS = 160;

  const hero = document.getElementById("rentHero");
  const grid = document.getElementById("rentCarsGrid");
  const empty = document.getElementById("rentCarsEmpty");
  const countEl = document.getElementById("rentCarsCount");
  const sentinel = document.getElementById("pagerSentinel");
  const sentinelText = document.getElementById("sentinelText");

  const searchEl = document.getElementById("rentSearch");
  const clearBtn = document.getElementById("rentClear");

  if (!grid) return;

  const qs = new URLSearchParams(location.search);
  const rentId = Number(qs.get("id") || 0);

  const rents = Array.isArray(window.RENTS) ? window.RENTS : (typeof RENTS !== "undefined" ? RENTS : []);
  const cars = Array.isArray(window.CARS) ? window.CARS : (typeof CARS !== "undefined" ? CARS : []);

  const FAVS_KEY = "carall_favs_v1";
  const loadFavs = () => {
    try { return new Set((JSON.parse(localStorage.getItem(FAVS_KEY)) || []).map(String)); }
    catch { return new Set(); }
  };
  const saveFavs = (set) => localStorage.setItem(FAVS_KEY, JSON.stringify([...set]));

  const esc = (s) => String(s ?? "")
    .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
    .replaceAll('"',"&quot;").replaceAll("'","&#039;");

  const norm = (s) => String(s || "").toLowerCase().trim();

  const money = window.money || ((p) => {
    if (p === null || p === undefined || p === "") return "—";
    const n = Number(String(p).replace(/[^\d]/g, ""));
    if (!Number.isFinite(n)) return String(p);
    return n.toLocaleString("az-AZ") + " AZN";
  });

  const countryName = window.countryName || ((c) => c || "Azərbaycan");

  const getCarDateLabel = window.getCarDateLabel || ((car) => {
    const raw = car?.createdAt || car?.date || car?.created_at || "";
    return raw ? String(raw) : "—";
  });

  function getCarImg(car){
    if (car?.img) return car.img;
    const imgs = car?.images || car?.imgs || car?.photos || [];
    if (Array.isArray(imgs) && imgs.length) return imgs[0];
    return car?.image || car?.imgUrl || "";
  }

  function getDemoRentId(carId, rentsCount){
    const n = Number(carId);
    if (!Number.isFinite(n) || rentsCount <= 0) return 0;
    return ((n - 1) % rentsCount) + 1;
  }

  function setCount(n){ if (countEl) countEl.textContent = `${n} elan`; }
  function setSentinelText(t){ if (sentinelText) sentinelText.textContent = t; }
  function setEmptyUI(isEmpty){
    if (empty) empty.hidden = !isEmpty;
    if (sentinel) sentinel.hidden = isEmpty;
  }

  function renderHero(r){
    if (!hero) return;

    if (!r){
      hero.innerHTML = `
        <div class="hero-top">
          <div class="hero-left">
            <div class="hero-logo"><span class="hero-logo__txt">?</span></div>
            <div>
              <h1 class="hero-name">Profil tapılmadı</h1>
              <div class="hero-sub">Bu ID ilə rent profili yoxdur.</div>
            </div>
          </div>
        </div>
      `;
      return;
    }

    const name = r.name || "—";
    const city = r.city || "—";
    const address = r.address || "—";
    const phone = r.phone || "";

    hero.innerHTML = `
      <div class="hero-top">
        <div class="hero-left">
          <div class="hero-logo" aria-hidden="true">
            <span class="hero-logo__txt">${esc(name.trim().charAt(0).toUpperCase())}</span>
          </div>
          <div>
            <h1 class="hero-name">${esc(name)}</h1>
            <div class="hero-sub">${esc(city)} • ${esc(address)}</div>
          </div>
        </div>
        <div class="hero-actions">
          <button class="hero-btn" id="btnShowPhone" type="button">Nömrəni göstər</button>
        </div>
      </div>
    `;

    const btn = document.getElementById("btnShowPhone");
    if (btn){
      btn.addEventListener("click", () => {
        if (!phone.trim()){
          btn.textContent = "Nömrə yoxdur";
          btn.disabled = true;
          return;
        }
        btn.textContent = btn.dataset.opened === "1" ? "Nömrəni göstər" : phone;
        btn.dataset.opened = btn.dataset.opened === "1" ? "0" : "1";
      });
    }
  }

  function cardTpl(car, favOn){
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

  let allList = [];
  let filtered = [];
  let cursor = 0;
  let isLoading = false;
  let io = null;
  let lastTick = 0;

  function appendChunk(list){
    const favs = loadFavs();
    const html = list.map((car) => cardTpl(car, favs.has(String(car.id)))).join("");
    grid.insertAdjacentHTML("beforeend", html);
  }

  function loadMore(){
    if (isLoading) return;
    if (cursor >= filtered.length){
      setSentinelText("Hamısı göstərildi");
      if (io && sentinel) io.unobserve(sentinel);
      return;
    }

    isLoading = true;

    const next = filtered.slice(cursor, cursor + PAGE_SIZE);
    cursor += next.length;

    appendChunk(next);

    if (cursor >= filtered.length){
      setSentinelText("Hamısı göstərildi");
      if (io && sentinel) io.unobserve(sentinel);
    } else {
      setSentinelText("Daha çox yüklənir…");
    }

    isLoading = false;
  }

  function restartObserver(){
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

  function initPager(list){
    filtered = list.slice();
    cursor = 0;
    isLoading = false;

    grid.innerHTML = "";
    setCount(filtered.length);

    if (!filtered.length){
      setEmptyUI(true);
      return;
    }

    setEmptyUI(false);
    setSentinelText("Yüklənir…");

    loadMore();
    restartObserver();
  }

  function applySearch(q){
    const t = norm(q);
    if (!t) {
      initPager(allList);
      return;
    }

    const res = allList.filter((c) => {
      const hay = norm(`${c.brand || ""} ${c.model || ""} ${c.year || ""} ${c.mileage || c.km || ""} ${c.fuel || c.fuelType || ""} ${c.gearbox || c.transmission || ""}`);
      return hay.includes(t);
    });

    initPager(res);
  }

  if (searchEl){
    searchEl.addEventListener("input", (e) => {
      const v = e.target.value || "";
      if (clearBtn) clearBtn.hidden = v.length === 0;
      applySearch(v);
    });
  }

  if (clearBtn && searchEl){
    clearBtn.addEventListener("click", () => {
      searchEl.value = "";
      clearBtn.hidden = true;
      applySearch("");
      searchEl.focus();
    });
  }

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".fav-btn");
    if (!btn) return;

    e.preventDefault();
    e.stopPropagation();

    const id = String(btn.dataset.id || "");
    if (!id) return;

    const favs = loadFavs();
    if (favs.has(id)) {
      favs.delete(id);
      btn.classList.remove("is-on");
    } else {
      favs.add(id);
      btn.classList.add("is-on");
    }
    saveFavs(favs);
  });

  const rent = rents.find((x) => Number(x.id) === rentId);
  renderHero(rent);

  allList = cars.filter((car) => {
    if (String(car.ownerType || "").toLowerCase() === "rent" && Number(car.ownerId) === rentId) {
      return true;
    }
    return Number(car.rentId) === rentId;
  });

  if (!allList.length && rentId > 0 && rents.length) {
    allList = cars.filter((car) => getDemoRentId(car.id, rents.length) === rentId);
  }

  initPager(allList);
})();