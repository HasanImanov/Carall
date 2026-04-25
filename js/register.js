// js/register.js — register personal/business

console.log("REGISTER JS NEW VERSION LOADED");

const USERS_KEY = "carall_users_v1";
const SESSION_KEY = "carall_session_v1";

const reg$ = (s, r = document) => r.querySelector(s);
const reg$$ = (s, r = document) => [...r.querySelectorAll(s)];

const tabs = reg$$(".tab");
const panes = reg$$("[data-pane]");
const msgBox = reg$("#msg");

function showMsg(text, type = "err") {
  if (!msgBox) return;
  msgBox.hidden = false;
  msgBox.className = "msg " + (type === "ok" ? "ok" : "err");
  msgBox.textContent = text;
}

function hideMsg() {
  if (!msgBox) return;
  msgBox.hidden = true;
}

function normEmail(v) {
  return String(v || "").trim().toLowerCase();
}

function normPhone(v) {
  return String(v || "").replace(/\s+/g, "").trim();
}

async function readResponse(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { message: text };
  }
}

// TAB SWITCH
function setTab(name) {
  hideMsg();

  tabs.forEach((t) => {
    t.classList.toggle("is-active", t.dataset.tab === name);
  });

  panes.forEach((p) => {
    p.hidden = p.dataset.pane !== name;
  });

  localStorage.setItem("carall_register_tab", name);
}

tabs.forEach((t) => {
  t.addEventListener("click", () => setTab(t.dataset.tab));
});

setTab(localStorage.getItem("carall_register_tab") || "personal");

// EXTRA PHONES
const addPhoneBtn = reg$("#addPhoneBtn");
const extraPhonesBox = reg$("#extraPhones");

function addPhoneRow(value = "") {
  if (!extraPhonesBox) return;

  const row = document.createElement("div");
  row.className = "phone-row";
  row.innerHTML = `
    <input class="in" type="tel" placeholder="+994 xx xxx xx xx" value="${value}">
    <button class="del" type="button">Sil</button>
  `;

  row.querySelector(".del").addEventListener("click", () => row.remove());
  extraPhonesBox.appendChild(row);
}

if (addPhoneBtn) {
  addPhoneBtn.addEventListener("click", () => addPhoneRow());
}

// SUBMIT handlers
reg$$(".reg-form").forEach((form) => {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideMsg();

    const type = form.dataset.type;

    // PERSONAL
    if (type === "personal") {
      const firstName = form.firstName.value.trim();
      const lastName = form.lastName.value.trim();
      const email = normEmail(form.email.value);
      const phone = normPhone(form.phone.value);
      const pw = form.password.value;
      const pw2 = form.password2.value;

      const name = `${firstName} ${lastName}`.trim();

      if (!name || !email || !phone || !pw || !pw2) {
        return showMsg("Bütün vacib xanaları doldurun.");
      }

      if (pw !== pw2) return showMsg("Parollar uyğun deyil.");
      if (pw.length < 6) return showMsg("Parol minimum 6 simvol olmalıdır.");

      try {
        const res = await fetch("https://carall.az/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name,
            email,
            phone,
            password: pw
          })
        });

        const data = await readResponse(res);
        console.log("REGISTER RESPONSE:", data);

        if (!res.ok) {
          return showMsg(data.message || "Qeydiyyat alınmadı.");
        }

        showMsg("OTP emailə göndərildi ✅", "ok");

        setTimeout(() => {
          window.location.href = "verify.html?email=" + encodeURIComponent(email);
        }, 700);

        return;
      } catch (err) {
        console.error(err);
        return showMsg("Server xətası ❌");
      }
    }

    // BUSINESS
    if (type === "business") {
      const companyName = form.companyName.value.trim();
      const email = normEmail(form.email.value);
      const phone = normPhone(form.phone.value);
      const pw = form.password.value;
      const pw2 = form.password2.value;

      const name = companyName;

      if (!name || !email || !phone || !pw || !pw2) {
        return showMsg("Bütün vacib xanaları doldurun.");
      }

      if (pw !== pw2) return showMsg("Parollar uyğun deyil.");
      if (pw.length < 6) return showMsg("Parol minimum 6 simvol olmalıdır.");

      try {
        const res = await fetch("https://carall.az/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name,
            email,
            phone,
            password: pw
          })
        });

        const data = await readResponse(res);
        console.log("REGISTER RESPONSE:", data);

        if (!res.ok) {
          return showMsg(data.message || "Qeydiyyat alınmadı.");
        }

        showMsg("OTP emailə göndərildi ✅", "ok");

        setTimeout(() => {
          window.location.href = "verify.html?email=" + encodeURIComponent(email);
        }, 700);

        return;
      } catch (err) {
        console.error(err);
        return showMsg("Server xətası ❌");
      }
    }
  });
});