// js/register.js — register personal/business (localStorage demo)

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
function saveUsers(users){
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
function saveSession(userId){
  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId }));
}

function uid(){
  return "u_" + Math.random().toString(16).slice(2) + Date.now().toString(16);
}
function normEmail(v){ return String(v||"").trim().toLowerCase(); }
function normPhone(v){ return String(v||"").replace(/\s+/g,"").trim(); }

// TAB SWITCH
function setTab(name){
  hideMsg();
  tabs.forEach(t => t.classList.toggle("is-active", t.dataset.tab === name));
  panes.forEach(p => p.hidden = (p.dataset.pane !== name));
  localStorage.setItem("carall_register_tab", name);
}
tabs.forEach(t => t.addEventListener("click", () => setTab(t.dataset.tab)));
setTab(localStorage.getItem("carall_register_tab") || "personal");


// EXTRA PHONES (+)
const addPhoneBtn = $("#addPhoneBtn");
const extraPhonesBox = $("#extraPhones");

function addPhoneRow(value=""){
  const row = document.createElement("div");
  row.className = "phone-row";
  row.innerHTML = `
    <input class="in" type="tel" placeholder="+994 xx xxx xx xx" value="${value}">
    <button class="del" type="button">Sil</button>
  `;
  row.querySelector(".del").addEventListener("click", () => row.remove());
  extraPhonesBox.appendChild(row);
}

if(addPhoneBtn){
  addPhoneBtn.addEventListener("click", () => addPhoneRow());
}


// IMAGE to DataURL
function fileToDataURL(file){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}


// SUBMIT handlers
$$(".reg-form").forEach(form => {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideMsg();

    const type = form.dataset.type;
    const users = loadUsers();

    // PERSONAL
    if(type === "personal"){
      const firstName = form.firstName.value.trim();
      const lastName = form.lastName.value.trim();
      const email = normEmail(form.email.value);
      const pw = form.password.value;
      const pw2 = form.password2.value;

      if(pw !== pw2) return showMsg("Parollar uyğun deyil.");
      if(pw.length < 6) return showMsg("Parol minimum 6 simvol olmalıdır.");
      if(users.some(u => u.type==="personal" && u.email === email)) return showMsg("Bu e-mail artıq qeydiyyatdadır.");

      const user = {
        id: uid(),
        type: "personal",
        email,
        password: pw,
        profile: { firstName, lastName }
      };

      users.push(user);
      saveUsers(users);
      saveSession(user.id);

      showMsg("Qeydiyyat uğurlu ✅", "ok");
      setTimeout(() => location.href = "profile.html", 250);
      return;
    }

    // BUSINESS
    if(type === "business"){
      const companyName = form.companyName.value.trim();
      const phone = normPhone(form.phone.value);
      const city = form.city.value.trim();
      const address = form.address.value.trim();
      const pw = form.password.value;
      const pw2 = form.password2.value;

      if(pw !== pw2) return showMsg("Parollar uyğun deyil.");
      if(pw.length < 6) return showMsg("Parol minimum 6 simvol olmalıdır.");
      if(users.some(u => u.type==="business" && u.phone === phone)) return showMsg("Bu nömrə artıq qeydiyyatdadır.");

      // extra phones
      const extraPhones = [...extraPhonesBox.querySelectorAll("input")]
        .map(i => normPhone(i.value))
        .filter(Boolean);

      // image
      let imageDataUrl = null;
      const file = form.photo?.files?.[0];
      if(file){
        if(file.size > 5 * 1024 * 1024) return showMsg("Şəkil 5MB-dan böyük ola bilməz.");
        imageDataUrl = await fileToDataURL(file);
      }

      const user = {
        id: uid(),
        type: "business",
        phone,
        password: pw,
        profile: { companyName, city, address, extraPhones, imageDataUrl }
      };

      users.push(user);
      saveUsers(users);
      saveSession(user.id);

      showMsg("Business qeydiyyatı uğurlu ✅", "ok");
      setTimeout(() => location.href = "profile.html", 250);
      return;
    }
  });
});
