(() => {
  const qs = new URLSearchParams(location.search);
  const id = qs.get("id");

  const cars = window.cars || [];
  const $ = (x) => document.getElementById(x);

  const safe = (v, fb = "—") =>
    v === null || v === undefined || String(v).trim() === "" ? fb : String(v);

  const fmtPrice = (p) => {
    if (p === null || p === undefined || p === "") return "—";
    const n = Number(String(p).replace(/[^\d]/g, ""));
    return Number.isFinite(n) ? `${n.toLocaleString("az-AZ")} AZN` : String(p);
  };

  const norm = (u) => String(u || "").trim();
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  // ===== DOM (details.html) =====
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

  // ===== Car tap =====
  const car = Array.isArray(cars) ? cars.find((c) => String(c.id) === String(id)) : null;

  if (!car) {
    if (carTitle) carTitle.textContent = "Elan tapılmadı";
    if (carSub) carSub.textContent = `ID: ${id} — uyğun elan yoxdur.`;
    if (carPrice) carPrice.textContent = "—";
    if (updatedAt) updatedAt.textContent = "Yenilənib: —";
    return;
  }
injectBreadcrumb(car);
injectSimilarAdsStrict(car, cars);
injectOwnerActions(car);
  // ===== Images: img first + images[] (unique) =====
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

  // ===== Main image render =====
  const setMain = () => {
    mainImg.src = imgs[idx];
    mainImg.setAttribute("referrerpolicy", "no-referrer");
    mainImg.onerror = () => {
      mainImg.onerror = null;
      mainImg.src = fallbackSvg;
    };

    imgCount.textContent = `${idx + 1} / ${imgs.length}`;

    // loop olduq üçün düymələri gizlətmirik
    btnPrev.style.display = "flex";
    btnNext.style.display = "flex";

    // active thumb
    [...thumbsGrid.querySelectorAll(".thumb")].forEach((t) => t.classList.remove("is-active"));
    const active = thumbsGrid.querySelector(`.thumb[data-i="${idx}"]`);
    if (active) active.classList.add("is-active");
  };

  const renderThumbs = () => {
    thumbsGrid.innerHTML = imgs
      .map(
        (src, i) => `
      <div class="thumb ${i === 0 ? "is-active" : ""}" data-i="${i}">
        <img src="${src}" alt="" loading="lazy" referrerpolicy="no-referrer"
             onerror="this.onerror=null; this.src='${fallbackSvg}'">
      </div>
    `
      )
      .join("");

    thumbsGrid.addEventListener("click", (e) => {
      const t = e.target.closest(".thumb");
      if (!t) return;
      idx = Number(t.dataset.i);
      setMain();
      if (lbOpen) renderLb(false); // popup varsa sync, animasiyasız
    });
  };

  // ===== LOOP buttons (main) =====
  btnPrev.addEventListener("click", () => {
  idx = (idx - 1 + imgs.length) % imgs.length;
  setMain();
  if (lbOpen) renderLb(true, -1); // ✅ prev
});

btnNext.addEventListener("click", () => {
  idx = (idx + 1) % imgs.length;
  setMain();
  if (lbOpen) renderLb(true, +1); // ✅ next
});


  // Keyboard arrows (page)
 // keyboard in popup (FIX)
window.addEventListener("keydown", (e) => {
  if (!lbOpen) return;

  e.preventDefault(); // scroll olmasın
  e.stopPropagation();

  if (e.key === "Escape") closeLb();

  if (e.key === "ArrowLeft") {
    idx = (idx - 1 + imgs.length) % imgs.length;
    setMain();
    renderLb(true, -1); // ✅ prev direction
  }

  if (e.key === "ArrowRight") {
    idx = (idx + 1) % imgs.length;
    setMain();
    renderLb(true, +1); // ✅ next direction
  }
});



  // ===== Section 2 info =====
  if (carTitle) carTitle.textContent = `${safe(car.brand, "")} ${safe(car.model, "")} ${safe(car.year, "")}`.trim() || "Elan";

  if (carSub) {
    carSub.textContent =
      [safe(car.city, ""), safe(car.fuel, ""), safe(car.gearbox, ""), car.mileage != null ? `${safe(car.mileage)} km` : ""]
        .filter(Boolean)
        .join(" • ") || "—";
  }

  if (carPrice) carPrice.textContent = fmtPrice(car.price);
  if (updatedAt) updatedAt.textContent = "Yenilənib: Bu gün";

  if (specsGrid) {
    const specs = [
      ["Şəhər", car.city],
      ["Ölkə", car.country],
      ["Marka", car.brand],
      ["Model", car.model],
      ["Buraxılış ili", car.year],
      ["Yanacaq", car.fuel],
      ["Sürətlər qutusu", car.gearbox],
      ["Yürüş", car.mileage != null ? `${car.mileage} km` : ""],
    ];

    specsGrid.innerHTML = specs
      .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== "")
      .map(
        ([k, v]) => `
        <div class="spec">
          <div class="k">${k}</div>
          <div class="v">${v}</div>
        </div>
      `
      )
      .join("");
  }

  if (carDesc && toggleDesc) {
    carDesc.textContent = car.description && String(car.description).trim() ? car.description : "Maşın haqqında məlumat əlavə edilməyib.";
    toggleDesc.addEventListener("click", () => {
      carDesc.classList.toggle("clamp");
      toggleDesc.textContent = carDesc.classList.contains("clamp") ? "Davamını oxu" : "Bağla";
    });
  }

  if (featuresChips) {
    const features = Array.isArray(car.features) ? car.features : [];
    featuresChips.innerHTML = features.length ? features.map((f) => `<span class="chip">${f}</span>`).join("") : `<span class="chip">Avadanlıq göstərilməyib</span>`;
  }

  // =====================================================================
  // ✅ LIGHTBOX (swipe + zoom + swipe-down close) — overlay menunu bloklamasın fix daxil
  // =====================================================================

  const lbBackdrop = document.createElement("div");
  lbBackdrop.className = "lb-backdrop";
  lbBackdrop.innerHTML = `
    <div class="lb" role="dialog" aria-modal="true">
      <div class="lb-count" id="lbCount">1 / 1</div>
      <button class="lb-close" id="lbClose" aria-label="Bağla">×</button>

      <button class="lb-btn lb-prev" id="lbPrev" aria-label="Əvvəlki"></button>

      <div class="lb-viewport" id="lbViewport">
        <div class="lb-track" id="lbTrack" style="height:100%; width:100%; display:flex; align-items:center; justify-content:center; touch-action:none;">
          <img class="lb-img" id="lbImg" alt="" referrerpolicy="no-referrer"
               style="max-width:100%; max-height:100%; object-fit:contain;" />
        </div>
      </div>

      <button class="lb-btn lb-next" id="lbNext" aria-label="Növbəti"></button>
    </div>
  `;
  document.body.appendChild(lbBackdrop);


  // ✅ DEFAULT: overlay heç nəyi bloklamasın (menyu klikləri işləsin)
lbBackdrop.style.setProperty("display", "none", "important");
lbBackdrop.style.setProperty("pointer-events", "none", "important");
const openLb = () => {
  lbOpen = true;

  lbBackdrop.style.setProperty("display", "block", "important");
  lbBackdrop.style.setProperty("pointer-events", "auto", "important");

  lb.backdrop.classList.add("is-open");
  document.body.style.overflow = "hidden";

  renderLb(false);
  resetZoom();
};

const closeLb = () => {
  lbOpen = false;

  lb.backdrop.classList.remove("is-open");
  document.body.style.overflow = "";

  resetZoom();

  lbBackdrop.style.setProperty("pointer-events", "none", "important");
  lbBackdrop.style.setProperty("display", "none", "important");
};


  const favBtn = document.getElementById("favBtn");
  if (favBtn) favBtn.dataset.id = car.id;

  const lb = {
    backdrop: lbBackdrop,
    box: lbBackdrop.querySelector(".lb"),
    img: lbBackdrop.querySelector("#lbImg"),
    viewport: lbBackdrop.querySelector("#lbViewport"),
    track: lbBackdrop.querySelector("#lbTrack"),
    count: lbBackdrop.querySelector("#lbCount"),
    close: lbBackdrop.querySelector("#lbClose"),
    prev: lbBackdrop.querySelector("#lbPrev"),
    next: lbBackdrop.querySelector("#lbNext"),
  };

  let lbOpen = false;

  // ==========================================================
  // ✅ ZOOM (pinch + double tap) + PAN + SWIPE DOWN TO CLOSE
  // ==========================================================
  lb.viewport.style.touchAction = "none";
  lb.track.style.touchAction = "none";

  let zScale = 1;
  let zTx = 0;
  let zTy = 0;

  let isPanning = false;
  let panStartX = 0, panStartY = 0;
  let panBaseTx = 0, panBaseTy = 0;

  let isPinching = false;
  let pinchStartDist = 0;
  let pinchStartScale = 1;

  let isClosingDrag = false;
  let closeStartY = 0;
  let closeDy = 0;

  let lastTapT = 0;
  let lastTapX = 0;
  let lastTapY = 0;

  const clamp2 = (n, a, b) => Math.max(a, Math.min(b, n));

  const maxPan = () => {
    const vw = lb.viewport.clientWidth || 360;
    const vh = lb.viewport.clientHeight || 640;
    const mx = ((zScale - 1) * vw) / 2;
    const my = ((zScale - 1) * vh) / 2;
    return { mx, my };
  };

  function applyZoom(animate = false) {
    lb.img.style.transition = animate ? "transform 180ms ease" : "none";
    lb.img.style.transformOrigin = "center center";
    lb.img.style.transform = `translate3d(${zTx}px, ${zTy}px, 0) scale(${zScale})`;
  }

  function resetZoom() {
    zScale = 1;
    zTx = 0;
    zTy = 0;
    applyZoom(false);

    if (lb.box) {
      lb.box.style.transition = "none";
      lb.box.style.transform = "translate3d(0,0,0)";
    }
    lb.backdrop.style.transition = "none";
    lb.backdrop.style.opacity = "";
  }

  function setZoom(newScale, animate = true) {
    zScale = clamp2(newScale, 1, 4);
    const { mx, my } = maxPan();
    zTx = clamp2(zTx, -mx, mx);
    zTy = clamp2(zTy, -my, my);
    applyZoom(animate);
  }

  const dist = (t1, t2) => {
    const dx = t2.clientX - t1.clientX;
    const dy = t2.clientY - t1.clientY;
    return Math.hypot(dx, dy);
  };

  const handleDoubleTap = (x, y) => {
    if (zScale === 1) {
      zScale = 2.5;

      const vw = lb.viewport.clientWidth || 360;
      const vh = lb.viewport.clientHeight || 640;

      const dx = (vw / 2 - x) * 0.35;
      const dy = (vh / 2 - y) * 0.35;

      zTx = clamp2(dx, -((zScale - 1) * vw) / 2, ((zScale - 1) * vw) / 2);
      zTy = clamp2(dy, -((zScale - 1) * vh) / 2, ((zScale - 1) * vh) / 2);

      applyZoom(true);
    } else {
      zScale = 1;
      zTx = 0;
      zTy = 0;
      applyZoom(true);
    }
  };

  // ===== Lightbox track animation =====
  const trackSet = (x, withAnim) => {
    lb.track.style.transition = withAnim ? "transform 220ms cubic-bezier(.2,.8,.2,1)" : "none";
    lb.track.style.transform = `translate3d(${x}px,0,0)`;
  };

  const renderLb = (animate = false, fromDir = 0) => {
    lb.img.src = imgs[idx];
    lb.img.setAttribute("referrerpolicy", "no-referrer");
    lb.img.onerror = () => {
      lb.img.onerror = null;
      lb.img.src = fallbackSvg;
    };

    lb.count.textContent = `${idx + 1} / ${imgs.length}`;

    lb.prev.style.display = "flex";
    lb.next.style.display = "flex";

    if (animate && fromDir) {
      const w = lb.viewport.clientWidth || 360;
      trackSet(fromDir * w, false);
      requestAnimationFrame(() => trackSet(0, true));
    } else {
      trackSet(0, false);
    }

    resetZoom();
  };

 const openLbSafe = () => {
  lbBackdrop.style.setProperty("display", "block", "important");
  lbBackdrop.style.setProperty("pointer-events", "auto", "important");
  openLb(); // köhnə funksiyanı çağırır
};

const closeLbSafe = () => {
  closeLb(); // köhnə funksiyanı çağırır
  lbBackdrop.style.setProperty("pointer-events", "none", "important");
  lbBackdrop.style.setProperty("display", "none", "important");
};


  // ===== Main slider: drag shows next/prev image + tap opens popup =====
  const ghostImg = document.getElementById("ghostImg");

  let mainTouchActive = false;
  let mainStartX2 = 0;
  let mainStartY2 = 0;
  let mainDx2 = 0;
  let mainDy2 = 0;
  let mainDidSwipe = false;

  const resetMain2 = (animate = true) => {
    mainImg.style.transition = animate ? "transform 220ms cubic-bezier(.2,.8,.2,1)" : "none";
    mainImg.style.transform = "translate3d(0,0,0)";

    if (ghostImg) {
      ghostImg.style.transition = animate ? "transform 220ms cubic-bezier(.2,.8,.2,1), opacity 120ms ease" : "none";
      ghostImg.style.transform = "translate3d(0,0,0)";
      ghostImg.style.opacity = "0";
    }
  };

  const setGhost = (dir) => {
    if (!ghostImg) return;
    const w = (mainImg.parentElement?.clientWidth || 360);

    const ghostIndex = dir === -1 ? (idx + 1) % imgs.length : (idx - 1 + imgs.length) % imgs.length;
    ghostImg.src = imgs[ghostIndex];
    ghostImg.setAttribute("referrerpolicy", "no-referrer");
    ghostImg.onerror = () => { ghostImg.onerror = null; ghostImg.src = fallbackSvg; };

    ghostImg.style.transition = "none";
    ghostImg.style.opacity = "1";
    ghostImg.style.transform = `translate3d(${dir === -1 ? w : -w}px,0,0)`;
  };

  const moveDrag = (x) => {
    mainImg.style.transition = "none";
    mainImg.style.transform = `translate3d(${x}px,0,0)`;

    if (!ghostImg) return;
    const w = (mainImg.parentElement?.clientWidth || 360);

    const dir = x < 0 ? -1 : +1;
    const gx = (dir === -1 ? w + x : -w + x);
    ghostImg.style.transition = "none";
    ghostImg.style.transform = `translate3d(${gx}px,0,0)`;
  };

  mainImg.addEventListener("touchstart", (e) => {
    if (!e.touches || e.touches.length !== 1) return;

    mainTouchActive = true;
    mainDidSwipe = false;

    mainStartX2 = e.touches[0].clientX;
    mainStartY2 = e.touches[0].clientY;
    mainDx2 = 0;
    mainDy2 = 0;

    resetMain2(false);
  }, { passive: true });

mainImg.addEventListener("touchmove", (e) => {
  if (!mainTouchActive || !e.touches || e.touches.length !== 1) return;

  const x = e.touches[0].clientX;
  const y = e.touches[0].clientY;

  mainDx2 = x - mainStartX2;
  mainDy2 = y - mainStartY2;

  // vertikal scroll üstünlükdürsə burax
  if (Math.abs(mainDy2) > Math.abs(mainDx2) * 1.2) return;

  // ✅ BU ƏN VACİB HİSSƏ
  e.preventDefault();

  if (ghostImg && ghostImg.style.opacity !== "1") {
    setGhost(mainDx2 < 0 ? -1 : +1);
  }

  moveDrag(mainDx2);

}, { passive: false });


  mainImg.addEventListener("touchend", () => {
    if (!mainTouchActive) return;
    mainTouchActive = false;

    const wrap = mainImg.parentElement;
    const w = wrap ? wrap.clientWidth : 360;
    const abs = Math.abs(mainDx2);

    if (abs < 12) {
      resetMain2(true);
      return;
    }

    const threshold = w * 0.18;
    const goNext = mainDx2 < 0;

    if (abs > threshold) {
      mainDidSwipe = true;

      mainImg.style.transition = "transform 220ms cubic-bezier(.2,.8,.2,1)";
      mainImg.style.transform = `translate3d(${goNext ? -w : w}px,0,0)`;

      if (ghostImg) {
        ghostImg.style.transition = "transform 220ms cubic-bezier(.2,.8,.2,1)";
        ghostImg.style.transform = "translate3d(0,0,0)";
      }

      setTimeout(() => {
  idx = goNext ? (idx + 1) % imgs.length : (idx - 1 + imgs.length) % imgs.length;
  setMain();

  resetMain2(false);
  requestAnimationFrame(() => resetMain2(true));
}, 220);

    } else {
      mainImg.style.transition = "transform 220ms cubic-bezier(.2,.8,.2,1)";
      mainImg.style.transform = "translate3d(0,0,0)";

      if (ghostImg) {
        const dir = mainDx2 < 0 ? -1 : +1;
        ghostImg.style.transition = "transform 220ms cubic-bezier(.2,.8,.2,1), opacity 160ms ease";
        ghostImg.style.transform = `translate3d(${dir === -1 ? w : -w}px,0,0)`;
        ghostImg.style.opacity = "0";
      }
    }
  }, { passive: true });

  mainImg.addEventListener("click", () => {
    if (mainDidSwipe) {
      mainDidSwipe = false;
      return;
    }
    openLb(idx); // parametr versən də problem deyil
  });

  lb.close.addEventListener("click", closeLb);
  lb.backdrop.addEventListener("click", (e) => {
    if (e.target === lb.backdrop) closeLb();
  });

  // buttons (loop)
  lb.prev.addEventListener("click", (e) => {
    e.stopPropagation();
    idx = (idx - 1 + imgs.length) % imgs.length;
    setMain();
    renderLb(true, -1);
  });

  lb.next.addEventListener("click", (e) => {
    e.stopPropagation();
    idx = (idx + 1) % imgs.length;
    setMain();
    renderLb(true, +1);
  });

  // keyboard in popup
  window.addEventListener("keydown", (e) => {
    if (!lbOpen) return;

    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowLeft") {
      idx = (idx - 1 + imgs.length) % imgs.length;
      setMain();
      renderLb(true, +1);
    }
    if (e.key === "ArrowRight") {
      idx = (idx + 1) % imgs.length;
      setMain();
      renderLb(true, -1);
    }
  });

  // --- iPhone-like swipe (smooth drag + snap) ---
  let swiping = false;
  let startX = 0;
  let dx = 0;
  let lastT = 0;
  let lastX = 0;
  let v = 0;

  const onStart = (clientX) => {
    swiping = true;
    startX = clientX;
    dx = 0;
    lastT = performance.now();
    lastX = clientX;
    v = 0;
    trackSet(0, false);
  };

  const onMove = (clientX) => {
    if (!swiping) return;
    dx = clientX - startX;

    const w = lb.viewport.clientWidth || 360;
    const damp = 0.95;
    const x = clamp(dx * damp, -w * 0.95, w * 0.95);

    trackSet(x, false);

    const now = performance.now();
    const dt = Math.max(1, now - lastT);
    v = (clientX - lastX) / dt;
    lastT = now;
    lastX = clientX;
  };

  const onEnd = () => {
    if (!swiping) return;
    swiping = false;

    const w = lb.viewport.clientWidth || 360;
    const abs = Math.abs(dx);

    const goNext = dx < 0;
    const shouldChange = abs > w * 0.18 || Math.abs(v) > 0.6;

    if (shouldChange) {
      const outX = goNext ? -w : w;
      trackSet(outX, true);

      setTimeout(() => {
        idx = goNext ? (idx + 1) % imgs.length : (idx - 1 + imgs.length) % imgs.length;
        setMain();

        const fromDir = goNext ? +1 : -1;
        renderLb(false);
        const inX = fromDir * w;
        trackSet(inX, false);
        requestAnimationFrame(() => trackSet(0, true));
      }, 220);
    } else {
      trackSet(0, true);
    }
  };

  // ✅ touch events (zoom + pan + swipe nav + swipe-down close)
  lb.viewport.addEventListener(
    "touchstart",
    (e) => {
      if (!lbOpen) return;

      // double-tap (yalnız 1 barmaq)
      if (e.touches.length === 1) {
        const now = performance.now();
        const x = e.touches[0].clientX;
        const y = e.touches[0].clientY;

        const dt = now - lastTapT;
        const ddx = Math.abs(x - lastTapX);
        const ddy = Math.abs(y - lastTapY);

        if (dt < 280 && ddx < 22 && ddy < 22) {
          e.preventDefault();
          handleDoubleTap(x, y);
          lastTapT = 0;
          return;
        }

        lastTapT = now;
        lastTapX = x;
        lastTapY = y;
      }

      if (e.touches.length === 2) {
        e.preventDefault();
        isPinching = true;
        isPanning = false;
        isClosingDrag = false;

        pinchStartDist = dist(e.touches[0], e.touches[1]);
        pinchStartScale = zScale;
        return;
      }

      if (e.touches.length !== 1) return;

      const t = e.touches[0];
      const x = t.clientX;
      const y = t.clientY;

      // zoom varsa -> pan
      if (zScale > 1) {
        e.preventDefault();
        isPanning = true;
        isPinching = false;
        isClosingDrag = false;

        panStartX = x;
        panStartY = y;
        panBaseTx = zTx;
        panBaseTy = zTy;
        return;
      }

      // zScale === 1: həm nav, həm swipe-down close
      isPanning = false;
      isPinching = false;
      isClosingDrag = false;

      onStart(x);

      closeStartY = y;
      closeDy = 0;
    },
    { passive: false }
  );

  lb.viewport.addEventListener(
    "touchmove",
    (e) => {
      if (!lbOpen) return;

      // pinch move
      if (isPinching && e.touches.length === 2) {
        e.preventDefault();
        const d = dist(e.touches[0], e.touches[1]);
        const ratio = d / Math.max(1, pinchStartDist);
        const nextScale = pinchStartScale * ratio;
        setZoom(nextScale, false);
        return;
      }

      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      const x = t.clientX;
      const y = t.clientY;

      // pan move (zoom > 1)
      if (isPanning && zScale > 1) {
        e.preventDefault();
        const dxp = x - panStartX;
        const dyp = y - panStartY;

        const { mx, my } = maxPan();
        zTx = clamp2(panBaseTx + dxp, -mx, mx);
        zTy = clamp2(panBaseTy + dyp, -my, my);
        applyZoom(false);
        return;
      }

      // zScale === 1: decide nav vs swipe-down close
      const dy = y - closeStartY;
      const ddx = x - startX;

      if (!isClosingDrag) {
        if (dy > 8 && Math.abs(dy) > Math.abs(ddx) * 1.15) {
          e.preventDefault();
          isClosingDrag = true;
          swiping = false;
          trackSet(0, false);
        }
      }

      if (isClosingDrag) {
        e.preventDefault();
        closeDy = Math.max(0, dy);

        if (lb.box) {
          lb.box.style.transition = "none";
          lb.box.style.transform = `translate3d(0, ${closeDy}px, 0)`;
        }
        const vh = lb.viewport.clientHeight || 640;
        const alpha = clamp2(1 - closeDy / (vh * 0.9), 0.25, 1);
        lb.backdrop.style.opacity = String(alpha);
        return;
      }

      onMove(x);
    },
    { passive: false }
  );

  lb.viewport.addEventListener(
    "touchend",
    () => {
      if (!lbOpen) return;

      if (isPinching) {
        isPinching = false;

        if (zScale < 1.05) {
          zScale = 1;
          zTx = 0;
          zTy = 0;
          applyZoom(true);
        } else {
          setZoom(zScale, true);
        }
        return;
      }

      if (isPanning) {
        isPanning = false;
        setZoom(zScale, true);
        return;
      }

      if (isClosingDrag) {
        isClosingDrag = false;

        const vh = lb.viewport.clientHeight || 640;
        const threshold = Math.max(120, vh * 0.18);

        if (closeDy > threshold) {
          lb.backdrop.style.opacity = "";
          closeLb();
        } else {
          if (lb.box) {
            lb.box.style.transition = "transform 200ms cubic-bezier(.2,.8,.2,1)";
            lb.box.style.transform = "translate3d(0,0,0)";
          }
          lb.backdrop.style.transition = "opacity 200ms ease";
          lb.backdrop.style.opacity = "";
        }
        return;
      }

      onEnd();
    },
    { passive: true }
  );

  // mouse (desktop drag) — zoom varsa nav etmə
  let mouseDown = false;
  lb.viewport.addEventListener("mousedown", (e) => {
    if (!lbOpen) return;
    if (zScale > 1) return;
    mouseDown = true;
    onStart(e.clientX);
  });
  window.addEventListener("mousemove", (e) => {
    if (!lbOpen || !mouseDown) return;
    if (zScale > 1) return;
    onMove(e.clientX);
  });
  window.addEventListener("mouseup", () => {
    if (!lbOpen || !mouseDown) return;
    mouseDown = false;
    if (zScale > 1) return;
    onEnd();
  });

  // ===== Init =====
  renderThumbs();
  setMain();
})();

