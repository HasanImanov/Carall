console.log("VERIFY JS NEW VERSION LOADED");

function v$(id) {
  return document.getElementById(id);
}

function openVerifyModal({ title, text, buttonText = "Bağla", onClose = null }) {
  const modal = v$("verifyModal");
  const modalTitle = v$("modalTitle");
  const modalText = v$("modalText");
  const modalBtn = v$("modalBtn");

  // fallback (modal yoxdursa)
  if (!modal || !modalTitle || !modalText || !modalBtn) {
    alert(text || title);
    if (typeof onClose === "function") onClose();
    return;
  }

  modalTitle.textContent = title;
  modalText.textContent = text;
  modalBtn.textContent = buttonText;
  modal.style.display = "flex";

  modalBtn.onclick = () => {
    modal.style.display = "none";
    if (typeof onClose === "function") onClose();
  };
}

// 🔥 JSON + TEXT safe parser
async function readResponseSafe(res) {
  const text = await res.text().catch(() => "");

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { message: text }; // "Account activated" kimi halları tutur
  }
}

async function verifyUser() {
  const emailInput = v$("email");
  const otpInput = v$("otp");
  const btn = document.querySelector(".verify-box button");

  const email = String(emailInput?.value || "").trim().toLowerCase();
  const otpCode = String(otpInput?.value || "").trim();

  if (!email || !otpCode) {
    openVerifyModal({
      title: "Diqqət ❗",
      text: "Email və kod xanalarını doldur."
    });
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.textContent = "Yoxlanılır...";
  }

  try {
    const res = await fetch("https://carall.az/api/auth/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, otpCode })
    });

    const data = await readResponseSafe(res);

    console.log("VERIFY STATUS:", res.status);
    console.log("VERIFY RESPONSE:", data);

    // ✅ SUCCESS (200)
    if (res.ok) {
      openVerifyModal({
        title: "Uğurlu ✅",
        text: data.message || "Email təsdiqləndi.",
        buttonText: "Daxil ol",
        onClose: () => {
          window.location.href = "login.html";
        }
      });
      return;
    }

    // ❌ ERROR (400, 401 və s.)
    openVerifyModal({
      title: "Xəta ❌",
      text: data.message || "Kod səhvdir və ya vaxtı bitib."
    });

  } catch (err) {
    console.error("VERIFY FETCH ERROR:", err);

    openVerifyModal({
      title: "Server xətası ❌",
      text: "Sorğunu göndərmək mümkün olmadı. Bir az sonra yenidən yoxla."
    });
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Təsdiqlə";
    }
  }
}

// 🔥 URL-dən email auto doldur
document.addEventListener("DOMContentLoaded", () => {
  const emailFromUrl = new URLSearchParams(location.search).get("email");
  const emailInput = v$("email");

  if (emailFromUrl && emailInput) {
    emailInput.value = emailFromUrl;
  }
});