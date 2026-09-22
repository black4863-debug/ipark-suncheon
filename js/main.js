// TODO: Google Apps Script 웹앱 배포 후 아래 URL을 교체하세요.
// 스크립트 원본: apps-script/Code.gs (설치 방법 주석 참고)
const GAS_ENDPOINT_URL = "https://script.google.com/macros/s/AKfycbwhyGfEIlFlrMMRXzAJslWaHzTjW4w0ivfomf8o9BP90aMINRsgyuVUwDeANL6N0tE40g/exec";

document.addEventListener("DOMContentLoaded", () => {
  const fixedTop = document.getElementById("fixedTop");
  const topBtn = document.getElementById("topBtn");

  // scroll effects
  const onScroll = () => {
    const y = window.scrollY;
    fixedTop.classList.toggle("scrolled", y > 60);
    topBtn.classList.toggle("show", y > 700);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  topBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // quick-nav scrollspy
  const qnItems = document.querySelectorAll(".qn-item[data-section]");
  const spySections = [...qnItems]
    .map(a => document.getElementById(a.dataset.section))
    .filter(Boolean);
  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const link = document.querySelector(`.qn-item[data-section="${entry.target.id}"]`);
      if (!link) return;
      if (entry.isIntersecting) {
        qnItems.forEach(a => a.classList.remove("active"));
        link.classList.add("active");
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
  spySections.forEach(section => spyObserver.observe(section));

  // lead popup
  const popup = document.getElementById("leadPopup");
  if (popup) {
    const today = new Date().toISOString().slice(0, 10);
    let hideUntil = null;
    try { hideUntil = localStorage.getItem("leadPopupHideDate"); } catch (e) {}

    if (hideUntil !== today) {
      setTimeout(() => popup.classList.add("show"), 700);
    }

    const closePopup = () => popup.classList.remove("show");
    document.getElementById("leadPopupBackdrop").addEventListener("click", closePopup);
    document.getElementById("leadPopupClose").addEventListener("click", closePopup);
    document.getElementById("leadPopupCloseText").addEventListener("click", closePopup);
    document.getElementById("leadPopupCta").addEventListener("click", closePopup);
    document.getElementById("leadPopupHideToday").addEventListener("click", () => {
      try { localStorage.setItem("leadPopupHideDate", today); } catch (e) {}
      closePopup();
    });
  }

  // reveal on scroll
  const revealEls = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));

  // phone auto-format
  const phoneInput = document.getElementById("fPhone");
  phoneInput.addEventListener("input", () => {
    let v = phoneInput.value.replace(/\D/g, "").slice(0, 11);
    if (v.length > 3 && v.length <= 7) v = v.replace(/(\d{3})(\d+)/, "$1-$2");
    else if (v.length > 7) v = v.replace(/(\d{3})(\d{4})(\d+)/, "$1-$2-$3");
    phoneInput.value = v;
  });

  // lead form submit
  const form = document.getElementById("leadForm");
  const status = document.getElementById("formStatus");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.className = "form-status";

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = {
      name: form.name.value.trim(),
      birth: form.birth.value,
      phone: form.phone.value.trim(),
      region: form.region.value.trim(),
      unitType: form.unitType.value,
      purpose: form.querySelector('input[name="purpose"]:checked')?.value || "",
      submittedAt: new Date().toISOString(),
      source: location.href
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "등록 중...";

    try {
      if (GAS_ENDPOINT_URL.includes("REPLACE_WITH_YOUR_DEPLOYMENT_ID")) {
        console.warn("GAS_ENDPOINT_URL이 설정되지 않았습니다. js/main.js 상단을 확인하세요.");
        await new Promise(r => setTimeout(r, 500));
      } else {
        await fetch(GAS_ENDPOINT_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
      }
      status.textContent = "등록이 완료되었습니다. 담당자가 순서대로 안내드리겠습니다.";
      status.classList.add("show", "ok");
      form.reset();
    } catch (err) {
      status.textContent = "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      status.classList.add("show", "err");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  });
});
