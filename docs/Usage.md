---
title: Usage
description: CLI commands, configuration, and workflows for dossier
published: true
public: true
date: 2026-04-07
tags:
dateCreated: 2026-04-07
order: 15
---

# Usage

## Commands overview

| Command | Purpose |
| --- | --- |
| `dossier init` | Create `.dossier/config.json`, copy the bundled library into `.dossier/library/`, and optionally enable `docs/` maintenance in config |
| `dossier update` | Refresh `.dossier/library/` from the **installed** `dossier` package (rules/skills only; does not change your `config.json`) |
| `dossier generate <agent>` | Emit agent-specific files from `.dossier/config.json` + library; always refreshes root `AGENTS.md` |

Supported `<agent>` values: `cursor`, `claude`, `copilot` (case-insensitive).

## Global options

All subcommands accept:

- **`-C, --cwd <dir>`** — Run as if the project root were `<dir>` (defaults to the current working directory).

Examples:

```bash
dossier init --cwd /path/to/repo
dossier generate claude -C /path/to/monorepo/packages/api
```

## `dossier init` flow

1. If `.dossier/config.json` already exists, you are asked whether to overwrite it.
2. **Primary language** — `javascript`, `typescript`, or `python`. Defaults are inferred from the repo (e.g. `package.json` / `tsconfig.json`, or Python project files).
3. **Frameworks** — Comma-separated list (e.g. `nextjs`, `django`, `vitest`). You can accept detected defaults or edit the list. Names are normalized (aliases like `next` → `nextjs`).
4. **Agents** — Which agents you plan to use (`cursor`, `claude`, `copilot`). Stored as enums in config (`CURSOR`, `CLAUDE_CODE`, `GITHUB_COPILOT`).
5. **`docs/`** — Whether to set `supportDocs: true` so generated `AGENTS.md` reminds agents to keep `docs/` in sync when architecture changes.

After writing config, `init` syncs the bundled library into `.dossier/library/`. If neither Cursor nor Claude CLI is on `PATH`, a warning explains that deep repo scan was skipped and heuristics were used.

## `dossier update`

Run after upgrading the global (or linked) `dossier` package to pull newer rules and skills into `.dossier/library/`. Your `config.json` is untouched; re-run `dossier generate …` for each agent you use.

## `dossier generate`

Reads `.dossier/config.json`, resolves the library (project copy under `.dossier/library/` if present, otherwise the package’s bundled `library/`), and writes:

- **Cursor** — `.cursor/rules/*.mdc`, optional `.cursor/hooks.json`
- **Claude Code** — Claude-specific outputs (see [Architecture](./Architecture.md))
- **GitHub Copilot** — Copilot-specific outputs

Every successful `generate` run also writes **`AGENTS.md`** at the repository root: a short, agent-readable summary pointing at `.dossier/config.json` and embedding global/directory rules from config.

## Configuration (`.dossier/config.json`)

The file is validated against an internal schema. Important fields:

- **`schemaVersion`** — Config format version (currently `1`).
- **`supportDocs`** — When `true`, `AGENTS.md` includes guidance to maintain `docs/`.
- **`agents`** — Which agents you care about (used for presets and messaging; generation is explicit per `dossier generate` invocation).
- **`directories`** — Map of directory path → `{ lang, frameworks, customRules }`. The key `""` means the repository root. You can add more keys for monorepo packages later.
- **`customRules`** — Repository-wide extra instructions (strings or `{ rule, applyTo? }` objects).
- **`hooks`** — Hook definitions with normalized events (`after_file_edit`, `before_shell_execution`, etc.). Cursor and Claude Code can consume mapped hook configs; Copilot does not support dossier hooks today.

Invalid JSON or schema errors surface when you run `generate` (config is loaded at that point).

## Typical workflows

**New repo**

```bash
dossier init
dossier generate cursor
dossier generate claude
```

**After editing `.dossier/config.json`**

```bash
dossier generate cursor
```

**After upgrading the globally installed CLI** (for example `yarn global upgrade @clew-ai/dossier` or `npm install -g @clew-ai/dossier@latest`)

```bash
dossier update
dossier generate cursor
dossier generate claude
```

**Monorepo (multiple roots)** — Extend `directories` with paths like `"packages/api"` and set `lang` / `frameworks` per package; then regenerate.

## Programmatic use

The published package exports Zod schemas and types from its main entry (for example `Configuration`, `parseConfiguration`, `safeParseConfiguration`). Use this to validate or build config in your own tooling; the CLI remains the supported way to sync the library and generate agent files.
