
(() => {
  const PARTS_DATA = [
    {
      id: 1,
      category: "yaglar",
      title: "Mobil 5W-30 Tam Sintetik",
      desc: "Mühərrikin stabil işləməsi üçün yüksək keyfiyyətli tam sintetik yağ.",
      price: 42,
      image: "https://images.unsplash.com/photo-1613214150384-15f222f419f4?auto=format&fit=crop&w=1200&q=80",
      brand: "Mobil",
      fitment: "Toyota, Kia, Hyundai",
      spec: "5W-30",
      phone: "+994 50 555 22 11"
    },
    {
      id: 2,
      category: "yaglar",
      title: "Castrol EDGE 5W-40",
      desc: "Yüksək temperatur və performans üçün premium mühərrik yağı.",
      price: 48,
      image: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1200&q=80",
      brand: "Castrol",
      fitment: "BMW, Mercedes, Volkswagen",
      spec: "5W-40",
      phone: "+994 50 444 11 33"
    },
    {
      id: 3,
      category: "yaglar",
      title: "Liqui Moly Top Tec 4200",
      desc: "Uzun yürüşlü avtomobillər üçün etibarlı və stabil seçim.",
      price: 55,
      image: "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?auto=format&fit=crop&w=1200&q=80",
      brand: "Liqui Moly",
      fitment: "Audi, Porsche, Volkswagen",
      spec: "5W-30",
      phone: "+994 55 777 88 99"
    },

    {
      id: 4,
      category: "muherrik",
      title: "Bosch Hava Filtri",
      desc: "Mühərrikə təmiz hava ötürülməsi üçün keyfiyyətli filtr.",
      price: 25,
      image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1200&q=80",
      brand: "Bosch",
      fitment: "Toyota Corolla, Kia Cerato",
      spec: "Filter",
      phone: "+994 50 111 22 33"
    },
    {
      id: 5,
      category: "muherrik",
      title: "NGK Iridium Şam Dəsti",
      desc: "Stabil alışma və uzun ömür üçün 4 ədəd şam dəsti.",
      price: 64,
      image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
      brand: "NGK",
      fitment: "Honda, Toyota, Nissan",
      spec: "4 ədəd",
      phone: "+994 70 222 44 55"
    },
    {
      id: 6,
      category: "muherrik",
      title: "Gates Vaxt Kəməri Dəsti",
      desc: "Mühərrikin düzgün sinxron işləməsi üçün komplekt dəst.",
      price: 130,
      image: "https://strgimgr.umico.az/img/product/280/1a5e7c6a-6e53-4f80-ae14-1fbdb2756880.jpeg",
      brand: "Gates",
      fitment: "Kia Rio, Hyundai Accent",
      spec: "Komplekt",
      phone: "+994 50 666 99 00"
    },

    {
      id: 7,
      category: "tekerler",
      title: "Michelin Primacy 4",
      desc: "Şəhər istifadəsi üçün səssiz və etibarlı yay təkəri.",
      price: 210,
      image: "https://old.tekerevi.az/uploads/72917569854.jpg",
      brand: "Michelin",
      fitment: "Sedan və hatchback",
      spec: "205/55 R16",
      phone: "+994 50 333 66 77"
    },
    {
      id: 8,
      category: "tekerler",
      title: "Continental EcoContact 6",
      desc: "Yanacaq sərfiyyatını azaltmağa kömək edən keyfiyyətli model.",
      price: 195,
      image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80",
      brand: "Continental",
      fitment: "Audi, Volkswagen, Skoda",
      spec: "225/45 R17",
      phone: "+994 55 123 45 67"
    },
    {
      id: 9,
      category: "tekerler",
      title: "Pirelli Cinturato",
      desc: "Rahat və stabil gündəlik sürüş üçün yeni təkər.",
      price: 205,
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
      brand: "Pirelli",
      fitment: "Sedan modellər",
      spec: "215/60 R16",
      phone: "+994 50 908 70 60"
    },

    {
      id: 10,
      category: "diskler",
      title: "Yüngül Lehmlı Disk",
      desc: "Müasir görünüş və möhkəm quruluşla hazırlanmış disk.",
      price: 320,
      image: "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1200&q=80",
      brand: "Replica",
      fitment: "BMW, Mercedes",
      spec: "R17 • 5x112",
      phone: "+994 51 500 60 70"
    },
    {
      id: 11,
      category: "diskler",
      title: "Sport Disk Dəsti",
      desc: "Avtomobilinizə daha dinamik görünüş verən model.",
      price: 410,
      image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80",
      brand: "Vossen Style",
      fitment: "Toyota, Lexus, Hyundai",
      spec: "R18 • 5x114.3",
      phone: "+994 55 800 10 20"
    },
    {
      id: 12,
      category: "diskler",
      title: "Qara Mat Disk",
      desc: "Sadə, premium və güclü görünüş verən disk modeli.",
      price: 390,
      image: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80",
      brand: "Japan Racing",
      fitment: "Honda, Mazda, Toyota",
      spec: "R18 • 5x114.3",
      phone: "+994 50 700 20 30"
    }
  ];

  const CATEGORY_META = {
    yaglar: {
      title: "Yağlar",
      desc: "Mühərrik, transmissiya və digər yağ məhsulları"
    },
    muherrik: {
      title: "Mühərrik",
      desc: "Mühərrik üçün əsas hissələr və detallar"
    },
    tekerler: {
      title: "Təkərlər",
      desc: "Müxtəlif ölçü və markalarda yeni təkərlər"
    },
    diskler: {
      title: "Disklər",
      desc: "Fərqli diametr və dizaynda yeni disk modelləri"
    }
  };

  const qs = new URLSearchParams(window.location.search);

  function money(n) {
    return `${Number(n).toLocaleString("az-AZ")} AZN`;
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function getCategoryTitle(cat) {
    return CATEGORY_META[cat]?.title || "Məhsul";
  }

  /* ===== LIST PAGE ===== */
  const partsGrid = document.getElementById("partsGrid");

  if (partsGrid) {
    const currentCat = qs.get("cat") || "yaglar";
    const activeCat = CATEGORY_META[currentCat] ? currentCat : "yaglar";
    const meta = CATEGORY_META[activeCat];

    const pageTitle = document.getElementById("partsPageTitle");
    const pageDesc = document.getElementById("partsPageDesc");
    const searchInput = document.getElementById("partsSearch");
    const partsEmpty = document.getElementById("partsEmpty");
    const partsCount = document.getElementById("partsCount");

    if (pageTitle) pageTitle.textContent = meta.title;
    if (pageDesc) pageDesc.textContent = meta.desc;

    document.querySelectorAll("[data-cat-link]").forEach((link) => {
      const cat = link.getAttribute("data-cat-link");
      link.classList.toggle("is-active", cat === activeCat);
    });

    function cardTemplate(item) {
      return `
        <article class="part-card">
          <div class="part-card__media">
            <img
              src="${escapeHtml(item.image)}"
              alt="${escapeHtml(item.title)}"
              loading="lazy"
              onerror="this.onerror=null;this.src='https://placehold.co/800x550/e2e8f0/334155?text=CarAll';"
            />
            <span class="part-card__badge">${escapeHtml(meta.title)}</span>
          </div>

          <div class="part-card__body">
            <h3 class="part-card__title">${escapeHtml(item.title)}</h3>
            <p class="part-card__desc">${escapeHtml(item.desc)}</p>

            <div class="part-card__meta">
              <span>${escapeHtml(item.brand)}</span>
              <span>${escapeHtml(item.spec)}</span>
              <span>${escapeHtml(item.fitment)}</span>
            </div>

            <div class="part-card__bottom">
              <strong class="part-card__price">${money(item.price)}</strong>
              <a class="part-card__btn" href="ehtiyyat_details.html?id=${item.id}">Ətraflı bax</a>
            </div>
          </div>
        </article>
      `;
    }

    function render(list) {
      partsGrid.innerHTML = list.map(cardTemplate).join("");
      if (partsCount) partsCount.textContent = `${list.length} məhsul`;

      const isEmpty = list.length === 0;
      partsGrid.hidden = isEmpty;
      if (partsEmpty) partsEmpty.hidden = !isEmpty;
    }

    function filterData() {
      const q = (searchInput?.value || "").trim().toLowerCase();

      const filtered = PARTS_DATA.filter((item) => {
        if (item.category !== activeCat) return false;
        if (!q) return true;

        const bag = [
          item.title,
          item.desc,
          item.brand,
          item.fitment,
          item.spec,
          item.category
        ].join(" ").toLowerCase();

        return bag.includes(q);
      });

      render(filtered);
    }

    filterData();

    if (searchInput) {
      searchInput.addEventListener("input", filterData);
    }
  }

  /* ===== DETAIL PAGE ===== */
  const partDetail = document.getElementById("partDetail");

  if (partDetail) {
    const id = Number(qs.get("id"));
    const item = PARTS_DATA.find((x) => x.id === id);

    const emptyBox = document.getElementById("partDetailEmpty");

    if (!item) {
      partDetail.hidden = true;
      if (emptyBox) emptyBox.hidden = false;
      return;
    }

    document.title = `${item.title} - CarAll`;

    partDetail.innerHTML = `
      <div class="part-detail__media">
        <div class="part-detail__imgbox">
          <img
            src="${escapeHtml(item.image)}"
            alt="${escapeHtml(item.title)}"
            onerror="this.onerror=null;this.src='https://placehold.co/1200x800/e2e8f0/334155?text=CarAll';"
          />
        </div>
      </div>

      <div class="part-detail__info">
        <span class="part-detail__badge">${escapeHtml(getCategoryTitle(item.category))}</span>

        <h1 class="part-detail__title">${escapeHtml(item.title)}</h1>
        <p class="part-detail__desc">${escapeHtml(item.desc)}</p>

        <div class="part-detail__price">${money(item.price)}</div>

        <div class="part-detail__meta">
          <div class="part-detail__row">
            <div class="part-detail__label">Marka</div>
            <div class="part-detail__value">${escapeHtml(item.brand)}</div>
          </div>

          <div class="part-detail__row">
            <div class="part-detail__label">Xüsusiyyət</div>
            <div class="part-detail__value">${escapeHtml(item.spec)}</div>
          </div>

          <div class="part-detail__row">
            <div class="part-detail__label">Uyğunluq</div>
            <div class="part-detail__value">${escapeHtml(item.fitment)}</div>
          </div>

          <div class="part-detail__row">
            <div class="part-detail__label">Məhsul haqqında</div>
            <div class="part-detail__value">${escapeHtml(item.desc)}</div>
          </div>
        </div>

        <div class="part-detail__contact">
          <span class="part-detail__phone-label">Satıcı ilə əlaqə</span>
          <a class="part-detail__phone" href="tel:${item.phone.replace(/\s+/g, "")}">
            ${escapeHtml(item.phone)}
          </a>
        </div>
      </div>
    `;
  }
})();