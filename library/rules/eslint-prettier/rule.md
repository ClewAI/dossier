# ESLint / Prettier

- Do not disable rules broadly (`eslint-disable` files) without strong justification; prefer narrow disables with comments.
- Run the project's lint and format scripts after substantive edits.
- Match import ordering and unused-import rules already configured.
- Prefer Prettier for formatting; avoid manual formatting fights—fix config if rules conflict.
- Type-aware ESLint rules: ensure `parserOptions.project` paths remain valid when moving files.
