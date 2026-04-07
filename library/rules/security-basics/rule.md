# Security basics

- Never log or echo secrets, tokens, passwords, or raw session data.
- Validate and sanitize untrusted input at trust boundaries (HTTP params, headers, webhooks, file uploads).
- Use parameterized queries / ORM bindings; do not concatenate user input into SQL or shell commands.
- Prefer environment variables or a secrets manager for credentials; keep `.env` out of version control.
- Apply principle of least privilege for API keys, IAM roles, and database users.
- When adding auth, enforce checks server-side; do not rely on UI-only hiding of actions.
