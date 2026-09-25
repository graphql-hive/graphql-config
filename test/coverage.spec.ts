import { buildSchema, Kind, parse, type DocumentNode } from 'graphql';
import { describe, expect, test, vi } from 'vitest';
import {
  ConfigEmptyError,
  ExtensionMissingError,
  GraphQLConfig,
  LoadersRegistry,
} from 'graphql-config';
import { getConfig, getConfigSync } from '../src/helpers/get-config';
import { findConfig, findConfigSync } from '../src/helpers/find-config';
import { useMiddleware } from '../src/helpers/utils';
import { GraphQLExtensionsRegistry } from '../src/extension';
import { TempDir } from './utils/temp-dir';

const temp = new TempDir();

beforeEach(() => {
  temp.clean();
});

afterAll(() => {
  temp.deleteTempDir();
});

describe('config helper error paths', () => {
  test('requires an explicit filepath', async () => {
    await expect(getConfig({ filepath: '', configName: 'graphql' })).rejects.toThrow('Defining a file path is required');
    expect(() => getConfigSync({ filepath: '', configName: 'graphql' })).toThrow('Defining a file path is required');
  });

  test('requires an explicit root directory', async () => {
    await expect(findConfig({ rootDir: '', configName: 'graphql' })).rejects.toThrow(
      'Defining a root directory is required',
    );
    expect(() => findConfigSync({ rootDir: '', configName: 'graphql' })).toThrow(
      'Defining a root directory is required',
    );
  });

  test('throws when loading a missing config filepath', async () => {
    const missingPath = temp.absolutePath('missing.yml');

    await expect(getConfig({ filepath: missingPath, configName: 'graphql' })).rejects.toThrow(
      'no such file or directory',
    );
    expect(() => getConfigSync({ filepath: missingPath, configName: 'graphql' })).toThrow(
      'no such file or directory',
    );
  });

  test('throws when loading an empty config file', async () => {
    temp.createFile('.graphqlrc', '');
    const filepath = temp.absolutePath('.graphqlrc');

    await expect(getConfig({ filepath, configName: 'graphql' })).rejects.toBeInstanceOf(ConfigEmptyError);
    expect(() => getConfigSync({ filepath, configName: 'graphql' })).toThrow(ConfigEmptyError);
  });
});

describe('GraphQLExtensionsRegistry', () => {
  test('tracks extension names and iterates registered extensions', () => {
    const registry = new GraphQLExtensionsRegistry({ cwd: temp.dir });

    registry.register(() => ({ name: 'custom' }));

    expect(registry.has('custom')).toBe(true);
    expect(registry.get('custom')).toEqual({ name: 'custom' });
    expect(registry.names()).toContain('custom');

    const seen: string[] = [];
    registry.forEach((extension) => seen.push(extension.name));

    expect(seen).toEqual(['custom']);
  });
});

describe('GraphQLProjectConfig matching and extensions', () => {
  test('returns legacy extensions from project config and throws when missing', () => {
    const config = new GraphQLConfig(
      {
        filepath: temp.absolutePath('.graphqlconfig'),
        config: {
          schemaPath: './schema.graphql',
          includes: ['./src/**/*.ts'],
          extensions: {
            codegen: {
              generates: {},
            },
          },
        },
      },
      [],
    );

    const project = config.getDefault();

    expect(project.isLegacy).toBe(true);
    expect(project.extension('codegen')).toEqual({ generates: {} });
    expect(() => project.extension('missing')).toThrow(ExtensionMissingError);
  });

  test('merges registered extension metadata with project pointers', () => {
    const config = new GraphQLConfig(
      {
        filepath: temp.absolutePath('graphql.config.js'),
        config: {
          schema: './schema.graphql',
          documents: './src/**/*.graphql',
          include: './src/**/*',
          exclude: './src/ignored/**',
          extensions: {
            custom: {
              enabled: true,
            },
          },
        },
      },
      [() => ({ name: 'custom' })],
    );

    expect(config.getDefault().extension('custom')).toEqual({
      enabled: true,
      schema: './schema.graphql',
      documents: './src/**/*.graphql',
      include: './src/**/*',
      exclude: './src/ignored/**',
    });
  });

  test('matches schema and document pointer objects while ignoring SDL strings', () => {
    const schemaSDL = 'type Query {\n  foo: String\n}';
    const config = new GraphQLConfig(
      {
        filepath: temp.absolutePath('graphql.config.js'),
        config: {
          projects: {
            urlSchema: {
              schema: {
                './schema.graphql': {
                  headers: {
                    Authorization: 'token',
                  },
                },
              },
            },
            inlineSchema: {
              schema: schemaSDL,
              include: './fallback/**/*.ts',
            },
          },
        },
      },
      [],
    );

    expect(config.getProjectForFile('./schema.graphql').name).toBe('urlSchema');
    expect(config.getProjectForFile('./fallback/component.ts').name).toBe('inlineSchema');
  });

  test('throws when no project matches and all projects define include or exclude', () => {
    const config = new GraphQLConfig(
      {
        filepath: temp.absolutePath('graphql.config.js'),
        config: {
          projects: {
            app: {
              schema: './schema.graphql',
              include: './app/**',
            },
            admin: {
              schema: './admin-schema.graphql',
              exclude: './ignored/**',
            },
          },
        },
      },
      [],
    );

    expect(() => config.getProjectForFile('./other/file.ts')).toThrow("File './other/file.ts' doesn't match any project");
  });
});

describe('LoadersRegistry conversions', () => {
  test('returns schema as string and DocumentNode after applying middleware', async () => {
    const registry = new LoadersRegistry({ cwd: temp.dir });
    const doc = parse(/* GraphQL */ `
      type Query {
        foo: String
      }
    `);

    vi.spyOn(registry, 'loadTypeDefs').mockResolvedValue([{ document: doc }] as Array<{ document: DocumentNode }>);
    registry.override([
      {
        loaderId: () => 'custom',
        canLoad: async () => true,
        canLoadSync: () => true,
        load: async () => [{ document: doc }],
        loadSync: () => [{ document: doc }],
      },
    ]);
    registry.use((document) => ({
      ...document,
      definitions: document.definitions.filter((definition) => definition.kind === Kind.OBJECT_TYPE_DEFINITION),
    }));

    const schemaAsString = await registry.loadSchema('schema.graphql', 'string');
    const schemaAsDocument = await registry.loadSchema('schema.graphql', 'DocumentNode');

    expect(schemaAsString).toContain('type Query');
    expect(schemaAsDocument.kind).toBe(Kind.DOCUMENT);
  });

  test('composes middleware functions in order', () => {
    const pipeline = useMiddleware<string>([(value) => `${value}a`, (value) => `${value}b`]);

    expect(pipeline('')).toBe('ab');
    expect(useMiddleware<string>([])('start')).toBe('start');
  });

  test('casts transformed schema sources into GraphQLSchema synchronously', () => {
    const registry = new LoadersRegistry({ cwd: temp.dir });
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        bar: String
      }
    `);

    registry.override([
      {
        loaderId: () => 'custom',
        canLoad: async () => true,
        canLoadSync: () => true,
        load: async () => [{ schema }],
        loadSync: () => [{ schema }],
      },
    ]);
    registry.use((document) => document);

    expect(registry.loadSchemaSync('schema.graphql', 'GraphQLSchema').getQueryType()?.getFields().bar).toBeDefined();
  });
});
