
console.log("ishlenmish.js loaded ✅");
console.log("BRANDS ready?", window.PARTS_BRANDS?.length);
console.log("PLACES ready?", Object.keys(window.PARTS_PLACES||{}).length);


(() => {
  const $ = (s, r = document) => r.querySelector(s);

  const BRANDS = Array.isArray(window.PARTS_BRANDS) ? window.PARTS_BRANDS : [];
  const PLACES = window.PARTS_PLACES || {};

  const qs = new URLSearchParams(location.search);
  const id = (qs.get("id") || "").trim(); // ✅ səndə id string: "mercedes", "haval"...

  const esc = (str) =>
    String(str || "").replace(/[&<>"']/g, (m) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    }[m]));

  // =================================================
  // 1) BRANDS LIST PAGE (logolar olan səhifə)
  // =================================================
  const grid = $("#brandsGrid");
  if (grid) {
    const searchInput = $("#brandSearch");

    const renderBrands = (list) => {
      grid.innerHTML = list
        .map((b) => {
          const bid = String(b.id || "").trim(); // ✅ "mercedes"
          const name = b.name || "—";
          const desc = b.desc || "";

          return `
            <a class="brand-card" href="ishlenmishdata.html?brand=${encodeURIComponent(bid)}">
              <div class="brand-logo">
                <img src="${esc(b.logo || "")}"
                     alt="${esc(name)}"
                     loading="lazy"
                     referrerpolicy="no-referrer"
                     onerror="this.onerror=null;this.src='images/Logo.png'">
              </div>

              <div class="brand-info">
                <div class="brand-name">${esc(name)}</div>
                <div class="brand-desc">${esc(desc)}</div>
              </div>
            </a>
          `;
        })
        .join("");
    };

    renderBrands(BRANDS);

    // search
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const q = String(e.target.value || "").toLowerCase().trim();
        const filtered = !q
          ? BRANDS
          : BRANDS.filter((b) => String(b.name || "").toLowerCase().includes(q));
        renderBrands(filtered);
      });
    }

    return; // ✅ list page bitdi
  }

  // =================================================
  // 2) BRAND PAGE (daxilə girəndə yerlərin siyahısı)
  // =================================================
  const titleEl = $("#brandTitle");
  const listBox = $("#placesList");

  if (!listBox) return;

  const brand = BRANDS.find((b) => String(b.id) === String(id)) || null;
  const list = Array.isArray(PLACES[id]) ? PLACES[id] : [];

  if (titleEl) {
    titleEl.textContent = brand ? `${brand.name} üçün işlənmiş hissələr` : "İşlənmiş hissələr";
  }

  if (!id) {
    listBox.innerHTML = `<div class="empty">Brend seçilməyib.</div>`;
    return;
  }

  if (!list.length) {
    listBox.innerHTML = `<div class="empty">Bu brend üçün yer tapılmadı.</div>`;
    return;
  }

  listBox.innerHTML = list
    .map((p) => {
      const name = p.name || "—";
      const phone = p.phone || "";
      const address = p.address || "";
      const location = p.location || "";

      return `
        <div class="place-card">
          <div class="place-top">
            <div class="place-name">${esc(name)}</div>
            ${phone ? `<a class="place-phone" href="tel:${esc(phone)}">${esc(phone)}</a>` : ``}
          </div>

          <div class="place-row">
            <span class="place-label">Ünvan:</span>
            <span class="place-val">${esc(address)}</span>
          </div>

          <div class="place-row">
            <span class="place-label">Şəhər:</span>
            <span class="place-val">${esc(location)}</span>
          </div>
        </div>
      `;
    })
    .join("");
})();
