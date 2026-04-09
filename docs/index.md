---
title: dossier - coding agent utility
description: Configure and sync the setup of your different coding agents
published: true
public: true
date: 2026-04-02
tags:
dateCreated: 2026-04-02
order: 0
---


# `dossier`

## What is `dossier`?

`dossier` is a CLI utility that helps you set up your repository for different coding agents. It serves two purposes:

1. **Guided setup** — Walks you through language, frameworks, and which agents to enable. That is especially useful if you are new to coding agents or want to try one you have not configured yet.

2. **Single source of truth** — Writes an agent-agnostic layer under `.dossier/` (mainly `config.json` and a synced copy of the bundled rule/skill library). From that, you run `dossier generate` to emit Cursor, Claude Code, and GitHub Copilot–specific files so you do not have to maintain the same guidance in three places by hand. (You do add one more project directory — `.dossier/` — in exchange.)

`dossier` is free and open source. You are welcome to contribute or explore the [repository on GitHub](https://github.com/clew-ai/dossier).

## Documentation

| Topic | Description |
| --- | --- |
| [Installation](./Installation.md) | Install with Yarn or run from source |
| [Usage](./Usage.md) | Commands, configuration, and day-to-day workflows |
| [Architecture](./Architecture.md) | How `.dossier`, the library, and generators fit together |
| [Supported agents, languages & frameworks](./Supported.md) | Feature matrix and bundled library coverage |
| [Publishing](./Publishing.md) | npmjs.com release flow, CI, and secrets |

## Quick start

```bash
yarn global add @clew-ai/dossier
cd /path/to/your/repo
dossier init
dossier generate cursor
```

After `init`, edit `.dossier/config.json` if you need extra `customRules`, `hooks`, or more `directories`. Run `dossier generate <agent>` whenever the config or library changes.

## Requirements

- **Node.js** 20 or newer (see `engines` in the package).
- For the richest **stack hints** during `init`, either the **Cursor** or **Claude** CLI on `PATH` is recommended; without them, `dossier` still works using file-based heuristics (`package.json`, Python markers, etc.).
