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
  const savedEmail = sessionStorage.getItem("carall_pending_email") || email;
  const savedPassword = sessionStorage.getItem("carall_pending_password");

  if (savedEmail && savedPassword) {
    try {
      const loginRes = await fetch("https://carall.az/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: savedEmail,
          password: savedPassword
        })
      });

      const loginData = await readResponseSafe(loginRes);

      if (loginRes.ok) {
        localStorage.setItem("carall_token", loginData.token || loginData.accessToken || "");
        localStorage.setItem("carall_user", JSON.stringify(loginData.user || loginData));

        sessionStorage.removeItem("carall_pending_email");
        sessionStorage.removeItem("carall_pending_password");

        openVerifyModal({
          title: "Uğurlu ✅",
          text: "Hesab təsdiqləndi və giriş edildi.",
          buttonText: "Davam et",
          onClose: () => {
            window.location.href = "index.html";
          }
        });

        return;
      }
    } catch (err) {
      console.error("AUTO LOGIN ERROR:", err);
    }
  }

  openVerifyModal({
    title: "Uğurlu ✅",
    text: "Email təsdiqləndi. İndi hesabına daxil ola bilərsən.",
    buttonText: "Daxil ol",
    onClose: () => {
      window.location.href = "login.html?email=" + encodeURIComponent(email);
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