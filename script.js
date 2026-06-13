/*
  1) انشر Google Apps Script Web App.
  2) ضع رابط النشر هنا بدل WEBHOOK_URL.
  مثال: https://script.google.com/macros/s/AKfycb.../exec
*/
const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbxIOHibeMTJIPQVnguBLkapCi54qzDvHaE7wvZpVuCVudfExvJ2x0NYND7flQPc8UksuQ/exec";

const form = document.getElementById("lead-form");
const submitButton = document.getElementById("submitButton");
const successMessage = document.getElementById("successMessage");
const year = document.getElementById("year");

year.textContent = new Date().getFullYear();

function setError(fieldName, message) {
  const field = document.querySelector(`[name="${fieldName}"]`);
  const error = document.querySelector(`[data-error-for="${fieldName}"]`);
  if (!field || !error) return;

  field.classList.toggle("input-error", Boolean(message));
  error.textContent = message || "";
}

function clearErrors() {
  ["fullName", "phone", "email", "currentPlatform", "weeklyOrders"].forEach((field) => setError(field, ""));
}

function normalizePhone(value) {
  return value.replace(/[\s\-()]/g, "").trim();
}

function validateForm(data) {
  clearErrors();
  let isValid = true;

  if (data.website) {
    return false;
  }

  if (!data.fullName || data.fullName.trim().length < 3) {
    setError("fullName", "اكتب الاسم بالكامل.");
    isValid = false;
  }

  const phone = normalizePhone(data.phone || "");
  const egyptPhonePattern = /^(?:\+?20|0)?1[0125][0-9]{8}$/;
  if (!phone || !egyptPhonePattern.test(phone)) {
    setError("phone", "اكتب رقم موبايل مصري صحيح.");
    isValid = false;
  }

  if (data.email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(data.email.trim())) {
      setError("email", "اكتب بريد إلكتروني صحيح أو اتركه فارغاً.");
      isValid = false;
    }
  }

  if (!data.currentPlatform) {
    setError("currentPlatform", "اختر أين تبيع حالياً.");
    isValid = false;
  }

  if (!data.weeklyOrders) {
    setError("weeklyOrders", "اختر عدد الطلبات أسبوعياً.");
    isValid = false;
  }

  return isValid;
}

function getFormData() {
  const formData = new FormData(form);
  return {
    fullName: String(formData.get("fullName") || "").trim(),
    phone: normalizePhone(String(formData.get("phone") || "")),
    email: String(formData.get("email") || "").trim(),
    currentPlatform: String(formData.get("currentPlatform") || ""),
    weeklyOrders: String(formData.get("weeklyOrders") || ""),
    registeredAt: new Date().toISOString(),
    website: String(formData.get("website") || "")
  };
}

async function submitLead(payload) {
  if (!WEBHOOK_URL || WEBHOOK_URL.includes("Put")) {
    throw new Error("لم يتم ضبط رابط Google Apps Script Webhook داخل ملف script.js");
  }

  await fetch(WEBHOOK_URL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(payload)
  });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = getFormData();

  if (!validateForm(payload)) {
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "جاري التسجيل...";

  try {
    await submitLead(payload);
    if (typeof gtag === "function") {
gtag("event", "lead_submit", {
send_to: "G-67Q5HKNXBM",
event_category: "lead_generation",
event_label: payload.currentPlatform || "unknown",
weekly_orders: payload.weeklyOrders || "unknown"
});
}
    form.reset();
    form.hidden = true;
    successMessage.hidden = false;
  } catch (error) {
    alert(error.message || "حصل خطأ أثناء التسجيل. حاول مرة أخرى.");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "سجل الآن";
  }
});
