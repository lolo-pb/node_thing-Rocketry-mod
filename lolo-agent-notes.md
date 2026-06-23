# Project shape

This is a local node-based image editor. It runs in a browser or Electron.

`src/app/components/workspace/` is the node graph UI.

`src/app/components/renderer/` turns the graph into WebGPU compute passes and
draws the result.

`src/shaders/` contains the WGSL shader code. `src/utils/node-type.ts` is the
single hardcoded shader registry.

`src/store/` holds local project, image, view, animation, and utility state.
There is no account, marketplace, sharing, or cloud state.

# User flow

```text
upload image
    -> add and connect shader nodes
    -> render with WebGPU
    -> export image or save project ZIP
```

Project ZIP files contain the graph and image assets. Files using unknown old
shader nodes are rejected.

# Commands

```bash
pnpm dev
pnpm exec jest --runInBand
pnpm lint
pnpm build
pnpm electron:build
```

# Known follow-up

The experimental material shaders and manual render behavior still need a
separate focused pass.
