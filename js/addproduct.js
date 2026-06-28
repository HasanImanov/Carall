document.addEventListener("DOMContentLoaded", () => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  const form = document.getElementById("listingForm");
  const steps = $$(".step");
  const dots = $$(".dot");
  const stepCount = document.getElementById("stepCount");
  const backBtn = document.getElementById("backBtn");
  const nextBtn = document.getElementById("nextBtn");
  const summaryText = document.getElementById("summaryText");

  const photosInput = document.getElementById("photosInput");
  const addPhotosBtn = document.getElementById("addPhotosBtn");
  const uploader = document.getElementById("uploader");
  const photosGrid = document.getElementById("photosGrid");
  const photosErr = document.getElementById("photosErr");

  let step = 1;
  let photos = [];

  const YEARS = (() => {
    const arr = [];
    const now = new Date().getFullYear();
    const end = Math.max(now, 2027);
    for (let y = end; y >= 1990; y--) arr.push(String(y));
    return arr;
  })();

  function setErrForHidden(hiddenEl, msg = "") {
    const field = hiddenEl?.closest(".field");
    const err = field?.querySelector(".field__err");
    if (err) err.textContent = msg;
  }

  function setErrForEl(el, msg = "") {
    const field = el?.closest?.(".field");
    const err = field?.querySelector?.(".field__err");
    if (err) err.textContent = msg;
  }

  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
  }

  function closeAllTsel(exceptWrap = null) {
    $$(".tsel.is-open").forEach((w) => {
      if (exceptWrap && w === exceptWrap) return;
      w.classList.remove("is-open");
      w.querySelector(".tsel__panel")?.setAttribute("aria-hidden", "true");
    });
  }

  function setStep(n) {
    step = clamp(n, 1, steps.length);

    steps.forEach((s) =>
      s.classList.toggle("is-active", Number(s.dataset.step) === step)
    );

    dots.forEach((d, i) => d.classList.toggle("is-on", i === step - 1));

    if (stepCount) stepCount.textContent = `${step} / ${steps.length}`;
    if (backBtn) backBtn.disabled = step === 1;

    if (nextBtn) {
      nextBtn.textContent =
        step === steps.length ? "Elanı yerləşdir ✅" : "Davam et →";
    }

    if (step === 4) renderSummary();

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function validateStep() {
    $$(".step.is-active .field__err").forEach((e) => (e.textContent = ""));

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

      const km = form?.elements?.km;
      if (!km?.value?.trim()) {
        setErrForEl(km, "Yürüş mütləqdir.");
        return false;
      }
    }

    if (step === 2) {
      const price = form?.elements?.price;
      const priceVal = price?.value?.trim() || "";

      if (!priceVal) {
        setErrForEl(price, "Qiymət mütləqdir.");
        return false;
      }

      if (Number(priceVal) <= 0) {
        setErrForEl(price, "Qiymət düzgün deyil.");
        return false;
      }
    }

    if (step === 3) {
      if (photos.length < 3) {
        if (photosErr) photosErr.textContent = "Minimum 3 şəkil əlavə et.";
        return false;
      }

      if (photosErr) photosErr.textContent = "";
    }

    if (step === 4) {
      const fullNameEl = document.getElementById("fullName");
      const emailEl = document.getElementById("email");
      const phoneEl = form?.elements?.phone;

      const fullname = fullNameEl?.value?.trim() || "";
      const email = emailEl?.value?.trim() || "";
      const phone = phoneEl?.value?.trim() || "";

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

      if (!phone || phone === "+994 ") {
        setErrForEl(phoneEl, "Telefon mütləqdir.");
        return false;
      }
    }

    return true;
  }

  function renderSummary() {
    if (!summaryText) return;

    const make = document.getElementById("makeText")?.textContent || "-";
    const model = document.getElementById("modelText")?.textContent || "-";
    const year = document.getElementById("yearValue")?.value || "-";
    const price = form?.elements?.price?.value || "-";
    const currency = form?.elements?.currency?.value || "AZN";
    const city = form?.elements?.city?.value || "-";
    const fullname = document.getElementById("fullName")?.value?.trim() || "-";
    const email = document.getElementById("email")?.value?.trim() || "-";

    summaryText.textContent =
      `${make} ${model} (${year}) — ${price} ${currency}. ` +
      `Şəhər: ${city}. Şəkil: ${photos.length}. ` +
      `Əlaqə: ${fullname}, ${email}.`;
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

    if (!wrap || !btn || !text || !search || !list || !hidden || !panel) return null;

    function setValue(val, label = "") {
      hidden.value = val || "";
      text.textContent = val ? (label || val) : emptyText;
      setErrForHidden(hidden, "");
      if (typeof onPick === "function") onPick(val);
    }

    function render(items, q = "") {
      const qq = q.trim().toLowerCase();
      const filtered = !qq
        ? items
        : items.filter((x) => String(x.label).toLowerCase().includes(qq));

      list.innerHTML = "";

      filtered.forEach((item) => {
        const row = document.createElement("div");
        row.className = "tsel__row" + (String(hidden.value) === String(item.value) ? " is-active" : "");
        row.textContent = item.label;
        row.dataset.value = item.value;

        row.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          setValue(item.value, item.label);
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
        search.value = "";
        render(getItems(), "");
        setTimeout(() => search.focus(), 0);
      } else {
        closeAllTsel();
      }
    });

    search.addEventListener("input", () => render(getItems(), search.value));

    wrap.querySelectorAll(".tsel__clear .tsel__row").forEach((r) => {
      r.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        setValue("", emptyText);
        closeAllTsel();
      });
    });

    return { wrap, btn, text, hidden, setValue, render };
  }

  const yearCtl = wireTsel({
    wrapId: "tselYear",
    btnId: "yearBtn",
    textId: "yearText",
    searchId: "yearSearch",
    listId: "yearList",
    hiddenId: "yearValue",
    getItems: () => YEARS.map((y) => ({ value: y, label: y })),
  });
  

 let MAKES = [];
