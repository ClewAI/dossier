---
title: Supported Languages & Frameworks
description: Agents, languages, frameworks, and bundled library entries supported by dossier
published: true
public: true
date: 2026-04-02
tags:
dateCreated: 2026-04-02
order: 20
---

# Supported agents, languages, frameworks, and library

## Agent capabilities

Legend:

- **Supported** — `dossier` can emit configuration for this capability.
- **Not supported by `dossier`** — The tool does not generate this artifact type (yet).
- **Not supported by agent** — The vendor product does not offer this capability in a way `dossier` targets.

| | Cursor | Claude Code | Copilot |
| --- | --- | --- | --- |
| Skills | Not supported by agent | Supported | Not supported by agent |
| Hooks | Supported | Supported | Not supported by agent |
| Commands | Not supported by agent | Supported | Not supported by agent |
| Agent.md / AGENTS.md | Supported (via rules + root file) | Supported | Supported |

Root **`AGENTS.md`** is written on every `dossier generate` run for all agents, so every workflow gets a shared, repo-visible instruction file.

## Languages (config + detection)

These values can appear in `.dossier/config.json` and are used when matching library entries:

- **JavaScript**
- **TypeScript**
- **Python**

`dossier init` uses repository heuristics (for example `package.json`, `tsconfig.json`, `pyproject.toml`, `requirements.txt`) to suggest defaults.

## Frameworks (config schema)

Framework slugs in `config.json` align with the bundled manifest. The full set recognized by the schema includes:

- **postgraphile**
- **django**
- **react**
- **nextjs**
- **vue**
- **tailwind**
- **fastapi**
- **vitest**
- **jest**
- **eslint_prettier** (ESLint / Prettier toolchain)
- **docker**
- **ci_github_actions** (GitHub Actions CI)

Aliases during `init` include forms like `next`, `eslint`, `actions` → canonical ids.

## Bundled rules (by id)

Each rule id below has a `rule.md` (and `meta.json` where present) under `library/rules/<id>/`. Matching is driven by `manifest.json` tags (`languages` / `frameworks`).

| Rule id | Typical tags |
| --- | --- |
| `repo-hygiene` | Any project |
| `security-basics` | Any project |
| `testing-discipline` | Any project |
| `documentation` | Any project |
| `typescript-strict` | TypeScript |
| `javascript-modules` | JavaScript |
| `react-patterns` | React |
| `nextjs-app-router` | Next.js |
| `vue-composition` | Vue |
| `tailwind-conventions` | Tailwind |
| `python-modern` | Python |
| `fastapi-patterns` | FastAPI |
| `django-patterns` | Django |
| `postgraphile-v4` | PostGraphile |
| `vitest-testing` | Vitest |
| `jest-testing` | Jest |
| `eslint-prettier` | ESLint / Prettier |
| `docker-basics` | Docker |
| `github-actions-ci` | GitHub Actions |

## Bundled skills

For each rule id above, the library includes a companion **skill** entry (`*-skill`) under `library/skills/` with a `SKILL.md`. Claude Code can consume these; Cursor and Copilot do not use the skill format in the same way (see agent table).

## Using the library without the CLI

If you prefer not to add a dependency, you can copy or reference files directly from the repository’s [`library/`](../library/) folder. You lose `init` / `update` / `generate` automation and must wire rules into your agent by hand. See the main [README](../README.md) for a short note on this path.
