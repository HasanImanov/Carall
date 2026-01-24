// login.js — tabs + login (localStorage demo)

const USERS_KEY = "carall_users_v1";
const SESSION_KEY = "carall_session_v1";

const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];

const tabs = $$(".tab");
const panes = $$("[data-pane]");
const msgBox = $("#msg");

function showMsg(text, type="err"){
  msgBox.hidden = false;
  msgBox.className = "msg " + (type === "ok" ? "ok" : "err");
  msgBox.textContent = text;
}
function hideMsg(){ msgBox.hidden = true; }

function loadUsers(){
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); }
  catch { return []; }
}
function saveSession(userId){
  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId }));
}
function getReturn(){
  const p = new URLSearchParams(location.search);
  return p.get("return");
}
function afterLogin(){
  location.href = getReturn() || "index.html";
}

function normEmail(v){ return String(v||"").trim().toLowerCase(); }
function normPhone(v){ return String(v||"").replace(/\s+/g,"").trim(); }

// demo password check (plain)
function checkPw(u, pw){ return u.password === pw; }

// --- TAB SWITCH
function setTab(name){
  hideMsg();

  tabs.forEach(t => t.classList.toggle("is-active", t.dataset.tab === name));
  panes.forEach(p => p.hidden = (p.dataset.pane !== name));

  localStorage.setItem("carall_login_tab", name);
}

tabs.forEach(t => t.addEventListener("click", () => setTab(t.dataset.tab)));
setTab(localStorage.getItem("carall_login_tab") || "personal");


// --- SUBMIT (hər iki form üçün)
$$(".login-form").forEach(form => {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    hideMsg();

    const type = form.dataset.type; // personal | business
    const users = loadUsers();

    if (type === "personal") {
      const email = normEmail(form.querySelector('[name="email"]').value);
      const pw = form.querySelector('[name="password"]').value;

      const user = users.find(u => u.type === "personal" && u.email === email);
      if(!user) return showMsg("E-mail tapılmadı.");
      if(!checkPw(user, pw)) return showMsg("Parol yanlışdır.");

      saveSession(user.id);
      showMsg("Uğurlu giriş ✅", "ok");
      setTimeout(afterLogin, 200);
      return;
    }

    if (type === "business") {
      const phone = normPhone(form.querySelector('[name="phone"]').value);
      const pw = form.querySelector('[name="password"]').value;

      const user = users.find(u => u.type === "business" && u.phone === phone);
      if(!user) return showMsg("Nömrə tapılmadı.");
      if(!checkPw(user, pw)) return showMsg("Parol yanlışdır.");

      saveSession(user.id);
      showMsg("Uğurlu giriş ✅", "ok");
      setTimeout(afterLogin, 200);
      return;
    }
  });
});
