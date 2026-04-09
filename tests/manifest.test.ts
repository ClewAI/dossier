import { describe, expect, it } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readManifest, resolveEntryIdsForDirectory } from '../src/library/manifest.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const libraryRoot = path.join(repoRoot, 'library');

describe('readManifest', () => {
  it('parses bundled manifest.json', () => {
    const m = readManifest(libraryRoot);
    expect(m.version).toBe(1);
    expect(m.entries['react-patterns']?.type).toBe('rule');
    expect(m.entries['repo-hygiene']?.tags.languages).toEqual([]);
  });
});

describe('resolveEntryIdsForDirectory', () => {
  const manifest = readManifest(libraryRoot);

  it('includes globals for any directory', () => {
    const { rules } = resolveEntryIdsForDirectory(manifest, {
      lang: 'python',
      frameworks: [],
      customRules: [],
      remoteSkills: [],
    });
    expect(rules).toContain('repo-hygiene');
    expect(rules).toContain('security-basics');
  });

  it('includes typescript rules for typescript projects', () => {
    const { rules } = resolveEntryIdsForDirectory(manifest, {
      lang: 'typescript',
      frameworks: [],
      customRules: [],
      remoteSkills: [],
    });
    expect(rules).toContain('typescript-strict');
  });

  it('includes react preset when framework is react', () => {
    const { rules } = resolveEntryIdsForDirectory(manifest, {
      lang: 'typescript',
      frameworks: ['react'],
      customRules: [],
      remoteSkills: [],
    });
    expect(rules).toContain('react-patterns');
  });

  it('does not attach react-only rule to plain python dir', () => {
    const { rules } = resolveEntryIdsForDirectory(manifest, {
      lang: 'python',
      frameworks: [],
      customRules: [],
      remoteSkills: [],
    });
    expect(rules).not.toContain('react-patterns');
  });
});
