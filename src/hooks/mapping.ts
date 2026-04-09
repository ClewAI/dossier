import type { HookDefinition, NormalizedHookEvent } from '../config/schema.js';

/** Cursor `hooks.json` keys (camelCase). */
export const CURSOR_HOOK_KEY: Record<NormalizedHookEvent, string> = {
  after_file_edit: 'afterFileEdit',
  before_shell_execution: 'beforeShellExecution',
  before_read_file: 'beforeReadFile',
  before_mcp_execution: 'beforeMCPExecution',
  before_submit_prompt: 'beforeSubmitPrompt',
  stop: 'stop',
};

/** Default Claude Code hook event + matcher per normalized event. */
export const CLAUDE_HOOK_DEFAULT: Record<
  NormalizedHookEvent,
  { event: string; matcher: string }
> = {
  after_file_edit: { event: 'PostToolUse', matcher: 'Edit|Write' },
  before_shell_execution: { event: 'PreToolUse', matcher: 'Bash' },
  before_read_file: { event: 'PreToolUse', matcher: 'Read' },
  before_mcp_execution: { event: 'PreToolUse', matcher: 'Mcp' },
  before_submit_prompt: { event: 'SessionStart', matcher: '' },
  stop: { event: 'Stop', matcher: '' },
};

/**
 * OpenAI Codex `hooks.json` events (see https://developers.openai.com/codex/hooks).
 * Omit `matcher` when Codex ignores it or when matching all occurrences.
 */
export const CODEX_HOOK_DEFAULT: Record<
  NormalizedHookEvent,
  { event: string; matcher?: string }
> = {
  after_file_edit: { event: 'PostToolUse', matcher: 'Edit|Write' },
  before_shell_execution: { event: 'PreToolUse', matcher: 'Bash' },
  before_read_file: { event: 'PreToolUse', matcher: 'Read' },
  before_mcp_execution: { event: 'PreToolUse', matcher: 'Mcp' },
  before_submit_prompt: { event: 'UserPromptSubmit' },
  stop: { event: 'Stop' },
};

export function hookAppliesToAgent(
  hook: HookDefinition,
  agent: 'CURSOR' | 'CLAUDE_CODE' | 'OPENAI_CODEX',
): boolean {
  if (!hook.agents?.length) return true;
  return hook.agents.includes(agent);
}

export type CursorHooksFile = {
  version: number;
  hooks: Record<string, Array<{ command: string }>>;
};

export function buildCursorHooksJson(hooks: HookDefinition[]): CursorHooksFile {
  const out: CursorHooksFile = { version: 1, hooks: {} };
  for (const def of hooks) {
    if (!hookAppliesToAgent(def, 'CURSOR')) continue;
    for (const ev of def.events) {
      const key = CURSOR_HOOK_KEY[ev];
      if (!out.hooks[key]) out.hooks[key] = [];
      out.hooks[key].push({ command: def.command });
    }
  }
  return out;
}

/** Claude nested hooks structure inside settings.json */
export type ClaudeHooksBlock = Record<
  string,
  Array<{
    matcher: string;
    hooks: Array<{ type: 'command'; command: string }>;
  }>
>;

export function buildClaudeHooksBlock(hooks: HookDefinition[]): ClaudeHooksBlock {
  const buckets: ClaudeHooksBlock = {};

  for (const def of hooks) {
    if (!hookAppliesToAgent(def, 'CLAUDE_CODE')) continue;
    for (const ev of def.events) {
      const { event, matcher } = CLAUDE_HOOK_DEFAULT[ev];
      if (!buckets[event]) buckets[event] = [];
      buckets[event].push({
        matcher,
        hooks: [{ type: 'command', command: def.command }],
      });
    }
  }

  return buckets;
}

/** One matcher group inside Codex `hooks.json` (`hooks` top-level key). */
export type CodexHookMatcherGroup = {
  matcher?: string;
  hooks: Array<{
    type: 'command';
    command: string;
    statusMessage?: string;
    timeout?: number;
  }>;
};

/** Inner `hooks` object for `.codex/hooks.json`. */
export type CodexHooksBlock = Record<string, CodexHookMatcherGroup[]>;

export type CodexHooksFile = {
  hooks: CodexHooksBlock;
};

export function buildCodexHooksBlock(hooks: HookDefinition[]): CodexHooksBlock {
  const buckets: CodexHooksBlock = {};

  for (const def of hooks) {
    if (!hookAppliesToAgent(def, 'OPENAI_CODEX')) continue;
    for (const ev of def.events) {
      const { event, matcher } = CODEX_HOOK_DEFAULT[ev];
      if (!buckets[event]) buckets[event] = [];
      const group: CodexHookMatcherGroup = {
        hooks: [{ type: 'command', command: def.command }],
      };
      if (matcher !== undefined && matcher !== '') {
        group.matcher = matcher;
      }
      buckets[event].push(group);
    }
  }

  return buckets;
}

export function buildCodexHooksJson(hooks: HookDefinition[]): CodexHooksFile {
  return { hooks: buildCodexHooksBlock(hooks) };
}

function mergeCodexHookGroups(
  existing: CodexHookMatcherGroup[] | undefined,
  generated: CodexHookMatcherGroup[],
): CodexHookMatcherGroup[] {
  return [...(existing ?? []), ...generated];
}

/** Merge generated Codex hook groups into an existing `hooks.json` payload (append per event). */
export function mergeCodexHooksIntoFile(
  existing: CodexHooksFile | undefined,
  generated: CodexHooksFile,
): CodexHooksFile {
  const out: CodexHooksBlock = { ...(existing?.hooks ?? {}) };
  for (const [event, groups] of Object.entries(generated.hooks)) {
    out[event] = mergeCodexHookGroups(out[event], groups);
  }
  return { hooks: out };
}
