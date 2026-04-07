---
name: testing-discipline-skill
description: Choose appropriate test levels and keep tests deterministic
---

# Testing discipline skill

When adding or changing tests:

1. Pick the lowest level that gives confidence (unit vs integration).
2. Avoid sleeps, real network, and wall-clock assumptions unless necessary.
3. Add regression coverage when fixing bugs.

Use when the user asks to "add tests", fix CI, or reduce flakiness.
