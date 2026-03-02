---
id: schema
title: Specifying schema
sidebar_label: Specifying schema
---

The simplest config specifies only `schema` which points to the source of GraphQL schema.

```yaml
schema: ./schema.graphql
```

GraphQL Config can start with a single schema and grow from there.

### Multiple files

GraphQL Config can also assemble multiple modularized schemas into a single GraphQL schema object.

You can specify a list of files:

```yaml
schema:
  - ./foo.graphql
  - ./bar.graphql
  - ./baz.graphql
```

Alternatively, you can use a glob pattern to find and include pieces of schema:

```yaml
schema: ./*.graphql
```

GraphQL Config looks for those files, reads and merges them together to produce a GraphQL schema object.

### Introspection result

A very common way to describe a GraphQL schema is to run an introspection query on it and save the resulting output as a JSON file. GraphQL Config can also read these files into schema objects.

```yaml
schema: ./schema.json
```

Note that JSON introspection results are parsed for both file validity and for schema validity; if either check fails, an error message will be passed back to the caller.

### Endpoint

In case you want to access a running GraphQL server via its endpoint, you can pass its address into the configuration file.

```yaml
schema: http://localhost:4000/graphql
```

### Environment variables
It is possible to load definitions from environment variables, with or without fallback values.

```yaml
schema: ${SCHEMA_FILE:./schema.json}
```

If you want to define a fallback endpoint you may wrap your value with quotation marks.

```yaml
schema: ${SCHEMA_ENDPOINT:"http://localhost:4000/graphql"}
```

### Passing headers
If you need to pass headers in the schema request you can do it this way:

```yaml
schema:
  - http://localhost:4000/graphql:
      headers:
        Authorization: Token
```
> Pay special attention to the indentation of the headers block.
