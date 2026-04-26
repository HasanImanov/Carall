console.log("VERIFYY JS NEW VERSION LOADED");

function v$(id) {
  return document.getElementById(id);
}

function openVerifyModal({ title, text, buttonText = "Bağla", onClose = null }) {
  const modal = v$("verifyModal");
  const modalTitle = v$("modalTitle");
  const modalText = v$("modalText");
  const modalBtn = v$("modalBtn");

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

async function readResponseSafe(res) {
  const text = await res.text().catch(() => "");

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function getToken(data) {
  return (
    data.accessToken ||
    data.access_token ||
    data.token ||
    data?.data?.accessToken ||
    data?.data?.access_token ||
    data?.data?.token ||
    ""
  );
}

function getRefreshToken(data) {
  return (
    data.refreshToken ||
    data.refresh_token ||
    data?.data?.refreshToken ||
    data?.data?.refresh_token ||
    ""
  );
}

function saveLoginSession(data, phone, type = "personal") {
  const accessToken = getToken(data);
  const refreshToken = getRefreshToken(data);

  if (accessToken) {
    localStorage.setItem("access_token", accessToken);
  }

  if (refreshToken) {
    localStorage.setItem("refresh_token", refreshToken);
  }

  const user =
    data.user ||
    data.data?.user ||
    data.data ||
    data;

  const name =
    user.name ||
    user.fullName ||
    user.firstName ||
    user.username ||
    user.displayName ||
    "";

  localStorage.setItem("carall_session_v1", JSON.stringify({
    phone,
    type,
    loggedIn: true,
    name
  }));
}

async function autoLoginAfterVerify(phone, password, type = "personal") {
  const loginRes = await fetch("https://carall.az/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      phone,
      password
    })
  });

  const loginData = await readResponseSafe(loginRes);

  console.log("AUTO LOGIN STATUS:", loginRes.status);
  console.log("AUTO LOGIN RESPONSE:", loginData);

  if (!loginRes.ok) return false;

  const token = getToken(loginData);

  if (!token) {
    console.error("AUTO LOGIN token gəlmədi:", loginData);
    return false;
  }

  saveLoginSession(loginData, phone, type);
  return true;
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
      body: JSON.stringify({
        email,
        otpCode
      })
    });

    const data = await readResponseSafe(res);

    console.log("VERIFY STATUS:", res.status);
    console.log("VERIFY RESPONSE:", data);

    if (res.ok) {
      const savedPhone =
        sessionStorage.getItem("carall_pending_phone") ||
        localStorage.getItem("pending_phone") ||
        "";

      const savedPassword =
        sessionStorage.getItem("carall_pending_password") ||
        localStorage.getItem("pending_password") ||
        "";

      const savedType =
        sessionStorage.getItem("carall_pending_type") ||
        localStorage.getItem("pending_type") ||
        "personal";

      if (savedPhone && savedPassword) {
        const ok = await autoLoginAfterVerify(savedPhone, savedPassword, savedType);

        if (ok) {
          sessionStorage.removeItem("carall_pending_email");
          sessionStorage.removeItem("carall_pending_phone");
          sessionStorage.removeItem("carall_pending_password");
          sessionStorage.removeItem("carall_pending_type");

          localStorage.removeItem("pending_phone");
          localStorage.removeItem("pending_password");
          localStorage.removeItem("pending_type");

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
      }

      openVerifyModal({
        title: "Uğurlu ✅",
        text: "Email təsdiqləndi. İndi hesabına daxil ola bilərsən.",
        buttonText: "Daxil ol",
        onClose: () => {
          window.location.href = "login.html";
        }
      });

      return;
    }

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

document.addEventListener("DOMContentLoaded", () => {
  const emailFromUrl = new URLSearchParams(location.search).get("email");
  const emailInput = v$("email");

  if (emailFromUrl && emailInput) {
    emailInput.value = emailFromUrl;
  }
});