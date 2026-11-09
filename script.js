// ===== Mobile Menu Toggle =====
const menuBtn = document.getElementById("menuBtn");
const nav = document.querySelector(".nav");

if (menuBtn && nav) {
  menuBtn.addEventListener("click", () => {
    nav.classList.toggle("open");
  });

  // Close menu when a link is clicked
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => nav.classList.remove("open"));
  });
}

// ===== Year in Footer =====
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// ===== Hero Buttons =====
const startBtn = document.getElementById("startBtn");
const infoBtn = document.getElementById("infoBtn");

if (startBtn) {
  startBtn.addEventListener("click", () => {
    // Scroll to contact section
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  });
}

if (infoBtn) {
  infoBtn.addEventListener("click", () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  });
}

// ===== Contact Form =====
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = contactForm.name.value.trim();
    const email = contactForm.email.value.trim();
    const message = contactForm.message.value.trim();

    if (!name || !email || !message) {
      formStatus.textContent = "⚠️ Please fill in all fields.";
      formStatus.style.color = "#f87171";
      return;
    }

    // Simple success message (no backend)
    formStatus.textContent = "✅ Thanks! We'll get back to you soon.";
    formStatus.style.color = "#4ade80";
    contactForm.reset();

    setTimeout(() => {
      formStatus.textContent = "";
    }, 4000);
  });
}
