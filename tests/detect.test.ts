import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { detectStack } from '../src/detect.js';

describe('detectStack', () => {
  let tmp: string;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dossier-detect-'));
  });

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('defaults to typescript when no markers exist', () => {
    const r = detectStack(tmp);
    expect(r.languages).toContain('typescript');
    expect(r.frameworks).toEqual([]);
  });

  it('detects react from package.json dependencies', () => {
    fs.writeFileSync(
      path.join(tmp, 'package.json'),
      JSON.stringify({
        dependencies: { react: '^18.0.0' },
      }),
    );
    const r = detectStack(tmp);
    expect(r.languages).toContain('javascript');
    expect(r.frameworks).toContain('react');
  });

  it('detects typescript when typescript is a devDependency', () => {
    fs.writeFileSync(
      path.join(tmp, 'package.json'),
      JSON.stringify({
        devDependencies: { typescript: '^5.0.0' },
      }),
    );
    const r = detectStack(tmp);
    expect(r.languages).toContain('typescript');
  });

  it('detects python and django from pyproject.toml', () => {
    fs.writeFileSync(
      path.join(tmp, 'pyproject.toml'),
      '[project]\ndependencies = ["django>=4.2"]\n',
    );
    const r = detectStack(tmp);
    expect(r.languages).toContain('python');
    expect(r.frameworks).toContain('django');
  });
});
