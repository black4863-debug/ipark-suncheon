// TODO: Google Apps Script 웹앱 배포 후 아래 URL을 교체하세요.
// 배포 방법: Google Sheets > 확장 프로그램 > Apps Script > 웹 앱으로 배포 > 액세스 권한 "모든 사용자"
const GAS_ENDPOINT_URL = "https://script.google.com/macros/s/REPLACE_WITH_YOUR_DEPLOYMENT_ID/exec";

document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("siteHeader");
  const topBtn = document.getElementById("topBtn");
  const navToggle = document.getElementById("navToggle");
  const mobileNav = document.getElementById("mobileNav");

  // scroll effects
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 60);
    topBtn.classList.toggle("show", y > 700);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  topBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // mobile nav
  let navOpen = false;
  navToggle.addEventListener("click", () => {
    navOpen = !navOpen;
    mobileNav.style.display = navOpen ? "block" : "none";
    navToggle.classList.toggle("open", navOpen);
  });
  mobileNav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    navOpen = false;
    mobileNav.style.display = "none";
  }));

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
