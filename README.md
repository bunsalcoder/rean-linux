# Rean Linux

A modern Linux learning platform. _Rean_ means "Learn" in Khmer.

## Project Goal

Rean Linux is intended to become a practical Linux learning platform from absolute beginner through advanced and expert topics. The long-term site will cover fundamentals, the terminal, administration, networking, DevOps, security, and real-world workflows. This repository currently contains the application foundation only.

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide React
- ESLint
- Prettier

## Getting Started

Requires Node.js 20.9 or later.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

- `npm run dev` — start the development server
- `npm run build` — create a static export in `out/`
- `npm run lint` — run ESLint
- `npm run typecheck` — generate Next.js route types, then run the TypeScript compiler
- `npm run format` — format files with Prettier
- `npm run format:check` — check formatting without writing changes

Preview a production export locally with `npx serve out`.

## Deploy

The site is a static Next.js export. GitHub Actions deploys `out/` to GitHub Pages on every push to `main`.

1. In the repository settings, open **Pages**.
2. Set **Source** to **GitHub Actions**.
3. Merge to `main`. The deploy workflow publishes the site to `https://bunsalcoder.github.io/rean-linux/`.

Pull requests and pushes to `main` or `develop` also run lint, typecheck, format, and build checks.

## Project Structure

- `src/app` — App Router pages, layout, and global styles
- `src/components` — layout chrome and UI primitives
- `src/config` — site, navigation, and content category config
- `src/lib` — shared utilities
- `src/types` — shared TypeScript types
- `content` — reserved MDX content tree (not populated yet)

## Development Philosophy

The project prioritizes simplicity, performance, accessibility, developer experience, a scalable content architecture, and a modern UX.
