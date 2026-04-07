# Repository hygiene

- Prefer the smallest change that solves the task. Avoid drive-by refactors, renames, or formatting unrelated files.
- Match existing code style, patterns, and naming in the touched area.
- Use conventional commits when the project already does (`feat:`, `fix:`, `chore:`).
- PRs / change descriptions should state intent, scope, and how to verify (tests or manual steps).
- Do not commit secrets, `.env` values, or large generated artifacts unless the project explicitly requires them in-repo.
