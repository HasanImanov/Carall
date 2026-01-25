const USERS_KEY = "carall_users_v1";
const RESET_KEY = "carall_reset_v1";

const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];

const tabs = $$(".tab");
const panes = $$("[data-pane]");
const msgBox = $("#msg");

const step1 = $("#step1");
const step2 = $("#step2");
const resetForm = $("#resetForm");
const backToStep1 = $("#backToStep1");

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

function normEmail(v){ return String(v||"").trim().toLowerCase(); }
function normPhone(v){ return String(v||"").replace(/\s+/g,"").trim(); }

function setTab(name){
  hideMsg();
  tabs.forEach(t => t.classList.toggle("is-active", t.dataset.tab === name));
  panes.forEach(p => p.hidden = (p.dataset.pane !== name));
  localStorage.setItem("carall_forgot_tab", name);
}
tabs.forEach(t => t.addEventListener("click", () => setTab(t.dataset.tab)));
setTab(localStorage.getItem("carall_forgot_tab") || "personal");

function saveReset(payload){
  localStorage.setItem(RESET_KEY, JSON.stringify(payload));
}
function getReset(){
  try { return JSON.parse(localStorage.getItem(RESET_KEY) || "null"); }
  catch { return null; }
}
function clearReset(){
  localStorage.removeItem(RESET_KEY);
}

function makeCode(){
  return String(Math.floor(100000 + Math.random() * 900000));
}

function goStep2(){
  step1.hidden = true;
  step2.hidden = false;
}
function goStep1(){
  step2.hidden = true;
  step1.hidden = false;
}

// STEP 1 submit (send code)
$$(".forgot-form").forEach(form => {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    hideMsg();

    const type = form.dataset.type; // personal|business
    const targetRaw = form.querySelector('[name="target"]').value;
    const target = type === "business" ? normPhone(targetRaw) : normEmail(targetRaw);

    const users = loadUsers();
    const user = (type === "business")
      ? users.find(u => u.type === "business" && normPhone(u.phone) === target)
      : users.find(u => u.type === "personal" && normEmail(u.email) === target);

    if(!user) return showMsg("İstifadəçi tapılmadı.");

    const code = makeCode();
    saveReset({ type, target, code, createdAt: Date.now() });

    // Demo: kodu ekranda göstəririk (backend olanda SMS/email gedəcək)
    showMsg(`Kod göndərildi ✅ (Demo kod: ${code})`, "ok");
    goStep2();
  });
});

// STEP 2 submit (verify + change password)
resetForm.addEventListener("submit", (e) => {
  e.preventDefault();
  hideMsg();

  const r = getReset();
  if(!r) return showMsg("Reset sorğusu yoxdur. Əvvəl kod göndər.");

  const code = resetForm.code.value.trim();
  const pw = resetForm.password.value;
  const pw2 = resetForm.password2.value;

  if(code !== r.code) return showMsg("Kod yanlışdır.");
  if(pw !== pw2) return showMsg("Parollar uyğun deyil.");
  if(pw.length < 6) return showMsg("Parol minimum 6 simvol olmalıdır.");

  // 15 dəq limit (opsional)
  if(Date.now() - r.createdAt > 15 * 60 * 1000){
    clearReset();
    return showMsg("Kod vaxtı bitib. Yenidən kod göndər.");
  }

  const users = loadUsers();
  const idx = users.findIndex(u => {
    if(r.type === "business") return u.type === "business" && normPhone(u.phone) === r.target;
    return u.type === "personal" && normEmail(u.email) === r.target;
  });

  if(idx < 0) return showMsg("İstifadəçi tapılmadı.");

  users[idx].password = pw;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  clearReset();

  showMsg("Parol yeniləndi ✅ İndi login ola bilərsən.", "ok");
  setTimeout(() => location.href = "login.html", 600);
});

backToStep1.addEventListener("click", () => {
  hideMsg();
  goStep1();
});
