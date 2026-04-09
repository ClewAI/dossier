import type { Configuration } from '../config/schema.js';
import type { LibraryManifest } from './manifest.js';
import { resolveEntryIdsForDirectory } from './manifest.js';
import { collectRemoteSkillIds } from './remote-skills.js';

function addAll(target: Set<string>, ids: readonly string[]): void {
  for (const id of ids) target.add(id);
}

/** Union of all library rule ids that match any configured directory. */
export function collectRuleIds(
  manifest: LibraryManifest,
  config: Configuration,
): Set<string> {
  const ids = new Set<string>();
  for (const dirConfig of Object.values(config.directories)) {
    addAll(ids, resolveEntryIdsForDirectory(manifest, dirConfig).rules);
  }
  return ids;
}

/** Union of all library skill ids that match any configured directory. */
export function collectSkillIds(
  manifest: LibraryManifest,
  config: Configuration,
): Set<string> {
  const ids = new Set<string>();
  for (const dirConfig of Object.values(config.directories)) {
    addAll(ids, resolveEntryIdsForDirectory(manifest, dirConfig).skills);
  }
  return ids;
}

/** Manifest-matched skills plus `remoteSkills` entries (see `syncRemoteSkillsToProjectLibrary`). */
export function collectAllSkillIds(
  manifest: LibraryManifest,
  config: Configuration,
): Set<string> {
  const ids = collectSkillIds(manifest, config);
  for (const id of collectRemoteSkillIds(config)) ids.add(id);
  return ids;
}
