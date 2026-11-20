import path from 'node:path';
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import { getGraphQLResolverImportArg, GRAPHQL_VERSIONS, graphqlVitePlugin } from './graphql-resolver.js';

const CWD = process.cwd();

export default defineConfig({
  test: {
    globals: true,
    alias: {
      'graphql-config': path.join(CWD, 'src', 'index.ts'),
    },
    pool: 'forks',
    // Run every test against each supported graphql version, filter with `--project graphql-v16`
    projects: GRAPHQL_VERSIONS.map((version) => ({
      extends: true,
      plugins: [graphqlVitePlugin(version)],
      test: {
        name: `graphql-v${version}`,
        env: { GRAPHQL_VERSION: version },
        // makes dependencies loaded natively by Node.js resolve the same graphql version
        execArgv: ['--import', getGraphQLResolverImportArg(version)],
      },
    })),
  },
  plugins: [tsconfigPaths()],
});
