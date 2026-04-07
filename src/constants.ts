/** CLI `generate` targets (aligned with README). */
export const GENERATE_TARGETS = ['cursor', 'claude', 'copilot'] as const;

export type GenerateTarget = (typeof GENERATE_TARGETS)[number];

export function isGenerateTarget(value: string): value is GenerateTarget {
  return (GENERATE_TARGETS as readonly string[]).includes(value);
}
