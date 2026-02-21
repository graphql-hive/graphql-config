import { dirname, isAbsolute, relative, normalize } from 'path';
import type { GraphQLSchema, DocumentNode } from 'graphql';
import type { Source } from '@graphql-tools/utils';
import { minimatch } from 'minimatch';
import {
  LoadSchemaOptions as ToolsLoadSchemaOptions,
  LoadTypedefsOptions as ToolsLoadTypedefsOptions,
  UnnormalizedTypeDefPointer,
} from '@graphql-tools/load';
import { ExtensionMissingError } from './errors.js';
import type { GraphQLExtensionsRegistry } from './extension.js';
import type { IExtensions, IGraphQLProject, IGraphQLProjectLegacy, WithList } from './types.js';
import { isLegacyProjectConfig } from './helpers/index.js';
import type { SchemaOutput } from './loaders.js';

type Pointer = UnnormalizedTypeDefPointer | UnnormalizedTypeDefPointer[];
type LoadTypedefsOptions = Partial<ToolsLoadTypedefsOptions>;
type LoadSchemaOptions = Partial<ToolsLoadSchemaOptions>;

export class GraphQLProjectConfig {
  readonly schema: Pointer;
  readonly documents?: UnnormalizedTypeDefPointer | UnnormalizedTypeDefPointer[];
  readonly include?: WithList<string>;
  readonly exclude?: WithList<string>;
  readonly extensions: IExtensions;
  readonly filepath: string;
  readonly dirpath: string;
  readonly name: string;
  readonly isLegacy: boolean;

  private readonly _extensionsRegistry: GraphQLExtensionsRegistry;

  constructor({
    filepath,
    name,
    config,
    extensionsRegistry,
  }: {
    filepath: string;
    name: string;
    config: IGraphQLProject | IGraphQLProjectLegacy;
    extensionsRegistry: GraphQLExtensionsRegistry;
  }) {
    this.filepath = filepath;
    this.dirpath = dirname(filepath);
    this.name = name;
    this.extensions = config.extensions || {};

    if (isLegacyProjectConfig(config)) {
      this.schema = config.schemaPath;
      this.include = config.includes;
      this.exclude = config.excludes;
      this.isLegacy = true;
    } else {
      this.schema = config.schema;
      this.documents = config.documents;
      this.include = config.include;
      this.exclude = config.exclude;
      this.isLegacy = false;
    }

    this._extensionsRegistry = extensionsRegistry;
  }

  hasExtension(name: string): boolean {
    return Boolean(this.extensions[name]);
  }

  extension<T = any>(name: string): T {
    if (this.isLegacy) {
      const extension = this.extensions[name];

      if (!extension) {
        throw new ExtensionMissingError(`Project ${this.name} is missing ${name} extension`);
      }

      return extension;
    }

    const extension = this._extensionsRegistry.get(name);

    if (!extension) {
      throw new ExtensionMissingError(`Project ${this.name} is missing ${name} extension`);
    }

    return {
      ...this.extensions[name],
      schema: this.schema,
      documents: this.documents,
      include: this.include,
      exclude: this.exclude,
    };
  }

  // Get Schema

  async getSchema(): Promise<GraphQLSchema>;
  async getSchema(out: 'DocumentNode'): Promise<DocumentNode>;
  async getSchema(out: 'GraphQLSchema'): Promise<GraphQLSchema>;
  async getSchema(out: 'string'): Promise<string>;
  async getSchema(out?: SchemaOutput): Promise<GraphQLSchema | DocumentNode | string> {
    return this.loadSchema(this.schema, out as any);
  }

  getSchemaSync(): GraphQLSchema;
  getSchemaSync(out: 'DocumentNode'): DocumentNode;
  getSchemaSync(out: 'GraphQLSchema'): GraphQLSchema;
  getSchemaSync(out: 'string'): string;
  getSchemaSync(out?: SchemaOutput): GraphQLSchema | DocumentNode | string {
    return this.loadSchemaSync(this.schema, out as any);
  }

  // Get Documents

  async getDocuments(): Promise<Source[]> {
    if (!this.documents) {
      return [];
    }

    return this.loadDocuments(this.documents);
  }

  getDocumentsSync(): Source[] {
    if (!this.documents) {
      return [];
    }

    return this.loadDocumentsSync(this.documents);
  }

  // Load Schema

  async loadSchema(pointer: Pointer): Promise<GraphQLSchema>;
  async loadSchema(pointer: Pointer, out: 'string', options?: LoadSchemaOptions): Promise<GraphQLSchema>;
  async loadSchema(pointer: Pointer, out: 'DocumentNode', options?: LoadSchemaOptions): Promise<DocumentNode>;
  async loadSchema(pointer: Pointer, out: 'GraphQLSchema', options?: LoadSchemaOptions): Promise<GraphQLSchema>;
  async loadSchema(
    pointer: Pointer,
    out?: SchemaOutput,
    options?: LoadSchemaOptions,
  ): Promise<GraphQLSchema | DocumentNode | string> {
    return this._extensionsRegistry.loaders.schema.loadSchema(pointer, out as any, options);
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
    return this._extensionsRegistry.loaders.schema.loadSchemaSync(pointer, out as any, options);
  }

  // Load Documents

  async loadDocuments(pointer: Pointer, options?: LoadTypedefsOptions): Promise<Source[]> {
    if (!pointer) {
      return [];
    }

    return this._extensionsRegistry.loaders.documents.loadDocuments(pointer, {
      ...options,
      ignore: options?.ignore ? options?.ignore : this.exclude,
    });
  }

  loadDocumentsSync(pointer: Pointer, options?: LoadTypedefsOptions): Source[] {
    if (!pointer) {
      return [];
    }

    return this._extensionsRegistry.loaders.documents.loadDocumentsSync(pointer, {
      ...options,
      ignore: options?.ignore ? options?.ignore : this.exclude,
    });
  }

  // Rest

  match(filepath: string): boolean {
    const isSchemaOrDocument = [this.schema, this.documents].some((pointer) => match(filepath, this.dirpath, pointer));

    if (isSchemaOrDocument) {
      return true;
    }

    const isExcluded = this.exclude ? match(filepath, this.dirpath, this.exclude) : false;

    if (isExcluded) {
      return false;
    }

    return this.include ? match(filepath, this.dirpath, this.include) : false;
  }
}

function isSDLSchemaLike(schema: string): boolean {
  return schema.includes('\n');
}

// XXX: it works but uses Node.js - expose normalization of file and dir paths in config
function match(filepath: string, dirpath: string, pointer?: Pointer): boolean {
  if (!pointer) {
    return false;
  }

  if (Array.isArray(pointer)) {
    return pointer.some((p) => match(filepath, dirpath, p));
  }

  if (typeof pointer === 'string') {
    if (isSDLSchemaLike(pointer)) {
      return false;
    }

    const normalizedFilepath = normalize(isAbsolute(filepath) ? relative(dirpath, filepath) : filepath)
      .split('\\')
      .join('/');
    return minimatch(normalizedFilepath, normalize(pointer).split('\\').join('/'), { dot: true });
  }

  if (typeof pointer === 'object') {
    return match(filepath, dirpath, Object.keys(pointer)[0]);
  }

  return false;
}
