import fs from 'node:fs';
import path from 'node:path';
import { getConfigPath } from '../paths.js';
import {
  type Configuration,
  ConfigurationSchema,
  safeParseConfiguration,
} from './schema.js';
import { formatZodIssues } from './zod-format.js';

export function readConfiguration(cwd: string): Configuration {
  const configPath = getConfigPath(cwd);
  if (!fs.existsSync(configPath)) {
    throw new Error(
      `No dossier config found at ${configPath}. Run \`dossier init\` first.`,
    );
  }
  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (e) {
    throw new Error(
      `Invalid JSON in ${configPath}: ${e instanceof Error ? e.message : String(e)}`,
    );
  }
  const result = safeParseConfiguration(raw);
  if (!result.success) {
    throw new Error(
      `Invalid dossier config:\n${formatZodIssues(result.error.issues, { indent: '  - ' })}`,
    );
  }
  return result.data;
}

export function writeConfiguration(cwd: string, config: Configuration): void {
  const configPath = getConfigPath(cwd);
  const dir = path.dirname(configPath);
  fs.mkdirSync(dir, { recursive: true });
  const parsed = ConfigurationSchema.parse(config);
  fs.writeFileSync(
    configPath,
    `${JSON.stringify(parsed, null, 2)}\n`,
    'utf8',
  );
}

export function formatConfigurationErrors(raw: unknown): string {
  const result = safeParseConfiguration(raw);
  if (result.success) return '';
  return formatZodIssues(result.error.issues);
}
