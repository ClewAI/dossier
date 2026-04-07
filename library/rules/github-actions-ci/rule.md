# GitHub Actions

- Pin third-party actions to full commit SHAs when the project does; avoid floating `@v1` if supply-chain risk matters.
- Use least-privilege `GITHUB_TOKEN` scopes; explicit `permissions` blocks preferred.
- Cache dependencies using official or project-approved cache actions; avoid caching secrets.
- Matrix builds: keep dimension explosion under control; document required secrets in README.
- Use concurrency groups to cancel superseded runs when appropriate for the repo.
