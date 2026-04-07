import type { CustomRule } from '../config/schema.js';

export function customRuleToText(rule: CustomRule): string {
  if (typeof rule === 'string') return rule.trim();
  const head = rule.applyTo
    ? `<!-- applyTo: ${rule.applyTo} -->\n`
    : '';
  return `${head}${rule.rule.trim()}`;
}

export function mergeInstructionBodies(parts: string[]): string {
  return parts
    .filter(Boolean)
    .map((p) => p.trim())
    .join('\n\n---\n\n');
}
