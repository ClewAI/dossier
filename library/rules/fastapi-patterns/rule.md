# FastAPI

- Define request/response models with Pydantic v2 patterns (`model_config`, field validators) consistent with the codebase.
- Use dependency injection (`Depends`) for DB sessions, auth, and config; avoid hidden globals.
- Return correct status codes; use `HTTPException` for expected client errors.
- Document OpenAPI via route summaries and response models; keep tags stable.
- For async routes, ensure awaited I/O; avoid blocking calls in async def handlers.
- Lifespan hooks for startup/shutdown instead of deprecated `@app.on_event` when the project has migrated.
