import fs from 'node:fs';
import path from 'node:path';
import {
  getBundledLibraryDir,
  getDossierDir,
  getProjectLibraryDir,
} from './paths.js';

function copyDirRecursive(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, ent.name);
    const d = path.join(dest, ent.name);
    if (ent.isDirectory()) copyDirRecursive(s, d);
    else if (ent.isFile()) fs.copyFileSync(s, d);
  }
}

/** Copy bundled `library/` into `.dossier/library/` for the project. */
export function syncBundledLibrary(cwd: string): void {
  const src = getBundledLibraryDir();
  if (!fs.existsSync(path.join(src, 'manifest.json'))) {
    throw new Error(
      `Bundled library missing at ${src}. Is the package installed correctly?`,
    );
  }
  const dest = getProjectLibraryDir(cwd);
  fs.mkdirSync(getDossierDir(cwd), { recursive: true });
  fs.rmSync(dest, { recursive: true, force: true });
  copyDirRecursive(src, dest);
}
