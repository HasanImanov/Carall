(() => {

    
  const qs = new URLSearchParams(location.search);
  const id = qs.get("id");

  const cars = window.cars || [];
  const $ = (x) => document.getElementById(x);

  const safe = (v, fb="—") => (v === null || v === undefined || String(v).trim()==="") ? fb : String(v);
  const fmtPrice = (p) => {
    if (p === null || p === undefined || p === "") return "—";
    const n = Number(String(p).replace(/[^\d]/g,""));
    return Number.isFinite(n) ? `${n.toLocaleString("az-AZ")} AZN` : String(p);
  };
  const norm = (u) => String(u || "").trim();

  // DOM
  const mainImg = $("mainImg");
  const btnPrev = $("btnPrev");
  const btnNext = $("btnNext");
  const imgCount = $("imgCount");
  const thumbsGrid = $("thumbsGrid");

  const carTitle = $("carTitle");
  const carSub = $("carSub");
  const carPrice = $("carPrice");
  const updatedAt = $("updatedAt");

  const specsGrid = $("specsGrid");
  const carDesc = $("carDesc");
  const toggleDesc = $("toggleDesc");
  const featuresChips = $("featuresChips");

  const missing = [];
  if (!mainImg) missing.push("mainImg");
  if (!btnPrev) missing.push("btnPrev");
  if (!btnNext) missing.push("btnNext");
  if (!imgCount) missing.push("imgCount");
  if (!thumbsGrid) missing.push("thumbsGrid");
  if (missing.length) {
    console.error("DETAILS: DOM tapılmadı:", missing.join(", "));
    return;
  }

  // Find car
  const car = Array.isArray(cars) ? cars.find(c => String(c.id) === String(id)) : null;
  if (!car) {
    if (carTitle) carTitle.textContent = "Elan tapılmadı";
    if (carSub) carSub.textContent = `ID: ${id} — uyğun elan yoxdur.`;
    if (carPrice) carPrice.textContent = "—";
    if (updatedAt) updatedAt.textContent = "Yenilənib: —";
    return;
  }
  // ===== FAVORITES (details) =====
const favBtn = document.getElementById("favBtn");
const FAV_KEY = "carall_favs_v1";
const carId = Number(car.id);

const loadFavs = () => {
  try { return (JSON.parse(localStorage.getItem(FAV_KEY)) || []).map(Number); }
  catch { return []; }
};
const saveFavs = (arr) => localStorage.setItem(FAV_KEY, JSON.stringify(arr));

let favs = loadFavs();

const syncFav = () => {
  if (!favBtn) return;
  favBtn.classList.toggle("is-on", favs.includes(carId));
};

syncFav();

favBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();

  if (favs.includes(carId)) favs = favs.filter(x => x !== carId);
  else favs.push(carId);

  saveFavs(favs);
  syncFav();
});


  // Images unique: img first + images[]
  const seen = new Set();
  const imgs = [];
  const push = (u) => {
    const url = norm(u);
    if (!url) return;
    const key = url.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    imgs.push(url);
  };
  push(car.img);
  if (Array.isArray(car.images)) car.images.forEach(push);
  if (!imgs.length) imgs.push("images/Logo.png");

  const fallbackSvg =
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(`
      <svg xmlns='http://www.w3.org/2000/svg' width='1200' height='700'>
        <rect width='100%' height='100%' fill='#eef2f7'/>
        <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
              font-family='Arial' font-size='42' fill='#6b7280'>
          Şəkil yüklənmədi
        </text>
      </svg>
    `);

  let idx = 0;

  const setMain = () => {
    mainImg.src = imgs[idx];
    mainImg.setAttribute("referrerpolicy", "no-referrer");
    mainImg.onerror = () => { mainImg.onerror = null; mainImg.src = fallbackSvg; };

    imgCount.textContent = `${idx + 1} / ${imgs.length}`;
    btnPrev.style.display = (idx === 0) ? "none" : "flex";
    btnNext.style.display = (idx === imgs.length - 1) ? "none" : "flex";

    [...thumbsGrid.querySelectorAll(".thumb")].forEach(t => t.classList.remove("is-active"));
    const active = thumbsGrid.querySelector(`.thumb[data-i="${idx}"]`);
    if (active) active.classList.add("is-active");
  };

  const renderThumbs = () => {
    thumbsGrid.innerHTML = imgs.map((src, i) => `
      <div class="thumb ${i===0 ? "is-active":""}" data-i="${i}">
      
        <img src="${src}" alt="" loading="lazy" referrerpolicy="no-referrer"
             onerror="this.onerror=null; this.src='${fallbackSvg}'">
      </div>
    `).join("");

    thumbsGrid.addEventListener("click", (e) => {
      const t = e.target.closest(".thumb");
      if (!t) return;
      idx = Number(t.dataset.i);
      setMain();
    });
  };

  // Buttons
  btnPrev.addEventListener("click", () => { if (idx>0){ idx--; setMain(); } });
  btnNext.addEventListener("click", () => { if (idx<imgs.length-1){ idx++; setMain(); } });

  // Keyboard (page + popup)
  window.addEventListener("keydown", (e) => {
    const tag = (document.activeElement?.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea") return;

    if (e.key === "ArrowLeft" && idx>0) { idx--; setMain(); if (lbOpen) renderLb(); }
    if (e.key === "ArrowRight" && idx<imgs.length-1) { idx++; setMain(); if (lbOpen) renderLb(); }
    if (e.key === "Escape" && lbOpen) closeLb();
  });

  // Swipe (mobile)
  let startX = 0;
  mainImg.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive:true });
  mainImg.addEventListener("touchend", (e) => {
    const diff = e.changedTouches[0].clientX - startX;
    if (Math.abs(diff) < 45) return;
    if (diff < 0 && idx < imgs.length-1) idx++;
    if (diff > 0 && idx > 0) idx--;
    setMain();
  }, { passive:true });

  // ===== Section 2 info =====
  if (carTitle) carTitle.textContent = `${safe(car.brand,"")} ${safe(car.model,"")} ${safe(car.year,"")}`.trim() || "Elan";
  if (carSub) carSub.textContent = [
    safe(car.city,""), safe(car.fuel,""), safe(car.gearbox,""),
    car.mileage != null ? `${safe(car.mileage)} km` : ""
  ].filter(Boolean).join(" • ") || "—";

  if (carPrice) carPrice.textContent = fmtPrice(car.price);
  if (updatedAt) updatedAt.textContent = "Yenilənib: Bu gün";

  if (specsGrid) {
    const specs = [
      ["Şəhər", car.city], ["Ölkə", car.country],
      ["Marka", car.brand], ["Model", car.model],
      ["Buraxılış ili", car.year], ["Yanacaq", car.fuel],
      ["Sürətlər qutusu", car.gearbox],
      ["Yürüş", car.mileage != null ? `${car.mileage} km` : ""],
    ];
    specsGrid.innerHTML = specs
      .filter(([,v]) => v!==undefined && v!==null && String(v).trim()!=="")
      .map(([k,v]) => `<div class="spec"><div class="k">${k}</div><div class="v">${v}</div></div>`)
      .join("");
  }

  if (carDesc && toggleDesc) {
    carDesc.textContent = (car.description && String(car.description).trim())
      ? car.description
      : "Maşın haqqında məlumat əlavə edilməyib.";
    toggleDesc.addEventListener("click", () => {
      carDesc.classList.toggle("clamp");
      toggleDesc.textContent = carDesc.classList.contains("clamp") ? "Davamını oxu" : "Bağla";
    });
  }

  if (featuresChips) {
    const features = Array.isArray(car.features) ? car.features : [];
    featuresChips.innerHTML = features.length
      ? features.map(f => `<span class="chip">${f}</span>`).join("")
      : `<span class="chip">Avadanlıq göstərilməyib</span>`;
  }

  // ===== LIGHTBOX (zoom + drag) =====
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
  let scale = 1, tx = 0, ty = 0;
  let dragging = false, sx = 0, sy = 0, stx = 0, sty = 0;

  const clamp = (n,a,b)=>Math.max(a,Math.min(b,n));
  const apply = () => {
    lb.img.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    lb.zoomLabel.textContent = `${Math.round(scale*100)}%`;
  };
  const reset = () => { scale = 1; tx = 0; ty = 0; apply(); };

  const renderLb = () => {
    lb.img.src = imgs[idx];
    lb.count.textContent = `${idx+1} / ${imgs.length}`;
    lb.prev.style.display = (idx===0) ? "none":"flex";
    lb.next.style.display = (idx===imgs.length-1) ? "none":"flex";
    reset();
  };
  const openLb = () => {
    lbOpen = true;
    lb.backdrop.classList.add("is-open");
    document.body.style.overflow = "hidden";
    renderLb();
  };
  const closeLb = () => {
    lbOpen = false;
    lb.backdrop.classList.remove("is-open");
    document.body.style.overflow = "";
  };

  mainImg.addEventListener("click", openLb);

  lb.close.addEventListener("click", closeLb);
  lb.backdrop.addEventListener("click", (e)=>{ if(e.target===lb.backdrop) closeLb(); });

  lb.prev.addEventListener("click", (e)=>{ e.stopPropagation(); if(idx>0){ idx--; setMain(); renderLb(); }});
  lb.next.addEventListener("click", (e)=>{ e.stopPropagation(); if(idx<imgs.length-1){ idx++; setMain(); renderLb(); }});

  // wheel zoom
  lb.viewport.addEventListener("wheel", (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.12 : 0.12;
    const ns = clamp(scale + delta, 1, 5);

    const rect = lb.viewport.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    const k = ns / scale;
    tx = cx - k * (cx - tx);
    ty = cy - k * (cy - ty);

    scale = ns;
    apply();
  }, { passive:false });

  // drag
  lb.viewport.addEventListener("mousedown", (e)=>{
    dragging = true;
    lb.viewport.classList.add("is-dragging");
    sx = e.clientX; sy = e.clientY;
    stx = tx; sty = ty;
  });
  window.addEventListener("mousemove", (e)=>{
    if(!dragging || !lbOpen) return;
    tx = stx + (e.clientX - sx);
    ty = sty + (e.clientY - sy);
    apply();
  });
  window.addEventListener("mouseup", ()=>{
    dragging = false;
    lb.viewport.classList.remove("is-dragging");
  });

  // dblclick zoom
  lb.viewport.addEventListener("dblclick", (e)=>{
    e.preventDefault();
    if(scale === 1){ scale = 2; }
    else { scale = 1; tx = 0; ty = 0; }
    apply();
  });

  // Init
  renderThumbs();
  setMain();
  
})();
