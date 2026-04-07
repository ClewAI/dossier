# Python

- Target the Python version declared in `pyproject.toml` / CI; avoid features from newer runtimes without guards.
- Prefer type hints on public functions and complex internals; use `TypedDict`, `Protocol`, and `Literal` where they clarify contracts.
- Format with the project's formatter (Ruff, Black, etc.); match import order conventions.
- Use virtual environments or the project's documented tool (Poetry, uv, pip-tools).
- Prefer exceptions over error codes for internal APIs; use specific exception types.
- Keep modules small; avoid circular imports by extracting shared types/utilities.
