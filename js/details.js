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

  // Swipe (mobile) for main image (loop)
 

  

const mainTrack = mainImg.parentElement; // wrapper (mainimg-wrap)

const setMainAnimated = (fromDir) => {
  const w = mainTrack.clientWidth || 360;

  mainTrack.style.transition = "none";
  mainTrack.style.transform = `translateX(${fromDir * w}px)`;

  requestAnimationFrame(() => {
    mainTrack.style.transition = "transform 220ms cubic-bezier(.2,.8,.2,1)";
    mainTrack.style.transform = "translateX(0)";
  });
};



  // ===== Section 2 info (unchanged) =====
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
  // ✅ LIGHTBOX (iPhone-like swipe + normal fit)
  // =====================================================================
  const lbBackdrop = document.createElement("div");
  lbBackdrop.className = "lb-backdrop";
  lbBackdrop.innerHTML = `
    <div class="lb" role="dialog" aria-modal="true">
      <div class="lb-count" id="lbCount">1 / 1</div>
      <button class="lb-close" id="lbClose" aria-label="Bağla">×</button>

      <button class="lb-btn lb-prev" id="lbPrev" aria-label="Əvvəlki"></button>

      <div class="lb-viewport" id="lbViewport">
        <div class="lb-track" id="lbTrack" style="height:100%; width:100%; display:flex; align-items:center; justify-content:center; touch-action: pan-y;">
          <img class="lb-img" id="lbImg" alt="" referrerpolicy="no-referrer"
               style="max-width:100%; max-height:100%; object-fit:contain;" />
        </div>
      </div>

      <button class="lb-btn lb-next" id="lbNext" aria-label="Növbəti"></button>
    </div>
  `;
  document.body.appendChild(lbBackdrop);

  const lb = {
    backdrop: lbBackdrop,
    img: lbBackdrop.querySelector("#lbImg"),
    viewport: lbBackdrop.querySelector("#lbViewport"),
    track: lbBackdrop.querySelector("#lbTrack"),
    count: lbBackdrop.querySelector("#lbCount"),
    close: lbBackdrop.querySelector("#lbClose"),
    prev: lbBackdrop.querySelector("#lbPrev"),
    next: lbBackdrop.querySelector("#lbNext"),
  };

  let lbOpen = false;

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

    // loop olduğu üçün düymələr həmişə görünsün
    lb.prev.style.display = "flex";
    lb.next.style.display = "flex";

    // “normal” görünsün deyə contain (CSS inline set edilib)
    // animasiya lazımdırsa, track-i kənardan gətir
    if (animate && fromDir) {
      const w = lb.viewport.clientWidth || 360;
      trackSet(fromDir * w, false);
      requestAnimationFrame(() => trackSet(0, true));
    } else {
      trackSet(0, false);
    }
  };

  const openLb = () => {
    lbOpen = true;
    lb.backdrop.classList.add("is-open");
    document.body.style.overflow = "hidden";
    renderLb(false);
  };

  const closeLb = () => {
    lbOpen = false;
    lb.backdrop.classList.remove("is-open");
    document.body.style.overflow = "";
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
  // dir: +1 -> prev image from left, -1 -> next image from right
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

  // ghost şəkli əsasın arxasınca “içəri” gəlir
  // x < 0 -> next (ghost sağdan gəlir), x > 0 -> prev (ghost soldan gəlir)
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

  // ilk dəfə horizontal hərəkət başlayanda ghost-u hazırla
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

    // çıxış: current kənara, ghost mərkəzə
    mainImg.style.transition = "transform 220ms cubic-bezier(.2,.8,.2,1)";
    mainImg.style.transform = `translate3d(${goNext ? -w : w}px,0,0)`;

    if (ghostImg) {
      ghostImg.style.transition = "transform 220ms cubic-bezier(.2,.8,.2,1)";
      ghostImg.style.transform = "translate3d(0,0,0)";
    }

    setTimeout(() => {
      idx = goNext ? (idx + 1) % imgs.length : (idx - 1 + imgs.length) % imgs.length;
      setMain(); // mainImg yeni şəkli alır

      resetMain2(false);
      requestAnimationFrame(() => resetMain2(true));
    }, 220);
  } else {
    // geri qayıt: current mərkəzə, ghost kənara gizlə
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
  openLb(idx);
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
  renderLb(true, -1); // soldan gəlsin
});

lb.next.addEventListener("click", (e) => {
  e.stopPropagation();
  idx = (idx + 1) % imgs.length;
  setMain();
  renderLb(true, +1); // sağdan gəlsin
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

    // yumuşaldılmış edge hissi (amma loop var, yenə də iPhone feel)
    const w = lb.viewport.clientWidth || 360;
    const damp = 0.95;
    const x = clamp(dx * damp, -w * 0.95, w * 0.95);

    trackSet(x, false);

    const now = performance.now();
    const dt = Math.max(1, now - lastT);
    v = (clientX - lastX) / dt; // px/ms
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
      // swipe out
      const outX = goNext ? -w : w;
      trackSet(outX, true);

      // swap after animation
      setTimeout(() => {
        idx = goNext ? (idx + 1) % imgs.length : (idx - 1 + imgs.length) % imgs.length;
        setMain();

        // new image comes from opposite side
        const fromDir = goNext ? +1 : -1;
        renderLb(false);
        const inX = fromDir * w;
        trackSet(inX, false);
        requestAnimationFrame(() => trackSet(0, true));
      }, 220);
    } else {
      // snap back
      trackSet(0, true);
    }
  };

  // touch events
  lb.viewport.addEventListener(
    "touchstart",
    (e) => {
      if (!lbOpen) return;
      if (e.touches.length !== 1) return;
      onStart(e.touches[0].clientX);
    },
    { passive: true }
  );

  lb.viewport.addEventListener(
    "touchmove",
    (e) => {
      if (!lbOpen) return;
      if (!swiping || e.touches.length !== 1) return;
      onMove(e.touches[0].clientX);
    },
    { passive: true }
  );

  lb.viewport.addEventListener(
    "touchend",
    () => {
      if (!lbOpen) return;
      onEnd();
    },
    { passive: true }
  );

  // mouse (desktop drag)
  let mouseDown = false;
  lb.viewport.addEventListener("mousedown", (e) => {
    if (!lbOpen) return;
    mouseDown = true;
    onStart(e.clientX);
  });
  window.addEventListener("mousemove", (e) => {
    if (!lbOpen || !mouseDown) return;
    onMove(e.clientX);
  });
  window.addEventListener("mouseup", () => {
    if (!lbOpen || !mouseDown) return;
    mouseDown = false;
    onEnd();
  });

  // ===== Init =====
  renderThumbs();
  setMain();
})();
