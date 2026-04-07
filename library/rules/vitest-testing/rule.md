# Vitest

- Use `describe` / `it` structure consistent with the repo; co-locate tests with source or use `__tests__` as the project does.
- Prefer `vi.mock` at module boundaries; reset mocks in `beforeEach` when tests leak state.
- Use `expect` matchers from Vitest; align snapshot usage with team norms.
- For DOM tests, follow existing Testing Library patterns (`screen`, `userEvent`).
- Run related projects via workspace scripts the README documents.
