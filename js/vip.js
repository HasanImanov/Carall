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

  const API_BASE = "https://carall.az/api";

  async function fetchVipFromApi() {
    try {
      const res = await fetch(`${API_BASE}/Listings/full_filter`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          page: 1,
          pageSize: 100,
          includeTotalCount: false,
          isVip: true,
          sort: "date_desc"
        })
      });
      if (!res.ok) return [];
      const data = await res.json();
      const raw = Array.isArray(data) ? data : (data.data || data.items || []);
      const mapFn = typeof window.mapListing === "function" ? window.mapListing : (x) => x;
      return raw.map(mapFn);
    } catch (e) {
      return [];
    }
  }

  function vipPremium(all) {
    return (all || []).slice();
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

  document.addEventListener("DOMContentLoaded", async () => {
    ensureSentinelVisible();

    const g = gridEl();
    const s = sentinelEl();
    if (!g || !s) return;

    setText("Yüklənir...");

    const all = await fetchVipFromApi();

    if (typeof window.renderCars !== "function") {
      setText("Xəta baş verdi.");
      return;
    }

    list = vipPremium(all);
    const resultInfo = document.getElementById("resultInfo");
    if (resultInfo) resultInfo.textContent = `${list.length} nəticə tapıldı.`;

    renderFirst();
    setupObserver();
  });
})();
