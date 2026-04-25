function openVerifyModal({ title, text, buttonText = "Bağla", onClose = null }) {
  const modal = document.getElementById("verifyModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalText = document.getElementById("modalText");
  const modalBtn = document.getElementById("modalBtn");

  modalTitle.textContent = title;
  modalText.textContent = text;
  modalBtn.textContent = buttonText;
  modal.style.display = "flex";

  modalBtn.onclick = () => {
    modal.style.display = "none";
    if (typeof onClose === "function") onClose();
  };
}

async function readResponse(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { message: text };
  }
}

async function verifyUser() {
  const email = document.getElementById("email").value.trim();
  const otpCode = document.getElementById("otp").value.trim();
  const btn = document.querySelector(".verify-box button");

  if (!email || !otpCode) {
    openVerifyModal({
      title: "Diqqət ❗",
      text: "Email və kod xanalarını doldur."
    });
    return;
  }

  btn.disabled = true;
  btn.textContent = "Yoxlanılır...";

  try {
    const res = await fetch("https://carall.az/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otpCode })
    });

    const data = await readResponse(res);
    console.log("VERIFY RESPONSE:", data);

    if (!res.ok) {
      openVerifyModal({
        title: "Xəta ❌",
        text: data.message || "Kod səhvdir və ya vaxtı bitib."
      });
      return;
    }

    openVerifyModal({
      title: "Uğurlu ✅",
      text: "Email təsdiqləndi. İndi hesabına daxil ola bilərsən.",
      buttonText: "Daxil ol",
      onClose: () => {
        window.location.href = "login.html";
      }
    });

  } catch (err) {
    console.error(err);
    openVerifyModal({
      title: "Server xətası ❌",
      text: "Sorğunu göndərmək mümkün olmadı. Bir az sonra yenidən yoxla."
    });
  } finally {
    btn.disabled = false;
    btn.textContent = "Təsdiqlə";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const emailFromUrl = new URLSearchParams(location.search).get("email");
  if (emailFromUrl) {
    document.getElementById("email").value = emailFromUrl;
  }
});