// ====================== FAVORITES ======================
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

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".fav-btn");
  if (!btn) return;

  e.preventDefault();
  e.stopPropagation();

  const id = String(btn.dataset.id);

  const favIds = loadFavs();
  if (favIds.has(id)) favIds.delete(id);
  else favIds.add(id);

  saveFavs(favIds);

  btn.classList.toggle("is-on");
});

function loadFavsInsert() {
  const favIds = loadFavs();
  const list = window.cars || [];
  const btn = document.getElementById("favBtn");
  if (!btn) return;

  const id = String(btn.dataset.id);

  list.forEach((car) => {
    const carId = String(car.id);
    car.fav = favIds.has(carId);

    if (carId === id) {
      if (favIds.has(carId)) btn.classList.add("is-on");
      else btn.classList.remove("is-on");
    }
  });
}

loadFavsInsert();
document.addEventListener("DOMContentLoaded", () => {
  const advPanel = document.getElementById("advPanel");
  const btnGroup = document.querySelector(".actions .btn-group");

  if (!advPanel || !btnGroup) return;

  const sync = () => {
    const isOpen =
      advPanel.classList.contains("is-open") &&
      !advPanel.hasAttribute("hidden");

    btnGroup.classList.toggle("is-adv-open", isOpen);
  };

  new MutationObserver(sync).observe(advPanel, {
    attributes: true,
    attributeFilter: ["class", "hidden"],
  });

  sync();
});
/* =========================
   Details breadcrumb (HTML-a toxunmadan)
   - Gallery section-un ustune insert edir
   - Marka / model kliklənəndir
   - Elan № kliklənmir (istəsən edərik)
   ========================= */

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[m]));
}

