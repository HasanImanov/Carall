(() => {
  const elList   = document.getElementById("partsList");
  const elSearch = document.getElementById("listSearch");
  const elClear  = document.getElementById("clearSearch");
  const elCount  = document.getElementById("resultCount");
  const elEmpty  = document.getElementById("emptyState");
  const elReset  = document.getElementById("resetBtn");

  if (!elList) return;

  const norm = (s) => String(s ?? "").toLowerCase().trim();

  const escapeHTML = (s) =>
    String(s ?? "")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");

  function toKey(v){
    return norm(v)
      .replaceAll("ə","e").replaceAll("ı","i")
      .replaceAll("ö","o").replaceAll("ü","u")
      .replaceAll("ğ","g").replaceAll("ş","s")
      .replaceAll("ç","c")
      .replace(/[^a-z0-9]+/g,"");
  }

  function waitForPlaces(maxMs = 2000, stepMs = 50) {
    return new Promise((resolve) => {
      const t0 = Date.now();
      const tick = () => {
        const P = window.PARTS_PLACES;
        if (P && typeof P === "object") return resolve(P);
        if (Date.now() - t0 >= maxMs) return resolve(null);
        setTimeout(tick, stepMs);
      };
      tick();
    });
  }

  function showEmpty(title, desc=""){
    elList.innerHTML = `
      <div class="empty">
        <div class="empty__t">${escapeHTML(title)}</div>
        ${desc ? `<div class="empty__d">${escapeHTML(desc)}</div>` : ""}
      </div>`;
    if (elCount) elCount.textContent = `0 nəticə`;
    if (elEmpty) elEmpty.hidden = false;
  }

  function cardHTML(item, brandKey){
    const telRaw = String(item.phone || "");
    const tel = telRaw.replace(/[^\d+]/g,"");
    const telHref = tel ? `tel:${tel}` : "#";

    return `
      <div class="item">
        <div class="item__txt">
          <p class="item__title">${escapeHTML(item.name || "—")}</p>

          <div class="item__sub">
            <span class="pill">${escapeHTML(String(brandKey).toUpperCase())}</span>
            <span class="pill">${escapeHTML(item.location || "—")}</span>
          </div>

          <div class="item__sub" style="margin-top:6px">
            <span class="pill">${escapeHTML(item.address || "—")}</span>
          </div>

          <div class="item__sub" style="margin-top:6px">
            <span class="pill">📞 ${escapeHTML(telRaw || "—")}</span>
          </div>
        </div>

        <a class="callBtn" href="${escapeHTML(telHref)}">
  <svg viewBox="0 0 24 24" class="callIcon">
    <path d="M6.6 10.8a15.2 15.2 0 0 0 6.6 6.6l2.2-2.2c.3-.3.8-.4 1.2-.2 1 .4 2.1.7 3.2.8.5.1.9.5.9 1v3.5c0 .5-.4.9-.9 1C10.9 22.3 1.7 13.1 2.7 3.2c.1-.5.5-.9 1-.9h3.5c.5 0 .9.4 1 .9.1 1.1.4 2.2.8 3.2.1.4 0 .9-.2 1.2l-2.2 2.2z"/>
  </svg>
</a>
      </div>
    `;
  }

  function render(list, brandKey){
    elList.innerHTML = list.map(x => cardHTML(x, brandKey)).join("");
    if (elCount) elCount.textContent = `${list.length} nəticə`;
    if (elEmpty) elEmpty.hidden = list.length !== 0;
  }

  (async () => {
    const PLACES = await waitForPlaces();
    if (!PLACES) {
      showEmpty("PARTS_PLACES gəlmədi", "Script sırası səhvdir (places script əvvəl yüklənsin).");
      return;
    }

    // ✅ MÜTLƏQ brand olmalıdır
    const qs = new URLSearchParams(location.search);
    const rawBrand = qs.get("brand") || qs.get("b") || "";
    const wanted = toKey(rawBrand);

    if (!wanted) {
      showEmpty("Marka seçilməyib", "Bu səhifə ?brand=mercedes formatı ilə açılmalıdır.");
      return;
    }

    // match: birbaşa və ya normalized
    const keys = Object.keys(PLACES);
    let brandKey = "";
    if (PLACES[wanted]) brandKey = wanted;
    else {
      const m = keys.find(k => toKey(k) === wanted);
      if (m) brandKey = m;
    }

    if (!brandKey) {
      showEmpty("Bu marka üçün data tapılmadı", `Gələn brand: ${rawBrand}`);
      return;
    }

    const ALL = Array.isArray(PLACES[brandKey]) ? PLACES[brandKey] : [];
    if (!ALL.length) {
      showEmpty("Heç bir ünvan yoxdur");
      return;
    }

    function filterList(q){
      const s = norm(q);
      if (!s) return ALL;
      return ALL.filter(x => norm(`${x.name} ${x.phone} ${x.address} ${x.location}`).includes(s));
    }

    function applySearch(){
      const q = elSearch ? elSearch.value : "";
      const has = norm(q).length > 0;
      if (elClear) elClear.style.display = has ? "inline-flex" : "none";
      render(filterList(q), brandKey);
    }

    let t = null;
    if (elSearch){
      elSearch.addEventListener("input", () => {
        clearTimeout(t);
        t = setTimeout(applySearch, 120);
      });
    }
    if (elClear){
      elClear.addEventListener("click", () => {
        elSearch.value = "";
        elSearch.focus();
        applySearch();
      });
    }
    if (elReset){
      elReset.addEventListener("click", () => {
        elSearch.value = "";
        applySearch();
      });
    }

    render(ALL, brandKey);
    applySearch();
  })();
})();
