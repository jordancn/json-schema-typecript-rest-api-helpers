# JSON Schema TypeScript REST API Helpers

## Introduction

This repository contains a set of API helpers in TypeScript that are intended for use with a REST API. JSON Schema validation is performed at run-time for the both outgoing requests and incoming responses.

TypeScript types are generated from the JSON Schema files for build-time type-checking.

In addition to the fairly standard and routine functionality above, a clean API is available to the client code (see `sample.ts`) providing the caller with auto-complete as well as removing the distinction between URL request params and request body variables as this is done automatically.

## Usage

1. Generate the TypeScript types from the JSON Schema:

```
$ yarn generate-types
```

This reads JSON Schema files from `api/schema` and populates TypeScript type into `api/types`. It also generates an `index.ts` for the Schema and types in `api/schema/index.ts` and `api/types/index.ts` respectively.

2. Run the sample

```
yarn run-sample
```




