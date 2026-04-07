import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/cli.ts', 'src/main.ts'],
  format: ['esm'],
  platform: 'node',
  target: 'node20',
  clean: true,
  sourcemap: true,
  dts: true,
  splitting: false,
});
