const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbwKZ-7Fl5QKK89m4SrvBwcnS2szP505gEe9O3F4f03mhrS4qP4DgRJ7aj2_XNKOSFPG/exec";

document.addEventListener("DOMContentLoaded", () => {
const form = document.getElementById("lead-form");
const submitButton = document.getElementById("submitButton");
const successMessage = document.getElementById("successMessage");
const year = document.getElementById("year");
const iframe = document.getElementById("lead-hidden-frame");

if (year) {
year.textContent = new Date().getFullYear();
}

if (!form) {
console.error("Form not found: تأكد أن id='lead-form' موجود في index.html");
return;
}

form.method = "POST";
form.action = WEBHOOK_URL;
form.target = "lead-hidden-frame";
form.acceptCharset = "UTF-8";

function setError(fieldName, message) {
const field = document.querySelector(`[name="${fieldName}"]`);
const error = document.querySelector(`[data-error-for="${fieldName}"]`);

```
if (!field || !error) return;

field.classList.toggle("input-error", Boolean(message));
error.textContent = message || "";
```

}

function clearErrors() {
["fullName", "phone", "email", "currentPlatform", "weeklyOrders"].forEach((field) => {
setError(field, "");
});
}

function normalizePhone(value) {
return String(value || "").replace(/[\s-()]/g, "").trim();
}

function getFormData() {
const formData = new FormData(form);

```
return {
  fullName: String(formData.get("fullName") || "").trim(),
  phone: normalizePhone(formData.get("phone")),
  email: String(formData.get("email") || "").trim(),
  currentPlatform: String(formData.get("currentPlatform") || ""),
  weeklyOrders: String(formData.get("weeklyOrders") || ""),
  registeredAt: new Date().toISOString(),
  website: String(formData.get("website") || "")
};
```

}

function validateForm(data) {
clearErrors();

```
let isValid = true;

if (data.website) {
  return false;
}

if (!data.fullName || data.fullName.length < 3) {
  setError("fullName", "اكتب الاسم بالكامل.");
  isValid = false;
}

const egyptPhonePattern = /^(?:\+?20|0)?1[0125][0-9]{8}$/;

if (data.phone && !egyptPhonePattern.test(data.phone)) {
  setError("phone", "اكتب رقم موبايل مصري صحيح أو اتركه فارغاً.");
  isValid = false;
}

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
```

}

function setHiddenValue(id, value) {
const element = document.getElementById(id);

```
if (element) {
  element.value = value || "";
}
```

}

function trackLeadSubmit(payload) {
if (typeof gtag === "function") {
gtag("event", "lead_submit", {
send_to: "G-67Q5HKNXBM",
event_category: "lead_generation",
event_label: payload.currentPlatform,
weekly_orders: payload.weeklyOrders
});
}
}

function showSuccess(payload) {
trackLeadSubmit(payload);

```
form.reset();
form.hidden = true;

if (successMessage) {
  successMessage.hidden = false;
}

if (submitButton) {
  submitButton.disabled = false;
  submitButton.textContent = "سجل الآن";
}
```

}

form.addEventListener("submit", (event) => {
event.preventDefault();
event.stopPropagation();

```
const payload = getFormData();

if (!validateForm(payload)) {
  return;
}

setHiddenValue("source", "SaaS Landing Page");
setHiddenValue("userAgent", navigator.userAgent);
setHiddenValue("submittedAt", payload.registeredAt);

submitButton.disabled = true;
submitButton.textContent = "جاري التسجيل...";

let completed = false;

const finish = () => {
  if (completed) return;
  completed = true;
  showSuccess(payload);
};

if (iframe) {
  iframe.onload = finish;
}

HTMLFormElement.prototype.submit.call(form);

setTimeout(finish, 2000);
```

});
});
