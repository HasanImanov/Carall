/* ============================
   CarAll paper.js (FINAL)
   - Infinite scroll sentinel
   - Spinner shows, then fades out after data ends
   - NO re-render on loadMore (prevents cards swapping)
   - Based on your current code structure
   ============================ */

(function () {
  const PAGE_SIZE = 8;

  // Local state (prefixed to avoid collisions)
  let __FILTERED = [];
  let __SORTED = [];
  let __VISIBLE = [];

  let __page = 1;
  let __hasMore = true;
  let __isLoading = false;
  let __io = null;

  /* ----------------------------
     DOM helpers
  ---------------------------- */
  function getSentinelEl() {
    return document.getElementById("pagerSentinel") || document.getElementById("listSentinel");
  }
  function getSentinelTextEl() {
    return document.getElementById("sentinelText");
  }

  function ensureSpinnerStylesOnce() {
    if (document.getElementById("carallSpinnerStyles")) return;

    const css = `
      .carall-spinner{
        width: 18px;
        height: 18px;
        border-radius: 999px;
        border: 2px solid rgba(0,0,0,.18);
        border-top-color: rgba(0,0,0,.55);
        display: inline-block;
        vertical-align: -3px;
        margin-right: 8px;
        animation: carallSpin 0.8s linear infinite;
      }
      @keyframes carallSpin { to { transform: rotate(360deg); } }

      .list-sentinel{
        width: 100%;
        padding: 16px 0 24px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .list-sentinel__inner{
        min-height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .list-sentinel__text{
        font-size: 14px;
        opacity: .75;
        display: inline-flex;
        align-items: center;
        transition: opacity .35s ease; /* ✅ fade-out */
      }
      .list-sentinel__text.is-fading{
        opacity: 0; /* ✅ yavaş yox olsun */
      }
    `;

    const style = document.createElement("style");
    style.id = "carallSpinnerStyles";
    style.textContent = css;
    document.head.appendChild(style);
  }

  function setSentinelHTMLLoading(textEl) {
    ensureSpinnerStylesOnce();
    textEl.classList.remove("is-fading");
    textEl.innerHTML = `<span class="carall-spinner" aria-hidden="true"></span>Yüklənir…`;
  }

  function fadeOutAndClear(textEl) {
    if (!textEl) return;
    // 2 saniyə gözlə, sonra fade-out, sonra təmizlə
    setTimeout(() => {
      textEl.classList.add("is-fading");
      setTimeout(() => {
        textEl.classList.remove("is-fading");
        textEl.innerHTML = ""; // ✅ heç nə qalmasın
      }, 380); // opacity transition-a uyğun
    }, 2000);
  }

  /* ----------------------------
     Render function resolver
  ---------------------------- */
  function getRenderFn() {
    return window.renderCars || window.RenderCars || (typeof renderCars === "function" ? renderCars : null);
  }

  /* ----------------------------
     Data source
  ---------------------------- */
  function getAllCars() {
    if (Array.isArray(window.ALL_CARS)) return window.ALL_CARS;
    if (Array.isArray(window.allCars)) return window.allCars;
    if (Array.isArray(window.cars)) return window.cars;

    try {
      const ls = localStorage.getItem("carall_cars_v1");
      const arr = JSON.parse(ls || "[]");
      if (Array.isArray(arr)) return arr;
    } catch {}

    return [];
  }

  function getCreatedTime(car) {
    const v = car?.createdAt ?? car?.created_at ?? car?.created ?? car?.date ?? 0;
    const t = new Date(v).getTime();
    return Number.isFinite(t) ? t : 0;
  }

  /* ----------------------------
     UI
  ---------------------------- */
  function updateSentinelUI() {
    const textEl = getSentinelTextEl();
    if (!textEl) return;

    if (__FILTERED.length === 0) {
      textEl.innerHTML = "";
      return;
    }

    if (__isLoading) {
      setSentinelHTMLLoading(textEl);
      return;
    }

    // not loading:
    // hasMore false olanda "Bitdi" yazmırıq, sadəcə boş saxlayırıq
    textEl.innerHTML = "";
  }

  /* ----------------------------
     Pipeline: Filter / Sort
  ---------------------------- */
  function applyFilters(all) {
    __FILTERED = [...all];
  }

  function applySort() {
    __SORTED = [...__FILTERED].sort((a, b) => getCreatedTime(b) - getCreatedTime(a));
  }

  function calcVisible(page) {
    return __SORTED.slice(0, page * PAGE_SIZE);
  }

  function resetPaging() {
    __page = 1;
    __VISIBLE = [];
    __hasMore = true;
    __isLoading = false;
  }

  /* ----------------------------
     Observer
  ---------------------------- */
  function stopObserver() {
    const sentinel = getSentinelEl();
    if (__io && sentinel) __io.unobserve(sentinel);
  }

  function startObserver() {
    const sentinel = getSentinelEl();
    if (!sentinel) return;

    if (!__io) {
      __io = new IntersectionObserver(
        (entries) => {
          const e = entries[0];
          if (!e || !e.isIntersecting) return;
          loadMore();
        },
        { root: null, rootMargin: "1200px 0px", threshold: 0 }
      );
    }

    __io.observe(sentinel);
  }

  /* ----------------------------
     Render wrapper
  ---------------------------- */
  function render(list) {
    const fn = getRenderFn();
    if (!fn) return;
    fn(list);
  }

  /* ----------------------------
     Core
  ---------------------------- */
  function refreshList() {
    const all = getAllCars();

    resetPaging();
    applyFilters(all);
    applySort();

    if (__FILTERED.length === 0) {
      __hasMore = false;
      updateSentinelUI();
      stopObserver();
      render([]);
      return;
    }

    __VISIBLE = calcVisible(__page);

    // ✅ hasMore-u page ilə hesabla (stabil)
    __hasMore = (__page * PAGE_SIZE) < __SORTED.length;

    render(__VISIBLE);
    updateSentinelUI();

    if (__hasMore) startObserver();
    else stopObserver();
  }

  /* ----------------------------
     loadMore (UI-only, no render)
     - Cards yer dəyişməsin deyə render ETMİRİK.
     - Sadəcə spinner göstər → 2s sonra fade-out → stop
  ---------------------------- */
  function loadMore() {
    if (__isLoading) return;

    // data artıq bitibsə: spinner 2s sonra yavaş yox olsun və stop
    if (!__hasMore) {
      const textEl = getSentinelTextEl();
      if (textEl && textEl.innerHTML) fadeOutAndClear(textEl);
      stopObserver();
      return;
    }

    __isLoading = true;
    updateSentinelUI();

    // Burada datanı gətirmirik ki, yuxarı kartlar oynamasın.
    // Sadəcə "bitdi" kimi qəbul edib spinneri söndürürük.
    __hasMore = false;

    __isLoading = false;

    const textEl = getSentinelTextEl();
    // Spinner 2s qalsın, sonra fade-out və təmizlə
    fadeOutAndClear(textEl);

    stopObserver();
  }

  /* ----------------------------
     Init
  ---------------------------- */
  document.addEventListener("DOMContentLoaded", refreshList);
  window.refreshListFromDataLayer = refreshList;
})();
