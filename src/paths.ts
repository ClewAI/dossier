import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

/** Directory containing this module (`dist/` when published). */
export function getModuleDir(): string {
  return path.dirname(fileURLToPath(import.meta.url));
}

/** Package root (parent of `dist/`, sibling of `library/`). */
export function getPackageRoot(): string {
  return path.resolve(getModuleDir(), '..');
}

export function getBundledLibraryDir(): string {
  return path.join(getPackageRoot(), 'library');
}

export function getDossierDir(cwd: string): string {
  return path.join(cwd, '.dossier');
}

export function getConfigPath(cwd: string): string {
  return path.join(getDossierDir(cwd), 'config.json');
}

/** Synced copy of bundled library inside the project (optional; preferred when present). */
export function getProjectLibraryDir(cwd: string): string {
  return path.join(getDossierDir(cwd), 'library');
}

export function resolveLibraryRoot(cwd: string): string {
  const projectLib = getProjectLibraryDir(cwd);
  if (fs.existsSync(path.join(projectLib, 'manifest.json'))) {
    return projectLib;
  }
  return getBundledLibraryDir();
}
