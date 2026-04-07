import { describe, expect, it, vi, beforeEach } from 'vitest';
import { spawnSync } from 'node:child_process';
import { agentClisDetected, hasBinaryOnPath } from '../src/agent-cli.js';

vi.mock('node:child_process', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:child_process')>();
  return {
    ...actual,
    spawnSync: vi.fn(),
  };
});

const spawnSyncMock = vi.mocked(spawnSync);

describe('agent-cli', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('hasBinaryOnPath returns true when exit status is 0', () => {
    spawnSyncMock.mockReturnValue({
      status: 0,
      stdout: '',
      stderr: '',
      error: undefined,
      signal: null,
      output: ['', ''],
      pid: 1,
    } as ReturnType<typeof spawnSync>);
    expect(hasBinaryOnPath('fake-tool')).toBe(true);
    expect(spawnSyncMock).toHaveBeenCalledWith(
      'fake-tool',
      ['--version'],
      expect.objectContaining({ shell: false }),
    );
  });

  it('hasBinaryOnPath returns true when stdout is non-empty', () => {
    spawnSyncMock.mockReturnValue({
      status: 1,
      stdout: '1.0.0\n',
      stderr: '',
      error: undefined,
      signal: null,
      output: [null, Buffer.from('1.0.0\n')],
      pid: 1,
    } as ReturnType<typeof spawnSync>);
    expect(hasBinaryOnPath('weird')).toBe(true);
  });

  it('agentClisDetected probes cursor and claude', () => {
    spawnSyncMock.mockReturnValue({
      status: 1,
      stdout: '',
      stderr: '',
      error: undefined,
      signal: null,
      output: ['', ''],
      pid: 1,
    } as ReturnType<typeof spawnSync>);
    const d = agentClisDetected();
    expect(d).toEqual({ cursor: false, claude: false });
    expect(spawnSyncMock).toHaveBeenCalledWith(
      'cursor',
      ['--version'],
      expect.any(Object),
    );
    expect(spawnSyncMock).toHaveBeenCalledWith(
      'claude',
      ['--version'],
      expect.any(Object),
    );
  });
});
