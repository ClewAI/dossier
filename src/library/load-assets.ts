import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

const RuleMetaSchema = z.object({
  description: z.string(),
  globs: z.array(z.string()).default([]),
  alwaysApply: z.boolean().default(false),
});

export type RuleMeta = z.infer<typeof RuleMetaSchema>;

export function readRuleParts(
  libraryRoot: string,
  id: string,
): { meta: RuleMeta; body: string } {
  const base = path.join(libraryRoot, 'rules', id);
  const metaPath = path.join(base, 'meta.json');
  const rulePath = path.join(base, 'rule.md');
  let metaRaw: unknown;
  try {
    metaRaw = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Invalid rule meta for "${id}" at ${metaPath}: ${msg}`);
  }
  const meta = RuleMetaSchema.parse(metaRaw);
  const body = fs.readFileSync(rulePath, 'utf8');
  return { meta, body };
}

export function readSkillContent(libraryRoot: string, id: string): string {
  const p = path.join(libraryRoot, 'skills', id, 'SKILL.md');
  return fs.readFileSync(p, 'utf8');
}

export function ruleToMdc(meta: RuleMeta, body: string): string {
  const front: Record<string, string | boolean | string[]> = {
    description: meta.description,
    alwaysApply: meta.alwaysApply,
  };
  if (meta.globs.length > 0) {
    front.globs = meta.globs;
  }
  const yamlLines = Object.entries(front).map(([k, v]) => {
    if (typeof v === 'boolean') return `${k}: ${v}`;
    if (Array.isArray(v)) {
      const joined = v.join(',');
      return `${k}: "${joined.replace(/"/g, '\\"')}"`;
    }
    return `${k}: ${v}`;
  });
  return `---\n${yamlLines.join('\n')}\n---\n\n${body.trim()}\n`;
}
