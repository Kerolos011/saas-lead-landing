const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbwKZ-7Fl5QKK89m4SrvBwcnS2szP505gEe9O3F4f03mhrS4qP4DgRJ7aj2_XNKOSFPG/exec";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("lead-form");
  const submitButton = document.getElementById("submitButton");
  const successMessage = document.getElementById("successMessage");
  const year = document.getElementById("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  if (!form) {
    console.error("Form not found: تأكد أن id='lead-form' موجود في index.html");
    return;
  }

  function setError(fieldName, message) {
    const field = document.querySelector(`[name="${fieldName}"]`);
    const error = document.querySelector(`[data-error-for="${fieldName}"]`);

    if (!field || !error) return;

    field.classList.toggle("input-error", Boolean(message));
    error.textContent = message || "";
  }

  function clearErrors() {
    ["fullName", "phone", "email", "currentPlatform", "weeklyOrders"].forEach((field) => {
      setError(field, "");
    });
  }

  function normalizePhone(value) {
    return String(value || "").replace(/[\s\-()]/g, "").trim();
  }

  function getFormData() {
    const formData = new FormData(form);

    return {
      fullName: String(formData.get("fullName") || "").trim(),
      phone: normalizePhone(formData.get("phone")),
      email: String(formData.get("email") || "").trim(),
      currentPlatform: String(formData.get("currentPlatform") || ""),
      weeklyOrders: String(formData.get("weeklyOrders") || ""),
      registeredAt: new Date().toISOString(),
      website: String(formData.get("website") || "")
    };
  }

  function validateForm(data) {
    clearErrors();

    let isValid = true;

    // Honeypot ضد البوتات
    if (data.website) {
      return false;
    }

    // الاسم فقط إلزامي
    if (!data.fullName || data.fullName.length < 3) {
      setError("fullName", "اكتب الاسم بالكامل.");
      isValid = false;
    }

    // رقم الموبايل اختياري، لكن لو اتكتب لازم يكون صحيح
    const egyptPhonePattern = /^(?:\+?20|0)?1[0125][0-9]{8}$/;

    if (data.phone && !egyptPhonePattern.test(data.phone)) {
      setError("phone", "اكتب رقم موبايل مصري صحيح أو اتركه فارغاً.");
      isValid = false;
    }

    // البريد الإلكتروني اختياري، لكن لو اتكتب لازم يكون صحيح
    if (data.email) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(data.email)) {
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

  async function submitLead(data) {
    if (
      !WEBHOOK_URL ||
      !WEBHOOK_URL.startsWith("https://script.google.com/macros/s/") ||
      !WEBHOOK_URL.endsWith("/exec")
    ) {
      throw new Error("رابط Google Apps Script Webhook غير مضبوط أو لا ينتهي بـ /exec");
    }

    const body = new URLSearchParams();

    body.append("name", data.fullName);
    body.append("phone", data.phone);
    body.append("email", data.email);
    body.append("sellingPlatform", data.currentPlatform);
    body.append("weeklyOrders", data.weeklyOrders);
    body.append("source", "SaaS Landing Page");
    body.append("userAgent", navigator.userAgent);
    body.append("submittedAt", data.registeredAt);

    await fetch(WEBHOOK_URL, {
      method: "POST",
      mode: "no-cors",
      body: body
    });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const payload = getFormData();

    if (!validateForm(payload)) {
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "جاري التسجيل...";

    try {
      await submitLead(payload);

      // Google Analytics Lead Event
      if (typeof gtag === "function") {
        gtag("event", "lead_submit", {
          send_to: "G-67Q5HKNXBM",
          event_category: "lead_generation",
          event_label: payload.currentPlatform,
          weekly_orders: payload.weeklyOrders
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
});
