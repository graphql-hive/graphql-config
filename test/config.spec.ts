import { buildSchema, buildASTSchema } from 'graphql';
import path from 'path';
import { vi } from 'vitest';
import { TempDir } from './utils/temp-dir';
import { runTests } from './utils/runner';
import { loadConfig, loadConfigSync, ConfigNotFoundError, GraphQLConfig } from 'graphql-config';

const temp = new TempDir();

beforeEach(() => {
  temp.clean();
});

beforeAll(() => {
  process.env.SCHEMA = './env.graphql';
});

afterAll(() => {
  temp.deleteTempDir();
  process.env.SCHEMA = undefined;
});

runTests({ async: loadConfig, sync: loadConfigSync })((load, mode) => {
  const testSDL = /* GraphQL */ `
    type Query {
      foo: String
    }
  `;
  const testYAML = 'schema: schema.graphql';
  const schemaFilename = 'schema.graphql';

  describe('loaders', () => {
    test('load a single graphql file', async () => {
      temp.createFile('.graphqlrc', testYAML);
      temp.createFile(schemaFilename, testSDL);

      const config = await load({ rootDir: temp.dir });

      const schema = mode === 'async' ? await config.getDefault().getSchema() : config.getDefault().getSchemaSync();
      const query = schema.getQueryType();
      const fields = Object.keys(query.getFields());

      expect(query).toBeDefined();
      expect(fields).toContainEqual('foo');
    });

    test('load a single graphql file as string', async () => {
      temp.createFile('.graphqlrc', testYAML);
      temp.createFile(schemaFilename, testSDL);

      const config = await load({ rootDir: temp.dir });

      const schema = buildSchema(
        mode === 'async' ? await config.getDefault().getSchema('string') : config.getDefault().getSchemaSync('string'),
      );
      const query = schema.getQueryType();
      const fields = Object.keys(query.getFields());

      expect(query).toBeDefined();
      expect(fields).toContainEqual('foo');
    });

    test('load a single graphql file as DocumentNode', async () => {
      temp.createFile('.graphqlrc', testYAML);
      temp.createFile(schemaFilename, testSDL);

      const config = await load({ rootDir: temp.dir });

      const schema = buildASTSchema(
        mode === 'async'
          ? await config.getDefault().getSchema('DocumentNode')
          : config.getDefault().getSchemaSync('DocumentNode'),
      );
      const query = schema.getQueryType();
      const fields = Object.keys(query.getFields());

      expect(query).toBeDefined();
      expect(fields).toContainEqual('foo');
    });
  });

  describe('loading from supported config files', () => {
    const moduleName = 'graphql';

    const esmConfigTs = `export default { schema: '${schemaFilename}' } satisfies any`;
    const esmConfig = `export default { schema: '${schemaFilename}' }`;
    const cjsConfigTs = `module.exports = { schema: '${schemaFilename}' } satisfies any`;
    const cjsConfig = `module.exports = { schema: '${schemaFilename}' }`;

    const yamlConfig = `schema: '${schemaFilename}'`;
    const tomlConfig = `schema = "${schemaFilename}"`;
    const jsonConfig = `{"schema": "${schemaFilename}"}`;
    const packageJsonConfig = `{"${moduleName}": {"schema": "${schemaFilename}"}}`;

    const typeModule = '{"type":"module"}';
    const typeCommonjs = '{"type":"commonjs"}';

    const configFiles: [string, string, packageJson?: string][] = [
      // #.config files
      [`${moduleName}.config.ts`, esmConfigTs],
      [`${moduleName}.config.js`, esmConfig, typeModule],
      [`${moduleName}.config.js`, cjsConfig, typeCommonjs],
      [`${moduleName}.config.js`, cjsConfig],
      [`${moduleName}.config.cts`, cjsConfigTs],
      [`${moduleName}.config.cjs`, cjsConfig],
      [`${moduleName}.config.mts`, esmConfigTs],
      [`${moduleName}.config.mjs`, esmConfig],

      [`${moduleName}.config.json`, jsonConfig],
      [`${moduleName}.config.yaml`, yamlConfig],
      [`${moduleName}.config.yml`, yamlConfig],
      [`${moduleName}.config.toml`, tomlConfig],
      // .#rc files
      [`.${moduleName}rc`, yamlConfig],
      [`.${moduleName}rc.ts`, esmConfigTs],
      [`.${moduleName}rc.js`, esmConfig, typeModule],
      [`.${moduleName}rc.js`, esmConfig, typeCommonjs],
      [`.${moduleName}rc.js`, cjsConfig],
      [`.${moduleName}rc.cts`, cjsConfigTs],
      [`.${moduleName}rc.cjs`, cjsConfig],
      [`.${moduleName}rc.mts`, esmConfigTs],
      [`.${moduleName}rc.mjs`, esmConfig],

      [`.${moduleName}rc.json`, jsonConfig],
      [`.${moduleName}rc.yml`, yamlConfig],
      [`.${moduleName}rc.yaml`, yamlConfig],
      [`.${moduleName}rc.toml`, tomlConfig],
      // other files
      ['package.json', packageJsonConfig],
    ];

    if (mode === 'async') {
      const topAwaitConfigTs = `await Promise.resolve(); export default { schema: '${schemaFilename}' } satisfies any`;
      const topAwaitConfig = `await Promise.resolve(); export default { schema: '${schemaFilename}' }`;

      configFiles.push(
        // #.config files
        [`${moduleName}.config.ts`, topAwaitConfigTs, typeModule],
        [`${moduleName}.config.js`, topAwaitConfig, typeModule],
        [`${moduleName}.config.mts`, topAwaitConfigTs],
        [`${moduleName}.config.mjs`, topAwaitConfig],

        // .#rc files
        [`.${moduleName}rc.ts`, topAwaitConfigTs, typeModule],
        [`.${moduleName}rc.js`, topAwaitConfig, typeModule],
        [`.${moduleName}rc.mts`, topAwaitConfigTs],
        [`.${moduleName}rc.mjs`, topAwaitConfig],
      );
    }

    beforeEach(() => {
      temp.clean();
      temp.createFile(schemaFilename, testSDL);
    });

    test.each(configFiles)('load config from "%s"', async (name, content, packageJson) => {
      temp.createFile(name, content);
      if (packageJson) {
        temp.createFile('package.json', packageJson);
      }

      const config = await load({ rootDir: temp.dir });

      const loadedFileName = path.basename(config.filepath);
      const loadedSchema = config.getDefault().schema;

      expect(config).toBeDefined();
      expect(loadedFileName).toEqual(name);
      expect(loadedSchema).toEqual(schemaFilename);
    });
  });

  describe('environment variables', () => {
    test('not defined but with a default value', async () => {
      temp.createFile('.graphqlrc', 'schema: ${FOO:./schema.graphql}');

      const config = await load({ rootDir: temp.dir });
      expect(config.getDefault().schema).toEqual('./schema.graphql');
    });

    test('not defined but with a default value inside quotation marks', async () => {
      const url = 'http://localhost:9000';
      temp.createFile('.graphqlrc', `schema: \${FOO:"${url}"}`);

      const config = await load({ rootDir: temp.dir });
      expect(config.getDefault().schema).toEqual(url);
    });

    test('not defined but with a default value inside quotation marks', async () => {
      const url = 'http://localhost:9000';
      temp.createFile('.graphqlrc', `schema: \${FOO:${url}}`);

      const config = await load({ rootDir: temp.dir });
      expect(config.getDefault().schema).toEqual(url);
    });

    test('defined and with a default value', async () => {
      temp.createFile('.graphqlrc', 'schema: ${SCHEMA:./schema.graphql}');

      const config = await load({ rootDir: temp.dir });
      expect(config.getDefault().schema).toEqual('./env.graphql');
    });
  });

  describe('project matching by file path', () => {
    test('basic check', async () => {
      temp.createFile(
        '.graphqlrc',
        `
        projects:
          foo:
            schema: ./foo.graphql
          bar:
            schema:
              - ./bar.graphql:
                noop: true
          baz:
            schema: ./documents/**/*.graphql

          qux:
            schema:
              - ./schemas/foo.graphql
              - ./schemas/bar.graphql`,
      );

      const config = await load({ rootDir: temp.dir });

      expect(config.getProjectForFile('./foo.graphql').name).toBe('foo');
      expect(config.getProjectForFile(path.resolve(temp.dir, './foo.graphql')).name).toBe('foo');
      expect(config.getProjectForFile('./bar.graphql').name).toBe('bar');
      expect(config.getProjectForFile(path.resolve(temp.dir, './bar.graphql')).name).toBe('bar');
      expect(config.getProjectForFile('./schemas/foo.graphql').name).toBe('qux');
      expect(config.getProjectForFile('./schemas/bar.graphql').name).toBe('qux');
      expect(config.getProjectForFile('./documents/baz.graphql').name).toBe('baz');
    });

    test('consider include', async () => {
      temp.createFile(
        '.graphqlrc',
        `
        projects:
          foo:
            schema: ./foo.graphql
            include: ./foo/*.ts
          bar:
            schema: ./bar.graphql
            documents: ./documents/**/*.graphql
      `,
      );

      const config = await load({ rootDir: temp.dir });

      expect(config.getProjectForFile('./foo/component.ts').name).toBe('foo');
      expect(config.getProjectForFile('./documents/barbar.graphql').name).toBe('bar');
    });

    test('consider exclude', async () => {
      temp.createFile(
        '.graphqlrc',
        `
        projects:
          foo:
            schema: ./foo.graphql
            include: ./foo/*.ts
            exclude: ./foo/ignored/**
          bar:
            schema: ./bar.graphql
            documents: ./documents/**/*.graphql
      `,
      );

      const config = await load({ rootDir: temp.dir });

      expect(config.getProjectForFile('./foo/component.ts').name).toBe('foo');
      // should point to a next project that includes the file
      expect(config.getProjectForFile('./foo/ignored/component.ts').name).toBe('bar');
    });

    test.each(['loadDocumentsSync', 'loadDocuments'] as const)('%s uses exclude', async (method) => {
      temp.createFile(
        '.graphqlrc',
        `
        projects:
          foo:
            schema: ./foo.graphql
            include: ./foo/*.ts
            exclude: ./foo/ignored/**
        `,
      );

      const config = await load({ rootDir: temp.dir });

      const project = config.getProject('foo');

      const loadDocumentsSyncSpy = vi
        .spyOn(project['_extensionsRegistry'].loaders.documents, method)
        .mockReturnValue([]);

      await project[method]('./**/*');

      expect(loadDocumentsSyncSpy).toHaveBeenCalledWith('./**/*', {
        ignore: './foo/ignored/**',
      });

      loadDocumentsSyncSpy.mockRestore();
    });

    test.each(['loadDocumentsSync', 'loadDocuments'] as const)(
      '%s respects options.ignore when provided (overrides exclude)',
      async (method) => {
        temp.createFile(
          '.graphqlrc',
          `
        schema: ./schema.graphql
        documents: ./**/*.graphql
        exclude:
          - "**/excluded/**"
      `,
        );

        const config = await load({ rootDir: temp.dir });
        const project = config.getDefault();

        const loadDocumentsSyncSpy = vi
          .spyOn(project['_extensionsRegistry'].loaders.documents, method)
          .mockReturnValue([]);

        // Call with custom ignore - should override exclude
        await project[method]('./**/*.graphql', { ignore: '**/custom-ignored/**' });

        // Verify it was called with custom ignore (NOT the exclude from config)
        expect(loadDocumentsSyncSpy).toHaveBeenCalledWith('./**/*.graphql', {
          ignore: '**/custom-ignored/**',
        });

        loadDocumentsSyncSpy.mockRestore();
      },
    );

    test('customizable config name', async () => {
      temp.createFile(schemaFilename, testSDL);
      temp.createFile('foo.config.js', `module.exports = { schema: '${schemaFilename}' }`);

      try {
        await load({ rootDir: temp.dir });

        throw new Error('Should not be here');
      } catch (error) {
        expect(error).toBeInstanceOf(ConfigNotFoundError);
      }

      const config = await load({
        rootDir: temp.dir,
        configName: 'foo',
      });

      expect(config.getDefault().schema).toEqual(schemaFilename);
    });
  });
});

describe('GraphQLConfig', () => {
  const MINIMATCH_MAX_LENGTH = 65_536;

  // https://github.com/dimaMachina/graphql-eslint/issues/2046
  it(`should not throw \`pattern is too long\` from minimatch dependency when SDL schema contain more than ${MINIMATCH_MAX_LENGTH} characters`, async () => {
    const schema = Array.from({ length: 2_150 }, (_, i) => `type Query${i} { foo: String }`).join('\n');
    const graphQLConfig = new GraphQLConfig({ config: { schema }, filepath: '' }, []);
    expect(schema.length).toBeGreaterThan(MINIMATCH_MAX_LENGTH);
    expect(() => graphQLConfig.getProjectForFile('foo')).not.toThrow();
  });
});