function padId(n, len = 7) {
  const s = String(n ?? "");
  return s.length >= len ? s : "0".repeat(len - s.length) + s;
}

function getBrandModelFromCar(car) {
  // Səndə field fərqli ola bilər deyə çox variantlı götürürük
  const brand = (car?.brand || car?.make || car?.marka || "").trim(); 
  const model = (car?.model || car?.modelName || car?.mod || "").trim();

  if (brand || model) return { brand, model };

  // Fallback: h1#carTitle içindən parse (məs: "Lada Niva 2024")
  const title = (document.getElementById("carTitle")?.textContent || "").trim();
  if (!title || title === "—") return { brand: "", model: "" };

  const parts = title.split(/\s+/).filter(Boolean);
  // minimum ehtimal: ilk söz marka, ikinci söz model
  return {
    brand: parts[0] || "",
    model: parts[1] || ""
  };
}

function injectBreadcrumb(car) {
  // artıq əlavə olunubsa təkrarlama
  if (document.querySelector(".dcrumb")) return;

  const main = document.querySelector("main.wrap");
  if (!main) return;

  // Gallery section-u tap (səndə birinci section: <section class="card p16">)
  const gallerySection = main.querySelector("section.card.p16");
  if (!gallerySection) return;

  const { brand, model } = getBrandModelFromCar(car);
  const idTxt = `Elan № ${padId(car?.id, 7)}`;

  // Linklər (indexdə filterlə işləyirsə super olacaq)
  // İstəməsən, sadəcə "index.html" də edə bilərik.
  const brandHref = `index.html?brand=${encodeURIComponent(brand)}`;
  const modelHref = `index.html?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}`;

  const parts = [];

  // İstədiyin dizilim: MODEL › MARKA › ELAN
  // (istəsən MARKA › MODEL də edərik)
  // ✅ DİZİLİM: MARKA › MODEL › ELAN
if (brand) parts.push(`<a href="${brandHref}">${escapeHtml(brand)}</a>`);
if (model) parts.push(`<span class="sep">›</span><a href="${modelHref}">${escapeHtml(model)}</a>`);


  // Elan № klikli olmasın
  parts.push(`<span class="sep">›</span><span class="muted">${escapeHtml(idTxt)}</span>`);

  const nav = document.createElement("nav");
  nav.className = "dcrumb";
  nav.setAttribute("aria-label", "Breadcrumb");
  nav.innerHTML = parts.join(" ");

  // Gallery section-un üstüne yerləşdir (HTML-a toxunmadan)
  gallerySection.parentNode.insertBefore(nav, gallerySection);
}


