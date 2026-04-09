import { z } from 'zod';

export const AgentSchema = z.enum([
  'CURSOR',
  'CLAUDE_CODE',
  'GITHUB_COPILOT',
  'OPENAI_CODEX',
]);
export type Agent = z.infer<typeof AgentSchema>;

export const LanguageSchema = z.enum(['javascript', 'typescript', 'python']);
export type Language = z.infer<typeof LanguageSchema>;

export const FrameworkSchema = z.enum([
  'postgraphile',
  'django',
  'react',
  'nextjs',
  'vue',
  'tailwind',
  'fastapi',
  'vitest',
  'jest',
  'eslint_prettier',
  'docker',
  'ci_github_actions',
]);
export type Framework = z.infer<typeof FrameworkSchema>;

export const NormalizedHookEventSchema = z.enum([
  'after_file_edit',
  'before_shell_execution',
  'before_read_file',
  'before_mcp_execution',
  'before_submit_prompt',
  'stop',
]);
export type NormalizedHookEvent = z.infer<typeof NormalizedHookEventSchema>;

const CustomRuleObjectSchema = z.object({
  rule: z.string(),
  applyTo: z.string().optional(),
});

export const CustomRuleSchema = z.union([z.string(), CustomRuleObjectSchema]);
export type CustomRule = z.infer<typeof CustomRuleSchema>;

export const DirectoryConfigSchema = z.object({
  lang: LanguageSchema,
  frameworks: z.array(FrameworkSchema).default([]),
  customRules: z.array(CustomRuleSchema).default([]),
});
export type DirectoryConfig = z.infer<typeof DirectoryConfigSchema>;

export const HookAgentSchema = z.enum([
  'CURSOR',
  'CLAUDE_CODE',
  'OPENAI_CODEX',
]);

export const HookDefinitionSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  command: z.string(),
  events: z.array(NormalizedHookEventSchema).min(1),
  agents: z.array(HookAgentSchema).optional(),
});
export type HookDefinition = z.infer<typeof HookDefinitionSchema>;

export const ConfigurationSchema = z.object({
  schemaVersion: z.number().int().positive().default(1),
  supportDocs: z.boolean(),
  agents: z.array(AgentSchema).min(1),
  directories: z.record(z.string(), DirectoryConfigSchema),
  customRules: z.array(CustomRuleSchema).default([]),
  hooks: z.array(HookDefinitionSchema).default([]),
});
export type Configuration = z.infer<typeof ConfigurationSchema>;

export function parseConfiguration(raw: unknown): Configuration {
  return ConfigurationSchema.parse(raw);
}

export function safeParseConfiguration(raw: unknown) {
  return ConfigurationSchema.safeParse(raw);
}
