import fs from 'node:fs';
import path from 'node:path';
import type { Configuration } from '../config/schema.js';
import type { GenerateTarget } from '../constants.js';
import { resolveLibraryRoot } from '../paths.js';
import { generateCursor } from './cursor.js';
import { generateClaude } from './claude.js';
import { generateCopilot } from './copilot.js';
import { generateCodex } from './codex.js';
import { buildAgentsMd } from './agents-md.js';

export type { GenerateTarget } from '../constants.js';
export { GENERATE_TARGETS, isGenerateTarget } from '../constants.js';

export function generate(
  cwd: string,
  config: Configuration,
  target: GenerateTarget,
): void {
  const libraryRoot = resolveLibraryRoot(cwd);
  switch (target) {
    case 'cursor':
      generateCursor(cwd, config, libraryRoot);
      break;
    case 'claude':
      generateClaude(cwd, config, libraryRoot);
      break;
    case 'copilot':
      generateCopilot(cwd, config, libraryRoot);
      break;
    case 'codex':
      generateCodex(cwd, config, libraryRoot);
      break;
  }
  if (target !== 'codex') {
    fs.writeFileSync(
      path.join(cwd, 'AGENTS.md'),
      buildAgentsMd(config),
      'utf8',
    );
  }
}
