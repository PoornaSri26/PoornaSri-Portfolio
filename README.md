# Poorna Sri Nandyala — Portfolio

Static portfolio site (HTML/CSS + minimal JS). Optimized for GitHub Pages with SEO, Open Graph, and accessibility basics.

## Local preview

Open `index.html` in a browser, or:

```bash
npx --yes serve .
```

## Deploy to GitHub Pages

1. Create a repo named `portfolio` under [PoornaSri26](https://github.com/PoornaSri26).
2. Push this folder:

   ```bash
   cd portfolio
   git init
   git add .
   git commit -m "Add portfolio site"
   git branch -M main
   git remote add origin https://github.com/PoornaSri26/portfolio.git
   git push -u origin main
   ```

3. On GitHub: **Settings → Pages → Build and deployment → Deploy from branch → `main` / `/ (root)`**.
4. Site URL: `https://poornasri26.github.io/portfolio/`

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
