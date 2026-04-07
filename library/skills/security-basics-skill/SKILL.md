---
name: security-basics-skill
description: Apply baseline secure coding habits (secrets, injection, validation)
---

# Security basics skill

Before implementing features that touch auth, payments, webhooks, or user data:

- Confirm secrets are not hard-coded and not logged.
- Use safe query/command construction and validate external input.
- Prefer server-side authorization checks.

Use when the user adds endpoints, parses external payloads, or handles credentials.
