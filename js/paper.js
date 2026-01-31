/* =========================
   CarAll paper.js (LATEST only) — AUTO-DETECT IDs
   - grid: #latestList OR #latestGrid
   - sentinel: #latestPager OR #pagerSentinel
   - text: #latestPagerText OR #sentinelText (optional)
   - Only adType=1
   - First 8, then 8-8 append (scroll-gated)
   ========================= */

(function () {
  const PAGE_SIZE = 8;
  const ROOT_MARGIN = "450px 0px";
  const THROTTLE_MS = 200;
  const TIMEOUT = 8000;

  const grid =
    document.getElementById("latestList") ||
    document.getElementById("latestGrid");

  const sentinel =
    document.getElementById("latestPager") ||
    document.getElementById("pagerSentinel");

  const textEl =
    document.getElementById("latestPagerText") ||
    document.getElementById("sentinelText");

  if (!grid || !sentinel) {
    console.warn("[LATEST] grid/sentinel tapılmadı", { grid, sentinel });
    return;
  }

  function getAllCars() {
    return window.ALL_CARS || window.CARS || window.cars || [];
  }

  function getTime(car) {
    const v = car?.createdAt ?? car?.id ?? 0;
    if (typeof v === "number") return v;
    const t = Date.parse(v);
    return Number.isFinite(t) ? t : 0;
  }

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

  // ✅ user scroll etməyincə pagination işləməsin (refreshdə 13 birdən olmasın)
  let userScrolled = false;
function armScrollGate() {
  const onFirstScroll = () => {
    if (userScrolled) return;
    userScrolled = true;

    window.removeEventListener("wheel", onFirstScroll, true);
    window.removeEventListener("touchmove", onFirstScroll, true);
    window.removeEventListener("scroll", onFirstScroll, true);

    // ✅ scroll olduysa, sentinel görünürsə dərhal növbəti page-ni gətir
    setTimeout(() => loadMore("io"), 0);
  };

  window.addEventListener("wheel", onFirstScroll, true);
  window.addEventListener("touchmove", onFirstScroll, true);
  window.addEventListener("scroll", onFirstScroll, true);
}


  function reset() {
    const all = getAllCars();

    SORTED = (Array.isArray(all) ? all : [])
      .filter(c => c && String(c.adType) === "1")
      .slice()
      .sort((a, b) => getTime(b) - getTime(a));

    cursor = 0;
    grid.innerHTML = "";

    console.log("[LATEST] ready:", { total: SORTED.length });
const resultInfo = document.getElementById("resultInfo");
if (resultInfo) resultInfo.textContent = `${SORTED.length} nəticə tapıldı.`;


  }

  function loadMore(reason) {
    const now = Date.now();
    if (now - lastTs < THROTTLE_MS) return;
    lastTs = now;

    if (isLoading) return;
    if (cursor >= SORTED.length) {
      if (io) io.disconnect();
      return;
    }

    // ✅ scroll gate
    // ✅ only block the very first IO trigger right after init (prevents 13 at once)
// ✅ scroll gate
if (!userScrolled && reason !== "first") return;


    isLoading = true;
    setLoading(true);

    const prevCursor = cursor;
    const next = SORTED.slice(cursor, cursor + PAGE_SIZE);
    cursor += next.length;

    const append = prevCursor > 0;

    if (typeof window.renderCars === "function") {
      window.renderCars(next, grid, append);
    } else {
      // minimal fallback
      grid.insertAdjacentHTML(
        append ? "beforeend" : "afterbegin",
        next.map(c => `<a class="cardlink" href="details.html?id=${c.id}">${c.brand||""} ${c.model||""}</a>`).join("")
      );
    }

    isLoading = false;
    setLoading(false);
  }

  function startIO() {
    if (io) io.disconnect();

    io = new IntersectionObserver(([entry]) => {
      if (!entry || !entry.isIntersecting) return;
      loadMore("io");
    }, { rootMargin: ROOT_MARGIN, threshold: 0 });

    io.observe(sentinel);
  }

  function init() {
    if (window.__LATEST_PAPER_INIT__) return;
    window.__LATEST_PAPER_INIT__ = true;

    setLoading(false);
    armScrollGate();
    reset();
    loadMore("first");
    startIO();
  }

  document.addEventListener("DOMContentLoaded", () => {
    const start = Date.now();
    (function waitData(){
      const all = getAllCars();
      if (Array.isArray(all) && all.length) {
        init();
        return;
      }
      if (Date.now() - start > TIMEOUT) {
        console.warn("[LATEST] data TIMEOUT (ALL_CARS/CARS/cars boşdur)");
        return;
      }
      setTimeout(waitData, 50);
    })();
  });
})();