function fmtPriceAZ(p){
  if (p === null || p === undefined || p === "") return "—";
  const n = Number(String(p).replace(/[^\d]/g, ""));
  return Number.isFinite(n) ? n.toLocaleString("az-AZ") : String(p);
}

function pickSimilarCars(current, allCars, limit=8){
  const curId = String(current?.id);

  const score = (c) => {
    let s = 0;
    if (!c) return -1;
    if (String(c.id) === curId) return -999;

    // ən çox: eyni marka+model
    if ((c.brand||"") === (current.brand||"")) s += 40;
    if ((c.model||"") === (current.model||"")) s += 60;

    // eyni şəhər / il yaxınlığı / yanacaq
    if ((c.city||"") === (current.city||"")) s += 10;
    if ((c.fuel||"") === (current.fuel||"")) s += 6;

    const y1 = Number(c.year), y2 = Number(current.year);
    if (Number.isFinite(y1) && Number.isFinite(y2)){
      const d = Math.abs(y1 - y2);
      s += Math.max(0, 12 - d * 3); // 0..12
    }

    return s;
  };

  return (allCars || [])
    .filter(Boolean)
    .map(c => ({ c, s: score(c) }))
    .filter(x => x.s > -100)
    .sort((a,b) => b.s - a.s)
    .slice(0, limit)
    .map(x => x.c);
}

