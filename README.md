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
- `npm run build` — create a production build
- `npm run start` — serve the production build
- `npm run lint` — run ESLint
- `npm run typecheck` — run the TypeScript compiler
- `npm run format` — format files with Prettier
- `npm run format:check` — check formatting without writing changes

## Project Structure

- `src/app` — App Router pages, layout, and global styles
- `src/components` — layout chrome and UI primitives
- `src/config` — site, navigation, and content category config
- `src/lib` — shared utilities
- `src/types` — shared TypeScript types
- `content` — reserved MDX content tree (not populated yet)

## Development Philosophy

The project prioritizes simplicity, performance, accessibility, developer experience, a scalable content architecture, and a modern UX.
