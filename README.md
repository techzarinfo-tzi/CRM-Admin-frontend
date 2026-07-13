# CRM-admin frontend

React (Vite) + Tailwind CSS.

## Setup

1. Copy `.env.example` to `.env` (optional — dev server proxies `/api` to `http://localhost:5000` by default).
2. Install dependencies: `npm install`
3. Run dev server: `npm run dev` (http://localhost:5173)
4. Build for production: `npm run build`

## Structure

```
src/
├── api/          axios instance + endpoint calls
├── components/   reusable/shared components
├── context/      React context providers (e.g. auth)
├── hooks/        custom hooks
├── layouts/      page shells (e.g. dashboard layout with sidebar)
├── pages/        route-level components
└── utils/        helpers
```