let MODELS = [];

const makeCtl = wireTsel({
  wrapId: "tselMake",
  btnId: "makeBtn",
  textId: "makeText",
  searchId: "makeSearch",
  listId: "makeList",
  hiddenId: "makeValue",
  getItems: () => MAKES,
  onPick: (makeId) => {
    const modelText = document.getElementById("modelText");
    const modelValue = document.getElementById("modelValue");
    const modelBtn = document.getElementById("modelBtn");

    if (modelText) modelText.textContent = "Hamısı";
    if (modelValue) modelValue.value = "";
    if (modelBtn) modelBtn.disabled = !makeId;

    MODELS = [];
    modelCtl?.render(MODELS, "");

    if (makeId) loadModels(makeId);
  }
});

const modelCtl = wireTsel({
  wrapId: "tselModel",
  btnId: "modelBtn",
  textId: "modelText",
  searchId: "modelSearch",
  listId: "modelList",
  hiddenId: "modelValue",
  getItems: () => MODELS,
});

async function loadMakes() {
  try {
    const res = await fetch("https://carall.az/api/lookups/makes");
    const makes = await res.json();

    MAKES = makes.map((m) => ({
      value: String(m.id),
      label: m.name
    }));

    makeCtl?.render(MAKES, "");
  } catch (err) {
    console.error("MAKE ERROR:", err);
  }
}

