const themeKey = "theme";
const toggle = document.getElementById("themeToggle");
const root = document.documentElement;

function getTheme() {
  const stored = localStorage.getItem(themeKey);
  if (stored) return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function setTheme(theme) {
  root.setAttribute("data-theme", theme);
  localStorage.setItem(themeKey, theme);
}

function initTheme() {
  const theme = getTheme();
  setTheme(theme);
}

toggle.addEventListener("click", () => {
  const current = root.getAttribute("data-theme") || "dark";
  const next = current === "dark" ? "light" : "dark";
  setTheme(next);
});

initTheme();

const nav = document.querySelector(".nav");

window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 50);
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
);

document.querySelectorAll(
  ".section-title, .interest-card, .about-text p, .about-stats, .tech-stack, .contact-content"
).forEach((el) => {
  el.classList.add("reveal");
  observer.observe(el);
});
