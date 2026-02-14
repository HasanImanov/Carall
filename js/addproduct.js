document.addEventListener("DOMContentLoaded", () => {
  // ---------------------------
  // Helpers
  // ---------------------------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  function setErrForHidden(hiddenEl, msg = "") {
    const field = hiddenEl?.closest(".field");
    const err = field?.querySelector(".field__err");
    if (err) err.textContent = msg;
  }

  // ✅ NEW: error helper for normal fields (Ad / Email)
  function setErrForEl(el, msg = "") {
    const field = el?.closest?.(".field");
    const err = field?.querySelector?.(".field__err");
    if (err) err.textContent = msg;
  }

  // ✅ NEW: email validator
  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
  }

  // (istəsən yalnız gmail olsun: aç)
  // function isGmail(v){
  //   return /@gmail\.com$/i.test(String(v || "").trim());
  // }

  // ---------------------------
  // Data
  // ---------------------------
  const MAKE_MODELS = {
    Mercedes: ["C200", "C250", "E200", "E300", "S500", "GLA", "GLC", "GLE"],
    BMW: ["318", "320", "330", "520", "530", "X3", "X5", "M3"],
    Toyota: ["Camry", "Corolla", "Prius", "RAV4", "Land Cruiser"],
    Hyundai: ["Elantra", "Sonata", "Tucson", "Santa Fe", "Accent"],
    Kia: ["Rio", "Cerato", "Sportage", "Sorento", "Optima"],
  };

  const YEARS = (() => {
    const arr = [];
    const now = new Date().getFullYear();
    const end = Math.max(now, 2027);
    for (let y = end; y >= 1990; y--) arr.push(String(y));
    return arr;
  })();

  // ---------------------------
  // Stepper
  // ---------------------------
  const form = document.getElementById("listingForm");
  const steps = $$(".step");
  const dots = $$(".dot");
  const stepCount = document.getElementById("stepCount");
  const backBtn = document.getElementById("backBtn");
  const nextBtn = document.getElementById("nextBtn");
  const summaryText = document.getElementById("summaryText");

  let step = 1;

  function setStep(n) {
    step = clamp(n, 1, steps.length);

    steps.forEach((s) =>
      s.classList.toggle("is-active", Number(s.dataset.step) === step)
    );
    dots.forEach((d, i) => d.classList.toggle("is-on", i === step - 1));
    if (stepCount) stepCount.textContent = `${step} / ${steps.length}`;

    if (backBtn) backBtn.disabled = step === 1;
    if (nextBtn)
      nextBtn.textContent =
        step === steps.length ? "Elanı yerləşdir ✅" : "Davam et →";

    if (step === 4) renderSummary();

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function validateStep() {
    // clear current step errors
    $$(".step.is-active .field__err").forEach((e) => (e.textContent = ""));
    const photosErr = document.getElementById("photosErr");

    // Step 1 required
    if (step === 1) {
      const makeValue = document.getElementById("makeValue");
      const modelValue = document.getElementById("modelValue");
      const yearValue = document.getElementById("yearValue");

      if (!makeValue?.value) {
        setErrForHidden(makeValue, "Marka mütləqdir.");
        return false;
      }
      if (!modelValue?.value) {
        setErrForHidden(modelValue, "Model mütləqdir.");
        return false;
      }
      if (!yearValue?.value) {
        setErrForHidden(yearValue, "İl mütləqdir.");
        return false;
      }

      const km = form?.elements?.km?.value?.trim?.() ?? "";
      if (!km) {
        const kmEl = form?.elements?.km;
        const field = kmEl?.closest?.(".field");
        const err = field?.querySelector?.(".field__err");
        if (err) err.textContent = "Yürüş mütləqdir.";
        return false;
      }
    }

    // Step 2 required
    if (step === 2) {
      const price = form?.elements?.price?.value?.trim?.() ?? "";
      if (!price) {
        const el = form?.elements?.price;
        const field = el?.closest?.(".field");
        const err = field?.querySelector?.(".field__err");
        if (err) err.textContent = "Qiymət mütləqdir.";
        return false;
      }
      if (Number(price) <= 0) {
        const el = form?.elements?.price;
        const field = el?.closest?.(".field");
        const err = field?.querySelector?.(".field__err");
        if (err) err.textContent = "Qiymət düzgün deyil.";
        return false;
      }
    }

    // Step 3 photos min 3
    if (step === 3) {
      if (photos.length < 3) {
        if (photosErr) photosErr.textContent = "Minimum 3 şəkil əlavə et.";
        return false;
      }
      if (photosErr) photosErr.textContent = "";
    }

    // Step 4 required (city optional)
    if (step === 4) {
      // ✅ NEW: fullname + email required
      const fullNameEl = document.getElementById("fullName");
      const emailEl = document.getElementById("email");

      const fullname = fullNameEl?.value?.trim?.() ?? "";
      const email = emailEl?.value?.trim?.() ?? "";

      if (!fullname) {
        setErrForEl(fullNameEl, "Ad mütləqdir.");
        return false;
      }

      if (!email) {
        setErrForEl(emailEl, "Email mütləqdir.");
        return false;
      }
      if (!isValidEmail(email)) {
        setErrForEl(emailEl, "Email formatı yanlışdır.");
        return false;
      }

      // yalnız gmail istəsən aç:
      // if (!isGmail(email)) { setErrForEl(emailEl, "Yalnız Gmail qəbul olunur."); return false; }

      const phone = form?.elements?.phone?.value?.trim?.() ?? "";
      if (!phone) {
        const el = form?.elements?.phone;
        const field = el?.closest?.(".field");
        const err = field?.querySelector?.(".field__err");
        if (err) err.textContent = "Telefon mütləqdir.";
        return false;
      }
    }

    return true;
  }

  function renderSummary() {
    if (!summaryText) return;
    const make = document.getElementById("makeValue")?.value || "-";
    const model = document.getElementById("modelValue")?.value || "-";
    const year = document.getElementById("yearValue")?.value || "-";
    const price = form?.elements?.price?.value || "-";
    const currency = form?.elements?.currency?.value || "AZN";
    const city = form?.elements?.city?.value || "-";

    // ✅ NEW: show fullname + email in summary (optional display)
    const fullname = document.getElementById("fullName")?.value?.trim?.() || "-";
    const email = document.getElementById("email")?.value?.trim?.() || "-";

    summaryText.textContent =
      `${make} ${model} (${year}) — ${price} ${currency}. ` +
      `Şəhər: ${city}. Şəkil: ${photos.length}. ` +
      `Əlaqə: ${fullname}, ${email}.`;
  }

  backBtn?.addEventListener("click", () => {
    closeAllTsel();
    setStep(step - 1);
  });

  nextBtn?.addEventListener("click", () => {
    closeAllTsel();
    if (!validateStep()) return;

    if (step < steps.length) {
      setStep(step + 1);
      return;
    }

    window.location.href = "index.html#list";
  });

  // ---------------------------
  // .tsel Dropdown Core
  // ---------------------------
  function closeAllTsel(exceptWrap = null) {
    $$(".tsel.is-open").forEach((w) => {
      if (exceptWrap && w === exceptWrap) return;
      w.classList.remove("is-open");
      w.querySelector(".tsel__panel")?.setAttribute("aria-hidden", "true");
    });
  }

  function wireTsel({
    wrapId,
    btnId,
    textId,
    searchId,
    listId,
    hiddenId,
    getItems,
    onPick,
    emptyText = "Hamısı",
  }) {
    const wrap = document.getElementById(wrapId);
    const btn = document.getElementById(btnId);
    const text = document.getElementById(textId);
    const search = document.getElementById(searchId);
    const list = document.getElementById(listId);
    const hidden = document.getElementById(hiddenId);
    const panel = wrap?.querySelector?.(".tsel__panel");

    if (!wrap || !btn || !text || !search || !list || !hidden || !panel) {
      console.warn("tsel missing:", {
        wrapId,
        btnId,
        textId,
        searchId,
        listId,
        hiddenId,
      });
      return null;
    }

    function setValue(val) {
      hidden.value = val;
      text.textContent = val ? val : emptyText;
      setErrForHidden(hidden, "");
      if (typeof onPick === "function") onPick(val);
    }

    function render(items, q = "") {
      const qq = q.trim().toLowerCase();
      const filtered = !qq ? items : items.filter((x) => x.toLowerCase().includes(qq));
      list.innerHTML = "";

      filtered.forEach((item) => {
        const row = document.createElement("div");
        row.className = "tsel__row" + (hidden.value === item ? " is-active" : "");
        row.textContent = item;
        row.dataset.value = item;
        row.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          setValue(item);
          closeAllTsel();
        });
        list.appendChild(row);
      });
    }

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (btn.disabled) return;

      const willOpen = !wrap.classList.contains("is-open");
      closeAllTsel(wrap);

      if (willOpen) {
        wrap.classList.add("is-open");
        panel.setAttribute("aria-hidden", "false");
        const items = getItems();
        search.value = "";
        render(items, "");
        setTimeout(() => search.focus(), 0);
      } else {
        wrap.classList.remove("is-open");
        panel.setAttribute("aria-hidden", "true");
      }
    });

    search.addEventListener("input", () => render(getItems(), search.value));

    wrap.querySelectorAll(".tsel__clear .tsel__row").forEach((r) => {
      r.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        setValue("");
        closeAllTsel();
      });
    });

    return { wrap, btn, text, hidden, setValue, render };
  }

  // ---------------------------
  // Wire Make / Model / Year
  // ---------------------------
  const makeCtl = wireTsel({
    wrapId: "tselMake",
    btnId: "makeBtn",
    textId: "makeText",
    searchId: "makeSearch",
    listId: "makeList",
    hiddenId: "makeValue",
    getItems: () => Object.keys(MAKE_MODELS),
    onPick: () => {
      modelCtl?.setValue("");
      if (modelCtl) {
        modelCtl.btn.disabled = !makeCtl.hidden.value;
        modelCtl.text.textContent = makeCtl.hidden.value ? "Hamısı" : "Əvvəl marka seç";
      }
    },
  });

  const modelCtl = wireTsel({
    wrapId: "tselModel",
    btnId: "modelBtn",
    textId: "modelText",
    searchId: "modelSearch",
    listId: "modelList",
    hiddenId: "modelValue",
    getItems: () => {
      const mk = document.getElementById("makeValue")?.value || "";
      return mk ? (MAKE_MODELS[mk] || []) : [];
    },
  });

  const yearCtl = wireTsel({
    wrapId: "tselYear",
    btnId: "yearBtn",
    textId: "yearText",
    searchId: "yearSearch",
    listId: "yearList",
    hiddenId: "yearValue",
    getItems: () => YEARS,
  });

  if (modelCtl) {
    modelCtl.btn.disabled = true;
    modelCtl.text.textContent = "Əvvəl marka seç";
  }

  document.addEventListener("click", (e) => {
    if (e.target.closest(".tsel")) return;
    closeAllTsel();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAllTsel();
  });

  // ---------------------------
  // Description counter
  // ---------------------------
  const desc = form?.elements?.desc;
  const descCount = document.getElementById("descCount");
  if (desc && descCount) {
    const upd = () => (descCount.textContent = String(desc.value.length));
    desc.addEventListener("input", upd);
    upd();
  }

  // ---------------------------
  // Photos uploader + cover + reorder (mouse drag)
  // ---------------------------
  const photosInput = document.getElementById("photosInput");
  const addPhotosBtn = document.getElementById("addPhotosBtn");
  const uploader = document.getElementById("uploader");
  const photosGrid = document.getElementById("photosGrid");
  const photosErr = document.getElementById("photosErr");

  let photos = [];

  function addFiles(fileList) {
    const files = Array.from(fileList || []);
    for (const file of files) {
      if (!file.type?.startsWith?.("image/")) continue;
      const id = (crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()));
      const url = URL.createObjectURL(file);
      photos.push({ id, file, url });
    }
    renderPhotos();
  }

  // Cover = photos[0]
  function setCoverById(id) {
    const idx = photos.findIndex((p) => p.id === id);
    if (idx <= 0) return;
    const item = photos.splice(idx, 1)[0];
    photos.unshift(item);
    renderPhotos();
  }

  // Reorder by drag
  let dragId = null;

  function movePhoto(fromId, toId) {
    if (!fromId || !toId || fromId === toId) return;

    const fromIndex = photos.findIndex((p) => p.id === fromId);
    const toIndex = photos.findIndex((p) => p.id === toId);
    if (fromIndex < 0 || toIndex < 0) return;

    const [item] = photos.splice(fromIndex, 1);
    photos.splice(toIndex, 0, item);

    renderPhotos();
  }

  function renderPhotos() {
    if (!photosGrid) return;
    photosGrid.innerHTML = "";

    photos.forEach((p, i) => {
      const el = document.createElement("div");
      el.className = "ph";
      el.draggable = true;
      el.dataset.id = p.id;

      el.innerHTML = `
        <img src="${p.url}" alt="photo ${i + 1}">
        ${
          i === 0
            ? `<span class="ph__badge">Cover</span>`
            : `<button class="ph__cover" type="button">Cover et</button>`
        }
        <button class="ph__x" type="button" aria-label="Sil">×</button>
      `;

      // delete
      el.querySelector(".ph__x")?.addEventListener("click", () => {
        URL.revokeObjectURL(p.url);
        photos = photos.filter((x) => x.id !== p.id);
        renderPhotos();
      });

      // set cover
      el.querySelector(".ph__cover")?.addEventListener("click", () => {
        setCoverById(p.id);
      });

      // drag handlers
      el.addEventListener("dragstart", (e) => {
        dragId = p.id;
        el.classList.add("is-dragging");
        e.dataTransfer.effectAllowed = "move";
      });

      el.addEventListener("dragend", () => {
        dragId = null;
        el.classList.remove("is-dragging");
        el.classList.remove("is-over");
      });

      el.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        el.classList.add("is-over");
      });

      el.addEventListener("dragleave", () => {
        el.classList.remove("is-over");
      });

      el.addEventListener("drop", (e) => {
        e.preventDefault();
        el.classList.remove("is-over");
        const targetId = el.dataset.id;
        movePhoto(dragId, targetId);
      });

      photosGrid.appendChild(el);
    });

    if (photosErr) {
      photosErr.textContent = photos.length >= 3 ? "" : "Minimum 3 şəkil əlavə et.";
    }
  }

  addPhotosBtn?.addEventListener("click", () => photosInput?.click());

  photosInput?.addEventListener("change", (e) => {
    addFiles(e.target.files);
    photosInput.value = "";
  });

  // drag & drop upload
  if (uploader) {
    ["dragenter", "dragover"].forEach((evt) => {
      uploader.addEventListener(evt, (e) => e.preventDefault());
    });
    uploader.addEventListener("drop", (e) => {
      e.preventDefault();
      addFiles(e.dataTransfer?.files);
    });
  }

  // ---------------------------
  // Init
  // ---------------------------
  setStep(1);

  // ---------------------------
  // Phone mask: +994 (0XX) XXX-XX-XX
  // ---------------------------
  initPhoneMask();

  function initPhoneMask() {
    const input = form?.elements?.phone; // name="phone"
    if (!input) return;

    const PREFIX = "+994 ";

    const onlyDigits = (s) => (s || "").replace(/\D/g, "");

    function formatAZ(rawDigits) {
      let d = rawDigits;

      // user +994 yazıbsa, 994-i kəs
      if (d.startsWith("994")) d = d.slice(3);

      // max 10 rəqəm (0XX XXX XX XX)
      d = d.slice(0, 10);

      // 0 yoxdursa əlavə et
      if (d.length > 0 && d[0] !== "0") d = "0" + d;
      d = d.slice(0, 10);

      const op = d.slice(0, 3); // 0XX
      const p1 = d.slice(3, 6); // XXX
      const p2 = d.slice(6, 8); // XX
      const p3 = d.slice(8, 10); // XX

      let out = PREFIX;

      if (d.length === 0) return out;

      out += "(" + op;
      if (op.length === 3) out += ") ";
      else return out;

      out += p1;
      if (p1.length === 3) out += "-";
      else return out;

      out += p2;
      if (p2.length === 2) out += "-";
      else return out;

      out += p3;
      return out;
    }

    function caretEnd() {
      const len = input.value.length;
      input.setSelectionRange(len, len);
    }

    // start value
    if (!input.value || !input.value.startsWith(PREFIX)) {
      input.value = PREFIX;
    }

    input.addEventListener("focus", () => {
      if (!input.value || !input.value.startsWith(PREFIX)) input.value = PREFIX;
      caretEnd();
    });

    input.addEventListener("keydown", (e) => {
      // prefix silinməsin
      if (e.key === "Backspace" && input.selectionStart <= PREFIX.length) {
        e.preventDefault();
        input.value = PREFIX;
        caretEnd();
      }
    });

    input.addEventListener("input", () => {
      const digits = onlyDigits(input.value);
      input.value = formatAZ(digits);
      caretEnd();
    });

    input.addEventListener("paste", (e) => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData("text");
      const digits = onlyDigits(text);
      input.value = formatAZ(digits);
      caretEnd();
    });
  }
});
