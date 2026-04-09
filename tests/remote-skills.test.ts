import { describe, expect, it } from 'vitest';
import { parseConfiguration } from '../src/config/schema.js';
import {
  collectRemoteSkillIds,
  parseGithubRepoUrl,
  remoteSkillLocalId,
} from '../src/library/remote-skills.js';

describe('parseGithubRepoUrl', () => {
  it('parses https github URLs', () => {
    expect(parseGithubRepoUrl('https://github.com/anthropics/skills')).toEqual({
      owner: 'anthropics',
      repo: 'skills',
    });
  });

  it('parses org/repo shorthand', () => {
    expect(parseGithubRepoUrl('anthropics/skills')).toEqual({
      owner: 'anthropics',
      repo: 'skills',
    });
  });

  it('strips .git suffix in URL', () => {
    expect(
      parseGithubRepoUrl('https://github.com/anthropics/skills.git'),
    ).toEqual({ owner: 'anthropics', repo: 'skills' });
  });
});

describe('remoteSkillLocalId', () => {
  it('includes path prefix slug', () => {
    expect(
      remoteSkillLocalId('anthropics', 'skills', 'brand-guidelines', 'skills'),
    ).toBe('remote-anthropics-skills-skills-brand-guidelines');
  });

  it('uses root placeholder when prefix empty', () => {
    expect(
      remoteSkillLocalId('anthropics', 'skills', 'foo', ''),
    ).toBe('remote-anthropics-skills-root-foo');
  });
});

describe('collectRemoteSkillIds', () => {
  it('dedupes the same remote skill across directories', () => {
    const cfg = parseConfiguration({
      supportDocs: false,
      agents: ['CURSOR'],
      directories: {
        '': {
          lang: 'typescript',
          frameworks: [],
          customRules: [],
          remoteSkills: [
            {
              github: 'https://github.com/anthropics/skills',
              skills: ['a', 'b'],
              pathPrefix: 'skills',
            },
          ],
        },
        packages: {
          lang: 'typescript',
          frameworks: [],
          customRules: [],
          remoteSkills: [
            {
              github: 'https://github.com/anthropics/skills',
              skills: ['a'],
              pathPrefix: 'skills',
            },
          ],
        },
      },
      customRules: [],
      hooks: [],
    });
    const ids = collectRemoteSkillIds(cfg);
    expect(ids).toHaveLength(2);
    expect(ids).toContain('remote-anthropics-skills-skills-a');
    expect(ids).toContain('remote-anthropics-skills-skills-b');
  });
});
