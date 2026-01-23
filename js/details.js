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
    if (lbOpen) renderLb(true, +1);
  });

  btnNext.addEventListener("click", () => {
    idx = (idx + 1) % imgs.length;
    setMain();
    if (lbOpen) renderLb(true, -1);
  });

  // Keyboard arrows (page)
  window.addEventListener("keydown", (e) => {
    const tag = (document.activeElement?.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea") return;

    if (e.key === "ArrowLeft") {
      idx = (idx - 1 + imgs.length) % imgs.length;
      setMain();
      if (lbOpen) renderLb(true, +1);
    }
    if (e.key === "ArrowRight") {
      idx = (idx + 1) % imgs.length;
      setMain();
      if (lbOpen) renderLb(true, -1);
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

    if (Math.abs(mainDy2) > Math.abs(mainDx2) * 1.2) return;

    if (ghostImg && ghostImg.style.opacity !== "1") {
      setGhost(mainDx2 < 0 ? -1 : +1);
    }

    moveDrag(mainDx2);
  }, { passive: true });

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
