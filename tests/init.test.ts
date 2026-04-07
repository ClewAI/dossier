import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parseConfiguration } from '../src/config/schema.js';

const questionMock = vi.fn();
const closeMock = vi.fn();

vi.mock('node:readline/promises', () => ({
  default: {
    createInterface: vi.fn(() => ({
      question: questionMock,
      close: closeMock,
    })),
  },
}));

vi.mock('../src/agent-cli.js', () => ({
  agentClisDetected: vi.fn(() => ({ cursor: false, claude: false })),
}));

vi.mock('../src/update-lib.js', () => ({
  syncBundledLibrary: vi.fn(),
}));

describe('runInit', () => {
  let tmp: string;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dossier-init-'));
    questionMock.mockReset();
    questionMock.mockResolvedValue('');
    closeMock.mockReset();
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
    warnSpy.mockRestore();
    logSpy.mockRestore();
  });

  it('writes config.json with defaults from empty answers', async () => {
    const { runInit } = await import('../src/init.js');
    await runInit(tmp);

    const raw = JSON.parse(
      fs.readFileSync(path.join(tmp, '.dossier', 'config.json'), 'utf8'),
    );
    const cfg = parseConfiguration(raw);
    expect(cfg.agents).toEqual(['CURSOR']);
    expect(cfg.directories[''].lang).toBe('typescript');
    expect(closeMock).toHaveBeenCalled();
  });

  it('warns when agent CLIs are not detected (mocked)', async () => {
    const { runInit } = await import('../src/init.js');
    await runInit(tmp);

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Neither `cursor` nor `claude` CLI'),
    );
  });
});
