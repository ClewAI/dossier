import type { Configuration } from './schema.js';

export function defaultConfiguration(): Configuration {
  return {
    schemaVersion: 1,
    supportDocs: false,
    agents: ['CURSOR'],
    directories: {
      '': {
        lang: 'typescript',
        frameworks: [],
        customRules: [],
      },
    },
    customRules: [],
    hooks: [],
  };
}
