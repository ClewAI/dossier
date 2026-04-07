# JavaScript (ESM/CJS)

- Follow the project's module system (ESM vs CommonJS); avoid mixing styles in one package without a documented pattern.
- Use `const` / `let`; avoid `var`.
- Prefer async functions and `try/catch` for asynchronous control flow.
- Add JSDoc types when the codebase does not use TypeScript but needs clarity on shapes.
- Keep side effects in explicit entry points, not scattered in deep imports.