function injectSimilarAdsStrict(currentCar, allCars){
  // 1 dəfə əlavə et
  if (document.getElementById("simSec")) return;

  const main = document.querySelector("main.wrap");
  if (!main) return;

  const info2 = main.querySelector("section.info2");
  if (!info2) return;

  const brand = String(currentCar?.brand || "").trim();
  const model = String(currentCar?.model || "").trim();
  const curId = String(currentCar?.id);

  // ✅ STRICT: yalnız eyni marka+model
  const list = (allCars || [])
    .filter(c => c && String(c.id) !== curId)
    .filter(c => String(c.brand || "").trim() === brand && String(c.model || "").trim() === model);

  // Section yaradıb info2-dən sonra qoyuruq
  const sec = document.createElement("section");
  sec.className = "card simsec";
  sec.id = "simSec";

  // “Hamısını göstər” — filtrli index
  const allHref = `index.html?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}`;

  if (!list.length) {
    // ✅ Bənzər yoxdursa — mesaj
    sec.innerHTML = `
      <div class="simhead">
        <h2>BƏNZƏR ELANLAR</h2>
      </div>
      <div style="padding: 6px 2px 14px; color:#6b7280; font-weight:650;">
        Bənzər elan yoxdur.
      </div>
    `;
    info2.parentNode.insertBefore(sec, info2.nextSibling);
    return;
  }

  // ✅ varsa — neçə dənədisə o qədər render
  sec.innerHTML = `
    <div class="simhead">
      <h2>BƏNZƏR ELANLAR</h2>
      <a href="${allHref}">Hamısını göstər</a>
    </div>
    <div class="simgrid" id="simGrid"></div>
  `;

  info2.parentNode.insertBefore(sec, info2.nextSibling);

  const grid = sec.querySelector("#simGrid");
  const fallback = "images/Logo.png";

  grid.innerHTML = list.map(car => {
    const img = (car.img || (Array.isArray(car.images) ? car.images[0] : "") || fallback);
    const price = fmtPriceAZ(car.price);
    const title = `${(car.brand||"")} ${(car.model||"")}`.trim() || "Elan";

    const specs = [
      car.year,
      car.engine ? `${car.engine}` : null,
      car.mileage != null ? `${car.mileage} km` : null
    ].filter(Boolean).join(", ");

    const meta = [
      car.city || "",
      "bu gün"
    ].filter(Boolean).join(", ");

    return `
      <a class="simcard" href="details.html?id=${encodeURIComponent(car.id)}">
        <div class="simfav" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>

        <div class="simimg">
          <img src="${img}" alt="" loading="lazy"
            referrerpolicy="no-referrer"
            onerror="this.onerror=null; this.src='${fallback}'">
        </div>

        <div class="simbody">
          <div class="simprice">${price} ₼</div>
          <div class="simtitle">${escapeHtml(title)}</div>
          <div class="simspec">${escapeHtml(specs)}</div>
          <div class="simmeta">${escapeHtml(meta)}</div>
        </div>
      </a>
    `;
  }).join("");
}

