This document describes the process of developing the code of the PathCalc app framework. It is not necesary to understand these details if you only want to configure a new instance of PathCalc.

# Overview

The system has two main components:

- a data preparation pipeline (a command line application ran locally with Bun)
- a fully pre-rendered web application based on Vike and React

# Working with the code

To install dependencies:

```
bun install
```

## Vike-based web app

To run a dev server for the web app:

```
bun dev
```

Vike's CLI doesn't accept Vite arguments. Instead, you need to pass them in an env var like this:

```
VITE_CONFIG="{server:{host:'0.0.0.0'}}" bun dev
```

To run a production build of the app:

```
bun run build
```

(don't run `bun build` because that will run Bun's own build system which won't work with this project)

To run a server to preview the production build locally:

```
bun preview
```

currently Vike's limitation causes the preview script to run a local server with SSR.
If you want to strictly test the generated client bundle, run something like

```
serve dist/client
```

### Shadcn/ui

To add a `shadcn/ui` component, e.g. Drawer:

```
bun shadcn add drawer
```

Because of a limitation in shadcn/ui picking up information from multiple `tsconfig.json` files, the components directory will be generated in the wrong location (inside `src-pipeline/`) - you need to move it manually to the correct location inside `src/`.

## JSON Schemas for editing configuration files

For the system admin's convenience, JSON Schema files are generated to provide autocomplete and hover info inside the config files (both for pipeline and web app configuration).

The set-up for schema generation is in the `generateSchemas.ts` file, which can easily be ran with:

```
bun schemas
```

This will clear the `docs/schemas` directory and re-generate the contents based on the config inside `generateSchemas.ts`.

The files inside `docs/schemas` need to be linked to from `.vscode/settings.json` (`json.schemas` field) so that VSCode uses an applicable schemas when one of the config files are being edited.
