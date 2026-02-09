import { Source, Loader } from '@graphql-tools/utils';
import {
  loadSchema,
  loadSchemaSync,
  loadTypedefs,
  loadTypedefsSync,
  loadDocuments,
  loadDocumentsSync,
  UnnormalizedTypeDefPointer,
  LoadTypedefsOptions as ToolsLoadTypedefsOptions,
  LoadSchemaOptions as ToolsLoadSchemaOptions,
  OPERATION_KINDS,
} from '@graphql-tools/load';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { GraphQLSchema, DocumentNode, buildASTSchema, print } from 'graphql';
import { MiddlewareFn, useMiddleware } from './helpers/index.js';

type Pointer = UnnormalizedTypeDefPointer | UnnormalizedTypeDefPointer[];
type LoadTypedefsOptions = Partial<ToolsLoadTypedefsOptions>;
type LoadSchemaOptions = Partial<ToolsLoadSchemaOptions>;
export type SchemaOutput = 'GraphQLSchema' | 'DocumentNode' | 'string';

export class LoadersRegistry {
  private _loaders = new Set<Loader>();
  private _middlewares: MiddlewareFn<DocumentNode>[] = [];
  private readonly cwd: string;

  constructor({ cwd }: { cwd: string }) {
    this.cwd = cwd;
  }

  register(loader: Loader): void {
    this._loaders.add(loader);
  }

  override(loaders: Loader[]): void {
    this._loaders = new Set(loaders);
  }

  use(middleware: MiddlewareFn<DocumentNode>): void {
    this._middlewares.push(middleware);
  }

  async loadTypeDefs(pointer: Pointer, options?: LoadTypedefsOptions): Promise<Source[]> {
    return loadTypedefs(pointer, {
      loaders: Array.from(this._loaders),
      cwd: this.cwd,
      ...options,
    });
  }

  loadTypeDefsSync(pointer: Pointer, options?: LoadTypedefsOptions): Source[] {
    return loadTypedefsSync(pointer, this.createOptions(options));
  }

  async loadDocuments(pointer: Pointer, options?: LoadTypedefsOptions): Promise<Source[]> {
    return loadDocuments(pointer, this.createOptions(options));
  }

  loadDocumentsSync(pointer: Pointer, options?: LoadTypedefsOptions): Source[] {
    return loadDocumentsSync(pointer, this.createOptions(options));
  }

  async loadSchema(pointer: Pointer): Promise<GraphQLSchema>;
  async loadSchema(pointer: Pointer, out: 'string', options?: LoadSchemaOptions): Promise<GraphQLSchema>;
  async loadSchema(pointer: Pointer, out: 'DocumentNode', options?: LoadSchemaOptions): Promise<DocumentNode>;
  async loadSchema(pointer: Pointer, out: 'GraphQLSchema', options?: LoadSchemaOptions): Promise<GraphQLSchema>;
  async loadSchema(
    pointer: Pointer,
    out?: SchemaOutput,
    options?: LoadSchemaOptions,
  ): Promise<GraphQLSchema | DocumentNode | string> {
    out = out || 'GraphQLSchema';
    const loadSchemaOptions = this.createOptions(options);

    if (out === 'GraphQLSchema' && !this._middlewares.length) {
      return loadSchema(pointer, loadSchemaOptions);
    }

    const schemaDoc = this.transformSchemaSources(
      await loadTypedefs(pointer, {
        filterKinds: OPERATION_KINDS,
        ...loadSchemaOptions,
      }),
    );

    // TODO: TS screams about `out` not being compatible with SchemaOutput
    return this.castSchema(schemaDoc, out as any);
  }

  loadSchemaSync(pointer: Pointer): GraphQLSchema;
  loadSchemaSync(pointer: Pointer, out: 'string', options?: LoadSchemaOptions): GraphQLSchema;
  loadSchemaSync(pointer: Pointer, out: 'DocumentNode', options?: LoadSchemaOptions): DocumentNode;
  loadSchemaSync(pointer: Pointer, out: 'GraphQLSchema', options?: LoadSchemaOptions): GraphQLSchema;
  loadSchemaSync(
    pointer: Pointer,
    out?: SchemaOutput,
    options?: LoadSchemaOptions,
  ): GraphQLSchema | DocumentNode | string {
    out = out || 'GraphQLSchema';
    const loadSchemaOptions = this.createOptions(options);

    if (out === 'GraphQLSchema' && !this._middlewares.length) {
      return loadSchemaSync(pointer, loadSchemaOptions);
    }

    const schemaDoc = this.transformSchemaSources(
      loadTypedefsSync(pointer, {
        filterKinds: OPERATION_KINDS,
        ...loadSchemaOptions,
      }),
    );

    return this.castSchema(schemaDoc, out as any);
  }

  private createOptions<T extends object>(options?: T) {
    const optionsWithConfig = options as T & { config?: object };
    const nestedConfig =
      optionsWithConfig && typeof optionsWithConfig.config === 'object'
        ? optionsWithConfig.config
        : undefined;

    return {
      loaders: Array.from(this._loaders),
      cwd: this.cwd,
      ...options,
      ...nestedConfig,
    };
  }

  private transformSchemaSources(sources: Source[]) {
    const documents: DocumentNode[] = sources.map((source) => source.document);
    const document = mergeTypeDefs(documents);

    return useMiddleware(this._middlewares)(document);
  }

  private castSchema(doc: DocumentNode, out: 'string'): string;
  private castSchema(doc: DocumentNode, out: 'DocumentNode'): DocumentNode;
  private castSchema(doc: DocumentNode, out: 'GraphQLSchema'): GraphQLSchema;
  private castSchema(doc: DocumentNode, out: SchemaOutput): string | DocumentNode | GraphQLSchema {
    if (out === 'DocumentNode') {
      return doc;
    }

    if (out === 'GraphQLSchema') {
      return buildASTSchema(doc);
    }

    return print(doc);
  }
}
