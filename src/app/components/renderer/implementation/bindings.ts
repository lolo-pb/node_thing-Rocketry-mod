import { NodeType, UniformDefinition } from "@/schemas/node.schema";
import type { RenderPass, RenderPipeline } from "../pipeline";

type NodeTypes = Record<string, NodeType>;

export type DummyBuffer = {
  buffer: GPUBuffer;
  pass: RenderPass;
  input: string;
};

export type PassBindGroupLayouts = {
  io: GPUBindGroupLayout;
  uniforms: GPUBindGroupLayout | null;
};

/*
 * Create a dummy buffer used for fallback values
 */
function createDummyBuffer(device: GPUDevice) {
  return device.createBuffer({
    size: 16,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
}

/*
 * Create binding group layout objects for each pipeline stage.
 * Each binding group contains bindings for all inputs and outputs
 * in that stage.
 */
export function createBindGroupLayouts(
  device: GPUDevice,
  desc: RenderPipeline,
  nodeTypes: NodeTypes,
) {
  return desc.passes.map((pass) => {
    const inputs = Object.entries(pass.inputBindings);
    const outputs = Object.entries(pass.outputBindings);
    const type = nodeTypes[pass.nodeType];

    const io = device.createBindGroupLayout({
      entries: [
        ...inputs.map(
          (_, i): GPUBindGroupLayoutEntry => ({
            binding: i,
            visibility: GPUShaderStage.COMPUTE,
            buffer: { type: "read-only-storage" },
          }),
        ),
        ...outputs.map(
          (_, i): GPUBindGroupLayoutEntry => ({
            binding: i + inputs.length,
            visibility: GPUShaderStage.COMPUTE,
            buffer: { type: "storage" },
          }),
        ),
      ],
    });

    const uniforms = type.uniforms
      ? device.createBindGroupLayout({
          entries: [
            {
              binding: 0,
              visibility: GPUShaderStage.COMPUTE,
              buffer: { type: "uniform" },
            },
          ],
        })
      : null;

    return { io, uniforms };
  });
}

/*
 * Create the binding groups to be used when rendering.
 * Binds each pipeline stage to the actual buffers it will use.
 */
export function createBindGroups(
  device: GPUDevice,
  desc: RenderPipeline,
  bindGroupLayouts: PassBindGroupLayouts[],
  buffers: GPUBuffer[],
  localUniformsBuffers: (GPUBuffer | null)[],
  dummyBuffers: DummyBuffer[],
) {
  return desc.passes.map((pass, passIdx) => {
    const inputs = Object.entries(pass.inputBindings);
    const outputs = Object.entries(pass.outputBindings);

    const io = device.createBindGroup({
      layout: bindGroupLayouts[passIdx].io,
      entries: [
        ...inputs.map(([input, bufferIdx], i): GPUBindGroupEntry => {
          let buffer: GPUBuffer;
          if (bufferIdx === null) {
            buffer = createDummyBuffer(device);
            dummyBuffers.push({ buffer, input, pass });
          } else {
            buffer = buffers[bufferIdx];
          }

          return {
            binding: i,
            resource: { buffer },
          };
        }),
        ...outputs.map(
          ([, bufferIdx], i): GPUBindGroupEntry => ({
            binding: i + inputs.length,
            resource: { buffer: buffers[bufferIdx] },
          }),
        ),
      ],
    });

    const uniforms =
      bindGroupLayouts[passIdx].uniforms && localUniformsBuffers[passIdx]
        ? device.createBindGroup({
            layout: bindGroupLayouts[passIdx].uniforms,
            entries: [
              {
                binding: 0,
                resource: {
                  buffer: localUniformsBuffers[passIdx],
                },
              },
            ],
          })
        : null;

    return { io, uniforms };
  });
}

export function createLocalUniformsBuffers(
  device: GPUDevice,
  desc: RenderPipeline,
  nodeTypes: NodeTypes,
) {
  return desc.passes.map((pass) => {
    const type = nodeTypes[pass.nodeType];
    if (!type.uniforms) return null;

    const uniforms = Object.values(type.uniforms);

    return device.createBuffer({
      size: uniforms.reduce((total, u) => total + getSizeOf(u.type), 0),
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
  });
}

function getSizeOf(type: UniformDefinition["type"]): number {
  switch (type) {
    case "f32":
    case "u32":
      return 4;
    case "vec2f":
      return 8;
    case "vec3f":
    case "vec4f":
      return 16;
  }
}
