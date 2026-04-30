# Melaka Defense

Melaka Defense is a browser-based coding strategy game where players defend a fort from incoming ships by programming three cannons.

The project combines a playable battle simulation with a learning-focused programming surface:
- **Visual logic editor** with drag-and-drop blocks
- **Generated JavaScript** preview based on visual blocks
- **Real-time radar + combat** feedback loop for strategy iteration
- **Learning pages** (`/how-to-play` and `/learning-guide`) for onboarding

Main domain: [https://alifasraf.asia](https://alifasraf.asia)

## What This Repository Is For

This repository contains the full source code for:
- The game runtime (battlefield simulation, waves, scoring, artillery behavior)
- The War Room programming UI (visual blocks and generated code view)
- Documentation pages for gameplay and coding concepts
- SEO/runtime metadata (`robots.txt`, `sitemap.xml`, canonical metadata)

## Tech Stack

- **Next.js** (App Router)
- **React + TypeScript**
- **Tailwind CSS**
- **Monaco Editor** (read-only generated code panel)

## Local Development

Install dependencies and run:

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Key Routes

- `/` - Main playable game UI
- `/how-to-play` - Full gameplay and API-style guide
- `/learning-guide` - Code patterns and best practices

## Scripts

```bash
npm run dev
npm run build
npm run lint
```

## Contribution Notes

- Keep gameplay logic and visual-program code generation in sync.
- Prefer small, reviewable commits with clear scope.
- Validate with `npm run lint` and `npm run build` before pushing.
