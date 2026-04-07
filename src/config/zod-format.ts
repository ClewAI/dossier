import type { ZodIssue } from 'zod';

export function formatZodIssues(
  issues: ZodIssue[],
  options: { indent?: string } = {},
): string {
  const { indent = '' } = options;
  return issues
    .map((i) => `${indent}${i.path.join('.') || '(root)'}: ${i.message}`)
    .join('\n');
}
