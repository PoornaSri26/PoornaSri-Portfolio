# Poorna Sri Nandyala — Portfolio

This repository contains two portfolio versions:

1. **Main Portfolio** (root) - Static HTML/CSS/JS site with interactive features
2. **VS Code Workspace** (`vscode/`) - a working VS Code clone (explorer, tabs, terminal, themes) in plain HTML/CSS/JS

The main portfolio has an **Open in VS Code** button that links to `vscode/`. Both versions are static, so they deploy together to GitHub Pages.

## Local preview

Open `index.html` in a browser, or:

```bash
npx --yes serve .
```

## Deploy to GitHub Pages

1. Create a repo named `PoornaSri-Portfolio` under [PoornaSri26](https://github.com/PoornaSri26).
2. Push this folder:

   ```bash
   cd PoornaSri-Portfolio
   git init
   git add .
   git commit -m "Add portfolio site"
   git branch -M main
   git remote add origin https://github.com/PoornaSri26/PoornaSri-Portfolio.git
   git push -u origin main
   ```

3. On GitHub: **Settings → Pages → Build and deployment → Deploy from branch → `main` / `/ (root)`**.
4. Site URL: `https://poornasri26.github.io/PoornaSri-Portfolio/`

## After you get a custom domain

Update these URLs in `index.html`, `sitemap.xml`, and `robots.txt`:

- `canonical`, `og:url`, `og:image`, `twitter:image`
- JSON-LD `url` field
- Sitemap `loc` entries

Replace `og-image.svg` with a **1200×630 PNG** for best LinkedIn/Twitter previews.

## Interactive features

- **Loader** + scroll progress bar
- **Three.js** wireframe hero background
- **GSAP** scroll reveals & stat counters
- **Living CV** — horizontal story timeline
- **Progressive disclosure** — sections unlock on scroll
- **Quest** — find 3 hidden signals to reveal a secret project
- **Arcade** — Snake mini-game (🎮 button)
- **AI co-pilot** — ask about projects, research, contact (✦ button)
- **Custom cursor** + magnetic buttons + card tilt (desktop)

## What's included

| File | Purpose |
|------|---------|
| `index.html` | Main site |
| `css/magic.css` | Interactive UI styles |
| `js/magic.js` | Animations, game, AI, 3D |
| `robots.txt` | Crawler rules + sitemap link |
| `sitemap.xml` | Search indexing |
| `og-image.svg` | Social share preview (upgrade to PNG recommended) |

## VS Code Workspace (`vscode/`)

A hand-built VS Code clone, personalised for this portfolio — no framework, no build step.

| File | Purpose |
|------|---------|
| `vscode/index.html` | Editor shell: title bar, activity bar, explorer, tabs, panel, status bar |
| `vscode/style.css` | Six themes and the full VS Code layout |
| `vscode/app.js` | File system, terminal, command palette, theme switching |

**What works**

- Explorer tree → opens files as tabs (Welcome.md, about.tsx, experience.tsx, projects.tsx, skills.json, research.md, contact.tsx, README.md)
- Preview / `</> Code` toggle on every file, with syntax highlighting
- Terminal commands: `help`, `about`, `projects`, `skills`, `research`, `contact`, `ls`, `cat <file>`, `open <file>`, `theme <name>`, `themes`, `neofetch`, `github`, `main`, `clear`
- Command palette (`Ctrl`/`Cmd` + `Shift` + `P`), quick open (`Ctrl` + `P`), search view
- Themes: Dark+, GitHub Dark, Dracula, One Dark Pro, Nord, Tokyo Night — remembered in the browser
- Deep links: `vscode/?file=projects` or `vscode/#projects`

**Local preview:** open `vscode/index.html` directly, or serve the repo root with `npx serve .`

The older `vscode-portfolio/` directory is an unfinished Next.js experiment and is not part of the deployed site.
