import { describe, expect, it } from 'vitest';
import {
  ConfigurationSchema,
  safeParseConfiguration,
} from '../src/config/schema.js';

const minimalValid = {
  supportDocs: false,
  agents: ['CURSOR'],
  directories: {
    '': { lang: 'typescript', frameworks: [], customRules: [] },
  },
};

describe('ConfigurationSchema', () => {
  it('accepts a minimal valid config and applies defaults', () => {
    const r = safeParseConfiguration(minimalValid);
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.schemaVersion).toBe(1);
    expect(r.data.hooks).toEqual([]);
    expect(r.data.customRules).toEqual([]);
  });

  it('accepts hooks with normalized events', () => {
    const r = safeParseConfiguration({
      ...minimalValid,
      hooks: [
        {
          command: '/bin/true',
          events: ['after_file_edit', 'stop'],
          agents: ['CURSOR'],
        },
      ],
    });
    expect(r.success).toBe(true);
  });

  it('accepts OPENAI_CODEX in hook agents filter', () => {
    const r = safeParseConfiguration({
      ...minimalValid,
      hooks: [
        {
          command: '/bin/true',
          events: ['stop'],
          agents: ['OPENAI_CODEX'],
        },
      ],
    });
    expect(r.success).toBe(true);
  });

  it('rejects invalid hook events', () => {
    const r = safeParseConfiguration({
      ...minimalValid,
      hooks: [{ command: 'x', events: ['not_a_real_event'] }],
    });
    expect(r.success).toBe(false);
  });

  it('accepts OPENAI_CODEX in agents', () => {
    const r = safeParseConfiguration({
      ...minimalValid,
      agents: ['OPENAI_CODEX'],
    });
    expect(r.success).toBe(true);
  });

  it('rejects empty agents array', () => {
    const r = safeParseConfiguration({
      ...minimalValid,
      agents: [],
    });
    expect(r.success).toBe(false);
  });

  it('parse throws on invalid data', () => {
    expect(() =>
      ConfigurationSchema.parse({ ...minimalValid, agents: [] }),
    ).toThrow();
  });
});
