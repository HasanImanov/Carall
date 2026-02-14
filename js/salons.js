/* =========================
   CarAll — salons.js
   - Uses global SALONS (from cars-data.js)
   - Random order on every refresh
   - Search by salon name
   - Infinite scroll pagination (8-8)
   - "Nömrəni göstər" toggle
   ========================= */

(() => {
  const PAGE_SIZE = 8;
  const ROOT_MARGIN = "450px 0px";
  const THROTTLE_MS = 160;

  const grid = document.getElementById("salonsGrid");
  const empty = document.getElementById("salonsEmpty");
  const countEl = document.getElementById("salonCount");
  const searchEl = document.getElementById("salonSearch");
  const clearBtn = document.getElementById("salonClear");

  const sentinel = document.getElementById("pagerSentinel");
  const sentinelText = document.getElementById("sentinelText");

  if (!grid || !searchEl) return;

  const data = Array.isArray(window.SALONS)
    ? window.SALONS
    : (typeof SALONS !== "undefined" ? SALONS : []);

  const norm = (s) => String(s || "").toLowerCase().trim();

  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const escapeHtml = (str) =>
    String(str || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

 const logoHTML = (name, logo) => {
  const url = String(logo || "").trim();
  if (url) {
    return `
      <img
        src="${escapeHtml(url)}"
        alt="${escapeHtml(name)}"
        loading="lazy"
        referrerpolicy="no-referrer"
        onerror="this.onerror=null; this.src='images/Logo.png';"
      />
    `;
  }
  const first = (name || "?").trim().charAt(0).toUpperCase();
  return `<span class="s-logo__txt">${escapeHtml(first)}</span>`;
};



  function setCount(n) {
    if (!countEl) return;
    countEl.textContent = `${n} salon`;
  }

  // ---- STATE ----
  const baseAll = shuffle(data); // refreshdə random
  let filtered = baseAll.slice();

  let cursor = 0;
  let isLoading = false;
  let io = null;
  let lastTick = 0;

  // ---- RENDER CHUNK (append) ----
  function appendChunk(list) {
    const frag = document.createDocumentFragment();

    list.forEach((s) => {
      const id = s.id ?? "";
      const name = s.name ?? "—";
      const desc = s.description ?? "";
      const addr = s.address ?? "";
      const carsCount = s.carsCount ?? "";
      const phone = s.phone ?? "";
      const verified = !!s.verified;
      const logo = s.logo ?? "";

      const card = document.createElement("article");
card.className = "s-card";
card.setAttribute("data-href", `salon.html?id=${encodeURIComponent(String(id))}`);

card.innerHTML = `
  <div class="s-top">
    <a class="s-logo" href="salon.html?id=${encodeURIComponent(String(id))}" aria-label="${escapeHtml(name)}">
      ${logoHTML(name, logo)}
    </a>

    <div class="s-head">
      <div class="s-title">
        <a class="s-link" href="salon.html?id=${encodeURIComponent(String(id))}">${escapeHtml(name)}</a>
        ${verified ? `<span class="s-badge" title="Təsdiqli">✓</span>` : ``}
      </div>

      <!-- ✅ “3 elan” da link olsun -->
      <a class="s-sub s-link2" href="salon.html?id=${encodeURIComponent(String(id))}">
        ${escapeHtml(carsCount ? `${carsCount} elan` : "—")}
      </a>
    </div>
  </div>

  <div class="s-desc">${escapeHtml(desc)}</div>

  ${addr ? `<a class="s-addr" href="salon.html?id=${encodeURIComponent(String(id))}">${escapeHtml(addr)}</a>` : ``}

  <div class="s-actions">
    <button class="s-btn" type="button" data-phone="${escapeHtml(phone)}">
      Nömrəni göstər
    </button>
  </div>

  <div class="s-phone" hidden></div>
`;

      frag.appendChild(card);
    });

    grid.appendChild(frag);
  }

  function setEmptyUI(isEmpty) {
    if (empty) empty.hidden = !isEmpty;
    if (sentinel) sentinel.hidden = isEmpty; // boşdursa sentinel gizlənsin
  }

  function setSentinelText(t) {
    if (!sentinelText) return;
    sentinelText.textContent = t;
  }

  function resetPager(newFiltered) {
    filtered = newFiltered.slice();
    cursor = 0;
    isLoading = false;
    grid.innerHTML = "";

    setCount(filtered.length);

    if (!filtered.length) {
      setEmptyUI(true);
      return;
    }

    setEmptyUI(false);
    setSentinelText("Yüklənir…");

    // ilk page
    loadMore();

    // observer restart
    restartObserver();
  }

  function loadMore() {
    if (isLoading) return;
    if (cursor >= filtered.length) {
      setSentinelText("Hamısı göstərildi");
      if (io && sentinel) io.unobserve(sentinel);
      return;
    }

    isLoading = true;

    const next = filtered.slice(cursor, cursor + PAGE_SIZE);
    cursor += next.length;

    // append
    appendChunk(next);

    // end?
    if (cursor >= filtered.length) {
      setSentinelText("Hamısı göstərildi");
      if (io && sentinel) io.unobserve(sentinel);
    } else {
      setSentinelText("Daha çox yüklənir…");
    }

    isLoading = false;
  }

  function restartObserver() {
    if (!sentinel) return;

    if (io) io.disconnect();

    io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;

      const now = Date.now();
      if (now - lastTick < THROTTLE_MS) return;
      lastTick = now;

      loadMore();
    }, { rootMargin: ROOT_MARGIN });

    io.observe(sentinel);
  }

  function applySearch(q) {
    const t = norm(q);
    const newFiltered = !t
      ? baseAll
      : baseAll.filter((x) => norm(x.name).includes(t));
    resetPager(newFiltered);
  }

  // ---- EVENTS ----
  searchEl.addEventListener("input", (e) => {
    const v = e.target.value || "";
    clearBtn.hidden = v.length === 0;
    applySearch(v);
  });

  clearBtn.addEventListener("click", () => {
    searchEl.value = "";
    clearBtn.hidden = true;
    applySearch("");
    searchEl.focus();
  });

 grid.addEventListener("click", (e) => {
  const btn = e.target.closest(".s-btn");
  if (btn) {
    const card = btn.closest(".s-card");
    const phoneBox = card?.querySelector(".s-phone");
    const phone = btn.getAttribute("data-phone") || "";
    if (!phoneBox) return;

    if (!phone || phone.trim() === "") {
      phoneBox.hidden = false;
      phoneBox.textContent = "Nömrə əlavə edilməyib";
      btn.disabled = true;
      btn.textContent = "Nömrə yoxdur";
      return;
    }

    const show = phoneBox.hidden;
    phoneBox.hidden = !show;

    if (show) {
      phoneBox.textContent = phone;
      btn.textContent = "Nömrəni gizlət";
    } else {
      btn.textContent = "Nömrəni göstər";
    }
    return; // ✅ button klikindən sonra kart yönləndirməsin
  }

  // ✅ Kart klik
  const card = e.target.closest(".s-card");
  if (card && !e.target.closest("a")) {
    const href = card.getAttribute("data-href");
    if (href) location.href = href;
  }
});


  // ---- INIT ----
  resetPager(baseAll);
})();
