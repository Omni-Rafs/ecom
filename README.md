# AURA — Gear From The Future

A dark, futuristic ecommerce concept storefront built with **vanilla HTML/CSS/JS** and a **Three.js** animated hero. No build step, no framework, no binary assets — clone it and open `index.html`.

## Features

### 3D & animation
- **Three.js hero scene** — 2,600 glowing particles orbiting a rotating wireframe torus knot + icosahedron, with mouse-parallax camera drift (loaded from CDN at runtime, `unpkg` with `jsdelivr` fallback)
- **2D canvas fallback** — if Three.js can't load (offline / CDN blocked), the hero automatically switches to an animated particle-constellation canvas
- Animated preloader, staggered hero title reveal, gradient text
- Custom cursor with trailing, morphing ring
- Magnetic buttons, 3D tilt-on-hover product cards
- "Fly to cart" animation when adding products
- Scroll-triggered section reveals, animated stat counters, parallax flagship image, infinite marquee
- Respects `prefers-reduced-motion`

### Store
- 4 products with embedded WebP photography (data URIs — zero image files)
- Working cart: slide-in drawer, quantity controls, live totals, badge bump, toast notifications
- Reviews, feature grid, newsletter form, responsive down to phone widths

## Project structure

```
.
├── index.html               # markup only
├── css/
│   └── style.css            # all styles + responsive & reduced-motion rules
└── js/
    ├── assets.js            # image registry (AURA_IMG)
    ├── assets-headphones.js # product imagery as WebP data URIs
    ├── assets-watch.js
    ├── assets-speaker.js
    ├── assets-earbuds.js
    ├── main.js              # products, cart, tilt, cursor, reveals, counters
    └── hero3d.js            # Three.js hero scene + 2D canvas fallback
```

## Running locally

Just open `index.html` in a browser — no server or install required.

```bash
git clone https://github.com/Omni-Rafs/ecom.git
cd ecom
open index.html   # or double-click it
```

> The Three.js scene loads from a CDN, so the full 3D hero needs an internet connection. Offline you'll get the 2D particle fallback.

## Deploying

Works as-is on GitHub Pages, Netlify, Vercel or any static host. For GitHub Pages: **Settings → Pages → Deploy from branch → `main` / root**.
