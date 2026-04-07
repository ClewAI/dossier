# PostGraphile v4

- Prefer database constraints (FKs, checks, RLS) as the source of truth; expose GraphQL that reflects the schema honestly.
- Use plugins and `makeExtendSchemaPlugin` in the style the project already uses; avoid ad-hoc schema stitching.
- Respect row-level security policies when using PostgreSQL RLS with PostGraphile.
- Keep custom mutations and resolvers thin; push validation and invariants to the DB or shared services where appropriate.
- Version breaking GraphQL changes carefully; document client impact.
