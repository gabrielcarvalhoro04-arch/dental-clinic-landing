# Aurora — Dental Clinic Landing Page

**Live demo:** https://gabrielcarvalhoro04-arch.github.io/dental-clinic-landing/

A modern, single-page landing template for a dental clinic. Dark **and** ivory
themes in one build, elegant scroll motion, an accessible video lightbox and a
sticky-scroll "journey" section — all in **plain HTML, CSS and vanilla JS**.

- **No build step. No framework. No runtime dependencies.**
- Two themes (dark default / ivory) with a header toggle that remembers the choice
  and follows the OS preference until the visitor picks one.
- WCAG **AA** contrast in both themes, full keyboard support, semantic HTML, real meta tags + JSON-LD.
- Respects `prefers-reduced-motion` everywhere.
- Fonts: **Fraunces** + **Hanken Grotesk** (Google Fonts).

> The demo content (clinic name, address, phone, reviews, doctor) is **fictional**,
> for portfolio purposes only.

---

## Run it

Any static file server works — there is nothing to compile.

```bash
# from this folder
python -m http.server 4000
# then open http://localhost:4000
```

Or drag the folder into [Netlify Drop](https://app.netlify.com/drop) / deploy with
GitHub Pages, Vercel, Cloudflare Pages, etc.

---

## Structure

```
dental-clinic-landing/
├── index.html            # all markup + content
├── assets/
│   ├── css/styles.css     # design tokens + two themes + components
│   ├── js/main.js         # theme toggle, menu, reveals, counters, slider,
│   │                      # sticky-scroll, video lightbox, CTA particles
│   ├── img/
│   │   ├── hero-bg.svg     # abstract hero backdrop (swap for a photo/video)
│   │   └── about.svg       # abstract panel for the "A Clínica" section
│   └── video/             # optional: drop hero.mp4 here (see LEIA-ME.txt)
└── LICENSE
```

---

## Customize

| Want to change… | Where |
|---|---|
| Colors / spacing / type scale | CSS custom properties in `:root` and `:root[data-theme="light"]` at the top of `styles.css` |
| Default theme | Remove/keep the `data-theme` logic in the inline `<script>` in `<head>` |
| Text, links, sections | `index.html` |
| Phone / WhatsApp | search `5511999999999` and `+5511999999999` |
| Hero video | add `assets/video/hero.mp4` (10–20s, muted, loop) — it layers in automatically |
| Hero / about imagery | replace `assets/img/hero-bg.svg` and `assets/img/about.svg` with real photos and update the `src` |
| Map | update the `<iframe src>` in the "Localização" section |

---

## What's inside (components)

- **Theme system** — token-driven dark/ivory, toggled via `data-theme` on `<html>`.
- **Sticky-scroll journey** — pinned panel that swaps as steps scroll past (vanilla `IntersectionObserver`, no library).
- **Video lightbox** — click a `[data-video-dialog]` element with `data-video-src`; opens an accessible modal (`Esc` / backdrop / button to close, focus trap, returns focus). Supports local files and YouTube/Vimeo embeds.
- **Micro-interactions** — section dividers that draw in, staggered section headers, list rows that light up gold on hover, growing underlines on prose links.
- **Golden particles** — soft drifting light in the final CTA section (CSS + a tiny generator, disabled under reduced motion).
- **Number counters, accessible testimonial carousel, mobile slide-in nav.**

---

## Design principles this template follows

1. **A point of view.** One committed direction (editorial, warm, restrained), executed consistently — not a generic template look.
2. **Typography that works.** A display serif + a grotesque body, sized on a real scale; weight and spacing carry the hierarchy.
3. **A restrained palette.** Four roles per theme (surface, text, muted, gold accent). No rainbow.
4. **Hierarchy that breathes.** Generous spacing, controlled measure, clear primary/secondary/tertiary.
5. **Motion that whispers.** Transform/opacity only, short and purposeful, always `prefers-reduced-motion`-safe.
6. **Mobile designed, not shrunk.** The nav, stats, lists and sticky section make their own decisions on small screens.
7. **The invisible stuff.** Fast first paint, AA contrast, keyboard nav, semantic landmarks, OG tags + JSON-LD.

---

## License

MIT — see [`LICENSE`](LICENSE).
