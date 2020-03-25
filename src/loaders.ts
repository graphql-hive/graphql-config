import {Source, Loader} from '@graphql-toolkit/common';
import {
  UnnormalizedTypeDefPointer,
  LoadTypedefsOptions,
  loadDocuments,
  loadDocumentsSync,
  OPERATION_KINDS,
  loadTypedefs,
  loadTypedefsSync,
} from '@graphql-toolkit/core';
import {mergeTypeDefs} from '@graphql-toolkit/schema-merging';
import {GraphQLSchema, DocumentNode, buildASTSchema} from 'graphql';
import {MiddlewareFn, useMiddleware} from './helpers/utils';

type Pointer = UnnormalizedTypeDefPointer | UnnormalizedTypeDefPointer[];
type Options = Partial<LoadTypedefsOptions>;

export class LoadersRegistry {
  private _loaders: Loader[] = [];
  private _middlewares: MiddlewareFn<DocumentNode>[] = [];
  private readonly cwd: string;

  constructor({cwd}: {cwd: string}) {
    this.cwd = cwd;
  }

  register(loader: Loader): void {
    if (!this._loaders.some(l => l.loaderId() === loader.loaderId())) {
      this._loaders.push(loader);
    }
  }

  use(middleware: MiddlewareFn<DocumentNode>): void {
    this._middlewares.push(middleware);
  }

  async loadTypeDefs(pointer: Pointer, options?: Options): Promise<Source[]> {
    return loadTypedefs(pointer, {
      loaders: this._loaders,
      cwd: this.cwd,
      ...options,
    });
  }

  loadTypeDefsSync(pointer: Pointer, options?: Options): Source[] {
    return loadTypedefsSync(pointer, this.createOptions(options));
  }

  async loadDocuments(pointer: Pointer, options?: Options): Promise<Source[]> {
    return loadDocuments(pointer, this.createOptions(options));
  }

  loadDocumentsSync(pointer: Pointer, options?: Options): Source[] {
    return loadDocumentsSync(pointer, this.createOptions(options));
  }

  async loadSchema(
    pointer: Pointer,
    options?: Options,
  ): Promise<GraphQLSchema> {
    const sources = await loadTypedefs(pointer, {
      filterKinds: OPERATION_KINDS,
      ...this.createOptions(options),
    });

    return this.buildSchema(sources);
  }

  loadSchemaSync(pointer: Pointer, options?: Options): GraphQLSchema {
    const sources = loadTypedefsSync(pointer, {
      filterKinds: OPERATION_KINDS,
      ...this.createOptions(options),
    });

    return this.buildSchema(sources);
  }

  private createOptions<T extends object>(options?: T) {
    return {
      loaders: this._loaders,
      cwd: this.cwd,
      ...options,
    };
  }

  private buildSchema(sources: Source[]) {
    const documents: DocumentNode[] = sources.map(source => source.document);
    const document = mergeTypeDefs(documents);

    return buildASTSchema(useMiddleware(this._middlewares)(document));
  }
}