// helper-lər (səndə varsa təkrar yazma)
function fmtPriceAZ(p){
  if (p === null || p === undefined || p === "") return "—";
  const n = Number(String(p).replace(/[^\d]/g, ""));
  return Number.isFinite(n) ? n.toLocaleString("az-AZ") : String(p);
}

// ====================== OWNER + EDIT (Password gated) ======================

// escapeHtml səndə artıq varsa, bunu yazma
function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[m]));
}

// Demo password verify:
// 1) car.password / car.pin varsa onu yoxlayır
// 2) yoxdursa localStorage map: carall_ad_pw_map_v1 { "id":"pin" }
// function verifyAdPassword(car, inputPw){
//   const typed = String(inputPw || "").trim();

//   const pw = String(car?.password || car?.pin || "").trim();
//   if (pw) return typed === pw;

//   try{
//     const map = JSON.parse(localStorage.getItem("carall_ad_pw_map_v1") || "{}");
//     const saved = String(map[String(car.id)] || "").trim();
//     if (!saved) return false;
//     return typed === saved;
//   }catch{
//     return false;
//   }
// }

function verifyAdPassword(car, inputPw){
  // 🚧 DEMO MODE — hamı üçün eyni şifrə
  return String(inputPw || "").trim() === "1234";
}


function injectEditUI(car){
  // 1 dəfə
  if (document.getElementById("editPanel")) return;

  // ✅ Owner bar-ı tap (Düzəliş et düyməsinin olduğu yer)
  const ownerBar = document.getElementById("ownerBar");
  if (!ownerBar) return;

  const panel = document.createElement("div");
  panel.className = "editpanel";
  panel.id = "editPanel";
  panel.hidden = true;

  const v = (x) => (x === null || x === undefined ? "" : String(x));

  const curPrice   = v(car?.price);
  const curCity    = v(car?.city);
  const curCountry = v(car?.country);
  const curYear    = v(car?.year);
  const curMileage = v(car?.mileage);
  const curFuel    = v(car?.fuel);
  const curGear    = v(car?.gearbox);
  const curEngine  = v(car?.engine);
  const curDesc    = v(car?.description);

  const curFeatures = Array.isArray(car?.features)
    ? car.features.join(", ")
    : v(car?.features);

  panel.innerHTML = `
  <div class="editgrid">

    <div class="editfield">
      <label>Qiymət (AZN)</label>
      <input id="ePrice" type="number" min="0" step="50"
             value="${escapeHtml(curPrice.replace(/[^\d]/g,""))}"
             placeholder="Məs: 23500" />
    </div>

    <div class="editfield">
      <label>Şəhər</label>
      <select id="eCity">
        ${["Bakı","Sumqayıt","Gəncə","Mingəçevir","Şirvan","Lənkəran","Naxçıvan","Şəki","Quba","Qəbələ","Xaçmaz"]
          .map(x => `<option value="${escapeHtml(x)}" ${x===curCity ? "selected":""}>${escapeHtml(x)}</option>`)
          .join("")}
        ${curCity && !["Bakı","Sumqayıt","Gəncə","Mingəçevir","Şirvan","Lənkəran","Naxçıvan","Şəki","Quba","Qəbələ","Xaçmaz"].includes(curCity)
          ? `<option value="${escapeHtml(curCity)}" selected>${escapeHtml(curCity)}</option>` : ""}
      </select>
    </div>

    <div class="editfield">
      <label>İl</label>
      <select id="eYear">
        ${Array.from({length: 40}, (_,i) => String(new Date().getFullYear() - i))
          .map(y => `<option value="${y}" ${y===curYear ? "selected":""}>${y}</option>`)
          .join("")}
        ${curYear && !/^\d{4}$/.test(curYear) ? `<option value="${escapeHtml(curYear)}" selected>${escapeHtml(curYear)}</option>` : ""}
      </select>
    </div>

    <div class="editfield">
      <label>Yanacaq</label>
      <select id="eFuel">
        ${["Benzin","Dizel","Hibrid","Elektro","Qaz"]
          .map(x => `<option value="${escapeHtml(x)}" ${x===curFuel ? "selected":""}>${escapeHtml(x)}</option>`)
          .join("")}
        ${curFuel && !["Benzin","Dizel","Hibrid","Elektro","Qaz"].includes(curFuel)
          ? `<option value="${escapeHtml(curFuel)}" selected>${escapeHtml(curFuel)}</option>` : ""}
      </select>
    </div>

    <div class="editfield">
      <label>Sürətlər qutusu</label>
      <select id="eGearbox">
        ${["Avtomat","Mexanika","Robot","Variator"]
          .map(x => `<option value="${escapeHtml(x)}" ${x===curGear ? "selected":""}>${escapeHtml(x)}</option>`)
          .join("")}
        ${curGear && !["Avtomat","Mexanika","Robot","Variator"].includes(curGear)
          ? `<option value="${escapeHtml(curGear)}" selected>${escapeHtml(curGear)}</option>` : ""}
      </select>
    </div>

    <div class="editfield">
      <label>Yürüş (km)</label>
      <input id="eMileage" type="number" min="0" step="1000"
             value="${escapeHtml(curMileage.replace(/[^\d]/g,""))}"
             placeholder="Məs: 125000" />
    </div>

    <div class="editfield">
      <label>Ölkə</label>
      <input id="eCountry" type="text" value="${escapeHtml(curCountry)}" placeholder="Məs: AZ" />
    </div>

    <div class="editfield">
      <label>Mühərrik</label>
      <input id="eEngine" type="text" value="${escapeHtml(curEngine)}" placeholder="Məs: 2.5 L" />
    </div>

    <div class="editfield" style="grid-column:1/-1;">
      <label>Avadanlıqlar (vergül ilə)</label>
      <input id="eFeatures" type="text" value="${escapeHtml(curFeatures)}" placeholder="Məs: ABS, Kamera, Kondisioner" />
    </div>

    <div class="editfield" style="grid-column:1/-1;">
      <label>Maşın haqqında</label>
      <textarea id="eDesc" placeholder="Açıqlama...">${escapeHtml(curDesc)}</textarea>
    </div>

  </div>

  <div class="editactions">
    <button class="btnCancel" id="eCancel" type="button">Ləğv et</button>
    <button class="btnSave" id="eSave" type="button">Yadda saxla</button>
  </div>

  <div class="editnote">
    *Hələlik UI preview. Sabah SQL/back-end qoşulanda real yadda saxlanacaq.
  </div>
`;


  // ✅ Paneli Düzəliş et-in ALTINA qoy
  ownerBar.insertAdjacentElement("afterend", panel);

  document.getElementById("eCancel")?.addEventListener("click", () => {
    panel.hidden = true;
  });

  document.getElementById("eSave")?.addEventListener("click", () => {
    const price   = String(document.getElementById("ePrice")?.value ?? "").trim();
const city    = document.getElementById("eCity")?.value ?? "";
const country = document.getElementById("eCountry")?.value ?? "";
const year    = document.getElementById("eYear")?.value ?? "";
const mileage = String(document.getElementById("eMileage")?.value ?? "").trim();
const fuel    = document.getElementById("eFuel")?.value ?? "";
const gearbox = document.getElementById("eGearbox")?.value ?? "";
const engine  = document.getElementById("eEngine")?.value ?? "";
const desc    = document.getElementById("eDesc")?.value ?? "";
const feats   = document.getElementById("eFeatures")?.value ?? "";


    // car obyektini yenilə (UI üçün)
    car.price = price;
    car.city = city;
    car.country = country;
    car.year = year;
    car.mileage = mileage;
    car.fuel = fuel;
    car.gearbox = gearbox;
    car.engine = engine;
    car.description = desc;

    const featArr = String(feats).split(",").map(x=>x.trim()).filter(Boolean);
    car.features = featArr;

    // ekranda qiymət
    const priceEl = document.getElementById("carPrice");
    if (priceEl) priceEl.textContent = fmtPrice(price);

    // title (brand model year)
    const titleEl = document.getElementById("carTitle");
    if (titleEl) titleEl.textContent =
      `${safe(car.brand,"")} ${safe(car.model,"")} ${safe(year,"")}`.trim() || "Elan";

    // sub
    const subEl = document.getElementById("carSub");
    if (subEl){
      subEl.textContent =
        [safe(city,""), safe(fuel,""), safe(gearbox,""), mileage ? `${safe(mileage)} km` : ""]
          .filter(Boolean).join(" • ") || "—";
    }

    // updated
    const upd = document.getElementById("updatedAt");
    if (upd) upd.textContent = "Yenilənib: Bu gün";

    // desc
    const carDesc = document.getElementById("carDesc");
    if (carDesc) carDesc.textContent = desc && String(desc).trim()
      ? desc
      : "Maşın haqqında məlumat əlavə edilməyib.";

    // specs grid
    const specsGrid = document.getElementById("specsGrid");
    if (specsGrid){
      const specs = [
        ["Şəhər", city],
        ["Ölkə", country],
        ["Marka", car.brand],
        ["Model", car.model],
        ["Buraxılış ili", year],
        ["Yanacaq", fuel],
        ["Sürətlər qutusu", gearbox],
        ["Yürüş", mileage ? `${mileage} km` : ""],
        ["Mühərrik", engine],
      ];

      specsGrid.innerHTML = specs
        .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== "")
        .map(([k, v]) => `
          <div class="spec">
            <div class="k">${escapeHtml(k)}</div>
            <div class="v">${escapeHtml(v)}</div>
          </div>
        `).join("");
    }

    // features chips
    const chips = document.getElementById("featuresChips");
    if (chips){
      chips.innerHTML = featArr.length
        ? featArr.map(f => `<span class="chip">${escapeHtml(f)}</span>`).join("")
        : `<span class="chip">Avadanlıq göstərilməyib</span>`;
    }

    panel.hidden = true;
    alert("UI: yadda saxlandı ✅ (sabah SQL qoşulanda real olacaq)");
  });
}


