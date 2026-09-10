import path from 'node:path';
import { describe, expect, test, vi } from 'vitest';
import { GraphQLExtensionsRegistry } from '../src/extension';
import {
  ConfigEmptyError,
  ConfigInvalidError,
  ConfigNotFoundError,
  ExtensionMissingError,
  LoaderNoResultError,
  LoadersMissingError,
  ProjectNotFoundError,
  composeMessage,
} from '../src/errors';
import { getConfig, getConfigSync } from '../src/helpers/get-config';
import { TempDir } from './utils/temp-dir';

const temp = new TempDir();

afterEach(() => {
  temp.clean();
});

afterAll(() => {
  temp.deleteTempDir();
});

describe('getConfig helpers', () => {
  test('loads a concrete config file asynchronously', async () => {
    temp.createFile('schema.graphql', 'type Query { hello: String }');
    temp.createFile('.graphqlrc', 'schema: schema.graphql');

    const configPath = path.join(temp.dir, '.graphqlrc');
    const result = await getConfig({ filepath: configPath, configName: 'graphql' });

    expect(result.filepath).toBe(configPath);
    expect(result.config).toEqual({ schema: 'schema.graphql' });
  });

  test('loads a concrete config file synchronously', () => {
    temp.createFile('schema.graphql', 'type Query { hello: String }');
    temp.createFile('graphql.config.json', JSON.stringify({ schema: 'schema.graphql' }));

    const configPath = path.join(temp.dir, 'graphql.config.json');
    const result = getConfigSync({ filepath: configPath, configName: 'graphql' });

    expect(result.filepath).toBe(configPath);
    expect(result.config).toEqual({ schema: 'schema.graphql' });
  });

  test('throws when filepath is missing', async () => {
    await expect(getConfig({ filepath: '', configName: 'graphql' })).rejects.toThrow(
      'Defining a file path is required',
    );
    expect(() => getConfigSync({ filepath: '', configName: 'graphql' })).toThrow('Defining a file path is required');
  });

  test('throws for a missing explicit file', async () => {
    const missingPath = path.join(temp.dir, 'missing.graphqlrc');

    await expect(getConfig({ filepath: missingPath, configName: 'graphql' })).rejects.toThrow(
      'no such file or directory',
    );
    expect(() => getConfigSync({ filepath: missingPath, configName: 'graphql' })).toThrow('no such file or directory');
  });

  test('throws ConfigEmptyError for an empty config file', async () => {
    temp.createFile('.graphqlrc', '');
    const configPath = path.join(temp.dir, '.graphqlrc');

    await expect(getConfig({ filepath: configPath, configName: 'graphql' })).rejects.toBeInstanceOf(ConfigEmptyError);
    expect(() => getConfigSync({ filepath: configPath, configName: 'graphql' })).toThrow(ConfigEmptyError);
  });
});

describe('extension registry', () => {
  test('registers, lists, reads, and iterates extensions', () => {
    const registry = new GraphQLExtensionsRegistry({ cwd: temp.dir });
    const callback = vi.fn();

    registry.register(({ loaders }) => {
      loaders.schema.use((document) => document);

      return { name: 'coverage-extension', enabled: true } as any;
    });

    expect(registry.has('coverage-extension')).toBe(true);
    expect(registry.get('coverage-extension')).toMatchObject({ name: 'coverage-extension', enabled: true });
    expect(registry.names()).toEqual(['coverage-extension']);

    registry.forEach(callback);
    expect(callback).toHaveBeenCalledWith(expect.objectContaining({ name: 'coverage-extension' }));
  });
});

describe('custom error classes', () => {
  test('composeMessage joins lines and custom errors preserve names/messages', () => {
    expect(composeMessage('one', 'two')).toBe('one\ntwo');

    for (const ErrorClass of [
      ConfigInvalidError,
      ConfigNotFoundError,
      ProjectNotFoundError,
      LoadersMissingError,
      LoaderNoResultError,
      ExtensionMissingError,
    ]) {
      const error = new ErrorClass('coverage branch');
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe(ErrorClass.name);
      expect(error.message).toBe('coverage branch');
    }
  });
});
