#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { Command } from 'commander';
import { isGenerateTarget } from './constants.js';
import { readConfiguration } from './config/load.js';
import { generate } from './generate/index.js';
import { runInit } from './init.js';
import { getPackageRoot } from './paths.js';
import { syncBundledLibrary } from './update-lib.js';

function isPackageJsonWithVersion(v: unknown): v is { version: string } {
  return (
    typeof v === 'object' &&
    v !== null &&
    'version' in v &&
    typeof (v as { version: unknown }).version === 'string'
  );
}

function readPackageVersion(): string {
  try {
    const pkgPath = path.join(getPackageRoot(), 'package.json');
    const raw: unknown = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    if (isPackageJsonWithVersion(raw)) return raw.version;
  } catch {
    /* use fallback below */
  }
  return '0.0.0';
}

const program = new Command();

program
  .name('dossier')
  .description('Make your repository AI-ready with agent-agnostic .dossier config')
  .version(readPackageVersion());

program
  .command('init')
  .description('Create .dossier/config.json and sync the bundled library')
  .option('-C, --cwd <dir>', 'Working directory', process.cwd())
  .action(async (opts: { cwd: string }) => {
    const cwd = path.resolve(opts.cwd);
    await runInit(cwd);
  });

program
  .command('update')
  .description('Refresh .dossier/library from the installed dossier package')
  .option('-C, --cwd <dir>', 'Working directory', process.cwd())
  .action((opts: { cwd: string }) => {
    const cwd = path.resolve(opts.cwd);
    syncBundledLibrary(cwd);
    console.log(`Updated ${path.join(cwd, '.dossier', 'library')}`);
  });

program
  .command('generate')
  .description('Generate agent-specific config from .dossier/config.json')
  .argument('<agent>', 'cursor | claude | copilot')
  .option('-C, --cwd <dir>', 'Working directory', process.cwd())
  .action((agent: string, opts: { cwd: string }) => {
    const cwd = path.resolve(opts.cwd);
    const a = agent.toLowerCase();
    if (!isGenerateTarget(a)) {
      console.error('Agent must be one of: cursor, claude, copilot');
      process.exitCode = 1;
      return;
    }
    const config = readConfiguration(cwd);
    generate(cwd, config, a);
    console.log(`Generated ${a} outputs in ${cwd}`);
  });

program.parse();
