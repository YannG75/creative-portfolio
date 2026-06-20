# yanng.xyz — Portfolio

Personal portfolio of Yann Grillon, creative developer.  
Built with Astro, React, Three.js and Tailwind v4.

## Stack

- **Framework** — [Astro 6](https://astro.build) (static output)
- **3D** — [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) + Three.js
- **CSS** — Tailwind v4 via `@tailwindcss/vite`
- **Deployment** — Vercel

## Getting started

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Static output goes to `dist/`. Deploy the `dist/` folder to any static host.

## Project structure

```
src/
├── components/   # All UI components (.astro + .tsx)
├── data/         # Project data (projects.ts)
├── layouts/      # Layout with SEO meta
├── pages/        # index.astro (single page)
└── styles/       # Global CSS + design tokens
public/
├── images/       # OG image, favicons, project screenshots
└── models/       # fox.glb (3D model)
```
