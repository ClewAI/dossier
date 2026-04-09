import fs from 'node:fs';
import path from 'node:path';
import type { Configuration } from '../config/schema.js';
import {
  buildClaudeHooksBlock,
  type ClaudeHooksBlock,
} from '../hooks/mapping.js';
import { readManifest } from '../library/manifest.js';
import { collectAllSkillIds } from '../library/presets.js';
import { readSkillContentForGenerate } from '../library/load-assets.js';
import { isRootDirectoryKey, manifestIdToSafeFilename } from './shared.js';
import { customRuleToText, mergeInstructionBodies } from './merge-rules.js';

function mergeClaudeHooks(
  existing: ClaudeHooksBlock | undefined,
  generated: ClaudeHooksBlock,
): ClaudeHooksBlock {
  const out: ClaudeHooksBlock = { ...(existing ?? {}) };
  for (const [event, entries] of Object.entries(generated)) {
    out[event] = [...(out[event] ?? []), ...entries];
  }
  return out;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readClaudeSettingsFile(p: string): Record<string, unknown> {
  if (!fs.existsSync(p)) return {};
  try {
    const raw: unknown = JSON.parse(fs.readFileSync(p, 'utf8'));
    return isPlainObject(raw) ? { ...raw } : {};
  } catch {
    return {};
  }
}

function mergeHooksIntoClaudeSettings(
  existing: Record<string, unknown>,
  generated: ClaudeHooksBlock,
): Record<string, unknown> {
  const prevRaw = existing.hooks;
  const prevHooks = isPlainObject(prevRaw)
    ? (prevRaw as ClaudeHooksBlock)
    : undefined;
  return {
    ...existing,
    hooks: mergeClaudeHooks(prevHooks, generated),
  };
}

export function generateClaude(
  cwd: string,
  config: Configuration,
  libraryRoot: string,
): void {
  const manifest = readManifest(libraryRoot);
  const skillIds = collectAllSkillIds(manifest, config);

  const skillsRoot = path.join(cwd, '.claude', 'skills');
  fs.mkdirSync(skillsRoot, { recursive: true });

  for (const id of skillIds) {
    const content = readSkillContentForGenerate(cwd, libraryRoot, id);
    const dirName = manifestIdToSafeFilename(id);
    const skillDir = path.join(skillsRoot, dirName);
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(path.join(skillDir, 'SKILL.md'), content, 'utf8');
  }

  const customGlobal = config.customRules.map(customRuleToText);
  if (customGlobal.length > 0) {
    const skillDir = path.join(skillsRoot, 'dossier-custom-global');
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(
      path.join(skillDir, 'SKILL.md'),
      `---\nname: dossier-custom-global\ndescription: Repository-wide custom rules from dossier config\n---\n\n${mergeInstructionBodies(customGlobal)}\n`,
      'utf8',
    );
  }

  let d = 0;
  for (const [dirPath, dirConfig] of Object.entries(config.directories)) {
    const scoped = dirConfig.customRules.map(customRuleToText);
    if (scoped.length === 0) continue;
    const name = `dossier-custom-dir-${d++}`;
    const skillDir = path.join(skillsRoot, name);
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(
      path.join(skillDir, 'SKILL.md'),
      `---\nname: ${name}\ndescription: Custom rules for ${isRootDirectoryKey(dirPath) ? 'root' : dirPath}\n---\n\n${mergeInstructionBodies(scoped)}\n`,
      'utf8',
    );
  }

  if (config.hooks.length > 0) {
    const settingsPath = path.join(cwd, '.claude', 'settings.json');
    fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
    const existing = readClaudeSettingsFile(settingsPath);
    const generated = buildClaudeHooksBlock(config.hooks);
    const merged = mergeHooksIntoClaudeSettings(existing, generated);
    fs.writeFileSync(
      settingsPath,
      `${JSON.stringify(merged, null, 2)}\n`,
      'utf8',
    );
  }
}
