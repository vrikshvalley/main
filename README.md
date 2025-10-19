# Next.js + Redux Toolkit Cart Starter (No TypeScript)

A minimal, production-ready starter using the **App Router**, **Redux Toolkit** for cart management, and **SCSS**.

## Features
- Next.js App Router (`app/`)
- Redux Toolkit + react-redux prewired
- Global SCSS styling
- Minimal demo: add to cart, increment/decrement, remove, clear
- Example API route at `/api/hello`

## Getting Started

```bash
# 1) Install deps
npm install

# 2) Run dev
npm run dev

# 3) Build & start
npm run build
npm start
```

## Where to put serverless backend files
Place them under `app/api/*/route.js` (e.g., `app/api/orders/route.js`). Each `route.js` is a serverless function when deployed (e.g., on Vercel).

## Notes
- This project intentionally uses JavaScript only (no TypeScript).
- For larger apps, consider moving from global SCSS to CSS Modules or a hybrid approach.
