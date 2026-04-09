import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { writeConfiguration } from '../src/config/load.js';
import { generate } from '../src/generate/index.js';
import type { Configuration } from '../src/config/schema.js';

describe('generate', () => {
  let tmp: string;

  const baseConfig: Configuration = {
    schemaVersion: 1,
    supportDocs: false,
    agents: ['CURSOR'],
    directories: {
      '': {
        lang: 'typescript',
        frameworks: ['react'],
        customRules: [{ rule: 'Prefer hooks over HOCs.', applyTo: '*.tsx' }],
      },
    },
    customRules: ['One custom global note.'],
    hooks: [{ command: '/bin/true', events: ['after_file_edit'] }],
  };

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dossier-gen-'));
  });

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('writes Cursor rules, hooks, and AGENTS.md', () => {
    writeConfiguration(tmp, baseConfig);
    generate(tmp, baseConfig, 'cursor');

    const rulesDir = path.join(tmp, '.cursor', 'rules');
    expect(fs.existsSync(path.join(rulesDir, 'react-patterns.mdc'))).toBe(true);
    expect(fs.existsSync(path.join(rulesDir, 'dossier-custom-global.mdc'))).toBe(
      true,
    );
    const hooksPath = path.join(tmp, '.cursor', 'hooks.json');
    expect(fs.existsSync(hooksPath)).toBe(true);
    const hooks = JSON.parse(fs.readFileSync(hooksPath, 'utf8')) as {
      hooks: { afterFileEdit: { command: string }[] };
    };
    expect(hooks.hooks.afterFileEdit[0].command).toBe('/bin/true');
    expect(fs.readFileSync(path.join(tmp, 'AGENTS.md'), 'utf8')).toContain(
      'One custom global note.',
    );
  });

  it('writes Claude skills and merges hooks into settings.json', () => {
    writeConfiguration(tmp, baseConfig);
    generate(tmp, baseConfig, 'claude');

    expect(
      fs.existsSync(
        path.join(tmp, '.claude', 'skills', 'react-patterns-skill', 'SKILL.md'),
      ),
    ).toBe(true);
    const settingsPath = path.join(tmp, '.claude', 'settings.json');
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8')) as {
      hooks: { PostToolUse?: unknown[] };
    };
    expect(settings.hooks.PostToolUse?.length).toBeGreaterThan(0);
  });

  it('writes Copilot instructions without hooks files', () => {
    writeConfiguration(tmp, baseConfig);
    generate(tmp, baseConfig, 'copilot');

    expect(
      fs.existsSync(path.join(tmp, '.github', 'copilot-instructions.md')),
    ).toBe(true);
    expect(fs.existsSync(path.join(tmp, '.cursor', 'hooks.json'))).toBe(false);
  });

  it('writes Codex-oriented AGENTS.md with library rules and skips default thin AGENTS overwrite', () => {
    writeConfiguration(tmp, baseConfig);
    generate(tmp, baseConfig, 'codex');

    const agentsMd = fs.readFileSync(path.join(tmp, 'AGENTS.md'), 'utf8');
    expect(agentsMd).toContain('Bundled library rules');
    expect(agentsMd).toContain('React components, hooks, and accessibility');
    expect(agentsMd).toContain('One custom global note.');
    expect(fs.existsSync(path.join(tmp, '.github', 'copilot-instructions.md'))).toBe(
      false,
    );
  });

  it('writes Codex .agents/skills and .codex/hooks.json when hooks apply', () => {
    writeConfiguration(tmp, baseConfig);
    generate(tmp, baseConfig, 'codex');

    expect(
      fs.existsSync(
        path.join(tmp, '.agents', 'skills', 'react-patterns-skill', 'SKILL.md'),
      ),
    ).toBe(true);
    const hooksPath = path.join(tmp, '.codex', 'hooks.json');
    expect(fs.existsSync(hooksPath)).toBe(true);
    const hooks = JSON.parse(fs.readFileSync(hooksPath, 'utf8')) as {
      hooks: { PostToolUse?: { matcher: string; hooks: unknown[] }[] };
    };
    expect(hooks.hooks.PostToolUse?.[0].matcher).toBe('Edit|Write');
  });
});
