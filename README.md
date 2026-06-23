# node thing

A local node-based image editor powered by WebGPU compute shaders.

The app has no accounts, marketplace, cloud storage, sharing, or remote
services. Projects and imported images stay on the local machine.

## Development

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Verification

```bash
pnpm exec jest --runInBand
pnpm lint
pnpm build
pnpm electron:build
```

## Electron

Build the web app and Electron entry points:

```bash
pnpm build
pnpm electron:build
pnpm exec electron build/main.js
```

## Projects

Use the File menu to save and open local ZIP project files. Projects include
the node graph and imported image assets.

Only shaders defined in `src/utils/node-type.ts` are supported. Projects that
contain old custom or marketplace shader nodes are rejected without changing
the current project.

This cleanup uses new local persistence keys, so state saved by older versions
is not restored.
