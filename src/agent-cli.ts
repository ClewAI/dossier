import { spawnSync } from 'node:child_process';

/** Returns true if a binary exists on PATH and responds to `--version`. */
export function hasBinaryOnPath(name: string): boolean {
  const r = spawnSync(name, ['--version'], {
    encoding: 'utf8',
    shell: false,
  });
  return r.status === 0 || Boolean(r.stdout?.length);
}

/** Whether Cursor / Claude Code CLIs are available (never call remote agents). */
export function agentClisDetected(): { cursor: boolean; claude: boolean } {
  return {
    cursor: hasBinaryOnPath('cursor'),
    claude: hasBinaryOnPath('claude'),
  };
}
