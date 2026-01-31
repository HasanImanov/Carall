/* =========================
   CarAll - VIP pager FINAL
   - grid: #carsGrid
   - sentinel: #vipSentinel
   - text: #vipSentinelText (optional)
   - data: window.cars / window.ALL_CARS / window.CARS
   - only adType 2 & 3
   - first 8, then 8-8 append (infinite)
   ========================= */

(function VIP_PAGER_FINAL() {
  const FIRST = 8;
  const NEXT  = 8;
  const ROOT_MARGIN = "600px 0px";
  const TIMEOUT = 8000;

  let list = [];
  let cursor = 0;
  let busy = false;
  let io = null;

  const gridEl = () => document.getElementById("carsGrid");
  const sentinelEl = () => document.getElementById("vipSentinel");
  const textEl = () => document.getElementById("vipSentinelText");

  function getAllCars() {
    if (Array.isArray(window.cars) && window.cars.length) return window.cars;
    if (Array.isArray(window.ALL_CARS) && window.ALL_CARS.length) return window.ALL_CARS;
    if (Array.isArray(window.CARS) && window.CARS.length) return window.CARS;
    return [];
  }

  function vipPremium(all) {
    return (all || []).filter((c) => c && (Number(c.adType) === 2 || Number(c.adType) === 3));
  }
  

  function setText(msg) {
    const t = textEl();
    if (t) t.textContent = msg || "";
  }

  function ensureSentinelVisible() {
    const s = sentinelEl();
    if (!s) return;
    s.style.minHeight = "48px";
    s.style.display = "block";
  }

  function renderChunk(chunk, append) {
    const g = gridEl();
    if (!g) return;

    if (typeof window.renderCars === "function") {
      window.renderCars(chunk, g, append);
    }
  }

  function renderFirst() {
    const g = gridEl();
    if (!g) return;

    g.innerHTML = "";
    cursor = 0;

    const first = list.slice(0, FIRST);
    cursor = first.length;

    renderChunk(first, false);

    if (cursor >= list.length) setText("");
    else setText("");
  }

  function loadMore() {
    if (busy) return;
    if (cursor >= list.length) return;

    busy = true;

    // istəyirsənsə: setText("Yüklənir…");
    setTimeout(() => {
      const next = list.slice(cursor, cursor + NEXT);
      cursor += next.length;

      renderChunk(next, true);

      busy = false;

      // istəyirsənsə: setText(cursor >= list.length ? "" : "");
      if (cursor >= list.length) setText("");
      else setText("");
    }, 120);
  }

  function setupObserver() {
    const s = sentinelEl();
    if (!s) return;

    if (io) {
      try { io.disconnect(); } catch {}
    }

    io = new IntersectionObserver(([entry]) => {
      if (!entry || !entry.isIntersecting) return;
      loadMore();
    }, { rootMargin: ROOT_MARGIN, threshold: 0 });

    io.observe(s);
  }

  document.addEventListener("DOMContentLoaded", () => {
    ensureSentinelVisible();

    const start = Date.now();
    (function waitData() {
      const all = getAllCars();
      const canRender = typeof window.renderCars === "function";
      const g = gridEl();
      const s = sentinelEl();

      if (all.length && canRender && g && s) {
        list = vipPremium(all);
        const resultInfo = document.getElementById("resultInfo");
        if (resultInfo) resultInfo.textContent = `${list.length} nəticə tapıldı.`;

        renderFirst();
        setupObserver();
        return;
      }

      if (Date.now() - start > TIMEOUT) return;
      setTimeout(waitData, 50);
    })();
  });
})();
