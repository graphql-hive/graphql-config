import { createRequire } from 'node:module';
import path from 'node:path';
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

const CWD = process.cwd();
const require = createRequire(import.meta.url);

export default defineConfig({
  test: {
    globals: true,
    alias: {
      'graphql-config': path.join(CWD, 'src', 'index.ts'),
      // Resolve `graphql` to the exact file Node loads, so modules transformed by Vite (src, tests)
      // share a single instance with externalized dependencies such as @graphql-tools/*.
      // A hard-coded `index.js` path breaks on graphql 17: its exports map sends Node to
      // `index.mjs` (via the `module-sync` condition) while Vite would still load `index.js`,
      // producing "Cannot use GraphQLObjectType from another module or realm".
      graphql: require.resolve('graphql'),
    },
  },
  plugins: [tsconfigPaths()],
});
