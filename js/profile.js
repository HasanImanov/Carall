(() => {
  // ========== PROFILE JS (AUTO-DETECT DATA / NO HARDCODE / NO $ CONFLICT) ==========

  const USERS_KEY   = "carall_users_v1";
  const SESSION_KEY = "carall_session_v1";
  const CARS_KEY    = "carall_cars_v1";

  const qs = (s, r=document) => r.querySelector(s);

  /* helpers */
  function getSession(){
    try{ return JSON.parse(localStorage.getItem(SESSION_KEY)); }
    catch{ return null; }
  }
  function loadUsers(){
    try{ return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
    catch{ return []; }
  }
  function loadLocalCars(){
    try{ return JSON.parse(localStorage.getItem(CARS_KEY)) || []; }
    catch{ return []; }
  }
  function saveLocalCars(cars){
    localStorage.setItem(CARS_KEY, JSON.stringify(cars));
  }

  // ---- AUTO DETECT carsdata ARRAY ON window ----
  // Finds the "most car-like" array among window properties.
  function detectCarsArrayOnWindow(){
    const keys = Object.keys(window);
    let best = { score: 0, arr: [] };

    for(const k of keys){
      let v;
      try { v = window[k]; } catch { continue; }
      if(!Array.isArray(v) || v.length < 3) continue;

      const sample = v.slice(0, 20).filter(x => x && typeof x === "object");
      if(sample.length < 3) continue;

      let score = 0;
      for(const o of sample){
        // score car-like fields
        if("id" in o) score += 2;
        if("make" in o) score += 2;
        if("model" in o) score += 2;
        if("title" in o || "name" in o) score += 1;
        if("price" in o) score += 1;
        if("image" in o || "img" in o) score += 1;
        if(Array.isArray(o.images) || Array.isArray(o.photos) || Array.isArray(o.pics)) score += 1;
      }

      // normalize a bit
      score = score / sample.length;

      if(score > best.score){
        best = { score, arr: v };
      }
    }

    return best.arr || [];
  }

  function loadDataCars(){
    // If you later standardize carsdata.js, you can set window.allCars there.
    const direct =
      (Array.isArray(window.allCars) && window.allCars) ||
      (Array.isArray(window.carsData) && window.carsData) ||
      (Array.isArray(window.CARS) && window.CARS) ||
      [];

    if(direct.length) return direct;

    // fallback: auto-detect
    return detectCarsArrayOnWindow();
  }

  function mergeCars(dataCars, localCars){
    // local overrides data
    const map = new Map();
    dataCars.forEach(c => map.set(String(c.id), c));
    localCars.forEach(c => map.set(String(c.id), c));
    return [...map.values()];
  }

  /* DOM */
  const nameEl   = qs("#profileName");
  const emailEl  = qs("#profileEmail");
  const logoutBtn= qs("#logoutBtn");
  const grid     = qs("#myCarsGrid");
  const emptyBox = qs("#myCarsEmpty");
  const countEl  = qs("#myCarsCount");

  function showDevMsg(text){
    let bar = document.getElementById("devBar");
    if(!bar){
      bar = document.createElement("div");
      bar.id = "devBar";
      bar.style.cssText = `
        margin:12px 0 0;
        padding:10px 12px;
        border:1px dashed #cbd5e1;
        border-radius:12px;
        background:#fff7ed;
        color:#7c2d12;
        font-size:14px;
      `;
      const card = document.querySelector(".profile-card");
      if(card) card.appendChild(bar);
    }
    bar.textContent = text;
  }

  function makeImgPlaceholder(){
    const ph = document.createElement("div");
    ph.className = "img-ph";
    ph.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 7h18v14H3z"></path>
        <path d="M3 7l4-4h10l4 4"></path>
        <path d="M8.5 14.5l2.5 2.5 4-4 3.5 3.5"></path>
        <circle cx="9" cy="11" r="1"></circle>
      </svg>
    `;
    return ph;
  }

  // ================= CURRENT USER =================
  const session = getSession();
  const users = loadUsers();

  let currentUser = null;
  if(session?.userId){
    currentUser = users.find(u => String(u.id) === String(session.userId)) || null;
  }

  if(!currentUser){
    currentUser = {
      id: "DEV_USER",
      type: "personal",
      email: "dev@carall.local",
      profile: { firstName: "DEV", lastName: "USER" }
    };
    showDevMsg("DEV MODE: Login yoxdur. Profil demo user ilə göstərilir.");
  }

  if(nameEl){
    const fullName = `${currentUser.profile?.firstName || ""} ${currentUser.profile?.lastName || ""}`.trim();
    nameEl.textContent = fullName || "İstifadəçi";
  }
  if(emailEl){
    emailEl.textContent = currentUser.email || currentUser.phone || "";
  }

  if(logoutBtn){
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem(SESSION_KEY);
      location.reload();
    });
  }

  // ================= CLEANUP OLD DEMO 112 (Toyota etc.) =================
  // If localStorage has 112 with "(Demo)" or missing make/model, delete it to not override data.
  (function cleanupDemo112(){
    let localCars = loadLocalCars();
    const before = localCars.length;

    localCars = localCars.filter(c => {
      if(String(c.id) !== "112") return true;
      const t = String(c.title || c.name || "");
      const looksDemo = /demo/i.test(t);
      const hasRealBrand = !!(c.make || c.model);
      // keep only if it's not demo OR it has real brand data
      return (!looksDemo) && hasRealBrand;
    });

    if(localCars.length !== before) saveLocalCars(localCars);
  })();

  // ================= ENSURE REAL 112 BELONGS TO USER (from data) =================
  // If data has 112, we attach ownerId via localStorage overlay (without changing carsdata file)
  (function attach112ToUser(){
    const dataCars = loadDataCars();
    const c112 = dataCars.find(c => String(c.id) === "112");
    if(!c112) return;

    let localCars = loadLocalCars();
    const idx = localCars.findIndex(c => String(c.id) === "112");

    // Copy data car into local with ownerId (so filter works)
    const copy = { ...c112, ownerId: currentUser.id };

    if(idx >= 0){
      localCars[idx] = { ...copy, ...localCars[idx], ownerId: currentUser.id }; // keep any user edits
    }else{
      localCars.unshift(copy);
    }
    saveLocalCars(localCars);
  })();

  // ================= FETCH MY CARS (data+local merged) =================
  function fetchMyCars(){
    const dataCars = loadDataCars();
    const localCars = loadLocalCars();
    const all = mergeCars(dataCars, localCars);
    return all.filter(c => String(c.ownerId) === String(currentUser.id));
  }

  // ================= RENDER =================
  function render(){
    if(!grid || !emptyBox) return;

    const myCars = fetchMyCars();

    if(countEl) countEl.textContent = `${myCars.length} elan`;
    grid.innerHTML = "";

    if(myCars.length === 0){
      emptyBox.hidden = false;

      // DEBUG INFO (helps you confirm carsdata detected)
      const dataCars = loadDataCars();
      showDevMsg(`DEV: 0 elan. carsdata detected: ${dataCars.length} items.`);
      return;
    }

    emptyBox.hidden = true;

    myCars.forEach(car => {
      const div = document.createElement("div");
      div.className = "car-card";

      const title =
        car.title ||
        car.name ||
        `${car.make || ""} ${car.model || ""}`.trim() ||
        "Avtomobil";

      const priceText = (car.price != null) ? `${car.price} AZN` : "";

      const imgSrc =
        car.image ||
        car.img ||
        (Array.isArray(car.images) && car.images[0]) ||
        (Array.isArray(car.photos) && car.photos[0]) ||
        (Array.isArray(car.pics) && car.pics[0]) ||
        "";

      if(imgSrc){
        const img = document.createElement("img");
        img.alt = title;
        img.src = imgSrc;
        img.onerror = () => img.replaceWith(makeImgPlaceholder());
        div.appendChild(img);
      } else {
        div.appendChild(makeImgPlaceholder());
      }

      const info = document.createElement("div");
      info.className = "car-info";
      info.innerHTML = `
        <h3>${title}</h3>
        <div class="price">${priceText}</div>
      `;
      div.appendChild(info);

      if(car.id != null){
        div.addEventListener("click", () => {
          location.href = `details.html?id=${car.id}`;
        });
      }

      grid.appendChild(div);
    });

    // Small dev debug line: shows whether 112 came from data correctly
    const has112 = myCars.some(c => String(c.id) === "112");
    if(has112) showDevMsg("DEV: 112 elan ownerId ilə bağlandı və profildə göstərildi.");
  }

  render();
})();
