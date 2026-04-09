# `dossier`

`dossier` is a CLI utility that helps you with setting up your repository for different coding agents. It does serve two functions: first, it will help you setup the different components that you need to get the most out of your coding agent. This is especially helpful if you haven't used a coding agent before if you want to explore a new one that you haven't configured yet. Second, `dossier` creates a agent-agnostic layer (placed in the `.dossier/` directory) from which the configuration for the different agents can be created. This means that you don't have to update the rules for Cursor, Claude Code and Copilot yourself (we admit, you have to add yet another AI-agent directory, sorry for that).

## Installation

```bash
yarn global add @clew-ai/dossier
```

You can also install globally with npm: `npm install -g @clew-ai/dossier`.

## Usage

For creating the initial setup, use the `init` command. You need to have either Cursor CLI or Claude Code CLI installed as it will use those to search the repository and create the setup. This will also ask you for what agent you want the setup to generate, you can always generate it for additional agents later.

```bash
dossier init
```

To update rules and skills with the latest version shipped in `dossier`, simply run

```bash
dossier update
```

To generate the setup for another agent, use the following command:

```bash
dossier generate copilot
```

## Supported agents & features

✅ Supported
❌ Not supported by `dossier`
✖️ Not support by agent

|          | Cursor | Claude Code | Copilot |
| ---      | ---    | ---         | ---     |
| Skills   | ✖️     | ✅          | ✖️      |
| Hooks    | ✅     | ✅          | ✖️      |
| Commands | ✖️     | ✅          | ✖️      |
| Agent.md | ✅     | ✅          | ✅      |

## Library

If you are not interested in adding another dependency, already know which agent you will stick with, have no need for the update functionality or only have small project, you might be interested in browsing the [`library/`](./library/) directory. It contains rules and skills for various languages and scenarios.

## Publishing

Maintainers: releases are published to [npmjs.com](https://www.npmjs.com/package/@clew-ai/dossier) via GitHub Actions when a **GitHub Release** is published. Local checks use `yarn ci`. Full steps, `NPM_TOKEN` setup, tarball contents, and manual fallback are documented in [`docs/Publishing.md`](./docs/Publishing.md).

## About Us (small advertisement)

At [ClewAI](https://www.clew-ai.eu), we want to simplify the development lifecycle and rethink it in the age of AI. We unify coding agents, story tracking, documentation and support into a single software. This single source of truth allows full context for the AI and eliminates the need for unstable integrations between IDE, planning software, support platform and (in most cases outdated) documentation.