function injectOwnerActions(car){
  if (document.getElementById("ownerBar")) return;

  const main = document.querySelector("main.wrap");
  if (!main) return;

  // 🔽 Avadanlıqlar blokunu tap
const features = document.getElementById("featuresChips");
if (!features) return;

// Avadanlıqların olduğu block (ən yaxın .block)
const featuresBlock = features.closest(".block");
if (!featuresBlock) return;

// owner bar
const bar = document.createElement("div");
bar.className = "ownerbar";
bar.id = "ownerBar";
bar.innerHTML = `
  <button class="btnOwner" id="btnEditOwner" type="button">Düzəliş et</button>
  <button class="btnOwner btnDanger" id="btnDelOwner" type="button">Sil</button>
`;

// ✅ Avadanlıqlar bitəndən SONRA əlavə et
featuresBlock.parentNode.insertBefore(bar, featuresBlock.nextSibling);


  // password modal
  const back = document.createElement("div");
  back.className = "pwbackdrop";
  back.id = "pwBackdrop";
  back.innerHTML = `
    <div class="pwmodal" role="dialog" aria-modal="true" aria-label="Şifrə təsdiqi">
      <div class="pwhead">
        <div class="pwtitle" id="pwTitle">Şifrəni daxil edin</div>
        <button class="pwclose" id="pwClose" type="button" aria-label="Bağla">×</button>
      </div>

      <div class="pwfield">
        <label>Elan şifrəsi</label>
        <input id="pwInput" type="password" autocomplete="off" placeholder="••••" />
        <div class="pwerr" id="pwErr">Şifrə yanlışdır.</div>
      </div>

      <div help="" style="margin-top:10px; font-size:12px; color:#6b7280; font-weight:650;">
        *Şifrə elan yerləşdiriləndən sonra göndəriləcək.
      </div>

      <div class="pwactions">
        <button class="pwbtn pwbtnCancel" id="pwCancel" type="button">Ləğv et</button>
        <button class="pwbtn pwbtnOk" id="pwOk" type="button">Təsdiqlə</button>
      </div>
    </div>
  `;
  document.body.appendChild(back);

  const btnEdit = document.getElementById("btnEditOwner");
  const btnDel  = document.getElementById("btnDelOwner");
  const inp     = document.getElementById("pwInput");
  const err     = document.getElementById("pwErr");

  let pending = null; // "edit" | "delete"

  const openPw = (action) => {
    pending = action;
    document.getElementById("pwTitle").textContent =
      action === "delete" ? "Silmək üçün şifrəni daxil edin" : "Düzəliş üçün şifrəni daxil edin";

    if (inp) inp.value = "";
    if (err) err.style.display = "none";
    back.classList.add("is-open");
    setTimeout(() => inp?.focus(), 0);
  };

  const closePw = () => {
    back.classList.remove("is-open");
    pending = null;
  };

  btnEdit?.addEventListener("click", () => openPw("edit"));
  btnDel?.addEventListener("click", () => openPw("delete"));

  back.addEventListener("click", (e) => { if (e.target === back) closePw(); });
  document.getElementById("pwClose")?.addEventListener("click", closePw);
  document.getElementById("pwCancel")?.addEventListener("click", closePw);

  document.getElementById("pwOk")?.addEventListener("click", () => {
    const ok = verifyAdPassword(car, inp?.value);
    if (!ok){
      if (err) err.style.display = "block";
      inp?.focus();
      return;
    }

    const action = pending;
    closePw();

   if (action === "edit") {
  injectEditUI(car);

  const panel = document.getElementById("editPanel");
  if (panel) {
    panel.hidden = false;
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  return;
}

    if (action === "delete") {
  const yes = confirm("Elanı silmək istədiyinizə əminsiniz?");
  if (!yes) return;
  alert("UI: Elan silindi ✅ (sabah SQL qoşulanda real olacaq)");
  return;
}
  });

  inp?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("pwOk")?.click();
    if (e.key === "Escape") closePw();
  });
}
