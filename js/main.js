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
  setTheme(getTheme());
}

toggle.addEventListener("click", () => {
  const current = root.getAttribute("data-theme") || "dark";
  setTheme(current === "dark" ? "light" : "dark");
});

initTheme();

async function loadProfile() {
  const resp = await fetch("data/profile.json");
  return resp.json();
}

function resolvePath(obj, path) {
  return path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);
}

function applyBindings(data) {
  document.querySelectorAll("[data-bind]").forEach((el) => {
    const path = el.getAttribute("data-bind");
    const value = resolvePath(data, path);
    if (value !== undefined && value !== null) {
      if (typeof value === "string") {
        el.textContent = value;
      }
    }
  });

  document.querySelectorAll("[data-bind-template]").forEach((el) => {
    const key = el.getAttribute("data-bind-template");
    switch (key) {
      case "terminalTitle":
        el.textContent = `${data.personal.firstName.toLowerCase()}@infra ~`;
        break;
      case "terminalBody":
        renderTerminalBody(el, data.hero.terminalCommands);
        initTerminal(el);
        break;
      case "aboutBio":
        renderAboutBio(el, data.about.bio);
        break;
      case "aboutStats":
        renderAboutStats(el, data.about.stats);
        break;
      case "techStack":
        renderTechStack(el, data.techStack);
        break;
      case "education":
        renderEducation(el, data.education);
        break;
      case "experience":
        renderExperience(el, data.experience);
        break;
      case "certifications":
        renderCertifications(el, data.certifications);
        break;
      case "interests":
        renderInterests(el, data.interests);
        break;
      case "contactLinks":
        renderContactLinks(el, data.contact.links);
        break;
    }
  });
}

function renderTerminalBody(container, commands) {
  container.innerHTML = commands
    .map(
      (cmd) =>
        `<p><span class="prompt">❯</span> ${cmd.command}</p>
         <p class="terminal-output">${cmd.output}</p>`
    )
    .join("");
}

let terminalInput = null;
let snakeGame = null;

function initTerminal(container) {
  const inputLine = document.createElement("p");
  inputLine.innerHTML = '<span class="prompt">❯</span> <span class="terminal-input" contenteditable="true"></span>';
  container.appendChild(inputLine);

  const inputEl = inputLine.querySelector(".terminal-input");

  function handleCommand(cmd) {
    const clean = cmd.trim().toLowerCase();
    const cmdEl = document.createElement("p");
    cmdEl.innerHTML = `<span class="prompt">❯</span> ${cmd}`;
    container.insertBefore(cmdEl, inputLine);

    const outEl = document.createElement("p");
    outEl.className = "terminal-output";

    if (clean === "snake" || clean === "play") {
      outEl.textContent = "Launching snake... use arrow keys or WASD";
      container.insertBefore(outEl, inputLine);
      launchSnake();
    } else if (clean === "help") {
      outEl.innerHTML = "snake — play snake<br>whoami — about me<br>clear — clear terminal<br>help — this message";
      container.insertBefore(outEl, inputLine);
    } else if (clean === "whoami") {
      outEl.textContent = "devops engineer";
      container.insertBefore(outEl, inputLine);
    } else if (clean === "clear") {
      container.innerHTML = "";
      container.appendChild(inputLine);
    } else if (clean) {
      outEl.innerHTML = `command not found: ${cmd}<br>type <span style="color:var(--accent)">help</span> for available commands`;
      container.insertBefore(outEl, inputLine);
    }

    inputEl.textContent = "";
    inputEl.focus();
    container.scrollTop = container.scrollHeight;
  }

  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCommand(inputEl.textContent);
    }
  });

  container.addEventListener("click", () => {
    inputEl.focus();
  });
}

function launchSnake() {
  if (snakeGame) return;
  const overlay = document.createElement("div");
  overlay.id = "snake-overlay";
  overlay.className = "snake-overlay";
  overlay.innerHTML = '<button class="snake-close" title="Close (Esc)">✕</button>';
  document.body.appendChild(overlay);

  snakeGame = new SnakeGame(overlay);

  function close() {
    if (snakeGame) {
      snakeGame.destroy();
      snakeGame = null;
    }
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    document.removeEventListener("keydown", escHandler);
  }

  function escHandler(e) {
    if (e.key === "Escape" && !snakeGame.paused && snakeGame.running) return;
    if (e.key === "Escape") close();
  }

  setTimeout(() => {
    document.addEventListener("keydown", escHandler);
  }, 200);

  overlay.querySelector(".snake-close").addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay && snakeGame && !snakeGame.running) close();
  });
}

function renderAboutBio(container, bio) {
  container.innerHTML = bio.map((p) => `<p>${p}</p>`).join("");
}

function renderAboutStats(container, stats) {
  container.innerHTML = stats
    .map(
      (s) =>
        `<div class="stat">
           <span class="stat-number">${s.number}</span>
           <span class="stat-label">${s.label}</span>
         </div>`
    )
    .join("");
}

function renderTechStack(container, items) {
  container.innerHTML = items
    .map((t) => `<div class="tech-item">${t}</div>`)
    .join("");
}

function renderEducation(container, education) {
  container.innerHTML = education
    .map(
      (e) =>
        `<div class="edu-line">
           <span class="edu-institution">${e.institution}</span><br />
           ${e.location}
         </div>`
    )
    .join("");
}

function renderExperience(container, experience) {
  container.innerHTML = experience
    .map(
      (exp) =>
        `<div class="exp-card">
           <div class="exp-card-header">
             <div>
               <div class="exp-card-role">${exp.role}</div>
               <div class="exp-card-company">${exp.company}</div>
             </div>
             <div class="exp-card-period">${exp.period}</div>
           </div>
           <div class="exp-card-location">📍 ${exp.location}</div>
           <ul class="exp-card-highlights">
             ${exp.highlights.map((h) => `<li>${h}</li>`).join("")}
           </ul>
         </div>`
    )
    .join("");
}

function renderCertifications(container, certs) {
  container.innerHTML = certs
    .map(
      (c) =>
        `<div class="cert-card">
           <span class="cert-icon">📜</span>
           <div>
             <div class="cert-name">${c.name}</div>
             <div class="cert-issuer">${c.issuer}</div>
           </div>
         </div>`
    )
    .join("");
}

function renderInterests(container, interests) {
  container.innerHTML = interests
    .map(
      (i) =>
        `<div class="interest-card">
           <div class="interest-icon">${i.icon}</div>
           <h3>${i.title}</h3>
           <p>${i.description}</p>
         </div>`
    )
    .join("");
}

function renderContactLinks(container, links) {
  container.innerHTML = links
    .map(
      (l) =>
        `<a href="${l.url}" ${l.url.startsWith("http") ? 'target="_blank" rel="noopener"' : ""} class="contact-link">
           <span class="contact-link-icon">${l.icon}</span>
           ${l.label}
         </a>`
    )
    .join("");
}

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

loadProfile().then((data) => {
  applyBindings(data);
  document.title = `${data.personal.firstName} ${data.personal.lastName}`;

  document.querySelectorAll(
    ".section-title, .interest-card, .exp-card, .cert-card, .about-text p, .about-stats, .tech-stack, .contact-content"
  ).forEach((el) => {
    el.classList.add("reveal");
    observer.observe(el);
  });
});
