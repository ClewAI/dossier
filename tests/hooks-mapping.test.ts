import { describe, expect, it } from 'vitest';
import type { HookDefinition } from '../src/config/schema.js';
import {
  buildClaudeHooksBlock,
  buildCodexHooksJson,
  buildCursorHooksJson,
  hookAppliesToAgent,
} from '../src/hooks/mapping.js';

describe('hookAppliesToAgent', () => {
  it('applies to all hook-capable agents when agents omitted', () => {
    const h: HookDefinition = {
      command: 'x',
      events: ['stop'],
    };
    expect(hookAppliesToAgent(h, 'CURSOR')).toBe(true);
    expect(hookAppliesToAgent(h, 'CLAUDE_CODE')).toBe(true);
    expect(hookAppliesToAgent(h, 'OPENAI_CODEX')).toBe(true);
  });

  it('respects agents filter', () => {
    const h: HookDefinition = {
      command: 'x',
      events: ['after_file_edit'],
      agents: ['CURSOR'],
    };
    expect(hookAppliesToAgent(h, 'CURSOR')).toBe(true);
    expect(hookAppliesToAgent(h, 'CLAUDE_CODE')).toBe(false);
    expect(hookAppliesToAgent(h, 'OPENAI_CODEX')).toBe(false);
  });
});

describe('buildCursorHooksJson', () => {
  it('maps after_file_edit to afterFileEdit', () => {
    const out = buildCursorHooksJson([
      { command: '/bin/echo', events: ['after_file_edit'] },
    ]);
    expect(out.version).toBe(1);
    expect(out.hooks.afterFileEdit).toEqual([{ command: '/bin/echo' }]);
  });

  it('skips hooks not for Cursor', () => {
    const out = buildCursorHooksJson([
      {
        command: 'claude-only',
        events: ['stop'],
        agents: ['CLAUDE_CODE'],
      },
    ]);
    expect(out.hooks).toEqual({});
  });
});

describe('buildClaudeHooksBlock', () => {
  it('uses PostToolUse with Edit|Write for after_file_edit', () => {
    const out = buildClaudeHooksBlock([
      { command: 'fmt', events: ['after_file_edit'] },
    ]);
    expect(out.PostToolUse).toEqual([
      {
        matcher: 'Edit|Write',
        hooks: [{ type: 'command', command: 'fmt' }],
      },
    ]);
  });

  it('skips hooks not for Claude', () => {
    const out = buildClaudeHooksBlock([
      {
        command: 'cursor-only',
        events: ['stop'],
        agents: ['CURSOR'],
      },
    ]);
    expect(out).toEqual({});
  });
});

describe('buildCodexHooksJson', () => {
  it('maps after_file_edit to PostToolUse with Edit|Write matcher', () => {
    const out = buildCodexHooksJson([
      { command: '/bin/echo', events: ['after_file_edit'] },
    ]);
    expect(out.hooks.PostToolUse).toEqual([
      {
        matcher: 'Edit|Write',
        hooks: [{ type: 'command', command: '/bin/echo' }],
      },
    ]);
  });

  it('maps before_submit_prompt to UserPromptSubmit without matcher', () => {
    const out = buildCodexHooksJson([
      { command: '/bin/true', events: ['before_submit_prompt'] },
    ]);
    expect(out.hooks.UserPromptSubmit).toEqual([
      {
        hooks: [{ type: 'command', command: '/bin/true' }],
      },
    ]);
  });

  it('skips hooks not scoped to Codex', () => {
    const out = buildCodexHooksJson([
      {
        command: 'cursor-only',
        events: ['stop'],
        agents: ['CURSOR', 'CLAUDE_CODE'],
      },
    ]);
    expect(out.hooks).toEqual({});
  });
});
