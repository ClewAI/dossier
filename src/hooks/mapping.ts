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

export function hookAppliesToAgent(
  hook: HookDefinition,
  agent: 'CURSOR' | 'CLAUDE_CODE',
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
