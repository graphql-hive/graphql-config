import { DirectiveDefinitionNode, buildSchema, GraphQLSchema, Kind } from 'graphql';
import { Loader, Source } from '@graphql-tools/utils';
import { LoadersRegistry } from 'graphql-config';
import { Mock } from 'vitest';
import { loadTypedefsSync, loadSchemaSync, loadSchema, LoadSchemaOptions } from '@graphql-tools/load';

vi.mock('@graphql-tools/load', async () => {
  const { parse, buildSchema } = await import('graphql');
  const document = parse(/* GraphQL */ `
    type Query {
      foo: String @cache
    }
  `);

  const schema = buildSchema(/* GraphQL */ `
    type Query {
      foo: String
    }
  `);

  // @ts-expect-error - we're adding a property here
  schema.isTheOne = true;

  const { OPERATION_KINDS } = await vi.importActual('@graphql-tools/load');

  return {
    OPERATION_KINDS,
    loadTypedefs: vi.fn(() => [{ document }]),
    loadTypedefsSync: vi.fn(() => [{ document }]),
    loadSchemaSync: vi.fn(() => schema),
    loadSchema: vi.fn(() => schema),
  };
});

describe('middlewares', () => {
  test('loads Sources instead of GraphQLSchema when middlewares are defined', () => {
    const registry = new LoadersRegistry({ cwd: __dirname });

    const cacheDirective: DirectiveDefinitionNode = {
      kind: Kind.DIRECTIVE_DEFINITION,
      name: {
        kind: Kind.NAME,
        value: 'cache',
      },
      repeatable: false,
      locations: [
        {
          kind: Kind.NAME,
          value: 'FIELD_DEFINITION',
        },
      ],
    };

    registry.use((doc) => ({
      ...doc,
      definitions: [...doc.definitions, cacheDirective],
    }));

    const schema = registry.loadSchemaSync('anything');

    expect(schema.getDirective('cache')).toBeDefined();
  });

  test('no middlewares means we load GraphQLSchema directly', async () => {
    const registry = new LoadersRegistry({ cwd: __dirname });

    const received = registry.loadSchemaSync('anything');
    const receivedAsync = await registry.loadSchema('anything');

    // @ts-expect-error - we're adding a property here
    expect(received.isTheOne).toEqual(true);
    // @ts-expect-error - we're adding a property here
    expect(receivedAsync.isTheOne).toEqual(true);
  });
});

class CustomLoader implements Loader {
  constructor(private schema: GraphQLSchema) {}

  loaderId(): string {
    return 'custom';
  }

  async canLoad(): Promise<boolean> {
    return true;
  }

  canLoadSync(): boolean {
    return true;
  }

  async load(): Promise<Source[]> {
    return [{ schema: this.schema }];
  }

  loadSync(): Source[] {
    return [{ schema: this.schema }];
  }
}

const differentSchema = buildSchema(/* GraphQL */ `
  type Query {
    bar: String
  }
`);

describe('override', () => {
  beforeAll(async () => {
    const load = await vi.importActual<any>('@graphql-tools/load');
    (loadTypedefsSync as Mock).mockImplementation(load.loadTypedefsSync);
    (loadSchemaSync as Mock).mockImplementation(load.loadSchemaSync);
    (loadSchema as Mock).mockImplementation(load.loadSchema);
  });

  test('overrides default loaders', async () => {
    const registry = new LoadersRegistry({ cwd: __dirname });

    registry.override([new CustomLoader(differentSchema)]);

    const received = registry.loadSchemaSync('anything');
    const receivedAsync = await registry.loadSchema('anything');

    expect(received.getQueryType().getFields().bar).toBeDefined();
    expect(receivedAsync.getQueryType().getFields().bar).toBeDefined();
  });

  test('allows custom loader options', async () => {
    const registry = new LoadersRegistry({ cwd: __dirname });
    const customOptions = { assumeValidSDL: true } as Partial<LoadSchemaOptions>;
    const customLoader = new CustomLoader(differentSchema);
    const expectedOptions = {
      ...customOptions,
      cwd: __dirname,
      loaders: [customLoader],
    };

    registry.override([customLoader]);

    const received = registry.loadSchemaSync('anything', null, customOptions);
    const receivedAsync = await registry.loadSchema('anything', null, customOptions);

    expect(received.getQueryType().getFields().bar).toBeDefined();
    expect(receivedAsync.getQueryType().getFields().bar).toBeDefined();
    expect(loadSchema).toBeCalledWith('anything', expectedOptions);

    expect(loadSchemaSync).toBeCalledWith('anything', expectedOptions);
  });

  test('flattens nested config options', async () => {
    const registry = new LoadersRegistry({ cwd: __dirname });
    const customLoader = new CustomLoader(differentSchema);
    const customOptions = {
      config: {
        inputValueDeprecation: true,
      },
    } as Partial<LoadSchemaOptions> & { config: { inputValueDeprecation: boolean } };

    registry.override([customLoader]);

    await registry.loadSchema('anything', null, customOptions as Partial<LoadSchemaOptions>);
    registry.loadSchemaSync('anything', null, customOptions as Partial<LoadSchemaOptions>);

    expect(loadSchema).toHaveBeenLastCalledWith(
      'anything',
      expect.objectContaining({
        cwd: __dirname,
        loaders: [customLoader],
        inputValueDeprecation: true,
      }),
    );

    expect(loadSchemaSync).toHaveBeenLastCalledWith(
      'anything',
      expect.objectContaining({
        cwd: __dirname,
        loaders: [customLoader],
        inputValueDeprecation: true,
      }),
    );
  });
});
