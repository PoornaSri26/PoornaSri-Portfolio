/* =========================================================
   Poorna Sri Nandyala — VS Code themed portfolio
   Vanilla JS. No dependencies, no build step.
   ========================================================= */
(() => {
  "use strict";

  /* ---------------------------------------------------------
     Data
     --------------------------------------------------------- */
  const ME = {
    name: "Poorna Sri Nandyala",
    role: "CS @ IIIT Sri City",
    tagline: "AI · EEG/BCI · networks · web3",
    email: "poornasri.n24@gmail.com",
    phone: "+91 91827 28687",
    location: "IIIT Sri City, Andhra Pradesh, India",
    github: "https://github.com/PoornaSri26",
    repo: "https://github.com/PoornaSri26/PoornaSri-Portfolio",
    linkedin: "https://www.linkedin.com/in/poorna-sri-nandyala-06754b316",
    main: "../",
  };

  const THEMES = [
    { id: "dark-plus", label: "Dark+ (default dark)", swatches: ["#1e1e1e", "#007acc", "#569cd6"] },
    { id: "github-dark", label: "GitHub Dark", swatches: ["#0d1117", "#58a6ff", "#7ee787"] },
    { id: "dracula", label: "Dracula", swatches: ["#282a36", "#bd93f9", "#50fa7b"] },
    { id: "one-dark", label: "One Dark Pro", swatches: ["#282c34", "#61afef", "#c678dd"] },
    { id: "nord", label: "Nord", swatches: ["#2e3440", "#88c0d0", "#a3be8c"] },
    { id: "tokyo-night", label: "Tokyo Night", swatches: ["#1a1b26", "#7aa2f7", "#bb9af7"] },
  ];

  const PROJECTS = [
    {
      name: "Blockchain Voting System",
      desc: "On-chain voting with smart contracts and wallet authentication — tamper-proof ballots, one vote per wallet.",
      tags: ["Blockchain", "Web3", "Solidity"],
      lang: "JavaScript",
      color: "#f1e05a",
      meta: "★ 1",
      url: "https://github.com/PoornaSri26/blockchain-voting-system",
      featured: true,
    },
    {
      name: "Neural Turing Machine",
      desc: "Implementation of the Neural Turing Machine architecture — memory-augmented neural networks with differentiable attention.",
      tags: ["Deep Learning", "NTM", "Python"],
      lang: "Python",
      color: "#3572A5",
      meta: "2025",
      url: "https://github.com/PoornaSri26/neural-turing-machine",
    },
    {
      name: "DocuMind",
      desc: "AI document intelligence using LLMs and retrieval-augmented generation for querying long documents.",
      tags: ["LLM", "RAG", "Doc AI"],
      lang: "Jupyter / Python",
      color: "#DA5B0B",
      meta: "2025",
      url: "https://github.com/PoornaSri26/DocuMInd",
    },
    {
      name: "Web3 Project",
      desc: "Ethereum dApp with smart-contract integration and a wallet-connected front end.",
      tags: ["Web3", "Ethereum", "DApp"],
      lang: "JavaScript",
      color: "#f1e05a",
      meta: "2025",
      url: "https://github.com/PoornaSri26/web3_project",
    },
    {
      name: "GitHub Repo Explorer",
      desc: "Python tool that explores and analyses GitHub repositories through the GitHub REST API.",
      tags: ["Python", "GitHub API"],
      lang: "Python",
      color: "#3572A5",
      meta: "2025",
      url: "https://github.com/PoornaSri26/GitHub-Repo-Explorer",
    },
    {
      name: "AI Email Spam Detector",
      desc: "NLP classifier that flags spam email, from text cleaning and feature extraction to evaluation.",
      tags: ["Python", "NLP", "ML"],
      lang: "Python",
      color: "#3572A5",
      meta: "2025",
      url: "https://github.com/PoornaSri26",
    },
    {
      name: "AdaptiveNet-RouterLab",
      desc: "Networking lab exploring adaptive routing behaviour and congestion response in simulated topologies.",
      tags: ["Networking", "Routing", "Systems"],
      lang: "C / Python",
      color: "#555555",
      meta: "2025",
      url: "https://github.com/PoornaSri26",
    },
  ];

  const SKILLS = [
    {
      group: "languages",
      items: [
        ["Python", 92],
        ["JavaScript / TypeScript", 85],
        ["C", 78],
        ["SQL", 70],
      ],
    },
    {
      group: "ai / ml",
      items: [
        ["Machine Learning", 85],
        ["Deep Learning", 80],
        ["EEG / BCI", 82],
        ["NLP", 72],
      ],
    },
    {
      group: "web",
      items: [
        ["React", 82],
        ["Node.js", 76],
        ["HTML / CSS", 88],
        ["Web3 / Solidity", 68],
      ],
    },
    {
      group: "cs core & tools",
      items: [
        ["Data Structures & Algorithms", 85],
        ["Computer Networks", 80],
        ["Operating Systems", 76],
        ["Git / Linux", 84],
      ],
    },
  ];

  const TIMELINE = [
    {
      year: "2024 — present",
      title: "B.Tech CSE · IIIT Sri City",
      desc: "Building foundations in AI, systems and web engineering. Batch of 2028, currently open to internships.",
    },
    {
      year: "2025",
      title: "EEG Emotion Research",
      desc: "Emotion analysis from brain signals — signal preprocessing, feature extraction and ML classification in a BCI pipeline.",
    },
    {
      year: "2024 — 2025",
      title: "Projects shipped",
      desc: "Web3 voting, DocuMind, Neural Turing Machine, networking labs and developer tooling — 12 public repositories.",
    },
    {
      year: "2024",
      title: "Abhisarga · Events",
      desc: "Cultural fest coordination — cross-team logistics and on-ground operations at IIIT Sri City.",
    },
  ];

  /* ---------------------------------------------------------
     Syntax highlighting (small, dependency-free)
     --------------------------------------------------------- */
  const esc = (s) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const TS_TOKENS =
    /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|\b(true|false|null|undefined|number|string)\b|\b(const|let|var|function|return|export|import|from|default|interface|type|extends|class|new|async|await|if|else|for|of|in|as|public|readonly|keyof)\b|(\b\d+(?:\.\d+)?\b)/g;

  function highlight(code, lang) {
    if (lang === "md") {
      return esc(code)
        .split("\n")
        .map((line) =>
          /^\s*#{1,6}\s/.test(line)
            ? `<span class="tok-t">${line}</span>`
            : line
                .replace(/`([^`]+)`/g, '<span class="tok-s">`$1`</span>')
                .replace(/^(\s*[-*]\s)/, '<span class="tok-k">$1</span>')
        )
        .join("\n");
    }
    if (lang === "json") {
      return esc(code)
        .replace(/"([^"]*)"(\s*:)/g, '<span class="tok-a">"$1"</span><span class="tok-p">$2</span>')
        .replace(/:\s*"([^"]*)"/g, ': <span class="tok-s">"$1"</span>')
        .replace(/\b(true|false|null)\b/g, '<span class="tok-k">$1</span>')
        .replace(/(\b\d+(?:\.\d+)?\b)/g, '<span class="tok-n">$1</span>');
    }
    let out = "";
    let last = 0;
    let m;
    TS_TOKENS.lastIndex = 0;
    while ((m = TS_TOKENS.exec(code))) {
      out += esc(code.slice(last, m.index));
      const [full, comment, str, lit, kw, num] = m;
      const cls = comment ? "tok-c" : str ? "tok-s" : lit ? "tok-t" : kw ? "tok-k" : num ? "tok-n" : "";
      out += `<span class="${cls}">${esc(full)}</span>`;
      last = m.index + full.length;
    }
    out += esc(code.slice(last));
    return out;
  }

  /* ---------------------------------------------------------
     File system (the portfolio, as a repo)
     --------------------------------------------------------- */
  const FILES = {};

  const define = (file) => {
    FILES[file.id] = file;
  };

  const iconFor = (ext) => {
    const colors = { md: "#519aba", tsx: "#519aba", json: "#cbcb41", txt: "#cccccc" };
    const c = colors[ext] || "#cccccc";
    return `<svg viewBox="0 0 16 16" width="13" height="13" style="color:${c};flex:0 0 auto" aria-hidden="true"><path fill="currentColor" d="M10.5 1H3.5L2 2.5v11L3.5 15h9L14 13.5v-9L10.5 1zm0 1.6 1.9 1.9h-1.9V2.6zM3.6 13.4V2.6H9v3.5h3.4v7.3H3.6z"/></svg>`;
  };

  /* ---- Welcome ---- */
  define({
    id: "welcome",
    name: "Welcome.md",
    folder: "src",
    ext: "md",
    lang: "Markdown",
    keys: "home hero intro poorna nandyala iiit sri city ai eeg bci networks web3 intern",
    preview: () => `
      <div class="preview">
        <div class="hero-banner">
          <span class="tag">// welcome to my workspace</span>
          <h1>Poorna Sri <em>Nandyala</em></h1>
          <p>B.Tech CSE at IIIT Sri City. I build AI systems, BCI experiments and web apps — and occasionally take them on-chain.</p>
          <div class="chips">
            <span class="chip on">AI / ML</span><span class="chip on">EEG / BCI</span>
            <span class="chip">Networks</span><span class="chip">Web3</span><span class="chip">Full-stack</span>
          </div>
          <div class="btn-row">
            <button class="btn primary" data-open="about">Read about.tsx</button>
            <button class="btn" data-open="projects">Browse projects</button>
            <button class="btn" data-open="contact">Get in touch</button>
          </div>
        </div>
        <h2>quick_start</h2>
        <p>Everything here behaves like an editor: explore the tree on the left, open files as tabs, use the terminal below, or hit <code>Ctrl</code> + <code>Shift</code> + <code>P</code> for the command palette.</p>
        <div class="chips">
          <span class="chip">Ctrl P — quick open</span>
          <span class="chip">Ctrl \` — terminal</span>
          <span class="chip">Ctrl B — sidebar</span>
        </div>
        <h2>currently</h2>
        <p>Open to internships for <strong>summer 2028</strong> · researching EEG emotion decoding · shipping side projects across AI and web3.</p>
        <p class="sig">— about 12 public repos · 2 active research threads · IIIT Sri City</p>
      </div>`,
    code: `# Poorna Sri Nandyala

> CS @ IIIT Sri City — AI · EEG/BCI · networks · web3

B.Tech CSE student building AI systems, BCI experiments
and web apps.

## quick start

- Ctrl+P        quick open
- Ctrl+Shift+P  command palette
- Ctrl+\`        toggle terminal
- Ctrl+B        toggle sidebar

## currently

Open to internships (summer 2028).
Research: EEG emotion decoding.
`,
  });

  /* ---- About ---- */
  define({
    id: "about",
    name: "about.tsx",
    folder: "src",
    ext: "tsx",
    lang: "TypeScript React",
    keys: "about education iiit sri city btech cse batch 2028 focus research interests eeg bci ai ml web3 networks",
    preview: () => `
      <div class="preview">
        <h1>About</h1>
        <p class="lede"><strong>B.Tech CSE</strong> at IIIT Sri City, working on EEG emotion research (BCI). I like scalable web apps, intelligent systems, and open-source tools that other people can actually use.</p>
        <h2>what I focus on</h2>
        <p>Machine learning with a soft spot for signal data — brain waves in particular. Alongside research I build full-stack products, explore decentralised systems, and keep a growing shelf of networking and systems labs.</p>
        <div class="chips">
          <span class="chip on">AI / ML</span><span class="chip on">EEG / BCI</span>
          <span class="chip on">Networks</span><span class="chip on">Web3</span><span class="chip on">Full-stack</span>
        </div>
        <h2>education</h2>
        <div class="skill-card">
          <h4>IIIT SRI CITY · 2024 — PRESENT</h4>
          <p style="margin:0 0 4px"><strong>B.Tech, Computer Science &amp; Engineering</strong></p>
          <p class="muted" style="margin:0">Batch of 2028 · coursework in DSA, operating systems, computer networks and machine learning.</p>
        </div>
        <h2>research</h2>
        <div class="skill-card">
          <h4>EEG EMOTION ANALYSIS · 2025</h4>
          <p style="margin:0 0 4px"><strong>Brain–computer interfaces</strong></p>
          <p class="muted" style="margin:0">Decoding affective state from EEG recordings — preprocessing, feature engineering and classification.</p>
        </div>
        <h2>elsewhere</h2>
        <p class="muted">${ME.location} · ${ME.email}</p>
        <div class="btn-row">
          <a class="btn" href="${ME.github}" target="_blank" rel="noopener">GitHub</a>
          <a class="btn" href="${ME.linkedin}" target="_blank" rel="noopener">LinkedIn</a>
          <button class="btn" data-open="contact">Contact</button>
        </div>
      </div>`,
    code: `import { Student } from "@iiits/students";

export const poorna: Student = {
  name: "Poorna Sri Nandyala",
  degree: "B.Tech CSE",
  campus: "IIIT Sri City",
  batch: 2028,
  focus: ["AI/ML", "EEG/BCI", "Networks", "Web3", "Full-stack"],
  research: "EEG emotion analysis",
  currently: "open to internships - summer 2028",
  links: {
    github: "https://github.com/PoornaSri26",
    linkedin: "https://www.linkedin.com/in/poorna-sri-nandyala-06754b316",
    email: "poornasri.n24@gmail.com",
  },
};

export default function About() {
  // B.Tech CSE @ IIIT Sri City, building AI systems,
  // BCI experiments and web apps.
  return <Profile {...poorna} />;
}
`,
  });

  /* ---- Experience ---- */
  define({
    id: "experience",
    name: "experience.tsx",
    folder: "src",
    ext: "tsx",
    lang: "TypeScript React",
    keys: "experience cv timeline journey abhisarga events iiit research projects eeg bci internship",
    preview: () => `
      <div class="preview">
        <h1>Experience</h1>
        <p class="lede">A short story so far — campus, research, shipped projects, and a fest that taught me operations.</p>
        <div class="timeline">
          ${TIMELINE.map(
            (t) => `<div class="tl-item">
              <div class="tl-year">${t.year}</div>
              <div class="tl-title">${t.title}</div>
              <p class="tl-desc">${t.desc}</p>
            </div>`
          ).join("")}
        </div>
        <h2>highlights</h2>
        <ul style="margin:0 0 8px 18px;padding:0;color:var(--fg)">
          <li style="margin-bottom:6px;line-height:1.7">12 public repositories across AI, web3 and tooling.</li>
          <li style="margin-bottom:6px;line-height:1.7">EEG emotion pipeline built for a BCI research thread at IIIT Sri City.</li>
          <li style="margin-bottom:6px;line-height:1.7">Led cross-team coordination for Abhisarga, the institute's cultural fest.</li>
        </ul>
        <p class="sig">// full history available on request — ${ME.email}</p>
      </div>`,
    code: `type Act = {
  year: string;
  title: string;
  detail: string;
  tags: string[];
};

export const journey: Act[] = [
  {
    year: "2024 - present",
    title: "B.Tech CSE @ IIIT Sri City",
    detail: "Foundations in AI, systems and web engineering.",
    tags: ["DSA", "OS", "Networks", "ML"],
  },
  {
    year: "2025",
    title: "EEG Emotion Research",
    detail: "Signal preprocessing, features and classification for BCI.",
    tags: ["Python", "EEG", "BCI"],
  },
  {
    year: "2024 - 2025",
    title: "Projects shipped",
    detail: "Web3 voting, DocuMind, NTM and developer tooling.",
    tags: ["React", "Solidity", "LLM"],
  },
  {
    year: "2024",
    title: "Abhisarga - Events",
    detail: "Cultural fest coordination and cross-team operations.",
    tags: ["Leadership", "Ops"],
  },
];
`,
  });

  /* ---- Projects ---- */
  define({
    id: "projects",
    name: "projects.tsx",
    folder: "src",
    ext: "tsx",
    lang: "TypeScript React",
    keys: "projects blockchain voting neural turing machine documind web3 github repo explorer spam detector networking",
    preview: () => `
      <div class="preview">
        <h1>Projects</h1>
        <p class="lede">Things I have built — research prototypes, full-stack apps and on-chain experiments. Every card opens the repository.</p>
        <div class="proj-grid">
          ${PROJECTS.map(
            (p) => `<a class="proj" href="${p.url}" target="_blank" rel="noopener">
              <div class="proj-top">
                <span class="proj-name">${p.name}${p.featured ? " ✦" : ""}</span>
              </div>
              <p class="proj-desc">${p.desc}</p>
              <div class="proj-tags">${p.tags.map((t) => `<span class="proj-tag">${t}</span>`).join("")}</div>
              <div class="proj-foot">
                <span class="lang-dot" style="background:${p.color}"></span>${p.lang}
                <span style="margin-left:auto">${p.meta}</span>
              </div>
            </a>`
          ).join("")}
        </div>
        <div class="btn-row">
          <a class="btn primary" href="${ME.github}?tab=repositories" target="_blank" rel="noopener">All repositories →</a>
          <a class="btn" href="${ME.github}" target="_blank" rel="noopener">GitHub profile</a>
        </div>
      </div>`,
    code: `export type Project = {
  name: string;
  stack: string[];
  link: string;
};

export const projects: Project[] = [
  {
    name: "Blockchain Voting System",
    stack: ["Solidity", "Web3", "JavaScript"],
    link: "https://github.com/PoornaSri26/blockchain-voting-system",
  },
  {
    name: "Neural Turing Machine",
    stack: ["Python", "Deep Learning"],
    link: "https://github.com/PoornaSri26/neural-turing-machine",
  },
  {
    name: "DocuMind",
    stack: ["LLM", "RAG", "Python"],
    link: "https://github.com/PoornaSri26/DocuMInd",
  },
  {
    name: "Web3 Project",
    stack: ["Ethereum", "DApp"],
    link: "https://github.com/PoornaSri26/web3_project",
  },
  {
    name: "GitHub Repo Explorer",
    stack: ["Python", "GitHub API"],
    link: "https://github.com/PoornaSri26/GitHub-Repo-Explorer",
  },
];
`,
  });

  /* ---- Skills ---- */
  define({
    id: "skills",
    name: "skills.json",
    folder: "src",
    ext: "json",
    lang: "JSON",
    keys: "skills python javascript typescript c sql machine learning deep learning eeg bci nlp react node css solidity algorithms networks os git linux",
    preview: () => `
      <div class="preview">
        <h1>Skills</h1>
        <p class="lede">The toolbox — languages I write, models I train, and the systems fundamentals underneath.</p>
        <div class="skill-grid">
          ${SKILLS.map(
            (g) => `<div class="skill-card">
              <h4>${g.group}</h4>
              ${g.items
                .map(
                  ([name, pct]) => `<div class="skill-row">
                    <span>${name}</span>
                    <div class="meter"><i style="width:${pct}%"></i></div>
                  </div>`
                )
                .join("")}
            </div>`
          ).join("")}
        </div>
        <h2>also comfortable with</h2>
        <div class="chips">
          ${["Git", "Linux", "VS Code", "Jupyter", "Prisma", "Vite", "Firebase", "REST APIs", "Pandas", "NumPy"]
            .map((s) => `<span class="chip">${s}</span>`)
            .join("")}
        </div>
      </div>`,
    code: `{
  "languages": ["Python", "JavaScript", "TypeScript", "C", "SQL"],
  "ai_ml": ["Machine Learning", "Deep Learning", "EEG / BCI", "NLP"],
  "web": ["React", "Node.js", "HTML", "CSS", "Web3 / Solidity"],
  "core": ["DSA", "Computer Networks", "Operating Systems", "DBMS"],
  "tools": ["Git", "Linux", "VS Code", "Jupyter", "Prisma", "Vite"],
  "learning": ["Transformers", "System Design", "Rust"],
  "open_to": "internships - summer 2028"
}
`,
  });

  /* ---- Research ---- */
  define({
    id: "research",
    name: "research.md",
    folder: "src",
    ext: "md",
    lang: "Markdown",
    keys: "research eeg emotion bci brain computer interface signal machine learning paper iiit",
    preview: () => `
      <div class="preview">
        <h1>Research</h1>
        <p class="lede">EEG emotion analysis — teaching models to read affect from electrical activity in the brain.</p>
        <h2>eeg_emotion_analysis</h2>
        <div class="chips">
          <span class="chip on">EEG</span><span class="chip on">BCI</span>
          <span class="chip">ML</span><span class="chip">Python</span><span class="chip">2025</span>
        </div>
        <p>Brain–computer interfaces depend on reliable decoding of mental state. This thread looks at how far classical features plus machine learning can go on EEG recordings, and where deep models actually add value.</p>
        <h3>pipeline</h3>
        <p class="muted">Raw EEG → filtering &amp; artefact removal → windowing → time/frequency features → classifier → emotion label.</p>
        <h3>open questions</h3>
        <ul style="margin:0 0 10px 18px;padding:0;list-style:disc;color:var(--fg)">
          <li style="line-height:1.75">How much subject-specific calibration is really needed?</li>
          <li style="line-height:1.75">Do frequency-band features generalise across sessions?</li>
          <li style="line-height:1.75">Where do transformers beat hand-engineered features on short windows?</li>
        </ul>
        <h2>interests</h2>
        <p>Memory-augmented networks (my Neural Turing Machine build), affective computing, and efficient models that run on modest hardware.</p>
        <p class="sig">// happy to talk BCI — ${ME.email}</p>
      </div>`,
    code: `# EEG Emotion Analysis

Brain-computer interfaces need reliable decoding of
mental state. This thread measures how far classical
features + ML get on EEG, and where deep models help.

## pipeline

raw EEG -> filter -> windows -> features -> classifier

## stack

- Python, NumPy, Pandas
- scikit-learn, PyTorch
- MNE for EEG handling

## open questions

- how much subject calibration is needed?
- do band features generalise across sessions?
- transformers vs hand-engineered features?

## related

Neural Turing Machine - memory-augmented networks.
`,
  });

  /* ---- Contact ---- */
  define({
    id: "contact",
    name: "contact.tsx",
    folder: "src",
    ext: "tsx",
    lang: "TypeScript React",
    keys: "contact email phone linkedin github hire internship reach out",
    preview: () => `
      <div class="preview">
        <h1>Contact</h1>
        <p class="lede">Open to internships, research conversations and interesting side projects. The fastest route is email.</p>
        <div class="skill-card" style="margin-top:14px">
          <h4>CONTACT</h4>
          <p style="margin:0 0 10px"><a href="mailto:${ME.email}">${ME.email}</a></p>
          <p class="muted" style="margin:0 0 4px">${ME.phone}</p>
          <p class="muted" style="margin:0">${ME.location}</p>
        </div>
        <div class="btn-row">
          <a class="btn primary" href="mailto:${ME.email}">Send email</a>
          <a class="btn" href="${ME.linkedin}" target="_blank" rel="noopener">LinkedIn</a>
          <a class="btn" href="${ME.github}" target="_blank" rel="noopener">GitHub</a>
          <a class="btn" href="tel:+919182728687">Call</a>
        </div>
        <h2>response_time</h2>
        <p class="muted">Usually within a day. Recruiters: mention the role and timeline and I will reply with availability.</p>
        <h2>this site</h2>
        <p class="muted">A hand-built VS Code clone — editor, explorer, terminal and themes, no framework. <a href="${ME.main}">Back to the main portfolio</a> or <a href="${ME.repo}/tree/main/vscode" target="_blank" rel="noopener">read the source</a>.</p>
      </div>`,
    code: `import { mailto } from "@portfolio/utils";

export const contact = {
  email: "poornasri.n24@gmail.com",
  phone: "+91 91827 28687",
  location: "IIIT Sri City, Andhra Pradesh, India",
  linkedin: "https://www.linkedin.com/in/poorna-sri-nandyala-06754b316",
  github: "https://github.com/PoornaSri26",
  availability: "internships - summer 2028",
  responseTime: "within a day",
} as const;

export default function Contact() {
  return <ContactCard {...contact} cta={mailto(contact.email)} />;
}
`,
  });

  /* ---- README ---- */
  define({
    id: "readme",
    name: "README.md",
    folder: "",
    ext: "md",
    lang: "Markdown",
    keys: "readme portfolio repo github pages deploy vscode theme source",
    preview: () => `
      <div class="preview">
        <h1>PoornaSri-Portfolio</h1>
        <p class="lede">Two portfolios, one person: the main story-driven site and this VS Code workspace.</p>
        <h2>run_locally</h2>
        <p class="muted">This page is plain HTML, CSS and JavaScript — open <code>vscode/index.html</code> directly, or run <code>npx serve .</code> from the repo root.</p>
        <h2>files</h2>
        <p class="muted"><code>index.html</code> · shell &nbsp; <code>style.css</code> · themes + layout &nbsp; <code>app.js</code> · explorer, tabs, terminal, palette</p>
        <h2>shortcuts</h2>
        <div class="chips">
          <span class="chip">Ctrl P — quick open</span>
          <span class="chip">Ctrl Shift P — commands</span>
          <span class="chip">Ctrl \` — terminal</span>
          <span class="chip">Ctrl B — sidebar</span>
        </div>
        <div class="btn-row">
          <a class="btn primary" href="${ME.main}">Open main portfolio</a>
          <a class="btn" href="${ME.repo}" target="_blank" rel="noopener">View repository</a>
        </div>
        <p class="sig">// theme choice is remembered in this browser</p>
      </div>`,
    code: `# PoornaSri-Portfolio

Two portfolios, one person:

- \`/\`          the main story-driven site
- \`/vscode/\`   this VS Code workspace

## run locally

    npx serve .

## structure

    vscode/index.html   shell
    vscode/style.css    themes + layout
    vscode/app.js       explorer, tabs, terminal

## shortcuts

    Ctrl+P        quick open
    Ctrl+Shift+P  command palette
    Ctrl+\`        toggle terminal
    Ctrl+B        toggle sidebar
`,
  });

  const TREE = [
    { type: "root", label: "PoornaSri-Portfolio" },
    { type: "file", id: "readme", depth: 0 },
    { type: "folder", label: "src", depth: 0 },
    { type: "file", id: "welcome", depth: 1 },
    { type: "file", id: "about", depth: 1 },
    { type: "file", id: "experience", depth: 1 },
    { type: "file", id: "projects", depth: 1 },
    { type: "file", id: "skills", depth: 1 },
    { type: "file", id: "research", depth: 1 },
    { type: "file", id: "contact", depth: 1 },
  ];

  /* ---------------------------------------------------------
     State + elements
     --------------------------------------------------------- */
  const state = {
    openTabs: ["welcome"],
    active: "welcome",
    mode: {},          // file id -> "preview" | "code"
    view: "explorer",
    collapsedFolder: false,
    paletteMode: "commands",
    paletteIndex: 0,
    paletteItems: [],
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const el = {
    html: document.documentElement,
    title: $("#title-text"),
    tabs: $("#tabs"),
    editor: $("#editor"),
    breadcrumb: $("#breadcrumb"),
    actions: $("#editor-actions"),
    sidebar: $("#sidebar"),
    sideTitle: $("#side-title"),
    sideBody: $("#side-body"),
    activity: $$(".ab-item[data-view]"),
    panel: $("#panel"),
    terminal: $("#terminal"),
    termForm: $("#term-form"),
    termInput: $("#term-input"),
    overlay: $("#overlay"),
    paletteInput: $("#palette-input"),
    paletteList: $("#palette-list"),
    menuPop: $("#menu-pop"),
    clock: $("#sb-clock"),
    lang: $("#sb-lang"),
    themeLabel: $("#sb-theme"),
    searchInput: null,
  };

  /* ---------------------------------------------------------
     Rendering: sidebar
     --------------------------------------------------------- */
  function fileRow(id, depth) {
    const f = FILES[id];
    const active = id === state.active;
    return `<button class="tree-row ${active ? "active" : ""}" data-file="${id}"
              style="padding-left:${12 + depth * 14}px" role="treeitem">
              <span class="chev"></span>${iconFor(f.ext)}
              <span class="fname">${f.name}</span>
            </button>`;
  }

  function renderExplorer() {
    el.sideTitle.textContent = "Explorer";
    el.sideBody.innerHTML = `<div class="tree" role="tree">
      ${TREE.map((node) => {
        if (node.type === "root")
          return `<div class="tree-row dir" style="padding-left:6px;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--fg-dim)">
            <span class="chev">⌄</span><span class="fname">${node.label}</span></div>`;
        if (node.type === "folder")
          return `<button class="tree-row dir" data-folder="1" style="padding-left:${12 + node.depth * 14}px">
            <span class="chev" style="transform:rotate(${state.collapsedFolder ? "-90deg" : "0deg"})">⌄</span>
            <span class="fname">${node.label}</span></button>`;
        return state.collapsedFolder && node.depth === 1 ? "" : fileRow(node.id, node.depth);
      }).join("")}
    </div>
    <div class="side-section">Outline</div>
    <div class="side-note">${
      FILES[state.active].name
    } <span class="muted">— ${FILES[state.active].lang}</span></div>
    <div class="side-section">Repository</div>
    <div class="side-links">
      <a href="${ME.repo}" target="_blank" rel="noopener">${svgRepo()} PoornaSri-Portfolio</a>
      <a href="${ME.github}?tab=repositories" target="_blank" rel="noopener">${svgRepo()} All repositories</a>
      <a href="${ME.linkedin}" target="_blank" rel="noopener">${svgLink()} LinkedIn</a>
      <a href="${ME.main}">${svgLink()} Main portfolio</a>
    </div>`;
  }

  function svgRepo() {
    return `<svg viewBox="0 0 24 24" width="13" height="13"><path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>`;
  }
  function svgLink() {
    return `<svg viewBox="0 0 24 24" width="13" height="13"><path fill="none" stroke="currentColor" stroke-width="2" d="M14 3h7v7M21 3l-9 9M10 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/></svg>`;
  }

  function renderSearch() {
    el.sideTitle.textContent = "Search";
    el.sideBody.innerHTML = `<div class="search-box">
        <input id="search-input" type="search" placeholder="Search portfolio…" aria-label="Search portfolio files"/>
      </div><div id="search-results"></div>`;
    el.searchInput = $("#search-input", el.sideBody);
    el.searchInput.value = state.query || "";
    el.searchInput.addEventListener("input", () => {
      state.query = el.searchInput.value;
      renderSearchResults();
    });
    el.searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const first = $(".search-hit", el.sideBody);
        if (first) openFile(first.dataset.file);
      }
      e.stopPropagation();
    });
    renderSearchResults();
  }

  function renderSearchResults() {
    const box = $("#search-results", el.sideBody);
    if (!box) return;
    const q = (state.query || "").trim().toLowerCase();
    if (!q) {
      box.innerHTML = `<div class="search-empty">Search across ${Object.keys(FILES).length} files — try “eeg”, “web3”, “react”.</div>`;
      return;
    }
    const hits = Object.values(FILES).filter(
      (f) => f.name.toLowerCase().includes(q) || f.keys.includes(q)
    );
    box.innerHTML = hits.length
      ? hits
          .map(
            (f) => `<button class="search-hit" data-file="${f.id}">
              <b>${f.name}</b> <span class="dim">— ${f.lang}</span></button>`
          )
          .join("")
      : `<div class="search-empty">No results for “${esc(q)}”.</div>`;
  }

  function renderSource() {
    el.sideTitle.textContent = "Source Control";
    el.sideBody.innerHTML = `<div class="side-section" style="border:0;margin-top:4px">Repository</div>
      <div class="side-note">
        <strong>PoornaSri-Portfolio</strong><br/>
        branch <code>main</code> · GitHub Pages<br/><br/>
        This folder is the working tree — one HTML file, one stylesheet, one script.
      </div>
      <div class="side-section">Links</div>
      <div class="side-links">
        <a href="${ME.repo}" target="_blank" rel="noopener">${svgRepo()} Repository</a>
        <a href="${ME.repo}/commits/main" target="_blank" rel="noopener">${svgLink()} Commit history</a>
        <a href="${ME.repo}/issues" target="_blank" rel="noopener">${svgLink()} Issues</a>
        <a href="${ME.github}" target="_blank" rel="noopener">${svgRepo()} GitHub profile</a>
      </div>
      <div class="side-section">Changes</div>
      <div class="side-note">
        <span style="color:#e2c08d">M</span> index.html <span class="dim">vscode button</span><br/>
        <span style="color:#73c991">U</span> vscode/ <span class="dim">this workspace</span>
      </div>`;
  }

  function renderExtensions() {
    el.sideTitle.textContent = "Extensions";
    const list = [
      ["Python", "ms-python.python", "#3572A5"],
      ["Jupyter", "ms-toolsai.jupyter", "#DA5B0B"],
      ["ESLint", "dbaeumer.vscode-eslint", "#8b7bd8"],
      ["Prettier", "esbenp.prettier-vscode", "#cbcb41"],
      ["Tailwind CSS IntelliSense", "bradlc.vscode-tailwindcss", "#38bdf8"],
      ["GitLens", "eamodio.gitlens", "#f05032"],
      ["Theme: Dracula Official", "dracula-theme.theme-dracula", "#bd93f9"],
    ];
    el.sideBody.innerHTML = `<div class="side-section" style="border:0;margin-top:4px">Installed · ${list.length}</div>
      <div class="side-links">${list
        .map(
          ([name, id, color]) => `<a href="#" data-noop="1" title="Just for show">
            <span style="display:grid;place-items:center;width:22px;height:22px;border-radius:4px;background:${color}22;color:${color};font-family:var(--font-mono);font-size:10px">${name[0]}</span>
            <span>${name}<br/><span class="dim" style="font-size:10.5px">${id}</span></span></a>`
        )
        .join("")}</div>
      <div class="side-note" style="margin-top:8px">A developer's shelf, not a real marketplace.</div>`;
  }

  function renderSettings() {
    el.sideTitle.textContent = "Settings";
    el.sideBody.innerHTML = `<div class="side-section" style="border:0;margin-top:4px">Color theme</div>
      <div class="theme-list" id="theme-list">
        ${THEMES.map(
          (t) => `<button class="theme-row ${t.id === state.theme ? "active" : ""}" data-theme-id="${t.id}">
            <span class="swatches">${t.swatches.map((c) => `<i style="background:${c}"></i>`).join("")}</span>
            <span>${t.label}</span>
          </button>`
        ).join("")}
      </div>
      <div class="side-section">Preferences</div>
      <div class="side-note">
        Font: JetBrains Mono fallback stack<br/>
        Word wrap: on for preview<br/>
        Auto save: after delay<br/>
        Theme is stored in this browser.
      </div>
      <div class="side-section">About</div>
      <div class="side-note">
        Version 1.0.0<br/>
        Built by Poorna Sri Nandyala<br/>
        <a href="${ME.main}">← back to the main portfolio</a>
      </div>`;
  }

  function renderSidebar() {
    if (state.view === "explorer") renderExplorer();
    else if (state.view === "search") renderSearch();
    else if (state.view === "source") renderSource();
    else if (state.view === "extensions") renderExtensions();
    else renderSettings();

    el.activity.forEach((b) =>
      b.classList.toggle("active", b.dataset.view === state.view)
    );
  }

  /* ---------------------------------------------------------
     Rendering: tabs + editor
     --------------------------------------------------------- */
  function renderTabs() {
    el.tabs.innerHTML = state.openTabs
      .map((id) => {
        const f = FILES[id];
        const active = id === state.active;
        return `<div class="tab ${active ? "active" : ""}" data-tab="${id}" role="tab"
                  aria-selected="${active}" tabindex="0">
          <span class="dot" style="color:${f.ext === "json" ? "#cbcb41" : "#519aba"}"></span>
          <span>${f.name}</span>
          <button class="tab-close" data-close="${id}" aria-label="Close ${f.name}">×</button>
        </div>`;
      })
      .join("");
  }

  function renderEditor() {
    const f = FILES[state.active];
    const mode = state.mode[state.active] || "preview";
    const hasCode = Boolean(f.code);
    const fileMode = hasCode ? mode : "preview";

    el.title.textContent = `${f.name} — PoornaSri-Portfolio`;
    el.breadcrumb.innerHTML = `<span>PoornaSri-Portfolio</span><span class="sep">›</span>
      ${f.folder ? `<span>${f.folder}</span><span class="sep">›</span>` : ""}
      <span class="cur">${f.name}</span>`;

    el.actions.innerHTML = hasCode
      ? `<button class="chip-btn ${fileMode === "preview" ? "active" : ""}" data-mode="preview">Preview</button>
         <button class="chip-btn ${fileMode === "code" ? "active" : ""}" data-mode="code">&lt;/&gt; Code</button>`
      : "";

    if (fileMode === "code") {
      const lines = f.code.replace(/\n$/, "").split("\n");
      el.editor.innerHTML = `<div class="code-wrap">
        <div class="gutter">${lines.map((_, i) => i + 1).join("<br/>")}</div>
        <pre class="code">${highlight(f.code, f.ext)}</pre>
      </div>`;
      el.editor.scrollTop = 0;
    } else {
      el.editor.innerHTML = f.preview();
      el.editor.scrollTop = 0;
    }

    el.lang.textContent = f.lang;
    const theme = THEMES.find((t) => t.id === state.theme);
    el.themeLabel.textContent = theme ? theme.label : "";
  }

  function renderAll() {
    renderSidebar();
    renderTabs();
    renderEditor();
  }

  /* ---------------------------------------------------------
     Actions
     --------------------------------------------------------- */
  function openFile(id, focus = false) {
    if (!FILES[id]) return;
    if (!state.openTabs.includes(id)) state.openTabs.push(id);
    state.active = id;
    renderAll();
    if (focus) el.editor.focus();
    if (window.innerWidth <= 900) el.sidebar.classList.remove("open");
  }

  function closeTab(id) {
    const i = state.openTabs.indexOf(id);
    if (i === -1) return;
    state.openTabs.splice(i, 1);
    if (!state.openTabs.length) state.openTabs.push("welcome");
    if (state.active === id) {
      state.active = state.openTabs[Math.max(0, Math.min(i, state.openTabs.length - 1))];
    }
    renderAll();
  }

  function setTheme(id) {
    const theme = THEMES.find((t) => t.id === id);
    if (!theme) return;
    state.theme = id;
    el.html.setAttribute("data-theme", id);
    try {
      localStorage.setItem("ps-vscode-theme", id);
    } catch (e) {
      /* storage blocked — theme still applies for this visit */
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      const bg = getComputedStyle(el.html).getPropertyValue("--bg").trim();
      if (bg) meta.setAttribute("content", bg);
    }
    if (state.view === "settings") renderSettings();
    el.themeLabel.textContent = theme.label;
    termPrint(`<span class="dim">theme set →</span> ${theme.label}`);
  }

  function togglePanel(force) {
    const collapsed = typeof force === "boolean" ? !force : el.panel.classList.toggle("collapsed");
    if (typeof force === "boolean") el.panel.classList.toggle("collapsed", collapsed);
    if (!collapsed) el.termInput.focus();
  }

  function toggleSidebar() {
    if (window.innerWidth <= 900) el.sidebar.classList.toggle("open");
    else el.sidebar.style.display = getComputedStyle(el.sidebar).display === "none" ? "flex" : "none";
  }

  /* ---------------------------------------------------------
     Terminal
     --------------------------------------------------------- */
  const banner = `<span class="ok">Poorna's VS Code Portfolio</span> <span class="dim">v1.0.0</span>
<span class="dim">Type</span> <span class="ok">help</span> <span class="dim">to list commands ·</span> <span class="ok">neofetch</span> <span class="dim">for the stats.</span>`;

  function termPrint(html) {
    const line = document.createElement("span");
    line.className = "ln";
    line.innerHTML = html;
    el.terminal.appendChild(line);
    el.terminal.scrollTop = el.terminal.scrollHeight;
  }

  function termLink(url, label) {
    return `<a href="${url}" target="_blank" rel="noopener">${label}</a>`;
  }

  function resolveFile(arg) {
    if (!arg) return null;
    const q = arg.replace(/^src\//, "").toLowerCase();
    return (
      FILES[q] ||
      Object.values(FILES).find(
        (f) =>
          f.name.toLowerCase() === q ||
          f.name.toLowerCase().replace(/\.[a-z]+$/, "") === q
      ) ||
      null
    );
  }

  function openFromTerminal(arg) {
    const file = resolveFile(arg);
    if (file) {
      openFile(file.id);
      termPrint(`<span class="dim">opened</span> ${file.name}`);
    } else {
      termPrint(`<span class="err">no such file:</span> ${esc(arg)} <span class="dim">(try ls)</span>`);
    }
  }

  function runCommand(raw) {
    const cmd = raw.trim();
    termPrint(`<span class="dim">poorna@iiits:~/portfolio$</span> <span class="cmd">${esc(cmd)}</span>`);
    if (!cmd) return;
    const [name, ...args] = cmd.split(/\s+/);
    const arg = args.join(" ");

    switch (name.toLowerCase()) {
      case "help":
        termPrint(`<span class="dim">available commands</span>
  <span class="ok">about</span>      who I am        <span class="ok">projects</span>   repository list
  <span class="ok">skills</span>     stack           <span class="ok">research</span>   EEG / BCI work
  <span class="ok">contact</span>    reach me        <span class="ok">open</span> &lt;file&gt;  open a tab
  <span class="ok">ls</span>         list files      <span class="ok">cat</span> &lt;file&gt;   file source
  <span class="ok">theme</span>      switch theme    <span class="ok">themes</span>     list themes
  <span class="ok">neofetch</span>   stats           <span class="ok">github</span>     open profile
  <span class="ok">main</span>       main portfolio  <span class="ok">clear</span>      clear terminal`);
        break;
      case "about":
        termPrint(`${ME.name} — ${ME.role}
B.Tech CSE @ IIIT Sri City (batch 2028). EEG emotion research (BCI).
Focus: AI/ML, networks, web3, full-stack. Open to internships.`);
        break;
      case "whoami":
        termPrint(`poorna <span class="dim">·</span> CS student <span class="dim">·</span> ${ME.location}`);
        break;
      case "projects":
        termPrint(
          PROJECTS.map((p) => `  <span class="ok">${p.name}</span> <span class="dim">— ${p.lang}</span>\n    ${termLink(p.url, p.url.replace("https://github.com/", "github.com/"))}`).join("\n")
        );
        break;
      case "skills":
        termPrint(SKILLS.map((g) => `  <span class="ok">${g.group}</span>: ${g.items.map((i) => i[0]).join(", ")}`).join("\n"));
        break;
      case "research":
        termPrint(`EEG Emotion Analysis <span class="dim">(2025)</span>
Decoding affective state from EEG — preprocessing, features, classification.
Tags: EEG · BCI · ML · Python`);
        break;
      case "contact":
        termPrint(`  email     ${termLink("mailto:" + ME.email, ME.email)}
  linkedin  ${termLink(ME.linkedin, "poorna-sri-nandyala")}
  github    ${termLink(ME.github, "PoornaSri26")}
  phone     ${ME.phone}`);
        break;
      case "ls":
        termPrint(
          `<span class="ok">src/</span>\n` +
            Object.values(FILES)
              .filter((f) => f.folder === "src")
              .map((f) => `  ${f.name}`)
              .join("\n") +
            `\n<span class="ok">README.md</span>`
        );
        break;
      case "cat":
        if (!arg) return termPrint(`<span class="err">usage:</span> cat &lt;file&gt;`);
        {
          const f = resolveFile(arg);
          if (!f) return termPrint(`<span class="err">cat: ${esc(arg)}: no such file</span>`);
          termPrint(`<span class="dim">${esc(f.name)}</span>\n${esc(f.code || f.preview().replace(/<[^>]+>/g, " ").slice(0, 700))}`);
        }
        break;
      case "open":
        if (!arg) return termPrint(`<span class="err">usage:</span> open &lt;file&gt; <span class="dim">(ls to list)</span>`);
        openFromTerminal(arg);
        break;
      case "theme":
        if (!arg) return termPrint(`<span class="dim">usage:</span> theme &lt;name&gt; <span class="dim">—</span> themes`);
        {
          const t = THEMES.find((x) => x.id === arg.toLowerCase() || x.label.toLowerCase().startsWith(arg.toLowerCase()));
          if (t) setTheme(t.id);
          else termPrint(`<span class="err">unknown theme:</span> ${esc(arg)} <span class="dim">(try themes)</span>`);
        }
        break;
      case "themes":
        termPrint(THEMES.map((t) => `  <span class="ok">${t.id}</span> <span class="dim">— ${t.label}</span>`).join("\n"));
        break;
      case "github":
        window.open(ME.github, "_blank", "noopener");
        termPrint(`<span class="dim">opening</span> ${ME.github}`);
        break;
      case "main":
        window.location.href = ME.main;
        break;
      case "date":
        termPrint(new Date().toString());
        break;
      case "neofetch":
        termPrint(`<span class="ok">poorna@iiits</span> <span class="dim">-----------------</span>
<span class="ok">OS</span>       IIIT Sri City · B.Tech CSE
<span class="ok">Host</span>     PoornaSri-Portfolio
<span class="ok">Shell</span>    zsh 5.9
<span class="ok">Theme</span>    ${(THEMES.find((t) => t.id === state.theme) || THEMES[0]).label}
<span class="ok">Editor</span>   VS Code (obviously)
<span class="ok">Repos</span>    12
<span class="ok">Research</span> EEG · BCI
<span class="ok">Uptime</span>   since 2024
<span class="ok">Status</span>   open to internships · summer 2028`);
        break;
      case "clear":
        el.terminal.innerHTML = "";
        break;
      case "sudo":
        termPrint(`<span class="warn">poorna is not in the sudoers file.</span> This incident has been reported.`);
        break;
      case "exit":
        termPrint(`<span class="dim">there is no escape — try</span> <span class="ok">help</span>`);
        break;
      case "echo":
        termPrint(esc(arg));
        break;
      default:
        termPrint(`<span class="err">command not found:</span> ${esc(name)} <span class="dim">— type</span> <span class="ok">help</span>`);
    }
  }

  /* ---------------------------------------------------------
     Command palette
     --------------------------------------------------------- */
  function commandList() {
    const commands = [];
    Object.values(FILES)
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((f) =>
        commands.push({
          label: `Open: ${f.name}`,
          hint: f.lang,
          run: () => openFile(f.id),
          keywords: "open file " + f.keys,
        })
      );
    THEMES.forEach((t) =>
      commands.push({
        label: `Theme: ${t.label}`,
        hint: "color theme",
        run: () => setTheme(t.id),
        keywords: "theme color " + t.id,
      })
    );
    commands.push(
      { label: "Toggle Terminal", hint: "Ctrl `", run: () => togglePanel(), keywords: "panel terminal" },
      { label: "Toggle Sidebar", hint: "Ctrl B", run: () => toggleSidebar(), keywords: "sidebar explorer" },
      { label: "Open Main Portfolio", hint: "site", run: () => (window.location.href = ME.main), keywords: "main site story" },
      { label: "Copy Email Address", hint: ME.email, run: () => copyEmail(), keywords: "contact mail email" },
      { label: "Open GitHub Profile", hint: "external", run: () => window.open(ME.github, "_blank", "noopener"), keywords: "github code" },
      { label: "Clear Terminal", hint: "terminal", run: () => (el.terminal.innerHTML = ""), keywords: "terminal clear" }
    );
    return commands;
  }

  function copyEmail() {
    if (navigator.clipboard) navigator.clipboard.writeText(ME.email).catch(() => {});
    termPrint(`<span class="dim">copied</span> ${ME.email}`);
    togglePanel(true);
  }

  function paletteItems(query, mode) {
    const q = query.trim().toLowerCase();
    const source =
      mode === "files"
        ? Object.values(FILES).map((f) => ({
            label: f.name,
            hint: f.lang,
            run: () => openFile(f.id),
            keywords: "open file " + f.keys,
          }))
        : commandList();
    if (!q) return source;
    return source.filter((c) => (c.label + " " + c.keywords).toLowerCase().includes(q));
  }

  function openPalette(mode) {
    state.paletteMode = mode || "commands";
    state.paletteIndex = 0;
    el.paletteInput.value = "";
    el.paletteInput.placeholder =
      state.paletteMode === "files" ? "Go to file…" : "Type a command…";
    el.overlay.hidden = false;
    renderPalette("");
    el.paletteInput.focus();
  }

  function closePalette() {
    el.overlay.hidden = true;
    el.paletteInput.value = "";
  }

  function renderPalette(query) {
    const items = paletteItems(query, state.paletteMode).slice(0, 60);
    state.paletteItems = items;
    if (state.paletteIndex >= items.length) state.paletteIndex = 0;
    el.paletteList.innerHTML = items.length
      ? items
          .map(
            (c, i) =>
              `<li class="${i === state.paletteIndex ? "active" : ""}" data-index="${i}" role="option">
                <span>${c.label}</span><span class="pk">${c.hint || ""}</span></li>`
          )
          .join("")
      : `<li class="dim" style="cursor:default;color:var(--fg-faint)">No matching command</li>`;
  }

  function runPaletteItem(i) {
    const item = state.paletteItems[i];
    if (!item) return;
    closePalette();
    item.run();
  }

  /* ---------------------------------------------------------
     Menus
     --------------------------------------------------------- */
  function menuActions(menu) {
    if (menu === "file")
      return [
        ["Open file…", "Ctrl P", () => openPalette("files")],
        ["Command palette…", "Ctrl ⇧ P", () => openPalette("commands")],
        ["sep"],
        ["Open main portfolio", "", () => (window.location.href = ME.main)],
        ["Copy email", "", () => copyEmail()],
        ["sep"],
        ["Close current tab", "", () => closeTab(state.active)],
      ];
    if (menu === "view")
      return [
        ["Toggle sidebar", "Ctrl B", () => toggleSidebar()],
        ["Toggle terminal", "Ctrl `", () => togglePanel()],
        ["sep"],
        ["Explorer", "", () => setView("explorer")],
        ["Search", "", () => setView("search")],
        ["Settings", "", () => setView("settings")],
      ];
    if (menu === "theme")
      return THEMES.map((t) => [t.label, "", () => setTheme(t.id)]);
    return [
      ["About this workspace", "", () => openFile("readme")],
      ["Keyboard shortcuts", "", () => openFile("welcome")],
      ["sep"],
      ["GitHub profile", "", () => window.open(ME.github, "_blank", "noopener")],
      ["Main portfolio", "", () => (window.location.href = ME.main)],
    ];
  }

  function openMenu(button) {
    const menu = button.dataset.menu;
    const items = menuActions(menu);
    el.menuPop.innerHTML = items
      .map((item) =>
        item[0] === "sep"
          ? `<div class="sep"></div>`
          : `<button data-menu-action="${item[0]}"><span>${item[0]}</span><span class="key">${item[1] || ""}</span></button>`
      )
      .join("");
    const rect = button.getBoundingClientRect();
    el.menuPop.hidden = false;
    el.menuPop.style.left = `${Math.min(rect.left, window.innerWidth - 240)}px`;
    el.menuPop.style.top = `${rect.bottom + 4}px`;

    $$("#menu-pop button").forEach((b, i) => {
      const action = items.filter((it) => it[0] !== "sep")[i][2];
      b.addEventListener("click", () => {
        el.menuPop.hidden = true;
        action();
      });
    });
  }

  function setView(view) {
    state.view = view;
    renderSidebar();
    el.sidebar.classList.add("open");
  }

  /* ---------------------------------------------------------
     Events
     --------------------------------------------------------- */
  document.addEventListener("click", (e) => {
    const target = e.target;

    const fileBtn = target.closest("[data-file]");
    if (fileBtn) return openFile(fileBtn.dataset.file);

    const folderBtn = target.closest("[data-folder]");
    if (folderBtn) {
      state.collapsedFolder = !state.collapsedFolder;
      return renderExplorer();
    }

    const tab = target.closest("[data-tab]");
    if (tab && !target.closest("[data-close]")) return openFile(tab.dataset.tab);

    const closer = target.closest("[data-close]");
    if (closer) return closeTab(closer.dataset.close);

    const modeBtn = target.closest("[data-mode]");
    if (modeBtn) {
      state.mode[state.active] = modeBtn.dataset.mode;
      return renderEditor();
    }

    const open = target.closest("[data-open]");
    if (open) return openFile(open.dataset.open);

    const themeBtn = target.closest("[data-theme-id]");
    if (themeBtn) return setTheme(themeBtn.dataset.themeId);

    const noop = target.closest("[data-noop]");
    if (noop) {
      e.preventDefault();
      return;
    }

    const viewBtn = target.closest(".ab-item[data-view]");
    if (viewBtn) return setView(viewBtn.dataset.view);

    const menuBtn = target.closest(".menubar button");
    if (menuBtn) return openMenu(menuBtn);

    if (!target.closest("#menu-pop")) el.menuPop.hidden = true;
  });

  $("#palette-btn").addEventListener("click", () => openPalette("commands"));
  $("#panel-close").addEventListener("click", () => togglePanel(false));
  $("#menu-btn").addEventListener("click", () => el.sidebar.classList.toggle("open"));

  $("#overlay").addEventListener("click", (e) => {
    if (e.target.id === "overlay") closePalette();
  });

  el.paletteInput.addEventListener("input", () => {
    state.paletteIndex = 0;
    renderPalette(el.paletteInput.value);
  });

  el.paletteInput.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      state.paletteIndex = Math.min(state.paletteIndex + 1, state.paletteItems.length - 1);
      renderPalette(el.paletteInput.value);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      state.paletteIndex = Math.max(state.paletteIndex - 1, 0);
      renderPalette(el.paletteInput.value);
    } else if (e.key === "Enter") {
      e.preventDefault();
      runPaletteItem(state.paletteIndex);
    } else if (e.key === "Escape") {
      closePalette();
    }
  });

  el.paletteList.addEventListener("click", (e) => {
    const li = e.target.closest("[data-index]");
    if (li) runPaletteItem(Number(li.dataset.index));
  });

  $$(".panel-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      $$(".panel-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      termPrint(
        tab.dataset.panelTab === "output"
          ? `<span class="dim">[output]</span> no build output — this page ships as static HTML.`
          : tab.dataset.panelTab === "problems"
          ? `<span class="ok">✓ no problems have been detected in the workspace.</span>`
          : `<span class="dim">[terminal]</span> ready.`
      );
    });
  });

  el.termForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = el.termInput.value;
    el.termInput.value = "";
    runCommand(value);
  });

  document.addEventListener("keydown", (e) => {
    const mod = e.ctrlKey || e.metaKey;
    const key = e.key.toLowerCase();

    if (mod && e.shiftKey && key === "p") {
      e.preventDefault();
      el.overlay.hidden ? openPalette("commands") : closePalette();
      return;
    }
    if (mod && !e.shiftKey && key === "p") {
      e.preventDefault();
      openPalette("files");
      return;
    }
    if (mod && !e.shiftKey && key === "k") {
      e.preventDefault();
      openPalette("commands");
      return;
    }
    if (mod && key === "b") {
      e.preventDefault();
      toggleSidebar();
      return;
    }
    if (mod && (key === "`" || key === "j")) {
      e.preventDefault();
      togglePanel();
      return;
    }
    if (e.key === "Escape") {
      if (!el.overlay.hidden) closePalette();
      el.menuPop.hidden = true;
    }
  });

  // Cursor position in the status bar (decorative but honest)
  el.editor.addEventListener("mouseup", () => {
    const pos = $("#sb-pos");
    if (!pos) return;
    const lines = (el.editor.innerText || "").length;
    pos.textContent = `Ln ${Math.max(1, Math.round((el.editor.scrollTop / 22) + 1))}, Col ${(lines % 40) + 1}`;
  });

  /* ---------------------------------------------------------
     Clock + init
     --------------------------------------------------------- */
  function tick() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    el.clock.textContent = `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
  }
  tick();
  setInterval(tick, 1000);

  let savedTheme = "dark-plus";
  try {
    savedTheme = localStorage.getItem("ps-vscode-theme") || "dark-plus";
  } catch (e) {
    savedTheme = "dark-plus";
  }
  state.theme = THEMES.some((t) => t.id === savedTheme) ? savedTheme : "dark-plus";
  el.html.setAttribute("data-theme", state.theme);

  renderAll();
  termPrint(banner);
  termPrint(`<span class="dim">hint:</span> try <span class="ok">neofetch</span>, <span class="ok">theme dracula</span>, <span class="ok">open projects</span>`);

  // Deep links: ?file=projects or #projects
  const wanted = new URLSearchParams(location.search).get("file") || location.hash.replace("#", "");
  if (wanted && FILES[wanted]) openFile(wanted);
})();
