import fs from 'node:fs';
import path from 'node:path';
import type { Configuration, RemoteSkillsSource } from '../config/schema.js';
import { getProjectLibraryDir } from '../paths.js';

/** GitHub Contents API item (subset). */
type GhContentItem = {
  type: 'file' | 'dir';
  name: string;
  path: string;
  download_url: string | null;
  content?: string;
  encoding?: string;
};

export function parseGithubRepoUrl(input: string): { owner: string; repo: string } {
  const t = input.trim();
  const fromWeb = t.match(
    /github\.com\/([^/]+)\/([^/.\s?#]+)(?:\.git)?(?:\/|$|\?|#)/i,
  );
  if (fromWeb) return { owner: fromWeb[1], repo: fromWeb[2] };
  const short = t.match(/^([a-z0-9_.-]+)\/([a-z0-9_.-]+)$/i);
  if (short) return { owner: short[1], repo: short[2] };
  throw new Error(
    `Not a recognized GitHub repository URL or owner/repo: ${input}`,
  );
}

function slugSegment(s: string): string {
  return s
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

/**
 * Stable directory name under library/skills for a remote skill tree.
 * Includes a path prefix slug so the same skill name from the same repo at different roots cannot collide.
 */
export function remoteSkillLocalId(
  owner: string,
  repo: string,
  skillName: string,
  pathPrefix = '',
): string {
  const prefixPart = pathPrefix ? slugSegment(pathPrefix) : 'root';
  return `remote-${slugSegment(owner)}-${slugSegment(repo)}-${prefixPart}-${slugSegment(skillName)}`;
}

function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'dossier-cli',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function encodeRepoPath(repoPath: string): string {
  return repoPath
    .split('/')
    .filter(Boolean)
    .map((seg) => encodeURIComponent(seg))
    .join('/');
}

async function githubFetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, { headers: githubHeaders() });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(
      `GitHub API ${res.status} for ${url}: ${text.slice(0, 400)}`,
    );
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error(`GitHub API returned non-JSON from ${url}`);
  }
}

export async function resolveDefaultBranch(
  owner: string,
  repo: string,
): Promise<string> {
  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  const data = await githubFetchJson(url);
  if (
    typeof data !== 'object' ||
    data === null ||
    typeof (data as { default_branch?: unknown }).default_branch !== 'string'
  ) {
    throw new Error(`Could not read default_branch for ${owner}/${repo}`);
  }
  return (data as { default_branch: string }).default_branch;
}

