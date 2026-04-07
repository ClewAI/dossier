import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import type { DirectoryConfig } from '../config/schema.js';
import { LanguageSchema, FrameworkSchema } from '../config/schema.js';

const ManifestEntrySchema = z.object({
  type: z.enum(['rule', 'skill']),
  tags: z.object({
    languages: z.array(LanguageSchema).default([]),
    frameworks: z.array(FrameworkSchema).default([]),
  }),
});

const ManifestSchema = z.object({
  version: z.number().int().positive(),
  entries: z.record(z.string(), ManifestEntrySchema),
});

export type LibraryManifest = z.infer<typeof ManifestSchema>;
export type ManifestEntry = z.infer<typeof ManifestEntrySchema>;

export function readManifest(libraryRoot: string): LibraryManifest {
  const p = path.join(libraryRoot, 'manifest.json');
  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Invalid or unreadable library manifest at ${p}: ${msg}`);
  }
  return ManifestSchema.parse(raw);
}

function tagsMatchDirectory(
  tags: ManifestEntry['tags'],
  dir: DirectoryConfig,
): boolean {
  const langOk =
    tags.languages.length === 0 || tags.languages.includes(dir.lang);
  const fwOk =
    tags.frameworks.length === 0 ||
    tags.frameworks.some((f) => dir.frameworks.includes(f));
  return langOk && fwOk;
}

/** Global entries: no language and no framework tags. */
function isGlobalEntry(tags: ManifestEntry['tags']): boolean {
  return tags.languages.length === 0 && tags.frameworks.length === 0;
}

export function resolveEntryIdsForDirectory(
  manifest: LibraryManifest,
  dir: DirectoryConfig,
): { rules: string[]; skills: string[] } {
  const rules: string[] = [];
  const skills: string[] = [];
  for (const [id, entry] of Object.entries(manifest.entries)) {
    const include =
      isGlobalEntry(entry.tags) || tagsMatchDirectory(entry.tags, dir);
    if (!include) continue;
    if (entry.type === 'rule') rules.push(id);
    else skills.push(id);
  }
  return { rules, skills };
}
