/**
 * Public types and schemas for programmatic use.
 * @module
 */
export {
  AgentSchema,
  LanguageSchema,
  FrameworkSchema,
  NormalizedHookEventSchema,
  CustomRuleSchema,
  RemoteSkillsSourceSchema,
  DirectoryConfigSchema,
  HookDefinitionSchema,
  HookAgentSchema,
  ConfigurationSchema,
  parseConfiguration,
  safeParseConfiguration,
  type Agent,
  type Language,
  type Framework,
  type NormalizedHookEvent,
  type CustomRule,
  type RemoteSkillsSource,
  type DirectoryConfig,
  type HookDefinition,
  type Configuration,
} from './config/schema.js';
