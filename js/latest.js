/* =========================
   CarAll - latest-page.js (FINAL)
   - PAGE: latest.html (Son elanlar)
   - only adType = 1
   - first 8, then 8-8 append
   - newest first (createdAt desc, fallback id desc)
   - no duplicates (dedupe by id)
   - safe single init + observer guard
   ========================= */

(function LATEST_PAGE_FINAL() {
  const FIRST = 8;
  const NEXT = 8;
  const ROOT_MARGIN = "500px 0px";
  const TIMEOUT = 8000;

  // ✅ single init (fayl 2 dəfə qoşulsa belə)
  if (window.__CARALL_LATEST_PAGE_INIT__) return;
  window.__CARALL_LATEST_PAGE_INIT__ = true;

  let list = [];
  let cursor = 0;
  let busy = false;
  let io = null;

  const rendered = new Set(); // ✅ dedupe by id

  const gridEl = () => document.getElementById("latestGrid");
  const sentinelEl = () => document.getElementById("pagerSentinel");
  const textEl = () => document.getElementById("sentinelText");
  const resultInfoEl = () => document.getElementById("resultInfo");

  function getAllCars() {
    // ✅ səndə bridge var: window.cars / window.ALL_CARS / window.CARS
    const a =
      (Array.isArray(window.ALL_CARS) && window.ALL_CARS) ||
      (Array.isArray(window.cars) && window.cars) ||
      (Array.isArray(window.CARS) && window.CARS) ||
      [];
    return a;
  }

  function toTime(v) {
    // createdAt number ola bilər, string ola bilər, boş ola bilər
    if (v == null) return null;
    if (typeof v === "number" && Number.isFinite(v)) return v;
    const t = Date.parse(String(v));
    return Number.isFinite(t) ? t : null;
  }

  function sortNewest(a, b) {
    const ta = toTime(a?.createdAt);
    const tb = toTime(b?.createdAt);

    // createdAt varsa, ona görə DESC
    if (ta != null || tb != null) return (tb || 0) - (ta || 0);

    // fallback: id DESC
    const ia = Number(a?.id) || 0;
    const ib = Number(b?.id) || 0;
    return ib - ia;
  }

  function onlyType1(all) {
    return (all || [])
      .filter((c) => c && Number(c.adType) === 1)
      .slice()
      .sort(sortNewest);
  }

  function setText(msg) {
    const t = textEl();
    if (t) t.textContent = msg || "";
  }

  function ensureSentinelVisible() {
    const s = sentinelEl();
    if (!s) return;
    s.style.minHeight = "44px";
    s.style.display = "block";
  }

  function safeChunk(chunk) {
    return (chunk || []).filter((c) => {
      const id = String(c?.id ?? "");
      if (!id) return false;
      if (rendered.has(id)) return false;
      rendered.add(id);
      return true;
    });
  }

  function renderChunk(chunk, append) {
    const g = gridEl();
    if (!g) return;

    const safe = safeChunk(chunk);
    if (!safe.length) return;

    if (typeof window.renderCars === "function") {
      window.renderCars(safe, g, append);
    }
  }

  function renderFirst() {
    const g = gridEl();
    if (!g) return;

    // hard reset
    g.innerHTML = "";
    cursor = 0;
    busy = false;
    rendered.clear();

    const first = list.slice(0, FIRST);
    cursor = first.length;

    renderChunk(first, false);

    const ri = resultInfoEl();
    if (ri) ri.textContent = `${list.length} nəticə tapıldı.`;

    setText("");
  }

  function loadMore() {
    if (busy) return;
    if (cursor >= list.length) return;

    busy = true;

    // ✅ cursor-u əvvəl irəli alırıq (observer double-fire olsa belə eyni chunk gəlməsin)
    const start = cursor;
    const end = Math.min(cursor + NEXT, list.length);
    cursor = end;

    // istəsən loading göstərə bilərik:
    // setText("Yüklənir…");

    setTimeout(() => {
      const next = list.slice(start, end);
      renderChunk(next, true);
      busy = false;
      setText("");
    }, 80);
  }

  function setupObserver() {
    const s = sentinelEl();
    if (!s) return;

    if (io) {
      try {
        io.disconnect();
      } catch {}
    }

    io = new IntersectionObserver(
      ([entry]) => {
        if (!entry || !entry.isIntersecting) return;
        loadMore();
      },
      { rootMargin: ROOT_MARGIN, threshold: 0 }
    );

    io.observe(s);
  }

  document.addEventListener("DOMContentLoaded", () => {
    // Əgər page flag istifadə edirsənsə, latest-də işləsin:
    // (flag yoxdursa, problem yaratmır)
    const page = document.body?.dataset?.page;
    if (page && page !== "latest") return;

    ensureSentinelVisible();

    const start = Date.now();
    (function waitData() {
      const all = getAllCars();
      const canRender = typeof window.renderCars === "function";
      const g = gridEl();
      const s = sentinelEl();

      if (all.length && canRender && g && s) {
        list = onlyType1(all);
        renderFirst();
        setupObserver();
        return;
      }

      if (Date.now() - start > TIMEOUT) {
        // heç nə yazmırıq, sadəcə sakit çıxır
        return;
      }
      setTimeout(waitData, 50);
    })();
  });
})();
