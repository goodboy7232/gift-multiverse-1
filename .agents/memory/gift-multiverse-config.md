---
name: Gift Multiverse Config
description: Key setup decisions for the Gift Multiverse app (Vite proxy, auth.tsx, API rebuild, seed)
---

# Gift Multiverse Configuration Notes

## Vite Proxy for API
The frontend (port 23464) proxies `/api/*` to the API server (port 8080) via `vite.config.ts` `server.proxy`. Without this, all API calls 404.
**Why:** Frontend and API run on different ports; Vite proxy avoids CORS and routes correctly.
**How to apply:** Any new frontend artifact calling the same API needs the same proxy block.

## JSX in .ts files crashes esbuild
`auth.ts` used JSX (`<>...</>`) with a `.ts` extension — esbuild rejects this. Rename to `.tsx`.
**Why:** esbuild only parses JSX in `.tsx`/`.jsx` files.
**How to apply:** Any utility file returning JSX must use `.tsx` extension.

## API server requires workflow restart to rebuild
The API server dev script runs `build && start` — it builds once at startup. New route files added after the initial start won't be served until the workflow is restarted.
**Why:** The server runs from `dist/index.mjs`, not source files directly.
**How to apply:** After modifying API routes, always restart the `artifacts/api-server: API Server` workflow.

## Seed command
Run `node scripts/seed.mjs` from workspace root (not from scripts/ dir). Requires `pg` and `bcryptjs` in `scripts/` package.
Seeded data: admin and demo users (see seed script for credentials), 6 categories, 36 subcategories, 101 gift cards, 8 blog posts.

## Auth token storage
Frontend stores JWT in localStorage key `gm_token`. The `setAuthTokenGetter` call in main.tsx wires this to the api-client-react customFetch so every API call automatically includes `Authorization: Bearer <token>`.
