import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  readConfiguration,
  writeConfiguration,
} from '../src/config/load.js';
import type { Configuration } from '../src/config/schema.js';

describe('readConfiguration / writeConfiguration', () => {
  let tmp: string;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dossier-cfg-'));
    fs.mkdirSync(path.join(tmp, '.dossier'), { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('throws when config is missing', () => {
    expect(() => readConfiguration(tmp)).toThrow(/No dossier config found/);
  });

  it('round-trips valid configuration', () => {
    const cfg: Configuration = {
      schemaVersion: 1,
      supportDocs: true,
      agents: ['CURSOR', 'CLAUDE_CODE'],
      directories: {
        '': {
          lang: 'typescript',
          frameworks: ['react'],
          customRules: ['Stay consistent with hooks.'],
          remoteSkills: [],
        },
      },
      customRules: [],
      hooks: [
        { command: '/bin/true', events: ['stop'], agents: ['CURSOR'] },
      ],
    };
    writeConfiguration(tmp, cfg);
    const read = readConfiguration(tmp);
    expect(read.agents).toEqual(cfg.agents);
    expect(read.directories[''].frameworks).toEqual(['react']);
    expect(read.hooks).toHaveLength(1);
  });

  it('throws on invalid JSON shape', () => {
    fs.writeFileSync(
      path.join(tmp, '.dossier', 'config.json'),
      JSON.stringify({ supportDocs: false }),
    );
    expect(() => readConfiguration(tmp)).toThrow(/Invalid dossier config/);
  });
});