async function listGithubContents(
  owner: string,
  repo: string,
  ref: string,
  repoPath: string,
): Promise<GhContentItem[]> {
  const enc = encodeRepoPath(repoPath);
  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${enc}?ref=${encodeURIComponent(ref)}`;
  const data = await githubFetchJson(url);
  if (Array.isArray(data)) return data as GhContentItem[];
  if (
    typeof data === 'object' &&
    data !== null &&
    (data as GhContentItem).type === 'file'
  ) {
    return [data as GhContentItem];
  }
  throw new Error(`Unexpected GitHub contents response for ${repoPath}`);
}

async function writeGithubFile(
  item: GhContentItem,
  destFile: string,
): Promise<void> {
  fs.mkdirSync(path.dirname(destFile), { recursive: true });
  if (item.download_url) {
    const res = await fetch(item.download_url, { headers: githubHeaders() });
    if (!res.ok) {
      throw new Error(
        `Failed to download ${item.download_url}: HTTP ${res.status}`,
      );
    }
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(destFile, buf);
    return;
  }
  if (item.content && item.encoding === 'base64') {
    fs.writeFileSync(destFile, Buffer.from(item.content, 'base64'));
    return;
  }
  throw new Error(`No download_url or base64 content for ${item.path}`);
}

async function mirrorGithubDirectory(
  owner: string,
  repo: string,
  ref: string,
  repoDirPath: string,
  destDir: string,
): Promise<void> {
  const items = await listGithubContents(owner, repo, ref, repoDirPath);
  for (const item of items) {
    if (item.type === 'file') {
      await writeGithubFile(item, path.join(destDir, item.name));
    } else {
      await mirrorGithubDirectory(
        owner,
        repo,
        ref,
        item.path,
        path.join(destDir, item.name),
      );
    }
  }
}

function skillRepoPath(source: RemoteSkillsSource, skillName: string): string {
  const prefix = (source.pathPrefix ?? '').replace(/^\/+|\/+$/g, '');
  if (prefix) return `${prefix}/${skillName}`;
  return skillName;
}

export function collectRemoteSkillIds(config: Configuration): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const dir of Object.values(config.directories)) {
    for (const src of dir.remoteSkills) {
      const { owner, repo } = parseGithubRepoUrl(src.github);
      const prefix = src.pathPrefix ?? '';
      for (const skill of src.skills) {
        const id = remoteSkillLocalId(owner, repo, skill, prefix);
        if (!seen.has(id)) {
          seen.add(id);
          out.push(id);
        }
      }
    }
  }
  return out;
}

function pruneStaleRemoteDirs(skillsRoot: string, keep: Set<string>): void {
  if (!fs.existsSync(skillsRoot)) return;
  for (const name of fs.readdirSync(skillsRoot, { withFileTypes: true })) {
    if (!name.isDirectory() || !name.name.startsWith('remote-')) continue;
    if (!keep.has(name.name)) {
      fs.rmSync(path.join(skillsRoot, name.name), {
        recursive: true,
        force: true,
      });
    }
  }
}

/**
 * Fetches configured [Agent Skills](https://agentskills.io/specification) from GitHub
 * into `.dossier/library/skills/` using directory names prefixed with `remote-`.
 */
export async function syncRemoteSkillsToProjectLibrary(
  cwd: string,
  config: Configuration,
): Promise<void> {
  const wanted = collectRemoteSkillIds(config);
  const projectLib = getProjectLibraryDir(cwd);
  const skillsRoot = path.join(projectLib, 'skills');
  fs.mkdirSync(skillsRoot, { recursive: true });

  const keep = new Set(wanted);
  pruneStaleRemoteDirs(skillsRoot, keep);

  if (wanted.length === 0) return;

  const refCache = new Map<string, string>();

  async function refFor(owner: string, repo: string, explicit?: string) {
    if (explicit) return explicit;
    const key = `${owner}/${repo}`;
    if (refCache.has(key)) return refCache.get(key)!;
    const b = await resolveDefaultBranch(owner, repo);
    refCache.set(key, b);
    return b;
  }

  const tasks = new Map<
    string,
    {
      owner: string;
      repo: string;
      ref: string;
      repoPath: string;
      destDir: string;
    }
  >();

  for (const dir of Object.values(config.directories)) {
    for (const src of dir.remoteSkills) {
      const { owner, repo } = parseGithubRepoUrl(src.github);
      const ref = await refFor(owner, repo, src.ref);
      const prefix = src.pathPrefix ?? '';
      for (const skill of src.skills) {
        const localId = remoteSkillLocalId(owner, repo, skill, prefix);
        const destDir = path.join(skillsRoot, localId);
        const repoPath = skillRepoPath(src, skill);
        const prev = tasks.get(localId);
        if (prev) {
          if (prev.ref !== ref || prev.repoPath !== repoPath) {
            throw new Error(
              `remoteSkills conflict for "${skill}": same local id "${localId}" but different ref or path (${prev.ref} vs ${ref}, paths ${prev.repoPath} vs ${repoPath}).`,
            );
          }
          continue;
        }
        tasks.set(localId, { owner, repo, ref, repoPath, destDir });
      }
    }
  }

  for (const t of tasks.values()) {
    await mirrorGithubDirectory(
      t.owner,
      t.repo,
      t.ref,
      t.repoPath,
      t.destDir,
    );
  }
}
