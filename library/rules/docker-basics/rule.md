# Docker

- Pin base image digests or stable tags per project policy; avoid `latest` in production paths.
- Minimize layers and image size; use multi-stage builds for compiled apps.
- Run containers as non-root when feasible; set explicit `USER` after install steps.
- Do not bake secrets into images; use build args and runtime env carefully—secrets belong in orchestrators or env injection.
- Health checks and explicit `EXPOSE` documentation help operators; align with compose services already defined.
