# Next.js (App Router)

- Mark client components with `'use client'` only where interactivity or browser APIs require it; keep server components default.
- Do not import server-only modules into client components; split boundaries clearly.
- Use `loading.tsx`, `error.tsx`, and route handlers (`route.ts`) following existing project layout.
- Prefer `fetch` caching defaults that match product needs; document when using `no-store` or `revalidate`.
- Use Next `Image`, `Link`, and metadata APIs consistent with the project's patterns.
- Environment variables: use `NEXT_PUBLIC_` only for truly client-safe values.
