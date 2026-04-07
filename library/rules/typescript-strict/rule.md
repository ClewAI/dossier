# TypeScript

- Prefer `strict` compiler options when the project already uses them; do not disable checks to silence errors without fixing root causes.
- Avoid `any`; use `unknown` and narrow, or define proper types / generics.
- Use discriminated unions and `satisfies` where they improve inference without widening.
- Keep public exports explicitly typed; avoid relying on implicit `any` from JS interop.
- Use `import type` for type-only imports when the project style guide does.
- Prefer `async`/`await` over raw `Promise` chains for readability.
