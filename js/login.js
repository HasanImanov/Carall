// login.js — FINAL VERSION
console.log("Login FINAL VERSION");

const SESSION_KEY = "carall_session_v1";

const qs = (s, r = document) => r.querySelector(s);
const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));

const tabs = qsa(".tab");
const panes = qsa("[data-pane]");
const msgBox = qs("#msg");

function showMsg(text, type = "err") {
  if (!msgBox) return alert(text);

  msgBox.hidden = false;
  msgBox.className = "msg " + (type === "ok" ? "ok" : "err");
  msgBox.textContent = text;
}

function hideMsg() {
  if (msgBox) msgBox.hidden = true;
}

function getReturn() {
  const p = new URLSearchParams(location.search);
  return p.get("return");
}

function afterLogin() {
  location.href = getReturn() || "index.html";
}

function normPhone(v) {
  return String(v || "").replace(/\s+/g, "").trim();
}

function setTab(name) {
  hideMsg();

  tabs.forEach(t => {
    t.classList.toggle("is-active", t.dataset.tab === name);
  });

  panes.forEach(p => {
    p.hidden = p.dataset.pane !== name;
  });

  localStorage.setItem("carall_login_tab", name);
}

tabs.forEach(t => {
  t.addEventListener("click", () => setTab(t.dataset.tab));
});

setTab(localStorage.getItem("carall_login_tab") || "personal");

// =========================
// 🔥 LOGIN SUBMIT
// =========================
qsa(".login-form").forEach(form => {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideMsg();

    const type = form.dataset.type || "personal";
    const phone = normPhone(qs('[name="phone"]', form)?.value);
    const password = qs('[name="password"]', form)?.value;

    if (!phone || !password) {
      return showMsg("Məlumatları doldurun.");
    }

    try {
      const res = await fetch("https://carall.az/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          phone,
          password
        })
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      console.log("LOGIN RESPONSE:", data);

      if (!res.ok) {
        return showMsg(data.message || data.error || "Login alınmadı.");
      }

      // =========================
      // 🔥 TOKEN
      // =========================
      const accessToken =
        data.accessToken ||
        data.access_token ||
        data.token ||
        data?.data?.accessToken ||
        data?.data?.access_token ||
        data?.data?.token;

      const refreshToken =
        data.refreshToken ||
        data.refresh_token ||
        data?.data?.refreshToken ||
        data?.data?.refresh_token;

      if (!accessToken) {
        console.error("Token tapılmadı:", data);
        return showMsg("Login oldu, amma token gəlmədi.");
      }

      localStorage.setItem("access_token", accessToken);

      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
      }

      // =========================
      // 🔥 USER DATA
      // =========================
      const user =
        data.user ||
        data.data?.user ||
        data.data ||
        data;

      const name =
        user.name ||
        user.fullName ||
        user.firstName ||
        user.first_name ||
        user.username ||
        user.displayName ||
        user.display_name ||
        user.companyName ||
        user.company_name ||
        "";

      // =========================
      // 🔥 SESSION (BURDA ƏSAS)
      // =========================
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        phone,
        type,
        loggedIn: true,
        name
      }));

      console.log("SESSION SAVED:", {
        phone,
        type,
        name
      });

      showMsg("Uğurlu giriş ✅", "ok");

      setTimeout(afterLogin, 500);

    } catch (err) {
      console.error("LOGIN ERROR:", err);
      showMsg("Server xətası ❌");
    }
  });
});