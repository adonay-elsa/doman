// Theme toggle
const root = document.documentElement;
const savedTheme = localStorage.getItem("theme") || "dark";
root.setAttribute("data-theme", savedTheme);
document.querySelector(".theme-toggle")?.addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
});

// Mobile nav
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.getElementById("nav-links");
navToggle?.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(open));
});
navLinks?.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => navLinks.classList.remove("open"))
);

// Reveal on scroll
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// Animate progress bars when visible
const pio = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (e.isIntersecting) {
      const pct = e.target.dataset.pct;
      e.target.style.width = pct + "%";
      pio.unobserve(e.target);
    }
  }),
  { threshold: 0.4 }
);
document.querySelectorAll(".progress-fill").forEach((el) => pio.observe(el));

// Lightbox
const lightbox = document.getElementById("lightbox");
const lbMedia = document.getElementById("lightbox-media");
const lbCaption = document.getElementById("lightbox-caption");
let lbImages = [];
let lbIndex = 0;

function openLightbox(imgs, idx) {
  lbImages = imgs;
  lbIndex = idx;
  renderLightbox();
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
}
function renderLightbox() {
  const img = lbImages[lbIndex];
  lbMedia.innerHTML = `<img src="${img.src}" alt="${img.alt || ""}" />`;
  lbCaption.textContent = img.alt || "";
}
function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
}
function step(dir) {
  lbIndex = (lbIndex + dir + lbImages.length) % lbImages.length;
  renderLightbox();
}
document.querySelectorAll(".zoomable img, .gallery-grid img").forEach((img) => {
  img.addEventListener("click", () => {
    const imgs = [...document.querySelectorAll(".zoomable img, .gallery-grid img")].map((i) => ({
      src: i.src,
      alt: i.alt,
    }));
    openLightbox(imgs, imgs.findIndex((i) => i.src === img.src));
  });
});
lightbox?.querySelector(".lightbox-close")?.addEventListener("click", closeLightbox);
lightbox?.querySelector(".lightbox-prev")?.addEventListener("click", () => step(-1));
lightbox?.querySelector(".lightbox-next")?.addEventListener("click", () => step(1));
lightbox?.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener("keydown", (e) => {
  if (!lightbox.classList.contains("open")) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") step(-1);
  if (e.key === "ArrowRight") step(1);
});
