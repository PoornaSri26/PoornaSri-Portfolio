/* =========================================================
   Poorna Sri Nandyala — portfolio terminal
   Vanilla JS. No dependencies, no build step.
   ========================================================= */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var app = document.getElementById("term-app");
  var out = document.getElementById("term-out");
  var form = document.getElementById("term-form");
  var input = document.getElementById("term-input");
  if (!app || !out || !form || !input) return;

  var history = [];
  var hIdx = -1;
  var saved = "";
  var booted = false;

  var THEMES = ["purple", "amber", "glass", "paper", "matrix"];

  var PROJECTS = [
    "ChilliViT — on-device plant disease detection (ViT, 86% compressed)",
    "CogniFusion — EEG + eye-tracking cognitive load monitoring",
    "GeoShape — real-time multiplayer geography game",
    "Positional IR System — indoor positioning",
    "Sortoscope — sorting visualizer",
    "Telugu Spell Index — spell index for Telugu",
    "Solo Quest — gamified productivity app",
    "NFA → DFA Simulator — automata playground",
  ];

  var WHOAMI = [
    "a CS student who reads chewing-gum wrappers for fun.",
    'someone who would probably say "who am I?" back.',
    "the person who built this terminal. you are welcome.",
    "a reflection in the kaleidoscope of existence. hi.",
  ];

  var QUOTES = [
    "Simplicity is the ultimate sophistication. — da Vinci",
    "First, solve the problem. Then, write the code. — John Johnson",
    "Talk is cheap. Show me the code. — Linus",
    "The best way to predict the future is to invent it. — Alan Kay",
    "Done is better than perfect. — Sheryl Sandberg",
    "Stay hungry, stay foolish. — Steve Jobs",
  ];

  /* ---------- helpers ---------- */

  function scrollDown() {
    out.scrollTop = out.scrollHeight;
  }

  function add(cls, text) {
    var d = document.createElement("div");
    d.className = "term-line" + (cls ? " " + cls : "");
    d.textContent = text;
    out.appendChild(d);
    scrollDown();
    return d;
  }

  function addHTML(cls, htmlStr) {
    var d = document.createElement("div");
    d.className = "term-line" + (cls ? " " + cls : "");
    d.innerHTML = htmlStr;
    out.appendChild(d);
    scrollDown();
    return d;
  }

  function lines(arr, cls) {
    for (var i = 0; i < arr.length; i++) add(cls || "t-out", arr[i]);
  }

  function echo(cmd) {
    var d = document.createElement("div");
    d.className = "term-line";
    var p = document.createElement("span");
    p.className = "term-prompt";
    p.textContent = "poorna@iiit:~$ ";
    d.appendChild(p);
    d.appendChild(document.createTextNode(cmd));
    out.appendChild(d);
    scrollDown();
  }

  /* ---------- themes ---------- */

  function storedTheme() {
    try {
      var t = localStorage.getItem("ps-term-theme");
      return THEMES.indexOf(t) !== -1 ? t : "purple";
    } catch (e) {
      return "purple";
    }
  }

  function applyTheme(name) {
    for (var i = 0; i < THEMES.length; i++) app.classList.remove("tt-" + THEMES[i]);
    if (name !== "purple") app.classList.add("tt-" + name);
    try {
      localStorage.setItem("ps-term-theme", name);
    } catch (e) {}
  }

  applyTheme(storedTheme());

  /* ---------- boot sequence ---------- */

  var BOOT = [
    ["t-acc", "PoornaOS v2.6.9 — portfolio kernel"],
    ["t-comment", "(c) 2024–2026 Poorna Sri Nandyala · IIIT Sri City"],
    ["t-comment", "640K RAM ought to be enough for anybody."],
    ["t-comment", "type 'help' to begin."],
  ];

  function boot() {
    if (booted) return;
    booted = true;
    if (reduced) {
      for (var i = 0; i < BOOT.length; i++) add(BOOT[i][0], BOOT[i][1]);
      input.focus({ preventScroll: true });
      return;
    }
    var i = 0;
    (function next() {
      if (i >= BOOT.length) {
        input.focus({ preventScroll: true });
        return;
      }
      add(BOOT[i][0], BOOT[i][1]);
      i++;
      setTimeout(next, i === BOOT.length ? 200 : 280);
    })();
  }

  /* ---------- commands ---------- */

  function run(raw) {
    var cmd = raw.trim();
    if (!cmd) return;
    echo(cmd);
    var parts = cmd.split(/\s+/);
    var c = parts[0].toLowerCase();
    var arg = parts.slice(1).join(" ").toLowerCase();

    switch (c) {
      case "help":
        lines([
          "available commands:",
          "  help          show this list",
          "  about         who is Poorna?",
          "  projects      things I have built",
          "  skills        my toolkit",
          "  experience    journey so far",
          "  now           what I'm working on",
          "  fetch         system info card",
          "  contact       how to reach me",
          "  whoami        a question",
          "  quote         wisdom, probably",
          "  coffee        brew status",
          "  playlist      study mode",
          "  why-hire-me   the pitch",
          "  theme [name]  switch theme — " + THEMES.join(", "),
          "  ls            site sections",
          "  github        open GitHub",
          "  linkedin      open LinkedIn",
          "  email         send an email",
          "  vscode        open VS Code workspace",
          "  clear         clear the terminal",
          "  date          current date & time",
          "  hack          please don't",
        ]);
        break;

      case "about":
        lines(
          [
            "Poorna Sri Nandyala — B.Tech CSE @ IIIT Sri City.",
            "AI researcher · EEG/BCI · networks · web3.",
            "Building ChilliViT, CogniFusion and more.",
            "type 'projects' to see the work.",
          ],
          "t-out"
        );
        break;

      case "projects":
        lines(
          ["featured work (23 repos on GitHub):", ""].concat(
            PROJECTS.map(function (p) {
              return "  • " + p;
            })
          ),
          "t-out"
        );
        break;

      case "skills":
        lines(
          [
            "Python · PyTorch · JavaScript/TypeScript · React",
            "EEG signal processing · information retrieval",
            "computer networks · operating systems · web3",
          ],
          "t-teal"
        );
        break;

      case "experience":
      case "journey":
        lines(
          [
            "IIIT Sri City — B.Tech CSE (2024 – present)",
            "EEG research — emotion analysis, BCI & ML pipeline",
            "23 GitHub repos shipped",
            "Abhisarga fest — led cultural coordination",
          ],
          "t-out"
        );
        break;

      case "now":
        lines(
          [
            "currently: compressing ViTs for edge devices (ChilliViT),",
            "fusing EEG + eye-tracking for cognitive load (CogniFusion),",
            "and keeping 23 repos warm on GitHub.",
            "open to Summer 2028 internships & collaborations.",
          ],
          "t-out"
        );
        break;

      case "fetch":
      case "neofetch":
        lines(
          [
            "   ▄▄▄▄· ▄▄▄ .▄▄▄  ",
            "   █▄█·▪▐█ ▀.▪▀▄.▀· ",
            "   ▐▀▀▪▄▐█ ▄.█▐▀▀▪▄ ",
            "   ▄█▀▀▀▄██▀▀▀▐█▄▄▌ ",
            "   ▀▀▀▀▀·▀▀   ▀▀▀  ",
            "",
            "  user@host      poorna@iiit",
            "  OS             PoornaOS 2.6.9 (purple kernel)",
            "  shell          portfolio-sh 1.0",
            "  uptime         since 2024",
            "  packages       23 repos, 0 regrets",
            "  theme          " + storedTheme(),
            "",
            "  AI · EEG/BCI · networks · web3",
          ],
          "t-acc"
        );
        break;

      case "contact":
        addHTML(
          "t-out",
          'email: <a href="mailto:poornasri.n24@gmail.com">poornasri.n24@gmail.com</a><br>' +
            'github: <a href="https://github.com/PoornaSri26" target="_blank" rel="noopener noreferrer">github.com/PoornaSri26</a><br>' +
            'linkedin: <a href="https://www.linkedin.com/in/poorna-sri-nandyala-06754b316" target="_blank" rel="noopener noreferrer">linkedin.com/in/poorna-sri-nandyala</a>'
        );
        break;

      case "whoami":
        add("t-amber", WHOAMI[Math.floor(Math.random() * WHOAMI.length)]);
        break;

      case "quote":
        add("t-amber", QUOTES[Math.floor(Math.random() * QUOTES.length)]);
        break;

      case "coffee":
        lines(
          [
            "brewing ████████░░ 80% — black, no sugar.",
            "eta: whenever the compile finishes.",
          ],
          "t-amber"
        );
        break;

      case "playlist":
        lines(
          [
            "study mode engaged:",
            "  · lofi hip hop radio — beats to debug to",
            "  · classical for deep focus sprints",
            "  · absolute silence (yes, really)",
          ],
          "t-teal"
        );
        break;

      case "why-hire-me":
        lines(
          [
            "1. I ship — 23 repos, several production-grade.",
            "2. I learn fast — ViT compression, BCI pipelines, IR systems.",
            "3. I show receipts — every claim links to code.",
            "4. I'm easy to work with — this terminal is Exhibit A.",
          ],
          "t-out"
        );
        break;

      case "theme":
        if (!arg) {
          lines(
            ["current theme: " + storedTheme(), "available: " + THEMES.join(", "), "usage: theme <name>"],
            "t-acc"
          );
        } else if (THEMES.indexOf(arg) !== -1) {
          applyTheme(arg);
          add("t-acc", "theme set to '" + arg + "'. much better. probably.");
        } else {
          add("err", "unknown theme '" + arg + "'. try: " + THEMES.join(", "));
        }
        break;

      case "banner":
        lines(
          [
            "┌──────────────────────────────────────────────┐",
            "│  Poorna Sri Nandyala                         │",
            "│  CS @ IIIT Sri City                          │",
            "│  AI · EEG/BCI · Networks · Web3              │",
            "└──────────────────────────────────────────────┘",
          ],
          "t-acc"
        );
        break;

      case "ls":
        add("t-out", "about  research  projects  skills  experience  terminal  contact  vscode/");
        break;

      case "github":
      case "git":
        window.open("https://github.com/PoornaSri26", "_blank", "noopener");
        add("t-comment", "opening github…");
        break;

      case "linkedin":
        window.open(
          "https://www.linkedin.com/in/poorna-sri-nandyala-06754b316",
          "_blank",
          "noopener"
        );
        add("t-comment", "opening linkedin…");
        break;

      case "email":
      case "mail":
        location.href = "mailto:poornasri.n24@gmail.com";
        add("t-comment", "opening mail client…");
        break;

      case "vscode":
      case "code":
        location.href = "vscode/";
        break;

      case "clear":
        out.innerHTML = "";
        break;

      case "date":
        add("t-out", new Date().toString());
        break;

      case "hack":
        lines(
          [
            "[*] initializing attack on… my own sleep schedule",
            "[██████████] 100% — okay that was fast",
            "access granted. please enjoy your portfolio responsibly.",
          ],
          "t-green"
        );
        break;

      case "sudo":
        add("err", "poorna is not in the sudoers file. this incident will be reported.");
        break;

      case "exit":
        add("t-amber", "there is no escape. only portfolio.");
        break;

      case "rm":
        if (arg.indexOf("-rf") !== -1 || arg.indexOf("/") !== -1) {
          add("err", "nice try. the portfolio survives.");
        } else {
          add("err", "rm: missing operand — and also, no.");
        }
        break;

      default:
        add("err", "command not found: " + c + " — try 'help'");
    }
    scrollDown();
  }

  function submit(v) {
    v = (v || "").trim();
    if (!v) return;
    history.push(v);
    hIdx = -1;
    saved = "";
    run(v);
  }

  /* ---------- wiring ---------- */

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = input.value;
    input.value = "";
    submit(v);
  });

  input.addEventListener("keydown", function (e) {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      if (hIdx === -1) {
        saved = input.value;
        hIdx = history.length - 1;
      } else if (hIdx > 0) hIdx--;
      input.value = history[hIdx];
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (hIdx === -1) return;
      if (hIdx < history.length - 1) {
        hIdx++;
        input.value = history[hIdx];
      } else {
        hIdx = -1;
        input.value = saved;
      }
    }
  });

  app.addEventListener("click", function () {
    input.focus();
  });

  var chips = app.querySelectorAll(".term-chip");
  for (var i = 0; i < chips.length; i++) {
    chips[i].addEventListener("click", function () {
      submit(this.getAttribute("data-cmd"));
    });
  }

  /* ---------- reveal → boot + focus ---------- */

  if ("IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            boot();
            io.disconnect();
          }
        });
      },
      { threshold: 0.35 }
    );
    io.observe(app);
  } else {
    boot();
  }
})();
