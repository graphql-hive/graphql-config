import { createRequire } from 'node:module';
import path from 'node:path';
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

const CWD = process.cwd();
const require = createRequire(import.meta.url);

export default defineConfig(({ mode }) => {
  // `pnpm test:graphql-16` (vitest --mode graphql-16) runs the suite against the `graphql-16`
  // npm alias instead of the primary `graphql` devDependency.
  const usesLegacyGraphQL = /^graphql-16$/.test(mode);
  const graphqlPackage = usesLegacyGraphQL ? mode : 'graphql';
  // Resolve to the exact file Node loads for this package, so modules transformed by Vite (src,
  // tests) share one instance with externalized dependencies such as @graphql-tools/*. graphql 17's
  // exports map sends Node to `index.mjs` (via `module-sync`) where 16 has `index.js`; hard-coding
  // either one produces "Cannot use GraphQLObjectType from another module or realm".
  const graphqlEntry = require.resolve(graphqlPackage);

  return {
    resolve: {
      alias: [
        { find: /^graphql$/, replacement: graphqlEntry },
        ...(usesLegacyGraphQL
          ? [{ find: /^graphql\/(.*)$/, replacement: path.join(path.dirname(graphqlEntry), '$1') }]
          : []),
      ],
    },
    test: {
      globals: true,
      alias: {
        'graphql-config': path.join(CWD, 'src', 'index.ts'),
      },
      // In legacy mode every dependency must import `graphql` through the alias above rather than
      // through Node's own resolution (which would yield the primary version), so inline them all.
      ...(usesLegacyGraphQL ? { server: { deps: { inline: true } } } : {}),
    },
    plugins: [tsconfigPaths()],
  };
});
