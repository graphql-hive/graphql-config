import path from 'node:path';
import {
  ConfigEmptyError,
  ConfigInvalidError,
  ExtensionMissingError,
  GraphQLConfig,
  LoaderNoResultError,
  LoadersMissingError,
  ProjectNotFoundError,
  loadConfig,
  loadConfigSync,
} from 'graphql-config';
import { getConfig, getConfigSync } from '../src/helpers/get-config';
import { runTests } from './utils/runner';
import { TempDir } from './utils/temp-dir';

const temp = new TempDir();

beforeEach(() => {
  temp.clean();
});

afterAll(() => {
  temp.deleteTempDir();
});

runTests({ async: loadConfig, sync: loadConfigSync })((load) => {
  test('loads a config from an explicit filepath', async () => {
    temp.createFile('nested/schema.graphql', 'type Query { ok: Boolean }');
    temp.createFile(
      'nested/graphql.config.json',
      JSON.stringify({
        schema: './schema.graphql',
        documents: './query.graphql',
        extensions: {
          codegen: {
            generates: './types.ts',
          },
        },
      }),
    );

    const config = await load({
      filepath: temp.absolutePath('nested/graphql.config.json'),
      rootDir: temp.absolutePath('ignored-root'),
    });

    expect(path.basename(config.filepath)).toBe('graphql.config.json');
    expect(config.dirpath).toBe(temp.absolutePath('nested'));
    expect(config.getDefault().schema).toBe('./schema.graphql');
    expect(config.getDefault().documents).toBe('./query.graphql');
    expect(config.getDefault().extensions.codegen).toEqual({
      generates: './types.ts',
    });
  });

  test('returns undefined for a missing config when searching and configured to ignore missing configs', async () => {
    temp.createDir('empty');

    await expect(
      load({
        rootDir: temp.absolutePath('empty'),
        throwOnMissing: false,
      }),
    ).resolves.toBeUndefined();
  });

  test('returns undefined for an empty explicit filepath when configured to ignore empty configs', async () => {
    temp.createFile('.graphqlrc', '');

    await expect(
      load({
        filepath: temp.absolutePath('.graphqlrc'),
        throwOnEmpty: false,
      }),
    ).resolves.toBeUndefined();
  });

  test('throws for an empty explicit filepath by default', async () => {
    temp.createFile('.graphqlrc', '');

    await expect(
      load({
        filepath: temp.absolutePath('.graphqlrc'),
      }),
    ).rejects.toBeInstanceOf(ConfigEmptyError);
  });

  test('requires a root directory when searching for config files', async () => {
    await expect(
      load({
        rootDir: '',
      }),
    ).rejects.toThrow('Defining a root directory is required');
  });
});

runTests({ async: getConfig, sync: getConfigSync })((get) => {
  test('requires an explicit filepath', async () => {
    await expect(
      get({
        filepath: '',
        configName: 'graphql',
      }),
    ).rejects.toThrow('Defining a file path is required');
  });

  test('does not convert filesystem errors for an explicit filepath', async () => {
    await expect(
      get({
        filepath: temp.absolutePath('missing.yml'),
        configName: 'graphql',
      }),
    ).rejects.toMatchObject({
      code: 'ENOENT',
    });
  });
});

describe('GraphQLConfig extensions', () => {
  test('registers extension declarations and merges project extension config', () => {
    const config = new GraphQLConfig(
      {
        filepath: temp.absolutePath('graphql.config.json'),
        config: {
          schema: 'schema.graphql',
          documents: 'src/**/*.graphql',
          include: 'src/**/*.ts',
          exclude: 'src/generated/**',
          extensions: {
            example: {
              enabled: true,
            },
          },
        },
      },
      [
        ({ loaders }) => {
          expect(loaders.schema.register).toEqual(expect.any(Function));
          expect(loaders.documents.register).toEqual(expect.any(Function));

          return {
            name: 'example',
          };
        },
      ],
    );

    const seen: string[] = [];
    config.extensions.forEach((extension) => {
      seen.push(extension.name);
    });

    expect(config.extensions.has('endpoints')).toBe(true);
    expect(config.extensions.has('example')).toBe(true);
    expect(config.extensions.get('example')).toEqual({ name: 'example' });
    expect(config.extensions.names()).toEqual(expect.arrayContaining(['endpoints', 'example']));
    expect(seen).toEqual(expect.arrayContaining(['endpoints', 'example']));

    const project = config.getDefault();
    expect(project.hasExtension('example')).toBe(true);
    expect(project.extension('example')).toEqual({
      enabled: true,
      schema: 'schema.graphql',
      documents: 'src/**/*.graphql',
      include: 'src/**/*.ts',
      exclude: 'src/generated/**',
    });
    expect(() => project.extension('missing')).toThrow(ExtensionMissingError);
  });

  test('returns legacy project extensions without registry lookup', () => {
    const config = new GraphQLConfig(
      {
        filepath: temp.absolutePath('.graphqlconfig'),
        config: {
          schemaPath: 'legacy-schema.graphql',
          includes: ['src/**/*.ts'],
          excludes: ['src/generated/**'],
          extensions: {
            endpoints: {
              default: {
                url: 'https://example.com/graphql',
              },
            },
          },
        },
      },
      [],
    );

    const project = config.getDefault();

    expect(project.isLegacy).toBe(true);
    expect(project.schema).toBe('legacy-schema.graphql');
    expect(project.include).toEqual(['src/**/*.ts']);
    expect(project.exclude).toEqual(['src/generated/**']);
    expect(project.extension('endpoints')).toEqual({
      default: {
        url: 'https://example.com/graphql',
      },
    });
    expect(() => project.extension('missing')).toThrow(ExtensionMissingError);
  });
});

describe('GraphQLProjectConfig documents', () => {
  test('returns no documents when a project does not configure documents', async () => {
    const config = new GraphQLConfig(
      {
        filepath: temp.absolutePath('graphql.config.json'),
        config: {
          schema: 'schema.graphql',
        },
      },
      [],
    );
    const project = config.getDefault();

    await expect(project.getDocuments()).resolves.toEqual([]);
    expect(project.getDocumentsSync()).toEqual([]);
    await expect(project.loadDocuments(undefined as never)).resolves.toEqual([]);
    expect(project.loadDocumentsSync(undefined as never)).toEqual([]);
  });

  test('throws when a requested named project is missing', () => {
    const config = new GraphQLConfig(
      {
        filepath: temp.absolutePath('graphql.config.json'),
        config: {
          schema: 'schema.graphql',
        },
      },
      [],
    );

    expect(() => config.getProject('missing')).toThrow(ProjectNotFoundError);
  });
});

describe('custom errors', () => {
  test.each([ConfigInvalidError, LoaderNoResultError, LoadersMissingError])(
    '%s preserves its name and message',
    (ErrorCtor) => {
      const error = new ErrorCtor('Boom');

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe(ErrorCtor.name);
      expect(error.message).toBe('Boom');
    },
  );
});
