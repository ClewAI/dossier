# Django

- Follow the project's app boundaries; keep models, views, and URLs cohesive per app.
- Use the ORM with migrations for schema changes; avoid raw SQL unless justified and documented.
- Prefer class-based or function-based views consistently with existing code; do not mix styles arbitrarily.
- Validate input with forms / DRF serializers as the project does; never trust request data.
- Use `settings` and `django.conf` patterns; avoid hard-coded secrets.
- Query optimization: use `select_related` / `prefetch_related` where N+1 issues exist.
