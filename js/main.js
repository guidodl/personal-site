const themeKey = "theme";
const toggle = document.getElementById("themeToggle");
const root = document.documentElement;

function setTheme(theme) {
  root.setAttribute("data-theme", theme);
  localStorage.setItem(themeKey, theme);
}

if (toggle) {
  toggle.addEventListener("click", () => {
    const current = root.getAttribute("data-theme") || "dark";
    setTheme(current === "dark" ? "light" : "dark");
  });
}

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
    if (value !== undefined && value !== null && typeof value === "string") {
      el.textContent = value;
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
      case "footerText":
        el.textContent = `${data.footer.text} © ${data.footer.year}`;
        break;
    }
  });
}

function renderTerminalBody(container, commands) {
  container.innerHTML = commands
    .map(
      (cmd) =>
        `<p><span class="prompt">❯</span> ${escapeHtml(cmd.command)}</p>
         <p class="terminal-output">${escapeHtml(cmd.output)}</p>`
    )
    .join("");
}

let snakeGame = null;
let snakeModuleLoading = null;

function ensureSnakeLoaded() {
  if (window.SnakeGame) return Promise.resolve();
  if (snakeModuleLoading) return snakeModuleLoading;
  snakeModuleLoading = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "js/snake.js";
    s.onload = resolve;
    s.onerror = reject;
    document.body.appendChild(s);
  });
  return snakeModuleLoading;
}

let terminalInput = null;
let commandHistory = [];
let historyIndex = -1;

function initTerminal(container) {
  const inputLine = document.createElement("p");
  inputLine.innerHTML =
    '<span class="prompt">❯</span> <span class="terminal-input" contenteditable="true" role="textbox" aria-label="Terminal input — type a command and press Enter" tabindex="0"></span>';
  container.appendChild(inputLine);

  const inputEl = inputLine.querySelector(".terminal-input");

  function handleCommand(cmd) {
    const clean = cmd.trim().toLowerCase();
    const cmdEl = document.createElement("p");
    cmdEl.innerHTML = `<span class="prompt">❯</span> ${escapeHtml(cmd)}`;
    container.insertBefore(cmdEl, inputLine);

    const outEl = document.createElement("p");
    outEl.className = "terminal-output";

    if (clean === "snake" || clean === "play") {
      outEl.textContent = "Launching snake... use arrow keys or WASD, Esc to pause, q to quit";
      container.insertBefore(outEl, inputLine);
      launchSnake();
    } else if (clean === "help") {
      outEl.innerHTML =
        "snake — play snake<br>whoami — about me<br>clear — clear terminal<br>help — this message";
      container.insertBefore(outEl, inputLine);
    } else if (clean === "whoami") {
      outEl.textContent = "devops engineer";
      container.insertBefore(outEl, inputLine);
    } else if (clean === "clear") {
      container.innerHTML = "";
      container.appendChild(inputLine);
    } else if (clean) {
      outEl.innerHTML = `command not found: ${escapeHtml(cmd)}<br>type <span style="color:var(--accent)">help</span> for available commands`;
      container.insertBefore(outEl, inputLine);
    }

    if (clean) {
      commandHistory.push(clean);
      historyIndex = commandHistory.length;
    }
    inputEl.textContent = "";
    inputEl.focus();
    container.scrollTop = container.scrollHeight;
  }

  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCommand(inputEl.textContent);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length && historyIndex > 0) {
        historyIndex--;
        inputEl.textContent = commandHistory[historyIndex];
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        inputEl.textContent = commandHistory[historyIndex];
      } else {
        historyIndex = commandHistory.length;
        inputEl.textContent = "";
      }
    }
  });

  container.addEventListener("click", () => inputEl.focus());
}

function launchSnake() {
  if (snakeGame) return;
  ensureSnakeLoaded().then(() => {
    const overlay = document.createElement("div");
    overlay.id = "snake-overlay";
    overlay.className = "snake-overlay";
    overlay.innerHTML = '<button class="snake-close" title="Close (Esc)" aria-label="Close snake game">✕</button>';
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
      if (e.key !== "Escape") return;
      if (snakeGame && snakeGame.running && !snakeGame.paused) {
        snakeGame.paused = true;
        return;
      }
      close();
    }

    document.addEventListener("keydown", escHandler);
    overlay.querySelector(".snake-close").addEventListener("click", close);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay && snakeGame && !snakeGame.running) close();
    });
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderAboutBio(container, bio) {
  // bio entries are intentionally authored as HTML (bold, highlight spans)
  container.innerHTML = bio.map((p) => `<p>${p}</p>`).join("");
}

function renderAboutStats(container, stats) {
  container.innerHTML = stats
    .map(
      (s) =>
        `<div class="stat">
           <span class="stat-number">${escapeHtml(s.number)}</span>
           <span class="stat-label">${escapeHtml(s.label)}</span>
         </div>`
    )
    .join("");
}

function renderTechStack(container, items) {
  container.innerHTML = items
    .map((t) => `<div class="tech-item">${escapeHtml(t)}</div>`)
    .join("");
}

function renderEducation(container, education) {
  container.innerHTML = education
    .map(
      (e) =>
        `<div class="edu-line">
           <span class="edu-institution">${escapeHtml(e.institution)}</span><br />
           ${escapeHtml(e.location)}
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
               <div class="exp-card-role">${escapeHtml(exp.role)}</div>
               <div class="exp-card-company">${escapeHtml(exp.company)}</div>
             </div>
             <div class="exp-card-period">${escapeHtml(exp.period)}</div>
           </div>
           <div class="exp-card-location">📍 ${escapeHtml(exp.location)}</div>
           <ul class="exp-card-highlights">
             ${exp.highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join("")}
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
           <span class="cert-icon" aria-hidden="true">📜</span>
           <div>
             <div class="cert-name">${escapeHtml(c.name)}</div>
             <div class="cert-issuer">${escapeHtml(c.issuer)}</div>
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
           <div class="interest-icon" aria-hidden="true">${escapeHtml(i.icon)}</div>
           <h3>${escapeHtml(i.title)}</h3>
           <p>${escapeHtml(i.description)}</p>
         </div>`
    )
    .join("");
}

function renderContactLinks(container, links) {
  container.innerHTML = links
    .map(
      (l) =>
        `<a href="${escapeHtml(l.url)}" ${l.url.startsWith("http") ? 'target="_blank" rel="noopener noreferrer"' : ""} class="contact-link">
           <span class="contact-link-icon" aria-hidden="true">${escapeHtml(l.icon)}</span>
           ${escapeHtml(l.label)}
         </a>`
    )
    .join("");
}

const nav = document.querySelector(".nav");

window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 50);
}, { passive: true });

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
