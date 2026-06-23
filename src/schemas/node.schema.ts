import * as z from "zod/v4";
import { Node } from "@xyflow/react";

const handleSchema = z
  .object({
    name: z.string(),
  })
  .and(
    z.union([
      z.object({
        type: z.literal("color"),
        default: z.number().array().length(3).optional(),
      }),
      z.object({
        type: z.literal("number"),
        min: z.number().optional(),
        max: z.number().optional(),
        step: z.number().optional(),
        default: z.number().optional(),
      }),
    ]),
  );

export type Handle = z.infer<typeof handleSchema>;
export type HandleType = z.infer<typeof handleSchema>["type"];

const parameterSchema = z
  .object({
    name: z.string(),
  })
  .and(
    z.union([
      z.object({
        type: z.literal("image"),
      }),
      z.object({
        type: z.literal("string"),
      }),
      z.object({
        type: z.literal("select"),
        options: z.string().array(),
      }),
    ]),
  );

const passBufferSchema = z.object({
  name: z.string(),
  type: z.enum(["color", "number"]),
});

export type NodePassBufferDescriptor = z.infer<typeof passBufferSchema>;

const uniformSchema = z.union([
  z.object({ type: z.literal("f32"), defaultValue: z.number() }),
  z.object({ type: z.literal("u32"), defaultValue: z.int() }),
  z.object({
    type: z.literal("vec2f"),
    defaultValue: z.number().array().length(2),
  }),
  z.object({
    type: z.literal("vec3f"),
    defaultValue: z.number().array().length(3),
  }),
  z.object({
    type: z.literal("vec4f"),
    defaultValue: z.number().array().length(4),
  }),
]);

export type UniformDefinition = z.infer<typeof uniformSchema>;

export const nodeTypeSchema = z.object({
  name: z.string(),
  category: z.string(),
  tooltip: z.string().optional(),

  inputs: z.record(z.string(), handleSchema),
  outputs: z.record(z.string(), handleSchema),
  parameters: z.record(z.string(), parameterSchema),
  uniforms: z.record(z.string(), uniformSchema).optional(),

  shader: z.string(),
  additionalPasses: z
    .object({
      shader: z.string(),
      buffers: passBufferSchema.array(),
    })
    .array()
    .optional(),
});

export type NodeType = z.infer<typeof nodeTypeSchema>;

const nodeTypeIdSchema = z.string();

export const nodeDataSchema = z.object({
  type: nodeTypeIdSchema,
  defaultValues: z.record(
    z.string(),
    z.union([z.number(), z.number().array()]),
  ),
  parameters: z.record(
    z.string(),
    z.object({
      value: z.string().nullable(),
    }),
  ),
  uniforms: z
    .record(z.string(), z.union([z.number(), z.number().array()]))
    .optional(),
});

export type NodeData = z.infer<typeof nodeDataSchema>;
export type ShaderNode = Node<NodeData>;
