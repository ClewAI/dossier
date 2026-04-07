/** `""` and `"."` both mean repository root in `config.directories`. */
export function isRootDirectoryKey(dirPath: string): boolean {
  return dirPath === '' || dirPath === '.';
}

/** Globs for Cursor `.mdc` frontmatter for a directory prefix. */
export function cursorGlobsForDirectory(dirPath: string): string[] {
  if (isRootDirectoryKey(dirPath)) return ['**/*'];
  const prefix = dirPath.replace(/\/$/, '');
  return [`${prefix}/**/*`];
}

/** `applyTo` value for Copilot path-scoped instructions. */
export function copilotApplyToGlob(dirPath: string): string {
  if (isRootDirectoryKey(dirPath)) return '**/*';
  return `${dirPath.replace(/\/$/, '')}/**`;
}

/** Filesystem-safe name derived from a manifest entry id. */
export function manifestIdToSafeFilename(id: string): string {
  return id.replace(/[^a-z0-9-]+/gi, '-').toLowerCase();
}
