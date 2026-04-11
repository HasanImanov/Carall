(() => {
  const PAGE_SIZE = 8;
  const ROOT_MARGIN = "450px 0px";
  const THROTTLE_MS = 160;

  const grid = document.getElementById("rentcarsGrid");
  const empty = document.getElementById("rentcarsEmpty");
  const countEl = document.getElementById("rentCount");
  const searchEl = document.getElementById("rentSearch");
  const clearBtn = document.getElementById("rentClear");

  const sentinel = document.getElementById("pagerSentinel");
  const sentinelText = document.getElementById("sentinelText");

  if (!grid || !searchEl) return;

  const data = Array.isArray(window.RENTS)
    ? window.RENTS
    : (typeof RENTS !== "undefined" ? RENTS : []);

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
    return `<span class="r-logo__txt">${escapeHtml(first)}</span>`;
  };

  function setCount(n) {
    if (!countEl) return;
    countEl.textContent = `${n} profil`;
  }

  const baseAll = shuffle(data);
  let filtered = baseAll.slice();

  let cursor = 0;
  let isLoading = false;
  let io = null;
  let lastTick = 0;

  function appendChunk(list) {
    const frag = document.createDocumentFragment();

    list.forEach((r) => {
      const id = r.id ?? "";
      const name = r.name ?? "—";
      const desc = r.description ?? "";
      const addr = r.address ?? "";
      const carsCount = r.carsCount ?? r.cars_count ?? "";
      const phone = r.phone ?? "";
      const verified = !!r.verified;
      const logo = r.logo ?? "";

      const card = document.createElement("article");
      card.className = "r-card";
      card.setAttribute("data-href", `rentcar.html?id=${encodeURIComponent(String(id))}`);

      card.innerHTML = `
        <div class="r-top">
          <a class="r-logo" href="rentcar.html?id=${encodeURIComponent(String(id))}" aria-label="${escapeHtml(name)}">
            ${logoHTML(name, logo)}
          </a>

          <div class="r-head">
            <div class="r-title">
              <a class="r-link" href="rentcar.html?id=${encodeURIComponent(String(id))}">${escapeHtml(name)}</a>
              ${verified ? `<span class="r-badge" title="Təsdiqli">✓</span>` : ``}
            </div>

            <a class="r-sub r-link2" href="rentcar.html?id=${encodeURIComponent(String(id))}">
              ${escapeHtml(carsCount ? `${carsCount} elan` : "—")}
            </a>
          </div>
        </div>

        <div class="r-desc">${escapeHtml(desc)}</div>

        ${addr ? `<a class="r-addr" href="rentcar.html?id=${encodeURIComponent(String(id))}">${escapeHtml(addr)}</a>` : ``}

        <div class="r-actions">
          <button class="r-btn" type="button" data-phone="${escapeHtml(phone)}">
            Nömrəni göstər
          </button>
        </div>

        <div class="r-phone" hidden></div>
      `;

      frag.appendChild(card);
    });

    grid.appendChild(frag);
  }

  function setEmptyUI(isEmpty) {
    if (empty) empty.hidden = !isEmpty;
    if (sentinel) sentinel.hidden = isEmpty;
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

    loadMore();
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

    appendChunk(next);

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
    const btn = e.target.closest(".r-btn");
    if (btn) {
      const card = btn.closest(".r-card");
      const phoneBox = card?.querySelector(".r-phone");
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
      return;
    }

    const card = e.target.closest(".r-card");
    if (card && !e.target.closest("a")) {
      const href = card.getAttribute("data-href");
      if (href) location.href = href;
    }
  });

  resetPager(baseAll);
})();