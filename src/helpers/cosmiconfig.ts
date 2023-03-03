import { cosmiconfig, cosmiconfigSync, Loader, defaultLoaders } from 'cosmiconfig';
import { env } from 'string-env-interpolation';

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
  const options = prepareCosmiconfig(moduleName, legacy);

  return cosmiconfig(moduleName, options);
}

export function createCosmiConfigSync(moduleName: string, legacy: boolean) {
  const options = prepareCosmiconfig(moduleName, legacy);

  return cosmiconfigSync(moduleName, options);
}

const loadTypeScript: Loader = (...args) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { TypeScriptLoader } = require('cosmiconfig-typescript-loader');
    return TypeScriptLoader({ transpileOnly: true })(...args);
  } catch (err) {
    if (isRequireESMError(err)) {
      return jitiLoader(...args);
    }
  }
};

const jitiLoader: Loader = (filepath) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const jiti = require('jiti')(__filename, {
    interopDefault: true,
  });
  return jiti(filepath);
};

const loadToml: Loader = (...args) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { loadToml } = require('cosmiconfig-toml-loader');
  return createCustomLoader(loadToml)(...args);
};

function prepareCosmiconfig(moduleName: string, legacy: boolean) {
  const loadYaml = createCustomLoader(defaultLoaders['.yaml']);

  const searchPlaces = [
    '#.config.ts',
    '#.config.cts',
    '#.config.mts',
    '#.config.js',
    '#.config.cjs',
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
      '.ts': loadTypeScript,
      '.mts': createCustomLoader(jitiLoader),
      '.cts': createCustomLoader(jitiLoader),
      '.js': defaultLoaders['.js'],
      '.json': createCustomLoader(defaultLoaders['.json']),
      '.yaml': loadYaml,
      '.yml': loadYaml,
      '.toml': loadToml,
      noExt: loadYaml,
    },
  };
}

function isRequireESMError(err: any) {
  return typeof err.stack === 'string' && err.stack.startsWith('Error [ERR_REQUIRE_ESM]:');
}
