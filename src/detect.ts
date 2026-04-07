import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import type { Framework, Language } from './config/schema.js';

export type HeuristicResult = {
  languages: Language[];
  frameworks: Framework[];
};

const PackageJsonForDetectSchema = z
  .object({
    dependencies: z.record(z.string()).optional(),
    devDependencies: z.record(z.string()).optional(),
    peerDependencies: z.record(z.string()).optional(),
  })
  .passthrough();

type PackageJsonForDetect = z.infer<typeof PackageJsonForDetectSchema>;

function readPackageJson(cwd: string): PackageJsonForDetect | null {
  const p = path.join(cwd, 'package.json');
  if (!fs.existsSync(p)) return null;
  try {
    const raw: unknown = JSON.parse(fs.readFileSync(p, 'utf8'));
    const parsed = PackageJsonForDetectSchema.safeParse(raw);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

function depNames(pkg: PackageJsonForDetect): Set<string> {
  const deps = {
    ...(pkg.dependencies ?? {}),
    ...(pkg.devDependencies ?? {}),
    ...(pkg.peerDependencies ?? {}),
  };
  return new Set(Object.keys(deps).map((k) => k.toLowerCase()));
}

/** Best-effort stack detection from repo files (no agent CLI required). */
export function detectStack(cwd: string): HeuristicResult {
  const languages: Language[] = [];
  const frameworks: Framework[] = [];

  const pkg = readPackageJson(cwd);
  if (pkg) {
    const names = depNames(pkg);
    const hasTs =
      names.has('typescript') ||
      fs.existsSync(path.join(cwd, 'tsconfig.json'));
    languages.push(hasTs ? 'typescript' : 'javascript');

    if (names.has('react')) frameworks.push('react');
    if (names.has('next')) frameworks.push('nextjs');
    if (names.has('vue')) frameworks.push('vue');
    if (names.has('tailwindcss') || names.has('tailwind-merge')) {
      frameworks.push('tailwind');
    }
    if (names.has('vitest')) frameworks.push('vitest');
    if (names.has('jest') || names.has('@jest/globals')) {
      frameworks.push('jest');
    }
    if (
      names.has('eslint') ||
      names.has('prettier') ||
      names.has('@eslint/js')
    ) {
      frameworks.push('eslint_prettier');
    }

    return { languages, frameworks: uniqueFrameworks(frameworks) };
  }

  const pyproject = path.join(cwd, 'pyproject.toml');
  const requirements = path.join(cwd, 'requirements.txt');
  if (fs.existsSync(pyproject) || fs.existsSync(requirements)) {
    languages.push('python');
    const text = fs.existsSync(pyproject)
      ? fs.readFileSync(pyproject, 'utf8').toLowerCase()
      : fs.readFileSync(requirements, 'utf8').toLowerCase();
    if (text.includes('django')) frameworks.push('django');
    if (text.includes('fastapi')) frameworks.push('fastapi');
    if (text.includes('postgraphile') || text.includes('graphql')) {
      frameworks.push('postgraphile');
    }
    return { languages, frameworks: uniqueFrameworks(frameworks) };
  }

  return { languages: ['typescript'], frameworks: [] };
}

function uniqueFrameworks(f: Framework[]): Framework[] {
  return [...new Set(f)];
}
