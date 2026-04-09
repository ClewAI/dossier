---
title: Installation
description: Install dossier CLI
published: true
public: true
date: 2026-04-02
tags:
dateCreated: 2026-04-02
order: 10
---

# Installation

## With Yarn (recommended)

Install globally so the `dossier` command is available everywhere:

```bash
yarn global add @clew-ai/dossier
```

Check the version:

```bash
dossier --version
```

## With npm

If you do not use Yarn:

```bash
npm install -g @clew-ai/dossier
```

## From source

Use this when you are developing `dossier` or want the latest commit without publishing.

1. **Clone the repository**

```bash
git clone https://github.com/clew-ai/dossier.git
cd dossier
```

2. **Install dependencies**

```bash
yarn install
```

3. **Build**

```bash
yarn build
```

4. **Run or link**

- One-off run from the repo:

```bash
yarn dev -- --help
```

- Or link globally from the clone:

```bash
yarn link
```

After linking, `dossier` behaves like a global install from the registry.

## Verify installation

From any project directory:

```bash
dossier init
```

If the CLI is on your `PATH` and Node meets the version requirement, you should be prompted for language, frameworks, and agents. See [Usage](./Usage.md) for what happens next.
