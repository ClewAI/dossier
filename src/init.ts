import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import fs from 'node:fs';
import {
  AgentSchema,
  FrameworkSchema,
  LanguageSchema,
  type Agent,
  type Configuration,
  type Framework,
  type Language,
} from './config/schema.js';
import { defaultConfiguration } from './config/defaults.js';
import { writeConfiguration } from './config/load.js';
import { getConfigPath, getDossierDir } from './paths.js';
import { detectStack } from './detect.js';
import { syncBundledLibrary } from './update-lib.js';
import { agentClisDetected } from './agent-cli.js';

const AGENT_ALIASES = {
  cursor: 'CURSOR',
  claude: 'CLAUDE_CODE',
  'claude-code': 'CLAUDE_CODE',
  copilot: 'GITHUB_COPILOT',
  github: 'GITHUB_COPILOT',
} as const satisfies Record<string, Agent>;

function parseAgents(line: string): Agent[] {
  const parts = line
    .split(/[,\s]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const out = new Set<Agent>();
  for (const p of parts) {
    const fromAlias = AGENT_ALIASES[p as keyof typeof AGENT_ALIASES];
    const fromEnum = AgentSchema.safeParse(p.replace(/-/g, '_').toUpperCase());
    const key = fromAlias ?? (fromEnum.success ? fromEnum.data : undefined);
    if (key) out.add(key);
  }
  return [...out];
}

const FW_ALIASES = {
  next: 'nextjs',
  nextjs: 'nextjs',
  'next.js': 'nextjs',
  eslint: 'eslint_prettier',
  prettier: 'eslint_prettier',
  eslint_prettier: 'eslint_prettier',
  github_actions: 'ci_github_actions',
  actions: 'ci_github_actions',
  ci_github_actions: 'ci_github_actions',
} as const satisfies Record<string, Framework>;

function parseFrameworks(line: string): Framework[] {
  const raw = line
    .split(/[,\s]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const out = new Set<Framework>();
  for (let p of raw) {
    p = p.replace(/-/g, '_').replace(/\./g, '_');
    if (p === 'next_js') p = 'nextjs';
    const canonical =
      p in FW_ALIASES
        ? FW_ALIASES[p as keyof typeof FW_ALIASES]
        : p;
    const r = FrameworkSchema.safeParse(canonical);
    if (r.success) out.add(r.data);
  }
  return [...out];
}

export async function runInit(cwd: string): Promise<void> {
  const rl = readline.createInterface({ input, output });
  const configPath = getConfigPath(cwd);

  if (fs.existsSync(configPath)) {
    const ans = await rl.question(
      `Config already exists at ${configPath}. Overwrite? [y/N] `,
    );
    if (ans.toLowerCase() !== 'y' && ans.toLowerCase() !== 'yes') {
      rl.close();
      return;
    }
  }

  const hint = detectStack(cwd);
  const langAns =
    (await rl.question(
      `Primary language (javascript|typescript|python) [${hint.languages[0] ?? 'typescript'}]: `,
    )) ||
    hint.languages[0] ||
    'typescript';
  const langNorm = langAns
    .trim()
    .toLowerCase()
    .replace(/^js$/, 'javascript')
    .replace(/^ts$/, 'typescript')
    .replace(/^py$/, 'python');
  const langParsed = LanguageSchema.safeParse(langNorm);
  const lang: Language = langParsed.success ? langParsed.data : 'typescript';

  const fwHint =
    hint.frameworks.length > 0
      ? hint.frameworks.join(', ')
      : '(none detected)';
  const fwLine = await rl.question(
    `Frameworks (comma-separated: react, nextjs, django, …) [${fwHint}]: `,
  );
  const frameworks = fwLine.trim()
    ? parseFrameworks(fwLine)
    : hint.frameworks;

  const agentLine = await rl.question(
    'Agents to enable: cursor, claude, copilot (comma-separated) [cursor]: ',
  );
  let agents = parseAgents(agentLine.trim() || 'cursor');
  if (agents.length === 0) agents = ['CURSOR'];

  const docsAns = await rl.question(
    'Maintain docs/ for AI-readable configuration? [y/N]: ',
  );
  const supportDocs =
    docsAns.toLowerCase() === 'y' || docsAns.toLowerCase() === 'yes';

  rl.close();

  const config: Configuration = {
    ...defaultConfiguration(),
    supportDocs,
    agents,
    directories: {
      '': {
        lang,
        frameworks,
        customRules: [],
      },
    },
  };

  fs.mkdirSync(getDossierDir(cwd), { recursive: true });
  writeConfiguration(cwd, config);
  syncBundledLibrary(cwd);

  const { cursor: cursorCli, claude: claudeCli } = agentClisDetected();
  if (!cursorCli && !claudeCli) {
    console.warn(
      'Neither `cursor` nor `claude` CLI found on PATH; skipped deep repo scan. Heuristics were used where possible.',
    );
  } else {
    console.log(
      'Optional: use your agent CLI to summarize the repo and append notes to `.dossier/config.json` customRules as needed.',
    );
  }

  console.log(`Wrote ${configPath}`);
  console.log(
    'Run `dossier generate <cursor|claude|copilot>` to emit agent-specific files.',
  );
}
