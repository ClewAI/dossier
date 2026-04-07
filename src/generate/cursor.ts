import fs from 'node:fs';
import path from 'node:path';
import type { Configuration } from '../config/schema.js';
import { buildCursorHooksJson } from '../hooks/mapping.js';
import { readManifest } from '../library/manifest.js';
import { collectRuleIds } from '../library/presets.js';
import { readRuleParts, ruleToMdc } from '../library/load-assets.js';
import {
  cursorGlobsForDirectory,
  isRootDirectoryKey,
  manifestIdToSafeFilename,
} from './shared.js';
import { customRuleToText, mergeInstructionBodies } from './merge-rules.js';

export function generateCursor(
  cwd: string,
  config: Configuration,
  libraryRoot: string,
): void {
  const manifest = readManifest(libraryRoot);
  const ruleIds = collectRuleIds(manifest, config);

  const rulesDir = path.join(cwd, '.cursor', 'rules');
  fs.mkdirSync(rulesDir, { recursive: true });

  for (const id of ruleIds) {
    const { meta, body } = readRuleParts(libraryRoot, id);
    const mdc = ruleToMdc(meta, body);
    const fileSafe = manifestIdToSafeFilename(id);
    fs.writeFileSync(path.join(rulesDir, `${fileSafe}.mdc`), mdc, 'utf8');
  }

  const customGlobal = config.customRules.map(customRuleToText);
  if (customGlobal.length > 0) {
    const body = mergeInstructionBodies(customGlobal);
    fs.writeFileSync(
      path.join(rulesDir, 'dossier-custom-global.mdc'),
      `---\ndescription: Repository-wide custom rules from dossier config\nalwaysApply: true\n---\n\n${body}\n`,
      'utf8',
    );
  }

  let idx = 0;
  for (const [dirPath, dirConfig] of Object.entries(config.directories)) {
    const scoped = dirConfig.customRules.map(customRuleToText);
    if (scoped.length === 0) continue;
    const globs = cursorGlobsForDirectory(dirPath);
    const body = mergeInstructionBodies(scoped);
    const name = `dossier-custom-dir-${idx++}`;
    const label = isRootDirectoryKey(dirPath) ? 'root' : dirPath;
    fs.writeFileSync(
      path.join(rulesDir, `${name}.mdc`),
      `---\ndescription: Custom rules for ${label}\nalwaysApply: false\nglobs: ${globs.join(',')}\n---\n\n${body}\n`,
      'utf8',
    );
  }

  if (config.hooks.length > 0) {
    const hooksPath = path.join(cwd, '.cursor', 'hooks.json');
    fs.mkdirSync(path.dirname(hooksPath), { recursive: true });
    fs.writeFileSync(
      hooksPath,
      `${JSON.stringify(buildCursorHooksJson(config.hooks), null, 2)}\n`,
      'utf8',
    );
  }
}
