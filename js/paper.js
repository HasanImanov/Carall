/* =========================
   CarAll paper.js (LATEST only) — FINAL (append, no flicker)
   - #latestGrid + #pagerSentinel
   - Only adType=1
   - Wait for ALL_CARS ready
   - First 8, then 8-8 append
   - No "Yüklənir…"
   ========================= */

(function () {
  const PAGE_SIZE = 8;
  const ROOT_MARGIN = "450px 0px";
  const THROTTLE_MS = 200;

  const grid = document.getElementById("latestGrid");
  const sentinel = document.getElementById("pagerSentinel");
  const textEl = document.getElementById("sentinelText");

  if (!grid || !sentinel) return;

  function getAllCars() {
    return window.ALL_CARS || window.CARS || window.cars || [];
  }

  function getTime(car) {
    return (car && (car.createdAt || car.id || 0)) || 0;
  }

  // Spinner OFF
  function setLoading(_) {
    if (!textEl) return;
    textEl.textContent = "";
    textEl.style.display = "none";
  }

  let SORTED = [];
  let cursor = 0;
  let isLoading = false;
  let io = null;
  let lastTs = 0;

  function reset() {
    const all = getAllCars();

    // ✅ only adType=1
    SORTED = (Array.isArray(all) ? all : [])
      .filter(c => String(c.adType) === "1")
      .slice()
      .sort((a, b) => getTime(b) - getTime(a));

    cursor = 0;
    grid.innerHTML = "";
  }

  function loadMore() {
    const now = Date.now();
    if (now - lastTs < THROTTLE_MS) return;
    lastTs = now;

    if (isLoading) return;
    if (cursor >= SORTED.length) {
      if (io) io.disconnect();
      return;
    }

    isLoading = true;
    setLoading(true);

    const prevCursor = cursor;
    const next = SORTED.slice(cursor, cursor + PAGE_SIZE);
    cursor += next.length;

    // ✅ first page append=false, next pages append=true
    const append = prevCursor > 0;
    renderCars(next, grid, append);

    isLoading = false;
    setLoading(false);

    if (cursor >= SORTED.length && io) io.disconnect();
  }

  function startIO() {
    if (io) io.disconnect();

    io = new IntersectionObserver(
      ([entry]) => {
        if (!entry || !entry.isIntersecting) return;
        loadMore();
      },
      { rootMargin: ROOT_MARGIN, threshold: 0 }
    );

    io.observe(sentinel);
  }

  function init() {
    if (window.__LATEST_PAPER_INIT__) return;
    window.__LATEST_PAPER_INIT__ = true;

    setLoading(false);
    reset();
    loadMore();  // first 8
    startIO();   // next pages on scroll
  }

  // ✅ Wait ALL_CARS ready (this fixes the “first time only 5” issue)
  document.addEventListener("DOMContentLoaded", () => {
    const wait = setInterval(() => {
      const all = getAllCars();
      if (Array.isArray(all) && all.length > 0) {
        clearInterval(wait);
        init();
      }
    }, 50);

    setTimeout(() => clearInterval(wait), 8000);
  });
})();