async function loadModels(makeId) {
  try {
    const res = await fetch(`https://carall.az/api/lookups/models/${makeId}`);
    const models = await res.json();

    MODELS = models.map((m) => ({
      value: String(m.id),
      label: m.name
    }));

    modelCtl?.render(MODELS, "");
  } catch (err) {
    console.error("MODEL ERROR:", err);
  }
}

  async function fillSelect(selector, url, mapText = "name") {
    try {
      const res = await fetch(url);
      const data = await res.json();

      const select = document.querySelector(selector);
      if (!select) return;

      select.innerHTML =
        `<option value="">Seç</option>` +
        data.map(x => `<option value="${x.id}">${x[mapText]}</option>`).join("");

    } catch (err) {
      console.error("LOOKUP ERROR:", selector, err);
    }
  }

  function addFiles(fileList) {
    const files = Array.from(fileList || []);

    for (const file of files) {
      if (!file.type?.startsWith?.("image/")) continue;

      const id = crypto?.randomUUID
        ? crypto.randomUUID()
        : String(Date.now() + Math.random());

      const url = URL.createObjectURL(file);
      photos.push({ id, file, url });
    }

    renderPhotos();
  }

  function setCoverById(id) {
    const idx = photos.findIndex((p) => p.id === id);
    if (idx <= 0) return;

    const item = photos.splice(idx, 1)[0];
    photos.unshift(item);
    renderPhotos();
  }

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

      el.querySelector(".ph__x")?.addEventListener("click", () => {
        URL.revokeObjectURL(p.url);
        photos = photos.filter((x) => x.id !== p.id);
        renderPhotos();
      });

      el.querySelector(".ph__cover")?.addEventListener("click", () => {
        setCoverById(p.id);
      });

      el.addEventListener("dragstart", (e) => {
        dragId = p.id;
        el.classList.add("is-dragging");
        e.dataTransfer.effectAllowed = "move";
      });

      el.addEventListener("dragend", () => {
        dragId = null;
        el.classList.remove("is-dragging", "is-over");
      });

      el.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        el.classList.add("is-over");
      });

      el.addEventListener("dragleave", () => el.classList.remove("is-over"));

      el.addEventListener("drop", (e) => {
        e.preventDefault();
        el.classList.remove("is-over");
        movePhoto(dragId, el.dataset.id);
      });

      photosGrid.appendChild(el);
    });

    if (photosErr) {
      photosErr.textContent = photos.length >= 3 ? "" : "Minimum 3 şəkil əlavə et.";
    }
  }

  async function submitListing() {
  try {
    nextBtn.disabled = true;
    nextBtn.textContent = "Göndərilir...";

    const fullnameVal = document.getElementById("fullName").value.trim();
    const emailVal = document.getElementById("email").value.trim();
    const phoneVal = document.querySelector('input[name="phone"]').value.trim();

    const payload = {
      Name: fullnameVal,
      name: fullnameVal,
      fullName: fullnameVal,
      userAccountName: fullnameVal,
      sellerName: fullnameVal,
      contactName: fullnameVal,
      ownerName: fullnameVal,

      email: emailVal,
      Email: emailVal,
      phone: phoneVal,
      Phone: phoneVal,

      makeId: Number(document.getElementById("makeValue").value),
      modelId: Number(document.getElementById("modelValue").value),
      year: Number(document.getElementById("yearValue").value),

      colorId: Number(document.getElementById("colorSelect").value) || null,
      bodyTypeId: Number(document.querySelector('select[name="body"]').value) || null,
      fuelTypeId: Number(document.querySelector('select[name="fuel"]').value),
      transmissionId: Number(document.querySelector('select[name="gear"]').value),

      mileage: Number(document.querySelector('input[name="km"]').value),
      price: Number(document.querySelector('input[name="price"]').value),
      currency: document.querySelector('select[name="currency"]').value || "AZN",

      description: document.querySelector('textarea[name="desc"]').value || "",

      cityId: document.getElementById("citySelect")?.value
        ? Number(document.getElementById("citySelect").value)
        : null,

      credit: !!document.querySelector('input[name="credit"]')?.checked,
      barter: !!document.querySelector('input[name="barter"]')?.checked,
      urgent: !!document.querySelector('input[name="urgent"]')?.checked,
      whatsapp: !!document.querySelector('input[name="whatsapp"]')?.checked
    };

    const fd = new FormData();
    fd.append("Data", JSON.stringify(payload));

    photos.forEach(p => {
      fd.append("Images", p.file);
    });

    const res = await fetch("https://carall.az/api/Listings", {
      method: "POST",
      body: fd
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("POST ERROR:", res.status, errText);
      alert("Elan göndərilmədi. Console-a bax.");
      return;
    }

    const data = await res.json();

    openCarallModal("created", {
  text: "Elanınız qəbul edildi və yoxlanışa göndərildi.",
  primaryText: "Elanlarıma bax",
  primaryHref: "profile.html",
  secondaryText: "Ana səhifəyə qayıt",
  secondaryHref: "index.html"
});

  } catch (err) {
    console.error("POST ERROR:", err);
    alert("Xəta baş verdi.");
  } finally {
    nextBtn.disabled = false;
    nextBtn.textContent = "Elanı yerləşdir ✅";
  }
}

  function initPhoneMask() {
    const input = form?.elements?.phone;
    if (!input) return;

    const PREFIX = "+994 ";
    const onlyDigits = (s) => (s || "").replace(/\D/g, "");

    function formatAZ(rawDigits) {
      let d = rawDigits;

      if (d.startsWith("994")) d = d.slice(3);

      d = d.slice(0, 10);

      if (d.length > 0 && d[0] !== "0") d = "0" + d;
      d = d.slice(0, 10);

      const op = d.slice(0, 3);
      const p1 = d.slice(3, 6);
      const p2 = d.slice(6, 8);
      const p3 = d.slice(8, 10);

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

    if (!input.value || !input.value.startsWith(PREFIX)) {
      input.value = PREFIX;
    }

    input.addEventListener("focus", () => {
      if (!input.value || !input.value.startsWith(PREFIX)) input.value = PREFIX;
      caretEnd();
    });

    input.addEventListener("keydown", (e) => {
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

  backBtn?.addEventListener("click", () => {
    closeAllTsel();
    setStep(step - 1);
  });

  nextBtn?.addEventListener("click", async () => {
    closeAllTsel();
    if (!validateStep()) return;

    if (step < steps.length) {
      setStep(step + 1);
      return;
    }

    await submitListing();
  });

  addPhotosBtn?.addEventListener("click", () => photosInput?.click());

  photosInput?.addEventListener("change", (e) => {
    addFiles(e.target.files);
    photosInput.value = "";
  });

  if (uploader) {
    ["dragenter", "dragover"].forEach((evt) => {
      uploader.addEventListener(evt, (e) => e.preventDefault());
    });

    uploader.addEventListener("drop", (e) => {
      e.preventDefault();
      addFiles(e.dataTransfer?.files);
    });
  }

  document.addEventListener("click", (e) => {
    if (e.target.closest(".tsel")) return;
    closeAllTsel();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAllTsel();
  });

  loadMakes();
  fillSelect("#colorSelect", "https://carall.az/api/lookups/colors");
  fillSelect('select[name="body"]', "https://carall.az/api/lookups/vehicle-types");
  fillSelect('select[name="fuel"]', "https://carall.az/api/lookups/fuel-types");
  fillSelect('select[name="gear"]', "https://carall.az/api/lookups/transmissions", "type");
loadCities(); 

  initPhoneMask();
  setStep(1);
});


async function loadCities() {
  try {
    const res = await fetch("https://carall.az/api/lookups/cities");
    const cities = await res.json();

    const select = document.getElementById("citySelect");
    if (!select) return;

    select.innerHTML =
      `<option value="">Seç</option>` +
      cities.map(c => `<option value="${c.id}">${c.name}</option>`).join("");

  } catch (err) {
    console.error("CITY ERROR:", err);
  }
}
window.openCarallModal = function(type = "edited", options = {}) {
  const modal = document.getElementById("caModal");
  const title = document.getElementById("caModalTitle");
  const text = document.getElementById("caModalText");
  const primary = document.getElementById("caModalPrimary");
  const secondary = document.getElementById("caModalSecondary");

  if (!modal || !title || !text || !primary || !secondary) return;

  const map = {
    created: {
      title: "Elan uğurla yerləşdirildi",
      text: "Elanınız qəbul edildi və yoxlanışa göndərildi. Təsdiqləndikdən sonra saytda dərc olunacaq.",
      primaryText: "Elanlarıma bax",
      primaryHref: "profile.html",
      secondaryText: "Ana səhifəyə qayıt",
      secondaryHref: "index.html"
    },
    edited: {
      title: "Elan uğurla yeniləndi",
      text: "Dəyişikliklər yadda saxlanıldı.",
      primaryText: "Elana bax",
      primaryHref: location.href,
      secondaryText: "Ana səhifəyə qayıt",
      secondaryHref: "index.html"
    },
    deleted: {
      title: "Elan uğurla silindi",
      text: "Elan artıq siyahıda görünməyəcək.",
      primaryText: "Elanlarıma bax",
      primaryHref: "profile.html",
      secondaryText: "Ana səhifəyə qayıt",
      secondaryHref: "index.html"
    }
  };

  const c = map[type] || map.edited;

  title.textContent = options.title || c.title;
  text.textContent = options.text || c.text;
  primary.textContent = options.primaryText || c.primaryText;
  primary.href = options.primaryHref || c.primaryHref;
  secondary.textContent = options.secondaryText || c.secondaryText;
  secondary.href = options.secondaryHref || c.secondaryHref;

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
};

window.closeCarallModal = function() {
  const modal = document.getElementById("caModal");
  if (!modal) return;

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
};

document.addEventListener("click", function(e) {
  if (e.target.id === "caModalClose" || e.target.hasAttribute("data-ca-close")) {
    window.closeCarallModal();
  }
});