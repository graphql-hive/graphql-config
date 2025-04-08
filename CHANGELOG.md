# Change log

## 5.1.4

### Patch Changes

- [#1631](https://github.com/graphql-hive/graphql-config/pull/1631) [`790cfc1`](https://github.com/graphql-hive/graphql-config/commit/790cfc1df60ad2738b0c0ed71436c4bbbfbc248c) Thanks [@aaronadamsCA](https://github.com/aaronadamsCA)! - support top-level await

- [#1499](https://github.com/graphql-hive/graphql-config/pull/1499) [`7f80597`](https://github.com/graphql-hive/graphql-config/commit/7f80597838415fe291a92d56a5ce552e91407a9e) Thanks [@renovate](https://github.com/apps/renovate)! - dependencies updates:

  - Updated dependency [`minimatch@^10.0.0` ↗︎](https://www.npmjs.com/package/minimatch/v/10.0.0) (from `^9.0.5`, in `dependencies`)

- [#1574](https://github.com/graphql-hive/graphql-config/pull/1574) [`c8efc31`](https://github.com/graphql-hive/graphql-config/commit/c8efc31f2697491b8b7dadc55b176949a09592b9) Thanks [@renovate](https://github.com/apps/renovate)! - dependencies updates:

  - Updated dependency [`cosmiconfig@^9.0.0` ↗︎](https://www.npmjs.com/package/cosmiconfig/v/9.0.0) (from `^8.1.0`, in `dependencies`)

## 5.1.3

### Patch Changes

- [#1572](https://github.com/kamilkisiela/graphql-config/pull/1572) [`d95462c`](https://github.com/kamilkisiela/graphql-config/commit/d95462c4ebf57cac2c2af7e8be97d5bb504fb591) Thanks [@dimaMachina](https://github.com/dimaMachina)! - revert cosmiconfig update to v8

## 5.1.2

### Patch Changes

- [#1489](https://github.com/kamilkisiela/graphql-config/pull/1489) [`9a89093`](https://github.com/kamilkisiela/graphql-config/commit/9a8909375f72c6040cd5441fb88bd86035159719) Thanks [@that1matt](https://github.com/that1matt)! - Change minimatch to version 9

## 5.1.1

### Patch Changes

- [#1481](https://github.com/kamilkisiela/graphql-config/pull/1481) [`5d00c94`](https://github.com/kamilkisiela/graphql-config/commit/5d00c94fafb220a9e101c192bffcce70dc194b75) Thanks [@renovate](https://github.com/apps/renovate)! - Update minimatch

## 5.1.0

### Minor Changes

- [#1459](https://github.com/kamilkisiela/graphql-config/pull/1459) [`5eca929`](https://github.com/kamilkisiela/graphql-config/commit/5eca92966fece546d39db39e647158a1081cee46) Thanks [@dimaMachina](https://github.com/dimaMachina)! - - fix loading esm js config

  - add support of `*.mjs` configs

### Patch Changes

- [#1418](https://github.com/kamilkisiela/graphql-config/pull/1418) [`658f984`](https://github.com/kamilkisiela/graphql-config/commit/658f98427d620a9cb8ca6c18e415b75b087794b8) Thanks [@dimaMachina](https://github.com/dimaMachina)! - should not throw `pattern is too long` from minimatch dependency when SDL schema contain more than 65536 characters

## 5.0.3

### Patch Changes

- [#1406](https://github.com/kamilkisiela/graphql-config/pull/1406) [`69afec4`](https://github.com/kamilkisiela/graphql-config/commit/69afec4bbabcee453c14737257c43f8b1919f532) Thanks [@B2o5T](https://github.com/B2o5T)! - fix `SchemaPointer` type, allow both URLs with headers and local type definitions

## 5.0.2

### Patch Changes

- [#1370](https://github.com/kamilkisiela/graphql-config/pull/1370) [`156e7c2`](https://github.com/kamilkisiela/graphql-config/commit/156e7c2cc128e4ec19f8e207bc040dd599132e38) Thanks [@gilgardosh](https://github.com/gilgardosh)! - Bump bob-the-bundler

## 5.0.1

### Patch Changes

- [#1359](https://github.com/kamilkisiela/graphql-config/pull/1359) [`18bfca8`](https://github.com/kamilkisiela/graphql-config/commit/18bfca88bf46455582e28b1c8d2ccf0c20f0dc75) Thanks [@n1ru4l](https://github.com/n1ru4l)! - Fix esm compatibility

## 5.0.0

### Major Changes

- [#1348](https://github.com/kamilkisiela/graphql-config/pull/1348) [`42ffb2e`](https://github.com/kamilkisiela/graphql-config/commit/42ffb2e82d9d7a170ae1a9b9f52cdcd396046d80) Thanks [@n1ru4l](https://github.com/n1ru4l)! - Drop support for Node.js 14. Require Node.js `>= 16`

### Patch Changes

- [#1294](https://github.com/kamilkisiela/graphql-config/pull/1294) [`1d11dbd`](https://github.com/kamilkisiela/graphql-config/commit/1d11dbd25e581cb6c0e216c3e2917ab7f47d6847) Thanks [@renovate](https://github.com/apps/renovate)! - dependencies updates:

  - Updated dependency [`jiti@1.18.2` ↗︎](https://www.npmjs.com/package/jiti/v/1.18.2) (from `1.17.1`, in `dependencies`)

- [#1348](https://github.com/kamilkisiela/graphql-config/pull/1348) [`42ffb2e`](https://github.com/kamilkisiela/graphql-config/commit/42ffb2e82d9d7a170ae1a9b9f52cdcd396046d80) Thanks [@n1ru4l](https://github.com/n1ru4l)! - dependencies updates:

  - Updated dependency [`@graphql-tools/graphql-file-loader@^8.0.0` ↗︎](https://www.npmjs.com/package/@graphql-tools/graphql-file-loader/v/8.0.0) (from `^7.3.7`, in `dependencies`)
  - Updated dependency [`@graphql-tools/json-file-loader@^8.0.0` ↗︎](https://www.npmjs.com/package/@graphql-tools/json-file-loader/v/8.0.0) (from `^7.3.7`, in `dependencies`)
  - Updated dependency [`@graphql-tools/load@^8.0.0` ↗︎](https://www.npmjs.com/package/@graphql-tools/load/v/8.0.0) (from `^7.5.5`, in `dependencies`)
  - Updated dependency [`@graphql-tools/merge@^9.0.0` ↗︎](https://www.npmjs.com/package/@graphql-tools/merge/v/9.0.0) (from `^8.2.6`, in `dependencies`)
  - Updated dependency [`@graphql-tools/url-loader@^8.0.0` ↗︎](https://www.npmjs.com/package/@graphql-tools/url-loader/v/8.0.0) (from `^7.9.7`, in `dependencies`)
  - Updated dependency [`@graphql-tools/utils@^10.0.0` ↗︎](https://www.npmjs.com/package/@graphql-tools/utils/v/10.0.0) (from `^9.0.0`, in `dependencies`)

- [#1358](https://github.com/kamilkisiela/graphql-config/pull/1358) [`d6ead74`](https://github.com/kamilkisiela/graphql-config/commit/d6ead7426d3e9a7e2309b1939bfa66ae45e9e7d9) Thanks [@n1ru4l](https://github.com/n1ru4l)! - dependencies updates:

  - Updated dependency [`cosmiconfig@^8.1.0` ↗︎](https://www.npmjs.com/package/cosmiconfig/v/8.1.0) (from `8.1.0`, in `dependencies`)
  - Updated dependency [`jiti@^1.18.2` ↗︎](https://www.npmjs.com/package/jiti/v/1.18.2) (from `1.18.2`, in `dependencies`)
  - Updated dependency [`minimatch@^4.2.3` ↗︎](https://www.npmjs.com/package/minimatch/v/4.2.3) (from `4.2.3`, in `dependencies`)
  - Updated dependency [`string-env-interpolation@^1.0.1` ↗︎](https://www.npmjs.com/package/string-env-interpolation/v/1.0.1) (from `1.0.1`, in `dependencies`)

## 4.5.0

### Minor Changes

- [`9e4f453`](https://github.com/kamilkisiela/graphql-config/commit/9e4f453f463dbf39228de39c00ccc4b7014b9614) Thanks [@kamilkisiela](https://github.com/kamilkisiela)! - Support ESM and .mts/.cts config extensions

## 4.4.1

### Patch Changes

- [#1245](https://github.com/kamilkisiela/graphql-config/pull/1245) [`bad5090`](https://github.com/kamilkisiela/graphql-config/commit/bad509048c971872224fe8eaddda84dd948e57c3) Thanks [@B2o5T](https://github.com/B2o5T)! - fix `peerDependenciesMeta` was not included in `package.json`

## 4.4.0

### Minor Changes

- [#1189](https://github.com/kamilkisiela/graphql-config/pull/1189) [`ab2ad6d`](https://github.com/kamilkisiela/graphql-config/commit/ab2ad6d558e55d5d9b52609c68d0404026e34f1e) Thanks [@B2o5T](https://github.com/B2o5T)! - add `cosmiconfig-toml-loader` to `peerDependenciesMeta`

- [#1171](https://github.com/kamilkisiela/graphql-config/pull/1171) [`b52dc1b`](https://github.com/kamilkisiela/graphql-config/commit/b52dc1b7ed46c056dea39396ffbb89a400cee7d6) Thanks [@B2o5T](https://github.com/B2o5T)! - move `cosmiconfig-typescript-loader` in `peerDependencyMeta`

## 4.3.6

### Patch Changes

- [#1149](https://github.com/kamilkisiela/graphql-config/pull/1149) [`a12f394`](https://github.com/kamilkisiela/graphql-config/commit/a12f3945b3da70a9c10e0436785f96958202912e) Thanks [@charlypoly](https://github.com/charlypoly)! - conflict with codegen also using TypeScriptLoader(), causing a double ts-node register.

## 4.3.5

### Patch Changes

- [#1126](https://github.com/kamilkisiela/graphql-config/pull/1126) [`cc781c4`](https://github.com/kamilkisiela/graphql-config/commit/cc781c4cf3bd056a75081108e1b13efd1b3d29ed) Thanks [@n1ru4l](https://github.com/n1ru4l)! - dependencies updates:

  - Updated dependency [`cosmiconfig-typescript-loader@^4.0.0` ↗︎](https://www.npmjs.com/package/cosmiconfig-typescript-loader/v/null) (from `^3.1.0`, in `dependencies`)

## 4.3.4

### Patch Changes

- [#1103](https://github.com/kamilkisiela/graphql-config/pull/1103) [`2c568f1`](https://github.com/kamilkisiela/graphql-config/commit/2c568f1ee2d45bc46613b86b12fcfab82b1393aa) Thanks [@renovate](https://github.com/apps/renovate)! - dependencies updates:

  - Added dependency [`tslib@^2.4.0` ↗︎](https://www.npmjs.com/package/tslib/v/null) (to `dependencies`)

* [#1103](https://github.com/kamilkisiela/graphql-config/pull/1103) [`2c568f1`](https://github.com/kamilkisiela/graphql-config/commit/2c568f1ee2d45bc46613b86b12fcfab82b1393aa) Thanks [@renovate](https://github.com/apps/renovate)! - Proper ESM/CJS support on Node.js

## 4.3.3

### Patch Changes

- cd7747e: bump `cosmiconfig-typescript-loader` to resolve errors with esm loading

## 4.3.2

### Patch Changes

- f74d648: fix: change to maintained version of `cosmiconfig-typescript-loader`

## 4.3.1

### Patch Changes

- 44eec8d: Add workaround for default import of typescript config loader to fix ESM support

## 4.3.0

### Minor Changes

- aaccd04: feat: improve types to fix JSON schema when schema is passed like object with headers

### Patch Changes

- 18d07fd: fix: rollback `GraphQLConfig.projects` to empty object instead `Object.create(null)`

## 4.2.0

### Minor Changes

- 0636e9a: feat: support `graphql.config.cjs` config
- 55f078a: feat: update `graphql-tools` packages

### Patch Changes

- fix: update `minimatch` dependency

Thanks to @bfanger for his first contribution 0636e9a

### vNEXT

### v4.0.2

- Update range of `@graphql-tools/merge` dependency to include v7 and v8

### v4.0.1

- Updated dependencies of `graphql-tools` to latest, to address issues related to documents loading.

### v4.0.0

‼️ ‼️ ‼️ BREAKING CHANGE ‼️ ‼️ ‼️

Dropped Node 10 support, due to the need to support ESM in this package.

‼️ ‼️ ‼️ BREAKING CHANGE ‼️ ‼️ ‼️

The signature of `Loader` has been changed in `graphql-tools`, to allow more flexibility.

If you are using `graphql-config` with `extensions`, then the `Extension` you are using needs to adjust to the new return value of `Loader` signature that returns `Source[] | null` instead of `Source`. (see: https://github.com/kamilkisiela/graphql-config/issues/716)

Other changes:

- ESM Support
- Update dependencies of `graphql-tools`.

### v3.4.0

> Note: A breaking chnage snuk into that version, please see v4.

- Update dependencies of `graphql-tools`.

### v3.3.0

- Add support for loading the config from package.json [#693](https://github.com/kamilkisiela/graphql-config/pull/693) by [@ionut-botizan](https://github.com/ionut-botizan)

### v3.2.0

- Allow custom options for loadSchema [#593](https://github.com/kamilkisiela/graphql-config/pull/593)

### v3.1.0

- TOML and TypeScript loaders [#595](https://github.com/kamilkisiela/graphql-config/pull/595) by [@acao](https://github.com/acao)
- Add ability to override default loaders [#583](https://github.com/kamilkisiela/graphql-config/pull/583) by [@danielrearden](https://github.com/danielrearden)

### v3.0.2

- Fix missing types [#542](https://github.com/kamilkisiela/graphql-config/issues/542)

### v3.0.1

- use GraphQL Toolkit v0.10.6

### v3.0.0

> Read the [Migration chapter](https://graphql-config.com/migration)

- Support GraphQL v15
- Support CommonJS and ES Modules
- Support environment variables with default values
- Match a file with a GraphQL Project
- JSON Schema
- [New Extensions system](https://graphql-config.com/extensions) with [Loaders](https://graphql-config.com/loaders)
- `includes` and `excludes` becomes `include` and `exlude`
- New field `documents` - defines GraphQL Operations and Fragments
- Broader spectrum of [config file names](https://graphql-config.com/usage#config-search-places)
- Support [custom config name](https://graphql-config.com/load-config#configname)
- Synchonous version
- Support legacy [#437](https://github.com/kamilkisiela/graphql-config/pull/437)
- Extensions capable of modifying GraphQL Schemas [#463](https://github.com/kamilkisiela/graphql-config/pull/463)

### Prior to v3

Changes: https://github.com/kamilkisiela/graphql-config/releases
