import { cosmiconfig, cosmiconfigSync, Loader, defaultLoaders } from 'cosmiconfig';
import { env } from 'string-env-interpolation';
import { createJiti } from 'jiti';

export interface ConfigSearchResult {
  config: any;
  filepath: string;
  isEmpty?: boolean;
}

const legacySearchPlaces = [
  '.graphqlconfig',
  '.graphqlconfig.json',
  '.graphqlconfig.yaml',
  '.graphqlconfig.yml',
] as const;

export function isLegacyConfig(filePath: string): boolean {
  filePath = filePath.toLowerCase();
  return legacySearchPlaces.some((name) => filePath.endsWith(name));
}

function transformContent(content: string): string {
  return env(content);
}

function createCustomLoader(loader: Loader): Loader {
  return (filePath, content) => loader(filePath, transformContent(content));
}

export function createCosmiConfig(moduleName: string, legacy: boolean) {
  const options = prepareCosmiconfig(moduleName, legacy, 'async');
  return cosmiconfig(moduleName, options);
}

export function createCosmiConfigSync(moduleName: string, legacy: boolean) {
  const options = prepareCosmiconfig(moduleName, legacy, 'sync');
  return cosmiconfigSync(moduleName, options);
}

const loadTypeScript: Loader = (filepath) => {
  const jiti = createJiti(__filename, { interopDefault: true });
  return jiti.import(filepath);
};

const loadTypeScriptSync: Loader = (filepath) => {
  const jiti = createJiti(__filename, { interopDefault: true });
  return jiti(filepath);
};

const loadToml: Loader = (...args) => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { loadToml } = require('cosmiconfig-toml-loader');
  return createCustomLoader(loadToml)(...args);
};

const loadYaml = createCustomLoader(defaultLoaders['.yaml']);

function prepareCosmiconfig(
  moduleName: string,
  legacy: boolean,
  mode: 'sync' | 'async',
): {
  searchPlaces: string[];
  loaders: Record<string, Loader>;
} {
  const searchPlaces = [
    '#.config.ts',
    '#.config.cts',
    '#.config.mts',
    '#.config.js',
    '#.config.cjs',
    '#.config.mjs',
    '#.config.json',
    '#.config.yaml',
    '#.config.yml',
    '#.config.toml',
    '.#rc',
    '.#rc.ts',
    '.#rc.cts',
    '.#rc.mts',
    '.#rc.js',
    '.#rc.cjs',
    '.#rc.mjs',
    '.#rc.json',
    '.#rc.yml',
    '.#rc.yaml',
    '.#rc.toml',
    'package.json',
  ];

  if (legacy) {
    searchPlaces.push(...legacySearchPlaces);
  }

  // We need to wrap loaders in order to access and transform file content (as string)
  // Cosmiconfig has transform option but at this point config is not a string but an object
  return {
    searchPlaces: searchPlaces.map((place) => place.replace('#', moduleName)),
    loaders: {
      '.ts': mode === 'async' ? loadTypeScript : loadTypeScriptSync,
      '.cts': mode === 'async' ? loadTypeScript : loadTypeScriptSync,
      '.mts': mode === 'async' ? loadTypeScript : loadTypeScriptSync,
      '.js': mode === 'async' ? loadTypeScript : loadTypeScriptSync,
      '.mjs': mode === 'async' ? loadTypeScript : loadTypeScriptSync,
      '.json': defaultLoaders['.json'],
      '.yaml': loadYaml,
      '.yml': loadYaml,
      '.toml': loadToml,
      noExt: loadYaml,
    },
  };
}
