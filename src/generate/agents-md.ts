import type { Configuration } from '../config/schema.js';
import { isRootDirectoryKey } from './shared.js';
import { customRuleToText, mergeInstructionBodies } from './merge-rules.js';

export function buildAgentsMd(config: Configuration): string {
  const sections: string[] = [];

  sections.push(`# Agent instructions\n`);
  sections.push(
    `This repository uses [dossier](https://www.npmjs.com/package/@clew-ai/dossier) for AI-agent configuration. Source of truth: \`.dossier/config.json\`.\n`,
  );

  if (config.supportDocs) {
    sections.push(
      `Maintain relevant documentation under \`docs/\` when behavior or architecture changes.\n`,
    );
  }

  const globalRules = config.customRules.map(customRuleToText);
  if (globalRules.length > 0) {
    sections.push(`## Repository-wide rules\n`);
    sections.push(mergeInstructionBodies(globalRules));
  }

  const dirEntries = Object.entries(config.directories);
  if (dirEntries.length > 0) {
    sections.push(`\n## Directory-specific context\n`);
    for (const [dirPath, dir] of dirEntries) {
      const label = isRootDirectoryKey(dirPath) ? 'root' : `\`${dirPath}\``;
      sections.push(`\n### ${label}\n`);
      sections.push(`- Language: ${dir.lang}`);
      if (dir.frameworks.length > 0) {
        sections.push(`- Frameworks: ${dir.frameworks.join(', ')}`);
      }
      if (dir.customRules.length > 0) {
        sections.push(
          mergeInstructionBodies(dir.customRules.map(customRuleToText)),
        );
      }
    }
  }

  return `${sections.join('\n')}\n`;
}
